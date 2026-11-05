# Brainteaser bank A review (bt-001 .. bt-040, independent second pass)

Reviewed: 40 brainteasers. Every solution was re-derived from the prompt and compared line by line; every variationAnswer was recomputed independently (hand derivation plus a scratch script: weighing minimax, hat-strategy brute force, Catalan DP, leg-count sums, erase-two reachability). All 40 stored `answer` values are correct; nothing in `src/content/verify/brainteasersA.ts` was changed. Issues: 2 critical (wrong variation answers), 3 major (a solution step that fails as written, a mislabelled option, a misleading commonMistake), 7 minor (wording, one vague prompt quantity, one classic framing reworded). All fixed in place. After editing: `npm run verify -- --module bt-a` prints "All 40 item(s) verified" (77 checks passed), `npx tsc --noEmit` reports no errors.

## Issues

### bt-021 variationAnswer — critical (wrong variation answer), fixed
- Variation: three analysts, red/blue hats, *everyone* must announce and all must be right.
- Wrong: "(1/2)^3 = 1/8. No strategy helps." The marginal correctness of each guess is 1/2, but coordination can make the three guesses right or wrong *together*. Rule: announce the colour that makes the total number of blues even. If the true blue count is even all three are right, otherwise all three are wrong: 4 of 8 assignments win, probability 1/2, which matches the upper bound P(win) <= P(one fixed analyst right) = 1/2. Brute force over all 16^3 all-guess strategy profiles confirms the maximum is 4/8.
- Fix: variationAnswer now gives 1/2 with the parity strategy and explains why 1/8 is the independent-guess figure.

### bt-017 variationAnswer — critical (wrong statement), fixed
- Variation: 13 coins plus a reference coin, direction not required.
- Wrong: "two weighings ... can locate the counterfeit among at most (3^2 - 1)/2 = 4 coins even with a reference". With a reference coin, two weighings locate the odd coin among 5 (weigh suspects 1, 2 vs suspect 3 + reference; balance leaves {4, 5}, settled by 4 vs reference; a tilt leaves three known-direction candidates, settled by weighing the two that share a direction). 4 is the figure *without* a reference. Minimax search confirms: 2 weighings, find-only, max 4 coins without reference and 5 with; 3 weighings with reference find-only handles 14, direction-required 13.
- The conclusion "still 3" was right; only the supporting numbers were wrong. Fix: states 5 with reference (with the construction), 4 without, and that dropping direction raises the three-weighing capacity from 13 to 14.

### bt-017 solution, second-weighing follow-up — major (strategy step fails as written), fixed
- Wrong: "a final weighing of two of the three candidates against each other settles it (a tilt names the coin, a balance points to the third)". For the branch {H1 heavy, H2 heavy, L2 light} this is false if the two chosen are H1 and L2: a left tilt could be H1 heavy or L2 light. The final weighing must pair the two candidates that share a direction.
- Fix: the sentence now says to weigh the two same-direction candidates (H1 vs H2; any two of L3, L4, L5) and notes why a heavy/light pair would be ambiguous.

