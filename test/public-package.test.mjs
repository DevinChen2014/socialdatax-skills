import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)));

test("public package has valid CLI syntax and self-consistent skills", () => {
  const packageMetadata = JSON.parse(
    readFileSync(join(packageDir, "package.json"), "utf8")
  );
  assert.equal(packageMetadata.name, "socialdatax-skills");

  const cliCheck = spawnSync(
    process.execPath,
    ["--check", join(packageDir, "cli.mjs")],
    { encoding: "utf8" }
  );
  assert.equal(cliCheck.status, 0, cliCheck.stderr);

  const skillsRoot = join(packageDir, "skills");
  const skillSlugs = readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  assert.ok(skillSlugs.length >= 8, "public package should include its core skills");

  const sourcePlatforms = new Set();
  for (const slug of skillSlugs) {
    const skill = readFileSync(join(skillsRoot, slug, "SKILL.md"), "utf8");
    assert.match(skill, new RegExp(`^name: "${slug}"$`, "m"));
    assert.match(skill, /^source_client: "socialdatax-skills"$/m);
    const sourcePlatform = skill.match(/^source_platform: "([^"]+)"$/m)?.[1];
    assert.ok(sourcePlatform === "npm" || sourcePlatform === "github");
    sourcePlatforms.add(sourcePlatform);
    assert.match(skill, new RegExp(`^source_skill: "${slug}"$`, "m"));
    assert.ok(
      existsSync(join(skillsRoot, slug, "agents", "openai.yaml")),
      `${slug} should include agents/openai.yaml`
    );
  }
  assert.equal(sourcePlatforms.size, 1, "all packaged skills should use one host attribution");
});
