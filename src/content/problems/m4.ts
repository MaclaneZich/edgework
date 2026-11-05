import type { Problem } from "../types";

/**
 * Module 4: Expectation and linearity.
 * 30 practice problems (m4-p01..m4-p30) and four lesson checks (m4-lc1..m4-lc4).
 * Every text is original Edgework content; classic ideas appear only as concepts
 * with fresh framings and numbers.
 */
export const problems: Problem[] = [
  // ---------------------------------------------------------------- difficulty 1
  {
    id: "m4-p01",
    module: 4,
    kind: "practice",
    difficulty: 1,
    tags: ["expectation"],
    minutes: 2,
    title: "Value of a raffle ticket",
    prompt: String.raw`A charity raffle sells exactly 400 numbered tickets and then draws the winning tickets at random without replacement: one ticket wins \$150, three tickets win \$30 each, ten tickets win \$5 each, and every other ticket wins nothing. You hold one ticket. What is the expected prize value of your ticket, in dollars?`,
    answer: {
      type: "numeric",
      value: 29 / 40,
      exact: String.raw`\tfrac{150 + 3 \cdot 30 + 10 \cdot 5}{400} = \tfrac{29}{40} = 0.725`,
      unit: "dollars",
    },
    hints: [
      "Expected value is a probability-weighted average of the possible prizes.",
      String.raw`Your ticket is equally likely to be any of the 400. How many of them pay \$150, how many \$30, how many \$5?`,
      "Add up the total prize money handed out and divide by 400.",
    ],
    solution: String.raw`Your ticket is one of 400 and the draw treats every ticket alike, so it is equally likely to be any of them. The prize is \$150 with probability $\frac{1}{400}$, \$30 with probability $\frac{3}{400}$, \$5 with probability $\frac{10}{400}$, and nothing otherwise.

Expected value is the probability-weighted average of the outcomes:
$E[\text{prize}] = 150 \cdot \tfrac{1}{400} + 30 \cdot \tfrac{3}{400} + 5 \cdot \tfrac{10}{400} + 0 = \tfrac{150 + 90 + 50}{400} = \tfrac{290}{400}.$

A faster way to see the same number: the organisers hand out \$290 in total, spread over 400 tickets, so the average ticket collects $290/400$. That is the expected value, $\frac{29}{40} = 0.725$ dollars, or 72.5 cents.`,
    steps: [
      "Identify each prize and its probability (winning tickets over 400).",
      "Multiply each prize by its probability.",
      "Add; equivalently divide the total prize pool by the number of tickets.",
    ],
    keyIdea: "Expected value is total prize money divided by the number of equally likely tickets.",
    commonMistake: "Averaging the prize amounts 150, 30, 5 and 0 with equal weights, forgetting that the no-prize outcome carries almost all the probability.",
    fastPath: "Total pool 150 + 90 + 50 = 290; divide by 400 to get 0.725.",
    variation: "You buy two tickets instead of one. What is the expected total prize value? (Note that two tickets can never win the same prize, so their prizes are dependent.)",
    variationAnswer: "Exactly 2 times 0.725 = 1.45 dollars: linearity of expectation does not care that the two tickets' prizes are dependent.",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m4-p02",
    module: 4,
    kind: "practice",
    difficulty: 1,
    tags: ["expectation", "dice"],
    minutes: 2,
    title: "Fair price for a die game",
    prompt: String.raw`A game pays you the face value of one roll of a fair six-sided die in dollars, except that a 6 pays \$12 instead of \$6. What is the fair price to play, meaning the price at which your expected profit is zero?`,
    answer: {
      type: "numeric",
      value: 9 / 2,
      exact: String.raw`\tfrac{1 + 2 + 3 + 4 + 5 + 12}{6} = \tfrac{27}{6} = \tfrac{9}{2} = 4.5`,
      unit: "dollars",
    },
    hints: [
      "The fair price is the expected payout.",
      String.raw`Each of the six faces has probability $\frac{1}{6}$. Write down the six payouts.`,
      "Average the six payouts: (1 + 2 + 3 + 4 + 5 + 12)/6.",
    ],
    solution: String.raw`A price is fair when your expected profit is zero, which happens exactly when the price equals the expected payout.

The payouts are 1, 2, 3, 4, 5 and 12 dollars, each with probability $\frac{1}{6}$, so
$E[\text{payout}] = \tfrac{1}{6}(1 + 2 + 3 + 4 + 5 + 12) = \tfrac{27}{6} = \tfrac{9}{2}.$

Alternative view: the plain game (face value in dollars) is worth $3.5$, and the bonus adds an extra \$6 with probability $\frac{1}{6}$, worth exactly $1$ more. By linearity, $3.5 + 1 = 4.5$.

The fair price is $\frac{9}{2} = 4.50$ dollars.`,
    steps: [
      "Translate 'fair price' into 'expected payout'.",
      "List the payouts with their probabilities.",
      "Average them, or add the bonus's expectation to 3.5.",
    ],
    keyIdea: "The fair price of a game is its expected payout; a bonus adds its own expected value by linearity.",
    commonMistake: "Computing the usual 3.5 and forgetting the modified face, or doubling the whole 3.5 because 'a six pays double'.",
    fastPath: "Start from 3.5 for a plain die and add the bonus: an extra 6 with probability 1/6 adds exactly 1. Price 4.5.",
    variation: "Keep the 12-dollar six, but now a 1 pays nothing. Fair price?",
    variationAnswer: String.raw`$(0 + 2 + 3 + 4 + 5 + 12)/6 = 26/6 = 13/3 \approx 4.33$ dollars.`,
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m4-p03",
    module: 4,
    kind: "practice",
    difficulty: 1,
    tags: ["linearity", "dice"],
    minutes: 1,
    title: "Expected total of four dice",
    prompt: "You roll four fair six-sided dice and add up the four faces. What is the expected total?",
    answer: { type: "numeric", value: 14, exact: String.raw`4 \cdot \tfrac{7}{2} = 14` },
    hints: [
      "The total is a sum of four simpler random variables.",
      "What is the expected value of one fair die?",
      "Expectation of a sum is the sum of expectations: multiply by four.",
    ],
    solution: String.raw`Write the total as $S = X_1 + X_2 + X_3 + X_4$, where $X_i$ is the face of die $i$.

A single fair die has $E[X_i] = \frac{1 + 2 + 3 + 4 + 5 + 6}{6} = \frac{21}{6} = \frac{7}{2}$.

By linearity of expectation, $E[S] = E[X_1] + E[X_2] + E[X_3] + E[X_4] = 4 \cdot \frac{7}{2} = 14$. There is no need to list the $6^4 = 1296$ outcomes or to work out the distribution of the total, which is a bell-shaped mess; the expectation is immediate.

A symmetry check: the total ranges from 4 to 24 and its distribution is symmetric about the midpoint 14, which must therefore be the mean. Answer: $14$.`,
    steps: [
      "Write the total as a sum of four single-die faces.",
      "Compute one die's expectation, 3.5.",
      "Add four copies: 14.",
    ],
    keyIdea: "Never compute the distribution of a sum when you only need its mean; add the means.",
    commonMistake: "Trying to build the distribution of the total, or using 3 instead of 3.5 for one die.",
    fastPath: "Four dice times 3.5 each is 14. Symmetry of the range 4 to 24 confirms it.",
    variation: "Same four dice, but you are told none of them shows a 6. What is the expected total now?",
    variationAnswer: String.raw`Each die is now uniform on 1 to 5 with mean 3, so the expected total is $4 \cdot 3 = 12$.`,
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m4-p04",
    module: 4,
    kind: "practice",
    difficulty: 1,
    tags: ["expectation", "geometric-dist"],
    minutes: 2,
    title: "Attempts until the order fills",
    prompt: "A trading algorithm sends an order once per second. Each attempt fills with probability 0.2, independently of all other attempts, and the algorithm stops at the first fill. What is the expected number of attempts it makes, counting the one that fills?",
    answer: { type: "numeric", value: 5, exact: String.raw`\tfrac{1}{0.2} = 5`, unit: "attempts" },
    hints: [
      "This is a waiting time for the first success in independent trials.",
      String.raw`The expected number of trials until the first success with success probability $p$ is $1/p$. Why? Try conditioning on the first attempt.`,
      String.raw`If $E$ is the answer, then $E = 1 + 0.8E$, because a failed first attempt puts you back at the start.`,
    ],
    solution: String.raw`Let $T$ be the number of attempts up to and including the first fill. Each attempt succeeds with probability $p = 0.2$ independently, so $T$ is geometric.

First-attempt reasoning: the first attempt always costs 1. With probability $0.8$ it fails, and the process restarts from scratch with the same expected remaining time $E[T]$. So
$E[T] = 1 + 0.8\,E[T] \quad\Longrightarrow\quad 0.2\,E[T] = 1 \quad\Longrightarrow\quad E[T] = 5.$

Tail-sum check: $P(T \ge k) = 0.8^{k-1}$ (the first $k-1$ attempts all fail), and $E[T] = \sum_{k \ge 1} P(T \ge k) = \sum_{k \ge 1} 0.8^{k-1} = \frac{1}{1 - 0.8} = 5$.

Both routes give $E[T] = 1/p = 5$ attempts.`,
    steps: [
      "Recognise a geometric waiting time with p = 0.2.",
      "Restart argument: E = 1 + (1 - p) E.",
      "Or tail sum of (1 - p)^(k - 1).",
      "Conclude E = 1/p = 5.",
    ],
    keyIdea: "Expected trials to the first success is 1/p; a failed trial just restarts the clock.",
    commonMistake: "Answering 4 (the expected number of failures); read whether the question counts the successful attempt.",
    fastPath: "1/p = 1/0.2 = 5.",
    variation: "What is the expected number of attempts until the second fill?",
    variationAnswer: "Two independent geometric waits, so 5 + 5 = 10 attempts.",
    verifiedBy: ["recursion", "simulation"],
  },

  // ---------------------------------------------------------------- difficulty 2
  {
    id: "m4-p05",
    module: 4,
    kind: "practice",
    difficulty: 2,
    tags: ["indicators", "linearity"],
    minutes: 3,
    title: "Empty lockers",
    prompt: "Five parcels are delivered to a bank of five lockers. Each parcel is placed in a locker chosen uniformly at random, independently of the others, so a locker may receive several parcels. What is the expected number of lockers that end up empty?",
    answer: {
      type: "numeric",
      value: 5 * Math.pow(4 / 5, 5),
      exact: String.raw`5\left(\tfrac{4}{5}\right)^5 = \tfrac{1024}{625} \approx 1.638`,
    },
    hints: [
      "Count empty lockers as a sum of five yes/no quantities, one per locker.",
      "The probability that a specific locker is missed by one parcel is 4/5. By how many parcels must it be missed?",
      String.raw`Each locker is empty with probability $(4/5)^5$; add this five times.`,
    ],
    solution: String.raw`Let $I_j = 1$ if locker $j$ is empty and $0$ otherwise. The number of empty lockers is $N = I_1 + \cdots + I_5$, so $E[N] = \sum_j E[I_j] = \sum_j P(\text{locker } j \text{ empty})$.

Locker $j$ is empty when all five parcels avoid it. Each parcel avoids it with probability $\frac{4}{5}$, independently, so $P(I_j = 1) = \left(\frac{4}{5}\right)^5 = \frac{1024}{3125}$.

The five indicators are far from independent (if four lockers are empty, the fifth is certainly full), but linearity does not care. Therefore
$E[N] = 5 \cdot \frac{1024}{3125} = \frac{1024}{625} \approx 1.638.$

So on average about 1.6 of the 5 lockers stay empty; equivalently about 3.4 lockers are used.`,
    steps: [
      "Define an indicator per locker.",
      "Compute P(locker empty) = (4/5)^5.",
      "Add five identical terms; dependence is irrelevant.",
    ],
    keyIdea: "Expected empty bins = number of bins times the probability a given bin is missed by every ball.",
    commonMistake: "Trying to enumerate occupancy patterns, or reporting 1 - (4/5)^5 (the probability a locker is used) without converting to a count.",
    fastPath: "(4/5)^5 = 1024/3125 = 0.328; times 5 gives 1.64.",
    variation: "Same setup. What is the expected number of lockers that receive exactly one parcel?",
    variationAnswer: String.raw`Per locker $5 \cdot \tfrac{1}{5}\left(\tfrac{4}{5}\right)^4 = \left(\tfrac{4}{5}\right)^4$; times 5 lockers gives $\tfrac{256}{125} = 2.048$.`,
    family: "linearity-of-expectation",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m4-p06",
    module: 4,
    kind: "practice",
    difficulty: 2,
    tags: ["indicators", "linearity", "symmetry"],
    minutes: 3,
    title: "Favourite chairs",
    prompt: String.raw`Eight people are assigned at random to a row of eight chairs, every one of the $8!$ assignments being equally likely. Five of the people each have a different favourite chair. The other three all favour the same chair, the one by the window, which is not the favourite of any of the five. What is the expected number of people who end up sitting in their favourite chair?`,
    answer: { type: "numeric", value: 1, exact: String.raw`8 \cdot \tfrac{1}{8} = 1` },
    hints: [
      "Use one indicator per person: does this person get their favourite chair?",
      "Whatever a person's favourite chair is, what is the probability they are assigned that specific chair?",
      "Every person has probability 1/8 of getting their favourite, shared or not. Add eight copies.",
    ],
    solution: String.raw`Let $I_k = 1$ if person $k$ sits in their favourite chair. The number of satisfied people is $N = I_1 + \cdots + I_8$, so $E[N] = \sum_k P(I_k = 1)$.

Under a uniformly random assignment, person $k$ is equally likely to get any of the eight chairs, so the probability that they get the particular chair they favour is $\frac{1}{8}$. This is true for the five people with distinct favourites and equally true for each of the three window-lovers: each of them individually lands in the window chair with probability $\frac{1}{8}$.

Therefore $E[N] = 8 \cdot \frac{1}{8} = 1$.

The shared favourite changes the dependence between the indicators (at most one of the three window-lovers can be satisfied), but linearity of expectation ignores dependence entirely. The distribution of $N$ does change compared with eight distinct favourites; the mean does not. Answer: $1$.`,
    steps: [
      "Indicator per person for 'got my favourite chair'.",
      "Each person gets any specific chair with probability 1/8.",
      "Sum eight indicators: expectation 1.",
      "Note the shared favourite only affects dependence, not the mean.",
    ],
    keyIdea: "Each person gets any specific chair with probability 1/n, so n people are satisfied n times 1/n = 1 on average, whatever they favour.",
    commonMistake: "Treating the three window-lovers as one event (counting 5 + 1 = 6 chances) or arguing that the overlap must lower the expectation.",
    fastPath: "n people times 1/n each is 1. Shared favourites do not change it.",
    variation: "Suppose all eight people favour the same window chair. Expected number of satisfied people?",
    variationAnswer: "Still 1: exactly one person sits in the window chair, so N = 1 with certainty, and 8 times 1/8 = 1 agrees.",
    family: "fixed-points",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m4-p07",
    module: 4,
    kind: "practice",
    difficulty: 2,
    tags: ["indicators", "dice", "linearity"],
    minutes: 3,
    title: "Distinct faces in four rolls",
    prompt: "You roll a fair six-sided die four times. What is the expected number of distinct faces that appear at least once among the four rolls?",
    answer: {
      type: "numeric",
      value: 6 * (1 - Math.pow(5 / 6, 4)),
      exact: String.raw`6\left(1 - \left(\tfrac{5}{6}\right)^4\right) = \tfrac{671}{216} \approx 3.106`,
    },
    hints: [
      "Count distinct faces as a sum over the six faces of 'did this face show up?'.",
      "A specific face fails to appear in one roll with probability 5/6. In four independent rolls?",
      String.raw`Each face appears with probability $1 - (5/6)^4$; multiply by 6.`,
    ],
    solution: String.raw`Let $I_f = 1$ if face $f$ appears in at least one of the four rolls, for $f = 1, \dots, 6$. The number of distinct faces is $D = I_1 + \cdots + I_6$.

Face $f$ is missed by a single roll with probability $\frac{5}{6}$, so it is missed by all four with probability $\left(\frac{5}{6}\right)^4 = \frac{625}{1296}$, and it appears with probability $1 - \frac{625}{1296} = \frac{671}{1296}$.

By linearity,
$E[D] = 6 \cdot \frac{671}{1296} = \frac{671}{216} \approx 3.106.$

The indicators are dependent (four rolls cannot show all six faces), which is exactly why computing the distribution of $D$ would be tedious, but the expectation needs only the six per-face probabilities. Answer: $\frac{671}{216} \approx 3.11$ distinct faces.`,
    steps: [
      "Indicator per face: appears at least once.",
      "P(face appears) = 1 - (5/6)^4.",
      "Multiply by six faces.",
    ],
    keyIdea: "Expected number of distinct values seen = number of values times the probability a given value is seen at least once.",
    commonMistake: "Answering 4 (the number of rolls) or trying to enumerate the partitions of four rolls into face patterns.",
    fastPath: "(5/6)^4 = 0.482; 1 - 0.482 = 0.518; times 6 = 3.11.",
    variation: "Same four rolls. Expected number of faces that appear exactly once?",
    variationAnswer: String.raw`Per face $4 \cdot \tfrac{1}{6}\left(\tfrac{5}{6}\right)^3 = \tfrac{125}{324}$; times 6 gives $\tfrac{125}{54} \approx 2.31$.`,
    family: "linearity-of-expectation",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m4-p08",
    module: 4,
    kind: "practice",
    difficulty: 2,
    tags: ["indicators", "linearity"],
    minutes: 3,
    title: "Repeated letters in a random string",
    prompt: String.raw`A random DNA string of length 10 is generated by choosing each letter independently and uniformly from A, C, G and T. Positions $i$ and $i+1$ form a 'repeat' if the two letters are equal. What is the expected number of repeats in the string?`,
    answer: { type: "numeric", value: 9 / 4, exact: String.raw`9 \cdot \tfrac{1}{4} = \tfrac{9}{4} = 2.25` },
    hints: [
      "There are 9 adjacent pairs. Attach an indicator to each.",
      "Whatever letter sits at position i, the letter at position i + 1 matches it with what probability?",
      "Nine pairs, each a repeat with probability 1/4.",
    ],
    solution: String.raw`Number the adjacent pairs $(1,2), (2,3), \dots, (9,10)$: there are $10 - 1 = 9$ of them. Let $I_i = 1$ if positions $i$ and $i+1$ carry the same letter.

Whatever letter appears at position $i$, the letter at position $i+1$ is an independent uniform choice from four letters, so it matches with probability $\frac{1}{4}$. Hence $E[I_i] = \frac{1}{4}$ for every $i$.

The repeats overlap (pair $(2,3)$ shares a letter with pairs $(1,2)$ and $(3,4)$), so the indicators are dependent, but linearity still applies:
$E[\text{repeats}] = 9 \cdot \tfrac{1}{4} = \tfrac{9}{4} = 2.25.$

Answer: $\frac{9}{4}$ repeats on average.`,
    steps: [
      "Count the adjacent pairs: 9, not 10.",
      "Each pair matches with probability 1/4.",
      "Add nine indicators.",
    ],
    keyIdea: "Adjacent-pair counts are sums of n - 1 indicators, each with the same matching probability.",
    commonMistake: "Using 10 pairs instead of 9, or abandoning linearity because overlapping pairs are dependent.",
    fastPath: "Nine pairs times a quarter is 2.25.",
    variation: "Expected number of positions i such that letters i, i + 1 and i + 2 are all equal?",
    variationAnswer: String.raw`There are 8 such windows, each all-equal with probability $(1/4)^2 = 1/16$, so $8/16 = 1/2$.`,
    family: "linearity-of-expectation",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m4-p09",
    module: 4,
    kind: "practice",
    difficulty: 2,
    tags: ["expectation", "dice", "order-statistics"],
    minutes: 3,
    title: "The larger of two dice",
    prompt: "Roll two fair six-sided dice and look at the larger of the two faces (if they tie, that common value). What is the expected value of this larger face?",
    answer: {
      type: "numeric",
      value: 161 / 36,
      exact: String.raw`\sum_{k=1}^{6}\left(1 - \left(\tfrac{k-1}{6}\right)^2\right) = 6 - \tfrac{55}{36} = \tfrac{161}{36} \approx 4.472`,
    },
    hints: [
      String.raw`It is easier to find $P(\max \le k)$ than $P(\max = k)$.`,
      String.raw`Both dice are at most $k$ with probability $(k/6)^2$. Turn that into $P(\max \ge k)$.`,
      String.raw`Use the tail sum $E[M] = \sum_{k=1}^{6} P(M \ge k) = \sum_{k=1}^{6}\left(1 - \left(\tfrac{k-1}{6}\right)^2\right)$.`,
    ],
    solution: String.raw`Let $M$ be the larger face. The maximum is at most $k$ exactly when both dice are at most $k$, so $P(M \le k) = \left(\frac{k}{6}\right)^2$, and therefore $P(M \ge k) = 1 - P(M \le k-1) = 1 - \left(\frac{k-1}{6}\right)^2$.

For a random variable taking values in $\{1, \dots, 6\}$, the tail-sum formula gives $E[M] = \sum_{k=1}^{6} P(M \ge k)$:
$E[M] = 6 - \frac{0 + 1 + 4 + 9 + 16 + 25}{36} = 6 - \frac{55}{36} = \frac{161}{36} \approx 4.472.$

Direct check: $P(M = k) = \frac{k^2 - (k-1)^2}{36} = \frac{2k-1}{36}$, so $E[M] = \frac{1 \cdot 1 + 2 \cdot 3 + 3 \cdot 5 + 4 \cdot 7 + 5 \cdot 9 + 6 \cdot 11}{36} = \frac{161}{36}$. Same answer.

The larger of two dice averages $\frac{161}{36} \approx 4.47$, well above the single-die mean of $3.5$.`,
    steps: [
      "Compute P(M <= k) = (k/6)^2.",
      "Convert to P(M >= k) = 1 - ((k - 1)/6)^2.",
      "Tail sum over k = 1..6.",
      "Cross-check with the pmf (2k - 1)/36.",
    ],
    keyIdea: "Maxima have easy cumulative probabilities; the tail-sum formula turns them straight into an expectation.",
    commonMistake: "Guessing 4 or 4.5 by symmetry, or summing P(M <= k) instead of P(M >= k).",
    fastPath: "6 minus (0 + 1 + 4 + 9 + 16 + 25)/36 = 6 - 55/36 = 4.47.",
    variation: "What is the expected smaller of the two faces?",
    variationAnswer: String.raw`Since $\max + \min = X + Y$, $E[\min] = 7 - \tfrac{161}{36} = \tfrac{91}{36} \approx 2.53$.`,
    family: "expected-max",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m4-p10",
    module: 4,
    kind: "practice",
    difficulty: 2,
    tags: ["order-statistics", "expectation"],
    minutes: 3,
    title: "Cheapest of five quotes",
    prompt: String.raw`You request quotes from five suppliers. Each quote is independently uniformly distributed between \$40 and \$60, and you buy from the cheapest. What is the expected price you pay, in dollars?`,
    answer: {
      type: "numeric",
      value: 130 / 3,
      exact: String.raw`40 + 20 \cdot \tfrac{1}{6} = \tfrac{130}{3} \approx 43.33`,
      unit: "dollars",
    },
    hints: [
      "Rescale: a quote is 40 + 20U with U uniform on [0, 1]. The cheapest quote is 40 + 20 times the smallest U.",
      "The smallest of n independent uniforms on [0, 1] has expectation 1/(n + 1).",
      "With n = 5 the minimum uniform averages 1/6; map back to dollars.",
    ],
    solution: String.raw`Write each quote as $Q_i = 40 + 20U_i$ where the $U_i$ are independent and uniform on $[0, 1]$. The cheapest quote is $40 + 20\min_i U_i$.

For the minimum of five uniforms, $P(\min U_i > u) = (1 - u)^5$, so by the tail integral
$E[\min U_i] = \int_0^1 (1 - u)^5\,du = \frac{1}{6}.$
This matches the general rule that the $k$-th smallest of $n$ uniforms has mean $\frac{k}{n+1}$; here $k = 1$ and $n = 5$. Intuitively, five random points split $[0, 1]$ into six exchangeable gaps, each averaging $\frac{1}{6}$, and the minimum is the first gap.

Therefore $E[\text{price}] = 40 + 20 \cdot \frac{1}{6} = 40 + \frac{10}{3} = \frac{130}{3} \approx 43.33$ dollars.`,
    steps: [
      "Standardise the quotes to 40 + 20U.",
      "E[min of n uniforms] = 1/(n + 1) = 1/6.",
      "Map back: 40 + 20/6.",
    ],
    keyIdea: "The minimum of n uniforms sits one gap in from the left, at 1/(n + 1) on average.",
    commonMistake: "Using 1/n = 1/5 instead of 1/(n + 1) = 1/6, or forgetting to rescale by the width 20.",
    fastPath: "Width 20 over 6 gaps is 3.33; add to 40 for 43.33.",
    variation: "Expected value of the second-cheapest quote?",
    variationAnswer: String.raw`$40 + 20 \cdot \tfrac{2}{6} = \tfrac{140}{3} \approx 46.67$ dollars.`,
    family: "order-statistics",
    verifiedBy: ["formula", "simulation"],
  },
  {
    id: "m4-p11",
    module: 4,
    kind: "practice",
    difficulty: 2,
    tags: ["linearity", "dice", "expectation"],
    minutes: 3,
    title: "Larger plus smaller",
    prompt: String.raw`Two fair six-sided dice are rolled. Let $M$ be the larger face and $m$ the smaller (equal if the dice tie). Without computing either expectation separately, which statement about $E[M] + E[m]$ is correct?`,
    answer: {
      type: "choice",
      options: [
        String.raw`$E[M] + E[m] = 7$ exactly, because $M + m = X + Y$ for every outcome.`,
        String.raw`$E[M] + E[m] > 7$, because the maximum gains more than the minimum loses.`,
        String.raw`$E[M] + E[m] < 7$, because tied rolls are counted only once.`,
        String.raw`$E[M] + E[m] = 7$, but only because the two dice are independent.`,
      ],
      correct: 0,
    },
    hints: [
      "Think about M + m for a single outcome, not about M and m separately.",
      "For any two numbers, the larger plus the smaller equals their sum.",
      "So M + m = X + Y pointwise, and linearity gives E[X] + E[Y] = 7, independent or not.",
    ],
    solution: String.raw`For any pair of numbers, the larger plus the smaller is just their sum: $\max(x, y) + \min(x, y) = x + y$. So for every roll, $M + m = X + Y$ where $X$ and $Y$ are the two faces. Two random variables that are equal outcome by outcome have the same expectation, so
$E[M] + E[m] = E[M + m] = E[X + Y] = E[X] + E[Y] = 3.5 + 3.5 = 7.$

No independence was used anywhere: linearity of expectation holds for dependent variables, and the pointwise identity $M + m = X + Y$ holds for any two dice, fair or not, independent or not. That rules out the last option. You can confirm the number: $E[M] = \frac{161}{36}$ and $E[m] = \frac{91}{36}$, which add to $\frac{252}{36} = 7$.

The second and third options describe real effects on $M$ and $m$ individually (the max is pulled up, the min pulled down), but these effects cancel exactly in the sum. The correct statement is the first one.`,
    steps: [
      "Note max + min = sum for any two numbers.",
      "So M + m = X + Y outcome by outcome.",
      "Apply linearity: E[X] + E[Y] = 7.",
      "Observe that no independence assumption was needed.",
    ],
    keyIdea: "A pointwise identity between random variables transfers directly to their expectations.",
    commonMistake: "Computing E[M] and E[m] separately and slipping in the arithmetic, or believing linearity requires independence.",
    fastPath: "max + min = sum, so the answer is 2 times 3.5 = 7 with no further work.",
    variation: String.raw`What is $E[M] - E[m]$?`,
    variationAnswer: String.raw`$E[M - m] = E|X - Y| = \tfrac{161 - 91}{36} = \tfrac{35}{18} \approx 1.94$.`,
    family: "linearity-of-expectation",
    verifiedBy: ["enumeration", "exhaustive-search"],
  },

  // ---------------------------------------------------------------- difficulty 3
  {
    id: "m4-p12",
    module: 4,
    kind: "practice",
    difficulty: 3,
    tags: ["coupon-collector", "expectation"],
    minutes: 4,
    title: "Six stamp designs",
    prompt: "A café loyalty card is complete when it carries all six stamp designs. On each visit the barista uses one of the six designs, chosen uniformly at random and independently of previous visits. What is the expected number of visits needed to complete the card?",
    answer: {
      type: "numeric",
      value: 6 * (1 + 1 / 2 + 1 / 3 + 1 / 4 + 1 / 5 + 1 / 6),
      exact: String.raw`6\left(1 + \tfrac{1}{2} + \tfrac{1}{3} + \tfrac{1}{4} + \tfrac{1}{5} + \tfrac{1}{6}\right) = \tfrac{147}{10} = 14.7`,
      unit: "visits",
    },
    hints: [
      "Split the wait into stages: the wait for the first new design, then for the second new design, and so on.",
      "When you already hold j designs, each visit gives a new one with probability (6 - j)/6. How long is that wait on average?",
      "Add the six geometric means 6/6 + 6/5 + 6/4 + 6/3 + 6/2 + 6/1.",
    ],
    solution: String.raw`Let $T$ be the number of visits to complete the card. Break $T$ into stages: $T = T_1 + T_2 + \cdots + T_6$, where $T_{j+1}$ is the number of visits needed to get a new design once you already hold $j$ distinct designs.

While you hold $j$ designs, each visit produces a new design with probability $\frac{6-j}{6}$, independently of the past. So $T_{j+1}$ is geometric with success probability $\frac{6-j}{6}$ and mean $\frac{6}{6-j}$.

By linearity,
$E[T] = \frac{6}{6} + \frac{6}{5} + \frac{6}{4} + \frac{6}{3} + \frac{6}{2} + \frac{6}{1} = 6\left(1 + \tfrac{1}{2} + \tfrac{1}{3} + \tfrac{1}{4} + \tfrac{1}{5} + \tfrac{1}{6}\right) = 6 \cdot \frac{49}{20} = \frac{147}{10}.$

Notice how uneven the stages are: the first visit always yields a new design (stage 1 costs exactly one visit), while the last design alone costs 6 visits on average. Answer: $14.7$ visits.`,
    steps: [
      "Decompose the wait into stages by number of designs held.",
      "Stage j + 1 is geometric with p = (6 - j)/6, mean 6/(6 - j).",
      "Sum the six means: 6 times H_6.",
      "Report 14.7.",
    ],
    keyIdea: "The coupon collector's wait is a sum of geometric stages with shrinking success probabilities.",
    commonMistake: "Answering 6 or 36, or summing 6/j only up to j = 5 and dropping the final 6/1 term.",
    fastPath: "H_6 = 2.45; times 6 is 14.7.",
    variation: "You already hold two of the six designs. Expected further visits to finish?",
    variationAnswer: String.raw`$\tfrac{6}{4} + \tfrac{6}{3} + \tfrac{6}{2} + \tfrac{6}{1} = 1.5 + 2 + 3 + 6 = 12.5$ visits.`,
    family: "coupon-collector",
    verifiedBy: ["recursion", "simulation"],
  },
  {
    id: "m4-p13",
    module: 4,
    kind: "practice",
    difficulty: 3,
    tags: ["linearity", "indicators", "cards"],
    minutes: 4,
    title: "Pricing a five-card hand",
    prompt: String.raw`You may pay to be dealt five cards from a well-shuffled standard 52-card deck. You then receive \$10 for every ace and \$1 for every heart in the hand; the ace of hearts earns both, \$11. How much would you pay to play, that is, what is the expected payout in dollars?`,
    answer: {
      type: "numeric",
      value: 265 / 52,
      exact: String.raw`5 \cdot \tfrac{4}{52} \cdot 10 + 5 \cdot \tfrac{13}{52} \cdot 1 = \tfrac{265}{52} \approx 5.096`,
      unit: "dollars",
    },
    hints: [
      "Split the payout into an ace part and a heart part, then split each part card by card.",
      "Each of the five card positions is equally likely to hold any of the 52 cards: P(ace) = 4/52, P(heart) = 13/52.",
      "Expected aces 5 times 4/52, expected hearts 5 times 13/52; combine with the payouts.",
    ],
    solution: String.raw`Write the payout as $W = 10A + H$, where $A$ is the number of aces and $H$ the number of hearts in the hand. Linearity gives $E[W] = 10\,E[A] + E[H]$, and the double payment for the ace of hearts is handled automatically because that card contributes to both $A$ and $H$.

For $A$, let $I_i = 1$ if the $i$-th card dealt is an ace. Each position is equally likely to hold any of the 52 cards, so $P(I_i = 1) = \frac{4}{52} = \frac{1}{13}$ and $E[A] = \frac{5}{13}$. The cards are drawn without replacement, so the $I_i$ are dependent, but linearity does not care.

Similarly each card is a heart with probability $\frac{13}{52} = \frac{1}{4}$, so $E[H] = \frac{5}{4}$.

Therefore
$E[W] = 10 \cdot \frac{5}{13} + \frac{5}{4} = \frac{50}{13} + \frac{5}{4} = \frac{200 + 65}{52} = \frac{265}{52} \approx 5.10.$

The fair price is $\frac{265}{52} \approx 5.10$ dollars; anything below that is a good deal for you.`,
    steps: [
      "Write payout = 10 (aces) + (hearts).",
      "Expected aces: 5 times 4/52.",
      "Expected hearts: 5 times 13/52.",
      "Combine: 50/13 + 5/4 = 265/52.",
    ],
    keyIdea: "Price a payout by splitting it into per-card indicators; drawing without replacement does not change the per-card probabilities.",
    commonMistake: "Subtracting something for the ace of hearts 'to avoid double counting' (it genuinely pays 11), or reaching for hypergeometric probabilities of the whole hand.",
    fastPath: "Per card the expected payout is 10/13 + 1/4 = 53/52; times 5 cards gives 265/52 = 5.10.",
    variation: "Same payouts, but you are dealt seven cards. Fair price?",
    variationAnswer: String.raw`$7 \cdot \tfrac{53}{52} = \tfrac{371}{52} \approx 7.13$ dollars.`,
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m4-p14",
    module: 4,
    kind: "practice",
    difficulty: 3,
    tags: ["indicators", "linearity", "cards"],
    minutes: 3,
    title: "Two decks, matching ranks",
    prompt: "Two standard 52-card decks are shuffled independently, and the cards are turned over in pairs: the top card of each deck, then the second cards, and so on through all 52 positions. A position is a 'rank match' if the two cards showing have the same rank (for example two kings; suits are irrelevant). What is the expected number of rank matches?",
    answer: { type: "numeric", value: 4, exact: String.raw`52 \cdot \tfrac{4}{52} = 4` },
    hints: [
      "Use an indicator for each of the 52 positions.",
      "Fix the card from deck one at a position. How many of the 52 cards in deck two share its rank, and how likely is one of them to sit at that position?",
      "Each position matches with probability 4/52; multiply by 52.",
    ],
    solution: String.raw`Let $I_k = 1$ if position $k$ is a rank match. The number of rank matches is $N = \sum_{k=1}^{52} I_k$.

Fix position $k$. Whatever card deck one shows there, deck two's card at that position is equally likely to be any of its 52 cards, and exactly 4 of them have the same rank. So $P(I_k = 1) = \frac{4}{52} = \frac{1}{13}$.

By linearity, $E[N] = 52 \cdot \frac{1}{13} = 4$.

This is a case where the expectation is a one-liner but the distribution is genuinely hard: the $I_k$ are dependent in an intricate way (each rank has four copies in each deck), and the exact probability of, say, zero rank matches requires serious combinatorics. Linearity sidesteps all of it. Answer: $4$ rank matches on average.`,
    steps: [
      "Indicator per position.",
      "P(rank match at a position) = 4/52.",
      "Sum 52 positions: 4.",
      "Notice the distribution would be hard; the mean is not.",
    ],
    keyIdea: "Expected matches = positions times the per-position matching probability, however messy the dependence.",
    commonMistake: "Answering 1 (the expected number of exact card matches) or 13 (the number of ranks).",
    fastPath: "52 positions, each matching with probability 1/13: 4.",
    variation: "Expected number of positions where the two cards are identical (same rank and same suit)?",
    variationAnswer: "52 times 1/52 = 1, the classic fixed-point count.",
    family: "fixed-points",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m4-p15",
    module: 4,
    kind: "practice",
    difficulty: 3,
    tags: ["indicators", "linearity", "coins"],
    minutes: 4,
    title: "Runs in twelve biased flips",
    prompt: "A coin lands heads with probability 0.3 and tails with probability 0.7. You flip it 12 times, the flips being independent. A 'run' is a maximal block of consecutive identical results, so the sequence HHTHTTT contains 4 runs. What is the expected number of runs in the 12 flips?",
    answer: {
      type: "numeric",
      value: 1 + 11 * 2 * 0.3 * 0.7,
      exact: String.raw`1 + 11 \cdot 2 \cdot 0.3 \cdot 0.7 = 1 + 11 \cdot 0.42 = \tfrac{281}{50} = 5.62`,
      unit: "runs",
    },
    hints: [
      "A new run starts exactly where two consecutive flips differ. The first flip always starts a run.",
      "Runs = 1 + (number of adjacent pairs that differ). How many adjacent pairs are there?",
      "Two consecutive flips differ with probability 2 times 0.3 times 0.7 = 0.42. Add 11 of these to 1.",
    ],
    solution: String.raw`A run begins at flip 1, and a new run begins at flip $i+1$ exactly when flip $i+1$ differs from flip $i$. So if $J_i = 1$ when flips $i$ and $i+1$ differ, the number of runs is
$R = 1 + \sum_{i=1}^{11} J_i.$

Two consecutive independent flips differ when the first is heads and the second tails or vice versa: $P(J_i = 1) = 0.3 \cdot 0.7 + 0.7 \cdot 0.3 = 0.42$.

By linearity, $E[R] = 1 + 11 \cdot 0.42 = 1 + 4.62 = 5.62 = \frac{281}{50}$.

A fair coin would give $1 + 11 \cdot 0.5 = 6.5$ runs; the bias makes long tail runs more common and reduces the count. Answer: $5.62$ runs.`,
    steps: [
      "Runs = 1 + number of changes between consecutive flips.",
      "Eleven adjacent pairs.",
      "P(change) = 2pq = 0.42.",
      "E[R] = 1 + 11 times 0.42 = 5.62.",
    ],
    keyIdea: "Count runs by counting the boundaries between them; each boundary is an indicator on a consecutive pair.",
    commonMistake: "Forgetting the +1 for the first run, or using 12 pairs instead of 11.",
    fastPath: "2pq = 0.42; eleven of them is 4.62; add 1 for the first run: 5.62.",
    variation: "Same 12 flips with a fair coin. Expected number of runs?",
    variationAnswer: String.raw`$1 + 11 \cdot \tfrac{1}{2} = 6.5$ runs.`,
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m4-p16",
    module: 4,
    kind: "practice",
    difficulty: 3,
    tags: ["coupon-collector", "linearity"],
    minutes: 4,
    title: "Eight of twelve stickers",
    prompt: "A sticker album has 12 different stickers. Each pack contains exactly one sticker, equally likely to be any of the 12 and independent of all other packs. You stop opening packs as soon as you own 8 distinct stickers. What is the expected number of packs you open?",
    answer: {
      type: "numeric",
      value: 12 * (1 / 12 + 1 / 11 + 1 / 10 + 1 / 9 + 1 / 8 + 1 / 7 + 1 / 6 + 1 / 5),
      exact: String.raw`\sum_{j=0}^{7} \tfrac{12}{12-j} = 12\left(\tfrac{1}{12} + \tfrac{1}{11} + \cdots + \tfrac{1}{5}\right) = \tfrac{28271}{2310} \approx 12.24`,
      unit: "packs",
    },
    hints: [
      "Only eight stages are needed, not twelve: stop decomposing once you hold 8 stickers.",
      "Holding j distinct stickers, a pack is new with probability (12 - j)/12, so that stage costs 12/(12 - j) packs on average.",
      "Add the stage means for j = 0, 1, ..., 7.",
    ],
    solution: String.raw`Let $T_{j+1}$ be the number of packs opened while you hold exactly $j$ distinct stickers, for $j = 0, 1, \dots, 7$. Then the total is $T = T_1 + \cdots + T_8$, and you never enter the stages for $j = 8, \dots, 11$.

While you hold $j$ stickers, a pack is new with probability $\frac{12-j}{12}$, so $T_{j+1}$ is geometric with mean $\frac{12}{12-j}$.

By linearity,
$E[T] = \sum_{j=0}^{7} \frac{12}{12-j} = \frac{12}{12} + \frac{12}{11} + \frac{12}{10} + \frac{12}{9} + \frac{12}{8} + \frac{12}{7} + \frac{12}{6} + \frac{12}{5}.$
Numerically: $1 + 1.0909 + 1.2 + 1.3333 + 1.5 + 1.7143 + 2 + 2.4 = 12.2385$. As a fraction, $E[T] = \frac{28271}{2310}$.

Compare with the full album: $12H_{12} \approx 37.2$ packs. The last four stickers cost twice as much as the first eight. Answer: $\frac{28271}{2310} \approx 12.24$ packs.`,
    steps: [
      "Decompose into stages j = 0..7 (stop at 8 stickers).",
      "Stage mean 12/(12 - j).",
      "Add eight terms.",
      "Report about 12.24 packs.",
    ],
    keyIdea: "Partial collection is the same geometric-stage sum, truncated at the number of distinct items you actually want.",
    commonMistake: "Summing all twelve stages (the full-album 37.2), or summing 12/j for j = 1..8 instead of 12/(12 - j) for j = 0..7.",
    fastPath: "Stage means 1, 1.09, 1.2, 1.33, 1.5, 1.71, 2, 2.4; total about 12.24.",
    variation: "Expected packs to complete the whole album of 12?",
    variationAnswer: String.raw`$12H_{12} = 12\left(1 + \tfrac{1}{2} + \cdots + \tfrac{1}{12}\right) \approx 37.24$ packs.`,
    family: "coupon-collector",
    verifiedBy: ["recursion", "simulation"],
  },
  {
    id: "m4-p17",
    module: 4,
    kind: "practice",
    difficulty: 3,
    tags: ["expectation", "dice", "order-statistics"],
    minutes: 4,
    title: "Highest of three dice",
    prompt: "A game rolls three fair six-sided dice and pays you the highest face showing, in dollars. What is the fair price to play?",
    answer: {
      type: "numeric",
      value: 119 / 24,
      exact: String.raw`\sum_{k=1}^{6}\left(1 - \left(\tfrac{k-1}{6}\right)^3\right) = 6 - \tfrac{225}{216} = \tfrac{119}{24} \approx 4.958`,
      unit: "dollars",
    },
    hints: [
      "P(max <= k) is a product of three identical factors.",
      "P(max >= k) = 1 - ((k - 1)/6)^3.",
      "Sum P(max >= k) over k = 1 to 6: that sum equals the expectation.",
    ],
    solution: String.raw`Let $M$ be the highest face. All three dice are at most $k$ with probability $\left(\frac{k}{6}\right)^3$, so $P(M \ge k) = 1 - \left(\frac{k-1}{6}\right)^3$.

The tail-sum formula for a variable on $\{1, \dots, 6\}$ gives
$E[M] = \sum_{k=1}^{6} P(M \ge k) = 6 - \frac{0^3 + 1^3 + 2^3 + 3^3 + 4^3 + 5^3}{216} = 6 - \frac{225}{216} = \frac{1071}{216} = \frac{119}{24}.$

As a check by the pmf, $P(M = k) = \frac{k^3 - (k-1)^3}{216}$, which is $\frac{1}{216}, \frac{7}{216}, \frac{19}{216}, \frac{37}{216}, \frac{61}{216}, \frac{91}{216}$, and $\frac{1 + 14 + 57 + 148 + 305 + 546}{216} = \frac{1071}{216}$ again.

The fair price is $\frac{119}{24} \approx 4.96$ dollars, just under 5: with three dice a 5 or a 6 shows most of the time.`,
    steps: [
      "P(M <= k) = (k/6)^3.",
      "P(M >= k) = 1 - ((k - 1)/6)^3.",
      "Tail sum: 6 - (sum of cubes 0..5)/216.",
      "Simplify 1071/216 to 119/24.",
    ],
    keyIdea: "For a maximum, sum the tails 1 - ((k - 1)/6)^n; the cumulative probabilities are products.",
    commonMistake: "Summing the cubes 1 to 6 instead of 0 to 5, or forgetting that the k = 1 term equals 1.",
    fastPath: "Sum of cubes 0..5 is 225; 6 - 225/216 = 6 - 1.042 = 4.958.",
    variation: "Instead you are paid the lowest of the three faces. Fair price?",
    variationAnswer: String.raw`By the symmetry $k \to 7 - k$, $E[\min] = 7 - \tfrac{119}{24} = \tfrac{49}{24} \approx 2.04$ dollars.`,
    family: "expected-max",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m4-p18",
    module: 4,
    kind: "practice",
    difficulty: 3,
    tags: ["order-statistics", "expectation"],
    minutes: 3,
    title: "Third smallest of seven uniforms",
    prompt: String.raw`Seven numbers are drawn independently and uniformly from the interval $[0, 1]$ and sorted. What is the expected value of the third smallest?`,
    answer: { type: "numeric", value: 3 / 8, exact: String.raw`\tfrac{3}{7 + 1} = \tfrac{3}{8} = 0.375` },
    hints: [
      "Seven random points cut [0, 1] into eight gaps.",
      "By symmetry all eight gaps have the same expected length.",
      "The third smallest point is the sum of the first three gaps.",
    ],
    solution: String.raw`Sort the seven draws as $U_{(1)} < U_{(2)} < \cdots < U_{(7)}$. Together with the endpoints $0$ and $1$ they cut the interval into eight gaps $G_1, \dots, G_8$ with $G_1 + \cdots + G_8 = 1$.

The joint distribution of the gaps is symmetric under any permutation of the gaps (relabelling which gap is which does not change the uniform measure on the seven points), so every gap has the same expectation, and since they sum to 1, $E[G_i] = \frac{1}{8}$.

The third smallest point is $U_{(3)} = G_1 + G_2 + G_3$, so by linearity $E[U_{(3)}] = \frac{3}{8}$.

The same result follows from the density of $U_{(k)}$, which is Beta$(k, n+1-k)$ with mean $\frac{k}{n+1}$; here $k = 3$ and $n = 7$. Answer: $\frac{3}{8} = 0.375$.`,
    steps: [
      "Seven points make eight exchangeable gaps.",
      "Each gap has mean 1/8.",
      "Third smallest = sum of three gaps = 3/8.",
    ],
    keyIdea: "The k-th smallest of n uniforms is k gaps from the left, each gap averaging 1/(n + 1).",
    commonMistake: "Using k/n = 3/7, or counting seven gaps instead of eight.",
    fastPath: "k/(n + 1) = 3/8.",
    variation: "Expected value of the second largest of the seven?",
    variationAnswer: String.raw`The second largest is the 6th smallest: $\tfrac{6}{8} = \tfrac{3}{4}$.`,
    family: "order-statistics",
    verifiedBy: ["formula", "simulation"],
  },
  {
    id: "m4-p19",
    module: 4,
    kind: "practice",
    difficulty: 3,
    tags: ["order-statistics", "linearity"],
    minutes: 3,
    title: "Spread of five uniforms",
    prompt: String.raw`Five numbers are drawn independently and uniformly from $[0, 1]$. What is the expected value of the range, that is, the largest draw minus the smallest?`,
    answer: { type: "numeric", value: 2 / 3, exact: String.raw`\tfrac{5}{6} - \tfrac{1}{6} = \tfrac{2}{3}` },
    hints: [
      "Range = max - min; use linearity on the two order statistics.",
      "Five points make six exchangeable gaps; the min is one gap and the max is five gaps from the left.",
      "E[max] - E[min] = 5/6 - 1/6.",
    ],
    solution: String.raw`Let the sorted draws be $U_{(1)} < \cdots < U_{(5)}$. The range is $R = U_{(5)} - U_{(1)}$, and by linearity $E[R] = E[U_{(5)}] - E[U_{(1)}]$. The two order statistics are dependent, but that is irrelevant for the expectation of their difference.

Five points cut $[0, 1]$ into six gaps that are exchangeable, so each has mean $\frac{1}{6}$. The minimum is the first gap, $E[U_{(1)}] = \frac{1}{6}$, and the maximum is the first five gaps, $E[U_{(5)}] = \frac{5}{6}$.

Hence $E[R] = \frac{5}{6} - \frac{1}{6} = \frac{4}{6} = \frac{2}{3}$. Equivalently, the range is the total length minus the two end gaps: $1 - 2 \cdot \frac{1}{6}$.

In general the expected range of $n$ uniforms is $\frac{n-1}{n+1}$, which approaches 1 slowly: even ten points leave an average of $\frac{2}{11}$ uncovered at the ends. Answer: $\frac{2}{3}$.`,
    steps: [
      "Range = max - min; take expectations separately.",
      "Six exchangeable gaps, each mean 1/6.",
      "E[max] = 5/6, E[min] = 1/6.",
      "Difference 2/3.",
    ],
    keyIdea: "The expected range is 1 minus the two end gaps, (n - 1)/(n + 1).",
    commonMistake: "Assuming the range of five points averages near 1, or using 1/5 for the end gaps.",
    fastPath: "1 - 2/(n + 1) = 1 - 2/6 = 2/3.",
    variation: "Expected range of just two uniforms, i.e. E|U - V|?",
    variationAnswer: String.raw`$\tfrac{2 - 1}{2 + 1} = \tfrac{1}{3}$.`,
    family: "order-statistics",
    verifiedBy: ["formula", "simulation"],
  },
  {
    id: "m4-p20",
    module: 4,
    kind: "practice",
    difficulty: 3,
    tags: ["expectation", "conditional", "coins"],
    minutes: 3,
    title: "A drawer with a trick coin",
    prompt: "A drawer holds three coins: two are fair and one has heads on both sides. You pick one coin uniformly at random and flip it four times. What is the expected number of heads?",
    answer: {
      type: "numeric",
      value: 8 / 3,
      exact: String.raw`\tfrac{2}{3} \cdot 2 + \tfrac{1}{3} \cdot 4 = \tfrac{8}{3} \approx 2.667`,
      unit: "heads",
    },
    hints: [
      "Condition on which coin you picked.",
      "Given a fair coin, the expected number of heads in four flips is 2; given the two-headed coin it is 4.",
      "Weight the two conditional expectations by the probabilities 2/3 and 1/3.",
    ],
    solution: String.raw`Let $H$ be the number of heads. Conditioning on the type of coin picked,
$E[H] = E[H \mid \text{fair}]\,P(\text{fair}) + E[H \mid \text{two-headed}]\,P(\text{two-headed}).$

Given a fair coin, each of four flips is heads with probability $\frac{1}{2}$, so $E[H \mid \text{fair}] = 2$. Given the two-headed coin, every flip is heads, so $E[H \mid \text{two-headed}] = 4$. The coin is fair with probability $\frac{2}{3}$.

Therefore $E[H] = 2 \cdot \frac{2}{3} + 4 \cdot \frac{1}{3} = \frac{4}{3} + \frac{4}{3} = \frac{8}{3} \approx 2.67$.

Alternative by linearity: a single flip of the randomly chosen coin is heads with probability $\frac{2}{3} \cdot \frac{1}{2} + \frac{1}{3} \cdot 1 = \frac{2}{3}$, and four flips give $4 \cdot \frac{2}{3} = \frac{8}{3}$. The four flips are dependent (they share the same coin), but linearity does not need independence. Answer: $\frac{8}{3}$ heads.`,
    steps: [
      "Split by the coin picked.",
      "E[H | fair] = 2, E[H | two-headed] = 4.",
      "Weight by 2/3 and 1/3.",
      "Cross-check: 4 flips times P(heads) = 2/3.",
    ],
    keyIdea: "E[X] is the case-weighted average of the conditional expectations; or find one flip's unconditional heads probability and use linearity.",
    commonMistake: "Treating the four flips as independent fair flips, or forgetting that a fair coin still averages 2 heads.",
    fastPath: "Average of 2, 2 and 4 over the three equally likely coins is 8/3.",
    variation: "Instead you return the coin and draw a fresh random coin before every flip. Does the expected number of heads change?",
    variationAnswer: "No: each flip is still heads with probability 2/3, so the expectation stays 8/3; only the variance drops because the flips become independent.",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m4-p21",
    module: 4,
    kind: "practice",
    difficulty: 3,
    tags: ["linearity", "independence"],
    minutes: 3,
    title: "Does the sum need independence?",
    prompt: String.raw`Asset X gains 1 with probability 0.6 and loses 1 otherwise, so $E[X] = 0.2$. Asset Y gains 2 with probability 0.5 and loses 1 otherwise, so $E[Y] = 0.5$. You do not know how X and Y depend on each other. Which statement about $E[X + Y]$ is correct?`,
    answer: {
      type: "choice",
      options: [
        String.raw`$E[X + Y] = 0.7$ whatever the dependence between X and Y.`,
        String.raw`$E[X + Y] = 0.7$ only if X and Y are independent.`,
        String.raw`$E[X + Y]$ cannot be determined without the joint distribution.`,
        String.raw`$E[X + Y]$ exceeds 0.7 when X and Y are positively correlated.`,
      ],
      correct: 0,
    },
    hints: [
      "Write out E[X + Y] as a sum over the four possible (x, y) pairs with their joint probabilities.",
      "Group the terms containing x and the terms containing y separately.",
      "The x-terms only involve the marginal of X and the y-terms only the marginal of Y.",
    ],
    solution: String.raw`Let $p_{xy} = P(X = x, Y = y)$. Then
$E[X + Y] = \sum_{x,y} (x + y)\,p_{xy} = \sum_x x \sum_y p_{xy} + \sum_y y \sum_x p_{xy} = \sum_x x\,P(X = x) + \sum_y y\,P(Y = y) = E[X] + E[Y].$
The inner sums collapse to the marginal distributions no matter how the joint probabilities are arranged. So $E[X + Y] = 0.2 + 0.5 = 0.7$ for every possible dependence structure.

Concretely, the joint distribution has one free parameter $t = P(X = 1, Y = 2)$, which can be anything from $0.1$ to $0.5$. Perfectly positive dependence ($t = 0.5$), independence ($t = 0.3$) and perfectly negative dependence ($t = 0.1$) all give $E[X + Y] = 0.7$.

What dependence does change is the spread of $X + Y$ and quantities like $E[XY]$: here $E[XY] = 6t - 1.7$ ranges from $-1.1$ to $1.3$. The expectation of a sum is the one thing that never needs independence. The correct statement is the first.`,
    steps: [
      "Expand E[X + Y] over the joint distribution.",
      "Separate the x-sum and the y-sum.",
      "Each collapses to a marginal expectation.",
      "Conclude 0.7 for every coupling.",
    ],
    keyIdea: "Linearity of expectation is an identity about marginals; the joint distribution never enters.",
    commonMistake: "Confusing linearity (always true) with E[XY] = E[X]E[Y] or Var(X + Y) = Var X + Var Y, which do need independence or zero covariance.",
    fastPath: "E[X + Y] = E[X] + E[Y] always; 0.2 + 0.5 = 0.7.",
    variation: "Is E[XY] determined by the information given?",
    variationAnswer: String.raw`No. With $t = P(X = 1, Y = 2)$, $E[XY] = 6t - 1.7$, which ranges from $-1.1$ to $1.3$; independence gives $E[X]E[Y] = 0.1$.`,
    family: "linearity-of-expectation",
    verifiedBy: ["exhaustive-search", "formula"],
  },

  // ---------------------------------------------------------------- difficulty 4
  {
    id: "m4-p22",
    module: 4,
    kind: "practice",
    difficulty: 4,
    tags: ["indicators", "linearity", "symmetry"],
    minutes: 5,
    title: "New highs in a random order",
    prompt: "Eight quarterly profit figures, all different, are read out in a uniformly random order. A figure is a 'new high' if it is larger than every figure read before it; the first figure always counts. What is the expected number of new highs?",
    answer: {
      type: "numeric",
      value: 1 + 1 / 2 + 1 / 3 + 1 / 4 + 1 / 5 + 1 / 6 + 1 / 7 + 1 / 8,
      exact: String.raw`H_8 = 1 + \tfrac{1}{2} + \cdots + \tfrac{1}{8} = \tfrac{761}{280} \approx 2.718`,
    },
    hints: [
      "Use an indicator for each position: is the i-th figure read a new high?",
      "The i-th figure is a new high exactly when it is the largest of the first i figures. By symmetry, where does the largest of the first i sit?",
      "P(position i is a new high) = 1/i. Add 1/1 + 1/2 + ... + 1/8.",
    ],
    solution: String.raw`Let $I_i = 1$ if the $i$-th figure read is a new high. The number of new highs is $N = I_1 + \cdots + I_8$.

The $i$-th figure is a new high exactly when it is the largest among the first $i$ figures. In a uniformly random order the largest of those $i$ figures is equally likely to be in any of the $i$ positions, so $P(I_i = 1) = \frac{1}{i}$. This does not depend on the values themselves, only on their being distinct.

By linearity,
$E[N] = \sum_{i=1}^{8} \frac{1}{i} = 1 + \frac{1}{2} + \frac{1}{3} + \frac{1}{4} + \frac{1}{5} + \frac{1}{6} + \frac{1}{7} + \frac{1}{8} = \frac{761}{280} \approx 2.718.$

The indicators happen to be independent here (whether position $i$ is a record depends only on the relative order within the first $i$ figures, which is independent of the relative orders that decide later positions), but we never needed that. The growth is logarithmic: with $n$ figures the expected number of records is $H_n \approx \ln n + 0.577$, so even 1000 figures produce only about 7.5 new highs. Answer: $\frac{761}{280} \approx 2.72$.`,
    steps: [
      "Indicator per position for 'new high'.",
      "Position i is a record iff it holds the max of the first i: probability 1/i.",
      "Sum the harmonic series to 8.",
      "Report 761/280.",
    ],
    keyIdea: "The i-th item in a random order is a running maximum with probability exactly 1/i.",
    commonMistake: "Assuming each position is a record with the same probability, such as 1/8 for all i.",
    fastPath: "H_8 = 2.718, almost e by coincidence.",
    variation: "With 100 figures, roughly how many new highs?",
    variationAnswer: String.raw`$H_{100} \approx \ln 100 + 0.577 + \tfrac{1}{200} \approx 5.19$.`,
    family: "linearity-of-expectation",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m4-p23",
    module: 4,
    kind: "practice",
    difficulty: 4,
    tags: ["indicators", "linearity", "symmetry"],
    minutes: 5,
    title: "Mixed pairs around a table",
    prompt: "Five traders and five analysts sit at a round table with ten seats, every seating arrangement being equally likely. Two people in neighbouring seats form a 'mixed pair' if one is a trader and the other an analyst. Counting all ten neighbouring pairs around the table, what is the expected number of mixed pairs?",
    answer: {
      type: "numeric",
      value: 50 / 9,
      exact: String.raw`10 \cdot \tfrac{2 \cdot 5 \cdot 5}{10 \cdot 9} = \tfrac{50}{9} \approx 5.556`,
    },
    hints: [
      "A round table of ten has ten neighbouring pairs. Give each one an indicator.",
      "Pick a pair of neighbouring seats. The two occupants are two people drawn without replacement from 5 traders and 5 analysts.",
      "P(mixed) = 2 (5/10)(5/9) = 5/9; multiply by ten pairs.",
    ],
    solution: String.raw`Around a circle of ten seats there are exactly ten neighbouring pairs (seats 1-2, 2-3, ..., 9-10, 10-1). Let $I_k = 1$ if pair $k$ is mixed. The number of mixed pairs is $N = \sum_{k=1}^{10} I_k$.

Fix one pair of neighbouring seats. Its two occupants are a random pair of people, equivalent to drawing two people without replacement from the ten. The pair is mixed if the first drawn is a trader and the second an analyst, probability $\frac{5}{10} \cdot \frac{5}{9}$, or the reverse, with the same probability. So $P(I_k = 1) = 2 \cdot \frac{5}{10} \cdot \frac{5}{9} = \frac{5}{9}$.

By linearity, $E[N] = 10 \cdot \frac{5}{9} = \frac{50}{9} \approx 5.56$.

The indicators are dependent (adjacent pairs share a person, and the fixed counts of five and five constrain everything), and the exact distribution of $N$ is awkward. The expectation is not. Note also that the answer is a little more than $5$, which is what independent coin-flip occupants would give; sampling without replacement makes neighbours slightly more likely to differ. Answer: $\frac{50}{9}$.`,
    steps: [
      "Ten neighbouring pairs on a circle of ten.",
      "Occupants of a pair are two draws without replacement.",
      "P(mixed) = 2 (5/10)(5/9) = 5/9.",
      "Multiply by 10.",
    ],
    keyIdea: "On a circle there are n neighbouring pairs; each is mixed with the without-replacement probability 2 (a/n)(b/(n - 1)).",
    commonMistake: "Using nine pairs (a row, not a circle) or P(mixed) = 1/2 as if neighbours were independent fair coins.",
    fastPath: "10 pairs times 2 (1/2)(5/9) = 10 times 5/9 = 5.56.",
    variation: "Same ten people seated at random in a straight row of ten seats. Expected number of mixed neighbouring pairs?",
    variationAnswer: String.raw`Nine pairs now: $9 \cdot \tfrac{5}{9} = 5$.`,
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m4-p24",
    module: 4,
    kind: "practice",
    difficulty: 4,
    tags: ["expectation", "dice", "birthday"],
    minutes: 6,
    title: "Rolling until a face repeats",
    prompt: "You roll a fair six-sided die repeatedly and stop at the first roll whose face has already appeared earlier. Counting that final roll, what is the expected number of rolls?",
    answer: {
      type: "numeric",
      value: 1223 / 324,
      exact: String.raw`\sum_{k=0}^{6} \tfrac{6!/(6-k)!}{6^k} = 2 + \tfrac{5}{6} + \tfrac{5}{9} + \tfrac{5}{18} + \tfrac{5}{54} + \tfrac{5}{324} = \tfrac{1223}{324} \approx 3.775`,
      unit: "rolls",
    },
    hints: [
      "P(T > k) is the probability that the first k rolls are all different. That is a birthday-style product.",
      "P(T > k) = (6/6)(5/6)(4/6)...((6 - k + 1)/6), and it is zero once k > 6.",
      "Use E[T] = sum over k >= 0 of P(T > k) and add the seven non-zero terms.",
    ],
    solution: String.raw`Let $T$ be the number of rolls, including the repeat. The process lasts beyond roll $k$ exactly when the first $k$ faces are all distinct, so
$P(T > k) = \frac{6}{6} \cdot \frac{5}{6} \cdot \frac{4}{6} \cdots \frac{6-k+1}{6} = \frac{6!/(6-k)!}{6^k}, \qquad k = 0, 1, \dots, 6,$
and $P(T > k) = 0$ for $k \ge 7$, since seven rolls must contain a repeat.

For a non-negative integer variable, $E[T] = \sum_{k \ge 0} P(T > k)$. The terms are $1, 1, \frac{5}{6}, \frac{5}{9}, \frac{5}{18}, \frac{5}{54}, \frac{5}{324}$, so
$E[T] = 2 + \frac{270 + 180 + 90 + 30 + 5}{324} = 2 + \frac{575}{324} = \frac{1223}{324} \approx 3.775.$

Check via the pmf: $P(T = t) = P(T > t-1) \cdot \frac{t-1}{6}$ gives $\frac{54}{324}, \frac{90}{324}, \frac{90}{324}, \frac{60}{324}, \frac{25}{324}, \frac{5}{324}$ for $t = 2, \dots, 7$, and $\sum t\,P(T = t) = \frac{1223}{324}$ as well.

So a repeat arrives on average just before the fourth roll: $\frac{1223}{324} \approx 3.77$ rolls.`,
    steps: [
      "Identify P(T > k) = probability the first k rolls are distinct.",
      "Compute the falling-factorial products for k = 0..6.",
      "Tail sum E[T] = sum of P(T > k).",
      "Cross-check with the pmf.",
    ],
    keyIdea: "Waiting for the first collision has an easy survival function, so the tail sum is the natural route.",
    commonMistake: "Starting the tail sum at k = 1 and losing the leading 1, or stopping the product at k = 5 and dropping the 5/324 term.",
    fastPath: "Terms 1, 1, 0.833, 0.556, 0.278, 0.093, 0.015; total 3.77.",
    variation: "Same rule with a fair 20-sided die. Expected number of rolls?",
    variationAnswer: String.raw`$\sum_{k=0}^{20} \tfrac{20!/(20-k)!}{20^k} \approx 6.29$ rolls, on the birthday scale $\sqrt{\pi n/2}$ plus a little.`,
    verifiedBy: ["enumeration", "formula", "simulation"],
  },
  {
    id: "m4-p25",
    module: 4,
    kind: "practice",
    difficulty: 4,
    tags: ["coupon-collector", "inclusion-exclusion"],
    minutes: 7,
    title: "Three figurines, unequal odds",
    prompt: "A capsule machine dispenses one figurine per coin: type A with probability 1/2, type B with probability 1/3 and type C with probability 1/6, independently each time. What is the expected number of coins needed to own at least one figurine of each of the three types?",
    answer: {
      type: "numeric",
      value: 73 / 10,
      exact: String.raw`(2 + 3 + 6) - \left(\tfrac{6}{5} + \tfrac{3}{2} + 2\right) + 1 = \tfrac{73}{10} = 7.3`,
      unit: "coins",
    },
    hints: [
      "Let T_A, T_B, T_C be the coin on which each type first appears. You need max(T_A, T_B, T_C), and a maximum has an inclusion-exclusion form.",
      "max(a, b, c) = a + b + c - min(a, b) - min(a, c) - min(b, c) + min(a, b, c). What is the distribution of min(T_A, T_B)?",
      "The first appearance of 'A or B' is geometric with probability 1/2 + 1/3 = 5/6, so E[min(T_A, T_B)] = 6/5. Fill in the other minima.",
    ],
    solution: String.raw`Let $T_A$, $T_B$, $T_C$ be the coin numbers on which types A, B, C first appear. The collection is complete at $T = \max(T_A, T_B, T_C)$. The stage-by-stage decomposition used for equal probabilities breaks down here, because the success probability of a stage depends on which types you already hold.

Instead use the identity, valid for any three numbers,
$\max(a,b,c) = a + b + c - \min(a,b) - \min(a,c) - \min(b,c) + \min(a,b,c),$
and take expectations. Each $T_i$ is geometric with mean $1/p_i$: $E[T_A] = 2$, $E[T_B] = 3$, $E[T_C] = 6$.

$\min(T_A, T_B)$ is the first coin producing A or B, which happens with probability $\frac{1}{2} + \frac{1}{3} = \frac{5}{6}$ per coin, so $E[\min(T_A, T_B)] = \frac{6}{5}$. Likewise $E[\min(T_A, T_C)] = \frac{1}{1/2 + 1/6} = \frac{3}{2}$, $E[\min(T_B, T_C)] = \frac{1}{1/3 + 1/6} = 2$, and $E[\min(T_A, T_B, T_C)] = 1$, since the first coin always produces something.

Therefore
$E[T] = (2 + 3 + 6) - \left(\tfrac{6}{5} + \tfrac{3}{2} + 2\right) + 1 = 11 - 4.7 + 1 = 7.3 = \tfrac{73}{10}.$

For comparison, three equally likely types would need $3H_3 = 5.5$ coins; the rare type C drags the mean up. Answer: $7.3$ coins.`,
    steps: [
      "Express completion time as the max of three first-appearance times.",
      "Expand the max by inclusion-exclusion into sums of minima.",
      "Each minimum is geometric with the probabilities added.",
      "Combine: 11 - 4.7 + 1 = 7.3.",
    ],
    keyIdea: "A maximum of waiting times is an inclusion-exclusion sum of minima, and a minimum of geometric waits is geometric with the probabilities added.",
    commonMistake: "Reusing the equal-probability stage formula, or forgetting the final + E[min of all three] = 1 term.",
    fastPath: "Sum of 1/p: 11. Pairs: 1.2 + 1.5 + 2 = 4.7. Triple: 1. Total 7.3.",
    variation: "Types with probabilities 1/2, 1/4, 1/4. Expected coins?",
    variationAnswer: String.raw`$(2 + 4 + 4) - \left(\tfrac{4}{3} + \tfrac{4}{3} + 2\right) + 1 = \tfrac{19}{3} \approx 6.33$ coins.`,
    family: "coupon-collector",
    verifiedBy: ["recursion", "simulation"],
  },
  {
    id: "m4-p26",
    module: 4,
    kind: "practice",
    difficulty: 4,
    tags: ["expectation", "symmetry", "indicators"],
    minutes: 5,
    title: "Reading until the first internal candidate",
    prompt: "A recruiter has a stack of 8 résumés in uniformly random order: 3 from internal candidates and 5 from external ones. She reads from the top and stops at the first internal candidate. Counting that résumé, what is the expected number she reads?",
    answer: { type: "numeric", value: 9 / 4, exact: String.raw`1 + 5 \cdot \tfrac{1}{4} = \tfrac{9}{4} = 2.25`, unit: "résumés" },
    hints: [
      "The count equals 1 plus the number of external résumés that sit above every internal one.",
      "For a given external résumé, consider its position among itself and the three internal résumés. By symmetry, where is it?",
      "Each external résumé precedes all three internal ones with probability 1/4; there are five of them.",
    ],
    solution: String.raw`Let $N$ be the number read. Then $N = 1 + K$, where $K$ is the number of external résumés that appear before the first internal one, that is, before all three internal résumés.

For a specific external résumé, look only at the relative order of the four items consisting of it and the three internal résumés. All $4!$ relative orders are equally likely, so it comes first among the four with probability $\frac{1}{4}$. With indicator $J_e$ for 'external $e$ precedes all internals', $E[K] = \sum_{e=1}^{5} E[J_e] = \frac{5}{4}$, the dependence between the $J_e$ notwithstanding.

So $E[N] = 1 + \frac{5}{4} = \frac{9}{4}$.

Tail-sum check: $P(N \ge k)$ is the probability that the first $k-1$ résumés are all external, $\binom{5}{k-1}/\binom{8}{k-1}$. Summing for $k = 1, \dots, 6$: $1 + \frac{5}{8} + \frac{10}{28} + \frac{10}{56} + \frac{5}{70} + \frac{1}{56} = \frac{9}{4}$. Same answer.

In general, with $b$ special items among $n$, the first special item appears at expected position $\frac{n+1}{b+1}$: here $\frac{9}{4} = 2.25$.`,
    steps: [
      "Write the count as 1 plus the externals ahead of every internal.",
      "Each external is first among itself and the 3 internals with probability 1/4.",
      "Add five indicators: 5/4.",
      "Total 9/4; confirm with the tail sum.",
    ],
    keyIdea: "Position of the first special item: each ordinary item sits ahead of all b special items with probability 1/(b + 1).",
    commonMistake: "Treating the draws as independent with probability 3/8 each (the geometric answer 8/3), ignoring sampling without replacement.",
    fastPath: "(n + 1)/(b + 1) = 9/4 = 2.25.",
    variation: "Expected position of the last internal résumé in the stack?",
    variationAnswer: String.raw`By the mirror symmetry of reading from the bottom, $9 - \tfrac{9}{4} = \tfrac{27}{4} = 6.75$.`,
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m4-p27",
    module: 4,
    kind: "practice",
    difficulty: 4,
    tags: ["expectation", "dice", "order-statistics"],
    minutes: 6,
    title: "High minus low on three dice",
    prompt: "Roll three fair six-sided dice. A game pays you the highest face minus the lowest face, in dollars (zero if all three match). What is the fair price to play?",
    answer: {
      type: "numeric",
      value: 35 / 12,
      exact: String.raw`\tfrac{119}{24} - \tfrac{49}{24} = \tfrac{70}{24} = \tfrac{35}{12} \approx 2.917`,
      unit: "dollars",
    },
    hints: [
      "Spread = max - min. Linearity lets you handle the two pieces separately even though they are dependent.",
      "E[max] = sum of P(max >= k) = 6 - (0^3 + ... + 5^3)/216. For the min, P(min >= k) = ((7 - k)/6)^3.",
      "E[min] = (6^3 + 5^3 + ... + 1^3)/216 = 441/216; subtract from E[max] = 1071/216.",
    ],
    solution: String.raw`Let $M$ and $m$ be the highest and lowest faces. The payout is $M - m$, and by linearity $E[M - m] = E[M] - E[m]$; the two are strongly dependent but that does not matter.

For the maximum, $P(M \ge k) = 1 - \left(\frac{k-1}{6}\right)^3$, and the tail sum gives
$E[M] = 6 - \frac{0 + 1 + 8 + 27 + 64 + 125}{216} = 6 - \frac{225}{216} = \frac{1071}{216} = \frac{119}{24}.$

For the minimum, all three dice are at least $k$ with probability $\left(\frac{7-k}{6}\right)^3$, so
$E[m] = \sum_{k=1}^{6} \left(\frac{7-k}{6}\right)^3 = \frac{216 + 125 + 64 + 27 + 8 + 1}{216} = \frac{441}{216} = \frac{49}{24}.$
(Alternatively $E[m] = 7 - E[M]$ by the symmetry that swaps each face $k$ with $7 - k$.)

The fair price is $E[M] - E[m] = \frac{119 - 49}{24} = \frac{70}{24} = \frac{35}{12} \approx 2.92$ dollars.`,
    steps: [
      "Payout = max - min; use linearity.",
      "Tail sum for E[max] = 119/24.",
      "Tail sum (or symmetry 7 - E[max]) for E[min] = 49/24.",
      "Subtract: 35/12.",
    ],
    keyIdea: "A spread is max minus min; compute each order statistic by its own tail sum and subtract.",
    commonMistake: "Trying to find the distribution of the spread directly, or forgetting the mirror symmetry E[min] = 7 - E[max] that saves half the work.",
    fastPath: "E[max] = 4.958 and E[min] = 7 - 4.958 = 2.042; difference 2.917.",
    variation: "Same payout with two dice instead of three. Fair price?",
    variationAnswer: String.raw`$E|X - Y| = \tfrac{35}{18} \approx 1.94$ dollars.`,
    family: "expected-max",
    verifiedBy: ["enumeration", "simulation"],
  },

  // ---------------------------------------------------------------- difficulty 5
  {
    id: "m4-p28",
    module: 4,
    kind: "practice",
    difficulty: 5,
    tags: ["expectation", "order-statistics", "symmetry"],
    minutes: 7,
    title: "Particles clearing a tube",
    prompt: "Five point particles are placed at independent uniformly random positions inside a straight tube of length 1 metre. Each particle independently starts moving left or right with equal probability, at speed 1 metre per second. When two particles meet they bounce off each other and both reverse direction instantly; a particle reaching either end of the tube leaves it for good. What is the expected time, in seconds, until the tube is empty?",
    answer: { type: "numeric", value: 5 / 6, exact: String.raw`\tfrac{5}{5 + 1} = \tfrac{5}{6} \approx 0.833`, unit: "seconds" },
    hints: [
      "Two identical particles bouncing is indistinguishable, as a set of positions, from the two particles passing straight through each other.",
      "So the tube empties at the moment the last 'ghost' particle, walking straight without ever turning, would leave.",
      "A ghost at position x walking left leaves at time x; walking right, at time 1 - x. Either way its exit time is uniform on [0, 1]. The tube clears at the maximum of five independent uniforms.",
    ],
    solution: String.raw`The key observation is that a collision in which two particles swap velocities produces exactly the same set of occupied positions as if the two particles had passed through each other without interacting. Since we only care about when the tube becomes empty, not about which particle is where, we may replace the bouncing particles by 'ghosts' that walk straight through everything at speed 1.

A ghost starting at position $x$ (metres from the left end) and walking left exits at time $x$; one walking right exits at time $1 - x$. Because $x$ is uniform on $[0, 1]$, both $x$ and $1 - x$ are uniform on $[0, 1]$, so each ghost's exit time is uniform on $[0, 1]$ regardless of its direction, and the five exit times are independent.

The tube is empty exactly when all five ghosts have left, that is at $T = \max(E_1, \dots, E_5)$ with the $E_i$ independent uniforms. For the maximum of $n$ uniforms, $P(T \le t) = t^n$, and
$E[T] = \int_0^1 (1 - t^5)\,dt = 1 - \frac{1}{6} = \frac{5}{6}.$
Equivalently, five random points leave six exchangeable gaps and the maximum is five of them: $\frac{5}{6}$.

So the tube is expected to clear in $\frac{5}{6} \approx 0.83$ seconds, and it can never take longer than 1 second.`,
    steps: [
      "Replace bounces by pass-throughs: the occupied set is identical.",
      "Each ghost's exit time is uniform on [0, 1], direction irrelevant.",
      "Clearing time = max of five independent uniforms.",
      "E[max] = n/(n + 1) = 5/6.",
    ],
    keyIdea: "Bouncing identical particles are ghosts passing through each other, so the clearing time is the maximum of independent uniform exit times.",
    commonMistake: "Trying to track the actual collisions, or assuming the direction matters for the exit-time distribution (it does not, since x and 1 - x are both uniform).",
    fastPath: "Ghost exit times are iid uniform; the max of five has mean 5/6.",
    variation: "What is the longest the clearing could possibly take, and what is the expected time with 20 particles?",
    variationAnswer: String.raw`Never more than 1 second (a ghost crossing the whole tube). With 20 particles the expectation is $\tfrac{20}{21} \approx 0.952$ seconds.`,
    family: "ants-on-stick",
    verifiedBy: ["formula", "simulation"],
  },
  {
    id: "m4-p29",
    module: 4,
    kind: "practice",
    difficulty: 5,
    tags: ["indicators", "linearity", "permutations"],
    minutes: 8,
    title: "Loops in a gift exchange",
    prompt: "Seven colleagues run a gift exchange by drawing a uniformly random permutation: each person gives exactly one gift and receives exactly one, and a person may be assigned to give to themselves. Starting from any person, follow 'gives to' until you return to the start; this traces a closed loop, and the seven people split into disjoint loops. What is the expected number of loops?",
    answer: {
      type: "numeric",
      value: 1 + 1 / 2 + 1 / 3 + 1 / 4 + 1 / 5 + 1 / 6 + 1 / 7,
      exact: String.raw`H_7 = 1 + \tfrac{1}{2} + \cdots + \tfrac{1}{7} = \tfrac{363}{140} \approx 2.593`,
      unit: "loops",
    },
    hints: [
      "Count loops by their lengths: the number of loops equals the sum over k of the number of loops of length k.",
      "For a fixed set of k people, how many permutations make exactly that set one loop? (k - 1)! ways to arrange the loop times (7 - k)! for everyone else.",
      "Expected number of loops of length k is C(7, k) (k - 1)! (7 - k)! / 7! = 1/k. Sum for k = 1 to 7.",
    ],
    solution: String.raw`Let $L$ be the number of loops and $L_k$ the number of loops of length exactly $k$, so $L = L_1 + L_2 + \cdots + L_7$. We compute $E[L_k]$ with indicators on sets of people.

For a particular set $S$ of $k$ people, let $I_S = 1$ if $S$ forms one loop by itself. The number of permutations in which $S$ is a single loop is $(k-1)!$ (the number of ways to arrange $k$ people in a cycle) times $(7-k)!$ (any permutation of the others). So $P(I_S = 1) = \frac{(k-1)!\,(7-k)!}{7!}$.

There are $\binom{7}{k}$ such sets, and $L_k = \sum_S I_S$, so
$E[L_k] = \binom{7}{k}\,\frac{(k-1)!\,(7-k)!}{7!} = \frac{7!}{k!\,(7-k)!} \cdot \frac{(k-1)!\,(7-k)!}{7!} = \frac{1}{k}.$

Hence $E[L] = \sum_{k=1}^{7} \frac{1}{k} = H_7 = \frac{363}{140} \approx 2.593$.

A second route: build the permutation by placing people 1 to 7 one at a time, where person $j$ either starts a new loop (probability $\frac{1}{j}$) or slots into an existing loop directly after one of the $j-1$ people already placed. Every permutation arises exactly once, and the number of loops is the number of 'new loop' events, with expectation $\sum_j \frac{1}{j}$ again. Either way, seven people form about $2.6$ loops on average, including an expected $1$ self-gift. Answer: $\frac{363}{140}$.`,
    steps: [
      "Split the loop count by loop length.",
      "For a fixed k-set, P(it forms one loop) = (k - 1)!(7 - k)!/7!.",
      "Multiply by C(7, k) to get 1/k expected loops of length k.",
      "Sum 1/k for k = 1..7.",
    ],
    keyIdea: "The expected number of cycles of length k in a random permutation is exactly 1/k, so the expected number of cycles is a harmonic number.",
    commonMistake: "Guessing the answer is 1 (confusing loops with self-gifts, i.e. fixed points), or counting k! instead of (k - 1)! cyclic arrangements.",
    fastPath: "Expected number of k-loops is 1/k; sum to 7 gives H_7 = 2.59.",
    variation: "Expected number of pairs who give to each other (loops of length exactly 2)?",
    variationAnswer: String.raw`$E[L_2] = \tfrac{1}{2}$, and in general $E[L_k] = \tfrac{1}{k}$ for any $k \le n$.`,
    family: "linearity-of-expectation",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m4-p30",
    module: 4,
    kind: "practice",
    difficulty: 5,
    tags: ["linearity", "derangements", "recursion"],
    minutes: 9,
    title: "Rounds of returning hats",
    prompt: "Six traders check their six distinct hats. The hats are handed back uniformly at random, one per trader. Anyone who receives their own hat keeps it and leaves. The remaining hats are collected and handed back uniformly at random to the remaining traders, and this repeats until every trader has their own hat. What is the expected number of rounds?",
    answer: { type: "numeric", value: 6, exact: String.raw`E_n = n \text{ for every } n, \text{ so } E_6 = 6`, unit: "rounds" },
    hints: [
      "Let E_n be the expected number of rounds with n traders. In each round the expected number of traders who leave is exactly 1.",
      "Condition on how many leave in the first round: E_n = 1 + sum over k of P(k leave) E_{n-k}. Guess E_m = m for smaller m and check.",
      "Substitute E_{n-k} = n - k and use the fact that the expected number of fixed points is 1 to collapse the sum.",
    ],
    solution: String.raw`Let $E_n$ be the expected number of rounds starting with $n$ traders, with $E_0 = 0$. Each round is a uniformly random assignment of the remaining hats, and the number of traders who leave is the number of fixed points $K$ of that random permutation. Write $q_k = P(K = k)$ for $n$ traders.

Conditioning on the first round, $E_n = 1 + \sum_{k=0}^{n} q_k\,E_{n-k}$. We claim $E_n = n$ and prove it by induction. It holds for $n = 1$ (one round, since the single hat must be the right one). Suppose $E_m = m$ for all $m < n$. Then
$E_n = 1 + q_0 E_n + \sum_{k=1}^{n} q_k (n-k) = 1 + q_0 E_n + n(1 - q_0) - \sum_{k=1}^{n} k\,q_k.$

The last sum is $E[K]$, the expected number of fixed points of a random permutation of $n$ items, which is exactly $1$ by linearity (each trader gets their own hat with probability $\frac{1}{n}$, and there are $n$ of them). So
$E_n(1 - q_0) = 1 + n(1 - q_0) - 1 = n(1 - q_0) \quad\Longrightarrow\quad E_n = n.$

The induction closes, and with six traders the expected number of rounds is exactly $6$. The pleasant surprise is that the answer never needs derangement numbers, even though $q_0 = D_n/n!$ appears in the intermediate steps; it cancels precisely because each round frees one trader on average.`,
    steps: [
      "Set up E_n by conditioning on the number of fixed points in round one.",
      "Guess E_m = m from the fact that each round frees one trader on average.",
      "Substitute; the sum of k q_k is E[fixed points] = 1.",
      "Solve: E_n = n, so 6 rounds.",
    ],
    keyIdea: "Each round removes one trader on average, and a clean induction shows the expected number of rounds is exactly n.",
    commonMistake: "Trying to compute each round's fixed-point distribution explicitly with derangement numbers, or jumping from 'one per round on average' to n rounds without checking the induction.",
    fastPath: "Expected rounds equals the number of traders: 6.",
    variation: "What is the expected number of traders who leave in the very first round, and does it depend on n?",
    variationAnswer: "Exactly 1 for every n >= 1: the expected number of fixed points of a random permutation is n times 1/n.",
    family: "fixed-points",
    verifiedBy: ["recursion", "simulation"],
  },

  // ---------------------------------------------------------------- lesson checks
  {
    id: "m4-lc1",
    module: 4,
    kind: "lessonCheck",
    difficulty: 1,
    tags: ["linearity", "coins"],
    minutes: 1,
    title: "Heads from a biased coin",
    prompt: "A coin lands heads with probability 0.3. You flip it 10 times independently. What is the expected number of heads?",
    answer: { type: "numeric", value: 3, exact: String.raw`10 \cdot 0.3 = 3`, unit: "heads" },
    hints: [
      "Write the count as a sum of ten indicators.",
      "Each indicator has expectation 0.3.",
      "Add ten copies of 0.3.",
    ],
    solution: String.raw`Let $I_i = 1$ if flip $i$ is heads. The number of heads is $I_1 + \cdots + I_{10}$ and $E[I_i] = P(\text{heads}) = 0.3$ for each flip.

By linearity, $E[\text{heads}] = 10 \cdot 0.3 = 3$. No binomial formula is needed, and the same answer would hold even if the flips were dependent, as long as each one individually had heads probability $0.3$.`,
    steps: ["Indicator per flip.", "E[indicator] = 0.3.", "Sum: 3."],
    keyIdea: "Expected count = number of trials times the per-trial probability.",
    commonMistake: "Reaching for the binomial pmf, or answering 5 by habit for a coin.",
    fastPath: "np = 10 times 0.3 = 3.",
    variation: "Expected number of tails?",
    variationAnswer: "10 times 0.7 = 7.",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m4-lc2",
    module: 4,
    kind: "lessonCheck",
    difficulty: 1,
    tags: ["indicators", "linearity"],
    minutes: 1,
    title: "Cards in their own place",
    prompt: "Eight cards numbered 1 to 8 are shuffled uniformly at random and dealt in a row into positions 1 to 8. A card is 'in place' if its number equals its position. What is the expected number of cards in place?",
    answer: { type: "numeric", value: 1, exact: String.raw`8 \cdot \tfrac{1}{8} = 1` },
    hints: [
      "One indicator per card.",
      "Card k lands in position k with probability 1/8.",
      "Eight cards times 1/8.",
    ],
    solution: String.raw`Let $I_k = 1$ if card $k$ ends in position $k$. Each card is equally likely to land in any of the eight positions, so $P(I_k = 1) = \frac{1}{8}$.

The number in place is $I_1 + \cdots + I_8$, with expectation $8 \cdot \frac{1}{8} = 1$ by linearity. The indicators are dependent (if seven cards are in place, so is the eighth) but that has no effect on the mean. The same holds for any deck size: the expected number of fixed points of a random shuffle is always exactly 1.`,
    steps: ["Indicator per card.", "P(card k in place) = 1/8.", "Sum: 1."],
    keyIdea: "A random shuffle has exactly one fixed point on average, whatever the deck size.",
    commonMistake: "Reaching for derangement counts, or guessing the answer grows with the number of cards.",
    fastPath: "n times 1/n = 1.",
    variation: "Same question with 100 cards?",
    variationAnswer: "Still 1.",
    family: "fixed-points",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m4-lc3",
    module: 4,
    kind: "lessonCheck",
    difficulty: 2,
    tags: ["expectation"],
    minutes: 1,
    title: "Mean from tail probabilities",
    prompt: String.raw`A random variable $X$ takes values in $\{1, 2, 3\}$ with $P(X \ge 1) = 1$, $P(X \ge 2) = \tfrac{3}{5}$ and $P(X \ge 3) = \tfrac{1}{5}$. What is $E[X]$?`,
    answer: { type: "numeric", value: 9 / 5, exact: String.raw`1 + \tfrac{3}{5} + \tfrac{1}{5} = \tfrac{9}{5} = 1.8` },
    hints: [
      "For non-negative integer variables, E[X] = sum over k >= 1 of P(X >= k).",
      "You are given exactly those tail probabilities.",
      "Add 1 + 3/5 + 1/5.",
    ],
    solution: String.raw`For a random variable with values in $\{0, 1, 2, \dots\}$, the tail-sum formula says $E[X] = \sum_{k \ge 1} P(X \ge k)$: each unit of $X$ is counted once by every tail that reaches it.

Here the tails are $1$, $\frac{3}{5}$ and $\frac{1}{5}$, and $P(X \ge 4) = 0$, so $E[X] = 1 + \frac{3}{5} + \frac{1}{5} = \frac{9}{5}$.

Check via the pmf: $P(X = 1) = 1 - \frac{3}{5} = \frac{2}{5}$, $P(X = 2) = \frac{3}{5} - \frac{1}{5} = \frac{2}{5}$, $P(X = 3) = \frac{1}{5}$, giving $\frac{2}{5} + \frac{4}{5} + \frac{3}{5} = \frac{9}{5} = 1.8$.`,
    steps: ["Recall the tail-sum formula.", "Add the three given tails.", "Optionally recover the pmf and check."],
    keyIdea: "Tail probabilities add up directly to the mean.",
    commonMistake: "Multiplying each tail by k as if it were P(X = k).",
    fastPath: "1 + 0.6 + 0.2 = 1.8.",
    variation: "Suppose X can also take the value 4, with P(X >= 4) = 1/10 and the other tails unchanged. New E[X]?",
    variationAnswer: "1 + 3/5 + 1/5 + 1/10 = 1.9.",
    verifiedBy: ["formula", "simulation"],
  },
  {
    id: "m4-lc4",
    module: 4,
    kind: "lessonCheck",
    difficulty: 2,
    tags: ["order-statistics"],
    minutes: 1,
    title: "Smallest of three uniforms",
    prompt: String.raw`Three numbers are drawn independently and uniformly from $[0, 1]$. What is the expected value of the smallest of the three?`,
    answer: { type: "numeric", value: 1 / 4, exact: String.raw`\tfrac{1}{3 + 1} = \tfrac{1}{4}` },
    hints: [
      "Three points split [0, 1] into four gaps.",
      "The gaps are exchangeable, so each has mean 1/4.",
      "The minimum is the first gap.",
    ],
    solution: String.raw`Three random points cut $[0, 1]$ into four gaps. Relabelling the gaps does not change their joint distribution, so all four have the same expected length, and since they add to 1, each averages $\frac{1}{4}$.

The smallest draw is exactly the first gap, so $E[\min] = \frac{1}{4}$.

By the tail integral: $P(\min > t) = (1 - t)^3$, so $E[\min] = \int_0^1 (1 - t)^3\,dt = \frac{1}{4}$. Both routes give $\frac{1}{4} = 0.25$.`,
    steps: ["Four exchangeable gaps.", "Each has mean 1/4.", "Min = first gap."],
    keyIdea: "The minimum of n uniforms averages 1/(n + 1).",
    commonMistake: "Answering 1/3, using n instead of n + 1.",
    fastPath: "1/(n + 1) = 1/4.",
    variation: "Expected value of the largest of the three?",
    variationAnswer: "3/4.",
    family: "order-statistics",
    verifiedBy: ["formula", "simulation"],
  },
];
