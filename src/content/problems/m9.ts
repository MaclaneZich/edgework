import type { Problem } from "../types";

/**
 * Module 9: Logic, brainteasers, and combinatorial puzzles.
 * 24 practice problems (d1: 3, d2: 6, d3: 8, d4: 4, d5: 3) and four lesson checks.
 * Every answer is confirmed by independent routes in content/verify/m9.ts: exhaustive
 * searches over assignments, strategies and decision trees, breadth-first searches over
 * state spaces, DP tables and closed forms.
 */
export const problems: Problem[] = [
  // ---------------------------------------------------------------- difficulty 1
  {
    id: "m9-p01",
    module: 9,
    kind: "practice",
    difficulty: 1,
    tags: ["pigeonhole", "logic"],
    minutes: 1,
    title: "Cables in a dark drawer",
    prompt: String.raw`A drawer holds a jumble of patch cables in four colours: black, grey, blue and orange, with at least five cables of each colour. The room is dark, so you cannot see a cable's colour as you pull it out. What is the smallest number of cables you must take out to be certain that at least two of them share a colour?`,
    answer: { type: "numeric", value: 5, exact: "4 + 1 = 5" },
    hints: [
      "Think of the four colours as boxes and each cable you pull as an item dropped into its colour's box.",
      "What is the largest number of cables you could pull with every colour different?",
      "Four cables can all differ, one per colour. The fifth has no new colour to take.",
    ],
    solution: String.raw`Treat the colours as four boxes. Each cable you pull goes into the box of its colour. Two cables share a colour exactly when some box holds two cables.

With four cables it is possible that every box holds one: pull one black, one grey, one blue and one orange. So four pulls do not guarantee a match, and the answer is at least 5.

With five cables and only four boxes, some box must hold at least two cables, because if every box held at most one, there would be at most four cables. That is the pigeonhole principle. So five pulls always produce two cables of the same colour, and five is the smallest number that works.

Notice that the supply ("at least five of each colour") only matters to make the four-different-colours case possible. Answer: $5$.`,
    steps: [
      "Name the holes: the four colours.",
      "Build the worst case: one cable of each colour, four pulls with no match.",
      "One more pull than the number of holes forces a match: 5.",
    ],
    keyIdea: "With more items than categories, some category holds at least two items.",
    commonMistake: "Answering 4 (the number of colours) instead of one more than it, or reasoning about probabilities when the question asks for a guarantee.",
    fastPath: "Number of colours plus one.",
    variation: "What is the smallest number of pulls that guarantees three cables of the same colour?",
    variationAnswer: String.raw`Two of each colour is the worst case: $2 \cdot 4 + 1 = 9$.`,
    family: "pigeonhole",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m9-p02",
    module: 9,
    kind: "practice",
    difficulty: 1,
    tags: ["number-puzzle", "logic"],
    minutes: 2,
    title: "Reversed order ticket",
    prompt: String.raw`A two-digit order ticket number has digits that add to 11. If the two digits are swapped, the new number is exactly 27 larger than the original. What is the original ticket number?`,
    answer: { type: "numeric", value: 47, exact: "47" },
    hints: [
      "Write the number as $10a + b$ with tens digit $a$ and units digit $b$. What is the swapped number?",
      "The swapped number minus the original is $9(b - a)$. Set that equal to 27.",
      String.raw`$b - a = 3$ and $a + b = 11$; solve the pair.`,
    ],
    solution: String.raw`Let the tens digit be $a$ and the units digit be $b$, so the ticket number is $10a + b$ and the swapped number is $10b + a$. The difference is $(10b + a) - (10a + b) = 9b - 9a = 9(b - a)$. Swapping digits always changes a two-digit number by a multiple of 9, which is why the puzzle gave 27.

Setting $9(b - a) = 27$ gives $b - a = 3$. Together with $a + b = 11$, adding the two equations gives $2b = 14$, so $b = 7$ and $a = 4$.

The original number is $47$, and the check is immediate: $74 - 47 = 27$ and $4 + 7 = 11$. Because $a$ must be at least 1 and both digits at most 9, the pair $(4, 7)$ is the only solution. Answer: $47$.`,
    steps: [
      "Write the number as 10a + b and the swap as 10b + a.",
      "Difference is 9(b - a) = 27, so b - a = 3.",
      "Combine with a + b = 11: a = 4, b = 7.",
    ],
    keyIdea: "Swapping the digits of a two-digit number changes it by 9 times the digit difference.",
    commonMistake: "Guessing pairs that sum to 11 without using the factor of 9, or reporting the swapped number 74 instead of the original.",
    fastPath: "27 over 9 is 3, so the digits differ by 3 and sum to 11: 4 and 7, and the smaller digit leads because the swap made it larger.",
    variation: "The digits add to 13 and the swapped number is 45 larger. What is the original number?",
    variationAnswer: String.raw`$b - a = 5$ and $a + b = 13$ give $a = 4$, $b = 9$: the number is $49$.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m9-p03",
    module: 9,
    kind: "practice",
    difficulty: 1,
    tags: ["search-strategy", "logic"],
    minutes: 1,
    title: "Sixteen lockers, yes or no",
    prompt: String.raw`A colleague has hidden a key in one of 16 lockers numbered 1 to 16 and will answer any yes/no question truthfully. What is the smallest number of questions that guarantees you can name the locker, whatever the answers turn out to be?`,
    answer: { type: "numeric", value: 4, exact: String.raw`\lceil \log_2 16 \rceil = 4` },
    hints: [
      "Each answer is one of two possibilities. How many different answer sequences can $k$ questions produce?",
      String.raw`You need at least as many answer sequences as lockers, so $2^k \ge 16$.`,
      "Three questions give only 8 sequences; four give 16, and halving the range each time achieves it.",
    ],
    solution: String.raw`Each question has two possible answers, so $k$ questions produce at most $2^k$ different answer sequences. Every locker must correspond to a different sequence, otherwise two lockers would be indistinguishable after all the answers. Hence $2^k \ge 16$, which forces $k \ge 4$. With three questions, $2^3 = 8 < 16$, so some two lockers would share an answer sequence.

Four questions suffice: ask "is the number at most 8?", then halve the remaining range each time (at most 4, at most 2, then the final pair). After four answers exactly one locker remains.

So the information bound is tight here because 16 is a power of two. Answer: $4$.`,
    steps: [
      "Count answer sequences: 2 to the power k.",
      "Require at least as many sequences as lockers: 2^k >= 16.",
      "Smallest k is 4; halving achieves it.",
    ],
    keyIdea: "Yes/no questions split the possibilities in two, so k questions can separate at most 2^k cases.",
    commonMistake: "Counting questions as one per locker (15 questions), or forgetting to round up when the number of items is not a power of two.",
    fastPath: "16 is two to the fourth: four questions.",
    variation: "There are 20 lockers instead. How many questions now?",
    variationAnswer: String.raw`$2^4 = 16 < 20 \le 32 = 2^5$, so five questions.`,
    verifiedBy: ["dp", "formula"],
  },

  // ---------------------------------------------------------------- difficulty 2
  {
    id: "m9-p04",
    module: 9,
    kind: "practice",
    difficulty: 2,
    tags: ["pigeonhole", "logic"],
    minutes: 3,
    title: "Badges that pair to 21",
    prompt: String.raw`A box contains 20 badges numbered 1 to 20, one of each. You draw badges blindly, without replacement. What is the smallest number of badges you must draw to be certain that two of the badges you hold have numbers adding to exactly 21?`,
    answer: { type: "numeric", value: 11, exact: "10 + 1 = 11" },
    hints: [
      "Which pairs of badge numbers add to 21? Group the 20 numbers by those pairs.",
      "Each pair is a hole with two badges in it. How many badges can you hold with no complete pair?",
      "Ten badges can be one from each of the ten pairs. The eleventh completes a pair.",
    ],
    solution: String.raw`The pairs that add to 21 are $\{1, 20\}, \{2, 19\}, \dots, \{10, 11\}$: ten pairs that partition the badges 1 to 20. These pairs are the holes.

Ten badges need not contain a pair: take one badge from each hole, for instance badges 1 to 10, whose largest possible sum is $19$. So ten draws do not guarantee the property.

Eleven badges fall into ten holes, so by the pigeonhole principle two of them are in the same hole, and two badges in the same hole add to 21 by construction. So eleven draws always work.

The trick is to choose the holes so that two items in the same hole are exactly what the question wants. Answer: $11$.`,
    steps: [
      "List the pairs summing to 21; they partition 1..20 into 10 holes.",
      "Worst case: one badge per hole, 10 badges without a pair.",
      "One more badge forces two in one hole: 11.",
    ],
    keyIdea: "Choose the holes so that two items sharing a hole is precisely the property you want.",
    commonMistake: "Answering 10 (the number of pairs) or 20 (all the badges) by instinct without building the worst case, or taking the holes to be the 20 badge numbers instead of the 10 complementary pairs.",
    fastPath: "Twenty numbers pair off into ten complementary pairs; ten plus one.",
    variation: "Same box, but you want two badges adding to exactly 20. How many draws guarantee it?",
    variationAnswer: String.raw`Pairs $\{1,19\}, \dots, \{9,11\}$ give 9 holes, and badges 10 and 20 belong to no pair. Worst case $9 + 2 = 11$ badges, so $12$ draws.`,
    family: "pigeonhole",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "m9-p05",
    module: 9,
    kind: "practice",
    difficulty: 2,
    tags: ["number-puzzle", "logic"],
    minutes: 3,
    title: "Leftover lots",
    prompt: String.raw`A block of identical lots is being split. Dealt into 3 equal piles, 2 lots are left over; into 4 equal piles, 3 are left over; into 5 equal piles, 4 are left over. Dealt into 7 equal piles, none are left over. What is the smallest possible number of lots?`,
    answer: { type: "numeric", value: 119, exact: "119" },
    hints: [
      "Each remainder is one less than its divisor. What does that say about the number of lots plus one?",
      "The number plus one is a multiple of 3, 4 and 5, hence of 60. List the candidates.",
      "Check 59, 119, 179, ... for divisibility by 7.",
    ],
    solution: String.raw`Call the number of lots $N$. The remainders 2, 3 and 4 are each one short of the divisor, so $N + 1$ is divisible by 3, by 4 and by 5. These are pairwise coprime, so $N + 1$ is a multiple of $60$: $N \in \{59, 119, 179, 239, \dots\}$.

Now impose the last condition, $7 \mid N$. $59 = 56 + 3$ is not a multiple of 7. $119 = 7 \cdot 17$ is. So $N = 119$.

A more systematic route: write $N = 60t - 1$ and require $60t \equiv 1 \pmod 7$. Since $60 \equiv 4 \pmod 7$, we need $4t \equiv 1$, and $4 \cdot 2 = 8 \equiv 1$, so $t \equiv 2 \pmod 7$. The smallest positive $t$ is 2, giving $N = 119$. Check: $119 = 3 \cdot 39 + 2 = 4 \cdot 29 + 3 = 5 \cdot 23 + 4 = 7 \cdot 17$. Answer: $119$.`,
    steps: [
      "Spot that every remainder is divisor minus one, so N + 1 is divisible by 3, 4, 5.",
      "N + 1 is a multiple of 60: N = 59, 119, 179, ...",
      "Test divisibility by 7: 119 = 7 times 17.",
    ],
    keyIdea: "Remainders of the form 'divisor minus one' mean the number plus one is a common multiple.",
    commonMistake: "Taking $N - 1$ instead of $N + 1$, or forgetting the divisibility-by-7 condition and answering 59.",
    fastPath: "N + 1 is a multiple of 60; 59 fails mod 7, 119 is 7 times 17.",
    variation: "Replace 'into 7 equal piles with none left over' by 'into 11 equal piles with none left over'. Smallest N?",
    variationAnswer: String.raw`$60t \equiv 1 \pmod{11}$ with $60 \equiv 5$ gives $5t \equiv 1$, so $t \equiv 9$; $N = 60 \cdot 9 - 1 = 539 = 11 \cdot 49$.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m9-p06",
    module: 9,
    kind: "practice",
    difficulty: 2,
    tags: ["induction", "logic"],
    minutes: 3,
    title: "Filling a twelve-slot rack",
    prompt: String.raw`A server rack has 12 slots in a row and must be filled completely with modules that are either 1 slot wide or 3 slots wide. Modules of the same width are identical, and a filling is described by the sequence of module widths from left to right. How many different fillings are there?`,
    answer: { type: "numeric", value: 60, exact: String.raw`a_{12} = 60,\quad a_n = a_{n-1} + a_{n-3}` },
    hints: [
      "Look at the leftmost module. It is either 1 wide or 3 wide, and what remains is a smaller rack of the same kind.",
      String.raw`Let $a_n$ count fillings of $n$ slots. Then $a_n = a_{n-1} + a_{n-3}$ with $a_0 = a_1 = a_2 = 1$.`,
      "Build the table up to 12: 1, 1, 1, 2, 3, 4, 6, 9, 13, 19, 28, 41, 60.",
    ],
    solution: String.raw`Let $a_n$ be the number of fillings of a rack with $n$ slots. Condition on the leftmost module. If it is 1 wide, the remaining $n - 1$ slots can be filled in $a_{n-1}$ ways; if it is 3 wide, the remaining $n - 3$ slots can be filled in $a_{n-3}$ ways. These cases are disjoint and exhaustive, so $a_n = a_{n-1} + a_{n-3}$.

The base cases are $a_0 = 1$ (the empty filling), $a_1 = 1$ and $a_2 = 1$ (only narrow modules fit). Filling the table: $a_3 = 2$, $a_4 = 3$, $a_5 = 4$, $a_6 = 6$, $a_7 = 9$, $a_8 = 13$, $a_9 = 19$, $a_{10} = 28$, $a_{11} = 41$, $a_{12} = 60$.

A second route counts by the number $k$ of wide modules. With $k$ wide and $12 - 3k$ narrow modules there are $\binom{12 - 2k}{k}$ orderings (choose which of the $12 - 2k$ modules are wide). Summing over $k = 0, 1, 2, 3, 4$: $1 + 10 + 28 + 20 + 1 = 60$. Answer: $60$.`,
    steps: [
      "Define a_n as the number of fillings of n slots.",
      "Condition on the leftmost module: a_n = a_(n-1) + a_(n-3).",
      "Base cases a_0 = a_1 = a_2 = 1; fill the table to a_12 = 60.",
      "Cross-check by summing binomials over the number of wide modules.",
    ],
    keyIdea: "Condition on the first piece; the rest is the same problem with fewer slots.",
    commonMistake: String.raw`Using the Fibonacci recurrence $a_{n-1} + a_{n-2}$ out of habit, or starting the table with $a_3 = 1$ instead of 2.`,
    fastPath: "Recurrence a_n = a_(n-1) + a_(n-3) from 1, 1, 1; the thirteenth entry, a_12, is 60.",
    variation: "Modules are 1 or 2 slots wide instead. How many fillings of 12 slots?",
    variationAnswer: String.raw`Fibonacci: $a_n = a_{n-1} + a_{n-2}$ with $a_0 = a_1 = 1$, so $a_{12} = 233$.`,
    family: "induction",
    verifiedBy: ["dp", "enumeration"],
  },
  {
    id: "m9-p07",
    module: 9,
    kind: "practice",
    difficulty: 2,
    tags: ["induction", "logic"],
    minutes: 3,
    title: "Seven cuts through a plane",
    prompt: String.raw`Seven straight lines are drawn across an unbounded flat plane so that no two are parallel and no three pass through a common point. Into how many regions do the lines divide the plane?`,
    answer: { type: "numeric", value: 29, exact: String.raw`1 + 7 + \binom{7}{2} = 29` },
    hints: [
      "Add the lines one at a time. When the $n$-th line is drawn, how many of the earlier lines does it cross?",
      "The $n$-th line is cut into $n$ pieces by its $n - 1$ crossing points, and each piece splits one existing region in two.",
      String.raw`$R(n) = R(n-1) + n$ with $R(0) = 1$, so $R(n) = 1 + \frac{n(n+1)}{2}$.`,
    ],
    solution: String.raw`Start with no lines: one region. Add lines one at a time. The $n$-th line crosses each of the $n - 1$ earlier lines exactly once (no two are parallel) at $n - 1$ distinct points (no three lines concurrent). Those points cut the new line into $n$ pieces: $n - 2$ bounded segments and two rays. Each piece lies inside one existing region and splits it into two, so the line adds exactly $n$ regions.

Hence $R(n) = R(n-1) + n$ with $R(0) = 1$: the sequence runs $1, 2, 4, 7, 11, 16, 22, 29$, and $R(7) = 29$. In closed form, $R(n) = 1 + (1 + 2 + \dots + n) = 1 + \frac{n(n+1)}{2}$, which is also $1 + n + \binom{n}{2}$: one region to start, one per line, one per crossing point.

Euler's formula gives an independent check. The arrangement has $V = \binom{7}{2} = 21$ crossing points. Each line is cut into 7 pieces, so $E = 49$. Treating the plane as a sphere with one extra vertex at infinity where all rays meet, $V' = 22$, and $F = E - V' + 2 = 49 - 22 + 2 = 29$. Answer: $29$.`,
    steps: [
      "Add lines one at a time; the n-th line meets n - 1 others.",
      "n - 1 crossing points cut the new line into n pieces, each splitting a region.",
      "R(n) = R(n - 1) + n from R(0) = 1 gives 1, 2, 4, 7, 11, 16, 22, 29.",
      "Closed form 1 + n + C(n, 2); check with Euler if time allows.",
    ],
    keyIdea: "A new line adds one region per piece it is cut into, which is one more than the number of lines it crosses.",
    commonMistake: String.raw`Guessing $2^n$ (true only for $n \le 2$), or forgetting the starting region and answering 28.`,
    fastPath: "One plus the triangular number: 1 + 28 = 29.",
    variation: "Exactly two of the seven lines are parallel; otherwise the lines are in general position. How many regions?",
    variationAnswer: String.raw`Regions $= 1 + (\text{lines}) + (\text{crossing points}) = 1 + 7 + 20 = 28$: the parallel pair removes one crossing.`,
    family: "induction",
    verifiedBy: ["formula", "enumeration"],
  },
  {
    id: "m9-p08",
    module: 9,
    kind: "practice",
    difficulty: 2,
    tags: ["knights-knaves", "logic"],
    minutes: 3,
    title: "Two villagers and a hypothetical",
    prompt: String.raw`On an island every villager is either a truth-teller, whose every statement is true, or a liar, whose every statement is false. You meet Ash and Bay. Ash says: "If you asked Bay whether I am a liar, Bay would answer yes." Bay says: "Ash and I are of different types." What are they?`,
    answer: {
      type: "choice",
      options: ["Both are truth-tellers", "Ash is a truth-teller and Bay is a liar", "Ash is a liar and Bay is a truth-teller", "Both are liars"],
      correct: 3,
    },
    hints: [
      "Start with Bay. If Bay is a truth-teller, the two really are of different types; if Bay is a liar, they are the same type.",
      "Suppose Bay is a truth-teller, so Ash is a liar. Would Bay answer yes to 'is Ash a liar?' Then check Ash's statement.",
      "The truth-teller case for Bay contradicts Ash's statement; so Bay is a liar, hence Ash is the same type.",
    ],
    solution: String.raw`Work from Bay's statement, because it links the two types directly. If Bay is a truth-teller, the statement is true and Ash is a liar. Asked "is Ash a liar?", a truthful Bay would answer yes. So Ash's statement "Bay would answer yes" is true, but Ash is supposed to be a liar. Contradiction.

So Bay is a liar, and "Ash and I are of different types" is false: Ash is also a liar. Check Ash's statement against this. Asked "is Ash a liar?", the truthful answer is yes, so a lying Bay would answer no. Ash claimed Bay would answer yes; that claim is false, as a liar's statement must be. Everything is consistent.

Enumerating all four type assignments confirms that (liar, liar) is the only one in which both statements have the truth value matching the speaker's type. Answer: both are liars.`,
    steps: [
      "Treat each statement as 'statement is true if and only if speaker is a truth-teller'.",
      "Case Bay truthful: Ash is a liar, Bay would say yes, so Ash spoke truly. Contradiction.",
      "Case Bay liar: Ash is the same type, a liar; Bay would say no, so Ash's claim is false. Consistent.",
      "Both are liars.",
    ],
    keyIdea: "A hypothetical 'Bay would say X' is true exactly when X's truth value matches Bay's type; chain the biconditionals.",
    commonMistake: "Evaluating 'Bay would answer yes' as if Bay were truthful, or stopping after finding one consistent case without ruling out the others.",
    fastPath: "Bay's statement is a direct same-or-different link; try Bay truthful, hit a contradiction in one line, so both lie.",
    variation: "Bay instead says: 'Ash and I are of the same type.' Now what are they?",
    variationAnswer: "If Bay were truthful, Ash would be truthful too, but a truthful Bay would answer no, making Ash's statement false. So Bay is a liar and Ash is a truth-teller; a lying Bay would indeed answer yes, so Ash's statement is true. Ash truth-teller, Bay liar.",
    family: "knights-knaves",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "m9-p09",
    module: 9,
    kind: "practice",
    difficulty: 2,
    tags: ["search-strategy", "logic"],
    minutes: 4,
    title: "Three samples through an airlock",
    prompt: String.raw`A lab technician must move three samples, an acid, a base and a neutral buffer, from the prep room to the clean room through an airlock. Every passage through the airlock in either direction counts as one crossing, and the technician can carry at most one sample per crossing (or cross empty-handed). The acid and the base must never be left together in a room without the technician present; the buffer is harmless with anything. What is the minimum number of crossings needed to get all three samples into the clean room?`,
    answer: { type: "numeric", value: 5, exact: "5" },
    hints: [
      "Each sample needs its own forward crossing, and between two forward crossings the technician must come back. That gives a lower bound.",
      "The only danger is leaving acid and base alone together. Which sample must not be carried second?",
      "Carry one of the pair first, the buffer second, the other of the pair last, returning empty-handed in between.",
    ],
    solution: String.raw`First a lower bound. The technician carries at most one sample per crossing, so the three samples need three forward crossings. Between consecutive forward crossings the technician must return to the prep room, which takes a crossing each time. So at least $3 + 2 = 5$ crossings.

Now a schedule with five crossings. Carry the acid across (prep room: base and buffer, harmless). Return empty-handed (clean room: acid alone). Carry the buffer across (clean room: acid and buffer, harmless; prep room: base alone). Return empty-handed. Carry the base across. All three samples are in the clean room after 5 crossings, and acid and base were never alone together.

The only trap is the order: carrying the base second would leave acid and base alone in the clean room when the technician returned. A breadth-first search over the 16 states (which room each of the technician, acid, base and buffer is in), with the forbidden states removed, also finds the shortest path has length 5. Answer: $5$.`,
    steps: [
      "Lower bound: three forward trips plus two returns is 5 crossings.",
      "Identify the forbidden state: acid and base together without the technician.",
      "Schedule: acid over, back, buffer over, back, base over.",
      "Confirm no intermediate state is forbidden.",
    ],
    keyIdea: "Bound from capacity first, then search for a schedule that meets the bound while avoiding the forbidden states.",
    commonMistake: "Carrying the buffer last, which leaves acid and base alone in the clean room, and then concluding more crossings are needed.",
    fastPath: "Three items, one at a time, two returns: five. Just put the harmless item in the middle.",
    variation: "Now the base and the buffer also must not be left alone together (acid and buffer are still fine). Minimum crossings?",
    variationAnswer: "Seven: base over, back, acid over, bring the base back, buffer over, back, base over. The base is the item that conflicts with both others, so it goes first and last.",
    family: "river-crossing",
    verifiedBy: ["exhaustive-search", "formula"],
  },

  // ---------------------------------------------------------------- difficulty 3
  {
    id: "m9-p10",
    module: 9,
    kind: "practice",
    difficulty: 3,
    tags: ["pigeonhole", "logic"],
    minutes: 3,
    title: "Four of a kind from a limited bin",
    prompt: String.raw`A bin holds 22 identically shaped connectors: 2 red, 10 green and 10 blue. You pull connectors out blindly, without replacement. What is the smallest number of pulls that guarantees you hold at least four connectors of the same colour?`,
    answer: { type: "numeric", value: 9, exact: "2 + 3 + 3 + 1 = 9" },
    hints: [
      "Build the worst case: the longest run of pulls with no colour reaching four.",
      "Red runs out after two, so the worst case cannot hold three reds.",
      "Worst case is 2 red, 3 green, 3 blue: 8 pulls. One more forces a fourth green or blue.",
    ],
    solution: String.raw`The pigeonhole template "three colours, so $3 \cdot 3 + 1 = 10$ pulls" assumes every colour can contribute three connectors to the worst case. Here it cannot: there are only two reds.

Build the worst case honestly. To avoid four of a colour you can hold at most 3 green, at most 3 blue and at most $\min(2, 3) = 2$ red. So the largest collection with no colour at four has $2 + 3 + 3 = 8$ connectors, and it is achievable (both reds, three greens, three blues). Eight pulls therefore do not guarantee the property.

With nine connectors, the reds contribute at most 2, so at least 7 are green or blue, and two colours cannot absorb 7 connectors with at most 3 each. Some colour has at least four. Answer: $9$.

In general, to guarantee $k$ of one colour with supplies $s_1, s_2, \dots$, the answer is $1 + \sum_i \min(s_i, k - 1)$.`,
    steps: [
      "Target: four of one colour, so each colour may hold at most three in the worst case.",
      "Cap each colour by its supply: red contributes min(2, 3) = 2.",
      "Worst case 2 + 3 + 3 = 8 connectors; the ninth pull forces a fourth.",
    ],
    keyIdea: "The worst case takes min(supply, k - 1) of each colour; one more pull forces k of a kind.",
    commonMistake: "Answering 10 by applying 3 times 3 plus 1 without noticing that only two reds exist.",
    fastPath: "Cap each colour at three or its supply: 2 + 3 + 3 = 8, then add one.",
    variation: "The bin holds 5 red, 10 green and 10 blue instead. How many pulls guarantee four of a colour?",
    variationAnswer: String.raw`Now red can contribute three: $3 + 3 + 3 + 1 = 10$.`,
    family: "pigeonhole",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "m9-p11",
    module: 9,
    kind: "practice",
    difficulty: 3,
    tags: ["invariants", "logic"],
    minutes: 4,
    title: "Counters on a three-by-three grid",
    prompt: String.raw`Each cell of a 3 by 3 grid holds a counter showing 0. A move picks two cells that share an edge and adds 1 to both counters. Which of the following displays can be reached by some sequence of moves? (A) every cell shows 1. (B) every cell shows 1 except the centre, which shows 0. (C) every cell shows 2 except the centre, which shows 1.`,
    answer: {
      type: "choice",
      options: ["Display (A) only", "Display (B) only", "Display (C) only", "None of the three displays"],
      correct: 1,
    },
    hints: [
      "Colour the grid like a chessboard. Which colour are the corners and the centre, and which colour are the four edge cells?",
      "Every move adds 1 to one dark cell and 1 to one light cell. What quantity never changes?",
      "Dark total minus light total stays 0. Compute it for each display, then try to build the one that passes.",
    ],
    solution: String.raw`Colour the grid like a chessboard: the four corners and the centre are dark (five cells), the four edge-middle cells are light (four cells). Two cells that share an edge always have different colours, so every move adds exactly 1 to the dark total and exactly 1 to the light total. The difference $D = (\text{dark total}) - (\text{light total})$ never changes, and it starts at 0.

Display (A): dark total 5, light total 4, $D = 1$. Unreachable. Display (C): dark total $4 \cdot 2 + 1 = 9$, light total $4 \cdot 2 = 8$, $D = 1$. Unreachable.

Display (B): dark total 4 (the corners), light total 4, $D = 0$, so the invariant does not forbid it. An invariant only ever rules things out, so we still need a construction. Going round the outer ring, pair each corner with the edge cell clockwise from it: (top-left, top-middle), (top-right, right-middle), (bottom-right, bottom-middle), (bottom-left, left-middle). Four moves, each on an edge-adjacent pair, produce exactly display (B).

So (B) is reachable and (A) and (C) are not. A breadth-first search over all displays bounded above by each target confirms this. Answer: display (B) only.`,
    steps: [
      "Chessboard-colour the grid: 5 dark (corners and centre), 4 light (edge cells).",
      "Each move adds 1 to one dark and one light cell; dark minus light is invariant and starts at 0.",
      "Compute the invariant for each display: (A) 1, (B) 0, (C) 1.",
      "Construct (B) explicitly with four moves around the ring.",
    ],
    keyIdea: "Find a weighted sum that every move leaves unchanged; a target with a different value is unreachable, and a target with the same value still needs a construction.",
    commonMistake: "Relying on the parity of the grand total alone. It happens to reject (A) and (C) here (totals 9 and 17 are odd), but it is too weak in general: corners 2, edge cells 1, centre 0 has total 12 yet dark minus light equals 4, so it is unreachable. The other slip is declaring (B) reachable from the invariant alone without constructing it.",
    fastPath: "Chessboard colouring, dark minus light must be zero: only (B) has four dark and four light units.",
    variation: "What is the minimum number of moves needed to reach display (B)?",
    variationAnswer: "Each move adds 2 to the grand total and (B) totals 8, so at least 4 moves; the ring construction uses exactly 4.",
    family: "invariant",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "m9-p12",
    module: 9,
    kind: "practice",
    difficulty: 3,
    tags: ["invariants", "number-puzzle"],
    minutes: 4,
    title: "Merging chips",
    prompt: String.raw`Five chips lie on a desk showing the values 1, 2, 3, 4 and 5. A move removes two chips showing $a$ and $b$ and replaces them with a single chip showing $a + b + 2ab$. After four moves a single chip remains. What value does it show? (The value is the same whatever order the merges are made in.)`,
    answer: { type: "numeric", value: 5197, exact: String.raw`\frac{3 \cdot 5 \cdot 7 \cdot 9 \cdot 11 - 1}{2} = 5197` },
    hints: [
      String.raw`Look for a transformation $f$ such that $f(a + b + 2ab)$ is the product $f(a) f(b)$.`,
      String.raw`Compute $2(a + b + 2ab) + 1$ and factor it.`,
      String.raw`$(2a+1)(2b+1) = 2(a + b + 2ab) + 1$, so the product of $(2x + 1)$ over all chips never changes.`,
    ],
    solution: String.raw`The merge rule $a + b + 2ab$ is a disguised product. Compute $2(a + b + 2ab) + 1 = 4ab + 2a + 2b + 1 = (2a + 1)(2b + 1)$. So if we attach to each chip the label $\ell(x) = 2x + 1$, merging two chips replaces their labels by the product of the labels. The product of all labels on the desk is therefore an invariant.

Initially the product is $\ell(1)\ell(2)\ell(3)\ell(4)\ell(5) = 3 \cdot 5 \cdot 7 \cdot 9 \cdot 11 = 10395$. When one chip with value $v$ remains, its label $2v + 1$ equals that product, so $v = \frac{10395 - 1}{2} = 5197$.

Check one explicit order: merge 1 and 2 to get $1 + 2 + 4 = 7$; merge 7 and 3 to get $7 + 3 + 42 = 52$; merge 52 and 4 to get $52 + 4 + 416 = 472$; merge 472 and 5 to get $472 + 5 + 4720 = 5197$. Trying every one of the merge orders gives the same final chip, as the invariant promises. Answer: $5197$.`,
    steps: [
      "Suspect an invariant since the order does not matter.",
      "Find the transformation: 2(a + b + 2ab) + 1 = (2a + 1)(2b + 1).",
      "Product of (2x + 1) is invariant: 3 times 5 times 7 times 9 times 11 = 10395.",
      "Solve 2v + 1 = 10395: v = 5197.",
    ],
    keyIdea: "When a merge rule is symmetric and order-independent, look for a function that turns the rule into multiplication or addition.",
    commonMistake: String.raw`Using the label $x + 1$ (which works for the rule $a + b + ab$) and getting $6! - 1 = 719$, or arithmetic slips when merging by hand.`,
    fastPath: "Labels 2x + 1 multiply: 3, 5, 7, 9, 11 give 10395; subtract one and halve.",
    variation: "Same chips, but the merge rule is $a + b + ab$. What is the final value?",
    variationAnswer: String.raw`Labels $x + 1$ multiply: $2 \cdot 3 \cdot 4 \cdot 5 \cdot 6 = 720$, so the final chip shows $719$.`,
    family: "invariant",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "m9-p13",
    module: 9,
    kind: "practice",
    difficulty: 3,
    tags: ["weighing", "logic"],
    minutes: 3,
    title: "Twenty-eight vials",
    prompt: String.raw`You have 28 vials that look identical; 27 have the standard mass and exactly one is slightly heavier. You have a two-pan balance with no weights: it only tells you which pan is heavier, or that the pans balance. What is the smallest number of weighings that guarantees you find the heavy vial?`,
    answer: { type: "numeric", value: 4, exact: String.raw`\lceil \log_3 28 \rceil = 4` },
    hints: [
      "Each weighing has three possible outcomes. How many vials can $k$ weighings tell apart at most?",
      String.raw`$3^3 = 27$. Is that enough for 28 vials?`,
      "Three weighings separate at most 27 cases; 28 needs a fourth. Split 9, 9, 10 to achieve it.",
    ],
    solution: String.raw`Think of the heavy vial as the unknown: 28 possibilities. Each weighing has three outcomes (left heavy, right heavy, balance), so after $k$ weighings there are at most $3^k$ distinct outcome sequences, and each possibility must map to a different sequence. Hence $3^k \ge 28$. Since $3^3 = 27 < 28$, three weighings cannot be guaranteed to work: some two vials would produce the same outcomes. So at least 4.

Four weighings suffice. Split the 28 vials into groups of 9, 9 and 10 and weigh the two groups of 9 against each other. If a pan is heavier, the heavy vial is in that group of 9; if they balance, it is in the group of 10. Nine vials take two more weighings (3-3-3, then 1-1-1). Ten vials take three more: weigh 4 against 4, leaving 4 or 2 candidates, then at most two more weighings. The worst branch uses $1 + 3 = 4$ weighings in total.

The trap is 28 being one more than $3^3$: a candidate who says "three" has applied the bound without checking it. The dynamic programme $f(n) = 1 + \min_{a}\max\{f(a), f(n - 2a)\}$ with $f(1) = 0$ gives $f(27) = 3$ and $f(28) = 4$. Answer: $4$.`,
    steps: [
      "Count outcomes: 3 per weighing, so 3^k sequences.",
      "Require 3^k >= 28; 27 is too small, so k >= 4.",
      "Exhibit a four-weighing plan: 9-9-10, then thirds.",
    ],
    keyIdea: "A balance weighing has three outcomes, so k weighings distinguish at most 3^k candidates.",
    commonMistake: "Answering 3 because 28 'is about 27', or using 2^k as if the balance had two outcomes.",
    fastPath: "Powers of three: 27 is just short of 28, so four.",
    variation: "A 29th vial that is known to be of standard mass is also available. Does it reduce the number of weighings?",
    variationAnswer: "No. The reference vial can balance an odd split but cannot create a fourth outcome; 28 candidates still need 3^k >= 28, so 4 weighings.",
    family: "weighing",
    verifiedBy: ["dp", "formula"],
  },
  {
    id: "m9-p14",
    module: 9,
    kind: "practice",
    difficulty: 3,
    tags: ["hats", "logic"],
    minutes: 5,
    title: "Queue of badges",
    prompt: String.raw`Ten interns stand in single file. Each wears a badge that is red or blue, chosen by an independent fair coin flip for each intern. Every intern can see the badges of everyone in front of them, but not their own badge or those behind. Starting from the back of the line and moving forward, each intern says one word, "red" or "blue", heard by everyone; an intern is correct if the word is their own badge colour. Before the badges are assigned, the interns agree on a strategy. What is the largest number of correct calls they can guarantee, whatever the badge colours turn out to be?`,
    answer: { type: "numeric", value: 9, exact: "10 - 1 = 9" },
    hints: [
      "The intern at the back sees everyone else but has no information about their own badge. Can any strategy guarantee that this intern is correct?",
      "That intern's word can be used to send information forward instead of guessing. One bit is enough: the parity of the number of red badges seen.",
      "Each later intern knows the parity of reds ahead of the first speaker, has heard every correct call behind them, and sees everything in front. Their own colour is forced.",
    ],
    solution: String.raw`Upper bound first. The intern at the back decides on a word using only the nine badges in front, which are fixed. Both colours for their own badge are possible given exactly that view, so whichever word they choose, there is an assignment in which it is wrong. No strategy can guarantee ten correct calls, so the answer is at most 9.

Now a strategy that guarantees 9. Agree in advance: the back intern says "red" if the number of red badges they see is even and "blue" if it is odd. That word may well be wrong about their own badge, but it tells everyone the parity of reds among the front nine.

The ninth intern (next in line) sees eight badges and now knows the parity of reds among the nine badges in front of the back intern, which are the eight they see plus their own. If the parity of the eight seen matches the announced parity, their own badge is blue; otherwise it is red. They call correctly. The eighth intern sees seven badges, has heard the announced parity and the ninth intern's correct call, so knows the parity of the remaining eight (the seven seen plus their own) and deduces their own colour. By induction, every intern from the ninth forward is correct, since each one knows the announced parity, the true colours of everyone behind (all correct), and the colours of everyone in front.

So 9 is achievable and 10 is impossible: the answer is $9$. The back intern is right by luck half the time, so the expected number of correct calls under this strategy is $9.5$, but the guaranteed number is 9. Enumerating all $2^{10}$ assignments under the parity strategy confirms that the minimum number of correct calls is exactly 9. Answer: $9$.`,
    steps: [
      "Upper bound: the back intern has zero information about their own badge, so at most 9.",
      "Agree a convention: the first word encodes the parity of reds seen.",
      "Each subsequent intern combines the announced parity, the calls heard and the badges seen.",
      "Induction shows every intern after the first is correct: 9 guaranteed.",
    ],
    keyIdea: "Sacrifice the first speaker's guess to broadcast one bit (a parity) that everyone else can update.",
    commonMistake: "Answering 5 (half of them) by treating the calls as independent guesses, or claiming 10 without noticing the back intern's view is identical for both own colours.",
    fastPath: "Everyone except the first speaker: n minus one.",
    variation: "Badges come in three colours: red, blue and green, with the same rules. How many correct calls can be guaranteed?",
    variationAnswer: "Still 9. Code the colours 0, 1, 2; the first speaker announces the sum of the codes seen modulo 3 (using the three words as the three residues), and each later intern solves for their own code.",
    family: "hats",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m9-p15",
    module: 9,
    kind: "practice",
    difficulty: 3,
    tags: ["knights-knaves", "logic"],
    minutes: 4,
    title: "Three villagers at the well",
    prompt: String.raw`On the island where every villager is either a truth-teller (always truthful) or a liar (always lying), you meet Cal, Dee and Eli. Cal says: "Dee is a liar." Dee says: "Cal and Eli are of the same type." Eli says: "Cal is a truth-teller." Who is what?`,
    answer: {
      type: "choice",
      options: [
        "Cal truth-teller, Dee liar, Eli liar",
        "Cal liar, Dee truth-teller, Eli liar",
        "Cal liar, Dee liar, Eli truth-teller",
        "All three are liars",
      ],
      correct: 1,
    },
    hints: [
      "Eli's statement is about Cal. When is 'Cal is a truth-teller', said by Eli, consistent? Compare Eli's type with Cal's.",
      "Eli's statement is true exactly when Cal is truthful, and Eli tells the truth exactly when Eli is truthful. So Cal and Eli are always the same type.",
      "That makes Dee's statement true, so Dee is a truth-teller; Cal's statement is then false.",
    ],
    solution: String.raw`Translate each statement into a biconditional: a statement is true if and only if its speaker is a truth-teller. Write $c$, $d$, $e$ for "Cal / Dee / Eli is a truth-teller".

Eli's statement "Cal is a truth-teller" gives $e \Leftrightarrow c$. In words: Eli and Cal are of the same type, whatever that type is. That is a fact, not a guess.

Dee's statement "Cal and Eli are of the same type" is therefore true, so Dee is a truth-teller: $d$ is true.

Cal's statement "Dee is a liar" is then false, so Cal is a liar: $c$ is false. Since $e \Leftrightarrow c$, Eli is a liar too.

Check all three: Cal (liar) says Dee is a liar, false, good. Dee (truth-teller) says Cal and Eli are the same type, both liars, true, good. Eli (liar) says Cal is a truth-teller, false, good. Enumerating all eight type assignments shows this is the only consistent one. Answer: Cal liar, Dee truth-teller, Eli liar.`,
    steps: [
      "Write each statement as 'true iff speaker is truthful'.",
      "Eli's statement forces Cal and Eli to be the same type.",
      "So Dee's statement is true: Dee is a truth-teller.",
      "Cal's statement is false: Cal is a liar, hence Eli is a liar.",
      "Verify all three statements.",
    ],
    keyIdea: "A statement 'X is a truth-teller' makes speaker and X the same type; 'X is a liar' makes them different types.",
    commonMistake: "Starting from Cal's statement and branching into cases without noticing that Eli's statement settles Dee's immediately.",
    fastPath: "'Cal is truthful' from Eli means Cal and Eli match, so Dee spoke truly, so Cal lied: liar, truth-teller, liar.",
    variation: "Eli instead says: 'Cal is a liar.' Who is what now?",
    variationAnswer: "Now Cal and Eli differ, so Dee's statement is false and Dee is a liar; Cal's statement 'Dee is a liar' is true, so Cal is a truth-teller and Eli is a liar.",
    family: "knights-knaves",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "m9-p16",
    module: 9,
    kind: "practice",
    difficulty: 3,
    tags: ["knights-knaves", "logic"],
    minutes: 4,
    title: "Six at the table",
    prompt: String.raw`Six islanders sit at a table in labelled seats; each is a truth-teller (always truthful) or a liar (always lying). Each of the six says: "Exactly two of the other five are liars." How many assignments of types to the six seats are consistent with all six statements?`,
    answer: { type: "numeric", value: 16, exact: String.raw`\binom{6}{2} + 1 = 16` },
    hints: [
      "Let $L$ be the total number of liars. A truth-teller sees $L$ liars among the others; a liar sees $L - 1$.",
      String.raw`A truth-teller's statement must be true, so $L = 2$ whenever there is a truth-teller. A liar's statement must be false, so $L - 1 \neq 2$.`,
      "Case $L = 2$: choose which two seats lie. Case $L = 6$: everyone lies and everyone sees five liars. Check all other $L$ fail.",
    ],
    solution: String.raw`Let $L$ be the number of liars among the six. A truth-teller looks at the other five and sees all $L$ liars, so their statement "exactly two of the others are liars" is true exactly when $L = 2$. A liar sees $L - 1$ liars among the others, so their statement is false exactly when $L - 1 \neq 2$, that is $L \neq 3$.

If $1 \le L \le 5$ there is at least one truth-teller, forcing $L = 2$. Then the four truth-tellers each see 2 liars (true, good) and the two liars each see 1 liar (statement false, good). Every choice of which two seats hold the liars works: $\binom{6}{2} = 15$ assignments.

If $L = 0$, every one of the six is truthful but sees 0 liars, so the statement is false: inconsistent. If $L = 6$, every one is a liar and sees 5 liars, so "exactly two" is false, as a liar requires: consistent. That is 1 more assignment.

Total: $15 + 1 = 16$. Enumerating all $2^6 = 64$ assignments and testing the six statements confirms 16. Answer: $16$.`,
    steps: [
      "Parametrise by the number of liars L.",
      "Truth-teller consistent iff L = 2; liar consistent iff L is not 3.",
      "L = 2 gives C(6, 2) = 15 assignments; L = 6 gives 1; all other L fail.",
      "Total 16.",
    ],
    keyIdea: "When everyone makes the same counting statement, condition on the total count and check each speaker type separately.",
    commonMistake: "Forgetting the all-liars assignment (answering 15), or allowing L = 3 without noticing that a liar would then be telling the truth.",
    fastPath: "Fifteen ways to pick the two liars, plus the all-liars table: 16.",
    variation: "Each instead says: 'Exactly two of the other five are truth-tellers.' How many consistent assignments?",
    variationAnswer: String.raw`With $T$ truth-tellers, a truth-teller sees $T - 1 = 2$ so $T = 3$, and a liar sees $T \neq 2$. $T = 3$ gives $\binom{6}{3} = 20$; $T = 0$ (all liars, each seeing 0) gives 1. Total $21$.`,
    family: "knights-knaves",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "m9-p17",
    module: 9,
    kind: "practice",
    difficulty: 3,
    tags: ["invariants", "logic"],
    minutes: 4,
    title: "Last token loses",
    prompt: String.raw`Two players alternately remove 1, 2 or 3 tokens from a pile of 14 tokens. The player who removes the last token loses. Both play perfectly. Which statement is true?`,
    answer: {
      type: "choice",
      options: [
        "The first player wins, and only by taking 1 token on the first move",
        "The first player wins, and only by taking 2 tokens on the first move",
        "The first player wins, and only by taking 3 tokens on the first move",
        "The second player wins whatever the first player does",
      ],
      correct: 0,
    },
    hints: [
      "Work backwards from small piles. With 1 token left you must take it and lose. Which piles let you hand your opponent exactly 1?",
      "Piles of 2, 3 and 4 are wins (leave 1). A pile of 5 is a loss: every move leaves 2, 3 or 4. Spot the pattern.",
      "Losing piles are 1, 5, 9, 13: one more than a multiple of 4. From 14, leave 13.",
    ],
    solution: String.raw`Classify each pile size as a win or a loss for the player about to move. A pile of 1 is a loss: you must take the last token. Piles of 2, 3 and 4 are wins: take all but one and hand your opponent a pile of 1. A pile of 5 is a loss: every legal move leaves 2, 3 or 4, all wins for the opponent. Piles of 6, 7 and 8 are wins (leave 5), 9 is a loss, and so on.

The pattern is that the losing piles are exactly those congruent to 1 modulo 4: $1, 5, 9, 13$. The invariant behind it: from a pile that is 1 mod 4, any removal of 1, 2 or 3 tokens leaves a pile that is 0, 3 or 2 mod 4, and from any of those the opponent can remove 3, 2 or 1 tokens respectively to restore 1 mod 4. The player who keeps handing over piles of the form $4m + 1$ eventually hands over exactly 1.

The pile of 14 is 2 mod 4, so the first player wins, and the winning first move is the one that leaves 13: take 1 token. Taking 2 leaves 12 (the opponent takes 3 to reach 9); taking 3 leaves 11 (the opponent takes 2 to reach 9). Both lose against perfect play. The dynamic programme over pile sizes 0 to 14 confirms that from 14 exactly one first move leads to a losing position for the opponent. Answer: the first player wins, and only by taking 1 token.`,
    steps: [
      "Label small piles win or loss from the end: 1 is a loss.",
      "A pile is a win if some move reaches a loss; losses are 1, 5, 9, 13.",
      "Invariant: hand over piles that are 1 mod 4.",
      "From 14, only taking 1 reaches 13.",
    ],
    keyIdea: "In a subtraction game, find the residue class of losing piles and keep handing it to your opponent.",
    commonMistake: "Using the normal-play rule (last token wins), whose losing piles are multiples of 4, and answering 'take 2'.",
    fastPath: "Misère with moves 1-3: losing piles are 1 mod 4. Fourteen is 2 mod 4, so take 1.",
    variation: "Same game, but the player who takes the last token wins. What should the first player do from 14?",
    variationAnswer: "Losing piles are now the multiples of 4; from 14 take 2 to leave 12, then always restore a multiple of 4.",
    family: "invariant",
    verifiedBy: ["dp", "formula"],
  },

  // ---------------------------------------------------------------- difficulty 4
  {
    id: "m9-p18",
    module: 9,
    kind: "practice",
    difficulty: 4,
    tags: ["invariants", "number-puzzle"],
    minutes: 5,
    title: "Robot with growing strides",
    prompt: String.raw`A robot starts at position 0 on a long straight track. Its $k$-th step has length exactly $k$ metres (1 m, then 2 m, then 3 m, and so on), and before each step it chooses to move left or right. What is the smallest number of steps after which the robot can be at position $+14$ exactly?`,
    answer: { type: "numeric", value: 7, exact: "7" },
    hints: [
      String.raw`After $n$ steps the position is $\pm 1 \pm 2 \pm \dots \pm n$. Compare it with the all-right position $T_n = n(n+1)/2$.`,
      "Turning one step from right to left subtracts twice its length, an even number. So the position has the same parity as $T_n$, and it is at most $T_n$.",
      String.raw`Need $T_n \ge 14$ and $T_n$ even: $T_5 = 15$ and $T_6 = 21$ are odd, $T_7 = 28$ works. Then flip the step that subtracts 14.`,
    ],
    solution: String.raw`After $n$ steps the position is $S = \sum_{k=1}^{n} \varepsilon_k k$ with each $\varepsilon_k = \pm 1$. Compare with the all-right position $T_n = 1 + 2 + \dots + n = n(n+1)/2$. Flipping a step of length $k$ from right to left changes the position by $-2k$, an even amount, so $S$ always has the same parity as $T_n$. Also $|S| \le T_n$. Two necessary conditions for reaching 14: $T_n \ge 14$ and $T_n$ even.

$T_4 = 10 < 14$. $T_5 = 15$ is odd, and $T_6 = 21$ is odd, so 5 and 6 steps cannot land exactly on 14 even though they could travel far enough. $T_7 = 28$ is even and at least 14, so 7 steps is the first candidate.

The conditions are also sufficient: $T_7 - 14 = 14 = 2 \cdot 7$, so flipping the step of length 7 to the left gives $1 + 2 + 3 + 4 + 5 + 6 - 7 = 14$. In general, flipping a set of steps whose lengths sum to $(T_n - \text{target})/2$ does the job, and every value from 0 to $T_n$ is a subset sum of $1, \dots, n$.

The parity invariant is the whole difficulty: a candidate who only checks the distance says 5. Tracking the set of reachable positions step by step confirms that 14 first appears after step 7. Answer: $7$.`,
    steps: [
      "Write the position as a signed sum of 1..n and compare with T_n.",
      "Each flip changes the position by an even amount: parity of position equals parity of T_n.",
      "Find the smallest n with T_n >= 14 and T_n even: n = 7.",
      "Exhibit the signs: all right except step 7.",
    ],
    keyIdea: "The parity of a signed sum is fixed by the unsigned sum, so both distance and parity must be checked.",
    commonMistake: "Answering 5 because 1 + 2 + 3 + 4 + 5 = 15 is at least 14, ignoring that every reachable position after 5 steps is odd.",
    fastPath: "Triangular numbers 10, 15, 21, 28: the first that is at least 14 with the right parity is 28, at n = 7.",
    variation: "What is the smallest number of steps to be at position +15 exactly?",
    variationAnswer: String.raw`$T_5 = 15$ exactly: five steps, all to the right.`,
    family: "invariant",
    verifiedBy: ["dp", "formula"],
  },
  {
    id: "m9-p19",
    module: 9,
    kind: "practice",
    difficulty: 4,
    tags: ["weighing", "logic"],
    minutes: 6,
    title: "Four batteries, heavier or lighter",
    prompt: String.raw`Four batteries look identical. Exactly one has the wrong mass, and you do not know whether it is heavier or lighter than the other three. Using only a two-pan balance (three outcomes per weighing: left heavier, right heavier, balance), you must identify the faulty battery and state whether it is heavy or light. Which statement is correct?`,
    answer: {
      type: "choice",
      options: [
        String.raw`Two weighings always suffice, because $3^2 = 9 \ge 8$ possible cases`,
        String.raw`Two weighings cannot be guaranteed even though $3^2 = 9 \ge 8$; three are needed`,
        "Three weighings are needed, and the outcome count already shows it because $3^2 < 8$",
        "Four weighings are needed",
      ],
      correct: 1,
    },
    hints: [
      "There are 8 cases: 4 batteries, each possibly heavy or light. Count outcomes of two weighings and compare.",
      "The bound allows two weighings, but try to design the first weighing. One against one, or two against two: how many cases remain in the worst outcome?",
      "Every first weighing leaves at least 4 cases in some outcome, and one weighing separates at most 3. So two fail; show three suffice.",
    ],
    solution: String.raw`There are $4 \times 2 = 8$ cases (which battery, and heavy or light). Two weighings have $3^2 = 9$ outcome sequences, so the counting bound does not rule out two weighings. The bound is necessary, not sufficient; we have to look at the actual weighings.

Weigh one battery against one. If they balance, the fault is in the other two batteries, either heavy or light: 4 cases remain, and a single weighing has only 3 outcomes, so it cannot separate them. Weigh two against two. The pans cannot balance; whichever side is heavier, the cases left are "one of the two on the heavy side is heavy" or "one of the two on the light side is light": again 4 cases for one remaining weighing. There is no other kind of first weighing with four batteries (weighing nothing is useless). So two weighings cannot be guaranteed.

Three weighings suffice. Weigh A against B. If they balance, the fault is C or D: weigh A against C; if unbalanced, C is faulty and the tilt gives the direction; if balanced, D is faulty, and a third weighing of A against D gives the direction. If A against B is unbalanced, the fault is A or B: weigh A against C (known good if the fault is in A or B); if unbalanced, A is faulty with the direction shown; if balanced, B is faulty and its direction was shown by the first weighing. The worst branch uses three weighings.

The exact rule for this variant is that $k$ weighings handle at most $(3^k - 3)/2$ batteries when the direction must be reported and no known-good reference is available: $k = 2$ gives 3, which is less than 4, and $k = 3$ gives 12. An exhaustive search over all decision trees with four batteries confirms that depth 2 is impossible and depth 3 works. Answer: the second statement.`,
    steps: [
      "Count cases: 4 batteries times 2 directions is 8; the bound 3^2 = 9 allows two weighings in principle.",
      "Examine every first weighing: 1 vs 1 and 2 vs 2 both leave 4 cases in some outcome.",
      "One weighing cannot split 4 cases, so two weighings fail.",
      "Give an explicit three-weighing tree.",
    ],
    keyIdea: "The 3^k bound is only an upper limit on what a weighing plan can achieve; the first weighing must also split the cases nearly evenly, and here it cannot.",
    commonMistake: "Stopping at 9 >= 8 and answering two, or claiming the bound itself forbids two weighings.",
    fastPath: "Eight cases need the first weighing to leave at most 3 in each outcome; 1v1 and 2v2 both leave 4, so three.",
    variation: "You only need to find the faulty battery, not whether it is heavy or light. How many weighings?",
    variationAnswer: "Two: weigh A against B; if balanced, weigh A against C (unbalanced means C, balanced means D); if unbalanced, weigh A against C (unbalanced means A, balanced means B).",
    family: "weighing",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "m9-p20",
    module: 9,
    kind: "practice",
    difficulty: 4,
    tags: ["hats", "logic"],
    minutes: 6,
    title: "Three analysts, one call",
    prompt: String.raw`Three analysts each have a card pinned to their back; each card is independently red or black with probability one half. Each analyst sees the other two cards but not their own. At a signal, each analyst simultaneously either names a colour or stays silent; no communication is possible after the cards are placed. The team wins if at least one analyst names a colour and every analyst who names a colour is correct. Before the cards are placed, the team agrees on a strategy. What is the maximum probability of winning?`,
    answer: { type: "numeric", value: 3 / 4, exact: String.raw`\frac{3}{4}` },
    hints: [
      "Any one analyst who speaks is right exactly half the time, because their card is independent of what they see. The team can still do better than one half.",
      "Try: speak only when you see two cards of the same colour, and name the other colour. When does the team lose?",
      "The team loses only when all three cards match (2 of 8 assignments). Then argue no strategy can lose fewer than 2 assignments.",
    ],
    solution: String.raw`Consider the strategy: if you see two cards of the same colour, name the opposite colour; if you see two different colours, stay silent. If the three cards are not all the same, the assignment is two of one colour and one of the other. The lone analyst sees two matching cards and names the other colour, which is correct. Each of the two matching analysts sees one card of each colour and stays silent. Exactly one correct call, no wrong ones: a win. If all three cards match, everyone sees two matching cards, everyone names the other colour, and all three are wrong. So the team wins in 6 of the 8 equally likely assignments: probability $\frac{3}{4}$.

Why can no strategy beat $\frac{3}{4}$? Fix any deterministic strategy and count, over the 8 assignments, the total number of correct calls $C$ and wrong calls $W$. Take one analyst and one view (the two cards they see). If the rule says "speak" for that view, then of the two assignments producing that view, the analyst is right in exactly one and wrong in the other. Summing over analysts and views gives $C = W$.

A winning assignment contributes at least 1 to $C$ and 0 to $W$. A losing assignment contributes at most 3 to $W$. If the strategy wins on $k$ assignments, then $C \ge k$ and $W \le 3(8 - k)$, so $k \le C = W \le 3(8 - k)$, giving $k \le 6$. The maximum is $6/8 = 3/4$, and the strategy above attains it by concentrating all its wrong calls on the two all-same assignments, three wrong calls each.

A brute-force search over all $81^3 = 531441$ deterministic strategies (each analyst maps their 4 possible views to pass, red or black) confirms that the best wins exactly 6 of 8 assignments. Answer: $\frac{3}{4}$.`,
    steps: [
      "Note that each individual speaker is right exactly half the time, so wins must come from coordinating when to speak.",
      "Strategy: see two matching cards, call the other colour; otherwise stay silent.",
      "Count wins: 6 of 8 assignments, losing only when all three cards match.",
      "Upper bound: total correct calls equal total wrong calls; wrong calls fit in losing assignments at three each, so at most 6 wins.",
    ],
    keyIdea: "Every speaker is right half the time, so pile the wrong calls onto as few assignments as possible.",
    commonMistake: "Answering 1/2 (one designated speaker) or arguing that the best probability must be 1/2 since each guess is a coin flip.",
    fastPath: "Lose only when all three cards match: 2 of 8, so 3/4.",
    variation: "Everyone must name a colour, and the team wins only if all three are correct. Maximum probability?",
    variationAnswer: "One half: everyone names the colour that makes the total number of red cards even. If the parity is even all three are right; if odd all three are wrong. No strategy beats 1/2 because any single analyst is right only half the time, and a win needs that analyst to be right.",
    family: "hats",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "m9-p21",
    module: 9,
    kind: "practice",
    difficulty: 4,
    tags: ["induction", "search-strategy"],
    minutes: 5,
    title: "Trays across three bays",
    prompt: String.raw`A rack has three bays in a row: left, middle and right. Four trays of different sizes are stacked in the left bay, largest at the bottom and smallest on top. A move takes the top tray of one bay and places it on top of an adjacent bay (left to middle, middle to left, middle to right, or right to middle; never directly between left and right), and a tray may never be placed on a smaller tray. What is the minimum number of moves needed to rebuild the whole stack in the right bay?`,
    answer: { type: "numeric", value: 80, exact: "3^4 - 1 = 80" },
    hints: [
      "Solve one tray first (2 moves), then two trays. Where must the smaller trays be when the largest tray moves?",
      "For the largest tray to go left to middle, all smaller trays must be in the right bay; for it to go middle to right, they must all be in the left bay.",
      String.raw`$M(n) = 3M(n-1) + 2$ with $M(1) = 2$, so $M(n) = 3^n - 1$.`,
    ],
    solution: String.raw`Let $M(n)$ be the minimum number of moves to shift a stack of $n$ trays from one end bay to the other. One tray needs two moves (to the middle, then to the far end), so $M(1) = 2$.

Now consider the largest tray in a stack of $n$. It can only move to an adjacent bay, so to get from the left bay to the right bay it must at some point move left to middle, and later middle to right. When it moves left to middle, no smaller tray can be in the left bay (they would be on top of it) or in the middle bay (it cannot land on a smaller tray), so all $n - 1$ smaller trays are in the right bay. When it later moves middle to right, by the same argument all $n - 1$ smaller trays are in the left bay. So the smaller trays make a full end-to-end transfer before the first big move, another full transfer between the two big moves, and a third after. Each costs at least $M(n-1)$, and the largest tray moves at least twice: $M(n) \ge 3M(n-1) + 2$. Doing exactly this achieves the bound, so $M(n) = 3M(n-1) + 2$.

Adding 1 to both sides gives $M(n) + 1 = 3(M(n-1) + 1)$ with $M(1) + 1 = 3$, so $M(n) + 1 = 3^n$ and $M(n) = 3^n - 1$. For four trays, $M(4) = 81 - 1 = 80$.

A breadth-first search over the $3^4 = 81$ legal arrangements (each tray in one of three bays, with the stacking order forced) finds the shortest path from "all left" to "all right" has length 80, which means every legal arrangement is visited exactly once on the way. Answer: $80$.`,
    steps: [
      "Define M(n) as the minimum moves for n trays end to end; M(1) = 2.",
      "The largest tray must move twice, and before, between and after those moves the smaller trays make full end-to-end transfers.",
      "M(n) = 3M(n - 1) + 2, so M(n) + 1 = 3^n.",
      "M(4) = 80.",
    ],
    keyIdea: "Track what the smaller trays must be doing at each move of the largest tray; the recursion falls out.",
    commonMistake: String.raw`Using the standard three-peg formula $2^n - 1 = 15$, which assumes a tray can jump directly between the end bays.`,
    fastPath: "Adjacent-only moves: 3^n minus one, so 80.",
    variation: "Same four trays, but a tray may move between any two bays. Minimum moves?",
    variationAnswer: String.raw`The classic recursion $M(n) = 2M(n-1) + 1$ gives $2^4 - 1 = 15$.`,
    family: "induction",
    verifiedBy: ["exhaustive-search", "formula"],
  },

  // ---------------------------------------------------------------- difficulty 5
  {
    id: "m9-p22",
    module: 9,
    kind: "practice",
    difficulty: 5,
    tags: ["invariants", "search-strategy"],
    minutes: 7,
    title: "Row and column flips",
    prompt: String.raw`Sixteen coins lie in a 4 by 4 grid, all heads up. A move flips every coin in one chosen row or every coin in one chosen column (heads become tails and tails become heads). How many distinct patterns of heads and tails, including the starting pattern, can be reached by sequences of moves?`,
    answer: { type: "numeric", value: 128, exact: String.raw`2^{4 + 4 - 1} = 128` },
    hints: [
      "Flipping the same line twice undoes it, and the order of flips does not matter. So a pattern is determined by the set of rows and the set of columns flipped.",
      "That gives at most $2^8 = 256$ patterns, but different sets can give the same pattern. Which two sets give the same pattern?",
      "Alternatively, find an invariant: the parity of tails in any 2 by 2 block never changes. Count the patterns that satisfy all such constraints.",
    ],
    solution: String.raw`Flips commute and a line flipped twice is a line not flipped at all, so the pattern after any sequence depends only on which rows and which columns were flipped an odd number of times: a subset $R$ of the 4 rows and a subset $C$ of the 4 columns. The coin at $(i, j)$ shows tails exactly when it was flipped an odd number of times, that is when exactly one of "$i \in R$" and "$j \in C$" holds. So there are at most $2^4 \cdot 2^4 = 256$ patterns.

Different choices can coincide. Replacing $R$ by its complement and $C$ by its complement flips every coin twice more, which changes nothing, so $(R, C)$ and $(\bar R, \bar C)$ give the same pattern. Conversely, if $(R, C)$ and $(R', C')$ give the same pattern, then flipping $R$, $C$, $R'$, $C'$ together returns to all heads, which forces $R \triangle R'$ and $C \triangle C'$ to be either both empty or both everything. So the 256 choices pair off and there are exactly $256 / 2 = 128$ patterns.

An invariant gives the same count from the other side. Any row or column meets a 2 by 2 block in 0 or 2 cells, so the number of tails in every 2 by 2 block stays even. Consider the nine blocks whose top-left corner lies in the top-left 3 by 3. Given the first row and the first column (7 coins, chosen freely), the block constraints force every other coin one at a time, so at most $2^7 = 128$ patterns satisfy the constraints. Since every reachable pattern satisfies them and we have already shown 128 are reachable, the reachable patterns are exactly the 128 patterns with even tails in every 2 by 2 block.

A breadth-first search from the all-heads pattern over the $2^{16}$ patterns with the 8 flip moves visits exactly 128 patterns. In general an $m$ by $n$ grid gives $2^{m + n - 1}$. Answer: $128$.`,
    steps: [
      "Flips commute and cancel in pairs: a pattern is determined by the set of rows and set of columns flipped.",
      "Count choices: 2^8 = 256; complementing both sets gives the same pattern, so divide by 2.",
      "Invariant: every 2 by 2 block keeps an even number of tails; the 9 blocks force 9 constraints, leaving 2^7 free.",
      "Both routes give 128.",
    ],
    keyIdea: "Count the reachable set two ways: as the span of the moves (sets of rows and columns, up to the one redundancy) and as the patterns satisfying the invariant.",
    commonMistake: String.raw`Answering 256 (forgetting that flipping every row and every column is the identity) or $2^{16}$ (assuming everything is reachable).`,
    fastPath: "Rows plus columns minus one independent redundancy: 2 to the power 4 + 4 - 1 = 128.",
    variation: "Same rules on a 5 by 5 grid. How many patterns?",
    variationAnswer: String.raw`$2^{5 + 5 - 1} = 512$.`,
    family: "invariant",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "m9-p23",
    module: 9,
    kind: "practice",
    difficulty: 5,
    tags: ["search-strategy", "logic"],
    minutes: 6,
    title: "Four engineers, one headlamp",
    prompt: String.raw`Four engineers must cross a dark gantry at night. They have a single headlamp, the gantry holds at most two people at a time, and anyone crossing must be with the lamp, which must be carried back by hand (it cannot be thrown). Alone, the four take 1, 3, 4 and 6 minutes to cross; a pair crosses at the pace of the slower engineer. What is the minimum total time, in minutes, for all four to reach the far side?`,
    answer: { type: "numeric", value: 15, exact: "15", unit: "minutes" },
    hints: [
      "Two people cross, one comes back with the lamp. Four people need three forward crossings and two returns, five crossings in total.",
      "Plan 1: the fastest engineer escorts each of the others and returns twice. Plan 2: send the two slowest together so the 6 and the 4 share a crossing. Cost both.",
      "Escort: 6 + 1 + 4 + 1 + 3 = 15. Pairing the slow two: 3 + 1 + 6 + 3 + 3 = 16. Check nothing beats 15.",
    ],
    solution: String.raw`Write the times as $a = 1$, $b = 3$, $c = 4$, $d = 6$. With capacity two, four people need at least three forward crossings and two returns. There are two natural schedules.

Escort schedule: the fastest engineer accompanies each of the others and brings the lamp back. $a$ and $d$ cross (6), $a$ returns (1), $a$ and $c$ cross (4), $a$ returns (1), $a$ and $b$ cross (3). Total $2a + b + c + d = 2 + 3 + 4 + 6 = 15$.

Pairing schedule: send the two slowest together so that the 6 and the 4 share one crossing. $a$ and $b$ cross (3), $a$ returns (1), $c$ and $d$ cross (6), $b$ returns (3), $a$ and $b$ cross (3). Total $a + 3b + d = 1 + 9 + 6 = 16$.

For four people the optimum is the smaller of these two, $\min(2a + b + c + d,\ a + 3b + d)$, because any five-crossing schedule either sends $c$ and $d$ together or separately. If together, they cannot be the last forward crossing (the lamp carrier returning before it would have to come from $\{c, d\}$), so they go first, costing $d$ then at least $c$ for the return and at least $b + a + a$ for the rest, which is no better than the escort, or second, which is exactly the pairing schedule with $a$ and $b$ already across to ferry the lamp. If they cross separately, $c$ and $d$ each cost their full time, the third forward crossing costs at least $b$, and the two returns cost at least $a$ each: at least $2a + b + c + d$, the escort cost. The pairing schedule saves $c$ but spends an extra $2b - a$ on the two returns, so it wins exactly when $2b < a + c$. Here $2b = 6$ and $a + c = 5$, so the escort schedule wins at 15.

A shortest-path search over the 32 states (who is on the far side, and which side the lamp is on), with crossings weighted by the slower walker, confirms the minimum is 15. Answer: $15$ minutes.`,
    steps: [
      "Note the structure: three forward crossings, two returns.",
      "Cost the escort plan: 2a + b + c + d = 15.",
      "Cost the pairing plan: a + 3b + d = 16.",
      "Argue these are the only two shapes and take the minimum: 15.",
    ],
    keyIdea: "Either the fastest escorts everyone, or the two slowest cross together; compare 2b against a + c to decide.",
    commonMistake: "Assuming the pairing trick always wins because it does in the famous version, and answering 16.",
    fastPath: "Compare twice the second-fastest (6) with fastest plus third (5): escort wins, 2 + 3 + 4 + 6 = 15.",
    variation: "The times are 2, 3, 5 and 9 minutes instead. Minimum total time?",
    variationAnswer: String.raw`Escort: $4 + 3 + 5 + 9 = 21$. Pairing: $2 + 9 + 9 = 20$. Now $2b = 6 < a + c = 7$, so pairing wins: $20$.`,
    family: "river-crossing",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "m9-p24",
    module: 9,
    kind: "practice",
    difficulty: 5,
    tags: ["pigeonhole", "number-puzzle", "invariants"],
    minutes: 7,
    title: "A sub-list that sums to a multiple of six",
    prompt: String.raw`A desk logs trade sizes as positive integers, repeats allowed. What is the smallest number $k$ such that every list of $k$ trade sizes is guaranteed to contain a non-empty sub-list (any selection of entries) whose sum is a multiple of 6?`,
    answer: { type: "numeric", value: 6, exact: "6" },
    hints: [
      "First find lists that have no such sub-list. How long can a list of all 1s be before some selection sums to a multiple of 6?",
      String.raw`Five 1s give sub-sums 1 to 5 only. So $k \ge 6$. For the other direction, look at the running totals $s_1, s_1 + s_2, \dots$ modulo 6.`,
      "Six running totals modulo 6: either one is 0, or two are equal and their difference is a block of consecutive entries summing to a multiple of 6.",
    ],
    solution: String.raw`Two things to show: some list of 5 sizes has no qualifying sub-list, and every list of 6 sizes has one.

The example: five trades of size 1. Any non-empty selection sums to between 1 and 5, never a multiple of 6. So $k = 5$ is not enough, and $k \ge 6$.

Now take any six sizes $x_1, \dots, x_6$ and form the running totals $p_j = x_1 + \dots + x_j$ for $j = 1, \dots, 6$. Reduce them modulo 6. If some $p_j \equiv 0$, the first $j$ trades are the sub-list we want. Otherwise the six residues lie in the five non-zero classes $\{1, 2, 3, 4, 5\}$, so by the pigeonhole principle two of them agree: $p_i \equiv p_j$ with $i < j$. Then $p_j - p_i = x_{i+1} + \dots + x_j$ is a non-empty block of consecutive trades whose sum is a multiple of 6. So $k = 6$ always works.

The two halves use different tools: the extremal example shows the bound is tight, and the pigeonhole on residues of running totals shows it is sufficient. Note the argument finds a block of consecutive entries, which is stronger than the question asks, and it never used that the sizes are distinct, which they need not be. The same argument shows that any $m$ integers contain a non-empty sub-list summing to a multiple of $m$, and $m - 1$ copies of 1 show $m$ is the smallest such number.

An exhaustive search over all residue patterns confirms it: for $k = 5$ the all-ones list has no zero-sum selection, and every one of the $5^6$ lists of non-zero residues of length 6 has one. Answer: $6$.`,
    steps: [
      "Lower bound by example: five 1s have no selection summing to a multiple of 6.",
      "Form the six running totals modulo 6.",
      "Either one is 0 or two coincide; the difference is a consecutive block summing to a multiple of 6.",
      "Conclude k = 6 is tight.",
    ],
    keyIdea: "Pigeonhole on the residues of running totals: n totals in n residue classes either hit 0 or collide.",
    commonMistake: "Answering 7 by applying 'holes plus one' to six residues without noticing that a running total of residue 0 is already a win, or answering 5 by forgetting the all-ones example.",
    fastPath: "For a modulus m the answer is m: m minus one copies of 1 fail, and the running-total argument makes m work.",
    variation: "Same question for a multiple of 10. Smallest k?",
    variationAnswer: "10: nine 1s fail, and ten running totals modulo 10 either hit 0 or collide.",
    family: "pigeonhole",
    verifiedBy: ["exhaustive-search", "formula"],
  },

  // ---------------------------------------------------------------- lesson checks
  {
    id: "m9-lc1",
    module: 9,
    kind: "lessonCheck",
    difficulty: 1,
    tags: ["pigeonhole"],
    minutes: 1,
    title: "Lanyards in five colours",
    prompt: String.raw`Conference lanyards come in five colours and are handed out from a bag without looking; the bag holds plenty of each colour. What is the smallest number of lanyards you must take to be certain that at least three of them share a colour?`,
    answer: { type: "numeric", value: 11, exact: String.raw`2 \cdot 5 + 1 = 11` },
    hints: [
      "Build the longest run of lanyards with no colour appearing three times.",
      "Two of each colour is the worst case: 10 lanyards.",
      "One more than the worst case: 11.",
    ],
    solution: String.raw`To avoid three of one colour you can hold at most two of each of the five colours, so at most $2 \cdot 5 = 10$ lanyards, and this worst case is achievable (two of every colour). So ten lanyards do not guarantee three of a kind.

With eleven lanyards in five colours, if every colour appeared at most twice there would be at most ten lanyards. So some colour appears at least three times. This is the generalised pigeonhole principle: to force $k$ items in one of $n$ holes you need $n(k - 1) + 1$ items. Answer: $11$.`,
    steps: ["Worst case: two of each colour, 10 lanyards.", "Add one to force a third of some colour.", "Answer 11."],
    keyIdea: "To force k of a kind among n categories, take n(k - 1) + 1 items.",
    commonMistake: "Answering 6 (the two-of-a-kind answer) or 15 (three of each) instead of 2 times 5 plus 1.",
    fastPath: "Five colours, two each, plus one: 11.",
    variation: "How many lanyards guarantee four of the same colour?",
    variationAnswer: String.raw`$3 \cdot 5 + 1 = 16$.`,
    family: "pigeonhole",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m9-lc2",
    module: 9,
    kind: "lessonCheck",
    difficulty: 2,
    tags: ["invariants"],
    minutes: 1,
    title: "Five coins, two at a time",
    prompt: String.raw`Five coins lie heads up on a table. A move turns over exactly two of the coins (any two you like). Can you reach the position where all five coins show tails?`,
    answer: {
      type: "choice",
      options: ["Yes, and it can be done in 3 moves", "Yes, but it needs at least 5 moves", "No, it can never be done"],
      correct: 2,
    },
    hints: [
      "Count the heads before and after a move. By how much can the count change?",
      "Turning two coins changes the number of heads by -2, 0 or +2.",
      "The number of heads starts odd (5) and must end even (0). Parity never changes.",
    ],
    solution: String.raw`Count the heads. Turning over two coins changes the number of heads by $-2$ (both were heads), $0$ (one of each) or $+2$ (both were tails). In every case the parity of the number of heads is unchanged.

The start has 5 heads, an odd number. The target has 0 heads, an even number. Since no move changes the parity, the target can never be reached, however many moves you make. Checking all $2^5 = 32$ positions by breadth-first search confirms that exactly the 16 positions with an odd number of heads are reachable. Answer: no, never.`,
    steps: ["Track the number of heads.", "Each move changes it by an even amount, so its parity is invariant.", "5 is odd and 0 is even: unreachable."],
    keyIdea: "A move that changes a count by an even amount preserves its parity.",
    commonMistake: "Trying sequences of moves and concluding it merely looks hard, instead of naming the invariant that proves it impossible.",
    fastPath: "Odd heads stay odd; zero is even.",
    variation: "Six coins heads up, same move. Can you reach all tails, and in how few moves?",
    variationAnswer: "Yes: parity is even on both sides, and three moves (turn each disjoint pair once) do it; fewer is impossible since each move turns at most two coins.",
    family: "invariant",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "m9-lc3",
    module: 9,
    kind: "lessonCheck",
    difficulty: 1,
    tags: ["weighing"],
    minutes: 1,
    title: "Nine ingots",
    prompt: String.raw`Nine ingots look identical, but exactly one is heavier than the other eight, which all weigh the same. You have a two-pan balance with no weights. What is the smallest number of weighings that guarantees you find the heavy ingot?`,
    answer: { type: "numeric", value: 2, exact: String.raw`\lceil \log_3 9 \rceil = 2` },
    hints: [
      "A weighing has three outcomes. How many ingots can one weighing tell apart?",
      "Split into three groups of three and weigh two groups against each other.",
      "The heavy group is identified; one more weighing of 1 against 1 within it finishes.",
    ],
    solution: String.raw`One weighing has three outcomes, so it can single out the heavy ingot from at most three candidates: nine candidates need at least two weighings, since $3^1 = 3 < 9 \le 9 = 3^2$.

Two weighings suffice. Put three ingots on each pan and leave three aside. If a pan is heavier, the heavy ingot is among those three; if the pans balance, it is among the three set aside. Then weigh one of the three candidates against another: the heavier pan names it, and a balance means the third one is heavy. Answer: $2$.`,
    steps: ["Three outcomes per weighing: 3^k >= 9 needs k >= 2.", "Weigh 3 against 3, leaving 3 aside.", "Weigh 1 against 1 within the heavy group."],
    keyIdea: "Split into three equal groups so every outcome leaves a third of the candidates.",
    commonMistake: "Weighing 4 against 4 (the balance outcome then leaves only 1, but the tilt outcome leaves 4, needing two more weighings).",
    fastPath: "Nine is three squared: two weighings.",
    variation: "Twenty-seven ingots, one heavier. How many weighings?",
    variationAnswer: String.raw`$3^3 = 27$: three weighings, splitting 9-9-9, then 3-3-3, then 1-1-1.`,
    family: "weighing",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "m9-lc4",
    module: 9,
    kind: "lessonCheck",
    difficulty: 2,
    tags: ["induction"],
    minutes: 1,
    title: "Four rings, any post",
    prompt: String.raw`Four rings of different sizes are stacked on post A, largest at the bottom. You may move one ring at a time from the top of any post to the top of any other post (there are three posts, A, B and C), but never place a ring on a smaller ring. What is the minimum number of moves to rebuild the stack on post C?`,
    answer: { type: "numeric", value: 15, exact: "2^4 - 1 = 15" },
    hints: [
      "One ring takes 1 move. Two rings take 3. Find the pattern by asking what must happen before the largest ring can move.",
      "To move the largest ring, the other three must all be on the one remaining post: that is a full transfer of three rings, then one move, then another full transfer.",
      String.raw`$M(n) = 2M(n-1) + 1$ with $M(1) = 1$, so $M(n) = 2^n - 1$.`,
    ],
    solution: String.raw`Let $M(n)$ be the minimum number of moves for $n$ rings. To move the largest ring from A to C, every smaller ring must be off both A and C, so all $n - 1$ smaller rings must sit on B: at least $M(n-1)$ moves. Then the largest ring moves once, and the $n - 1$ smaller rings must be transferred from B onto C: at least $M(n-1)$ more. So $M(n) \ge 2M(n-1) + 1$, and following exactly this plan achieves it.

With $M(1) = 1$: $M(2) = 3$, $M(3) = 7$, $M(4) = 15$. In closed form $M(n) + 1 = 2(M(n-1) + 1)$ gives $M(n) = 2^n - 1$. A breadth-first search over the $3^4 = 81$ legal arrangements confirms the shortest path has 15 moves. Answer: $15$.`,
    steps: ["Before the largest ring moves, the rest must be on the spare post.", "M(n) = 2M(n - 1) + 1 with M(1) = 1.", "M(4) = 15."],
    keyIdea: "Solve for n - 1 rings, move the big one, solve for n - 1 again.",
    commonMistake: "Answering 16 (2 to the fourth) instead of 15, or 8 (two moves per ring).",
    fastPath: "Two to the n minus one: 15.",
    variation: "Five rings. Minimum moves?",
    variationAnswer: String.raw`$2^5 - 1 = 31$.`,
    family: "induction",
    verifiedBy: ["exhaustive-search", "formula"],
  },
];
