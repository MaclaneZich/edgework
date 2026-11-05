import type { Problem } from "../types";
import { normalCdf } from "../verify/helpers";

/**
 * Module 5: Variance, distributions, and approximations.
 * 26 practice problems (d1: 4, d2: 6, d3: 8, d4: 5, d5: 3) and four lesson checks.
 * Answers are confirmed by independent routes in content/verify/m5.ts. The three normal
 * approximation problems store the approximation itself (computed with normalCdf) and
 * carry an explicit tolerance so a z-table answer is accepted.
 */

const DIE_VAR = 35 / 12;

export const problems: Problem[] = [
  // ---------------------------------------------------------------- difficulty 1
  {
    id: "m5-p01",
    module: 5,
    kind: "practice",
    difficulty: 1,
    tags: ["variance", "dice"],
    minutes: 2,
    title: "Variance of one die",
    prompt: String.raw`A fair six-sided die is rolled once. What is the variance of the number shown?`,
    answer: {
      type: "numeric",
      value: DIE_VAR,
      exact: String.raw`E[X^2] - (E[X])^2 = \frac{91}{6} - \frac{49}{4} = \frac{35}{12} \approx 2.917`,
    },
    hints: [
      "Variance is the expected squared distance from the mean. You know the mean is 3.5.",
      String.raw`Use $\operatorname{Var}(X) = E[X^2] - (E[X])^2$. Add the six squares $1, 4, 9, 16, 25, 36$ and divide by 6.`,
      String.raw`$E[X^2] = 91/6$ and $(E[X])^2 = 49/4$. Put both over 12.`,
    ],
    solution: String.raw`The mean of a fair die is $E[X] = \frac{1 + 2 + \dots + 6}{6} = \frac{21}{6} = 3.5$.

For the second moment, square each face and average: $E[X^2] = \frac{1 + 4 + 9 + 16 + 25 + 36}{6} = \frac{91}{6}$.

Then $\operatorname{Var}(X) = E[X^2] - (E[X])^2 = \frac{91}{6} - \frac{49}{4} = \frac{182}{12} - \frac{147}{12} = \frac{35}{12}$.

As a check, average the squared deviations directly. The deviations from 3.5 are $\pm 0.5, \pm 1.5, \pm 2.5$, whose squares are $0.25, 2.25, 6.25$, each appearing twice: $\frac{2(0.25 + 2.25 + 6.25)}{6} = \frac{17.5}{6} = \frac{35}{12}$. Both routes agree. Answer: $\frac{35}{12} \approx 2.917$, so the standard deviation is about $1.71$.`,
    steps: [
      "Write down the mean, 3.5.",
      "Compute E[X^2] = 91/6 from the six squares.",
      "Subtract the squared mean: 91/6 - 49/4 = 35/12.",
    ],
    keyIdea: String.raw`$\operatorname{Var}(X) = E[X^2] - (E[X])^2$; for a fair $n$-sided die this gives $(n^2 - 1)/12$.`,
    commonMistake: String.raw`Computing $E[X]^2 = 12.25$ and stopping, or averaging the deviations without squaring (which always gives zero).`,
    fastPath: String.raw`Memorise $35/12 \approx 2.92$ for a fair die, or use $(n^2 - 1)/12$ with $n = 6$.`,
    variation: "What is the variance of a fair eight-sided die?",
    variationAnswer: String.raw`$(8^2 - 1)/12 = 63/12 = 21/4 = 5.25$.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m5-p02",
    module: 5,
    kind: "practice",
    difficulty: 1,
    tags: ["variance", "expectation"],
    minutes: 2,
    title: "Variance of a two-outcome ticket",
    prompt: String.raw`A ticket pays a profit of 8 dollars with probability 0.3 and otherwise a loss of 2 dollars (profit of $-2$). What is the variance of the ticket's profit, in dollars squared?`,
    answer: {
      type: "numeric",
      value: 21,
      exact: String.raw`p(1-p)(a-b)^2 = 0.3 \cdot 0.7 \cdot 10^2 = 21`,
      unit: "dollars squared",
    },
    hints: [
      "There are only two outcomes. Start with the mean profit.",
      String.raw`Compute $E[X^2] = 0.3 \cdot 64 + 0.7 \cdot 4$ and subtract the squared mean.`,
      String.raw`Shortcut for two outcomes $a$ and $b$ with probabilities $p$ and $1-p$: $\operatorname{Var} = p(1-p)(a-b)^2$.`,
    ],
    solution: String.raw`Let $X$ be the profit. The mean is $E[X] = 0.3 \cdot 8 + 0.7 \cdot (-2) = 2.4 - 1.4 = 1$ dollar.

The second moment is $E[X^2] = 0.3 \cdot 64 + 0.7 \cdot 4 = 19.2 + 2.8 = 22$. Therefore $\operatorname{Var}(X) = 22 - 1^2 = 21$.

There is a cleaner route for any two-outcome variable. Write $X = b + (a - b)B$ where $B$ is a Bernoulli indicator with success probability $p$; here $a = 8$, $b = -2$, $p = 0.3$. Shifting by $b$ does not change the variance and scaling by $(a - b)$ multiplies it by $(a-b)^2$, so $\operatorname{Var}(X) = (a-b)^2 \, p(1-p) = 100 \cdot 0.21 = 21$.

Answer: $21$ dollars squared, so the standard deviation is $\sqrt{21} \approx 4.58$ dollars against a mean of only 1 dollar.`,
    steps: [
      "Find the mean: 0.3(8) + 0.7(-2) = 1.",
      "Find E[X^2] = 22, or use the gap between the outcomes.",
      "Variance = 22 - 1 = 21, equivalently 0.21 times 10^2.",
    ],
    keyIdea: String.raw`A two-outcome variable has variance $p(1-p)$ times the squared gap between its outcomes.`,
    commonMistake: String.raw`Dropping the sign of the loss when computing the mean ($0.3 \cdot 8 + 0.7 \cdot 2 = 3.8$, giving $22 - 3.8^2 = 7.56$), or forgetting to subtract the squared mean at all.`,
    fastPath: String.raw`Gap is 10, $p(1-p) = 0.21$, so the variance is 21.`,
    variation: "The win probability rises to 0.5 with the same payouts. What happens to the variance?",
    variationAnswer: String.raw`$0.5 \cdot 0.5 \cdot 100 = 25$: the variance is maximised when the two outcomes are equally likely.`,
    verifiedBy: ["formula", "simulation"],
  },
  {
    id: "m5-p03",
    module: 5,
    kind: "practice",
    difficulty: 1,
    tags: ["variance", "dice"],
    minutes: 2,
    title: "Scaled and shifted die payout",
    prompt: String.raw`A game rolls one fair six-sided die showing $X$ and pays $10X - 15$ dollars. What is the standard deviation of the payout, in dollars?`,
    answer: {
      type: "numeric",
      value: 10 * Math.sqrt(DIE_VAR),
      exact: String.raw`10\sqrt{\tfrac{35}{12}} = \sqrt{\tfrac{875}{3}} \approx 17.08`,
      unit: "dollars",
    },
    hints: [
      "Shifting by a constant does nothing to the spread. Scaling does.",
      String.raw`$\operatorname{Var}(aX + b) = a^2 \operatorname{Var}(X)$, so the standard deviation scales by $|a|$.`,
      String.raw`The die has variance $35/12$, so its standard deviation is $\sqrt{35/12} \approx 1.708$. Multiply by 10.`,
    ],
    solution: String.raw`Let $Y = 10X - 15$. The constant $-15$ moves every outcome by the same amount, so it moves the mean but leaves every deviation from the mean unchanged. The factor 10 stretches every deviation by 10, so squared deviations grow by $100$.

Hence $\operatorname{Var}(Y) = 10^2 \operatorname{Var}(X) = 100 \cdot \frac{35}{12} = \frac{875}{3} \approx 291.7$, and the standard deviation is $\sqrt{875/3} = 10\sqrt{35/12} \approx 17.08$ dollars.

You can confirm directly: the payouts are $-5, 5, 15, 25, 35, 45$ with mean 20; the deviations are $\pm 5, \pm 15, \pm 25$; the mean squared deviation is $\frac{2(25 + 225 + 625)}{6} = \frac{1750}{6} = \frac{875}{3}$. Answer: $10\sqrt{35/12} \approx 17.08$ dollars.`,
    steps: [
      "Ignore the shift of -15; it cannot change the spread.",
      "Scale the die's variance by 10^2 = 100, or its standard deviation by 10.",
      "Standard deviation = 10 times sqrt(35/12), about 17.08.",
    ],
    keyIdea: String.raw`$\operatorname{SD}(aX + b) = |a| \operatorname{SD}(X)$: shifts vanish, scales come out as absolute values.`,
    commonMistake: String.raw`Multiplying the standard deviation by 100 instead of 10, or subtracting 15 from it because the payout was shifted.`,
    fastPath: String.raw`Die SD is about 1.71; times 10 is about 17.1.`,
    variation: "The payout is changed to 15 - 10X dollars. What is its standard deviation?",
    variationAnswer: String.raw`Unchanged: $|-10| \cdot \sqrt{35/12} \approx 17.08$. The sign of the scale does not matter.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m5-p04",
    module: 5,
    kind: "practice",
    difficulty: 1,
    tags: ["binomial", "variance"],
    minutes: 2,
    title: "Variance of the fill count",
    prompt: String.raw`A trader splits an order into 40 child orders and sends one to each of 40 venues. Each child order is filled independently with probability 0.35. What is the variance of the number of child orders that get filled?`,
    answer: { type: "numeric", value: 9.1, exact: String.raw`np(1-p) = 40 \cdot 0.35 \cdot 0.65 = 9.1` },
    hints: [
      "The fill count is a sum of 40 independent indicator variables.",
      String.raw`Each indicator has variance $p(1-p)$; independent variances add.`,
      String.raw`$40 \cdot 0.35 \cdot 0.65$.`,
    ],
    solution: String.raw`Let $F_i$ be 1 if child order $i$ fills and 0 otherwise. The fill count is $K = F_1 + \dots + F_{40}$, a binomial variable with $n = 40$ and $p = 0.35$.

Each $F_i$ has $E[F_i] = p$ and $E[F_i^2] = p$ (since $F_i^2 = F_i$), so $\operatorname{Var}(F_i) = p - p^2 = p(1-p) = 0.35 \cdot 0.65 = 0.2275$.

The fills are independent, so the variance of the sum is the sum of the variances: $\operatorname{Var}(K) = 40 \cdot 0.2275 = 9.1$. The expected number of fills is $40 \cdot 0.35 = 14$, and the standard deviation is $\sqrt{9.1} \approx 3.02$, so a typical day sees roughly 11 to 17 fills. Answer: $9.1$.`,
    steps: [
      "Model the count as a sum of 40 independent indicators.",
      "Variance of one indicator: 0.35 times 0.65 = 0.2275.",
      "Add them: 40 times 0.2275 = 9.1.",
    ],
    keyIdea: String.raw`Binomial variance is $np(1-p)$, because independent indicator variances add.`,
    commonMistake: String.raw`Reporting the mean $np = 14$ when asked for the variance, or using $np$ for the variance as if the count were Poisson.`,
    fastPath: String.raw`$0.35 \cdot 0.65 = 0.2275$; times 40 is 9.1.`,
    variation: "The venues are now identical and either all fill or none fill, together, with probability 0.35. What is the variance of the fill count?",
    variationAnswer: String.raw`The count is $40B$ for one Bernoulli $B$: $\operatorname{Var} = 1600 \cdot 0.2275 = 364$, forty times larger. Dependence changes everything about the variance and nothing about the mean.`,
    verifiedBy: ["formula", "enumeration", "simulation"],
  },

  // ---------------------------------------------------------------- difficulty 2
  {
    id: "m5-p05",
    module: 5,
    kind: "practice",
    difficulty: 2,
    tags: ["covariance", "dice", "variance"],
    minutes: 3,
    title: "Covariance of a die with the total",
    prompt: String.raw`Two independent fair six-sided dice show $X$ and $Y$, and $S = X + Y$ is their total. What is $\operatorname{Cov}(X, S)$?`,
    answer: {
      type: "numeric",
      value: DIE_VAR,
      exact: String.raw`\operatorname{Cov}(X, X + Y) = \operatorname{Var}(X) + \operatorname{Cov}(X, Y) = \frac{35}{12} + 0 \approx 2.917`,
    },
    hints: [
      "Covariance is bilinear: split S into its two pieces.",
      String.raw`$\operatorname{Cov}(X, X + Y) = \operatorname{Cov}(X, X) + \operatorname{Cov}(X, Y)$. What is each term?`,
      String.raw`$\operatorname{Cov}(X, X) = \operatorname{Var}(X) = 35/12$ and independence kills the other term.`,
    ],
    solution: String.raw`Covariance is linear in each argument, so $\operatorname{Cov}(X, S) = \operatorname{Cov}(X, X + Y) = \operatorname{Cov}(X, X) + \operatorname{Cov}(X, Y)$.

The first term is the covariance of a variable with itself, which is its variance: $\operatorname{Var}(X) = 35/12$. The second term is zero because $X$ and $Y$ are independent.

So $\operatorname{Cov}(X, S) = 35/12 \approx 2.917$. The direct definition confirms it: $E[XS] = E[X^2] + E[X]E[Y] = \frac{91}{6} + \frac{49}{4}$ and $E[X]E[S] = 3.5 \cdot 7 = \frac{49}{2}$; the difference is $\frac{91}{6} - \frac{49}{4} = \frac{35}{12}$.

The covariance is positive, as it should be: a large first die pushes the total up. Answer: $\frac{35}{12} \approx 2.917$.`,
    steps: [
      "Expand Cov(X, X + Y) by bilinearity.",
      "Cov(X, X) is Var(X) = 35/12.",
      "Cov(X, Y) = 0 by independence; answer 35/12.",
    ],
    keyIdea: String.raw`$\operatorname{Cov}(X, X) = \operatorname{Var}(X)$ and covariance splits over sums.`,
    commonMistake: String.raw`Answering $0$ because "the dice are independent" (true of $X$ and $Y$, false of $X$ and $S$), or answering $\operatorname{Var}(S) = 35/6$.`,
    fastPath: String.raw`The only surviving term is $\operatorname{Var}(X) = 35/12$.`,
    variation: "What is the correlation coefficient between X and S?",
    variationAnswer: String.raw`$\rho = \frac{35/12}{\sqrt{(35/12)(35/6)}} = \frac{1}{\sqrt 2} \approx 0.707$.`,
    family: "variance-of-sums",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m5-p06",
    module: 5,
    kind: "practice",
    difficulty: 2,
    tags: ["variance", "dice", "covariance"],
    minutes: 2,
    title: "Two dice or one die doubled",
    prompt: String.raw`Game A pays the total of two independent fair six-sided dice. Game B rolls a single fair die and pays twice the number shown. Both games pay 7 on average. Which statement about their variances is correct?`,
    answer: {
      type: "choice",
      options: [
        String.raw`Game B has twice the variance of Game A: $\operatorname{Var}(2X) = 4\operatorname{Var}(X) = 35/3$, while $\operatorname{Var}(X + Y) = 2\operatorname{Var}(X) = 35/6$.`,
        String.raw`The variances are equal: both payouts have mean 7 and are built from the same die distribution, so both have variance $35/6$.`,
        String.raw`Game A has the larger variance, because two dice spread the total over 11 possible values while Game B has only 6.`,
        String.raw`Game A has twice the variance of Game B, because it involves two independent sources of randomness instead of one.`,
      ],
      correct: 0,
    },
    hints: [
      "Write Game A as X + Y and Game B as X + X. Same mean; what about the variance of each?",
      String.raw`For independent dice $\operatorname{Var}(X + Y) = \operatorname{Var}(X) + \operatorname{Var}(Y)$. For $2X$ use the scaling rule.`,
      String.raw`$2 \cdot \frac{35}{12}$ versus $4 \cdot \frac{35}{12}$.`,
    ],
    solution: String.raw`Let $X$ and $Y$ be the two dice, each with variance $35/12$.

Game A pays $X + Y$. The dice are independent, so the covariance term vanishes and $\operatorname{Var}(X + Y) = \operatorname{Var}(X) + \operatorname{Var}(Y) = 2 \cdot \frac{35}{12} = \frac{35}{6} \approx 5.83$.

Game B pays $2X = X + X$. The two copies are perfectly correlated, so $\operatorname{Var}(X + X) = \operatorname{Var}(X) + \operatorname{Var}(X) + 2\operatorname{Cov}(X, X) = 4\operatorname{Var}(X) = \frac{35}{3} \approx 11.67$. Equivalently, $\operatorname{Var}(2X) = 2^2 \operatorname{Var}(X)$.

So Game B has exactly twice the variance of Game A. The number of possible values is a red herring: Game B's six values are spaced two apart ($2, 4, \dots, 12$), are equally likely and can never equal the mean, while Game A's total piles up around 7. Intuitively, two independent dice partly cancel each other; one die counted twice cannot cancel anything. The correct statement is the first one.`,
    steps: [
      "Write A = X + Y and B = X + X.",
      "Independent terms add: Var(A) = 2(35/12) = 35/6.",
      "Scaling squares: Var(B) = 4(35/12) = 35/3.",
      "Conclude B has twice the variance of A.",
    ],
    keyIdea: String.raw`Adding a variable to an independent copy doubles the variance; adding it to itself quadruples it.`,
    commonMistake: String.raw`Treating $X + X$ like $X + Y$ and claiming equal variances, or reasoning from how many distinct values each payout can take.`,
    fastPath: String.raw`$\operatorname{Var}(2X) = 4\sigma^2$ versus $\operatorname{Var}(X+Y) = 2\sigma^2$: ratio 2, B is larger.`,
    variation: "Game C pays the total of four independent dice; Game D pays four times one die. What is the ratio of D's variance to C's?",
    variationAnswer: String.raw`$16\sigma^2 / 4\sigma^2 = 4$. In general $n$ copies of one die have $n$ times the variance of $n$ independent dice.`,
    family: "variance-of-sums",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m5-p07",
    module: 5,
    kind: "practice",
    difficulty: 2,
    tags: ["binomial"],
    minutes: 2,
    title: "Exactly three makes from eight",
    prompt: String.raw`A basketball player makes each three-point attempt independently with probability 0.3. She takes 8 attempts. What is the probability that she makes exactly 3 of them?`,
    answer: {
      type: "numeric",
      value: 56 * Math.pow(0.3, 3) * Math.pow(0.7, 5),
      exact: String.raw`\binom{8}{3}(0.3)^3(0.7)^5 \approx 0.2541`,
    },
    hints: [
      "Independent attempts with a fixed success probability: the count of makes is binomial.",
      String.raw`A specific sequence with 3 makes and 5 misses has probability $0.3^3 \cdot 0.7^5$. How many such sequences are there?`,
      String.raw`$\binom{8}{3} = 56$ sequences; multiply.`,
    ],
    solution: String.raw`The number of makes $K$ in 8 independent attempts with success probability $0.3$ follows a binomial distribution with $n = 8$ and $p = 0.3$.

Any one specific pattern of 3 makes and 5 misses, such as make-make-make-miss-miss-miss-miss-miss, has probability $0.3^3 \cdot 0.7^5$ by independence. There are $\binom{8}{3} = 56$ ways to choose which 3 of the 8 attempts are the makes, and these patterns are mutually exclusive.

So $P(K = 3) = 56 \cdot 0.3^3 \cdot 0.7^5 = 56 \cdot 0.027 \cdot 0.16807 \approx 0.2541$.

For scale, the mean is $8 \cdot 0.3 = 2.4$, so 3 is the second most likely count (after 2, which has probability about $0.296$). Answer: $\binom{8}{3}(0.3)^3(0.7)^5 \approx 0.254$.`,
    steps: [
      "Identify the binomial setting: n = 8, p = 0.3.",
      "Probability of one specific 3-make pattern: 0.3^3 times 0.7^5.",
      "Multiply by C(8,3) = 56.",
    ],
    keyIdea: String.raw`Binomial pmf: $\binom{n}{k}p^k(1-p)^{n-k}$, the count of patterns times the probability of one pattern.`,
    commonMistake: String.raw`Dropping the $\binom{8}{3}$ factor (answering $0.0045$), or using $0.7^3$ and $0.3^5$ the wrong way round.`,
    fastPath: String.raw`$0.7^5 \approx 0.168$, times $0.027$ is about $0.00454$, times 56 is about $0.254$.`,
    variation: "What is the probability she makes at most 1 of the 8?",
    variationAnswer: String.raw`$0.7^8 + 8(0.3)(0.7^7) \approx 0.0576 + 0.1977 = 0.2553$.`,
    verifiedBy: ["formula", "enumeration", "simulation"],
  },
  {
    id: "m5-p08",
    module: 5,
    kind: "practice",
    difficulty: 2,
    tags: ["binomial", "complement"],
    minutes: 3,
    title: "At least two defective parts",
    prompt: String.raw`Each part from a supplier is defective independently with probability 0.04. A crate holds 25 parts. What is the probability that the crate contains at least two defective parts?`,
    answer: {
      type: "numeric",
      value: 1 - Math.pow(0.96, 25) - 25 * 0.04 * Math.pow(0.96, 24),
      exact: String.raw`1 - 0.96^{25} - 25(0.04)(0.96)^{24} \approx 0.2642`,
    },
    hints: [
      "'At least two' has 24 cases. Its complement has two.",
      String.raw`Compute $P(0)$ and $P(1)$ for a binomial with $n = 25$, $p = 0.04$.`,
      String.raw`$P(0) = 0.96^{25}$ and $P(1) = 25 \cdot 0.04 \cdot 0.96^{24}$; subtract both from 1.`,
    ],
    solution: String.raw`Let $D$ be the number of defective parts, binomial with $n = 25$ and $p = 0.04$. We want $P(D \ge 2) = 1 - P(D = 0) - P(D = 1)$.

$P(D = 0) = 0.96^{25}$. Since $\ln 0.96 \approx -0.0408$, $25 \ln 0.96 \approx -1.021$ and $0.96^{25} \approx 0.3604$.

$P(D = 1) = \binom{25}{1}(0.04)(0.96)^{24} = 25 \cdot 0.04 \cdot 0.96^{24} = 0.96^{24} \approx 0.3754$ (the $25 \cdot 0.04 = 1$ is a pleasant coincidence of these numbers).

So $P(D \ge 2) = 1 - 0.3604 - 0.3754 \approx 0.2642$.

Sanity check with the Poisson approximation, since $n$ is largish and $p$ small: $\lambda = np = 1$ gives $P(0) + P(1) = e^{-1}(1 + 1) \approx 0.7358$, so $P(D \ge 2) \approx 0.264$. The two agree to three decimals. Answer: $1 - 0.96^{25} - 0.96^{24} \approx 0.264$.`,
    steps: [
      "Translate 'at least two' into 1 minus P(0) minus P(1).",
      "P(0) = 0.96^25, about 0.360.",
      "P(1) = 25(0.04)(0.96^24), about 0.375.",
      "Subtract both from 1: about 0.264.",
    ],
    keyIdea: String.raw`Complement the small side: $P(\ge 2) = 1 - P(0) - P(1)$.`,
    commonMistake: String.raw`Forgetting the $P(1)$ term and reporting $1 - 0.96^{25} \approx 0.64$, which is $P(\text{at least one})$.`,
    fastPath: String.raw`$np = 1$, so Poisson: $1 - 2/e \approx 0.264$. Exact binomial agrees to three places.`,
    variation: "The defect rate doubles to 0.08. Roughly what is the probability of at least two defective parts now?",
    variationAnswer: String.raw`Exact: $1 - 0.92^{25} - 25(0.08)(0.92)^{24} \approx 1 - 0.1244 - 0.2703 = 0.6053$; Poisson with $\lambda = 2$ gives $1 - 3e^{-2} \approx 0.594$, now off by about $0.01$ because $p$ has doubled.`,
    family: "at-least-one",
    verifiedBy: ["formula", "enumeration", "simulation"],
  },
  {
    id: "m5-p09",
    module: 5,
    kind: "practice",
    difficulty: 2,
    tags: ["geometric-dist", "expectation"],
    minutes: 2,
    title: "Four calls in, no sale yet",
    prompt: String.raw`A sales caller gets a yes on each call independently with probability 0.15. She has made 4 calls today and all were no. What is the expected number of additional calls she needs, counting the call on which the first yes arrives?`,
    answer: { type: "numeric", value: 1 / 0.15, exact: String.raw`\frac{1}{p} = \frac{1}{0.15} = \frac{20}{3} \approx 6.67`, unit: "calls" },
    hints: [
      "The calls are independent. Do the four misses change anything about the next call?",
      "The geometric distribution has no memory: conditional on failures so far, the remaining wait has the same distribution as a fresh wait.",
      String.raw`The expected wait for a success with probability $p$ per trial is $1/p$.`,
    ],
    solution: String.raw`Let $N$ be the call number of the first yes, so $N$ is geometric with $p = 0.15$ and $P(N > k) = 0.85^k$. We want $E[N - 4 \mid N > 4]$.

For any $j \ge 1$, $P(N = 4 + j \mid N > 4) = \frac{0.85^{3+j}\cdot 0.15}{0.85^4} = 0.85^{j-1} \cdot 0.15 = P(N = j)$. Conditional on four failures, the remaining number of calls has exactly the original geometric distribution. This is the memoryless property, and it follows from independence: the coin does not remember.

So $E[N - 4 \mid N > 4] = E[N] = \frac{1}{p} = \frac{1}{0.15} = \frac{20}{3} \approx 6.67$ calls.

The direct computation agrees: $E[N] = \sum_{j \ge 1} j (0.85)^{j-1}(0.15) = 0.15 \cdot \frac{1}{(1 - 0.85)^2} = \frac{1}{0.15}$. Answer: $\frac{20}{3} \approx 6.67$ additional calls.`,
    steps: [
      "Name the distribution: geometric, p = 0.15.",
      "Use memorylessness: four misses do not change the remaining wait.",
      "Expected remaining calls = 1/p = 20/3.",
    ],
    keyIdea: String.raw`Independent trials are memoryless: past failures do not shorten (or lengthen) the remaining wait.`,
    commonMistake: String.raw`Reasoning that she is "due" a yes and answering less than $1/p$, or subtracting the four calls to get $20/3 - 4$.`,
    fastPath: String.raw`$1/0.15 = 6.67$. Ignore the history.`,
    variation: "What is the expected total number of calls today, given the first four were all no?",
    variationAnswer: String.raw`$4 + 20/3 = 32/3 \approx 10.67$: the four spent calls plus a fresh geometric wait.`,
    verifiedBy: ["formula", "enumeration", "simulation"],
  },
  {
    id: "m5-p10",
    module: 5,
    kind: "practice",
    difficulty: 2,
    tags: ["poisson", "complement"],
    minutes: 2,
    title: "At least one order in half a minute",
    prompt: String.raw`Orders reach a desk as a Poisson process with an average rate of 2.5 orders per minute. What is the probability that at least one order arrives during a particular 30-second window?`,
    answer: { type: "numeric", value: 1 - Math.exp(-1.25), exact: String.raw`1 - e^{-1.25} \approx 0.7135` },
    hints: [
      "First convert the rate to the window: how many orders are expected in 30 seconds?",
      String.raw`A Poisson count with mean $\lambda$ is zero with probability $e^{-\lambda}$.`,
      String.raw`$\lambda = 1.25$; the answer is $1 - e^{-1.25}$.`,
    ],
    solution: String.raw`The number of orders in a 30-second window is Poisson with mean $\lambda = 2.5 \times 0.5 = 1.25$. Scaling the window scales the mean; nothing else about the distribution changes.

The probability of zero orders is $P(0) = e^{-\lambda}\lambda^0/0! = e^{-1.25} \approx 0.2865$.

"At least one" is the complement of "none", so $P(\ge 1) = 1 - e^{-1.25} \approx 0.7135$.

A quick plausibility check: with 1.25 expected orders you would guess the window is usually busy but not always, and 71% matches that. Answer: $1 - e^{-1.25} \approx 0.714$.`,
    steps: [
      "Rescale the rate to the window: lambda = 2.5 times 0.5 = 1.25.",
      "P(none) = e^(-1.25), about 0.287.",
      "Subtract from 1: about 0.714.",
    ],
    keyIdea: String.raw`For a Poisson process, $P(\text{no events in time } t) = e^{-\text{rate} \cdot t}$.`,
    commonMistake: String.raw`Using $\lambda = 2.5$ for the half-minute window (giving $0.918$), or answering $\min(1, 1.25) = 1$ as if the mean were a probability.`,
    fastPath: String.raw`$e^{-1.25} \approx 0.29$, so about $0.71$.`,
    variation: "How long a window do you need for the probability of at least one order to reach 0.99?",
    variationAnswer: String.raw`Need $e^{-2.5t} = 0.01$, so $t = \ln 100 / 2.5 \approx 1.84$ minutes.`,
    family: "at-least-one",
    verifiedBy: ["formula", "simulation"],
  },

  // ---------------------------------------------------------------- difficulty 3
  {
    id: "m5-p11",
    module: 5,
    kind: "practice",
    difficulty: 3,
    tags: ["poisson", "conditional"],
    minutes: 3,
    title: "Exactly two flaws, given at least one",
    prompt: String.raw`Flaws along a fibre-optic cable occur as a Poisson process at an average rate of 0.4 flaws per metre. A 5-metre section is tested and found to contain at least one flaw. Given this, what is the probability that the section contains exactly two flaws?`,
    answer: {
      type: "numeric",
      value: (2 * Math.exp(-2)) / (1 - Math.exp(-2)),
      exact: String.raw`\frac{P(2)}{1 - P(0)} = \frac{2e^{-2}}{1 - e^{-2}} \approx 0.3130`,
    },
    hints: [
      "Find the mean number of flaws in 5 metres first.",
      String.raw`Conditioning on 'at least one' divides by $P(\ge 1) = 1 - e^{-\lambda}$.`,
      String.raw`With $\lambda = 2$: $P(2) = 2e^{-2}$ and $P(\ge 1) = 1 - e^{-2}$.`,
    ],
    solution: String.raw`The flaw count $F$ in a 5-metre section is Poisson with mean $\lambda = 0.4 \times 5 = 2$.

Unconditionally, $P(F = 2) = \frac{e^{-2} 2^2}{2!} = 2e^{-2} \approx 0.2707$, and $P(F \ge 1) = 1 - e^{-2} \approx 0.8647$.

The event $\{F = 2\}$ is contained in $\{F \ge 1\}$, so by the definition of conditional probability $P(F = 2 \mid F \ge 1) = \frac{P(F = 2)}{P(F \ge 1)} = \frac{2e^{-2}}{1 - e^{-2}} \approx \frac{0.2707}{0.8647} \approx 0.3130$.

Conditioning removed the 13.5% of sections with no flaws and rescaled every other probability up by the factor $1/0.8647 \approx 1.157$. Answer: $\frac{2e^{-2}}{1 - e^{-2}} \approx 0.313$.`,
    steps: [
      "Mean flaws in 5 m: lambda = 2.",
      "Unconditional P(2) = 2e^(-2), about 0.271.",
      "Divide by P(at least one) = 1 - e^(-2), about 0.865.",
      "Answer about 0.313.",
    ],
    keyIdea: String.raw`Conditioning on 'at least one' rescales the remaining pmf by $1/(1 - e^{-\lambda})$.`,
    commonMistake: String.raw`Reporting the unconditional $2e^{-2} \approx 0.271$, or using $\lambda = 0.4$ because the rate was quoted per metre.`,
    fastPath: String.raw`$e^{-2} \approx 0.135$: numerator $0.271$, denominator $0.865$, ratio about $0.31$.`,
    variation: "Given at least one flaw, what is the expected number of flaws in the section?",
    variationAnswer: String.raw`$E[F \mid F \ge 1] = \frac{\lambda}{1 - e^{-\lambda}} = \frac{2}{1 - e^{-2}} \approx 2.313$.`,
    verifiedBy: ["formula", "enumeration", "simulation"],
  },
  {
    id: "m5-p12",
    module: 5,
    kind: "practice",
    difficulty: 3,
    tags: ["binomial", "poisson", "complement"],
    minutes: 4,
    title: "Ticket errors: exact binomial versus Poisson",
    prompt: String.raw`A batch of 200 trade tickets is processed. Each ticket independently contains an error with probability 0.01. What is the exact probability that at least 3 tickets in the batch contain an error? In your working, compare with the Poisson approximation.`,
    answer: {
      type: "numeric",
      value: 1 - Math.pow(0.99, 200) - 200 * 0.01 * Math.pow(0.99, 199) - 19900 * 0.0001 * Math.pow(0.99, 198),
      exact: String.raw`1 - \sum_{k=0}^{2}\binom{200}{k}(0.01)^k(0.99)^{200-k} \approx 0.3233`,
    },
    hints: [
      "'At least 3' is best handled through the complement: 0, 1 or 2 errors.",
      String.raw`The three binomial terms are $0.99^{200}$, $200(0.01)(0.99^{199})$ and $\binom{200}{2}(0.01)^2(0.99^{198})$.`,
      String.raw`For the comparison, $\lambda = np = 2$ and $P(\le 2) \approx e^{-2}(1 + 2 + 2) = 5e^{-2}$.`,
    ],
    solution: String.raw`Let $E$ be the number of tickets with errors: binomial, $n = 200$, $p = 0.01$. We want $P(E \ge 3) = 1 - P(E \le 2)$.

The three complement terms are
$P(0) = 0.99^{200} \approx 0.1340$,
$P(1) = 200 \cdot 0.01 \cdot 0.99^{199} = 2 \cdot 0.99^{199} \approx 0.2707$,
$P(2) = \binom{200}{2}(0.01)^2 (0.99)^{198} = 19900 \cdot 10^{-4} \cdot 0.99^{198} \approx 0.2720$.
Their sum is about $0.6767$, so $P(E \ge 3) \approx 0.3233$.

Now the Poisson approximation. With $n$ large and $p$ small, $E$ is approximately Poisson with $\lambda = np = 2$: $P(\le 2) \approx e^{-2}\left(1 + 2 + \frac{2^2}{2}\right) = 5e^{-2} \approx 0.6767$, hence $P(E \ge 3) \approx 1 - 5e^{-2} \approx 0.3233$. The two answers agree to four decimal places; the Poisson route needs no binomial coefficients and no 200th powers, which is why interviewers expect you to reach for it.

Answer (exact binomial): $1 - 0.99^{200} - 2(0.99)^{199} - 1.99(0.99)^{198} \approx 0.3233$.`,
    steps: [
      "Set up the binomial: n = 200, p = 0.01, complement of 'at most 2'.",
      "Compute P(0), P(1), P(2): about 0.134, 0.271, 0.272.",
      "Subtract their sum from 1: about 0.323.",
      "Cross-check with Poisson(2): 1 - 5e^(-2), also about 0.323.",
    ],
    keyIdea: String.raw`When $n$ is large and $p$ small, the binomial is close to Poisson with $\lambda = np$, and the Poisson sum is far quicker.`,
    commonMistake: String.raw`Stopping at $1 - P(0) - P(1)$ (which is $P(\ge 2) \approx 0.595$), or using $\binom{200}{2} = 200 \cdot 199$ without halving.`,
    fastPath: String.raw`Poisson with $\lambda = 2$: $1 - e^{-2}(1 + 2 + 2) = 1 - 5(0.1353) \approx 0.323$; quote it as an approximation of the binomial.`,
    variation: "How many tickets are needed before the probability of at least one error reaches 0.95?",
    variationAnswer: String.raw`Need $0.99^n \le 0.05$: $n \ge \ln 0.05 / \ln 0.99 \approx 298.1$, so 299 tickets.`,
    verifiedBy: ["formula", "enumeration", "simulation"],
  },
  {
    id: "m5-p13",
    module: 5,
    kind: "practice",
    difficulty: 3,
    tags: ["covariance", "dice"],
    minutes: 3,
    title: "Two totals that share a die",
    prompt: String.raw`Three independent fair six-sided dice show $A$, $B$ and $C$. Let $S = A + B$ and $T = B + C$. What is the correlation coefficient between $S$ and $T$?`,
    answer: {
      type: "numeric",
      value: 0.5,
      exact: String.raw`\rho = \frac{\operatorname{Cov}(S, T)}{\sqrt{\operatorname{Var}(S)\operatorname{Var}(T)}} = \frac{\operatorname{Var}(B)}{2\operatorname{Var}(B)} = \frac{1}{2}`,
    },
    hints: [
      "Expand Cov(A + B, B + C) into four covariances. Only one survives.",
      String.raw`$\operatorname{Cov}(S, T) = \operatorname{Var}(B) = 35/12$. Now find $\operatorname{Var}(S)$ and $\operatorname{Var}(T)$.`,
      String.raw`Each total has variance $2 \cdot 35/12$; divide.`,
    ],
    solution: String.raw`Expand the covariance using bilinearity: $\operatorname{Cov}(A + B, B + C) = \operatorname{Cov}(A, B) + \operatorname{Cov}(A, C) + \operatorname{Cov}(B, B) + \operatorname{Cov}(B, C)$. The three cross terms are zero by independence, leaving $\operatorname{Cov}(S, T) = \operatorname{Var}(B) = \frac{35}{12}$.

Each total is a sum of two independent dice, so $\operatorname{Var}(S) = \operatorname{Var}(T) = 2 \cdot \frac{35}{12} = \frac{35}{6}$.

The correlation is therefore $\rho = \frac{35/12}{\sqrt{(35/6)(35/6)}} = \frac{35/12}{35/6} = \frac{1}{2}$.

The value $35/12$ cancels completely, which tells you the answer does not depend on the die at all: any two sums of two iid variables that share one summand have correlation exactly one half, because they share half of their variance. Answer: $\rho = \frac{1}{2}$.`,
    steps: [
      "Expand Cov(A + B, B + C); independence kills three of four terms.",
      "Cov(S, T) = Var(B) = 35/12.",
      "Var(S) = Var(T) = 35/6.",
      "Divide: rho = 1/2.",
    ],
    keyIdea: String.raw`Shared summands create covariance; the correlation is the shared variance over the total variance.`,
    commonMistake: String.raw`Dividing $\operatorname{Cov}(S,T)$ by $\operatorname{Var}(B)$ instead of by $\sqrt{\operatorname{Var}(S)\operatorname{Var}(T)}$, giving $1$; or answering $1/\sqrt 2$ by confusing this with $\operatorname{Corr}(B, S)$.`,
    fastPath: String.raw`Shared variance one unit, total variance two units each: $\rho = 1/2$ without computing $35/12$.`,
    variation: "What is the correlation between a single fair die X and its square X^2?",
    variationAnswer: String.raw`$\operatorname{Cov}(X, X^2) = E[X^3] - E[X]E[X^2] = \frac{441}{6} - \frac{7}{2}\cdot\frac{91}{6} = \frac{245}{12}$, $\operatorname{Var}(X^2) = \frac{5369}{36}$, so $\rho = \frac{245/12}{\sqrt{(35/12)(5369/36)}} \approx 0.979$.`,
    family: "variance-of-sums",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m5-p14",
    module: 5,
    kind: "practice",
    difficulty: 3,
    tags: ["geometric-dist", "variance", "dice"],
    minutes: 3,
    title: "Variance of the wait, four rolls in",
    prompt: String.raw`A fair six-sided die is rolled repeatedly until the first 6 appears, and $N$ is the total number of rolls made. Given that none of the first four rolls was a 6, what is the variance of $N$?`,
    answer: { type: "numeric", value: 30, exact: String.raw`\frac{1 - p}{p^2} = \frac{5/6}{1/36} = 30` },
    hints: [
      "Memorylessness: given four failures, N = 4 + (a fresh geometric wait).",
      "Adding the constant 4 shifts the mean but not the variance.",
      String.raw`The variance of a geometric wait with success probability $p$ is $(1-p)/p^2$.`,
    ],
    solution: String.raw`Let $N$ be geometric with $p = 1/6$ (the number of rolls up to and including the first 6). Conditional on the first four rolls being failures, $N = 4 + N'$ where $N'$ is the number of further rolls needed. By the memoryless property, $N'$ has the same geometric distribution as $N$: $P(N' = j) = (5/6)^{j-1}(1/6)$ for $j \ge 1$.

Variance ignores constant shifts, so $\operatorname{Var}(N \mid N > 4) = \operatorname{Var}(4 + N') = \operatorname{Var}(N') = \frac{1 - p}{p^2}$.

Deriving the geometric variance: $E[N'] = 1/p$ and $E[N'(N'-1)] = \sum_{j} j(j-1)(1-p)^{j-1}p = \frac{2(1-p)}{p^2}$, so $E[N'^2] = \frac{2(1-p)}{p^2} + \frac{1}{p}$ and $\operatorname{Var}(N') = \frac{2(1-p)}{p^2} + \frac{1}{p} - \frac{1}{p^2} = \frac{1-p}{p^2}$.

With $p = 1/6$: $\operatorname{Var} = \frac{5/6}{1/36} = 30$. The conditional mean is $4 + 6 = 10$ and the standard deviation is $\sqrt{30} \approx 5.48$, just as wide as it was before the four rolls. Answer: $30$.`,
    steps: [
      "Write N = 4 + N' with N' a fresh geometric wait (memorylessness).",
      "The shift by 4 does not affect variance.",
      "Geometric variance: (1 - p)/p^2 = (5/6)/(1/36) = 30.",
    ],
    keyIdea: String.raw`Conditioning a geometric wait on past failures only shifts it; variance $(1-p)/p^2$ is untouched.`,
    commonMistake: String.raw`Answering $1/p^2 = 36$ (forgetting the $1 - p$), or trying to subtract something for the four 'used' rolls.`,
    fastPath: String.raw`$(1-p)/p^2 = (5/6) \cdot 36 = 30$.`,
    variation: "Instead of a six-sided die you flip a fair coin until the first head, having already seen four tails. What is the variance of the total number of flips?",
    variationAnswer: String.raw`$(1 - 1/2)/(1/2)^2 = 2$.`,
    verifiedBy: ["formula", "enumeration"],
  },
  {
    id: "m5-p15",
    module: 5,
    kind: "practice",
    difficulty: 3,
    tags: ["normal"],
    minutes: 2,
    title: "Probability of a losing day",
    prompt: String.raw`A strategy's daily profit is normally distributed with mean 1,200 dollars and standard deviation 800 dollars. What is the probability that a given day loses money (profit below zero)? Use a standard normal table or calculator.`,
    answer: {
      type: "numeric",
      value: normalCdf(-1.5),
      exact: String.raw`\Phi\!\left(\frac{0 - 1200}{800}\right) = \Phi(-1.5) = 1 - \Phi(1.5) \approx 0.0668`,
      tolerance: 0.001,
    },
    hints: [
      "Standardise: how many standard deviations below the mean is zero?",
      String.raw`$z = (0 - 1200)/800 = -1.5$.`,
      String.raw`$\Phi(-1.5) = 1 - \Phi(1.5)$, and $\Phi(1.5) \approx 0.9332$.`,
    ],
    solution: String.raw`Let $X$ be the daily profit, $X \sim N(1200, 800^2)$. Standardise: $Z = (X - 1200)/800$ is standard normal, and $X < 0$ exactly when $Z < (0 - 1200)/800 = -1.5$.

So $P(X < 0) = \Phi(-1.5)$. By symmetry of the normal density, $\Phi(-1.5) = 1 - \Phi(1.5)$, and from the table $\Phi(1.5) \approx 0.9332$, giving $P(\text{loss}) \approx 0.0668$.

As a rough check with the 68-95-99.7 rule, 1.5 standard deviations is between the 16% one-sigma tail and the 2.5% two-sigma tail, and 6.7% sits sensibly between them. Over a 250-day year that is about 17 losing days. Answer: $\Phi(-1.5) \approx 0.0668$.`,
    steps: [
      "Standardise: z = (0 - 1200)/800 = -1.5.",
      "Use symmetry: Phi(-1.5) = 1 - Phi(1.5).",
      "Read Phi(1.5) = 0.9332; answer about 0.0668.",
    ],
    keyIdea: String.raw`Any normal question is a z-score followed by one table lookup.`,
    commonMistake: String.raw`Reporting $\Phi(1.5) \approx 0.933$ (the probability of a profitable day) or dividing by the variance $800^2$ instead of the standard deviation.`,
    fastPath: String.raw`$z = -1.5$; $1 - 0.9332 \approx 0.067$.`,
    variation: "What daily profit level is exceeded on only 5% of days?",
    variationAnswer: String.raw`$1200 + 1.645 \cdot 800 \approx 2516$ dollars.`,
    verifiedBy: ["formula", "simulation"],
  },
  {
    id: "m5-p16",
    module: 5,
    kind: "practice",
    difficulty: 3,
    tags: ["normal"],
    minutes: 2,
    title: "Fill times in an asymmetric band",
    prompt: String.raw`The time a bottling line takes to fill one bottle is normally distributed with mean 42 seconds and standard deviation 6 seconds. What fraction of fills take between 36 and 54 seconds? The 68-95-99.7 rule is accurate enough; a table is fine too.`,
    answer: {
      type: "numeric",
      value: normalCdf(2) - normalCdf(-1),
      exact: String.raw`\Phi(2) - \Phi(-1) \approx 0.9772 - 0.1587 = 0.8186 \ (\text{rule: } 0.34 + 0.475 = 0.815)`,
      tolerance: 0.005,
    },
    hints: [
      "Convert both endpoints to z-scores. The band is not symmetric about the mean.",
      String.raw`36 is one standard deviation below the mean; 54 is two above.`,
      String.raw`Half of the 68% band plus half of the 95% band: $0.34 + 0.475$.`,
    ],
    solution: String.raw`Standardise the endpoints: $z_1 = (36 - 42)/6 = -1$ and $z_2 = (54 - 42)/6 = 2$. We want $P(-1 < Z < 2) = \Phi(2) - \Phi(-1)$.

With the 68-95-99.7 rule: the interval from the mean to one standard deviation above holds half of 68%, that is 34%, and by symmetry so does the interval from one standard deviation below to the mean. The interval from the mean to two standard deviations above holds half of 95%, that is 47.5%. Our band runs from $-1\sigma$ to $+2\sigma$, so it holds $0.34 + 0.475 = 0.815$.

With a table: $\Phi(2) \approx 0.9772$ and $\Phi(-1) = 1 - \Phi(1) \approx 0.1587$, so the fraction is $\approx 0.8186$. The rule's 0.815 is off by about 0.004, which is the rounding inside "68" and "95".

Answer: $\Phi(2) - \Phi(-1) \approx 0.819$ (about 82% of fills).`,
    steps: [
      "z-scores: 36 is -1 sigma, 54 is +2 sigma.",
      "Left half: 34% (half of 68%).",
      "Right part: 47.5% (half of 95%).",
      "Add: about 0.815, or 0.819 from a table.",
    ],
    keyIdea: String.raw`Split an asymmetric band at the mean and use half of 68%, 95% or 99.7% on each side.`,
    commonMistake: String.raw`Treating the band as symmetric and answering 0.68 or 0.95, or adding 68% and 95% without halving.`,
    fastPath: String.raw`$34 + 47.5 = 81.5$ percent.`,
    variation: "What fraction of fills take longer than 54 seconds?",
    variationAnswer: String.raw`$1 - \Phi(2) \approx 0.0228$; the rule says 2.5%.`,
    verifiedBy: ["formula", "simulation"],
  },
  {
    id: "m5-p17",
    module: 5,
    kind: "practice",
    difficulty: 3,
    tags: ["normal", "coins", "binomial"],
    minutes: 4,
    title: "Sixty-six heads from 120 flips",
    prompt: String.raw`A fair coin is flipped 120 times. Use the normal approximation with a continuity correction to estimate the probability of at least 66 heads. Report the approximate value.`,
    answer: {
      type: "numeric",
      value: 1 - normalCdf((65.5 - 60) / Math.sqrt(30)),
      exact: String.raw`1 - \Phi\!\left(\frac{65.5 - 60}{\sqrt{30}}\right) = 1 - \Phi(1.004) \approx 0.1577`,
      tolerance: 0.005,
    },
    hints: [
      "Find the mean and variance of the head count first.",
      String.raw`Mean $60$, variance $120 \cdot \tfrac14 = 30$. 'At least 66' on the integers becomes 'more than 65.5' on the continuum.`,
      String.raw`$z = (65.5 - 60)/\sqrt{30} \approx 1.004$; the answer is $1 - \Phi(1.004)$.`,
    ],
    solution: String.raw`Let $H$ be the number of heads: binomial with $n = 120$ and $p = 1/2$, so $E[H] = 60$ and $\operatorname{Var}(H) = 120 \cdot \frac12 \cdot \frac12 = 30$, giving $\sigma = \sqrt{30} \approx 5.477$.

$H$ is an integer, while the normal is continuous. The event $H \ge 66$ covers the integer 66 and everything above; in the continuous picture each integer $k$ owns the interval $[k - 0.5, k + 0.5]$, so the matching continuous event is $X \ge 65.5$. That half step is the continuity correction.

Standardise: $z = \frac{65.5 - 60}{\sqrt{30}} \approx 1.004$. Then $P(H \ge 66) \approx 1 - \Phi(1.004) \approx 1 - 0.8423 = 0.1577$.

For comparison, the exact binomial sum gives $0.15765$ too; the approximation is essentially perfect here because $n$ is large, $p = 1/2$ keeps the distribution symmetric, and the correction removes the bias. Without the correction you would use $z = 6/5.477 = 1.095$ and get $0.137$, a noticeably worse answer. Answer: $1 - \Phi(1.004) \approx 0.158$.`,
    steps: [
      "Mean 60, variance 30, sigma about 5.48.",
      "Continuity correction: 'at least 66' becomes 'above 65.5'.",
      "z = 5.5/5.48, about 1.00.",
      "Upper tail: 1 - Phi(1.00), about 0.158.",
    ],
    keyIdea: String.raw`Normal approximation to a count: mean $np$, variance $np(1-p)$, and shift the boundary half a unit toward the event.`,
    commonMistake: String.raw`Skipping the half-step (z = 1.095, answer 0.137), or shifting the wrong way to 66.5 (z = 1.187, answer 0.118).`,
    fastPath: String.raw`$\sigma \approx 5.5$; $5.5/5.5 = 1$; one-sigma upper tail is 16%.`,
    variation: "Estimate the probability that the number of heads is between 55 and 65 inclusive.",
    variationAnswer: String.raw`$\Phi\!\left(\frac{65.5 - 60}{\sqrt{30}}\right) - \Phi\!\left(\frac{54.5 - 60}{\sqrt{30}}\right) = 2\Phi(1.004) - 1 \approx 0.685$.`,
    family: "normal-approximation",
    verifiedBy: ["formula", "simulation"],
  },
  {
    id: "m5-p18",
    module: 5,
    kind: "practice",
    difficulty: 3,
    tags: ["lln", "variance", "dice"],
    minutes: 3,
    title: "Enough rolls to pin down the mean",
    prompt: String.raw`You estimate the mean of a fair six-sided die by averaging $n$ independent rolls. What is the smallest $n$ for which the standard error of the sample mean (the standard deviation of the average) is at most 0.05?`,
    answer: {
      type: "numeric",
      value: 1167,
      exact: String.raw`n \ge \frac{\sigma^2}{0.05^2} = \frac{35/12}{0.0025} = 1166.\overline{6}, \quad n = 1167`,
      unit: "rolls",
    },
    hints: [
      "The variance of an average of n independent copies is the single-roll variance divided by n.",
      String.raw`Standard error $= \sigma/\sqrt{n}$ with $\sigma^2 = 35/12$. Set it at most $0.05$.`,
      String.raw`$n \ge (35/12)/0.0025 = 1166.67$; round up.`,
    ],
    solution: String.raw`Let $\bar X_n = (X_1 + \dots + X_n)/n$. By independence, $\operatorname{Var}(X_1 + \dots + X_n) = n\sigma^2$ with $\sigma^2 = 35/12$, and dividing by $n$ scales the variance by $1/n^2$, so $\operatorname{Var}(\bar X_n) = \sigma^2 / n$. The standard error is $\sigma/\sqrt n$.

We need $\sigma/\sqrt n \le 0.05$, that is $n \ge \sigma^2 / 0.05^2 = \frac{35/12}{0.0025} = \frac{35}{0.03} = 1166.67$.

Since $n$ must be a whole number of rolls, the smallest acceptable value is $n = 1167$. Check: $\sqrt{(35/12)/1167} = \sqrt{0.0024993} \approx 0.049993 \le 0.05$, while $n = 1166$ gives $0.050014$, just over.

This is the law of large numbers with a number attached: the average converges to 3.5, and the standard error shrinks like $1/\sqrt n$, so cutting the error in half costs four times the rolls. Answer: $1167$ rolls.`,
    steps: [
      "Var(mean of n) = sigma^2 / n, so SE = sigma / sqrt(n).",
      "Set sigma^2 / n <= 0.0025 with sigma^2 = 35/12.",
      "n >= 1166.67; round up to 1167.",
    ],
    keyIdea: String.raw`Standard error of a mean is $\sigma/\sqrt n$; quadruple the sample to halve the error.`,
    commonMistake: String.raw`Dividing the variance by $n$ but forgetting the square root (solving $\sigma^2/n \le 0.05$ gives 59), or rounding $1166.67$ down.`,
    fastPath: String.raw`$2.9167 / 0.0025 = 1166.7$, so 1167.`,
    variation: "The die is replaced by a fair coin scored 0 or 1. How many flips make the standard error of the proportion of heads at most 0.05?",
    variationAnswer: String.raw`$\sigma^2 = 1/4$, so $n \ge 0.25/0.0025 = 100$ flips.`,
    verifiedBy: ["formula", "exhaustive-search"],
  },

  // ---------------------------------------------------------------- difficulty 4
  {
    id: "m5-p19",
    module: 5,
    kind: "practice",
    difficulty: 4,
    tags: ["variance", "lln"],
    minutes: 3,
    title: "The worst case twelve away from the mean",
    prompt: String.raw`A random variable $X$ has mean 50 and standard deviation 4, and nothing else about its distribution is known. What is the largest possible value of $P(|X - 50| \ge 12)$?`,
    answer: { type: "numeric", value: 1 / 9, exact: String.raw`\frac{1}{k^2} \text{ with } k = 3: \ \frac{1}{9} \approx 0.111` },
    hints: [
      "With only the mean and variance known, Chebyshev's inequality is the tool.",
      String.raw`Twelve is $k = 12/4 = 3$ standard deviations. Chebyshev gives $P(|X - \mu| \ge k\sigma) \le 1/k^2$.`,
      String.raw`Check that the bound is attainable: put mass $1/18$ at 38 and at 62, and the rest at 50.`,
    ],
    solution: String.raw`Twelve units is $k = 12/4 = 3$ standard deviations. Chebyshev's inequality states that for any distribution with finite variance, $P(|X - \mu| \ge k\sigma) \le 1/k^2$, so here $P(|X - 50| \ge 12) \le 1/9$.

Why it holds: $\sigma^2 = E[(X - \mu)^2] \ge E[(X-\mu)^2 \mathbf 1_{\{|X - \mu| \ge k\sigma\}}] \ge k^2\sigma^2 \, P(|X - \mu| \ge k\sigma)$. Divide by $k^2\sigma^2$.

Why $1/9$ is the largest *possible* value and not just an upper bound: construct a distribution that reaches it. Put probability $1/18$ at $38$, probability $1/18$ at $62$, and probability $8/9$ at $50$. The mean is $50$ by symmetry. The variance is $\frac{1}{18} \cdot 144 + \frac{1}{18} \cdot 144 + \frac{8}{9}\cdot 0 = 16$, so the standard deviation is 4 as required, and $P(|X - 50| \ge 12) = 1/9$ exactly.

For a normal distribution the same event has probability $0.0027$, forty times smaller. Chebyshev is loose for nice distributions, but it is the best you can say with only two moments. Answer: $\frac{1}{9} \approx 0.111$.`,
    steps: [
      "Convert 12 to k = 3 standard deviations.",
      "Chebyshev: P(|X - mu| >= k sigma) <= 1/k^2 = 1/9.",
      "Show 1/9 is attained by a three-point distribution with mass 1/18 at each extreme.",
    ],
    keyIdea: String.raw`Chebyshev's $1/k^2$ is sharp: a three-point distribution with mass $1/(2k^2)$ at $\mu \pm k\sigma$ attains it.`,
    commonMistake: String.raw`Answering with the normal tail $0.0027$ (the problem does not say normal), or using $1/k$ instead of $1/k^2$.`,
    fastPath: String.raw`$k = 3$, so $1/9$.`,
    variation: "Now you also learn that X is symmetric about 50 and has only one mode. Can the probability still be as large as 1/9?",
    variationAnswer: String.raw`No. For unimodal symmetric distributions the Vysochanskij-Petunin bound $4/(9k^2) = 4/81 \approx 0.049$ applies.`,
    verifiedBy: ["formula", "enumeration"],
  },
  {
    id: "m5-p20",
    module: 5,
    kind: "practice",
    difficulty: 4,
    tags: ["normal", "dice", "variance"],
    minutes: 4,
    title: "Fifty dice, total at least 190",
    prompt: String.raw`Fifty fair six-sided dice are rolled. Use the normal approximation with a continuity correction to estimate the probability that the total is at least 190. Report the approximate value.`,
    answer: {
      type: "numeric",
      value: 1 - normalCdf((189.5 - 175) / Math.sqrt(50 * DIE_VAR)),
      exact: String.raw`1 - \Phi\!\left(\frac{189.5 - 175}{\sqrt{50 \cdot 35/12}}\right) = 1 - \Phi(1.2007) \approx 0.1149`,
      tolerance: 0.005,
    },
    hints: [
      "Mean and variance of the total: multiply the one-die values by 50.",
      String.raw`Mean $175$, variance $50 \cdot 35/12 \approx 145.8$, $\sigma \approx 12.08$. Move the boundary to $189.5$.`,
      String.raw`$z = 14.5/12.08 \approx 1.20$; look up the upper tail.`,
    ],
    solution: String.raw`Let $S$ be the total. Each die has mean $3.5$ and variance $35/12$, and the dice are independent, so $E[S] = 50 \cdot 3.5 = 175$ and $\operatorname{Var}(S) = 50 \cdot \frac{35}{12} = \frac{875}{6} \approx 145.83$, giving $\sigma = \sqrt{145.83} \approx 12.076$.

$S$ is a sum of fifty independent identically distributed terms, so the central limit theorem says it is close to normal. Because $S$ takes integer values, the event $S \ge 190$ is matched to the continuous event $X \ge 189.5$: the integer 190 owns the interval from 189.5 to 190.5.

Standardise: $z = \frac{189.5 - 175}{12.076} \approx 1.2007$. The upper tail is $1 - \Phi(1.2007) \approx 1 - 0.8851 = 0.1149$.

The exact probability, obtained by convolving the die distribution fifty times, is $0.1153$; the approximation is off by $0.0003$. Without the continuity correction you would use $z = 15/12.076 = 1.242$ and get $0.107$, an error of $0.008$, roughly twenty-five times larger. Answer: $1 - \Phi(1.20) \approx 0.115$.`,
    steps: [
      "Mean 175, variance 50 times 35/12, sigma about 12.08.",
      "Continuity correction: 'at least 190' becomes 'above 189.5'.",
      "z = 14.5/12.08, about 1.20.",
      "Upper tail 1 - Phi(1.20), about 0.115.",
    ],
    keyIdea: String.raw`Variance of a dice total is $n \cdot 35/12$; then z-score the half-corrected boundary.`,
    commonMistake: String.raw`Using $\sigma = 50 \cdot \sqrt{35/12}$ (scaling the standard deviation by $n$ instead of $\sqrt n$), which makes the tail look like 43%.`,
    fastPath: String.raw`$\sigma^2 \approx 146$, $\sigma \approx 12$; $14.5/12 \approx 1.2$; tail about $0.115$.`,
    variation: "Estimate the probability that the total of 50 dice lies within 10 of its mean, that is between 165 and 185 inclusive.",
    variationAnswer: String.raw`$\Phi(10.5/12.076) - \Phi(-10.5/12.076) = 2\Phi(0.8695) - 1 \approx 0.615$.`,
    family: "normal-approximation",
    verifiedBy: ["formula", "simulation"],
  },
  {
    id: "m5-p21",
    module: 5,
    kind: "practice",
    difficulty: 4,
    tags: ["variance", "poisson", "expectation"],
    minutes: 5,
    title: "Variance of a day with a random number of trades",
    prompt: String.raw`The number of trades a desk makes in a day is Poisson with mean 4. Independently of everything else, each trade earns $+2$ with probability $\tfrac12$ or $-1$ with probability $\tfrac12$. What is the variance of the day's total profit?`,
    answer: {
      type: "numeric",
      value: 10,
      exact: String.raw`E[N]\operatorname{Var}(X) + \operatorname{Var}(N)(E[X])^2 = 4 \cdot \tfrac94 + 4 \cdot \tfrac14 = 10`,
    },
    hints: [
      "The number of terms in the sum is random, so you cannot simply add 4 variances.",
      String.raw`Condition on $N$: $\operatorname{Var}(T) = E[\operatorname{Var}(T \mid N)] + \operatorname{Var}(E[T \mid N])$.`,
      String.raw`$E[T \mid N] = N \cdot \tfrac12$ and $\operatorname{Var}(T \mid N) = N \cdot \tfrac94$. Now use $E[N] = \operatorname{Var}(N) = 4$.`,
    ],
    solution: String.raw`Let $N$ be the number of trades and $T = X_1 + \dots + X_N$ the total. Each trade has $E[X] = \frac12(2) + \frac12(-1) = \frac12$ and $E[X^2] = \frac12(4) + \frac12(1) = \frac52$, so $\operatorname{Var}(X) = \frac52 - \frac14 = \frac94$.

Condition on $N$. Given $N = n$, the total is a sum of $n$ independent copies of $X$, so $E[T \mid N] = \frac{N}{2}$ and $\operatorname{Var}(T \mid N) = \frac{9N}{4}$.

The law of total variance says $\operatorname{Var}(T) = E[\operatorname{Var}(T \mid N)] + \operatorname{Var}(E[T \mid N])$. The first term is $E[9N/4] = \frac94 \cdot 4 = 9$. The second is $\operatorname{Var}(N/2) = \frac14 \operatorname{Var}(N) = \frac14 \cdot 4 = 1$, using the fact that a Poisson variable has variance equal to its mean.

So $\operatorname{Var}(T) = 9 + 1 = 10$. The general form, worth memorising, is $\operatorname{Var}(T) = E[N]\operatorname{Var}(X) + \operatorname{Var}(N)(E[X])^2$. The second term is the price of not knowing how many trades there will be; it vanishes only when the trades have zero mean. For comparison, the mean profit is $E[N]E[X] = 2$. Answer: $10$.`,
    steps: [
      "Per-trade mean 1/2 and variance 9/4.",
      "Condition on N: E[T|N] = N/2, Var(T|N) = 9N/4.",
      "Law of total variance: E[9N/4] + Var(N/2) = 9 + 1.",
      "Answer 10.",
    ],
    keyIdea: String.raw`Random number of terms: $\operatorname{Var}(T) = E[N]\operatorname{Var}(X) + \operatorname{Var}(N)(E[X])^2$.`,
    commonMistake: String.raw`Plugging in $N = 4$ as if it were fixed and answering $4 \cdot 9/4 = 9$, which drops the variance contributed by the random count.`,
    fastPath: String.raw`$E[N]\operatorname{Var}X + \operatorname{Var}N\,(EX)^2 = 4(2.25) + 4(0.25) = 10$.`,
    variation: "The number of trades is fixed at exactly 4 instead of Poisson. What is the variance of the total now?",
    variationAnswer: String.raw`$4 \cdot \frac94 = 9$: the extra unit in the original came entirely from the randomness of $N$.`,
    family: "variance-of-sums",
    verifiedBy: ["dp", "formula", "simulation"],
  },
  {
    id: "m5-p22",
    module: 5,
    kind: "practice",
    difficulty: 4,
    tags: ["covariance", "dice", "independence"],
    minutes: 4,
    title: "Which event ignores the first die?",
    prompt: String.raw`Two fair six-sided dice are rolled. Let $A$ be the event that the first die shows a 6. For which of the following events $B$ is the covariance of the indicators of $A$ and $B$ equal to zero?`,
    answer: {
      type: "choice",
      options: [
        "The total of the two dice is exactly 7.",
        "The total of the two dice is exactly 8.",
        "The larger of the two dice is a 6.",
        "The total of the two dice is at least 10.",
      ],
      correct: 0,
    },
    hints: [
      String.raw`For indicators, $\operatorname{Cov}(\mathbf 1_A, \mathbf 1_B) = P(A \cap B) - P(A)P(B)$. Zero covariance means independence of the two events.`,
      String.raw`$P(A) = 1/6$. For each candidate $B$, compute $P(B)$ and $P(A \cap B)$ by counting the 36 outcomes.`,
      String.raw`A total of 7 can be completed from any first die with exactly one second-die value, so $P(B \mid A) = P(B) = 1/6$.`,
    ],
    solution: String.raw`For indicator variables, $E[\mathbf 1_A \mathbf 1_B] = P(A \cap B)$, so $\operatorname{Cov}(\mathbf 1_A, \mathbf 1_B) = P(A \cap B) - P(A)P(B)$, which is zero exactly when $A$ and $B$ are independent events. Here $P(A) = 1/6$. Check each candidate.

Total is 7. There are 6 outcomes with total 7, so $P(B) = 1/6$. With the first die a 6, the total is 7 only if the second die is 1: $P(A \cap B) = 1/36 = P(A)P(B)$. Covariance zero. Whatever the first die shows, exactly one value of the second die completes a 7, so knowing the first die tells you nothing about this event.

Total is 8. Five outcomes give 8, $P(B) = 5/36$; with the first die a 6 the second must be 2, $P(A \cap B) = 1/36$. Covariance $1/36 - 5/216 = 1/216 > 0$. A first-die 6 makes 8 more likely because a total of 8 cannot be completed from a first die of 1.

Larger die is 6. $P(B) = 11/36$ and $P(A \cap B) = P(A) = 1/6$, since a first-die 6 forces the maximum to be 6. Covariance $6/36 - 11/216 = 25/216 > 0$.

Total at least 10. Six outcomes, $P(B) = 1/6$; with first die 6, the second must be 4, 5 or 6, $P(A \cap B) = 3/36$. Covariance $3/36 - 1/36 = 2/36 > 0$.

Only the first candidate is uncorrelated with $A$. The general fact: for two dice, the event "total equals $s$" is independent of the first die exactly when $s = 7$, because 7 is the only total reachable from every first-die value in exactly one way.`,
    steps: [
      "Covariance of indicators is P(A and B) - P(A)P(B).",
      "P(A) = 1/6; count outcomes for each B and for A-and-B.",
      "Total 7: 1/36 - (1/6)(1/6) = 0.",
      "Totals 8, max 6, total >= 10: all positive.",
    ],
    keyIdea: String.raw`Zero covariance between indicators is the same as independence of the events: compare $P(A \cap B)$ with $P(A)P(B)$.`,
    commonMistake: String.raw`Assuming any event that involves both dice must be correlated with the first die, or picking 'larger die is 6' because it 'depends on the max, not on die one'.`,
    fastPath: String.raw`Ask which event has the same conditional probability whatever the first die shows. Only 'total is 7' passes: one completing value every time.`,
    variation: "Replace the dice by two fair eight-sided dice. Which total is independent of the first die?",
    variationAnswer: String.raw`Total 9: it is the only total reachable from every first-die value 1 to 8 in exactly one way, so $P(B \mid A) = P(B) = 1/8$.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m5-p23",
    module: 5,
    kind: "practice",
    difficulty: 4,
    tags: ["poisson", "binomial"],
    minutes: 4,
    title: "Flawed pieces of a cut cable",
    prompt: String.raw`Flaws along a cable occur as a Poisson process at an average rate of 0.4 flaws per metre. A 5-metre length is cut into five 1-metre pieces. What is the probability that exactly one of the five pieces contains at least one flaw?`,
    answer: {
      type: "numeric",
      value: 5 * (1 - Math.exp(-0.4)) * Math.pow(Math.exp(-0.4), 4),
      exact: String.raw`5\,q\,(1-q)^4 \text{ with } q = 1 - e^{-0.4}: \ 5(1 - e^{-0.4})e^{-1.6} \approx 0.3328`,
    },
    hints: [
      "Work piece by piece: what is the chance that a single 1-metre piece has at least one flaw?",
      String.raw`Disjoint stretches of a Poisson process are independent, so the five pieces are five independent trials with success probability $q = 1 - e^{-0.4}$.`,
      String.raw`The number of flawed pieces is binomial$(5, q)$; you want exactly one success.`,
    ],
    solution: String.raw`The number of flaws in a single 1-metre piece is Poisson with mean $0.4$, so a piece is flawed (has at least one flaw) with probability $q = 1 - e^{-0.4} \approx 1 - 0.6703 = 0.3297$.

Counts of a Poisson process on disjoint intervals are independent, so the five pieces are five independent Bernoulli trials, each flawed with probability $q$. The number of flawed pieces $K$ is binomial with $n = 5$ and $p = q$.

Therefore $P(K = 1) = \binom{5}{1} q (1 - q)^4 = 5(1 - e^{-0.4})(e^{-0.4})^4 = 5(1 - e^{-0.4})e^{-1.6}$. Numerically, $e^{-1.6} \approx 0.2019$, so $P(K = 1) \approx 5 \cdot 0.3297 \cdot 0.2019 \approx 0.3328$.

Notice the trap: "exactly one flawed piece" is not "exactly one flaw". A piece with three flaws still counts once, and two flaws in different pieces count as two pieces. The exact-one-flaw probability for the whole cable would be $2e^{-2} \approx 0.271$, a different question. Answer: $5(1 - e^{-0.4})e^{-1.6} \approx 0.333$.`,
    steps: [
      "One piece has at least one flaw with probability q = 1 - e^(-0.4), about 0.33.",
      "Disjoint pieces are independent: binomial(5, q).",
      "P(exactly one) = 5 q (1 - q)^4.",
      "Answer about 0.333.",
    ],
    keyIdea: String.raw`Poisson counts on disjoint stretches are independent, so 'pieces with at least one event' form a binomial.`,
    commonMistake: String.raw`Computing the probability of exactly one flaw in the whole 5 metres ($2e^{-2} \approx 0.271$) instead of exactly one flawed piece.`,
    fastPath: String.raw`$q \approx 0.33$, $(1-q)^4 = e^{-1.6} \approx 0.20$; $5 \cdot 0.33 \cdot 0.20 \approx 0.33$.`,
    variation: "What is the probability that at least one piece is flawed?",
    variationAnswer: String.raw`$1 - (1-q)^5 = 1 - e^{-2} \approx 0.865$, the same as 'at least one flaw in the whole cable', as it must be.`,
    verifiedBy: ["formula", "simulation"],
  },

  // ---------------------------------------------------------------- difficulty 5
  {
    id: "m5-p24",
    module: 5,
    kind: "practice",
    difficulty: 5,
    tags: ["variance", "indicators", "covariance"],
    minutes: 6,
    title: "Variance of the correct deliveries",
    prompt: String.raw`Seven signed contracts must go to seven different clients. An intern puts the contracts into the seven addressed envelopes uniformly at random, one contract per envelope. Let $M$ be the number of clients who receive their own contract. What is $\operatorname{Var}(M)$?`,
    answer: {
      type: "numeric",
      value: 1,
      exact: String.raw`\sum_i \operatorname{Var}(I_i) + \sum_{i \ne j}\operatorname{Cov}(I_i, I_j) = \tfrac67 + 42\left(\tfrac{1}{42} - \tfrac{1}{49}\right) = 1`,
    },
    hints: [
      String.raw`Write $M = I_1 + \dots + I_7$ with $I_i$ the indicator that client $i$ gets their own contract. The indicators are not independent.`,
      String.raw`$\operatorname{Var}(M) = \sum_i \operatorname{Var}(I_i) + \sum_{i \ne j} \operatorname{Cov}(I_i, I_j)$. You need $P(I_i = 1) = 1/7$ and $P(I_i I_j = 1) = 1/(7 \cdot 6)$.`,
      String.raw`$\operatorname{Cov}(I_i, I_j) = \frac{1}{42} - \frac{1}{49}$, and there are $42$ ordered pairs.`,
    ],
    solution: String.raw`Let $I_i$ be 1 if client $i$ gets the right contract, so $M = I_1 + \dots + I_7$. A uniformly random assignment is a uniformly random permutation, so $P(I_i = 1) = 1/7$ for each $i$, and $E[M] = 7 \cdot \frac17 = 1$ by linearity.

For the variance we need the covariances, because the indicators are dependent. $\operatorname{Var}(I_i) = \frac17 \cdot \frac67 = \frac{6}{49}$. For $i \ne j$, both clients are correct when the permutation fixes two specified positions: $P(I_i = 1, I_j = 1) = \frac{5!}{7!} = \frac{1}{42}$. So $\operatorname{Cov}(I_i, I_j) = \frac{1}{42} - \frac{1}{49} = \frac{49 - 42}{42 \cdot 49} = \frac{7}{2058} = \frac{1}{294}$, a small positive number: one correct delivery leaves six contracts for six envelopes, which slightly raises the chance for everyone else.

Summing, $\operatorname{Var}(M) = 7 \cdot \frac{6}{49} + 7 \cdot 6 \cdot \frac{1}{294} = \frac{6}{7} + \frac{42}{294} = \frac67 + \frac17 = 1$.

The same calculation with $n$ clients gives $\operatorname{Var}(M) = \frac{n-1}{n} + n(n-1)\left(\frac{1}{n(n-1)} - \frac{1}{n^2}\right) = \frac{n-1}{n} + \frac1n = 1$ for every $n \ge 2$. Both the mean and the variance of the number of matches are exactly 1 whatever the size, which is the fingerprint of the Poisson(1) limit of this distribution. A direct count over the $7! = 5040$ permutations confirms it. Answer: $\operatorname{Var}(M) = 1$.`,
    steps: [
      "Write M as a sum of 7 indicators; E[M] = 1.",
      "Var(I_i) = (1/7)(6/7) = 6/49.",
      "P(both i and j correct) = 1/42, so Cov = 1/42 - 1/49 = 1/294.",
      "Var(M) = 7(6/49) + 42(1/294) = 6/7 + 1/7 = 1.",
    ],
    keyIdea: String.raw`Variance of a sum of indicators needs the pairwise probabilities; for random matchings the covariances add up to exactly $1/n$.`,
    commonMistake: String.raw`Treating the indicators as independent and answering $7 \cdot \frac17 \cdot \frac67 = \frac67$, or using $P(I_i I_j = 1) = 1/49$.`,
    fastPath: String.raw`Matches in a random permutation: mean 1, variance 1, for any $n \ge 2$.`,
    variation: "The intern now draws each contract's envelope independently and uniformly from all seven, so several contracts can share an envelope. What is the variance of the number of correct deliveries?",
    variationAnswer: String.raw`Now the indicators are independent: $M \sim \text{Binomial}(7, 1/7)$, so $\operatorname{Var}(M) = 7 \cdot \frac17 \cdot \frac67 = \frac67$.`,
    family: "fixed-points",
    verifiedBy: ["enumeration", "formula", "simulation"],
  },
  {
    id: "m5-p25",
    module: 5,
    kind: "practice",
    difficulty: 5,
    tags: ["variance", "geometric-dist", "dice", "expectation"],
    minutes: 7,
    title: "Variance of the total before the first six",
    prompt: String.raw`A fair six-sided die is rolled repeatedly until a 6 appears, and then you stop. Let $T$ be the sum of all the numbers rolled, including the final 6. What is $\operatorname{Var}(T)$?`,
    answer: {
      type: "numeric",
      value: 280,
      exact: String.raw`E[M]\operatorname{Var}(X) + \operatorname{Var}(M)(E[X])^2 = 5 \cdot 2 + 30 \cdot 3^2 = 280`,
    },
    hints: [
      "Split T into the constant 6 plus the sum of the non-six rolls. How many non-six rolls are there, and what does each look like?",
      String.raw`The number $M$ of non-six rolls is geometric on $\{0, 1, 2, \dots\}$ with $E[M] = 5$, $\operatorname{Var}(M) = 30$; each non-six roll is uniform on $\{1, \dots, 5\}$, independent of $M$.`,
      String.raw`Random number of terms: $\operatorname{Var}(\text{sum}) = E[M]\operatorname{Var}(X) + \operatorname{Var}(M)(E[X])^2$.`,
    ],
    solution: String.raw`Write $T = 6 + X_1 + \dots + X_M$, where $M$ is the number of rolls before the first 6 and $X_1, \dots, X_M$ are the values of those rolls. The constant 6 does not affect the variance.

Each roll is a 6 with probability $1/6$; otherwise it is uniform on $\{1, 2, 3, 4, 5\}$. The number of non-six rolls before the first 6 is geometric on $\{0, 1, 2, \dots\}$ with $P(M = m) = (5/6)^m (1/6)$, so $E[M] = \frac{1-p}{p} = 5$ and $\operatorname{Var}(M) = \frac{1-p}{p^2} = 30$. Crucially, the values of the non-six rolls are independent of how many there are: conditional on a roll not being a 6, its value is uniform on 1 to 5 regardless of anything else.

A non-six roll $X$ is uniform on five values: $E[X] = 3$ and $\operatorname{Var}(X) = \frac{5^2 - 1}{12} = 2$.

Now apply the law of total variance to $U = X_1 + \dots + X_M$. Given $M$, $E[U \mid M] = 3M$ and $\operatorname{Var}(U \mid M) = 2M$. So $\operatorname{Var}(U) = E[2M] + \operatorname{Var}(3M) = 2 \cdot 5 + 9 \cdot 30 = 10 + 270 = 280$.

Hence $\operatorname{Var}(T) = 280$, with $E[T] = 6 + 3 \cdot 5 = 21$ and a standard deviation of about $16.7$. Almost all of the variance ($270$ of $280$) comes from not knowing how long the game lasts, not from the values of individual rolls. Answer: $280$.`,
    steps: [
      "Decompose T = 6 + (sum of M non-six rolls).",
      "M is geometric on 0, 1, 2, ...: mean 5, variance 30.",
      "Each non-six roll is uniform on 1..5: mean 3, variance 2, independent of M.",
      "Var = E[M]Var(X) + Var(M)(E[X])^2 = 10 + 270 = 280.",
    ],
    keyIdea: String.raw`Separate the random count from the random terms; the count's variance enters multiplied by the squared mean of a term.`,
    commonMistake: String.raw`Treating the sum as having a fixed number of terms ($\operatorname{Var} = 5 \cdot 2 = 10$) or including the final 6 as a random term with variance.`,
    fastPath: String.raw`$M$: mean 5, variance 30. $X$: mean 3, variance 2. $5 \cdot 2 + 30 \cdot 9 = 280$.`,
    variation: "You stop at the first 6 as before, but T now counts only the number of rolls made (each roll adds 1). What is Var(T)?",
    variationAnswer: String.raw`$T$ is the geometric number of rolls with $p = 1/6$: $\operatorname{Var}(T) = (1-p)/p^2 = 30$.`,
    family: "variance-of-sums",
    verifiedBy: ["dp", "formula", "simulation"],
  },
  {
    id: "m5-p26",
    module: 5,
    kind: "practice",
    difficulty: 5,
    tags: ["variance", "indicators", "dice", "covariance"],
    minutes: 7,
    title: "Variance of the number of distinct faces",
    prompt: String.raw`A fair six-sided die is rolled 6 times. Let $D$ be the number of distinct faces that appear at least once. What is $\operatorname{Var}(D)$?`,
    answer: {
      type: "numeric",
      value: 36611855 / 60466176,
      exact: String.raw`6p(1-p) + 30(p_2 - p^2),\ p = 1 - \left(\tfrac56\right)^6,\ p_2 = 1 - 2\left(\tfrac56\right)^6 + \left(\tfrac23\right)^6; \ = \frac{36611855}{60466176} \approx 0.6055`,
    },
    hints: [
      String.raw`Write $D = I_1 + \dots + I_6$, where $I_f$ indicates that face $f$ appears at least once. $P(I_f = 1) = 1 - (5/6)^6$.`,
      String.raw`For the covariances you need $P(\text{both } f \text{ and } g \text{ appear}) = 1 - 2(5/6)^6 + (4/6)^6$ by inclusion-exclusion on the two 'missing' events.`,
      String.raw`$\operatorname{Var}(D) = 6\,p(1-p) + 6 \cdot 5\,(p_2 - p^2)$ with $p = 31031/46656$ and $p_2 = 19502/46656$.`,
    ],
    solution: String.raw`Let $I_f$ be the indicator that face $f$ shows up in at least one of the 6 rolls, so $D = I_1 + \dots + I_6$.

Face $f$ is missed by all six rolls with probability $(5/6)^6 = 15625/46656$, so $p = P(I_f = 1) = 1 - (5/6)^6 = 31031/46656 \approx 0.6651$ and $E[D] = 6p \approx 3.99$.

For two distinct faces $f$ and $g$, use inclusion-exclusion on the events "$f$ missing" and "$g$ missing": $P(\text{both appear}) = 1 - 2(5/6)^6 + (4/6)^6 = \frac{46656 - 31250 + 4096}{46656} = \frac{19502}{46656} \approx 0.4180$. Call this $p_2$.

The indicators are negatively correlated: $\operatorname{Cov}(I_f, I_g) = p_2 - p^2 \approx 0.4180 - 0.4424 = -0.0244$. Seeing face $f$ uses up a roll that could have shown $g$.

Now assemble the variance: $\operatorname{Var}(D) = \sum_f \operatorname{Var}(I_f) + \sum_{f \ne g} \operatorname{Cov}(I_f, I_g) = 6\,p(1-p) + 30\,(p_2 - p^2)$. Numerically, $6 \cdot 0.6651 \cdot 0.3349 \approx 1.3364$ and $30 \cdot (-0.02436) \approx -0.7309$, so $\operatorname{Var}(D) \approx 0.6055$. As an exact fraction over $6^{10}$ this is $\frac{36611855}{60466176}$.

The negative covariances matter: ignoring them would give $1.34$, more than double the truth. A brute-force pass over all $6^6 = 46656$ outcomes confirms $0.6055$. Answer: $\operatorname{Var}(D) = \frac{36611855}{60466176} \approx 0.606$.`,
    steps: [
      "D is a sum of six 'face appears' indicators.",
      "p = 1 - (5/6)^6, about 0.665.",
      "p_2 = P(two given faces both appear) = 1 - 2(5/6)^6 + (4/6)^6, about 0.418.",
      "Var(D) = 6p(1 - p) + 30(p_2 - p^2), about 0.606.",
    ],
    keyIdea: String.raw`Variance of a count of 'types seen' is indicator variances plus $n(n-1)$ negative covariances from inclusion-exclusion.`,
    commonMistake: String.raw`Dropping the covariance terms and answering $6p(1-p) \approx 1.34$, or computing $p_2$ as $p^2$ (which would make the covariance zero).`,
    fastPath: String.raw`$p \approx 0.665$, $p_2 \approx 0.418$: $6(0.665)(0.335) + 30(0.418 - 0.442) \approx 1.34 - 0.73 = 0.61$.`,
    variation: "What is Var(D) if the die is rolled only 2 times?",
    variationAnswer: String.raw`$D$ is 1 or 2: $P(D = 1) = 1/6$, so $\operatorname{Var}(D) = \frac16 \cdot \frac56 = \frac{5}{36} \approx 0.139$. The indicator formula gives the same with $p = 11/36$, $p_2 = 2/36$.`,
    family: "linearity-of-expectation",
    verifiedBy: ["enumeration", "formula", "simulation"],
  },

  // ---------------------------------------------------------------- lesson checks
  {
    id: "m5-lc1",
    module: 5,
    kind: "lessonCheck",
    difficulty: 1,
    tags: ["variance", "indicators"],
    minutes: 1,
    title: "Variance of an indicator",
    prompt: String.raw`An indicator variable equals 1 with probability 0.2 and 0 otherwise. What is its variance?`,
    answer: { type: "numeric", value: 0.16, exact: String.raw`p(1-p) = 0.2 \cdot 0.8 = 0.16` },
    hints: [
      "For a 0/1 variable, the square of the variable is the variable itself.",
      String.raw`So $E[X^2] = E[X] = p$. Subtract $p^2$.`,
      String.raw`$0.2 - 0.04$.`,
    ],
    solution: String.raw`Let $X$ be the indicator with $P(X = 1) = p = 0.2$. Then $E[X] = p$ and, because $X^2 = X$ for a 0/1 variable, $E[X^2] = p$ as well.

So $\operatorname{Var}(X) = E[X^2] - (E[X])^2 = p - p^2 = p(1-p) = 0.2 \cdot 0.8 = 0.16$. The standard deviation is $0.4$.

This $p(1-p)$ is the building block for every binomial variance, and it peaks at $p = 1/2$ with value $1/4$. Answer: $0.16$.`,
    steps: ["E[X] = p = 0.2.", "E[X^2] = p too, since X^2 = X.", "Var = p - p^2 = 0.16."],
    keyIdea: String.raw`An indicator has variance $p(1-p)$.`,
    commonMistake: String.raw`Answering $p = 0.2$ or $p^2 = 0.04$.`,
    fastPath: String.raw`$0.2 \times 0.8 = 0.16$.`,
    variation: "What probability p maximises the variance of an indicator, and what is that maximum?",
    variationAnswer: String.raw`$p = 1/2$, variance $1/4$.`,
    verifiedBy: ["formula", "enumeration"],
  },
  {
    id: "m5-lc2",
    module: 5,
    kind: "lessonCheck",
    difficulty: 1,
    tags: ["variance", "dice"],
    minutes: 1,
    title: "Variance of three dice",
    prompt: String.raw`Three independent fair six-sided dice are rolled. What is the variance of their total?`,
    answer: { type: "numeric", value: 3 * DIE_VAR, exact: String.raw`3 \cdot \frac{35}{12} = \frac{35}{4} = 8.75` },
    hints: [
      "Independent variances add.",
      String.raw`One die has variance $35/12$.`,
      String.raw`$3 \cdot 35/12$.`,
    ],
    solution: String.raw`The total is $X_1 + X_2 + X_3$ with the three dice independent, so the covariance terms vanish and $\operatorname{Var}(X_1 + X_2 + X_3) = \operatorname{Var}(X_1) + \operatorname{Var}(X_2) + \operatorname{Var}(X_3)$.

Each fair die has variance $35/12$, so the total has variance $3 \cdot \frac{35}{12} = \frac{35}{4} = 8.75$, and a standard deviation of about $2.96$ around the mean of $10.5$.

Compare with three times one die, $3X_1$, which has variance $9 \cdot \frac{35}{12} = 26.25$: adding independent copies grows the variance linearly, adding the same copy grows it quadratically. Answer: $\frac{35}{4} = 8.75$.`,
    steps: ["Independent dice: variances add.", "Each is 35/12.", "Total: 35/4 = 8.75."],
    keyIdea: String.raw`The variance of $n$ independent fair dice is $n \cdot 35/12$.`,
    commonMistake: String.raw`Multiplying by $3^2 = 9$ as if the total were $3X$, giving $26.25$.`,
    fastPath: String.raw`$35/4 = 8.75$.`,
    variation: "What is the standard deviation of the total of 12 fair dice?",
    variationAnswer: String.raw`$\sqrt{12 \cdot 35/12} = \sqrt{35} \approx 5.92$.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m5-lc3",
    module: 5,
    kind: "lessonCheck",
    difficulty: 2,
    tags: ["binomial", "variance"],
    minutes: 1,
    title: "Spread of a binomial count",
    prompt: String.raw`Twelve independent trials each succeed with probability $\tfrac14$. What is the standard deviation of the number of successes?`,
    answer: { type: "numeric", value: 1.5, exact: String.raw`\sqrt{np(1-p)} = \sqrt{12 \cdot \tfrac14 \cdot \tfrac34} = \sqrt{\tfrac94} = 1.5` },
    hints: [
      "The count is binomial. Write its variance first.",
      String.raw`$np(1-p) = 12 \cdot \frac14 \cdot \frac34$.`,
      String.raw`$\sqrt{9/4}$.`,
    ],
    solution: String.raw`The number of successes $K$ is binomial with $n = 12$ and $p = 1/4$. Its variance is $np(1-p) = 12 \cdot \frac14 \cdot \frac34 = \frac{9}{4}$.

The standard deviation is the square root: $\sqrt{9/4} = \frac32 = 1.5$.

The mean is $np = 3$, so a typical outcome is $3 \pm 1.5$ successes; seeing 6 or more would be two standard deviations out. Answer: $1.5$.`,
    steps: ["Binomial with n = 12, p = 1/4.", "Variance np(1 - p) = 9/4.", "Square root: 1.5."],
    keyIdea: String.raw`Binomial standard deviation is $\sqrt{np(1-p)}$.`,
    commonMistake: String.raw`Reporting the variance $2.25$ when the standard deviation was asked, or using $\sqrt{np} = \sqrt 3$.`,
    fastPath: String.raw`$12 \cdot 3/16 = 9/4$; root is $1.5$.`,
    variation: "How many trials would make the standard deviation equal to 3 with the same p?",
    variationAnswer: String.raw`$n \cdot \frac{3}{16} = 9$, so $n = 48$: quadrupling $n$ doubles the standard deviation.`,
    verifiedBy: ["formula", "enumeration"],
  },
  {
    id: "m5-lc4",
    module: 5,
    kind: "lessonCheck",
    difficulty: 2,
    tags: ["poisson"],
    minutes: 1,
    title: "At most one ticket in an hour",
    prompt: String.raw`Support tickets arrive as a Poisson process at an average of 3 per hour. What is the probability that at most one ticket arrives in the next hour?`,
    answer: { type: "numeric", value: 4 * Math.exp(-3), exact: String.raw`e^{-3}(1 + 3) = 4e^{-3} \approx 0.1991` },
    hints: [
      "'At most one' means zero or one. Add the two Poisson terms.",
      String.raw`$P(0) = e^{-3}$ and $P(1) = 3e^{-3}$.`,
      String.raw`$4e^{-3}$, with $e^{-3} \approx 0.0498$.`,
    ],
    solution: String.raw`The number of tickets in one hour is Poisson with mean $\lambda = 3$, so $P(k) = e^{-3} 3^k / k!$.

$P(\text{at most one}) = P(0) + P(1) = e^{-3} + 3e^{-3} = 4e^{-3}$.

Since $e^{-3} \approx 0.0498$, the probability is about $0.199$: roughly one hour in five is that quiet. Answer: $4e^{-3} \approx 0.199$.`,
    steps: ["lambda = 3 for one hour.", "P(0) + P(1) = e^(-3)(1 + 3).", "About 0.199."],
    keyIdea: String.raw`Poisson pmf $e^{-\lambda}\lambda^k/k!$; small counts are quick sums.`,
    commonMistake: String.raw`Forgetting the $P(0)$ term and answering $3e^{-3} \approx 0.149$.`,
    fastPath: String.raw`$4 \times 0.05 \approx 0.20$.`,
    variation: "What is the probability of at most one ticket in a 20-minute window?",
    variationAnswer: String.raw`$\lambda = 1$: $2e^{-1} \approx 0.736$.`,
    verifiedBy: ["formula", "simulation"],
  },
];
