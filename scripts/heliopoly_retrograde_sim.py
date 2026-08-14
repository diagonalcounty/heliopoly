#!/usr/bin/env python3
"""Heliopoly retrograde simulation.

Faithful Python port of the Heliopoly rules engine (src/core/*.ts) and the
heuristic AI (src/core/agents.ts) so we can statistically test whether flying
the Mainline retrograde (the hidden palindrome-callsign unlock, CHANGELOG #47)
is an advantage. Direction is chosen once before a pilot's first Move and is
then permanent for the whole charter.

Experiments (G games of N players each):
  all-prograde   every rocket prograde-locked (no palindrome ability)
  all-retrograde every rocket retrograde-locked
  all-choice     every rocket palindrome; AI picks direction via its heuristic
  mixed          half prograde-locked vs half retrograde-locked (seats swapped
                 and combined to cancel seat-order effects)
  pal-vs-not     half non-palindrome (prograde) vs half palindrome (AI choice)

Usage:
  python3 scripts/heliopoly_retrograde_sim.py --games 10000 --players 4
"""

import argparse
import math
import random
import time
from collections import Counter
from concurrent.futures import ProcessPoolExecutor

# ---------------------------------------------------------------------------
# Board (order matches createV0Board): (id, kind, price, rent, group, gravity,
# refuel, landing bonus)
# ---------------------------------------------------------------------------
BOARD = [
    ("earth", "planet", 0, 0, None, 3, "free", 400),
    ("t_ev", "space", 0, 0, None, 0, "none", 0),
    ("venus", "planet", 500, 70, "venus", 3, "station", 0),
    ("t_vm", "space", 0, 0, None, 0, "none", 0),
    ("mercury", "planet", 400, 60, "mercury", 2, "station", 0),
    ("t_mm", "space", 0, 0, None, 0, "none", 0),
    ("elon", "federation", 550, 75, "mars", 0, "paid", 0),
    ("mars", "planet", 600, 85, "mars", 2, "station", 0),
    ("phobos", "moon", 250, 30, "mars", 1, "station", 0),
    ("deimos", "moon", 250, 30, "mars", 1, "station", 0),
    ("t_mb", "space", 0, 0, None, 0, "none", 0),
    ("belt1", "space", 0, 0, None, 0, "none", 0),
    ("belt2", "space", 0, 0, None, 0, "none", 0),
    ("belt3", "space", 0, 0, None, 0, "none", 0),
    ("belt4", "space", 0, 0, None, 0, "none", 0),
    ("belt5", "space", 0, 0, None, 0, "none", 0),
    ("belt6", "space", 0, 0, None, 0, "none", 0),
    ("holst", "federation", 700, 100, "jupiter", 0, "paid", 0),
    ("j_b1", "space", 0, 0, None, 0, "none", 0),
    ("io", "moon", 350, 45, "jupiter", 2, "station", 0),
    ("j_b2", "space", 0, 0, None, 0, "none", 0),
    ("europa", "moon", 400, 55, "jupiter", 2, "station", 0),
    ("j_b3", "space", 0, 0, None, 0, "none", 0),
    ("ganymede", "moon", 550, 90, "jupiter", 2, "station", 0),
    ("j_b4", "space", 0, 0, None, 0, "none", 0),
    ("callisto", "moon", 500, 75, "jupiter", 2, "station", 0),
    ("j_b5", "space", 0, 0, None, 0, "none", 0),
    ("daktulios", "federation", 800, 120, "saturn", 0, "paid", 0),
    ("titan", "moon", 600, 95, "saturn", 2, "station", 0),
    ("s_b1", "space", 0, 0, None, 0, "none", 0),
    ("enceladus", "moon", 320, 40, "saturn", 1, "station", 0),
    ("s_b2", "space", 0, 0, None, 0, "none", 0),
    ("iapetus", "moon", 380, 50, "saturn", 1, "station", 0),
    ("s_b3", "space", 0, 0, None, 0, "none", 0),
    ("mimas", "moon", 280, 35, "saturn", 1, "station", 0),
    ("s_b4", "space", 0, 0, None, 0, "none", 0),
    ("rhea", "moon", 420, 60, "saturn", 1, "station", 0),
    ("s_b5", "space", 0, 0, None, 0, "none", 0),
    ("dione", "moon", 400, 55, "saturn", 1, "station", 0),
    ("s_b6", "space", 0, 0, None, 0, "none", 0),
    ("tethys", "moon", 360, 48, "saturn", 1, "station", 0),
    ("t_se", "space", 0, 0, None, 0, "none", 0),
]

N = len(BOARD)
IDS = [b[0] for b in BOARD]
IDX = {b[0]: i for i, b in enumerate(BOARD)}
EARTH = IDX["earth"]
KIND = [b[1] for b in BOARD]
PRICE = [b[2] for b in BOARD]
RENT = [b[3] for b in BOARD]
GROUP = [b[4] for b in BOARD]
GRAV = [b[5] for b in BOARD]
REFUEL = [b[6] for b in BOARD]
BONUS = [b[7] for b in BOARD]
NEXT = [(i + 1) % N for i in range(N)]
PREV = [(i - 1) % N for i in range(N)]

SYS = {
    "venus": [IDX["venus"]],
    "mercury": [IDX["mercury"]],
    "mars": [IDX["elon"], IDX["mars"], IDX["phobos"], IDX["deimos"]],
    "jupiter": [IDX["holst"], IDX["io"], IDX["europa"], IDX["ganymede"], IDX["callisto"]],
    "saturn": [IDX["daktulios"], IDX["titan"], IDX["enceladus"], IDX["iapetus"],
               IDX["mimas"], IDX["rhea"], IDX["dione"], IDX["tethys"]],
}
HUBS = {IDX["elon"], IDX["holst"], IDX["daktulios"]}
GUSHER = {
    "methane": {IDX["titan"], IDX["enceladus"]},
    "hydrogen": {IDX["enceladus"], IDX["mars"], IDX["europa"], IDX["ganymede"]},
}

