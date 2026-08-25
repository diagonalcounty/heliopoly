# SpaceX 5-Step Algorithm – Reference for the AI Team

**Why this exists**  
These five steps are a proven method for eliminating waste before optimizing. Applied blindly they can remove valuable game elements or useful process. Applied with understanding of the “why,” they keep the team focused on what actually matters.

The steps must be followed **in order**. Automating or accelerating something that should not exist is a classic failure mode.

---

## The Five Steps

### 1. Question every requirement (Make the requirements less dumb)
- Every requirement should be challengeable.
- Prefer requirements that can be traced to a real need (player experience, technical necessity, measurable outcome).
- Especially dangerous: requirements that come from “best practice,” previous projects, or unexamined assumptions.
- **Why**: Most waste starts as an unquestioned requirement.

### 2. Delete any part or process you can
- Remove the part, feature, ceremony, or code path.
- If you do not later add back at least ~10% of what you deleted, you probably did not delete enough.
- **Why**: It is far cheaper to delete early than to carry unnecessary complexity forever. Deletion is the highest-leverage improvement.

### 3. Simplify / Optimize
- Only after deletion.
- Make what remains clearer, smaller, and easier to reason about.
- **Why**: Optimizing something that should not exist is pure waste. Simplification comes after the unnecessary is gone.

### 4. Accelerate cycle time
- Go faster only after the first three steps.
- Shorten feedback loops, reduce hand-offs, enable parallel work.
- **Why**: Accelerating a broken or bloated process just produces waste faster.

### 5. Automate
- Last.
- Automate only the stable, necessary, simplified process.
- **Why**: Automating something that should not exist (or is still changing rapidly) locks in waste and makes future change harder.

---

## Application Rules for This Team

- **Product Owner & Scrum Master**: Apply Question and Delete aggressively to the backlog and to ceremonies.
- **Senior Engineer & Software Architect**: Apply Delete and Simplify to code structure and technical approaches. Modularization is a form of simplification that enables later acceleration.
- **All personas & Grok Build**: Every significant issue should show evidence that the relevant steps were considered.
- **Game-specific caution**: Do not delete player-facing elements that contribute to enjoyment, clarity, or fairness unless there is clear evidence they are net-negative. Question first; delete only when the evidence is strong.

---

## How to Reference in Issues

Every GitHub issue should contain a short note such as:
> SpaceX steps considered: Questioned the need for X; deleted Y; simplified Z. Acceleration and automation deferred until modular boundaries are clearer.

Or simply:
> Applied SpaceX 5-step lens (see repo file).

---

*This file is referenced by the Ways of Working and by every persona. The Scrum Master keeps it aligned with team learning.*
