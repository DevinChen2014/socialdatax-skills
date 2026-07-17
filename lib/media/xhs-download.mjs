import { constants as fsConstants } from "node:fs";
import {
  copyFile as copyFilePath,
  link as linkPath,
  open as openFile,
  mkdir,
  stat,
  unlink,
} from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, extname, join, resolve } from "node:path";

import {
  MEDIA_DOWNLOAD_MAX_BYTES,
  MEDIA_DOWNLOAD_TIMEOUT_MS,
  assertMediaDownloadWithinLimit,
  createMediaDownloadAbortSignal,
  isAbortLikeError,
  parseOptionalIntegerHeader,
  writeAllToFile,
} from "./common.mjs";

const XHS_DOWNLOAD_USER_AGENT =
  "Mozilla/5.0 (compatible; SocialDataX/1.0; +https://socialdatax.com)";
const XHS_DOWNLOAD_REFERER = "https://www.xiaohongshu.com/";
const XHS_DOWNLOAD_MAX_ATTEMPTS = 10;
const XHS_DOWNLOAD_RETRY_DELAY_MS = 250;
const XHS_RETRYABLE_HTTP_STATUSES = new Set([
  408,
  409,
  425,
  429,
  500,
  502,
  503,
  504,
]);
const XHS_EXPIRED_HTTP_STATUSES = new Set([403, 404, 410]);
const XHS_CONTENT_TYPE_EXTENSIONS = new Map([
  ["image/jpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/heif", "heif"],
  ["image/heic", "heic"],
  ["video/mp4", "mp4"],
]);
const XHS_URL_FORMAT_EXTENSIONS = new Map([
  ["jpg", "jpg"],
  ["jpeg", "jpg"],
  ["png", "png"],
  ["webp", "webp"],
  ["heif", "heif"],
  ["heic", "heic"],
  ["mp4", "mp4"],
]);
export async function downloadXhsMediaFromUrl(
  url,
  options,
  {
    fetchMedia = fetch,
    downloadTimeoutMs = MEDIA_DOWNLOAD_TIMEOUT_MS,
    maxDownloadBytes = MEDIA_DOWNLOAD_MAX_BYTES,
    retryDelayMs = XHS_DOWNLOAD_RETRY_DELAY_MS,
    now = () => new Date(),
    linkFile = linkPath,
    copyFile = copyFilePath,
  } = {}
) {
  const parsedUrl = parseHttpUrl(url);
  const target = await resolveXhsMediaTarget(parsedUrl, options, now);
  const existingOutput = await stat(target.outputPath).catch(ignoreMissing);
  if (existingOutput?.isDirectory()) {
    throw new Error("--output must be a file path for xhs download-media.");
  }
  if (existingOutput) {
    return buildSkippedExistingResult(parsedUrl.href, target.outputPath, existingOutput.size);
  }

  return downloadWithPartResume(parsedUrl, target, {
    fetchMedia,
    downloadTimeoutMs,
    maxDownloadBytes,
    retryDelayMs,
    linkFile,
    copyFile,
  });
}

async function resolveXhsMediaTarget(parsedUrl, options = {}, now) {
  if (options.output && options.outputDir) {
    throw new Error("Use only one of --output or --output-dir for xhs download-media.");
  }
  if (options.output) {
    const outputPath = resolve(expandHome(options.output));
    await ensureParentDirectory(outputPath, "--output parent path");
    return {
      outputPath,
      partPath: `${outputPath}.part`,
      fixedOutputPath: true,
    };
  }
  if (!options.outputDir) {
    throw new Error("Missing --output or --output-dir for xhs download-media.");
  }

  const outputDir = resolve(expandHome(options.outputDir));
  const existingOutputDir = await stat(outputDir).catch(ignoreMissing);
  if (existingOutputDir && !existingOutputDir.isDirectory()) {
    throw new Error("--output-dir must be a directory for xhs download-media.");
  }
  if (!existingOutputDir) {
    await ensureParentDirectory(outputDir, "--output-dir parent path");
    await mkdir(outputDir, { recursive: true });
  }

  const fileTarget = inferMediaFileTarget(parsedUrl, now);
  const initialExtension =
    fileTarget.extension || fileTarget.urlFormatExtension || "bin";
  const fileName = formatMediaFileName(fileTarget.stem, initialExtension);
  const outputPath = join(outputDir, fileName);
  return {
    outputPath,
    partPath: `${outputPath}.part`,
    outputDir,
    fileStem: fileTarget.stem,
    extension: fileTarget.extension,
    urlFormatExtension: fileTarget.urlFormatExtension,
    fixedOutputPath: false,
  };
}

