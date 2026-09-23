#!/usr/bin/env node
// Runs every src/**/*.test.ts, not a hand-maintained list (#271).
// Each file stays its own tsx-run script (assert + throw on failure);
// this just discovers them and reports one aggregate pass/fail summary.

import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = join(ROOT, "src");

function findTestFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      out.push(...findTestFiles(full));
    } else if (name.endsWith(".test.ts")) {
      out.push(full);
    }
  }
  return out;
}

const files = findTestFiles(SRC).sort();
if (files.length === 0) {
  console.error("No *.test.ts files found under src/.");
  process.exit(1);
}

let failed = 0;
for (const file of files) {
  const label = relative(ROOT, file);
  console.log(`\n▶ ${label}`);
  const result = spawnSync("npx", ["tsx", file], {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    failed++;
    console.error(`✘ ${label} exited ${result.status}`);
  }
}

console.log(`\n${files.length - failed}/${files.length} test files passed.`);
if (failed) {
  console.error(`${failed} test file(s) failed.`);
  process.exit(1);
}
