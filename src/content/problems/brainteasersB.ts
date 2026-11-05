import type { Problem } from "../types";

/**
 * Brainteaser bank, second half (bt-041 .. bt-080).
 * 40 items (d2: 7, d3: 18, d4: 11, d5: 4), twelve of them multiple choice.
 * Families: invariants and parity, knights and knaves, structured search, game strategy,
 * induction counts, logic deductions, and probability puzzles whose trap is in the reading.
 * Every answer is confirmed in content/verify/brainteasersB.ts.
 */
export const problems: Problem[] = [
  // ---------------------------------------------------------------- invariants and parity
  {
    id: "bt-041",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["invariants", "logic"],
    minutes: 5,
    title: "Chips of three colours",
    prompt: String.raw`A bowl holds 5 red chips, 8 green chips and 10 blue chips. A move takes one chip of each of two *different* colours out of the bowl and puts two chips of the third colour in. Moves may be repeated as long as a legal move exists. Which of the following is true?`,
    answer: {
      type: "choice",
      options: [
        "The bowl can end up all red, but not all green or all blue",
        "The bowl can end up all green, but not all red or all blue",
        "The bowl can end up all blue, but not all red or all green",
        "The bowl can end up all one colour, whichever colour you choose",
        "The bowl can never end up all one colour",
      ],
      correct: 2,
    },
    hints: [
      "Every move changes each of the three counts by -1, -1 and +2. Look for something about the counts that a move cannot change.",
      "Take the difference between two colour counts. By how much does a move change it? Reduce modulo 3.",
      String.raw`Two counts that are congruent modulo 3 can be driven to zero together; two that are not can never both vanish. Compare $5$, $8$ and $10$ modulo 3.`,
    ],
    solution: String.raw`Write the counts as $(r, g, b)$. A move subtracts 1 from two of the numbers and adds 2 to the third. Look at the pairwise differences. If the move touches red and green (both $-1$) then $r - g$ is unchanged; if it touches red and blue then $r$ drops by 1 and $g$ rises by 2, so $r - g$ changes by $-3$; if it touches green and blue, $r - g$ changes by $+3$. In every case $r - g$ changes by a multiple of 3, so **$r - g \bmod 3$ is invariant**, and the same holds for $g - b$ and $r - b$.

An all-blue bowl has $r = g = 0$, so it needs $r - g \equiv 0 \pmod 3$. Initially $r - g = 5 - 8 = -3 \equiv 0$, so nothing forbids it. An all-red bowl needs $g - b \equiv 0$, but $8 - 10 = -2 \not\equiv 0 \pmod 3$: impossible. An all-green bowl needs $r - b \equiv 0$, but $5 - 10 = -5 \equiv 1 \pmod 3$: impossible.

The invariant only rules things out; we still have to show all-blue is reachable. Pair red with green three times: $(5,8,10) \to (4,7,12) \to (3,6,14) \to (2,5,16)$. Now use the blue chips to equalise: pair green with blue once, $(2,5,16) \to (4,4,15)$, then pair red with green four times, $(4,4,15) \to (0,0,23)$. The bowl holds 23 blue chips and no legal move remains. So all-blue is reachable and it is the only single colour that is, which is option 3.`,
    steps: [
      "Write the state as three counts and describe a move as (-1, -1, +2) in some order.",
      "Show every pairwise difference changes by 0 or by 3, so the differences mod 3 are invariant.",
      "Check which single-colour targets are compatible with the initial differences 5, 8, 10.",
      "Exhibit an explicit sequence that reaches all-blue.",
    ],
    keyIdea: "Pairwise differences of the counts modulo 3 never change, so only the target whose two vanishing colours start congruent mod 3 is reachable.",
    commonMistake: "Stopping at the invariant and answering 'never', or assuming the invariant alone proves reachability without constructing the sequence.",
    fastPath: String.raw`Reduce 5, 8, 10 mod 3 to 2, 2, 1. The two colours that match (red and green) are the ones that can both be eliminated, so only all-blue works.`,
    variation: "Start from 6 red, 9 green and 12 blue. Which single colours are now reachable?",
    variationAnswer: String.raw`All three counts are $\equiv 0 \pmod 3$, so the invariant forbids nothing; each of the three monochrome endings is reachable (check by a construction like the one above).`,
    family: "invariant",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "bt-042",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["invariants", "number-puzzle"],
    minutes: 4,
    title: "Merging numbers on the board",
    prompt: String.raw`The numbers $1, 2, 3, \dots, 8$ are written on a whiteboard. A step erases any two numbers $a$ and $b$ and writes the single number $a + b + ab$ in their place. After seven steps one number remains. What is it? (Report the number; it does not depend on the order of the steps.)`,
    answer: { type: "numeric", value: 362879, exact: "9! - 1 = 362879" },
    hints: [
      "Try two steps by hand in two different orders and notice the result agrees. There must be a quantity that the step preserves.",
      String.raw`Factor: $a + b + ab = (1 + a)(1 + b) - 1$. What happens to the product of all $(1 + x)$ over the numbers on the board?`,
      String.raw`The product $\prod (1 + x_i)$ is invariant and starts at $2 \cdot 3 \cdots 9$. The last number $N$ satisfies $1 + N = 9!$.`,
    ],
    solution: String.raw`The expression $a + b + ab$ is begging to be factored: $a + b + ab = (1 + a)(1 + b) - 1$. So if we add 1 to every number on the board and multiply them together, the step replaces the two factors $(1 + a)$ and $(1 + b)$ by the single factor $1 + (a + b + ab) = (1 + a)(1 + b)$. The product of all the $(1 + x)$ terms is unchanged by a step.

Initially that product is $(1 + 1)(1 + 2) \cdots (1 + 8) = 2 \cdot 3 \cdots 9 = 9! = 362880$. After seven steps one number $N$ remains, and the product is simply $1 + N$. Hence $1 + N = 362880$, so $N = 362879$.

Because the argument never used the order of the steps, any sequence of merges gives the same final number, which is why the question can ask for "the" number. A sanity check on a smaller board: with $\{1, 2, 3\}$, merging 1 and 2 gives $5$, then $5 + 3 + 15 = 23 = 4! - 1$; merging 2 and 3 first gives $11$, then $11 + 1 + 11 = 23$ again. Answer: $362879$.`,
    steps: [
      "Factor the merge rule as (1 + a)(1 + b) - 1.",
      "Identify the invariant: the product of (1 + x) over the board.",
      "Evaluate it at the start: 9!.",
      "Subtract 1 to get the final number.",
    ],
    keyIdea: String.raw`Rewrite the move so it acts multiplicatively on $1 + x$; a product that merges to itself is an invariant.`,
    commonMistake: String.raw`Multiplying out the merges by hand and making an arithmetic slip, or guessing that the sum is what is preserved (it is not: $a + b + ab \ne a + b$).`,
    fastPath: String.raw`Shift by one: the board becomes $2, 3, \dots, 9$ under a plain product, so the end is $9! - 1$.`,
    variation: String.raw`Same board, but the step writes $a + b - 1$ instead. What is the final number?`,
    variationAnswer: String.raw`Each step lowers the total by 1, so the answer is $36 - 7 = 29$.`,
    family: "invariant",
    verifiedBy: ["dp", "formula"],
  },
  {
    id: "bt-043",
    module: 9,
    kind: "brainteaser",
    difficulty: 4,
    tags: ["invariants", "logic"],
    minutes: 6,
    title: "Straight tiles on a cut board",
    prompt: String.raw`One square is cut out of a $5 \times 5$ board. You want to cover the remaining 24 squares exactly with eight straight $1 \times 3$ tiles (each tile covers three squares in a row or in a column, no overlaps, nothing hanging off the board). For which cut-out squares is this possible?`,
    answer: {
      type: "choice",
      options: [
        "Only when the centre square is cut out",
        "Only when a corner square is cut out",
        "When the centre or any corner is cut out, and no other square",
        "Only when a square on the edge of the board is cut out",
        "For every choice of the cut-out square",
      ],
      correct: 0,
    },
    hints: [
      "Colour the board with three colours so that every straight tile covers one square of each colour, whatever its position.",
      String.raw`Colour square $(r, c)$ with $(r + c) \bmod 3$. Count how many squares of each colour the full board has; the cut-out square must come from the colour that has one square too many.`,
      String.raw`Repeat with the mirror colouring $(r - c) \bmod 3$. Only one square survives both filters, and a pinwheel of four $2 \times 3$ blocks shows it works.`,
    ],
    solution: String.raw`Index the rows and columns $0, 1, 2, 3, 4$. Colour square $(r, c)$ with the colour $(r + c) \bmod 3$. Three consecutive squares in a row have $r + c$ taking three consecutive values, so they have three different colours; the same holds for a column. Every straight tile therefore covers exactly one square of each colour, and eight tiles cover 8 of each colour.

Count the colours on the full board. Colour 0 has $r + c \in \{0, 3, 6\}$, which gives $1 + 4 + 3 = 8$ squares; colour 1 has $r + c \in \{1, 4, 7\}$, giving $2 + 5 + 2 = 9$; colour 2 has $r + c \in \{2, 5, 8\}$, giving $3 + 4 + 1 = 8$. For a tiling to exist the removed square must have colour 1, that is $r + c \equiv 1 \pmod 3$.

Now reflect the board left to right and run the same argument with colour $(r - c) \bmod 3$. By symmetry the surplus colour is again the one with 9 squares, which turns out to be $r - c \equiv 0 \pmod 3$. The cut square must satisfy both $r + c \equiv 1$ and $r - c \equiv 0$. Adding gives $2r \equiv 1$, so $r \equiv 2 \pmod 3$, forcing $r = 2$, and then $c \equiv 2$, forcing $c = 2$. Only the centre survives.

Finally, the centre really works: around the centre, place a $2 \times 3$ block in rows 0-1, columns 0-2; a $3 \times 2$ block in rows 0-2, columns 3-4; a $2 \times 3$ block in rows 3-4, columns 2-4; and a $3 \times 2$ block in rows 2-4, columns 0-1. Each block is two straight tiles. That is a pinwheel of eight tiles covering everything but the centre. So the answer is option 1: the centre, and only the centre.`,
    steps: [
      "Three-colour the board by (r + c) mod 3 so every straight tile takes one of each colour.",
      "Count 8, 9, 8 squares per colour; the cut square must be in the 9-colour.",
      "Apply the mirror colouring (r - c) mod 3 to get a second condition.",
      "Intersect the two conditions: only the centre remains.",
      "Exhibit the pinwheel tiling to show the centre actually works.",
    ],
    keyIdea: "A straight 1 x 3 tile always covers one square of each colour in a diagonal three-colouring, and two diagonal colourings pin the cut square down to the centre.",
    commonMistake: "Using only one colouring, which leaves nine candidate squares, and then guessing the corners are also fine (they fail the mirror colouring).",
    fastPath: String.raw`The cut square must be the surplus colour in both diagonal 3-colourings; the only square with $r + c \equiv 1$ and $r - c \equiv 0$ is the centre. Remember the pinwheel.`,
    variation: String.raw`Same question on a $4 \times 4$ board with one square removed, tiled by five straight $1 \times 3$ tiles. Which squares work?`,
    variationAnswer: String.raw`Colour counts on $4 \times 4$ are 6, 5, 5 for $(r + c) \bmod 3 = 0, 1, 2$, so the cut square needs $r + c \equiv 0 \pmod 3$, and the mirror colouring needs $r - c \equiv 0 \pmod 3$. The survivors are the four corners, and each corner does admit a tiling (a $1 \times 3$ along the edge and the rest in $3 \times 1$ strips).`,
    family: "invariant",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "bt-044",
    module: 9,
    kind: "brainteaser",
    difficulty: 2,
    tags: ["invariants"],
    minutes: 3,
    title: "Dominoes on a board with two holes",
    prompt: String.raw`Two squares are removed from a $6 \times 6$ board and the remaining 34 squares are to be covered exactly by seventeen $1 \times 2$ dominoes. Rows and columns are numbered 1 to 6. For which of the following pairs of removed squares is a covering possible?`,
    answer: {
      type: "choice",
      options: [
        "Row 1 column 1 and row 6 column 6",
        "Row 1 column 1 and row 1 column 6",
        "Row 1 column 1 and row 3 column 3",
        "Row 2 column 2 and row 5 column 5",
      ],
      correct: 1,
    },
    hints: [
      "Colour the board like a chessboard. What does a domino always cover?",
      "Each domino covers one light and one dark square, so the 34 remaining squares must split 17 and 17.",
      "Two squares have the same colour exactly when the sums of their coordinates have the same parity. Find the pair where the parities differ.",
    ],
    solution: String.raw`Chessboard-colour the board: square (row $r$, column $c$) is light when $r + c$ is even and dark when it is odd. A domino covers two squares that share an edge, so their coordinate sums differ by exactly 1: every domino covers one light and one dark square. Seventeen dominoes cover 17 light and 17 dark squares, so the two removed squares must have *different* colours, or the count is off.

The full board has 18 light and 18 dark squares. Check the options. $(1,1)$ and $(6,6)$: sums 2 and 12, both even, same colour, impossible. $(1,1)$ and $(3,3)$: sums 2 and 6, same colour, impossible. $(2,2)$ and $(5,5)$: sums 4 and 10, same colour, impossible. $(1,1)$ and $(1,6)$: sums 2 and 7, different colours, so the colouring does not forbid it.

The colouring argument is only an obstruction, so we should also confirm that this pair really can be tiled. Cover row 1 columns 2-5 with two horizontal dominoes; rows 2-6 of the board form a $5 \times 6$ rectangle, which is tiled by 15 horizontal dominoes. That covers every square except $(1,1)$ and $(1,6)$. So option 2 is the only possible pair.`,
    steps: [
      "Chessboard-colour the board; each domino covers one square of each colour.",
      "Deduce that the two removed squares must have opposite colours.",
      "Compare the parities of r + c for each option.",
      "Confirm with an explicit tiling for the surviving pair.",
    ],
    keyIdea: "Dominoes preserve the light/dark balance, so two removed squares must be of opposite colours.",
    commonMistake: "Thinking 'opposite corners' are different because they are far apart; they are the same colour on any even board.",
    fastPath: "Add the coordinates of each removed square; the two sums must have different parities. Only the pair (1,1) and (1,6) does.",
    variation: String.raw`Two squares of opposite colours are removed from a $6 \times 6$ board, anywhere. Is a domino tiling always possible?`,
    variationAnswer: String.raw`Yes. Thread a closed path through all 36 squares (a snake joined at the ends); removing two opposite-coloured squares cuts it into two paths of even length, each of which is tiled by dominoes along the path.`,
    family: "invariant",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "bt-045",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["invariants", "search-strategy"],
    minutes: 5,
    title: "Seven lamps and their neighbours",
    prompt: String.raw`Seven lamps sit in a row, numbered 1 to 7. Only lamps 2 and 6 are lit; the other five are dark. Each lamp has a button. Pressing button $k$ toggles lamp $k$ and also toggles each lamp directly next to it (so button 1 toggles lamps 1 and 2; button 4 toggles lamps 3, 4 and 5). What is the minimum number of button presses needed to make all seven lamps lit?`,
    answer: { type: "numeric", value: 5, exact: "5", unit: "presses" },
    hints: [
      "Pressing a button twice undoes itself, and the order of presses does not matter. So a plan is just a set of buttons.",
      "Lamp 1 is toggled only by buttons 1 and 2, and it must flip from dark to lit. Work inward from the ends.",
      "Decide button 1, then lamp 1 forces button 2, lamp 2 forces button 3, and so on. One of the two starting choices fails at the far end.",
    ],
    solution: String.raw`Toggling is its own inverse and toggles commute, so a plan is a subset of the buttons, and the question is the smallest subset that flips lamps 1, 3, 4, 5, 7 an odd number of times and lamps 2, 6 an even number of times.

Chase the constraints from the left end. Lamp 1 is affected only by buttons 1 and 2, and it must flip, so exactly one of them is pressed. Lamp 2 is affected by buttons 1, 2, 3 and must *not* flip, so an even number of them is pressed. Lamp $k$ for $2 \le k \le 6$ is affected by $k-1, k, k+1$. Each lamp's requirement fixes the next button once the previous two are known, so the whole plan is determined by the choice for button 1.

Case $x_1 = 1$: lamp 1 needs $x_1 + x_2$ odd, so $x_2 = 0$. Lamp 2 needs $x_1 + x_2 + x_3$ even, so $x_3 = 1$. Lamp 3 needs $x_2 + x_3 + x_4$ odd, so $x_4 = 0$. Lamp 4 needs $x_3 + x_4 + x_5$ odd, so $x_5 = 0$. Lamp 5 needs $x_4 + x_5 + x_6$ odd, so $x_6 = 1$. Lamp 6 needs $x_5 + x_6 + x_7$ even, so $x_7 = 1$. Lamp 7 needs $x_6 + x_7$ odd: it is $2$, even. Contradiction.

Case $x_1 = 0$: then $x_2 = 1$, $x_3 = 1$ (lamp 2 even), $x_4 = 1$ (lamp 3 odd: $1 + 1 + x_4$), $x_5 = 1$ (lamp 4: $1 + 1 + x_5$ odd), $x_6 = 1$ (lamp 5: $1 + 1 + x_6$ odd), $x_7 = 0$ (lamp 6: $1 + 1 + x_7$ even), and lamp 7 checks out: $x_6 + x_7 = 1$, odd. So the unique plan is to press buttons 2, 3, 4, 5, 6, five presses, and since the solution is unique no shorter plan exists. Answer: 5.`,
    steps: [
      "Reduce to choosing a set of buttons (order and repeats do not matter).",
      "Write the parity condition for each lamp in terms of the three nearby buttons.",
      "Propagate from lamp 1 rightward; the choice of button 1 determines everything.",
      "Reject the branch that fails at lamp 7 and count the presses in the surviving branch.",
    ],
    keyIdea: "Toggle puzzles are linear equations mod 2; chasing the end constraint inward solves the row in one pass.",
    commonMistake: "Trying to put out lamps 2 and 6 first with buttons 2 and 6 and then patching, which runs in circles; or forgetting that pressing a button twice cancels.",
    fastPath: "Two cases for button 1; propagate parities left to right. The all-dark-to-lit pattern needs 2 through 6, five presses.",
    variation: "Same seven lamps and buttons, but all lamps start dark. What is the minimum number of presses to light them all?",
    variationAnswer: String.raw`Propagating the same way gives the unique plan $\{1, 4, 7\}$ (button 1 lights 1-2, button 4 lights 3-5, button 7 lights 6-7): three presses.`,
    family: "invariant",
    verifiedBy: ["exhaustive-search", "enumeration"],
  },
  {
    id: "bt-046",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["number-puzzle", "invariants"],
    minutes: 5,
    title: "Thirty passes along sixty lockers",
    prompt: String.raw`Sixty lockers numbered 1 to 60 all start closed. A caretaker makes exactly 30 passes. On pass $k$ (for $k = 1, 2, \dots, 30$) she walks along the row and changes the state of every locker whose number is a multiple of $k$ (closed becomes open, open becomes closed). After the 30 passes, how many lockers are open?`,
    answer: { type: "numeric", value: 33, exact: "5 + (30 - 2) = 33", unit: "lockers" },
    hints: [
      "Locker n is toggled once for each pass number k that divides n and is at most 30. Its final state depends only on whether that count is odd.",
      "For n at most 30 every divisor of n is at most 30, so the count is the full number of divisors. Which numbers have an odd number of divisors?",
      "For n above 30 the divisor n itself is skipped. So those lockers end open exactly when the full divisor count is even.",
    ],
    solution: String.raw`Locker $n$ is toggled on every pass $k \le 30$ with $k \mid n$. It ends open exactly when the number of such $k$ is odd.

For $1 \le n \le 30$, every divisor of $n$ is at most $n \le 30$, so the number of toggles is $d(n)$, the full divisor count. Divisors pair up as $(k, n/k)$, and the pairing has a fixed point only when $n$ is a perfect square, so $d(n)$ is odd exactly for squares. The squares up to 30 are $1, 4, 9, 16, 25$: five open lockers.

For $31 \le n \le 60$, the divisor $n$ itself exceeds 30 and is never used; every other divisor is at most $n/2 \le 30$, so it is used. The toggle count is $d(n) - 1$, which is odd exactly when $d(n)$ is even, that is, when $n$ is *not* a perfect square. Among $31, \dots, 60$ the squares are $36$ and $49$, so $30 - 2 = 28$ lockers end open.

Total: $5 + 28 = 33$ open lockers. The trap is to run the familiar "perfect squares" answer and say 7; the truncated set of passes flips the logic for the upper half.`,
    steps: [
      "Translate the final state into the parity of the number of divisors k <= 30.",
      "For n <= 30 the count is d(n), odd only for squares: 5 lockers.",
      "For n > 30 the divisor n is skipped, so the count is d(n) - 1, odd for non-squares: 28 lockers.",
      "Add: 33.",
    ],
    keyIdea: "Divisors pair off except for the square root, so the toggle parity is governed by squares, but a missing divisor flips that rule.",
    commonMistake: "Answering 7 (all the squares up to 60) as if all 60 passes had happened.",
    fastPath: "Squares up to 30 (five) plus non-squares from 31 to 60 (30 minus the squares 36 and 49, so 28): 33.",
    variation: "Same 60 lockers, but the caretaker makes passes k = 1 to 60 and then one extra pass that toggles every locker. How many are open?",
    variationAnswer: String.raw`After 60 passes the 7 squares are open; the extra pass flips everything, leaving $60 - 7 = 53$ open.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "bt-047",
    module: 9,
    kind: "brainteaser",
    difficulty: 2,
    tags: ["invariants"],
    minutes: 3,
    title: "Turning cards three at a time",
    prompt: String.raw`Eleven cards lie on a table, 5 face down and 6 face up. A move turns over exactly three cards of your choice (any mix of face-up and face-down). What is the minimum number of moves needed to make all eleven cards face up?`,
    answer: { type: "numeric", value: 3, exact: "3", unit: "moves" },
    hints: [
      "Track the number of face-down cards. By how much can one move change it?",
      "Turning j face-down cards and 3 - j face-up cards changes the face-down count by 3 - 2j, which is always odd.",
      "Going from 5 to 0 is a change of 5, which is odd, so an even number of moves cannot do it; check that two moves cannot and find three that can.",
    ],
    solution: String.raw`Let $D$ be the number of face-down cards, starting at $D = 5$ with target $D = 0$. A move that turns $j$ face-down cards and $3 - j$ face-up cards changes $D$ by $-j + (3 - j) = 3 - 2j$, which is one of $+3, +1, -1, -3$: always odd. So each move flips the parity of $D$.

One move is not enough: no single move changes $D$ by $-5$. Two moves change $D$ by an even amount in total (odd plus odd), but we need $-5$, which is odd, so two moves cannot work either. Hence at least three moves are needed.

Three moves suffice. Move 1: turn two face-down cards and one face-up card, $D$ goes $5 \to 4$. Move 2: turn two face-down cards and one face-up card, $4 \to 3$. Move 3: turn the last three face-down cards, $3 \to 0$. All eleven cards are now face up. Answer: 3 moves.`,
    steps: [
      "Let D be the face-down count and compute how a move changes it: 3 - 2j, always odd.",
      "Rule out one move (no change of -5 available) and two moves (even total change).",
      "Give an explicit three-move sequence 5 -> 4 -> 3 -> 0.",
    ],
    keyIdea: "A move that flips an odd number of cards flips the parity of the face-down count, so the number of moves must have the right parity.",
    commonMistake: "Answering 2 because 5 is 'close to' 3 + 3 - 1, without checking that every move changes the count by an odd amount.",
    fastPath: "Parity: odd change per move, need an odd total change of 5, and one move is too small, so three. Then verify 5 -> 4 -> 3 -> 0.",
    variation: "Same table, but a move turns over exactly four cards. Can you ever reach all face up?",
    variationAnswer: "No. Turning four cards changes the face-down count by an even amount, so it stays odd forever and never reaches 0.",
    family: "invariant",
    verifiedBy: ["exhaustive-search", "dp"],
  },

  // ---------------------------------------------------------------- knights and knaves
  {
    id: "bt-048",
    module: 9,
    kind: "brainteaser",
    difficulty: 2,
    tags: ["knights-knaves", "logic"],
    minutes: 2,
    title: "Two analysts, one remark",
    prompt: String.raw`On a certain desk every analyst is either Straight (every statement they make is true) or Crooked (every statement they make is false). You meet two analysts, Pia and Quinn. Pia says: "Quinn and I are the same type." Quinn says nothing. What can you conclude?`,
    answer: {
      type: "choice",
      options: [
        "Pia is Straight",
        "Pia is Crooked",
        "Quinn is Straight",
        "Quinn is Crooked",
        "Nothing about either of them",
      ],
      correct: 2,
    },
    hints: [
      "Split on Pia's type and work out what each case says about Quinn.",
      "If Pia is Straight her statement is true, so Quinn is her type. If Pia is Crooked her statement is false, so Quinn is the other type.",
      "In both cases Quinn comes out the same. Pia's own type stays open.",
    ],
    solution: String.raw`Case 1: Pia is Straight. Then her statement is true, so Quinn is the same type as Pia, which makes Quinn Straight.

Case 2: Pia is Crooked. Then her statement is false, so Quinn is *not* the same type as Pia. Pia is Crooked, so Quinn is Straight.

Either way Quinn is Straight, so option 3 is forced. Pia's type is not determined: both worlds (Straight, Straight) and (Crooked, Straight) are consistent with everything said, and no further information distinguishes them.

The general lesson: when a Straight-or-Crooked speaker says "X", the truth of X equals the speaker being Straight. Here X is "we are the same type", so (Pia Straight) $\iff$ (Pia and Quinn same type), and the only way to satisfy that biconditional is for Quinn to be Straight.`,
    steps: [
      "Case split on Pia's type.",
      "Evaluate the statement 'same type' as true or false in each case.",
      "Observe Quinn is Straight in both cases and Pia is undetermined.",
    ],
    keyIdea: "A speaker who says 'we are the same type' effectively announces the other person's truthfulness, whatever their own type.",
    commonMistake: "Concluding that Pia must be Straight because the sentence 'sounds honest', or saying nothing can be concluded because Pia's type is open.",
    fastPath: "'Same type' from either kind of speaker makes the other person truthful. Quinn is Straight.",
    variation: String.raw`Instead Pia says: "Quinn and I are different types." What follows?`,
    variationAnswer: "Straight Pia makes Quinn Crooked; Crooked Pia makes the statement false so Quinn is the same type as Pia, Crooked. Quinn is Crooked either way.",
    family: "knights-knaves",
    verifiedBy: ["exhaustive-search"],
  },
  {
    id: "bt-049",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["knights-knaves", "logic"],
    minutes: 5,
    title: "Four speakers, how many honest",
    prompt: String.raw`Four committee members, Pat, Quill, Rao and Sol, are each either a truth-teller (everything they say is true) or a liar (everything they say is false). They say:

Pat: "Quill is a liar."
Quill: "Rao and Sol are both truth-tellers."
Rao: "Exactly one of Pat and Quill is a truth-teller."
Sol: "Pat and Quill are the same type."

How many of the four are truth-tellers?`,
    answer: { type: "numeric", value: 2, exact: "2", unit: "truth-tellers" },
    hints: [
      "Pat and Quill contradict each other through Pat's statement: can they be the same type?",
      "If Pat is truthful then Quill lies, and vice versa. So exactly one of them is a truth-teller. What does that do to Rao's and Sol's statements?",
      "Rao's statement is now true, Sol's is false. Check Quill's statement in each remaining case.",
    ],
    solution: String.raw`Start with Pat's statement, "Quill is a liar." If Pat is a truth-teller the statement holds and Quill is a liar. If Pat is a liar the statement is false and Quill is a truth-teller. Either way Pat and Quill are of *different* types: exactly one of them is a truth-teller.

Rao says exactly that, so Rao's statement is true and Rao is a truth-teller. Sol says Pat and Quill are the same type, which is false, so Sol is a liar.

Now use Quill's statement, "Rao and Sol are both truth-tellers." Sol is a liar, so this statement is false, which makes Quill a liar. Then Pat, who is the other type, is a truth-teller, and Pat's statement "Quill is a liar" is indeed true, closing the loop.

The unique consistent world is Pat truth-teller, Quill liar, Rao truth-teller, Sol liar. Two of the four are truth-tellers.`,
    steps: [
      "Use Pat's statement to show Pat and Quill are different types.",
      "Read off Rao (true statement, truth-teller) and Sol (false statement, liar).",
      "Use Sol's type to falsify Quill's statement, so Quill is a liar and Pat a truth-teller.",
      "Count: two truth-tellers.",
    ],
    keyIdea: "A statement about another person's type links the two speakers; 'X is a liar' always makes the pair opposite types.",
    commonMistake: "Testing Quill's statement first and getting lost in cases, or forgetting to re-check Pat's statement after fixing Quill.",
    fastPath: "'Quill is a liar' forces Pat and Quill opposite, so Rao is honest and Sol lies. Then Quill's claim about Sol is false: Quill lies, Pat is honest. Two.",
    variation: String.raw`Replace Sol's statement with "Rao is a liar." How many truth-tellers now?`,
    variationAnswer: "Rao is still a truth-teller, so Sol's statement is false and Sol is a liar; the rest is unchanged and the count stays 2.",
    family: "knights-knaves",
    verifiedBy: ["exhaustive-search"],
  },
  {
    id: "bt-050",
    module: 9,
    kind: "brainteaser",
    difficulty: 4,
    tags: ["knights-knaves", "logic"],
    minutes: 7,
    title: "Six around a table, counting worlds",
    prompt: String.raw`Six people sit evenly around a round table, so each has exactly two neighbours. Each person is either a truth-teller (always truthful) or a liar (always false). Every one of the six says the same sentence: "Both of my neighbours are the opposite type to me." How many assignments of types to the six seats are consistent with all six statements? (Seats are labelled, so rotations count as different assignments.)`,
    answer: { type: "numeric", value: 10, exact: "1 + 6 + 3 = 10", unit: "assignments" },
    hints: [
      "Translate the sentence for each type. A truth-teller needs both neighbours to be liars. What does a liar need?",
      "A liar's sentence is false, so at least one of the liar's neighbours is also a liar. So no liar may sit between two truth-tellers.",
      "Count by the number of truth-tellers: 0, 1, 2 (which spacings?), 3 or more.",
    ],
    solution: String.raw`Write $T$ for a truth-teller and $L$ for a liar. A $T$'s sentence must be true, so both neighbours of every $T$ are $L$: no two $T$'s are adjacent. An $L$'s sentence must be false, so it is *not* the case that both neighbours are $T$: every $L$ has at least one $L$ neighbour. The consistent assignments are exactly the arrangements of $T$'s and $L$'s around the 6-cycle satisfying both rules.

Count by the number of $T$'s. Zero $T$'s: everybody is $L$, each $L$ has two $L$ neighbours, consistent. That is 1 assignment. One $T$: the two neighbours are $L$'s with one $T$ neighbour and one $L$ neighbour each, and the other three $L$'s are surrounded by $L$'s. Consistent, and the $T$ can sit in any of 6 seats: 6 assignments.

Two $T$'s: they cannot be adjacent. If they sit two apart (one seat between them), the $L$ in between has two $T$ neighbours, which is forbidden. If they sit opposite each other (three apart), the two $L$'s between them on each side each have one $T$ neighbour and one $L$ neighbour, which is fine. There are 3 opposite pairs: 3 assignments. Three or more $T$'s: with no two adjacent on a 6-cycle, three $T$'s must alternate $TLTLTL$, and then every $L$ sits between two $T$'s, forbidden. More than three non-adjacent $T$'s is impossible.

Total $1 + 6 + 3 = 10$ consistent assignments.`,
    steps: [
      "Translate the sentence: T needs both neighbours L; L needs at least one neighbour L.",
      "Count arrangements with 0 and 1 truth-tellers: 1 and 6.",
      "For 2 truth-tellers rule out distance 2 and keep the 3 opposite pairs.",
      "Show 3 or more truth-tellers is impossible and total 10.",
    ],
    keyIdea: "Translate each statement into a local rule on the cycle and count arrangements by the number of truth-tellers.",
    commonMistake: "Forgetting that a liar's statement must be false (not merely 'may be false'), which wrongly admits the alternating pattern, or forgetting the all-liar world.",
    fastPath: "T's are isolated, L's are never sandwiched between two T's. 0 T: 1, 1 T: 6, 2 T opposite: 3. Ten.",
    variation: String.raw`Same setup with five people around the table. How many consistent assignments?`,
    variationAnswer: String.raw`All-liar (1), one truth-teller (5); two non-adjacent truth-tellers on a 5-cycle always leave one liar sandwiched, so none. Total 6.`,
    family: "knights-knaves",
    verifiedBy: ["enumeration", "dp"],
  },
  {
    id: "bt-051",
    module: 9,
    kind: "brainteaser",
    difficulty: 4,
    tags: ["knights-knaves", "logic"],
    minutes: 6,
    title: "Three roles, one knight",
    prompt: String.raw`Three colleagues, Ash, Bea and Cal, hold three different roles: exactly one is a Knight (always tells the truth), exactly one is a Knave (always lies), and exactly one is a Joker (may say true or false things as they please). They say:

Ash: "Cal is the Joker."
Bea: "Ash is the Knight."
Cal: "Bea is not the Knave."

Who is the Knight?`,
    answer: {
      type: "choice",
      options: ["Ash", "Bea", "Cal", "It cannot be determined"],
      correct: 2,
    },
    hints: [
      "Test each person as the Knight. A Knight's statement must be true, and that pins down the others' roles.",
      "If Ash were the Knight, Cal is the Joker and Bea the Knave; is Bea's statement false as a Knave's must be?",
      "If Bea were the Knight, her own statement says Ash is the Knight: contradiction. Only one candidate is left; check that the Knave's statement is false.",
    ],
    solution: String.raw`Suppose Ash is the Knight. Then Ash's statement is true: Cal is the Joker, so Bea is the Knave. But Bea says "Ash is the Knight", which would be *true*, and a Knave never speaks the truth. Contradiction.

Suppose Bea is the Knight. Her statement "Ash is the Knight" must be true, yet there is only one Knight and it is Bea. Contradiction.

So Cal is the Knight, and we must check this leads to a consistent world. Cal's statement is true: Bea is not the Knave, so Bea is the Joker and Ash is the Knave. Ash, the Knave, says "Cal is the Joker", which is false (Cal is the Knight), as required. Bea, the Joker, says "Ash is the Knight", which is false; a Joker may say false things, so no problem. Everything is consistent, and it is the only consistent assignment.

The Knight is Cal, option 3.`,
    steps: [
      "Try Ash as Knight; it forces Bea to be a truthful Knave, impossible.",
      "Try Bea as Knight; her statement contradicts itself.",
      "Conclude Cal is the Knight and verify the Knave's statement is false and the Joker's is unconstrained.",
    ],
    keyIdea: "With a free agent in the mix, anchor on the Knight: the Knight's statement is the only one guaranteed true, and the Knave's the only one guaranteed false.",
    commonMistake: "Treating the Joker's statement as if it had to be false, or forgetting to confirm that the Knave's statement is actually false in the surviving world.",
    fastPath: "Bea cannot be the Knight (self-contradiction). Ash as Knight makes Bea a truthful Knave. So Cal.",
    variation: String.raw`Change Cal's statement to "Bea is the Knave." Who is the Knight now?`,
    variationAnswer: "Cal as Knight gives Bea Knave and Ash Joker, with Ash's false statement allowed and Bea's 'Ash is the Knight' false as required. Ash and Bea are still excluded as before, so Cal remains the Knight.",
    family: "knights-knaves",
    verifiedBy: ["exhaustive-search"],
  },
  {
    id: "bt-052",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["knights-knaves"],
    minutes: 4,
    title: "Three islanders and a pair claim",
    prompt: String.raw`On an island every inhabitant is a knight (always truthful) or a knave (always lying). Three inhabitants speak:

Ari: "Bo is a knave."
Bo: "Ari and Cy are the same type."
Cy: "Ari is a knave."

Which option correctly lists their types?`,
    answer: {
      type: "choice",
      options: [
        "Ari knight, Bo knave, Cy knave",
        "Ari knave, Bo knight, Cy knight",
        "Ari knight, Bo knight, Cy knave",
        "Ari knave, Bo knave, Cy knight",
      ],
      correct: 0,
    },
    hints: [
      "Ari's and Cy's statements are about each other in a way that links their types. Compare them.",
      "Ari says Bo is a knave, so Ari and Bo are opposite types. Cy says Ari is a knave, so Ari and Cy are opposite types. Hence Bo and Cy are the same type.",
      "Bo claims Ari and Cy are the same type, which you have shown is false. So Bo is a knave.",
    ],
    solution: String.raw`Whenever an inhabitant says "X is a knave", the speaker and X are of opposite types: a knight saying it makes X a knave, and a knave saying it makes X a knight. Applying this to Ari's statement, Ari and Bo are opposite types. Applying it to Cy's statement, Cy and Ari are opposite types.

Two people who are each opposite to Ari are the same as each other, so Bo and Cy are the same type, and Ari and Cy are different types.

Now Bo's statement "Ari and Cy are the same type" is false. A false statement comes from a knave, so Bo is a knave. Then Ari, being opposite to Bo, is a knight, and Cy, opposite to Ari, is a knave. Check: Ari (knight) says Bo is a knave, true. Bo (knave) says Ari and Cy are the same, false. Cy (knave) says Ari is a knave, false. All consistent.

Ari knight, Bo knave, Cy knave: option 1.`,
    steps: [
      "Use 'X is a knave' to pair speaker and X as opposite types (Ari-Bo, Cy-Ari).",
      "Deduce Bo and Cy are the same type and Ari and Cy differ.",
      "Evaluate Bo's statement as false, so Bo is a knave; propagate to Ari and Cy.",
      "Verify all three statements.",
    ],
    keyIdea: "'X is a knave' always makes speaker and X opposite types, which turns the puzzle into a small parity chase.",
    commonMistake: "Assuming Bo must be a knight because his statement is 'neutral', or forgetting to check the final world against every statement.",
    fastPath: "Ari is opposite to Bo and opposite to Cy, so Bo and Cy match and Bo's 'same type' claim is false. Bo knave, Ari knight, Cy knave.",
    variation: String.raw`Change Bo's statement to "Ari and Cy are different types." What are the types now?`,
    variationAnswer: "Bo's statement is now true, so Bo is a knight, Ari a knave (opposite Bo) and Cy a knight (opposite Ari). Check: Cy truthfully calls Ari a knave.",
    family: "knights-knaves",
    verifiedBy: ["exhaustive-search"],
  },

  // ---------------------------------------------------------------- structured search
  {
    id: "bt-053",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["search-strategy", "logic"],
    minutes: 6,
    title: "Hawk, dove, seed and tortoise",
    prompt: String.raw`A trainer must take a hawk, a dove, a bag of seed and a tortoise across a river in a boat that holds the trainer and at most one of the four. If the hawk and the dove are ever left together on a bank without the trainer, the hawk attacks the dove; if the dove and the seed are ever left together without the trainer, the dove eats the seed. The tortoise is harmless and safe with anything. Every trip of the boat across the river in either direction counts as one crossing. What is the minimum number of crossings needed to get everything to the far bank?`,
    answer: { type: "numeric", value: 9, exact: String.raw`2 \cdot 5 - 1 = 9`, unit: "crossings" },
    hints: [
      "The dove is the troublemaker: it must never be left with the hawk or with the seed. What is the only safe first trip?",
      "Count trips: each forward trip carries at most one passenger. The dove has to make the forward trip more than once. Why?",
      "After the dove and one other item are across, the dove must ride back. So at least five forward trips, and between consecutive forward trips there is a return: 9.",
    ],
    solution: String.raw`Model the state as which items are on the far bank plus the side of the trainer. A bank without the trainer is unsafe if it holds hawk and dove together, or dove and seed together. The tortoise never matters for safety.

Lower bound. Every forward crossing carries at most one item, so four items need at least four forward crossings. The first forward trip must take the dove (leaving hawk, seed, tortoise is safe; leaving the dove behind with the hawk or the seed is not). On the second forward trip the trainer brings the hawk or the seed (or the tortoise) to the far bank; if it is the hawk or the seed, it cannot be left there with the dove, so either the dove or the item just delivered must ride back, and that item needs a later forward trip to ferry it again. If instead the tortoise comes second, the far bank holds dove and tortoise; the third forward trip then brings hawk or seed and the same problem arises. Either way some item makes at least two forward trips, so there are at least five forward crossings. Between consecutive forward crossings the trainer must return, giving at least four return crossings, for a total of at least $5 + 4 = 9$.

Construction in 9. Forward with dove; back alone; forward with hawk; back with dove; forward with seed; back alone; forward with tortoise; back alone; forward with dove. Check each bank the trainer leaves: after trip 1 the near bank has hawk, seed, tortoise (safe); after trip 3 the far bank has dove and hawk but the trainer is there, and he leaves with the dove so the far bank keeps only the hawk; after trip 5 the far bank has hawk and seed (safe) and the near bank has dove and tortoise (safe); after trip 7 the near bank has the dove alone. All safe. Minimum: 9 crossings.`,
    steps: [
      "Write the state as (items on far bank, trainer side) and the two forbidden unattended pairs.",
      "Argue the dove must cross forward twice, so at least 5 forward trips.",
      "Add the 4 return trips between them for a lower bound of 9.",
      "Give the explicit 9-crossing schedule and check every unattended bank.",
    ],
    keyIdea: "The dove conflicts with two items and must be ferried, brought back, and ferried again, which fixes the number of forward trips.",
    commonMistake: "Answering 7 by forgetting the harmless tortoise still needs its own forward trip, or trying to leave the dove across with the hawk while fetching the seed.",
    fastPath: "Three-item core costs 7; the fourth, harmless item adds one forward trip and one return: 9.",
    variation: "The boat now holds the trainer plus two items. What is the minimum number of crossings?",
    variationAnswer: "Take dove and tortoise across (hawk and seed are safe together), return alone, take hawk and seed: 3 crossings.",
    family: "river-crossing",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "bt-054",
    module: 9,
    kind: "brainteaser",
    difficulty: 4,
    tags: ["search-strategy", "backward-induction"],
    minutes: 7,
    title: "Five hikers, one headlamp",
    prompt: String.raw`Five hikers reach a narrow ledge at night. Crossing it takes them 1, 3, 6, 8 and 12 minutes respectively. At most two people can be on the ledge at once, anyone crossing must carry the group's only headlamp, and a pair crosses at the pace of its slower member. The headlamp must be walked back; it cannot be thrown. What is the minimum total time, in minutes, for all five to reach the far side?`,
    answer: { type: "numeric", value: 29, exact: String.raw`(3 + 1 + 12 + 3) + (6 + 1 + 3) = 29`, unit: "minutes" },
    hints: [
      "The two slow hikers (8 and 12) should cross together so that only one of their times is paid. But someone fast has to be on the far side to bring the lamp back.",
      "Compare two ways to move the slowest pair across and return the lamp: escort each with the 1-minute hiker, or send the 1 and 3 ahead, bring 1 back, send 8 and 12, bring 3 back.",
      "Handle 8 and 12 with the cheaper of those two patterns, then solve the remaining three hikers (1, 3, 6) directly.",
    ],
    solution: String.raw`Sort the times $1, 3, 6, 8, 12$. The two slowest, 8 and 12, should cross in the same trip so only 12 is paid for the pair, but the lamp must come back to the near side afterwards, so a fast hiker must already be waiting across. Two standard ways to move the slowest pair and restore the lamp to the near side:

Pattern A (escort): 1 and 12 cross (12), 1 returns (1), 1 and 8 cross (8), 1 returns (1): $12 + 1 + 8 + 1 = 22$.

Pattern B (shuttle): 1 and 3 cross (3), 1 returns (1), 8 and 12 cross (12), 3 returns (3): $3 + 1 + 12 + 3 = 19$.

Pattern B is cheaper, 19 minutes, and after it the near side holds 1, 3, 6 with the lamp. Three hikers are easy: the fastest escorts each of the others, $1 + 6$ then $1 + 3$, that is 1 and 6 cross (6), 1 returns (1), 1 and 3 cross (3): $10$ minutes. Total $19 + 10 = 29$.

Why nothing beats 29: a forward trip delivers at most two people and every return brings one back, so $k$ forward trips leave at most $k + 1$ people across; five people need at least four forward crossings and three returns, seven crossings in all, which is exactly what the schedule above uses. Beyond that counting bound the cheapest arrangement is not obvious by hand (both patterns above are locally sensible), so the clean proof is a shortest-path search over the 64 states (who is across, where the lamp is), which confirms 29 as the optimum. Answer: 29 minutes.`,
    steps: [
      "Sort the times and aim to cross the two slowest together.",
      "Cost the two patterns for the slowest pair: escort (22) vs shuttle (19).",
      "Solve the remaining three hikers: 10 minutes.",
      "Add: 29, and note the search over states confirms optimality.",
    ],
    keyIdea: "Pair the two slowest hikers in one trip and pay only the slower one, using the two fastest as a shuttle to return the lamp.",
    commonMistake: "Always escorting with the fastest hiker: (1, 12) over, 1 back, (1, 8) over, 1 back, (1, 6) over, 1 back, (1, 3) over, which costs 12 + 1 + 8 + 1 + 6 + 1 + 3 = 32.",
    fastPath: String.raw`Shuttle the slow pair: $3 + 1 + 12 + 3 = 19$. Then the three left take $6 + 1 + 3 = 10$. Total 29.`,
    variation: "Same five hikers, but now the fastest takes 2 minutes instead of 1. What is the minimum time?",
    variationAnswer: String.raw`Shuttle pattern for 8 and 12: $3 + 2 + 12 + 3 = 20$; escort would be $12 + 2 + 8 + 2 = 24$. Then $6 + 2 + 3 = 11$. Total 31.`,
    verifiedBy: ["exhaustive-search", "dp"],
  },
  {
    id: "bt-055",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["search-strategy", "number-puzzle"],
    minutes: 6,
    title: "Nine-litre and four-litre jugs",
    prompt: String.raw`You have an unmarked 9-litre jug, an unmarked 4-litre jug, a tap and a drain. Both jugs start empty. One action is any of: fill a jug completely from the tap; empty a jug completely into the drain; or pour from one jug into the other until the source is empty or the destination is full, whichever comes first. What is the minimum number of actions needed to have exactly 6 litres in the 9-litre jug?`,
    answer: { type: "numeric", value: 8, exact: "8", unit: "actions" },
    hints: [
      "Every state is a pair (litres in the 9, litres in the 4). After each action at least one jug is full or empty, which keeps the state space small.",
      "Pouring the 4 into the 9 repeatedly builds multiples of 4 and wraps around at 9. Track 4, 8, then 3 left after filling the 9, then 7, then 2, then 6.",
      "Go the other way: fill the 9 and drain it through the 4. Fill 9 (9, 0), pour (5, 4), empty 4 (5, 0), pour (1, 4), empty 4 (1, 0), pour (0, 1), fill 9 (9, 1), pour (6, 4). Count the actions.",
    ],
    solution: String.raw`Write a state as $(a, b)$ with $a$ litres in the 9-litre jug and $b$ in the 4-litre jug. Each action moves to a neighbouring state, and we want the shortest path from $(0, 0)$ to any state with $a = 6$.

A natural strategy is to keep filling the small jug and pouring it into the big one. Fill 4: $(0, 4)$. Pour: $(4, 0)$. Fill 4: $(4, 4)$. Pour: $(8, 0)$. Fill 4: $(8, 4)$. Pour: the big jug takes only 1 litre, $(9, 3)$. Empty the big jug: $(0, 3)$. Pour: $(3, 0)$. That is 8 actions and we have 3 in the big jug, not 6; continuing the same way takes 2 more actions to reach $(7, 0)$ and then 6 more to reach $(6, 0)$, 16 in all, far too many.

Go the other way: fill the big jug and empty it through the small one. Fill 9: $(9, 0)$. Pour into 4: $(5, 4)$. Empty 4: $(5, 0)$. Pour: $(1, 4)$. Empty 4: $(1, 0)$. Pour: $(0, 1)$. Fill 9: $(9, 1)$. Pour into 4, which takes 3 litres: $(6, 4)$. That is 8 actions and the big jug holds exactly 6 litres.

Could 7 or fewer actions do it? A breadth-first search over the reachable states (at most $10 \cdot 5 = 50$ pairs) shows that the states at distance 7 or less from $(0,0)$ never have 6 in the big jug; the first appearance of $a = 6$ is at distance 8. So the minimum is 8 actions.`,
    steps: [
      "Model states as (big, small) and actions as edges.",
      "Try the fill-small-pour-into-big direction and see 6 is far away.",
      "Try fill-big-drain-through-small: 9, 5, 1, then refill and top the small jug to land on 6.",
      "Count 8 actions and confirm by a shortest-path search that no 7-action route exists.",
    ],
    keyIdea: "Jug puzzles are shortest paths on a small graph; try both 'directions' (fill small into big, or drain big through small) and the shorter one usually wins.",
    commonMistake: "Pouring the small jug into the big jug on autopilot, which reaches 6 only after 16 actions.",
    fastPath: String.raw`Drain the 9 through the 4 twice: 9 to 5 to 1 (5 actions), tip the 1 into the small jug, refill the big one and top up the small jug: $9 - 3 = 6$. Eight actions.`,
    variation: "Same jugs. What is the minimum number of actions to have exactly 2 litres in either jug?",
    variationAnswer: String.raw`Ten actions, for example $(9,0),(5,4),(5,0),(1,4),(1,0),(0,1),(9,1),(6,4),(6,0),(2,4)$; the search shows nothing shorter reaches 2 litres in either jug.`,
    family: "river-crossing",
    verifiedBy: ["exhaustive-search", "enumeration"],
  },
  {
    id: "bt-056",
    module: 9,
    kind: "brainteaser",
    difficulty: 2,
    tags: ["search-strategy", "logic"],
    minutes: 3,
    title: "Finding the two marked bottles",
    prompt: String.raw`A rack holds 10 bottles numbered 1 to 10. Exactly two of them are marked, and you do not know which two. You may ask questions of the form "Is the marked pair one of these pairs?" for any set of pairs you like, and each question is answered truthfully yes or no. What is the smallest number of questions that guarantees you can identify the marked pair?`,
    answer: { type: "numeric", value: 6, exact: String.raw`\lceil \log_2 \binom{10}{2} \rceil = \lceil \log_2 45 \rceil = 6`, unit: "questions" },
    hints: [
      "First count how many possibilities you are distinguishing between. It is not 10.",
      String.raw`There are $\binom{10}{2} = 45$ possible pairs. Each yes/no answer at best halves the remaining possibilities.`,
      String.raw`You need $2^k \ge 45$. Since $2^5 = 32 < 45 \le 64 = 2^6$, the answer is 6, and splitting the candidate set in half each time achieves it.`,
    ],
    solution: String.raw`The unknown is which pair of bottles is marked. There are $\binom{10}{2} = 45$ equally possible pairs, so there are 45 possibilities to distinguish.

Each question has two possible answers, so after $k$ questions there are at most $2^k$ distinct answer sequences. To be certain of identifying the pair, every one of the 45 possibilities must produce a different answer sequence, so $2^k \ge 45$. Since $2^5 = 32 < 45$ and $2^6 = 64 \ge 45$, at least 6 questions are needed.

Six questions suffice. The questions are completely flexible (any set of pairs), so ask about a set containing half of the remaining candidate pairs (rounding as needed). Each answer cuts the candidate list from $n$ to at most $\lceil n/2 \rceil$: $45 \to 23 \to 12 \to 6 \to 3 \to 2 \to 1$. After 6 questions exactly one candidate remains.

The trap is to think in terms of bottles ($\lceil \log_2 10 \rceil = 4$) rather than pairs. Answer: 6 questions.`,
    steps: [
      "Count the possibilities: C(10,2) = 45 pairs, not 10 bottles.",
      "Bound: k yes/no answers distinguish at most 2^k cases, so 2^k >= 45.",
      "Compute the smallest k: 6.",
      "Show halving the candidate set achieves 6.",
    ],
    keyIdea: "Count the hypotheses, then take the ceiling of log base 2.",
    commonMistake: "Answering 4 (log of the number of bottles) or 8 (four questions per bottle), instead of counting pairs.",
    fastPath: String.raw`$45$ pairs; $32 < 45 \le 64$; six.`,
    variation: "Three bottles are marked instead of two. How many questions now?",
    variationAnswer: String.raw`$\binom{10}{3} = 120$ possibilities, $2^6 = 64 < 120 \le 128 = 2^7$, so 7 questions.`,
    verifiedBy: ["formula", "enumeration"],
  },
  {
    id: "bt-057",
    module: 9,
    kind: "brainteaser",
    difficulty: 2,
    tags: ["search-strategy"],
    minutes: 3,
    title: "Knight to the far corner's neighbour",
    prompt: String.raw`A chess knight stands on the bottom-left square a1 of an ordinary $8 \times 8$ board (files a-h, ranks 1-8). A knight move is two squares in one direction and one square in a perpendicular direction, and it must stay on the board. What is the minimum number of moves for the knight to reach g8, the square directly left of the top-right corner?`,
    answer: { type: "numeric", value: 5, exact: "5", unit: "moves" },
    hints: [
      "Each move changes the file by 1 or 2 and the rank by 2 or 1, so a move covers at most 3 units of file-plus-rank distance.",
      "From a1 to g8 the file changes by 6 and the rank by 7, total 13. How many moves does that force at least?",
      "Thirteen units at 3 per move needs at least 5 moves, and parity (the knight changes square colour every move) agrees. Find a 5-move route, for example a1-c2-e3-f5-h6-g8.",
    ],
    solution: String.raw`Write a square as (file, rank) with a1 = (1, 1) and g8 = (7, 8). A knight move changes one coordinate by 2 and the other by 1, so it changes the sum of the absolute coordinate differences to the target by at most 3. The target is $|7 - 1| + |8 - 1| = 6 + 7 = 13$ away in that metric, so at least $\lceil 13/3 \rceil = 5$ moves are needed.

Four moves cannot do it even by parity: every knight move changes $(\text{file} + \text{rank})$ by an odd amount ($\pm 1$ or $\pm 3$), so after an even number of moves the knight is on a square of the same colour as a1. The square a1 has $1 + 1 = 2$ (even) and g8 has $7 + 8 = 15$ (odd), so the number of moves must be odd. Together with the distance bound, the minimum is at least 5.

Five moves work: a1 to c2 (+2, +1), c2 to e3 (+2, +1), e3 to f5 (+1, +2), f5 to h6 (+2, +1), h6 to g8 ($-1$, +2). Check: file $1 \to 3 \to 5 \to 6 \to 8 \to 7$, rank $1 \to 2 \to 3 \to 5 \to 6 \to 8$, all within the board. Minimum: 5 moves.`,
    steps: [
      "Set coordinates and measure the file and rank gaps: 6 and 7.",
      "Lower-bound by 3 units per move: at least 5.",
      "Confirm the parity (colour) argument also forces an odd number.",
      "Exhibit a 5-move path that stays on the board.",
    ],
    keyIdea: "Combine a distance bound (at most 3 units of displacement per move) with the colour-change parity of knight moves.",
    commonMistake: "Guessing 6 by analogy with the corner-to-corner route (a1 to h8 does take 6), or 4 by dividing 13 by 3 and rounding down.",
    fastPath: "Gap 6 + 7 = 13, three per move, so 5; colour flips each move and the squares differ in colour, so odd is right. Five.",
    variation: "Same knight from a1. What is the minimum number of moves to reach h8, the top-right corner?",
    variationAnswer: "Gap 7 + 7 = 14 needs at least 5 moves, but a1 and h8 are the same colour so the count must be even: 6 moves, for example a1-c2-e3-g4-h6-f7-h8.",
    verifiedBy: ["exhaustive-search", "enumeration"],
  },
  {
    id: "bt-058",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["search-strategy", "invariants"],
    minutes: 5,
    title: "Reshelving six books",
    prompt: String.raw`Six books labelled A to F stand on a shelf in the order D, F, A, C, B, E from left to right. One move takes a single book out and reinserts it at any position on the shelf (the other books close up and shift as needed). What is the minimum number of moves to put the books in alphabetical order A, B, C, D, E, F?`,
    answer: { type: "numeric", value: 3, exact: "6 - 3 = 3", unit: "moves" },
    hints: [
      "A book that is never moved keeps its position relative to the other unmoved books. So the unmoved books must already be in alphabetical order relative to each other.",
      "Find the longest subsequence of D, F, A, C, B, E that is already increasing. Every other book must move at least once.",
      "The longest increasing subsequence has length 3 (for example A, C, E). So 6 - 3 = 3 moves are necessary, and moving the other three books into place is sufficient.",
    ],
    solution: String.raw`Think about which books never move. Books that are never touched keep their left-to-right order among themselves, so in the final sorted shelf they must appear in alphabetical order; equivalently, the set of unmoved books is an increasing subsequence of the starting order D, F, A, C, B, E. Conversely, any book that is moved can be placed exactly where it belongs, so the number of moves needed is exactly $6$ minus the length of the longest increasing subsequence.

Find that length. Starting with D we can continue with E or F: D, E or D, F, length 2. Starting with A: A, C, E or A, B, E, length 3. Nothing of length 4 exists. An increasing subsequence that contains D or F cannot also contain A, B or C, because those three stand to the right of D and F on the shelf but come earlier in the alphabet; so such a subsequence lives inside D, F, E and has length at most 2. A subsequence that avoids D and F lives inside A, C, B, E, and since C and B are out of order it has length at most 3. So 3 is the maximum.

So at least $6 - 3 = 3$ moves are needed, and 3 suffice: keep A, C, E in place and move the other three. Move D to the right of C: F, A, C, D, B, E. Move F to the far right: A, C, D, B, E, F. Move B between A and C: A, B, C, D, E, F. Three moves. Answer: 3.`,
    steps: [
      "Observe unmoved books keep their relative order, so they form an increasing subsequence.",
      "Find the longest increasing subsequence: length 3 (A, C, E or A, B, E).",
      "Minimum moves = 6 - 3 = 3.",
      "Give the explicit three moves.",
    ],
    keyIdea: "Minimum take-out-and-reinsert moves equals the number of items minus the longest increasing subsequence.",
    commonMistake: "Counting adjacent swaps (inversions) instead of free reinsertions, which gives a larger number, or counting books out of place (5) instead of books that must move.",
    fastPath: "Longest run already in order is 3 letters long; the other 3 books each need one move.",
    variation: "Same starting shelf, but a move may only swap two adjacent books. What is the minimum number of moves now?",
    variationAnswer: String.raw`The number of inversions of D, F, A, C, B, E: pairs out of order are DA, DC, DB, FA, FC, FB, FE, CB, which is 8 moves.`,
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "bt-059",
    module: 9,
    kind: "brainteaser",
    difficulty: 4,
    tags: ["search-strategy", "induction"],
    minutes: 8,
    title: "Swapping two queues through one gap",
    prompt: String.raw`Nine chairs are in a row. Four people wearing red sit in the four leftmost chairs, four people wearing blue sit in the four rightmost chairs, and the middle chair is empty. Reds may only move rightward and blues only leftward. A move is either a slide into the adjacent empty chair, or a jump over exactly one person of the *other* colour into the empty chair directly beyond. What is the minimum number of moves to end with the blues in the four leftmost chairs and the reds in the four rightmost chairs (and the middle chair empty again)?`,
    answer: { type: "numeric", value: 24, exact: String.raw`4^2 + 2 \cdot 4 = (4+1)^2 - 1 = 24`, unit: "moves" },
    hints: [
      "Count what has to happen: every red must pass every blue. A pass happens only during a jump, and a jump passes exactly one person.",
      "There are 4 x 4 = 16 red-blue pairs, so at least 16 jumps. Each colour also has to advance 5 chairs in total per person... count the total distance.",
      "Total displacement is 8 people x 5 chairs = 40; a jump moves someone 2 chairs and a slide 1 chair. With exactly 16 jumps that leaves 40 - 32 = 8 slides, for 24 moves. Then build the schedule by alternating colours.",
    ],
    solution: String.raw`Each person must end up on the other side of the gap: every red moves from a chair among positions 1-4 to one among 6-9, and each blue the reverse. Each person therefore travels exactly 5 chairs, for a total displacement of $8 \cdot 5 = 40$ chairs. A slide contributes 1 chair and a jump contributes 2.

Reds and blues must also swap order: each of the $4 \cdot 4 = 16$ red-blue pairs starts with the red on the left and ends with the red on the right, so they must pass each other. The only way two people pass is a jump, and a jump passes exactly one pair. So there are at least 16 jumps, contributing at most $32$ of the displacement if there are exactly 16, and the remaining 8 chairs of displacement need at least 8 slides. Any solution has at least $16 + 8 = 24$ moves, and equality requires exactly 16 jumps and 8 slides.

A 24-move schedule exists. Using R for red and B for blue, the moves come in colour blocks of sizes 1, 2, 3, 4, 4, 4, 3, 2, 1: slide R; jump B, slide B; jump R, jump R, slide R; jump B, jump B, jump B, slide B; jump R, jump R, jump R, jump R; slide B, jump B, jump B, jump B; slide R, jump R, jump R; slide B, jump B; slide R. The counts are 8 slides and 16 jumps, and a breadth-first search over the 630 possible arrangements (only 195 of which are reachable under the one-way rules) confirms no shorter sequence exists. For $n$ of each colour the same argument gives $n^2$ jumps and $2n$ slides, $n^2 + 2n = (n+1)^2 - 1$ moves; with $n = 4$ that is $24$.`,
    steps: [
      "Compute total displacement: 8 people x 5 chairs = 40.",
      "Count forced passes: 16 red-blue pairs, each needing one jump.",
      "Jumps give 32 of the displacement; slides supply the other 8; total 24 moves.",
      "Exhibit (or search for) a 24-move schedule and recall the (n+1)^2 - 1 pattern.",
    ],
    keyIdea: "Separate the two resources a move spends: displacement (1 or 2 chairs) and passings (only jumps, one each); both bounds are tight together.",
    commonMistake: "Counting moves per person rather than per pair, or thinking the gap must return to the middle after every few moves.",
    fastPath: String.raw`$(n + 1)^2 - 1$ with $n = 4$: 24. If you forget the formula, $n^2$ jumps plus $2n$ slides.`,
    variation: "Three reds and three blues on seven chairs with the same rules. Minimum moves?",
    variationAnswer: String.raw`$3^2 + 2 \cdot 3 = 15$.`,
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "bt-060",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["search-strategy"],
    minutes: 5,
    title: "Raft with a weight limit",
    prompt: String.raw`Five people weighing 100, 90, 70, 40 and 30 kilograms must cross a river on a raft that safely carries at most 130 kilograms at a time. The raft cannot move empty; at least one person must be on it to paddle. Each trip in either direction counts as one crossing. What is the minimum number of crossings to get all five to the far bank?`,
    answer: { type: "numeric", value: 7, exact: String.raw`2 \cdot 5 - 3 = 7`, unit: "crossings" },
    hints: [
      "List the pairs allowed to ride together: the two heaviest cannot pair with each other or with the 70.",
      "Each forward crossing delivers at most 2 people and each return brings at least 1 back. With k forward trips the far bank ends with at most k + 1 people.",
      "You need k + 1 >= 5, so k >= 4 forward trips, plus 3 returns: 7. Use the 30-kilogram person as the shuttle who always paddles back.",
    ],
    solution: String.raw`Allowed pairs are those with total at most 130: (100, 30), (90, 40), (90, 30), (70, 40), (70, 30), (40, 30). The 100 can only ride with the 30, and the 90 only with the 40 or the 30.

Lower bound. Suppose the crossing finishes after $k$ forward trips; then there are $k - 1$ return trips in between. Each forward trip adds at most 2 people to the far bank (three people always exceed the limit: the three lightest weigh 140) and each return removes at least 1, so after the final forward trip the far bank holds at most $2k - (k - 1) = k + 1$ people. We need all 5, so $k \ge 4$, and the total number of crossings is at least $k + (k - 1) = 2k - 1 \ge 7$.

Construction with 7 crossings, using the 30 as the paddler who always comes back: 40 and 30 cross; 30 returns; 100 and 30 cross; 30 returns; 90 and 30 cross; 30 returns; 70 and 30 cross. Every load is within 130 (70, 30, 130, 30, 120, 30, 100), the raft is never empty, and after the seventh crossing everyone is across. Minimum: 7 crossings.`,
    steps: [
      "List the legal pairs under the 130 kg limit.",
      "Bound: k forward trips leave at most k + 1 on the far bank, so k >= 4 and crossings >= 7.",
      "Build the 7-crossing schedule with the lightest person as the shuttle.",
    ],
    keyIdea: "Each round trip nets at most one extra person across, so n people need at least 2n - 3 crossings; the lightest person as permanent paddler achieves it.",
    commonMistake: "Trying to send the two heaviest across together or paddling back with a heavy person, which wastes trips; or forgetting the raft cannot cross empty.",
    fastPath: String.raw`$2 \cdot 5 - 3 = 7$, realised by the 30 escorting everyone one at a time.`,
    variation: "The 30-kilogram person is replaced by someone weighing 50. What is the minimum now?",
    variationAnswer: "Pairs with 50: 50 can ride with 70 or 40 but not 90 or 100; the 100 then has no partner and the 90 only the 40. The 100 crosses alone (one forward trip delivering one person), so k + 1 drops to k and you need k >= 5, giving 9 crossings; a schedule achieving 9 exists.",
    family: "river-crossing",
    verifiedBy: ["exhaustive-search", "formula"],
  },

  // ---------------------------------------------------------------- game strategy
  {
    id: "bt-061",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["games", "backward-induction", "induction"],
    minutes: 5,
    title: "Take one, three or four",
    prompt: String.raw`A pile holds 25 counters. Two players alternate turns; on each turn a player removes exactly 1, 3 or 4 counters (a player may not remove 2, and may not remove more than remain). The player who takes the last counter wins. With both players playing perfectly, what happens?`,
    answer: {
      type: "choice",
      options: [
        "The first player wins, and the only winning first move is to take 1",
        "The first player wins, and the only winning first move is to take 3",
        "The first player wins, and the only winning first move is to take 4",
        "The second player wins whatever the first player does",
      ],
      correct: 2,
    },
    hints: [
      "Label a pile size 'losing' if the player about to move from it loses against perfect play. The pile 0 is losing (the previous player just took the last counter).",
      "A size is winning if some move reaches a losing size; it is losing if every move (1, 3 or 4) reaches a winning size. Compute 0, 1, 2, ... and look for a repeating pattern.",
      "The losing sizes are 0, 2, 7, 9, 14, 16, ... (remainders 0 and 2 mod 7). From 25, which single move lands on a losing size?",
    ],
    solution: String.raw`Call a pile size *losing* (L) if the player who must move from it loses under perfect play, and *winning* (W) otherwise. Size 0 is L: the player to move has no counters left and the previous player took the last one. A size is W if at least one legal move leads to an L size, and L if every legal move leads to a W size.

Build the table. $1$: take 1 to reach 0, W. $2$: moves to 1 only (3 and 4 are not legal), which is W, so $2$ is L. $3$: take 1 to reach 2 (L), W. $4$: take 4 to reach 0, W. $5$: take 3 to reach 2, W. $6$: take 4 to reach 2, W. $7$: moves reach 6, 4, 3, all W, so $7$ is L. $8$: take 1 to 7, W. $9$: moves reach 8, 6, 5, all W, so L. Continuing, the pattern repeats with period 7: the losing sizes are exactly those congruent to $0$ or $2$ modulo 7, namely $0, 2, 7, 9, 14, 16, 21, 23, \dots$ (the period is forced because the status of $n$ depends only on $n - 1$, $n - 3$, $n - 4$, and the block 7, 8, 9, 10, 11, 12, 13 reproduces 0 through 6).

Now $25 \equiv 4 \pmod 7$, so 25 is W: the first player wins. Which moves work? Taking 1 leaves 24 ($\equiv 3$, W for the opponent), taking 3 leaves 22 ($\equiv 1$, W for the opponent), taking 4 leaves 21 ($\equiv 0$, L for the opponent). Only taking 4 wins. Afterwards the first player keeps answering so as to return the pile to a multiple-of-7-or-2-more size. Option 3.`,
    steps: [
      "Define losing and winning sizes with 0 losing.",
      "Fill the table for 0 to 9 using moves 1, 3, 4.",
      "Spot the period-7 pattern: losing iff n mod 7 is 0 or 2.",
      "Reduce 25 mod 7 and test the three first moves; only 4 reaches a losing size.",
    ],
    keyIdea: "Backward induction on pile size; the allowed moves make the win/lose pattern periodic, and the first move must land on a losing size.",
    commonMistake: "Assuming the losing sizes are multiples of 1 + 4 = 5 (the rule for 'take 1 to 4'), which wrongly says 25 is a loss for the first player.",
    fastPath: "Losing sizes are 0 and 2 mod 7. 25 is 4 mod 7; subtract 4 to hit 21.",
    variation: "Same rules but the player who takes the last counter loses. Who wins from 25?",
    variationAnswer: "Now size 1 is losing for the mover (forced to take the last). The losing sizes become 1, 3, 8, 10, 15, 17, 22, 24 (shifted by 1). From 25 the first player wins by taking 1 (to 24) or 3 (to 22).",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "bt-062",
    module: 9,
    kind: "brainteaser",
    difficulty: 4,
    tags: ["games", "backward-induction", "invariants"],
    minutes: 6,
    title: "Three stacks of chips",
    prompt: String.raw`Three stacks hold 5, 8 and 11 chips. Two players alternate; on a turn a player chooses one stack and removes any positive number of chips from that stack only. The player who removes the very last chip wins. Under perfect play the first player wins and has exactly one winning first move. How many chips does that move remove?`,
    answer: { type: "numeric", value: 2, exact: String.raw`5 \oplus (8 \oplus 11) = 5 \oplus 3 \Rightarrow 5 \to 3,\; \text{remove } 2`, unit: "chips" },
    hints: [
      "Write the stack sizes in binary and compare the columns. A position is balanced when every binary column has an even number of ones.",
      String.raw`$5 = 101_2$, $8 = 1000_2$, $11 = 1011_2$. The bitwise XOR is $5 \oplus 8 \oplus 11$; if it is nonzero the mover can balance the position.`,
      "Find the stack whose size, XORed with the total XOR, becomes smaller; reduce that stack to the new value.",
    ],
    solution: String.raw`This is a take-from-one-stack game, and the governing invariant is the bitwise XOR (nim-sum) of the stack sizes. Claim: a position is losing for the player to move exactly when the XOR of the sizes is 0. Reason: from a zero-XOR position every move changes exactly one stack and so changes at least one binary column from even to odd, making the XOR nonzero; from a nonzero-XOR position there is always a move back to zero (pick a stack with a 1 in the highest set bit of the XOR and replace it by its XOR with the total). The terminal position (all stacks empty) has XOR 0 and the player to move there has lost, so the labels propagate correctly.

Compute: $5 = 0101_2$, $8 = 1000_2$, $11 = 1011_2$. Column by column, $0101 \oplus 1000 = 1101$, and $1101 \oplus 1011 = 0110 = 6$. The XOR is 6, nonzero, so the first player wins.

Which stack to change? The highest set bit of 6 is the 4s column, and only the 5-stack ($0101$) has a 1 there. Replace 5 by $5 \oplus 6 = 3$: remove 2 chips from the 5-stack, leaving $3, 8, 11$ with $3 \oplus 8 \oplus 11 = 0$. The other stacks cannot be used: $8 \oplus 6 = 14 > 8$ and $11 \oplus 6 = 13 > 11$, so no legal reduction of them balances the position. The unique winning first move removes 2 chips (from the stack of 5).`,
    steps: [
      "Recall the invariant: XOR of stack sizes is 0 exactly at losing positions.",
      "Compute 5 XOR 8 XOR 11 = 6.",
      "Find the stack that can absorb the XOR: 5 becomes 3.",
      "Report the removal: 2 chips.",
    ],
    keyIdea: "Balance the binary columns: move to a position whose nim-sum is zero.",
    commonMistake: "Trying to equalise two stacks (reduce 11 to 8), which leaves 5, 8, 8 with XOR 5, a winning position for the opponent.",
    fastPath: String.raw`$5 \oplus 8 \oplus 11 = 6$; $5 \oplus 6 = 3$; take two from the five.`,
    variation: "Stacks of 6, 9 and 15. What is the unique winning first move?",
    variationAnswer: String.raw`$6 \oplus 9 \oplus 15 = 0$: the position is already balanced, so the first player loses; there is no winning move.`,
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "bt-063",
    module: 9,
    kind: "brainteaser",
    difficulty: 4,
    tags: ["games", "backward-induction"],
    minutes: 8,
    title: "Picking coins from the ends",
    prompt: String.raw`Six coins lie in a row with values 4, 9, 1, 7, 6, 3 (in that order, in dollars). Two players alternate; on each turn the mover takes either the leftmost or the rightmost remaining coin and keeps it. Both players play to maximise their own total. What total, in dollars, does the first player end up with?`,
    answer: { type: "numeric", value: 19, exact: "19", unit: "dollars" },
    hints: [
      "Work backwards from short rows. For a row of one coin the mover takes it; for two coins the mover takes the larger.",
      String.raw`Let $V(i, j)$ be the mover's best total from the row $i..j$. Then $V(i, j) = \max\big(a_i + S(i+1, j) - V(i+1, j),\; a_j + S(i, j-1) - V(i, j-1)\big)$ where $S$ is the row sum: whatever the mover does not get from the rest, the opponent gets.`,
      "Fill the table for lengths 1, 2, 3, ... up to 6. The parity trick (take all even positions or all odd positions) only guarantees not losing; here it is not the optimum.",
    ],
    solution: String.raw`Let the coins be $a_1 \dots a_6 = 4, 9, 1, 7, 6, 3$, total 30. Let $V(i, j)$ be the most the player about to move can collect from the sub-row $a_i, \dots, a_j$ when both play optimally, and $S(i, j)$ its sum. After taking an end coin, the opponent faces the smaller row and collects $V$ of it, so the mover gets the rest:
$$V(i, j) = \max\big(a_i + S(i+1, j) - V(i+1, j),\; a_j + S(i, j-1) - V(i, j-1)\big).$$

Length 1: $V(k,k) = a_k$. Length 2: the mover takes the larger coin: $V(1,2) = 9$, $V(2,3) = 9$, $V(3,4) = 7$, $V(4,5) = 7$, $V(5,6) = 6$.

Length 3. $V(1,3)$ on $4, 9, 1$: take 4 then get $10 - V(2,3) = 1$, total 5; take 1 then get $13 - V(1,2) = 4$, total 5; so 5. $V(2,4)$ on $9, 1, 7$: take 9 then $8 - 7 = 1$, total 10; take 7 then $10 - 9 = 1$, total 8; so 10. $V(3,5)$ on $1, 7, 6$: take 1 then $13 - 7 = 6$, total 7; take 6 then $8 - 7 = 1$, total 7; so 7. $V(4,6)$ on $7, 6, 3$: take 7 then $9 - 6 = 3$, total 10; take 3 then $13 - 7 = 6$, total 9; so 10.

Length 4. $V(1,4)$ on $4, 9, 1, 7$ (sum 21): take 4 then $17 - V(2,4) = 7$, total 11; take 7 then $14 - V(1,3) = 9$, total 16; so 16. $V(2,5)$ on $9, 1, 7, 6$ (sum 23): take 9 then $14 - 7 = 7$, total 16; take 6 then $17 - 10 = 7$, total 13; so 16. $V(3,6)$ on $1, 7, 6, 3$ (sum 17): take 1 then $16 - 10 = 6$, total 7; take 3 then $14 - 7 = 7$, total 10; so 10.

Length 5. $V(1,5)$ on $4, 9, 1, 7, 6$ (sum 27): take 4 then $23 - 16 = 7$, total 11; take 6 then $21 - 16 = 5$, total 11; so 11. $V(2,6)$ on $9, 1, 7, 6, 3$ (sum 26): take 9 then $17 - 10 = 7$, total 16; take 3 then $23 - 16 = 7$, total 10; so 16.

Length 6. $V(1,6)$ on the full row (sum 30): take 4 then $26 - V(2,6) = 10$, total 14; take 3 then $27 - V(1,5) = 16$, total 19; so $V(1,6) = 19$. The first player should start with the 3 and ends with 19 dollars against the second player's 11. Note the parity strategy (odd positions $4 + 1 + 6 = 11$, even positions $9 + 7 + 3 = 19$) happens to coincide here, but the table is what proves optimality.`,
    steps: [
      "Set up the interval recursion: mover's value = coin taken + (rest of sum - opponent's value).",
      "Fill lengths 1 and 2 directly.",
      "Fill lengths 3, 4, 5 from the table.",
      "Compute the full row: taking the 3 first yields 19.",
    ],
    keyIdea: "Interval backward induction: the mover's value is the coin plus whatever the opponent does not take from the remainder.",
    commonMistake: "Greedily taking the larger end each turn (4 vs 3 takes 4, then the opponent takes 9), which gives the first player only 14.",
    fastPath: "Odd positions sum to 11, even positions to 19; the mover can lock in the even set by starting with the 3, and the DP confirms 19 is optimal.",
    variation: "Same row, but now there are seven coins: 4, 9, 1, 7, 6, 3, 5. What does the first player get?",
    variationAnswer: String.raw`Rerun the table; with an odd count the parity trick is unavailable. The recursion gives $V(1,7) = 16$ (either end works as a first move), so the first player collects only 16 of the 35 and the second player gets 19.`,
    family: "backward-induction",
    verifiedBy: ["dp", "exhaustive-search"],
  },
  {
    id: "bt-064",
    module: 9,
    kind: "brainteaser",
    difficulty: 4,
    tags: ["games", "backward-induction"],
    minutes: 7,
    title: "Removing a square number of stones",
    prompt: String.raw`A heap holds 22 stones. Players alternate, and on each turn a player removes a perfect-square number of stones: 1, 4, 9 or 16 (never more than remain). The player who takes the last stone wins. Under perfect play, which statement is true?`,
    answer: {
      type: "choice",
      options: [
        "The first player wins by taking 1 stone",
        "The first player wins by taking 4 stones",
        "The first player wins by taking 9 stones",
        "The first player wins by taking 16 stones",
        "The second player wins whatever the first player does",
      ],
      correct: 4,
    },
    hints: [
      "Mark 0 as a loss for the player to move. A heap is a win if some square move reaches a loss, and a loss if every square move reaches a win.",
      "Compute the losing heaps in order: 0, 2, 5, 7, 10, ... Keep going to 22.",
      "The losing heaps up to 22 are 0, 2, 5, 7, 10, 12, 15, 17, 20, 22. Check: 21, 18, 13 and 6 are all wins for the opponent.",
    ],
    solution: String.raw`Let L be the set of heap sizes from which the player to move loses under perfect play, and W the rest. $0 \in L$. A size is in W if some legal square move lands in L, otherwise it is in L.

Compute upward. $1$: take 1 to 0, W. $2$: only move is to 1 (W), so L. $3$: to 2, W. $4$: to 0, W. $5$: moves to 4 and 1, both W, so L. $6$: to 5, W. $7$: moves to 6 and 3, both W, so L. $8$: to 7, W. $9$: to 0, W. $10$: moves to 9, 6, 1, all W, so L. $11$: to 10, W. $12$: moves to 11, 8, 3, all W, so L. $13$: to 12, W. $14$: to 10, W. $15$: moves to 14, 11, 6, all W, so L. $16$: to 0, W. $17$: moves to 16, 13, 8, 1, all W, so L. $18$: to 17, W. $19$: to 15, W. $20$: moves to 19, 16, 11, 4, all W, so L. $21$: to 20, W. $22$: moves to 21, 18, 13, 6, all W, so L.

The heap of 22 is a losing position for the player to move. Whatever the first player takes (1, 4, 9 or 16), the second player can reply to a losing size: from 21 take 1 (to 20), from 18 take 1 (to 17), from 13 take 1 (to 12), from 6 take 1 (to 5), and continue the same way. Option 5: the second player wins.

A note for the pattern-spotter: the losing sizes are exactly "0 or 2 mod 5", and with only the moves 1, 4, 9, 16 available that pattern holds for every heap size, because each move is $\pm 1 \pmod 5$ and so always leads from a 0-or-2 residue to a 1, 3 or 4 residue, while from any of those a move of 1 or 4 returns to the pattern. Be careful though: in the general game where *any* square may be removed, the move 25 breaks the pattern (34 is the first losing heap that is not 0 or 2 mod 5), so the pattern is a property of this move set, not of square-removal games in general.`,
    steps: [
      "Define losing (L) and winning (W) heaps with 0 in L.",
      "Fill the table from 1 to 22 using the moves 1, 4, 9, 16.",
      "Read off that 22 is L and name the reply to each first move.",
    ],
    keyIdea: "Backward induction over heap sizes; every first move from a losing size hands the opponent a winning size.",
    commonMistake: "Assuming the heap is winning because the first player has four options, or stopping the table early and extrapolating a pattern.",
    fastPath: "Losing heaps 0, 2, 5, 7, 10, 12, 15, 17, 20, 22. Twenty-two is on the list.",
    variation: "Same rules from a heap of 23. What is the correct first move?",
    variationAnswer: "Take 1 stone to leave 22, a losing heap for the opponent. Taking 16 to leave 7 also works; both are winning moves.",
    verifiedBy: ["exhaustive-search", "dp"],
  },
  {
    id: "bt-065",
    module: 9,
    kind: "brainteaser",
    difficulty: 5,
    tags: ["games", "backward-induction", "number-puzzle"],
    minutes: 10,
    title: "Two heaps, one or both",
    prompt: String.raw`Two heaps hold 8 and 11 tokens. Players alternate. A move is one of: remove any positive number of tokens from the first heap; remove any positive number from the second heap; or remove the *same* positive number from both heaps. The player who takes the last token (leaving both heaps empty) wins. The first player has exactly one winning first move. How many tokens in total does that move remove?`,
    answer: { type: "numeric", value: 8, exact: "4 + 4 = 8", unit: "tokens" },
    hints: [
      "Find the losing positions (for the player to move) with small heaps, as pairs (a, b) with a <= b. The first few are (0,0) and (1,2).",
      "Each losing pair uses a new difference b - a = 0, 1, 2, 3, ... and a new smallest unused value a. Build the list: (1,2), (3,5), (4,7), (6,10), (8,13), (9,15), ...",
      "From (8, 11), check all three move types for a landing on a losing pair; only one works, removing the same amount from both heaps.",
    ],
    solution: String.raw`Call a position *cold* if the player to move loses under perfect play. $(0, 0)$ is cold. A position is hot if some move reaches a cold position, and cold if every move reaches a hot position. Because the three move types can change the first heap, the second heap, or both equally, from a position $(a, b)$ you can reach any position with the same $a$ and smaller $b$, the same $b$ and smaller $a$, or the same difference $b - a$ and smaller $a$. Consequently two distinct cold positions can never share a first coordinate, a second coordinate, or a difference.

Build the cold positions in order of increasing difference $d = b - a$. $d = 0$: $(0,0)$. $d = 1$: the smallest value not yet used as a coordinate is 1, so $(1, 2)$. $d = 2$: smallest unused is 3, so $(3, 5)$. $d = 3$: unused 4, so $(4, 7)$. $d = 4$: unused 6, so $(6, 10)$. $d = 5$: unused 8, so $(8, 13)$. $d = 6$: unused 9, so $(9, 15)$. $d = 7$: $(11, 18)$. This list is exactly the set of cold positions: no move from a listed pair lands on another listed pair (all first coordinates, second coordinates and differences on the list are distinct), and any unlisted pair shares a coordinate or a difference with some listed pair whose other entries are smaller, so a single move reaches it. (The standard fact behind the second half is that every positive integer appears exactly once among the coordinates; the pairs are $(\lfloor k\varphi \rfloor, \lfloor k\varphi^2 \rfloor)$ with $\varphi$ the golden ratio.)

Now examine $(8, 11)$, which has difference 3. It is not on the list, so it is hot. Reduce the first heap to $x < 8$ keeping 11: no cold pair has second coordinate 11. Reduce the second heap to $y < 11$ keeping 8: the cold pair with first coordinate 8 is $(8, 13)$, and 13 is too large; no cold pair has 8 as its larger coordinate either. Reduce both heaps by $k$, keeping difference 3: the cold pair with difference 3 is $(4, 7)$, reached by $k = 4$. That move is legal and unique. It removes $4 + 4 = 8$ tokens.`,
    steps: [
      "Define cold positions and note no two share a coordinate or a difference.",
      "Generate cold pairs by increasing difference: (1,2), (3,5), (4,7), (6,10), (8,13), ...",
      "Check the three move types from (8, 11); only the equal removal of 4 lands on (4, 7).",
      "Total removed: 8 tokens.",
    ],
    keyIdea: "Cold positions use each heap size and each difference exactly once; find the cold pair that shares a coordinate or difference with the current position.",
    commonMistake: "Reducing to equal heaps (8, 8), which is hot because the opponent removes both; or forgetting the equal-removal move and treating it as plain two-heap play.",
    fastPath: "Cold pairs by difference: (1,2), (3,5), (4,7), (6,10). From (8, 11) the difference is 3, so drop to (4, 7): take 4 from each.",
    variation: "Heaps of 6 and 10 instead. What should the first player do?",
    variationAnswer: "(6, 10) is itself cold: every move hands the opponent a hot position, so the first player loses under perfect play.",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "bt-066",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["games", "backward-induction"],
    minutes: 4,
    title: "Last match loses",
    prompt: String.raw`Fifteen matches lie on a table. Two players alternate, each turn removing 1, 2 or 3 matches. The player forced to take the last match *loses*. With perfect play on both sides, what is the first player's correct first move?`,
    answer: {
      type: "choice",
      options: [
        "Take 1 match",
        "Take 2 matches",
        "Take 3 matches",
        "It does not matter: the second player wins",
      ],
      correct: 1,
    },
    hints: [
      "Which small pile is a loss for the player about to move? With one match left you must take it and lose.",
      "From 2, 3 or 4 matches you can leave exactly 1 for the opponent. From 5 every move leaves 2, 3 or 4, which are wins for the opponent.",
      "The losing piles are 1, 5, 9, 13, ... Find the move from 15 that lands on one of them.",
    ],
    solution: String.raw`Label a pile size L if the player to move from it loses under perfect play. Size 1 is L: the only move takes the last match. Sizes 2, 3, 4 are W: remove 1, 2 or 3 to leave exactly 1 for the opponent. Size 5 is L: every move leaves 2, 3 or 4, all W for the opponent. In general size $n$ is L exactly when $n \equiv 1 \pmod 4$, because from such a size any move leaves a remainder of 0, 2 or 3, and from those the opponent can return to remainder 1.

From 15, which has remainder 3, take 2 matches to leave 13 $(\equiv 1)$. Taking 1 leaves 14 and taking 3 leaves 12, both winning for the opponent (who would reply to 13 and 9 respectively). So the unique correct move is to take 2, option 2.

The contrast with the "last match wins" version is a shift by one: there the losing piles are multiples of 4 and the opening move from 15 would be to take 3. Mixing the two up is the classic error.`,
    steps: [
      "Identify size 1 as a loss for the mover under the misere rule.",
      "Deduce sizes 2-4 are wins and 5 is a loss; the losing sizes are 1 mod 4.",
      "From 15 (3 mod 4) take 2 to leave 13.",
    ],
    keyIdea: "In the last-match-loses version the target piles are 1 mod 4 instead of 0 mod 4.",
    commonMistake: "Playing the normal-play strategy (leave a multiple of 4) and taking 3, which leaves 12 and loses.",
    fastPath: "Leave 1 mod 4: 15 to 13, take 2.",
    variation: "Same misere rule, but a turn removes 1, 2, 3 or 4 matches. First move from 15?",
    variationAnswer: "Losing sizes are now 1 mod 5: 1, 6, 11, 16. From 15 take 4 to leave 11.",
    verifiedBy: ["exhaustive-search", "formula"],
  },

  // ---------------------------------------------------------------- induction and recursion counts
  {
    id: "bt-067",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["induction", "recursion"],
    minutes: 5,
    title: "Tiling a two-row strip with dominoes and squares",
    prompt: String.raw`A strip of squares has 2 rows and 9 columns. You tile it completely, without overlaps, using any mix of $1 \times 2$ dominoes (placed vertically or horizontally) and $2 \times 2$ square tiles. Tiles of the same shape are indistinguishable. How many different tilings are there?`,
    answer: { type: "numeric", value: 341, exact: String.raw`a_9 \text{ where } a_n = a_{n-1} + 2a_{n-2},\; a_0 = a_1 = 1;\quad a_9 = 341 = \tfrac{2^{10} - 1}{3}` },
    hints: [
      "Look at the leftmost column. Either a vertical domino covers it, or the first two columns are covered together. How many ways is 'together'?",
      String.raw`Let $a_n$ count tilings of the $2 \times n$ strip. The first column is a vertical domino ($a_{n-1}$ ways to finish) or the first two columns are two horizontal dominoes or one square ($2 a_{n-2}$ ways).`,
      String.raw`$a_n = a_{n-1} + 2a_{n-2}$ with $a_0 = 1$, $a_1 = 1$. Compute up to $a_9$.`,
    ],
    solution: String.raw`Let $a_n$ be the number of tilings of the $2 \times n$ strip. Look at how the leftmost column is covered. Case 1: a single vertical domino covers it; the rest is a $2 \times (n-1)$ strip, $a_{n-1}$ ways. Case 2: the leftmost column is covered by two horizontal dominoes stacked (one in each row), which also fill column 2; the rest is $2 \times (n-2)$, $a_{n-2}$ ways. Case 3: a $2 \times 2$ square covers columns 1 and 2; again $a_{n-2}$ ways. These cases are exhaustive and disjoint, so $a_n = a_{n-1} + 2a_{n-2}$.

Base cases: $a_0 = 1$ (the empty tiling) and $a_1 = 1$ (one vertical domino). Then $a_2 = 1 + 2 = 3$ (two verticals, two horizontals, one square), $a_3 = 3 + 2 = 5$, $a_4 = 5 + 6 = 11$, $a_5 = 11 + 10 = 21$, $a_6 = 21 + 22 = 43$, $a_7 = 43 + 42 = 85$, $a_8 = 85 + 86 = 171$, $a_9 = 171 + 170 = 341$.

A closed form exists because the characteristic equation $x^2 = x + 2$ has roots $2$ and $-1$: $a_n = \frac{2^{n+1} + (-1)^n}{3}$, and indeed $(2^{10} - 1)/3 = 1023/3 = 341$. Answer: 341 tilings.`,
    steps: [
      "Condition on how the first column is covered.",
      "Count the two-column coverings: two horizontal dominoes or one square.",
      "Write a_n = a_{n-1} + 2 a_{n-2} with a_0 = a_1 = 1.",
      "Iterate to a_9 = 341.",
    ],
    keyIdea: "Condition on the first column; each way to clear one or two columns multiplies the count for the remaining strip.",
    commonMistake: "Forgetting the square tile and getting Fibonacci (55), or counting the two stacked horizontal dominoes and the square as the same case.",
    fastPath: String.raw`$a_n = (2^{n+1} + (-1)^n)/3$; for $n = 9$: $(1024 - 1)/3 = 341$.`,
    variation: "Same strip, dominoes only (no squares). How many tilings?",
    variationAnswer: String.raw`Fibonacci: $a_n = a_{n-1} + a_{n-2}$ with $a_0 = a_1 = 1$ gives $a_9 = 55$.`,
    family: "induction",
    verifiedBy: ["dp", "exhaustive-search"],
  },
  {
    id: "bt-068",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["induction", "recursion"],
    minutes: 5,
    title: "Nine days without a triple loss",
    prompt: String.raw`A desk records each of 9 trading days as a win (W) or a loss (L). How many of the $2^9$ possible 9-day records contain no run of three consecutive losses? (Two consecutive losses are allowed.)`,
    answer: { type: "numeric", value: 274, exact: String.raw`t_9 \text{ with } t_n = t_{n-1} + t_{n-2} + t_{n-3},\; t_0 = 1, t_1 = 2, t_2 = 4;\quad t_9 = 274` },
    hints: [
      "Classify a valid record by how it ends: with a W, with exactly one L (WL), or with exactly two L's (WLL).",
      String.raw`Let $t_n$ count valid records of length $n$. Removing the final block W, WL or WLL leaves a valid shorter record: $t_n = t_{n-1} + t_{n-2} + t_{n-3}$.`,
      String.raw`With $t_0 = 1$, $t_1 = 2$, $t_2 = 4$ the sequence runs $7, 13, 24, 44, 81, 149, 274$.`,
    ],
    solution: String.raw`Let $t_n$ be the number of W/L strings of length $n$ with no three consecutive L's. Classify by the ending. If the string ends in W, the first $n-1$ characters form any valid string: $t_{n-1}$ choices. If it ends in exactly one L, the character before is W (or the string is just "L"), and the first $n-2$ characters are any valid string: $t_{n-2}$. If it ends in exactly two L's, the character before them is W and the first $n-3$ characters are valid: $t_{n-3}$. Three L's at the end are forbidden. So $t_n = t_{n-1} + t_{n-2} + t_{n-3}$.

Base cases: $t_0 = 1$ (empty string), $t_1 = 2$ (W or L), $t_2 = 4$ (all four strings are fine). Then $t_3 = 4 + 2 + 1 = 7$ (all 8 except LLL), $t_4 = 7 + 4 + 2 = 13$, $t_5 = 13 + 7 + 4 = 24$, $t_6 = 24 + 13 + 7 = 44$, $t_7 = 44 + 24 + 13 = 81$, $t_8 = 81 + 44 + 24 = 149$, $t_9 = 149 + 81 + 44 = 274$.

So $274$ of the $512$ records avoid a triple loss, a little over half. The complement, 238 records, contain at least one LLL. Answer: 274.`,
    steps: [
      "Condition on the number of L's at the end: 0, 1 or 2.",
      "Write the tribonacci recursion t_n = t_{n-1} + t_{n-2} + t_{n-3}.",
      "Set t_0 = 1, t_1 = 2, t_2 = 4 and iterate to t_9.",
    ],
    keyIdea: "Avoiding a run of length k gives a k-term recursion by conditioning on the length of the final run.",
    commonMistake: String.raw`Using the no-two-consecutive recursion (Fibonacci, giving 89), or trying inclusion-exclusion over the positions of LLL blocks and losing track of overlaps.`,
    fastPath: "Tribonacci starting 1, 2, 4: 7, 13, 24, 44, 81, 149, 274.",
    variation: "How many 9-day records contain no run of three consecutive days of the same result (neither WWW nor LLL)?",
    variationAnswer: String.raw`Runs of length at most 2 in both letters: $u_n = u_{n-1} + u_{n-2}$ with $u_1 = 2$, $u_2 = 4$, so $u_9 = 110$.`,
    verifiedBy: ["enumeration", "dp"],
  },
  {
    id: "bt-069",
    module: 9,
    kind: "brainteaser",
    difficulty: 4,
    tags: ["induction", "combinations"],
    minutes: 8,
    title: "Chords slicing a disc",
    prompt: String.raw`Seven points are marked on a circle and every pair of them is joined by a straight chord, giving 21 chords. The points are placed so that no three chords pass through a common interior point. Into how many regions do the chords divide the interior of the disc?`,
    answer: { type: "numeric", value: 57, exact: String.raw`1 + \binom{7}{2} + \binom{7}{4} = 1 + 21 + 35 = 57`, unit: "regions" },
    hints: [
      "Add the chords one at a time. A new chord that crosses k existing chords is cut into k + 1 pieces, and each piece splits one region into two.",
      "So the final count is 1 + (number of chords) + (number of interior crossing points). Count the crossings.",
      String.raw`Two chords cross inside the circle exactly when their four endpoints are distinct and alternate around the circle: every 4-subset of the points gives exactly one crossing. So crossings $= \binom{7}{4}$.`,
    ],
    solution: String.raw`Start with the empty disc, 1 region, and draw the chords one by one. When a new chord is drawn and it crosses $k$ chords already present, the crossings cut it into $k + 1$ segments, and each segment splits an existing region into two. So the chord adds $k + 1$ regions. Summing over all chords, the total is $1 + (\text{number of chords}) + (\text{total number of crossings})$, because each crossing is counted once, when the second of its two chords is drawn.

Count crossings. Two chords with a shared endpoint do not cross inside the disc. Two chords with four distinct endpoints cross exactly when the endpoints alternate around the circle, and for any 4 points on a circle exactly one of the three ways to pair them up gives crossing chords. So the number of interior crossings equals the number of 4-subsets of the 7 points, $\binom{7}{4} = 35$, and the "no three chords concurrent" condition guarantees these 35 points are distinct.

Regions $= 1 + \binom{7}{2} + \binom{7}{4} = 1 + 21 + 35 = 57$.

A cross-check by Euler's formula: the planar graph has $V = 7 + 35 = 42$ vertices, and the edges are the 7 arcs plus the chord segments; each crossing adds 2 segments, so $E = 7 + 21 + 2 \cdot 35 = 98$. Faces including the outside: $F = E - V + 2 = 58$, and inside the disc $58 - 1 = 57$. Answer: 57.`,
    steps: [
      "Add chords one at a time; a chord crossing k others adds k + 1 regions.",
      "Total = 1 + chords + crossings.",
      "Each 4-subset of points gives exactly one crossing: C(7,4) = 35.",
      "Compute 1 + 21 + 35 = 57 and cross-check with Euler.",
    ],
    keyIdea: "Regions = 1 + edges added + crossings, and crossings are counted by 4-subsets of the boundary points.",
    commonMistake: String.raw`Using the line-arrangement formula $\binom{n}{2} + n + 1$ for 21 lines, or guessing powers of two (the sequence 1, 2, 4, 8, 16, 31, 57 famously breaks).`,
    fastPath: String.raw`$1 + \binom{7}{2} + \binom{7}{4} = 1 + 21 + 35 = 57$.`,
    variation: "Eight points on the circle instead of seven, same conditions. How many regions?",
    variationAnswer: String.raw`$1 + \binom{8}{2} + \binom{8}{4} = 1 + 28 + 70 = 99$.`,
    verifiedBy: ["formula", "enumeration"],
  },
  {
    id: "bt-070",
    module: 9,
    kind: "brainteaser",
    difficulty: 4,
    tags: ["induction", "recursion", "search-strategy"],
    minutes: 9,
    title: "Clockwise-only disc transfer",
    prompt: String.raw`Three posts stand at the corners of a triangle, labelled A, B, C going clockwise. Four discs of different sizes sit on post A, largest at the bottom. A move takes the top disc of one post and places it on the next post *clockwise* (A to B, B to C, or C to A; anticlockwise moves are forbidden), and a disc may never be placed on a smaller disc. What is the minimum number of moves to transfer all four discs to post B?`,
    answer: { type: "numeric", value: 43, exact: String.raw`a_4 \text{ with } a_n = 2b_{n-1} + 1,\; b_n = 2b_{n-1} + a_{n-1} + 2,\; a_1 = 1, b_1 = 2;\quad a_4 = 43`, unit: "moves" },
    hints: [
      "Two kinds of task recur: moving a stack one post clockwise (call the cost a_n) and moving it two posts clockwise (b_n). Each needs the other.",
      String.raw`To move $n$ discs one post clockwise, first move the top $n-1$ two posts clockwise (out of the way), move the big disc, then bring the $n-1$ discs two posts clockwise onto it: $a_n = 2 b_{n-1} + 1$.`,
      String.raw`For two posts clockwise: top $n-1$ go two posts, big disc goes one, top $n-1$ go one post (back onto the start), big disc goes one more, top $n-1$ go two posts: $b_n = 2b_{n-1} + a_{n-1} + 2$. Start from $a_1 = 1$, $b_1 = 2$.`,
    ],
    solution: String.raw`Let $a_n$ be the minimum number of moves to carry a stack of $n$ discs one post clockwise, and $b_n$ to carry it two posts clockwise (equivalently one post anticlockwise, which is where we would like to go but cannot directly). Discs smaller than the largest can move freely over it, so the usual Hanoi logic applies with the direction constraint.

One post clockwise, from A to B. The largest disc must move A to B at some moment; just before, the other $n-1$ discs must all be on C (not on B, which must be free, and not on A, where they would be on top of it). Getting them from A to C is two posts clockwise: $b_{n-1}$ moves. Then the big disc moves (1 move). Then the $n-1$ discs must go from C to B, which is again two posts clockwise: $b_{n-1}$. So $a_n = 2 b_{n-1} + 1$.

Two posts clockwise, from A to C. The big disc needs two moves, A to B and then B to C. Before the first, the $n-1$ smaller discs must be on C ($b_{n-1}$ moves). After the big disc lands on B, the small discs must vacate C and cannot sit on B, so they go to A, one post clockwise ($a_{n-1}$). The big disc then moves B to C. Finally the small discs go A to C, two posts clockwise ($b_{n-1}$). So $b_n = 2 b_{n-1} + a_{n-1} + 2$. In each decomposition the largest disc moves the fewest times it possibly can (once, or twice) and every other phase is itself a shortest transfer, so the recursion gives the minimum; the search below confirms that moving the big disc extra times never pays.

Base cases $a_1 = 1$, $b_1 = 2$. Then $a_2 = 2 \cdot 2 + 1 = 5$, $b_2 = 2 \cdot 2 + 1 + 2 = 7$; $a_3 = 2 \cdot 7 + 1 = 15$, $b_3 = 2 \cdot 7 + 5 + 2 = 21$; $a_4 = 2 \cdot 21 + 1 = 43$, $b_4 = 2 \cdot 21 + 15 + 2 = 59$. Moving four discs from A to B takes 43 moves. (A breadth-first search over the $3^4 = 81$ configurations confirms it.)`,
    steps: [
      "Define a_n (one post clockwise) and b_n (two posts clockwise).",
      "Derive a_n = 2 b_{n-1} + 1 by isolating the largest disc.",
      "Derive b_n = 2 b_{n-1} + a_{n-1} + 2 from the big disc's two hops.",
      "Iterate from a_1 = 1, b_1 = 2 to a_4 = 43.",
    ],
    keyIdea: "With a one-way rule the recursion needs two interlocking quantities: the cost of a short hop and the cost of a long hop.",
    commonMistake: String.raw`Using the ordinary Hanoi answer $2^4 - 1 = 15$, which uses anticlockwise moves, or using a single recursion $a_n = 3a_{n-1} + 1$ (that is the adjacent-moves-only variant).`,
    fastPath: "Pairs (a, b): (1, 2), (5, 7), (15, 21), (43, 59). One post clockwise with four discs: 43.",
    variation: "Same rules, but the target is post C (two posts clockwise). Minimum moves for four discs?",
    variationAnswer: String.raw`$b_4 = 59$.`,
    family: "induction",
    verifiedBy: ["exhaustive-search", "recursion"],
  },
  {
    id: "bt-071",
    module: 9,
    kind: "brainteaser",
    difficulty: 2,
    tags: ["induction", "recursion"],
    minutes: 3,
    title: "Cat on the shelves",
    prompt: String.raw`A cat climbs a set of 7 shelves, starting on the floor. Each leap takes it up exactly 1, 2 or 3 shelves, and it must finish exactly on shelf 7 (never above). Two climbs are different if their sequences of leap sizes differ. How many different climbs are there?`,
    answer: { type: "numeric", value: 44, exact: String.raw`c_7 \text{ with } c_n = c_{n-1} + c_{n-2} + c_{n-3},\; c_0 = 1, c_1 = 1, c_2 = 2;\quad c_7 = 44`, unit: "climbs" },
    hints: [
      "Condition on the size of the last leap: it landed on 7 from shelf 6, 5 or 4.",
      String.raw`If $c_n$ counts climbs to shelf $n$, then $c_n = c_{n-1} + c_{n-2} + c_{n-3}$.`,
      String.raw`$c_0 = 1$ (do nothing), $c_1 = 1$, $c_2 = 2$; then $4, 7, 13, 24, 44$.`,
    ],
    solution: String.raw`Let $c_n$ be the number of climbs that end exactly on shelf $n$. The final leap of such a climb has size 1, 2 or 3, so it started from shelf $n-1$, $n-2$ or $n-3$, and the part before it is a climb to that shelf. The three cases are disjoint, so
$$c_n = c_{n-1} + c_{n-2} + c_{n-3}.$$

Base cases: $c_0 = 1$ (the empty climb), $c_1 = 1$ (a single 1-leap), $c_2 = 2$ (1+1 or 2). Then $c_3 = 2 + 1 + 1 = 4$, $c_4 = 4 + 2 + 1 = 7$, $c_5 = 7 + 4 + 2 = 13$, $c_6 = 13 + 7 + 4 = 24$, $c_7 = 24 + 13 + 7 = 44$.

As a check, count by number of leaps: 7 ones (1 way); five 1s and one 2 ($6$ orders); four 1s and one 3 ($5$); three 1s and two 2s ($\binom{5}{2} = 10$); two 1s, one 2, one 3 ($4!/2! = 12$); one 1 and three 2s ($4$); one 1 and two 3s ($3$); two 2s and one 3 ($3$). Total $1 + 6 + 5 + 10 + 12 + 4 + 3 + 3 = 44$. Answer: 44 climbs.`,
    steps: [
      "Condition on the size of the last leap.",
      "Write c_n = c_{n-1} + c_{n-2} + c_{n-3} with c_0 = 1, c_1 = 1, c_2 = 2.",
      "Iterate to c_7 = 44 (or count compositions directly).",
    ],
    keyIdea: "Compositions with parts 1, 2, 3 satisfy a tribonacci recursion.",
    commonMistake: "Setting c_0 = 0 (which drops the single 3-leap case) or using only leaps of 1 and 2 and answering 21.",
    fastPath: "Tribonacci 1, 1, 2, 4, 7, 13, 24, 44.",
    variation: "The cat may leap 1, 2 or 3 shelves but never two 3-leaps in a row. How many climbs to shelf 7?",
    variationAnswer: String.raw`Only two compositions of 7 contain two adjacent 3-leaps (3+3+1 and 1+3+3; 3+1+3 is fine), so the count is $44 - 2 = 42$.`,
    verifiedBy: ["dp", "enumeration"],
  },
  {
    id: "bt-072",
    module: 9,
    kind: "brainteaser",
    difficulty: 5,
    tags: ["induction", "recursion"],
    minutes: 10,
    title: "Dominoes on a three-row board",
    prompt: String.raw`How many ways are there to tile a $3 \times 8$ board (3 rows, 8 columns) completely with twelve $1 \times 2$ dominoes, each placed horizontally or vertically? Tilings that differ in the position or orientation of any domino are different.`,
    answer: { type: "numeric", value: 153, exact: String.raw`f_8 \text{ with } f_n = 4 f_{n-2} - f_{n-4},\; f_0 = 1, f_2 = 3, f_4 = 11, f_6 = 41;\quad f_8 = 153`, unit: "tilings" },
    hints: [
      "The board has an odd number of rows, so the leftmost column cannot be covered by vertical dominoes alone: at least one horizontal domino sticks into column 2.",
      String.raw`Let $f_n$ count full tilings of $3 \times n$, and $g_n$ count tilings of $3 \times n$ with one corner square (say top-left) missing. Classify the leftmost column: one vertical domino plus one horizontal pair in the two rows that are left, or three horizontals.`,
      String.raw`The relations are $f_n = f_{n-2} + 2 g_{n-1}$ and $g_n = f_{n-1} + g_{n-2}$ with $f_0 = 1$, $g_1 = 1$. Compute to $n = 8$.`,
    ],
    solution: String.raw`Because 3 is odd, a vertical domino can cover at most two of the three squares in the leftmost column, so the column always contains at least one horizontal domino. Let $f_n$ be the number of tilings of the full $3 \times n$ board and $g_n$ the number of tilings of a $3 \times n$ board with its top-left square removed (by symmetry the same count applies with the bottom-left square removed). Note $f_n = 0$ for odd $n$ because the area would be odd, and $g_n = 0$ for even $n$ for the same reason.

Leftmost column of a full board. Case 1: all three squares are covered by horizontal dominoes, which also fill column 2; the rest is $3 \times (n-2)$: $f_{n-2}$ ways. Case 2: a vertical domino covers rows 1-2 and a horizontal domino covers row 3 (sticking into column 2); what remains is a $3 \times (n-1)$ board missing its bottom-left square: $g_{n-1}$ ways. Case 3: the mirror image, vertical on rows 2-3 and horizontal on row 1: $g_{n-1}$ ways. A vertical domino on rows 1-3 is impossible. So $f_n = f_{n-2} + 2 g_{n-1}$.

Board missing its top-left square. The two remaining squares in column 1 are rows 2 and 3. Case 1: a vertical domino covers them; the rest is a full $3 \times (n-1)$ board: $f_{n-1}$. Case 2: two horizontal dominoes cover rows 2 and 3 across columns 1-2; then the top square of column 2 remains, with a board of width $n-2$ beyond, and that square can only be covered by a horizontal domino into column 3, leaving a $3 \times (n-2)$ board missing its top-left square: $g_{n-2}$. So $g_n = f_{n-1} + g_{n-2}$.

Base cases: $f_0 = 1$ (empty), $g_1 = 1$ (one vertical domino on rows 2-3). Then $f_2 = f_0 + 2 g_1 = 3$; $g_3 = f_2 + g_1 = 4$; $f_4 = f_2 + 2 g_3 = 11$; $g_5 = f_4 + g_3 = 15$; $f_6 = f_4 + 2 g_5 = 41$; $g_7 = f_6 + g_5 = 56$; $f_8 = f_6 + 2 g_7 = 41 + 112 = 153$. Eliminating $g$ gives the single recursion $f_n = 4 f_{n-2} - f_{n-4}$: $3, 11, 41, 153$. Answer: 153 tilings.`,
    steps: [
      "Note odd height forces a horizontal domino in the first column and set up f_n (full) and g_n (one corner missing).",
      "Derive f_n = f_{n-2} + 2 g_{n-1} by cases on the first column.",
      "Derive g_n = f_{n-1} + g_{n-2}.",
      "Iterate from f_0 = 1, g_1 = 1 to f_8 = 153.",
    ],
    keyIdea: "Tilings of a narrow board need an auxiliary count for the 'ragged' boundary shape; two mutual recursions close the system.",
    commonMistake: "Treating columns as independent (3 ways per pair of columns gives 81), or forgetting the mirror case which halves the g-contribution.",
    fastPath: String.raw`$3 \times 2n$ tilings: 3, 11, 41, 153, each $4 \times$ previous minus the one before.`,
    variation: "How many domino tilings does a 3 x 10 board have?",
    variationAnswer: String.raw`$f_{10} = 4 \cdot 153 - 41 = 571$.`,
    verifiedBy: ["exhaustive-search", "dp"],
  },

  // ---------------------------------------------------------------- logic deductions
  {
    id: "bt-073",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["logic"],
    minutes: 5,
    title: "Finishing order of five runners",
    prompt: String.raw`Five runners, Ana, Ben, Cho, Dev and Eli, finished a race in five distinct positions, 1st to 5th. You are told: (1) Ben finished exactly two places behind Ana. (2) Eli finished neither first nor last. (3) Dev finished immediately behind Eli. (4) Cho finished ahead of Dev. In which position did Cho finish? (Give the position number.)`,
    answer: { type: "numeric", value: 2, exact: "2", unit: "position" },
    hints: [
      "Clue 3 makes Eli and Dev an adjacent block (Eli, Dev). With clue 2, where can that block sit?",
      "Eli is in position 2, 3 or 4, so the block (Eli, Dev) occupies positions 2-3, 3-4 or 4-5. Ana and Ben need two positions exactly two apart.",
      "Try each block placement. Only one leaves room for Ana, Ben two apart with Cho ahead of Dev.",
    ],
    solution: String.raw`Clue 3 says Eli and Dev occupy consecutive positions in the order (Eli, Dev). Clue 2 restricts Eli to positions 2, 3 or 4, so the block occupies positions 2-3, 3-4 or 4-5.

Block in 2-3 (Eli 2nd, Dev 3rd). Remaining positions 1, 4, 5 for Ana, Ben, Cho. Clue 1 needs Ana and Ben two apart: the only such pair among 1, 4, 5 is none (1 and 4 differ by 3, 4 and 5 by 1, 1 and 5 by 4). Impossible.

Block in 3-4 (Eli 3rd, Dev 4th). Remaining positions 1, 2, 5. Two apart: none (differences 1, 3, 4). Impossible.

Block in 4-5 (Eli 4th, Dev 5th). Remaining positions 1, 2, 3. Two apart: 1 and 3, so Ana is 1st and Ben is 3rd (Ben is behind Ana), and Cho takes 2nd. Clue 4 requires Cho ahead of Dev: 2nd ahead of 5th, satisfied.

The unique order is Ana, Cho, Ben, Eli, Dev. Cho finished 2nd.`,
    steps: [
      "Turn clue 3 into a fixed block (Eli, Dev) and clue 2 into its possible positions.",
      "For each block placement, test whether Ana and Ben can be exactly two apart.",
      "Only the block at 4-5 works; place Ana 1st, Ben 3rd, Cho 2nd.",
      "Check clue 4 and read off Cho's position.",
    ],
    keyIdea: "Start from the most rigid clue (an adjacent block), enumerate its placements, and let the spacing clue eliminate cases.",
    commonMistake: "Reading 'two places behind' as 'two places later in the list including the next' (i.e. adjacent), or forgetting clue 2 and allowing Eli 1st.",
    fastPath: "Block (Eli, Dev) at 4-5 is the only placement leaving a gap of two for Ana and Ben; Cho fills 2nd.",
    variation: "Drop clue 4 (Cho ahead of Dev). How many finishing orders are consistent with clues 1-3?",
    variationAnswer: "Still only the block at 4-5 works, with Ana 1st, Ben 3rd and Cho forced into 2nd: exactly 1 order, so clue 4 was redundant.",
    verifiedBy: ["exhaustive-search"],
  },
  {
    id: "bt-074",
    module: 9,
    kind: "brainteaser",
    difficulty: 4,
    tags: ["logic"],
    minutes: 6,
    title: "Four meetings, four days",
    prompt: String.raw`Four meetings, Risk, Audit, Hiring and Budget, are scheduled on Monday, Tuesday, Wednesday and Thursday, one meeting per day. You know: (1) Audit is later in the week than Risk. (2) Hiring and Budget are on consecutive days (in either order). (3) Risk is not on Monday. (4) Budget is not on Thursday. Which meeting is on Wednesday?`,
    answer: {
      type: "choice",
      options: ["Risk", "Audit", "Hiring", "Budget", "It cannot be determined from the clues"],
      correct: 0,
    },
    hints: [
      "Clue 2 makes Hiring and Budget a block of two consecutive days: Mon-Tue, Tue-Wed or Wed-Thu.",
      "Risk and Audit take the other two days with Risk first (clue 1) and Risk not Monday (clue 3). Which block placements leave that possible?",
      "Only the Mon-Tue block works, so Risk is Wednesday and Audit Thursday. The order of Hiring and Budget stays open, but the question does not need it.",
    ],
    solution: String.raw`Clue 2 says Hiring and Budget occupy two consecutive days, so the pair sits on Mon-Tue, Tue-Wed or Wed-Thu, and Risk and Audit take the two remaining days, with Risk earlier than Audit (clue 1).

Block on Tue-Wed: Risk and Audit take Monday and Thursday, so Risk is Monday, contradicting clue 3. Block on Wed-Thu: Risk and Audit take Monday and Tuesday, so Risk is Monday again, contradiction. Block on Mon-Tue: Risk and Audit take Wednesday and Thursday with Risk first, so Risk is Wednesday and Audit is Thursday. Clue 3 holds, and clue 4 holds because Budget is on Monday or Tuesday, not Thursday.

So Wednesday is Risk, option 1. Note that the full schedule is *not* determined: Hiring and Budget can be Mon/Tue or Tue/Mon, both consistent with every clue. A candidate who insists on finding the unique schedule may wrongly pick "cannot be determined"; the question asks only about Wednesday, and that is pinned down.`,
    steps: [
      "Make Hiring-Budget a consecutive block and list its three placements.",
      "For each placement, put Risk before Audit on the remaining days and check Risk is not Monday.",
      "Only Mon-Tue works: Risk is Wednesday, Audit Thursday.",
      "Notice the Hiring/Budget order remains open but is irrelevant.",
    ],
    keyIdea: "A question can have a determined answer even when the full configuration is not unique; answer what is asked.",
    commonMistake: "Choosing 'cannot be determined' because two schedules survive, without noticing both put Risk on Wednesday.",
    fastPath: "Risk not Monday and Risk before Audit forces the Hiring-Budget block onto Mon-Tue; Risk lands on Wednesday.",
    variation: "Add the clue: Hiring is the day after Budget. What is the full schedule?",
    variationAnswer: "Budget Monday, Hiring Tuesday, Risk Wednesday, Audit Thursday.",
    verifiedBy: ["exhaustive-search"],
  },
  {
    id: "bt-075",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["number-puzzle", "logic"],
    minutes: 4,
    title: "The three-digit locker code",
    prompt: String.raw`A locker code is a three-digit number from 100 to 999. Its three digits are all different and add up to 17. The hundreds digit is exactly 3 more than the units digit. The code is divisible by 4. What is the code?`,
    answer: { type: "numeric", value: 764, exact: "764" },
    hints: [
      "Write the digits as h, t, u. Use h = u + 3 and h + t + u = 17 to express t in terms of u.",
      "t = 14 - 2u must be a digit from 0 to 9, which restricts u to 3, 4, 5, 6 (with h = u + 3 at most 9).",
      "Divisibility by 4 depends on the last two digits tu. Test the four candidates and discard any with a repeated digit.",
    ],
    solution: String.raw`Let the code be $100h + 10t + u$ with digits $h, t, u$. From $h = u + 3$ and $h + t + u = 17$ we get $(u + 3) + t + u = 17$, so $t = 14 - 2u$.

For $t$ to be a digit we need $0 \le 14 - 2u \le 9$, so $2.5 \le u \le 7$, and for $h = u + 3 \le 9$ we need $u \le 6$. So $u \in \{3, 4, 5, 6\}$, giving candidates $(h, t, u) = (6, 8, 3) \to 683$, $(7, 6, 4) \to 764$, $(8, 4, 5) \to 845$, $(9, 2, 6) \to 926$. All four have distinct digits and digit sum 17.

A number is divisible by 4 exactly when its last two digits form a multiple of 4. $83$: no. $64$: yes. $45$: no. $26$: no. The only survivor is $764$. Check: digits 7, 6, 4 distinct, sum 17, $7 = 4 + 3$, and $764 = 4 \cdot 191$. The code is 764.`,
    steps: [
      "Express t from the two linear conditions: t = 14 - 2u.",
      "Bound u using the digit ranges for t and h: u in 3..6.",
      "List the four candidates and apply the divisibility-by-4 test on the last two digits.",
    ],
    keyIdea: "Two linear digit conditions leave a one-parameter family; the divisibility rule picks the member.",
    commonMistake: "Testing divisibility by 4 on the whole number instead of the last two digits and slipping, or forgetting the bound h <= 9 and admitting u = 7.",
    fastPath: "t = 14 - 2u gives 683, 764, 845, 926; only 64 is a multiple of 4.",
    variation: "Same conditions but the code is divisible by 3 instead of 4. What are the possibilities?",
    variationAnswer: "Digit sum 17 is not a multiple of 3, so no three-digit number with these digits is divisible by 3: no solution.",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "bt-076",
    module: 9,
    kind: "brainteaser",
    difficulty: 5,
    tags: ["logic", "sequential-updating"],
    minutes: 10,
    title: "The shelf number from two half-secrets",
    prompt: String.raw`A parcel sits in one of these thirteen slots, each named by a warehouse letter and a shelf digit:

K2, K5, K8, M1, M5, M7, R3, R8, T1, T3, T6, W2, W3.

Lena is told only the warehouse letter of the true slot; Omar is told only the shelf digit. Both know the full list above and both reason perfectly and speak truthfully. They then say, in order:

Lena: "I can't place the parcel yet, and I can tell that Omar can't either."
Omar: "Before you spoke I couldn't place it; now I can."
Lena: "In that case, so can I."

What is the shelf digit of the parcel's slot?`,
    answer: { type: "numeric", value: 5, exact: String.raw`5 \;(\text{slot K5})` },
    hints: [
      "Omar could only 'know' immediately if his digit appeared exactly once in the list. Which digits appear once, and which letters contain such a digit?",
      "Lena's certainty that Omar does not know means her letter contains no unique digit. That rules out the letters with a 6 or a 7. Omar hears this and discards those letters.",
      "Omar now knows, so among the surviving slots his digit appears exactly once. Then Lena knows, so among the slots Omar could have meant, her letter appears exactly once.",
    ],
    solution: String.raw`Count the digits: 1 appears in M1, T1; 2 in K2, W2; 3 in R3, T3, W3; 5 in K5, M5; 6 only in T6; 7 only in M7; 8 in K8, R8. So Omar would know the slot immediately only if his digit were 6 or 7.

Lena's statement. "I don't know" means her letter has at least two slots, true for every letter here. "I am sure Omar doesn't know" means that *every* slot with her letter has a digit that is not unique. Letter M contains M7 (digit 7 is unique) and letter T contains T6 (digit 6 is unique), so Lena's letter is not M and not T. Everyone now knows the letter is K, R or W, and the live slots are K2, K5, K8, R3, R8, W2, W3.

Omar's statement. He did not know before, so his digit is not 6 or 7 (consistent). He knows now, so among the live slots his digit appears exactly once. Digit 2: K2 and W2, twice, no. Digit 5: K5 only, yes. Digit 8: K8 and R8, no. Digit 3: R3 and W3, no. So Omar's digit is 5 and the slot is K5. From the outside we already see the answer, but we must check Lena's final statement is consistent.

Lena's second statement. Lena knows her letter. She reasons as above and finds that the only slot Omar could identify is K5, whose letter is K. If Lena's letter were K she now knows the slot. If her letter were R or W, the slots she could still be holding (R3, R8 or W2, W3) are ones Omar could not have identified, which would contradict Omar's truthful statement, so her letter must be K. Her statement "now I know" is consistent, and the parcel is in K5. The shelf digit is 5.`,
    steps: [
      "Find the digits that occur once (6 and 7) and the letters that contain them (T and M).",
      "Use Lena's certainty to eliminate letters M and T.",
      "Among the remaining slots, find the digit that now occurs once: 5 (slot K5).",
      "Confirm Lena's final statement is consistent with letter K.",
    ],
    keyIdea: "Each statement is a filter on the list of possibilities; apply them in order, using what the speaker knows and what they can infer the other knows.",
    commonMistake: "Eliminating only the two slots T6 and M7 instead of the whole letters T and M, which leaves extra candidates and breaks the deduction.",
    fastPath: "Unique digits 6, 7 kill letters T, M. Among K, R, W the only once-occurring digit is 5. Slot K5.",
    variation: "Suppose W3 is removed from the list and everything else is unchanged. What changes?",
    variationAnswer: "The answer changes to R3 (digit 3). Letter W now has the single slot W2, so Lena's 'I can't place it' also rules out W, and her certainty about Omar rules out M and T as before; the live slots are K2, K5, K8, R3, R8. Among these the digits 2, 5 and 3 each occur once, so Omar's statement leaves K2, K5 and R3. Lena then knows only if her letter is R (letter K would leave her torn between K2 and K5), so the parcel is in R3.",
    verifiedBy: ["exhaustive-search"],
  },

  // ---------------------------------------------------------------- probability traps
  {
    id: "bt-077",
    module: 9,
    kind: "brainteaser",
    difficulty: 5,
    tags: ["conditional", "expectation", "logic"],
    minutes: 8,
    title: "Only even faces before the six",
    prompt: String.raw`A fair six-sided die is rolled repeatedly until the first 6 appears, and the total number of rolls (including the final 6) is recorded. You learn that every roll before the 6 showed an even number (a 2 or a 4). Given this information, what is the expected total number of rolls?`,
    answer: { type: "numeric", value: 3 / 2, exact: String.raw`\tfrac{3}{2}`, unit: "rolls" },
    hints: [
      "The naive answer 3 (the mean of a geometric wait with p = 1/3 or 1/6) ignores how harshly the condition punishes long sequences.",
      "Compute the joint probability that the game lasts exactly n rolls and all the first n - 1 rolls are 2 or 4. Then normalise.",
      String.raw`$P(N = n \text{ and all even before}) = (2/6)^{n-1} (1/6)$. The conditional distribution of $N$ is geometric with success probability $2/3$.`,
    ],
    solution: String.raw`Let $N$ be the total number of rolls and $E$ the event that every roll before the first 6 is a 2 or a 4. The trap is to think of $E$ as "we only ever see even numbers" and reinterpret the die as a three-sided die with faces 2, 4, 6, which would give $E[N] = 3$. That is wrong because the event $E$ is more likely for short games: a long run of rolls has many chances to show a 1, 3 or 5 and be excluded.

Compute the joint probabilities. $N = n$ with all earlier rolls even requires the first $n-1$ rolls to be in $\{2, 4\}$ (probability $(2/6)^{n-1}$) and the $n$th roll to be a 6 (probability $1/6$): $P(N = n, E) = (1/3)^{n-1} \cdot (1/6)$. Summing over $n \ge 1$, $P(E) = \frac{1/6}{1 - 1/3} = \frac{1}{4}$.

The conditional distribution is $P(N = n \mid E) = \frac{(1/3)^{n-1}/6}{1/4} = \frac{2}{3}\left(\frac{1}{3}\right)^{n-1}$, which is geometric with success probability $2/3$. Its mean is $\frac{1}{2/3} = \frac{3}{2}$.

Why $2/3$ and not $1/3$? Each roll either ends the game (a 6, weight $1/6$), continues it legally (a 2 or 4, weight $2/6$), or destroys the whole sequence (an odd face, weight $3/6$). Conditioning on $E$ throws away the destroyed sequences, so the relative weight of stopping versus continuing is $1 : 2$ per step, which is a continuation ratio of $1/3$ and a stopping probability of $2/3$. The expected number of rolls is $1.5$.`,
    steps: [
      "Define N and the conditioning event E precisely (all rolls before the 6 are even).",
      "Compute P(N = n, E) = (1/3)^(n-1) (1/6) and P(E) = 1/4.",
      "Recognise the conditional law as geometric with success probability 2/3.",
      "Take its mean: 3/2.",
    ],
    keyIdea: "Conditioning on 'nothing odd appeared' favours short games, so you must normalise the joint probabilities rather than relabel the die.",
    commonMistake: "Replacing the die with a fair three-sided die of faces 2, 4, 6 and answering 3.",
    fastPath: String.raw`Joint weights $(1/3)^{n-1}$; a geometric tail with ratio $1/3$ has mean $1/(1 - 1/3) = 3/2$.`,
    variation: "You learn instead that every roll before the 6 showed a number at most 3 (a 1, 2 or 3). Expected total rolls?",
    variationAnswer: String.raw`Joint weights $(3/6)^{n-1}(1/6)$, ratio $1/2$, so the conditional mean is $1/(1 - 1/2) = 2$.`,
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "bt-078",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["games", "expectation"],
    minutes: 4,
    title: "Three side bets",
    prompt: String.raw`A dealer offers three free side bets and you may take exactly one:

Bet A: three fair coins are tossed; you receive 10 dollars if all three show the same face.
Bet B: one fair six-sided die is rolled; you receive 4 dollars if it shows a prime number.
Bet C: one card is drawn from a well-shuffled standard 52-card deck; you receive 12 dollars if it is a jack, queen or king.

Which bet has the highest expected payout?`,
    answer: {
      type: "choice",
      options: ["Bet A", "Bet B", "Bet C", "They all have the same expected payout"],
      correct: 2,
    },
    hints: [
      "Compute each probability carefully. 'All three show the same face' includes all heads and all tails.",
      String.raw`A: $2/8 = 1/4$. B: primes on a die are 2, 3, 5, so $3/6 = 1/2$. C: twelve face cards, $12/52 = 3/13$.`,
      String.raw`Expected payouts: $10 \cdot \tfrac14 = 2.5$, $4 \cdot \tfrac12 = 2$, $12 \cdot \tfrac{3}{13} \approx 2.77$.`,
    ],
    solution: String.raw`Bet A. Three fair coins have $2^3 = 8$ equally likely outcomes; two of them (HHH and TTT) have all faces the same, so the probability is $2/8 = 1/4$ and the expected payout is $10 \cdot 1/4 = 2.5$ dollars. The common slip is to count only HHH and get $1/8$.

Bet B. The primes among 1 to 6 are 2, 3 and 5 (1 is not prime), so the probability is $3/6 = 1/2$ and the expected payout is $4 \cdot 1/2 = 2$ dollars.

Bet C. A standard deck has 4 jacks, 4 queens and 4 kings, 12 face cards out of 52, probability $12/52 = 3/13$. Expected payout $12 \cdot 3/13 = 36/13 \approx 2.77$ dollars.

Ordering: C ($\approx 2.77$) beats A ($2.5$) beats B ($2$). Option 3, Bet C.`,
    steps: [
      "Count A's favourable outcomes as 2 of 8 (both all-heads and all-tails).",
      "Count B's primes as 2, 3, 5 (not 1).",
      "Count C's face cards as 12 of 52.",
      "Multiply by the payouts and compare: 2.5, 2, 36/13.",
    ],
    keyIdea: "Read each event literally before multiplying; the traps are 'same face' (two outcomes) and '1 is not prime'.",
    commonMistake: String.raw`Using $1/8$ for Bet A (forgetting all tails) or counting 1 as prime in Bet B, which flips the ranking.`,
    fastPath: String.raw`$2.5$ vs $2$ vs $36/13 \approx 2.77$. C.`,
    variation: "Bet C now pays 12 dollars only if the card is a king or a queen. Which bet is best?",
    variationAnswer: String.raw`C becomes $12 \cdot 8/52 \approx 1.85$, so Bet A at $2.5$ is best.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "bt-079",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["expectation", "recursion", "games"],
    minutes: 5,
    title: "A six doubles everything",
    prompt: String.raw`You play the following game once. Roll a fair six-sided die. If it shows 1 or 2 you pay 3 dollars and the game ends. If it shows 3, 4 or 5 you receive that many dollars and the game ends. If it shows 6 the game continues: you roll again and whatever the final outcome pays (positive or negative) is doubled; a second 6 doubles again, and so on without limit. What is the expected net amount, in dollars, that you receive from one play?`,
    answer: { type: "numeric", value: 3 / 2, exact: String.raw`\tfrac{3}{2}`, unit: "dollars" },
    hints: [
      "Let V be the expected value of the game. A 6 restarts the game with every payout doubled, so from that branch you expect 2V.",
      String.raw`$V = \tfrac{2}{6}(-3) + \tfrac{1}{6}(3 + 4 + 5) + \tfrac{1}{6}(2V)$.`,
      String.raw`$V = -1 + 2 + V/3$, so $\tfrac{2}{3} V = 1$.`,
    ],
    solution: String.raw`Let $V$ be the expected net payout of a fresh play. Condition on the first roll. With probability $2/6$ the roll is 1 or 2 and you pay 3 dollars: contribution $\frac{2}{6}(-3) = -1$. With probability $1/6$ each the roll is 3, 4 or 5 and you receive that amount: contribution $\frac{3 + 4 + 5}{6} = 2$. With probability $1/6$ the roll is 6: the game restarts from scratch, but every eventual payout is doubled, so the conditional expectation is $2V$ and the contribution is $\frac{1}{6} \cdot 2V = V/3$.

So $V = -1 + 2 + V/3$, giving $\frac{2}{3} V = 1$ and $V = \frac{3}{2}$.

Is the equation legitimate? The multiplier after $k$ sixes is $2^k$ with probability $(1/6)^k$, so the tail contributions shrink like $(2/6)^k = (1/3)^k$ and the expectation converges absolutely; there is no St. Petersburg blow-up because doubling is slower than the $1/6$ decay. Directly: $V = \sum_{k \ge 0} (1/6)^k \cdot 2^k \cdot 1 = \sum_k (1/3)^k = 3/2$, where $1$ is the expected payout of a terminating roll ($-1 + 2$). You expect to come out 1.50 dollars ahead per play.`,
    steps: [
      "Condition on the first roll and write the contributions of the three branches.",
      "Recognise the 6 branch as 2V (restart with doubled stakes).",
      "Solve V = 1 + V/3 to get 3/2.",
      "Check convergence: multiplier 2 against probability 1/6 per level.",
    ],
    keyIdea: "A restart with scaled payouts gives a linear equation in the game value: V = (terminating value) + (restart probability) x (scale) x V.",
    commonMistake: "Treating the 6 as 'roll again, nothing changes' and solving V = 1 + V/6 to get 1.2, or ignoring the losses on 1 and 2.",
    fastPath: String.raw`Terminating rolls are worth $-1 + 2 = 1$ in expectation; the doubling tail multiplies by $1/(1 - 1/3) = 3/2$.`,
    variation: "A 6 triples all payouts instead of doubling. Expected value?",
    variationAnswer: String.raw`$V = 1 + \tfrac{3}{6} V$, so $V = 2$; with a multiplier of 6 or more the expectation would diverge.`,
    verifiedBy: ["recursion", "simulation"],
  },
  {
    id: "bt-080",
    module: 9,
    kind: "brainteaser",
    difficulty: 2,
    tags: ["coins", "symmetry", "games"],
    minutes: 3,
    title: "Four flips or five",
    prompt: String.raw`Two offers, each won by getting strictly more heads than tails with a fair coin. Offer A: flip the coin 4 times. Offer B: flip the coin 5 times. Which offer gives the higher probability of winning?`,
    answer: {
      type: "choice",
      options: ["Offer A (4 flips)", "Offer B (5 flips)", "They are equally likely to win"],
      correct: 1,
    },
    hints: [
      "With an odd number of flips a tie is impossible. What does symmetry say then?",
      String.raw`Offer B: heads beats tails or tails beats heads, equally likely, so $P = 1/2$.`,
      String.raw`Offer A: subtract the tie probability $\binom{4}{2}/16 = 6/16$ from 1 and halve: $P = 5/16$.`,
    ],
    solution: String.raw`Offer B, five flips. Five is odd, so heads and tails can never tie, and by the symmetry of a fair coin "more heads" and "more tails" are equally likely. Each has probability exactly $1/2$.

Offer A, four flips. Now a 2-2 tie is possible and it is a loss. The tie has probability $\binom{4}{2}/2^4 = 6/16$. The remaining $10/16$ splits evenly between more heads and more tails by symmetry, so $P(\text{more heads}) = 5/16 = 0.3125$. Directly: $P(3 \text{ heads}) + P(4 \text{ heads}) = \frac{4 + 1}{16} = \frac{5}{16}$.

Offer B wins with probability $1/2$ versus $5/16$ for Offer A, so Offer B is better, option 2. The reading trap is "strictly more": with an even number of flips the tie is dead weight, so an extra flip helps even though it also adds a chance of more tails.`,
    steps: [
      "Note that 5 flips cannot tie, so symmetry gives exactly 1/2.",
      "For 4 flips compute the tie probability 6/16 and split the rest: 5/16.",
      "Compare 1/2 with 5/16.",
    ],
    keyIdea: "With an odd number of fair flips, 'more heads than tails' is exactly 1/2; an even number loses the tie mass.",
    commonMistake: "Assuming more flips dilute the edge or that both are 1/2 because the coin is fair.",
    fastPath: String.raw`Odd flips: exactly $1/2$. Even flips: $(1 - \text{tie})/2 = (1 - 6/16)/2 = 5/16$.`,
    variation: "Offer A becomes 6 flips, Offer B stays at 5. Which is better now?",
    variationAnswer: String.raw`Six flips: tie $\binom{6}{3}/64 = 20/64$, so $P = 22/64 = 11/32 < 1/2$. Offer B is still better.`,
    verifiedBy: ["enumeration", "formula"],
  },
];