async function downloadWithPartResume(
  parsedUrl,
  target,
  {
    fetchMedia,
    downloadTimeoutMs,
    maxDownloadBytes,
    retryDelayMs,
    linkFile,
    copyFile,
  }
) {
  let lastError;
  for (let attempt = 1; attempt <= XHS_DOWNLOAD_MAX_ATTEMPTS; attempt += 1) {
    try {
      const result = await downloadOnce(parsedUrl, target, {
        fetchMedia,
        downloadTimeoutMs,
        maxDownloadBytes,
        linkFile,
        copyFile,
      });
      if (result.skippedExisting) {
        return buildSkippedExistingResult(
          parsedUrl.href,
          result.outputPath,
          result.outputBytes
        );
      }
      return {
        platform: "xhs",
        action: "download-media",
        status: "downloaded",
        url: parsedUrl.href,
        output_path: result.outputPath,
        output_bytes: result.outputBytes,
        resumed: result.resumed,
        content_type: result.contentType,
      };
    } catch (error) {
      if (error instanceof XhsExpiredMediaLinkError) {
        throw error;
      }
      lastError = error;
      if (!shouldRetryDownloadError(error)) {
        throw error;
      }
      if (attempt === XHS_DOWNLOAD_MAX_ATTEMPTS) {
        break;
      }
      await sleep(retryDelayMs);
    }
  }

  if (isAbortLikeError(lastError)) {
    throw new Error("XHS media download timed out.");
  }
  throw new Error("XHS media download failed before completion.");
}

