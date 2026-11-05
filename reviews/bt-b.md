# Review: brainteasers B (bt-041 .. bt-080)

Independent second pass over `src/content/problems/brainteasersB.ts`. Every worked solution was
re-derived from the prompt; strategy claims, move sequences and all 40 variation answers were
recomputed by hand and, where a search was needed (bridge/raft/river crossings, jugs, the
jumping-queue schedule, Wythoff, the coin-row DP, the two-half-secrets dialogue and its variation,
the three subtraction games), by a scratch BFS/DP outside `src`.

**Summary: 40 items reviewed. 5 critical, 3 major, 6 minor. All fixed in the file. No stored
`answer` value was wrong; `src/content/verify/brainteasersB.ts` was not touched.**
After the edits: `npm run verify -- --module bt-b` prints "All 40 item(s) verified" (73/73 checks),
and `npx tsc --noEmit` reports no errors.

## Critical (wrong statement or wrong variation answer)

- **bt-076** — variationAnswer wrong. Removing W3 leaves letter W with the single slot W2, so
  Lena's "I can't place it" now also eliminates W (the stored answer ignored this). Live slots
  after Lena: K2, K5, K8, R3, R8; digits 2, 5, 3 each occur once, so Omar's statement leaves
  K2, K5, R3; Lena then knows only with letter R. The variation has the unique answer R3
  (digit 3), not "no unique answer". Fix: rewritten variationAnswer. (Confirmed by enumeration.)
- **bt-067** — `answer.exact` displayed `341 = (2^{10} + 1)/3`, which is not an integer; the
  closed form is `(2^{n+1} + (-1)^n)/3`, i.e. `(2^{10} - 1)/3 = 341` (the solution body had it
  right). Fix: `exact` corrected. Numeric `value` unchanged.
- **bt-064** — the solution's closing warning said the "0 or 2 mod 5" pattern "eventually breaks
  for this game". False for the game as stated: with moves restricted to 1, 4, 9, 16 (all
  congruent to +-1 mod 5) the pattern holds for every heap size (checked to 60). It breaks only in
  the general any-square game once 25 is allowed (34 is the first exception). Fix: paragraph
  rewritten to state both facts correctly.
- **bt-055** — wrong intermediate numbers: "continuing would take 4 more actions to reach (7,0)
  and 4 more to reach (6,0)". From (3,0) it is 2 more actions to (7,0) and then 6 more to (6,0),
  16 in all (which is what commonMistake already says). Fix: numbers corrected.
- **bt-054** — the optimality paragraph claimed "at least five crossings are forward and at least
  three are returns"; five people with a two-person ledge need at least four forward crossings
  and three returns (k forward trips leave at most k + 1 across), and the 29-minute schedule uses
  exactly 4 + 3 = 7 crossings, so the claim was wrong. Also `commonMistake` summed the all-escort
  plan as 1 + 12 + 1 + 8 + 1 + 6 + 1 + 3 = 33; the plan costs 12 + 1 + 8 + 1 + 6 + 1 + 3 = 32.
  Fix: paragraph rewritten with the correct bound and an honest appeal to the 64-state search;
  commonMistake corrected to 32 with the plan spelled out.

## Major (ambiguous prompt or misleading hint / mistake note)

- **bt-055** — hint 3 walked through the slow fill-small-pour-into-big route (the one that takes 16
  actions) and then asserted "the fastest route takes 8", pointing the student down the wrong
  branch at the give-it-away stage. Fix: hint 3 now walks the fill-9 / drain-through-4 route
  (9,0) (5,4) (5,0) (1,4) (1,0) (0,1) (9,1) (6,4) and asks for the count.
- **bt-059** — "a breadth-first search over the 630 reachable positions": 630 = 9!/(4!4!1!) is
  the number of all arrangements; only 195 are reachable under the one-way rules (BFS). Fix:
  reworded "630 possible arrangements (only 195 of which are reachable)". The 24-move schedule
  was simulated move by move and is valid with exactly 16 jumps and 8 slides.
- **bt-058** — the proof that no increasing subsequence of length 4 exists was garbled
  ("...and it would have to come after... impossible since they come before"). Fix: replaced
  with a clean two-case argument (any subsequence using D or F lives in D, F, E, length <= 2;
  any avoiding them lives in A, C, B, E, length <= 3).

## Minor (wording)

- **bt-053** — lower bound said "the dove must come back" after the second forward trip; the
  trainer could equally take the newly delivered item back (same count). Reworded to "either the
  dove or the item just delivered must ride back ... some item makes at least two forward trips".
- **bt-065** — the one-sentence justification that the listed pairs are exactly the cold
  positions was loose ("changes one coordinate or the difference to a value already owned by a
  smaller cold pair"). Tightened to the standard two-part argument and named the fact it relies on
  (each positive integer appears once among the coordinates).
- **bt-070** — "These decompositions are forced" overstated (the big disc could in principle move
  more often); reworded to say the big disc moves the minimum number of times and the search
  confirms extra moves never pay.
- **bt-060** — the bound "each forward trip adds at most 2 people" is only true because of the
  weights; added the justification (the three lightest weigh 140 > 130).
- **bt-076** — the three-line dialogue was a near-verbatim paraphrase of the famous
  "Cheryl's birthday" exchange. Reworded the three lines (same logical content). The solution text
  was already in the author's own words.
- **bt-054** — see commonMistake fix above (32, not 33), listed under critical.

## Checked and found correct (no change)

bt-041 (invariant and the (5,8,10) -> (0,0,23) sequence; variation (6,9,12): all three endings
reachable, BFS), bt-042, bt-043 (both colourings, pinwheel; variation 4x4: exactly the four
corners, exhaustive), bt-044, bt-045 (both parity branches; variation {1,4,7}), bt-046, bt-047,
bt-048 to bt-052 (all case analyses and variations), bt-053 (9, BFS), bt-054 answer 29 and
variation 31 (Dijkstra), bt-055 answer 8 and variation 10 (BFS), bt-056, bt-057 (both knight
paths legal), bt-058 (variation: 8 inversions), bt-059 (24; variation 15), bt-060 (7; variation
9, BFS), bt-061 (losing set 0,2 mod 7; misere variation 1,3,8,10,...), bt-062 (nim-sums),
bt-063 (full DP table re-derived; variation V(1,7) = 16, either end), bt-064 answer, bt-065
(unique winning move from (8,11) is -4/-4; (6,10) cold), bt-066, bt-067 count 341, bt-068 (274;
variation 110), bt-069 (57, Euler check), bt-070 (43/59), bt-071 (44; variation 42), bt-072
(153; variation 571), bt-073, bt-074, bt-075, bt-076 answer K5, bt-077 (3/2; variation 2),
bt-078, bt-079 (3/2; variation 2), bt-080 (variation 11/32).

Prompts: all rules needed were present (move definitions, boat/raft occupancy, who moves first
where it matters, what "cannot be determined" means). No ambiguity requiring a change was found.
