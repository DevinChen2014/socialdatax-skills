import { randomUUID } from "node:crypto";
import { mkdir, open as openFile, rename, stat, unlink } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import {
  MEDIA_DOWNLOAD_MAX_BYTES,
  MEDIA_DOWNLOAD_TIMEOUT_MS,
  assertMediaDownloadWithinLimit,
  createMediaDownloadAbortSignal,
  isAbortLikeError,
  parseOptionalIntegerHeader,
  writeAllToFile,
  writeResponseBodyToFile,
} from "./common.mjs";

const MEDIA_DOWNLOAD_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const WECHAT_MEDIA_DOWNLOAD_REFERER = "https://weixin.qq.com/";
const MEDIA_DECRYPT_CHUNK_SIZE = 64 * 1024;
const MEDIA_DOWNLOAD_MAX_REDIRECTS = 5;
const MP4_BOX_HEADER_SIZE = 8;
const MP4_EXTENDED_BOX_HEADER_SIZE = 16;
const MP4_MAX_BOX_SCAN_DEPTH = 16;
const MP4_FULL_BOX_HEADER_SIZE = 4;
const MP4_STSD_ENTRY_COUNT_SIZE = 4;
const MP4_VISUAL_SAMPLE_ENTRY_HEADER_SIZE = 78;
const MP4_VVC_NAL_LENGTH_SIZE_BYTE_OFFSET = 4;
const MP4_CONTAINER_BOX_TYPES = new Set([
  "dinf",
  "edts",
  "mdia",
  "meta",
  "minf",
  "moof",
  "moov",
  "mfra",
  "stbl",
  "traf",
  "trak",
  "udta",
]);
const MP4_VISUAL_SAMPLE_ENTRY_TYPES = new Set([
  "av01",
  "avc1",
  "avc3",
  "encv",
  "hev1",
  "hvc1",
  "vvc1",
  "vvi1",
]);
// Keep this local helper scoped to WeChat media host trees; require k for the decrypt key.
const WECHAT_MEDIA_DOWNLOAD_HOST_SUFFIXES = [
  ".wxapp.tc.qq.com",
  ".video.qq.com",
];
const WECHAT_MEDIA_DOWNLOAD_EXACT_HOSTS = new Set(["wxapp.tc.qq.com"]);
const WECHAT_MEDIA_DECODE_KEY_MAX = (1n << 64n) - 1n;
const WECHAT_DETAIL_MEDIA_URL_ERROR =
  "Media URL cannot be decrypted. Use the video.video_url returned by SocialDataX WeChat detail.";
const WECHAT_MEDIA_RESPONSE_DECRYPT_ERROR =
  "Downloaded media cannot be decrypted. Use the video.video_url returned by SocialDataX WeChat detail.";

export async function decryptWechatMediaCommand(
  options,
  {
    fetchMedia = fetch,
    downloadTimeoutMs = MEDIA_DOWNLOAD_TIMEOUT_MS,
    maxDownloadBytes = MEDIA_DOWNLOAD_MAX_BYTES,
  } = {}
) {
  if (!options.mediaUrl) {
    throw new Error("Missing --media-url for wechat decrypt-media.");
  }
  if (!options.output) {
    throw new Error("Missing --output for wechat decrypt-media.");
  }

  const { mediaUrl, decodeKey } = parseWechatDecryptMediaUrl(options.mediaUrl);
  const outputPath = resolve(options.output);
  const tempPath = `${outputPath}.tmp-${process.pid}-${Date.now()}-${randomUUID()}`;
  await assertWechatMediaOutputPath(outputPath);
  await mkdir(dirname(outputPath), { recursive: true });

  let encryptedLength;
  let decrypted = false;
  let bytesWritten = 0;
  try {
    const signal = createMediaDownloadAbortSignal(downloadTimeoutMs);
    const response = await fetchWechatMedia(mediaUrl, {
      fetchMedia,
      signal,
    });
    if (!response.ok) {
      throw new Error(`Media download failed with HTTP ${response.status}.`);
    }
    assertMediaDownloadWithinLimit(
      parseOptionalIntegerHeader(response.headers.get("content-length")),
      maxDownloadBytes
    );
    encryptedLength = parseOptionalWechatEncryptedLengthHeader(
      response.headers.get("x-enclen")
    );
    assertMediaDownloadWithinLimit(encryptedLength, maxDownloadBytes);
    bytesWritten = await writeResponseBodyToFile(response, tempPath, {
      maxBytes: maxDownloadBytes,
    });
    if (encryptedLength !== undefined) {
      await decryptWechatMediaFilePrefix(tempPath, {
        encryptedLength,
        decodeKey,
      });
      await patchWechatVvcMp4NalLengthMetadata(tempPath);
      decrypted = true;
    }
    await rename(tempPath, outputPath);
  } catch (error) {
    await unlink(tempPath).catch(() => {});
    if (isAbortLikeError(error)) {
      throw new Error("Media download timed out.");
    }
    throw error;
  }

  return {
    platform: "wechat",
    action: "decrypt-media",
    output_path: outputPath,
    decrypted,
    bytes_written: bytesWritten,
  };
}

