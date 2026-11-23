import { openAsBlob } from "node:fs";
import { stat } from "node:fs/promises";
import { basename } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 30_000;
const WAIT_MS = 60_000;
const PENDING_STATUSES = ["queued", "running"];
const STATUSES = [...PENDING_STATUSES, "succeeded", "failed", "expired"];

export const LIVE_PHOTO_API_URL = "https://mcp.socialdatax.com/socialdatax/api/v1/media/live-photo";

async function submitBody({ file, url, imageId, effect, strength }) {
  const motion = {};
  if (effect) motion.effect = effect;
  if (strength) motion.strength = strength;
  if (!file) {
    return { ...(url ? { image_url: url } : { image_id: imageId }), ...motion };
  }
  const info = await stat(file);
  if (!info.isFile() || info.size < 1 || info.size > MAX_IMAGE_BYTES) {
    throw new Error("--file must be a nonempty JPEG or PNG file up to 20 MiB.");
  }
  const body = new FormData();
  body.set("file", await openAsBlob(file), basename(file));
  for (const [key, value] of Object.entries(motion)) body.set(key, value);
  return body;
}

async function requestJob(baseUrl, headers, action, body, signal = AbortSignal.timeout(REQUEST_TIMEOUT_MS)) {
  const multipart = body instanceof FormData;
  const response = await fetch(`${baseUrl.replace(/\/+$/, "")}/${action}`, {
    method: "POST",
    headers: multipart ? headers : { ...headers, "Content-Type": "application/json" },
    body: multipart ? body : JSON.stringify(body),
    signal,
    redirect: "error",
  });
  const data = await response.json().catch((error) => {
    signal.throwIfAborted();
    if (error instanceof SyntaxError) return null;
    throw error;
  });
  if (!response.ok || typeof data?.code === "number") {
    throw new Error(data?.message || `Live Photo API request failed (HTTP ${response.status}).`);
  }
  if (typeof data?.job_id !== "string" || !data.job_id || !STATUSES.includes(data.status)) {
    throw new Error("Live Photo API returned an invalid job response.");
  }
  return data;
}

export async function runLivePhotoJob(options, { baseUrl, headers, onSubmitted }) {
  const get = (jobId, signal) => requestJob(baseUrl, headers, "get", { job_id: jobId }, signal);
  let job = options.jobId
    ? await get(options.jobId)
    : await requestJob(baseUrl, headers, "submit", await submitBody(options));
  const jobId = options.jobId ?? job.job_id;
  if (job.job_id !== jobId) throw new Error("Live Photo API returned a different job ID.");
  if (!options.jobId && PENDING_STATUSES.includes(job.status)) onSubmitted?.(jobId);

  const deadline = performance.now() + WAIT_MS;
  while (PENDING_STATUSES.includes(job.status)) {
    const hint = job.next_poll_after_seconds;
    const delay = Number.isFinite(hint) && hint >= 0 ? hint * 1000 : 2000;
    if (delay >= deadline - performance.now()) break;
    if (delay > 0) await sleep(delay);
    const remaining = Math.floor(deadline - performance.now());
    if (remaining <= 0) break;
    const signal = AbortSignal.timeout(Math.min(REQUEST_TIMEOUT_MS, remaining));
    try {
      const next = await get(jobId, signal);
      if (next.job_id !== jobId) throw new Error("Live Photo API returned a different job ID.");
      job = next;
    } catch (error) {
      if (performance.now() >= deadline ||
          (remaining <= REQUEST_TIMEOUT_MS && signal.aborted && error === signal.reason)) break;
      const queryError = new Error(
        `${error.message} Resume with live-photo get --job-id using the returned job_id.`,
        { cause: error },
      );
      queryError.partialOutput = job;
      throw queryError;
    }
  }
  return job;
}
