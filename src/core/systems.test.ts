/**
 * System definitions, monopolies and station hubs.
 * Run: npx tsx src/core/systems.test.ts
 */
import { createV0Board } from "./board";
import {
  SYSTEMS,
  STATION_HUB_IDS,
  hasStationNetwork,
  hasSystemMonopoly,
  isStationHub,
  stationHubsOwned,
  stationNetworkRentMult,
  systemOfGroup,
  type SystemId,
} from "./systems";

let failed = 0;
function assert(cond: unknown, msg: string): void {
  if (!cond) {
    failed++;
    console.error(`FAIL  ${msg}`);
  } else {
    console.log(`ok    ${msg}`);
  }
}

const ids = Object.keys(SYSTEMS) as SystemId[];

// --- SYSTEMS data integrity ---
assert(
  JSON.stringify([...ids].sort()) ===
    JSON.stringify(["jupiter", "mars", "mercury", "saturn", "venus"]),
  "SYSTEMS keys are mercury, venus, mars, jupiter, saturn",
);
assert(
  ids.every((k) => SYSTEMS[k].id === k),
  "each SYSTEMS[k].id === k",
);
{
  const want: Record<string, number> = {
    mercury: 1,
    venus: 1,
    mars: 4,
    jupiter: 5,
    saturn: 8,
  };
  for (const k of ids) {
    assert(
      SYSTEMS[k].deedIds.length === want[k],
      `${k} has ${want[k]} deeds`,
    );
  }
  const all = ids.flatMap((k) => SYSTEMS[k].deedIds);
  assert(all.length === 19, "19 deeds in total");
  assert(new Set(all).size === all.length, "no deed id appears in two systems");
}
{
  const board = createV0Board();
  const nodes = board.nodeList;
  const byId = board.nodes;
  for (const k of ids) {
    for (const d of SYSTEMS[k].deedIds) {
      const n = byId[d];
      assert(
        n !== undefined && n.group === k,
        `board node ${d} exists with group ${k}`,
      );
    }
  }
  const grouped = nodes.filter((n) => n.group && n.group in SYSTEMS);
  assert(grouped.length === 19, "19 board nodes belong to a system group");
  assert(
    grouped.every((n) =>
      SYSTEMS[n.group as SystemId].deedIds.includes(n.id),
    ),
    "every system-grouped board node is listed in that system's deedIds",
  );
}

// --- systemOfGroup ---
assert(systemOfGroup("mars")?.name === "Mars", 'systemOfGroup("mars") is Mars');
assert(systemOfGroup(undefined) === null, "systemOfGroup(undefined) is null");
assert(systemOfGroup("") === null, 'systemOfGroup("") is null');
assert(systemOfGroup("pluto") === null, 'systemOfGroup("pluto") is null');
assert(systemOfGroup("Mars") === null, 'systemOfGroup("Mars") is null (case-sensitive)');
// KNOWN GAP: plain-object lookup walks the prototype chain, so "toString"
// returns Object.prototype.toString instead of null. Asserted as current
// behaviour; do not read this as correct.
assert(
  typeof (systemOfGroup("toString") as unknown) === "function",
  'KNOWN GAP: systemOfGroup("toString") returns a function, not null',
);

