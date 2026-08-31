import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const testDir = dirname(fileURLToPath(import.meta.url));
const packageDir = dirname(testDir);
const sourceRepoMarker = resolve(
  packageDir,
  "..",
  "socialdatax-skill-source",
  "listings.json"
);
const sourceGenerator = resolve(
  packageDir,
  "..",
  "..",
  "scripts",
  "generate_socialdatax_skills.mjs"
);
const requiredSourceTestFiles = [
  "cli.test.mjs",
  "generate-skills.test.mjs",
  "public-package.test.mjs",
];
const isSourceRepo = existsSync(sourceRepoMarker);
if (isSourceRepo) {
  const missingSourceFiles = [
    sourceGenerator,
    ...requiredSourceTestFiles.map((file) => join(testDir, file)),
  ].filter((file) => !existsSync(file));
  if (missingSourceFiles.length > 0) {
    throw new Error(
      `Source repository test inputs are missing: ${missingSourceFiles.join(", ")}`
    );
  }
}
const testFiles = isSourceRepo
  ? readdirSync(testDir)
      .filter((file) => file.endsWith(".test.mjs"))
      .sort()
  : ["public-package.test.mjs"];
const result = spawnSync(
  process.execPath,
  ["--test", ...testFiles.map((file) => join(testDir, file))],
  { stdio: "inherit" }
);

if (result.error) {
  throw result.error;
}
process.exitCode = result.status ?? 1;