async function assertWechatMediaOutputPath(outputPath) {
  const existingOutput = await stat(outputPath).catch((error) => {
    if (error?.code === "ENOENT") {
      return undefined;
    }
    throw error;
  });
  if (existingOutput?.isDirectory()) {
    throw new Error("--output must be a file path for wechat decrypt-media.");
  }
}

async function fetchWechatMedia(
  mediaUrl,
  {
    fetchMedia,
    signal,
    maxRedirects = MEDIA_DOWNLOAD_MAX_REDIRECTS,
  }
) {
  let currentUrl = mediaUrl;
  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount += 1) {
    const response = await fetchMedia(currentUrl, {
      headers: {
        Referer: WECHAT_MEDIA_DOWNLOAD_REFERER,
        "User-Agent": MEDIA_DOWNLOAD_USER_AGENT,
      },
      redirect: "manual",
      ...(signal ? { signal } : {}),
    });
    if (!isHttpRedirectStatus(response.status)) {
      return response;
    }
    currentUrl = resolveWechatMediaRedirectUrl(
      currentUrl,
      response.headers?.get("location")
    );
  }
  throw new Error("Media download redirected too many times.");
}

function isHttpRedirectStatus(status) {
  return [301, 302, 303, 307, 308].includes(status);
}

function resolveWechatMediaRedirectUrl(currentUrl, location) {
  if (
    location === undefined ||
    location === null ||
    String(location).trim() === ""
  ) {
    throw new Error("Media download redirect is invalid.");
  }
  let parsed;
  try {
    parsed = new URL(String(location), currentUrl);
  } catch {
    throw new Error("Media download redirect is invalid.");
  }
  if (!isWechatDetailMediaDownloadUrl(parsed)) {
    throw new Error(WECHAT_DETAIL_MEDIA_URL_ERROR);
  }
  return parsed.href;
}

function parseWechatDecryptMediaUrl(mediaUrl) {
  let parsed;
  try {
    parsed = new URL(mediaUrl);
  } catch {
    throw new Error("Invalid --media-url.");
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Invalid --media-url.");
  }
  if (!isWechatDetailMediaDownloadUrl(parsed)) {
    throw new Error(WECHAT_DETAIL_MEDIA_URL_ERROR);
  }

  const decodeKeyText = parsed.searchParams.get("k");
  if (!decodeKeyText) {
    throw new Error(WECHAT_DETAIL_MEDIA_URL_ERROR);
  }
  if (!/^\d+$/.test(decodeKeyText)) {
    throw new Error(WECHAT_DETAIL_MEDIA_URL_ERROR);
  }
  if (decodeKeyText.length > 20) {
    throw new Error(WECHAT_DETAIL_MEDIA_URL_ERROR);
  }
  const decodeKey = BigInt(decodeKeyText);
  if (decodeKey > WECHAT_MEDIA_DECODE_KEY_MAX) {
    throw new Error(WECHAT_DETAIL_MEDIA_URL_ERROR);
  }
  return {
    mediaUrl,
    decodeKey,
  };
}

function isWechatDetailMediaDownloadUrl(parsed) {
  return (
    parsed.username === "" &&
    parsed.password === "" &&
    parsed.port === "" &&
    isAllowedWechatMediaDownloadHost(parsed.hostname)
  );
}

function isAllowedWechatMediaDownloadHost(hostname) {
  return (
    WECHAT_MEDIA_DOWNLOAD_EXACT_HOSTS.has(hostname) ||
    WECHAT_MEDIA_DOWNLOAD_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))
  );
}

function parseOptionalWechatEncryptedLengthHeader(value) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return undefined;
  }
  if (!/^\d+$/.test(String(value).trim())) {
    throw new Error(WECHAT_MEDIA_RESPONSE_DECRYPT_ERROR);
  }
  const encryptedLength = Number.parseInt(String(value).trim(), 10);
  if (!Number.isSafeInteger(encryptedLength)) {
    throw new Error(WECHAT_MEDIA_RESPONSE_DECRYPT_ERROR);
  }
  return encryptedLength > 0 ? encryptedLength : undefined;
}