// --- hasSystemMonopoly ---
assert(hasSystemMonopoly({ mercury: "p0" }, "p0", "mercury"), "p0 owns mercury");
assert(!hasSystemMonopoly({ mercury: "p0" }, "p1", "mercury"), "p1 does not own mercury");
{
  const mars = { elon: "p0", mars: "p0", phobos: "p0", deimos: "p0" };
  assert(hasSystemMonopoly(mars, "p0", "mars"), "mars: all four -> true");
  const { deimos: _d, ...three } = mars;
  assert(!hasSystemMonopoly(three, "p0", "mars"), "mars: deimos missing -> false");
  assert(
    !hasSystemMonopoly({ ...mars, deimos: "p1" }, "p0", "mars"),
    "mars: deimos owned by p1 -> false",
  );
  assert(
    hasSystemMonopoly({ ...mars, mercury: "p1", io: "p2" }, "p0", "mars"),
    "extra deeds outside the set do not change the result",
  );
}
{
  const own = (id: SystemId, who = "p0") =>
    Object.fromEntries(SYSTEMS[id].deedIds.map((d) => [d, who]));
  assert(hasSystemMonopoly(own("jupiter"), "p0", "jupiter"), "jupiter: all five -> true");
  assert(hasSystemMonopoly(own("saturn"), "p0", "saturn"), "saturn: all eight -> true");
  const seven = own("saturn");
  delete seven[SYSTEMS.saturn.deedIds[7]];
  assert(!hasSystemMonopoly(seven, "p0", "saturn"), "saturn: seven of eight -> false");
}
assert(
  ids.every((k) => !hasSystemMonopoly({}, "p0", k)),
  "empty owners -> false for every system",
);
{
  let threw: unknown = null;
  try {
    hasSystemMonopoly({}, "p0", "pluto" as SystemId);
  } catch (e) {
    threw = e;
  }
  assert(threw instanceof TypeError, "unknown system id throws TypeError");
}

// --- station hubs ---
assert(
  JSON.stringify(STATION_HUB_IDS) === JSON.stringify(["elon", "holst", "daktulios"]),
  "STATION_HUB_IDS = elon, holst, daktulios",
);
for (const h of ["elon", "holst", "daktulios"]) {
  assert(isStationHub(h), `isStationHub(${h})`);
}
for (const h of ["mars", "", "Elon"]) {
  assert(!isStationHub(h), `!isStationHub(${JSON.stringify(h)})`);
}

assert(stationHubsOwned({}, "p0") === 0, "stationHubsOwned: none -> 0");
assert(stationHubsOwned({ elon: "p0" }, "p0") === 1, "stationHubsOwned: elon -> 1");
assert(
  stationHubsOwned({ elon: "p0", holst: "p0" }, "p0") === 2,
  "stationHubsOwned: elon + holst -> 2",
);
const all3 = { elon: "p0", holst: "p0", daktulios: "p0" };
assert(stationHubsOwned(all3, "p0") === 3, "stationHubsOwned: all three -> 3");
assert(
  stationHubsOwned({ elon: "p1", holst: "p1", daktulios: "p1" }, "p0") === 0,
  "stationHubsOwned: hubs owned by p1 do not count for p0",
);

assert(!hasStationNetwork({}, "p0"), "hasStationNetwork: 0 hubs -> false");
assert(!hasStationNetwork({ elon: "p0" }, "p0"), "hasStationNetwork: 1 hub -> false");
assert(
  !hasStationNetwork({ elon: "p0", holst: "p0" }, "p0"),
  "hasStationNetwork: 2 hubs -> false",
);
assert(hasStationNetwork(all3, "p0"), "hasStationNetwork: 3 hubs -> true");

// --- stationNetworkRentMult ---
assert(stationNetworkRentMult({}, "p0", "elon") === 1, "rent mult: 0 hubs -> 1");
assert(stationNetworkRentMult({ elon: "p0" }, "p0", "elon") === 1, "rent mult: 1 hub -> 1");
assert(
  stationNetworkRentMult({ elon: "p0", holst: "p0" }, "p0", "elon") === 2,
  "rent mult: 2 hubs -> 2",
);
assert(stationNetworkRentMult(all3, "p0", "elon") === 4, "rent mult: 3 hubs -> 4");
assert(
  stationNetworkRentMult(all3, "p0", "mars") === 1,
  "rent mult: non-hub node -> 1 even with all three hubs",
);
assert(
  stationNetworkRentMult({ elon: "p1", holst: "p0", daktulios: "p0" }, "p0", "elon") === 2,
  "rent mult: counts only the ownerId passed (p1 hub, p0 other two -> 2)",
);

if (failed) {
  throw new Error(`${failed} assertion(s) failed`);
}
console.log("\nAll systems checks passed.");
