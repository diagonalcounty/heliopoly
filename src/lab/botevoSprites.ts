import type { PieceId } from "./botEvolution";
import { eggTokenDataUrl, PIECE_IDS } from "./botEvolution";

/**
 * Legacy PNG imports removed from the playable path — Bot Evolution now uses
 * blank SVG shells from `eggTokenSvg` / `eggTokenDataUrl`.
 * Kept as SVG data-URLs so any leftover img consumers keep working.
 */
export const BOTEVO_SPRITES: Record<PieceId, string> = Object.fromEntries(
  PIECE_IDS.map((id) => [id, eggTokenDataUrl(id)]),
) as Record<PieceId, string>;