async function decryptWechatMediaFilePrefix(
  filePath,
  {
    encryptedLength,
    decodeKey,
  }
) {
  const file = await openFile(filePath, "r+");
  try {
    const stats = await file.stat();
    if (encryptedLength > stats.size) {
      throw new Error("Downloaded media is incomplete and cannot be decrypted.");
    }
    const decryptStream = createWechatMediaDecryptStream(decodeKey);
    let offset = 0;
    while (offset < encryptedLength) {
      const chunkLength = Math.min(
        MEDIA_DECRYPT_CHUNK_SIZE,
        encryptedLength - offset
      );
      const encryptedChunk = Buffer.allocUnsafe(chunkLength);
      const { bytesRead } = await file.read(
        encryptedChunk,
        0,
        chunkLength,
        offset
      );
      if (bytesRead !== chunkLength) {
        throw new Error("Downloaded media is incomplete and cannot be decrypted.");
      }
      decryptWechatMediaBufferChunk(encryptedChunk, decryptStream);
      await writeAllToFile(file, encryptedChunk, offset);
      offset += chunkLength;
    }
  } finally {
    await file.close();
  }
}

async function patchWechatVvcMp4NalLengthMetadata(filePath) {
  const file = await openFile(filePath, "r+");
  try {
    const stats = await file.stat();
    await patchMp4ChildBoxes(file, 0, stats.size, 0);
  } finally {
    await file.close();
  }
}

async function patchMp4ChildBoxes(file, startOffset, endOffset, depth) {
  if (
    depth > MP4_MAX_BOX_SCAN_DEPTH ||
    startOffset < 0 ||
    endOffset - startOffset < MP4_BOX_HEADER_SIZE
  ) {
    return;
  }

  let offset = startOffset;
  while (offset + MP4_BOX_HEADER_SIZE <= endOffset) {
    const box = await readMp4BoxHeader(file, offset, endOffset);
    if (!box) {
      return;
    }
    if (box.type === "vvcC") {
      await patchVvcConfigurationNalLengthSize(file, box);
    } else {
      const childRange = mp4ChildBoxRange(box);
      if (childRange) {
        await patchMp4ChildBoxes(
          file,
          childRange.startOffset,
          childRange.endOffset,
          depth + 1
        );
      }
    }
    offset = box.endOffset;
  }
}

async function readMp4BoxHeader(file, offset, parentEndOffset) {
  const baseHeader = Buffer.allocUnsafe(MP4_BOX_HEADER_SIZE);
  const baseRead = await file.read(
    baseHeader,
    0,
    MP4_BOX_HEADER_SIZE,
    offset
  );
  if (baseRead.bytesRead !== MP4_BOX_HEADER_SIZE) {
    return undefined;
  }

  const size32 = baseHeader.readUInt32BE(0);
  const type = baseHeader.toString("ascii", 4, 8);
  let headerSize = MP4_BOX_HEADER_SIZE;
  let size;
  if (size32 === 0) {
    size = parentEndOffset - offset;
  } else if (size32 === 1) {
    if (offset + MP4_EXTENDED_BOX_HEADER_SIZE > parentEndOffset) {
      return undefined;
    }
    const extendedSizeBuffer = Buffer.allocUnsafe(8);
    const extendedRead = await file.read(
      extendedSizeBuffer,
      0,
      8,
      offset + MP4_BOX_HEADER_SIZE
    );
    if (extendedRead.bytesRead !== 8) {
      return undefined;
    }
    const extendedSize = extendedSizeBuffer.readBigUInt64BE(0);
    if (extendedSize > BigInt(Number.MAX_SAFE_INTEGER)) {
      return undefined;
    }
    size = Number(extendedSize);
    headerSize = MP4_EXTENDED_BOX_HEADER_SIZE;
  } else {
    size = size32;
  }

  if (
    size < headerSize ||
    offset + size > parentEndOffset ||
    !isMp4BoxType(type)
  ) {
    return undefined;
  }

  return {
    type,
    startOffset: offset,
    headerSize,
    payloadOffset: offset + headerSize,
    endOffset: offset + size,
  };
}

function isMp4BoxType(type) {
  return /^[\x20-\x7e]{4}$/.test(type);
}

