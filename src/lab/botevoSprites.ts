import type { PieceId } from "./botEvolution";
import dash from "./botevo-art/dash.png";
import i from "./botevo-art/i.png";
import lEs from "./botevo-art/l-es.png";
import lNe from "./botevo-art/l-ne.png";
import lSw from "./botevo-art/l-sw.png";
import lWn from "./botevo-art/l-wn.png";
import plus from "./botevo-art/plus.png";
import tE from "./botevo-art/t-e.png";
import tN from "./botevo-art/t-n.png";
import tS from "./botevo-art/t-s.png";
import tW from "./botevo-art/t-w.png";

/** Vite-hashed PNGs so iPhone loopback cannot cache cream tokens. */
export const BOTEVO_SPRITES: Record<PieceId, string> = {
  plus,
  i,
  dash,
  "l-ne": lNe,
  "l-es": lEs,
  "l-sw": lSw,
  "l-wn": lWn,
  "t-n": tN,
  "t-e": tE,
  "t-s": tS,
  "t-w": tW,
};
