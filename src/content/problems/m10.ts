import type { Problem } from "../types";

/**
 * Module 10: Test simulation and coding warmup (mixed review).
 * 18 practice problems (d1: 2, d2: 5, d3: 6, d4: 3, d5: 2) and four lesson checks.
 * The problems mirror the mix of the real test: counting, Bayes, expectation, distributions,
 * first-step analysis, EV decisions, logic and simulation thinking. Every answer is confirmed
 * by independent routes in content/verify/m10.ts.
 */
export const problems: Problem[] = [
  // ---------------------------------------------------------------- counting / complement
  {
    id: "m10-p01",
    module: 10,
    kind: "practice",
    difficulty: 1,
    tags: ["mixed-review", "complement", "independence"],
    minutes: 1,
    title: "Someone out on the desk",
    prompt: String.raw`A trading desk has 8 traders. On any given day each trader is absent with probability 0.1, independently of the others. What is the probability that at least one trader is absent tomorrow?`,
    answer: { type: "numeric", value: 1 - Math.pow(0.9, 8), exact: String.raw`1 - 0.9^8 = 0.56953279 \approx 0.5695` },
    hints: [
      "'At least one' is a signal to look at the event that nobody is absent.",
      "Each trader is present with probability 0.9, and the traders are independent.",
      String.raw`Subtract $0.9^8$ from 1.`,
    ],
    solution: String.raw`The event 'at least one absent' has eight cases (one absent, two absent, and so on). Its complement, 'nobody is absent', is a single event, so compute that and subtract.

Each trader is present with probability $1 - 0.1 = 0.9$. The traders are independent, so the probability that all eight are present is the product $0.9^8$. On the calculator: $0.9^2 = 0.81$, $0.9^4 = 0.6561$, $0.9^8 = 0.6561^2 = 0.43046721$.

Therefore $P(\text{at least one absent}) = 1 - 0.9^8 = 0.56953279 \approx 0.5695$. Sanity check: with an expected $0.8$ absences per day, a little over a coin flip for 'someone is out' is the right order of magnitude. Answer: $1 - 0.9^8 \approx 0.570$.`,
    steps: [
      "Translate 'at least one' into 'one minus the probability of none'.",
      "Use independence: P(all present) = 0.9 to the power 8.",
      "Compute 0.9^8 = 0.4305 and subtract from 1.",
    ],
    keyIdea: "'At least one' means compute the probability of none and subtract from one.",
    commonMistake: String.raw`Adding $0.1$ eight times to get $0.8$; the absences overlap, so the simple sum overcounts and would exceed 1 with more traders.`,
    fastPath: String.raw`$0.9^8$: square three times, $0.81 \to 0.656 \to 0.430$. Answer $\approx 0.57$.`,
    variation: "Each trader is absent with probability 0.1, but if the head trader is absent the two juniors always stay in. How does the model change?",
    variationAnswer: "The independence assumption fails; you would need the joint distribution of absences. The complement idea still works, but P(nobody absent) can no longer be written as a product.",
    family: "at-least-one",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m10-p02",
    module: 10,
    kind: "practice",
    difficulty: 2,
    tags: ["mixed-review", "complement", "urns", "combinations"],
    minutes: 3,
    title: "Both colours among four chips",
    prompt: String.raw`A bag holds 7 green chips and 5 orange chips. You draw 4 chips at random without replacement. What is the probability that the draw contains at least one chip of each colour?`,
    answer: {
      type: "numeric",
      value: 1 - (35 + 5) / 495,
      exact: String.raw`1 - \frac{\binom{7}{4} + \binom{5}{4}}{\binom{12}{4}} = 1 - \frac{40}{495} = \frac{91}{99} \approx 0.9192`,
    },
    hints: [
      "The complement of 'both colours appear' is 'all four chips are the same colour'.",
      String.raw`Count four-chip draws that are all green, and separately all orange, out of $\binom{12}{4}$ equally likely draws.`,
      String.raw`$\binom{7}{4} = 35$, $\binom{5}{4} = 5$, $\binom{12}{4} = 495$.`,
    ],
    solution: String.raw`All $\binom{12}{4} = 495$ four-chip subsets are equally likely. The event we want, 'at least one green and at least one orange', has three cases (1, 2 or 3 greens). The complement, 'all one colour', has two disjoint cases and is quicker.

All four green: choose 4 of the 7 green chips, $\binom{7}{4} = 35$ ways. All four orange: choose 4 of the 5 orange chips, $\binom{5}{4} = 5$ ways. These cannot both happen, so the complement has $35 + 5 = 40$ draws and probability $\frac{40}{495} = \frac{8}{99}$.

Hence $P(\text{both colours}) = 1 - \frac{8}{99} = \frac{91}{99} \approx 0.9192$. The direct route agrees: $\binom{7}{1}\binom{5}{3} + \binom{7}{2}\binom{5}{2} + \binom{7}{3}\binom{5}{1} = 70 + 210 + 175 = 455$ and $\frac{455}{495} = \frac{91}{99}$. Answer: $\frac{91}{99} \approx 0.919$.`,
    steps: [
      "Set the denominator: C(12,4) = 495 equally likely draws.",
      "Identify the complement: all green or all orange, two disjoint cases.",
      "Count 35 + 5 = 40 single-colour draws.",
      "Subtract: 1 - 40/495 = 91/99.",
    ],
    keyIdea: "'Every colour appears' is the complement of 'a single colour', which is a short disjoint sum.",
    commonMistake: String.raw`Using $\left(\frac{7}{12}\right)^4$ for all green, which assumes replacement; without replacement the count is $\binom{7}{4}$.`,
    fastPath: String.raw`$1 - (35 + 5)/495 = 1 - 8/99$. About $0.92$.`,
    variation: "Same bag, but the four chips are drawn with replacement. What is the probability that both colours appear?",
    variationAnswer: String.raw`$1 - \left(\frac{7}{12}\right)^4 - \left(\frac{5}{12}\right)^4 = 1 - \frac{2401 + 625}{20736} = \frac{17710}{20736} \approx 0.854$.`,
    family: "at-least-one",
    verifiedBy: ["enumeration", "simulation"],
  },

  // ---------------------------------------------------------------- conditional / Bayes
  {
    id: "m10-p03",
    module: 10,
    kind: "practice",
    difficulty: 2,
    tags: ["mixed-review", "bayes", "total-probability"],
    minutes: 3,
    title: "Flagged by the fraud screen",
    prompt: String.raw`At a brokerage, 2% of new accounts are fraudulent. An automated screen flags 95% of fraudulent accounts and also flags 6% of legitimate accounts. A new account has just been flagged. What is the probability that it is fraudulent?`,
    answer: {
      type: "numeric",
      value: (0.02 * 0.95) / (0.02 * 0.95 + 0.98 * 0.06),
      exact: String.raw`\frac{0.02 \cdot 0.95}{0.02 \cdot 0.95 + 0.98 \cdot 0.06} = \frac{190}{778} = \frac{95}{389} \approx 0.2442`,
    },
    hints: [
      "Imagine 10,000 accounts and count how many of each kind get flagged.",
      "Of 200 fraudulent accounts, 190 are flagged. How many of the 9,800 legitimate accounts are flagged?",
      "Divide the flagged frauds by all flagged accounts: 190 / (190 + 588).",
    ],
    solution: String.raw`Work with a population of 10,000 accounts so that every number is a count. Fraudulent accounts: $0.02 \cdot 10{,}000 = 200$; legitimate: $9{,}800$.

The screen flags $0.95 \cdot 200 = 190$ of the fraudulent accounts and $0.06 \cdot 9{,}800 = 588$ of the legitimate ones. So $190 + 588 = 778$ accounts are flagged in total, and among those, 190 are fraudulent.

The question conditions on the flag, so the answer is $\frac{190}{778} = \frac{95}{389} \approx 0.2442$. This is Bayes' rule, $P(F \mid \text{flag}) = \frac{P(\text{flag} \mid F)P(F)}{P(\text{flag})}$, with the denominator from the law of total probability. Sanity check: the posterior $0.24$ is far above the prior $0.02$, as it should be after a positive signal, but far below $0.95$ because the false flags from the large legitimate population outnumber the true flags three to one. Answer: $\frac{95}{389} \approx 0.244$.`,
    steps: [
      "Fix a population of 10,000 and split it into 200 fraudulent and 9,800 legitimate.",
      "Count flags in each group: 190 true flags, 588 false flags.",
      "Divide true flags by all flags: 190/778.",
      "Sanity check: between the prior 0.02 and the sensitivity 0.95, closer to the prior.",
    ],
    keyIdea: "Condition on what you observed (the flag), not on what you want to know; a table of counts makes the denominator obvious.",
    commonMistake: "Answering 0.95, the probability of a flag given fraud, instead of the probability of fraud given a flag.",
    fastPath: "Per 10,000: 190 true flags, 588 false flags. 190 over 778 is just under a quarter.",
    variation: "The compliance team tunes the screen so that it flags only 3% of legitimate accounts, keeping 95% sensitivity. What is the new posterior?",
    variationAnswer: String.raw`False flags fall to 294, so $P(F \mid \text{flag}) = \frac{190}{190 + 294} = \frac{190}{484} \approx 0.393$.`,
    family: "false-positive",
    verifiedBy: ["formula", "simulation"],
  },
  {
    id: "m10-p04",
    module: 10,
    kind: "practice",
    difficulty: 3,
    tags: ["mixed-review", "monty-hall", "conditional"],
    minutes: 4,
    title: "Four boxes and a host who knows",
    prompt: String.raw`A bonus voucher is hidden in one of four identical closed boxes, each equally likely. You point to one box. The host, who knows where the voucher is, then opens one of the other three boxes that he knows to be empty, choosing uniformly at random whenever more than one empty box is available to him. He then offers to let you move your choice to either of the two remaining closed boxes. What should you do?`,
    answer: {
      type: "choice",
      options: [
        String.raw`Stay: your first box wins with probability $\tfrac{1}{4}$ and no switch can beat that`,
        String.raw`Switch to either other closed box: each of them wins with probability $\tfrac{3}{8}$`,
        String.raw`Switch: each other closed box now wins with probability $\tfrac{1}{2}$`,
        String.raw`It does not matter: all three closed boxes now win with probability $\tfrac{1}{3}$`,
      ],
      correct: 1,
    },
    hints: [
      "Your first pick is right with probability 1/4, and nothing the host does changes where the voucher already is.",
      "With probability 3/4 the voucher is among the other three boxes. The host removes one empty box from that group, leaving two closed boxes that together hold that 3/4.",
      "Split the 3/4 evenly between the two remaining boxes.",
    ],
    solution: String.raw`Fix the moment you point to a box. The voucher is in your box with probability $\frac{1}{4}$ and in one of the other three with probability $\frac{3}{4}$. The host always opens an empty box among the other three, whatever the truth is, so his action carries no information about your own box: staying wins with probability $\frac{1}{4}$.

Now consider the two closed boxes you did not pick. Together they hold the voucher with probability $\frac{3}{4}$ (the opened box is empty by the host's rule). By symmetry of the host's uniform choice, neither remaining box is favoured, so each wins with probability $\frac{1}{2} \cdot \frac{3}{4} = \frac{3}{8}$.

Sanity check: the three closed boxes have probabilities $\frac{1}{4} + \frac{3}{8} + \frac{3}{8} = 1$, as they must. Switching raises your chance from $0.25$ to $0.375$, so the correct action is to switch to either of the other closed boxes, each of which wins with probability $\frac{3}{8}$. Option 3 ($\frac{1}{2}$) cannot be right: your own box still holds $\frac{1}{4}$, so the two other closed boxes have only $\frac{3}{4}$ to share between them, not the whole probability. Option 4 forgets that the host's rule treats your box differently from the others.`,
    steps: [
      "Fix P(voucher in your box) = 1/4; the host's rule never touches your box.",
      "The other two closed boxes share the remaining 3/4.",
      "Split 3/4 evenly by symmetry: 3/8 each.",
      "Check the three probabilities sum to 1, then switch.",
    ],
    keyIdea: "A host constrained to open an empty box you did not pick leaves your box's probability alone and concentrates the rest on the boxes still closed.",
    commonMistake: "Resetting every closed box to 1/3 as if the host had opened a random box; his choice was constrained, so the boxes are not symmetric.",
    fastPath: "Stay 1/4; the other 3/4 splits over two boxes, 3/8 each. Switch.",
    variation: "Same setup, but the host opens two empty boxes among the three you did not pick. What is the switching probability now?",
    variationAnswer: String.raw`The whole $\frac{3}{4}$ sits on the single remaining closed box: switching wins with probability $\frac{3}{4}$.`,
    family: "monty-hall",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m10-p05",
    module: 10,
    kind: "practice",
    difficulty: 4,
    tags: ["mixed-review", "sequential-updating", "bayes"],
    minutes: 5,
    title: "Will the signal be right tomorrow?",
    prompt: String.raw`A new signal predicts each day whether a stock closes up or down. Before seeing any data you believe, with probability 1/4, that it is skilled and calls each day correctly with probability 0.6, independently across days; otherwise (probability 3/4) it is useless and is correct with probability 0.5 each day. Over its first four days it is right, right, right, wrong. Given this record, what is the probability that its call for day five is correct?`,
    answer: {
      type: "numeric",
      value:
        (0.25 * Math.pow(0.6, 3) * 0.4 * 0.6 + 0.75 * Math.pow(0.5, 4) * 0.5) /
        (0.25 * Math.pow(0.6, 3) * 0.4 + 0.75 * Math.pow(0.5, 4)),
      exact: String.raw`\frac{0.25 \cdot 0.6^3 \cdot 0.4 \cdot 0.6 + 0.75 \cdot 0.5^4 \cdot 0.5}{0.25 \cdot 0.6^3 \cdot 0.4 + 0.75 \cdot 0.5^4} = \frac{4853}{9130} \approx 0.5315`,
    },
    hints: [
      "Two steps: update the probability that the signal is skilled, then average the two accuracy rates with the updated weights.",
      String.raw`Likelihood of the record RRRW: $0.6^3 \cdot 0.4 = 0.0864$ if skilled, $0.5^4 = 0.0625$ if useless. Prior odds are 1 to 3.`,
      String.raw`Posterior P(skilled) $= \frac{0.0864}{0.0864 + 3 \cdot 0.0625} \approx 0.315$; then $0.315 \cdot 0.6 + 0.685 \cdot 0.5$.`,
    ],
    solution: String.raw`The question asks for a prediction, not a posterior, so plan two steps: first update the belief about the signal, then use the updated belief to forecast day five.

**Step 1: update.** The record right, right, right, wrong has likelihood $0.6^3 \cdot 0.4 = 0.0864$ under 'skilled' and $0.5^4 = 0.0625$ under 'useless'. Prior odds skilled : useless are $1 : 3$. Multiply by the likelihood ratio: posterior odds $= \frac{0.0864}{3 \cdot 0.0625} = \frac{0.0864}{0.1875} = 0.4608$. So $P(\text{skilled} \mid \text{record}) = \frac{0.4608}{1.4608} \approx 0.3154$ and $P(\text{useless} \mid \text{record}) \approx 0.6846$.

**Step 2: predict.** By the law of total probability, $P(\text{right on day 5} \mid \text{record}) = 0.3154 \cdot 0.6 + 0.6846 \cdot 0.5 = 0.1893 + 0.3423 \approx 0.5315$. Equivalently $0.5 + 0.1 \cdot P(\text{skilled} \mid \text{record})$, because the skilled signal adds exactly $0.1$ to the accuracy.

In exact terms the answer is $\frac{0.25 \cdot 0.0864 \cdot 0.6 + 0.75 \cdot 0.0625 \cdot 0.5}{0.25 \cdot 0.0864 + 0.75 \cdot 0.0625} = \frac{4853}{9130} \approx 0.5315$. Sanity check: it lies between $0.5$ and $0.6$, and closer to $0.5$ because the record left 'useless' as the more likely state. Answer: $\frac{4853}{9130} \approx 0.532$.`,
    steps: [
      "Recognise a two-stage question: update, then predict.",
      "Compute the likelihoods 0.0864 and 0.0625 and the prior odds 1:3.",
      "Posterior odds 0.4608, so P(skilled) is about 0.315.",
      "Average the accuracies 0.6 and 0.5 with the posterior weights.",
      "Sanity check: between 0.5 and 0.6, nearer 0.5.",
    ],
    keyIdea: "A forecast after evidence is the posterior-weighted average of the model forecasts, not the posterior itself.",
    commonMistake: String.raw`Stopping at the posterior $0.315$, or answering $0.6$ because 'the signal is skilled'; the forecast must average over both states.`,
    fastPath: String.raw`Odds $1:3$ times $0.0864/0.0625 = 1.38$ gives $0.46:1$, so P(skilled) $\approx 0.315$. Answer $0.5 + 0.1 \cdot 0.315 \approx 0.53$.`,
    variation: "Suppose the four days had been right, right, right, right. What is the probability the day-five call is correct?",
    variationAnswer: String.raw`Posterior odds $\frac{0.6^4}{3 \cdot 0.5^4} = \frac{0.1296}{0.1875} = 0.6912$, so P(skilled) $\approx 0.409$ and the forecast is $0.5 + 0.1 \cdot 0.409 \approx 0.541$.`,
    family: "sequential-updating",
    verifiedBy: ["formula", "simulation"],
  },

  // ---------------------------------------------------------------- expectation
  {
    id: "m10-p06",
    module: 10,
    kind: "practice",
    difficulty: 3,
    tags: ["mixed-review", "indicators", "linearity"],
    minutes: 3,
    title: "Consecutive numbers side by side",
    prompt: String.raw`Eight tickets numbered 1 through 8 are shuffled into a uniformly random order and laid out in a row. Count the positions at which a ticket is immediately followed, on its right, by the ticket with the next higher number (for example a 3 directly followed by a 4). What is the expected count?`,
    answer: { type: "numeric", value: 7 / 8, exact: String.raw`7 \cdot \frac{1}{8} = \frac{7}{8} = 0.875` },
    hints: [
      "Write the count as a sum of indicators, one for each pair of consecutive numbers (1,2), (2,3), ..., (7,8).",
      "For a fixed pair, say (3,4), what is the probability that 4 sits immediately to the right of 3 in a random order of 8?",
      String.raw`Glue 3 and 4 into one block: $7!$ of the $8!$ orders have the block, so the probability is $\frac{1}{8}$. Add seven of these.`,
    ],
    solution: String.raw`Let $I_i$ be the indicator that ticket $i + 1$ sits immediately to the right of ticket $i$, for $i = 1, \dots, 7$. The count in the question is $I_1 + \dots + I_7$, and by linearity of expectation its mean is $\sum_i P(I_i = 1)$, whether or not the indicators are independent (they are not).

For a fixed $i$, glue tickets $i$ and $i + 1$ into a single block in that order. The block and the other six tickets can be arranged in $7!$ ways, out of $8!$ equally likely orders, so $P(I_i = 1) = \frac{7!}{8!} = \frac{1}{8}$. A second view: ticket $i$ is not in the last position with probability $\frac{7}{8}$, and then its right neighbour is equally likely to be any of the other 7 tickets, so $\frac{7}{8} \cdot \frac{1}{7} = \frac{1}{8}$.

Summing seven identical terms gives $E[\text{count}] = 7 \cdot \frac{1}{8} = \frac{7}{8} = 0.875$. Sanity check: the count lies between 0 and 7, and an answer below 1 is reasonable since any given adjacency is rare. Answer: $\frac{7}{8}$.`,
    steps: [
      "Define one indicator per consecutive pair (1,2) to (7,8).",
      "Compute P(pair adjacent in order) = 7!/8! = 1/8 by gluing.",
      "Sum seven indicators by linearity: 7/8.",
      "Check: dependence between indicators does not matter for the mean.",
    ],
    keyIdea: "Linearity turns a dependent count into a sum of easy per-pair probabilities.",
    commonMistake: String.raw`Using $\frac{1}{7}$ per pair (the neighbour probability without the $\frac{7}{8}$ chance of having a right neighbour) or counting both orders of the pair, which doubles the answer.`,
    fastPath: "Seven pairs, each adjacent in the right order with probability 1/8: 7/8.",
    variation: "Count pairs of consecutive numbers that are adjacent in either order (a 4 then a 3 also counts). Expected count?",
    variationAnswer: String.raw`Each pair is adjacent in some order with probability $\frac{2}{8} = \frac{1}{4}$, so $7 \cdot \frac{1}{4} = \frac{7}{4}$.`,
    family: "linearity-of-expectation",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m10-p07",
    module: 10,
    kind: "practice",
    difficulty: 4,
    tags: ["mixed-review", "expectation", "order-statistics", "cards"],
    minutes: 5,
    title: "Position of the second red card",
    prompt: String.raw`A 12-card deck contains exactly 3 red cards and 9 black cards. The deck is shuffled uniformly and dealt one card at a time. Let $T$ be the position of the second red card dealt, so $T = 2$ when the first two cards are both red. What is $E[T]$?`,
    answer: { type: "numeric", value: 13 / 2, exact: String.raw`\frac{2 \cdot 13}{4} = \frac{13}{2} = 6.5`, unit: "cards" },
    hints: [
      String.raw`Use the tail sum $E[T] = \sum_{j \ge 0} P(T > j)$. The event $T > j$ means at most one red card among the first $j$ cards.`,
      String.raw`$P(T > j) = \frac{\binom{9}{j} + 3\binom{9}{j-1}}{\binom{12}{j}}$. Compute these for $j = 0, 1, \dots, 10$ and add.`,
      "Shortcut: the 3 red cards cut the 9 black cards into 4 gaps of equal expected size 9/4. The second red card comes after two gaps and one red card.",
    ],
    solution: String.raw`**Tail sum.** For a non-negative integer variable, $E[T] = \sum_{j \ge 0} P(T > j)$. Here $T > j$ exactly when the first $j$ cards contain at most one red card. Counting subsets of positions, $P(T > j) = \frac{\binom{9}{j} + 3\binom{9}{j-1}}{\binom{12}{j}}$: either all $j$ cards are black, or one of the three reds is among them with the other $j - 1$ black.

The values are $1, 1, \frac{21}{22}, \frac{48}{55}, \frac{42}{55}, \frac{7}{11}, \frac{1}{2}, \frac{4}{11}, \frac{13}{55}, \frac{7}{55}, \frac{1}{22}$ for $j = 0, \dots, 10$, and $0$ from $j = 11$ on (eleven cards must contain at least two reds). Adding: $2 + 0.9545 + 0.8727 + 0.7636 + 0.6364 + 0.5 + 0.3636 + 0.2364 + 0.1273 + 0.0455 = 6.5$.

**Symmetry.** The 3 red cards split the 9 black cards into 4 gaps (before the first red, between reds, after the last). By exchangeability every gap has the same expected size, $\frac{9}{4}$. The second red card is preceded by two gaps and one red card, so $E[T] = 2 \cdot \frac{9}{4} + 1 + 1 = 6.5$. In general the $k$-th of $m$ special cards in a deck of $n$ has expected position $\frac{k(n+1)}{m+1}$; here $\frac{2 \cdot 13}{4}$.

Sanity check: $T$ ranges from 2 to 11, and 6.5 is the midpoint, which fits the symmetry of the middle red card. Answer: $\frac{13}{2} = 6.5$.`,
    steps: [
      "Write E[T] as the tail sum of P(T > j).",
      "Express P(T > j) as 'at most one red among the first j' with binomials.",
      "Add the eleven non-zero terms to get 6.5.",
      "Confirm by the gap argument: 2 gaps of 9/4 plus 2 cards.",
    ],
    keyIdea: String.raw`The $k$-th special card among $m$ in a deck of $n$ sits at expected position $\frac{k(n+1)}{m+1}$; the tail sum proves it when you cannot recall it.`,
    commonMistake: String.raw`Treating the deals as independent draws with success probability $\frac{3}{12}$ and answering $2 / 0.25 = 8$, which ignores that the deck shrinks.`,
    fastPath: "Four gaps of 9/4 black cards; second red is after two gaps plus itself and the first red: 4.5 + 2 = 6.5.",
    variation: "Same deck. What is the expected position of the last (third) red card?",
    variationAnswer: String.raw`$\frac{3 \cdot 13}{4} = 9.75$: three gaps of $\frac{9}{4}$ plus three red cards.`,
    family: "order-statistics",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m10-p08",
    module: 10,
    kind: "practice",
    difficulty: 2,
    tags: ["mixed-review", "coupon-collector", "expectation"],
    minutes: 3,
    title: "Three different exchange codes",
    prompt: String.raw`A market-data feed tags each incoming tick with one of 6 exchange codes, each equally likely and independent of the other ticks. You watch the feed from its first tick. What is the expected number of ticks you see up to and including the first tick at which you have seen 3 different codes?`,
    answer: { type: "numeric", value: 1 + 6 / 5 + 6 / 4, exact: String.raw`\frac{6}{6} + \frac{6}{5} + \frac{6}{4} = \frac{37}{10} = 3.7`, unit: "ticks" },
    hints: [
      "Split the wait into stages: ticks until the first new code, then until the second new code, then until the third.",
      "While you hold k distinct codes, each tick is new with probability (6 - k)/6, so the stage is a geometric wait with mean 6/(6 - k).",
      String.raw`Add the three stage means: $1 + \frac{6}{5} + \frac{6}{4}$.`,
    ],
    solution: String.raw`Let $W_k$ be the number of ticks needed to go from $k$ distinct codes seen to $k + 1$. Then the total wait is $W_0 + W_1 + W_2$, and by linearity $E[\text{total}] = E[W_0] + E[W_1] + E[W_2]$.

While you have seen $k$ codes, each new tick shows an unseen code with probability $\frac{6 - k}{6}$, independently, so $W_k$ is geometric with mean $\frac{6}{6 - k}$. The first tick is always new: $E[W_0] = 1$. Then $E[W_1] = \frac{6}{5}$ and $E[W_2] = \frac{6}{4}$.

Adding, $E[\text{total}] = 1 + 1.2 + 1.5 = 3.7 = \frac{37}{10}$ ticks. Sanity check: at least 3 ticks are needed, and with 6 codes repeats are uncommon early, so a little above 3 is right. This is the coupon collector stopped early; collecting all six would take $6\left(1 + \frac{1}{2} + \dots + \frac{1}{6}\right) = 14.7$ ticks. Answer: $3.7$.`,
    steps: [
      "Split into stages by the number of distinct codes seen.",
      "Each stage is a geometric wait with mean 6/(6 - k).",
      "Add 1 + 6/5 + 6/4 by linearity.",
    ],
    keyIdea: "A collection target is a sum of geometric waits whose success probabilities shrink one step at a time.",
    commonMistake: String.raw`Answering $3 \cdot \frac{6}{3} = 6$ or using the full collector sum $14.7$; the stages stop after three distinct codes.`,
    fastPath: "1 + 1.2 + 1.5 = 3.7.",
    variation: "How many ticks on average until you have seen all 6 codes?",
    variationAnswer: String.raw`$6 \cdot H_6 = 6\left(1 + \frac{1}{2} + \frac{1}{3} + \frac{1}{4} + \frac{1}{5} + \frac{1}{6}\right) = 14.7$.`,
    family: "coupon-collector",
    verifiedBy: ["formula", "simulation"],
  },

  // ---------------------------------------------------------------- distributions
  {
    id: "m10-p09",
    module: 10,
    kind: "practice",
    difficulty: 1,
    tags: ["mixed-review", "binomial"],
    minutes: 1,
    title: "Exactly four fills of seven",
    prompt: String.raw`You send 7 limit orders. Each order fills independently with probability 0.6. What is the probability that exactly 4 of the 7 orders fill?`,
    answer: {
      type: "numeric",
      value: 35 * Math.pow(0.6, 4) * Math.pow(0.4, 3),
      exact: String.raw`\binom{7}{4}(0.6)^4(0.4)^3 = 35 \cdot 0.1296 \cdot 0.064 = 0.290304`,
    },
    hints: [
      "Independent trials with the same success probability: this is a binomial count.",
      String.raw`Choose which 4 of the 7 orders fill, then multiply the probabilities of 4 fills and 3 misses.`,
      String.raw`$\binom{7}{4} = 35$, $0.6^4 = 0.1296$, $0.4^3 = 0.064$.`,
    ],
    solution: String.raw`The number of fills is binomial with $n = 7$ and $p = 0.6$, because the orders are independent trials with a common success probability. The probability of exactly $k$ successes is $\binom{n}{k}p^k(1-p)^{n-k}$.

Any particular pattern with 4 fills and 3 misses has probability $0.6^4 \cdot 0.4^3 = 0.1296 \cdot 0.064 = 0.0082944$. There are $\binom{7}{4} = 35$ such patterns, one for each choice of which four orders fill.

So $P(\text{exactly 4}) = 35 \cdot 0.0082944 = 0.290304$. Sanity check: the mean number of fills is $4.2$, so 4 is the most likely value and a probability near $0.29$ for the mode of a seven-trial binomial is reasonable. Answer: $0.290304$.`,
    steps: [
      "Identify the binomial: n = 7, p = 0.6.",
      "Count patterns: C(7,4) = 35.",
      "Multiply by 0.6^4 times 0.4^3.",
    ],
    keyIdea: "Binomial probability: patterns times the probability of one pattern.",
    commonMistake: String.raw`Forgetting the $\binom{7}{4}$ factor and reporting $0.0083$, or using $0.4^4 \cdot 0.6^3$ with the roles swapped.`,
    fastPath: "35 times 0.1296 is 4.536; times 0.064 is 0.290.",
    variation: "What is the probability that at least 4 of the 7 orders fill?",
    variationAnswer: String.raw`Add $k = 4, 5, 6, 7$: $0.2903 + 0.2613 + 0.1306 + 0.0280 \approx 0.710$.`,
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m10-p10",
    module: 10,
    kind: "practice",
    difficulty: 3,
    tags: ["mixed-review", "poisson", "binomial"],
    minutes: 3,
    title: "Rare sign-ups, Poisson style",
    prompt: String.raw`A trading app shows a promotion to 500 users today. Each user signs up independently with probability 0.004. Using the Poisson approximation to the binomial, estimate the probability that at most 1 user signs up. Report the Poisson value.`,
    answer: {
      type: "numeric",
      value: 3 * Math.exp(-2),
      exact: String.raw`e^{-2}(1 + 2) = 3e^{-2} \approx 0.4060`,
      tolerance: 0.005,
    },
    hints: [
      "Large n, small p: match the Poisson mean to the binomial mean n p.",
      String.raw`With $\lambda = 500 \cdot 0.004 = 2$, the Poisson probabilities are $P(k) = e^{-2}\frac{2^k}{k!}$.`,
      String.raw`Add $P(0) = e^{-2}$ and $P(1) = 2e^{-2}$.`,
    ],
    solution: String.raw`The exact count of sign-ups is binomial with $n = 500$ and $p = 0.004$. When $n$ is large and $p$ is small, the binomial is well approximated by a Poisson distribution with the same mean, $\lambda = np = 500 \cdot 0.004 = 2$.

Poisson probabilities are $P(N = k) = e^{-\lambda}\frac{\lambda^k}{k!}$. For $k = 0$ this is $e^{-2}$, and for $k = 1$ it is $2e^{-2}$. Their sum is $P(N \le 1) \approx e^{-2}(1 + 2) = 3e^{-2}$.

On the calculator, $e^{-2} \approx 0.135335$, so $3e^{-2} \approx 0.4060$. For comparison, the exact binomial value is $0.996^{500} + 500 \cdot 0.004 \cdot 0.996^{499} \approx 0.4055$, so the approximation is off by about one part in a thousand; either number is within the grading tolerance. Sanity check: the mean is 2, so 'at most 1' should be a bit below one half. Answer: $3e^{-2} \approx 0.406$.`,
    steps: [
      "Recognise large n, small p: Poisson with mean np = 2.",
      "Write P(0) and P(1) from the Poisson formula.",
      "Add: 3 e^{-2}.",
      "Sanity check against the mean: a bit under one half.",
    ],
    keyIdea: String.raw`Rare events in many trials: replace the binomial by Poisson with $\lambda = np$ and read off $e^{-\lambda}\lambda^k/k!$.`,
    commonMistake: String.raw`Reporting only $P(0) = e^{-2} \approx 0.135$, or using $\lambda = 500 \cdot 0.4 = 200$ from a misplaced decimal.`,
    fastPath: String.raw`$\lambda = 2$; $e^{-2} \approx 0.135$; times 3 is $0.406$.`,
    variation: "Same numbers. Approximate the probability of at least 3 sign-ups.",
    variationAnswer: String.raw`$1 - e^{-2}(1 + 2 + 2) = 1 - 5e^{-2} \approx 0.323$.`,
    verifiedBy: ["formula", "simulation"],
  },

  // ---------------------------------------------------------------- first-step / recursion
  {
    id: "m10-p11",
    module: 10,
    kind: "practice",
    difficulty: 5,
    tags: ["mixed-review", "first-step", "recursion", "dice"],
    minutes: 7,
    title: "Rolling until the score reaches seven",
    prompt: String.raw`A game keeps a running score that starts at 0. On each turn you roll a fair six-sided die and add the result to the score. The game ends the first time the score is 7 or more. What is the expected number of rolls in a game?`,
    answer: {
      type: "numeric",
      value: Math.pow(7 / 6, 6),
      exact: String.raw`\left(\frac{7}{6}\right)^6 = \frac{117649}{46656} \approx 2.5216`,
      unit: "rolls",
    },
    hints: [
      String.raw`Let $E_s$ be the expected number of further rolls when the score is $s$. Condition on the next roll: $E_s = 1 + \frac{1}{6}\sum_{f=1}^{6} E_{s+f}$, with $E_t = 0$ for $t \ge 7$.`,
      String.raw`Work backwards from $E_6 = 1$: $E_5 = 1 + \frac{1}{6}E_6$, $E_4 = 1 + \frac{1}{6}(E_5 + E_6)$, and so on.`,
      String.raw`Each step multiplies by $\frac{7}{6}$: $E_s = \left(\frac{7}{6}\right)^{6-s}$. Evaluate at $s = 0$.`,
    ],
    solution: String.raw`Let $E_s$ be the expected number of further rolls when the current score is $s$, for $s = 0, 1, \dots, 6$, and set $E_t = 0$ for $t \ge 7$ (the game is over). Conditioning on the next roll $f$, which is 1 to 6 with probability $\frac{1}{6}$ each,
$$E_s = 1 + \frac{1}{6}\sum_{f=1}^{6} E_{s+f}.$$

Work backwards. From $s = 6$ every roll ends the game: $E_6 = 1$. From $s = 5$, only a roll of 1 keeps the game going: $E_5 = 1 + \frac{1}{6}E_6 = \frac{7}{6}$. From $s = 4$: $E_4 = 1 + \frac{1}{6}(E_5 + E_6) = 1 + \frac{1}{6}\cdot\frac{13}{6} = \frac{49}{36} = \left(\frac{7}{6}\right)^2$.

The pattern is real. Subtracting the equations for $E_s$ and $E_{s+1}$ (for $s \le 5$) gives $E_s - E_{s+1} = \frac{1}{6}E_{s+1}$, since the sum for $E_s$ contains every term of the sum for $E_{s+1}$ plus the extra term $E_{s+1}$ itself (and the terms beyond 6 are zero). Hence $E_s = \frac{7}{6}E_{s+1}$ and $E_s = \left(\frac{7}{6}\right)^{6-s}$.

Therefore $E_0 = \left(\frac{7}{6}\right)^6 = \frac{117649}{46656} \approx 2.5216$ rolls. Sanity check: a mean roll is 3.5, so about two rolls get you to 7 on average, but overshooting is impossible to avoid and small first rolls drag the count up; a value between 2 and 3 is right. Answer: $\left(\frac{7}{6}\right)^6 \approx 2.52$.`,
    steps: [
      "Define E_s for scores 0 to 6, with E = 0 at 7 or more.",
      "Write the first-step equation E_s = 1 + (1/6) sum of E_{s+f}.",
      "Solve backwards from E_6 = 1.",
      "Spot (or verify) the geometric pattern E_s = (7/6)^{6-s}.",
      "Evaluate E_0 = (7/6)^6 and sanity check against 7 / 3.5 = 2.",
    ],
    keyIdea: "Condition on the first roll, and notice that consecutive first-step equations differ by one term, which makes the solution geometric.",
    commonMistake: String.raw`Answering $7 / 3.5 = 2$ as if the score could land exactly on 7, or stopping at $E_6$ or $E_5$ instead of carrying the recursion back to $E_0$.`,
    fastPath: String.raw`$E_6 = 1$, each step back multiplies by $\frac{7}{6}$; six steps: $(7/6)^6 \approx 2.52$.`,
    variation: "The game ends when the score is 4 or more instead of 7. Expected number of rolls?",
    variationAnswer: String.raw`Same recursion with the boundary at 4: $E_0 = \left(\frac{7}{6}\right)^3 = \frac{343}{216} \approx 1.588$.`,
    family: "absorbing-chain",
    verifiedBy: ["recursion", "simulation"],
  },
  {
    id: "m10-p12",
    module: 10,
    kind: "practice",
    difficulty: 4,
    tags: ["mixed-review", "gamblers-ruin", "first-step"],
    minutes: 5,
    title: "Biased rounds to six chips",
    prompt: String.raw`You hold 2 chips and the house holds 4. Each round you win one chip from the house with probability 0.6 and lose one chip to the house with probability 0.4, independently of earlier rounds. Play continues until one side holds all 6 chips. What is the probability that you end with all 6 chips?`,
    answer: {
      type: "numeric",
      value: (1 - Math.pow(2 / 3, 2)) / (1 - Math.pow(2 / 3, 6)),
      exact: String.raw`\frac{1 - (2/3)^2}{1 - (2/3)^6} = \frac{81}{133} \approx 0.6090`,
    },
    hints: [
      "Let h_k be the probability of reaching 6 chips from k chips. Write the first-step equation h_k = 0.6 h_{k+1} + 0.4 h_{k-1} with h_0 = 0 and h_6 = 1.",
      String.raw`The solution has the form $h_k = A + B\left(\frac{q}{p}\right)^k$ with $\frac{q}{p} = \frac{2}{3}$. Fit the boundary conditions.`,
      String.raw`$h_2 = \frac{1 - (2/3)^2}{1 - (2/3)^6}$. Factor $1 - r^6 = (1 - r^2)(1 + r^2 + r^4)$ to simplify.`,
    ],
    solution: String.raw`Let $h_k$ be the probability that you reach 6 chips before 0 when you currently hold $k$ chips. Conditioning on the next round, $h_k = 0.6\,h_{k+1} + 0.4\,h_{k-1}$ for $1 \le k \le 5$, with $h_0 = 0$ and $h_6 = 1$.

For a biased walk the general solution of this recurrence is $h_k = A + B r^k$ with $r = \frac{q}{p} = \frac{0.4}{0.6} = \frac{2}{3}$. The boundary conditions give $A + B = 0$ and $A + B r^6 = 1$, so $B = -\frac{1}{1 - r^6}$ and $A = \frac{1}{1 - r^6}$, which is the gambler's ruin formula $h_k = \frac{1 - r^k}{1 - r^6}$.

At $k = 2$: $h_2 = \frac{1 - (2/3)^2}{1 - (2/3)^6}$. Factoring $1 - r^6 = (1 - r^2)(1 + r^2 + r^4)$ gives the cleaner $h_2 = \frac{1}{1 + r^2 + r^4} = \frac{1}{1 + \frac{4}{9} + \frac{16}{81}} = \frac{81}{81 + 36 + 16} = \frac{81}{133} \approx 0.6090$.

Sanity check: in a fair game you would win with probability $\frac{2}{6} = \frac{1}{3}$ (your share of the chips), and the 60% edge should lift that substantially but not to certainty from such a small stack; $0.61$ fits. Answer: $\frac{81}{133} \approx 0.609$.`,
    steps: [
      "Set up h_k with boundaries h_0 = 0, h_6 = 1.",
      "Write the first-step equation with p = 0.6 and q = 0.4.",
      "Use the general solution A + B (q/p)^k and fit the boundaries.",
      "Evaluate at k = 2 and simplify to 81/133.",
      "Sanity check against the fair-game value 1/3.",
    ],
    keyIdea: String.raw`Gambler's ruin with an edge: $P(\text{reach } N \text{ from } k) = \frac{1 - (q/p)^k}{1 - (q/p)^N}$.`,
    commonMistake: String.raw`Using the fair-game answer $\frac{k}{N} = \frac{1}{3}$ despite the bias, or inverting the ratio to $\frac{3}{2}$, which gives a probability below the fair value.`,
    fastPath: String.raw`$r = 2/3$; $h_2 = 1/(1 + r^2 + r^4) = 81/133 \approx 0.61$.`,
    variation: "Same odds, but you start with 3 chips and the house with 3. Probability you take all 6?",
    variationAnswer: String.raw`$\frac{1 - (2/3)^3}{1 - (2/3)^6} = \frac{1}{1 + (2/3)^3} = \frac{27}{35} \approx 0.771$.`,
    family: "gamblers-ruin",
    verifiedBy: ["recursion", "simulation"],
  },

  // ---------------------------------------------------------------- games / EV decisions
  {
    id: "m10-p13",
    module: 10,
    kind: "practice",
    difficulty: 3,
    tags: ["mixed-review", "games", "stopping", "dice"],
    minutes: 4,
    title: "Two chances to roll again",
    prompt: String.raw`You roll a fair six-sided die. After each roll you may stop and receive the face value in dollars, or roll again. You may roll again at most twice (so you see at most three rolls), and if you reach the third roll you must take it. Playing optimally, what is the expected payout in dollars?`,
    answer: { type: "numeric", value: 14 / 3, exact: String.raw`\frac{2}{6}\cdot\frac{11}{2} + \frac{4}{6}\cdot\frac{17}{4} = \frac{14}{3} \approx 4.667`, unit: "dollars" },
    hints: [
      "Work backwards. The last roll is worth 3.5 on average, so with one reroll left you keep any face above 3.5.",
      String.raw`With one reroll left the game is worth $\frac{1}{2}(5) + \frac{1}{2}(3.5) = 4.25$. With two rerolls left, keep a face only if it beats 4.25.`,
      String.raw`Keep 5 or 6 on the first roll: $\frac{2}{6}(5.5) + \frac{4}{6}(4.25)$.`,
    ],
    solution: String.raw`Solve the last decision first. If you reach the third roll you must take it, so its value is $V_3 = 3.5$.

With one reroll left (after the second roll) you compare the face you hold with $V_3 = 3.5$: keep 4, 5 or 6, reroll 1, 2 or 3. The value of being at the second roll before seeing it is $V_2 = \frac{3}{6}\cdot\frac{4 + 5 + 6}{3} + \frac{3}{6}\cdot 3.5 = 2.5 + 1.75 = 4.25$.

With two rerolls left (the first roll) compare the face with $V_2 = 4.25$: keep 5 or 6, reroll 1 to 4. The value of the whole game is $V_1 = \frac{2}{6}\cdot\frac{5 + 6}{2} + \frac{4}{6}\cdot 4.25 = \frac{11}{6} + \frac{17}{6} = \frac{28}{6} = \frac{14}{3} \approx 4.667$ dollars.

Sanity check: the value must sit between $3.5$ (no rerolls) and $6$ (the best face), and each extra reroll should add less than the previous one: $3.5 \to 4.25 \to 4.667$ gains $0.75$ then $0.417$. Answer: $\frac{14}{3} \approx 4.67$ dollars.`,
    steps: [
      "Value the forced last roll: 3.5.",
      "One reroll left: keep 4-6, else reroll; value 4.25.",
      "Two rerolls left: keep 5-6, else reroll; value 14/3.",
      "Check the values increase with diminishing gains.",
    ],
    keyIdea: "Backward induction: at each stage keep the face only if it beats the value of continuing.",
    commonMistake: "Using the keep-4-or-better rule on the first roll as well, which gives (1/2)(5) + (1/2)(4.25) = 4.625 instead of 14/3 = 4.667 (keeping a 4 when the continuation is worth 4.25 is a mistake).",
    fastPath: "3.5, then 4.25, then (2/6)(5.5) + (4/6)(4.25) = 14/3.",
    variation: "Each reroll now costs 1 dollar, paid from the payout. What is the optimal expected net payout?",
    variationAnswer: String.raw`Continuation values drop by 1: after the second roll keep faces $\ge 3$ (continuation $2.5$), value $\frac{4}{6}\cdot 4.5 + \frac{2}{6}\cdot 2.5 = \frac{23}{6}$; on the first roll keep faces $\ge 3$ (continuation $\frac{17}{6}$), value $3 + \frac{17}{18} = \frac{71}{18} \approx 3.94$.`,
    family: "dice-reroll",
    verifiedBy: ["exhaustive-search", "simulation"],
  },
  {
    id: "m10-p14",
    module: 10,
    kind: "practice",
    difficulty: 2,
    tags: ["mixed-review", "kelly", "games"],
    minutes: 3,
    title: "Fraction to stake on a 2-to-1 bet",
    prompt: String.raw`You can place the same bet many times. You stake any fraction of your current bankroll; with probability 0.4 you win and receive your stake back plus a profit of twice the stake, and with probability 0.6 you lose the stake. What fraction of your bankroll should you stake each time to maximise the expected logarithm of your bankroll?`,
    answer: { type: "numeric", value: 0.4 - 0.6 / 2, exact: String.raw`f^* = p - \frac{q}{b} = 0.4 - \frac{0.6}{2} = 0.1` },
    hints: [
      String.raw`Write the growth rate per bet, $g(f) = p\ln(1 + bf) + q\ln(1 - f)$, with $b = 2$ the profit per unit staked.`,
      String.raw`Differentiate: $g'(f) = \frac{pb}{1 + bf} - \frac{q}{1 - f}$. Set it to zero.`,
      String.raw`Solve $0.8(1 - f) = 0.6(1 + 2f)$.`,
    ],
    solution: String.raw`If you stake a fraction $f$ of the bankroll, the bankroll is multiplied by $1 + 2f$ on a win and by $1 - f$ on a loss. The expected log growth per bet is $g(f) = 0.4\ln(1 + 2f) + 0.6\ln(1 - f)$, and the long-run growth rate is maximised where $g'(f) = 0$.

$g'(f) = \frac{0.8}{1 + 2f} - \frac{0.6}{1 - f}$. Setting this to zero, $0.8(1 - f) = 0.6(1 + 2f)$, so $0.8 - 0.8f = 0.6 + 1.2f$, giving $0.2 = 2f$ and $f^* = 0.1$.

This is the Kelly formula $f^* = p - \frac{q}{b}$ with $p = 0.4$, $q = 0.6$ and $b = 2$: $0.4 - 0.3 = 0.1$. Sanity check: the bet has positive edge ($0.4 \cdot 2 - 0.6 = 0.2$ per unit staked), so the fraction is positive, and it is small because losing is the likelier outcome. Betting the full edge-over-odds fraction is aggressive; many practitioners use half of it. Answer: stake $0.1$ of the bankroll.`,
    steps: [
      "Write the growth rate g(f) = p ln(1 + b f) + q ln(1 - f).",
      "Differentiate and set to zero.",
      "Solve the linear equation: f = p - q/b = 0.1.",
      "Check the sign: positive edge means a positive fraction.",
    ],
    keyIdea: String.raw`Kelly: stake the edge divided by the odds, $f^* = p - q/b$.`,
    commonMistake: String.raw`Using the expected profit per unit, $0.2$, as the fraction; that is twice Kelly, and at $f = 0.2$ the growth rate $0.4\ln 1.4 + 0.6\ln 0.8 \approx 0.0007$ is barely above zero, so almost all of the edge has been thrown away.`,
    fastPath: "0.4 minus 0.6 over 2 is 0.1.",
    variation: "The payout improves to 3-to-1 (profit three times the stake) with the same 0.4 win probability. New fraction?",
    variationAnswer: String.raw`$f^* = 0.4 - \frac{0.6}{3} = 0.2$.`,
    family: "kelly",
    verifiedBy: ["formula", "exhaustive-search"],
  },

  // ---------------------------------------------------------------- logic
  {
    id: "m10-p15",
    module: 10,
    kind: "practice",
    difficulty: 3,
    tags: ["mixed-review", "knights-knaves", "logic"],
    minutes: 3,
    title: "Three traders, three statements",
    prompt: String.raw`Three traders, Priya, Quinn and Raj, are each either always truthful or always lying. Priya says: "Quinn and Raj are both liars." Quinn says: "Priya is truthful." Raj says: "Priya and Quinn are both liars." Which description is consistent with all three statements?`,
    answer: {
      type: "choice",
      options: [
        "Priya is truthful; Quinn and Raj are liars",
        "All three are liars",
        "Raj is truthful; Priya and Quinn are liars",
        "Quinn is truthful; Priya and Raj are liars",
      ],
      correct: 2,
    },
    hints: [
      "Start with Priya. If she were truthful, Quinn would be a liar; but then Quinn's statement 'Priya is truthful' would be true. Can a liar say something true?",
      "So Priya is a liar, and her statement is false: Quinn and Raj are not both liars. Now test Quinn.",
      "Quinn says Priya is truthful, which is false, so Quinn is a liar. That leaves Raj, who must then be truthful; check his statement.",
    ],
    solution: String.raw`Test Priya first. Suppose Priya is truthful. Then her statement holds: Quinn and Raj are both liars. But Quinn says "Priya is truthful", which would be a true statement from a liar, impossible. So Priya is a liar.

Since Priya lies, "Quinn and Raj are both liars" is false: at least one of Quinn and Raj is truthful. Quinn's statement "Priya is truthful" is false, so Quinn is a liar. Therefore Raj must be the truthful one.

Check Raj's statement: "Priya and Quinn are both liars." That is exactly what we found, so it is true, as a truthful speaker's statement must be. The only consistent assignment is Priya liar, Quinn liar, Raj truthful.

The other options fail: option 1 breaks at Quinn's true statement; option 2 (all liars) makes Raj's statement true, which a liar cannot say; option 4 makes Quinn truthful while Priya is a liar, contradicting Quinn's own words. Checking all eight truthful/liar assignments confirms that exactly one survives. Answer: Raj is truthful; Priya and Quinn are liars.`,
    steps: [
      "Assume Priya truthful and derive a contradiction through Quinn.",
      "Conclude Priya lies, so not both Quinn and Raj are liars.",
      "Quinn's statement is false, so Quinn lies; Raj must be truthful.",
      "Verify Raj's statement is true under the assignment.",
    ],
    keyIdea: "A speaker who vouches for another's truthfulness has the same status as that person; use such links to collapse the cases.",
    commonMistake: "Picking 'all three are liars' without checking Raj's statement, which would then be a true statement from a liar.",
    fastPath: "Quinn vouches for Priya, so they share a status. Priya's claim that Quinn lies then forces both to be liars, and Raj's statement about them is true.",
    variation: "Raj instead says: 'Exactly one of us is truthful.' Which assignments are consistent now?",
    variationAnswer: "Two: Priya and Quinn liars with Raj truthful (one truthful, statement true), or all three liars (statement 'exactly one truthful' false, as a liar requires). The puzzle no longer has a unique answer.",
    family: "knights-knaves",
    verifiedBy: ["exhaustive-search"],
  },
  {
    id: "m10-p16",
    module: 10,
    kind: "practice",
    difficulty: 5,
    tags: ["mixed-review", "logic", "search-strategy"],
    minutes: 8,
    title: "Five desks, five products",
    prompt: String.raw`Five traders, Ana, Ben, Cy, Dev and Eva, sit at desks numbered 1 to 5 in a row, one trader per desk, and each trades a different product: bonds, FX, metals, equities or energy. You know: (1) the bonds trader sits at desk 1; (2) Ana sits at desk 3; (3) Ben sits at desk 2; (4) the FX trader sits at desk 5; (5) Cy trades neither bonds nor metals; (6) Dev sits at the desk immediately to the right of the equities trader (one number higher), and at a higher-numbered desk than Cy; (7) Eva sits at a desk adjacent to the energy trader's desk and does not trade energy herself. Who trades metals?`,
    answer: {
      type: "choice",
      options: ["Ana", "Ben", "Cy", "Dev", "Eva"],
      correct: 0,
    },
    hints: [
      "Start with the most constrained desk. Who can sit at desk 1? Ana and Ben are placed elsewhere, Cy cannot trade bonds, and Dev sits to the right of someone.",
      "Once desk 1 is settled, Cy and Dev fill desks 4 and 5, and clue 6 fixes their order. Clue 4 then gives Dev's product.",
      "Clue 6 puts equities at desk 4. Clue 7 locates energy next to desk 1. Only one product and one trader are left.",
    ],
    solution: String.raw`Desks 2 and 3 are taken by Ben and Ana, so desk 1 belongs to Cy, Dev or Eva. Cy cannot trade bonds (clue 5), and the bonds trader sits at desk 1 (clue 1), so Cy is not at desk 1. Dev sits immediately to the right of someone (clue 6), so Dev is not at desk 1 either. Hence Eva sits at desk 1 and trades bonds.

Cy and Dev occupy desks 4 and 5. Dev sits at a higher-numbered desk than Cy (clue 6), so Cy is at desk 4 and Dev at desk 5. The FX trader sits at desk 5 (clue 4), so Dev trades FX. Dev is immediately right of the equities trader, so equities is at desk 4: Cy trades equities, which is consistent with clue 5.

Eva at desk 1 is adjacent only to desk 2, so the energy trader is at desk 2: Ben trades energy (clue 7, and Eva herself trades bonds, as required). The only product left is metals, and the only trader without a product is Ana at desk 3.

Final table: desk 1 Eva, bonds; desk 2 Ben, energy; desk 3 Ana, metals; desk 4 Cy, equities; desk 5 Dev, FX. Every clue checks, and a full search of the $5! \cdot 5! = 14{,}400$ seat-and-product assignments finds this as the only solution. Answer: Ana trades metals.`,
    steps: [
      "Place the fixed facts: Ana at 3, Ben at 2, bonds at 1, FX at 5.",
      "Eliminate Cy and Dev from desk 1, so Eva sits there with bonds.",
      "Order Cy and Dev on desks 4 and 5 using clue 6; Dev gets FX.",
      "Equities at desk 4 (Cy); energy adjacent to Eva, so Ben.",
      "The remaining product, metals, goes to Ana.",
    ],
    keyIdea: "Attack the most constrained slot first (desk 1 here); each elimination there cascades through the rest of the grid.",
    commonMistake: "Guessing a product for Ana early and back-fitting the clues, or missing that Dev being 'to the right of someone' rules him out of desk 1.",
    fastPath: "Desk 1 must be Eva (bonds). Cy 4, Dev 5 (FX). Equities at 4, energy at 2. Metals to Ana.",
    variation: "Drop clue 6's second half (that Dev sits at a higher-numbered desk than Cy). How many solutions are there now, and who could trade metals?",
    variationAnswer: "Two solutions: the original, and one with Cy at desk 5 trading FX, Dev at desk 4 trading metals, Ana trading equities. Metals could be Ana or Dev, so the clue is necessary.",
    verifiedBy: ["exhaustive-search"],
  },

  // ---------------------------------------------------------------- simulation thinking
  {
    id: "m10-p17",
    module: 10,
    kind: "practice",
    difficulty: 3,
    tags: ["mixed-review", "simulation", "expectation", "linearity"],
    minutes: 3,
    title: "What the running average settles on",
    prompt: String.raw`A colleague runs this Monte Carlo loop one million times: roll a fair six-sided die to get a number $N$, then flip $N$ fair coins and record the number of heads. At the end she averages all the recorded values. What value does that average converge to as the number of loops grows?`,
    answer: { type: "numeric", value: 7 / 4, exact: String.raw`\frac{E[N]}{2} = \frac{3.5}{2} = \frac{7}{4} = 1.75` },
    hints: [
      "The average of a simulation converges to the expected value of what is recorded (law of large numbers). Compute E[heads].",
      "Condition on the die: given N = n, the expected number of heads is n/2.",
      String.raw`Average $n/2$ over the die: $E[N]/2 = 3.5/2$.`,
    ],
    solution: String.raw`By the law of large numbers the sample mean of independent repetitions converges to the expected value of the recorded quantity. So the question is: what is $E[H]$, where $H$ is the number of heads in $N$ flips and $N$ is a fair die?

Condition on the die. Given $N = n$, the heads count is binomial with mean $\frac{n}{2}$, so $E[H \mid N = n] = \frac{n}{2}$. Averaging over the six equally likely values of $n$, $E[H] = E\!\left[\frac{N}{2}\right] = \frac{E[N]}{2} = \frac{3.5}{2} = 1.75$.

The same number comes from writing $H$ as a sum of indicators $I_j$ for 'coin $j$ is flipped and lands heads', $j = 1, \dots, 6$: coin $j$ is flipped when $N \ge j$, with probability $\frac{7 - j}{6}$, and lands heads with probability $\frac{1}{2}$, so $E[H] = \frac{1}{2}\sum_{j=1}^{6}\frac{7 - j}{6} = \frac{1}{2}\cdot\frac{21}{6} = 1.75$.

Sanity check: the heads count lies between 0 and 6, and the average must be half the average number of coins, which is $3.5$. Answer: $\frac{7}{4} = 1.75$.`,
    steps: [
      "Recognise that the running average converges to an expectation.",
      "Condition on the die: E[heads | N = n] = n/2.",
      "Average over N: E[N]/2 = 1.75.",
      "Sanity check: half the mean number of coins.",
    ],
    keyIdea: "A Monte Carlo average converges to an expectation, and expectations of a two-stage experiment are computed by conditioning on the first stage.",
    commonMistake: String.raw`Answering $3.5$ (the mean number of coins, forgetting to halve it) or $0.5$ (the per-coin probability), instead of averaging $n/2$ over the die.`,
    fastPath: "Half of 3.5 is 1.75.",
    variation: "She records instead a 1 whenever all N coins land heads and a 0 otherwise. What does the average converge to?",
    variationAnswer: String.raw`$\frac{1}{6}\sum_{n=1}^{6} 2^{-n} = \frac{1}{6}\left(1 - \frac{1}{64}\right) = \frac{63}{384} = \frac{21}{128} \approx 0.164$.`,
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m10-p18",
    module: 10,
    kind: "practice",
    difficulty: 2,
    tags: ["mixed-review", "simulation", "variance"],
    minutes: 2,
    title: "Trials for a five-cent standard error",
    prompt: String.raw`You price a contract by Monte Carlo. Each independent trial produces a payoff whose standard deviation is 12 dollars, and the price estimate is the sample mean of the payoffs. How many trials are needed so that the standard error of the estimate is at most 0.05 dollars?`,
    answer: { type: "numeric", value: 57600, exact: String.raw`n = \left(\frac{12}{0.05}\right)^2 = 240^2 = 57{,}600`, unit: "trials" },
    hints: [
      String.raw`The standard error of a mean of $n$ independent trials is $\sigma / \sqrt{n}$.`,
      String.raw`Set $\frac{12}{\sqrt{n}} \le 0.05$ and solve for $n$.`,
      String.raw`$\sqrt{n} \ge 240$, so $n \ge 240^2$.`,
    ],
    solution: String.raw`The sample mean of $n$ independent payoffs with standard deviation $\sigma$ has standard deviation $\frac{\sigma}{\sqrt{n}}$: the variance of a sum of independent terms adds, so the variance of the mean is $\frac{n\sigma^2}{n^2} = \frac{\sigma^2}{n}$.

Requiring $\frac{12}{\sqrt{n}} \le 0.05$ gives $\sqrt{n} \ge \frac{12}{0.05} = 240$, hence $n \ge 240^2 = 57{,}600$ trials.

The square is the lesson: halving the standard error needs four times as many trials, and a tenfold improvement needs a hundredfold more work. Sanity check: at $n = 57{,}600$, $\frac{12}{240} = 0.05$ exactly, and at $n = 10{,}000$ the error would be $0.12$, too large. Answer: $57{,}600$ trials.`,
    steps: [
      "Recall that the standard error of a mean is sigma over root n.",
      "Set 12 / sqrt(n) <= 0.05.",
      "Solve: n >= 240 squared = 57,600.",
    ],
    keyIdea: String.raw`Standard error $= \sigma/\sqrt{n}$, so required trials scale with the square of the precision you want.`,
    commonMistake: String.raw`Dividing instead of squaring ($12 / 0.05 = 240$ trials), or using $\sigma^2 / n$ as the standard error and getting $n = 2{,}880$.`,
    fastPath: "12 over 0.05 is 240; square it: 57,600.",
    variation: "You can afford only 14,400 trials. What standard error do you get?",
    variationAnswer: String.raw`$\frac{12}{\sqrt{14{,}400}} = \frac{12}{120} = 0.10$ dollars, twice as large for a quarter of the trials.`,
    verifiedBy: ["formula", "exhaustive-search"],
  },

  // ---------------------------------------------------------------- lesson checks
  {
    id: "m10-lc1",
    module: 10,
    kind: "lessonCheck",
    difficulty: 1,
    tags: ["mixed-review", "mental-math"],
    minutes: 1,
    title: "Minutes left for the rest",
    prompt: String.raw`The test gives 75 minutes for 12 questions. You finish 7 math questions at 6 minutes each and spend 15 minutes on the coding question. How many minutes remain for the other 4 questions?`,
    answer: { type: "numeric", value: 75 - 7 * 6 - 15, exact: String.raw`75 - 42 - 15 = 18`, unit: "minutes" },
    hints: [
      "Add up the time already spent.",
      "7 questions at 6 minutes is 42 minutes; add the 15 for coding.",
      "Subtract 57 from 75.",
    ],
    solution: String.raw`Time used so far: $7 \cdot 6 = 42$ minutes on the math questions plus $15$ minutes on the coding question, $57$ minutes in total.

Remaining: $75 - 57 = 18$ minutes for 4 questions, which is $4.5$ minutes each. That is a full minute under the planned pace, so this is the moment to use the skip rule aggressively: answer the two quickest, and give the hardest a reasoned guess rather than a full attempt. Answer: $18$ minutes.`,
    steps: ["Add the time spent: 42 + 15 = 57.", "Subtract from 75.", "Translate into minutes per remaining question."],
    keyIdea: "Pacing is arithmetic you do during the test: time left divided by questions left.",
    commonMistake: "Forgetting the coding question in the time already spent, which overstates the remaining time by 15 minutes.",
    fastPath: "75 minus 57 is 18.",
    variation: "Same situation, but you had spent only 4 minutes on each of the 7 math questions. How many minutes remain?",
    variationAnswer: String.raw`$75 - 28 - 15 = 32$ minutes, 8 per remaining question.`,
    verifiedBy: ["formula"],
  },
  {
    id: "m10-lc2",
    module: 10,
    kind: "lessonCheck",
    difficulty: 1,
    tags: ["mixed-review", "expectation", "dice"],
    minutes: 1,
    title: "Even faces pay",
    prompt: String.raw`A game pays you the face value of a fair six-sided die in dollars when the face is even, and nothing when it is odd. What is the fair price of one play, in dollars?`,
    answer: { type: "numeric", value: 2, exact: String.raw`\frac{2 + 4 + 6}{6} = 2`, unit: "dollars" },
    hints: [
      "Fair price equals expected payout.",
      "List the payouts: 0, 2, 0, 4, 0, 6, each with probability 1/6.",
      "Add 2 + 4 + 6 and divide by 6.",
    ],
    solution: String.raw`The fair price is the expected payout. The six faces are equally likely; faces 1, 3 and 5 pay nothing and faces 2, 4 and 6 pay their value.

$E[\text{payout}] = \frac{0 + 2 + 0 + 4 + 0 + 6}{6} = \frac{12}{6} = 2$ dollars.

Sanity check: the payout is between 0 and 6, and since half the faces pay nothing the mean should be well below the plain die's 3.5. Answer: $2$ dollars.`,
    steps: ["Equate fair price with expected payout.", "List the six payouts.", "Average them: 12/6 = 2."],
    keyIdea: "Expected value is the probability-weighted average of the payouts, zeros included.",
    commonMistake: "Averaging only the even faces (2, 4, 6 gives 4) and forgetting that the odd faces pay zero.",
    fastPath: "12 over 6 is 2.",
    variation: "The game pays the face value when the face is odd instead. Fair price?",
    variationAnswer: String.raw`$\frac{1 + 3 + 5}{6} = 1.5$ dollars.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m10-lc3",
    module: 10,
    kind: "lessonCheck",
    difficulty: 2,
    tags: ["mixed-review", "binomial", "coins"],
    minutes: 1,
    title: "Four heads in ten flips",
    prompt: String.raw`A fair coin is flipped 10 times. What is the probability of exactly 4 heads?`,
    answer: { type: "numeric", value: 210 / 1024, exact: String.raw`\binom{10}{4}\left(\frac{1}{2}\right)^{10} = \frac{210}{1024} = \frac{105}{512} \approx 0.2051` },
    hints: [
      "All 2^10 sequences are equally likely; count those with exactly 4 heads.",
      String.raw`The count is $\binom{10}{4}$. Use the calculator or $\frac{10 \cdot 9 \cdot 8 \cdot 7}{24}$.`,
      "Divide 210 by 1024.",
    ],
    solution: String.raw`Each of the $2^{10} = 1024$ head-tail sequences is equally likely. A sequence with exactly 4 heads is determined by which 4 of the 10 positions are heads, so there are $\binom{10}{4} = \frac{10 \cdot 9 \cdot 8 \cdot 7}{4 \cdot 3 \cdot 2 \cdot 1} = 210$ of them.

The probability is $\frac{210}{1024} = \frac{105}{512} \approx 0.2051$.

Sanity check: 4 is one step below the mean of 5, and the mode $\binom{10}{5}/1024 = 252/1024 \approx 0.246$ should be a little larger, which it is. Answer: $\frac{105}{512} \approx 0.205$.`,
    steps: ["Count all sequences: 2^10 = 1024.", "Count sequences with 4 heads: C(10,4) = 210.", "Divide."],
    keyIdea: String.raw`Fair-coin probabilities are counts over $2^n$; the count is a binomial coefficient.`,
    commonMistake: String.raw`Using $\binom{10}{4}$ without dividing by $2^{10}$, or computing $\binom{10}{4}$ as $10 \cdot 9 \cdot 8 \cdot 7$ without the $4!$.`,
    fastPath: "210 over 1024, about 0.205.",
    variation: "What is the probability of at most 4 heads?",
    variationAnswer: String.raw`$\frac{1 + 10 + 45 + 120 + 210}{1024} = \frac{386}{1024} \approx 0.377$.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m10-lc4",
    module: 10,
    kind: "lessonCheck",
    difficulty: 1,
    tags: ["mixed-review", "complement", "dice"],
    minutes: 1,
    title: "No six in four rolls",
    prompt: String.raw`You roll a fair six-sided die four times. What is the probability that no roll shows a six?`,
    answer: { type: "numeric", value: Math.pow(5 / 6, 4), exact: String.raw`\left(\frac{5}{6}\right)^4 = \frac{625}{1296} \approx 0.4823` },
    hints: [
      "Each roll avoids a six with probability 5/6.",
      "The rolls are independent, so multiply.",
      String.raw`$(5/6)^4$: square $0.8333$ twice.`,
    ],
    solution: String.raw`A single roll is not a six with probability $\frac{5}{6}$. The four rolls are independent, so the probability that all four avoid a six is the product $\left(\frac{5}{6}\right)^4 = \frac{625}{1296}$.

On the calculator: $\frac{5}{6} \approx 0.8333$, squared $\approx 0.6944$, squared again $\approx 0.4823$.

Sanity check: avoiding a six four times in a row should be a little less likely than not; $0.48$ fits. The complement, at least one six in four rolls, is $1 - 0.4823 = 0.5177$. Answer: $\frac{625}{1296} \approx 0.482$.`,
    steps: ["Per-roll probability of no six: 5/6.", "Multiply four independent factors.", "Evaluate 625/1296."],
    keyIdea: "Independent 'none' events multiply; this is the building block of every 'at least one' answer.",
    commonMistake: String.raw`Computing $1 - 4 \cdot \frac{1}{6} = \frac{1}{3}$, which treats the four sixes as mutually exclusive.`,
    fastPath: "0.833 squared is 0.694; squared again is 0.482.",
    variation: "How many rolls make the probability of no six fall below 0.25?",
    variationAnswer: String.raw`$(5/6)^n < 0.25$ needs $n > \ln 4 / \ln 1.2 \approx 7.6$, so 8 rolls ($(5/6)^8 \approx 0.233$).`,
    verifiedBy: ["enumeration", "formula"],
  },
];