function mp4ChildBoxRange(box) {
  if (box.type === "stsd") {
    const childStart =
      box.payloadOffset + MP4_FULL_BOX_HEADER_SIZE + MP4_STSD_ENTRY_COUNT_SIZE;
    return childStart < box.endOffset
      ? { startOffset: childStart, endOffset: box.endOffset }
      : undefined;
  }
  if (box.type === "meta") {
    const childStart = box.payloadOffset + MP4_FULL_BOX_HEADER_SIZE;
    return childStart < box.endOffset
      ? { startOffset: childStart, endOffset: box.endOffset }
      : undefined;
  }
  if (MP4_VISUAL_SAMPLE_ENTRY_TYPES.has(box.type)) {
    const childStart = box.payloadOffset + MP4_VISUAL_SAMPLE_ENTRY_HEADER_SIZE;
    return childStart < box.endOffset
      ? { startOffset: childStart, endOffset: box.endOffset }
      : undefined;
  }
  if (MP4_CONTAINER_BOX_TYPES.has(box.type)) {
    return box.payloadOffset < box.endOffset
      ? { startOffset: box.payloadOffset, endOffset: box.endOffset }
      : undefined;
  }
  return undefined;
}

async function patchVvcConfigurationNalLengthSize(file, box) {
  const targetOffset =
    box.payloadOffset + MP4_VVC_NAL_LENGTH_SIZE_BYTE_OFFSET;
  if (targetOffset >= box.endOffset) {
    return;
  }
  const buffer = Buffer.allocUnsafe(1);
  const { bytesRead } = await file.read(buffer, 0, 1, targetOffset);
  if (bytesRead !== 1) {
    return;
  }
  const patched = (buffer[0] & 0xf8) | 0x07;
  if (patched === buffer[0]) {
    return;
  }
  buffer[0] = patched;
  await writeAllToFile(file, buffer, targetOffset);
}

function createWechatMediaDecryptStream(decodeKey) {
  return {
    context: new WechatFinderIsaac64Context(decodeKey),
    block: Buffer.allocUnsafe(8),
    index: 8,
  };
}

function decryptWechatMediaBufferChunk(buffer, stream) {
  for (let index = 0; index < buffer.length; index += 1) {
    if (stream.index === 8) {
      stream.block.writeBigUInt64BE(stream.context.next());
      stream.index = 0;
    }
    buffer[index] ^= stream.block[stream.index];
    stream.index += 1;
  }
}

class WechatFinderIsaac64Context {
  static MASK = (1n << 64n) - 1n;
  static RANDSIZ = 1 << 8;

  constructor(decodeKey) {
    this.seed = Array(WechatFinderIsaac64Context.RANDSIZ).fill(0n);
    this.mm = Array(WechatFinderIsaac64Context.RANDSIZ).fill(0n);
    this.aa = 0n;
    this.bb = 0n;
    this.cc = 0n;
    this.randcnt = 0;
    this.seed[0] = this.u64(decodeKey);
    this.init(true);
  }

  next() {
    if (this.randcnt === 0) {
      this.isaac64();
      this.randcnt = WechatFinderIsaac64Context.RANDSIZ;
    }
    this.randcnt -= 1;
    return this.seed[this.randcnt];
  }

  init(seeded) {
    let a = 0x647c4677a2884b7cn;
    let b = 0xb9f8b322c73ac862n;
    let c = 0x8c0ea5053d4712a0n;
    let d = 0xb29b2e824a595524n;
    let e = 0x82f053db8355e0cen;
    let f = 0x48fe4a0fa5a09315n;
    let g = 0xae985bf2cbfc89edn;
    let h = 0x98f5704f6c44c0abn;

    for (let index = 0; index < WechatFinderIsaac64Context.RANDSIZ; index += 8) {
      if (seeded) {
        a = this.u64(a + this.seed[index]);
        b = this.u64(b + this.seed[index + 1]);
        c = this.u64(c + this.seed[index + 2]);
        d = this.u64(d + this.seed[index + 3]);
        e = this.u64(e + this.seed[index + 4]);
        f = this.u64(f + this.seed[index + 5]);
        g = this.u64(g + this.seed[index + 6]);
        h = this.u64(h + this.seed[index + 7]);
      }
      [a, b, c, d, e, f, g, h] = this.mix64(a, b, c, d, e, f, g, h);
      this.mm.splice(index, 8, a, b, c, d, e, f, g, h);
    }

    if (seeded) {
      for (let index = 0; index < WechatFinderIsaac64Context.RANDSIZ; index += 8) {
        a = this.u64(a + this.mm[index]);
        b = this.u64(b + this.mm[index + 1]);
        c = this.u64(c + this.mm[index + 2]);
        d = this.u64(d + this.mm[index + 3]);
        e = this.u64(e + this.mm[index + 4]);
        f = this.u64(f + this.mm[index + 5]);
        g = this.u64(g + this.mm[index + 6]);
        h = this.u64(h + this.mm[index + 7]);
        [a, b, c, d, e, f, g, h] = this.mix64(a, b, c, d, e, f, g, h);
        this.mm.splice(index, 8, a, b, c, d, e, f, g, h);
      }
    }

    this.isaac64();
    this.randcnt = WechatFinderIsaac64Context.RANDSIZ;
  }

