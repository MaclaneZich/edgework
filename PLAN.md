# Edgework: architecture and content plan

Edgework is a local-first interview-prep app for quantitative trading assessments
(SIG Discovery HackerRank test first, live interviews after). It is a Next.js App
Router application with no backend: every byte of progress lives in the browser
(IndexedDB through `idb-keyval`, with a localStorage fallback) and can be exported
or imported as JSON.

## Stack

- Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS 4
- KaTeX for math, Recharts for charts, Framer Motion for motion
- Zustand store persisted through a tiny async storage adapter (IndexedDB -> localStorage)
- Monaco editor for the coding warmup; JS runs in a Web Worker, Python through Pyodide on demand
- Web Speech API for dictation and read-aloud, opt-in, with typed fallback
- Vitest for unit tests, `tsx` for the verification runner

## Folder structure

```
src/app/            routes (dashboard, modules, session, mock, mental-math, ...)
src/components/     ui primitives and feature components
src/lib/            pure logic: answer parser, grading, mastery (Elo), SM-2, calibration,
                    schedule planner, mock assembly, mental math, market game, rng, store
src/content/        typed content: modules (lessons), problems, verify specs, coding,
                    fermi, families, reading
scripts/verify.ts   verification runner (`npm run verify`)
```

## Data model (see `src/content/types.ts`)

- `Problem`: id, module, kind (practice | lessonCheck | brainteaser), difficulty 1-5, tags,
  minutes, title, prompt, answer (numeric with exact form and tolerance, or multiple choice),
  three hints, worked solution, step checklist, key idea, common mistake, fast path,
  variation + variation answer, optional family, `verifiedBy`.
- `ModuleDef`: lesson (intro, concept cards, worked examples that reveal step by step,
  try-it mini problem, lesson checks, formulas for the sheet, outro) plus quiz settings.
- `VerifySpec`: per problem, one or more independent checks (enumeration, simulation with a
  seeded RNG, formula, recursion, exhaustive search, DP). The runner fails loudly on any
  mismatch, on noisy simulations, and on `verifiedBy` that does not match the checks.

Progress state (Zustand, persisted): settings, attempts (with confidence, time, hints),
per-tag mastery ratings, SM-2 cards, error log, notes, study log, mock results, mental
math results, market game and Fermi results, interview and speak-it-out results, quiz
passes, achievements, schedule, streak.

## Adaptive and calibration logic

- Mastery: Elo-style rating per tag. Problem rating from difficulty (1000..1800). Score
  discounted by hints, boosted by speed; K shrinks with experience; confident misses cost more.
- Spaced repetition: SM-2 cards for missed, hinted or low-confidence problems.
- Calibration: Brier score, calibration curve by confidence bucket, over/under-confidence
  flags per tag, Confidence Index = blend of accuracy, calibration and speed.
- Smart Session: due reviews first, then weakest tags, with a difficulty ramp after three
  quick correct answers.

## Content plan

Target: 260+ practice problems, 40 lesson checks, 80 brainteasers; at least 25% of practice
problems at difficulty 4-5. Planned counts (d1/d2/d3/d4/d5):

| # | Module | Problems | d1 | d2 | d3 | d4 | d5 |
|---|--------|---------:|---:|---:|---:|---:|---:|
| 1 | Counting and complements | 28 | 4 | 7 | 9 | 5 | 3 |
| 2 | Probability basics | 28 | 4 | 7 | 9 | 5 | 3 |
| 3 | Conditional probability and Bayes | 28 | 4 | 7 | 9 | 5 | 3 |
| 4 | Expectation and linearity | 30 | 4 | 7 | 10 | 6 | 3 |
| 5 | Variance, distributions, approximations | 26 | 4 | 6 | 8 | 5 | 3 |
| 6 | First-step analysis and recursion | 28 | 3 | 7 | 9 | 6 | 3 |
| 7 | Betting, EV decisions, games | 26 | 3 | 6 | 9 | 5 | 3 |
| 8 | Market-making and estimation | 24 | 4 | 6 | 8 | 4 | 2 |
| 9 | Logic and brainteasers | 24 | 3 | 6 | 8 | 4 | 3 |
| 10 | Test simulation and coding warmup | 18 | 2 | 5 | 6 | 3 | 2 |
|   | Total | 260 | 35 | 64 | 85 | 48 | 28 |

Plus 4 lesson checks per module (40) and 80 brainteasers (bt-001..bt-080, module 9,
difficulty mix leaning 3-4), plus 8 coding problems with client-side tests.

## Stage plan

- Stage A: shell, design system, store, dashboard, confidence-calibrated practice,
  modules 1-4 with full content, mental math trainer, timed test simulator. Run and check.
- Stage B: modules 5-7, adaptive engine and Smart Session, error log and Redo Queue,
  study timer, schedule planner.
- Stage C: modules 8-10, brainteaser bank, coding warmup, market-making game and Fermi
  drill, speak-it-out and teach-it-back, hard mocks, interview simulator, achievements,
  polish, accessibility pass.

After every stage: `npm run verify`, `npm test`, `npm run build`, browser click-through,
and an updated STATUS.md.