async function downloadOnce(
  parsedUrl,
  target,
  {
    fetchMedia,
    downloadTimeoutMs,
    maxDownloadBytes,
    linkFile,
    copyFile,
  }
) {
  await mkdir(dirname(target.outputPath), { recursive: true });
  const partPath = target.partPath;
  const existingPart = await stat(partPath).catch(ignoreMissing);
  let existingPartBytes = existingPart?.isFile() ? existingPart.size : 0;
  const headers = normalizeXhsDownloadHeaders();
  if (existingPartBytes > 0) {
    headers.Range = `bytes=${existingPartBytes}-`;
    delete headers["accept-encoding"];
  }

  const signal = createMediaDownloadAbortSignal(downloadTimeoutMs);
  const response = await fetchMedia(parsedUrl.href, {
    headers,
    ...(signal ? { signal } : {}),
  });

  if (XHS_EXPIRED_HTTP_STATUSES.has(response.status)) {
    throw new XhsExpiredMediaLinkError();
  }
  if (response.status === 416) {
    return handleRangeNotSatisfiable(response, {
      target,
      partPath,
      existingPartBytes,
      linkFile,
      copyFile,
    });
  }
  if (!response.ok) {
    if (XHS_RETRYABLE_HTTP_STATUSES.has(response.status)) {
      throw new XhsRetryableDownloadError();
    }
    throw new Error(`XHS media download failed with HTTP ${response.status}.`);
  }

  const contentType = normalizedContentType(headerValue(response.headers, "content-type"));
  const outputPath = resolveFinalOutputPath(target, contentType);
  const existingOutput = await stat(outputPath).catch(ignoreMissing);
  if (existingOutput?.isDirectory()) {
    throw new Error("--output must be a file path for xhs download-media.");
  }
  if (existingOutput) {
    await cancelResponseBody(response);
    return {
      skippedExisting: true,
      outputPath,
      outputBytes: existingOutput.size,
      contentType,
    };
  }
  const contentLength = parseOptionalIntegerHeader(
    headerValue(response.headers, "content-length")
  );
  let append = false;
  let expectedTotalBytes = contentLength;
  let expectedResponseBytes;

  if (existingPartBytes > 0 && response.status === 206) {
    const contentRange = parseContentRange(
      headerValue(response.headers, "content-range")
    );
    if (
      !isUsableContentRange(contentRange, contentLength) ||
      contentRange.start !== existingPartBytes
    ) {
      await cancelResponseBody(response);
      await unlink(partPath).catch(ignoreError);
      throw new XhsRetryableDownloadError();
    }
    append = true;
    expectedResponseBytes = contentRange.end - contentRange.start + 1;
    expectedTotalBytes = contentRange.total;
  } else if (existingPartBytes > 0) {
    existingPartBytes = 0;
    expectedTotalBytes = contentLength;
  } else if (response.status === 206) {
    const contentRange = parseContentRange(
      headerValue(response.headers, "content-range")
    );
    if (
      !isUsableContentRange(contentRange, contentLength) ||
      contentRange.start !== 0
    ) {
      await cancelResponseBody(response);
      throw new XhsRetryableDownloadError();
    }
    expectedResponseBytes = contentRange.end - contentRange.start + 1;
    expectedTotalBytes = contentRange.total;
  }

  assertMediaDownloadWithinLimit(expectedTotalBytes, maxDownloadBytes);
  let outputBytes;
  let bytesWritten;
  try {
    bytesWritten = await writeResponseBodyToPart(response, partPath, {
      append,
      existingBytes: existingPartBytes,
      maxBytes: maxDownloadBytes,
    });
    outputBytes = existingPartBytes + bytesWritten;
  } catch (error) {
    if (isAbortLikeError(error) || isDownloadTooLargeError(error)) {
      throw error;
    }
    throw new XhsRetryableDownloadError();
  }

  if (
    expectedResponseBytes !== undefined &&
    bytesWritten !== expectedResponseBytes
  ) {
    if (bytesWritten > expectedResponseBytes) {
      await unlink(partPath).catch(ignoreError);
    }
    throw new XhsRetryableDownloadError();
  }

  if (expectedTotalBytes !== undefined && outputBytes !== expectedTotalBytes) {
    if (outputBytes > expectedTotalBytes) {
      await unlink(partPath).catch(ignoreError);
    }
    throw new XhsRetryableDownloadError();
  }

  await finalizePartFile(partPath, outputPath, { linkFile, copyFile });
  return {
    outputPath,
    outputBytes,
    resumed: append && existingPartBytes > 0,
    contentType,
  };
}

async function handleRangeNotSatisfiable(
  response,
  {
    target,
    partPath,
    existingPartBytes,
    linkFile,
    copyFile,
  }
) {
  const contentRange = parseContentRange(headerValue(response.headers, "content-range"));
  if (
    existingPartBytes > 0 &&
    contentRange?.total !== undefined &&
    existingPartBytes === contentRange.total
  ) {
    const contentType = normalizedContentType(headerValue(response.headers, "content-type"));
    const outputPath = resolveFinalOutputPath(target, contentType);
    const existingOutput = await stat(outputPath).catch(ignoreMissing);
    if (existingOutput?.isDirectory()) {
      throw new Error("--output must be a file path for xhs download-media.");
    }
    if (existingOutput) {
      await cancelResponseBody(response);
      return {
        skippedExisting: true,
        outputPath,
        outputBytes: existingOutput.size,
        contentType,
      };
    }
    await finalizePartFile(partPath, outputPath, { linkFile, copyFile });
    return {
      outputPath,
      outputBytes: existingPartBytes,
      resumed: true,
      contentType,
    };
  }
  await unlink(partPath).catch(ignoreError);
  throw new XhsRetryableDownloadError();
}

async function writeResponseBodyToPart(
  response,
  partPath,
  {
    append,
    existingBytes,
    maxBytes,
  }
) {
  if (!response.body) {
    throw new XhsRetryableDownloadError();
  }

  const file = await openFile(partPath, append ? "r+" : "w");
  let bytesWritten = 0;
  try {
    for await (const chunk of response.body) {
      const buffer = Buffer.from(chunk);
      if (buffer.length === 0) {
        continue;
      }
      const nextTotal = existingBytes + bytesWritten + buffer.length;
      assertMediaDownloadWithinLimit(nextTotal, maxBytes);
      await writeAllToFile(file, buffer, existingBytes + bytesWritten);
      bytesWritten += buffer.length;
    }
  } finally {
    await file.close();
  }
  return bytesWritten;
}

