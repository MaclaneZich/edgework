# Edgework build report

Built 2026-11-05 in three stages, each left in a working state. Stack: Next.js 16 (App
Router), TypeScript, Tailwind 4, KaTeX, Recharts, Framer Motion, Zustand persisted to
IndexedDB (localStorage fallback), Monaco + Web Worker for JavaScript, Pyodide for Python,
Web Speech API for dictation and read-aloud.

## What was built

| Area | Delivered |
|---|---|
| Curriculum | 10 modules, each with an interactive lesson (concept cards with formulas, reveal-one-step worked examples, try-it problem, four quick checks), practice sets by difficulty, mastery quiz, hard set unlocked by the quiz |
| Practice loop | Confidence pick before every reveal; flexible answer parser (integers, decimals, fractions, percents, expressions, factorials, binomials); exact form, worked solution, key idea, common mistake, fast path, interviewer follow-up, mistake category and lesson learned |
| Adaptive engine | Elo-style mastery per tag (hints, speed, confident misses weighted), SM-2 spaced repetition, Smart Session builder with weak-tag targeting and an in-session difficulty ramp, next-best-action on the dashboard |
| Calibration | Calibration curve, Brier score over time, per-tag over/under-confidence flags, Confidence Index per module and overall |
| Test simulator | Six 75-minute, 12-question mocks (2 standard, 4 hard) assembled from the bank by module and difficulty with no repeats; free navigation, flags, calculator, type/draw scratchpad, one coding question, math-or-coding-first, no pausing, pace indicator, 4-minute skip-rule nudge, lockdown rehearsal (fullscreen + focus-loss warnings), score report with per-question time, fastest path, own-history bands; 3-in-18 drills; pre-test checklist |
| Mental math | Zetamac-style 120-second sprint with default ranges, 80-in-8 multiple choice with +1/−1 scoring, nine operation drills, per-question timing, score history chart, slowest-operations report, speed-tricks cheat sheet |
| Market making | Four scenarios with hidden values and partial information, bot with configurable informed share, round-by-round P&L, closed-form optimal spread feedback; Fermi drill scoring range width against the truth |
| Spoken practice | Speak-It-Out (read aloud, dictate or type, step checklist self-rating, confidence, transcripts stored and attached to error-log entries), teach-it-back with a 60-second timer and hidden rubric, interview simulator with assumption-change, intuition, sanity-check, bound and recovery follow-ups and a four-part rubric |
| Review tools | Error log with categories and redo-by dates, Redo Queue, per-module notebook with KaTeX preview, searchable printable formula sheet auto-built from lessons plus a 51-family classic-problems index |
| Planning | Day-by-day planner to the test date (full mock two days before, light last day, official sample test early and late) that rebalances from completed work; Pomodoro timer with weekly chart; achievements; further reading with chapter mapping; settings (themes, font size, voice opt-in, test date, goals, export/import/reset) |
| Design | Dark-first with a refined light theme, Fraunces/Inter/JetBrains Mono, SVG logo mark, designed empty/loading/error states, responsive down to phone width, keyboard shortcuts (g + letter), reduced-motion support, AA contrast tokens |

## Content

All lesson, problem, hint and solution text is original. Classic families appear as concepts
with fresh framings and numbers; the formula sheet's family index names them.

| Module | Practice | d1 | d2 | d3 | d4 | d5 | Hard share |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1 Counting and complements | 28 | 4 | 7 | 9 | 5 | 3 | 29% |
| 2 Probability basics | 28 | 4 | 7 | 9 | 5 | 3 | 29% |
| 3 Conditional probability and Bayes | 28 | 4 | 7 | 9 | 5 | 3 | 29% |
| 4 Expectation and linearity | 30 | 4 | 7 | 10 | 6 | 3 | 30% |
| 5 Variance, distributions, approximations | 26 | 4 | 6 | 8 | 5 | 3 | 31% |
| 6 First-step analysis and recursion | 28 | 3 | 7 | 9 | 6 | 3 | 32% |
| 7 Betting, EV decisions, games | 26 | 3 | 6 | 9 | 5 | 3 | 31% |
| 8 Market-making and estimation | 24 | 4 | 6 | 8 | 4 | 2 | 25% |
| 9 Logic and brainteasers | 24 | 3 | 6 | 8 | 4 | 3 | 29% |
| 10 Test simulation and coding | 18 | 2 | 5 | 6 | 3 | 2 | 28% |
| **Total** | **260** | 35 | 64 | 85 | 48 | 28 | **29.2%** |

