import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import {
  mkdir,
  open as openFile,
  rename,
  rm,
  stat,
  unlink,
} from "node:fs/promises";
import {
  arch as osArch,
  homedir,
  platform as osPlatform,
  release as osRelease,
} from "node:os";
import { dirname, join, resolve } from "node:path";

import {
  MEDIA_DOWNLOAD_MAX_BYTES,
  MEDIA_DOWNLOAD_TIMEOUT_MS,
  assertMediaDownloadWithinLimit,
  createMediaDownloadAbortSignal,
  isAbortLikeError,
  parseOptionalIntegerHeader,
  writeResponseBodyToFile,
} from "./common.mjs";

const BILIBILI_DOWNLOAD_ALLOWED_HEADER_NAMES = new Set([
  "referer",
  "user-agent",
]);

export async function downloadBilibiliVideoFromManifest(
  manifest,
  options,
  {
    fetchMedia = fetch,
    spawnProcess = spawn,
    downloadTimeoutMs = MEDIA_DOWNLOAD_TIMEOUT_MS,
    maxDownloadBytes = MEDIA_DOWNLOAD_MAX_BYTES,
  } = {}
) {
  validateBilibiliDownloadManifest(manifest);

  const outputPath = resolveBilibiliOutputPath(manifest, options);
  const ffmpegPath = options.ffmpegPath || "ffmpeg";
  await mkdir(dirname(outputPath), { recursive: true });
  await reserveBilibiliOutputPath(outputPath);

  const downloadedTracks = [];
  try {
    await assertBilibiliTrackPathsAvailable(
      manifest.download_manifest.tracks,
      outputPath
    );
    await assertBilibiliFfmpegAvailable(ffmpegPath, spawnProcess);

    for (const track of manifest.download_manifest.tracks) {
      downloadedTracks.push(
        await downloadBilibiliTrack(track, {
          headers: manifest.headers,
          outputPath,
          fetchMedia,
          downloadTimeoutMs,
          maxDownloadBytes,
        })
      );
    }

    const videoTrack = downloadedTracks.find((track) => track.type === "video");
    const audioTrack = downloadedTracks.find((track) => track.type === "audio");
    if (!videoTrack || !audioTrack) {
      throw new Error("Bilibili download manifest must include video and audio tracks.");
    }

    await mergeBilibiliTracksWithFfmpeg({
      ffmpegPath,
      videoPath: videoTrack.path,
      audioPath: audioTrack.path,
      outputPath,
      spawnProcess,
    });

    const outputStats = await stat(outputPath);
    let tracksKept = Boolean(options.keepTracks);
    if (!options.keepTracks) {
      try {
        await Promise.all(
          downloadedTracks.map((track) => rm(track.path, { force: true }))
        );
      } catch {
        tracksKept = true;
      }
    }

    return {
      platform: "bilibili",
      action: "download",
      title: manifest.title,
      bvid: manifest.bvid,
      aid: manifest.aid,
      cid: manifest.cid,
      page: manifest.page,
      selected_quality: manifest.selected_quality,
      expires_at: manifest.expires_at,
      output_path: outputPath,
      output_bytes: outputStats.size,
      tracks_kept: tracksKept,
      tracks: downloadedTracks,
      merge: manifest.download_manifest.merge,
    };
  } catch (error) {
    await Promise.all(
      downloadedTracks.map((track) => rm(track.path, { force: true }))
    ).catch(() => {});
    await rm(outputPath, { force: true }).catch(() => {});
    throw error;
  }
}

function validateBilibiliDownloadManifest(value) {
  if (!value || typeof value !== "object") {
    throw new Error("Bilibili download-links response must be an object.");
  }
  if (value.platform !== "bilibili") {
    throw new Error("Bilibili download-links response platform mismatch.");
  }
  if (!stringValue(value.bvid) || !stringValue(value.cid)) {
    throw new Error("Bilibili download-links response missing bvid or cid.");
  }
  if (!value.headers || typeof value.headers !== "object") {
    throw new Error("Bilibili download-links response missing headers.");
  }
  const downloadManifest = value.download_manifest;
  if (!downloadManifest || typeof downloadManifest !== "object") {
    throw new Error("Bilibili download-links response missing download_manifest.");
  }
  if (downloadManifest.mode !== "dash") {
    throw new Error("Bilibili download currently supports only DASH manifests.");
  }
  if (!Array.isArray(downloadManifest.tracks) || downloadManifest.tracks.length === 0) {
    throw new Error("Bilibili download manifest missing tracks.");
  }
  const trackTypes = new Set();
  for (const track of downloadManifest.tracks) {
    if (!track || typeof track !== "object") {
      throw new Error("Bilibili download manifest track must be an object.");
    }
    const trackType = stringValue(track.type);
    if (!["video", "audio"].includes(trackType)) {
      throw new Error("Bilibili download manifest track type must be video or audio.");
    }
    assertHttpDownloadUrl(track.url, "Bilibili download track url");
    trackTypes.add(trackType);
  }
  if (!trackTypes.has("video") || !trackTypes.has("audio")) {
    throw new Error("Bilibili download manifest must include video and audio tracks.");
  }
  const merge = downloadManifest.merge;
  if (!merge || merge.strategy !== "ffmpeg_copy") {
    throw new Error("Bilibili download manifest merge strategy must be ffmpeg_copy.");
  }
}

