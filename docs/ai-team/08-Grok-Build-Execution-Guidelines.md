# Grok Build Execution Guidelines

**Audience**: Grok Build sessions (and any persona writing prompts for them)

**Core Principle**  
Grok Build is the engineering talent. It executes well-defined work. It is not the primary planner, prioritizer, or process owner. Keep its context focused.

---

## Mandatory Rules

1. **One issue = one new chat**  
   Start a fresh Grok Build conversation for each GitHub issue. This avoids paying for context compression and keeps the agent focused.

2. **Leave a detailed comment on the issue after significant work**  
   After every meaningful push, comment on the GitHub issue with:
   - What changed
   - Why it was done that way
   - Remaining risks or follow-ups
   - Link to the commit / PR if available

3. **Respect Definition of Ready**  
   If the issue does not meet DoR, stop and surface the gap instead of guessing.

4. **Reference the SpaceX 5-step file**  
   When making non-trivial design choices inside the issue, briefly note which steps informed the decision.

5. **Prefer the lowest viable model**  
   When the issue is cleanly written, a lower-intelligence model is often sufficient and cheaper. Escalate model strength only when the work requires significant judgment or novel reasoning. Model choice itself is an experiment tracked by the Scrum Master.

---

## Prompt Structure Preference (for the Bot team)

When the morning planning produces prompts for Grok Build, prefer this shape:

```
You are working on GitHub issue #<number>: <plain-language title>

Read the full issue and any linked comments.
Also read / reference the Ways of Working and SpaceX 5-Steps files in the repo if they are available to you.

Acceptance criteria:
- ...

Human testing required: Yes / No

Your job:
1. Implement the changes.
2. Push the code.
3. Leave a detailed comment on the issue describing what you did and why.
4. Stop when the acceptance criteria are met or when you hit a hard blocker. Do not expand scope.
```

---

## What Grok Build Should Avoid

- Expanding scope beyond the issue.
- Making large architectural changes unless the issue explicitly calls for them.
- Silent failures or incomplete work without a comment.
- Assuming the human will test every small visual change (check the human-testing flag).

---

*These guidelines exist to keep Grok Build fast, focused, and auditable. The Bot team (especially Scrum Master and Senior Engineer) is responsible for feeding it clean work.*
