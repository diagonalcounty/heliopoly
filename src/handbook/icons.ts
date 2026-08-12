/**
 * Pixel art icons for Ops Manual (section tabs + topics + rockets).
 * Files live in /public/handbook/*.png (plus /ops-manual-icon.png for welcome).
 */

/** Section tab icons */
export const SECTION_ICONS: Record<string, string> = {
  lore: "/handbook/lore.png",
  gameplay: "/handbook/gameplay.png",
  "rival-pilots": "/handbook/rival-rockets.png",
  bodies: "/handbook/legend-planet.svg",
  "project-docs": "/handbook/badge-rocket.png",
};

/** Topic id → icon */
export const TOPIC_ICONS: Record<string, string> = {
  // Lore
  welcome: "/ops-manual-icon.png",
  ledger: "/handbook/cash-alert.png",
  path: "/handbook/lore.png",
  "stations-lore": "/handbook/legend-station.svg",

  // Gameplay
  "how-to-win": "/handbook/badge-rocket.png",
  glossary: "/handbook/gameplay.png",
  "turn-flow": "/handbook/dice-break.png",
  legend: "/handbook/badge-rocket.png",
  monopoly: "/handbook/vault-key.png",
  depots: "/handbook/fuel-depot.png",
  propellant: "/handbook/molecule.png",
  duel: "/handbook/duel-rockets.png",
  "ai-difficulty": "/handbook/rival-rockets.png",
  feral: "/handbook/rocket-debris.png",
  "not-in-build": "/handbook/lock.png",
  readme: "/handbook/badge-rocket.png",
  changelog: "/handbook/gameplay.png",

  // Economy / rent flavor (if topics added later)
  rent: "/handbook/cash-alert.png",

  // Bodies (planetoids)
  "planetoids-overview": "/handbook/legend-planet.svg",
  "body-earth": "/handbook/legend-planet.svg",
  "body-venus": "/handbook/legend-planet.svg",
  "body-mercury": "/handbook/legend-planet.svg",
  "body-elon": "/handbook/legend-station.svg",
  "body-mars": "/handbook/legend-planet.svg",
  "body-phobos": "/handbook/legend-moon-orange.svg",
  "body-deimos": "/handbook/legend-moon-orange.svg",
  "body-holst": "/handbook/legend-station.svg",
  "body-io": "/handbook/legend-moon-orange.svg",
  "body-europa": "/handbook/legend-moon-orange.svg",
  "body-ganymede": "/handbook/legend-moon-orange.svg",
  "body-callisto": "/handbook/legend-moon-orange.svg",
  "body-daktulios": "/handbook/legend-station.svg",
  "body-titan": "/handbook/legend-moon-yellow.svg",
  "body-enceladus": "/handbook/legend-moon-yellow.svg",
  "body-iapetus": "/handbook/legend-moon-yellow.svg",
  "body-mimas": "/handbook/legend-moon-yellow.svg",
  "body-rhea": "/handbook/legend-moon-yellow.svg",
  "body-dione": "/handbook/legend-moon-yellow.svg",
  "body-tethys": "/handbook/legend-moon-yellow.svg",

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