function resolveBilibiliOutputPath(manifest, options) {
  if (options.output && options.outputDir) {
    throw new Error("Use only one of --output or --output-dir for bilibili download.");
  }
  if (options.output) {
    return resolve(expandHome(options.output));
  }
  if (!options.outputDir) {
    throw new Error("Missing --output or --output-dir for bilibili download.");
  }
  const outputDir = resolve(expandHome(options.outputDir));
  const container = sanitizeFileExtension(
    manifest.download_manifest?.merge?.container || "mp4"
  );
  const basename = sanitizeFileName(
    [manifest.title, manifest.bvid].filter(Boolean).join("-") || "bilibili-video"
  );
  return join(outputDir, `${basename}.${container}`);
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

function sanitizeFileName(value) {
  const normalized = String(value || "")
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_")
    .replace(/\s+/g, " ")
    .trim();
  return (normalized || "bilibili-video").slice(0, 120);
}

function sanitizeFileExtension(value) {
  const normalized = String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return normalized || "mp4";
}

async function reserveBilibiliOutputPath(outputPath) {
  let file;
  try {
    file = await openFile(outputPath, "wx");
  } catch (error) {
    if (error?.code === "EEXIST") {
      const existingOutput = await stat(outputPath).catch(() => undefined);
      if (existingOutput?.isDirectory()) {
        throw new Error("--output must be a file path for bilibili download.");
      }
      throw new Error("Bilibili download output file already exists.");
    }
    throw error;
  } finally {
    await file?.close();
  }
}

async function downloadBilibiliTrack(
  track,
  {
    headers,
    outputPath,
    fetchMedia,
    downloadTimeoutMs,
    maxDownloadBytes,
  }
) {
  const { trackType, ext, trackPath } = resolveBilibiliTrackTarget(
    track,
    outputPath
  );
  const tempPath = `${trackPath}.tmp-${process.pid}-${Date.now()}-${randomUUID()}`;
  await mkdir(dirname(trackPath), { recursive: true });

  let trackReserved = false;
  let bytesWritten = 0;
  try {
    await reserveBilibiliTrackPath(trackPath, trackType);
    trackReserved = true;
    const signal = createMediaDownloadAbortSignal(downloadTimeoutMs);
    const response = await fetchMedia(track.url, {
      headers: normalizeBilibiliDownloadHeaders(headers),
      ...(signal ? { signal } : {}),
    });
    if (!response.ok) {
      throw new Error(
        `Bilibili ${trackType} track download failed with HTTP ${response.status}.`
      );
    }
    assertMediaDownloadWithinLimit(
      parseOptionalIntegerHeader(response.headers.get("content-length")),
      maxDownloadBytes
    );
    bytesWritten = await writeResponseBodyToFile(response, tempPath, {
      maxBytes: maxDownloadBytes,
    });
    await rename(tempPath, trackPath);
  } catch (error) {
    await unlink(tempPath).catch(() => {});
    if (trackReserved) {
      await unlink(trackPath).catch(() => {});
    }
    if (isAbortLikeError(error)) {
      throw new Error("Bilibili track download timed out.");
    }
    throw error;
  }

  return {
    type: trackType,
    path: trackPath,
    bytes_written: bytesWritten,
    codec: stringValue(track.codec) || "",
    quality: stringValue(track.quality) || "",
    width: track.width ?? null,
    height: track.height ?? null,
    ext,
    bandwidth: track.bandwidth ?? null,
  };
}

async function assertBilibiliTrackPathsAvailable(tracks, outputPath) {
  for (const track of tracks) {
    const { trackType, trackPath } = resolveBilibiliTrackTarget(track, outputPath);
    const existingTrack = await stat(trackPath).catch((error) => {
      if (error?.code === "ENOENT") {
        return undefined;
      }
      throw error;
    });
    if (existingTrack) {
      throw new Error(`Bilibili ${trackType} track file already exists.`);
    }
  }
}

function resolveBilibiliTrackTarget(track, outputPath) {
  const trackType = String(track.type);
  const ext = sanitizeFileExtension(track.ext || "m4s");
  return {
    trackType,
    ext,
    trackPath: `${outputPath}.${trackType}.${ext}`,
  };
}

async function reserveBilibiliTrackPath(trackPath, trackType) {
  let file;
  try {
    file = await openFile(trackPath, "wx");
  } catch (error) {
    if (error?.code === "EEXIST") {
      throw new Error(`Bilibili ${trackType} track file already exists.`);
    }
    throw error;
  } finally {
    await file?.close();
  }
}

function normalizeBilibiliDownloadHeaders(headers) {
  const normalized = {};
  for (const [key, value] of Object.entries(headers || {})) {
    const headerName = String(key || "").trim().toLowerCase();
    if (
      !BILIBILI_DOWNLOAD_ALLOWED_HEADER_NAMES.has(headerName) ||
      typeof value !== "string" ||
      !value.trim()
    ) {
      continue;
    }
    if (headerName === "referer") {
      normalized.Referer = value.trim();
    } else if (headerName === "user-agent") {
      normalized["User-Agent"] = value.trim();
    }
  }
  return normalized;
}

function assertHttpDownloadUrl(value, label) {
  let parsed;
  try {
    parsed = new URL(String(value || ""));
  } catch {
    throw new Error(`${label} must be an HTTP URL.`);
  }
  if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname) {
    throw new Error(`${label} must be an HTTP URL.`);
  }
}

