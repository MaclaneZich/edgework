# Edgework content authoring guide

This guide is the contract for everyone (people or agents) who writes lessons and
problems. Read `src/content/types.ts` first; it is the source of truth for the schema.

## Ground rules

1. **Original text only.** Every prompt, hint, solution, lesson paragraph and note is written
   fresh for Edgework. Do not reproduce or closely paraphrase problems or passages from any
   book, website or course. Classic *ideas* (Monty Hall, coupon collector, gambler's ruin,
   expected flips to HH vs HT, birthday collisions, hat puzzles, ants on a stick, ...) are
   fine as concepts: use a new framing (a trading desk, a lab, a tournament, a card game you
   invented), new numbers, and your own words. Never copy a problem statement or a solution.
2. **A wrong solution is worse than a missing problem.** Compute every answer two ways. If
   the two routes disagree, fix the problem or drop it.
3. **Exact answers.** `answer.value` is the exact JS expression (`1 - Math.pow(5 / 6, 5)`,
   `7 / 36`, `1 / Math.E`), never a rounded decimal. Put the exact closed form in
   `answer.exact` as KaTeX, with a decimal approximation after `\approx` when helpful.
4. **Tolerance.** Leave `tolerance` out unless the default is wrong. Default: exact match for
   integer answers with |value| >= 1, otherwise 1% of |value|. Set `tolerance` explicitly
   for estimates ("to the nearest tenth") or for rounded currency.
5. **KaTeX.** Use `$...$` inline and `$$...$$` for display inside prompts, hints, solutions
   and cards. Wrap EVERY string that contains a backslash (hints included) in
   `String.raw\`...\``; in a plain "..." string JavaScript eats `rac` into a form feed and
   `rac`, and `npm run verify` now fails on any such string. Do not put backticks or `${`
   inside those strings.
6. **Multiple choice** only when the answer is not a number (a strategy, a comparison, a
   logical conclusion). 3-5 options, distinct, plausible, with `correct` as the 0-based index.
   The verification check for a choice answer returns the correct index after checking the
   claim behind it (for example by enumerating the strategies).

## Problem fields and style

- `id`: `m{N}-p{nn}` for practice (two digits, from 01), `m{N}-lc{n}` for lesson checks,
  `bt-{nnn}` for brainteasers.
- `difficulty` 1-5: 1 = one definition, under a minute; 2 = one idea, two steps; 3 = the
  level of the real test; 4 = multi-step, a trap, or a non-obvious model; 5 = genuinely hard,
  the kind that separates candidates in a live interview.
- `minutes`: honest estimate for a prepared candidate (1-10 for most).
- `tags`: from `TAGS` in `types.ts`. First tag = the main skill. Add cross-cutting tags
  (`dice`, `cards`, `complement`...) when they apply.
- `title`: a short label without math, e.g. "Three dice, no repeats".
- `prompt`: self-contained, unambiguous, states what to report (probability as a number,
  expected value in dollars, a count). Say "fair", "independent", "with replacement" when it
  matters. Never leave the sample space ambiguous.
- `hints`: three, progressive. Hint 1 points at the idea, hint 2 sets up the first step,
  hint 3 nearly gives it away.
- `solution`: a full worked solution, paragraphs separated by blank lines, every step
  justified, ending with the exact answer and a decimal. Mention the alternative route if
  there is a nice one.
- `steps`: 3-6 short checklist items naming the key moves (used as a self-grading checklist
  when the student explains aloud).
- `keyIdea`: one sentence.
- `commonMistake`: the specific error people make under time pressure.
- `fastPath`: how to get the number fastest in an exam (which simplification, which mental
  arithmetic), two or three sentences at most.
- `variation`: an interviewer follow-up that changes one assumption (biased coin, more dice,
  without replacement, a different payout). `variationAnswer`: the answer or a sketch.
- `family`: id from `src/content/families.ts` when the problem belongs to a classic family.
- `verifiedBy`: exactly the methods implemented in `src/content/verify/m{N}.ts`.

## Verification (`src/content/verify/m{N}.ts`)

For every problem add one or more checks. The runner seeds the rng per problem and method;
never use `Math.random`.

- `enumeration`: brute force over the whole sample space (dice tuples, permutations,
  subsets, masks). Use `forEachDice`, `forEachTuple`, `forEachPermutation`,
  `forEachSubset`, `forEachMask` from `helpers.ts`. Keep it under a few million states.
- `simulation`: `simulateProb(rng, trials, event)` or `simulate(rng, trials, trial)` returning
  `{ value, se }`. Use at least 1,000,000 trials for probabilities and 300,000+ for expected
  values; the runner fails a check whose 6·se exceeds 1% of the answer. Small probabilities
  (below about 0.15) need proportionally more trials, or use an exact second route instead.
- `formula`: an independent closed form (a different one from the solution's main route when
  possible, e.g. inclusion-exclusion vs direct count).
- `recursion` / `dp`: first-step equations solved with `solveLinear` or value iteration with
  `expectedRewardByIteration`, or a table filled from base cases.
- `exhaustive-search`: for logic puzzles, enumerate all assignments/strategies and check the
  claim.

Aim for two independent methods on at least 80% of problems. Run
`npm run verify -- --module N` until it reports zero failures, then `npx tsc --noEmit`
and fix any error in your files.

## Lessons (`src/content/modules/m{N}.ts`)

- `intro`: 2-4 paragraphs: why this topic matters on the test and the desk, what you will be
  able to do after the lesson.
- `cards`: 6-9 concept cards. Each `body` is 2-5 short paragraphs or bullets with the
  definition, when to use it, and a tiny example; `formula` holds the display formula;
  `example` is one line of intuition.
- `workedExamples`: 2 examples with 3-6 steps each that reveal one at a time; each step is
  one sentence plus optional display math.
- `tryIt`: a mini problem of difficulty 1-2 with a full solution.
- `checkIds`: the module's four lesson checks (`m{N}-lc1`..`lc4`), difficulty 1-2, one minute each.
- `formulas`: 6-12 entries for the searchable formula sheet.
- `outro`: how interviewers probe this topic and what to practise next.

## Tone

Clear, direct, slightly warm. Write like a strong friend explaining at a whiteboard, not
like a textbook. Short sentences. Name the trap before the student falls into it.
