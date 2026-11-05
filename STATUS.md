# Edgework status

_Last updated: 2026-11-05, end of Stage C. Everything described in the brief is built, run and checked._

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Everything is saved in your browser (IndexedDB with a localStorage
fallback); export from Settings before switching machines.

## What you can use right now

- **All ten modules** with full content: each has an interactive lesson (concept cards,
  reveal-one-step worked examples, a try-it problem, four quick checks), practice sets by
  difficulty, a mastery quiz (8 questions, pass at 75%), and a hard set (difficulty 4-5) that
  unlocks when you pass the quiz. 260 practice problems, 40 lesson checks, 80 brainteasers.
- **Confidence-calibrated practice** on every problem, with flexible answers (`3/8`, `0.375`,
  `37.5%`, `1 - (5/6)^4`, `C(10,3)`, `5!`), exact answers, worked solutions, key idea, common
  mistake, fast path, interviewer follow-up, and mistake tagging.
- **Dashboard**: progress ring, hours toward the 20-hour goal, streak, countdown, next best
  action, today's plan, per-module bars, weakness heatmap, recent attempts.
- **Smart Session** (adaptive: weak tags, due reviews, in-session difficulty ramp),
  **Redo Queue** (SM-2), **Error Log**, **Calibration** page (curve, Brier over time, flags,
  Confidence Index).
- **Test simulator**: six 75-minute mocks (2 standard, 4 hard, no repeats, 11 math + 1 coding),
  free navigation, flags, calculator, scratchpad, math-or-coding-first, no pausing, skip-rule
  nudge, lockdown rehearsal, score report; 3-in-18 pacing drills; pre-test checklist.
- **Mental math**: 120-second sprint, 80-in-8 with penalty scoring, operation drills, history,
  slowest-operations report, speed-tricks cheat sheet.
- **Market-making game** with adverse selection and a **Fermi estimation drill**.
- **Speak It Out** and **teach-it-back** (dictation opt-in), **interview simulator** with
  follow-ups and a self-scoring rubric.
- **Brainteaser bank**, **coding warmup** (JavaScript in-browser, Python via Pyodide on demand),
  **formula sheet** with the classic-families index (printable), **notebook**, **schedule
  planner**, **study timer**, **achievements**, **further reading**, **settings** with export,
  import and reset.

## Checks

- `npm run verify`: 380 items, 776 independent checks, all passing; 363 items verified by two
  or more independent methods. A source scan also rejects any KaTeX string that JavaScript
  would corrupt.
- `npm test`: 81 unit tests (parser, mastery, SM-2, calibration, planner, mental math, market
  game, coding reference solutions, store round trip).
- `npm run build`, `npm run typecheck`, `npm run lint`: clean (lint has advisory warnings only).
- Independent review reports for every module and both brainteaser halves are in `reviews/`.

## Known limits

- The official HackerRank sample test cannot be replicated here; take it from your invite.
- Fonts, the Monaco editor and the Python runtime load from CDNs on first use.
- Dictation depends on the browser (Chrome/Edge send audio to a cloud speech service; see
  Settings). Typing always works.
