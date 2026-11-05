import type { Lesson } from "../types";

/** Module 4 lesson: Expectation and linearity. */
export const lesson: Lesson = {
  intro: String.raw`Expected value is the number a trading desk cares about most: the fair price of a bet, the average fill count, the mean number of defaults in a book. Half of the probability questions on the test and in interviews end with "what is the expected number of ...", and the fastest candidates never touch a distribution. They write the quantity as a sum of simple pieces and add the pieces' means.

That move is linearity of expectation, and its power comes from one fact that surprises people: it does not need independence. Overlapping events, cards drawn without replacement, people fighting over the same seat: none of it matters for the mean. Pair linearity with indicator variables (a 1 when an event happens, a 0 when it does not) and you have a machine that turns counting questions into one-line sums.

This lesson builds that machine and adds the two other tools you need for expectations: the tail-sum formula, which handles maxima, minima and waiting times, and conditioning by cases. You will finish able to price simple games, compute expected fixed points, matches, runs and empty bins, solve coupon-collector problems in all their disguises, and read off expected order statistics of uniforms without an integral.`,

  cards: [
    {
      title: "Expectation is a weighted average",
      body: String.raw`The expected value of a discrete random variable is its probability-weighted average: $E[X] = \sum_x x\,P(X = x)$. For a continuous variable replace the sum by $\int x f(x)\,dx$.

Two readings matter in interviews. **Fair price**: a game is worth its expected payout; pay less and you have an edge. **Long-run average**: over many independent repetitions the sample mean settles near $E[X]$.

Expectation is a number, not a likely outcome: a fair die has $E[X] = 3.5$, a value it never shows.`,
      formula: String.raw`E[X] = \sum_x x\,P(X = x)`,
      example: "One roll of a fair die: (1 + 2 + 3 + 4 + 5 + 6)/6 = 3.5.",
    },
    {
      title: "Linearity: no independence required",
      body: String.raw`For any random variables $X$ and $Y$ and constants $a, b$: $E[aX + bY] = a\,E[X] + b\,E[Y]$. It extends to any finite sum. The proof is one line: expand $E[X + Y]$ over the joint distribution and the inner sums collapse to the marginals.

Nothing about dependence enters. The total of two dice glued together, two hands dealt from the same deck, two tickets in the same raffle: the expectation of the sum is still the sum of the expectations.

What *does* need independence is the product rule $E[XY] = E[X]E[Y]$ and the additivity of variances. Keep the two lists separate in your head.`,
      formula: String.raw`E\left[\sum_i X_i\right] = \sum_i E[X_i] \quad \text{(always)}`,
      example: "Three dice total 10.5 on average because each contributes 3.5; the joint distribution is never needed.",
    },
    {
      title: "Indicator variables: the universal trick",
      body: String.raw`An indicator $I_A$ is 1 when event $A$ happens and 0 otherwise. Its expectation is simply $E[I_A] = P(A)$.

Recipe for "expected number of ...": name the things being counted, attach an indicator to each, compute the probability of each one, add. Dependence between the indicators is irrelevant.

- Fixed points of a shuffle of $n$ cards: $n$ positions, each matching with probability $1/n$, so the expected count is 1 for every $n$.
- Empty bins when $m$ balls land in $n$ bins: $n(1 - 1/n)^m$.
- Adjacent equal letters in a random string of $L$ letters from an alphabet of size $a$: $(L - 1)/a$.`,
      formula: String.raw`E\left[\sum_k I_{A_k}\right] = \sum_k P(A_k)`,
      example: "Six balls dropped at random into four bins: expected empty bins 4(3/4)^6 = 729/1024, about 0.71.",
    },
    {
      title: "The tail-sum formula",
      body: String.raw`For a random variable taking values in $\{0, 1, 2, \dots\}$, $E[X] = \sum_{k \ge 1} P(X \ge k)$. Each unit of $X$ is counted once by every tail that reaches it. The continuous version is $E[X] = \int_0^\infty P(X > t)\,dt$ for $X \ge 0$.

Use it whenever $P(X \ge k)$ or $P(X \le k)$ is easier than $P(X = k)$. That is the case for maxima ($P(\max \le k)$ is a product), minima ($P(\min \ge k)$ is a product) and waiting times ($P(T > k)$ is "no success in the first $k$ trials").

Watch the start of the sum: the $k = 1$ term is $P(X \ge 1)$, often equal to 1, and dropping it is the classic slip.`,
      formula: String.raw`E[X] = \sum_{k=1}^{\infty} P(X \ge k) = \sum_{k=0}^{\infty} P(X > k)`,
      example: "Geometric wait with success probability p: the tails (1 - p)^(k - 1) sum to 1/p.",
    },
    {
      title: "Coupon collector: a sum of geometric waits",
      body: String.raw`Drawing uniformly from $n$ types, how long until you hold all $n$? Split the wait into stages. Holding $j$ types, a draw is new with probability $(n - j)/n$, so that stage is a geometric wait with mean $n/(n - j)$.

Adding the stages gives $E[T] = n(1 + 1/2 + \cdots + 1/n) = nH_n \approx n\ln n + 0.577n + 0.5$. To see all four suits drawing cards with replacement, $4H_4 = 25/3 \approx 8.33$ draws.

To collect only $k$ of the $n$ types, stop the sum early: $\sum_{j=0}^{k-1} n/(n - j)$. With unequal probabilities the stages no longer work; write the completion time as a maximum of first-appearance times and use inclusion-exclusion with $E[\min(T_i, T_j)] = 1/(p_i + p_j)$.`,
      formula: String.raw`E[T_n] = n\sum_{j=1}^{n}\frac{1}{j} = nH_n`,
      example: "The final coupon alone costs n draws on average, more than the first half of the set combined (about 0.69n).",
    },
    {
      title: "Expected maximum and minimum of dice",
      body: String.raw`For $n$ fair dice, $P(\max \le k) = (k/6)^n$ because every die must be at most $k$. So $P(\max \ge k) = 1 - ((k-1)/6)^n$ and the tail sum gives $E[\max] = \sum_{k=1}^{6}\left(1 - ((k-1)/6)^n\right) = 6 - \sum_{j=0}^{5}(j/6)^n$.

Four dice: $6 - 979/1296 = 6797/1296 \approx 5.24$. The minimum follows by the mirror symmetry $k \leftrightarrow 7 - k$: $E[\min] = 7 - E[\max]$ for the same number of dice, so four dice have $E[\min] = 2275/1296 \approx 1.76$.

With two dice there is a second reason for $E[\max] + E[\min] = 7$: the pointwise identity $\max + \min = X + Y$, which has no analogue for three or more dice. With more dice the middle order statistics need their own tail sums: $P(\text{second largest} \ge k) = P(\text{at least two dice} \ge k)$.`,
      formula: String.raw`E[\max] = \sum_{k=1}^{6}\left(1 - \left(\tfrac{k-1}{6}\right)^n\right)`,
      example: "Four dice: 6 - (0 + 1 + 16 + 81 + 256 + 625)/1296 = 6797/1296, about 5.24.",
    },
    {
      title: "Order statistics of uniforms",
      body: String.raw`Drop $n$ independent uniform points on $[0, 1]$ and sort them. Together with the endpoints they cut the interval into $n + 1$ gaps whose joint distribution is symmetric under relabelling, so every gap has mean $1/(n + 1)$.

Hence the $k$-th smallest point sits $k$ gaps in: $E[U_{(k)}] = k/(n + 1)$. Minimum $1/(n + 1)$, maximum $n/(n + 1)$, range $(n - 1)/(n + 1)$. Formally $U_{(k)}$ is Beta$(k, n + 1 - k)$.

Scale for other intervals: a uniform on $[a, b]$ is $a + (b - a)U$, so the smallest of $n$ quotes uniform on $[a, b]$ averages $a + (b - a)/(n + 1)$.`,
      formula: String.raw`E[U_{(k)}] = \frac{k}{n + 1}`,
      example: "Cheapest of four quotes uniform on [30, 50]: 30 + 20/5 = 34.",
    },
    {
      title: "Conditional expectation by cases",
      body: String.raw`When a process branches at the start, split on the branch: $E[X] = \sum_i E[X \mid \text{case}_i]\,P(\text{case}_i)$. Each conditional expectation is usually a one-liner.

Example: pick one of four coins, three fair and one two-headed, and flip it five times. Given fair: 2.5 heads; given two-headed: 5. So $E[\text{heads}] = \tfrac{3}{4}\cdot \tfrac{5}{2} + \tfrac{1}{4}\cdot 5 = \tfrac{25}{8}$.

Linearity often offers a second route: compute one flip's unconditional heads probability, $\tfrac{3}{4}\cdot\tfrac{1}{2} + \tfrac{1}{4} = \tfrac{5}{8}$, and multiply by five. When both routes are available, use one to check the other.`,
      formula: String.raw`E[X] = \sum_i E[X \mid C_i]\,P(C_i)`,
      example: "A geometric wait is this formula in disguise: E[T] = 1 + (1 - p) E[T].",
    },
    {
      title: "When linearity is not enough",
      body: String.raw`Linearity gives you the mean and nothing else. Questions about the spread of a count, the probability it is zero, or its full distribution need more: covariances between indicators (for variance), inclusion-exclusion (for probabilities of unions), or recursion (for waiting times with structure).

Nonlinear functions break the shortcut. $E[f(X)] \ne f(E[X])$ in general; for a convex $f$, Jensen's inequality says $E[f(X)] \ge f(E[X])$. A game that pays $60/X$ on a die roll is worth $24.5$, not $60/3.5 \approx 17.1$.

Maxima are not linear either: $E[\max(X, Y)] \ge \max(E[X], E[Y])$, with equality only when one variable is almost surely at least the other. And products need independence: $E[XY] = E[X]E[Y]$ can fail badly for dependent variables while $E[X + Y] = E[X] + E[Y]$ never does.`,
      formula: String.raw`E[f(X)] \ge f(E[X]) \quad \text{for convex } f`,
      example: "The expected larger of two spins of a 1-to-4 wheel is 3.125, not 2.5: taking a max shifts the mean up.",
    },
  ],

  workedExamples: [
    {
      title: "Lit blocks on a small board",
      prompt: "A 3 by 3 board of lights has each light on independently with probability 1/2. A 2 by 2 block is 'lit' if all four of its lights are on. What is the expected number of lit 2 by 2 blocks?",
      steps: [
        {
          text: "Name what is being counted: the 2 by 2 blocks. On a 3 by 3 board there are 4 of them (top-left, top-right, bottom-left, bottom-right).",
        },
        {
          text: String.raw`Attach an indicator to each block: $I_b = 1$ if all four lights in block $b$ are on.`,
          math: String.raw`N = I_1 + I_2 + I_3 + I_4`,
        },
        {
          text: String.raw`Compute one probability: four independent lights all on has probability $(1/2)^4$.`,
          math: String.raw`P(I_b = 1) = \tfrac{1}{16}`,
        },
        {
          text: "Add. The blocks overlap (the centre light belongs to all four), so the indicators are dependent, but linearity does not care.",
          math: String.raw`E[N] = 4 \cdot \tfrac{1}{16} = \tfrac{1}{4}`,
        },
        {
          text: "Sanity check the scale: a quarter of a block on average means most boards have no lit block at all, which fits a 1/16 chance per block.",
        },
      ],
      answer: String.raw`E[N] = \tfrac{1}{4}`,
    },
    {
      title: "The larger of two spins",
      prompt: "A fair wheel has four equal sectors labelled 1, 2, 3, 4. Spin it twice independently. What is the expected value of the larger of the two results?",
      steps: [
        {
          text: String.raw`Let $M$ be the larger result. Finding $P(M = k)$ directly is fiddly; $P(M \le k)$ is easy because both spins must be at most $k$.`,
          math: String.raw`P(M \le k) = \left(\tfrac{k}{4}\right)^2`,
        },
        {
          text: String.raw`Convert to tails: $P(M \ge k) = 1 - P(M \le k - 1)$.`,
          math: String.raw`P(M \ge k) = 1 - \left(\tfrac{k-1}{4}\right)^2`,
        },
        {
          text: String.raw`Write the expectation as a tail sum over $k = 1, 2, 3, 4$.`,
          math: String.raw`E[M] = \sum_{k=1}^{4} P(M \ge k)`,
        },
        {
          text: String.raw`Evaluate the four tails: $1$, $1 - 1/16$, $1 - 4/16$, $1 - 9/16$.`,
          math: String.raw`E[M] = 4 - \tfrac{0 + 1 + 4 + 9}{16} = 4 - \tfrac{14}{16} = \tfrac{25}{8}`,
        },
        {
          text: String.raw`Check with the pmf: $P(M = k) = (2k - 1)/16$, so $E[M] = (1 + 6 + 15 + 28)/16 = 50/16 = 25/8$.`,
        },
      ],
      answer: String.raw`E[M] = \tfrac{25}{8} = 3.125`,
    },
  ],

  tryIt: {
    prompt: String.raw`You roll a fair six-sided die showing $X$ and are paid $60/X$ dollars. What is the fair price to play?`,
    answer: {
      type: "numeric",
      value: 49 / 2,
      exact: String.raw`10\left(1 + \tfrac{1}{2} + \tfrac{1}{3} + \tfrac{1}{4} + \tfrac{1}{5} + \tfrac{1}{6}\right) = \tfrac{49}{2} = 24.5`,
      unit: "dollars",
    },
    solution: String.raw`The fair price is $E[60/X]$, not $60/E[X]$. The six payouts are $60, 30, 20, 15, 12, 10$, each with probability $1/6$, so $E[60/X] = (60 + 30 + 20 + 15 + 12 + 10)/6 = 147/6 = 49/2 = 24.5$ dollars.

The tempting shortcut $60/3.5 \approx 17.1$ is wrong by more than 7 dollars. The function $x \mapsto 60/x$ is convex, so Jensen's inequality guarantees $E[60/X] > 60/E[X]$: the small faces pay out disproportionately.`,
  },

  checkIds: ["m4-lc1", "m4-lc2", "m4-lc3", "m4-lc4"],

  formulas: [
    { name: "Expected value (discrete)", latex: String.raw`E[X] = \sum_x x\,P(X = x)`, note: "Probability-weighted average; the fair price of a game is its expected payout." },
    { name: "Linearity", latex: String.raw`E[aX + bY] = aE[X] + bE[Y]`, note: "Always true; no independence needed." },
    { name: "Indicator expectation", latex: String.raw`E[I_A] = P(A)`, note: "Turn 'expected number of ...' into a sum of event probabilities." },
    { name: "Tail-sum formula", latex: String.raw`E[X] = \sum_{k \ge 1} P(X \ge k)`, note: "Non-negative integer X; use when tails are easier than the pmf." },
    { name: "Tail integral", latex: String.raw`E[X] = \int_0^\infty P(X > t)\,dt`, note: "Continuous non-negative X, e.g. minima and maxima of uniforms." },
    { name: "Geometric wait", latex: String.raw`E[T] = \frac{1}{p}`, note: "Expected trials until the first success, counting the success." },
    { name: "Coupon collector", latex: String.raw`E[T_n] = nH_n = n\sum_{j=1}^{n}\frac{1}{j}`, note: "Draws to see all n equally likely types; about n ln n + 0.577n." },
    { name: "Partial coupon collector", latex: String.raw`E[T_{k \text{ of } n}] = \sum_{j=0}^{k-1}\frac{n}{n - j}`, note: "Draws to hold k distinct types out of n." },
    { name: "Expected max of n dice", latex: String.raw`E[\max] = \sum_{k=1}^{6}\left(1 - \left(\tfrac{k-1}{6}\right)^n\right)`, note: "Tail sum of a maximum; E[min] = 7 - E[max]." },
    { name: "Uniform order statistics", latex: String.raw`E[U_{(k)}] = \frac{k}{n + 1}`, note: "k-th smallest of n uniforms on [0, 1]; range has mean (n - 1)/(n + 1)." },
    { name: "Conditioning by cases", latex: String.raw`E[X] = \sum_i E[X \mid C_i]\,P(C_i)`, note: "Split on the first branch of the process." },
    { name: "Jensen's inequality", latex: String.raw`E[f(X)] \ge f(E[X]) \text{ for convex } f`, note: "E[1/X] > 1/E[X]; E[max] >= max of the means." },
  ],

  outro: String.raw`Interviewers rarely stop at the expectation. The standard escalations are: "now give me the variance" (indicators again, but you need the pairwise probabilities $P(A_i \cap A_j)$ for the covariances), "change the payout" (a nonlinear payout kills the shortcut, so recompute from the distribution or spot a convexity argument), "is it more or less than ..." (Jensen, or the fact that maxima push means up), and "give me a bound" (Markov's inequality $P(X \ge a) \le E[X]/a$ is the one-line answer). Expect to be asked what changes without replacement or with a biased coin; usually the per-item probability is all that moves.

Practise saying the decomposition out loud: "I will count this as a sum of indicators, one per position, each with probability one over n." When you hear "expected number of", reach for indicators; when you hear "expected maximum" or "how long until", reach for tail sums; when the process starts with a branch, condition on it. Module 5 picks up the variance thread, and module 6 handles the waiting-time questions where linearity alone runs out of road.`,
};
