import type { Lesson } from "../types";

/** Module 10 lesson: test simulation, pacing, and the coding warmup. */
export const lesson: Lesson = {
  intro: String.raw`The real assessment is 75 minutes long and has 12 questions: 11 on probability, expected value, counting and logic, and 1 coding question. A calculator is allowed. You can move freely between questions, so nothing forces you to answer in order, but the clock never pauses, and leaving the browser tab or window ends the attempt. Everything you have practised in Modules 1 to 9 is the raw material; this module is about turning it into a score under those exact conditions.

The questions themselves are not exotic. Most are difficulty 2 or 3 in this app's scale: one idea, two or three steps, a number at the end. What separates a good attempt from a poor one is rarely knowledge. It is reading a question properly the first time, keeping the arithmetic honest, noticing when an answer cannot be right, and refusing to spend fifteen minutes on a question that was worth six. Those are skills, and like the maths they improve with deliberate practice.

This lesson gives you a pacing plan, a short routine to run on every question, a set of sanity checks that catch most errors in seconds, and a method for the coding question that gets a correct brute force on the board before you try anything clever. The practice set is a mixed bag, deliberately: counting next to Bayes next to a logic grid, the way the test does it. Work it under a timer, with the calculator you will actually use on the day.`,

  cards: [
    {
      title: "The clock: five and a half minutes a question, a four-minute skip rule",
      body: String.raw`75 minutes over 12 questions is 6 minutes and 15 seconds each. Give the coding question a budget of about 15 minutes and you have 60 minutes for 11 math questions: 5 minutes 27 seconds each, call it five and a half. Six minutes on every math question plus fifteen on coding is 81 minutes, so six is the ceiling, not the pace. Write the budget on your scratch paper before you start so it is a plan, not a feeling.

- **The four-minute rule.** If after four minutes you do not have a clear setup (the sample space, the equation, the table), skip the question. Flag it and move on. A hard question does not score more than an easy one.
- **Order is yours.** Free navigation means a first pass through everything you can set up in under a minute, then a second pass for the rest, then a last pass for guesses.
- **Check the clock at fixed points,** not continuously: after questions 4, 8 and 11. Every check should answer one question: am I ahead or behind the five-and-a-half-minute pace?

Running out of time with two untouched questions is the most common way a prepared candidate underperforms, and it is entirely avoidable.`,
      formula: String.raw`\text{pace} = \frac{\text{minutes left}}{\text{questions left}}`,
      example: "After seven math questions at six minutes each (half a minute over pace on each) and fifteen minutes of coding, 18 minutes remain for four questions: 4.5 each, so it is time to skip aggressively.",
    },
    {
      title: "Read twice, then write the sample space",
      body: String.raw`Most wrong answers on this test are answers to a slightly different question. Read the question once to see what it is about, then a second time looking for the words that change the formula: *fair*, *independent*, *with replacement*, *at least*, *exactly*, *given that*, *in order*, *distinct*.

Before any arithmetic, write one line that names the model: "4 draws without replacement from 7 green and 5 orange", "binomial, n = 7, p = 0.6", "states 0 to 6, absorb at 7 or more". If you cannot write that line, you do not yet understand the question, and more arithmetic will not help.

Finally write down what is being asked: a probability, an expected value in dollars, a count, a fraction of a bankroll. Circle it. The last thing you do on the question is check that the number you submit is that quantity.`,
      example: "'Position of the second red card' is an expected value between 2 and 11, not a probability; writing that down first rules out half the plausible-looking wrong answers.",
    },
    {
      title: "Sanity checks that take ten seconds",
      body: String.raw`Run these before moving on from any numerical answer:

- **Range.** A probability lies in $[0, 1]$. An expected value lies between the smallest and largest possible outcome. An expected count never exceeds the number of opportunities, and for a rare event over a handful of opportunities it is below 1.
- **Direction.** Evidence for a hypothesis moves its probability up from the prior and evidence against moves it down; the size of the move is set by the likelihood ratio, not by the sensitivity alone (a 95% sensitive screen on a 2% prior gives a posterior near 0.24, nowhere near 0.95). An edge in a game moves the win probability up from the fair value.
- **Symmetry.** If swapping labels leaves the problem unchanged, the probabilities must be equal; if three closed boxes must share probability 1, their values must add to 1.
- **Extremes.** Set a parameter to 0 or 1 in your formula. Does it give the obvious answer? With $p = 1$ a biased gambler's ruin should return probability 1.
- **Order of magnitude.** A mean of 3.5 per roll means roughly two rolls to reach 7; an answer of 12 rolls is wrong before you check the algebra.

A failed check does not tell you the answer, but it tells you to look again, and that is where the marks are.`,
      formula: String.raw`0 \le P \le 1, \qquad \min X \le E[X] \le \max X`,
      example: "Four boxes: stay 1/4, switch 3/8 to either of two boxes. 1/4 + 3/8 + 3/8 = 1, so the split is at least consistent.",
    },
    {
      title: "Use the calculator for C(n,k) and powers, not for thinking",
      body: String.raw`The calculator is for the things humans get wrong under pressure: binomial coefficients, powers, and long products. It is not a substitute for the setup.

- Know the small binomials cold ($\binom{7}{4} = 35$, $\binom{10}{4} = 210$, $\binom{12}{4} = 495$) and use the calculator for the rest. If it has no nCr key, use $\binom{n}{k} = \frac{n(n-1)\cdots(n-k+1)}{k!}$ with the smaller of $k$ and $n-k$.
- Powers by repeated squaring: $0.9^8$ is three squarings. $(5/6)^4$ is two.
- $e^{-\lambda}$ for Poisson: $e^{-1} \approx 0.3679$, $e^{-2} \approx 0.1353$, $e^{-3} \approx 0.0498$. Memorise these three.
- Keep fractions exact until the last step: $\frac{190}{778}$ is better than $0.244$ on scratch paper because you can still see where it came from.

Type each number once, read the display, and write it down. Re-typing a long product from memory is how a correct method produces a wrong answer.`,
      formula: String.raw`\binom{n}{k} = \frac{n(n-1)\cdots(n-k+1)}{k!}, \qquad x^8 = \left(\left(x^2\right)^2\right)^2`,
      example: "0.9 squared is 0.81, squared is 0.6561, squared is 0.4305; so P(at least one of eight absent) is 0.5695.",
    },
    {
      title: "When to guess and move on",
      body: String.raw`Some questions will not yield in six minutes. The skill is to recognise that early and to leave behind the best answer you can rather than a blank.

- **Multiple choice:** eliminate options that fail a sanity check (a probability over 1, a strategy that ignores information you were given, an expected value outside the range), then pick from what is left.
- **Numeric:** write down a bound-based estimate. Expected rolls to reach 7 is more than 2 and less than 3; a guess of 2.5 is close to the truth. A posterior after a positive signal is above the prior, and for a rare hypothesis with a non-trivial false-positive rate it stays far below the signal's sensitivity.
- **Never** leave a question on the first pass without a written guess next to it; you may not get back.

Guessing is not giving up. It is the correct response to a budget. Return on the last pass if time allows, and treat any extra minutes as a bonus.`,
      example: "Three closed boxes after a knowing host opens one: anything that assigns 1/3 to each ignores his rule, so cross it out and choose between the remaining options.",
    },
    {
      title: "The coding question: examples, brute force, improve, edge case",
      body: String.raw`One question is a short program. The grader cares that it is correct on its tests; elegance is secondary. Follow four steps in order.

1. **Read the examples first.** They pin down the input format, what counts as a valid answer and the boundary behaviour (empty input, a single element, ties). Rewrite the first example in your own words.
2. **Write the brute force.** Nested loops, a direct simulation, a full enumeration. Get a program that produces the example output. This is your safety net and often it is fast enough.
3. **Improve only if needed.** The usual upgrades are a hash map to replace an inner loop, sorting to make a scan possible, or a small DP table defined by a clear state. Keep the brute force in a comment and compare outputs.
4. **Test one edge case yourself.** Empty, size one, all equal, the largest allowed value. Run it before you submit.

Fifteen minutes is a reasonable budget. If step 2 is working and time is short, submit it.`,
      example: "Count pairs that sum to a target: two loops first (n^2); then a frequency map in one pass. Both must agree on the example before you keep the fast one.",
    },
    {
      title: "The last five minutes",
      body: String.raw`With five minutes left, stop solving and start securing.

- Every question has an answer in the box: your computed value, or your bound-based guess from the first pass. Blanks score nothing.
- Re-read the circled 'what is asked' line on the two or three questions you were least sure of. Units (dollars, rolls, a fraction) and 'probability versus count' are the usual slips.
- Do not start a new derivation. A half-finished rework at minute 74 replaces a decent guess with nothing.
- Do not leave the browser tab or window, open another tab or alt-tab to a calculator app: that ends the attempt. Use the on-screen or physical calculator you decided on beforehand, and rehearse with the app's lockdown mode so the habit is already there.

Submit with a minute to spare rather than at the buzzer.`,
      example: "Unsure between 0.29 and 0.71 on a binomial question: check the circled line. 'Exactly 4' is 0.29; 'at least 4' is 0.71.",
    },
    {
      title: "The day before",
      body: String.raw`Nothing you learn on the day before will change the result. What you do with your setup and your sleep will.

- Take one full mixed set of 11 problems from this module under a 60-minute timer, with the calculator you will use. Mark the two topics that felt slowest and reread those modules' formula sheets, nothing more.
- Decide the environment: a quiet room, a laptop on power, a stable connection, a calculator, scratch paper and a pen on the desk. Close every other application before you start, because leaving the browser tab or window ends the attempt.
- Write the pacing plan on the scratch paper in advance: five and a half minutes a math question, fifteen for coding, four-minute skip rule, clock checks after questions 4, 8 and 11.
- Sleep. A tired candidate misreads 'at least' as 'exactly'; a rested one does not.

On the day, read the instructions screen slowly as well. If any detail of the format differs from what you planned for, adjust the plan before you start the clock.`,
      example: "If the Bayes questions were your slow spot, the thing to review is the 10,000-case table, not a new textbook chapter.",
    },
  ],

  workedExamples: [
    {
      title: "A test-level counting question, paced",
      prompt: String.raw`A jar holds 4 red and 6 blue marbles. You draw 3 marbles at random without replacement. What is the probability that exactly 2 of them are red?`,
      steps: [
        {
          text: "First read: a draw without replacement, a probability. Second read, hunting for the words that matter: 'without replacement' (so combinations, not powers), 'exactly 2' (not at least). Write the model: 3 of 10, equally likely subsets.",
          math: String.raw`\text{Denominator: } \binom{10}{3} = 120`,
        },
        {
          text: "Count the favourable subsets: choose 2 of the 4 red marbles and 1 of the 6 blue.",
          math: String.raw`\binom{4}{2}\binom{6}{1} = 6 \cdot 6 = 36`,
        },
        {
          text: "Divide. Keep the fraction exact on paper and reduce it.",
          math: String.raw`P = \frac{36}{120} = \frac{3}{10}`,
        },
        {
          text: "Sanity check (ten seconds): the value is in [0,1]; the expected number of reds is 3 times 4/10 = 1.2, so 'exactly 2' being around 0.3 is plausible, and it should be smaller than 'exactly 1', which is C(4,1)C(6,2)/120 = 60/120 = 0.5. Both agree.",
        },
        {
          text: "Check what was asked: a probability, exactly 2 red. Submit 0.3. Elapsed time about two minutes, which banks three minutes for a harder question later.",
        },
      ],
      answer: String.raw`\frac{3}{10} = 0.3`,
    },
    {
      title: "A Bayes question with the 10,000-case table",
      prompt: String.raw`Two machines make the same part. Machine A produces 60% of the output with a 2% defect rate; machine B produces 40% with a 5% defect rate. A part is picked at random and found to be defective. What is the probability it came from machine B?`,
      steps: [
        {
          text: "Second read: the condition is 'found to be defective', and the question is about the machine. This is a reverse-conditional, so plan a table rather than a formula.",
        },
        {
          text: "Take 10,000 parts. Split by machine, then count defects in each group.",
          math: String.raw`A: 6{,}000 \text{ parts}, \; 120 \text{ defective}; \qquad B: 4{,}000 \text{ parts}, \; 200 \text{ defective}`,
        },
        {
          text: "The denominator is everything consistent with what you observed: all defective parts.",
          math: String.raw`P(B \mid \text{defective}) = \frac{200}{120 + 200} = \frac{200}{320} = \frac{5}{8}`,
        },
        {
          text: "Sanity check: the prior for B was 0.4; a defect is evidence for the worse machine, so the posterior must rise. 0.625 is above 0.4 and below 1. The likelihood ratio 5/2 times prior odds 2/3 gives posterior odds 5/3, and 5/(5+3) = 5/8 confirms it.",
        },
        {
          text: "Check what was asked: machine B, given defective. Submit 0.625. Under three minutes.",
        },
      ],
      answer: String.raw`\frac{5}{8} = 0.625`,
    },
  ],

  tryIt: {
    prompt: String.raw`Three fair coins are flipped. What is the probability that there are more heads than tails?`,
    answer: { type: "numeric", value: 1 / 2, exact: String.raw`\frac{\binom{3}{2} + \binom{3}{3}}{2^3} = \frac{4}{8} = \frac{1}{2}` },
    solution: String.raw`Second read: three flips, 'more heads than tails' means 2 or 3 heads (there is no tie with an odd number of flips). Model: $2^3 = 8$ equally likely sequences.

Count: exactly 2 heads in $\binom{3}{2} = 3$ ways, exactly 3 heads in $\binom{3}{3} = 1$ way, so 4 favourable sequences and $P = \frac{4}{8} = \frac{1}{2}$.

Sanity check by symmetry: swapping the labels heads and tails maps 'more heads' onto 'more tails', and with no ties possible those two events split the whole space equally. The symmetry argument is the fast path and the count is the confirmation; on the test, either alone is enough, but seeing both in ten seconds is what makes an answer safe.`,
  },

  checkIds: ["m10-lc1", "m10-lc2", "m10-lc3", "m10-lc4"],

  formulas: [
    {
      name: "Complement",
      latex: String.raw`P(\text{at least one}) = 1 - P(\text{none}) = 1 - (1 - p)^n`,
      note: "Independent trials; without replacement, P(none) is a ratio of binomial coefficients.",
    },
    {
      name: "Bayes as counts",
      latex: String.raw`P(H \mid E) = \frac{\#(H \text{ and } E)}{\#E} = \frac{P(E \mid H)P(H)}{P(E \mid H)P(H) + P(E \mid H^c)P(H^c)}`,
      note: "Use a population of 10,000; the denominator is everything consistent with what you observed.",
    },
    {
      name: "Posterior odds",
      latex: String.raw`\frac{P(H \mid E)}{P(H^c \mid E)} = \frac{P(H)}{P(H^c)} \cdot \frac{P(E \mid H)}{P(E \mid H^c)}`,
      note: "Sequential evidence multiplies likelihood ratios; convert odds o back to probability o/(1+o).",
    },
    {
      name: "Linearity and indicators",
      latex: String.raw`E\!\left[\sum_i I_i\right] = \sum_i P(I_i = 1)`,
      note: "Expected counts of anything: one indicator per possible occurrence, dependence irrelevant.",
    },
    {
      name: "Tail sum",
      latex: String.raw`E[T] = \sum_{j \ge 0} P(T > j)`,
      note: "Non-negative integer waits and positions; P(T > j) is often a single combinatorial ratio.",
    },
    {
      name: "Binomial and Poisson",
      latex: String.raw`\binom{n}{k}p^k(1-p)^{n-k} \;\approx\; e^{-\lambda}\frac{\lambda^k}{k!}, \quad \lambda = np`,
      note: "Use Poisson when n is large and p small; memorise e^{-1}, e^{-2}, e^{-3}.",
    },
    {
      name: "Geometric wait and first-step equations",
      latex: String.raw`E[\text{wait}] = \frac{1}{p}, \qquad E_s = 1 + \sum_{s'} P(s \to s')\,E_{s'}`,
      note: "Condition on the first step; one linear equation per transient state, zero at absorbing states.",
    },
    {
      name: "Gambler's ruin",
      latex: String.raw`P(\text{reach } N \text{ from } k) = \frac{k}{N} \;(p = q), \qquad \frac{1 - (q/p)^k}{1 - (q/p)^N} \;(p \ne q)`,
      note: "Chips, points or dollars moving one unit per round; check the fair case first as a sanity bound.",
    },
    {
      name: "Standard error of a Monte Carlo mean",
      latex: String.raw`\mathrm{se} = \frac{\sigma}{\sqrt{n}}, \qquad n = \left(\frac{\sigma}{\mathrm{se}}\right)^2`,
      note: "Halving the error needs four times the trials; a simulation's average converges to the expectation.",
    },
    {
      name: "Kelly fraction",
      latex: String.raw`f^* = p - \frac{q}{b}`,
      note: "Stake fraction maximising expected log growth for a bet paying b-to-1; half-Kelly is the practical choice.",
    },
  ],

  outro: String.raw`The written test checks whether you can get the number. A live interview checks whether you can get the number *while talking*, and that is a different skill with the same content. Three habits carry over directly from this module. First, speak the structure before the arithmetic: "this is a conditional probability, I will condition on the flag and build a table of ten thousand". Interviewers award more for a clear setup with a slip in the arithmetic than for a correct number with no visible reasoning. Second, state your assumptions out loud: fair die, independent rounds, uniform host. If the interviewer meant something else, you find out now rather than three minutes later. Third, estimate before you compute. "Between two and three rolls, probably about two and a half" said early, followed by the exact 2.52, shows that you understand the problem and not just the method.

The variations attached to every problem in this app exist for the interview, not the test. After each answer, the interviewer changes one assumption: the coin becomes biased, the draws are now without replacement, the host opens two doors, a reroll now costs a dollar. Practise answering the base question and the variation in one breath, naming the tool you switch to. When you get stuck, say what you would simulate: describing a Monte Carlo procedure that converges to the answer is a legitimate and respected move.

Finish your preparation with mixed sets, not topic drills. Take a full 11-question set from this module's practice bank under a timer twice a week, review every miss by category, and go back to the module whose problems you were slowest on. Then stop studying the night before and sleep. You have done the work; the test is where you show it.`,
};
