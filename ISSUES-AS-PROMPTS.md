# Issues as prompts

Research note for people who write Heliopoly issues. It compares this repo before and after the issue-as-prompt cut, and it cites the same measurement on K127.

K127 write-up, snapshot the morning of 2026-10-05: [diagonalcounty/k127 `ISSUES-AS-PROMPTS.md`](https://github.com/diagonalcounty/k127/blob/main/ISSUES-AS-PROMPTS.md).

Heliopoly snapshot: `main` through `45688b3` on 2026-10-03, issues read on 2026-10-05. **510 commits**, **234 issues** (144 closed, 90 open), **871 comments**. One GitHub account, `diagonalcounty`, opened every issue and wrote all but one comment.

## The claim

An issue written so a fresh Build chat can ship from the body, and held until a reviewer comments **Ready**, raises how much finished work lands and how often that work has to be touched again.

On K127 the record supports that claim. On Heliopoly the writing half shows up, and the Ready-comment half almost never does. Throughput across the calendar did not rise. The slow tail of issues that did ship got shorter, and a second commit inside three days became rare. Those are smaller, different results. They are reported below as measured.

## Where each repo drew the line

**K127.** The repo starts 2026-09-12. [docs/DOR.md](https://github.com/diagonalcounty/k127/blob/main/docs/DOR.md) lands on 2026-09-14 (`9556d23`): the issue is the whole prompt, and a reviewer comments Ready or Not Ready before Build. There is no long pre period. The comparison inside that note is “gate unused,” then “Not Ready wave,” then “Ready on most deliveries.”

**Heliopoly.** The repo starts 2026-07-21. A Definition of Ready checklist is on paper from 2026-08-25 (`adb6823`, Ways of Working). The issue-as-prompt cut is the night of 2026-09-04:

- `78495ac` (22:52 Central) adds the bug and feature templates and names Swithin as the owner of the Ready / Not Ready comment.
- `e6332c7` (22:54 Central, recorded as 2026-09-05 03:54 UTC) adds DoR item 7: Grok Build can treat the issue plus its comments as the prompt, with no second paste.

Pre is everything before 22:50 Central on 2026-09-04 (46 calendar days, 27 days with a commit, 335 commits). Post is from that cut through 2026-10-03 (30 calendar days, 9 days with a commit, 175 commits). August 25–September 4 is inside pre: the checklist existed, and the issue was not yet defined as the prompt.

## What K127 showed

Quoted from the K127 note so this file can be read alone. Dates there are Central. A shipping commit is one whose subject names an issue. A first delivery is the first such commit for that issue.

| Period | Shipping commits per day | Issues receiving their first commit per day | Ready already on the issue |
| --- | ---: | ---: | --- |
| Sep 12–14, gate not in use | 17.3 | 21.7 | 0 of 65 |
| Sep 16–20, gate written, rarely used | 14.4 | 9.4 | 5 of 47 |
| Sep 21–25, Not Ready wave | 12.0 | 4.2 | 4 of 21 |
| Sep 26–30, Ready comments return | 18.4 | 16.4 | 36 of 82 |
| Oct 1–4, Ready on most deliveries | 27.0 | 24.8 | 63 of 99 |

After a Ready comment, the commit that names the issue landed in a median of 37 minutes (108 issues, 105 of them within a day). Where a second commit had 72 hours to appear, a prompt-shaped issue that already had Ready was committed again in 4 of 69 cases. The same shape with no Ready comment was committed again in 21 of 72 cases. The gate comments themselves number 181 Ready and 305 Not Ready.

K127’s author line did not grow. One account opened every issue.

## What Heliopoly showed

### The issue text changed. The Ready comment did not.

Issues created before the cut: **6 of 182** bodies contain the heading “acceptance criteria” (3%). Issues created after: **18 of 52** (35%). Checkbox lists were already common before the cut (117 of 182, 64%) and stayed common (39 of 52, 75%). The new habit is the template’s acceptance block, which is what [`.github/ISSUE_TEMPLATE/feature.yml`](.github/ISSUE_TEMPLATE/feature.yml) asks for. The template says a Ready issue is the prompt, and that Swithin owns the gate.

The gate comment did not become a habit.

| DoR comment, whole history | Count |
| --- | ---: |
| `### Gemma DoR pass — Not Ready` | 161 |
| `**Not Ready** (Swithin / DoR)` | 5 |
| `**Ready** (Swithin / DoR)` or `Ready for one Build chat.` | 2 |

The 161 Gemma comments run from 2026-09-22 02:16 Central through 2026-10-01 02:24 Central. They are a backlog pass, the same kind of pass K127 recorded, not a Ready release before each build. Lines that say “READY FOR DEVICE” or “Ready for local test” were left out of this count. Those are human-test notes, not the Build gate.

The two Ready comments are `#219` (2026-09-04 22:53, closed about half an hour later) and `#293` (2026-09-29 16:36, closed about ten minutes later). Neither issue number appears in a commit subject. On K127, 108 issues have a Ready comment and then a commit that names them. On Heliopoly that sequence happens **zero** times. Commit subjects are an incomplete delivery log here: 33 closed issues never appear as `#number` in a subject, and 101 issues have no referencing commit at all.

### Throughput did not rise on the calendar

| | Pre (Jul 21–Sep 4) | Post (Sep 4 night–Oct 3) |
| --- | ---: | ---: |
| Calendar days | 46 | 30 |
| Days with at least one commit | 27 | 9 |
| Commits | 335 (7.3 per calendar day, 12.4 per active day) | 175 (5.8 per calendar day, 19.4 per active day) |
| Commits whose subject names an issue | 200 (60% of commits, 4.3 per calendar day) | 145 (83% of commits, 4.8 per calendar day) |
| Issues receiving their first such commit | 92 (2.0 per calendar day) | 41 (1.4 per calendar day) |
| Median lines added on those commits | 94 | 30 |

Work after the cut is burstier, not a higher daily rate. The heaviest week in the repo is still before the cut: the week of August 10 has 141 commits. The heaviest post week is September 28, with 87 commits, 77 of them naming an issue, spread across 46 issue numbers, and only 8 issues receiving their first referencing commit. That week is more commits on work already in motion.

Issues **born and shipped** after the cut are the clean post cohort: 27 issues. Median time from open to first referencing commit is **0.3 hours**. The 75th percentile is **2.9 hours**. **26 of 27** land within a day, and all 27 land within seven days. The matching pre cohort is 92 issues: median **0.6 hours**, 75th percentile **36 hours**, 68% within a day, 78% within seven days. The slow tail is what changed. Another 25 issues opened after the cut have no referencing commit by the snapshot (placeholders and open cards, many from September 24–25). Another 14 issues opened before the cut and only received a referencing commit after it. Those 14 waited a median of about 25 days. They are backlog, not the new loop.

Issues old enough to have had 14 days to close: **89 of 182** pre (49%) closed inside 14 days, against **9 of 15** post. Fifteen is too few to treat 60% as a new rate. Most post issues were opened after September 21 and have not had 14 days.

Commit author names flip in the same week as the cut. Before it, 293 commits are `Jacob Roecker` on local or `example.com` addresses and 42 are `Diagonalcounty <jacob@roeckerfam.com>`. After it, 168 are that Diagonalcounty address and 7 are `Jacob Roecker`. That is one personal address taking over the log, not a second team. It does mean the post period is also “commits started using the Diagonalcounty identity.” The two changes sit on top of each other.

### Returns got rarer, on a small post sample

A return is another commit that names the same issue. The clock matches the K127 note: more than 6 hours after the first referencing commit, and only issues that have had the full window by noon Central on 2026-10-05.

| | Pre, first referencing commit before the cut | Post, first referencing commit after the cut |
| --- | --- | --- |
| Another commit in the 6–72 hour window | 5 of 92 (5%) | 0 of 33 |
| Another commit in the 6 hour–14 day window | 10 of 92 (11%) | 0 of 21 |
| Issues with 3 or more referencing commits in the whole log | 23 of 92 | 3 of 41 |

The 14-day post cell misses the September 28 burst, because those commits are younger than 14 days. The 72-hour cell includes more of them and is still zero. Pre was already a low return rate. The post rate is lower. It is not the K127 gap, where prompt-shaped issues built with no Ready comment returned in 21 of 72 cases inside 72 hours. Heliopoly never built a Ready-versus-not-Ready delivery split large enough to compute that cell: Ready-before-commit is zero on both sides of the cut.

Prompt-shaped here means three or more checkbox lines plus an “acceptance criteria” heading. Only 4 of the 92 pre deliveries and 1 of the 27 born-and-shipped post deliveries meet that bar, so Heliopoly cannot support a prompt-shaped rework table. The acceptance heading is more common on issues opened after the cut, and most of those issues are still open.

## Side by side

| | K127 | Heliopoly |
| --- | --- | --- |
| History used | Sep 12–Oct 5, 2026. The gate is there from day 3. | Jul 21–Oct 3, 2026. Forty-six days before the prompt cut, thirty days after. |
| Issue is the prompt, in writing | DoR doc Sep 14. Bodies grow checkboxes, current/expected, and out of scope. | Templates and DoR item 7 on the night of Sep 4. “Acceptance criteria” goes from 3% of new issues to 35%. |
| Ready comment, then a commit that names the issue | 108 issues. Median 37 minutes. | 0 issues. Two Ready comments exist. Neither issue number is in a commit subject. |
| Not Ready comments | 305, spread across the month, including one large pass. | 168, of which 161 are one Gemma pass from Sep 22 to Oct 1. |
| Calendar rate of commits that name an issue | Rises from about 12 a day in the Not Ready wave to 27 a day once Ready is the common path. | Stays about 4–5 a day. Active days get heavier (7.4 to 16.1 shipping commits) because post has only 9 active days out of 30. |
| Slow issues | Ready issues are young. Open Not Ready issues sit a median of about 9 days. | Issues born and shipped after the cut have a 75th percentile of 3 hours from open to first naming commit. Before the cut that percentile is 36 hours. |
| Second commit inside 72 hours | 4 of 69 when Ready was already on a prompt-shaped issue. 21 of 72 when the prompt was shaped and Ready was not. | 5 of 92 before the cut. 0 of 33 after. No Ready-versus-skipped split. |

The shared piece is the writing rule and the Not Ready pass. The piece that lined up with K127’s higher shipping rate is the Ready comment used as the start of Build. Heliopoly wrote that rule down and then rarely posted the comment.

## What an issue author on Heliopoly should take from this

Write the issue as the whole prompt. The feature template already asks for the outcome, why now, testable acceptance boxes, and whether a human has to test. Ways of Working item 7 is the standard: [docs/ai-team/00-README-Ways-of-Working.md](docs/ai-team/00-README-Ways-of-Working.md).

Put `#number` in the commit subject when the work lands. A third of closed issues in this history never appear in a subject, so the delivery log cannot show a Ready-to-commit time even when the close was minutes later (`#219`, `#293`).

A Not Ready comment is the part of the gate this repo actually used. The week of September 21 carries 151 of them. K127’s shipping rate rose in the weeks after issues came back marked Ready. Heliopoly has not produced that second half of the loop in the commit log. Two Ready comments in thirty days is the size of the gap.

Size one issue for one chat. Post-cut commits that name an issue are smaller (median 30 lines added, against 94 before). That matches the template. The calendar still only shows a commit on 9 of the 30 days after the cut, so smaller commits did not, by themselves, raise how much landed per day.

## What this record does not show

This is one game repo, not a trial. The author name on commits changes in the same week as the templates. August 10 is a 141-commit week inside the pre period, so any average is sensitive to bursts. Post has 9 active days. A rate “per active day” rewards a sparse calendar.

“Lines added” is a poor score. The largest commits are a 7,005-line sync on August 22 and the initial import. None of the shipping commits cross 2,000 lines, so the median above is not an outlier artifact. It is still not player-visible throughput.

Issue numbers missing from subjects under-count delivery. Closing `#293` ten minutes after Ready is invisible to the Ready-to-commit clock. The same hole exists before the cut, so it does not invent the zero. It does mean some real landings are absent on both sides.

The 14-day return rate after the cut is 0 of 21 because only 21 post deliveries are old enough. The busy September 28 week is mostly younger than that. Do not read the later burst as a quality score.

K127’s numbers are copied from its own note. They were not recomputed for this file.

## Methods

Issues and comments: GitHub GraphQL for `diagonalcounty/heliopoly` on 2026-10-05. 234 issues, every comment (none had more than 80). Pull requests are not in that list. Commits: `git log` on `main` in `~/code/heliopoly`, 510 commits, subjects and `--shortstat`. Seventy-eight commits have no shortstat line. Their line counts are omitted from medians. Their subjects still count.

Times are America/Chicago. The cut is 22:50 Central on 2026-09-04, just before `78495ac`.

A DoR **Not Ready** comment has a first line that says “not ready,” or a Gemma DoR heading whose next lines say “not ready.” A DoR **Ready** comment has a first line that is a Swithin DoR Ready line, or starts with “Ready,” and does not say “device,” “local,” or “not ready.” “READY FOR DEVICE” is excluded on purpose.

A shipping commit’s subject matches `#` plus digits. A first delivery is the earliest such commit at or after the issue’s `createdAt` minus six hours. A return commit falls in the open interval (6 hours, 72 hours] or (6 hours, 14 days], and the issue is counted only when the snapshot (noon Central on 2026-10-05) is at least that far past the first delivery.

“Acceptance criteria” means that phrase in the issue body, case-insensitive. Checkbox counts are markdown lines `- [ ]` or `- [x]`.
