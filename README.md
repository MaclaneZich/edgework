# Edgework

Interview prep for quantitative trading assessments. Built for the Susquehanna Discovery
Program HackerRank test (75 minutes, 12 questions: 11 math/probability/logic plus 1 coding,
calculator allowed) and the live interviews that follow at SIG, Optiver, Jane Street, IMC and
Citadel Securities. About twenty hours of use takes someone with no probability background to
test-ready, then keeps stretching them with harder material.

Everything is local-first. Progress lives in your browser (IndexedDB with a localStorage
fallback) and can be exported and imported as JSON from Settings. An optional account syncs
that progress across devices; see "Accounts and sync" below.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000. Other scripts:

| Script | What it does |
|---|---|
| `npm run verify` | Independently re-computes every problem's answer (enumeration, seeded simulation, formula, recursion, exhaustive search) and fails loudly on any mismatch. Add `-- --module 3` for one module, `-- --module bt` for the brainteasers, `-- --report` to write `content-report.json`. |
| `npm test` | Vitest unit tests: answer parser, Elo mastery, SM-2 scheduler, calibration metrics, schedule planner, mental math generators, market game, coding reference solutions. |
| `npm run build` | Production build. |
| `npm run lint` / `npm run typecheck` | ESLint and `tsc --noEmit`. |

Requires Node 20.9 or newer. Fonts load from Google Fonts and the Monaco editor and Pyodide
(Python runtime for the coding warmup) load from public CDNs on first use; everything else is
bundled, and the app works offline once loaded except those three.

## What is inside

- Ten modules (counting; probability basics; conditional probability and Bayes; expectation and
  linearity; variance, distributions and approximations; first-step analysis and recursion;
  betting, EV decisions and games; market-making and estimation; logic and brainteasers; test
  simulation and coding warmup). Each has an interactive lesson, practice sets by difficulty, a
  mastery quiz, and a hard set (difficulty 4-5) that unlocks after the quiz.
- Confidence-calibrated practice: every answer is preceded by a confidence pick, feeding a
  calibration curve, Brier score, per-tag over/under-confidence flags and a Confidence Index.
- Adaptive engine: Elo-style mastery per tag, SM-2 spaced repetition for misses, Smart Sessions
  that target weak tags and ramp difficulty.
- Test simulator: 75-minute, 12-question mocks (2 standard, 4 hard, no repeats), free
  navigation, flags, calculator, scratchpad, one coding question with client-side tests,
  lockdown rehearsal, pacing nudges, score report; plus 3-in-18 drills and a pre-test checklist.
- Mental math trainer (Zetamac-style sprint, 80-in-8 with penalty scoring, drills, cheat sheet).
- Market-making game against a bot with adverse selection, and a Fermi estimation drill.
- Speak-It-Out and teach-it-back (Web Speech API, opt-in), interview simulator with follow-ups.
- Error log with mistake categories, Redo Queue, per-module notebook with KaTeX, searchable and
  printable formula sheet with the classic problem families, schedule planner that rebalances,
  Pomodoro study timer, achievements, further reading.

## Voice and privacy

Dictation uses the browser's `SpeechRecognition` API and is off by default. In Chrome and Edge
the audio is sent to Google's or Microsoft's speech service for transcription; Safari transcribes
on-device where available. Reading problems aloud uses `speechSynthesis`, which stays on the
device. Both are toggled in Settings; typing is always available.

## Accounts and sync

Accounts are optional. Signed out, nothing leaves the browser. Signed in (the Account page),
the whole progress document is also saved to the account and loaded on other devices.

- Storage is a private Vercel Blob store connected to the project. The route handlers under
  `src/app/api` read `BLOB_READ_WRITE_TOKEN`, which Vercel sets when the store is connected.
  Without it the Account page says accounts are unavailable and the app stays local-only.
  For local development run `npx vercel env pull .env.local`.
- Passwords are hashed with scrypt. Sessions are random tokens in an httpOnly cookie; the
  store keeps only their SHA-256. There is no email verification and no password reset.
- Sync is whole-document with a version check (`src/lib/sync.ts`, rules in
  `src/lib/syncLogic.ts`). Local changes upload about ten seconds after the last change.
  If a device and the account both hold changes the other has not seen, the app asks which
  copy to keep. It never merges and never silently replaces a copy that has progress.

## Content authoring

All lessons, problems, hints and solutions are original text written for Edgework. Classic
puzzle families appear as concepts with new framings and numbers. The full standard is in
[CONTENT_GUIDE.md](CONTENT_GUIDE.md); the schema is in `src/content/types.ts`.

### How to add a problem

1. Open `src/content/problems/m{N}.ts` (or `brainteasersA.ts` / `brainteasersB.ts`) and append a
   `Problem` object. Use the next id in the module (`m3-p29`), `kind: "practice"`, a difficulty
   from 1 to 5, tags from `TAGS` in `types.ts`, an honest `minutes` estimate, a prompt, an exact
   `answer` (`value` as an expression such as `7 / 36`, `exact` as KaTeX), three progressive
   hints, a full worked solution, 3-6 `steps`, `keyIdea`, `commonMistake`, `fastPath`,
   `variation` and `variationAnswer`, and `verifiedBy`.
2. Open `src/content/verify/m{N}.ts` and add one or more independent checks under the same id:
   an enumeration over the real sample space, a seeded simulation (`simulateProb` /
   `simulate` with the runner's `rng`, at least a million trials for probabilities), a
   formula, a recursion (`solveLinear`, `expectedRewardByIteration`) or an exhaustive search.
   `verifiedBy` must list exactly the methods you implemented.
3. Run `npm run verify -- --module N` until it reports zero failures, then `npm run typecheck`.
4. The problem appears automatically in the module's practice sets, the Smart Session pool,
   mocks (by module and difficulty), the interview simulator and Speak-It-Out.

### How to edit a lesson

`src/content/modules/m{N}.ts` exports a `Lesson`: intro, concept cards (each card can carry a
display `formula` and an `example`), worked examples whose `steps` reveal one at a time, a
`tryIt` mini problem, `checkIds` for the lesson checks, `formulas` (these feed the formula
sheet automatically) and an outro.

### Independent review

Besides `npm run verify`, every module went through a separate review pass that re-derived each
worked solution step by step; the reports are in `reviews/`.

## Project layout

```
src/app/          routes (App Router)
src/components/   UI primitives, session runner, mock simulator, shell
src/lib/          answer parser, mastery, SM-2, calibration, planner, mocks, mental math,
                  market game, store (Zustand + IndexedDB), code runner, speech hooks
src/content/      lessons, problems, verification specs, coding problems, Fermi questions,
                  families, further-reading metadata
scripts/verify.ts the verification runner
```