START_CASH = 1500
START_FUEL = 20
STATIONS_EACH = 3
MAX_FUEL = 25
MAX_TURNS = 3000
PARK_THRESHOLD = 5
PARK_BASE = 0.5
GUSHER_BONUS = 750
MONOLITH_BONUS = 300
EARTH_LAND = 400
EARTH_PASS = 200
EARTH_PER_ROT = 10
EARTH_DECADE = 1000

GRAVITY_LEAVE_MULT = {0: 0, 1: 0.75, 2: 1.0, 3: 1.4, 4: 1.85}
PROPEL = {"methane": (1.0, 0.0), "hydrogen": (0.85, 0.1)}  # (leaveMult, leaveRisk)

# ---------------------------------------------------------------------------
# Rules
# ---------------------------------------------------------------------------


def leave_burn(node, steps, prop):
    gmult = GRAVITY_LEAVE_MULT[GRAV[node]]
    if gmult <= 0 or steps <= 0:
        return 0
    pmult = PROPEL[prop][0]
    return max(1, math.ceil(steps * gmult * pmult))


def depot_place_cost(depots_placed, price):
    if depots_placed <= 0:
        return 0
    return math.floor(max(0, price) * 0.1)


def park_feral_chance(park_count):
    if park_count < PARK_THRESHOLD:
        return 0
    return min(1.0, PARK_BASE * (2 ** (park_count - PARK_THRESHOLD)))


class Pilot:
    __slots__ = (
        "id", "cash", "fuel", "pos", "propellant", "properties", "stations_in_hand",
        "eliminated", "skip_turns", "rent_waivers", "circuit_active", "circuits",
        "rolled", "moved", "park_count", "pending_leak", "monolith", "free_break",
        "warps", "depots_placed", "can_bidir", "move_dir", "dir_locked",
        "direction_chosen", "elim_round", "elim_reason", "claims_bought",
    )

    def __init__(self, pid, propellant, can_bidir):
        self.id = pid
        self.cash = START_CASH
        self.fuel = START_FUEL
        self.pos = EARTH
        self.propellant = propellant
        self.properties = []
        self.stations_in_hand = STATIONS_EACH
        self.eliminated = False
        self.skip_turns = 0
        self.rent_waivers = []
        self.circuit_active = False
        self.circuits = 0
        self.rolled = False
        self.moved = False
        self.park_count = 0
        self.pending_leak = False
        self.monolith = False
        self.free_break = False
        self.warps = 0
        self.depots_placed = 0
        self.can_bidir = can_bidir
        self.move_dir = "forward"
        self.dir_locked = False
        self.direction_chosen = None
        self.elim_round = None
        self.elim_reason = None
        self.claims_bought = 0


class Game:
    __slots__ = (
        "rng", "event_rng", "players", "owners", "stations", "current_idx",
        "phase", "round", "game_turn", "last_roll", "break_spaces", "dice_totals",
        "pending_duel", "encounter_mem", "board_rotations", "winner_id",
        "gusher_paid", "timed", "dir_policy",
    )

    def __init__(self, seed, dir_policy):
        self.rng = random.Random(seed)
        self.event_rng = random.Random((seed ^ 0x5EED) & 0xFFFFFFFF)
        self.players = []
        for i, pol in enumerate(dir_policy):
            prop = "methane" if ((seed + i * 17) & 1) == 0 else "hydrogen"
            can_bidir = pol in ("retrograde", "choice")
            self.players.append(Pilot(i, prop, can_bidir))
        self.owners = {}
        self.stations = set()
        self.current_idx = 0
        self.phase = "await_action"
        self.round = 1
        self.game_turn = 0
        self.last_roll = None
        self.break_spaces = 0
        self.dice_totals = []
        self.pending_duel = None
        self.encounter_mem = {}
        self.board_rotations = 0
        self.winner_id = None
        self.gusher_paid = set()
        self.timed = {"last_round": 0, "since": 0, "chance": 0.0, "fired": []}
        self.dir_policy = list(dir_policy)
        self.game_turn += 1
        process_timed_events(self)


def living(g):
    return [i for i, p in enumerate(g.players) if not p.eliminated]


def current(g):
    return g.players[g.current_idx]


def mean_dice(g):
    if not g.dice_totals:
        return 7.0
    return sum(g.dice_totals) / len(g.dice_totals)


def station_net_mult(g, owner, node):
    if node not in HUBS:
        return 1
    n = sum(1 for h in HUBS if g.owners.get(h) == owner)
    if n <= 1:
        return 1
    if n == 2:
        return 2
    return 4


def has_monopoly(g, owner, node):
    sys = SYS.get(GROUP[node])
    if sys is None:
        return False
    return all(g.owners.get(d) == owner for d in sys)


def rent_due(g, node, owner):
    base = RENT[node]
    mult = 2 if has_monopoly(g, owner, node) else 1
    hub = station_net_mult(g, owner, node)
    depot = 1.5 if node in g.stations else 1
    return int(base * mult * hub * depot)


def net_worth(g, p):
    deeds = sum(PRICE[d] for d in p.properties)
    placed = sum(1 for d in p.properties if d in g.stations)
    return p.cash + deeds + placed * 500 + p.stations_in_hand * 500