async function finalizePartFile(
  partPath,
  outputPath,
  {
    linkFile = linkPath,
    copyFile = copyFilePath,
  } = {}
) {
  try {
    await ensureParentDirectory(outputPath, "xhs download-media output parent path");
    try {
      await linkFile(partPath, outputPath);
    } catch (error) {
      if (isExistingOutputPathError(error)) {
        throw error;
      }
      if (!shouldFallbackToCopyAfterLinkError(error)) {
        throw error;
      }
      await copyFile(partPath, outputPath, fsConstants.COPYFILE_EXCL);
    }
  } catch (error) {
    if (isExistingOutputPathError(error)) {
      throw await buildExistingOutputPathError(outputPath);
    }
    throw error;
  }

  await unlink(partPath);
}

async function cancelResponseBody(response) {
  const body = response.body;
  if (!body) {
    return;
  }
  if (typeof body.cancel === "function") {
    await body.cancel().catch(ignoreError);
    return;
  }
  if (typeof body.return === "function") {
    await body.return().catch(ignoreError);
    return;
  }
  if (typeof body.destroy === "function") {
    body.destroy();
  }
}

function parseHttpUrl(value) {
  let parsed;
  try {
    parsed = new URL(String(value || ""));
  } catch {
    throw new Error("XHS media URL must be an HTTP URL.");
  }
  if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname) {
    throw new Error("XHS media URL must be an HTTP URL.");
  }
  return parsed;
}

function normalizeXhsDownloadHeaders() {
  return {
    "User-Agent": XHS_DOWNLOAD_USER_AGENT,
    Referer: XHS_DOWNLOAD_REFERER,
    "accept-encoding": "identity",
  };
}

function resolveFinalOutputPath(target, contentType) {
  if (target.fixedOutputPath) {
    return target.outputPath;
  }
  const extension =
    target.extension ||
    mediaExtensionFromContentType(contentType) ||
    target.urlFormatExtension ||
    "bin";
  return join(target.outputDir, formatMediaFileName(target.fileStem, extension));
}

function inferMediaFileTarget(parsedUrl, now) {
  const fallbackStem = `xhs-media-${formatTimestamp(now())}`;
  const urlFormatExtension = inferUrlFormatExtension(parsedUrl);
  const rawBasename = safeDecodeURIComponent(basename(parsedUrl.pathname || ""));
  const sanitized = sanitizeFileName(rawBasename);
  if (sanitized && sanitized !== "." && sanitized !== "..") {
    const currentExt = extname(sanitized);
    const extension = sanitizeFileExtension(currentExt.slice(1));
    const stem = extension
      ? sanitizeFileName(sanitized.slice(0, -currentExt.length)) || fallbackStem
      : sanitized;
    return {
      stem,
      extension,
      urlFormatExtension,
    };
  }
  return {
    stem: fallbackStem,
    extension: "",
    urlFormatExtension,
  };
}

async function ensureParentDirectory(outputPath, displayName) {
  const parent = dirname(outputPath);
  const existingParent = await stat(parent).catch(ignoreMissing);
  if (existingParent && !existingParent.isDirectory()) {
    throw new Error(`${displayName} must be a directory for xhs download-media.`);
  }
  if (!existingParent) {
    await mkdir(parent, { recursive: true });
  }
}

function buildSkippedExistingResult(url, outputPath, outputBytes) {
  return {
    platform: "xhs",
    action: "download-media",
    status: "skipped_existing",
    url,
    output_path: outputPath,
    output_bytes: outputBytes,
  };
}

function parseContentRange(value) {
  if (!value) {
    return undefined;
  }
  const trimmed = String(value).trim();
  const unsatisfied = /^bytes\s+\*\/(\d+)$/i.exec(trimmed);
  if (unsatisfied) {
    return {
      start: undefined,
      end: undefined,
      total: Number.parseInt(unsatisfied[1], 10),
    };
  }
  const matched = /^bytes\s+(\d+)-(\d+)\/(\d+|\*)$/i.exec(trimmed);
  if (!matched) {
    return undefined;
  }
  return {
    start: Number.parseInt(matched[1], 10),
    end: Number.parseInt(matched[2], 10),
    total: matched[3] === "*" ? undefined : Number.parseInt(matched[3], 10),
  };
}