Plus 40 lesson checks (4 per module), 80 brainteasers (bt-001..bt-080: d2 15, d3 35, d4 22,
d5 8), 8 coding problems with client-side tests, 26 Fermi questions, 10 teach-it-back
rubrics.

## Verification

`npm run verify` recomputes every answer independently of the worked solution and fails on
any mismatch, on any simulation too noisy to detect a 1% error, on any `verifiedBy` that does
not match the implemented checks, and on any KaTeX string JavaScript would corrupt.

- 380 items, 776 checks, 776 passing.
- Methods: 224 formula, 195 enumeration, 166 seeded simulation, 102 exhaustive search, 47
  dynamic programming, 42 recursion (first-step linear systems / value iteration).
- 363 of 380 items (95.5%) are verified by two or more independent methods. The 17 single-method
  items are pure logic puzzles where exhaustive enumeration is the only honest route
  (m10-p15, m10-p16, bt-008, bt-015, bt-019, bt-023, bt-031, bt-032, bt-048, bt-049, bt-051,
  bt-052, bt-073, bt-074, bt-076), one pacing-arithmetic lesson check (m10-lc1) and one
  payoff-at-expiry problem (m8-p03).

## Independent review pass

Separate reviewer agents, with no authoring context, re-derived every worked solution step by
step, recomputed every intermediate number and every variation answer (which the verifier
does not cover), and checked prompts for ambiguity and for closeness to published problems.
Reports are in `reviews/`. Across the ten modules and the two brainteaser halves the pass
found and fixed 14 critical and 19 major issues: wrong intermediate steps, four wrong
variation answers, a wrong displayed exact form, misleading mistake notes, ambiguous prompts,
two framings reworded away from well-known puzzles, and twenty-five hint strings whose KaTeX
would have rendered as garbage because JavaScript ate the backslashes. Around ninety wording
fixes were applied on top. No stored answer was wrong in any module. The eaten-backslash class
led to a new source-level check in the verifier so it cannot recur.

## Checks

- `npm test`: 81 tests passing (answer parser, Elo mastery, SM-2, calibration, planner,
  mental math, market game, coding reference solutions, store export/import round trip).
- `npm run typecheck`: clean. `npm run lint`: 0 errors (advisory React-compiler warnings only).
- `npm run build`: clean production build.
- Browser click-through (built-in browser): dashboard, modules, lesson with KaTeX and quick
  checks, practice session with grading and achievement toast, mental-math sprint, full mock
  (clock, navigation, coding question with Monaco and worker-run tests, submission, score
  report), market-making rounds, Fermi drill, speak-it-out, interview simulator, redo queue,
  error log, notebook, schedule, timer, formula sheet, settings, light theme, phone layout.
- Lighthouse (production build, desktop preset): see the table below.

| Page | Performance | Accessibility | Best practices | SEO |
|---|---:|---:|---:|---:|
| Dashboard `/` | 98 | 100 | 100 | 100 |
| Module page `/modules/1` | 94 | 100 | 100 | 100 |
| Test simulator `/mock` | 95 | 100 | 100 | 90 |
| Calibration `/calibration` | 96 | 98 | 100 | 100 |

The remaining SEO point on the mock page is a generic-link-text audit on the per-mock
"Start" links, which carry descriptive aria-labels; the calibration page's accessibility
point is a chart element Recharts renders without a name.

## Known limits

- The official HackerRank sample test cannot be replicated; the planner schedules it twice.
- Fonts, Monaco and Pyodide load from CDNs on first use; everything else works offline.
- Dictation depends on browser support and, in Chrome/Edge, sends audio to a cloud speech
  service; both voice features are off by default.
- Mock score bands are heuristics plus the user's own history, not real SIG percentiles.
- The adaptive engine is Elo-style, not a fitted item-response model; its ratings are
  relative, and the "mastery %" label is the estimated chance on a difficulty-4 problem.
- `reviews/` reports reflect the content at review time; content edited afterwards must pass
  `npm run verify` but is not re-reviewed automatically.
