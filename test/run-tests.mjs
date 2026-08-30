import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const testDir = dirname(fileURLToPath(import.meta.url));
const packageDir = dirname(testDir);
const sourceGenerator = resolve(
  packageDir,
  "..",
  "..",
  "scripts",
  "generate_socialdatax_skills.mjs"
);
const testFiles = existsSync(sourceGenerator)
  ? ["cli.test.mjs", "generate-skills.test.mjs", "public-package.test.mjs"]
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