  isaac64() {
    let a = this.aa;
    let b = this.u64(this.bb + this.cc + 1n);
    this.cc = this.u64(this.cc + 1n);

    let resultIndex = 0;
    for (let index = 0; index < WechatFinderIsaac64Context.RANDSIZ / 2; index += 4) {
      [a, b] = this.rngstep64(
        this.u64(~(a ^ this.u64(a << 21n))),
        a,
        b,
        index,
        index + 128,
        resultIndex
      );
      resultIndex += 1;
      [a, b] = this.rngstep64(a ^ (a >> 5n), a, b, index + 1, index + 129, resultIndex);
      resultIndex += 1;
      [a, b] = this.rngstep64(
        a ^ this.u64(a << 12n),
        a,
        b,
        index + 2,
        index + 130,
        resultIndex
      );
      resultIndex += 1;
      [a, b] = this.rngstep64(a ^ (a >> 33n), a, b, index + 3, index + 131, resultIndex);
      resultIndex += 1;
    }

    for (
      let index = WechatFinderIsaac64Context.RANDSIZ / 2;
      index < WechatFinderIsaac64Context.RANDSIZ;
      index += 4
    ) {
      const m2Index = index - WechatFinderIsaac64Context.RANDSIZ / 2;
      [a, b] = this.rngstep64(
        this.u64(~(a ^ this.u64(a << 21n))),
        a,
        b,
        index,
        m2Index,
        resultIndex
      );
      resultIndex += 1;
      [a, b] = this.rngstep64(a ^ (a >> 5n), a, b, index + 1, m2Index + 1, resultIndex);
      resultIndex += 1;
      [a, b] = this.rngstep64(
        a ^ this.u64(a << 12n),
        a,
        b,
        index + 2,
        m2Index + 2,
        resultIndex
      );
      resultIndex += 1;
      [a, b] = this.rngstep64(a ^ (a >> 33n), a, b, index + 3, m2Index + 3, resultIndex);
      resultIndex += 1;
    }

    this.bb = b;
    this.aa = a;
  }

  rngstep64(mix, a, b, mIndex, m2Index, resultIndex) {
    const x = this.mm[mIndex];
    const nextA = this.u64(mix + this.mm[m2Index]);
    const y = this.u64(this.ind64(x) + nextA + b);
    this.mm[mIndex] = y;
    const nextB = this.u64(this.ind64(y >> 8n) + x);
    this.seed[resultIndex] = nextB;
    return [nextA, nextB];
  }

  ind64(value) {
    return this.mm[Number((value >> 3n) & BigInt(WechatFinderIsaac64Context.RANDSIZ - 1))];
  }

  mix64(a, b, c, d, e, f, g, h) {
    a = this.u64(a - e);
    f ^= h >> 9n;
    h = this.u64(h + a);
    b = this.u64(b - f);
    g ^= this.u64(a << 9n);
    a = this.u64(a + b);
    c = this.u64(c - g);
    h ^= b >> 23n;
    b = this.u64(b + c);
    d = this.u64(d - h);
    a ^= this.u64(c << 15n);
    c = this.u64(c + d);
    e = this.u64(e - a);
    b ^= d >> 14n;
    d = this.u64(d + e);
    f = this.u64(f - b);
    c ^= this.u64(e << 20n);
    e = this.u64(e + f);
    g = this.u64(g - c);
    d ^= f >> 17n;
    f = this.u64(f + g);
    h = this.u64(h - d);
    e ^= this.u64(g << 14n);
    g = this.u64(g + h);
    return [a, b, c, d, e, f, g, h].map((value) => this.u64(value));
  }

  u64(value) {
    return value & WechatFinderIsaac64Context.MASK;
  }
}
