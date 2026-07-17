import { open as openFile } from "node:fs/promises";

export const MEDIA_DOWNLOAD_TIMEOUT_MS = 10 * 60 * 1000;
export const MEDIA_DOWNLOAD_MAX_BYTES = 2 * 1024 * 1024 * 1024;

export function createMediaDownloadAbortSignal(timeoutMs) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return undefined;
  }
  if (
    typeof AbortSignal !== "undefined" &&
    typeof AbortSignal.timeout === "function"
  ) {
    return AbortSignal.timeout(timeoutMs);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  timer.unref?.();
  return controller.signal;
}

export function parseOptionalIntegerHeader(value) {
  if (value === null || String(value).trim() === "") {
    return undefined;
  }
  if (!/^\d+$/.test(String(value).trim())) {
    return undefined;
  }
  const parsed = Number.parseInt(String(value).trim(), 10);
  return Number.isSafeInteger(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

export function assertMediaDownloadWithinLimit(bytes, maxBytes) {
  if (!Number.isFinite(maxBytes) || maxBytes <= 0 || bytes === undefined) {
    return;
  }
  if (bytes > maxBytes) {
    throw new Error("Media download is too large for local media processing.");
  }
}

export async function writeResponseBodyToFile(response, filePath, { maxBytes } = {}) {
  if (!response.body) {
    throw new Error("Media download response has no body.");
  }
  const file = await openFile(filePath, "w");
  let bytesWritten = 0;
  try {
    for await (const chunk of response.body) {
      const buffer = Buffer.from(chunk);
      if (buffer.length === 0) {
        continue;
      }
      assertMediaDownloadWithinLimit(
        bytesWritten + buffer.length,
        maxBytes
      );
      await writeAllToFile(file, buffer);
      bytesWritten += buffer.length;
    }
  } finally {
    await file.close();
  }
  return bytesWritten;
}

export function isAbortLikeError(error) {
  return error?.name === "AbortError" || error?.name === "TimeoutError";
}

export async function writeAllToFile(file, buffer, position) {
  let offset = 0;
  while (offset < buffer.length) {
    const writePosition = position === undefined ? undefined : position + offset;
    const { bytesWritten } = await file.write(
      buffer,
      offset,
      buffer.length - offset,
      writePosition
    );
    if (bytesWritten <= 0) {
      throw new Error("Downloaded media could not be written.");
    }
    offset += bytesWritten;
  }
}
