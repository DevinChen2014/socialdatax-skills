import { constants } from "node:fs";
import { access, lstat, open, stat, unlink } from "node:fs/promises";
import { dirname } from "node:path";

export async function validateSrtOutputPath(filePath) {
  const existing = await lstat(filePath).catch((error) => {
    if (error.code !== "ENOENT") throw error;
    return null;
  });
  if (existing) throw new Error("--srt-output already exists; choose a new file path.");
  const parent = await stat(dirname(filePath)).catch((error) => {
    throw new Error(`Invalid --srt-output parent directory: ${error.message}`);
  });
  if (!parent.isDirectory()) throw new Error("--srt-output parent must be a directory.");
  await access(dirname(filePath), constants.W_OK | constants.X_OK).catch((error) => {
    throw new Error(`--srt-output parent directory is not writable: ${error.message}`);
  });
}

export async function saveTranscriptSrt(data, filePath) {
  const segments = data?.transcript?.segments;
  if (!Array.isArray(segments) || segments.length === 0) {
    throw Object.assign(new Error("Cannot export SRT: no timed transcript segments returned. Keep the JSON transcript; do not resubmit the video."), { code: "ERR_SRT_TIMING" });
  }
  let previousStart = -1;
  const cues = segments.map((segment, index) => {
    const { start_ms: start, end_ms: end, text } = segment ?? {};
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) ||
        start < 0 || end <= start || start < previousStart ||
        typeof text !== "string" || !text.trim()) {
      throw Object.assign(new Error(`Cannot export SRT: invalid timed transcript segment ${index + 1}. Keep the JSON transcript; do not resubmit the video.`), { code: "ERR_SRT_TIMING" });
    }
    previousStart = start;
    const caption = text.replace(/\r\n?/g, "\n").trim()
      .split("\n").filter((line) => line.trim()).join("\n");
    return `${index + 1}\n${srtTimestamp(start)} --> ${srtTimestamp(end)}\n${caption}\n\n`;
  });
  // Exclusive creation also protects existing files if the path changes during polling.
  // Only clean up after this process has successfully created the file.
  const file = await open(filePath, "wx");
  try {
    await file.writeFile(cues.join(""), { encoding: "utf8" });
    await file.close();
  } catch (error) {
    await file.close().catch(() => {});
    await unlink(filePath).catch((cleanupError) => {
      error.message += ` Could not remove incomplete SRT file: ${cleanupError.message}`;
    });
    throw error;
  }
}

function srtTimestamp(milliseconds) {
  const hours = Math.floor(milliseconds / 3_600_000);
  const minutes = Math.floor(milliseconds / 60_000) % 60;
  const seconds = Math.floor(milliseconds / 1000) % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")},${String(milliseconds % 1000).padStart(3, "0")}`;
}