async function mergeBilibiliTracksWithFfmpeg({
  ffmpegPath,
  videoPath,
  audioPath,
  outputPath,
  spawnProcess,
}) {
  const args = [
    "-y",
    "-i",
    videoPath,
    "-i",
    audioPath,
    "-c",
    "copy",
    outputPath,
  ];
  await runFfmpegProcess(ffmpegPath, args, spawnProcess);
}

export async function assertBilibiliFfmpegAvailable(
  ffmpegPath = "ffmpeg",
  spawnProcess = spawn
) {
  await runFfmpegProcess(ffmpegPath, ["-version"], spawnProcess, {
    failurePrefix: "ffmpeg availability check failed",
  });
}

async function runFfmpegProcess(
  ffmpegPath,
  args,
  spawnProcess,
  { failurePrefix = "ffmpeg failed for bilibili download" } = {}
) {
  return new Promise((resolvePromise, reject) => {
    let stderr = "";
    const child = spawnProcess(ffmpegPath, args, {
      stdio: ["ignore", "ignore", "pipe"],
    });
    child.stderr?.setEncoding("utf8");
    child.stderr?.on("data", (chunk) => {
      stderr += chunk;
      if (stderr.length > 4000) {
        stderr = stderr.slice(-4000);
      }
    });
    child.on("error", (error) => {
      if (error?.code === "ENOENT") {
        reject(
          new Error(
            buildFfmpegMissingMessage(ffmpegPath)
          )
        );
        return;
      }
      reject(error);
    });
    child.on("close", (status) => {
      if (status === 0) {
        resolvePromise();
        return;
      }
      reject(
        new Error(
          `${failurePrefix} with exit code ${status}. ${stderr.trim()}`.trim()
        )
      );
    });
  });
}

function buildFfmpegMissingMessage(ffmpegPath) {
  const detectedSystem = `${osPlatform()} ${osRelease()} ${osArch()}`;
  return [
    `ffmpeg not found at "${ffmpegPath}".`,
    `Detected system: ${detectedSystem}.`,
    "Install ffmpeg, then retry:",
    "macOS (Homebrew): brew install ffmpeg",
    "Ubuntu/Debian: sudo apt update && sudo apt install ffmpeg",
    "Windows (winget): winget install Gyan.FFmpeg",
    "If ffmpeg is already installed, pass --ffmpeg-path /path/to/ffmpeg for bilibili download.",
  ].join("\n");
}

function stringValue(value) {
  return typeof value === "string" && value.trim() ? value : undefined;
}