def refuel_info(g, pi):
    p = g.players[pi]
    room = MAX_FUEL - p.fuel
    if room <= 0:
        return (False, 0, 0)
    kind = REFUEL[p.pos]
    if kind == "free" or p.pos == EARTH:
        return (True, room, 0)
    if kind == "paid":
        owner = g.owners.get(p.pos)
        if owner is not None and owner != pi:
            cost = 50
            afford = int(p.cash // cost)
            return (afford > 0, min(room, afford), cost)
        cost = 0 if owner == pi else 25
        if cost > 0:
            afford = int(p.cash // cost)
            return (afford > 0, min(room, afford), cost)
        return (True, room, 0)
    if kind == "station":
        owner = g.owners.get(p.pos)
        has = p.pos in g.stations
        if owner == pi and has:
            return (True, room, 0)
        if owner is not None and owner != pi and has:
            cost = 40
            afford = int(p.cash // cost)
            return (afford > 0, min(room, afford), cost)
    return (False, 0, 0)


def can_refuel_at_all(g, p):
    kind = REFUEL[p.pos]
    if kind == "free" or p.pos == EARTH:
        return True
    if kind == "paid":
        return True
    if kind == "station" and p.pos in g.stations:
        return True
    return False


def legal_actions(g):
    p = current(g)
    empty = {
        "refuel": False, "refuel_max": 0, "refuel_cost": 0, "roll": False,
        "move": False, "max_break": 0, "sell": False, "sell_value": 0,
        "sell_node": None, "place_station": False, "place_cost": 0,
        "end_turn": False, "buy": False, "buy_price": 0, "warp": False,
        "set_direction": False,
    }
    if g.phase == "game_over" or p.eliminated or g.phase == "await_duel":
        return empty
    ni = p.pos
    fuel = refuel_info(g, g.current_idx)
    owns_here = g.owners.get(ni) == g.current_idx
    depot_site = (
        owns_here
        and KIND[ni] in ("planet", "moon")
        and ni not in g.stations
        and p.stations_in_hand > 0
    )
    place_cost = depot_place_cost(p.depots_placed, PRICE[ni]) if depot_site else 0
    can_station = depot_site and p.cash >= place_cost
    sell_value = int(PRICE[ni] // 2) if owns_here and PRICE[ni] > 0 else 0
    can_sell = owns_here and PRICE[ni] > 0 and sell_value > 0

    if g.phase == "await_move" and g.last_roll is not None:
        max_break = g.last_roll["total"]
        br = min(max(0, g.break_spaces), max_break)
        b_cost = 0 if (p.free_break and br > 0) else 0.5 * br
        can_afford = p.fuel + 1e-9 >= b_cost
        return {
            **empty, "move": can_afford, "max_break": max_break,
            "sell": can_sell, "sell_value": sell_value, "sell_node": ni,
            "place_station": can_station, "place_cost": place_cost,
            "set_direction": p.can_bidir and not p.dir_locked,
        }

    if g.phase == "await_action":
        return {
            **empty, "refuel": fuel[0] and fuel[1] > 0, "refuel_max": fuel[1],
            "refuel_cost": fuel[2], "roll": True, "sell": can_sell,
            "sell_value": sell_value, "sell_node": ni,
            "place_station": can_station, "place_cost": place_cost,
            "end_turn": True, "warp": p.warps > 0,
            "set_direction": p.can_bidir and not p.dir_locked,
        }

    unowned = PRICE[ni] > 0 and ni not in g.owners
    can_buy = unowned and p.cash >= PRICE[ni]
    return {
        **empty, "refuel": fuel[0] and fuel[1] > 0, "refuel_max": fuel[1],
        "refuel_cost": fuel[2], "sell": can_sell, "sell_value": sell_value,
        "sell_node": ni, "place_station": can_station, "place_cost": place_cost,
        "end_turn": True, "buy": can_buy, "buy_price": PRICE[ni],
    }


def pay_earth(g, p, kind):
    base = EARTH_LAND if kind == "land" else EARTH_PASS
    amt = base + EARTH_PER_ROT * max(0, p.circuits)
    p.cash += amt
    if p.monolith:
        p.monolith = False
        p.cash += MONOLITH_BONUS


def on_circuit_complete(g, p):
    g.board_rotations += 1
    p.circuit_active = False
    p.circuits += 1
    if p.circuits > 0 and p.circuits % 10 == 0:
        p.cash += EARTH_DECADE
    p.stations_in_hand += STATIONS_EACH
    p.depots_placed = 0


def apply_landing_leak(g, p, qualifies):
    risk = PROPEL[p.propellant][1]
    if risk <= 0:
        return
    due = p.pending_leak
    if not due:
        if g.rng.random() > risk:
            return
        due = True
    if not qualifies:
        p.pending_leak = True
        return
    p.pending_leak = False
    if p.propellant == "hydrogen":
        loss = max(1, int(p.fuel // 2))
    else:
        loss = min(p.fuel, g.rng.randint(1, 2))
    if loss <= 0 or p.fuel <= 0:
        return
    p.fuel -= loss
    if p.propellant == "hydrogen":
        p.skip_turns += 1


def eliminate(g, p, reason):
    if p.eliminated:
        return
    p.eliminated = True
    p.elim_round = g.round
    p.elim_reason = reason
    for nd in p.properties:
        g.owners.pop(nd, None)
        g.stations.discard(nd)
    p.properties = []
    p.cash = 0
    alive = living(g)
    if len(alive) == 1:
        g.winner_id = alive[0]
        g.phase = "game_over"
    elif len(alive) == 0:
        g.phase = "game_over"
    if g.phase != "game_over" and g.players[g.current_idx].id == p.id:
        advance_turn(g)


def advance_turn(g):
    if g.phase == "game_over":
        return
    current(g).free_break = False
    n = len(g.players)
    idx = (g.current_idx + 1) % n
    if idx == 0:
        g.round += 1
    guard = 0
    while g.players[idx].eliminated and guard <= n + 1:
        idx = (idx + 1) % n
        guard += 1
    g.current_idx = idx
    g.phase = "await_action"
    g.last_roll = None
    g.break_spaces = 0
    g.pending_duel = None
    g.game_turn += 1
    process_timed_events(g)
    p = g.players[idx]
    if p.skip_turns > 0:
        p.skip_turns -= 1
        p.moved = False
        apply_parking_tick(g, p)
        advance_turn(g)
        return
    p.rolled = False
    p.moved = False


def process_timed_events(g):
    te = g.timed
    if te["last_round"] == g.round:
        return
    te["last_round"] = g.round
    te["since"] += 1
    remaining = [e for e in ("monolith", "mms", "kings") if e not in te["fired"]]
    if not remaining:
        return
    if te["since"] < 5:
        return
    if te["since"] == 5:
        te["chance"] = 0.5
    else:
        c = te["chance"] if te["chance"] > 0 else 0.5
        te["chance"] = c + (1 - c) / 2
    if g.event_rng.random() >= te["chance"]:
        return
    ev = remaining[int(g.event_rng.random() * len(remaining))]
    te["fired"].append(ev)
    for p in g.players:
        if p.eliminated:
            continue
        if ev == "monolith":
            p.monolith = True
        elif ev == "mms":
            p.free_break = True
        else:
            p.warps += 1
    te["since"] = 0
    te["chance"] = 0


def apply_parking_tick(g, p):
    p.park_count += 1
    chance = park_feral_chance(p.park_count)
    if chance <= 0 or not p.properties:
        return
    for nd in list(p.properties):
        if g.rng.random() >= chance:
            continue
        p.properties.remove(nd)
        g.owners.pop(nd, None)
        g.stations.discard(nd)


def roll_dice(g):
    d1 = g.rng.randint(1, 6)
    d2 = g.rng.randint(1, 6)
    total = d1 + d2
    g.dice_totals.append(total)
    return total


def pick_defender(g, node, challenger):
    others = [
        i for i, x in enumerate(g.players)
        if not x.eliminated and x.pos == node and i != challenger
    ]
    if not others:
        return None
    mem = g.encounter_mem.get(node)
    if mem is not None:
        if mem.get("last") in others:
            return mem["last"]
        if mem.get("champ") in others:
            return mem["champ"]
    return others[0]


def begin_duel(g, challenger, defender, node):
    g.pending_duel = {
        "node": node, "challenger": challenger, "defender": defender,
        "cs": None, "ds": None, "cr": None, "dr": None,
    }
    g.phase = "await_duel"
    g.current_idx = challenger


def knock_back(g, p):
    if p.eliminated:
        return
    if p.pos == EARTH:
        return
    back = PREV[p.pos]
    if back == p.pos:
        return
    p.pos = back
    apply_knockback_landing(g, p)


def apply_knockback_landing(g, p):
    if p.eliminated or g.phase == "game_over":
        return
    ni = p.pos
    if ni == EARTH:
        pay_earth(g, p, "land")
        if p.circuit_active:
            on_circuit_complete(g, p)
    elif BONUS[ni] > 0:
        p.cash += BONUS[ni]
    apply_landing_leak(g, p, KIND[ni] in ("planet", "moon"))
    owner = g.owners.get(ni)
    pi = g.players.index(p)
    if owner is not None and owner != pi and PRICE[ni] > 0:
        owner_p = g.players[owner]
        if owner_p.eliminated:
            return
        if owner in p.rent_waivers:
            p.rent_waivers.remove(owner)
        else:
            rent = rent_due(g, ni, owner)
            if p.cash >= rent:
                p.cash -= rent
                owner_p.cash += rent
            else:
                owner_p.cash += p.cash
                eliminate(g, p, "bankruptcy")


def resolve_duel_if_complete(g):
    d = g.pending_duel
    if d is None:
        return
    if d["cs"] is None or d["ds"] is None or d["cr"] is None or d["dr"] is None:
        return
    ct = d["cr"]
    dt = d["dr"]
    mean = mean_dice(g)
    winner = loser = None
    if d["cs"] == "low" and d["ds"] == "low":
        if ct < dt:
            winner, loser = d["challenger"], d["defender"]
        elif dt < ct:
            winner, loser = d["defender"], d["challenger"]
    elif d["cs"] == "high" and d["ds"] == "high":
        if ct > dt:
            winner, loser = d["challenger"], d["defender"]
        elif dt > ct:
            winner, loser = d["defender"], d["challenger"]
    else:
        cd = abs(ct - mean)
        dd = abs(dt - mean)
        if cd < dd:
            winner, loser = d["challenger"], d["defender"]
        elif dd < cd:
            winner, loser = d["defender"], d["challenger"]
    mem = g.encounter_mem.setdefault(d["node"], {})
    mem["last"] = d["challenger"]
    if winner is None:
        mem["champ"] = None
        g.pending_duel = None
        g.phase = "await_post_land"
        return
    mem["champ"] = winner
    lp = g.players[loser]
    wp = g.players[winner]
    lp.skip_turns += 1
    if loser not in wp.rent_waivers:
        wp.rent_waivers.append(loser)
    knock_back(g, lp)
    g.pending_duel = None
    g.phase = "await_post_land"


def auto_duel_ai(g):
    d = g.pending_duel
    if d is None:
        return
    c = g.players[d["challenger"]]
    df = g.players[d["defender"]]
    if d["cs"] is None:
        d["cs"] = "high" if c.fuel > 12 else "low"
    if d["ds"] is None:
        d["ds"] = "high" if df.fuel > 12 else "low"
    if d["cs"] is not None and d["ds"] is not None:
        if d["cr"] is None:
            d["cr"] = roll_dice(g)
        if d["dr"] is None:
            d["dr"] = roll_dice(g)
    resolve_duel_if_complete(g)


def resolve_duel_fully(g):
    guard = 0
    while g.phase == "await_duel" and g.pending_duel is not None and guard < 20:
        d = g.pending_duel
        before = (d["cs"], d["ds"], d["cr"], d["dr"])
        auto_duel_ai(g)
        if g.phase != "await_duel":
            break
        d = g.pending_duel
        if d is None:
            break
        after = (d["cs"], d["ds"], d["cr"], d["dr"])
        if after == before:
            break
        guard += 1


def resolve_landing(g, stayed):
    p = current(g)
    ni = p.pos
    if not stayed:
        apply_landing_leak(g, p, KIND[ni] in ("planet", "moon"))
    if not stayed and ni == EARTH:
        pay_earth(g, p, "land")
    elif BONUS[ni] and not stayed:
        p.cash += BONUS[ni]
    owner = g.owners.get(ni)
    if owner is not None and owner != g.current_idx and PRICE[ni] > 0:
        op = g.players[owner]
        if owner in p.rent_waivers:
            p.rent_waivers.remove(owner)
        else:
            rent = rent_due(g, ni, owner)
            if p.cash >= rent:
                p.cash -= rent
                op.cash += rent
            else:
                op.cash += p.cash
                eliminate(g, p, "bankruptcy")
                return
    if KIND[ni] in ("planet", "moon") and p.fuel <= 1 and not can_refuel_at_all(g, p):
        eliminate(g, p, "stranded")
        return
    if g.phase == "game_over":
        return
    if not stayed and KIND[ni] == "space":
        defender = pick_defender(g, ni, g.current_idx)
        if defender is not None:
            begin_duel(g, g.current_idx, defender, ni)
            return
    g.phase = "await_post_land"


def move_player(g, steps):
    p = current(g)
    ni = p.pos
    burn = leave_burn(ni, steps, p.propellant)
    if burn > 0:
        if p.fuel < burn:
            resolve_landing(g, True)
            return
        p.fuel -= burn
    if ni == EARTH:
        p.circuit_active = True
    if p.can_bidir and not p.dir_locked:
        p.dir_locked = True
    step_fn = NEXT if p.move_dir == "forward" else PREV
    stops = []
    pos = ni
    for _ in range(steps):
        pos = step_fn[pos]
        stops.append(pos)
    if len(stops) > 1:
        for s in stops[:-1]:
            if s == EARTH:
                pay_earth(g, p, "pass")
    p.pos = stops[-1]
    resolve_landing(g, False)
    if p.pos == EARTH and p.circuit_active:
        on_circuit_complete(g, p)


def do_move(g):
    p = current(g)
    if g.phase != "await_move" or g.last_roll is None:
        return
    total = g.last_roll["total"]
    br = min(g.break_spaces, total)
    used_free = br > 0 and p.free_break
    cost = 0 if used_free else 0.5 * br
    if p.fuel + 1e-9 < cost:
        return
    if br > 0:
        if used_free:
            p.free_break = False
        p.fuel -= cost
        p.fuel = round(p.fuel * 2) / 2
    steps = total - br
    g.break_spaces = 0
    if steps <= 0:
        g.phase = "await_post_land"
        return
    frm = p.pos
    move_player(g, steps)
    if p.pos != frm:
        p.moved = True
    if g.pending_duel is not None:
        auto_duel_ai(g)


def do_refuel(g, amount):
    allowed, mx, cper = refuel_info(g, g.current_idx)
    p = current(g)
    qty = max(0, min(amount, mx))
    if not allowed or qty <= 0:
        return
    cost = qty * cper
    if p.cash < cost:
        return
    p.cash -= cost
    p.fuel += qty
    if cost > 0:
        owner = g.owners.get(p.pos)
        if owner is not None and owner != g.current_idx:
            g.players[owner].cash += cost


def do_buy(g):
    p = current(g)
    legal = legal_actions(g)
    if not legal["buy"]:
        return
    ni = p.pos
    p.cash -= PRICE[ni]
    g.owners[ni] = g.current_idx
    p.properties.append(ni)
    p.claims_bought += 1


def do_sell(g, node):
    p = current(g)
    if g.owners.get(node) != g.current_idx or PRICE[node] <= 0:
        return
    value = PRICE[node] // 2
    p.cash += value
    p.properties.remove(node)
    g.stations.discard(node)
    g.owners.pop(node, None)


def do_place_station(g):
    p = current(g)
    legal = legal_actions(g)
    if not legal["place_station"]:
        return
    ni = p.pos
    if KIND[ni] not in ("planet", "moon"):
        return
    cost = depot_place_cost(p.depots_placed, PRICE[ni])
    if p.cash < cost:
        return
    if cost > 0:
        p.cash -= cost
    p.stations_in_hand -= 1
    p.depots_placed += 1
    g.stations.add(ni)
    if ni in GUSHER[p.propellant] and ni not in g.gusher_paid:
        g.gusher_paid.add(ni)
        p.cash += GUSHER_BONUS


def do_set_direction(g, direction):
    p = current(g)
    if not p.can_bidir or p.dir_locked:
        return
    if direction == p.move_dir:
        return
    p.move_dir = direction
    if p.direction_chosen is None:
        p.direction_chosen = direction


def do_warp(g, destination):
    p = current(g)
    if g.phase != "await_action" or p.warps <= 0:
        return
    if destination == p.pos:
        return
    p.warps -= 1
    if p.pos == EARTH:
        p.circuit_active = True
    p.pos = destination
    p.rolled = True
    p.moved = True
    g.last_roll = None
    g.break_spaces = 0
    resolve_landing(g, False)
    if p.pos == EARTH and p.circuit_active:
        on_circuit_complete(g, p)
    if g.pending_duel is not None:
        auto_duel_ai(g)


def apply_action(g, action):
    if g.phase == "game_over":
        return
    if g.phase == "await_duel":
        auto_duel_ai(g)
        if g.phase != "await_duel":
            return
    p = current(g)
    if p.eliminated and action["type"] not in ("duel_stance", "duel_roll"):
        advance_turn(g)
        return
    t = action["type"]
    if t == "refuel":
        if g.phase in ("await_action", "await_post_land"):
            do_refuel(g, action["amount"])
    elif t == "warp":
        if g.phase == "await_action":
            do_warp(g, action["destination"])
    elif t == "roll":
        if g.phase != "await_action":
            return
        g.last_roll = {"total": roll_dice(g)}
        g.break_spaces = 0
        p.rolled = True
        g.phase = "await_move"
    elif t == "set_direction":
        if g.phase in ("await_action", "await_move", "await_post_land"):
            do_set_direction(g, action["direction"])
    elif t == "set_break":
        if g.phase == "await_move" and g.last_roll is not None:
            g.break_spaces = min(g.last_roll["total"], max(0, int(action["spaces"])))
    elif t == "move":
        do_move(g)
    elif t == "buy":
        if g.phase == "await_post_land":
            do_buy(g)
    elif t == "sell":
        if g.phase in ("await_action", "await_move", "await_post_land"):
            do_sell(g, action["node"])
    elif t == "place_station":
        if g.phase in ("await_post_land", "await_action", "await_move"):
            do_place_station(g)
    elif t == "end_turn":
        if g.phase in ("await_post_land", "await_action"):
            if not p.moved:
                apply_parking_tick(g, p)
            advance_turn(g)
    elif t == "duel_stance":
        if g.phase != "await_duel" or g.pending_duel is None:
            return
        d = g.pending_duel
        if p.id == d["challenger"] and d["cs"] is None:
            d["cs"] = action["stance"]
        elif p.id == d["defender"] and d["ds"] is None:
            d["ds"] = action["stance"]
        auto_duel_ai(g)
    elif t == "duel_roll":
        if g.phase != "await_duel" or g.pending_duel is None:
            return
        d = g.pending_duel
        if d["cs"] is None or d["ds"] is None:
            return
        if p.id == d["challenger"] and d["cr"] is None:
            d["cr"] = roll_dice(g)
        elif p.id == d["defender"] and d["dr"] is None:
            d["dr"] = roll_dice(g)
        auto_duel_ai(g)
        resolve_duel_if_complete(g)


# ---------------------------------------------------------------------------
# Heuristic AI (agents.ts, difficulty = normal)
# ---------------------------------------------------------------------------


def walk_end(g, pos, steps, direction):
    step_fn = NEXT if direction == "forward" else PREV
    for _ in range(steps):
        pos = step_fn[pos]
    return pos


def path_passes_earth(g, pos, steps, direction):
    if steps <= 1:
        return False
    step_fn = NEXT if direction == "forward" else PREV
    cur = pos
    for _ in range(steps):
        cur = step_fn[cur]
    if cur == EARTH:
        return False
    cur = pos
    for _ in range(steps):
        cur = step_fn[cur]
        if cur == EARTH:
            return True
    return False


def score_landing(g, node):
    p = current(g)
    price = PRICE[node]
    score = 0.0
    if price > 0 and node not in g.owners and price <= p.cash - 80:
        score += 40 + min(35, price / 35)
        if node in HUBS:
            score += 15
            owned = [h for h in HUBS if g.owners.get(h) == g.current_idx]
            if len(owned) == 2:
                score += 40
            elif len(owned) == 1:
                score += 12
        sys = SYS.get(GROUP[node])
        if sys is not None:
            owned = sum(1 for d in sys if g.owners.get(d) == g.current_idx)
            need = len(sys)
            if owned == need - 1:
                score += 20
            elif owned >= need // 2:
                score += 4
    if g.owners.get(node) == g.current_idx:
        score += 18
        if node in g.stations:
            score += 10
    if node == EARTH:
        score += 28
    owner = g.owners.get(node)
    if owner is not None and owner != g.current_idx and price > 0:
        rent = RENT[node]
        mono = has_monopoly(g, owner, node)
        rent_now = int(rent * (2 if mono else 1) * (1.5 if node in g.stations else 1))
        score -= 25 + rent_now / 4
        if p.cash < rent_now:
            score -= 55
        if node in HUBS:
            score -= 15
    if KIND[node] == "space":
        score -= 4
    return score


def choose_direction(g):
    p = current(g)
    override = g.dir_policy[g.current_idx]
    if override == "retrograde":
        return "backward"
    if override == "prograde":
        return "forward"
    total = g.last_roll["total"] if g.last_roll is not None else 7

    def score(dir):
        s = score_landing(g, walk_end(g, p.pos, total, dir))
        if dir == "forward":
            s += 2
        return s

    fwd = score("forward")
    back = score("backward")
    return "backward" if back > fwd + 8 else "forward"


def choose_break(g, legal):
    p = current(g)
    total = g.last_roll["total"] if g.last_roll is not None else 0
    if total <= 0 or legal["max_break"] <= 0:
        return 0
    full_leave = leave_burn(p.pos, max(1, total), p.propellant)
    br = 0
    if p.fuel < full_leave and legal["max_break"] > 0:
        br = min(legal["max_break"], 2)
        while br > 0:
            b_cost = 0 if (p.free_break and br > 0) else 0.5 * br
            leave_after = leave_burn(p.pos, max(1, total - br), p.propellant)
            if p.fuel + 1e-9 >= b_cost + leave_after:
                break
            if p.fuel + 1e-9 >= b_cost and p.fuel < full_leave:
                break
            br -= 1
        while br > 0 and p.fuel + 1e-9 < (0 if (p.free_break and br > 0) else 0.5 * br):
            br -= 1
    return br


def choose_warp(g):
    p = current(g)
    best = None
    best_score = -1e9
    for ni in range(N):
        if ni == p.pos:
            continue
        score = score_landing(g, ni) + g.rng.random() * 4
        if p.fuel <= 4:
            score += 15
        if score > best_score:
            best_score = score
            best = ni
    if best_score < 10 and p.fuel > 8:
        return None
    return best


def heuristic_ai(g):
    p = current(g)
    if g.phase == "await_action":
        legal = legal_actions(g)
        if legal["sell"] and p.cash < 200 and legal["sell_value"] > 0:
            return {"type": "sell", "node": legal["sell_node"]}
        leave_preview = leave_burn(p.pos, 7, p.propellant)
        if (
            legal["refuel"]
            and legal["refuel_max"] > 0
            and (p.fuel <= 12 or leave_preview > p.fuel)
        ):
            want = min(legal["refuel_max"], max(5, 18 - p.fuel))
            if legal["refuel_cost"] == 0 or p.cash > want * legal["refuel_cost"] + 150:
                return {"type": "refuel", "amount": want}
        if legal["sell"] and p.cash < 100 and len(p.properties) > 2:
            return {"type": "sell", "node": legal["sell_node"]}
        if legal["warp"] and p.warps > 0:
            dest = choose_warp(g)
            if dest is not None:
                return {"type": "warp", "destination": dest}
        return {"type": "roll"}

    if g.phase == "await_move":
        legal = legal_actions(g)
        if legal["set_direction"]:
            dir_choice = choose_direction(g)
            if dir_choice != p.move_dir:
                return {"type": "set_direction", "direction": dir_choice}
        br = choose_break(g, legal)
        if br != g.break_spaces:
            return {"type": "set_break", "spaces": br}
        if not legal["move"] and g.break_spaces > 0:
            return {"type": "set_break", "spaces": 0}
        return {"type": "move"}

    legal = legal_actions(g)
    if legal["buy"] and p.cash >= legal["buy_price"] + 150:
        return {"type": "buy"}
    if legal["place_station"] and (p.fuel <= 14 or p.stations_in_hand >= 2):
        cost = legal["place_cost"]
        if cost == 0 or p.cash >= cost + 120:
            return {"type": "place_station"}
    if legal["refuel"] and p.fuel <= 8 and legal["refuel_cost"] == 0:
        return {"type": "refuel", "amount": min(legal["refuel_max"], 10)}
    return {"type": "end_turn"}


# ---------------------------------------------------------------------------
# Game driver
# ---------------------------------------------------------------------------


def play_game(seed, seat_policies):
    g = Game(seed, seat_policies)
    turns = 0
    while g.phase != "game_over" and turns < MAX_TURNS:
        resolve_duel_fully(g)
        if g.phase == "game_over":
            break
        p = current(g)
        if p.eliminated:
            apply_action(g, {"type": "end_turn"})
            turns += 1
            continue
        if g.phase == "await_duel":
            apply_action(g, {"type": "duel_stance", "stance": "low"})
            turns += 1
            continue
        action = heuristic_ai(g)
        legal = legal_actions(g)
        if (
            g.phase == "await_move"
            and action["type"] not in ("move", "set_break", "set_direction")
        ):
            action = {"type": "move"}
        if action["type"] == "end_turn" and not legal["end_turn"]:
            action = {"type": "roll"}
        if action["type"] == "roll" and not legal["roll"]:
            action = {"type": "end_turn"}
        if action["type"] == "move" and not legal["move"]:
            action = {"type": "set_break", "spaces": 0}
        apply_action(g, action)
        turns += 1
    if g.winner_id is None:
        alive = living(g)
        if len(alive) == 1:
            g.winner_id = alive[0]
    return g


def collect(game):
    per_player = []
    for p in game.players:
        per_player.append({
            "policy": game.dir_policy[p.id],
            "won": game.winner_id is not None and game.winner_id == p.id,
            "elim_round": p.elim_round,
            "elim_reason": p.elim_reason,
            "circuits": p.circuits,
            "claims": p.claims_bought,
            "cash": p.cash,
            "net": net_worth(game, p),
            "dir": p.direction_chosen,
        })
    return {
        "rounds": game.round,
        "turns": game.game_turn,
        "winner": game.winner_id,
        "players": per_player,
    }


def run_one(task):
    seed, seat_policies = task
    game = play_game(seed, seat_policies)
    return collect(game)


def agg(results, players_per_game):
    n = len(results)
    rounds = [r["rounds"] for r in results]
    turns = [r["turns"] for r in results]
    per_player = [pl for r in results for pl in r["players"]]
    winner_counts = Counter(r["winner"] for r in results)
    reason_counts = Counter(pl["elim_reason"] for pl in per_player if pl["elim_reason"])
    return {
        "n": n,
        "rounds": rounds,
        "turns": turns,
        "per_player": per_player,
        "winner_counts": winner_counts,
        "reason_counts": reason_counts,
    }


def mean_se(vals):
    m = sum(vals) / len(vals)
    if len(vals) < 2:
        return m, 0.0
    var = sum((x - m) ** 2 for x in vals) / (len(vals) - 1)
    return m, math.sqrt(var / len(vals))


def pct_wins(counter, total):
    out = []
    for k, v in counter.items():
        out.append(f"{k}: {v} ({100 * v / total:.1f}%)")
    return "  ".join(out)


def two_prop_ztest(a, na, b, nb):
    if na + nb == 0:
        return None
    p = (a + b) / (na + nb)
    if p <= 0 or p >= 1:
        return None
    se = math.sqrt(p * (1 - p) * (1 / na + 1 / nb))
    z = (a / na - b / nb) / se
    pval = 2 * (1 - normal_cdf(abs(z)))
    return z, pval


def normal_cdf(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))


def side_views(aggdata, side_set):
    players = [pl for pl in aggdata["per_player"] if pl["policy"] in side_set]
    wins = sum(1 for pl in aggdata["per_player"] if pl["won"] and pl["policy"] in side_set)
    circuits = [pl["circuits"] for pl in players]
    claims = [pl["claims"] for pl in players]
    net = [pl["net"] for pl in players]
    cash = [pl["cash"] for pl in players]
    elims = [pl["elim_round"] for pl in players if pl["elim_round"] is not None]
    first_outs = sum(
        1 for pl in aggdata["per_player"]
        if pl["policy"] in side_set and pl["elim_round"] is not None
        and pl["elim_round"] == min(
            (x["elim_round"] for x in aggdata["per_player"] if x["elim_round"] is not None),
            default=None,
        )
    )
    return {
        "players": len(players),
        "wins": wins,
        "circuits": mean_se(circuits),
        "claims": mean_se(claims),
        "net": mean_se(net),
        "cash": mean_se(cash),
        "avg_elim_round": mean_se(elims),
        "first_outs": first_outs,
    }


def fmt_mean(t):
    return f"{t[0]:.2f} ± {t[1]:.2f}"


def run_batch(name, seat_policies, games, nplayers, workers):
    seeds = [1000 + i * 997 for i in range(games)]
    tasks = [(s, list(seat_policies)) for s in seeds]
    results = []
    if workers and workers > 1:
        with ProcessPoolExecutor(max_workers=workers) as ex:
            results = list(ex.map(run_one, tasks))
    else:
        results = [run_one(t) for t in tasks]
    return agg(results, nplayers)


def build_experiments(players):
    return {
        "all-prograde": ["prograde"] * players,
        "all-retrograde": ["retrograde"] * players,
        "all-choice": ["choice"] * players,
    }


def print_experiment(name, games, players, a):
    print(f"\n=== {name} · {a['n']} games · {players}p ===")
    print(f"  avg rounds: {fmt_mean(mean_se(a['rounds']))}")
    print(f"  avg turns:  {fmt_mean(mean_se(a['turns']))}")
    winners = sum(1 for pl in a["per_player"] if pl["won"])
    print(f"  games with a winner: {winners // players} / {a['n']}")
    per_player = a["per_player"]
    n_pp = len(per_player)
    print(f"  per-pilot (n={n_pp}):")
    print(f"    avg circuits: {fmt_mean(mean_se([p['circuits'] for p in per_player]))}")
    print(f"    avg claims:   {fmt_mean(mean_se([p['claims'] for p in per_player]))}")
    print(f"    avg netWorth: {fmt_mean(mean_se([p['net'] for p in per_player]))}")
    print(f"    avg final cash: {fmt_mean(mean_se([p['cash'] for p in per_player]))}")
    alive = [p for p in per_player if p["elim_round"] is None]
    elim_rounds = [p["elim_round"] for p in per_player if p["elim_round"] is not None]
    print(f"    finished flying: {len(alive)} ({100*len(alive)/n_pp:.1f}%)")
    print(f"    avg elimination round: {fmt_mean(mean_se(elim_rounds))}")
    print(f"  elimination reasons: " + ", ".join(
        f"{k}: {v} ({100*v/n_pp:.0f}%)" for k, v in a["reason_counts"].most_common()
    ))
    if name == "all-choice":
        dirs = Counter(p["dir"] for p in per_player)
        print(f"  direction choices: " + ", ".join(f"{k or 'prograde (default)'}: {v}" for k, v in dirs.items()))
        wins_by_dir = Counter()
        for p in per_player:
            if p["won"]:
                wins_by_dir[p["dir"] or "forward"] += 1
        total_wins = sum(wins_by_dir.values())
        print(f"  wins by chosen direction: " + ", ".join(
            f"{k}: {v} ({100*v/total_wins:.1f}%)" for k, v in wins_by_dir.items()
        ))


def print_mixed(name, games, players, a, side_a, side_b, label_a, label_b):
    print(f"\n=== {name} · {a['n']} games · {players}p ===")
    va = side_views(a, side_a)
    vb = side_views(a, side_b)
    print(f"  avg rounds: {fmt_mean(mean_se(a['rounds']))}")
    print(f"  avg turns:  {fmt_mean(mean_se(a['turns']))}")
    print(f"  total wins: {sum(1 for p in a['per_player'] if p['won'])} / {a['n']} games")
    z = two_prop_ztest(va["wins"], va["players"], vb["wins"], vb["players"])
    wa = va["wins"] / va["players"]
    wb = vb["wins"] / vb["players"]
    print(f"\n  {label_a:>16}  wins {va['wins']:>4} ({wa*100:5.1f}%)  circuits {fmt_mean(va['circuits'])}  claims {fmt_mean(va['claims'])}  netWorth {fmt_mean(va['net'])}")
    print(f"  {label_b:>16}  wins {vb['wins']:>4} ({wb*100:5.1f}%)  circuits {fmt_mean(vb['circuits'])}  claims {fmt_mean(vb['claims'])}  netWorth {fmt_mean(vb['net'])}")
    print(f"  first eliminated: {label_a} {va['first_outs']} · {label_b} {vb['first_outs']}")
    if z is not None:
        zs, pv = z
        sig = "SIGNIFICANT" if pv < 0.01 else "not significant"
        print(f"  win-rate difference z = {zs:.2f}, p = {pv:.4f} ({sig} at α=0.01)")


def main():
    ap = argparse.ArgumentParser(description="Heliopoly retrograde simulation")
    ap.add_argument("--games", type=int, default=10000)
    ap.add_argument("--players", type=int, default=4)
    ap.add_argument("--workers", type=int, default=0, help="parallel workers (0 = serial)")
    ap.add_argument("--experiments", type=str, default="all")
    args = ap.parse_args()

    games = args.games
    players = args.players
    t0 = time.time()
    exps = build_experiments(players)

    print(f"Heliopoly retrograde simulation · {games} games × {players}p · normal AI")
    print(f"seed base 1000, stepping by 997 (same as npm selfplay)")

    if args.experiments in ("all", "all-prograde", "all-retrograde", "all-choice"):
        for name in ("all-prograde", "all-retrograde", "all-choice"):
            if args.experiments not in ("all", name):
                continue
            a = run_batch(name, exps[name], games, players, args.workers)
            print_experiment(name, games, players, a)

    def combine(a, b):
        return {
            "n": a["n"] + b["n"],
            "rounds": a["rounds"] + b["rounds"],
            "turns": a["turns"] + b["turns"],
            "per_player": a["per_player"] + b["per_player"],
            "winner_counts": a["winner_counts"] + b["winner_counts"],
            "reason_counts": a["reason_counts"] + b["reason_counts"],
        }

    if args.experiments in ("all", "mixed"):
        a = run_batch("mixed", ["prograde", "retrograde"] * (players // 2),
                      games // 2, players, args.workers)
        b = run_batch("mixed-swap", ["retrograde", "prograde"] * (players // 2),
                      games // 2, players, args.workers)
        print_mixed("mixed prograde vs retrograde", games, players, combine(a, b),
                    {"prograde"}, {"retrograde"}, "PROGRADE", "RETROGRADE")

    if args.experiments in ("all", "pal-vs-not"):
        a = run_batch("pal", ["prograde", "choice"] * (players // 2),
                      games // 2, players, args.workers)
        b = run_batch("pal-swap", ["choice", "prograde"] * (players // 2),
                      games // 2, players, args.workers)
        print_mixed("palindrome (choice) vs non-palindrome (prograde)", games, players,
                    combine(a, b), {"prograde"}, {"choice"}, "NON-PALINDROME", "PALINDROME")

    print(f"\nDone in {time.time() - t0:.1f}s")


if __name__ == "__main__":
    main()
