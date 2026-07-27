/**
 * Pixel art icons for Ops Manual (section tabs + topics + rockets).
 * Files live in /public/handbook/*.png (plus /ops-manual-icon.png for welcome).
 */

/** Section tab icons */
export const SECTION_ICONS: Record<string, string> = {
  lore: "/handbook/lore.png",
  gameplay: "/handbook/gameplay.png",
  "rival-pilots": "/handbook/rival-rockets.png",
};

/** Topic id → icon */
export const TOPIC_ICONS: Record<string, string> = {
  // Lore
  welcome: "/ops-manual-icon.png",
  path: "/handbook/lore.png",

  // Gameplay
  "how-to-win": "/handbook/badge-rocket.png",
  glossary: "/handbook/gameplay.png",
  "turn-flow": "/handbook/dice-break.png",
  legend: "/handbook/badge-rocket.png",
  monopoly: "/handbook/vault-key.png",
  depots: "/handbook/fuel-depot.png",
  propellant: "/handbook/molecule.png",
  duel: "/handbook/duel-rockets.png",
  feral: "/handbook/rocket-debris.png",
  "not-in-build": "/handbook/lock.png",

  // Economy / rent flavor (if topics added later)
  rent: "/handbook/cash-alert.png",

  // Rival rockets
  "rival-pilots-overview": "/handbook/rival-rockets.png",
  "pilot-recorde": "/handbook/recorde.png",
  "pilot-k127": "/handbook/k127.png",
  "pilot-turing": "/handbook/turing.png",
  "pilot-ada": "/handbook/ada.png",
  "pilot-sagan": "/handbook/sagan.png",
  "pilot-asimov": "/handbook/asimov.png",
  "pilot-clarke": "/handbook/clarke.png",
  "pilot-goddard": "/handbook/goddard.png",
  "pilot-von-braun": "/handbook/von-braun.png",
};

export function sectionIcon(sectionId: string): string | undefined {
  return SECTION_ICONS[sectionId];
}

export function topicIcon(topicId: string): string | undefined {
  return TOPIC_ICONS[topicId];
}
