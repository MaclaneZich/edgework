import type { Problem } from "../types";

/**
 * Module 3: Conditional probability and Bayes.
 *
 * 28 practice problems (m3-p01 .. m3-p28) and four lesson checks (m3-lc1 .. m3-lc4).
 * Every framing and every number here is original to Edgework. The classic ideas
 * (Monty Hall, two children, Bertrand's boxes, false positives, likelihood ratios) appear
 * as concepts only; see src/content/verify/m3.ts for the independent checks.
 */
export const problems: Problem[] = [
  // ---------------------------------------------------------------- difficulty 1
  {
    id: "m3-p01",
    module: 3,
    kind: "practice",
    difficulty: 1,
    tags: ["conditional", "dice"],
    minutes: 2,
    title: "Doubles given a big sum",
    prompt: String.raw`Two fair six-sided dice are rolled. You are told only that the sum is at least 9. What is the probability that the two dice show the same number?`,
    answer: { type: "numeric", value: 2 / 10, exact: String.raw`\frac{2}{10} = \frac{1}{5}` },
    hints: [
      "Conditioning shrinks the sample space. List only the ordered outcomes that are still possible.",
      "Count the ordered pairs with sum 9, 10, 11 and 12. There are fewer than a dozen.",
      "Pick out the doubles among those pairs and divide by the number of pairs you listed.",
    ],
    solution: String.raw`Conditioning on "the sum is at least 9" discards every outcome whose sum is 8 or less. What survives are the ordered pairs with sum 9 (3-6, 4-5, 5-4, 6-3), sum 10 (4-6, 5-5, 6-4), sum 11 (5-6, 6-5) and sum 12 (6-6). That is $4 + 3 + 2 + 1 = 10$ outcomes, and because the dice are fair they are still equally likely inside the restricted space.

Among these ten outcomes the doubles are 5-5 and 6-6. By the definition of conditional probability,
$P(\text{doubles} \mid \text{sum} \ge 9) = \frac{P(\text{doubles and sum} \ge 9)}{P(\text{sum} \ge 9)} = \frac{2/36}{10/36} = \frac{2}{10}.$

For comparison, the unconditional probability of doubles is $6/36 = 1/6$. The restriction removed 26 of the 36 outcomes but only four of the six doubles, so doubles became slightly more likely. The answer is $\frac{1}{5} = 0.2$.`,
    steps: [
      "Write down the restricted sample space: the ten ordered pairs with sum 9 or more.",
      "Check that the outcomes stay equally likely after conditioning.",
      "Count the doubles in that list (two) and divide by ten.",
    ],
    keyIdea: "Conditioning on an event means throwing away everything outside it and renormalising what is left.",
    commonMistake: "Counting unordered pairs for the sum but ordered pairs for the doubles (or the reverse), which mixes two different sample spaces.",
    fastPath: "Sums 9 to 12 have 4, 3, 2, 1 ordered outcomes, ten in total. Two of them are doubles: 2/10.",
    variation: "Same dice, but now you are told the sum is at most 4. What is the probability of doubles?",
    variationAnswer: String.raw`Sums 2, 3, 4 give $1 + 2 + 3 = 6$ ordered outcomes, of which 1-1 and 2-2 are doubles: $2/6 = 1/3$.`,
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m3-p02",
    module: 3,
    kind: "practice",
    difficulty: 1,
    tags: ["conditional", "dice", "complement"],
    minutes: 2,
    title: "Even sum given an even die",
    prompt: String.raw`Two fair six-sided dice are rolled. You learn only that at least one of the dice shows an even number (nothing about which die). What is the probability that the sum of the two dice is even?`,
    answer: { type: "numeric", value: 9 / 27, exact: String.raw`\frac{9}{27} = \frac{1}{3}` },
    hints: [
      "How many of the 36 ordered outcomes have at least one even die? Count the complement first.",
      "If at least one die is even, an even sum forces something specific about the other die.",
      "Divide the number of both-even outcomes by the number of at-least-one-even outcomes.",
    ],
    solution: String.raw`First the conditioning event. "At least one die is even" is the complement of "both dice are odd". Each die is odd with probability $1/2$, so both are odd in $3 \times 3 = 9$ of the 36 outcomes, leaving $36 - 9 = 27$ outcomes in which at least one die is even.

Now the event of interest inside that space. The sum of two dice is even when both are odd or both are even. "Both odd" has already been excluded, so an even sum here means both dice are even: $3 \times 3 = 9$ outcomes, all of which lie inside the conditioning event.

Therefore
$P(\text{even sum} \mid \text{at least one even}) = \frac{9/36}{27/36} = \frac{9}{27} = \frac{1}{3}.$

Without the information the sum is even half the time. Learning that at least one die is even kills the both-odd route to an even sum, which drops the probability to $\frac{1}{3} \approx 0.333$.`,
    steps: [
      "Count the conditioning event by complement: 36 minus the 9 both-odd outcomes gives 27.",
      "Note that an even sum with at least one even die means both dice are even.",
      "Count both-even outcomes (9) and divide by 27.",
    ],
    keyIdea: "Inside the conditioning event the only way to get an even sum is both dice even, so count that and divide by the size of the event.",
    commonMistake: String.raw`Treating "at least one die is even" as "the first die is even", which gives $1/2$ instead of $1/3$.`,
    fastPath: "At least one even: 27 outcomes. Both even: 9. Ratio one third.",
    variation: "Instead you learn that the first die shows an even number. Now what is the probability that the sum is even?",
    variationAnswer: String.raw`The sum is even exactly when the second die is also even, and the second die is independent of the first: $1/2$.`,
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m3-p03",
    module: 3,
    kind: "practice",
    difficulty: 1,
    tags: ["conditional", "cards"],
    minutes: 1,
    title: "Second heart given the first",
    prompt: String.raw`Two cards are dealt without replacement from a well-shuffled standard 52-card deck. Given that the first card is a heart, what is the probability that the second card is also a heart?`,
    answer: { type: "numeric", value: 12 / 51, exact: String.raw`\frac{12}{51} = \frac{4}{17}` },
    hints: [
      "Once the first card is known to be a heart, what does the rest of the deck look like?",
      "Twelve hearts remain among the 51 unseen cards.",
      "You can also compute P(both hearts) divided by P(first heart) and watch the 13/52 cancel.",
    ],
    solution: String.raw`The direct route uses the reduced deck. After a heart has been dealt, 51 cards remain and 12 of them are hearts. Every one of the 51 is equally likely to be dealt next, so
$P(\text{second heart} \mid \text{first heart}) = \frac{12}{51} = \frac{4}{17}.$

The definition gives the same number and shows why the reduced-deck shortcut is legitimate:
$P(\text{second heart} \mid \text{first heart}) = \frac{P(\text{both hearts})}{P(\text{first heart})} = \frac{\frac{13}{52} \cdot \frac{12}{51}}{\frac{13}{52}} = \frac{12}{51}.$

The answer is $\frac{4}{17} \approx 0.235$, a little below the unconditional $1/4$ because one heart has been used up.`,
    steps: [
      "Condition by removing the known card from the deck.",
      "Count hearts left (12) over cards left (51).",
      "Check against the ratio definition: the 13/52 factor cancels.",
    ],
    keyIdea: "Conditioning on a dealt card is the same as dealing from the deck with that card removed.",
    commonMistake: String.raw`Answering $13/52 = 1/4$ by forgetting that one heart is gone, or $12/52$ by forgetting that one card is gone.`,
    fastPath: "Reduced deck: 12 hearts out of 51 cards.",
    variation: "Given that the first card is a heart, what is the probability that the second card is a spade?",
    variationAnswer: String.raw`All 13 spades remain among 51 cards: $13/51$.`,
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m3-p04",
    module: 3,
    kind: "practice",
    difficulty: 1,
    tags: ["total-probability", "coins"],
    minutes: 2,
    title: "A coin from a mixed bag",
    prompt: String.raw`A bag holds three coins: two are fair and one lands heads with probability $0.8$. You draw one coin uniformly at random and flip it once. What is the probability that the flip shows heads?`,
    answer: { type: "numeric", value: (2 / 3) * (1 / 2) + (1 / 3) * 0.8, exact: String.raw`\frac{2}{3}\cdot\frac{1}{2} + \frac{1}{3}\cdot\frac{4}{5} = \frac{3}{5}` },
    hints: [
      "Split the problem by which coin you drew; the two cases are exclusive and cover everything.",
      "A fair coin is drawn with probability 2/3 and the biased coin with probability 1/3.",
      "Weight each coin's heads probability by the chance of drawing it and add.",
    ],
    solution: String.raw`Which coin you hold is unknown, so condition on it. Let $F$ be the event that you drew a fair coin and $B$ that you drew the biased one. These events partition the sample space with $P(F) = 2/3$ and $P(B) = 1/3$.

The law of total probability adds up the heads probability over the cases, each weighted by how likely the case is:
$P(H) = P(H \mid F)\,P(F) + P(H \mid B)\,P(B) = \frac{1}{2}\cdot\frac{2}{3} + \frac{4}{5}\cdot\frac{1}{3} = \frac{1}{3} + \frac{4}{15} = \frac{9}{15} = \frac{3}{5}.$

A sanity check: the answer is a weighted average of $0.5$ and $0.8$ with weights $2/3$ and $1/3$, so it must land between them and closer to $0.5$. It does: $\frac{3}{5} = 0.6$.`,
    steps: [
      "Identify the hidden variable (which coin) and its probabilities 2/3 and 1/3.",
      "Write the heads probability for each coin.",
      "Take the weighted average: 1/3 + 4/15 = 3/5.",
    ],
    keyIdea: "When an unknown stage comes first, average the conditional probabilities over that stage.",
    commonMistake: String.raw`Averaging $0.5$ and $0.8$ with equal weights to get $0.65$, forgetting there are two fair coins and only one biased coin.`,
    fastPath: "Weighted average: two thirds of 0.5 plus one third of 0.8 is 0.333 + 0.267 = 0.6.",
    variation: "The flip shows heads. What is the probability that the coin you drew is the biased one?",
    variationAnswer: String.raw`Bayes: $\dfrac{(1/3)(0.8)}{3/5} = \dfrac{4/15}{9/15} = \dfrac{4}{9} \approx 0.444$.`,
    verifiedBy: ["formula", "simulation"],
  },
  // ---------------------------------------------------------------- difficulty 2
  {
    id: "m3-p05",
    module: 3,
    kind: "practice",
    difficulty: 2,
    tags: ["conditional", "cards", "complement"],
    minutes: 3,
    title: "Both aces given at least one",
    prompt: String.raw`Two cards are dealt without replacement from a well-shuffled standard 52-card deck. You are told that at least one of the two cards is an ace (nothing about which card or where it sits). What is the probability that both cards are aces?`,
    answer: { type: "numeric", value: 6 / 198, exact: String.raw`\frac{\binom{4}{2}}{\binom{52}{2} - \binom{48}{2}} = \frac{6}{198} = \frac{1}{33}` },
    hints: [
      "Work with unordered two-card hands: there are 1326 of them, all equally likely.",
      "How many hands contain no ace at all? Subtract from 1326 to count the hands with at least one ace.",
      "Hands with two aces are choose(4, 2) = 6. Divide by the number of hands with at least one ace.",
    ],
    solution: String.raw`Use unordered hands. There are $\binom{52}{2} = 1326$ equally likely two-card hands.

The conditioning event is "at least one ace". Its complement, "no ace", consists of hands drawn entirely from the 48 non-aces: $\binom{48}{2} = 1128$ hands. So $1326 - 1128 = 198$ hands contain at least one ace.

The event of interest, "both aces", is $\binom{4}{2} = 6$ hands, and every one of them lies inside the conditioning event. Hence
$P(\text{two aces} \mid \text{at least one ace}) = \frac{6}{198} = \frac{1}{33} \approx 0.0303.$

Contrast this with "the first card is an ace", which is a different piece of information: then the second card must be an ace among 51 remaining cards, $3/51 = 1/17 \approx 0.059$, nearly twice as large. Knowing *which* card is an ace is more information than knowing that *some* card is.`,
    steps: [
      "Fix the sample space as the 1326 unordered hands.",
      "Count the conditioning event by complement: 1326 - 1128 = 198 hands with at least one ace.",
      "Count the two-ace hands (6) and divide: 6/198 = 1/33.",
      "Note how this differs from 'the first card is an ace' (1/17).",
    ],
    keyIdea: "'At least one is an ace' is weaker information than 'the first is an ace', so the conditional probability is smaller.",
    commonMistake: String.raw`Answering $3/51$, which silently assumes you were told which card is the ace.`,
    fastPath: "Hands with an ace: 1326 - 1128 = 198. Two-ace hands: 6. 6/198 = 1/33.",
    variation: "You are told that at least one of the two cards is the ace of spades. Now what is the probability that both are aces?",
    variationAnswer: String.raw`Hands containing the ace of spades: 51. Of these, 3 have another ace: $3/51 = 1/17$.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m3-p06",
    module: 3,
    kind: "practice",
    difficulty: 2,
    tags: ["bayes", "conditional"],
    minutes: 3,
    title: "The scanner flags a part",
    prompt: String.raw`On a production line, 2% of parts are defective. An optical scanner flags 95% of defective parts and also flags 8% of good parts (independently of everything else). A part has just been flagged. What is the probability that it is actually defective?`,
    answer: {
      type: "numeric",
      value: (0.02 * 0.95) / (0.02 * 0.95 + 0.98 * 0.08),
      exact: String.raw`\frac{0.02 \times 0.95}{0.02 \times 0.95 + 0.98 \times 0.08} = \frac{190}{974} = \frac{95}{487} \approx 0.195`,
    },
    hints: [
      "Imagine 10,000 parts. How many are defective, and how many of those get flagged?",
      "Now the good parts: 9,800 of them, and 8% of those are flagged too.",
      "The flagged pile mixes true and false flags. Divide the true flags by the total flags.",
    ],
    solution: String.raw`Build a table of counts for 10,000 parts. Defective parts: $2\%$ of 10,000 is 200. The scanner flags $95\%$ of them, so 190 defective parts are flagged and 10 slip through. Good parts: 9,800. The scanner wrongly flags $8\%$ of them, which is $0.08 \times 9800 = 784$ false flags.

The flagged pile therefore contains $190 + 784 = 974$ parts, of which 190 are defective. The probability that a flagged part is defective is
$P(\text{defective} \mid \text{flagged}) = \frac{190}{974} = \frac{95}{487} \approx 0.195.$

In Bayes' rule form this is $\dfrac{P(F \mid D)P(D)}{P(F \mid D)P(D) + P(F \mid D^c)P(D^c)} = \dfrac{0.95 \times 0.02}{0.95 \times 0.02 + 0.08 \times 0.98}$, the same ratio.

The scanner is good at its job (it catches 95% of defects), yet four out of five flags are false alarms. The reason is the base rate: there are 49 good parts for every defective one, so even a small false-flag rate produces more false flags than true ones. The answer is $\frac{95}{487} \approx 0.195$.`,
    steps: [
      "Pick a round population (10,000 parts) and split by defective versus good.",
      "Apply the scanner's flag rates to each group: 190 true flags, 784 false flags.",
      "Divide true flags by all flags: 190/974.",
      "Explain the small number by the 49-to-1 base rate.",
    ],
    keyIdea: "The posterior is a ratio of counts: true flags over all flags, and the big healthy group feeds the denominator.",
    commonMistake: String.raw`Reporting $0.95$, the scanner's detection rate, which is $P(\text{flag} \mid \text{defective})$, not $P(\text{defective} \mid \text{flag})$.`,
    fastPath: "Per 10,000: 190 true flags versus 784 false flags. 190 / 974 is just under 0.2.",
    variation: "The line improves and only 0.5% of parts are now defective, with the same scanner. What is the probability that a flagged part is defective?",
    variationAnswer: String.raw`Per 10,000: 50 defective, 47.5 flagged; 9,950 good, 796 flagged. $47.5/843.5 \approx 0.056$.`,
    family: "false-positive",
    verifiedBy: ["formula", "simulation"],
  },
  {
    id: "m3-p07",
    module: 3,
    kind: "practice",
    difficulty: 2,
    tags: ["bayes", "dice"],
    minutes: 3,
    title: "Which die did you roll?",
    prompt: String.raw`A cup contains two fair dice: one has six faces numbered 1 to 6 and the other has eight faces numbered 1 to 8. Without looking, you take one die out at random (each equally likely), roll it once, and it shows a 3. What is the probability that you rolled the six-sided die?`,
    answer: { type: "numeric", value: (1 / 6) / (1 / 6 + 1 / 8), exact: String.raw`\frac{\frac{1}{2}\cdot\frac{1}{6}}{\frac{1}{2}\cdot\frac{1}{6} + \frac{1}{2}\cdot\frac{1}{8}} = \frac{4}{7}` },
    hints: [
      "Two hypotheses (which die), one observation (a 3). Compare how well each die explains the 3.",
      "A 3 has probability 1/6 on the six-sided die and 1/8 on the eight-sided die; the priors are equal.",
      "Posterior for the six-sided die equals its likelihood over the sum of the two likelihoods.",
    ],
    solution: String.raw`Let $S$ be the event that you took the six-sided die and $E$ that you took the eight-sided one; $P(S) = P(E) = 1/2$. The observation is "the roll shows a 3", with likelihoods $P(3 \mid S) = 1/6$ and $P(3 \mid E) = 1/8$.

Bayes' rule weighs each hypothesis by prior times likelihood:
$P(S \mid 3) = \frac{\frac{1}{2}\cdot\frac{1}{6}}{\frac{1}{2}\cdot\frac{1}{6} + \frac{1}{2}\cdot\frac{1}{8}} = \frac{1/6}{1/6 + 1/8} = \frac{4/24}{7/24} = \frac{4}{7}.$

In odds form: the prior odds are $1:1$ and the likelihood ratio for a 3 is $(1/6)/(1/8) = 4/3$ in favour of the six-sided die, so the posterior odds are $4:3$, which is the probability $4/7$.

Intuition: a 3 is a bit more "ordinary" on a die with fewer faces, because each face of the smaller die carries more probability. The answer is $\frac{4}{7} \approx 0.571$.`,
    steps: [
      "Name the two hypotheses and their equal priors.",
      "Write the likelihood of a 3 under each: 1/6 and 1/8.",
      "Form the ratio 1/6 over (1/6 + 1/8) = 4/7.",
    ],
    keyIdea: "With equal priors, the posterior is just each hypothesis's likelihood divided by the total likelihood.",
    commonMistake: String.raw`Saying $1/2$ because "a 3 is possible on both dice", ignoring that the two dice assign different probabilities to it.`,
    fastPath: "Likelihood ratio 1/6 to 1/8 is 4 to 3. Posterior 4/7.",
    variation: "The roll shows a 7 instead. Now what is the probability that you rolled the six-sided die? And what if it shows a 1 and you roll the same die again, getting another 1?",
    variationAnswer: String.raw`A 7 is impossible on the six-sided die, so the probability is 0. Two 1s: likelihood ratio $(1/36)/(1/64) = 16/9$, posterior $16/25 = 0.64$.`,
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m3-p08",
    module: 3,
    kind: "practice",
    difficulty: 2,
    tags: ["conditional", "bayes", "sample-space"],
    minutes: 3,
    title: "At least one daughter",
    prompt: String.raw`A colleague has exactly two children. Assume each child is independently a boy or a girl with probability $1/2$. You ask her, "Is at least one of your children a girl?" and she answers yes (she always answers this question truthfully). What is the probability that both of her children are girls?`,
    answer: { type: "numeric", value: 1 / 3, exact: String.raw`\frac{1/4}{3/4} = \frac{1}{3}` },
    hints: [
      "List the four equally likely birth-order outcomes before any information: BB, BG, GB, GG.",
      "Her yes rules out exactly one of the four outcomes.",
      "Among the outcomes that remain, how many are two girls?",
    ],
    solution: String.raw`Before you ask, the two children in birth order are one of BB, BG, GB, GG, each with probability $1/4$. The question "is at least one a girl?" is answered yes in three of the four cases; only BB is ruled out.

Conditioning on her yes restricts the sample space to $\{BG, GB, GG\}$, three equally likely outcomes, and only GG is "both girls":
$P(GG \mid \text{at least one girl}) = \frac{P(GG)}{P(\text{at least one girl})} = \frac{1/4}{3/4} = \frac{1}{3}.$

The subtle point is how the information was generated. A yes to "at least one girl" treats BG and GB as two separate ways of satisfying the condition, and together they outweigh GG two to one. If instead you had learned something about a specific child (the elder is a girl, or the child who walked in with her is a girl), the answer would be $1/2$. The answer here is $\frac{1}{3} \approx 0.333$.`,
    steps: [
      "Write the four equally likely ordered outcomes.",
      "Remove the outcomes inconsistent with the answer yes (only BB).",
      "Divide the favourable count (GG) by the remaining three.",
      "Note that information about a specific child would give 1/2 instead.",
    ],
    keyIdea: "'At least one' keeps both mixed orderings alive, so two girls is only one of three surviving cases.",
    commonMistake: String.raw`Collapsing BG and GB into a single outcome "one of each" and treating it as equally likely as GG, which gives the wrong $1/2$; "one of each" is twice as likely as GG.`,
    fastPath: "Four orderings, drop BB, one of the remaining three is GG: 1/3.",
    variation: "Instead you ask, 'Is your elder child a girl?' and she says yes. What is the probability that both are girls?",
    variationAnswer: String.raw`Only GB and GG survive, equally likely: $1/2$. The younger child's sex is independent of the elder's.`,
    family: "two-children",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m3-p09",
    module: 3,
    kind: "practice",
    difficulty: 2,
    tags: ["total-probability", "urns", "dice"],
    minutes: 3,
    title: "A die chooses the urn",
    prompt: String.raw`Urn A contains 3 red and 2 blue marbles; urn B contains 1 red and 4 blue marbles. You roll a fair six-sided die: if it shows 1 or 2 you draw one marble from urn A, otherwise you draw one marble from urn B. What is the probability that the marble you draw is red?`,
    answer: { type: "numeric", value: (1 / 3) * (3 / 5) + (2 / 3) * (1 / 5), exact: String.raw`\frac{1}{3}\cdot\frac{3}{5} + \frac{2}{3}\cdot\frac{1}{5} = \frac{1}{3}` },
    hints: [
      "The die decides the urn first; condition on which urn you end up drawing from.",
      "Urn A is chosen with probability 2/6 = 1/3 and urn B with probability 2/3.",
      "Multiply each urn's red fraction by the probability of that urn, then add.",
    ],
    solution: String.raw`This is a two-stage experiment: first the die picks the urn, then the urn produces a marble. The die shows 1 or 2 with probability $2/6 = 1/3$, so $P(A) = 1/3$ and $P(B) = 2/3$.

Given the urn, the red probabilities are $P(R \mid A) = 3/5$ and $P(R \mid B) = 1/5$. The law of total probability combines the stages:
$P(R) = P(R \mid A)P(A) + P(R \mid B)P(B) = \frac{3}{5}\cdot\frac{1}{3} + \frac{1}{5}\cdot\frac{2}{3} = \frac{3}{15} + \frac{2}{15} = \frac{5}{15} = \frac{1}{3}.$

A tree diagram makes the same computation visible: two branches for the urn, each splitting into red and blue, and you add the probabilities of the two red leaves. Note that although the two urns together hold 4 red out of 10 marbles, the answer is not $4/10$: urn B, the stingier one, is chosen twice as often. The answer is $\frac{1}{3} \approx 0.333$.`,
    steps: [
      "Translate the die rule into urn probabilities 1/3 and 2/3.",
      "Write the red probability inside each urn: 3/5 and 1/5.",
      "Add the two red leaves of the tree: 3/15 + 2/15 = 1/3.",
    ],
    keyIdea: "Average the within-urn probabilities using the probabilities of reaching each urn, not the sizes of the urns.",
    commonMistake: String.raw`Pooling the marbles into one urn and answering $4/10$, which ignores that the die favours urn B.`,
    fastPath: "One third of 3/5 plus two thirds of 1/5: 1/5 + 2/15 = 5/15 = 1/3.",
    variation: "The marble you drew is red. What is the probability that it came from urn A?",
    variationAnswer: String.raw`Bayes: $\dfrac{(1/3)(3/5)}{1/3} = \dfrac{1/5}{1/3} = \dfrac{3}{5}$. A red marble makes urn A the favourite even though B is chosen more often.`,
    verifiedBy: ["formula", "simulation"],
  },
  {
    id: "m3-p10",
    module: 3,
    kind: "practice",
    difficulty: 2,
    tags: ["monty-hall", "conditional"],
    minutes: 3,
    title: "Three envelopes and a manager who knows",
    prompt: String.raw`Your manager lays three sealed envelopes on the desk. Exactly one contains a bonus voucher; the other two are empty, and the voucher is equally likely to be in any of the three. You point at one envelope. Your manager knows which envelope holds the voucher. She always opens one of the two envelopes you did not point at, always one that is empty, and when both of those are empty she chooses between them by a fair coin flip. She opens an empty envelope and then offers to let you swap your envelope for the remaining closed one. If you swap, what is the probability that you get the voucher?`,
    answer: { type: "numeric", value: 2 / 3, exact: String.raw`\frac{2}{3}` },
    hints: [
      "Swapping wins exactly when your first pick was empty. How likely was that?",
      "Enumerate: the voucher is in envelope 1, 2 or 3; your pick is fixed; trace what the manager does in each case.",
      "In the two cases where you picked an empty envelope, the manager is forced to open the other empty one, so the swap target is the voucher.",
    ],
    solution: String.raw`Fix your pick as envelope 1 by symmetry. Run through where the voucher is.

If the voucher is in envelope 1 (probability $1/3$), both other envelopes are empty; the manager opens one of them by coin flip, and swapping lands you on the other empty one. Swapping loses.

If the voucher is in envelope 2 (probability $1/3$), the manager cannot open envelope 2 and cannot open your envelope, so she must open envelope 3. Swapping takes you to envelope 2 and wins. The case "voucher in envelope 3" is the mirror image: she must open envelope 2, and swapping wins.

So swapping wins in exactly the cases where your first pick was empty, which has probability $2/3$. Staying wins with probability $1/3$. Equivalently, after she opens, say, envelope 3: $P(\text{voucher in 1 and she opens 3}) = \frac{1}{3}\cdot\frac{1}{2} = \frac{1}{6}$, while $P(\text{voucher in 2 and she opens 3}) = \frac{1}{3}\cdot 1 = \frac{1}{3}$. Conditioning on "she opened 3" gives $\frac{1/3}{1/6 + 1/3} = \frac{2}{3}$ for envelope 2.

The manager's move carries information precisely because her choice is constrained when the voucher is in an envelope you did not pick. The answer is $\frac{2}{3} \approx 0.667$.`,
    steps: [
      "Fix your pick and enumerate the three voucher positions.",
      "In each case write down what the manager is allowed to open and with what probability.",
      "Observe that swapping wins exactly when the first pick was empty: probability 2/3.",
      "Confirm by conditioning on the specific envelope she opened.",
    ],
    keyIdea: "The host's constrained choice transfers all of the 2/3 probability from the unpicked pair onto the one closed envelope she avoided.",
    commonMistake: String.raw`Arguing "two envelopes remain, so it is 50-50", which ignores that she was forced to avoid the voucher.`,
    fastPath: "Swap wins iff the first pick was empty: 2/3. Done.",
    variation: "Same rules, but you know your manager has a habit: when both unpicked envelopes are empty she always opens the one with the lower number. You pointed at envelope 1 and she opened envelope 2. Should you swap, and with what win probability?",
    variationAnswer: String.raw`Voucher in 1: she opens 2 (probability 1). Voucher in 3: she opens 2 (forced). Each has prior $1/3$, so swapping wins with probability exactly $1/2$; swapping no longer helps in this branch (had she opened 3, swapping would win for sure).`,
    family: "monty-hall",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m3-p11",
    module: 3,
    kind: "practice",
    difficulty: 2,
    tags: ["bayes", "conditional"],
    minutes: 3,
    title: "Spam that gets through",
    prompt: String.raw`At a firm, 30% of incoming emails are spam. The spam filter catches 90% of spam and wrongly diverts 2% of legitimate emails. An email has just arrived in your inbox, meaning the filter did not divert it. What is the probability that it is spam?`,
    answer: {
      type: "numeric",
      value: (0.3 * 0.1) / (0.3 * 0.1 + 0.7 * 0.98),
      exact: String.raw`\frac{0.30 \times 0.10}{0.30 \times 0.10 + 0.70 \times 0.98} = \frac{300}{7160} = \frac{15}{358} \approx 0.0419`,
    },
    hints: [
      "You are conditioning on a negative result (not diverted). Which spam and which legitimate emails end up in the inbox?",
      "Per 10,000 emails: 3,000 spam of which 10% escape; 7,000 legitimate of which 98% arrive.",
      "Divide the escaped spam by everything that reached the inbox.",
    ],
    solution: String.raw`Take 10,000 emails. Spam: 3,000. The filter catches $90\%$ of them, so $300$ spam emails escape into inboxes. Legitimate: 7,000, of which $2\%$ (140) are wrongly diverted and $98\%$, that is $6{,}860$, arrive normally.

The inbox therefore receives $300 + 6860 = 7160$ emails, of which 300 are spam:
$P(\text{spam} \mid \text{not diverted}) = \frac{300}{7160} = \frac{15}{358} \approx 0.0419.$

As a formula: $\dfrac{P(\text{pass} \mid S)P(S)}{P(\text{pass} \mid S)P(S) + P(\text{pass} \mid L)P(L)} = \dfrac{0.10 \times 0.30}{0.10 \times 0.30 + 0.98 \times 0.70}$.

The filter cut the spam share from 30% to about 4%: a negative result is strong evidence here because the filter rarely misses spam. The answer is $\frac{15}{358} \approx 0.042$.`,
    steps: [
      "Set up the 10,000-email table split spam versus legitimate.",
      "Apply the pass rates: 10% of spam passes (300), 98% of legitimate passes (6,860).",
      "Divide the spam that passed by everything that passed: 300/7160.",
    ],
    keyIdea: "Conditioning on a negative result uses the miss rate of the filter, not its catch rate.",
    commonMistake: "Using the 2% false-diversion rate or the 10% miss rate as the answer, instead of conditioning on the inbox population.",
    fastPath: "Inbox per 10,000: 300 spam plus 6,860 legit. 300/7160, a bit over 4%.",
    variation: "An email was diverted to the spam folder. What is the probability that it was legitimate?",
    variationAnswer: String.raw`Diverted: 2,700 spam and 140 legitimate per 10,000. $140/2840 = 7/142 \approx 0.049$.`,
    family: "false-positive",
    verifiedBy: ["formula", "simulation"],
  },
  // ---------------------------------------------------------------- difficulty 3
  {
    id: "m3-p12",
    module: 3,
    kind: "practice",
    difficulty: 3,
    tags: ["bayes", "sequential-updating", "independence"],
    minutes: 5,
    title: "Two fraud models agree",
    prompt: String.raw`At a payments company, 1% of transactions are fraudulent. Two fraud models score each transaction. Model A flags 90% of fraudulent transactions and 5% of legitimate ones. Model B flags 80% of fraudulent transactions and 10% of legitimate ones. Given the true status of a transaction (fraud or legitimate), the two models' flags are independent. A transaction is flagged by both models. What is the probability that it is fraudulent?`,
    answer: {
      type: "numeric",
      value: (0.01 * 0.9 * 0.8) / (0.01 * 0.9 * 0.8 + 0.99 * 0.05 * 0.1),
      exact: String.raw`\frac{0.01 \times 0.9 \times 0.8}{0.01 \times 0.9 \times 0.8 + 0.99 \times 0.05 \times 0.10} = \frac{16}{27} \approx 0.593`,
    },
    hints: [
      "Conditional independence lets you multiply the two flag probabilities within each status.",
      "Odds form: prior odds of fraud are 1:99. Model A multiplies them by 0.9/0.05 = 18; model B by 0.8/0.1 = 8.",
      "Posterior odds 144:99 = 16:11. Convert odds to a probability.",
    ],
    solution: String.raw`Work in odds. The prior odds of fraud are $P(F) : P(L) = 1 : 99$.

Model A's flag has likelihood ratio $\dfrac{P(A \mid F)}{P(A \mid L)} = \dfrac{0.90}{0.05} = 18$. Model B's flag has likelihood ratio $\dfrac{0.80}{0.10} = 8$. Because the flags are independent *given the true status*, the likelihood of "both flag" under each hypothesis is a product, so the likelihood ratios multiply: $18 \times 8 = 144$.

Posterior odds: $1 \times 144 : 99 = 144 : 99 = 16 : 11$. Converting odds to probability,
$P(F \mid A, B) = \frac{16}{16 + 11} = \frac{16}{27} \approx 0.593.$

The same number comes from Bayes' rule written out: $\dfrac{0.01 \times 0.9 \times 0.8}{0.01 \times 0.9 \times 0.8 + 0.99 \times 0.05 \times 0.1} = \dfrac{0.0072}{0.0072 + 0.00495}$. Or sequentially: after model A alone the posterior is $\frac{18}{18 + 99} = \frac{2}{13} \approx 0.154$; feeding that in as the new prior and applying model B's ratio of 8 gives odds $16 : 11$ again. Updating in one go or one signal at a time gives the same answer.

Note what conditional independence does *not* say. Unconditionally the two flags are strongly correlated: a transaction flagged by A is far more likely to be fraud, so it is far more likely to be flagged by B. The independence holds only inside each status group. The answer is $\frac{16}{27} \approx 0.593$.`,
    steps: [
      "Write the prior odds 1:99.",
      "Compute each model's likelihood ratio for a flag: 18 and 8.",
      "Multiply the ratios (conditional independence) to get 144 and apply to the prior odds.",
      "Convert odds 16:11 to the probability 16/27.",
      "Check by updating sequentially: 2/13 after model A, then 16/27.",
    ],
    keyIdea: "Signals that are independent given the hypothesis have likelihood ratios that multiply, so the posterior odds are prior odds times the product of ratios.",
    commonMistake: "Multiplying the two posterior probabilities, or treating 'independent given status' as if the flags were unconditionally independent and multiplying P(A)·P(B).",
    fastPath: "Odds 1:99 times 18 times 8 gives 144:99 = 16:11, so 16/27, about 0.59.",
    variation: "Model A flags the transaction but model B does not. What is the probability of fraud now?",
    variationAnswer: String.raw`Likelihood ratio of B not flagging is $0.2/0.9 = 2/9$. Odds $1 \times 18 \times \frac{2}{9} : 99 = 4 : 99$, probability $4/103 \approx 0.039$.`,
    family: "false-positive",
    verifiedBy: ["formula", "simulation"],
  },
  {
    id: "m3-p13",
    module: 3,
    kind: "practice",
    difficulty: 3,
    tags: ["independence", "conditional", "bayes"],
    minutes: 4,
    title: "Two reviewers, one applicant",
    prompt: String.raw`A hiring pipeline sends every application to two reviewers who never talk to each other. 30% of applicants are strong. Given that an applicant is strong, each reviewer advances them with probability $0.8$; given that an applicant is weak, each reviewer advances them with probability $0.2$. In both cases the two reviewers decide independently, so the decisions are independent *conditional on the applicant's quality*. Are the two reviewers' decisions independent when you do not condition on quality? Pick the correct statement.`,
    answer: {
      type: "choice",
      options: [
        "Yes. Independence given quality implies independence outright, because each applicant has a fixed quality.",
        String.raw`No. They are positively dependent: reviewer A advancing an applicant raises the probability that reviewer B advances them from $0.38$ to about $0.58$, because A's yes makes the applicant more likely to be strong.`,
        "No. They are negatively dependent: once reviewer A has advanced an applicant, reviewer B is less likely to, because strong applicants are rarer than weak ones.",
        "It depends on the base rate: with exactly 50% strong applicants the decisions would be independent, but at 30% they are not.",
      ],
      correct: 1,
    },
    hints: [
      "Independence means P(B advances | A advances) equals P(B advances). Compute both numbers.",
      "P(B advances) by total probability: 0.3 × 0.8 + 0.7 × 0.2. For P(both advance), multiply within each quality group and add.",
      "Compare P(both)/P(A) with P(B). If A's yes shifts your belief about quality, it must shift your forecast of B.",
    ],
    solution: String.raw`Compute the unconditional numbers. By total probability, each reviewer advances an applicant with probability
$P(A) = P(B) = 0.3 \times 0.8 + 0.7 \times 0.2 = 0.24 + 0.14 = 0.38.$

For both to advance, use conditional independence inside each quality group:
$P(A \cap B) = 0.3 \times 0.8^2 + 0.7 \times 0.2^2 = 0.192 + 0.028 = 0.22.$

If the decisions were independent we would have $P(A \cap B) = 0.38^2 = 0.1444$. Instead it is $0.22$, so they are dependent, and positively so: $P(B \mid A) = 0.22 / 0.38 \approx 0.58$, well above $0.38$.

The mechanism is Bayesian. Reviewer A's yes is evidence that the applicant is strong: $P(\text{strong} \mid A) = 0.24/0.38 \approx 0.63$, up from $0.30$. Strong applicants are the ones B tends to advance, so B's yes becomes more likely. The dependence runs entirely through the shared hidden cause (quality); once you condition on quality it disappears, which is exactly what "conditionally independent" means.

The base-rate option is also false: for any base rate strictly between 0 and 1, two informative reviewers are positively dependent, because the covariance of the two indicators equals the variance of $P(\text{advance} \mid \text{quality})$ across the population, which is positive whenever the two groups behave differently. The second statement is the correct one.`,
    steps: [
      "Compute P(A) = P(B) = 0.38 by total probability.",
      "Compute P(both) = 0.22 using conditional independence within each group.",
      "Compare with the independence benchmark 0.38 squared = 0.1444.",
      "Explain the positive dependence through the shared hidden quality.",
    ],
    keyIdea: "Conditional independence given a hidden cause produces unconditional dependence: the first signal shifts your belief about the cause, and the cause drives the second signal.",
    commonMistake: "Reading 'the reviewers decide independently' as licence to multiply P(A) by P(B); the multiplication is only valid inside each quality group.",
    fastPath: "P(both) = 0.3(0.64) + 0.7(0.04) = 0.22 versus 0.38 squared = 0.144. Bigger, so positively dependent.",
    variation: "Both reviewers advance an applicant. What is the probability the applicant is strong?",
    variationAnswer: String.raw`Odds $3:7$ times $(0.8/0.2)^2 = 16$ gives $48:7$, probability $48/55 \approx 0.873$. Equivalently $0.192 / 0.22$.`,
    verifiedBy: ["exhaustive-search", "simulation"],
  },
  {
    id: "m3-p14",
    module: 3,
    kind: "practice",
    difficulty: 3,
    tags: ["bayes", "urns"],
    minutes: 4,
    title: "Three urns, two red draws",
    prompt: String.raw`Three urns stand on a shelf. Urn 1 holds 1 red and 3 blue marbles, urn 2 holds 2 red and 2 blue, and urn 3 holds 3 red and 1 blue. You pick one urn at random (each with probability $1/3$), draw a marble, note its colour, put it back and mix, then draw again from the same urn. Both draws are red. What is the probability that you picked urn 3?`,
    answer: { type: "numeric", value: 9 / 14, exact: String.raw`\frac{(3/4)^2}{(1/4)^2 + (2/4)^2 + (3/4)^2} = \frac{9}{14}` },
    hints: [
      "Three hypotheses with equal priors. The posterior of each is proportional to its likelihood of producing two reds.",
      "With replacement, the likelihoods are (1/4)², (2/4)² and (3/4)².",
      "Normalise: 9/16 divided by (1 + 4 + 9)/16.",
    ],
    solution: String.raw`Let $U_1, U_2, U_3$ denote the urns, each with prior probability $1/3$. Because the first marble is returned and the urn is mixed, the two draws are independent given the urn, and the likelihood of "red, red" is the square of the urn's red fraction:
$P(RR \mid U_1) = \left(\tfrac{1}{4}\right)^2 = \tfrac{1}{16}, \quad P(RR \mid U_2) = \left(\tfrac{2}{4}\right)^2 = \tfrac{4}{16}, \quad P(RR \mid U_3) = \left(\tfrac{3}{4}\right)^2 = \tfrac{9}{16}.$

With equal priors the common factor $1/3$ cancels, and Bayes' rule says the posterior is each likelihood over the sum of the likelihoods:
$P(U_3 \mid RR) = \frac{9/16}{1/16 + 4/16 + 9/16} = \frac{9}{14} \approx 0.643.$

The other posteriors are $1/14$ and $4/14$; they are in the ratio $1 : 4 : 9$, the squares of the red fractions $1 : 2 : 3$. Each red draw multiplies the odds between urns by the ratio of their red fractions, so after two reds the odds are squared. One red draw alone would have given $3/6 = 1/2$ for urn 3; the second red pushes it to $9/14$.`,
    steps: [
      "Set equal priors 1/3 for the three urns.",
      "Write the likelihood of two reds for each urn: squares of 1/4, 2/4, 3/4.",
      "Normalise: 9/(1 + 4 + 9) = 9/14.",
      "Sanity-check the ratio 1:4:9 against the red fractions 1:2:3.",
    ],
    keyIdea: "With equal priors, posteriors are proportional to likelihoods, and independent draws make likelihoods multiply.",
    commonMistake: String.raw`Using the likelihood for one red draw ($1/4, 2/4, 3/4$) and reporting $3/6 = 1/2$, or forgetting that both draws must be explained.`,
    fastPath: "Squares of 1, 2, 3 are 1, 4, 9. Posterior for urn 3 is 9/14.",
    variation: "Same urns, but the first marble is not returned: the two draws are without replacement. Now what is the probability that you picked urn 3?",
    variationAnswer: String.raw`Likelihoods: urn 1 gives $\frac{1}{4}\cdot\frac{0}{3} = 0$, urn 2 gives $\frac{2}{4}\cdot\frac{1}{3} = \frac{1}{6}$, urn 3 gives $\frac{3}{4}\cdot\frac{2}{3} = \frac{1}{2}$. Posterior for urn 3: $\frac{1/2}{1/6 + 1/2} = \frac{3}{4}$.`,
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m3-p15",
    module: 3,
    kind: "practice",
    difficulty: 3,
    tags: ["conditional", "bayes", "sample-space"],
    minutes: 4,
    title: "The child who came along",
    prompt: String.raw`A colleague has exactly two children; assume each is independently a boy or a girl with probability $1/2$. You run into her at the shops with one child. Which of her two children came along was decided by a fair coin flip, with no regard to sex. The child with her is a girl. What is the probability that both of her children are girls? Choose the correct value and reasoning.`,
    answer: {
      type: "choice",
      options: [
        String.raw`$1/3$: the child you met being a girl tells you exactly that at least one child is a girl, which leaves three equally likely families.`,
        String.raw`$1/2$: the child with her is a girl, and the other child's sex is independent of the sex of the child you happened to meet.`,
        String.raw`$2/3$: of the three families with at least one girl, two of them have a girl as the elder child.`,
        String.raw`$1/4$: the prior probability of two girls is unchanged because you were going to meet one of the children anyway.`,
      ],
      correct: 1,
    },
    hints: [
      "Write the sample space as (elder, younger, which child came along): eight equally likely outcomes.",
      "Count the outcomes in which the child who came along is a girl, and among them the ones where both are girls.",
      "A random-child observation points at a specific child; compare with asking 'at least one girl?'.",
    ],
    solution: String.raw`Model the information exactly as it was generated. The family is one of BB, BG, GB, GG (elder first), each with probability $1/4$, and independently the child who came along is the elder or the younger with probability $1/2$ each. That gives eight equally likely outcomes.

The child you meet is a girl in these outcomes: from BG, the younger came along (one outcome); from GB, the elder came along (one outcome); from GG, either child (two outcomes). Four outcomes in total, two of which are the GG family. Hence
$P(GG \mid \text{met a girl}) = \frac{2}{4} = \frac{1}{2}.$

Why is this not $1/3$? A mixed family produces a girl at the shops only half the time, while a two-girl family produces a girl every time. That extra weight on GG is exactly what the "at least one girl" question lacks: there, a mixed family counts fully, because the mother would say yes regardless of which child you might have met. The same information (a girl exists) arrived through two different mechanisms, and the mechanism changes the answer.

The cleanest way to see $1/2$: the child in front of you is a girl, and the other child's sex is independent of everything you observed. The second option is correct.`,
    steps: [
      "Enumerate families times which child came along: eight equally likely outcomes.",
      "Keep the four outcomes where the accompanying child is a girl.",
      "Two of them are GG, so the probability is 1/2.",
      "Contrast with 'at least one girl', which weights mixed families fully and gives 1/3.",
    ],
    keyIdea: "An observation of a randomly selected child is information about that child, and the sibling stays independent.",
    commonMistake: String.raw`Collapsing "I met a girl" into "at least one is a girl" and answering $1/3$; the two statements are generated differently and carry different weight.`,
    fastPath: "Random child is a girl: the other child is a coin flip. One half.",
    variation: "Instead, your colleague tells you unprompted, 'I have at least one daughter,' and you know she would have said this whenever it was true. What is the probability that both are girls?",
    variationAnswer: String.raw`Now the information is 'at least one girl' with no specific child singled out: BB is excluded and GG is one of three equally likely survivors, so $1/3$.`,
    family: "two-children",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m3-p16",
    module: 3,
    kind: "practice",
    difficulty: 3,
    tags: ["monty-hall", "conditional"],
    minutes: 4,
    title: "The stand-in host",
    prompt: String.raw`A game show has three doors. One hides a car, the other two hide goats, and the car is equally likely to be behind any door. You pick door 1. Tonight's host is a stand-in who does not know where the car is. He opens one of the two doors you did not pick, chosen by a fair coin flip, whatever happens to be behind it. It turns out to be a goat. He then offers to let you switch to the other closed door. If you switch, what is the probability that you win the car?`,
    answer: { type: "numeric", value: 1 / 2, exact: String.raw`\frac{1/3}{2/3} = \frac{1}{2}` },
    hints: [
      "Enumerate car position (3 cases) times the host's coin flip (2 cases): six equally likely scenarios.",
      "In how many of the six does the opened door show a goat? In how many of those is the car behind the remaining closed door?",
      "The host could have revealed the car and did not; that event is evidence too, and it favours your door.",
    ],
    solution: String.raw`Six equally likely scenarios: the car is behind door 1, 2 or 3 (probability $1/3$ each), and independently the host's coin sends him to door 2 or door 3 (probability $1/2$ each).

Car behind 1: whichever door he opens shows a goat (two scenarios, both goats). Car behind 2: he opens door 2 and reveals the car (one scenario), or opens door 3 and shows a goat (one scenario). Car behind 3: symmetric, one car reveal and one goat.

So a goat is shown in four of the six scenarios, each of probability $1/6$. Among those four, the car is behind the remaining closed door in two (car behind 2 with door 3 opened; car behind 3 with door 2 opened) and behind your door in the other two. Therefore
$P(\text{switch wins} \mid \text{goat shown}) = \frac{2/6}{4/6} = \frac{1}{2}.$

Compare with the knowing host, where switching wins $2/3$ of the time. The difference is that a host who knows is *constrained* to avoid the car, so his choice leaks information; a host who flips a coin leaks nothing about where the car is, except that it is not behind the opened door. Seeing a goat from a random host is more likely when the car is behind your door (certain) than when it is not (a coin flip), and this pushes your door up from $1/3$ to $1/2$. Switching neither helps nor hurts: the answer is $\frac{1}{2}$.`,
    steps: [
      "Enumerate car position times the host's coin: six equally likely scenarios.",
      "Mark the four scenarios in which a goat is revealed.",
      "Count the two scenarios among them where the car is behind the other closed door.",
      "Explain why this differs from the knowing host (2/3).",
    ],
    keyIdea: "A host who might have revealed the car but did not provides evidence for your original door, which cancels the usual advantage of switching.",
    commonMistake: String.raw`Answering $2/3$ by reflex. The $2/3$ depends on the host being forced to avoid the car.`,
    fastPath: "Random host: a goat appears with probability 1 if the car is yours, 1/2 otherwise. Posterior for your door is (1/3)/(1/3 + 1/3) = 1/2, so switching is also 1/2.",
    variation: "Same stand-in host, but tonight there are four doors; you pick one, he opens one of the other three at random and it shows a goat. You may switch to one of the two remaining closed doors. What is the probability that you win if you switch to one of them at random?",
    variationAnswer: String.raw`Posterior for your door: $\frac{1/4}{1/4 + (3/4)(2/3)} = \frac{1/4}{3/4} = \frac{1}{3}$. The remaining $2/3$ splits equally over two doors, so each is $1/3$. Switching to either door wins with probability $1/3$, the same as staying.`,
    family: "monty-hall",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m3-p17",
    module: 3,
    kind: "practice",
    difficulty: 3,
    tags: ["bayes", "conditional", "cards"],
    minutes: 4,
    title: "Bulls and bears on both sides",
    prompt: String.raw`A deck of six cards is printed on both sides. Two cards show a bull on both sides, one card shows a bear on both sides, and three cards show a bull on one side and a bear on the other. You shuffle the deck, draw one card, and lay it on the table with a random side facing up (each side equally likely). The side you see shows a bull. What is the probability that the hidden side also shows a bull?`,
    answer: { type: "numeric", value: 4 / 7, exact: String.raw`\frac{4}{7}` },
    hints: [
      "Condition on the face you actually saw, not on the card you think you drew. Count faces, not cards.",
      "There are 12 faces in the deck, all equally likely to be the one facing up. How many of them show a bull?",
      "Of the bull faces, how many have a bull on the reverse?",
    ],
    solution: String.raw`The experiment picks a card uniformly and then a side uniformly, so each of the $6 \times 2 = 12$ faces is equally likely to end up on top. Work with faces.

Bull faces: the two bull-bull cards contribute $2 \times 2 = 4$ bull faces, the three bull-bear cards contribute $3 \times 1 = 3$, and the bear-bear card contributes none. That is $7$ bull faces, and the conditioning event "a bull is showing" has probability $7/12$.

Among those seven bull faces, the four on the bull-bull cards have a bull on the reverse; the three on mixed cards have a bear. So
$P(\text{hidden side is a bull} \mid \text{bull showing}) = \frac{4/12}{7/12} = \frac{4}{7} \approx 0.571.$

The tempting wrong answer counts cards instead of faces: "the card is bull-bull or bull-bear, two bull-bull and three mixed, so $2/5$." That treats a bull-bull card and a mixed card as equally likely to show a bull, but a bull-bull card shows a bull twice as often. Bayes' rule with the card as the hypothesis says the same thing: prior $2/6$ versus $3/6$, likelihoods of a bull face $1$ versus $1/2$, posterior $\frac{2 \cdot 1}{2 \cdot 1 + 3 \cdot \frac{1}{2}} = \frac{2}{3.5} = \frac{4}{7}$.`,
    steps: [
      "Recognise that cards times sides gives 12 equally likely faces.",
      "Count bull faces: 4 from bull-bull cards plus 3 from mixed cards equals 7.",
      "Count bull faces whose reverse is a bull: 4.",
      "Divide: 4/7, and explain why counting cards (2/5) is wrong.",
    ],
    keyIdea: "Condition on the observed face: a double-bull card produces a bull face twice as often as a mixed card, so it gets double weight.",
    commonMistake: String.raw`Counting cards that could show a bull (2 bull-bull versus 3 mixed) and answering $2/5$, which ignores that the mixed cards show a bull only half the time.`,
    fastPath: "Twelve faces, seven are bulls, four of those have a bull behind: 4/7.",
    variation: "You add a seventh card, bull on both sides, to the deck and repeat the experiment. Given a bull is showing, what is the probability the hidden side is a bull?",
    variationAnswer: String.raw`Bull faces become $6 + 3 = 9$, of which 6 have a bull behind: $6/9 = 2/3$.`,
    family: "bertrand-box",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m3-p18",
    module: 3,
    kind: "practice",
    difficulty: 3,
    tags: ["sequential-updating", "bayes", "coins"],
    minutes: 4,
    title: "Four heads from the jar",
    prompt: String.raw`A jar contains ten coins. Nine are fair and one is biased, landing heads with probability $3/4$. You take one coin at random, flip it four times, and see four heads. What is the probability that you took the biased coin?`,
    answer: {
      type: "numeric",
      value: ((1 / 10) * Math.pow(3 / 4, 4)) / ((1 / 10) * Math.pow(3 / 4, 4) + (9 / 10) * Math.pow(1 / 2, 4)),
      exact: String.raw`\frac{\frac{1}{10}\left(\frac{3}{4}\right)^4}{\frac{1}{10}\left(\frac{3}{4}\right)^4 + \frac{9}{10}\left(\frac{1}{2}\right)^4} = \frac{81}{225} = \frac{9}{25}`,
    },
    hints: [
      "Start from the prior odds of biased to fair: 1 to 9.",
      "Each head is 3/4 likely from the biased coin and 1/2 from a fair one: a likelihood ratio of 3/2 per head.",
      "Four heads multiply the odds by (3/2)⁴ = 81/16. Convert the posterior odds to a probability.",
    ],
    solution: String.raw`Prior odds of biased against fair: $1 : 9$. Each head has probability $3/4$ under the biased coin and $1/2$ under a fair coin, a likelihood ratio of $\frac{3/4}{1/2} = \frac{3}{2}$ in favour of the biased coin. Flips are independent given the coin, so four heads multiply the odds by $(3/2)^4 = 81/16$.

Posterior odds: $\frac{81}{16} : 9 = 81 : 144 = 9 : 16$. As a probability,
$P(\text{biased} \mid HHHH) = \frac{9}{9 + 16} = \frac{9}{25} = 0.36.$

Writing Bayes' rule in full gives the same: $\dfrac{\frac{1}{10}(3/4)^4}{\frac{1}{10}(3/4)^4 + \frac{9}{10}(1/2)^4} = \dfrac{81/2560}{81/2560 + 144/2560} = \dfrac{81}{225}$.

Four heads in a row is striking, but the biased coin is only moderately biased and starts nine times less likely than a fair coin. The evidence (a factor of about 5) does not fully overcome the prior (a factor of 9), so the biased coin is still the underdog at $36\%$. The answer is $\frac{9}{25} = 0.36$.`,
    steps: [
      "Write the prior odds 1:9.",
      "Compute the per-head likelihood ratio 3/2 and raise it to the fourth power.",
      "Multiply prior odds by 81/16 to get 9:16.",
      "Convert to the probability 9/25.",
    ],
    keyIdea: "Independent flips multiply the odds by one likelihood ratio per flip; the prior odds set the starting point.",
    commonMistake: String.raw`Reporting $(3/4)^4 \approx 0.32$ or forgetting the 1:9 prior, both of which answer a different question from the one asked.`,
    fastPath: "Odds 1:9 times (3/2)⁴ = 5.06 gives 5.06:9, so roughly 0.36. Exactly 81:144 = 9:16, i.e. 9/25.",
    variation: "You flip the same coin a fifth time and it shows tails. What is the probability it is biased now?",
    variationAnswer: String.raw`Tails has likelihood ratio $\frac{1/4}{1/2} = \frac{1}{2}$. Odds $9:16$ become $9:32$, probability $9/41 \approx 0.22$.`,
    family: "sequential-updating",
    verifiedBy: ["formula", "simulation"],
  },
  {
    id: "m3-p19",
    module: 3,
    kind: "practice",
    difficulty: 3,
    tags: ["sequential-updating", "bayes", "urns"],
    minutes: 4,
    title: "Which urn is it, and by how much?",
    prompt: String.raw`An opaque urn is one of two kinds, equally likely: a "mostly red" urn with 7 red and 3 blue balls, or a "mostly blue" urn with 3 red and 7 blue balls. You draw three balls with replacement (mixing after each draw) and see red, red, blue in that order. Which kind of urn is more likely now, and by how much?`,
    answer: {
      type: "choice",
      options: [
        String.raw`Mostly red is more likely, with posterior odds $7:3$ in its favour (probability $0.7$).`,
        String.raw`Mostly red is more likely, with posterior odds $49:9$ in its favour (probability about $0.84$).`,
        String.raw`Mostly blue is more likely, with posterior odds $7:3$ in its favour.`,
        String.raw`The two kinds are equally likely: the urns are mirror images, so two reds and one blue is equally plausible from either.`,
      ],
      correct: 0,
    },
    hints: [
      "Write the likelihood of the sequence RRB under each urn and take the ratio.",
      "Under mostly red: 0.7 × 0.7 × 0.3. Under mostly blue: 0.3 × 0.3 × 0.7.",
      "Most factors cancel. The surviving ratio is 0.7/0.3, and the prior odds were 1:1.",
    ],
    solution: String.raw`Let $R$ be the mostly-red urn and $B$ the mostly-blue urn, with prior odds $1 : 1$. Draws with replacement are independent given the urn, so
$P(RRB \mid R) = 0.7 \times 0.7 \times 0.3, \qquad P(RRB \mid B) = 0.3 \times 0.3 \times 0.7.$

The likelihood ratio is
$\frac{P(RRB \mid R)}{P(RRB \mid B)} = \frac{0.7 \cdot 0.7 \cdot 0.3}{0.3 \cdot 0.3 \cdot 0.7} = \frac{0.7}{0.3} = \frac{7}{3}.$

One red draw and one blue draw have exactly opposite effects on the odds (ratios $7/3$ and $3/7$), so they cancel, and the evidence boils down to the single surplus red. Posterior odds are $7 : 3$, so $P(R \mid RRB) = 7/10 = 0.7$. The first option is correct.

The $49 : 9$ option counts both reds and forgets the blue draw. The "equally likely" option confuses symmetry of the setup with symmetry of the evidence: the urns are mirror images, but the data have more reds than blues. Notice too that the order of the draws is irrelevant: only the count of reds minus blues matters when the two urns are mirror images.`,
    steps: [
      "State the prior odds 1:1.",
      "Write the likelihood of RRB under each urn as a product.",
      "Cancel the matched red and blue factors to get the ratio 7/3.",
      "Report posterior odds 7:3, probability 0.7.",
    ],
    keyIdea: "With mirror-image hypotheses, each red and each blue multiply the odds by reciprocal factors, so only the net count matters.",
    commonMistake: "Counting the two reds as evidence and ignoring the blue, which gives odds of 49:9 instead of 7:3.",
    fastPath: "One blue cancels one red. Net one red: odds 7:3.",
    variation: "You draw a fourth ball and it is red. Now what are the posterior odds for mostly red?",
    variationAnswer: String.raw`Net two reds: odds $(7/3)^2 = 49 : 9$, probability $49/58 \approx 0.845$.`,
    family: "sequential-updating",
    verifiedBy: ["formula", "simulation"],
  },
  {
    id: "m3-p20",
    module: 3,
    kind: "practice",
    difficulty: 3,
    tags: ["bayes", "dice"],
    minutes: 4,
    title: "Update on the sum of two rolls",
    prompt: String.raw`A box holds two fair dice: a four-sided die with faces 1 to 4 and a six-sided die with faces 1 to 6. You take one die at random (each equally likely), roll it twice, and the two rolls add to 7. What is the probability that you took the four-sided die?`,
    answer: { type: "numeric", value: (2 / 16) / (2 / 16 + 6 / 36), exact: String.raw`\frac{2/16}{2/16 + 6/36} = \frac{1/8}{1/8 + 1/6} = \frac{3}{7}` },
    hints: [
      "The observation is the sum, so you need P(sum = 7) for each die, not the probability of a particular pair.",
      "Four-sided die: which ordered pairs from 1 to 4 add to 7? Six-sided die: six ordered pairs add to 7.",
      "Likelihoods 2/16 and 6/36 with equal priors. Normalise.",
    ],
    solution: String.raw`Two hypotheses with equal priors: $D_4$ (the four-sided die) and $D_6$ (the six-sided die). The evidence is "the two rolls sum to 7", so the likelihood under each die is the probability of that sum.

Four-sided die: the ordered pairs from $\{1,2,3,4\}$ that add to 7 are $(3,4)$ and $(4,3)$, so $P(\text{sum} = 7 \mid D_4) = 2/16 = 1/8$. Six-sided die: the pairs $(1,6), (2,5), (3,4), (4,3), (5,2), (6,1)$ give $P(\text{sum} = 7 \mid D_6) = 6/36 = 1/6$.

Bayes' rule with equal priors:
$P(D_4 \mid \text{sum} = 7) = \frac{1/8}{1/8 + 1/6} = \frac{3/24}{3/24 + 4/24} = \frac{3}{7} \approx 0.429.$

A sum of 7 is the most common sum on the six-sided die and a fairly rare, extreme sum on the four-sided die, so the evidence leans toward $D_6$, with likelihood ratio $(1/6)/(1/8) = 4/3$. The answer is $\frac{3}{7} \approx 0.429$.`,
    steps: [
      "Identify the evidence as the sum, and compute P(sum = 7) under each die.",
      "Four-sided: 2 of 16 ordered pairs. Six-sided: 6 of 36.",
      "Normalise 1/8 against 1/8 + 1/6 to get 3/7.",
    ],
    keyIdea: "The likelihood must be the probability of exactly what you observed (the sum), computed separately under each hypothesis.",
    commonMistake: String.raw`Using the probability of one specific pair such as $(3,4)$ under each die, which gives $\frac{1/16}{1/16 + 1/36} = \frac{9}{13}$, the wrong answer, because the observation was the sum, not the pair.`,
    fastPath: "Likelihoods 1/8 and 1/6, ratio 3:4. Posterior for the small die 3/7.",
    variation: "The two rolls add to 5 instead. What is the probability that you took the four-sided die?",
    variationAnswer: String.raw`Sum 5: four ordered pairs on the four-sided die ($4/16 = 1/4$) and four on the six-sided die ($4/36 = 1/9$). Posterior $\frac{1/4}{1/4 + 1/9} = \frac{9}{13} \approx 0.69$.`,
    verifiedBy: ["enumeration", "simulation"],
  },
  // ---------------------------------------------------------------- difficulty 4
  {
    id: "m3-p21",
    module: 3,
    kind: "practice",
    difficulty: 4,
    tags: ["monty-hall", "conditional", "symmetry"],
    minutes: 5,
    title: "Five doors, two opened",
    prompt: String.raw`A game has five doors. One hides a prize, equally likely to be behind any door; the other four hide nothing. You pick a door. The host knows where the prize is. He opens two of the four doors you did not pick, both empty; whenever more than one pair of empty unpicked doors is available he chooses uniformly at random among the eligible pairs. Two unpicked doors now remain closed. You switch to one of them, chosen by a fair coin flip. What is the probability that you win the prize?`,
    answer: { type: "numeric", value: (4 / 5) * (1 / 2), exact: String.raw`\frac{4}{5}\cdot\frac{1}{2} = \frac{2}{5}` },
    hints: [
      "Your original door's chance cannot change: the host can always open two empty doors whatever you picked.",
      "The remaining 4/5 of the probability is shared by the two closed unpicked doors. By symmetry, how?",
      "Switching to a random one of the two gives half of 4/5.",
    ],
    solution: String.raw`First your own door. The host opens two empty doors from the unpicked four, and he can do this regardless of where the prize is, so the event "he opens two empty doors" happens with probability 1 and carries no information about your door. Your door still has probability $1/5$.

The remaining probability $4/5$ belongs to the two unpicked doors that stayed closed. The host's rule is symmetric between them (when the prize is behind one of them he must leave that one closed and pick the other closed door uniformly among the three empties; when the prize is behind your door he leaves a uniformly random pair closed), so each closed unpicked door carries $\frac{1}{2} \cdot \frac{4}{5} = \frac{2}{5}$.

Switching to one of the two at random therefore wins with probability
$\frac{1}{2}\cdot\frac{2}{5} + \frac{1}{2}\cdot\frac{2}{5} = \frac{2}{5} = 0.4,$
twice the $1/5$ you get by staying.

A full enumeration confirms it. Fix your pick as door 1. If the prize is behind door 1 (probability $1/5$), the host leaves a random pair of the four empties closed and your switch loses. If the prize is behind door $k \ne 1$ (probability $4/5$), the host must leave door $k$ closed plus one of the other three unpicked empties, and your coin flip lands on door $k$ half the time. Total: $\frac{4}{5} \cdot \frac{1}{2} = \frac{2}{5}$.

The trap is to say "three doors remain, so $1/3$ each". The three remaining doors are not symmetric: yours was chosen before the host acted, and the host's forced avoidance of the prize concentrates probability on the doors he left alone.`,
    steps: [
      "Argue that the host's action is uninformative about your door, so it stays at 1/5.",
      "Split the remaining 4/5 equally over the two closed unpicked doors by symmetry.",
      "Switching to a random one wins with probability 2/5.",
      "Confirm by enumerating prize position and the host's choices.",
    ],
    keyIdea: "The host's constrained choice moves probability away from your door and onto the doors he deliberately left closed.",
    commonMistake: String.raw`Treating the three closed doors as equally likely ($1/3$ each). Your door was picked before the host revealed anything, so it keeps its $1/5$.`,
    fastPath: "Stay: 1/5. The other 4/5 splits over two doors: 2/5 each. Switching to either gives 2/5.",
    variation: "Same game, but the host opens three of the four unpicked doors (all empty), leaving exactly one unpicked door closed. What is the probability that switching wins?",
    variationAnswer: String.raw`All of the $4/5$ lands on the single closed unpicked door: switching wins with probability $4/5$.`,
    family: "monty-hall",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m3-p22",
    module: 3,
    kind: "practice",
    difficulty: 4,
    tags: ["monty-hall", "bayes"],
    minutes: 5,
    title: "The host prefers the right-hand door",
    prompt: String.raw`Three doors, one car, equally likely behind each. You pick door 1. The host knows where the car is and always opens one of the two doors you did not pick, never the car. When doors 2 and 3 both hide goats he is not indifferent: he opens door 3 with probability $3/4$ and door 2 with probability $1/4$ (door 3 is nearer his podium), and you know this. He opens door 3. What is the probability that the car is behind door 2?`,
    answer: { type: "numeric", value: (1 / 3) / (1 / 3 + (1 / 3) * (3 / 4)), exact: String.raw`\frac{\frac{1}{3}\cdot 1}{\frac{1}{3}\cdot 1 + \frac{1}{3}\cdot\frac{3}{4}} = \frac{4}{7}` },
    hints: [
      "Bayes with two live hypotheses: car behind door 1 or door 2 (door 3 is ruled out). What is the probability he opens door 3 under each?",
      "Car behind 2: he must open door 3 (probability 1). Car behind 1: he opens door 3 with probability 3/4.",
      "Posterior for door 2 is 1 over (1 + 3/4).",
    ],
    solution: String.raw`After he opens door 3, the car is behind door 1 or door 2. Compute how likely "he opens door 3" is under each.

Car behind door 2 (prior $1/3$): door 2 is off limits, so he must open door 3. Likelihood $1$. Car behind door 1 (prior $1/3$): both other doors are goats and his habit sends him to door 3 with probability $3/4$. Likelihood $3/4$. Car behind door 3: he would never open it, likelihood $0$.

Bayes' rule:
$P(\text{car at 2} \mid \text{opens 3}) = \frac{\frac{1}{3}\cdot 1}{\frac{1}{3}\cdot 1 + \frac{1}{3}\cdot\frac{3}{4}} = \frac{1}{1 + 3/4} = \frac{4}{7} \approx 0.571.$

Switching is still right, but it wins $4/7$ rather than $2/3$. The reason: opening door 3 is partly explained by his habit, so it is weaker evidence that he was forced. Had he opened door 2, against his habit, the evidence would be stronger: $P(\text{car at 3} \mid \text{opens 2}) = \frac{1/3}{1/3 + \frac{1}{3}\cdot\frac{1}{4}} = \frac{4}{5}$. Averaging the two cases with their probabilities ($7/12$ and $5/12$) recovers the unconditional switching win rate of $2/3$: $\frac{7}{12}\cdot\frac{4}{7} + \frac{5}{12}\cdot\frac{4}{5} = \frac{1}{3} + \frac{1}{3} = \frac{2}{3}$. The answer is $\frac{4}{7}$.`,
    steps: [
      "List the live hypotheses after door 3 opens: car at 1 or car at 2.",
      "Write the likelihood of 'opens door 3' under each: 3/4 and 1.",
      "Apply Bayes with equal priors: 1/(1 + 3/4) = 4/7.",
      "Check that averaging over his two possible actions returns the unconditional 2/3.",
    ],
    keyIdea: "The host's tie-breaking rule changes the likelihood of the door he opened, and the posterior tracks that likelihood.",
    commonMistake: String.raw`Answering $2/3$ by habit. That value assumes the host breaks ties by a fair coin.`,
    fastPath: "Odds for door 2 against door 1 are 1 to 3/4, i.e. 4:3. Probability 4/7.",
    variation: "Same host, same habit, but this time he opens door 2. What is the probability that the car is behind door 3?",
    variationAnswer: String.raw`Likelihoods: car at 3 gives 1, car at 1 gives $1/4$. Posterior $\frac{1}{1 + 1/4} = \frac{4}{5}$.`,
    family: "monty-hall",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m3-p23",
    module: 3,
    kind: "practice",
    difficulty: 4,
    tags: ["conditional", "bayes", "sample-space"],
    minutes: 6,
    title: "A son born in March",
    prompt: String.raw`A colleague has exactly two children. Assume each child is independently a boy or a girl with probability $1/2$, and that, independently of everything else, each child's birth month is uniformly distributed over the 12 months. You ask her, "Do you have at least one son who was born in March?" and she truthfully answers yes. What is the probability that both of her children are boys?`,
    answer: { type: "numeric", value: 23 / 47, exact: String.raw`\frac{\frac{1}{4}\left(1 - (11/12)^2\right)}{1 - (23/24)^2} = \frac{23/576}{47/576} = \frac{23}{47}` },
    hints: [
      "Each child has 24 equally likely (sex, month) types. Count ordered pairs of types: 24 × 24 = 576.",
      "Count the pairs with at least one 'boy born in March' by complement: 576 minus 23².",
      "Among those, count the pairs where both children are boys: 12² minus 11².",
    ],
    solution: String.raw`Each child is one of $2 \times 12 = 24$ equally likely types (sex, month), and the two children are independent, so the family is one of $24^2 = 576$ equally likely ordered pairs of types.

The conditioning event is "at least one child is a boy born in March". Exactly one of the 24 types is "boy, March", so the complement (neither child is of that type) has $23^2 = 529$ pairs, and the event has $576 - 529 = 47$ pairs.

Inside that event, "both boys" means both children are among the 12 boy types and at least one of them is the March boy: $12^2 - 11^2 = 144 - 121 = 23$ pairs. Therefore
$P(\text{both boys} \mid \text{at least one March boy}) = \frac{23}{47} \approx 0.489.$

Why is this so close to $1/2$, when "at least one boy" alone gives $1/3$? Among the four equally likely sex orderings, "at least one boy" is met by BB once and by the mixed orderings BG and GB twice, which is where the $1/3$ comes from. Adding "born in March" changes the bookkeeping. A boy-boy family has two boys, hence two chances for one of them to be the March boy; a mixed family has one boy, hence one chance. Boy-boy families are therefore over-represented among the families that satisfy the condition, and their share nearly doubles. The rarer the extra detail, the closer the answer gets to $1/2$: with $n$ equally likely months the answer is $\frac{2n - 1}{4n - 1}$, which tends to $1/2$ as $n$ grows. The answer is $\frac{23}{47} \approx 0.489$.`,
    steps: [
      "Set up the 24 × 24 = 576 equally likely (sex, month) pairs.",
      "Count the conditioning event by complement: 576 - 23² = 47.",
      "Count both-boy pairs with a March boy: 12² - 11² = 23.",
      "Divide to get 23/47 and explain why it is close to 1/2.",
    ],
    keyIdea: "A specific extra detail gives two-boy families two chances to satisfy the condition and mixed families only one, pulling the answer toward 1/2.",
    commonMistake: String.raw`Declaring the birth month irrelevant and answering $1/3$. The month would be irrelevant only if it had been attached to a specific child or learned about a randomly chosen child.`,
    fastPath: "General formula with n categories: (2n - 1)/(4n - 1). For n = 12 that is 23/47.",
    variation: "Instead you ask, 'Do you have at least one son who was born in the first half of the year?' and she says yes. What is the probability that both are boys?",
    variationAnswer: String.raw`Now the detail has $n = 2$ equally likely categories: $\frac{2 \cdot 2 - 1}{4 \cdot 2 - 1} = \frac{3}{7} \approx 0.43$.`,
    family: "two-children",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m3-p24",
    module: 3,
    kind: "practice",
    difficulty: 4,
    tags: ["sequential-updating", "bayes", "independence"],
    minutes: 5,
    title: "Three witnesses, two colours",
    prompt: String.raw`A courier firm's vans are each painted either silver or orange, and 20% of the fleet is orange. One of the firm's vans knocked over a rack of bicycles in the depot yard and drove off. Three members of staff who saw it happen are questioned separately, and each names a colour. Given the van's true colour, each of them independently names it correctly with probability $0.8$ and names the other colour with probability $0.2$. Two say orange and one says silver. What is the probability that the van was orange?`,
    answer: { type: "numeric", value: (0.2 * 0.8 * 0.8 * 0.2) / (0.2 * 0.8 * 0.8 * 0.2 + 0.8 * 0.2 * 0.2 * 0.8), exact: String.raw`\frac{0.2 \times 0.8 \times 0.8 \times 0.2}{0.2 \times 0.8 \times 0.8 \times 0.2 + 0.8 \times 0.2 \times 0.2 \times 0.8} = \frac{1}{2}` },
    hints: [
      "Prior odds orange to silver are 1:4. Each witness who says orange multiplies the odds by 0.8/0.2 = 4.",
      "The witness who says silver multiplies the odds by 0.2/0.8 = 1/4.",
      "Two factors of 4 and one of 1/4 give a net factor of 4. Apply it to 1:4.",
    ],
    solution: String.raw`Work in odds. Prior odds of orange against silver: $0.2 : 0.8 = 1 : 4$.

Each statement is conditionally independent of the others given the true colour, so the likelihood ratios multiply. A witness saying orange has ratio $\dfrac{P(\text{says orange} \mid \text{orange})}{P(\text{says orange} \mid \text{silver})} = \dfrac{0.8}{0.2} = 4$. A witness saying silver has ratio $\dfrac{0.2}{0.8} = \dfrac{1}{4}$.

Two oranges and one silver: total likelihood ratio $4 \times 4 \times \tfrac{1}{4} = 4$. Posterior odds $1 \times 4 : 4 = 1 : 1$, so
$P(\text{orange} \mid \text{two say orange, one says silver}) = \frac{1}{2}.$

In long form, writing OOS for the three reports: $P(\text{orange}) P(\text{OOS} \mid \text{orange}) = 0.2 \times 0.8 \times 0.8 \times 0.2 = 0.0256$ and $P(\text{silver}) P(\text{OOS} \mid \text{silver}) = 0.8 \times 0.2 \times 0.2 \times 0.8 = 0.0256$. Equal, so $1/2$.

The dissenting witness cancels one of the two agreeing witnesses exactly, leaving a single orange report against a 1:4 prior, and a single witness of reliability $0.8$ is worth a factor of 4, precisely the prior disadvantage of orange. Majority vote says orange, but the base rate drags it back to a coin flip. The answer is $\frac{1}{2}$.`,
    steps: [
      "Write the prior odds 1:4 from the 20% base rate.",
      "Assign likelihood ratio 4 to each orange report and 1/4 to the silver report.",
      "Multiply: net factor 4, posterior odds 1:1.",
      "Interpret: the dissenter cancels one supporter, and one supporter exactly offsets the prior.",
    ],
    keyIdea: "Witness reports that are independent given the truth multiply the odds; a dissenting report is a reciprocal factor, not something to ignore.",
    commonMistake: String.raw`Taking a majority vote and reporting $0.8$ or $P(\text{at least two correct}) = 0.896$, which ignores the base rate and treats the dissenter as noise.`,
    fastPath: "Odds 1:4, times 4, times 4, times 1/4 equals 1:1. One half.",
    variation: "All three witnesses say orange. What is the probability that the van was orange?",
    variationAnswer: String.raw`Odds $1:4$ times $4^3 = 64$ gives $64:4 = 16:1$, probability $16/17 \approx 0.94$.`,
    family: "sequential-updating",
    verifiedBy: ["formula", "simulation"],
  },
  {
    id: "m3-p25",
    module: 3,
    kind: "practice",
    difficulty: 4,
    tags: ["bayes", "conditional"],
    minutes: 5,
    title: "The prosecutor's one in a thousand",
    prompt: String.raw`A burglary was committed in a city with 500,000 adults. A rare genetic marker found at the scene is known to belong to the burglar, and the marker occurs in 1 in 1,000 adults. Mr X, one of the city's adults, is tested and has the marker. Apart from the marker there is no evidence linking him to the crime: before the test he was no more suspicious than anyone else, with each of the 500,000 adults equally likely to be the burglar. The prosecutor argues: "Only 1 in 1,000 innocent people would carry this marker, so the probability that Mr X is innocent is 1 in 1,000." Which statement is correct?`,
    answer: {
      type: "choice",
      options: [
        String.raw`The prosecutor is right: $P(\text{innocent} \mid \text{match}) = 1/1000$, so Mr X is guilty with probability $0.999$.`,
        String.raw`The prosecutor has swapped the conditional. $P(\text{match} \mid \text{innocent}) = 1/1000$, but about 500 innocent adults in the city also carry the marker, so $P(\text{guilty} \mid \text{match})$ is only about $1/501 \approx 0.002$.`,
        String.raw`The probability is $1/2$: either he carries the marker because he is guilty or by coincidence, and the test cannot tell the two apart.`,
        String.raw`The probability is about $0.1\%$: the marker's frequency is itself the probability that Mr X is guilty.`,
      ],
      correct: 1,
    },
    hints: [
      "The prosecutor quotes P(match | innocent). The court needs P(guilty | match). They are different conditionals.",
      "Count: how many of the 499,999 innocent adults would you expect to carry the marker?",
      "Mr X is one of roughly 1 + 500 matching adults, and before the test he was no more suspicious than the rest.",
    ],
    solution: String.raw`Set up the counts. One adult is the burglar and carries the marker for certain. Of the other $499{,}999$ adults, a fraction $1/1000$ carry it, which is about $500$ people. So the city contains roughly $501$ marker carriers, exactly one of whom is guilty.

Mr X was selected with no evidence beyond the marker and was, before the test, as likely as anyone else to be the burglar. Conditioning on his match, he is one of the roughly 501 carriers, and since all carriers were equally suspicious before the test,
$P(\text{guilty} \mid \text{match}) = \frac{\frac{1}{500000} \cdot 1}{\frac{1}{500000} \cdot 1 + \frac{499999}{500000} \cdot \frac{1}{1000}} = \frac{1000}{500999} \approx 0.002.$

In odds form: prior odds of guilt are $1 : 499{,}999$, the match has likelihood ratio $1 / (1/1000) = 1000$, and the posterior odds are $1000 : 499{,}999$, about $1 : 500$.

The prosecutor's error is to read $P(\text{match} \mid \text{innocent}) = 0.001$ as $P(\text{innocent} \mid \text{match}) = 0.001$. The two differ by the base rate: guilt is a priori extremely rare, and a 1-in-1,000 marker, applied to half a million people, produces hundreds of innocent matches. The second option is correct. The last option confuses the frequency of the marker with the posterior probability; the first option states the fallacy itself; the $1/2$ option ignores both the prior and the likelihood.

The posterior would change completely if Mr X had been identified first by independent evidence (say, he was seen nearby), which would raise the prior odds far above $1 : 499{,}999$ before the marker is even considered.`,
    steps: [
      "Name the two conditionals and note that the prosecutor quoted the wrong one.",
      "Count expected innocent carriers: about 500 among 499,999 adults.",
      "Mr X is one of about 501 equally suspicious carriers: posterior about 1/501.",
      "Confirm with Bayes in odds form: 1 : 499,999 times 1000.",
    ],
    keyIdea: "P(evidence | innocent) is not P(innocent | evidence); the gap between them is the base rate of guilt in the population the suspect was drawn from.",
    commonMistake: "Accepting 'one in a thousand' as the chance of innocence, because the two conditionals sound alike when spoken aloud.",
    fastPath: "Innocent carriers: 500,000/1,000 = 500. One guilty carrier among about 501. About 0.2%.",
    variation: "Suppose instead that Mr X was first identified by a witness, and that this alone made the odds of his guilt 1 to 9. Then the marker test comes back positive. What is the probability he is guilty now?",
    variationAnswer: String.raw`Odds $1:9$ times the likelihood ratio $1000$ give $1000:9$, probability $1000/1009 \approx 0.991$. Same marker, very different conclusion, because the prior changed.`,
    verifiedBy: ["enumeration", "formula"],
  },
  // ---------------------------------------------------------------- difficulty 5
  {
    id: "m3-p26",
    module: 3,
    kind: "practice",
    difficulty: 5,
    tags: ["sequential-updating", "bayes", "dice"],
    minutes: 7,
    title: "Is the die loaded?",
    prompt: String.raw`A drawer holds dice, one in four of which is loaded. A loaded die shows 6 with probability $1/2$ and each of the other five faces with probability $1/10$; the rest are fair. You take a die at random and roll it five times, getting 6, 2, 6, 6, 4 in that order. What is the probability that the die is loaded?`,
    answer: {
      type: "numeric",
      value: ((1 / 4) * Math.pow(1 / 2, 3) * Math.pow(1 / 10, 2)) / ((1 / 4) * Math.pow(1 / 2, 3) * Math.pow(1 / 10, 2) + (3 / 4) * Math.pow(1 / 6, 5)),
      exact: String.raw`\frac{\frac{1}{4}\left(\frac{1}{2}\right)^3\left(\frac{1}{10}\right)^2}{\frac{1}{4}\left(\frac{1}{2}\right)^3\left(\frac{1}{10}\right)^2 + \frac{3}{4}\left(\frac{1}{6}\right)^5} = \frac{81}{106} \approx 0.764`,
    },
    hints: [
      "Prior odds loaded to fair are 1:3. Each roll contributes a likelihood ratio; multiply them all.",
      "A 6 has ratio (1/2)/(1/6) = 3. A specific non-6 face has ratio (1/10)/(1/6) = 3/5. The non-6 rolls are evidence against loading.",
      "Three sixes and two non-sixes: 27 × 9/25 = 243/25. Multiply the prior odds and convert.",
    ],
    solution: String.raw`Let $L$ be "loaded" and $F$ "fair", with prior odds $P(L) : P(F) = 1 : 3$. The rolls are independent given the die, so the likelihood ratio of the whole sequence is the product of the per-roll ratios.

A roll of 6 has probability $1/2$ under $L$ and $1/6$ under $F$: ratio $3$ in favour of loaded. A roll showing a specific other face, such as 2 or 4, has probability $1/10$ under $L$ and $1/6$ under $F$: ratio $3/5$, which is evidence *against* loading, because a loaded die makes non-6 faces rarer.

The sequence 6, 2, 6, 6, 4 has three sixes and two other faces:
$\text{LR} = 3^3 \times \left(\frac{3}{5}\right)^2 = 27 \times \frac{9}{25} = \frac{243}{25} = 9.72.$

Posterior odds: $1 \times \frac{243}{25} : 3 = 243 : 75 = 81 : 25$. As a probability,
$P(L \mid \text{rolls}) = \frac{81}{81 + 25} = \frac{81}{106} \approx 0.764.$

Written out, this is $\dfrac{\frac{1}{4}(1/2)^3(1/10)^2}{\frac{1}{4}(1/2)^3(1/10)^2 + \frac{3}{4}(1/6)^5} = \dfrac{1/3200}{1/3200 + 1/10368}$, the same number.

Two remarks. First, the order of the rolls does not matter; only the counts do. Second, it makes no difference whether you record the exact non-6 faces or just "not a 6": the ratio for "not a 6" is $(1/2)/(5/6) = 3/5$, identical to the ratio for any specific non-6 face, because a loaded die spreads its non-6 probability uniformly. Ignoring the two non-6 rolls altogether would be wrong, though: three sixes alone give odds $27 : 3 = 9 : 1$, a posterior of $0.9$, which overstates the evidence. The answer is $\frac{81}{106} \approx 0.764$.`,
    steps: [
      "Write the prior odds 1:3.",
      "Compute the likelihood ratio of a 6 (3) and of a non-6 face (3/5).",
      "Multiply: 27 × 9/25 = 243/25, then apply to the prior odds to get 81:25.",
      "Convert to 81/106 and note that the non-6 rolls pulled the posterior down from 0.9.",
    ],
    keyIdea: "Every observation updates the odds, including the unremarkable ones; a non-6 is evidence against a six-heavy die.",
    commonMistake: String.raw`Updating only on the sixes and reporting $0.9$, or treating a non-6 under the loaded die as having probability $1/6$ instead of $1/10$.`,
    fastPath: "Odds 1:3 times 27 times 9/25 is 243:75 = 81:25. 81/106 is about 0.76.",
    variation: "Starting fresh with the same drawer, how many consecutive sixes would you need to roll before the probability that the die is loaded first exceeds 95%?",
    variationAnswer: String.raw`Odds after $n$ sixes are $3^n : 3 = 3^{n-1} : 1$; we need $3^{n-1} \ge 19$, so $n = 4$ (odds $27:1$, probability $27/28 \approx 0.964$; three sixes give only $0.9$).`,
    family: "sequential-updating",
    verifiedBy: ["formula", "simulation"],
  },
  {
    id: "m3-p27",
    module: 3,
    kind: "practice",
    difficulty: 5,
    tags: ["conditional", "bayes", "independence", "sample-space"],
    minutes: 6,
    title: "A left-handed daughter at the door",
    prompt: String.raw`A colleague has exactly two children. Each is independently a boy or a girl with probability $1/2$, and independently of sex and of the sibling, each child is left-handed with probability $1/10$. You call at her house and one of the two children opens the door; which child answered was decided by a fair coin flip, with no regard to sex or handedness. The child at the door is a left-handed girl. What is the probability that both of her children are girls?`,
    answer: { type: "numeric", value: 1 / 2, exact: String.raw`\frac{1}{2}` },
    hints: [
      "Model the sample space exactly: (elder's sex and hand, younger's sex and hand, which child answered). All the ingredients are independent.",
      "The observation is about the child at the door only. Does it tell you anything about the sibling?",
      "Compare with asking 'do you have at least one left-handed daughter?', where the rare detail would matter.",
    ],
    solution: String.raw`Set up the sample space properly. Each child has a sex and a handedness, independent of each other and of the sibling; the coin flip that chooses who answers the door is independent of all of it. The observation is "the child who answered is a left-handed girl".

Write the two children as $C_1$ (the one who answered) and $C_2$ (the other). Because the door-answerer is chosen by a fair coin independently of the children's attributes, the pair $(C_1, C_2)$ is just a relabelling of (elder, younger) and the two are still independent, each a girl with probability $1/2$ and left-handed with probability $1/10$. The observation concerns $C_1$ alone, so
$P(\text{both girls} \mid C_1 \text{ is a left-handed girl}) = P(C_2 \text{ is a girl}) = \frac{1}{2}.$

Checking by counting: the probability that the door-answerer is a left-handed girl and the other child is a girl is $\frac{1}{2}\cdot\frac{1}{10}\cdot\frac{1}{2} = \frac{1}{40}$; the probability that the door-answerer is a left-handed girl is $\frac{1}{2}\cdot\frac{1}{10} = \frac{1}{20}$. The ratio is $\frac{1}{2}$.

The rare detail (left-handedness) adds nothing here, and this is the point of the problem. Compare the question "do you have at least one left-handed daughter?": a yes to that question does not single out a child, and a two-girl family has two chances to produce a left-handed daughter against a mixed family's one, so the answer would be $\frac{(1/4)(1 - (9/10)^2)}{1 - (19/20)^2} = \frac{19}{39} \approx 0.487$, close to but not equal to $1/2$. When the information arrives through a randomly selected child, no such over-weighting occurs: you learned about one specific child, and the sibling is independent of that child. The answer is $\frac{1}{2}$.`,
    steps: [
      "Write the sample space with sexes, handedness and the door-answering coin flip, all independent.",
      "Relabel the children as 'answered' and 'did not answer'; independence survives the relabelling.",
      "Note that the observation concerns the answering child only, so the sibling is a fresh coin: 1/2.",
      "Contrast with the 'at least one left-handed daughter' question, which would give 19/39.",
    ],
    keyIdea: "Information obtained from a randomly chosen child is information about that child alone; extra details about that child cannot change the sibling's odds.",
    commonMistake: String.raw`Importing the 'rare detail pulls the answer toward 1/2' reasoning from the at-least-one version and reporting $19/39$; that formula applies only when the detail is not tied to a specific child.`,
    fastPath: "Random child at the door: the other child is an independent coin flip. One half, no matter what else you noticed about the child in front of you.",
    variation: "Instead of a random child answering, your colleague says, 'Yes, at least one of my children is a left-handed girl.' You know she would say this whenever it is true. What is the probability that both children are girls?",
    variationAnswer: String.raw`$\dfrac{\frac{1}{4}\left(1 - \left(\frac{9}{10}\right)^2\right)}{1 - \left(\frac{19}{20}\right)^2} = \dfrac{19/400}{39/400} = \dfrac{19}{39} \approx 0.487$.`,
    family: "two-children",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m3-p28",
    module: 3,
    kind: "practice",
    difficulty: 5,
    tags: ["sequential-updating", "total-probability", "bayes", "coins"],
    minutes: 7,
    title: "Predict the next flip",
    prompt: String.raw`A drawer holds four coins, one of each kind: they land heads with probabilities $0$, $1/3$, $2/3$ and $1$. You take one coin at random, flip it three times and see heads, heads, tails. You will flip the same coin once more. What is the probability that this fourth flip shows heads?`,
    answer: { type: "numeric", value: (1 / 3) * (1 / 3) + (2 / 3) * (2 / 3), exact: String.raw`\frac{1}{3}\cdot\frac{1}{3} + \frac{2}{3}\cdot\frac{2}{3} = \frac{5}{9}` },
    hints: [
      "Two steps: update your beliefs about the coin from HHT, then average the heads probability over those beliefs.",
      "HHT is impossible for the always-tails coin and for the always-heads coin. Which two coins remain, and with what likelihoods?",
      "Posterior weights 1/3 and 2/3 on the 1/3-coin and the 2/3-coin; now compute the predictive probability of heads.",
    ],
    solution: String.raw`Step one: update on the data. With prior $1/4$ on each coin, the posterior is proportional to the likelihood of HHT, which for a coin with heads probability $p$ is $p^2(1 - p)$:
$p = 0: 0, \qquad p = \tfrac{1}{3}: \tfrac{1}{9}\cdot\tfrac{2}{3} = \tfrac{2}{27}, \qquad p = \tfrac{2}{3}: \tfrac{4}{9}\cdot\tfrac{1}{3} = \tfrac{4}{27}, \qquad p = 1: 0.$
The two extreme coins are ruled out (one cannot produce heads, the other cannot produce tails). Normalising the remaining weights $2/27$ and $4/27$ gives posterior probabilities $1/3$ for the $p = 1/3$ coin and $2/3$ for the $p = 2/3$ coin.

Step two: predict. The next flip's heads probability is the posterior-weighted average of the coins' heads probabilities (the law of total probability applied to the posterior):
$P(H_4 \mid HHT) = \frac{1}{3}\cdot\frac{1}{3} + \frac{2}{3}\cdot\frac{2}{3} = \frac{1}{9} + \frac{4}{9} = \frac{5}{9} \approx 0.556.$

Alternative route, as a check: $P(H_4 \mid HHT) = P(HHTH)/P(HHT)$, with both computed by averaging over the four coins. $P(HHTH) = \frac{1}{4}\left(0 + \frac{1}{9}\cdot\frac{2}{3}\cdot\frac{1}{3} + \frac{4}{9}\cdot\frac{1}{3}\cdot\frac{2}{3} + 0\right) = \frac{1}{4}\cdot\frac{10}{81}$ and $P(HHT) = \frac{1}{4}\cdot\frac{6}{27} = \frac{1}{4}\cdot\frac{18}{81}$; the ratio is $10/18 = 5/9$.

Note that the answer is neither the observed frequency $2/3$ nor the bias of the most likely coin. It is the posterior mean of the bias, $\frac{1}{3}\cdot\frac{1}{3} + \frac{2}{3}\cdot\frac{2}{3} = \frac{5}{9}$: the predictive probability of heads always equals the posterior mean of $p$. It sits below the empirical $2/3$ because the prior still gives real weight to the $1/3$ coin. The answer is $\frac{5}{9} \approx 0.556$.`,
    steps: [
      "Compute the likelihood p²(1 - p) of HHT for each of the four coins.",
      "Rule out the two deterministic coins and normalise: posteriors 1/3 and 2/3.",
      "Average the heads probabilities under the posterior: 1/9 + 4/9 = 5/9.",
      "Cross-check with P(HHTH)/P(HHT).",
    ],
    keyIdea: "Predicting the next observation means averaging over the posterior: the predictive probability of heads is the posterior mean of the coin's bias.",
    commonMistake: String.raw`Reporting $2/3$, the heads probability of the most likely coin (or the observed frequency), instead of averaging over both surviving coins.`,
    fastPath: "HHT kills the 0 and 1 coins. Likelihoods 2/27 and 4/27, so weights 1/3 and 2/3. Predictive: 1/9 + 4/9 = 5/9.",
    variation: "The fourth flip comes up heads. What is the probability that the fifth flip is also heads?",
    variationAnswer: String.raw`Update with likelihood ratio $(2/3)/(1/3) = 2$ for the $2/3$ coin: odds $2:1$ become $4:1$, posteriors $1/5$ and $4/5$. Predictive $\frac{1}{5}\cdot\frac{1}{3} + \frac{4}{5}\cdot\frac{2}{3} = \frac{1}{15} + \frac{8}{15} = \frac{3}{5}$.`,
    family: "sequential-updating",
    verifiedBy: ["formula", "simulation"],
  },
  // ---------------------------------------------------------------- lesson checks
  {
    id: "m3-lc1",
    module: 3,
    kind: "lessonCheck",
    difficulty: 1,
    tags: ["conditional", "dice"],
    minutes: 1,
    title: "A three given a sum of six",
    prompt: String.raw`Two fair six-sided dice are rolled and you are told that the sum is 6. What is the probability that at least one die shows a 3?`,
    answer: { type: "numeric", value: 1 / 5, exact: String.raw`\frac{1}{5}` },
    hints: [
      "List the ordered pairs that add to 6.",
      "There are five of them: 1-5, 2-4, 3-3, 4-2, 5-1.",
      "Only one of the five contains a 3.",
    ],
    solution: String.raw`Conditioning on "sum is 6" leaves five equally likely ordered outcomes: 1-5, 2-4, 3-3, 4-2 and 5-1. Only 3-3 shows a 3, so
$P(\text{a 3 appears} \mid \text{sum} = 6) = \frac{1/36}{5/36} = \frac{1}{5} = 0.2.$

The trap is to think a 3 is "one of the ways to make 6" and over-count it; a 3 paired with a 3 is a single outcome, whereas 2-4 and 4-2 are two.`,
    steps: ["List the five ordered pairs that sum to 6.", "Spot that only 3-3 contains a 3.", "Divide: 1/5."],
    keyIdea: "Restrict to the outcomes consistent with the information and count inside that set.",
    commonMistake: String.raw`Answering $1/3$ by reasoning that 'sum 6 has three unordered splits (1+5, 2+4, 3+3) and one has a 3', which forgets that the ordered outcomes are the equally likely ones.`,
    fastPath: "Five ordered pairs sum to 6, one is 3-3.",
    variation: "Same setup, but the sum is 7. What is the probability that at least one die shows a 3?",
    variationAnswer: String.raw`Six ordered pairs sum to 7; 3-4 and 4-3 contain a 3: $2/6 = 1/3$.`,
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m3-lc2",
    module: 3,
    kind: "lessonCheck",
    difficulty: 1,
    tags: ["bayes", "conditional"],
    minutes: 1,
    title: "Positive test at the tournament",
    prompt: String.raw`At a chess tournament, 1% of players have taken a banned stimulant. The test used flags 90% of players who took it and also flags 10% of players who did not. A player tests positive. What is the probability that the player actually took the stimulant?`,
    answer: { type: "numeric", value: (0.01 * 0.9) / (0.01 * 0.9 + 0.99 * 0.1), exact: String.raw`\frac{0.01 \times 0.9}{0.01 \times 0.9 + 0.99 \times 0.1} = \frac{90}{1080} = \frac{1}{12}` },
    hints: [
      "Picture 10,000 players. How many took the stimulant, and how many of those test positive?",
      "9,900 did not take it, and 10% of them test positive anyway.",
      "True positives over all positives.",
    ],
    solution: String.raw`Per 10,000 players: 100 took the stimulant and 90 of them test positive; 9,900 did not, and 990 of them test positive anyway. The positive pile holds $90 + 990 = 1080$ players, of whom 90 are genuine:
$P(\text{took it} \mid \text{positive}) = \frac{90}{1080} = \frac{1}{12} \approx 0.083.$

Even though the test is right 90% of the time on both kinds of player, a positive result is wrong eleven times out of twelve, because almost everyone tested is clean. That is base-rate neglect in one line.`,
    steps: ["Build the 10,000-player table.", "Count true positives (90) and false positives (990).", "Divide 90 by 1080."],
    keyIdea: "True positives over all positives; the clean majority supplies most of the positives.",
    commonMistake: String.raw`Answering $0.9$ or $0.9 \times 0.99 \approx 0.89$ instead of conditioning on the positive result.`,
    fastPath: "90 true versus 990 false positives per 10,000: 90/1080 = 1/12.",
    variation: "The tournament tightens the test so that only 1% of clean players are flagged (still catching 90% of users). What is the probability now?",
    variationAnswer: String.raw`Per 10,000: 90 true positives and 99 false: $90/189 = 10/21 \approx 0.476$.`,
    family: "false-positive",
    verifiedBy: ["formula", "simulation"],
  },
  {
    id: "m3-lc3",
    module: 3,
    kind: "lessonCheck",
    difficulty: 2,
    tags: ["total-probability", "urns"],
    minutes: 1,
    title: "Red from one of two urns",
    prompt: String.raw`Urn A has 4 red and 1 blue marble; urn B has 1 red and 4 blue marbles. A spinner selects urn A with probability $1/4$ and urn B with probability $3/4$; you then draw one marble from the selected urn. What is the probability that the marble is red?`,
    answer: { type: "numeric", value: (1 / 4) * (4 / 5) + (3 / 4) * (1 / 5), exact: String.raw`\frac{1}{4}\cdot\frac{4}{5} + \frac{3}{4}\cdot\frac{1}{5} = \frac{7}{20}` },
    hints: [
      "Condition on which urn the spinner picks.",
      "Urn A gives red with probability 4/5, urn B with probability 1/5.",
      "Weight by 1/4 and 3/4 and add.",
    ],
    solution: String.raw`By the law of total probability,
$P(R) = P(R \mid A)P(A) + P(R \mid B)P(B) = \frac{4}{5}\cdot\frac{1}{4} + \frac{1}{5}\cdot\frac{3}{4} = \frac{1}{5} + \frac{3}{20} = \frac{7}{20} = 0.35.$

The answer sits between the two urns' red fractions ($0.2$ and $0.8$) and closer to urn B's, because the spinner favours urn B.`,
    steps: ["Identify the two cases and their probabilities 1/4 and 3/4.", "Write the red probability within each urn.", "Add the weighted terms: 7/20."],
    keyIdea: "Average the within-case probabilities with the case probabilities as weights.",
    commonMistake: String.raw`Pooling the marbles (5 red of 10) and answering $1/2$, which ignores the spinner's weights.`,
    fastPath: "0.25 × 0.8 + 0.75 × 0.2 = 0.2 + 0.15 = 0.35.",
    variation: "The marble is red. What is the probability that it came from urn A?",
    variationAnswer: String.raw`$\dfrac{(1/4)(4/5)}{7/20} = \dfrac{1/5}{7/20} = \dfrac{4}{7}$.`,
    verifiedBy: ["formula", "simulation"],
  },
  {
    id: "m3-lc4",
    module: 3,
    kind: "lessonCheck",
    difficulty: 2,
    tags: ["conditional", "dice"],
    minutes: 1,
    title: "Which is more likely given a sum of eight?",
    prompt: String.raw`Two fair six-sided dice are rolled and you learn that the sum is 8. Which of the following is more likely?`,
    answer: {
      type: "choice",
      options: ["Both dice show even numbers.", "At least one die shows a 3.", "The two events are equally likely."],
      correct: 0,
    },
    hints: [
      "List the ordered pairs that add to 8: there are five.",
      "Mark which of the five have both dice even and which contain a 3.",
      "Compare the two counts.",
    ],
    solution: String.raw`The ordered pairs with sum 8 are 2-6, 3-5, 4-4, 5-3 and 6-2, five equally likely outcomes.

Both even: 2-6, 4-4, 6-2, three outcomes, probability $3/5$. At least one 3: 3-5 and 5-3, two outcomes, probability $2/5$. Both even is more likely, so the first option is correct.

Notice that unconditionally "both even" has probability $1/4$ and "at least one 3" has probability $11/36 \approx 0.31$, the opposite order. Conditioning on an even sum helps the both-even event, because an even sum requires the dice to have the same parity.`,
    steps: ["List the five ordered pairs that sum to 8.", "Count both-even pairs (3) and pairs with a 3 (2).", "Pick the larger: both even, 3/5 versus 2/5."],
    keyIdea: "Compare events inside the restricted sample space, not in the full one.",
    commonMistake: "Comparing the unconditional probabilities, where 'at least one 3' wins, instead of restricting to sum 8.",
    fastPath: "Sum 8: five pairs, three are even-even, two contain a 3.",
    variation: "The sum is 7 instead. Which is more likely: at least one die shows a 1, or the two dice differ by exactly 1?",
    variationAnswer: String.raw`Sum 7 has six ordered pairs; 1-6 and 6-1 contain a 1, and 3-4 and 4-3 differ by 1. Equally likely, $1/3$ each.`,
    verifiedBy: ["enumeration", "simulation"],
  },
];