function isUsableContentRange(contentRange, contentLength) {
  if (
    contentRange?.start === undefined ||
    contentRange.end === undefined ||
    contentRange.total === undefined ||
    !Number.isSafeInteger(contentRange.start) ||
    !Number.isSafeInteger(contentRange.end) ||
    !Number.isSafeInteger(contentRange.total) ||
    contentRange.end < contentRange.start ||
    contentRange.end >= contentRange.total
  ) {
    return false;
  }
  const rangeBytes = contentRange.end - contentRange.start + 1;
  return contentLength === undefined || contentLength === rangeBytes;
}

function shouldRetryDownloadError(error) {
  return (
    error instanceof XhsRetryableDownloadError ||
    isAbortLikeError(error) ||
    isNetworkLikeError(error)
  );
}

function isNetworkLikeError(error) {
  return (
    error?.name === "TypeError" ||
    ["ECONNRESET", "ECONNREFUSED", "EPIPE", "ETIMEDOUT"].includes(error?.code)
  );
}

function isDownloadTooLargeError(error) {
  return error?.message === "Media download is too large for local media processing.";
}

function normalizedContentType(value) {
  if (!value) {
    return null;
  }
  return String(value).split(";")[0].trim().toLowerCase() || null;
}

function headerValue(headers, name) {
  if (!headers || typeof headers.get !== "function") {
    return null;
  }
  return headers.get(name);
}

function sanitizeFileName(value) {
  const normalized = String(value || "")
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_")
    .replace(/\s+/g, " ")
    .trim();
  return normalized.slice(0, 120);
}

function sanitizeFileExtension(value) {
  const normalized = String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!normalized || normalized.length > 8) {
    return "";
  }
  return normalized;
}

function formatMediaFileName(stem, extension) {
  return `${stem}.${sanitizeFileExtension(extension) || "bin"}`;
}

function mediaExtensionFromContentType(contentType) {
  return XHS_CONTENT_TYPE_EXTENSIONS.get(contentType) || "";
}

function inferUrlFormatExtension(parsedUrl) {
  const matched = /(?:^|[/?&])format\/([a-z0-9]+)(?:[/?&#]|$)/i.exec(
    `${parsedUrl.pathname}${parsedUrl.search}`
  );
  if (!matched) {
    return "";
  }
  return XHS_URL_FORMAT_EXTENSIONS.get(sanitizeFileExtension(matched[1])) || "";
}

function isExistingOutputPathError(error) {
  return error?.code === "EEXIST" || error?.code === "EISDIR";
}

function shouldFallbackToCopyAfterLinkError(error) {
  return ["EPERM", "ENOTSUP", "ENOSYS", "EOPNOTSUPP", "EXDEV"].includes(
    error?.code
  );
}

async function buildExistingOutputPathError(outputPath) {
  const existingOutput = await stat(outputPath).catch(ignoreMissing);
  if (existingOutput?.isDirectory()) {
    return new Error("--output must be a file path for xhs download-media.");
  }
  return new Error("XHS media download output file already exists.");
}

function formatTimestamp(value) {
  const date = value instanceof Date ? value : new Date(value);
  const pad = (part) => String(part).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}

function safeDecodeURIComponent(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function expandHome(path) {
  if (!path || path === "~") {
    return homedir();
  }
  if (path.startsWith("~/")) {
    return join(homedir(), path.slice(2));
  }
  return path;
}

function ignoreMissing(error) {
  if (error?.code === "ENOENT" || error?.code === "ENOTDIR") {
    return undefined;
  }
  throw error;
}

function ignoreError() {}

function sleep(ms) {
  if (!Number.isFinite(ms) || ms <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolvePromise) => {
    setTimeout(resolvePromise, ms);
  });
}

class XhsRetryableDownloadError extends Error {}

class XhsExpiredMediaLinkError extends Error {
  constructor() {
    super(
      "XHS media link is unavailable or expired. Get a fresh media URL from the XHS detail result and retry."
    );
  }
}
