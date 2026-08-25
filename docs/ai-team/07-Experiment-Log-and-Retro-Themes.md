# Experiment Log & Standing Retro Themes

**Owner**: Scrum Master  
**Purpose**: Track process and technical experiments so the team improves systematically instead of randomly. Every active experiment appears in the daily morning summary.

---

## Active / Planned Experiments

### Experiment 1 – Model Intelligence Balance
- **Hypothesis**: Well-written issues from high-quality Bot planning allow a lower-intelligence Grok Build model to produce acceptable results at lower token cost and with less drift.
- **Duration**: Minimum 5 working days of mixed model use.
- **Expected signals**: Completion rate, comment quality, number of clarification requests, human rework rate, token usage (qualitative).
- **Status**: To be started. Log results here.

### Experiment 2 – Human Testing Threshold
- **Hypothesis**: Explicit Product Owner flags + UI/UX persona review can reduce mandatory human testing to only judgment-heavy items without increasing escaped defects.
- **Duration**: Ongoing; review after 10–15 UI-related issues.
- **Expected signals**: Number of issues closed without human test that later required fixes; human time spent testing.
- **Status**: Baseline to be established.

### Experiment 3 – Modularization Progress
- **Hypothesis**: Incremental extraction of independent modules from the current large files will enable true parallel Grok Build work with fewer conflicts.
- **Duration**: Multi-week; track via architecture notes and parallel success rate.
- **Expected signals**: Ability to run 3+ simultaneous Build agents without frequent merge pain; reduction in largest file sizes / coupling.
- **Status**: Standing theme. Architect owns concrete next steps.

### Experiment 4 – Carryover vs Rejection Threshold
- **Hypothesis**: Default carry-forward of incomplete work (with a high bar for rejection) produces less waste than strict daily re-prioritization.
- **Duration**: 2 weeks of observation.
- **Expected signals**: Amount of partially complete work that is later abandoned vs finished; planning overhead.
- **Status**: Policy already set to default carry-forward. Monitor for edge cases.

---

## Standing Retro Themes (look for these)

- Opportunities to delete ceremony or documentation that is no longer earning its keep.
- Places where issues still require too much human clarification.
- UI/UX failures that should have been caught earlier.
- Token / model cost vs quality trade-offs.
- Dependency surprises that blocked parallel work.
- Any drift in the Ways of Working or persona behavior.

---

## Experiment Template (copy for new experiments)

```
### Experiment N – [Short Name]
- **Hypothesis**: 
- **Duration**: 
- **Expected signals**: 
- **Actual results**: 
- **Decision / Next step**: 
- **Date logged**: 
```

---

*Update this file as part of the daily retro. Keep it short. The goal is learning, not bureaucracy.*
