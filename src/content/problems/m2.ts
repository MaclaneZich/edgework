import type { Problem } from "../types";

/**
 * Module 2: Probability basics.
 * Sample spaces, independence versus exclusivity, dice, coins, cards, urns, symmetry and
 * geometric probability. 28 practice problems (m2-p01..p28) and four lesson checks
 * (m2-lc1..lc4). Every answer is confirmed by the checks in src/content/verify/m2.ts.
 */
export const problems: Problem[] = [
  // ---------------------------------------------------------------- difficulty 1
  {
    id: "m2-p01",
    module: 2,
    kind: "practice",
    difficulty: 1,
    tags: ["sample-space", "dice"],
    minutes: 2,
    title: "Two dice, a high total",
    prompt: String.raw`You roll two fair six-sided dice. What is the probability that the total is 9 or more?`,
    answer: { type: "numeric", value: 10 / 36, exact: String.raw`\frac{10}{36} = \frac{5}{18} \approx 0.278` },
    hints: [
      "Write the outcome as an ordered pair (first die, second die). How many pairs are there, and are they equally likely?",
      "Count the pairs with total 9, then 10, then 11, then 12.",
      "The counts are 4, 3, 2, 1. Add them and divide by 36.",
    ],
    solution: String.raw`Treat the dice as distinguishable. The sample space is the set of ordered pairs $(a, b)$ with $a, b \in \{1, \dots, 6\}$. There are $36$ pairs, and because the dice are fair and independent, each pair has probability $\frac{1}{36}$.

Now count the favourable pairs by total. Total 9: $(3,6), (4,5), (5,4), (6,3)$, four pairs. Total 10: $(4,6), (5,5), (6,4)$, three pairs. Total 11: $(5,6), (6,5)$, two pairs. Total 12: $(6,6)$, one pair. That is $4 + 3 + 2 + 1 = 10$ favourable pairs.

So the probability is $\frac{10}{36} = \frac{5}{18} \approx 0.278$.

A useful picture: lay the 36 outcomes out as a $6 \times 6$ grid. Each total is a diagonal, and the number of cells on the diagonal for total $s$ is $s - 1$ for $s \le 7$ and $13 - s$ for $s \ge 7$. The totals 9 to 12 form a staircase of $4 + 3 + 2 + 1$ cells in the corner.`,
    steps: [
      "Name the sample space: 36 equally likely ordered pairs.",
      "Count pairs for each total from 9 to 12: 4, 3, 2, 1.",
      "Add to 10 and divide by 36.",
    ],
    keyIdea: "Ordered pairs of dice are equally likely; totals are not, so count the pairs behind each total.",
    commonMistake: "Treating the eleven possible totals 2 to 12 as equally likely, which would give 4/11.",
    fastPath: "Totals of 9 or more live in the corner of the 6-by-6 grid: 4 + 3 + 2 + 1 = 10 cells, so 10/36.",
    variation: "Same two dice. What is the probability the total is 9 or more given that at least one die shows a 6?",
    variationAnswer: String.raw`Eleven pairs contain a 6; of those, $(3,6),(4,6),(5,6),(6,6),(6,3),(6,4),(6,5)$ total 9 or more, so $\frac{7}{11} \approx 0.636$.`,
    family: "dice-sums",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m2-p02",
    module: 2,
    kind: "practice",
    difficulty: 1,
    tags: ["coins", "sample-space", "independence"],
    minutes: 1,
    title: "Five flips that alternate",
    prompt: String.raw`A fair coin is flipped five times. What is the probability that the results strictly alternate, meaning no two consecutive flips are the same?`,
    answer: { type: "numeric", value: 2 / 32, exact: String.raw`\frac{2}{32} = \frac{1}{16} = 0.0625` },
    hints: [
      "How many sequences of five flips are there, and are they equally likely?",
      "Once the first flip is fixed, an alternating sequence has no further freedom.",
      "Exactly two sequences alternate: one starting with heads, one starting with tails.",
    ],
    solution: String.raw`A sequence of five flips is a string of five letters from $\{H, T\}$. There are $2^5 = 32$ strings and, because the coin is fair and the flips are independent, each string has probability $\left(\frac{1}{2}\right)^5 = \frac{1}{32}$.

An alternating string is completely determined by its first letter: after $H$ must come $T$, then $H$, and so on. Starting with $H$ gives $HTHTH$; starting with $T$ gives $THTHT$. So exactly two of the 32 strings alternate.

The probability is $\frac{2}{32} = \frac{1}{16} = 0.0625$.

Another way to see it: the first flip can be anything (probability 1), and each of the four later flips must differ from the one before it, which happens with probability $\frac{1}{2}$ each time, independently. That gives $1 \cdot \left(\frac{1}{2}\right)^4 = \frac{1}{16}$.`,
    steps: [
      "Count the sample space: 32 equally likely strings.",
      "Notice an alternating string is fixed by its first flip.",
      "Two favourable strings, so 2/32.",
    ],
    keyIdea: "Every specific sequence of n fair flips has probability 1/2^n; count how many sequences satisfy the condition.",
    commonMistake: "Counting only the sequence that starts with heads and answering 1/32.",
    fastPath: "First flip free, then four forced flips at one half each: (1/2)^4 = 1/16.",
    variation: "Now the coin is biased with P(heads) = 0.6. What is the probability the five flips alternate?",
    variationAnswer: String.raw`$HTHTH$ has probability $0.6^3 \cdot 0.4^2 = 0.03456$ and $THTHT$ has $0.4^3 \cdot 0.6^2 = 0.02304$; total $0.0576$.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m2-p03",
    module: 2,
    kind: "practice",
    difficulty: 1,
    tags: ["cards", "sample-space", "inclusion-exclusion"],
    minutes: 2,
    title: "Face card or spade",
    prompt: String.raw`One card is drawn at random from a well-shuffled standard 52-card deck. What is the probability that it is a face card (jack, queen or king) or a spade, or both?`,
    answer: { type: "numeric", value: 22 / 52, exact: String.raw`\frac{22}{52} = \frac{11}{26} \approx 0.423` },
    hints: [
      "How many face cards are there, and how many spades?",
      "Some cards are counted in both groups. Which ones?",
      "Add the two counts and subtract the overlap, then divide by 52.",
    ],
    solution: String.raw`Each of the 52 cards is equally likely, so the probability of an event is simply the number of cards in it divided by 52.

There are 12 face cards (jack, queen, king in each of four suits) and 13 spades. If we added these we would count the jack, queen and king of spades twice, so we subtract the 3 cards in the overlap: $|F \cup S| = 12 + 13 - 3 = 22$.

The probability is $\frac{22}{52} = \frac{11}{26} \approx 0.423$.

In probability language this is the union rule $P(F \cup S) = P(F) + P(S) - P(F \cap S) = \frac{12}{52} + \frac{13}{52} - \frac{3}{52}$. You can also check it by complement: the cards that are neither face cards nor spades are the 10 non-face ranks in the three other suits, $10 \cdot 3 = 30$ cards, and $52 - 30 = 22$.`,
    steps: [
      "Count face cards (12) and spades (13).",
      "Identify the overlap: 3 spade face cards.",
      "Apply the union rule: 12 + 13 - 3 = 22, over 52.",
    ],
    keyIdea: "For a union of two events, add the probabilities and subtract the overlap once.",
    commonMistake: "Answering 25/52 by forgetting that the three spade face cards sit in both groups.",
    fastPath: "Complement: non-face, non-spade cards are 10 ranks times 3 suits = 30, so 22/52.",
    variation: "What is the probability of a face card or a red card (hearts or diamonds)?",
    variationAnswer: String.raw`$12 + 26 - 6 = 32$ cards, so $\frac{32}{52} = \frac{8}{13} \approx 0.615$.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m2-p04",
    module: 2,
    kind: "practice",
    difficulty: 1,
    tags: ["coins", "sample-space"],
    minutes: 1,
    title: "Heads win the best of three",
    prompt: String.raw`A fair coin is flipped three times. What is the probability that at least two of the three flips land heads?`,
    answer: { type: "numeric", value: 4 / 8, exact: String.raw`\frac{4}{8} = \frac{1}{2}` },
    hints: [
      "List the eight equally likely sequences of three flips.",
      "Which sequences have two heads, and which have three?",
      "Three sequences have exactly two heads and one has three: four out of eight.",
    ],
    solution: String.raw`The eight sequences $HHH, HHT, HTH, THH, HTT, THT, TTH, TTT$ are equally likely, each with probability $\frac{1}{8}$.

Sequences with exactly two heads: $HHT, HTH, THH$ (three of them, one for each position of the single tail). Sequences with three heads: $HHH$ (one). So $4$ of the $8$ sequences have at least two heads.

The probability is $\frac{4}{8} = \frac{1}{2}$.

There is also a symmetry argument. Swapping heads and tails in every sequence maps "at least two heads" onto "at least two tails", and these two events are complementary when there are three flips (one face must appear at least twice, and both cannot). Two events that are mirror images and together cover everything each have probability $\frac{1}{2}$.`,
    steps: [
      "Write the 8 equally likely sequences.",
      "Count those with 2 heads (3) and 3 heads (1).",
      "Divide 4 by 8.",
    ],
    keyIdea: "With a small number of flips, listing the sequences is faster and safer than any formula.",
    commonMistake: "Counting the four possible head counts 0, 1, 2, 3 as equally likely and answering 2/4 for the wrong reason, or forgetting the all-heads case and answering 3/8.",
    fastPath: "By the heads-tails symmetry, 'majority heads' in an odd number of fair flips is exactly 1/2.",
    variation: "Same three flips of a fair coin. What is the probability of at least two heads given that the first flip is a tail?",
    variationAnswer: String.raw`Given a first tail, the only winning sequence is $THH$ out of four: $\frac{1}{4}$.`,
    verifiedBy: ["enumeration", "simulation"],
  },
  // ---------------------------------------------------------------- difficulty 2
  {
    id: "m2-p05",
    module: 2,
    kind: "practice",
    difficulty: 2,
    tags: ["sample-space", "dice"],
    minutes: 2,
    title: "A two and a five, or double six",
    prompt: String.raw`Two fair six-sided dice are rolled together. What is the probability that either the two dice show a 2 and a 5 (in either order) or both dice show a 6?`,
    answer: { type: "numeric", value: 3 / 36, exact: String.raw`\frac{3}{36} = \frac{1}{12} \approx 0.0833` },
    hints: [
      "Even if the dice are rolled together, imagine they are red and blue so that outcomes are ordered pairs.",
      "How many ordered pairs give a 2 and a 5? How many give double six?",
      "Two pairs for the 2-and-5 case, one pair for double six: three pairs in total.",
    ],
    solution: String.raw`Rolling two dice "together" does not change the probabilities: the physics does not know whether you look at the dice in order. Label them red and blue. The sample space is the 36 ordered pairs, each with probability $\frac{1}{36}$.

"A 2 and a 5" happens for the pairs $(2, 5)$ and $(5, 2)$: two outcomes. "Both show 6" happens only for $(6, 6)$: one outcome. The two events cannot happen at the same time, so the favourable outcomes number $2 + 1 = 3$.

The probability is $\frac{3}{36} = \frac{1}{12} \approx 0.0833$.

The trap here is the unordered view. There are 21 unordered outcomes (15 with different faces and 6 doubles), but they are not equally likely: a mixed pair such as $\{2, 5\}$ has probability $\frac{2}{36}$ while a double such as $\{6, 6\}$ has $\frac{1}{36}$. Counting $2$ favourable unordered outcomes out of $21$ would give $\frac{2}{21}$, which is wrong.`,
    steps: [
      "Label the dice so that outcomes are ordered pairs.",
      "Count (2,5) and (5,2) for the mixed case, (6,6) for the double.",
      "Add the disjoint counts: 3/36.",
    ],
    keyIdea: "Unordered dice outcomes are not equally likely; mixed pairs are twice as likely as doubles.",
    commonMistake: "Using the 21 unordered outcomes as if they were equally likely and answering 2/21.",
    fastPath: "Mixed pair: 2/36. Specific double: 1/36. Sum: 3/36 = 1/12.",
    variation: "What is the probability that the two dice show different faces that differ by exactly 1?",
    variationAnswer: String.raw`The unordered pairs $\{1,2\},\{2,3\},\{3,4\},\{4,5\},\{5,6\}$ each count twice: $\frac{10}{36} = \frac{5}{18}$.`,
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m2-p06",
    module: 2,
    kind: "practice",
    difficulty: 2,
    tags: ["independence", "dice"],
    minutes: 3,
    title: "An even first die or a total of seven",
    prompt: String.raw`Two fair six-sided dice are rolled one after the other. Let $A$ be the event that the first die shows an even number and $B$ the event that the total of the two dice is 7. Find $P(A \cup B)$, the probability that at least one of $A$ and $B$ happens.`,
    answer: { type: "numeric", value: 21 / 36, exact: String.raw`\frac{1}{2} + \frac{1}{6} - \frac{1}{12} = \frac{21}{36} = \frac{7}{12} \approx 0.583` },
    hints: [
      String.raw`The union rule needs $P(A)$, $P(B)$ and $P(A \cap B)$.`,
      "List the six pairs with total 7. For how many of them is the first die even?",
      String.raw`$P(A \cap B) = \frac{3}{36} = \frac{1}{12}$, which equals $P(A)P(B)$: the events are independent.`,
    ],
    solution: String.raw`Use the union rule $P(A \cup B) = P(A) + P(B) - P(A \cap B)$ over the 36 equally likely ordered pairs.

$P(A) = \frac{18}{36} = \frac{1}{2}$ since the first die is even for 3 of its 6 faces. The pairs with total 7 are $(1,6), (2,5), (3,4), (4,3), (5,2), (6,1)$, so $P(B) = \frac{6}{36} = \frac{1}{6}$. Of those six pairs, the first die is even in $(2,5), (4,3), (6,1)$, so $P(A \cap B) = \frac{3}{36} = \frac{1}{12}$.

Therefore $P(A \cup B) = \frac{1}{2} + \frac{1}{6} - \frac{1}{12} = \frac{6 + 2 - 1}{12} = \frac{7}{12} \approx 0.583$.

Notice that $P(A \cap B) = \frac{1}{12} = \frac{1}{2} \cdot \frac{1}{6} = P(A)P(B)$: the events are independent. That is not an accident. Whatever the first die shows, exactly one value of the second die makes the total 7, so knowing the first die (even or not) tells you nothing about whether the total will be 7. Compare this with a total of 8, where the first die matters (see the problem on a total of eight).`,
    steps: [
      "Compute P(A) = 1/2 and P(B) = 1/6 from the 36 ordered pairs.",
      "List the total-7 pairs and find the overlap with an even first die: 3 pairs.",
      "Apply the union rule: 1/2 + 1/6 - 1/12 = 7/12.",
      "Note that A and B are independent since 1/12 = (1/2)(1/6).",
    ],
    keyIdea: "A total of 7 is independent of the first die because every first-die value has exactly one completion to 7.",
    commonMistake: "Adding 1/2 and 1/6 without subtracting the overlap, giving 2/3; or assuming the events are disjoint because they sound unrelated.",
    fastPath: "Independent events: P(A or B) = 1 - P(not A)P(not B) = 1 - (1/2)(5/6) = 7/12.",
    variation: "Replace the total of 7 with a total of 6. Is the event 'total is 6' independent of 'first die is even', and what is the probability of the union?",
    variationAnswer: String.raw`Total 6 has 5 pairs; the first die is even in $(2,4),(4,2)$ only, so $P(A \cap B) = \frac{2}{36} \ne \frac{1}{2}\cdot\frac{5}{36}$: dependent. $P(A \cup B) = \frac{18 + 5 - 2}{36} = \frac{21}{36} = \frac{7}{12}$, the same number by coincidence.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m2-p07",
    module: 2,
    kind: "practice",
    difficulty: 2,
    tags: ["dice", "independence"],
    minutes: 3,
    title: "Exactly two sixes among four dice",
    prompt: String.raw`Four fair six-sided dice are rolled. What is the probability that exactly two of them show a 6?`,
    answer: { type: "numeric", value: 150 / 1296, exact: String.raw`\binom{4}{2}\left(\frac{1}{6}\right)^2\left(\frac{5}{6}\right)^2 = \frac{150}{1296} = \frac{25}{216} \approx 0.116` },
    hints: [
      "Pick which two dice show the 6 first; then ask what the other two must do.",
      "A specific pattern such as (6, 6, not 6, not 6) has probability $(1/6)^2 (5/6)^2$ by independence.",
      String.raw`Multiply that pattern probability by the number of ways to choose the two positions, $\binom{4}{2} = 6$.`,
    ],
    solution: String.raw`Think of the four dice as a sequence of four independent trials, each a "six" with probability $\frac{1}{6}$ and a "non-six" with probability $\frac{5}{6}$.

Fix one specific pattern, say the first two dice are sixes and the last two are not. By independence its probability is $\frac{1}{6} \cdot \frac{1}{6} \cdot \frac{5}{6} \cdot \frac{5}{6} = \frac{25}{1296}$. Every other pattern with exactly two sixes has the same probability, because it uses the same four factors in a different order.

The number of such patterns is the number of ways to choose which two of the four positions carry the sixes, $\binom{4}{2} = 6$. So the probability is $6 \cdot \frac{25}{1296} = \frac{150}{1296} = \frac{25}{216} \approx 0.116$.

As a check by direct counting: among the $6^4 = 1296$ ordered outcomes, choose the two six-positions (6 ways) and fill the other two positions with any of 5 non-six faces each ($25$ ways): $6 \cdot 25 = 150$ favourable outcomes.`,
    steps: [
      "Model four independent trials with success probability 1/6.",
      "Compute one pattern: (1/6)^2 (5/6)^2 = 25/1296.",
      "Count the patterns: choose 2 positions of 4, which is 6.",
      "Multiply: 150/1296 = 25/216.",
    ],
    keyIdea: "'Exactly k of n' is a binomial count: pattern probability times the number of position choices.",
    commonMistake: "Forgetting the factor of 6 for the positions, or forgetting the (5/6)^2 for the dice that must not be sixes.",
    fastPath: "6 times 25 over 1296: 150/1296, cancel 6 to get 25/216, about 0.116.",
    variation: "What is the probability of at least two sixes among the four dice?",
    variationAnswer: String.raw`Add exactly 3 and exactly 4: $\frac{4 \cdot 5}{1296} + \frac{1}{1296} = \frac{21}{1296}$, so $\frac{150 + 21}{1296} = \frac{171}{1296} = \frac{19}{144} \approx 0.132$.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m2-p08",
    module: 2,
    kind: "practice",
    difficulty: 2,
    tags: ["dice", "complement", "independence"],
    minutes: 2,
    title: "A double in three throws",
    prompt: String.raw`You throw a pair of fair six-sided dice three times. What is the probability that at least one of the three throws is a double (both dice showing the same face)?`,
    answer: { type: "numeric", value: 1 - Math.pow(5 / 6, 3), exact: String.raw`1 - \left(\frac{5}{6}\right)^3 = \frac{91}{216} \approx 0.421` },
    hints: [
      "First find the probability that a single throw is a double.",
      "'At least one' suggests computing the probability of no doubles at all.",
      "The three throws are independent, so multiply the no-double probabilities and subtract from 1.",
    ],
    solution: String.raw`A single throw of two dice gives a double for the 6 pairs $(1,1), \dots, (6,6)$ out of 36, so $P(\text{double}) = \frac{6}{36} = \frac{1}{6}$ and $P(\text{no double}) = \frac{5}{6}$.

The three throws are independent, so the probability that none of them is a double is $\left(\frac{5}{6}\right)^3 = \frac{125}{216}$.

The event "at least one double" is the complement of "no doubles", so its probability is $1 - \frac{125}{216} = \frac{91}{216} \approx 0.421$.

Why not add $\frac{1}{6}$ three times? Because the throws can overlap: two or three doubles are possible, and plain addition counts those outcomes more than once. The complement route avoids the bookkeeping entirely.`,
    steps: [
      "Compute the per-throw probability of a double: 1/6.",
      "Switch to the complement: no doubles in any throw.",
      "Use independence: (5/6)^3 = 125/216.",
      "Subtract from 1: 91/216.",
    ],
    keyIdea: "'At least one' across independent trials is one minus the product of the per-trial failure probabilities.",
    commonMistake: "Adding 1/6 three times to get 1/2, which double counts throws where several doubles occur.",
    fastPath: "(5/6)^3 = 125/216; 216 - 125 = 91; answer 91/216, a bit over 0.42.",
    variation: "How many throws of the pair are needed for the probability of at least one double to exceed 90%?",
    variationAnswer: String.raw`Need $(5/6)^n < 0.1$, so $n > \ln 10 / \ln 1.2 \approx 12.6$: thirteen throws.`,
    family: "at-least-one",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m2-p09",
    module: 2,
    kind: "practice",
    difficulty: 2,
    tags: ["cards", "sample-space"],
    minutes: 3,
    title: "Two cards, same suit or same rank",
    prompt: String.raw`Two cards are drawn without replacement from a well-shuffled standard 52-card deck. What is the probability that the two cards are of the same suit or of the same rank?`,
    answer: { type: "numeric", value: 15 / 51, exact: String.raw`\frac{12}{51} + \frac{3}{51} = \frac{15}{51} = \frac{5}{17} \approx 0.294` },
    hints: [
      "Condition on the first card: whatever it is, how many of the remaining 51 cards share its suit?",
      "How many of the remaining 51 share its rank? Can a card do both?",
      "The two events are mutually exclusive, so add 12/51 and 3/51.",
    ],
    solution: String.raw`Whatever the first card is, the second card is equally likely to be any of the remaining 51 cards. Of those, 12 share the first card's suit (the other 12 cards of that suit) and 3 share its rank (the same rank in the other three suits).

No card can do both: a card of the same suit and the same rank would be the first card itself, which is no longer in the deck. So the events "same suit" and "same rank" are mutually exclusive, and their probabilities simply add: $P = \frac{12}{51} + \frac{3}{51} = \frac{15}{51} = \frac{5}{17} \approx 0.294$.

Check by counting unordered pairs. There are $\binom{52}{2} = 1326$ pairs. Same-suit pairs: $4 \binom{13}{2} = 312$. Same-rank pairs: $13 \binom{4}{2} = 78$. Total $390$, and $\frac{390}{1326} = \frac{5}{17}$.

Mutual exclusivity is exactly what makes the addition legal. Two events that overlap, such as "same suit" and "both red", would need the overlap subtracted.`,
    steps: [
      "Fix the first card; the second is uniform over the remaining 51.",
      "Count same-suit cards (12) and same-rank cards (3) among them.",
      "Check the events are disjoint, then add: 15/51 = 5/17.",
    ],
    keyIdea: "Conditioning on the first card turns a two-card question into a one-card count over 51 cards.",
    commonMistake: "Computing P(same suit) as 13/52 (using the first card's suit as if the first card were still available) or forgetting that same-suit and same-rank are disjoint and trying to subtract an overlap.",
    fastPath: "Second card: 12 suit-mates plus 3 rank-mates out of 51 = 15/51 = 5/17.",
    variation: "Now the first card is replaced and the deck reshuffled before the second draw. What is the probability of same suit or same rank?",
    variationAnswer: String.raw`Same suit $\frac{13}{52}$, same rank $\frac{4}{52}$, both (the identical card) $\frac{1}{52}$: $\frac{13 + 4 - 1}{52} = \frac{16}{52} = \frac{4}{13} \approx 0.308$.`,
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m2-p10",
    module: 2,
    kind: "practice",
    difficulty: 2,
    tags: ["urns", "independence"],
    minutes: 3,
    title: "Replacement makes a difference",
    prompt: String.raw`A bag holds 4 red and 6 green tokens. You draw two tokens. Let $p_{\text{with}}$ be the probability that both are green when the first token is put back before the second draw, and $p_{\text{without}}$ the probability that both are green when it is not. Report the difference $p_{\text{with}} - p_{\text{without}}$ as an exact fraction.`,
    answer: { type: "numeric", value: 9 / 25 - 1 / 3, exact: String.raw`\frac{9}{25} - \frac{1}{3} = \frac{27 - 25}{75} = \frac{2}{75} \approx 0.0267` },
    hints: [
      "With replacement the two draws are independent and identical.",
      "Without replacement, the second draw sees 9 tokens, one fewer green if the first was green.",
      "Compute (6/10)(6/10) and (6/10)(5/9), then subtract.",
    ],
    solution: String.raw`With replacement, the bag is the same for both draws and the draws are independent. Each draw is green with probability $\frac{6}{10}$, so $p_{\text{with}} = \frac{6}{10} \cdot \frac{6}{10} = \frac{36}{100} = \frac{9}{25} = 0.36$.

Without replacement, the first draw is green with probability $\frac{6}{10}$. If it was green, the bag now holds 4 red and 5 green, so the second is green with probability $\frac{5}{9}$. Multiplying along this path, $p_{\text{without}} = \frac{6}{10} \cdot \frac{5}{9} = \frac{30}{90} = \frac{1}{3}$.

The difference is $\frac{9}{25} - \frac{1}{3} = \frac{27}{75} - \frac{25}{75} = \frac{2}{75} \approx 0.0267$.

Why is "with replacement" larger here? Removing a green token makes the second draw less likely to be green, so matching a green with a green is harder without replacement. The same logic runs the other way for mixed colours: a red followed by a green is more likely without replacement.`,
    steps: [
      "With replacement: independent draws, (6/10)^2 = 9/25.",
      "Without replacement: (6/10)(5/9) = 1/3.",
      "Subtract: 9/25 - 1/3 = 2/75.",
    ],
    keyIdea: "Replacement keeps the draws independent; removing a token shifts the second draw against repeating the same colour.",
    commonMistake: "Using 5/10 or 6/9 for the second draw without replacement; the denominator and the green count both drop by one.",
    fastPath: "0.36 versus 1/3: the gap is 0.36 - 0.3333 = 0.0267, which is 2/75.",
    variation: "What is the probability that the two tokens have different colours, with and without replacement?",
    variationAnswer: String.raw`With: $2 \cdot \frac{4}{10}\cdot\frac{6}{10} = \frac{12}{25} = 0.48$. Without: $2 \cdot \frac{4}{10}\cdot\frac{6}{9} = \frac{8}{15} \approx 0.533$. Mixed colours are more likely without replacement.`,
    family: "matching-socks",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m2-p11",
    module: 2,
    kind: "practice",
    difficulty: 2,
    tags: ["symmetry", "cards"],
    minutes: 2,
    title: "The ace of spades beats the kings",
    prompt: String.raw`A standard 52-card deck is shuffled uniformly at random and the cards are turned over one at a time from the top. What is the probability that the ace of spades appears before all four kings?`,
    answer: { type: "numeric", value: 1 / 5, exact: String.raw`\frac{1}{5} = 0.2` },
    hints: [
      "The other 47 cards are irrelevant: only the relative order of five specific cards matters.",
      "In a uniform shuffle, every ordering of those five cards is equally likely.",
      "Each of the five cards is equally likely to be the first of the five to appear.",
    ],
    solution: String.raw`Ignore the 47 cards that are neither the ace of spades nor a king. Deleting them from the shuffled deck leaves the five relevant cards in some order, and because the shuffle is uniform, each of the $5! = 120$ orders of these five cards is equally likely.

The ace appears before all four kings exactly when it is first among the five. By symmetry, each of the five cards is equally likely to be first, so the probability is $\frac{1}{5} = 0.2$.

If you prefer to count: the orders with the ace first number $4! = 24$, and $\frac{24}{120} = \frac{1}{5}$.

A direct attack that tracks the position of the ace in the full deck and the positions of the kings also works but is far longer. Whenever a question depends only on the relative order of a few items, strip everything else away first.`,
    steps: [
      "Reduce to the relative order of the five relevant cards.",
      "Argue that all 5! orders are equally likely.",
      "The ace is first in 1/5 of them.",
    ],
    keyIdea: "Only the relative order of the relevant cards matters, and all such orders are equally likely.",
    commonMistake: "Trying to sum over the ace's position in the full deck, or answering 1/2 as if the ace only had to beat one king.",
    fastPath: "Five relevant cards, each equally likely to come first: 1/5.",
    variation: "What is the probability that the ace of spades appears after exactly two of the four kings?",
    variationAnswer: String.raw`The ace is equally likely to be in any of the five relative positions, so position three has probability $\frac{1}{5}$ as well.`,
    family: "symmetry",
    verifiedBy: ["enumeration", "simulation"],
  },
  // ---------------------------------------------------------------- difficulty 3
  {
    id: "m2-p12",
    module: 2,
    kind: "practice",
    difficulty: 3,
    tags: ["dice", "sample-space"],
    minutes: 4,
    title: "Three dice with a small total",
    prompt: String.raw`Three fair six-sided dice are rolled. What is the probability that the total of the three dice is at most 6?`,
    answer: { type: "numeric", value: 20 / 216, exact: String.raw`\frac{20}{216} = \frac{5}{54} \approx 0.0926` },
    hints: [
      "There are $6^3 = 216$ equally likely ordered triples.",
      "Count triples with total 3, 4, 5 and 6 separately; the small totals never run into the cap of 6 on a single die.",
      "The counts are 1, 3, 6, 10, which are triangular numbers. Add them.",
    ],
    solution: String.raw`The sample space is the set of ordered triples $(a, b, c)$ with each entry in $\{1, \dots, 6\}$, $216$ equally likely outcomes.

Count the triples by total. For a total $s$ with $s \le 8$ the cap of 6 on each die never bites, so the count is the number of ways to write $s$ as an ordered sum of three positive integers, which is $\binom{s - 1}{2}$. Total 3: $\binom{2}{2} = 1$ (only $1+1+1$). Total 4: $\binom{3}{2} = 3$. Total 5: $\binom{4}{2} = 6$. Total 6: $\binom{5}{2} = 10$.

So there are $1 + 3 + 6 + 10 = 20$ favourable triples, and the probability is $\frac{20}{216} = \frac{5}{54} \approx 0.0926$.

A slicker count: a total of at most 6 with three dice each at least 1 is the same as choosing three positive integers and a non-negative slack that together sum to 6; that is $\binom{6}{3} = 20$ directly. Either way, the answer is $20$ out of $216$.`,
    steps: [
      "Set up the 216 equally likely ordered triples.",
      "Count triples with total 3, 4, 5, 6: 1, 3, 6, 10.",
      "Add to 20 and divide by 216.",
    ],
    keyIdea: "For small totals the per-die cap never matters, so the counts are the triangular numbers.",
    commonMistake: "Counting unordered triples such as {1,1,4} and {1,2,3} as one outcome each; they contribute 3 and 6 ordered outcomes respectively.",
    fastPath: "Triangular numbers 1 + 3 + 6 + 10 = 20 over 216, which is 5/54, just under 0.093.",
    variation: "What is the probability that the total of three dice is at least 15?",
    variationAnswer: String.raw`By the symmetry $x \mapsto 7 - x$ on each die, total $\ge 15$ matches total $\le 6$: also $\frac{20}{216} = \frac{5}{54}$.`,
    family: "dice-sums",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m2-p13",
    module: 2,
    kind: "practice",
    difficulty: 3,
    tags: ["dice", "complement"],
    minutes: 3,
    title: "The largest of four dice is a five",
    prompt: String.raw`Four fair six-sided dice are rolled. What is the probability that the largest value showing is exactly 5?`,
    answer: { type: "numeric", value: Math.pow(5 / 6, 4) - Math.pow(4 / 6, 4), exact: String.raw`\left(\frac{5}{6}\right)^4 - \left(\frac{4}{6}\right)^4 = \frac{369}{1296} = \frac{41}{144} \approx 0.285` },
    hints: [
      "'The maximum is at most k' is easy: every die is at most k.",
      "The maximum is exactly 5 when all dice are at most 5 but not all are at most 4.",
      String.raw`Subtract: $P(\max \le 5) - P(\max \le 4)$.`,
    ],
    solution: String.raw`The event "maximum at most $k$" is the same as "every die shows at most $k$". With four independent dice, $P(\max \le k) = \left(\frac{k}{6}\right)^4$.

The maximum equals exactly 5 when it is at most 5 but not at most 4, so $P(\max = 5) = P(\max \le 5) - P(\max \le 4) = \left(\frac{5}{6}\right)^4 - \left(\frac{4}{6}\right)^4 = \frac{625 - 256}{1296} = \frac{369}{1296} = \frac{41}{144} \approx 0.285$.

A direct count gives the same thing: at least one die must show a 5 and the others at most 4. Choosing exactly $j$ dice to show 5 and the rest from $\{1, 2, 3, 4\}$ gives $\sum_{j=1}^{4} \binom{4}{j} 4^{4-j} = 256 + 96 + 16 + 1 = 369$ outcomes out of $1296$.

The subtraction trick is the general tool: the distribution of a maximum (or minimum) is always easiest through "at most" (or "at least") events.`,
    steps: [
      "Translate 'max at most k' into 'every die at most k'.",
      "Compute (5/6)^4 and (4/6)^4 using independence.",
      "Subtract to isolate 'max exactly 5': 369/1296 = 41/144.",
    ],
    keyIdea: "P(max = k) = P(max <= k) - P(max <= k - 1), and P(max <= k) is a simple power.",
    commonMistake: "Computing P(at least one 5) = 1 - (5/6)^4 and forgetting that no die may show a 6.",
    fastPath: "625 - 256 = 369 over 1296; divide by 9 to get 41/144, about 0.285.",
    variation: "What is the probability that the smallest of the four dice is exactly 2?",
    variationAnswer: String.raw`$P(\min \ge 2) - P(\min \ge 3) = \left(\frac{5}{6}\right)^4 - \left(\frac{4}{6}\right)^4 = \frac{41}{144}$, the same by the symmetry $x \mapsto 7 - x$.`,
    family: "dice-sums",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m2-p14",
    module: 2,
    kind: "practice",
    difficulty: 3,
    tags: ["coins", "complement", "recursion"],
    minutes: 5,
    title: "Three heads in a row somewhere",
    prompt: String.raw`A fair coin is flipped six times. What is the probability that the sequence contains at least three consecutive heads somewhere?`,
    answer: { type: "numeric", value: 20 / 64, exact: String.raw`\frac{64 - 44}{64} = \frac{20}{64} = \frac{5}{16} = 0.3125` },
    hints: [
      "Count the complement: sequences of six flips with no run of three heads.",
      String.raw`Let $a_n$ be the number of length-$n$ sequences with no $HHH$. Classify by the trailing block of heads: the sequence ends in $T$, $TH$ or $THH$, and everything before that $T$ is a shorter sequence with no $HHH$.`,
      "$a_n = a_{n-1} + a_{n-2} + a_{n-3}$ with $a_0 = 1, a_1 = 2, a_2 = 4$ gives $a_6 = 44$, so the answer is $(64 - 44)/64$.",
    ],
    solution: String.raw`All $2^6 = 64$ sequences are equally likely, so we count sequences containing $HHH$. It is easier to count the complement, sequences with no three heads in a row, and subtract.

Let $a_n$ be the number of sequences of length $n$ with no $HHH$. Any such sequence of length $n \ge 3$ ends in a block of heads of length 0, 1 or 2, preceded by a $T$: it looks like $\ldots T$, $\ldots TH$ or $\ldots THH$, and what comes before the $T$ is itself a valid sequence of length $n - 1$, $n - 2$ or $n - 3$. Hence $a_n = a_{n-1} + a_{n-2} + a_{n-3}$. The base cases are $a_0 = 1$, $a_1 = 2$, $a_2 = 4$ (no restriction bites yet). Then $a_3 = 7$, $a_4 = 13$, $a_5 = 24$, $a_6 = 44$.

So $64 - 44 = 20$ sequences contain a run of three or more heads, and the probability is $\frac{20}{64} = \frac{5}{16} = 0.3125$.

Direct count as a check, by the position where the first $HHH$ starts. Start at flip 1: $HHH$ then anything, $8$ sequences. Start at flip 2: $THHH$ then anything, $4$. Start at flip 3: flip 2 must be $T$, flip 1 free, then $HHH$, then flip 6 free: $4$. Start at flip 4: flip 3 must be $T$, flips 1 and 2 free with no constraint possible: $4$. Total $8 + 4 + 4 + 4 = 20$.`,
    steps: [
      "Work with the complement: no HHH anywhere.",
      "Set up the recursion on the ending block: a_n = a_(n-1) + a_(n-2) + a_(n-3).",
      "Compute a_6 = 44 from a_0 = 1, a_1 = 2, a_2 = 4.",
      "Subtract from 64 and divide: 20/64 = 5/16.",
    ],
    keyIdea: "Count runs through the complement with a recursion on how the sequence ends.",
    commonMistake: "Multiplying 'four possible start positions' by 1/8 to get 1/2; the start positions overlap heavily.",
    fastPath: "Tribonacci-style: 1, 2, 4, 7, 13, 24, 44. Then 64 - 44 = 20, over 64 = 5/16.",
    variation: "What is the probability of at least three consecutive heads in seven flips?",
    variationAnswer: String.raw`$a_7 = 44 + 24 + 13 = 81$, so $\frac{128 - 81}{128} = \frac{47}{128} \approx 0.367$.`,
    verifiedBy: ["enumeration", "recursion"],
  },
  {
    id: "m2-p15",
    module: 2,
    kind: "practice",
    difficulty: 3,
    tags: ["independence", "dice"],
    minutes: 4,
    title: "An even first die and a total of eight",
    prompt: String.raw`Two fair six-sided dice are rolled one after the other. Let $A$ be the event that the first die is even and $B$ the event that the total is 8. Which statement is correct?`,
    answer: {
      type: "choice",
      options: [
        String.raw`$A$ and $B$ are independent: $P(A \cap B) = P(A)\,P(B)$.`,
        String.raw`$A$ and $B$ are mutually exclusive.`,
        String.raw`$A$ and $B$ are dependent and not mutually exclusive; given $B$, the chance of $A$ rises from $\tfrac{1}{2}$ to $\tfrac{3}{5}$.`,
        String.raw`$A$ and $B$ are dependent and not mutually exclusive; given $B$, the chance of $A$ falls from $\tfrac{1}{2}$ to $\tfrac{2}{5}$.`,
      ],
      correct: 2,
    },
    hints: [
      "List the five ordered pairs with total 8 and look at the parity of the first die in each.",
      String.raw`Compare $P(A \cap B)$ with $P(A)P(B) = \frac{1}{2} \cdot \frac{5}{36}$.`,
      String.raw`Three of the five total-8 pairs have an even first die, so $P(A \mid B) = \frac{3}{5} \ne \frac{1}{2}$.`,
    ],
    solution: String.raw`Over the 36 equally likely ordered pairs, $P(A) = \frac{1}{2}$. The pairs with total 8 are $(2,6), (3,5), (4,4), (5,3), (6,2)$, so $P(B) = \frac{5}{36}$.

The pairs in both events have an even first die and total 8: $(2,6), (4,4), (6,2)$. So $P(A \cap B) = \frac{3}{36}$, while $P(A)P(B) = \frac{1}{2} \cdot \frac{5}{36} = \frac{5}{72} = \frac{2.5}{36}$. These differ, so $A$ and $B$ are not independent. They are also not mutually exclusive, since they share three outcomes.

The direction of the dependence: $P(A \mid B) = \frac{P(A \cap B)}{P(B)} = \frac{3/36}{5/36} = \frac{3}{5}$, larger than $P(A) = \frac{1}{2}$. Learning that the total is 8 makes an even first die more likely. The reason is parity: an even total needs both dice even or both odd, and among the pairs that total 8, the both-even case $(2,6),(4,4),(6,2)$ outnumbers the both-odd case $(3,5),(5,3)$.

Contrast this with a total of 7, which is independent of the first die because every first-die value has exactly one partner that completes 7. Two events that "feel" the same can sit on opposite sides of the independence line; the only way to know is to multiply and compare.`,
    steps: [
      "Compute P(A) = 1/2 and P(B) = 5/36.",
      "Find the overlap (2,6), (4,4), (6,2): P(A and B) = 3/36.",
      "Compare with P(A)P(B) = 5/72: not equal, so dependent.",
      "Compute P(A | B) = 3/5 to get the direction.",
    ],
    keyIdea: "Independence is a numerical test, P(A and B) = P(A)P(B), not a feeling about whether the events are related.",
    commonMistake: "Assuming the total is independent of the first die because it was for a total of 7, or confusing 'dependent' with 'mutually exclusive'.",
    fastPath: "Total 8 pairs: 2-6, 3-5, 4-4, 5-3, 6-2. Even first die in 3 of 5, and 3/5 is not 1/2: dependent, pulling upward.",
    variation: "Keep A as 'first die even'. For which totals t between 2 and 12 is the event 'total is t' independent of A?",
    variationAnswer: String.raw`Exactly the odd totals $3, 5, 7, 9, 11$. An odd total needs one even and one odd die, and swapping the two dice pairs each even-first outcome with an odd-first one, so $P(A \mid \text{total} = t) = \frac{1}{2}$. Every even total is dependent (for example $\frac{3}{5}$ at 8, $\frac{2}{5}$ at 6).`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m2-p16",
    module: 2,
    kind: "practice",
    difficulty: 3,
    tags: ["cards", "urns", "independence"],
    minutes: 4,
    title: "Three distinct ranks, two ways to draw",
    prompt: String.raw`You want three cards of three different ranks from a standard 52-card deck. Method 1: draw three cards without replacement. Method 2: draw one card, note it, return it and reshuffle, and repeat for three draws in total. Which method is more likely to produce three distinct ranks, and roughly by how much?`,
    answer: {
      type: "choice",
      options: [
        "Without replacement is more likely: about 0.83 versus 0.78.",
        "With replacement is more likely: about 0.83 versus 0.78.",
        "They are equal, because each draw is uniform over the thirteen ranks either way.",
        "Without replacement is more likely, but only barely: about 0.79 versus 0.78.",
      ],
      correct: 0,
    },
    hints: [
      "Multiply, draw by draw, the probability that each new card misses the ranks already seen.",
      "Without replacement the second card has 48 safe cards out of 51; with replacement it has 48 out of 52.",
      String.raw`Compare $\frac{48}{51} \cdot \frac{44}{50}$ with $\frac{48}{52} \cdot \frac{44}{52}$.`,
    ],
    solution: String.raw`In both methods the first card is free. The question is how likely each later card is to avoid the ranks already seen.

Without replacement: after the first card, 51 cards remain and 48 of them have a different rank (the 3 rank-mates are the danger). After two cards of different ranks, 50 remain and 44 are safe (6 rank-mates are out). So $P_{\text{without}} = \frac{48}{51} \cdot \frac{44}{50} = \frac{2112}{2550} \approx 0.828$.

With replacement: each draw is from the full deck of 52. The second card must avoid the 4 cards of the first rank, so 48 of 52 are safe; the third must avoid 8 cards, so 44 of 52 are safe: $P_{\text{with}} = \frac{48}{52} \cdot \frac{44}{52} = \frac{2112}{2704} \approx 0.781$.

The numerators are identical; only the denominators differ. Without replacement the dangerous cards shrink the deck too, which helps, while with replacement they stay in. Without replacement wins by about $0.047$, so the first option is correct.

The "equal" option is a common trap. Each single draw is indeed uniform over ranks in both methods, but the question is about the joint behaviour of three draws, and the draws are only independent with replacement.`,
    steps: [
      "Compute the without-replacement chain 48/51 times 44/50.",
      "Compute the with-replacement chain 48/52 times 44/52.",
      "Compare: 0.828 versus 0.781, so without replacement wins by about 0.05.",
    ],
    keyIdea: "Removing a card removes its rank-mates' competition too: the numerators match, the denominators do not.",
    commonMistake: "Arguing that uniform ranks on each draw make the two methods equal; marginal distributions can match while joint probabilities differ.",
    fastPath: "Same numerators 48 times 44; denominators 51 times 50 = 2550 versus 52 times 52 = 2704. Smaller denominator wins: without replacement.",
    variation: "Same comparison for three cards of three different suits. Which method is more likely to give all-different suits?",
    variationAnswer: String.raw`Without: $\frac{39}{51} \cdot \frac{26}{50} \approx 0.398$. With: $\frac{39}{52} \cdot \frac{26}{52} = 0.375$. Again without replacement, by about $0.02$.`,
    family: "matching-socks",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m2-p17",
    module: 2,
    kind: "practice",
    difficulty: 3,
    tags: ["cards", "sample-space"],
    minutes: 4,
    title: "One pair from a nine-card deck",
    prompt: String.raw`A custom deck has nine cards: three ranks (low, mid, high), each in three colours. You draw three cards at random without replacement. What is the probability that exactly two of the three cards share a rank and the third has a different rank?`,
    answer: { type: "numeric", value: 54 / 84, exact: String.raw`\frac{3 \cdot \binom{3}{2} \cdot 6}{\binom{9}{3}} = \frac{54}{84} = \frac{9}{14} \approx 0.643` },
    hints: [
      String.raw`Count unordered three-card hands: $\binom{9}{3} = 84$, all equally likely.`,
      "Build a one-pair hand: choose the paired rank, choose two of its three cards, choose the odd card from the other ranks.",
      String.raw`$3 \cdot 3 \cdot 6 = 54$ hands have exactly one pair.`,
    ],
    solution: String.raw`The order of the draws does not matter for this question, so count unordered hands. There are $\binom{9}{3} = 84$ hands, and each is equally likely because the draws are uniform without replacement.

Build a hand with exactly one pair. Choose the rank that is paired: 3 ways. Choose which two of that rank's three cards appear: $\binom{3}{2} = 3$ ways. Choose the third card from the $6$ cards of the other two ranks: 6 ways. That gives $3 \cdot 3 \cdot 6 = 54$ hands.

The probability is $\frac{54}{84} = \frac{9}{14} \approx 0.643$.

Check that the hand types account for everything. Three of a kind: 3 hands (one per rank). All three ranks different: $3 \cdot 3 \cdot 3 = 27$ hands (one card of each rank, three colour choices each). One pair: 54. Total $3 + 27 + 54 = 84$. The one-pair hand is by far the most common, which is also why a pair is cheap in real poker.`,
    steps: [
      "Count equally likely unordered hands: 84.",
      "Construct a one-pair hand: rank (3), two cards of it (3), odd card (6).",
      "Divide 54 by 84 and reduce to 9/14.",
      "Sanity check: 3 + 27 + 54 = 84 covers all hand types.",
    ],
    keyIdea: "Build the favourable hand step by step and make sure the hand types partition the sample space.",
    commonMistake: "Choosing the odd card from all 7 remaining cards (which allows three of a kind) to get 63/84, or counting ordered draws in the numerator and unordered hands in the denominator.",
    fastPath: "Complement: 3 trips plus 27 rainbow hands = 30 non-pair hands, so 54/84 = 9/14.",
    variation: "Same deck, but you draw four cards. What is the probability of exactly two pairs (two ranks appearing twice each)?",
    variationAnswer: String.raw`Choose the two ranks $\binom{3}{2} = 3$, two cards of each $3 \cdot 3 = 9$: $27$ hands out of $\binom{9}{4} = 126$, so $\frac{27}{126} = \frac{3}{14} \approx 0.214$.`,
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m2-p18",
    module: 2,
    kind: "practice",
    difficulty: 3,
    tags: ["urns", "symmetry"],
    minutes: 4,
    title: "The first white on the fourth draw",
    prompt: String.raw`An urn holds 4 white and 6 black balls. You draw balls one at a time without replacement until a white ball appears. What is the probability that the first white ball is the fourth ball drawn?`,
    answer: { type: "numeric", value: (6 / 10) * (5 / 9) * (4 / 8) * (4 / 7), exact: String.raw`\frac{6}{10}\cdot\frac{5}{9}\cdot\frac{4}{8}\cdot\frac{4}{7} = \frac{480}{5040} = \frac{2}{21} \approx 0.0952` },
    hints: [
      "The first white is fourth exactly when the first three draws are black and the fourth is white.",
      "Multiply along the path: the black count and the total both drop by one after each black draw.",
      "Alternatively, imagine all ten balls laid out in a random row and ask where the first white sits.",
    ],
    solution: String.raw`The first white ball appears on draw four exactly when draws one to three are black and draw four is white. Multiply the probabilities along this path, updating the urn after each draw: $P = \frac{6}{10} \cdot \frac{5}{9} \cdot \frac{4}{8} \cdot \frac{4}{7} = \frac{480}{5040} = \frac{2}{21} \approx 0.0952$.

Here is the symmetry view, which is the better habit. Drawing without replacement until the urn is empty is the same as arranging the ten balls in a uniformly random row and reading it left to right. The positions of the 4 white balls form a uniformly random 4-subset of $\{1, \dots, 10\}$, so there are $\binom{10}{4} = 210$ equally likely position sets. The first white is at position 4 when positions 1 to 3 are black, position 4 is white, and the other 3 whites sit among positions 5 to 10: $\binom{6}{3} = 20$ sets. Again $\frac{20}{210} = \frac{2}{21}$.

The row picture also makes the whole distribution visible: $P(\text{first white at } k) = \binom{10 - k}{3} / \binom{10}{4}$, which decreases in $k$. The first white is most likely on the very first draw.`,
    steps: [
      "Translate the event: three blacks then a white.",
      "Multiply the chain 6/10, 5/9, 4/8, 4/7 with the urn updated each time.",
      "Confirm by the random-row picture: C(6,3)/C(10,4) = 20/210.",
    ],
    keyIdea: "Drawing without replacement is a random arrangement; the first white's position is a question about where 4 marked positions fall.",
    commonMistake: "Using 4/10 for the fourth draw as if the urn had not changed, or stopping after the three blacks and forgetting the fourth draw must be white.",
    fastPath: "6 times 5 times 4 times 4 = 480 over 10 times 9 times 8 times 7 = 5040; that is 2/21.",
    variation: "Now each drawn ball is replaced before the next draw. What is the probability the first white is the fourth draw, and which version makes a long wait more likely?",
    variationAnswer: String.raw`With replacement $\left(\frac{6}{10}\right)^3 \cdot \frac{4}{10} = 0.0864$, slightly less than $\frac{2}{21} \approx 0.0952$ at draw 4, but waits of 8 or more draws are only possible with replacement (without replacement the first white arrives by draw 7 at the latest), so replacement makes the tail heavier.`,
    family: "matching-socks",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m2-p19",
    module: 2,
    kind: "practice",
    difficulty: 3,
    tags: ["symmetry", "urns"],
    minutes: 2,
    title: "The ninth ball",
    prompt: String.raw`An urn holds 5 red and 7 blue balls. All twelve balls are drawn one at a time without replacement. What is the probability that the ninth ball drawn is red?`,
    answer: { type: "numeric", value: 5 / 12, exact: String.raw`\frac{5}{12} \approx 0.417` },
    hints: [
      "Resist conditioning on the first eight draws. Think about all twelve positions at once.",
      "Drawing everything without replacement is the same as a uniformly random arrangement of the twelve balls.",
      "In a random arrangement, is position 9 any different from position 1?",
    ],
    solution: String.raw`Drawing all twelve balls without replacement produces a uniformly random ordering of the balls: every one of the $12!$ orderings (treating the balls as distinct) is equally likely. In a uniformly random ordering, each specific ball is equally likely to land in any of the twelve positions, and the colour composition of position 9 is the same as that of position 1.

So the ninth ball is red with the same probability as the first ball, which is $\frac{5}{12} \approx 0.417$.

If you want to see the mechanism, count directly. The red balls occupy a uniformly random 5-subset of the 12 positions, $\binom{12}{5} = 792$ equally likely subsets. Position 9 is red when it is in the subset, and there are $\binom{11}{4} = 330$ subsets containing it. Then $\frac{330}{792} = \frac{5}{12}$.

The hard way, summing over how many reds were drawn in the first eight draws, also gives $\frac{5}{12}$ after a page of algebra. The symmetry argument is one line, and it also tells you that the last ball is blue with probability $\frac{7}{12}$.`,
    steps: [
      "Recognise the draws as a uniformly random arrangement.",
      "Argue that every position has the same colour distribution.",
      "Read off 5/12 from the first-draw probability.",
    ],
    keyIdea: "Without replacement, the k-th draw has the same distribution as the first draw; position labels carry no information.",
    commonMistake: "Believing the probability must depend on k and launching into a sum over the first eight draws.",
    fastPath: "Any fixed position is red with probability 5/12. Done.",
    variation: "What is the probability that both the ninth and the twelfth balls are red?",
    variationAnswer: String.raw`Two fixed positions both red: $\frac{5}{12} \cdot \frac{4}{11} = \frac{20}{132} = \frac{5}{33} \approx 0.152$, the same as the first two draws both being red.`,
    family: "symmetry",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m2-p20",
    module: 2,
    kind: "practice",
    difficulty: 3,
    tags: ["geometric-probability"],
    minutes: 4,
    title: "Two points far apart on a rod",
    prompt: String.raw`Two points are chosen independently and uniformly at random on a rod of length 10. What is the probability that the distance between them is greater than 4?`,
    answer: { type: "numeric", value: Math.pow(6 / 10, 2), exact: String.raw`\left(\frac{10 - 4}{10}\right)^2 = \frac{36}{100} = \frac{9}{25} = 0.36` },
    hints: [
      String.raw`Call the points $x$ and $y$. The pair $(x, y)$ is uniform over a $10 \times 10$ square.`,
      "The condition $|x - y| > 4$ cuts out a band around the diagonal $y = x$.",
      "What remains is two right triangles with legs of length 6. Compare their area with 100.",
    ],
    solution: String.raw`Let the two points be $x$ and $y$, each uniform on $[0, 10]$ and independent. Then the pair $(x, y)$ is uniformly distributed over the square $[0, 10]^2$ of area $100$, and the probability of any event is the area of the corresponding region divided by $100$.

The event $|x - y| > 4$ means $y > x + 4$ or $y < x - 4$. The first is the triangle above the line $y = x + 4$, with vertices $(0, 4), (0, 10), (6, 10)$: a right triangle with legs 6 and 6, area $\frac{1}{2} \cdot 36 = 18$. The second, below $y = x - 4$, is its mirror image and also has area $18$.

So the favourable area is $36$ and the probability is $\frac{36}{100} = \frac{9}{25} = 0.36$.

The general pattern is worth memorising: for a rod of length $L$ and a distance $d < L$, $P(|x - y| > d) = \left(\frac{L - d}{L}\right)^2$, and so $P(|x - y| \le d) = 1 - \left(1 - \frac{d}{L}\right)^2$. Another route is to fix $x$ and integrate the length of the allowed set for $y$, which is $\max(0, x - 4) + \max(0, 6 - x)$, over $x$; the integral is $18 + 18 = 36$ again.`,
    steps: [
      "Model the pair as a uniform point in a 10-by-10 square.",
      "Draw the band |x - y| <= 4 around the diagonal.",
      "Compute the two leftover triangles: 2 times 18 = 36.",
      "Divide by the total area 100.",
    ],
    keyIdea: "Two independent uniforms are one uniform point in a square; probabilities become areas.",
    commonMistake: "Treating the problem as one-dimensional and answering 6/10, or getting the triangle legs wrong (they are L - d = 6, not d = 4).",
    fastPath: "((L - d)/L)^2 with L = 10, d = 4: (0.6)^2 = 0.36.",
    variation: "Three points are chosen independently and uniformly on the same rod. What is the probability that the two points nearest each other are more than 4 apart (that is, every pair is more than 4 apart)?",
    variationAnswer: String.raw`Order the points; all gaps exceed 4 with probability $\left(\frac{L - 2d}{L}\right)^3 = \left(\frac{2}{10}\right)^3 = 0.008$.`,
    family: "broken-stick",
    verifiedBy: ["formula", "enumeration", "simulation"],
  },
  // ---------------------------------------------------------------- difficulty 4
  {
    id: "m2-p21",
    module: 2,
    kind: "practice",
    difficulty: 4,
    tags: ["dice", "inclusion-exclusion", "complement"],
    minutes: 5,
    title: "Both ends of the die",
    prompt: String.raw`Three fair six-sided dice are rolled. What is the probability that at least one die shows a 1 and at least one die shows a 6?`,
    answer: { type: "numeric", value: 1 - 2 * Math.pow(5 / 6, 3) + Math.pow(4 / 6, 3), exact: String.raw`1 - 2\left(\frac{5}{6}\right)^3 + \left(\frac{4}{6}\right)^3 = \frac{30}{216} = \frac{5}{36} \approx 0.139` },
    hints: [
      "The complement is 'no 1 appears, or no 6 appears'. That is a union of two simple events.",
      "Apply inclusion-exclusion to the union: P(no 1) + P(no 6) - P(no 1 and no 6).",
      "P(no 1) = (5/6)^3, P(no 6) = (5/6)^3, P(neither) = (4/6)^3. Combine and subtract from 1.",
    ],
    solution: String.raw`Let $E_1$ be the event that at least one die shows a 1 and $E_6$ that at least one shows a 6. We want $P(E_1 \cap E_6)$. Both events are "at least one" events, so their complements are easy: $P(\text{no } 1) = \left(\frac{5}{6}\right)^3$ and $P(\text{no } 6) = \left(\frac{5}{6}\right)^3$, by independence of the dice.

The complement of $E_1 \cap E_6$ is "no 1 or no 6". By inclusion-exclusion, $P(\text{no } 1 \cup \text{no } 6) = \left(\frac{5}{6}\right)^3 + \left(\frac{5}{6}\right)^3 - \left(\frac{4}{6}\right)^3 = \frac{125 + 125 - 64}{216} = \frac{186}{216}$, where $\left(\frac{4}{6}\right)^3$ is the probability that every die avoids both 1 and 6.

Therefore $P(E_1 \cap E_6) = 1 - \frac{186}{216} = \frac{30}{216} = \frac{5}{36} \approx 0.139$.

Direct count as a check: the outcomes containing both a 1 and a 6 are the arrangements of $\{1, 6, x\}$ with $x \in \{2, 3, 4, 5\}$, giving $4 \cdot 3! = 24$, plus the arrangements of $\{1, 1, 6\}$ and $\{1, 6, 6\}$, giving $3 + 3 = 6$. Total $30$ of $216$. Note that the three dice have a range of exactly 5 (max minus min) precisely in this event, so this is also $P(\max - \min = 5)$.`,
    steps: [
      "Name the events: at least one 1, at least one 6.",
      "Pass to the complement: no 1 or no 6.",
      "Inclusion-exclusion with (5/6)^3, (5/6)^3 and (4/6)^3.",
      "Subtract from 1: 30/216 = 5/36.",
    ],
    keyIdea: "An intersection of two 'at least one' events is handled through the union of their complements.",
    commonMistake: "Multiplying P(at least one 1) by P(at least one 6) as if they were independent; both compete for the same three dice.",
    fastPath: "Count {1,6,x}: 4 choices for x times 6 orders = 24, plus 6 for the doubles: 30/216 = 5/36.",
    variation: "Roll four dice instead. What is the probability that both a 1 and a 6 appear?",
    variationAnswer: String.raw`$1 - 2\left(\frac{5}{6}\right)^4 + \left(\frac{4}{6}\right)^4 = \frac{1296 - 1250 + 256}{1296} = \frac{302}{1296} = \frac{151}{648} \approx 0.233$.`,
    family: "dice-sums",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m2-p22",
    module: 2,
    kind: "practice",
    difficulty: 4,
    tags: ["symmetry", "coins"],
    minutes: 5,
    title: "Three coins against two",
    prompt: String.raw`Ana flips three fair coins and Bo flips two fair coins, all flips independent. What is the probability that Ana gets strictly more heads than Bo?`,
    answer: { type: "numeric", value: 1 / 2, exact: String.raw`\frac{1}{2}` },
    hints: [
      "Set Ana's third coin aside and compare her first two coins with Bo's two coins.",
      "After two coins each, the situation is symmetric: Ana is ahead, Bo is ahead, or they are tied, with P(Ana ahead) = P(Bo ahead).",
      "If Ana is already ahead she stays ahead; if tied, her third coin decides with probability 1/2; if behind, one coin can at best tie. So P(Ana wins) = q + t/2 where 2q + t = 1.",
    ],
    solution: String.raw`Compare Ana's first two coins with Bo's two coins. Let $X$ be Ana's head count on those two coins and $Y$ Bo's. By symmetry $P(X > Y) = P(Y > X)$; call this $q$, and let $t = P(X = Y)$, so $2q + t = 1$.

Now bring in Ana's third coin $Z \in \{0, 1\}$. Ana wins when $X + Z > Y$. If $X > Y$ she wins regardless of $Z$. If $X = Y$ she wins exactly when $Z = 1$, probability $\frac{1}{2}$. If $X < Y$ then $X + Z \le Y$, so she cannot win. Therefore $P(\text{Ana wins}) = q + \frac{t}{2} = \frac{2q + t}{2} = \frac{1}{2}$.

The answer does not depend on how many coins Bo has, as long as Ana has exactly one more. With $n$ coins each the game is symmetric apart from ties; Ana's extra coin converts exactly half of the ties into wins.

Direct check: $P(X_3 > Y_2) = \sum_a P(A = a) P(B < a)$ with $A \sim \text{Bin}(3, \tfrac12)$ and $B \sim \text{Bin}(2, \tfrac12)$: $\frac{3}{8} \cdot \frac{1}{4} + \frac{3}{8} \cdot \frac{3}{4} + \frac{1}{8} \cdot 1 = \frac{3 + 9 + 4}{32} = \frac{16}{32} = \frac{1}{2}$.`,
    steps: [
      "Split Ana's coins into two plus one.",
      "Use symmetry on the two-versus-two comparison: P(ahead) = P(behind).",
      "The extra coin wins all of 'ahead' and half of 'tied'.",
      "Conclude (2q + t)/2 = 1/2.",
    ],
    keyIdea: "Peel off the extra coin: the rest is symmetric, and one extra fair coin converts half the ties into wins.",
    commonMistake: "Guessing 'more than 1/2 because Ana has more coins', or computing P(Ana >= Bo) instead of strictly more.",
    fastPath: "n + 1 fair coins versus n: strictly more heads has probability exactly 1/2.",
    variation: "Ana flips four fair coins and Bo flips two. What is the probability Ana has strictly more heads?",
    variationAnswer: String.raw`Now the extra coins are two. $\sum_a P(A = a)P(B < a)$ with $A \sim \text{Bin}(4, \tfrac12)$: $\frac{4}{16}\cdot\frac{1}{4} + \frac{6}{16}\cdot\frac{3}{4} + \frac{4}{16} + \frac{1}{16} = \frac{4 + 18 + 16 + 4}{64} = \frac{42}{64} = \frac{21}{32} \approx 0.656$.`,
    family: "symmetry",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m2-p23",
    module: 2,
    kind: "practice",
    difficulty: 4,
    tags: ["symmetry", "urns"],
    minutes: 5,
    title: "Taking turns for the gold coin",
    prompt: String.raw`A pouch holds 2 gold coins and 6 copper coins. Ana and Bo take turns drawing one coin at random without replacement, Ana drawing first. The first player to draw a gold coin wins. What is the probability that Ana wins?`,
    answer: { type: "numeric", value: 16 / 28, exact: String.raw`\frac{7 + 5 + 3 + 1}{28} = \frac{16}{28} = \frac{4}{7} \approx 0.571` },
    hints: [
      "Ana wins exactly when the first gold coin sits at an odd position in the drawing order.",
      String.raw`Think of the eight coins in a random row. The two gold positions form a random pair from $\binom{8}{2} = 28$.`,
      "The first gold is at position $k$ when the other gold is somewhere later: $8 - k$ pairs. Sum over odd $k$.",
    ],
    solution: String.raw`Drawing without replacement until someone wins is the same as laying the eight coins in a uniformly random row and reading it from the left. Ana takes positions 1, 3, 5, 7 and Bo takes 2, 4, 6, 8, so Ana wins exactly when the first gold coin is at an odd position.

The two gold coins occupy a uniformly random pair of positions, one of $\binom{8}{2} = 28$ equally likely pairs. The first gold is at position $k$ when one gold is at $k$ and the other is at one of the $8 - k$ later positions. So $P(\text{first gold at } k) = \frac{8 - k}{28}$ for $k = 1, \dots, 7$.

Summing over Ana's positions, $P(\text{Ana wins}) = \frac{7 + 5 + 3 + 1}{28} = \frac{16}{28} = \frac{4}{7} \approx 0.571$. Bo gets the even positions: $\frac{6 + 4 + 2}{28} = \frac{12}{28} = \frac{3}{7}$.

Going first is an advantage here because the first gold is more likely early: with two gold coins the position of the first one is skewed toward the start, and the odd positions include position 1, the single most likely spot.`,
    steps: [
      "Reformulate as a random row of eight coins.",
      "Ana wins when the first gold is at an odd position.",
      "P(first gold at k) = (8 - k)/28; sum over k = 1, 3, 5, 7.",
      "Get 16/28 = 4/7.",
    ],
    keyIdea: "Turn-taking without replacement is a question about the position of the first marked item in a random arrangement.",
    commonMistake: "Answering 1/2 'by symmetry' (the players are not symmetric: Ana moves first), or computing the chain of conditional draws and dropping a term.",
    fastPath: "Odd positions for the first gold: (7 + 5 + 3 + 1)/28 = 16/28 = 4/7.",
    variation: "Each drawn coin is now put back before the next draw, so every draw has a 1/4 chance of gold. What is Ana's winning probability now?",
    variationAnswer: String.raw`$P = \frac{1/4}{1 - (3/4)^2} = \frac{1/4}{7/16} = \frac{4}{7}$: the same number. For two gold coins in an even-sized pouch the two versions always agree; try 2 gold among 7 coins to see them differ.`,
    family: "symmetry",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m2-p24",
    module: 2,
    kind: "practice",
    difficulty: 4,
    tags: ["geometric-probability", "independence"],
    minutes: 6,
    title: "A lopsided meeting",
    prompt: String.raw`Rae and Sam each arrive at a cafe at a time chosen independently and uniformly at random within the same 60-minute window. Rae will wait 10 minutes for Sam before leaving; Sam will wait 20 minutes for Rae. What is the probability that they meet?`,
    answer: { type: "numeric", value: 1 - (50 * 50 / 2 + 40 * 40 / 2) / 3600, exact: String.raw`1 - \frac{\tfrac{1}{2}\cdot 50^2 + \tfrac{1}{2}\cdot 40^2}{60^2} = \frac{1550}{3600} = \frac{31}{72} \approx 0.431` },
    hints: [
      String.raw`Let $x$ be Rae's arrival and $y$ Sam's, both in minutes. The pair is uniform over a $60 \times 60$ square.`,
      String.raw`They meet if Sam arrives at most 10 minutes after Rae, or Rae arrives at most 20 minutes after Sam: $-20 \le y - x \le 10$.`,
      "The two failure regions are right triangles with legs 50 and 40. Subtract their areas from 3600.",
    ],
    solution: String.raw`Let $x$ be Rae's arrival time and $y$ Sam's, both measured in minutes from the start of the window. The pair $(x, y)$ is uniform over the square $[0, 60]^2$, area $3600$.

If Rae arrives first ($x \le y$), they meet when Sam shows up within Rae's 10-minute wait: $y - x \le 10$. If Sam arrives first ($y \le x$), they meet when Rae shows up within Sam's 20-minute wait: $x - y \le 20$. Together: they meet exactly when $-20 \le y - x \le 10$.

The failures are two triangles. "Sam too late" is $y - x > 10$, the triangle with vertices $(0, 10), (0, 60), (50, 60)$, legs 50 and 50, area $\frac{1}{2} \cdot 50^2 = 1250$. "Rae too late" is $x - y > 20$, the triangle with vertices $(20, 0), (60, 0), (60, 40)$, legs 40 and 40, area $\frac{1}{2} \cdot 40^2 = 800$.

So $P(\text{meet}) = 1 - \frac{1250 + 800}{3600} = \frac{1550}{3600} = \frac{31}{72} \approx 0.431$.

With equal waits of 15 minutes the answer would be $1 - \left(\frac{45}{60}\right)^2 = \frac{7}{16} = 0.4375$, slightly higher than the lopsided 10/20 split even though the total patience is the same 30 minutes. Patience is more valuable when it is spread evenly, because the lost area grows with the square of the uncovered gap.`,
    steps: [
      "Set up the unit: a 60-by-60 square for the two arrival times.",
      "Write the meeting condition as -20 <= y - x <= 10.",
      "Compute the two failure triangles: 1250 and 800.",
      "Subtract from 3600 and reduce: 1550/3600 = 31/72.",
    ],
    keyIdea: "Asymmetric waits give two different failure triangles; compute each from its own leg length (60 minus the wait).",
    commonMistake: "Using legs of 10 and 20 (the waits) for the triangles instead of 50 and 40 (the window minus the wait), or assuming the triangles are equal.",
    fastPath: "Failure areas: half of 50 squared plus half of 40 squared = 2050; 3600 - 2050 = 1550; divide by 3600 to get 31/72.",
    variation: "Both now wait 15 minutes. What is the meeting probability, and is it higher or lower than with the 10/20 split?",
    variationAnswer: String.raw`$1 - \left(\frac{45}{60}\right)^2 = \frac{7}{16} = 0.4375$, higher than $\frac{31}{72} \approx 0.431$: equal patience beats the same total patience split unevenly.`,
    family: "broken-stick",
    verifiedBy: ["formula", "enumeration", "simulation"],
  },
  {
    id: "m2-p25",
    module: 2,
    kind: "practice",
    difficulty: 4,
    tags: ["independence", "dice", "complement"],
    minutes: 5,
    title: "Which bet to take",
    prompt: String.raw`A bookmaker offers two bets at the same price and the same payout. Bet A: roll one fair die three times and win if at least one roll is a 6. Bet B: roll a pair of fair dice eighteen times and win if at least one of the eighteen throws is a double six. A friend argues they are equally good because each bet expects exactly one half of a success. Which bet should you take?`,
    answer: {
      type: "choice",
      options: [
        "Bet A: it wins with probability about 0.42, versus about 0.40 for Bet B.",
        "Bet B: it wins with probability about 0.42, versus about 0.40 for Bet A.",
        "Either: both win with probability exactly 1/2, matching the expected number of successes.",
        "Bet A: it wins with probability about 0.50, versus about 0.40 for Bet B.",
      ],
      correct: 0,
    },
    hints: [
      "Expected number of successes is not the probability of at least one success.",
      "Compute P(at least one) as one minus the probability of no successes, for each bet.",
      "Compare $1 - (5/6)^3$ with $1 - (35/36)^{18}$.",
    ],
    solution: String.raw`The friend's observation is correct but irrelevant. Bet A expects $3 \cdot \frac{1}{6} = \frac{1}{2}$ sixes and Bet B expects $18 \cdot \frac{1}{36} = \frac{1}{2}$ double sixes. But a bet pays on *at least one* success, and the probability of at least one success is not the expected count.

Bet A: the rolls are independent, so $P(\text{no six}) = \left(\frac{5}{6}\right)^3 = \frac{125}{216}$ and $P(\text{win}) = \frac{91}{216} \approx 0.421$.

Bet B: each throw is a double six with probability $\frac{1}{36}$, so $P(\text{no double six}) = \left(\frac{35}{36}\right)^{18}$. Using $\ln\frac{35}{36} \approx -0.02817$, the exponent is $18 \cdot (-0.02817) \approx -0.507$, and $e^{-0.507} \approx 0.602$. So $P(\text{win}) \approx 0.398$.

Bet A is better, by about $0.024$. The pattern is general: spreading the same expected count over more, rarer trials makes "at least one" less likely, because more of the expectation is wasted on outcomes with two or more successes. In the limit of many rare trials, $P(\text{at least one}) \to 1 - e^{-1/2} \approx 0.393$, which is where Bet B is heading.`,
    steps: [
      "Separate 'expected number of successes' from 'probability of at least one'.",
      "Bet A: 1 - (5/6)^3 = 91/216, about 0.421.",
      "Bet B: 1 - (35/36)^18, about 0.398.",
      "Choose Bet A; note the limit 1 - e^(-1/2) for many rare trials.",
    ],
    keyIdea: "Equal expected counts do not mean equal 'at least one' probabilities; rarer, more numerous trials waste more expectation on multiple hits.",
    commonMistake: "Accepting the expected-count argument and calling the bets equal, or reading 'at least one' as 'exactly one'.",
    fastPath: "With the mean fixed at 1/2, P(at least one) = 1 - (1 - 1/(2n))^n falls with n toward 1 - e^(-1/2) = 0.393. Fewer, likelier trials win: A (n = 3) is 0.421, B (n = 18) is 0.398.",
    variation: "How many throws of the pair would Bet B need for its winning probability to match Bet A's 91/216?",
    variationAnswer: String.raw`Need $(35/36)^n \le 125/216$, so $n \ge \ln(216/125)/\ln(36/35) \approx 0.5470/0.02817 \approx 19.4$: twenty throws (probability $\approx 0.431$).`,
    family: "at-least-one",
    verifiedBy: ["formula", "simulation"],
  },
  // ---------------------------------------------------------------- difficulty 5
  {
    id: "m2-p26",
    module: 2,
    kind: "practice",
    difficulty: 5,
    tags: ["coins", "sample-space", "recursion"],
    minutes: 8,
    title: "Longest run of exactly three",
    prompt: String.raw`A fair coin is flipped eight times. A run is a maximal block of consecutive identical results (heads or tails). What is the probability that the longest run in the eight flips has length exactly 3?`,
    answer: { type: "numeric", value: 94 / 256, exact: String.raw`\frac{2 \cdot 81 - 2 \cdot 34}{256} = \frac{94}{256} = \frac{47}{128} \approx 0.367` },
    hints: [
      "Count sequences whose longest run is at most 3, then subtract those whose longest run is at most 2.",
      "A sequence is determined by its first flip and the list of its run lengths, which is a composition of 8.",
      "Compositions of 8 with parts at most 3 number 81; with parts at most 2 they number 34. Each composition gives two sequences.",
    ],
    solution: String.raw`All $2^8 = 256$ sequences are equally likely. A sequence is described by its first flip (2 choices) together with the lengths of its runs in order, which form a composition of 8 (an ordered list of positive integers summing to 8). The correspondence is one to one: runs alternate between heads and tails, so the first flip and the run lengths rebuild the sequence.

Let $c_k(n)$ be the number of compositions of $n$ with every part at most $k$. Classifying by the last part, $c_k(n) = \sum_{j=1}^{k} c_k(n - j)$ with $c_k(0) = 1$.

Parts at most 3: $c_3(0..8) = 1, 1, 2, 4, 7, 13, 24, 44, 81$. Parts at most 2: $c_2(0..8) = 1, 1, 2, 3, 5, 8, 13, 21, 34$.

Sequences whose longest run is at most 3 number $2 \cdot 81 = 162$; those whose longest run is at most 2 number $2 \cdot 34 = 68$. So exactly $162 - 68 = 94$ sequences have a longest run of exactly 3, and the probability is $\frac{94}{256} = \frac{47}{128} \approx 0.367$.

For comparison, the longest run is at most 2 with probability $\frac{68}{256} \approx 0.27$ and at least 4 with probability $\frac{256 - 162}{256} \approx 0.37$. Eight fair flips produce a run of four or more more often than people expect; genuinely random sequences look streakier than our intuition says they should.`,
    steps: [
      "Encode a sequence as first flip plus a composition of 8 into run lengths.",
      "Count compositions with parts at most 3 by the recursion: 81.",
      "Count compositions with parts at most 2: 34.",
      "Longest run exactly 3: 2(81 - 34) = 94 sequences out of 256.",
    ],
    keyIdea: "'Longest run exactly k' is 'all runs at most k' minus 'all runs at most k - 1', and run-length lists are compositions.",
    commonMistake: "Counting only runs of heads, or counting sequences that contain a run of 3 without excluding those that also contain a longer run.",
    fastPath: "Tribonacci to 81, Fibonacci to 34, difference 47, double it: 94/256 = 47/128.",
    variation: "What is the probability that the longest run of heads specifically (ignoring tails runs) is exactly 3 in eight flips?",
    variationAnswer: String.raw`Sequences with no $HHHH$ number $a_8 = 208$ (recursion $a_n = a_{n-1} + a_{n-2} + a_{n-3} + a_{n-4}$ from $1, 2, 4, 8$); with no $HHH$, $a_8 = 149$ (from $1, 2, 4$). Difference $59$, so $\frac{59}{256} \approx 0.230$.`,
    verifiedBy: ["enumeration", "recursion"],
  },
  {
    id: "m2-p27",
    module: 2,
    kind: "practice",
    difficulty: 5,
    tags: ["independence", "dice"],
    minutes: 6,
    title: "Independent in pairs, not as a trio",
    prompt: String.raw`Two fair six-sided dice are rolled, one red and one blue. Let $A$ be the event that the total is 7, $B$ the event that the red die shows a 3, and $C$ the event that the blue die shows a 4. Which statement about these three events is correct?`,
    answer: {
      type: "choice",
      options: [
        String.raw`$A$, $B$ and $C$ are mutually independent.`,
        String.raw`Every pair among $A$, $B$, $C$ is independent, but the three are not mutually independent.`,
        String.raw`$A$ is independent of $B$ but not of $C$.`,
        String.raw`No two of the three events are independent.`,
      ],
      correct: 1,
    },
    hints: [
      "Compute $P(A)$, $P(B)$, $P(C)$ and the three pairwise intersections over the 36 ordered pairs.",
      String.raw`Each pairwise intersection is a single outcome. Compare $\frac{1}{36}$ with the products.`,
      String.raw`Now compute $P(A \cap B \cap C)$: it is also the single outcome (3, 4), so its probability $\frac{1}{36}$ is not $\frac{1}{6} \cdot \frac{1}{6} \cdot \frac{1}{6}$.`,
    ],
    solution: String.raw`Work over the 36 equally likely ordered pairs (red, blue). $P(A) = \frac{6}{36} = \frac{1}{6}$ since six pairs total 7; $P(B) = P(C) = \frac{1}{6}$.

Pairwise intersections. $A \cap B$: red is 3 and the total is 7, so blue is 4: the single pair $(3, 4)$, probability $\frac{1}{36} = \frac{1}{6} \cdot \frac{1}{6}$. $A \cap C$: blue is 4 and the total is 7, so red is 3: again $(3, 4)$, probability $\frac{1}{36}$. $B \cap C$: $(3, 4)$, probability $\frac{1}{36}$, and the two dice are physically independent. So all three pairs pass the independence test.

Triple intersection. $A \cap B \cap C$ is also exactly $\{(3, 4)\}$, probability $\frac{1}{36}$. Mutual independence would require $P(A \cap B \cap C) = P(A)P(B)P(C) = \frac{1}{216}$. It does not hold, so the three events are pairwise independent but not mutually independent. The second option is correct.

Why it matters: once you know both $B$ and $C$, you know $A$ for certain, even though knowing either one alone tells you nothing about $A$. Pairwise checks are not enough to justify multiplying three probabilities together; mutual independence needs every sub-collection to factor, including the full triple.`,
    steps: [
      "Compute the three marginals: each 1/6.",
      "Show each pairwise intersection is the single pair (3,4), probability 1/36 = (1/6)^2.",
      "Compute the triple intersection: also 1/36, not 1/216.",
      "Conclude: pairwise independent, not mutually independent.",
    ],
    keyIdea: "Pairwise independence does not imply mutual independence; knowing two events can pin down the third.",
    commonMistake: "Checking only the pairs and concluding the trio is independent, or multiplying the three probabilities to get 1/216 for the triple intersection.",
    fastPath: "Every pair meets only at (3,4): 1/36 = (1/6)(1/6), pairs pass. Triple also (3,4): 1/36 is not 1/216, trio fails.",
    variation: "Replace A by 'the total is 8'. Is this new A independent of B? Of C?",
    variationAnswer: String.raw`$A \cap B$ is $(3, 5)$ with probability $\frac{1}{36}$ and $P(A)P(B) = \frac{5}{36} \cdot \frac{1}{6} = \frac{5}{216}$, so not independent of $B$; by the same computation not independent of $C$ either. Totals other than 7 are not independent of a single die's value.`,
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m2-p28",
    module: 2,
    kind: "practice",
    difficulty: 5,
    tags: ["geometric-probability"],
    minutes: 10,
    title: "Snap the longer piece",
    prompt: String.raw`A thin rod of length 1 is snapped at a point chosen uniformly at random along its length. The longer of the two pieces is then snapped at a point chosen uniformly at random along that piece. What is the probability that the three resulting pieces can be the three sides of a triangle (every piece strictly shorter than the sum of the other two)?`,
    answer: { type: "numeric", value: 2 * Math.log(2) - 1, exact: String.raw`\int_{1/2}^{1} \frac{1 - L}{L}\, 2\,dL = 2\ln 2 - 1 \approx 0.386` },
    hints: [
      "Three pieces with total length 1 form a triangle exactly when every piece is shorter than 1/2.",
      "Let $L$ be the length of the longer piece after the first snap. $L$ is uniform on $(1/2, 1)$, and the short piece $1 - L$ is already fine.",
      String.raw`Given $L$, the second snap must land in a window of length $1 - L$ inside a piece of length $L$. Average $\frac{1 - L}{L}$ over $L$.`,
    ],
    solution: String.raw`Three lengths that add to 1 form a triangle exactly when each is less than $\frac{1}{2}$: if some piece were at least $\frac{1}{2}$, the other two together would be at most $\frac{1}{2}$ and could not reach across it.

First snap at $X$, uniform on $(0, 1)$. The longer piece has length $L = \max(X, 1 - X)$. For $u \in (\frac{1}{2}, 1)$, $P(L \le u) = P(1 - u \le X \le u) = 2u - 1$, so $L$ is uniform on $(\frac{1}{2}, 1)$ with density 2. The shorter piece has length $1 - L < \frac{1}{2}$ and never spoils the triangle.

Second snap at a uniform point of the longer piece, splitting it into $a$ and $L - a$ with $a$ uniform on $(0, L)$. We need $a < \frac{1}{2}$ and $L - a < \frac{1}{2}$, that is $L - \frac{1}{2} < a < \frac{1}{2}$, a window of length $1 - L$ inside an interval of length $L$. So $P(\text{triangle} \mid L) = \frac{1 - L}{L}$.

Average over $L$: $P = \int_{1/2}^{1} \frac{1 - L}{L} \cdot 2 \, dL = 2\Big[\ln L - L\Big]_{1/2}^{1} = 2\left(-1 + \ln 2 + \tfrac{1}{2}\right) = 2\ln 2 - 1 \approx 0.386$.

Compare with snapping at two independent uniform points of the original rod, where the probability is $\frac{1}{4}$. Aiming the second snap at the longer piece helps because the longer piece is the only one that can be too long; but the second snap still misses the window often when $L$ is close to 1.`,
    steps: [
      "State the triangle condition: every piece shorter than 1/2.",
      "Find the law of the longer piece: uniform on (1/2, 1) with density 2.",
      "Given L, the good window for the second snap has length 1 - L out of L.",
      "Integrate 2(1 - L)/L from 1/2 to 1 to get 2 ln 2 - 1.",
    ],
    keyIdea: "Condition on the first snap, solve the one-dimensional problem exactly, then integrate against the right density.",
    commonMistake: "Answering 1/4 from the two-independent-cuts version, or integrating against density 1 instead of 2 for the longer piece.",
    fastPath: "P(triangle | L) = (1 - L)/L; average over L uniform on (1/2, 1): 2(ln 2 - 1/2) = 2 ln 2 - 1 = 0.386.",
    variation: "Instead of the longer piece, the second snap is made on a piece chosen by a fair coin flip. What is the probability of a triangle?",
    variationAnswer: String.raw`Half the time the shorter piece is snapped and a triangle is impossible (the longer piece stays at least $\frac{1}{2}$). So $P = \frac{1}{2}(2\ln 2 - 1) = \ln 2 - \frac{1}{2} \approx 0.193$.`,
    family: "broken-stick",
    verifiedBy: ["enumeration", "simulation"],
  },
  // ---------------------------------------------------------------- lesson checks
  {
    id: "m2-lc1",
    module: 2,
    kind: "lessonCheck",
    difficulty: 1,
    tags: ["independence", "dice"],
    minutes: 1,
    title: "Disjoint or independent?",
    prompt: String.raw`Two fair six-sided dice are rolled. Let $A$ be the event that the total is 5 and $B$ the event that the total is 9. Which statement is correct?`,
    answer: {
      type: "choice",
      options: [
        String.raw`$A$ and $B$ are independent.`,
        String.raw`$A$ and $B$ are mutually exclusive, and therefore independent.`,
        String.raw`$A$ and $B$ are mutually exclusive, and therefore not independent (both have positive probability).`,
        String.raw`$A$ and $B$ are neither mutually exclusive nor independent.`,
      ],
      correct: 2,
    },
    hints: [
      "Can the total be 5 and 9 at the same time?",
      String.raw`Independence requires $P(A \cap B) = P(A)P(B)$. What is each side here?`,
      String.raw`$P(A \cap B) = 0$ but $P(A)P(B) = \frac{4}{36} \cdot \frac{4}{36} > 0$.`,
    ],
    solution: String.raw`The total cannot be both 5 and 9, so $A \cap B$ is empty and the events are mutually exclusive: $P(A \cap B) = 0$.

Independence would need $P(A \cap B) = P(A)P(B)$. Here $P(A) = \frac{4}{36}$ (pairs $(1,4),(2,3),(3,2),(4,1)$) and $P(B) = \frac{4}{36}$, so $P(A)P(B) = \frac{16}{1296} > 0 = P(A \cap B)$. The events are not independent.

This is the general rule: two events with positive probability that cannot happen together are never independent. Knowing that $A$ happened tells you for sure that $B$ did not, which is the strongest kind of dependence. Disjoint and independent are near opposites, not synonyms.`,
    steps: [
      "Check whether both totals can happen together: no, so disjoint.",
      "Compare P(A and B) = 0 with P(A)P(B) > 0.",
      "Conclude: mutually exclusive, hence not independent.",
    ],
    keyIdea: "Disjoint events with positive probability are always dependent: one happening rules the other out.",
    commonMistake: "Equating 'mutually exclusive' with 'independent' because both sound like 'unrelated'.",
    fastPath: "Disjoint plus positive probabilities means dependent. Option three.",
    variation: "Let C be the event that the first die shows a 2. Are A (total 5) and C independent?",
    variationAnswer: String.raw`$P(A \cap C) = P((2,3)) = \frac{1}{36}$ and $P(A)P(C) = \frac{4}{36}\cdot\frac{1}{6} = \frac{4}{216} = \frac{1}{54} \ne \frac{1}{36}$: not independent.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m2-lc2",
    module: 2,
    kind: "lessonCheck",
    difficulty: 1,
    tags: ["dice", "independence"],
    minutes: 1,
    title: "Both dice at least three",
    prompt: String.raw`Two fair six-sided dice are rolled. What is the probability that the smaller of the two values is at least 3?`,
    answer: { type: "numeric", value: Math.pow(4 / 6, 2), exact: String.raw`\left(\frac{4}{6}\right)^2 = \frac{16}{36} = \frac{4}{9} \approx 0.444` },
    hints: [
      "'The minimum is at least 3' is the same as 'both dice are at least 3'.",
      "Each die is at least 3 with probability 4/6.",
      "The dice are independent, so multiply.",
    ],
    solution: String.raw`The smaller of two numbers is at least 3 exactly when both numbers are at least 3. Each die shows 3, 4, 5 or 6 with probability $\frac{4}{6} = \frac{2}{3}$, and the dice are independent, so $P(\min \ge 3) = \left(\frac{2}{3}\right)^2 = \frac{4}{9} \approx 0.444$.

Counting confirms it: the ordered pairs with both entries in $\{3, 4, 5, 6\}$ form a $4 \times 4$ block of the $6 \times 6$ grid, $16$ of $36$ cells.

The same move works for maxima: $P(\max \le k) = (k/6)^n$ for $n$ dice, and $P(\min \ge k) = ((7 - k)/6)^n$.`,
    steps: [
      "Rewrite 'min at least 3' as 'every die at least 3'.",
      "Per-die probability 4/6.",
      "Multiply by independence: 16/36 = 4/9.",
    ],
    keyIdea: "Statements about a minimum or maximum become statements about every die, which multiply.",
    commonMistake: "Computing P(at least one die is at least 3) = 1 - (2/6)^2 = 8/9 instead of P(both are).",
    fastPath: "(4/6)^2 = 16/36 = 4/9.",
    variation: "What is the probability that the smaller of the two dice is exactly 3?",
    variationAnswer: String.raw`$P(\min \ge 3) - P(\min \ge 4) = \frac{16}{36} - \frac{9}{36} = \frac{7}{36} \approx 0.194$.`,
    family: "dice-sums",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m2-lc3",
    module: 2,
    kind: "lessonCheck",
    difficulty: 2,
    tags: ["symmetry"],
    minutes: 1,
    title: "Ahead of two rivals",
    prompt: String.raw`Eight runners finish a race in a uniformly random order (no ties). What is the probability that Maya finishes ahead of both Noor and Omar?`,
    answer: { type: "numeric", value: 1 / 3, exact: String.raw`\frac{1}{3} \approx 0.333` },
    hints: [
      "The other five runners do not matter. Only the relative order of three runners does.",
      "All 3! orderings of Maya, Noor and Omar are equally likely.",
      "Maya is first among the three in 2 of the 6 orderings.",
    ],
    solution: String.raw`Delete the five runners who are not Maya, Noor or Omar from the finishing order. What remains is an ordering of three people, and because the full order is uniformly random, each of the $3! = 6$ relative orders is equally likely.

Maya finishes ahead of both rivals exactly when she is first among the three. By symmetry each of the three is equally likely to be first, so the probability is $\frac{1}{3}$. Counting instead: Maya first, then Noor and Omar in either order, $2$ of $6$ orderings.

The number of other runners, eight here, is irrelevant. The same answer holds for a field of three or of three hundred.`,
    steps: [
      "Strip out the irrelevant runners.",
      "Note that all relative orders of the three are equally likely.",
      "Maya first in 1/3 of them.",
    ],
    keyIdea: "A question about relative order only involves the people named; each is equally likely to be first among them.",
    commonMistake: "Multiplying P(ahead of Noor) by P(ahead of Omar) to get 1/4; those two events are positively dependent.",
    fastPath: "Three named runners, each equally likely to be first: 1/3.",
    variation: "What is the probability that Maya finishes ahead of Noor but behind Omar?",
    variationAnswer: String.raw`One specific relative order (Omar, Maya, Noor) out of six: $\frac{1}{6}$.`,
    family: "symmetry",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m2-lc4",
    module: 2,
    kind: "lessonCheck",
    difficulty: 2,
    tags: ["coins", "complement", "independence"],
    minutes: 1,
    title: "A bent coin, two flips",
    prompt: String.raw`A bent coin lands heads with probability 0.3 on each flip, and flips are independent. It is flipped twice. What is the probability of at least one head?`,
    answer: { type: "numeric", value: 1 - 0.7 * 0.7, exact: String.raw`1 - 0.7^2 = 0.51` },
    hints: [
      "Go through the complement: no heads at all.",
      "Each flip is a tail with probability 0.7, independently.",
      "1 - 0.7 times 0.7.",
    ],
    solution: String.raw`The complement of "at least one head" is "two tails". Each flip is a tail with probability $0.7$, and the flips are independent, so $P(\text{two tails}) = 0.7 \cdot 0.7 = 0.49$.

Hence $P(\text{at least one head}) = 1 - 0.49 = 0.51$.

Direct check: exactly one head has probability $2 \cdot 0.3 \cdot 0.7 = 0.42$ (the head can be first or second), and two heads has probability $0.09$. Adding gives $0.51$ as well. With a biased coin the sequences $HT$ and $TH$ still have equal probability, but $HH$ and $TT$ do not, so the sample space is not made of equally likely outcomes and you must multiply the per-flip probabilities.`,
    steps: [
      "Complement: both flips tails.",
      "Multiply 0.7 by 0.7 using independence.",
      "Subtract from 1: 0.51.",
    ],
    keyIdea: "With a biased coin the outcomes are not equally likely; multiply the per-flip probabilities and use the complement for 'at least one'.",
    commonMistake: "Answering 3/4 by treating the four sequences as equally likely, or adding 0.3 + 0.3 = 0.6.",
    fastPath: "1 - 0.49 = 0.51.",
    variation: "How many flips of this coin are needed for at least one head to be more likely than not?",
    variationAnswer: String.raw`Need $0.7^n < 0.5$: $0.7^2 = 0.49$, so two flips already suffice; one flip gives only $0.3$.`,
    family: "at-least-one",
    verifiedBy: ["formula", "simulation"],
  },
];
