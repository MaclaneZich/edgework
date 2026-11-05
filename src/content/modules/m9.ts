import type { Lesson } from "../types";

/** Module 9 lesson: Logic, brainteasers, and combinatorial puzzles. */
export const lesson: Lesson = {
  intro: String.raw`Brainteasers are the part of a quant interview that candidates fear most and prepare for least. The fear is misplaced. Nobody is hired for having memorised the answer to a riddle; the interviewer already knows you may have seen it. What they are watching is how you take an open-ended question and turn it into something with structure: a state space, a count, a quantity that cannot change, a bound that cannot be beaten. This module teaches those moves and gives you a vocabulary for saying them aloud.

The techniques are few and they repeat. Pigeonhole turns "guarantee" questions into a worst-case construction. Invariants and parity settle "can this be reached" questions in two lines. The information bound (three outcomes per weighing, two per yes/no question) tells you the minimum number of steps before you design a single one. Hat puzzles are about agreeing a convention that lets one person's call carry information for everyone else. Knights and knaves are biconditionals. Induction means solving the small case and asking what changes when you add one more.

Underneath all of them is one habit: write the state down. A puzzle that looks like a story becomes a graph with a handful of nodes, and then the question is just "what is the shortest path" or "which nodes are reachable". Every practice problem in this module is verified by exactly that kind of search, so you can trust the answers and focus on the reasoning. By the end you will be able to classify a brainteaser in the first ten seconds, name the tool, and narrate your way to the answer even when you have never seen the puzzle.`,

  cards: [
    {
      title: "Structure a search: state, moves, goal",
      body: String.raw`Most "clever" puzzles are shortest-path problems on a small graph that nobody drew. Draw it. Three questions turn a story into a search:

- **State.** What is the complete description of the situation at any moment? A tuple: which bank each item is on, how many tokens are left, which pan each coin has visited. If the state is incomplete you will get stuck; if it carries irrelevant detail the graph explodes.
- **Moves.** Which states are one legal step apart? Write the rule as a function, including the constraints that make some states forbidden.
- **Goal.** Which states count as done?

Then search: breadth-first for minimum moves, exhaustive for "is it reachable", backwards from the goal for games. Three samples through an airlock is sixteen states; four trays across three bays is $3^4 = 81$. Both are small enough to think about completely, and saying "the state is a 4-tuple, there are at most 81 of them" is itself a strong interview answer.`,
      formula: String.raw`\text{state} \in S,\quad \text{moves} \subseteq S \times S,\quad \text{answer} = \text{shortest path from start to goal}`,
      example: "Technician plus acid, base and buffer, each in one of two rooms: 2^4 = 16 states, four of them forbidden (acid and base together away from the technician, buffer anywhere), shortest path 5.",
    },
    {
      title: "Pigeonhole: more items than holes",
      body: String.raw`If $n + 1$ items go into $n$ holes, some hole holds at least two. More generally, $n(k - 1) + 1$ items force some hole to hold at least $k$. The principle is trivial; the skill is choosing the holes.

- To guarantee two items with a **shared property**, the holes are the values of the property (colours, weekdays, remainders).
- To guarantee two items with a **relation** (sum to 21, differ by 10), the holes are the pairs that satisfy the relation; two items in one hole are exactly what you want.
- With a **limited supply**, the worst case takes $\min(\text{supply}, k - 1)$ from each hole; then add one.
- For sums divisible by $m$, the items are the running totals and the holes are the residues mod $m$.

Always build the worst case explicitly. "Ten badges, one from each complementary pair, no pair complete" proves that ten is not enough; the pigeonhole step proves eleven is.`,
      formula: String.raw`n(k-1) + 1 \text{ items in } n \text{ holes} \Rightarrow \text{some hole has} \ge k`,
      example: "Four cable colours: five pulls guarantee a match, nine guarantee three of one colour.",
    },
    {
      title: "Invariants and parity",
      body: String.raw`An invariant is a quantity that no legal move changes. If the start and the target have different values of an invariant, the target is unreachable, full stop. Parity (odd or even) is the most common invariant; chessboard colourings and weighted sums are the next.

- Counting moves: "each move changes the number of heads by an even amount" means the parity of heads is fixed.
- Chessboard colouring: a move that touches one dark and one light cell preserves dark-total minus light-total.
- Merge rules: when two numbers $a, b$ are replaced by $g(a, b)$ and the final result does not depend on the order, look for $f$ with $f(g(a,b)) = f(a) + f(b)$ or $f(a) f(b)$. For $a + b + 2ab$ it is $f(x) = 2x + 1$, which multiplies.
- Games: the losing positions for a subtraction game form a residue class; the winning strategy is to hand your opponent that class every turn.

Two warnings. An invariant only proves impossibility; when the invariant matches you still owe a construction. And "the total is even" is often too weak: look for a finer colouring or a weighted sum.`,
      formula: String.raw`f(\text{state}) \text{ unchanged by every move},\quad f(\text{start}) \ne f(\text{target}) \Rightarrow \text{unreachable}`,
      example: "Five coins heads up, flip two at a time: heads count stays odd, so all tails is impossible.",
    },
    {
      title: "The information bound: 3^k weighings, 2^k questions",
      body: String.raw`A procedure with $k$ steps, each of which has at most $r$ outcomes, can distinguish at most $r^k$ cases. So before designing anything, count the cases and the outcomes.

- A balance weighing has three outcomes, so $k$ weighings handle at most $3^k$ candidates: 9 coins in 2, 27 in 3, and 28 needs 4.
- A yes/no question has two outcomes: $k$ questions handle $2^k$ items, so 16 lockers take 4 and 20 take 5.
- If the odd coin may be heavier or lighter, each coin gives two cases, and when the direction must be reported with no reference coin the exact capacity is $(3^k - 3)/2$: 3 coins in 2 weighings, 12 in 3.

The bound is necessary, not sufficient. Four batteries, heavy or light, make 8 cases and $3^2 = 9 \ge 8$, yet two weighings cannot work because no first weighing leaves at most 3 cases in every outcome. After the bound, check that the first step splits the cases nearly evenly; for a balance, that means thirds.`,
      formula: String.raw`r^k \ge N \iff k \ge \lceil \log_r N \rceil, \qquad \text{balance, heavy-or-light with direction: } N \le \tfrac{3^k - 3}{2}`,
      example: "Twenty-eight vials, one heavier: 27 fit in three weighings, so 28 takes four. Split 9-9-10.",
    },
    {
      title: "Hat puzzles: agree a convention",
      body: String.raw`In every hat puzzle someone has no information about their own hat. The trick is never to make that person guess well; it is to make their call carry information for everyone else.

- **Line of hats**, each sees those in front: the back speaker announces the parity of the colours ahead (or the sum of colour codes mod the number of colours). Everyone after is right; $n - 1$ guaranteed, $n$ impossible because the back speaker's view is identical for both own colours.
- **Simultaneous calls with passing**, win if someone speaks and nobody is wrong: each speaker is right exactly half the time, so total right calls equal total wrong calls across all assignments. Pile the wrong calls onto as few assignments as possible. For three people, speak only when you see two matching hats and name the other colour: lose only when all three match, win with probability $3/4$.
- **Everyone must speak, all must be right**: agree a parity of the whole configuration; all right or all wrong, probability $1/2$ for two colours.

Say the convention out loud before the analysis; interviewers want to hear "they agree in advance that ..." as the first sentence.`,
      formula: String.raw`\text{announce } \Bigl(\sum \text{colour codes ahead}\Bigr) \bmod c \quad \Rightarrow \quad n - 1 \text{ correct}`,
      example: "Ten interns in a line, red or blue: the back one announces the parity of reds; nine correct guaranteed.",
    },
    {
      title: "Knights and knaves as biconditionals",
      body: String.raw`A truth-teller's statement is true; a liar's is false. So every statement $S$ by speaker $X$ is the single equation
$$S \iff (X \text{ is a truth-teller}).$$

Useful consequences, each one a line of algebra:
- "$Y$ is a truth-teller" said by $X$ means $X$ and $Y$ are the same type. "$Y$ is a liar" means they differ.
- "We are both liars" cannot be said by a truth-teller (it would be false) and cannot be true from a liar, so the speaker is a liar and the other is a truth-teller.
- "If you asked $Y$ whether $P$, $Y$ would say yes" is true exactly when $P$ has the truth value $Y$ would report: $P$ if $Y$ is truthful, $\neg P$ if not.
- Counting statements ("exactly two of the others are liars") are best handled by conditioning on the total number of liars $L$: a truth-teller sees $L$, a liar sees $L - 1$.

With two or three speakers, just enumerate the $2^n$ type assignments and check every statement; it takes a minute and it never lies to you.`,
      formula: String.raw`\text{statement } S \text{ by } X: \quad S \iff X_{\text{truthful}}`,
      example: "Eli says 'Cal is a truth-teller': Cal and Eli match, so Dee's 'Cal and Eli are the same type' is true and Dee is truthful.",
    },
    {
      title: "Induction: small cases first",
      body: String.raw`When a puzzle has a size parameter $n$, solve $n = 1$, $n = 2$, $n = 3$ by hand, then ask how the solution for $n$ is built from the solution for $n - 1$. The recurrence is usually one of three shapes:

- **Add one object**: regions made by $n$ lines, $R(n) = R(n-1) + n$, because the new line is cut into $n$ pieces and each piece splits a region. $R(n) = 1 + n + \binom{n}{2}$.
- **Condition on the first piece**: tilings of a strip with pieces of width 1 and 3, $a_n = a_{n-1} + a_{n-3}$; widths 1 and 2 give Fibonacci.
- **The biggest object moves last**: Hanoi, $M(n) = 2M(n-1) + 1 = 2^n - 1$; with adjacent-only moves the largest disc moves twice and the rest shuttle three times, $M(n) = 3M(n-1) + 2 = 3^n - 1$.

Always say the base case and the recurrence before the closed form. If the closed form is asked for, add a constant to both sides until the recurrence becomes geometric: $M(n) + 1 = 2(M(n-1) + 1)$.`,
      formula: String.raw`R(n) = 1 + \frac{n(n+1)}{2}, \qquad M_{\text{Hanoi}}(n) = 2^n - 1, \qquad M_{\text{adjacent}}(n) = 3^n - 1`,
      example: "Four trays across three bays, adjacent moves only: 3^4 - 1 = 80, and every one of the 81 arrangements is visited.",
    },
    {
      title: "Bounds and constructions: the two halves of every answer",
      body: String.raw`An answer to "what is the minimum" or "what is the largest you can guarantee" always has two parts, and interviewers check for both.

- A **bound**: a reason nothing better is possible. Capacity (three items one at a time need five crossings), information ($3^k$ outcomes), an invariant (parity never changes), a counting identity (correct calls equal wrong calls).
- A **construction**: an explicit schedule, strategy or example that achieves the bound. The five-crossing order, the 9-9-10 split, the parity convention, the five 1s with no sub-sum divisible by 6.

If you only have the construction, say "this gives 15; I now need to argue nothing beats it." If you only have the bound, say "at least 4; let me find a plan that uses exactly 4." Naming the missing half is worth more than a lucky number.`,
      formula: String.raw`\text{answer} = \text{bound} \ \wedge\ \text{construction meeting it}`,
      example: "Four engineers, times 1, 3, 4, 6: escort plan gives 15; the only other five-crossing shape gives 16, so 15 is the minimum.",
    },
    {
      title: "What to say when you are stuck",
      body: String.raw`Silence is the only wrong answer. When a puzzle does not open, work through this list aloud; each line is a legitimate step and most puzzles crack on one of them.

- "Let me write the state down." Name the tuple. Count the states.
- "Let me do the smallest case." $n = 1$, $n = 2$. Guess the pattern, then ask what the recurrence is.
- "What never changes here?" Try parity, a colouring, a sum.
- "What is the information bound?" Outcomes per step, cases to separate, round up.
- "What is the worst case?" Build the adversary's best configuration; that is the pigeonhole lower bound.
- "Suppose the answer were smaller. What breaks?" Often the contradiction is one sentence.
- "Here is a plan that works; I do not yet know it is optimal." Stating a valid upper bound is progress.

Interviewers also want to see you check your answer: plug the small case back in, test the claimed strategy on one assignment, verify the invariant actually is unchanged by the move. A candidate who says "28 is one more than 27, so the bound says four, and here is the 9-9-10 split" has shown the whole method in one breath.`,
      example: "Stuck on the robot with growing strides? 'The all-right position is 15 after five steps; flipping a step changes it by an even number; 14 is even and 15 is odd, so five steps cannot work.'",
    },
  ],

  workedExamples: [
    {
      title: "Finding the heavy coin among twelve",
      prompt: String.raw`Twelve coins look identical; exactly one is heavier than the rest. With a two-pan balance and no weights, how many weighings guarantee you find it, and how?`,
      steps: [
        {
          text: "Count the cases and the outcomes. There are 12 candidates; a weighing has three outcomes (left heavy, right heavy, balance), so $k$ weighings separate at most $3^k$ candidates.",
          math: String.raw`3^2 = 9 < 12 \le 27 = 3^3 \quad \Rightarrow \quad k \ge 3`,
        },
        {
          text: "Design the first weighing to split the candidates into thirds, so that every outcome leaves at most a third: 4 coins on each pan and 4 aside.",
          math: String.raw`12 \to \{4, 4, 4\}`,
        },
        {
          text: "Whatever the outcome, 4 candidates remain. Weigh 1 against 1 and keep 2 aside: a tilt names the coin, a balance leaves the 2 set aside.",
          math: String.raw`4 \to \{1, 1, 2\}`,
        },
        {
          text: "In the worst branch two candidates remain; one weighing of 1 against 1 settles it. The worst case is three weighings, matching the bound.",
          math: String.raw`1 + 1 + 1 = 3`,
        },
        {
          text: "Check the bound is the real reason: with two weighings the first weighing leaves at least 4 candidates in some outcome, and one weighing cannot separate 4. So three is both necessary and sufficient.",
        },
      ],
      answer: "3 weighings: split 4-4-4, then 1-1-2, then 1-1.",
    },
    {
      title: "An unreachable board",
      prompt: String.raw`A row of 7 cells each shows 0 or 1; all start at 0. A move picks three consecutive cells and toggles all three (0 becomes 1, 1 becomes 0). Can you reach the pattern 1 0 0 0 0 0 0, with only the first cell showing 1?`,
      steps: [
        {
          text: "Write the state as a 7-bit string and the move as XOR with one of the five masks 1110000, 0111000, 0011100, 0001110, 0000111. Moves commute and a move done twice cancels, so at most $2^5 = 32$ patterns are reachable out of $2^7 = 128$. That alone says most targets are unreachable, but not which.",
        },
        {
          text: "Look for an invariant: a set of cells whose total parity every move preserves. A triple of consecutive cells always contains exactly one cell with position congruent to 0 mod 3, one congruent to 1, and one congruent to 2 (positions 1 to 7).",
          math: String.raw`\text{positions } \{i, i+1, i+2\} \text{ hit each residue class mod } 3 \text{ exactly once}`,
        },
        {
          text: "So each move toggles exactly one cell in each residue class, and the parity of ones in class 0, in class 1 and in class 2 all change together. The pairwise differences of those parities are invariant; they start at 0.",
          math: String.raw`p_0 \oplus p_1 = 0, \quad p_1 \oplus p_2 = 0 \quad \text{always}`,
        },
        {
          text: String.raw`The target 1 0 0 0 0 0 0 has one cell on, at position 1 (class 1). So $p_1 = 1$ while $p_0 = p_2 = 0$, and $p_0 \oplus p_1 = 1$. The invariant is broken: unreachable.`,
        },
        {
          text: "Sanity check with a target the invariant allows, 1 1 1 0 0 0 0: one move does it. The invariant rules out 96 of the 128 patterns; the remaining 32 are exactly the reachable ones, as the move count predicted.",
        },
      ],
      answer: "No: every move toggles one cell in each residue class mod 3, so the parities of the three classes always agree, and the target has them disagreeing.",
    },
  ],

  tryIt: {
    prompt: String.raw`A bag holds red, green and blue tokens, at least ten of each. Tokens are drawn without looking. What is the smallest number of draws that guarantees at least four tokens of the same colour?`,
    answer: { type: "numeric", value: 10, exact: String.raw`3 \cdot 3 + 1 = 10` },
    solution: String.raw`The holes are the three colours and we want some hole to hold four tokens. Build the worst case: three of each colour, nine tokens, with no colour at four. Nine draws therefore do not guarantee it.

With ten tokens in three colours, if every colour had at most three there would be at most nine tokens. So some colour has at least four. The generalised pigeonhole formula gives the same thing directly: $n(k - 1) + 1 = 3 \cdot 3 + 1 = 10$.

Note the supply condition: because there are at least ten of each colour, the worst case of three-three-three really is available. If one colour had only two tokens, the worst case would be $2 + 3 + 3 = 8$ and the answer would drop to 9, as in practice problem 10.`,
  },

  checkIds: ["m9-lc1", "m9-lc2", "m9-lc3", "m9-lc4"],

  formulas: [
    {
      name: "Pigeonhole, generalised",
      latex: String.raw`n(k - 1) + 1 \text{ items in } n \text{ holes} \Rightarrow \text{some hole holds} \ge k`,
      note: "Guarantee k of a kind; with limited supplies the worst case takes min(supply, k - 1) from each hole, then add one.",
    },
    {
      name: "Pigeonhole on running totals",
      latex: String.raw`\text{any } m \text{ integers contain a non-empty sub-list with sum} \equiv 0 \pmod m`,
      note: "m prefix sums mod m either hit 0 or collide; m - 1 copies of 1 show m is tight.",
    },
    {
      name: "Information bound",
      latex: String.raw`r^k \ge N \iff k \ge \lceil \log_r N \rceil`,
      note: "k steps with r outcomes each separate at most r^k cases: r = 3 for a balance, r = 2 for yes/no questions. Necessary, not sufficient.",
    },
    {
      name: "Balance, one heavy coin",
      latex: String.raw`k = \lceil \log_3 N \rceil,\quad 3^k \text{ coins in } k \text{ weighings}`,
      note: "Split into thirds each time; 9 coins take 2, 27 take 3, 28 take 4.",
    },
    {
      name: "Balance, heavy or light, direction required",
      latex: String.raw`N \le \frac{3^k - 3}{2}`,
      note: "No reference coin: 3 coins in 2 weighings, 12 in 3. Four coins need 3 even though 3^2 = 9 >= 8.",
    },
    {
      name: "Regions made by n lines",
      latex: String.raw`R(n) = R(n-1) + n = 1 + n + \binom{n}{2} = \frac{n^2 + n + 2}{2}`,
      note: "No two parallel, no three concurrent; each parallel pair or concurrency removes one region per lost crossing.",
    },
    {
      name: "Tower of Hanoi",
      latex: String.raw`M(n) = 2M(n-1) + 1 = 2^n - 1`,
      note: "Move n - 1 discs aside, the largest once, n - 1 discs back on top.",
    },
    {
      name: "Hanoi with adjacent moves only",
      latex: String.raw`M(n) = 3M(n-1) + 2 = 3^n - 1`,
      note: "The largest disc moves twice and the smaller stack shuttles end to end three times; every one of the 3^n states is visited.",
    },
    {
      name: "Strip tilings",
      latex: String.raw`a_n = a_{n-1} + a_{n-2} \ (\text{widths } 1, 2), \qquad a_n = a_{n-1} + a_{n-3} \ (\text{widths } 1, 3)`,
      note: "Condition on the leftmost piece; a_0 = 1 and small cases are 1 for lengths below the wide piece.",
    },
    {
      name: "Line of hats",
      latex: String.raw`\text{guaranteed correct} = n - 1 \quad \text{(announce the parity or sum mod } c \text{ of what you see)}`,
      note: "The back speaker's view is the same for both own colours, so n is impossible; the parity convention makes everyone else right.",
    },
    {
      name: "Simultaneous hats with passing",
      latex: String.raw`\#\text{correct calls} = \#\text{wrong calls} \ \Rightarrow\ P(\text{win}) \le \frac{3}{4} \text{ for three players}`,
      note: "Speak only when you see two matching hats and call the other colour; lose only when all three match.",
    },
    {
      name: "Subtraction game",
      latex: String.raw`\text{moves } 1..m: \text{ losing piles are } \equiv 0 \pmod{m+1} \ (\text{last wins}),\ \equiv 1 \pmod{m+1} \ (\text{last loses})`,
      note: "Hand your opponent the losing residue class every turn; 14 tokens, moves 1-3, last loses: take 1 to leave 13.",
    },
    {
      name: "Row and column flips",
      latex: String.raw`\#\text{reachable patterns on an } m \times n \text{ grid} = 2^{m + n - 1}`,
      note: "Flipping every row and every column is the identity; equivalently every 2 by 2 block keeps an even number of flipped cells.",
    },
  ],

  outro: String.raw`On the timed test, the logic questions are short and the answer is a number or a choice, so the temptation is to pattern-match from memory. Resist it just long enough to check the trap: is the count one more than a power of three, is the parity right as well as the distance, has one colour run out of supply, does the game end on the last token or the one before. Each of those traps is a one-line check, and each one is deliberately placed by the test writer.

In a live interview, a brainteaser is a conversation, not a quiz. Interviewers choose puzzles they expect you may have seen, and they listen for structure: did you define the state, did you count the cases, did you name the invariant, did you separate the bound from the construction. Then they change one rule, exactly as the variations attached to each problem do: the balance coin may now be light as well as heavy, the trays may only move to adjacent bays, the buffer now reacts with the base. If your first answer came from structure, the follow-up takes you thirty seconds; if it came from memory, it takes you nowhere. Practise narrating the method, not the number.

If you are still slow on the search-based problems, redo the difficulty 3 set with a pen and write the state tuple down every time before thinking about moves. The brainteaser bank attached to this course gives you eighty more puzzles in the same spirit; the goal is not to have seen all of them but to recognise, within ten seconds, which of the technique cards in this lesson a new one belongs to.`,
};
