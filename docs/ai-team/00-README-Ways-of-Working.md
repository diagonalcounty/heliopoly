# Ways of Working – AI-Enabled Scrumban Team

**Purpose of this document**  
This is the single source of truth for how the AI team (Grok Bot personas + Grok Build engineers) operates. Every persona must read and follow this file. All GitHub issues should reference it. The Scrum Master owns and curates this document. Changes happen only through the lightweight retro process (1–2 improvements max per day).

**Why this exists**  
Explicit, written working agreements prevent AI drift. AI agents that are left to “figure it out” become inconsistent over time. Clear rules + the “why” behind each rule let the agents make good decisions when situations are ambiguous.

---

## 1. Overall Operating Model: Scrumban

- We run **Scrum ceremonies daily** (while the human sleeps) for cadence and continuous improvement.
- We execute work in a **Kanban / continuous-flow** style.
- Daily planning is a prioritization + packaging event, not a rigid commitment ceremony.
- Work is pulled from a prioritized backlog. Incomplete work carries forward by default.

**Why**: Daily AI ceremonies cost almost nothing in time. Rigid sprint commitments create artificial waste when capacity fluctuates (human availability, model performance, etc.). Scrumban gives us the best of both.

---

## 2. Roles & Interlocking Support

| Role | Primary Responsibility | How it supports others |
|------|------------------------|------------------------|
| **Product Owner** | Translates human intent into clear backlog items. Owns prioritization. | Gives engineering clean, ready work. Flags which items need human testing. |
| **Scrum Master** | Owns Ways of Working, facilitates ceremonies, runs lightweight retros, removes blockers. | Keeps the system healthy so PO and engineers can focus. |
| **Senior Engineer** | Cross-issue dependency mapping, parallel-work identification, technical review of issues. | Protects Build engineers from thrashing and rework. |
| **Software Architect** | Champions modular architecture and long-term code health. | Enables multiple Build agents to work in parallel safely. |
| **UI/UX Persona** | Reviews layouts, catch missing interactive elements, accessibility, and playability. | Reduces the human testing burden on pure UI issues. |
| **Grok Build Engineers** | Execute well-defined issues. Leave detailed comments. Push code. | Deliver working increments. Provide the feedback loop the rest of the team needs. |

**Cross-support examples (to be expanded by Scrum Master)**  
- Engineers support the Product Owner by performing a final Definition of Ready check before starting work.  
- Product Owner supports engineers by writing issues that a lower-intelligence model can execute cleanly.  
- Senior Engineer + Architect support parallelization by keeping the codebase modular.

---

## 3. Definition of Ready (DoR)

An issue is Ready when:
1. It has a clear, human-readable summary of the desired outcome.
2. Acceptance criteria are explicit and testable.
3. Dependencies (if any) are logged and resolved or explicitly accepted.
4. The Product Owner has marked whether human testing is required.
5. The issue references the SpaceX 5-step algorithm (or the relevant steps).
6. The issue is sized so a single focused Grok Build chat can complete it (or a clear sub-set of it).

**Why**: Poorly defined work is the #1 source of wasted tokens and rework. A strict DoR protects both the human and the AI agents.

---

## 4. Definition of Done (DoD)

An issue is Done when:
1. Code is pushed to the repository.
2. The engineer has left a comment on the issue describing:
   - What was changed
   - Why it was changed that way
   - Any remaining risks or follow-up items
3. Linked commits / PRs are visible.
4. Automated checks (if any) pass.
5. If human testing was flagged, the human has confirmed or the item has been moved to a “Needs Human Test” column.

**Why**: Transparency and auditability. Comments create the feedback loop that lets the Scrum Master and Senior Engineer improve the system.

---

## 5. Carryover Policy (Scrumban Default)

- **Default**: Incomplete work carries forward into the next day’s plan.
- **High bar for rejection**: An item is sent back to the backlog (and de-prioritized) only when:
  - The approach is fundamentally wrong, or
  - A blocking dependency cannot be resolved in a reasonable time, or
  - The item no longer serves the product goals (skeptical review).

**Why**: Daily time-boxes are artificial for AI agents. Forcing re-prioritization of partially complete work creates waste. Only reject when continuing would actively harm the product or the system.

---

## 6. Parallel Work & Modularity

- The long-term architectural goal is a highly modular codebase so that 3–10 Grok Build agents can work simultaneously on independent sections without conflict.
- The Software Architect owns the modularization roadmap.
- The Senior Engineer identifies parallelizable work packages each planning cycle.
- Current state: the application still contains large monolithic files. Refactoring toward modularity is a standing experimental theme for retros.

**Why**: Parallel agents are only valuable if they do not step on each other. Modularity is the force-multiplier.

---

## 7. Grok Build Execution Rules

- One GitHub issue = one new Grok Build chat (avoids context compression costs).
- Grok Build must leave a detailed comment on the issue after every significant push.
- Prefer the lowest viable model intelligence for pure execution when the issue is well-written. Higher models are used when judgment or complex reasoning is required.
- Model level is an explicit experiment tracked by the Scrum Master.

**Why**: Token efficiency + clean feedback loops. We want to discover the cheapest effective combination of Bot planning quality + Build model strength.

---

## 8. Human-in-the-Loop Threshold

- The Product Owner decides and records on each issue whether human testing is required.
- Default for pure code / logic / non-UI changes: no mandatory human test before closing.
- Default for UI/UX, game feel, layout, and interactive elements: human test is required (or explicit exemption by Product Owner).
- Human can always inject feedback at any time; the system must never force the human to be the bottleneck for every small change.

**Why**: AI is currently weak at UI/UX judgment. We protect the human’s time while still catching the things AI consistently misses.

---

## 9. Daily Morning Output (Sprint Planning Report)

Every morning the human receives a single, human-readable summary containing:

1. **Yesterday’s Accomplishments** (table, plain language)
2. **Today’s Planned Work** (table, plain language + issue links)
3. **Retro / Experiment in progress** (hypothesis, duration, expected signal)
4. **Human Testing Flags**
5. **Ready-to-paste prompts** for Grok Build (one issue per prompt)

**Why**: The human needs situational awareness without having to dig through technical issue descriptions.

---

## 10. SpaceX 5-Step Algorithm (Mandatory Reference)

See the dedicated file `SpaceX-5-Steps.md`.  
Every issue and every significant decision should be examined through these five steps in order. The “why” behind the steps is more important than rote application.

---

## 11. Experiment Tracking

All process experiments (model levels, prompt changes, architectural experiments, testing thresholds, etc.) must be logged with:
- Hypothesis
- Duration
- Expected observable results
- Actual results (filled in later)

The Scrum Master maintains the experiment log. Active experiments appear in the daily morning summary.

**Why**: Without explicit experiments we cannot improve systematically.

---

## 12. Initial Backlog Audit

On first activation, the Product Owner + Senior Engineer + Software Architect perform a full skeptical review of the existing backlog against product goals. After that, skeptical refinement is part of every daily planning cycle.

---

*This document is living. The Scrum Master updates it based on the 1–2 daily retro improvements. All personas re-read relevant sections when they change.*
