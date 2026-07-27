/**
 * Pixel art icons for Ops Manual (section tabs + rocket civilopedia).
 * Files live in /public/handbook/*.png
 */

/** Section tab icons */
export const SECTION_ICONS: Record<string, string> = {
  lore: "/handbook/lore.png",
  gameplay: "/handbook/gameplay.png",
  "rival-pilots": "/handbook/rival-rockets.png",
};

/** Topic id → icon (rockets + key lore/gameplay covers). */
export const TOPIC_ICONS: Record<string, string> = {
  welcome: "/ops-manual-icon.png",
  path: "/handbook/lore.png",
  "how-to-win": "/handbook/gameplay.png",
  glossary: "/handbook/gameplay.png",
  "turn-flow": "/handbook/gameplay.png",
  legend: "/handbook/gameplay.png",
  monopoly: "/handbook/gameplay.png",
  depots: "/handbook/gameplay.png",
  propellant: "/handbook/gameplay.png",
  duel: "/handbook/von-braun.png",
  feral: "/handbook/gameplay.png",
  "not-in-build": "/handbook/gameplay.png",
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
