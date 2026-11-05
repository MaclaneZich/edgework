import type { Lesson } from "../types";

/** Module 6 lesson: First-step analysis and recursion. */
export const lesson: Lesson = {
  intro: String.raw`A surprising number of interview questions are really the same question: "how long until something happens, and which of two things happens first?" How many flips until two heads in a row? What is the chance a trader with a small edge doubles her bankroll before going bust? How many steps does a price take to leave a band? How likely is a trainee to make senior before being let go? Every one of these is solved by a single move: condition on the first step, write down what the problem looks like afterwards, and let the resulting equation do the work.

That move is first-step analysis. The unknown you want (an expectation, a probability) appears on both sides of an equation, because after one step you are often back in a situation you have already named. Instead of summing an infinite series, you solve a small linear system. The hard part is never the algebra; it is choosing the states so that "where am I after one step" is always one of the states you named.

This module builds the technique from a single geometric wait to absorbing Markov chains with several states, with gambler's ruin and random walks as the two families you will meet most often. Along the way you will learn why HH takes six flips while HT takes four, why a tiny edge is decisive over many rounds, why bold bets beat small ones against a casino, and how to count strings that avoid a pattern with the same recursion that counts stair-climbs. By the end you should be able to hear a waiting-time question, name the states in your head, and write the equations before the interviewer finishes the sentence.`,

  cards: [
    {
      title: "The first-step idea",
      body: String.raw`Let $E$ be the quantity you want, from the situation you are in now. Take exactly one step. Each outcome of that step has a probability and lands you in some situation, often one you can describe with the same unknown or a sibling of it. Expectation of the whole equals the step's own cost plus the probability-weighted expectations of what follows.

- For expected times: $E_s = 1 + \sum_j p_{sj} E_j$ (the 1 is the step you just took).
- For probabilities: $h_s = \sum_j p_{sj} h_j$ (no 1: nothing is "spent" by a step).
- Terminal situations have known values: $E = 0$ when you are already done, $h = 1$ or $0$ at the two kinds of ending.

The art is choosing states so that the future depends only on the state, not on how you got there. If you find yourself needing the history, you have too few states.`,
      formula: String.raw`E_s = c_s + \sum_j p_{sj}\,E_j, \qquad h_s = \sum_j p_{sj}\,h_j`,
      example: "Rolls until a six: E = 1 + (5/6)E, because a failed roll puts you back where you started.",
    },
    {
      title: "Waiting for a single event",
      body: String.raw`If each trial succeeds independently with probability $p$, the first-step equation is $E = 1 + (1 - p)E$, so $E = \frac{1}{p}$. This is the mean of the geometric distribution and the building block for everything else.

- The failed trials carry no information: the process is memoryless, which is exactly what lets the same $E$ appear on both sides.
- The "setup roll" trap: if the first trial cannot succeed (it only fixes a target for the next one), add it separately. Rolls until the same face twice in a row: $1 + 6 = 7$.
- A changing target does not matter if the per-trial success probability stays the same.

Whenever a wait decomposes into stages that cannot be undone, add the stage waits: wait for a head (2), then wait for a tail (2), total 4 for the pattern HT.`,
      formula: String.raw`E[\text{trials until first success}] = \frac{1}{p}`,
      example: "Rolling until a 5 or a 6: p = 1/3, so 3 rolls on average.",
    },
    {
      title: "Progress states for patterns",
      body: String.raw`To wait for a pattern, track how much of it you currently hold: the length of the longest suffix of the history that is a prefix of the pattern. Each new symbol moves you to a new progress level, and a wrong symbol does not always send you to zero.

- HT with a fair coin: after an H, another H keeps you at "H". Progress is never lost: $E = 2 + 2 = 4$.
- HH: after an H, a T destroys everything: $E_1 = 1 + \frac{1}{2}E_0$, $E_0 = 2 + E_1$, so $E_0 = 6$.
- Self-overlap is the key. A pattern that overlaps itself (HH, HTH, UDDU) waits longer than one that does not (HT, HHT), because a near miss wastes more.

The closed form: expected wait $= \sum 1/P(\text{prefix}_k)$ over the lengths $k$ at which the pattern's prefix of length $k$ equals its suffix of length $k$. A non-self-overlapping pattern waits exactly $1/P(\text{pattern})$. A run of $r$ successes waits $\frac{1}{p} + \frac{1}{p^2} + \dots + \frac{1}{p^r}$.`,
      formula: String.raw`E[T_{\text{HH}}] = \frac{1}{p} + \frac{1}{p^2}, \qquad E[T_{\text{HT}}] = \frac{1}{pq}, \qquad E[T_{\text{run of } r}] = \sum_{i=1}^{r} \frac{1}{p^i}`,
      example: "Fair coin: HH waits 6, HT waits 4, HHH waits 14, HTH waits 10, HHT waits 8.",
    },
    {
      title: "Gambler's ruin: fair and biased",
      body: String.raw`You hold $k$ units, play one unit per round, and stop at $0$ or $N$. Let $h_k$ be the probability of reaching $N$ first.

- **Fair game.** $h_k = \frac{1}{2}h_{k-1} + \frac{1}{2}h_{k+1}$ says each value is the average of its neighbours, so $h_k$ is linear: $h_k = \frac{k}{N}$, your share of the pot. The expected duration $D_k$ satisfies $D_k = 1 + \frac{1}{2}D_{k-1} + \frac{1}{2}D_{k+1}$, a quadratic with second difference $-2$ vanishing at both ends: $D_k = k(N - k)$.
- **Biased game** with win probability $p$ and $r = q/p$: consecutive differences grow by the factor $r$, so $h_k = \frac{1 - r^k}{1 - r^N}$. From the midpoint, $h_{N/2} = \frac{1}{1 + r^{N/2}}$.
- **The edge compounds.** At $p = 0.45$, from 5 aiming for 10, $h \approx 0.27$; from 50 aiming for 100, $h \approx 4 \times 10^{-5}$. Against a negative edge, bet boldly: fewer rounds give the edge less time.`,
      formula: String.raw`h_k = \frac{k}{N}\ (p = \tfrac{1}{2}), \qquad h_k = \frac{1 - (q/p)^k}{1 - (q/p)^N}\ (p \ne \tfrac{1}{2}), \qquad D_k = k(N-k)\ (p = \tfrac{1}{2})`,
      example: "Three chips against seven in a fair game: win the pot with probability 3/10 and expect 21 rounds of play.",
    },
    {
      title: "Random walks: hitting and exit times",
      body: String.raw`A simple random walk is gambler's ruin with the stakes relabelled. Measure from the lower boundary and the formulas carry over.

- Fair walk from 0: hits $+a$ before $-b$ with probability $\frac{b}{a + b}$ (the nearer boundary is likelier, in proportion). Expected time to leave $(-b, a)$ is $ab$.
- The zero-drift shortcut: a fair walk's expected exit position equals its start, so $a \cdot P(\text{top}) - b \cdot (1 - P(\text{top})) = 0$ gives $P(\text{top})$ in one line.
- With drift $p - q \ne 0$: hitting probabilities use the $(q/p)^k$ formula, and Wald's identity gives the duration, $E[\text{exit position}] = (p - q)\,E[T]$.
- A reflecting floor at 0 (forced step up) makes the expected time to reach $N$ equal to $N^2$. An unrestricted fair walk on the whole line returns to its start with probability one but its expected return time is infinite; on a ring of $n$ cells it is exactly $n$.

Always check whether the question has one boundary or two. A fair walk with a single target has infinite expected hitting time.`,
      formula: String.raw`P(\text{hit } +a \text{ before } -b) = \frac{b}{a+b}, \qquad E[T_{\text{exit}}] = ab, \qquad E[\text{displacement at exit}] = (p - q)\,E[T]`,
      example: "Take profit 5 ticks up, stop loss 3 ticks down, fair ticks: probability 3/8 of the profit, 15 ticks on average to exit.",
    },
    {
      title: "Absorbing Markov chains",
      body: String.raw`When the states are not just a line (a trader can be promoted, demoted or fired; weather can be sunny, cloudy or rainy), write one unknown per transient state and one first-step equation for each. Absorbing states contribute constants: probability 1 or 0 for "which absorbing state do I hit", value 0 for "how many steps remain".

- Absorption probability into target $A$: $h_s = \sum_j p_{sj} h_j$ with $h_A = 1$ and $h = 0$ at the other absorbing states.
- Expected steps to absorption: $m_s = 1 + \sum_j p_{sj} m_j$ with $m = 0$ at absorbing states.
- Self-loops are fine: $m_s = 1 + 0.5\,m_s + \dots$ just gets rearranged. Do not drop them.
- A state that instantly redirects you (a trap that sends you back to start) is a transition, not a state. Keep the system to the states where steps actually end.

In matrix form, with $Q$ the transient-to-transient block, the expected numbers of visits are $N = (I - Q)^{-1}$; row sums of $N$ are the expected times to absorption, and $NR$ gives the absorption probabilities. For 2 to 4 states, substitution is faster than inverting.`,
      formula: String.raw`m = \mathbf{1} + Q\,m \iff m = (I - Q)^{-1}\mathbf{1}, \qquad h = Q\,h + R\,e_A`,
      example: "Trainee stays 0.5, up 0.3, out 0.2; Junior down 0.2, stays 0.5, senior 0.2, out 0.1: a trainee makes senior with probability 6/19.",
    },
    {
      title: "Counting by recursion",
      body: String.raw`The same conditioning counts things. Condition on the last symbol (or the last step) and the count splits into disjoint cases, each a smaller instance of the same problem.

- Binary strings of length $n$ with no two consecutive 1s: last symbol 0 leaves $a_{n-1}$ options, last symbol 1 forces a 0 before it and leaves $a_{n-2}$. So $a_n = a_{n-1} + a_{n-2}$ with $a_1 = 2$, $a_2 = 3$: 2, 3, 5, 8, 13, 21, 34, 55. That is $F_{n+2}$.
- Ways to climb $n$ steps taking 1 or 2 at a time: $c_n = c_{n-1} + c_{n-2}$, $c_1 = 1$, $c_2 = 2$: 1, 2, 3, 5, 8, 13, 21, 34, 55, 89. That is $F_{n+1}$.
- Allow steps of 1, 2 or 3 and you get a three-term recurrence; forbid a longer pattern and you track more of the recent history.

Probability of avoiding the pattern in $n$ fair flips is the count over $2^n$. Do not multiply per-pair probabilities as if adjacent pairs were independent; they share a flip.`,
      formula: String.raw`a_n = a_{n-1} + a_{n-2}, \qquad P(\text{no HH in } n \text{ fair flips}) = \frac{F_{n+2}}{2^n}`,
      example: "Eight fair flips with no two consecutive heads: 55 of 256, about 0.215.",
    },
    {
      title: "Sanity checks that catch wrong equations",
      body: String.raw`First-step systems fail silently: a wrong transition still produces a tidy number. Check the number before you say it.

- **Shortest path.** An expected time must exceed the minimum possible time, and usually by a lot. Expected flips to HHH cannot be 3 or 4.
- **Bounds from easier problems.** The wait for a pattern of probability $P$ is at least $1/P$, with equality exactly for non-self-overlapping patterns. Expected time until rain from a sunny start lies between the all-sunny wait and the all-cloudy wait.
- **Fair case first.** In a fair game the win probability is your share and the duration is the product of stakes. Your biased answer should move the right way from those.
- **Linearity and Wald.** For rewards that accrue per step, expected total reward equals expected number of steps times the average reward per step, when the per-step reward is i.i.d. and the stopping rule is a stopping time. Use it as a cross-check on any first-step system with costs.
- **Where does a wrong symbol go?** The most common error in pattern problems is sending a near miss to state 0 when it still contains a prefix (waiting for UDDU, the history UD followed by U still holds a U, so you are in state 1, not 0), or to the same state when it should restart (waiting for HH, a T after an H sends you to 0, not back to "H").`,
      example: "If your expected wait for two sixes in a row came out at 36, you forgot that a failed attempt restarts you; the answer is 42.",
    },
  ],

  workedExamples: [
    {
      title: "Waiting for up, up, down",
      prompt: String.raw`A price feed ticks up or down each second with probability one half each, independently. Find the expected number of ticks until the pattern up, up, down first appears.`,
      steps: [
        {
          text: "Name the progress states by how much of the pattern the recent history matches: state 0 (nothing useful), state 1 (last tick U), state 2 (last two ticks UU). Reaching UUD ends the process.",
        },
        {
          text: "From state 2, a D finishes, and a U keeps the last two ticks at UU, so you stay in state 2. The equation has the unknown on both sides.",
          math: String.raw`E_2 = 1 + \tfrac{1}{2}\cdot 0 + \tfrac{1}{2}E_2 \quad\Rightarrow\quad E_2 = 2`,
        },
        {
          text: "From state 1, a U moves to state 2 and a D destroys the progress (the history now ends in D, which is not a prefix of UUD), sending you to state 0.",
          math: String.raw`E_1 = 1 + \tfrac{1}{2}E_2 + \tfrac{1}{2}E_0`,
        },
        {
          text: "From state 0, a U moves to state 1 and a D leaves you in state 0. Rearranging gives E_0 in terms of E_1.",
          math: String.raw`E_0 = 1 + \tfrac{1}{2}E_1 + \tfrac{1}{2}E_0 \quad\Rightarrow\quad E_0 = 2 + E_1`,
        },
        {
          text: "Substitute upward: E_1 = 1 + 1 + (2 + E_1)/2, so E_1 = 6 and E_0 = 8. Check: the pattern has probability 1/8 and no self-overlap, so 1/P = 8 is exactly right.",
          math: String.raw`E_1 = 6, \qquad E_0 = 8`,
        },
      ],
      answer: "8 ticks",
    },
    {
      title: "A biased ruin with three unknowns",
      prompt: String.raw`You hold 2 units and win each independent round with probability 0.4, gaining or losing one unit. You stop at 0 or at 4 units. What is the probability of reaching 4?`,
      steps: [
        {
          text: "Let p_k be the probability of reaching 4 from k units. The boundaries are known: p_0 = 0 and p_4 = 1. The unknowns are p_1, p_2, p_3.",
        },
        {
          text: "Condition on one round from each transient state. No +1 appears because we are computing a probability, not a time.",
          math: String.raw`p_1 = 0.4\,p_2, \qquad p_2 = 0.4\,p_3 + 0.6\,p_1, \qquad p_3 = 0.4 + 0.6\,p_2`,
        },
        {
          text: "Substitute the outer equations into the middle one.",
          math: String.raw`p_2 = 0.4(0.4 + 0.6\,p_2) + 0.6(0.4\,p_2) = 0.16 + 0.48\,p_2 \quad\Rightarrow\quad p_2 = \frac{0.16}{0.52} = \frac{4}{13}`,
        },
        {
          text: "Compare with the closed form. With r = q/p = 1.5, the formula gives the same value, confirming the system.",
          math: String.raw`p_2 = \frac{1 - 1.5^2}{1 - 1.5^4} = \frac{-1.25}{-4.0625} = \frac{4}{13} \approx 0.308`,
        },
        {
          text: "Sanity check: a fair game from the midpoint would give exactly 1/2, and a 40% win rate should pull that down noticeably. 0.31 is in the right place.",
        },
      ],
      answer: String.raw`\frac{4}{13} \approx 0.308`,
    },
  ],

  tryIt: {
    prompt: String.raw`You roll a fair six-sided die repeatedly and independently, stopping the first time two consecutive rolls show different faces. What is the expected total number of rolls?`,
    answer: { type: "numeric", value: 11 / 5, exact: String.raw`1 + \frac{1}{5/6} = \frac{11}{5} = 2.2` },
    solution: String.raw`The first roll cannot complete anything; it only sets the face that the next roll must differ from. So count it separately and let $A$ be the expected number of additional rolls once you hold a face.

The next roll differs from the one you hold with probability $\frac{5}{6}$, whatever that face is. If it matches (probability $\frac{1}{6}$), you hold a face again and the situation is unchanged. First-step: $A = 1 + \frac{1}{6}A$, so $\frac{5}{6}A = 1$ and $A = \frac{6}{5}$.

The expected total is $1 + \frac{6}{5} = \frac{11}{5} = 2.2$ rolls. Sanity check: the shortest possible run is 2 rolls, and most of the time (five sixths) that is exactly what happens, so an expectation just above 2 is right.`,
  },

  checkIds: ["m6-lc1", "m6-lc2", "m6-lc3", "m6-lc4"],

  formulas: [
    {
      name: "First-step equation (expected time)",
      latex: String.raw`E_s = 1 + \sum_j p_{sj}\,E_j, \qquad E = 0 \text{ at absorbing states}`,
      note: "One equation per transient state; the 1 is the step you just took. Replace the 1 by the step's expected cost for rewards.",
    },
    {
      name: "First-step equation (probability)",
      latex: String.raw`h_s = \sum_j p_{sj}\,h_j, \qquad h = 1 \text{ at the target}, \ h = 0 \text{ at the other endings}`,
      note: "Absorption probabilities; no +1 because a step costs nothing.",
    },
    {
      name: "Geometric wait",
      latex: String.raw`E = 1 + (1-p)E \ \Rightarrow\ E = \frac{1}{p}`,
      note: "Trials until the first success with per-trial probability p; add a setup trial separately if the first trial cannot succeed.",
    },
    {
      name: "Two successes in a row",
      latex: String.raw`E[T_{SS}] = \frac{1}{p} + \frac{1}{p^2}, \qquad E[T_{SF}] = \frac{1}{p(1-p)}`,
      note: "HH on a fair coin: 6; HT: 4; two sixes in a row: 42; six then five: 36.",
    },
    {
      name: "Run of r successes",
      latex: String.raw`E[T] = \sum_{i=1}^{r} \frac{1}{p^i} \quad (= 2^{r+1} - 2 \text{ for a fair coin})`,
      note: "Three heads in a row: 14; four: 30.",
    },
    {
      name: "Pattern wait by self-overlaps",
      latex: String.raw`E[T_A] = \sum_{k:\ A_{1..k} = A_{m-k+1..m}} \frac{1}{P(A_{1..k})}`,
      note: "Sum over the lengths k at which the pattern's prefix equals its suffix (always including k = m). No self-overlap means E = 1/P(A).",
    },
    {
      name: "Fair gambler's ruin",
      latex: String.raw`P(\text{reach } N \text{ from } k) = \frac{k}{N}, \qquad E[\text{duration}] = k(N-k)`,
      note: "Probability is your share of the pot; duration is the product of the two stakes.",
    },
    {
      name: "Biased gambler's ruin",
      latex: String.raw`P(\text{reach } N \text{ from } k) = \frac{1 - (q/p)^k}{1 - (q/p)^N}, \qquad E[T_k] = \frac{k}{q-p} - \frac{N}{q-p}\,P(\text{reach } N)`,
      note: "p = win probability, q = 1 - p. From the midpoint the probability is 1/(1 + (q/p)^(N/2)). Against a negative edge, bet boldly.",
    },
    {
      name: "Fair walk hitting probability",
      latex: String.raw`P(\text{hit } +a \text{ before } -b) = \frac{b}{a+b}, \qquad E[\text{exit time}] = ab`,
      note: "Nearer boundary is likelier; also from zero drift: expected exit position equals the start.",
    },
    {
      name: "Wald's identity",
      latex: String.raw`E\!\left[\sum_{i=1}^{T} X_i\right] = E[T]\,E[X_1]`,
      note: "i.i.d. steps and a stopping time T with finite mean. Gives durations with drift and total rewards as duration times average reward.",
    },
    {
      name: "Reflecting floor and rings",
      latex: String.raw`E[\text{time to reach } N \text{ from } 0 \text{ with reflection at } 0] = N^2, \qquad E[\text{return time on an } n\text{-cycle}] = n`,
      note: "Reflecting walk behaves like |fair walk|; the ring return time is 1 + (n-1) via gambler's ruin on the unrolled ring.",
    },
    {
      name: "No two consecutive 1s",
      latex: String.raw`a_n = a_{n-1} + a_{n-2}, \quad a_1 = 2,\ a_2 = 3 \ \Rightarrow\ a_n = F_{n+2}`,
      note: "Strings avoiding HH; stair climbs by 1s and 2s use the same recurrence with c_1 = 1, c_2 = 2.",
    },
  ],

  outro: String.raw`On the timed test these questions reward people who have the small systems pre-solved. Know the numbers cold: 6 and 4 for HH and HT, 14 for HHH, 42 for two sixes, $k/N$ and $k(N-k)$ for the fair game, $b/(a+b)$ for the fair walk. Then spend your time on the only thing that can go wrong, the transitions: for every state and every outcome, say where you land and why. Write the equations with the unknown on both sides and clear the self-loop before substituting; that single habit removes most arithmetic errors.

In a live interview the first answer is a warm-up. The escalation is predictable. They change the bias ("now the coin is 60/40"), and you should know the fair answer moves in the direction of the favoured side and that linear becomes geometric. They add a state ("the trap sends you to square 1 instead of 0", "a junior can be demoted"), and you should add one unknown and one equation, nothing more. They ask for the variance or a bound ("roughly how spread out is that waiting time?"), and the honest answer is that waiting times for rare patterns are roughly exponential, so the standard deviation is about the mean, and a Markov or Chebyshev bound follows. They ask what happens as the stake or the target grows, and you should be able to say that a fixed edge becomes decisive, with the probability of doubling a stake of $k$ against the house decaying like $(p/q)^{k}$.

Practise saying the reasoning aloud, state by state, because that is what is being assessed: not whether you remember 42, but whether you can rebuild it under pressure and then rebuild it again with a changed rule. Next: Module 7 turns these expected values into decisions, where you choose when to stop and how much to bet.`,
};
