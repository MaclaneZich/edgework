import type { Problem } from "../types";

/**
 * Module 6: First-step analysis and recursion.
 * 28 practice problems (d1: 3, d2: 7, d3: 9, d4: 6, d5: 3) and four lesson checks.
 * Every answer is confirmed by independent routes in content/verify/m6.ts.
 */
export const problems: Problem[] = [
  // ---------------------------------------------------------------- difficulty 1
  {
    id: "m6-p01",
    module: 6,
    kind: "practice",
    difficulty: 1,
    tags: ["first-step", "dice", "expectation"],
    minutes: 2,
    title: "Leaving the start square",
    prompt: String.raw`In a board game you may only move your piece off the start square once you roll a 6 on a fair six-sided die. You roll once per turn, and the rolls are independent. What is the expected number of rolls you make up to and including the roll that frees your piece?`,
    answer: { type: "numeric", value: 6, exact: String.raw`\frac{1}{1/6} = 6` },
    hints: [
      "Call the unknown expectation $E$ and think about what the first roll does to the situation.",
      "After a failed roll you are in exactly the same position as before, so the remaining expected number of rolls is again $E$.",
      String.raw`$E = 1 + \frac{5}{6}E$. Solve for $E$.`,
    ],
    solution: String.raw`Let $E$ be the expected number of rolls needed. Condition on the first roll. It costs one roll whatever happens. With probability $\frac{1}{6}$ it is a 6 and you are done; with probability $\frac{5}{6}$ it is not, and because the rolls are independent the situation is identical to the one you started in, so you expect $E$ further rolls.

That gives the first-step equation $E = 1 + \frac{5}{6}E$. Subtracting, $\frac{1}{6}E = 1$, so $E = 6$.

The same number comes from the geometric distribution: the number of trials until the first success, when each trial succeeds independently with probability $p$, has mean $\frac{1}{p}$. Here $p = \frac{1}{6}$ and the mean is 6. The first-step equation is the better habit to build, because it keeps working when the trials stop being identical. Answer: $6$ rolls.`,
    steps: [
      "Name the unknown expectation E.",
      "Condition on the first roll: success with probability 1/6, otherwise back to the start.",
      "Write E = 1 + (5/6)E and solve to get 6.",
    ],
    keyIdea: "After a failure the process restarts from scratch, so the same unknown appears on both sides of the equation.",
    commonMistake: String.raw`Answering $\frac{5}{6} \cdot 6 = 5$ by thinking the final roll should not count, or answering 3 by halving the number of faces.`,
    fastPath: "A success probability of 1 in 6 means 6 attempts on average. Say it and move on.",
    variation: "You need to roll a 6 on each of two dice at the same time to leave the start square. What is the expected number of turns?",
    variationAnswer: String.raw`Each turn succeeds with probability $\frac{1}{36}$, so the expected number of turns is $36$.`,
    verifiedBy: ["recursion", "simulation"],
  },
  {
    id: "m6-p02",
    module: 6,
    kind: "practice",
    difficulty: 1,
    tags: ["gamblers-ruin", "first-step", "coins"],
    minutes: 2,
    title: "Three chips against seven",
    prompt: String.raw`You and a friend play a fair game: each round a fair coin is flipped and the loser hands the winner one chip. You start with 3 chips and your friend starts with 7, and you keep playing until one of you holds all 10 chips. What is the probability that you end up with all 10?`,
    answer: { type: "numeric", value: 3 / 10, exact: String.raw`\frac{3}{10} = 0.3` },
    hints: [
      "Let $p_k$ be your probability of winning everything when you hold $k$ chips. Write the first-step relation between $p_k$, $p_{k-1}$ and $p_{k+1}$.",
      String.raw`$p_k = \frac{1}{2}p_{k-1} + \frac{1}{2}p_{k+1}$ means $p_k$ is the average of its neighbours, so the $p_k$ lie on a straight line.`,
      "A straight line through $p_0 = 0$ and $p_{10} = 1$ gives $p_k = k/10$.",
    ],
    solution: String.raw`Let $p_k$ be the probability that you eventually hold all 10 chips when you currently hold $k$. The boundary values are $p_0 = 0$ (you are out) and $p_{10} = 1$ (you have everything).

Condition on the next flip. With probability $\frac{1}{2}$ you win a chip and move to $k + 1$; with probability $\frac{1}{2}$ you lose one and move to $k - 1$. So for $1 \le k \le 9$, $p_k = \frac{1}{2}p_{k-1} + \frac{1}{2}p_{k+1}$. Rearranged, $p_{k+1} - p_k = p_k - p_{k-1}$: the differences between consecutive values are all equal, which says the sequence is an arithmetic progression, a straight line in $k$.

A straight line with $p_0 = 0$ and $p_{10} = 1$ is $p_k = \frac{k}{10}$. With $k = 3$ your chance is $\frac{3}{10}$.

A sanity check that interviewers like: the game is fair, so your expected final holding equals your current holding, $10 \cdot p_3 + 0 \cdot (1 - p_3) = 3$, which again gives $p_3 = 0.3$. Answer: $\frac{3}{10} = 0.3$.`,
    steps: [
      "Define p_k as the win probability from k chips, with p_0 = 0 and p_10 = 1.",
      "Condition on one flip: p_k is the average of p_(k-1) and p_(k+1).",
      "Conclude the values are linear in k and read off p_3 = 3/10.",
    ],
    keyIdea: "In a fair game the win probability is linear in your stake: your share of the total pot.",
    commonMistake: String.raw`Answering $\frac{1}{2}$ because each flip is fair; the flips are fair but the starting stakes are not.`,
    fastPath: "Fair game: probability of taking the pot equals your fraction of the chips, 3 out of 10.",
    variation: "Same game, but you start with 3 chips and your friend has 97. What is your chance of winning everything, and what is your friend's?",
    variationAnswer: String.raw`$\frac{3}{100}$ for you and $\frac{97}{100}$ for your friend; the fair-game linearity does not care how lopsided the stakes are.`,
    family: "gamblers-ruin",
    verifiedBy: ["recursion", "simulation"],
  },
  {
    id: "m6-p03",
    module: 6,
    kind: "practice",
    difficulty: 1,
    tags: ["recursion"],
    minutes: 2,
    title: "Five days, no back-to-back alerts",
    prompt: String.raw`A risk system labels each trading day either "alert" or "quiet". Over a stretch of 5 consecutive days, how many different label sequences are there in which no two consecutive days are both labelled "alert"?`,
    answer: { type: "numeric", value: 13, exact: String.raw`a_5 = 13 \quad (a_n = a_{n-1} + a_{n-2},\ a_1 = 2,\ a_2 = 3)` },
    hints: [
      "Let $a_n$ be the number of valid sequences of length $n$. Split by the label of the last day.",
      "If the last day is quiet, the first $n - 1$ days are any valid sequence. If it is an alert, the day before must be quiet, and the first $n - 2$ days are any valid sequence.",
      "So $a_n = a_{n-1} + a_{n-2}$ with $a_1 = 2$ and $a_2 = 3$. Walk it up to $n = 5$.",
    ],
    solution: String.raw`Let $a_n$ be the number of label sequences of length $n$ with no two consecutive alerts. Condition on the last label.

If day $n$ is quiet, there is no constraint linking it to anything, so days $1$ to $n - 1$ form any valid sequence of length $n - 1$: $a_{n-1}$ options. If day $n$ is an alert, then day $n - 1$ must be quiet, and days $1$ to $n - 2$ form any valid sequence of length $n - 2$: $a_{n-2}$ options. So $a_n = a_{n-1} + a_{n-2}$.

The base cases: $a_1 = 2$ (either label) and $a_2 = 3$ (all four pairs except alert-alert). Then $a_3 = 5$, $a_4 = 8$, $a_5 = 13$. These are Fibonacci numbers shifted by two places.

As a check, $a_5$ can also be counted by the number of alerts: 0 alerts (1 way), 1 alert (5 ways), 2 non-adjacent alerts ($\binom{4}{2} = 6$ ways), 3 non-adjacent alerts in 5 days (only positions 1, 3, 5: 1 way). Total $1 + 5 + 6 + 1 = 13$. Answer: $13$.`,
    steps: [
      "Define a_n as the count of valid sequences of length n.",
      "Split on the last day: quiet gives a_(n-1), alert forces a quiet before it and gives a_(n-2).",
      "Use a_1 = 2, a_2 = 3 and iterate to a_5 = 13.",
    ],
    keyIdea: "Condition on the last symbol: the recursion is Fibonacci because an alert forces the previous symbol.",
    commonMistake: "Starting the recursion from $a_1 = 1, a_2 = 2$ (the plain Fibonacci numbers) and reporting 8 instead of 13.",
    fastPath: "No-two-consecutive counts are Fibonacci shifted by two: 2, 3, 5, 8, 13. Five days gives 13.",
    variation: "How many sequences of 5 days have no two consecutive alerts and at least one alert?",
    variationAnswer: "Remove the all-quiet sequence: $13 - 1 = 12$.",
    verifiedBy: ["enumeration", "dp"],
  },

  // ---------------------------------------------------------------- difficulty 2
  {
    id: "m6-p04",
    module: 6,
    kind: "practice",
    difficulty: 2,
    tags: ["patterns", "first-step", "expectation"],
    minutes: 3,
    title: "Up tick then down tick",
    prompt: String.raw`A price feed moves one tick each second, up or down with probability $\frac{1}{2}$ each, independently of the past. A strategy fires at the first moment an up move is immediately followed by a down move. What is the expected number of moves observed up to and including the down move that fires the strategy?`,
    answer: { type: "numeric", value: 4, exact: String.raw`2 + 2 = 4` },
    hints: [
      "Track progress with two states: no up move pending, or the most recent move was up.",
      "From the pending-up state, a down move finishes and an up move keeps you in the same state. Write that expectation first.",
      String.raw`If $E_1$ is the expected remaining moves once an up has happened, $E_1 = 1 + \frac{1}{2}E_1$, so $E_1 = 2$; then $E_0 = 1 + \frac{1}{2}E_1 + \frac{1}{2}E_0$.`,
    ],
    solution: String.raw`Describe progress toward the pattern with two states. State 0: the most recent move was down (or there have been no moves yet), so nothing is pending. State 1: the most recent move was up, so a down move now would complete the pattern. Let $E_0$ and $E_1$ be the expected number of further moves from each state.

From state 1, the next move is down with probability $\frac{1}{2}$ and we are done, or up with probability $\frac{1}{2}$ and we remain in state 1 (the latest move is still an up). So $E_1 = 1 + \frac{1}{2}E_1$, which gives $E_1 = 2$.

From state 0, an up move takes us to state 1 and a down move leaves us in state 0: $E_0 = 1 + \frac{1}{2}E_1 + \frac{1}{2}E_0$. Substituting $E_1 = 2$ gives $\frac{1}{2}E_0 = 2$, so $E_0 = 4$.

There is a neat shortcut here. Waiting for up-then-down is the same as waiting for the first up (2 moves on average) and then waiting for the first down (another 2 on average), because once an up has occurred, every further up only keeps us in state 1 and never destroys progress. Two geometric waits with mean 2 give 4. Answer: $4$ moves.`,
    steps: [
      "Set up progress states: nothing pending, or last move was up.",
      "Write the first-step equation for the pending-up state and solve E_1 = 2.",
      "Write the start equation E_0 = 1 + E_1/2 + E_0/2 and solve E_0 = 4.",
      "Check with the two-geometric-waits argument.",
    ],
    keyIdea: "For up-then-down, progress is never lost: an extra up keeps you one step from finishing.",
    commonMistake: String.raw`Answering 6 by recalling the up-up answer. The two patterns differ precisely because an extra up does not reset progress toward up-then-down, while a down does reset progress toward up-up.`,
    fastPath: "Wait for an up (2 moves), then wait for a down (2 moves): 4. Progress toward up-then-down cannot be undone.",
    variation: "The feed moves up with probability 0.7 and down with probability 0.3. What is the expected number of moves until the first up-then-down?",
    variationAnswer: String.raw`Two geometric waits: $\frac{1}{0.7} + \frac{1}{0.3} = \frac{1}{0.21} \approx 4.76$ moves.`,
    family: "pattern-waiting",
    verifiedBy: ["recursion", "simulation"],
  },
  {
    id: "m6-p05",
    module: 6,
    kind: "practice",
    difficulty: 2,
    tags: ["patterns", "first-step", "expectation", "coins"],
    minutes: 3,
    title: "Two up days in a row",
    prompt: String.raw`A trading signal counts as confirmed on the first day that completes two consecutive up days. Each day the market closes up or down with probability $\frac{1}{2}$ each, independently of previous days. What is the expected number of days until the signal is confirmed, counting from the first day of observation?`,
    answer: { type: "numeric", value: 6, exact: String.raw`\frac{1}{1/2} + \frac{1}{(1/2)^2} = 2 + 4 = 6` },
    hints: [
      "Use two progress states: no up day pending, or yesterday was an up day.",
      "From the pending state a down day throws away the progress and sends you back to the start, not to the same state.",
      String.raw`$E_1 = 1 + \frac{1}{2}E_0$ and $E_0 = 1 + \frac{1}{2}E_1 + \frac{1}{2}E_0$. Solve the pair.`,
    ],
    solution: String.raw`Let state 0 mean that yesterday was down (or there is no history yet) and state 1 mean that yesterday was up, so one more up day confirms the signal. Write $E_0$ and $E_1$ for the expected number of further days from each state.

From state 1: an up day (probability $\frac{1}{2}$) finishes; a down day (probability $\frac{1}{2}$) destroys the progress and returns us to state 0. So $E_1 = 1 + \frac{1}{2}E_0$.

From state 0: an up day moves us to state 1; a down day leaves us in state 0. So $E_0 = 1 + \frac{1}{2}E_1 + \frac{1}{2}E_0$, i.e. $E_0 = 2 + E_1$.

Substitute: $E_0 = 2 + 1 + \frac{1}{2}E_0$, so $\frac{1}{2}E_0 = 3$ and $E_0 = 6$ (and $E_1 = 4$).

Compare with up-then-down, which takes 4 days on average. The difference is the down day in state 1: for up-up it wipes out the progress, while for up-down the corresponding "wrong" day (an extra up) keeps you one step from the finish. Answer: $6$ days.`,
    steps: [
      "Set up states: nothing pending, or yesterday was up.",
      "From the pending state a down day resets to the start: E_1 = 1 + E_0/2.",
      "From the start E_0 = 2 + E_1; substitute and solve E_0 = 6.",
    ],
    keyIdea: "A failure in the pending state resets progress completely, which is why up-up waits longer than up-down.",
    commonMistake: String.raw`Writing $E_1 = 1 + \frac{1}{2}E_1$ (as if a down day kept you in state 1) and getting 4.`,
    fastPath: String.raw`Memorise the pair: for a fair coin, HH waits 6 and HT waits 4. For a biased coin HH waits $\frac{1}{p} + \frac{1}{p^2}$.`,
    variation: "Up days happen with probability 0.6 instead of 0.5. What is the expected number of days until two consecutive up days?",
    variationAnswer: String.raw`$\frac{1}{0.6} + \frac{1}{0.36} = \frac{5}{3} + \frac{25}{9} = \frac{40}{9} \approx 4.44$ days.`,
    family: "pattern-waiting",
    verifiedBy: ["recursion", "simulation"],
  },
  {
    id: "m6-p06",
    module: 6,
    kind: "practice",
    difficulty: 2,
    tags: ["first-step", "dice", "expectation"],
    minutes: 2,
    title: "Same face twice running",
    prompt: String.raw`You roll a fair six-sided die repeatedly and stop the first time two consecutive rolls show the same face. What is the expected total number of rolls, including the final matching roll?`,
    answer: { type: "numeric", value: 7, exact: String.raw`1 + \frac{1}{1/6} = 7` },
    hints: [
      "The first roll cannot complete anything; it just sets a target for the next roll.",
      String.raw`After any roll, the next roll matches it with probability $\frac{1}{6}$, whatever the face was.`,
      String.raw`Let $A$ be the expected additional rolls once you hold a roll: $A = 1 + \frac{5}{6}A$. Then the total is $1 + A$.`,
    ],
    solution: String.raw`The first roll has nobody to match, so it is a pure setup cost of one roll. After it, you hold a face and the question is how long until the next roll equals the previous one.

Let $A$ be the expected number of additional rolls from the moment you hold a face. The next roll matches with probability $\frac{1}{6}$ and you stop. With probability $\frac{5}{6}$ it does not match, but then you hold a new face and the situation is the same as before: the probability that the following roll matches is again $\frac{1}{6}$. So $A = 1 + \frac{5}{6}A$, giving $A = 6$.

The total is $1 + A = 7$ rolls. Note that the face you are trying to match keeps changing, which is why people doubt that the process is memoryless; but the chance of a match at each step is always $\frac{1}{6}$, so the state never changes. Answer: $7$ rolls.`,
    steps: [
      "Count the first roll separately as setup.",
      "Notice each later roll matches the previous one with probability 1/6 regardless of history.",
      "Expected additional rolls is 6; total is 7.",
    ],
    keyIdea: "The target face changes, but the probability of matching it does not, so the wait after the first roll is geometric.",
    commonMistake: "Answering 6 by forgetting the setup roll, or trying to track which face was rolled when only the match probability matters.",
    fastPath: "One roll to set a target, then a 1-in-6 event: 1 + 6 = 7.",
    variation: "Same rule with a fair 20-sided die. Expected number of rolls?",
    variationAnswer: "$1 + 20 = 21$ rolls.",
    verifiedBy: ["recursion", "simulation"],
  },
  {
    id: "m6-p07",
    module: 6,
    kind: "practice",
    difficulty: 2,
    tags: ["gamblers-ruin", "first-step", "expectation"],
    minutes: 3,
    title: "How long does a fair match last",
    prompt: String.raw`Two players bet one chip per round on a fair coin flip, with independent flips. Player A starts with 4 chips and player B with 6, and they play until one of them has all 10 chips. What is the expected number of rounds played?`,
    answer: { type: "numeric", value: 24, exact: String.raw`4 \cdot 6 = 24` },
    hints: [
      "Let $D_k$ be the expected number of remaining rounds when A holds $k$ chips, with $D_0 = D_{10} = 0$.",
      String.raw`$D_k = 1 + \frac{1}{2}D_{k-1} + \frac{1}{2}D_{k+1}$. Try a quadratic in $k$ that vanishes at $k = 0$ and $k = 10$.`,
      "$D_k = k(10 - k)$ satisfies the equation; plug in $k = 4$.",
    ],
    solution: String.raw`Let $D_k$ be the expected number of further rounds when A holds $k$ chips (so B holds $10 - k$). The game is over at $k = 0$ or $k = 10$, so $D_0 = D_{10} = 0$.

Each round costs one flip and moves $k$ up or down by one with equal probability, so for $1 \le k \le 9$, $D_k = 1 + \frac{1}{2}D_{k-1} + \frac{1}{2}D_{k+1}$. Rearranging, $D_{k+1} - 2D_k + D_{k-1} = -2$: the second difference is constant, so $D_k$ is a quadratic in $k$ with leading coefficient $-1$.

A quadratic with leading coefficient $-1$ that vanishes at $0$ and $10$ is $D_k = -k(k - 10) = k(10 - k)$. Check: $D_{k+1} - 2D_k + D_{k-1} = -(k+1)^2 + 2k^2 - (k-1)^2 + 10[(k+1) - 2k + (k-1)] = -2$. Correct.

With $k = 4$, $D_4 = 4 \cdot 6 = 24$ rounds. The product of the two stakes is the general rule for a fair game. Answer: $24$ rounds.`,
    steps: [
      "Define D_k with D_0 = D_10 = 0.",
      "First-step: D_k = 1 + average of neighbours, so second differences are -2.",
      "Fit the quadratic k(10 - k) and evaluate at k = 4: 24.",
    ],
    keyIdea: "A constant per-step cost makes the expected duration quadratic; it equals the product of the two stakes in a fair game.",
    commonMistake: "Reporting 10 (the total pot) or 4 (the smaller stake) instead of the product 24, or forgetting the boundary conditions.",
    fastPath: "Fair game, stakes 4 and 6: expected length is 4 times 6 = 24.",
    variation: "A starts with 1 chip and B with 99. How long does the match last on average, and what is A's chance of winning it?",
    variationAnswer: String.raw`Duration $1 \cdot 99 = 99$ rounds, win chance $\frac{1}{100}$. A tiny stake can still make for a long match.`,
    family: "gamblers-ruin",
    verifiedBy: ["recursion", "formula", "simulation"],
  },
  {
    id: "m6-p08",
    module: 6,
    kind: "practice",
    difficulty: 2,
    tags: ["random-walk", "first-step"],
    minutes: 2,
    title: "Take profit or stop loss",
    prompt: String.raw`A stock price moves exactly one tick per second, up or down with probability $\frac{1}{2}$ each, independently. You buy now and will sell either when the price is 5 ticks above your purchase price (take profit) or 3 ticks below it (stop loss), whichever happens first. What is the probability that you hit the take-profit level first?`,
    answer: { type: "numeric", value: 3 / 8, exact: String.raw`\frac{3}{5 + 3} = \frac{3}{8} = 0.375` },
    hints: [
      "Shift the picture: you start 3 ticks above the stop loss and the take profit is 8 ticks above the stop loss.",
      "This is a fair gambler's ruin with 3 chips out of a pot of 8.",
      String.raw`$P = \frac{3}{8}$.`,
    ],
    solution: String.raw`Measure the price relative to the stop-loss level. The stop loss sits at 0, you start at 3, and the take profit sits at $3 + 5 = 8$. Each second the position moves up or down one unit with probability $\frac{1}{2}$, and the walk stops at 0 or 8.

Let $h_k$ be the probability of reaching 8 before 0 from position $k$. Conditioning on the first move gives $h_k = \frac{1}{2}h_{k-1} + \frac{1}{2}h_{k+1}$ with $h_0 = 0$ and $h_8 = 1$. Each value is the average of its neighbours, so $h_k$ is linear in $k$: $h_k = \frac{k}{8}$. From $k = 3$ the probability is $\frac{3}{8}$.

The martingale view says the same thing in one line. The walk has zero drift, so your expected exit level equals your starting level: $8 \cdot P(\text{top}) + 0 \cdot (1 - P(\text{top})) = 3$, hence $P(\text{top}) = \frac{3}{8}$.

In general, with a fair walk the probability of hitting $+a$ before $-b$ is $\frac{b}{a + b}$: the nearer boundary is the likelier one, in proportion. Answer: $\frac{3}{8} = 0.375$.`,
    steps: [
      "Relabel so the stop loss is 0 and the take profit is a + b = 8.",
      "Hitting probabilities for a fair walk are linear between the boundaries.",
      "Read off 3/8; check with the zero-drift expected-exit argument.",
    ],
    keyIdea: String.raw`A fair walk hits $+a$ before $-b$ with probability $\frac{b}{a+b}$: the probability is proportional to the distance from the other boundary.`,
    commonMistake: String.raw`Answering $\frac{5}{8}$ by putting the wrong distance in the numerator; the nearer boundary (the stop loss, 3 away) is hit more often.`,
    fastPath: "Distances 5 and 3: the probability of the far one first is 3/(5+3) = 3/8.",
    variation: "How long, on average, until you exit one way or the other?",
    variationAnswer: String.raw`Product of the distances: $5 \cdot 3 = 15$ seconds.`,
    family: "random-walk",
    verifiedBy: ["recursion", "simulation"],
  },
  {
    id: "m6-p09",
    module: 6,
    kind: "practice",
    difficulty: 2,
    tags: ["recursion"],
    minutes: 2,
    title: "Climbing ten rungs",
    prompt: String.raw`A ladder has 10 rungs. Starting from the ground you climb either 1 or 2 rungs at a time, and you must finish exactly on rung 10. How many different sequences of climbs are possible? (Two sequences are different if the list of step sizes differs.)`,
    answer: { type: "numeric", value: 89, exact: String.raw`c_{10} = 89 \quad (c_n = c_{n-1} + c_{n-2},\ c_1 = 1,\ c_2 = 2)` },
    hints: [
      "Let $c_n$ be the number of ways to reach rung $n$. Think about the last step you take.",
      "The last step is either 1 rung (from rung $n-1$) or 2 rungs (from rung $n-2$).",
      "$c_n = c_{n-1} + c_{n-2}$ with $c_1 = 1, c_2 = 2$. Climb the numbers to $n = 10$.",
    ],
    solution: String.raw`Let $c_n$ be the number of step sequences that finish exactly on rung $n$. Condition on the final step. If it is a single rung, the earlier steps form a sequence that finishes on rung $n - 1$: $c_{n-1}$ ways. If it is a double, the earlier steps finish on rung $n - 2$: $c_{n-2}$ ways. These are disjoint and exhaustive, so $c_n = c_{n-1} + c_{n-2}$.

Base cases: $c_1 = 1$ (a single step) and $c_2 = 2$ (two singles or one double). Then $c_3 = 3$, $c_4 = 5$, $c_5 = 8$, $c_6 = 13$, $c_7 = 21$, $c_8 = 34$, $c_9 = 55$, $c_{10} = 89$.

A second route counts by the number of double steps. With $j$ doubles there are $10 - 2j$ singles, so $10 - j$ steps in total, and the doubles can sit in any $j$ of those positions: $\binom{10-j}{j}$ ways. Summing $j = 0$ to $5$: $1 + 9 + 28 + 35 + 15 + 1 = 89$. Answer: $89$.`,
    steps: [
      "Define c_n as the number of ways to finish on rung n.",
      "Condition on the last step: 1 rung from n-1, 2 rungs from n-2.",
      "Iterate from c_1 = 1, c_2 = 2 up to c_10 = 89.",
      "Cross-check with the binomial sum over the number of double steps.",
    ],
    keyIdea: "Condition on the last move; the choices for the last move partition the sequences.",
    commonMistake: String.raw`Treating the problem as choosing which rungs to touch and answering $2^9$, which ignores the step-size limit, or getting the base cases wrong and landing on 55 or 144.`,
    fastPath: "Ways to climb n rungs by 1s and 2s is the Fibonacci number F_(n+1) (with F_1 = F_2 = 1): 1, 2, 3, 5, 8, 13, 21, 34, 55, 89 for n = 1 to 10.",
    variation: "You may now climb 1, 2 or 3 rungs at a time. How many sequences reach rung 10 exactly?",
    variationAnswer: String.raw`$t_n = t_{n-1} + t_{n-2} + t_{n-3}$ with $t_1 = 1, t_2 = 2, t_3 = 4$: 7, 13, 24, 44, 81, 149, 274. Answer $274$.`,
    verifiedBy: ["dp", "enumeration"],
  },
  {
    id: "m6-p10",
    module: 6,
    kind: "practice",
    difficulty: 2,
    tags: ["patterns", "first-step", "coins"],
    minutes: 2,
    title: "Which monitor runs longer",
    prompt: String.raw`A fair coin is flipped once per second, independently. Monitor A shuts off the first time two consecutive flips are both heads. Monitor B shuts off the first time a head is immediately followed by a tail. Both start at the first flip. Which monitor has the longer expected running time, and by how much?`,
    answer: {
      type: "choice",
      options: [
        "Monitor A (two heads in a row) runs longer: 6 seconds on average versus 4.",
        "Monitor B (head then tail) runs longer: 6 seconds on average versus 4.",
        "They run equally long: both 4 seconds on average, since each pattern has probability 1/4.",
        "They run equally long: both 6 seconds on average.",
      ],
      correct: 0,
    },
    hints: [
      String.raw`Both patterns have probability $\frac{1}{4}$ on any two given flips, yet the expected waits differ. Think about what happens after a head.`,
      "After a head, a tail finishes pattern B but destroys progress toward pattern A.",
      "Set up first-step equations for each pattern; A gives 6, B gives 4.",
    ],
    solution: String.raw`Both monitors look for a two-flip pattern of probability $\frac{1}{4}$, so it is tempting to say they behave the same. They do not, because of how they recover from a near miss.

For monitor B (head then tail): once a head has appeared, every further head keeps the monitor one flip from finishing, and the first tail finishes it. The wait is a geometric wait for a head (mean 2) plus a geometric wait for a tail (mean 2): $4$ seconds.

For monitor A (two heads in a row): once a head has appeared, a tail throws away all progress and the search restarts from nothing. With $E_0$ and $E_1$ the expected remaining flips from "no progress" and "one head pending", $E_1 = 1 + \frac{1}{2}E_0$ and $E_0 = 1 + \frac{1}{2}E_1 + \frac{1}{2}E_0$, which solve to $E_1 = 4$ and $E_0 = 6$.

So monitor A runs for 6 seconds on average, two seconds longer than monitor B. The general lesson: a pattern that overlaps with itself (HH shifted by one still matches an H) waits longer than one that does not, because the overlap means a failed attempt is a complete restart rather than a partial one. Correct option: the first.`,
    steps: [
      "Notice both patterns have probability 1/4 per two flips, so the difference must come from near misses.",
      "For head-then-tail, progress is never lost: 2 + 2 = 4.",
      "For head-head, a tail after a head restarts the search: solve to get 6.",
      "Pick the option saying A runs longer, 6 versus 4.",
    ],
    keyIdea: "Patterns that overlap themselves wait longer, because a failed attempt wastes more.",
    commonMistake: String.raw`Assuming equal probability per window implies equal expected wait; the windows overlap and are not independent attempts.`,
    fastPath: "HH waits 6, HT waits 4. The self-overlapping pattern is the slow one.",
    variation: "A third monitor shuts off at the first tail followed by a tail. How does it compare?",
    variationAnswer: "Tail-tail is the mirror image of head-head on a fair coin: 6 seconds on average, the same as monitor A.",
    family: "pattern-waiting",
    verifiedBy: ["recursion", "simulation"],
  },

  // ---------------------------------------------------------------- difficulty 3
  {
    id: "m6-p11",
    module: 6,
    kind: "practice",
    difficulty: 3,
    tags: ["patterns", "first-step", "dice", "expectation"],
    minutes: 4,
    title: "Two sixes back to back",
    prompt: String.raw`You roll a fair six-sided die repeatedly, with independent rolls, and stop the first time two consecutive rolls are both 6. What is the expected total number of rolls, including the two final sixes?`,
    answer: { type: "numeric", value: 42, exact: String.raw`6 + 6^2 = 42` },
    hints: [
      "Two progress states: no six pending, or the last roll was a six.",
      String.raw`From the pending state, a non-six (probability $\frac{5}{6}$) sends you all the way back to the start.`,
      String.raw`$E_1 = 1 + \frac{5}{6}E_0$ and $E_0 = 1 + \frac{1}{6}E_1 + \frac{5}{6}E_0$. Solve.`,
    ],
    solution: String.raw`Let $E_0$ be the expected number of further rolls when the last roll was not a six (or there is no history), and $E_1$ the expected number when the last roll was a six.

From state 1 a six (probability $\frac{1}{6}$) finishes, while any other face (probability $\frac{5}{6}$) wipes out the progress: $E_1 = 1 + \frac{5}{6}E_0$.

From state 0 a six moves to state 1 and anything else stays in state 0: $E_0 = 1 + \frac{1}{6}E_1 + \frac{5}{6}E_0$, so $\frac{1}{6}E_0 = 1 + \frac{1}{6}E_1$ and $E_0 = 6 + E_1$.

Substitute: $E_0 = 6 + 1 + \frac{5}{6}E_0$, hence $\frac{1}{6}E_0 = 7$ and $E_0 = 42$ (with $E_1 = 36$).

The structure matches the coin case: for a success probability $p$, two consecutive successes take $\frac{1}{p} + \frac{1}{p^2}$ trials on average. With $p = \frac{1}{6}$ that is $6 + 36 = 42$. The $36$ is the cost of the many restarts: on average you have to see six separate sixes before one of them is followed by another. Answer: $42$ rolls.`,
    steps: [
      "Define E_0 (no six pending) and E_1 (last roll a six).",
      "From state 1 a non-six resets to state 0: E_1 = 1 + (5/6)E_0.",
      "From state 0: E_0 = 6 + E_1. Substitute and solve E_0 = 42.",
      "Recognise the pattern 1/p + 1/p^2.",
    ],
    keyIdea: String.raw`Two consecutive successes of probability $p$ take $\frac{1}{p} + \frac{1}{p^2}$ trials on average, because each failed attempt is a full restart.`,
    commonMistake: String.raw`Answering 36 as $\frac{1}{(1/6)^2}$: that is one over the probability that a fixed pair of rolls is a double six, not the expected wait for the first double six, because failed attempts restart the count.`,
    fastPath: "1/p + 1/p^2 with p = 1/6: 6 + 36 = 42.",
    variation: "You stop the first time a 6 is immediately followed by a 6 or a 5. Expected number of rolls?",
    variationAnswer: String.raw`From the pending state you finish with probability $\frac{2}{6}$, return to pending with probability 0 and restart otherwise. $E_1 = 1 + \frac{4}{6}E_0$, $E_0 = 6 + E_1$, giving $E_0 = 21$.`,
    family: "pattern-waiting",
    verifiedBy: ["recursion", "dp"],
  },
  {
    id: "m6-p12",
    module: 6,
    kind: "practice",
    difficulty: 3,
    tags: ["patterns", "first-step", "dice", "expectation"],
    minutes: 4,
    title: "A six followed by a five",
    prompt: String.raw`You roll a fair six-sided die repeatedly, with independent rolls, and stop the first time a roll of 6 is immediately followed by a roll of 5. What is the expected total number of rolls, including the final 5?`,
    answer: { type: "numeric", value: 36, exact: String.raw`\frac{1}{(1/6)(1/6)} = 36` },
    hints: [
      "Two progress states again: no six pending, or the last roll was a six. Be careful about what another six does.",
      "From the pending state: a 5 finishes, a 6 keeps you pending, any of the other four faces restarts.",
      String.raw`$E_1 = 1 + \frac{1}{6}E_1 + \frac{4}{6}E_0$ and $E_0 = 6 + E_1$.`,
    ],
    solution: String.raw`Let $E_0$ be the expected number of further rolls when nothing is pending and $E_1$ the expected number when the last roll was a 6.

From state 1 there are three cases. A 5 (probability $\frac{1}{6}$) finishes. Another 6 (probability $\frac{1}{6}$) keeps you in state 1, because the latest roll is still a six. Any of the remaining four faces (probability $\frac{4}{6}$) sends you back to state 0. So $E_1 = 1 + \frac{1}{6}E_1 + \frac{4}{6}E_0$.

From state 0 a six moves you to state 1 and anything else keeps you in state 0: $E_0 = 1 + \frac{1}{6}E_1 + \frac{5}{6}E_0$, i.e. $E_0 = 6 + E_1$.

Substitute into the first equation: $E_1 = 1 + \frac{1}{6}E_1 + \frac{4}{6}(6 + E_1) = 5 + \frac{5}{6}E_1$, so $\frac{1}{6}E_1 = 5$, $E_1 = 30$ and $E_0 = 36$.

Compare with the 42 rolls needed for two sixes in a row. The patterns have the same probability per window, $\frac{1}{36}$, but 6-then-5 does not overlap with itself, so a second six is not a wasted roll: it leaves you still one step from finishing. The expected wait for a non-self-overlapping pattern is exactly $\frac{1}{P(\text{pattern})} = 36$. Answer: $36$ rolls.`,
    steps: [
      "Define E_0 and E_1 (last roll was a six).",
      "From state 1 split three ways: 5 finishes, 6 stays pending, other faces reset.",
      "From state 0: E_0 = 6 + E_1. Substitute and solve E_1 = 30, E_0 = 36.",
      "Note that a non-overlapping pattern waits exactly 1/P(pattern).",
    ],
    keyIdea: "A pattern with no self-overlap waits exactly 1 over its probability; the repeated six keeps you pending instead of restarting you.",
    commonMistake: "Sending a second six back to the start (giving 42) instead of leaving the process in the pending state.",
    fastPath: "6-then-5 has no self-overlap, so the wait is 1/(1/36) = 36.",
    variation: "Stop the first time a 6 is followed by any face other than 6. Expected rolls?",
    variationAnswer: String.raw`Wait for a six (6 rolls), then for a non-six ($\frac{6}{5}$ rolls): $6 + \frac{6}{5} = 7.2$.`,
    family: "pattern-waiting",
    verifiedBy: ["recursion", "dp"],
  },
  {
    id: "m6-p13",
    module: 6,
    kind: "practice",
    difficulty: 3,
    tags: ["patterns", "first-step", "expectation"],
    minutes: 4,
    title: "Hit three seconds running",
    prompt: String.raw`A market maker's quote is either hit or left alone in each one-second window, each with probability $\frac{1}{2}$, independently across windows. A risk alarm sounds the first time the quote has been hit in three consecutive windows. What is the expected number of windows until the alarm sounds, counting the third hit?`,
    answer: { type: "numeric", value: 14, exact: String.raw`2 + 4 + 8 = 14` },
    hints: [
      "Three progress states: 0, 1 or 2 consecutive hits pending.",
      "From any pending state, a quiet window resets you to zero hits pending.",
      String.raw`$E_2 = 1 + \frac{1}{2}E_0$, $E_1 = 1 + \frac{1}{2}E_2 + \frac{1}{2}E_0$, $E_0 = 1 + \frac{1}{2}E_1 + \frac{1}{2}E_0$.`,
    ],
    solution: String.raw`Let $E_j$ be the expected number of further windows when the last $j$ windows were hits, for $j = 0, 1, 2$. The alarm sounds on reaching $j = 3$.

Each window either extends the run (probability $\frac{1}{2}$) or resets it to zero (probability $\frac{1}{2}$):
$$E_2 = 1 + \tfrac{1}{2}E_0, \qquad E_1 = 1 + \tfrac{1}{2}E_2 + \tfrac{1}{2}E_0, \qquad E_0 = 1 + \tfrac{1}{2}E_1 + \tfrac{1}{2}E_0.$$

The last equation gives $E_0 = 2 + E_1$. The middle one then gives $E_1 = 1 + \frac{1}{2}E_2 + \frac{1}{2}(2 + E_1)$, so $E_1 = 4 + E_2$. Then $E_0 = 6 + E_2 = 6 + 1 + \frac{1}{2}E_0$, so $\frac{1}{2}E_0 = 7$ and $E_0 = 14$.

The pattern $2 + 4 + 8 = 14$ is the general $\frac{1}{p} + \frac{1}{p^2} + \frac{1}{p^3}$ for a run of three successes with probability $p$ each. Each extra success you demand multiplies the restart cost by $\frac{1}{p}$ and adds it. A run of $r$ heads on a fair coin takes $2^{r+1} - 2$ flips on average. Answer: $14$ windows.`,
    steps: [
      "Define E_0, E_1, E_2 by the number of consecutive hits pending.",
      "Each window extends the run or resets to zero: write three equations.",
      "Eliminate downward: E_0 = 2 + E_1, E_1 = 4 + E_2, then solve E_0 = 14.",
      "Recognise 2 + 4 + 8.",
    ],
    keyIdea: String.raw`A run of $r$ successes with probability $p$ waits $\frac{1}{p} + \frac{1}{p^2} + \dots + \frac{1}{p^r}$ trials.`,
    commonMistake: String.raw`Answering 8 ($2^3$) by treating the first time three given windows all hit as if windows did not overlap.`,
    fastPath: "Run of r heads on a fair coin: 2^(r+1) - 2. For r = 3 that is 14.",
    variation: "The quote is hit with probability 0.3 per window. Expected windows until three consecutive hits?",
    variationAnswer: String.raw`$\frac{1}{0.3} + \frac{1}{0.09} + \frac{1}{0.027} \approx 3.33 + 11.11 + 37.04 = 51.5$ windows.`,
    family: "pattern-waiting",
    verifiedBy: ["recursion", "simulation"],
  },
  {
    id: "m6-p14",
    module: 6,
    kind: "practice",
    difficulty: 3,
    tags: ["recursion", "coins"],
    minutes: 3,
    title: "Eight flips, never two heads together",
    prompt: String.raw`A fair coin is flipped 8 times, independently. What is the probability that no two consecutive flips are both heads?`,
    answer: { type: "numeric", value: 55 / 256, exact: String.raw`\frac{F_{10}}{2^8} = \frac{55}{256} \approx 0.215` },
    hints: [
      "Count the favourable strings and divide by $2^8 = 256$.",
      "Let $a_n$ count strings of length $n$ with no two consecutive heads. Condition on the last flip: $a_n = a_{n-1} + a_{n-2}$.",
      String.raw`$a_1 = 2, a_2 = 3, a_3 = 5, \dots$; find $a_8$ and divide by 256.`,
    ],
    solution: String.raw`All $2^8 = 256$ flip sequences are equally likely, so the probability is the number of favourable sequences divided by 256.

Let $a_n$ be the number of sequences of length $n$ with no two consecutive heads. If the last flip is a tail, the first $n - 1$ flips are any valid sequence: $a_{n-1}$ ways. If the last flip is a head, the previous flip must be a tail and the first $n - 2$ flips are any valid sequence: $a_{n-2}$ ways. So $a_n = a_{n-1} + a_{n-2}$, with $a_1 = 2$ and $a_2 = 3$.

Running the recursion: $a_3 = 5$, $a_4 = 8$, $a_5 = 13$, $a_6 = 21$, $a_7 = 34$, $a_8 = 55$.

The probability is $\frac{55}{256} \approx 0.215$. As a check, count by the number of heads $k$: $k$ non-adjacent heads among 8 positions can be placed in $\binom{9-k}{k}$ ways, giving $1 + 8 + 21 + 20 + 5 = 55$ for $k = 0, 1, 2, 3, 4$. Answer: $\frac{55}{256} \approx 0.215$.`,
    steps: [
      "Write the probability as favourable count over 2^8.",
      "Set up a_n = a_(n-1) + a_(n-2) from the last flip, with a_1 = 2, a_2 = 3.",
      "Iterate to a_8 = 55 and divide: 55/256.",
    ],
    keyIdea: "Counting strings that avoid a short pattern is a linear recursion; the probability is the count over 2^n.",
    commonMistake: String.raw`Using independence per adjacent pair, $(3/4)^7 \approx 0.13$; adjacent pairs share a flip and are not independent.`,
    fastPath: "No-two-heads counts run 2, 3, 5, 8, 13, 21, 34, 55 for n = 1 to 8. 55/256.",
    variation: "Same question with a coin that lands heads with probability 0.3.",
    variationAnswer: String.raw`Let $t_n$, $h_n$ be the probabilities that a valid string of length $n$ ends in T or H: $t_n = 0.7(t_{n-1} + h_{n-1})$, $h_n = 0.3\,t_{n-1}$, from $t_1 = 0.7$, $h_1 = 0.3$. Iterating gives $t_8 + h_8 \approx 0.578$.`,
    verifiedBy: ["enumeration", "dp"],
  },
  {
    id: "m6-p15",
    module: 6,
    kind: "practice",
    difficulty: 3,
    tags: ["patterns", "first-step", "expectation"],
    minutes: 3,
    title: "Two fills in a row at forty percent",
    prompt: String.raw`An execution algorithm sends one order per second. Each order fills with probability $0.4$ and is rejected with probability $0.6$, independently of all other orders. The algorithm switches to a passive mode the first time two consecutive orders both fill. What is the expected number of orders sent up to and including the second of those two fills?`,
    answer: { type: "numeric", value: 35 / 4, exact: String.raw`\frac{1}{0.4} + \frac{1}{0.4^2} = 2.5 + 6.25 = \frac{35}{4} = 8.75` },
    hints: [
      String.raw`Same two-state setup as for two heads in a row, but with $p = 0.4$ instead of $\frac{1}{2}$.`,
      String.raw`$E_1 = 1 + 0.6\,E_0$ and $E_0 = 1 + 0.4\,E_1 + 0.6\,E_0$.`,
      String.raw`The closed form is $\frac{1}{p} + \frac{1}{p^2}$.`,
    ],
    solution: String.raw`Let $E_0$ be the expected number of further orders when the last order was rejected (or there is no history) and $E_1$ the expected number when the last order filled.

From state 1, a fill (probability $0.4$) finishes and a rejection (probability $0.6$) resets to state 0: $E_1 = 1 + 0.6\,E_0$. From state 0, a fill moves to state 1 and a rejection stays: $E_0 = 1 + 0.4\,E_1 + 0.6\,E_0$, so $0.4\,E_0 = 1 + 0.4\,E_1$ and $E_0 = 2.5 + E_1$.

Substituting, $E_0 = 2.5 + 1 + 0.6\,E_0$, so $0.4\,E_0 = 3.5$ and $E_0 = 8.75$.

In closed form, $E_0 = \frac{1}{p} + \frac{1}{p^2}$ with $p = 0.4$: $2.5 + 6.25 = 8.75 = \frac{35}{4}$. Read the two terms as: wait for a fill ($\frac{1}{p}$), and expect to need $\frac{1}{p}$ such fills before one is followed by another, each costing $\frac{1}{p}$, which is the $\frac{1}{p^2}$. Answer: $\frac{35}{4} = 8.75$ orders.`,
    steps: [
      "Set up the two progress states with p = 0.4.",
      "Write E_1 = 1 + 0.6 E_0 and E_0 = 2.5 + E_1.",
      "Solve: E_0 = 8.75, matching 1/p + 1/p^2.",
    ],
    keyIdea: String.raw`Two consecutive successes with probability $p$ take $\frac{1}{p} + \frac{1}{p^2}$ trials on average.`,
    commonMistake: String.raw`Answering $\frac{1}{p^2} = 6.25$ (one over the probability that a fixed pair both fill, which ignores the restarts) or $2 \cdot \frac{1}{p} = 5$ (two independent waits, which ignores the resets).`,
    fastPath: "1/p + 1/p^2 with p = 0.4: 2.5 + 6.25 = 8.75.",
    variation: "The algorithm instead switches mode the first time a fill is immediately followed by a rejection. Expected orders?",
    variationAnswer: String.raw`No self-overlap, so $\frac{1}{pq} = \frac{1}{0.4 \cdot 0.6} = \frac{25}{6} \approx 4.17$ orders.`,
    family: "pattern-waiting",
    verifiedBy: ["recursion", "simulation"],
  },
  {
    id: "m6-p16",
    module: 6,
    kind: "practice",
    difficulty: 3,
    tags: ["patterns", "first-step", "coins"],
    minutes: 3,
    title: "Which pattern shows up first",
    prompt: String.raw`Each trading day a stock closes up (U) or down (D) with probability $\frac{1}{2}$ each, independently. Two analysts make a bet on the sequence of daily closes starting tomorrow. Analyst A wins if the two-day pattern U then D (an up day immediately followed by a down day) appears before the pattern D then D; analyst B wins otherwise. What is the probability that analyst A wins?`,
    answer: { type: "numeric", value: 3 / 4, exact: String.raw`\frac{1}{2} + \frac{1}{2} \cdot \frac{1}{2} = \frac{3}{4} = 0.75` },
    hints: [
      "Only the most recent close matters. Set up states: start, last close U, last close D.",
      "Once an up day has happened, can D-D ever appear before U-D?",
      "From a first down day, the next day decides: D gives B the win, U hands the game to A.",
    ],
    solution: String.raw`Let $a_S$, $a_U$ and $a_D$ be the probabilities that A wins from the start, from a state where the last close was up, and from a state where the last close was down (with no pattern completed yet).

From the up state: a down day completes U-D immediately, and an up day keeps the last close up. So $a_U = \frac{1}{2} \cdot 1 + \frac{1}{2}a_U$, giving $a_U = 1$. In words, once any up day has occurred, the first down day after it completes A's pattern, and B's pattern D-D needs two downs with no up between them, which is impossible before that first down.

From the down state: another down completes D-D and B wins; an up moves to the up state, from which A wins for sure. So $a_D = \frac{1}{2} \cdot 0 + \frac{1}{2}a_U = \frac{1}{2}$.

From the start: $a_S = \frac{1}{2}a_U + \frac{1}{2}a_D = \frac{1}{2} + \frac{1}{4} = \frac{3}{4}$.

So B only wins when the first two days are both down. The two patterns also have different expected waiting times (U-D waits 4 days, D-D waits 6), and here the faster pattern is also the likelier to appear first, by 3 to 1; that is not a general rule, since a race depends on how the patterns block each other, not only on their individual waits. Answer: $\frac{3}{4} = 0.75$.`,
    steps: [
      "Set up states by the last close: start, U, D.",
      "From U, A wins with certainty: the first down completes U-D.",
      "From D: half the time B wins immediately, half the time move to U.",
      "Combine: 1/2 + 1/4 = 3/4.",
    ],
    keyIdea: "In a pattern race, ask which states make one pattern unreachable: after any U, D-D cannot come before U-D.",
    commonMistake: String.raw`Answering $\frac{1}{2}$ by symmetry, but the patterns are not symmetric: one of them blocks the other.`,
    fastPath: "B needs the very first two days to be D, D: probability 1/4. So A wins with 3/4.",
    variation: "Analyst A now bets on U-U appearing before D-D. Probability that A wins?",
    variationAnswer: String.raw`By symmetry of the fair coin, $\frac{1}{2}$.`,
    family: "pattern-waiting",
    verifiedBy: ["recursion", "simulation"],
  },
  {
    id: "m6-p17",
    module: 6,
    kind: "practice",
    difficulty: 3,
    tags: ["gamblers-ruin", "first-step"],
    minutes: 4,
    title: "Even stakes, uneven coin",
    prompt: String.raw`You play a sequence of independent rounds against the house. Each round you win one unit with probability $0.45$ and lose one unit with probability $0.55$. You start with 5 units and stop as soon as you reach 10 units or go broke. What is the probability that you reach 10?`,
    answer: {
      type: "numeric",
      value: 1 / (1 + Math.pow(11 / 9, 5)),
      exact: String.raw`\frac{1 - (11/9)^5}{1 - (11/9)^{10}} = \frac{1}{1 + (11/9)^5} = \frac{59049}{220100} \approx 0.268`,
    },
    hints: [
      String.raw`Let $p_k$ be the probability of reaching 10 from $k$ units. First-step: $p_k = 0.45\,p_{k+1} + 0.55\,p_{k-1}$.`,
      String.raw`Try $p_k = A + B r^k$ with $r = \frac{0.55}{0.45} = \frac{11}{9}$; the differences $p_{k+1} - p_k$ grow by the factor $r$ each step.`,
      String.raw`With $p_0 = 0$ and $p_{10} = 1$: $p_5 = \frac{1 - r^5}{1 - r^{10}} = \frac{1}{1 + r^5}$.`,
    ],
    solution: String.raw`Let $p_k$ be the probability of reaching 10 before 0 from $k$ units, with $p_0 = 0$ and $p_{10} = 1$. Write $p = 0.45$ for the win probability and $q = 0.55$ for the loss probability.

Condition on the first round: $p_k = p\,p_{k+1} + q\,p_{k-1}$. Rearrange using $p + q = 1$: $p(p_{k+1} - p_k) = q(p_k - p_{k-1})$, so each difference is $r = \frac{q}{p} = \frac{11}{9}$ times the previous one. Writing $d = p_1 - p_0 = p_1$, we get $p_k = d(1 + r + \dots + r^{k-1}) = d\,\frac{r^k - 1}{r - 1}$.

The boundary condition $p_{10} = 1$ fixes $d$, and dividing gives $p_k = \frac{1 - r^k}{1 - r^{10}}$. At $k = 5$, note $1 - r^{10} = (1 - r^5)(1 + r^5)$, so $p_5 = \frac{1}{1 + r^5}$.

Now $r^5 = \left(\frac{11}{9}\right)^5 = \frac{161051}{59049} \approx 2.727$, so $p_5 = \frac{59049}{59049 + 161051} = \frac{59049}{220100} \approx 0.268$.

A fair game from the midpoint would give exactly $\frac{1}{2}$. A coin tilted 55/45 toward the house, compounded over the dozens of rounds a typical session lasts, pulls that down to about 27%. Answer: $\frac{1}{1 + (11/9)^5} \approx 0.268$.`,
    steps: [
      "Define p_k with p_0 = 0, p_10 = 1 and write the first-step equation.",
      "Show consecutive differences grow by r = q/p = 11/9.",
      "Sum the geometric series and impose p_10 = 1.",
      "Simplify p_5 to 1/(1 + r^5) and evaluate: about 0.268.",
    ],
    keyIdea: String.raw`In a biased game the win probabilities are geometric, not linear: $p_k = \frac{1 - (q/p)^k}{1 - (q/p)^N}$.`,
    commonMistake: String.raw`Using the fair formula $\frac{k}{N} = \frac{1}{2}$, or inverting the ratio to $\frac{9}{11}$ and getting a probability above one half.`,
    fastPath: String.raw`From the midpoint, $p_{N/2} = \frac{1}{1 + (q/p)^{N/2}}$. $(11/9)^5 \approx 2.73$, so about $\frac{1}{3.73} \approx 0.27$.`,
    variation: "Same odds but you start with 50 units and aim for 100. Roughly what is your probability?",
    variationAnswer: String.raw`$\frac{1}{1 + (11/9)^{50}}$; since $(11/9)^{50} \approx e^{50 \cdot 0.2007} \approx 2.3 \times 10^4$, the probability is about $4 \times 10^{-5}$. Scaling the stakes up makes the edge decisive.`,
    family: "gamblers-ruin",
    verifiedBy: ["recursion", "formula", "simulation"],
  },
  {
    id: "m6-p18",
    module: 6,
    kind: "practice",
    difficulty: 3,
    tags: ["markov", "first-step"],
    minutes: 4,
    title: "From trainee to senior",
    prompt: String.raw`A prop firm reviews every trader monthly. A Trainee is kept as a Trainee with probability $0.5$, promoted to Junior with probability $0.3$ and let go with probability $0.2$. A Junior is demoted to Trainee with probability $0.2$, kept as a Junior with probability $0.5$, promoted to Senior with probability $0.2$ and let go with probability $0.1$. Senior is permanent and being let go is final. Reviews are independent given the current grade. What is the probability that a newly hired Trainee eventually becomes a Senior?`,
    answer: { type: "numeric", value: 6 / 19, exact: String.raw`\frac{6}{19} \approx 0.316` },
    hints: [
      "Two transient states (Trainee, Junior) and two absorbing states (Senior, Out). Write one unknown per transient state.",
      String.raw`$t = 0.5\,t + 0.3\,j$ and $j = 0.2\,t + 0.5\,j + 0.2$.`,
      String.raw`From the first equation $t = 0.6\,j$; substitute into the second.`,
    ],
    solution: String.raw`Let $t$ be the probability that a Trainee eventually becomes Senior and $j$ the same probability for a Junior. The absorbing states contribute known values: Senior gives 1, Out gives 0.

Condition on the next review. For a Trainee: $t = 0.5\,t + 0.3\,j + 0.2 \cdot 0$, so $0.5\,t = 0.3\,j$ and $t = 0.6\,j$.

For a Junior: $j = 0.2\,t + 0.5\,j + 0.2 \cdot 1 + 0.1 \cdot 0$, so $0.5\,j = 0.2\,t + 0.2$.

Substitute $t = 0.6\,j$: $0.5\,j = 0.12\,j + 0.2$, so $0.38\,j = 0.2$ and $j = \frac{0.2}{0.38} = \frac{10}{19}$. Then $t = 0.6 \cdot \frac{10}{19} = \frac{6}{19} \approx 0.316$.

A useful cross-check: a Junior who ignores the demotion path would reach Senior with probability $\frac{0.2}{0.2 + 0.1} = \frac{2}{3}$; the possibility of demotion (and a fresh chance of being let go as a Trainee) lowers it to $\frac{10}{19} \approx 0.526$. The Trainee must first survive to Junior, which happens with probability $\frac{0.3}{0.3 + 0.2} = 0.6$, and $0.6 \cdot \frac{10}{19}$ is exactly our answer. Answer: $\frac{6}{19} \approx 0.316$.`,
    steps: [
      "Identify transient states (Trainee, Junior) and absorbing states (Senior, Out).",
      "Write one first-step equation per transient state.",
      "Solve the 2-by-2 system: j = 10/19, t = 6/19.",
      "Check by decomposing into survive-to-Junior times Junior's chance.",
    ],
    keyIdea: "Absorption probabilities satisfy one linear equation per transient state, with absorbing states contributing constants.",
    commonMistake: String.raw`Dropping the self-loop terms ($0.5\,t$ and $0.5\,j$) or forgetting that a demotion sends the Junior back into the Trainee equation.`,
    fastPath: "Collapse self-loops: a Trainee leaves the grade upward 60% of the time. Then solve the Junior equation j = 0.2(0.6 j) + 0.5 j + 0.2, i.e. 0.38 j = 0.2.",
    variation: "What is the expected number of monthly reviews a new Trainee goes through before being absorbed (Senior or Out)?",
    variationAnswer: String.raw`$m_T = 1 + 0.5\,m_T + 0.3\,m_J$, $m_J = 1 + 0.2\,m_T + 0.5\,m_J$. Then $m_T = 2 + 0.6\,m_J$ and $0.5\,m_J = 1 + 0.2(2 + 0.6\,m_J) = 1.4 + 0.12\,m_J$, so $m_J = \frac{1.4}{0.38} = \frac{70}{19}$ and $m_T = 2 + \frac{42}{19} = \frac{80}{19} \approx 4.2$ reviews.`,
    family: "absorbing-chain",
    verifiedBy: ["recursion", "dp", "simulation"],
  },
  {
    id: "m6-p19",
    module: 6,
    kind: "practice",
    difficulty: 3,
    tags: ["markov", "first-step", "expectation"],
    minutes: 3,
    title: "Days until the first rain",
    prompt: String.raw`In a simple weather model each day is sunny, cloudy or rainy, and tomorrow's weather depends only on today's. After a sunny day: sunny with probability $0.6$, cloudy $0.3$, rainy $0.1$. After a cloudy day: sunny $0.3$, cloudy $0.4$, rainy $0.3$. Today is sunny. Number the coming days 1, 2, 3, ... starting with tomorrow. What is the expected number of the first rainy day?`,
    answer: { type: "numeric", value: 6, exact: String.raw`6` },
    hints: [
      "Treat rain as absorbing. Let $s$ and $c$ be the expected number of days until rain starting from a sunny or cloudy day.",
      String.raw`$s = 1 + 0.6\,s + 0.3\,c$ and $c = 1 + 0.3\,s + 0.4\,c$.`,
      String.raw`From the second equation $c = \frac{1 + 0.3\,s}{0.6}$; substitute into the first.`,
    ],
    solution: String.raw`Let $s$ be the expected number of days until (and including) the first rainy day when today is sunny, and $c$ the same when today is cloudy. We want $s$.

Condition on tomorrow. From a sunny day, tomorrow costs one day; with probability $0.1$ it rains and we stop, with probability $0.6$ it is sunny again and we expect $s$ more days, and with probability $0.3$ it is cloudy and we expect $c$ more: $s = 1 + 0.6\,s + 0.3\,c$. Likewise $c = 1 + 0.3\,s + 0.4\,c$.

The second equation gives $0.6\,c = 1 + 0.3\,s$, so $c = \frac{5}{3} + \frac{1}{2}s$. Substitute into the first: $0.4\,s = 1 + 0.3\left(\frac{5}{3} + \frac{1}{2}s\right) = 1.5 + 0.15\,s$, so $0.25\,s = 1.5$ and $s = 6$. Then $c = \frac{5}{3} + 3 = \frac{14}{3}$.

The answer sits sensibly between the two naive guesses: if every day were sunny the wait would be $\frac{1}{0.1} = 10$ days, and if every day were cloudy it would be $\frac{1}{0.3} \approx 3.3$ days. Starting sunny but drifting into cloudy days gives 6. Answer: $6$ days.`,
    steps: [
      "Make rain absorbing; one unknown each for sunny and cloudy.",
      "Write the two first-step equations with a cost of 1 per day.",
      "Eliminate c and solve: s = 6, c = 14/3.",
      "Check the answer lies between the all-sunny and all-cloudy waits.",
    ],
    keyIdea: "Expected time to absorption: one equation per transient state, each with a +1 for the step taken.",
    commonMistake: String.raw`Answering $\frac{1}{0.1} = 10$ by using only the sunny-to-rain probability and ignoring the cloudy detour.`,
    fastPath: "Write the two equations, multiply through by 10 to clear decimals: 4s - 3c = 10 and -3s + 6c = 10. Double the first and add: 5s = 30.",
    variation: "Today is cloudy instead. What is the expected number of the first rainy day?",
    variationAnswer: String.raw`$c = \frac{14}{3} \approx 4.67$ days.`,
    family: "absorbing-chain",
    verifiedBy: ["recursion", "simulation"],
  },

  // ---------------------------------------------------------------- difficulty 4
  {
    id: "m6-p20",
    module: 6,
    kind: "practice",
    difficulty: 4,
    tags: ["patterns", "first-step", "coins"],
    minutes: 5,
    title: "Head-tail-head versus head-head-tail",
    prompt: String.raw`A fair coin is flipped repeatedly and independently. Pattern X is head, tail, head in three consecutive flips. Pattern Y is head, head, tail. Each pattern has probability $\frac{1}{8}$ on any three given flips. Compare the expected number of flips until each pattern first appears.`,
    answer: {
      type: "choice",
      options: [
        "Head-tail-head takes longer: 10 flips on average versus 8 for head-head-tail.",
        "Head-head-tail takes longer: 10 flips on average versus 8 for head-tail-head.",
        "They are equal at 8 flips, because both patterns have probability 1/8.",
        "They are equal at 10 flips, because both patterns start with a head.",
      ],
      correct: 0,
    },
    hints: [
      "Work out the progress states for each pattern and, crucially, where a wrong flip sends you.",
      "For head-head-tail, an extra head when you hold HH keeps you at HH. For head-tail-head, a tail when you hold HT sends you to nothing.",
      "Solve both three-state systems. One gives 8, the other 10.",
    ],
    solution: String.raw`For pattern Y (H, H, T) use states 0 (no progress), 1 (last flip H), 2 (last two flips HH). From state 2, a tail finishes and a head keeps you in state 2, since the last two flips are still HH: $E_2 = 1 + \frac{1}{2}E_2$, so $E_2 = 2$. From state 1, a head moves to state 2 and a tail resets: $E_1 = 1 + \frac{1}{2}E_2 + \frac{1}{2}E_0$. From state 0: $E_0 = 1 + \frac{1}{2}E_1 + \frac{1}{2}E_0$, so $E_0 = 2 + E_1$. Substituting, $E_1 = 1 + 1 + \frac{1}{2}(2 + E_1)$, giving $E_1 = 6$ and $E_0 = 8$.

For pattern X (H, T, H) use states 0, 1 (last flip H), 2 (last two flips HT). From state 2, a head finishes; a tail gives the recent history HTT, which contains no prefix of the pattern, so you fall to state 0: $E_2 = 1 + \frac{1}{2}E_0$. From state 1, a tail moves to state 2, a head keeps you in state 1: $E_1 = 1 + \frac{1}{2}E_2 + \frac{1}{2}E_1$, so $E_1 = 2 + E_2$. From state 0: $E_0 = 2 + E_1 = 4 + E_2 = 5 + \frac{1}{2}E_0$, so $E_0 = 10$.

So head-tail-head takes 10 flips on average and head-head-tail takes 8, even though both have probability $\frac{1}{8}$ per window. The reason is self-overlap: HTH shifted by two positions still matches an H, so when the pattern fails at the last flip you have thrown away more than for HHT, which cannot overlap itself at all. A pattern with no self-overlap always waits exactly $\frac{1}{P(\text{pattern})} = 8$; every self-overlap adds a term. Correct option: the first.`,
    steps: [
      "Set up three progress states for each pattern.",
      "For HHT, an extra head at state HH is harmless: E_0 = 8.",
      "For HTH, a tail at state HT drops you to nothing: E_0 = 10.",
      "Explain the gap by self-overlap and pick the first option.",
    ],
    keyIdea: String.raw`Expected wait $= \sum 2^{k}$ over the lengths $k$ at which the pattern overlaps itself (for a fair coin); HTH overlaps at lengths 1 and 3, HHT only at 3.`,
    commonMistake: "Assuming equal per-window probability means equal waiting time, or sending a wrong flip to state 0 when it actually preserves partial progress (or vice versa).",
    fastPath: "List self-overlaps. HHT: only the full length, 8. HTH: lengths 1 and 3, 2 + 8 = 10.",
    variation: "In a race, which pattern is more likely to appear first, HTH or HHT, and with what probability?",
    variationAnswer: String.raw`HHT wins with probability $\frac{2}{3}$. Let $x$ be the chance that HTH appears first; tails before the first head change nothing, so $x$ is also the chance from the state "last flip H". From there, another H gives HH, after which HHT is certain (any T completes it); a T gives HT, from which an H completes HTH and a T sends you back to the start. So $x = \frac{1}{2} \cdot 0 + \frac{1}{2}\left(\frac{1}{2} + \frac{1}{2}x\right) = \frac{1}{4} + \frac{1}{4}x$, giving $x = \frac{1}{3}$.`,
    family: "pattern-waiting",
    verifiedBy: ["recursion", "dp"],
  },
  {
    id: "m6-p21",
    module: 6,
    kind: "practice",
    difficulty: 4,
    tags: ["random-walk", "first-step", "expectation"],
    minutes: 5,
    title: "Filling a queue to five",
    prompt: String.raw`A job queue starts empty. In each one-second step, if the queue is non-empty, one new job arrives with probability $\frac{1}{2}$ or one job completes and leaves with probability $\frac{1}{2}$. If the queue is empty, a new job arrives with certainty in that step. Steps are independent. What is the expected number of seconds until the queue first holds 5 jobs?`,
    answer: { type: "numeric", value: 25, exact: String.raw`5^2 = 25` },
    hints: [
      "Let $e_k$ be the expected time to reach 5 from $k$ jobs. The empty queue is special: $e_0 = 1 + e_1$.",
      String.raw`For $1 \le k \le 4$, $e_k = 1 + \frac{1}{2}e_{k-1} + \frac{1}{2}e_{k+1}$, with $e_5 = 0$.`,
      String.raw`Guess $e_k = 25 - k^2$ and check it satisfies every equation, including the one at $k = 0$.`,
    ],
    solution: String.raw`Let $e_k$ be the expected number of further seconds until the queue first holds 5 jobs, given it currently holds $k$. We want $e_0$, and $e_5 = 0$.

For $1 \le k \le 4$, one step passes and the queue moves to $k - 1$ or $k + 1$ with equal probability: $e_k = 1 + \frac{1}{2}e_{k-1} + \frac{1}{2}e_{k+1}$. At the empty queue the step is forced upward: $e_0 = 1 + e_1$.

The interior equations say the second difference of $e_k$ is $-2$, so $e_k$ is a quadratic $-k^2 + bk + c$. The boundary at 5 gives $c = 25 - 5b$. The reflecting condition $e_0 = 1 + e_1$ gives $c = 1 + (-1 + b + c)$, so $b = 0$. Hence $e_k = 25 - k^2$ and $e_0 = 25$.

Check a couple of equations: $e_1 = 24$ and $1 + \frac{1}{2}(25 + 21) = 24$; $e_4 = 9$ and $1 + \frac{1}{2}(16 + 0) = 9$. Both hold.

In general, a fair walk pushed back from 0 needs $N^2$ steps on average to first reach level $N$. A nice way to see it: the walk with reflection at 0 behaves like the absolute value of an unrestricted fair walk, and the unrestricted walk takes $N \cdot N = N^2$ steps to leave the interval $(-N, N)$ from its midpoint. Answer: $25$ seconds.`,
    steps: [
      "Define e_k with e_5 = 0 and the forced step e_0 = 1 + e_1.",
      "Interior first-step equations make e_k quadratic with leading coefficient -1.",
      "Use the two boundary conditions to get e_k = 25 - k^2.",
      "Verify a couple of equations and report e_0 = 25.",
    ],
    keyIdea: String.raw`With a reflecting floor at 0, a fair walk takes $N^2$ steps on average to reach $N$: the same as leaving $(-N, N)$ from the middle.`,
    commonMistake: "Treating 0 as absorbing (which would make the expected time to reach 5 undefined) or using k(N - k) = 0 from the start.",
    fastPath: "Reflecting walk from 0 to N: N squared. 5 squared is 25.",
    variation: "The queue starts with 2 jobs instead of empty. Expected seconds until it first holds 5?",
    variationAnswer: String.raw`$e_2 = 25 - 4 = 21$ seconds.`,
    family: "random-walk",
    verifiedBy: ["recursion", "simulation"],
  },
  {
    id: "m6-p22",
    module: 6,
    kind: "practice",
    difficulty: 4,
    tags: ["random-walk", "gamblers-ruin", "expectation"],
    minutes: 5,
    title: "Exit time with a drift",
    prompt: String.raw`A price moves one tick per second, up with probability $0.6$ and down with probability $0.4$, independently. You hold a position and will close it when the price is 5 ticks above or 5 ticks below where it is now, whichever comes first. What is the expected number of seconds until you close?`,
    answer: { type: "numeric", value: 211 / 11, exact: String.raw`\frac{211}{11} \approx 19.18` },
    hints: [
      "Shift to a walk on 0 to 10 starting at 5. Let $D_k$ be the expected remaining steps with $D_0 = D_{10} = 0$.",
      String.raw`$D_k = 1 + 0.6\,D_{k+1} + 0.4\,D_{k-1}$. A particular solution is linear: try $D_k = \alpha k$ and find $\alpha$.`,
      String.raw`General solution $D_k = -5k + A + B(2/3)^k$; fit $A$ and $B$ from the boundaries, then read $D_5$. Or use the ruin probability $\frac{243}{275}$ with Wald's identity.`,
    ],
    solution: String.raw`Relabel so the lower exit is 0, the upper exit is 10 and the walk starts at 5, moving up with $p = 0.6$ and down with $q = 0.4$. Let $D_k$ be the expected remaining steps from $k$, with $D_0 = D_{10} = 0$ and $D_k = 1 + p\,D_{k+1} + q\,D_{k-1}$ for $1 \le k \le 9$.

The homogeneous equation $D_k = p\,D_{k+1} + q\,D_{k-1}$ has solutions $1$ and $(q/p)^k = (2/3)^k$. For a particular solution try $D_k = \alpha k$: $\alpha k = 1 + \alpha\,[p(k + 1) + q(k - 1)] = 1 + \alpha k + \alpha(p - q)$, which reduces to $0 = 1 + \alpha(p - q)$, so $\alpha = \frac{1}{q - p} = -5$. The general solution is $D_k = -5k + A + B(2/3)^k$.

Fit the boundaries: $D_0 = 0$ gives $A + B = 0$; $D_{10} = 0$ gives $-50 + A + B(2/3)^{10} = 0$. So $B\left((2/3)^{10} - 1\right) = 50$, i.e. $B = -\frac{50}{1 - (2/3)^{10}}$ and $A = -B$. Then
$$D_5 = -25 + A\left(1 - (2/3)^5\right) = -25 + 50\,\frac{1 - (2/3)^5}{1 - (2/3)^{10}} = -25 + \frac{50}{1 + (2/3)^5} = -25 + \frac{50 \cdot 243}{275} = \frac{211}{11}.$$

The same number comes from Wald's identity. The walk's drift is $p - q = 0.2$ per step, so the expected displacement at exit is $0.2\,E[T]$. The walk exits at $+5$ with probability $h = \frac{1 - (2/3)^5}{1 - (2/3)^{10}} = \frac{243}{275}$ and at $-5$ otherwise, so the expected displacement is $5h - 5(1 - h) = 5(2h - 1) = 5 \cdot \frac{211}{275} = \frac{211}{55}$. Dividing by the drift $0.2$: $E[T] = \frac{211}{55} \cdot 5 = \frac{211}{11} \approx 19.18$ seconds.

Compare with the fair case, $5 \cdot 5 = 25$ seconds; the drift makes the exit faster and heavily favours the upper boundary. Answer: $\frac{211}{11} \approx 19.18$.`,
    steps: [
      "Set up D_k on 0..10 with D_0 = D_10 = 0 and the biased first-step equation.",
      "Find the linear particular solution k/(q - p) = -5k and the homogeneous solutions 1 and (2/3)^k.",
      "Fit the two boundary constants and evaluate D_5.",
      "Cross-check with Wald: E[T] = E[exit displacement] / drift.",
    ],
    keyIdea: String.raw`With drift, expected duration $= \frac{k}{q-p} - \frac{N}{q-p}\,P(\text{reach } N)$; equivalently Wald's identity, displacement equals drift times time.`,
    commonMistake: String.raw`Using the fair-game product $5 \cdot 5 = 25$, or treating the drift as if the walk simply climbed 5 ticks at 0.2 per step (25 again) while ignoring the lower exit.`,
    fastPath: String.raw`Ruin probability from the midpoint is $\frac{1}{1 + (2/3)^5} = \frac{243}{275}$. Expected displacement $5(2h - 1) \approx 3.84$, divide by drift $0.2$: about $19.2$.`,
    variation: "Same drift, but you exit at +5 only (no lower exit). Expected seconds?",
    variationAnswer: String.raw`With positive drift the walk reaches $+5$ almost surely, and Wald gives $E[T] = \frac{5}{0.2} = 25$ seconds.`,
    family: "random-walk",
    verifiedBy: ["recursion", "simulation"],
  },
  {
    id: "m6-p23",
    module: 6,
    kind: "practice",
    difficulty: 4,
    tags: ["gamblers-ruin", "first-step"],
    minutes: 5,
    title: "Bet size against the house edge",
    prompt: String.raw`A casino game pays even money, and you win each bet with probability $0.49$, independently. You arrive with 50 dollars and will leave as soon as you either hold 60 dollars or are broke. You must choose one bet size and keep it for the whole session: 1 dollar, 5 dollars or 10 dollars per bet. Which choice gives the highest probability of leaving with 60 dollars?`,
    answer: {
      type: "choice",
      options: [
        "Bets of 10 dollars: the chance of reaching 60 is about 0.82.",
        "Bets of 1 dollar: many small bets smooth out the variance and give about 0.83.",
        "Bets of 5 dollars: a balance between variance and edge, about 0.80, beats both extremes.",
        "The bet size makes no difference: the chance is 50/60 = 5/6 whatever you do.",
      ],
      correct: 0,
    },
    hints: [
      String.raw`With bet size $b$ you play gambler's ruin in units of $b$: start at $50/b$, target $60/b$, with $r = \frac{0.51}{0.49}$.`,
      String.raw`$P = \frac{1 - r^{k}}{1 - r^{N}}$. Compute it for $(k, N) = (50, 60)$, $(10, 12)$ and $(5, 6)$.`,
      "Fewer, larger bets give the house edge fewer chances to act. Bold play wins.",
    ],
    solution: String.raw`Choosing a bet size $b$ turns the session into a gambler's ruin problem measured in units of $b$: you start at $k = 50/b$ units and stop at $N = 60/b$ or 0. With win probability $p = 0.49$ and $r = \frac{q}{p} = \frac{0.51}{0.49} \approx 1.0408$, the probability of reaching the target is $P = \frac{1 - r^k}{1 - r^N}$.

Bets of 1 dollar: $k = 50$, $N = 60$. $r^{50} \approx e^{50 \cdot 0.04} \approx 7.39$ and $r^{60} \approx 11.03$, so $P \approx \frac{6.39}{10.03} \approx 0.637$.

Bets of 5 dollars: $k = 10$, $N = 12$. $r^{10} \approx 1.492$, $r^{12} \approx 1.616$, so $P \approx \frac{0.492}{0.616} \approx 0.798$.

Bets of 10 dollars: $k = 5$, $N = 6$. $r^5 \approx 1.221$, $r^6 \approx 1.271$, so $P \approx \frac{0.221}{0.271} \approx 0.816$.

In a fair game every choice would give $\frac{50}{60} \approx 0.833$. The house edge erodes that, and it erodes more the more bets you make, because each bet leaks a little expectation and a long session of small bets leaks the most. Larger bets reach a decision in fewer rounds and leave less room for the edge to work, so the 10-dollar bets are best here: about 0.82 versus 0.80 and 0.64. This is the general rule when you face a negative edge and a fixed target: bet boldly. Correct option: the first.`,
    steps: [
      "Convert each bet size into a gambler's ruin in units: (50, 60), (10, 12), (5, 6).",
      "Apply the biased formula with r = 0.51/0.49 to each.",
      "Compare: 0.64, 0.80, 0.82; the fair value 0.83 is the ceiling.",
      "Conclude bold play is best against a negative edge.",
    ],
    keyIdea: "Against a negative edge, each extra bet costs expectation; larger bets reach the goal in fewer rounds and keep the probability closer to the fair-game value.",
    commonMistake: "Believing small bets are safer because they reduce variance; with a negative edge, low variance just means a slow, near-certain drift to the house.",
    fastPath: String.raw`Fair value is $5/6$. More rounds means more erosion: 1-dollar bets take hundreds of rounds, 10-dollar bets a handful. Pick the largest bet.`,
    variation: "The game instead pays you with win probability 0.51 (you have the edge). Which bet size now maximises the chance of reaching 60 before going broke?",
    variationAnswer: String.raw`Now small bets are best: with $r = 0.49/0.51 < 1$, 1-dollar bets give $P = \frac{1 - r^{50}}{1 - r^{60}} \approx 0.95$, 5-dollar bets about $0.86$, and 10-dollar bets about $0.85$. With a positive edge, grind it out.`,
    family: "gamblers-ruin",
    verifiedBy: ["recursion", "formula"],
  },
  {
    id: "m6-p24",
    module: 6,
    kind: "practice",
    difficulty: 4,
    tags: ["markov", "first-step", "expectation", "coins"],
    minutes: 4,
    title: "The trap on square three",
    prompt: String.raw`A mini board game has squares numbered 0 to 4 in a line. Your piece starts on square 0. Each turn you flip a fair coin: heads moves the piece one square forward, tails moves it two squares forward. If the piece lands exactly on square 3 (a trap), it is sent straight back to square 0 in the same turn. The game ends the moment the piece lands on square 4. What is the expected number of turns to finish?`,
    answer: { type: "numeric", value: 6, exact: String.raw`6` },
    hints: [
      "Transient states are squares 0, 1 and 2; square 3 is never occupied at the end of a turn because it bounces you to 0.",
      String.raw`From square 2: heads lands on the trap (back to 0), tails finishes. From square 1: heads goes to 2, tails hits the trap.`,
      String.raw`$e_2 = 1 + \frac{1}{2}e_0$, $e_1 = 1 + \frac{1}{2}e_2 + \frac{1}{2}e_0$, $e_0 = 1 + \frac{1}{2}e_1 + \frac{1}{2}e_2$.`,
    ],
    solution: String.raw`Let $e_k$ be the expected number of further turns from square $k$, for $k = 0, 1, 2$. Square 3 bounces to square 0 within the turn, so it is not a state of its own, and square 4 ends the game with $e_4 = 0$.

From square 0: heads to 1, tails to 2: $e_0 = 1 + \frac{1}{2}e_1 + \frac{1}{2}e_2$.

From square 1: heads to 2, tails to 3 and hence back to 0: $e_1 = 1 + \frac{1}{2}e_2 + \frac{1}{2}e_0$.

From square 2: heads to 3 and back to 0, tails to 4 and done: $e_2 = 1 + \frac{1}{2}e_0$.

Substitute the third equation into the second: $e_1 = 1 + \frac{1}{2}\left(1 + \frac{1}{2}e_0\right) + \frac{1}{2}e_0 = \frac{3}{2} + \frac{3}{4}e_0$. Then the first: $e_0 = 1 + \frac{1}{2}\left(\frac{3}{2} + \frac{3}{4}e_0\right) + \frac{1}{2}\left(1 + \frac{1}{2}e_0\right) = \frac{9}{4} + \frac{5}{8}e_0$. So $\frac{3}{8}e_0 = \frac{9}{4}$ and $e_0 = 6$ (with $e_1 = 6$ and $e_2 = 4$).

A quick plausibility check: without the trap the game would end within 4 turns (2 turns if both flips are tails, 4 if every flip is heads). Each visit to the trap costs you everything, and from square 2 you fall into it half the time, so a mean of 6 is reasonable. Answer: $6$ turns.`,
    steps: [
      "Identify the transient states 0, 1, 2; the trap is a transition, not a state.",
      "Write a first-step equation for each with +1 per turn.",
      "Substitute from square 2 upward and solve e_0 = 6.",
    ],
    keyIdea: "A square that immediately redirects you is a transition, not a state; keep the system to the squares where turns actually end.",
    commonMistake: "Giving square 3 its own equation with a free coin flip, or forgetting that a trap turn still counts as a turn.",
    fastPath: "e_2 = 1 + e_0/2 and e_1 = 3/2 + 3e_0/4; plug into e_0 and get (3/8)e_0 = 9/4.",
    variation: "The trap sends you back to square 1 instead of square 0. Expected number of turns from square 0?",
    variationAnswer: String.raw`Now $e_2 = 1 + \frac{1}{2}e_1$, $e_1 = 1 + \frac{1}{2}e_2 + \frac{1}{2}e_1$, so $e_1 = 2 + e_2 = 3 + \frac{1}{2}e_1$, $e_1 = 6$, $e_2 = 4$, and $e_0 = 1 + 3 + 2 = 6$. The same, by coincidence of the numbers.`,
    family: "absorbing-chain",
    verifiedBy: ["recursion", "simulation"],
  },
  {
    id: "m6-p25",
    module: 6,
    kind: "practice",
    difficulty: 4,
    tags: ["random-walk", "first-step", "expectation"],
    minutes: 4,
    title: "Round trip on a ring",
    prompt: String.raw`Six cells are arranged in a ring. A token starts on one of them and every second moves to a neighbouring cell, clockwise or anticlockwise with probability $\frac{1}{2}$ each, independently. What is the expected number of seconds until the token is back on its starting cell for the first time?`,
    answer: { type: "numeric", value: 6, exact: String.raw`1 + 1 \cdot 5 = 6` },
    hints: [
      "After the first move the token is one step from the start, going either way round.",
      "Cut the ring open at the start cell: the token is at position 1 on a line from 0 to 6, where both ends are the start cell.",
      "That is a fair gambler's ruin from 1 with boundaries 0 and 6: expected duration 1 times 5. Add the first step.",
    ],
    solution: String.raw`The first move always lands on a neighbour of the start cell; by symmetry it does not matter which. Let $e_k$ be the expected time for the token to reach the start cell from a cell at ring distance $k$, measured clockwise, for $k = 1, \dots, 5$.

Cut the ring at the start cell and unroll it into a line with positions 0, 1, 2, 3, 4, 5, 6, where both 0 and 6 are the start cell. The token at position $k$ moves to $k - 1$ or $k + 1$ with equal probability, and stops at 0 or 6. So $e_k = 1 + \frac{1}{2}e_{k-1} + \frac{1}{2}e_{k+1}$ with $e_0 = e_6 = 0$: the fair gambler's ruin duration, $e_k = k(6 - k)$.

After the first move the token is at $k = 1$ (or $k = 5$, the same thing), so $e_1 = 1 \cdot 5 = 5$. The total expected return time is $1 + 5 = 6$ seconds.

Sanity check from a different direction: a symmetric walk on an $n$-cycle has the uniform distribution as its stationary distribution, and for such a chain the expected return time to any state is $\frac{1}{\pi(\text{state})} = n$. With $n = 6$ that again gives 6, and the general answer for an $n$-cycle is $1 + (n - 1) = n$. Answer: $6$ seconds.`,
    steps: [
      "Take the first step: the token is at distance 1.",
      "Unroll the ring into a line 0..6 with both ends the start cell.",
      "Apply the fair ruin duration k(N - k) at k = 1: 5.",
      "Add the first step: 6. Check with the stationary-distribution return-time formula.",
    ],
    keyIdea: "Cutting a ring at the target turns the return-time question into gambler's ruin on an interval whose two ends are the same cell.",
    commonMistake: "Answering 2 (the chance of stepping straight back) or 5 by forgetting to count the first step; or trying to use the formula for the infinite line, where the expected return time is infinite.",
    fastPath: "Return time on an n-cycle is n. Six cells, six seconds.",
    variation: "Twelve cells in the ring. What is the expected return time, and what is the probability of returning in exactly 2 steps?",
    variationAnswer: String.raw`Return time $12$ seconds. Returning in exactly 2 steps needs the second step to reverse the first: probability $\frac{1}{2}$, the same for every ring with more than 2 cells.`,
    family: "random-walk",
    verifiedBy: ["recursion", "formula", "simulation"],
  },

  // ---------------------------------------------------------------- difficulty 5
  {
    id: "m6-p26",
    module: 6,
    kind: "practice",
    difficulty: 5,
    tags: ["patterns", "first-step", "expectation"],
    minutes: 7,
    title: "Up, down, down, up on a biased feed",
    prompt: String.raw`A signal feed emits one tick per second: Up with probability $0.6$ or Down with probability $0.4$, independently. A strategy triggers the first time the four most recent ticks read Up, Down, Down, Up in that order. What is the expected number of ticks until the strategy triggers, counting the final Up?`,
    answer: {
      type: "numeric",
      value: 1 / 0.6 + 1 / (0.6 * 0.4 * 0.4 * 0.6),
      exact: String.raw`\frac{1}{0.6} + \frac{1}{0.6 \cdot 0.4 \cdot 0.4 \cdot 0.6} = \frac{5}{3} + \frac{625}{36} = \frac{685}{36} \approx 19.03`,
    },
    hints: [
      "Four progress states: 0 (nothing), 1 (U), 2 (UD), 3 (UDD). For each state and each tick, find the longest prefix of UDDU that the recent history still matches.",
      "From state 2 (UD), an Up gives history ...UDU, whose useful suffix is U, so you go to state 1, not state 0. From state 3 (UDD), a Down gives ...DDD, which matches nothing: state 0.",
      String.raw`$E_3 = 1 + 0.4\,E_0$, $E_2 = 1 + 0.6\,E_1 + 0.4\,E_3$, $E_1 = 1 + 0.6\,E_1 + 0.4\,E_2$, $E_0 = 1 + 0.6\,E_1 + 0.4\,E_0$. Solve the four.`,
    ],
    solution: String.raw`Let $E_j$ be the expected number of further ticks when the longest suffix of the history that is a prefix of UDDU has length $j$, for $j = 0, 1, 2, 3$. We want $E_0$.

Work out where each tick sends you. From state 0: Up goes to state 1, Down stays at 0. From state 1 (history ends in U): Up keeps you at state 1 (the latest tick is still a U), Down goes to state 2 (UD). From state 2 (ends in UD): Down goes to state 3 (UDD); Up gives a history ending in UDU, and the longest suffix that is a prefix of UDDU is the single U, so you go to state 1. From state 3 (ends in UDD): Up completes the pattern; Down gives a history ending in DDD, which matches no prefix, so you drop to state 0.

The four first-step equations, with $p = 0.6$ for Up and $q = 0.4$ for Down:
$$E_0 = 1 + p\,E_1 + q\,E_0, \quad E_1 = 1 + p\,E_1 + q\,E_2, \quad E_2 = 1 + p\,E_1 + q\,E_3, \quad E_3 = 1 + q\,E_0.$$

Clear each equation of its self-loop. The first gives $(1 - q)E_0 = 1 + p\,E_1$, i.e. $0.6\,E_0 = 1 + 0.6\,E_1$, so $E_0 = \frac{5}{3} + E_1$. (Watch the trap here: $1 - q$ is $p = 0.6$, not $0.4$.) The second gives $(1 - p)E_1 = 1 + q\,E_2$, i.e. $0.4\,E_1 = 1 + 0.4\,E_2$, so $E_1 = \frac{5}{2} + E_2$. The fourth is $E_3 = 1 + 0.4\,E_0$.

Substitute into the third: $E_2 = 1 + 0.6\,E_1 + 0.4(1 + 0.4\,E_0) = \frac{7}{5} + 0.6\,E_1 + 0.16\,E_0$. With $E_1 = \frac{5}{2} + E_2$ and $E_0 = \frac{5}{3} + \frac{5}{2} + E_2 = \frac{25}{6} + E_2$ this becomes $E_2 = \frac{7}{5} + \frac{3}{2} + \frac{2}{3} + 0.76\,E_2 = \frac{107}{30} + 0.76\,E_2$, so $0.24\,E_2 = \frac{107}{30}$ and $E_2 = \frac{535}{36}$.

Then $E_1 = \frac{90}{36} + \frac{535}{36} = \frac{625}{36}$ and $E_0 = \frac{60}{36} + \frac{625}{36} = \frac{685}{36} \approx 19.03$.

The structure of the answer is no accident. $E_1 = \frac{625}{36} = \frac{1}{0.6 \cdot 0.4 \cdot 0.4 \cdot 0.6} = \frac{1}{P(\text{UDDU})}$, and $E_0 = E_1 + \frac{1}{0.6}$. That is the overlap formula: the expected wait is $\sum 1/P(\text{prefix}_k)$ over the lengths $k$ at which the pattern overlaps itself, and UDDU overlaps itself at $k = 1$ (the U at each end) and $k = 4$ (the whole pattern). A pattern with no self-overlap would wait exactly $\frac{1}{P(\text{pattern})}$; the leading and trailing U cost an extra $\frac{1}{P(\text{U})}$ because a failed attempt that ends in U leaves you in state 1 rather than at a clean restart, and this slightly longer memory makes the wait longer, not shorter. Answer: $\frac{685}{36} \approx 19.03$ ticks.`,
    steps: [
      "Define four progress states by the longest matched prefix.",
      "Map every (state, tick) pair to its next state, watching the UDU and DDD cases.",
      "Write four first-step equations and solve by substitution.",
      "Check against the self-overlap formula: 1/P(U) + 1/P(UDDU).",
    ],
    keyIdea: "The next state after a wrong tick is the longest suffix of the new history that is still a prefix of the pattern, not necessarily zero.",
    commonMistake: "Sending the Up after UD back to state 0 (it should go to state 1), or using 1/P(pattern) alone and missing the length-1 self-overlap.",
    fastPath: String.raw`Self-overlaps of UDDU: length 1 and length 4. $\frac{1}{0.6} + \frac{1}{0.0576} \approx 1.67 + 17.36 = 19.03$.`,
    variation: "Same feed, but the strategy triggers on Up, Down, Up, Down. Expected ticks?",
    variationAnswer: String.raw`UDUD overlaps itself at lengths 2 and 4: $\frac{1}{0.6 \cdot 0.4} + \frac{1}{(0.6 \cdot 0.4)^2} = \frac{25}{6} + \frac{625}{36} = \frac{775}{36} \approx 21.5$ ticks.`,
    family: "pattern-waiting",
    verifiedBy: ["recursion", "dp", "formula"],
  },
  {
    id: "m6-p27",
    module: 6,
    kind: "practice",
    difficulty: 5,
    tags: ["first-step", "expectation", "patterns", "dice"],
    minutes: 6,
    title: "Paying by the tick until a double X",
    prompt: String.raw`A data feed emits one symbol per tick, chosen uniformly and independently from six symbols, one of which is X. You pay \$1 for every tick that is not an X and \$3 for every tick that is an X. The feed stops immediately after the first time two consecutive ticks are both X, and you pay for every tick up to and including those two. What is your expected total payment in dollars?`,
    answer: { type: "numeric", value: 56, exact: String.raw`35 \cdot 1 + 7 \cdot 3 = 56`, unit: "dollars" },
    hints: [
      "Two progress states (no X pending, X pending), but now each step has a cost that depends on the symbol, not a flat 1.",
      String.raw`$C_1 = \frac{5}{6}(1 + C_0) + \frac{1}{6} \cdot 3$ and $C_0 = \frac{5}{6}(1 + C_0) + \frac{1}{6}(3 + C_1)$.`,
      "Or: the feed runs 42 ticks on average, and by Wald's identity one sixth of them are X on average: 7 X's at 3 dollars and 35 others at 1 dollar.",
    ],
    solution: String.raw`Let $C_0$ be the expected remaining payment when no X is pending (the last tick was not an X, or the feed has just started) and $C_1$ the expected remaining payment when the last tick was an X.

Condition on the next tick. From state 0: a non-X (probability $\frac{5}{6}$) costs 1 and leaves you in state 0; an X (probability $\frac{1}{6}$) costs 3 and moves you to state 1. So $C_0 = \frac{5}{6}(1 + C_0) + \frac{1}{6}(3 + C_1)$. From state 1: a non-X costs 1 and sends you back to state 0; an X costs 3 and ends the feed. So $C_1 = \frac{5}{6}(1 + C_0) + \frac{1}{6} \cdot 3$.

Multiply both by 6. The first gives $6C_0 = 5 + 5C_0 + 3 + C_1$, so $C_0 = 8 + C_1$. The second gives $6C_1 = 5 + 5C_0 + 3 = 8 + 5C_0$. Substitute: $6C_1 = 8 + 40 + 5C_1$, so $C_1 = 48$ and $C_0 = 56$.

The cross-check is a lovely use of Wald's identity. The feed runs for $T$ ticks where $E[T] = 6 + 36 = 42$ (two consecutive successes of probability $\frac{1}{6}$). Each tick is an X with probability $\frac{1}{6}$ independently of the past, and $T$ is a stopping time, so the expected number of X's is $E[T] \cdot \frac{1}{6} = 7$ even though the stopping rule depends on where the X's fall. The expected payment is $7 \cdot 3 + 35 \cdot 1 = 56$. Equivalently, the average cost per tick is $\frac{5}{6} \cdot 1 + \frac{1}{6} \cdot 3 = \frac{4}{3}$ dollars and $42 \cdot \frac{4}{3} = 56$.

Note that the two final X's are included in the 7: on average there are 5 "wasted" X's that were not followed by another, plus the pair that ends the feed. Answer: $56$ dollars.`,
    steps: [
      "Set up two progress states and attach a cost to each transition.",
      "Write C_0 = (5/6)(1 + C_0) + (1/6)(3 + C_1) and C_1 = (5/6)(1 + C_0) + 3/6.",
      "Solve: C_1 = 48, C_0 = 56.",
      "Check with Wald: 42 ticks at an average of 4/3 dollars each.",
    ],
    keyIdea: "First-step equations handle rewards by replacing the +1 with the expected cost of the step; Wald's identity gives the same answer as expected duration times average cost per step.",
    commonMistake: String.raw`Counting only the two final X's at 3 dollars ($40 \cdot 1 + 2 \cdot 3 = 46$) and forgetting the X's that were not followed by another X.`,
    fastPath: "Expected ticks 42, average cost per tick 4/3: 56.",
    variation: "The feed instead stops after the first time an X is immediately followed by a Y (another specific symbol). Expected payment?",
    variationAnswer: String.raw`No self-overlap, so $E[T] = 36$ ticks; average cost per tick is still $\frac{4}{3}$, so $48$ dollars.`,
    family: "pattern-waiting",
    verifiedBy: ["recursion", "dp"],
  },
  {
    id: "m6-p28",
    module: 6,
    kind: "practice",
    difficulty: 5,
    tags: ["random-walk", "first-step", "expectation", "markov"],
    minutes: 7,
    title: "Holding costs on a bounded inventory",
    prompt: String.raw`A trading bot's inventory starts at 0 and changes by $+1$ or $-1$ each tick with probability $\frac{1}{2}$ each, independently. At the start of every tick the bot pays a holding cost equal to the absolute value of its inventory at that moment, in dollars (so a tick that starts at inventory 0 costs nothing, and the tick that starts at inventory 2 costs \$2 whatever happens next). The bot is shut down the moment the inventory reaches $+3$ or $-3$: at $+3$ it receives a payment of \$30, at $-3$ it receives nothing, and no further holding cost is charged, since no tick starts at $\pm 3$. What is the bot's expected net profit (payment minus total holding costs) in dollars?`,
    answer: { type: "numeric", value: 7, exact: String.raw`\tfrac{1}{2} \cdot 30 - 8 = 7`, unit: "dollars" },
    hints: [
      String.raw`Split the problem: expected terminal payment is $30 \cdot P(\text{hit } +3 \text{ first})$, and the expected holding cost is a separate first-step system.`,
      String.raw`Let $c_k$ be the expected future holding cost from inventory $k$: $c_k = |k| + \frac{1}{2}c_{k-1} + \frac{1}{2}c_{k+1}$ with $c_{\pm 3} = 0$, and $c_{-k} = c_k$ by symmetry.`,
      String.raw`With $c_0 = c_1$ (symmetry), solve $c_1 = 1 + \frac{1}{2}c_0 + \frac{1}{2}c_2$ and $c_2 = 2 + \frac{1}{2}c_1$.`,
    ],
    solution: String.raw`Split the profit into the terminal payment and the running cost, and handle each with its own first-step system. Linearity of expectation lets us add the two expectations even though the payment and the costs are dependent.

**Terminal payment.** The walk is fair and starts midway between $-3$ and $+3$, so it exits at $+3$ with probability $\frac{1}{2}$ (the fair gambler's ruin value $\frac{k}{N}$ with $k = 3$, $N = 6$). Expected payment: $\frac{1}{2} \cdot 30 = 15$ dollars.

**Holding cost.** Let $c_k$ be the expected total future holding cost from inventory $k$, with $c_{\pm 3} = 0$. Each tick that starts at $k$ costs $|k|$ and then moves to $k \pm 1$: $c_k = |k| + \frac{1}{2}c_{k-1} + \frac{1}{2}c_{k+1}$. By symmetry $c_{-k} = c_k$, which turns the five unknowns into three. At $k = 0$: $c_0 = 0 + \frac{1}{2}c_{-1} + \frac{1}{2}c_1 = c_1$. At $k = 1$: $c_1 = 1 + \frac{1}{2}c_0 + \frac{1}{2}c_2 = 1 + \frac{1}{2}c_1 + \frac{1}{2}c_2$, so $c_1 = 2 + c_2$. At $k = 2$: $c_2 = 2 + \frac{1}{2}c_1 + \frac{1}{2} \cdot 0$. Substituting, $c_2 = 2 + 1 + \frac{1}{2}c_2$, so $c_2 = 6$, $c_1 = 8$ and $c_0 = 8$.

A cross-check through expected visits: the walk takes $3 \cdot 3 = 9$ ticks on average, and the expected numbers of ticks starting at inventory $0, \pm 1, \pm 2$ are $3, 2, 2, 1, 1$ respectively (they sum to 9). Weighting by $|k|$: $0 \cdot 3 + 1 \cdot 4 + 2 \cdot 2 = 8$ dollars. Same answer.

**Net.** Expected profit $= 15 - 8 = 7$ dollars. The bot makes money on average, but note the asymmetry hidden in the average: half the time it collects 30 minus costs, and half the time it pays costs and gets nothing. Answer: $7$ dollars.`,
    steps: [
      "Separate the terminal payment from the running costs using linearity.",
      "Terminal: fair walk from the midpoint hits +3 with probability 1/2, expected payment 15.",
      "Holding cost: first-step system c_k = |k| + average of neighbours, use symmetry to cut it to three unknowns.",
      "Solve c_0 = 8 and report 15 - 8 = 7.",
    ],
    keyIdea: "A reward that depends on the state goes into the first-step equation in place of the +1; symmetry halves the system.",
    commonMistake: "Charging a holding cost of 3 at the moment of shutdown (no tick starts at inventory 3), or counting the 9-tick expected duration as 9 dollars of cost when the cost per tick depends on the inventory.",
    fastPath: "Payment 30 times 1/2 = 15. Visits from the midpoint of a 6-wide interval are 3, 2, 2, 1, 1; cost 0 + 2 + 2 + 2 + 2 = 8. Net 7.",
    variation: "The bot is shut down at +3 or -3 as before, but the holding cost per tick is the square of the inventory. Expected total holding cost?",
    variationAnswer: String.raw`Weights $k^2$ on the same visit counts: $0 \cdot 3 + 1 \cdot 4 + 4 \cdot 2 = 12$ dollars, so the net profit becomes $15 - 12 = 3$.`,
    family: "random-walk",
    verifiedBy: ["recursion", "dp"],
  },

  // ---------------------------------------------------------------- lesson checks
  {
    id: "m6-lc1",
    module: 6,
    kind: "lessonCheck",
    difficulty: 1,
    tags: ["first-step", "coins", "expectation"],
    minutes: 1,
    title: "Flips until the first head",
    prompt: String.raw`You flip a fair coin repeatedly and independently until it shows heads. What is the expected number of flips, including the final head?`,
    answer: { type: "numeric", value: 2, exact: String.raw`\frac{1}{1/2} = 2` },
    hints: [
      "Let $E$ be the expected number of flips and condition on the first one.",
      String.raw`$E = 1 + \frac{1}{2}E$.`,
      "Solve: $E = 2$.",
    ],
    solution: String.raw`Let $E$ be the expected number of flips. The first flip costs 1. With probability $\frac{1}{2}$ it is a head and you stop; with probability $\frac{1}{2}$ it is a tail and you are back where you started, expecting $E$ more flips.

So $E = 1 + \frac{1}{2}E$, which gives $\frac{1}{2}E = 1$ and $E = 2$. This is the mean of a geometric distribution with success probability $\frac{1}{2}$. Answer: $2$ flips.`,
    steps: ["Name the unknown E.", "Condition on the first flip: E = 1 + E/2.", "Solve E = 2."],
    keyIdea: "A failure restarts the process, so the unknown reappears on the right-hand side.",
    commonMistake: "Answering 1 (the most likely number of flips) instead of the expectation 2.",
    fastPath: "Success probability one half means two attempts on average.",
    variation: "The coin shows heads with probability 0.2. Expected flips?",
    variationAnswer: String.raw`$\frac{1}{0.2} = 5$.`,
    verifiedBy: ["recursion", "simulation"],
  },
  {
    id: "m6-lc2",
    module: 6,
    kind: "lessonCheck",
    difficulty: 1,
    tags: ["gamblers-ruin", "first-step"],
    minutes: 1,
    title: "Two chips against three",
    prompt: String.raw`You hold 2 chips and your opponent holds 3. Each round a fair coin decides who hands one chip to the other, and play continues until someone has all 5 chips. What is the probability that you win all 5?`,
    answer: { type: "numeric", value: 2 / 5, exact: String.raw`\frac{2}{5} = 0.4` },
    hints: [
      "Fair game: the win probability from $k$ chips is the average of the win probabilities from $k - 1$ and $k + 1$.",
      "That makes the probabilities linear in $k$, from 0 at $k = 0$ to 1 at $k = 5$.",
      String.raw`$p_2 = \frac{2}{5}$.`,
    ],
    solution: String.raw`Let $p_k$ be your probability of winning everything from $k$ chips, with $p_0 = 0$ and $p_5 = 1$. Conditioning on one fair round gives $p_k = \frac{1}{2}p_{k-1} + \frac{1}{2}p_{k+1}$, so the $p_k$ are equally spaced and $p_k = \frac{k}{5}$.

From 2 chips, $p_2 = \frac{2}{5} = 0.4$. Equivalently, in a fair game your expected final holding equals your current 2 chips, and $5 p_2 = 2$. Answer: $\frac{2}{5} = 0.4$.`,
    steps: ["Define p_k with p_0 = 0, p_5 = 1.", "Fair game makes p_k linear in k.", "Read off p_2 = 2/5."],
    keyIdea: "In a fair game you win the pot with probability equal to your share of it.",
    commonMistake: "Answering 1/2 because each round is fair.",
    fastPath: "Your share of the chips: 2 of 5.",
    variation: "You now hold 2 chips and your opponent 8. Probability you win all 10?",
    variationAnswer: String.raw`$\frac{2}{10} = \frac{1}{5}$.`,
    family: "gamblers-ruin",
    verifiedBy: ["recursion", "simulation"],
  },
  {
    id: "m6-lc3",
    module: 6,
    kind: "lessonCheck",
    difficulty: 2,
    tags: ["recursion", "coins"],
    minutes: 1,
    title: "Four flips without a double head",
    prompt: String.raw`How many sequences of 4 coin flips (each flip recorded as H or T) contain no two consecutive H's?`,
    answer: { type: "numeric", value: 8, exact: String.raw`a_4 = 8 \quad (2, 3, 5, 8)` },
    hints: [
      "Let $a_n$ be the count for length $n$ and condition on the last flip.",
      "$a_n = a_{n-1} + a_{n-2}$ with $a_1 = 2$, $a_2 = 3$.",
      "$a_3 = 5$, $a_4 = 8$.",
    ],
    solution: String.raw`Let $a_n$ be the number of length-$n$ sequences with no two consecutive H's. If the last flip is T, the first $n - 1$ flips are any valid sequence ($a_{n-1}$ ways); if it is H, the flip before must be T and the first $n - 2$ flips are any valid sequence ($a_{n-2}$ ways). So $a_n = a_{n-1} + a_{n-2}$.

With $a_1 = 2$ and $a_2 = 3$ (everything except HH), $a_3 = 5$ and $a_4 = 8$. Listing them confirms it: TTTT, TTTH, TTHT, THTT, HTTT, THTH, HTHT, HTTH. Answer: $8$.`,
    steps: ["Condition on the last flip.", "Recurrence a_n = a_(n-1) + a_(n-2), a_1 = 2, a_2 = 3.", "Compute a_4 = 8."],
    keyIdea: "Avoiding HH gives a shifted Fibonacci count.",
    commonMistake: "Starting from a_1 = 1 and reporting 5.",
    fastPath: "2, 3, 5, 8: four flips gives 8.",
    variation: "What is the probability that 4 fair flips contain no two consecutive H's?",
    variationAnswer: String.raw`$\frac{8}{16} = \frac{1}{2}$.`,
    verifiedBy: ["enumeration", "dp"],
  },
  {
    id: "m6-lc4",
    module: 6,
    kind: "lessonCheck",
    difficulty: 2,
    tags: ["first-step", "dice", "expectation"],
    minutes: 1,
    title: "Rolling a five or a six",
    prompt: String.raw`You roll a fair six-sided die repeatedly and independently until it shows a 5 or a 6. What is the expected number of rolls, including the final one?`,
    answer: { type: "numeric", value: 3, exact: String.raw`\frac{1}{2/6} = 3` },
    hints: [
      String.raw`Each roll succeeds with probability $\frac{2}{6}$.`,
      String.raw`$E = 1 + \frac{4}{6}E$.`,
      "Solve: $E = 3$.",
    ],
    solution: String.raw`Each roll shows a 5 or a 6 with probability $\frac{2}{6} = \frac{1}{3}$, independently of earlier rolls. Let $E$ be the expected number of rolls. Conditioning on the first roll, $E = 1 + \frac{2}{3}E$, because a failure (probability $\frac{2}{3}$) leaves you exactly where you started.

So $\frac{1}{3}E = 1$ and $E = 3$. This is the mean $\frac{1}{p}$ of a geometric wait with $p = \frac{1}{3}$. Answer: $3$ rolls.`,
    steps: ["Find the per-roll success probability 1/3.", "Write E = 1 + (2/3)E.", "Solve E = 3."],
    keyIdea: "A geometric wait has mean one over the success probability.",
    commonMistake: "Answering 6 by using the probability of a single face instead of the two faces together.",
    fastPath: "Success chance 1 in 3, so 3 rolls on average.",
    variation: "You need a 4, 5 or 6. Expected rolls?",
    variationAnswer: "Success probability one half, so 2 rolls.",
    verifiedBy: ["recursion", "simulation"],
  },
];
