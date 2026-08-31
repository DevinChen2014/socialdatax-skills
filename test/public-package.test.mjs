import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)));
const expectedSourcePlatform = existsSync(
  join(packageDir, "..", "socialdatax-skill-source", "listings.json")
)
  ? "npm"
  : "github";
const expectedSkillsByPlatform = {
  npm: [
    "media-comments",
    "media-detail",
    "media-search",
    "media-transcript",
    "media-user-info",
    "media-user-posts",
    "sensitive-check",
    "socialdatax-content-research-assistant",
  ],
  github: [
    "douyin-video-copy-extract",
    "media-comments",
    "media-detail",
    "media-search",
    "media-transcript",
    "media-user-info",
    "media-user-posts",
    "sensitive-check",
    "socialdatax-content-research-assistant",
    "xhs-comment-insights",
  ],
};

function listRuntimeModules(directory, prefix = "") {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = join(prefix, entry.name);
    if (entry.isDirectory()) {
      return listRuntimeModules(join(directory, entry.name), relativePath);
    }
    return /\.(?:c|m)?js$/.test(entry.name) ? [relativePath] : [];
  });
}

test("public package has valid runtime syntax and self-consistent skills", () => {
  const packageMetadata = JSON.parse(
    readFileSync(join(packageDir, "package.json"), "utf8")
  );
  const packageLock = JSON.parse(
    readFileSync(join(packageDir, "package-lock.json"), "utf8")
  );
  assert.equal(packageMetadata.name, "socialdatax-skills");
  assert.equal(packageLock.name, packageMetadata.name);
  assert.equal(packageLock.version, packageMetadata.version);
  assert.equal(packageLock.packages[""].name, packageMetadata.name);
  assert.equal(packageLock.packages[""].version, packageMetadata.version);
  const cli = readFileSync(join(packageDir, "cli.mjs"), "utf8");
  const readme = readFileSync(join(packageDir, "README.md"), "utf8");
  assert.ok(
    cli.includes(`const PACKAGE_VERSION = "${packageMetadata.version}";`),
    "CLI package version should match package.json"
  );
  assert.ok(
    readme.includes(
      `Current public capability version: \`${packageMetadata.version}\``
    ),
    "README capability version should match package.json"
  );
  const minimumNodeVersion = packageMetadata.engines?.node?.match(
    /^>=(\d+\.\d+\.\d+)$/
  )?.[1];
  assert.ok(minimumNodeVersion, "package.json should declare engines.node as >=x.y.z");
  assert.ok(
    cli.includes(`const MIN_NODE_VERSION = "${minimumNodeVersion}";`),
    "CLI minimum Node.js version should match package.json"
  );
  assert.ok(
    readme.includes(`- Minimum: Node.js ${minimumNodeVersion}.`),
    "README minimum Node.js version should match package.json"
  );
  for (const dependency of ["@modelcontextprotocol/sdk", "undici"]) {
    assert.equal(
      typeof packageMetadata.dependencies?.[dependency],
      "string",
      `${dependency} should be declared as a runtime dependency`
    );
    assert.notEqual(packageMetadata.dependencies[dependency].trim(), "");
    assert.equal(
      packageLock.packages[""].dependencies[dependency],
      packageMetadata.dependencies[dependency],
      `${dependency} lock entry should match package.json`
    );
  }

  const runtimeFiles = [
    "cli.mjs",
    ...listRuntimeModules(join(packageDir, "lib")).map((file) => join("lib", file)),
  ];
  for (const file of runtimeFiles) {
    const runtimeFile = join(packageDir, file);
    assert.ok(existsSync(runtimeFile), `${file} should be included`);
    const syntaxCheck = spawnSync(process.execPath, ["--check", runtimeFile], {
      encoding: "utf8",
    });
    assert.equal(syntaxCheck.status, 0, `${file}: ${syntaxCheck.stderr}`);
  }

  const skillsRoot = join(packageDir, "skills");
  const skillSlugs = readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const otherSourcePlatform = expectedSourcePlatform === "npm" ? "github" : "npm";
  const sourcePlatforms = new Set();
  for (const slug of skillSlugs) {
    const skill = readFileSync(join(skillsRoot, slug, "SKILL.md"), "utf8");
    assert.match(skill, new RegExp(`^name: "${slug}"$`, "m"));
    assert.match(skill, /^source_client: "socialdatax-skills"$/m);
    const sourcePlatform = skill.match(/^source_platform: "([^"]+)"$/m)?.[1];
    assert.ok(sourcePlatform === "npm" || sourcePlatform === "github");
    sourcePlatforms.add(sourcePlatform);
    assert.match(skill, new RegExp(`^source_skill: "${slug}"$`, "m"));
    assert.match(skill, new RegExp(`from=${expectedSourcePlatform}`));
    assert.match(skill, new RegExp(`--source-platform ${expectedSourcePlatform}`));
    assert.match(skill, new RegExp(`--source-skill ${slug}`));
    assert.doesNotMatch(
      skill,
      new RegExp(
        `from=${otherSourcePlatform}|--source-platform ${otherSourcePlatform}`
      )
    );
    const agentFile = join(skillsRoot, slug, "agents", "openai.yaml");
    assert.ok(existsSync(agentFile), `${slug} should include agents/openai.yaml`);
    const agent = readFileSync(agentFile, "utf8");
    assert.match(agent, new RegExp(`^  default_prompt: .*\\$${slug}\\b`, "m"));
    assert.match(agent, /^  allow_implicit_invocation: true$/m);
  }
  assert.equal(sourcePlatforms.size, 1, "all packaged skills should use one host attribution");
  const [sourcePlatform] = sourcePlatforms;
  assert.equal(
    sourcePlatform,
    expectedSourcePlatform,
    `this repository should contain ${expectedSourcePlatform}-attributed skills`
  );
  assert.deepEqual(
    skillSlugs,
    expectedSkillsByPlatform[sourcePlatform],
    `${sourcePlatform} package should include its complete skill catalog`
  );

  const catalog = readFileSync(join(packageDir, "CATALOG.md"), "utf8");
  assert.match(catalog, new RegExp(`from=${sourcePlatform}`));
  assert.match(catalog, new RegExp(`--source-platform ${sourcePlatform}`));
  assert.doesNotMatch(
    catalog,
    new RegExp(
      `from=${otherSourcePlatform}|--source-platform ${otherSourcePlatform}`
    )
  );
});
