import { spawn } from 'node:child_process';
import { link, lstat, mkdir, mkdtemp, rm, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import {
  MEDIA_DOWNLOAD_MAX_BYTES, MEDIA_DOWNLOAD_TIMEOUT_MS,
  assertMediaDownloadWithinLimit, createMediaDownloadAbortSignal,
  parseOptionalIntegerHeader, writeResponseBodyToFile,
} from './common.mjs';

const VIDEO_ID = /^[1-9][0-9]{0,18}$/;

function validateShareText(text) {
  // Match the server's single-URL share-text boundary; redirects remain server-owned.
  const candidates = (text.match(/https?:\/\/[^\s]+/gi) || []).flatMap(value =>
    [...value.matchAll(/https?:\/\//gi)].map(match => value.slice(match.index))
  );
  const urls = [...new Set(candidates.map(value =>
    value.split(/[，。！？；：、)\]}】）>》」』"'”’]/u)[0].replace(/[,\.!?:;]+$/, '')
  ))];
  try {
    if (urls.length !== 1) throw new Error();
    const url = new URL(urls[0]);
    if (url.protocol !== 'https:' || url.hostname !== 'novelquickapp.com' || url.username || url.password || url.port) throw new Error();
    if (/^\/s\/[A-Za-z0-9]+\/?$/.test(url.pathname)) return;
    const ids = url.searchParams.getAll('vid');
    if (url.pathname === '/hongguo/ug/pages/video-animation-share' && ids.length === 1 && VIDEO_ID.test(ids[0])) return;
  } catch { /* Use the same safe input message for malformed and unsupported links. */ }
  throw new Error('--url must contain one supported HTTPS novelquickapp.com episode share URL.');
}

function episodeFilename(id, definition) {
  return `${id}-${definition.replace(/[^A-Za-z0-9_-]/g, '_')}.mp4`;
}

export function buildHongguoDownloadRequest(options) {
  if ((options.videoId !== undefined) === (options.url !== undefined)) {
    throw new Error('Provide exactly one of --video-id or --url for hongguo download-media.');
  }
  if (options.videoId !== undefined) {
    if (typeof options.videoId !== 'string' || !VIDEO_ID.test(options.videoId)) {
      throw new Error('--video-id must be a positive decimal string of at most 19 digits.');
    }
    return { tool: 'hongguo_get_video_download_links_by_video_id', toolArguments: { video_id: options.videoId } };
  }
  if (typeof options.url !== 'string' || !options.url.trim() || options.url.length > 8192) {
    throw new Error('--url must be one Hongguo episode share URL or share text, at most 8192 characters.');
  }
  validateShareText(options.url);
  return { tool: 'hongguo_get_video_download_links_by_video_url', toolArguments: { video_url: options.url.trim() } };
}

function outputLocation(options) {
  if (Boolean(options.output) === Boolean(options.outputDir)) {
    throw new Error('Provide exactly one of --output or --output-dir for hongguo download-media.');
  }
  for (const name of ['output', 'outputDir', 'definition', 'ffmpegPath']) {
    if (options[name] !== undefined && (typeof options[name] !== 'string' || !options[name].trim())) {
      throw new Error(`Invalid ${name} for hongguo download-media.`);
    }
  }
  const expand = value => value.startsWith('~/') ? join(homedir(), value.slice(2)) : value === '~' ? homedir() : value;
  const outputPath = options.output ? resolve(expand(options.output)) : undefined;
  return { outputPath, directory: outputPath ? dirname(outputPath) : resolve(expand(options.outputDir)) };
}

async function assertAbsent(path) {
  const existing = await lstat(path).catch(error => {
    if (error.code !== 'ENOENT') throw error;
    return undefined;
  });
  if (existing) throw new Error('Hongguo download output already exists. Choose another --output path.');
}

function selectedStream(manifest, request, definition) {
  if (!manifest || typeof manifest.video_id !== 'string' || !VIDEO_ID.test(manifest.video_id) ||
      (request.toolArguments.video_id && request.toolArguments.video_id !== manifest.video_id) ||
      !Array.isArray(manifest.streams) || !manifest.streams.length) {
    throw new Error('Hongguo returned invalid episode resources.');
  }
  const stream = definition === undefined ? manifest.streams[0] : manifest.streams.find(item => item?.definition === definition);
  if (!stream) throw new Error('Requested Hongguo definition is unavailable.');
  if (typeof stream.definition !== 'string' || !stream.definition.trim() ||
      stream.encryption_method !== 'cenc-aes-ctr' || typeof stream.decryption_key !== 'string' || !/^[0-9a-f]{32}$/.test(stream.decryption_key)) {
    throw new Error('Hongguo returned unsupported or incomplete decryption information.');
  }
  try {
    const url = new URL(stream.download_url);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error();
  } catch { throw new Error('Hongguo returned an invalid media address.'); }
  return stream;
}

function runFfmpeg(file, args, spawnProcess, timeoutMs, checking = false) {
  const message = checking ? 'FFmpeg is unavailable. Install FFmpeg or pass --ffmpeg-path.' : 'FFmpeg could not decrypt the Hongguo video.';
  return new Promise((resolvePromise, reject) => {
    let child;
    const env = { ...process.env };
    for (const name of Object.keys(env)) {
      if (name.toUpperCase() === 'FFREPORT') delete env[name];
    }
    try { child = spawnProcess(file, args, { stdio: ['ignore', 'ignore', 'pipe'], shell: false, env }); }
    catch { reject(new Error(message)); return; }
    child.stderr?.resume();
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, timeoutMs);
    timer.unref?.();
    child.once('error', () => { clearTimeout(timer); reject(new Error(message)); });
    child.once('close', code => {
      clearTimeout(timer);
      if (timedOut) reject(new Error(checking ? message : 'Hongguo video decryption timed out.'));
      else if (code === 0) resolvePromise();
      else reject(new Error(message));
    });
  });
}

export async function downloadHongguoVideo(options, {
  getLinks, fetchMedia = fetch, spawnProcess = spawn,
  downloadTimeoutMs = MEDIA_DOWNLOAD_TIMEOUT_MS, maxDownloadBytes = MEDIA_DOWNLOAD_MAX_BYTES,
} = {}) {
  const request = buildHongguoDownloadRequest(options);
  const target = outputLocation(options);
  if (!target.outputPath && request.toolArguments.video_id && options.definition !== undefined) {
    target.outputPath = join(target.directory, episodeFilename(request.toolArguments.video_id, options.definition));
  }
  if (target.outputPath) await assertAbsent(target.outputPath);
  await mkdir(target.directory, { recursive: true });
  const tempDirectory = await mkdtemp(join(target.directory, '.socialdatax-hongguo-'));
  try {
    const ffmpegPath = options.ffmpegPath || 'ffmpeg';
    await runFfmpeg(ffmpegPath, ['-version'], spawnProcess, 5000, true);
    const manifest = await getLinks(request);
    const stream = selectedStream(manifest, request, options.definition);
    const outputPath = target.outputPath || join(target.directory, episodeFilename(manifest.video_id, stream.definition));
    await assertAbsent(outputPath);
    const encrypted = join(tempDirectory, 'encrypted.mp4');
    let bytes;
    try {
      const signal = createMediaDownloadAbortSignal(downloadTimeoutMs);
      const response = await fetchMedia(stream.download_url, { ...(signal ? { signal } : {}) });
      if (!response.ok) throw new Error();
      const expected = parseOptionalIntegerHeader(response.headers.get('content-length'));
      assertMediaDownloadWithinLimit(expected, maxDownloadBytes);
      bytes = await writeResponseBodyToFile(response, encrypted, { maxBytes: maxDownloadBytes });
      if (!bytes || (expected !== undefined && expected !== bytes)) throw new Error();
    } catch { throw new Error('Hongguo media download failed, expired, incomplete, or exceeded the size/time limit.'); }
    const clear = join(tempDirectory, 'decrypted.mp4');
    await runFfmpeg(ffmpegPath, [
      '-v', 'error', '-nostdin', '-n', '-decryption_key', stream.decryption_key,
      '-i', encrypted, '-map', '0:v:0', '-map', '0:a:0?', '-c', 'copy', '-movflags', '+faststart', clear,
    ], spawnProcess, downloadTimeoutMs);
    // Stream copy alone can succeed with a wrong key; decode the full result before publishing.
    await runFfmpeg(ffmpegPath, [
      '-v', 'error', '-nostdin', '-xerror', '-err_detect', 'explode', '-i', clear,
      '-map', '0:v:0', '-map', '0:a:0?', '-f', 'null', '-',
    ], spawnProcess, downloadTimeoutMs);
    const size = (await stat(clear)).size;
    if (!size) throw new Error('Hongguo decryption produced an empty file.');
    assertMediaDownloadWithinLimit(size, maxDownloadBytes);
    // Both files are on the same filesystem; link publishes atomically without overwriting.
    await link(clear, outputPath);
    return {
      platform: 'hongguo', action: 'download-media', video_id: manifest.video_id,
      definition: stream.definition, output_path: outputPath, output_bytes: size,
      ...(manifest.points ? { points: manifest.points } : {}),
    };
  } finally { await rm(tempDirectory, { recursive: true, force: true }); }
}
