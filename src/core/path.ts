import { getNode } from "./board";
import type { Board, MoveDirection } from "./types";

/** One hop along the directed edge. */
export function stepAlong(board: Board, fromId: string): string {
  const node = getNode(board, fromId);
  const nextId = node.next[0];
  return nextId ?? fromId;
}

/**
 * One hop reverse along the Mainline (unique predecessor on the circuit).
 * Returns `null` if no predecessor (should not happen on the closed path).
 */
export function stepBackAlong(board: Board, fromId: string): string | null {
  for (const n of Object.values(board.nodes)) {
    if (n.next.includes(fromId)) return n.id;
  }
  return null;
}

/** One hop in travel direction (forward = next, backward = unique pred). */
export function stepInDirection(
  board: Board,
  fromId: string,
  direction: MoveDirection,
): string {
  if (direction === "forward") return stepAlong(board, fromId);
  return stepBackAlong(board, fromId) ?? fromId;
}

export interface MovePath {
  /** Resting spaces after each die step (length === steps). */
  stops: string[];
  /** Every node touched, including gravity pass-throughs (for animation). */
  frames: PathFrame[];
  /** Final resting node. */
  endId: string;
}

export interface PathFrame {
  nodeId: string;
  /** Gravity well flash — shorter dwell in UI. */
  passThrough: boolean;
}

/**
 * Walk the board the same way rules movement does:
 * each die step advances one edge; landing on gravity slides one more edge
 * (not counting as the rest stop for that step's destination after slide).
 * `direction` "backward" walks the Mainline reverse (palindrome #47).
 */
export function walkMovePath(
  board: Board,
  fromId: string,
  steps: number,
  direction: MoveDirection = "forward",
): MovePath {
  let pos = fromId;
  const stops: string[] = [];
  const frames: PathFrame[] = [];

  for (let i = 0; i < steps; i++) {
    pos = stepInDirection(board, pos, direction);
    let node = getNode(board, pos);
    if (node.kind === "gravity") {
      frames.push({ nodeId: pos, passThrough: true });
      pos = stepInDirection(board, pos, direction);
      node = getNode(board, pos);
    }
    frames.push({ nodeId: pos, passThrough: false });
    stops.push(pos);
  }

  return {
    stops,
    frames,
    endId: stops.length ? stops[stops.length - 1] : fromId,
  };
}
