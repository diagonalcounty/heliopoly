# Why these marketing / voice changes

Source of truth for **intent**. Line picks live in the sibling drafts; if a line and this file disagree, **this file wins** until Jacob revises the reason.

Drawn from Jacob’s PR #235 review (2026-09-09) and prior product direction. Review comments were **direction**, not polish to paste blindly.

---

## 1. App Store: one sharp claim, not a feature salad

**Problem with the old / draft promo:** Mixing “Angzarr is the currency” with “Offline on iPhone & iPad” in one promo line is unfocused. Offline is true and belongs in the long description; it is not the hook.

**Principle:** Promotional text carries **one** pitch. Description carries logistics (devices, offline, how to play).

**Locked because of that:**

| Field | Choice | Why |
|-------|--------|-----|
| Subtitle | `Space Economics. Trade in ⍼.` | Mashup + glyph; quirky without puffery; Jacob marked **Best** |
| Promo | `The only App Store game where the currency is Angzarr (⍼).` | Single claim (Angzarr). Offline deliberately **omitted** from promo |
| Devices | iPhone & iPad in description body | Accurate; good; not the promo |
| Price | Stay $3.99 | Product decision; not a marketing “raise to signal quality” move |

**Description opener:** Name the fiction clearly — Mainline of our solar system (**Helios**) — so “Mainline” is not a floating jargon word. Prefer **currency** over “money” so Angzarr stays diegetic (ledger settlement), not casual cash talk.

**Rejected:** Bolting offline onto the Angzarr promo; generic board-game puffery; monopoly/IP bait language.

---

## 2. Homeschool pods: persona, not a claim

**Problem with a public “homeschool pod” pitch:** Saying it outright on the store (or as a featured web pitch) is too direct and implies a product feature / edu positioning we are not shipping.

**Principle:** Homeschool-facilitator adults are an **internal persona** — a smell test for voice and first-session clarity — not an audience we name in public copy.

**Locked because of that:**

- No App Store sentence about pods / shared-play-as-homeschool.
- No web hero that markets “perfect for homeschoolers” unless Jacob later asks for a quiet aside.
- Internal test line that *passed* as persona check (not for store): “Parents can use this to train kids on space and economics — if they can survive the ledger.”

**Smell test:** Would this public line still work if we never say “homeschool”? If it needs the word, cut it.

---

## 3. Ops Manual: clerk voice is diegetic procedure

**Principle:** The clerk is already the pseudo-voice. Lean memo/policy, deadpan, one quirk per screen. Teach rules correctly; do not sound like a teacher app.

**Angzarr wording (locked):**  
“Angzarr is post-quantum **digital currency**. It still requires a ledger.”

**Why that phrasing:** “Settlement” was soft/vague; “digital currency” matches how the fiction treats Angzarr; the ledger requirement is the mechanical truth players need.

**Also:** Spell **Angzarr (⍼)** once on first mention; later glyph-primary is fine. Prefer **currency** language consistently with the store opener.

---

## 4. What “done” means for this PR

This PR is **done** when WHY + drafts reflect Jacob’s direction and locked picks — not when ASC or `content.ts` are edited.

Implementation after approval:

1. Steve patches ASC fields from the listing draft (no Submit unless asked).
2. Handbook rewrites land in a follow-up PR → https://preview.heliopoly.live/ HITL.

---

---

## 5. Rogue Tesla line (banked 2026-09-09)

**Jacob line:**  
“As of 2026 this is the only space game where a rogue tesla can crash into your property and destroy your fuel pods.”

**Why it works:** Diegetic, specific, funny without explaining the joke. It points at a real Mainline hazard (rogue Tesla vs fuel pods on moons — hubs are safe because stations can move). Sounds like clerk gossip, not a feature bullet.

**Constraint:** Store promo already spent the one sharp “only …” on Angzarr (P1). Comp lesson from #232: **one** “only game that…” in the hook. Do not stack two “only” claims in subtitle + promo.

**Where it should live (default):**
- **Description body** or screenshot caption — yes
- **Promo** — only if we deliberately retire P1 later
- **Ops Manual / event copy** — natural home if the event already teaches the rule

**Rejected use:** Second promo that also opens with “the only…”

## Change log (reasons)

| When | What we learned |
|------|-----------------|
| 2026-09-09 review | Promo must be single-pitch; offline ≠ hook |
| 2026-09-09 review | Homeschool = internal persona, not public claim |
| 2026-09-09 review | Subtitle A best; Helios in opener; currency not money |
| 2026-09-09 review | Angzarr = post-quantum digital currency |
| 2026-09-09 chat | Promo P1 locked (Angzarr-only) |
| 2026-09-09 chat | Banked rogue-Tesla “only” line for description/Ops — do not stack with P1 |