### bt-003 solution — major (mislabelled option, labels the correct option as wrong), fixed
- Wrong: "Option 2's 1/2 would be right only if ...". Option 2 is the correct answer (switch, 3/8); the 1/2 distractor is option 3.
- Fix: "Option 3's 1/2 ...", plus a note that with two lockers opened switching wins with 3/4, not 1/2 (consistent with the item's own variation).

### bt-034 commonMistake — major (misleading mistake note, contradicts the solution), fixed
- Wrong: "double-counting tilted squares by allowing both (a, b) and (b, a) with b >= 1". The side vectors (1, 2) and (2, 1) describe two genuinely different (mirror-image) squares, and the solution correctly counts both. The real double-counting risk is counting a square once per each of its four side vectors (a, b), (-b, a), (-a, -b), (b, -a).
- Fix: the note now names the four-fold over-count and says explicitly that (1, 2) and (2, 1) both count.

### bt-002 variationAnswer — minor (ambiguous wording), fixed
- "with 7 it is ~0.43" read as P(distinct) ~ 0.43, which is wrong (P(distinct) = 0.574 for 7 orders; 0.43 is the collision probability). Rewritten to name both probabilities for 7 and 8 orders.

### bt-006 solution — minor (garbled sentence), fixed
- "(if 3 is followed by 4, then 4 cannot also be preceded by something else that it follows)" did not parse. Replaced by a concrete dependence check: P(I_3 = 1 and I_4 = 1) = 6!/8! = 1/56, not 1/64.

### bt-019 prompt — minor (vague quantity), fixed
- "each contain many coins": the correct plan takes 512 coins from bag 10. Prompt now says "a large stock of coins, well over a thousand apiece".

### bt-022 prompt — minor (wording), fixed
- "sees every hat in front of them and none behind, including their own" (own hat is not "behind"). Now: "sees every hat in front of them, but not their own hat and none of the hats behind them."

### bt-036 solution, table recurrence — minor (wrong side condition), fixed
- "f(a, d) = f(a-1, d) + f(a, d-1) with the second term only when d - 1 <= a" is vacuous (d <= a already). The condition belongs to the first term: f(a-1, d) exists only when d <= a - 1. Fixed.

### bt-039 commonMistake — minor (vague parenthetical), fixed
- "(that is for a different operation rule)" did not explain why the gcd guess fails. Now says the gcd only divides every reachable final number and that |a - b| can raise the board's gcd ({3, 5} -> {2}).

### bt-040 prompt and text — minor (classic framing), reworded
- "Breaking a chocolate bar" with "break along a scored line" is the published puzzle's own framing. Reframed as tearing a 4 x 6 sheet of perforated postage stamps; logic, options, correct index and variation unchanged (verify check untouched, still passes).

## Checked and found correct (no change)

- Probability teasers (001-010): ghost argument and the case split for the maximum (3/4 * 90 + 1/4 * 67.5 = 675/8); birthday product 0.3785 and e^{-0.9} check; four-locker Bayes (1/4 vs 3/8 each); 30/91 and the 1 : q : q^2 shares; gambler's ruin 81/133 vs 9/19 and the r = 3/2 variation (0.120 vs 0.211); 7/8 steps and 7/4 either-order variation; (1 - 3a)^2 and the triangle variation 1/4; two-envelope prior argument and the (40,80)/(80,160) variation; martingale -0.4641 via both routes and the fair-coin 0 / 15/16; 1/k cycle argument with 8!/3 = 13440 and the 1/2 variation.
- Pigeonhole / extremal (011-015): worst cases are achievable and the +1 forces the conclusion; chain-of-six independent set 3 and the mod-6 variation 6 * 3 + 1 = 19; mod-3 triple argument (0, 0, 1, 1 avoids) and the "no finite n" pair variation; prefix-sum argument with S_0, the all-ones failure for 5 and the mod-10 variation; R(3,3) = 6 with the pentagon counterexample and R(3,4) = 9.
- Weighings (016-020): 7/7/6 then 3/3/1 or 2/2/2 then 1/1 works in every branch; 81 for four weighings; the 13-coin-plus-reference tree checked in all 26 cases after the fix above; 12-coin bound (2m <= 9, 2(n - 2m) <= 9) and 13 for find-only; pair sums 1 + 4 = 2 + 3 collision and powers of two (1023 coins for the any-subset variation); sorting 5 in 7 (merge-insertion traced through both cases of where e lands) and max+min in 6 (minimax search confirms 6).
- Hats (021-024): the A/2-wrong-announcements bound and the odd-one-out strategy give exactly 6/8; mod-3 checksum saves 6 of 7 with any number of colours; residue trick wins all 27 and 3/4 for four values (48/64 by enumeration); two-player match/differ pairing and the three-player extension.
- Number puzzles (025-030): 3980 (tails 80/60/40/20 give 3980, 5960, 7960, 9920) and 875 for 25; 182 and 121; 105 - 30 = 75 (direct digit check also 75) and 560 - 80 = 480; z(45) = 10 and z(125) = 31; 3^2026 mod 7 = 4 and last digit of 7^2026 = 9; 200 occurrences and 176 numbers containing a 3.
- Logic (031-032): both knights-and-knaves deductions and their variations checked against all 8 / 64 assignments; the 1..6 answers variation is genuinely undetermined.
- Grid / lattice (033-038): 10 * (70 - 36) = 340 and the irrelevant (2, 4) closure; 14 + 6 = 20 squares and 50 for 5 x 5; 210 - 50 = 160 and 26 blocks of area 6; Catalan 42 and 132 for a queue starting at 1 (DP confirms); leg-count row sums 320, 6048, 37920, 110000, 162540, 118950, 34232 = 470010, diagonal 1, 2, 14, 106, 838, 6802, 56190, 470010, and the alternating-leg variation 3432 = C(14, 7).
- Invariants (039-040): parity and max monovariant; reachable finals {0, 2, 4, 6, 8} for 1..8 and {1, 3, 5, 7, 9} for 1..9 (all five constructed and confirmed by search); 23 tears forced; the stacked variation's 5-tear schedule works and matches the log2 bound.
- Prompts: host behaviour (003), heavier-only vs unknown direction (016-018), reference coin availability, what players see and whether silence is allowed (021-024), one-coin-vs-one-coin comparisons (020), single use of the digital scale (019), fixed stake (005), stopping rule (009) are all stated. No prompt was found that a strong student could read two ways.
- Originality: classic ideas (ants on a stick, Monty Hall, two envelopes, 12 coins, Ramsey, hat parity, Catalan) are in Edgework's own words with new numbers and framings; only bt-040 kept the published puzzle's framing and was reworded.
