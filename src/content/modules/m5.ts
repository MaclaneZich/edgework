import type { Lesson } from "../types";

/** Module 5 lesson: Variance, distributions, and approximations. */
export const lesson: Lesson = {
  intro: String.raw`Expected value tells you where a bet is centred. Variance tells you how wrong the centre can be on any given day, and that is the number a risk manager, a market maker and an interviewer all care about next. The classic escalation in a live interview is "what is the expected value?" followed immediately by "and the variance?" followed by "so how likely is a loss of more than X?". This module is built around that escalation.

The toolkit has three layers. First, variance itself: the two ways to compute it, how it behaves under scaling and shifting, and how it adds up across sums, which is where covariance enters. Second, the four distributions that cover almost every counting-and-waiting question on a trading test: binomial, geometric, Poisson and normal, each with its mean and variance memorised cold and its one defining property (independent trials, memorylessness, rare events, bell shape). Third, the approximations that let you answer a question about 50 dice or 200 tickets in thirty seconds: Poisson for rare events, normal with a continuity correction for sums, and the standard error of a mean as the law of large numbers with a number attached.

By the end you should be able to hear "fifty dice, total at least 190" and reply with a mean, a variance, a z-score and a tail probability without touching a calculator for the first three. The practice set escalates the same way an interviewer does: definitions, then sums and covariances, then the distributions, then the approximations, then two problems where the number of terms in the sum is itself random.`,

  cards: [
    {
      title: "Variance: two formulas, one meaning",
      body: String.raw`Variance is the expected squared distance from the mean: $\operatorname{Var}(X) = E[(X - \mu)^2]$. Expanding the square gives the computing form $E[X^2] - \mu^2$, which is almost always faster because $E[X^2]$ is just a weighted sum of squares.

- Standard deviation $\sigma = \sqrt{\operatorname{Var}(X)}$ is in the units of $X$; variance is in squared units. Interviewers ask for both, so hear which one.
- Shifting does nothing, scaling squares: $\operatorname{Var}(aX + b) = a^2 \operatorname{Var}(X)$, so $\operatorname{SD}(aX + b) = |a|\,\sigma$.
- An indicator with success probability $p$ has variance $p(1-p)$, at most $1/4$.
- Two outcomes $a$ and $b$ with probabilities $p$ and $1-p$: variance $p(1-p)(a-b)^2$. The spread is the gap times the Bernoulli factor.

Sanity check: variance is never negative, and $E[X^2]$ is never smaller than $\mu^2$. If you get either, a square was dropped.`,
      formula: String.raw`\operatorname{Var}(X) = E[(X-\mu)^2] = E[X^2] - \mu^2, \qquad \operatorname{Var}(aX + b) = a^2\operatorname{Var}(X)`,
      example: "A fair die: E[X^2] = 91/6, mu^2 = 49/4, so Var = 35/12 and sigma is about 1.71.",
    },
    {
      title: "Variance of sums and covariance",
      body: String.raw`For any two variables, $\operatorname{Var}(X + Y) = \operatorname{Var}(X) + \operatorname{Var}(Y) + 2\operatorname{Cov}(X, Y)$, where $\operatorname{Cov}(X, Y) = E[XY] - E[X]E[Y]$. Independent variables have zero covariance, so their variances simply add; this is the whole reason the variance of $n$ dice is $n \cdot 35/12$.

- $\operatorname{Cov}(X, X) = \operatorname{Var}(X)$, and covariance is linear in each slot: $\operatorname{Cov}(X, X + Y) = \operatorname{Var}(X) + \operatorname{Cov}(X, Y)$.
- $X + Y$ with independent copies has variance $2\sigma^2$; $X + X = 2X$ has variance $4\sigma^2$. Same mean, double the variance. This is the single most tested trap in the module.
- Correlation $\rho = \operatorname{Cov}(X,Y)/(\sigma_X \sigma_Y)$ lives in $[-1, 1]$ and is scale free. Two sums that share one of two iid terms have $\rho = 1/2$.
- For indicators, $\operatorname{Cov}(\mathbf 1_A, \mathbf 1_B) = P(A \cap B) - P(A)P(B)$: zero exactly when the events are independent.
- A sum of $n$ dependent indicators has variance $\sum_i p_i(1-p_i) + \sum_{i \ne j}(p_{ij} - p_i p_j)$; you need the pairwise probabilities, not just the singles.`,
      formula: String.raw`\operatorname{Var}\Bigl(\sum_i X_i\Bigr) = \sum_i \operatorname{Var}(X_i) + \sum_{i \ne j} \operatorname{Cov}(X_i, X_j)`,
      example: "Correct matches when seven contracts go into seven envelopes at random: mean 1 and, after the 42 small positive covariances, variance exactly 1.",
    },
    {
      title: "Binomial: counting successes",
      body: String.raw`$n$ independent trials, each a success with probability $p$. The number of successes $K$ has pmf $\binom{n}{k}p^k(1-p)^{n-k}$: the number of success patterns times the probability of one pattern.

- Mean $np$, variance $np(1-p)$, because $K$ is a sum of $n$ independent indicators.
- "At least $k$" with small $k$: complement, $1 - P(0) - \dots - P(k-1)$. "At least one": $1 - (1-p)^n$.
- The variance is largest at $p = 1/2$ and shrinks to zero at the ends; a fill rate of 0.35 across 40 venues has variance $40 \cdot 0.2275 = 9.1$.
- When the trials are *not* independent the mean is still $np$ (linearity) but the variance can be anything from nearly 0 (trials that offset each other) up to $n^2 p(1-p)$ (trials that all succeed or all fail together).`,
      formula: String.raw`P(K = k) = \binom{n}{k}p^k(1-p)^{n-k}, \qquad E[K] = np, \qquad \operatorname{Var}(K) = np(1-p)`,
      example: "Eight shots at 30%: P(exactly 3) = 56 (0.027)(0.168) is about 0.254.",
    },
    {
      title: "Geometric: waiting for the first success",
      body: String.raw`Repeat independent trials with success probability $p$ until the first success. The number of trials $N$ has $P(N = k) = (1-p)^{k-1}p$ and $P(N > k) = (1-p)^k$.

- Mean $1/p$, variance $(1-p)/p^2$, standard deviation $\sqrt{1-p}/p$, nearly as large as the mean. Waiting times are wide.
- **Memoryless:** given $N > k$, the remaining wait $N - k$ has the original distribution. Four failures do not make a success "due", and they do not change the variance of what is left.
- The count of *failures* before the first success, $M = N - 1$, has mean $(1-p)/p$ and the same variance. Read the question to see which is being asked.
- Waiting for a 6: mean 6 rolls, variance 30, so a wait of 15 or more rolls is only about 1.6 standard deviations out and happens about 8% of the time ($(5/6)^{14} \approx 0.078$).`,
      formula: String.raw`P(N = k) = (1-p)^{k-1}p, \qquad E[N] = \frac1p, \qquad \operatorname{Var}(N) = \frac{1-p}{p^2}`,
      example: "Yes with probability 0.15 per call, four nos so far: expected further calls still 1/0.15, about 6.7.",
    },
    {
      title: "Poisson: rare events at a steady rate",
      body: String.raw`Events that occur independently at an average rate, with no two at once, are counted by a Poisson variable: $P(k) = e^{-\lambda}\lambda^k/k!$ where $\lambda$ is the expected count in the window you are looking at.

- Mean $\lambda$, variance $\lambda$. If someone tells you a count has variance far from its mean, it is not Poisson.
- Rescale $\lambda$ with the window: 2.5 per minute is 1.25 per half minute. $P(\text{none}) = e^{-\lambda}$, so $P(\text{at least one}) = 1 - e^{-\lambda}$.
- **Binomial to Poisson:** when $n$ is large and $p$ small, Binomial$(n, p) \approx$ Poisson$(np)$. 200 tickets at a 1% error rate: $\lambda = 2$, and $P(\le 2) \approx 5e^{-2}$ matches the exact binomial to four decimals.
- Counts on disjoint intervals are independent. A 5-metre cable cut into five pieces gives five independent Poisson$(0.4)$ counts, so "pieces with a flaw" is binomial with $p = 1 - e^{-0.4}$.
- Useful values: $e^{-1} \approx 0.368$, $e^{-2} \approx 0.135$, $e^{-3} \approx 0.050$.`,
      formula: String.raw`P(K = k) = \frac{e^{-\lambda}\lambda^k}{k!}, \qquad E[K] = \operatorname{Var}(K) = \lambda`,
      example: "Rate 0.4 per metre, 5 metres: lambda = 2, so P(exactly two flaws) = 2e^(-2), about 0.271.",
    },
    {
      title: "The normal distribution and z-scores",
      body: String.raw`$X \sim N(\mu, \sigma^2)$ is the bell curve centred at $\mu$ with standard deviation $\sigma$. Every question about it reduces to one step: standardise to $Z = (X - \mu)/\sigma$ and look up $\Phi(z) = P(Z \le z)$.

- Symmetry: $\Phi(-z) = 1 - \Phi(z)$. Upper tails are $1 - \Phi(z)$.
- The 68-95-99.7 rule: about 68% of mass within $1\sigma$, 95% within $2\sigma$, 99.7% within $3\sigma$. One-sided tails: 16%, 2.5%, 0.15%.
- Table values worth knowing: $\Phi(1) = 0.841$, $\Phi(1.5) = 0.933$, $\Phi(1.645) = 0.95$, $\Phi(1.96) = 0.975$, $\Phi(2) = 0.977$, $\Phi(2.5) = 0.994$.
- Asymmetric bands split at the mean: from $-1\sigma$ to $+2\sigma$ holds $0.34 + 0.475 = 0.815$ by the rule, $0.819$ by the table.
- Sums of independent normals are normal, with means and variances adding.`,
      formula: String.raw`P(X \le x) = \Phi\!\left(\frac{x - \mu}{\sigma}\right), \qquad \Phi(-z) = 1 - \Phi(z)`,
      example: "Daily profit N(1200, 800^2): a loss is z = -1.5, probability 1 - 0.933 = 0.067.",
    },
    {
      title: "Normal approximation with a continuity correction",
      body: String.raw`A sum of many independent terms is approximately normal with the sum's mean and variance (the central limit theorem). To use it for a count or a dice total, do three things in order.

1. Mean and variance of the sum: $n\mu$ and $n\sigma^2$ for iid terms; for a binomial, $np$ and $np(1-p)$. Take the square root for $\sigma$ *after* multiplying by $n$.
2. Continuity correction: the integer $k$ owns $[k - 0.5, k + 0.5]$. "At least $k$" becomes $\ge k - 0.5$; "at most $k$" becomes $\le k + 0.5$; "exactly $k$" is the width-one interval.
3. Standardise the corrected boundary and read the table.

The correction matters: for 120 flips and "at least 66 heads", it moves the estimate from $0.137$ to $0.158$, and the exact answer is $0.158$. The approximation is excellent near the centre and for $p$ near $1/2$; far in the tails, or for a skewed binomial with $np(1-p) < 10$, trust it less.`,
      formula: String.raw`P(S \ge k) \approx 1 - \Phi\!\left(\frac{k - 0.5 - n\mu}{\sigma\sqrt n}\right)`,
      example: "Fifty dice, total at least 190: mean 175, sigma about 12.08, z = 14.5/12.08 = 1.20, tail about 0.115 (exact 0.1153).",
    },
    {
      title: "Law of large numbers, standard error, Chebyshev",
      body: String.raw`The average of $n$ iid draws has mean $\mu$ and variance $\sigma^2/n$, so its standard deviation, the **standard error**, is $\sigma/\sqrt n$. That is the law of large numbers with a rate: the average settles on $\mu$, and the error shrinks like $1/\sqrt n$. Halving the error costs four times the data.

- Sample size for a target standard error $s$: $n \ge \sigma^2/s^2$, rounded *up*. For a die and $s = 0.05$: $n \ge (35/12)/0.0025 = 1166.7$, so 1167 rolls.
- A sample proportion has standard error $\sqrt{p(1-p)/n} \le 1/(2\sqrt n)$; 2500 flips pin a probability to within about $0.01$ whatever $p$ is.
- **Chebyshev:** with only the mean and variance known, $P(|X - \mu| \ge k\sigma) \le 1/k^2$. It is sharp: a three-point distribution with mass $1/(2k^2)$ at each of $\mu \pm k\sigma$ attains it. For a normal the same event has probability far smaller ($0.0027$ versus $1/9$ at $k = 3$), so Chebyshev is the answer only when the distribution is unknown.`,
      formula: String.raw`\operatorname{SE}(\bar X_n) = \frac{\sigma}{\sqrt n}, \qquad P(|X - \mu| \ge k\sigma) \le \frac{1}{k^2}`,
      example: "Mean 50, SD 4, nothing else known: P(at least 12 away) can be as large as 1/9, and no larger.",
    },
    {
      title: "Quick sanity checks",
      body: String.raw`Carry these in your head and use them to catch errors before the interviewer does.

- Fair die: mean $3.5$, variance $35/12 \approx 2.92$, SD $\approx 1.71$. A total of $n$ dice has variance $35n/12$; the SD of 12 dice is $\sqrt{35} \approx 5.9$. A fair $m$-sided die has variance $(m^2 - 1)/12$.
- Fair coin: $n$ flips have variance $n/4$ and SD $\sqrt n / 2$; 100 flips, SD 5.
- Poisson: mean equals variance. Geometric: SD is almost the mean. Binomial: variance is below the mean by a factor $(1-p)$.
- Adding $n$ independent copies multiplies variance by $n$; adding the same copy $n$ times multiplies it by $n^2$.
- A random number of terms adds variance: $\operatorname{Var}(S_N) = E[N]\operatorname{Var}(X) + \operatorname{Var}(N)(E[X])^2$. Dropping the second term is the classic mistake in stopping-rule problems.
- A probability above 1, a negative variance, or a standard deviation larger than the range of the variable means a step is wrong.`,
      formula: String.raw`\operatorname{Var}(\text{total of } n \text{ dice}) = \frac{35n}{12}, \qquad \operatorname{Var}(S_N) = E[N]\operatorname{Var}(X) + \operatorname{Var}(N)\,(E[X])^2`,
      example: "Roll until the first 6 and add up everything: M non-six rolls (mean 5, variance 30), each mean 3 and variance 2, so the total has variance 5(2) + 30(9) = 280.",
    },
  ],

  workedExamples: [
    {
      title: "Thirty-six dice, total at least 140",
      prompt: String.raw`Thirty-six fair six-sided dice are rolled. Estimate the probability that the total is at least 140 using the normal approximation with a continuity correction.`,
      steps: [
        {
          text: "Mean and variance of the total come from one die times 36. One die has mean 3.5 and variance 35/12.",
          math: String.raw`E[S] = 36 \cdot 3.5 = 126, \qquad \operatorname{Var}(S) = 36 \cdot \frac{35}{12} = 105, \qquad \sigma = \sqrt{105} \approx 10.25`,
        },
        {
          text: "The total is an integer, so 'at least 140' on the integers corresponds to 'at least 139.5' on the continuous normal. The half step is the continuity correction.",
          math: String.raw`P(S \ge 140) \approx P(X \ge 139.5)`,
        },
        {
          text: "Standardise the corrected boundary.",
          math: String.raw`z = \frac{139.5 - 126}{10.25} \approx 1.317`,
        },
        {
          text: "Read the upper tail from the table. Phi(1.32) is about 0.9066.",
          math: String.raw`P(S \ge 140) \approx 1 - \Phi(1.317) \approx 0.094`,
        },
        {
          text: "Sanity check against the exact distribution (a 36-fold convolution): 0.0942. Without the correction, z = 14/10.25 = 1.366 and the estimate would be 0.086, noticeably worse.",
        },
      ],
      answer: String.raw`\approx 0.094 \ (\text{exact } 0.0942)`,
    },
    {
      title: "Five hundred cables, at most one failure",
      prompt: String.raw`A data centre installs 500 cables. Each fails within a year independently with probability 0.004. Estimate the probability that at most one cable fails, and compare with the exact value.`,
      steps: [
        {
          text: "The failure count is binomial with n = 500 and p = 0.004. The exact answer needs 0.996 to the 500th power; the Poisson approximation does not.",
          math: String.raw`\lambda = np = 500 \cdot 0.004 = 2`,
        },
        {
          text: "With n large and p small, the count is approximately Poisson with mean 2. Write the two terms you need.",
          math: String.raw`P(0) \approx e^{-2}, \qquad P(1) \approx 2e^{-2}`,
        },
        {
          text: "Add them. Since e^(-2) is about 0.1353, the sum is about 0.406.",
          math: String.raw`P(\le 1) \approx 3e^{-2} \approx 0.406`,
        },
        {
          text: "For comparison, the exact binomial terms are 0.996^500 = 0.1348 and 500(0.004)(0.996^499) = 0.2707, summing to 0.4055. The Poisson estimate is high by 0.0005, which is the usual direction: e^(-np) always exceeds (1 - p)^n, so Poisson slightly overstates the chance of very few events.",
          math: String.raw`P_{\text{exact}}(\le 1) = 0.996^{500} + 500(0.004)(0.996)^{499} \approx 0.4055`,
        },
      ],
      answer: String.raw`\approx 3e^{-2} \approx 0.406 \ (\text{exact } 0.4055)`,
    },
  ],

  tryIt: {
    prompt: String.raw`A fair coin is flipped three times. What is the variance of the number of heads?`,
    answer: { type: "numeric", value: 3 / 4, exact: String.raw`np(1-p) = 3 \cdot \tfrac12 \cdot \tfrac12 = \tfrac34` },
    solution: String.raw`The number of heads $H$ is binomial with $n = 3$ and $p = 1/2$, so $\operatorname{Var}(H) = np(1-p) = 3 \cdot \frac12 \cdot \frac12 = \frac34$.

Check from the distribution. $H$ takes the values $0, 1, 2, 3$ with probabilities $\frac18, \frac38, \frac38, \frac18$. The mean is $\frac{0 + 3 + 6 + 3}{8} = \frac{12}{8} = 1.5$. The second moment is $E[H^2] = \frac{0 + 3 + 12 + 9}{8} = \frac{24}{8} = 3$. So $\operatorname{Var}(H) = 3 - 1.5^2 = 3 - 2.25 = 0.75$.

Both routes give $\frac34$. The standard deviation is $\sqrt{0.75} \approx 0.87$ heads around a mean of $1.5$. Answer: $\frac34 = 0.75$.`,
  },

  checkIds: ["m5-lc1", "m5-lc2", "m5-lc3", "m5-lc4"],

  formulas: [
    {
      name: "Variance",
      latex: String.raw`\operatorname{Var}(X) = E[(X-\mu)^2] = E[X^2] - \mu^2`,
      note: "Use the second form for computation; the standard deviation is its square root and shares the units of X.",
    },
    {
      name: "Scaling and shifting",
      latex: String.raw`\operatorname{Var}(aX + b) = a^2 \operatorname{Var}(X), \qquad \operatorname{SD}(aX+b) = |a|\,\sigma`,
      note: "Constants added vanish; constants multiplied come out squared in the variance.",
    },
    {
      name: "Variance of a sum",
      latex: String.raw`\operatorname{Var}(X + Y) = \operatorname{Var}(X) + \operatorname{Var}(Y) + 2\operatorname{Cov}(X, Y)`,
      note: "Independent terms simply add; X + X has four times the variance of X, X + Y (independent copy) has two.",
    },
    {
      name: "Covariance and correlation",
      latex: String.raw`\operatorname{Cov}(X,Y) = E[XY] - E[X]E[Y], \qquad \rho = \frac{\operatorname{Cov}(X,Y)}{\sigma_X \sigma_Y}`,
      note: "Bilinear in each slot and Cov(X, X) = Var(X); for indicators it is P(A and B) - P(A)P(B).",
    },
    {
      name: "Variance of a sum of indicators",
      latex: String.raw`\operatorname{Var}\Bigl(\sum_i I_i\Bigr) = \sum_i p_i(1-p_i) + \sum_{i \ne j}\bigl(p_{ij} - p_i p_j\bigr)`,
      note: "Needs the pairwise probabilities p_ij; fixed points of a random permutation have variance exactly 1.",
    },
    {
      name: "Binomial",
      latex: String.raw`P(K=k) = \binom{n}{k}p^k(1-p)^{n-k}, \qquad E[K] = np, \qquad \operatorname{Var}(K) = np(1-p)`,
      note: "n independent trials with success probability p; 'at least k' for small k goes through the complement.",
    },
    {
      name: "Geometric",
      latex: String.raw`P(N=k) = (1-p)^{k-1}p, \qquad E[N] = \frac1p, \qquad \operatorname{Var}(N) = \frac{1-p}{p^2}`,
      note: "Trials up to and including the first success; memoryless, so past failures do not change the remaining wait.",
    },
    {
      name: "Poisson",
      latex: String.raw`P(K=k) = \frac{e^{-\lambda}\lambda^k}{k!}, \qquad E[K] = \operatorname{Var}(K) = \lambda`,
      note: "Rare events at a steady rate; lambda scales with the window; approximates Binomial(n, p) with lambda = np when p is small.",
    },
    {
      name: "Normal z-score",
      latex: String.raw`P(X \le x) = \Phi\!\left(\frac{x-\mu}{\sigma}\right), \qquad \Phi(-z) = 1 - \Phi(z)`,
      note: "68-95-99.7 within 1, 2, 3 sigma; Phi(1.645) = 0.95, Phi(1.96) = 0.975.",
    },
    {
      name: "Normal approximation with continuity correction",
      latex: String.raw`P(S \ge k) \approx 1 - \Phi\!\left(\frac{k - 0.5 - n\mu}{\sigma\sqrt n}\right), \qquad P(S \le k) \approx \Phi\!\left(\frac{k + 0.5 - n\mu}{\sigma\sqrt n}\right)`,
      note: "Sums of many iid terms or binomial counts; move the integer boundary half a unit toward the event.",
    },
    {
      name: "Standard error of a mean",
      latex: String.raw`\operatorname{SE}(\bar X_n) = \frac{\sigma}{\sqrt n}, \qquad n \ge \frac{\sigma^2}{s^2}`,
      note: "The law of large numbers with a rate; the second form is the sample size for a target standard error s (round up).",
    },
    {
      name: "Chebyshev's inequality",
      latex: String.raw`P(|X - \mu| \ge k\sigma) \le \frac{1}{k^2}`,
      note: "Any distribution with finite variance; sharp for a three-point distribution with mass 1/(2k^2) at mu plus or minus k sigma.",
    },
    {
      name: "Random number of terms",
      latex: String.raw`E[S_N] = E[N]E[X], \qquad \operatorname{Var}(S_N) = E[N]\operatorname{Var}(X) + \operatorname{Var}(N)(E[X])^2`,
      note: "Sum of N iid terms with N independent of the terms (compound Poisson, totals until a stopping rule).",
    },
  ],

  outro: String.raw`Interviewers use this module as a ladder. The first rung is expectation, which you answered in Module 4. The second is "and what is the variance?", where they are checking whether you know that independent variances add, that scaling squares, and that a random number of terms contributes its own variance. The third rung is a tail probability: "how often does the total exceed 190?" or "how likely is a losing day?", where they want to see a z-score with a continuity correction, or a Poisson sum, produced without hesitation. Candidates who stall on the second rung rarely get asked the third.

On the timed test the distribution questions are quick if you know the mean-and-variance table cold: $np$ and $np(1-p)$; $1/p$ and $(1-p)/p^2$; $\lambda$ and $\lambda$; and for $n$ dice, $3.5n$ and $35n/12$. Say which distribution you are in before you compute anything, check whether the question wants a variance or a standard deviation, and when you see "at least" with a large $n$, reach for a complement or an approximation rather than a sum.

Practise next: redo the covariance problems until $X + X$ versus $X + Y$ is reflexive, then the two problems with a random number of terms (the Poisson trading day and the total before the first six), since the law of total variance is the step most candidates have never written down. Module 6 moves to first-step analysis, where the expected waits you met here (geometric, memoryless) become the base case for recursions on patterns and random walks.`,
};
