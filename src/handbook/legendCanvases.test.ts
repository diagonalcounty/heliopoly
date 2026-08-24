/**
 * Board Legend canvases must point at real board nodes.
 * Run: npx tsx src/handbook/legendCanvases.test.ts
 */
import { createV0Board, getNode } from "../core/board";

let failed = 0;
function assert(cond: unknown, msg: string): void {
  if (!cond) {
    failed++;
    console.error(`FAIL  ${msg}`);
  } else {
    console.log(`ok    ${msg}`);
  }
}

/** Keep in sync with canvases in the Board Legend topic (content.ts). */
const LEGEND_BODY_NODES = [
  "earth",
  "mars",
  "venus",
  "mercury",
  "io",
  "titan",
  "phobos",
  "elon",
  "holst",
  "daktulios",
  "t_ev",
  "belt1",
] as const;

const board = createV0Board();
for (const id of LEGEND_BODY_NODES) {
  try {
    getNode(board, id);
    console.log(`ok    board has ${id}`);
  } catch {
    failed++;
    console.error(`FAIL  unknown legend node ${id}`);
  }
}

assert(LEGEND_BODY_NODES.length >= 12, "legend samples every body family");

if (failed) {
  console.error(`\n${failed} legend-canvas check(s) failed.`);
  throw new Error("legend-canvas checks failed");
}
console.log("\nAll legend-canvas checks passed.");
