import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { runLivePhotoJob } from "../lib/media/live-photo.mjs";

const cli = fileURLToPath(new URL("../cli.mjs", import.meta.url));
const run = promisify(execFile);
const prefix = "/socialdatax/api/v1/media/live-photo";
const jobId = "lp_abcdef0123456789abcdef0123456789";
const queued = { job_id: jobId, status: "queued", next_poll_after_seconds: 0 };
const done = {
  ...queued,
  status: "succeeded",
  result: { preview: { url: "https://files.example.org/preview.mp4" }, outputs: [
    { format: "apple_live_photo", download: { url: "https://files.example.org/apple.zip" } },
    { format: "google_motion_photo", download: { url: "https://files.example.org/android.jpg" } },
  ] },
};

async function withApi(replies, check) {
  const calls = [];
  const server = createServer(async (request, response) => {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    calls.push({ path: request.url, headers: request.headers, body: Buffer.concat(chunks) });
    const { status = 200, data, onRequest } = replies.shift() ?? { status: 500, data: { message: "Unexpected call" } };
    onRequest?.();
    if (data === undefined) return;
    response.writeHead(status, { "Content-Type": "application/json" });
    response.end(JSON.stringify(data));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    await check(calls, (...args) => run(process.execPath, [cli, "live-photo", ...args], {
      timeout: 8000,
      env: {
        ...process.env,
        SOCIALDATAX_API_KEY: "isolated-test-key",
        SOCIALDATAX_LIVE_PHOTO_API_URL: `http://127.0.0.1:${server.address().port}${prefix}`,
      },
    }));
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}

test("live-photo sends a local image in one submit and polls the same task", async () => {
  const folder = await mkdtemp(join(tmpdir(), "sdx-live-photo-"));
  try {
    const file = join(folder, "my photo.png");
    const image = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    await writeFile(file, image);
    await withApi([{ data: queued }, { data: done }], async (calls, command) => {
      const { stdout } = await command("generate", "--file", file, "--effect", "pan",
        "--source-client", "socialdatax-skills", "--source-platform", "npm",
        "--source-skill", "media-live-photo");
      assert.deepEqual(JSON.parse(stdout), done);
      assert.deepEqual(calls.map((item) => item.path), [prefix + "/submit", prefix + "/get"]);
      assert.match(calls[0].headers["content-type"], /^multipart\/form-data; boundary=/);
      assert.ok(calls[0].body.includes(image));
      assert.match(calls[0].body.toString(), /name="effect"\r?\n\r?\npan/);
      assert.deepEqual(JSON.parse(calls[1].body), { job_id: jobId });
      for (const call of calls) {
        assert.equal(call.headers.authorization, "Bearer isolated-test-key");
        assert.equal(call.headers["x-socialdatax-source-skill"], "media-live-photo");
        assert.equal(call.headers["x-socialdatax-source-platform"], "npm");
      }
    });
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
});

test("live-photo accepts an uploaded image ID and validates inputs before submitting", async () => {
  const imageId = "a".repeat(32);
  await withApi([{ data: { ...done, status: "failed", result: null, error: { code: "invalid_image" } } }],
    async (calls, command) => {
      await assert.rejects(command("generate", "--image-id", imageId, "--url", "https://example.org/photo.png"),
        /Provide exactly one/);
      assert.equal(calls.length, 0);
      const { stdout } = await command("generate", "--image-id", imageId, "--strength", "medium");
      assert.equal(JSON.parse(stdout).status, "failed");
      assert.deepEqual(calls.map((item) => item.path), [prefix + "/submit"]);
      assert.deepEqual(JSON.parse(calls[0].body), { image_id: imageId, strength: "medium" });
    });
});

test("live-photo retains the known task after a failed poll and can resume", async () => {
  const url = "https://example.org/private/image.png?signature=test";
  await withApi([{ data: queued }, { status: 503, data: { message: "Unavailable" } }, { data: done }],
    async (calls, command) => {
      await assert.rejects(command("generate", "--url", url), (error) => {
        assert.deepEqual(JSON.parse(error.stdout), queued);
        assert.match(error.stderr, /live-photo get --job-id/);
        return true;
      });
      assert.deepEqual(JSON.parse((await command("get", "--job-id", ` ${jobId} `)).stdout), done);
      assert.deepEqual(calls.map((item) => item.path), [prefix + "/submit", prefix + "/get", prefix + "/get"]);
      assert.deepEqual(JSON.parse(calls[0].body), { image_url: url });
    });
});

test("live-photo preserves the task when fetch throws a timeout with a read-only message", async (t) => {
  const timeout = new DOMException("The operation timed out", "TimeoutError");
  const requested = [];
  t.mock.method(globalThis, "fetch", async (url) => {
    requested.push(new URL(url).pathname);
    if (requested.length === 1) return Response.json(queued);
    throw timeout;
  });

  await assert.rejects(runLivePhotoJob({ url: "https://example.org/photo.png" }, {
    baseUrl: "http://127.0.0.1" + prefix, headers: {},
  }), (error) => {
    assert.equal(error.cause, timeout);
    assert.deepEqual(error.partialOutput, queued);
    assert.match(error.message, /timed out.*live-photo get --job-id/);
    return true;
  });
  assert.deepEqual(requested, [prefix + "/submit", prefix + "/get"]);
});

test("live-photo preserves a timeout while reading a polling response body", async (t) => {
  const timeout = new DOMException("The operation timed out", "TimeoutError");
  t.mock.method(globalThis, "fetch", async (url) => {
    if (url.endsWith("/submit")) return Response.json(queued);
    return new Response(new ReadableStream({
      start(controller) {
        controller.error(timeout);
      },
    }));
  });

  await assert.rejects(runLivePhotoJob({ url: "https://example.org/photo.png" }, {
    baseUrl: "http://127.0.0.1" + prefix, headers: {},
  }), (error) => {
    assert.match(error.message, /timed out.*live-photo get --job-id/);
    assert.ok(error.cause === timeout, "Expected the response-body timeout as the cause");
    assert.deepEqual(error.partialOutput, queued);
    return true;
  });
});

test("live-photo returns the latest task when the polling window limits the request timeout", async (t) => {
  const running = { ...queued, status: "running" };
  const timeout = new DOMException("The operation timed out", "TimeoutError");
  let elapsed = 0;
  let controller;
  const requestTimeouts = [];
  t.mock.method(performance, "now", () => elapsed);
  t.mock.method(AbortSignal, "timeout", (ms) => {
    requestTimeouts.push(ms);
    controller = new AbortController();
    return controller.signal;
  });
  t.mock.method(globalThis, "fetch", async (url, { signal }) => {
    if (url.endsWith("/submit")) return Response.json(queued);
    if (elapsed === 0) {
      elapsed = 30_000.4;
      return Response.json(running);
    }
    elapsed += requestTimeouts.at(-1);
    controller.abort(timeout);
    throw signal.reason;
  });

  const snapshot = await runLivePhotoJob({ url: "https://example.org/photo.png" }, {
    baseUrl: "http://127.0.0.1" + prefix, headers: {},
  });
  assert.deepEqual(snapshot, running);
  assert.deepEqual(requestTimeouts, [30_000, 30_000, 29_999]);
});

test("live-photo reports the submitted task ID before polling can be interrupted", async () => {
  let pollingStarted;
  const polling = new Promise((resolve) => { pollingStarted = resolve; });
  await withApi([{ data: queued }, { onRequest: pollingStarted }], async (calls, command) => {
    const execution = command("generate", "--url", "https://example.org/photo.png");
    await Promise.race([polling, execution]);
    assert.equal(execution.child.kill("SIGINT"), true);
    await assert.rejects(execution, (error) => {
      assert.equal(error.stdout, "");
      assert.ok(error.stderr.includes(jobId));
      assert.match(error.stderr, /live-photo get --job-id/);
      return true;
    });
    assert.deepEqual(calls.map((item) => item.path), [prefix + "/submit", prefix + "/get"]);
  });
});
