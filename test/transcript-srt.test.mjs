import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { saveTranscriptSrt } from "../lib/media/transcript-srt.mjs";

test("SRT write failure removes its incomplete file so the same path can be retried", {
  skip: process.platform === "win32",
}, async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "socialdatax-srt-write-failure-"));
  const output = join(tempDir, "video.srt");
  // Apply a real per-process file-size limit; no disk filling or production I/O mocks.
  const script = `
    const { saveTranscriptSrt } = await import(process.argv[1]);
    try {
      await saveTranscriptSrt({ transcript: { segments: [
        { start_ms: 0, end_ms: 1000, text: 'x'.repeat(32768) }
      ] } }, process.argv[2]);
      process.exitCode = 2;
    } catch (error) { console.log(JSON.stringify({ code: error.code })); }
  `;
  try {
    const result = spawnSync("sh", [
      "-c", 'trap "" XFSZ; ulimit -f 1 || exit; exec "$@"', "srt-limit",
      process.execPath, "--input-type=module", "-e", script,
      new URL("../lib/media/transcript-srt.mjs", import.meta.url).href, output,
    ], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    assert.match(JSON.parse(result.stdout).code, /^(EFBIG|ENOSPC)$/);
    assert.equal(existsSync(output), false, "failed write must not leave a subtitle file");
    await saveTranscriptSrt({ transcript: { segments: [
      { start_ms: 0, end_ms: 1000, text: "完成" },
    ] } }, output);
    assert.equal(readFileSync(output, "utf8"), "1\n00:00:00,000 --> 00:00:01,000\n完成\n\n");
  } finally { rmSync(tempDir, { recursive: true, force: true }); }
});
