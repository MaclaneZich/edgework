import type { Problem } from "../types";

/**
 * Module 1: Counting and complements.
 * 28 practice problems (d1: 4, d2: 7, d3: 9, d4: 5, d5: 3) and four lesson checks.
 * Every answer is confirmed by at least two independent routes in content/verify/m1.ts.
 */
export const problems: Problem[] = [
  {
    id: "m1-p01",
    module: 1,
    kind: "practice",
    difficulty: 1,
    tags: ["permutations"],
    minutes: 2,
    title: "Door code with distinct digits",
    prompt: String.raw`A lab door opens with a 4-digit code. Each position can be any digit from 0 to 9. How many codes use four *different* digits?`,
    answer: { type: "numeric", value: 5040, exact: "10 \\cdot 9 \\cdot 8 \\cdot 7 = 5040" },
    hints: [
      "Build the code one position at a time and count the choices at each step.",
      "The first digit has 10 options. Once it is fixed, how many are left for the second?",
      "Multiply the number of options for each of the four positions.",
    ],
    solution: String.raw`Fill the four positions in order. The first digit can be any of 10 values. The second must differ from the first, so 9 remain. The third avoids two digits, leaving 8, and the fourth avoids three, leaving 7.

By the multiplication rule the count is $10 \cdot 9 \cdot 8 \cdot 7 = 5040$. This is the number of ordered arrangements of 4 items chosen from 10, written $P(10,4) = \frac{10!}{6!}$.`,
    steps: [
      "Recognise an ordered selection without repetition.",
      "Count options position by position: 10, 9, 8, 7.",
      "Multiply to get 5040.",
    ],
    keyIdea: "Ordered choices without repetition multiply with one fewer option each step.",
    commonMistake: "Using $10^4$ (which allows repeats) or $\\binom{10}{4}$ (which ignores order).",
    fastPath: "Say 'ten times nine times eight times seven' and compute 90 times 56 = 5040.",
    variation: "Now the code must use four different digits and cannot start with 0. How many codes?",
    variationAnswer: String.raw`First digit has 9 options (1-9); then 9, 8, 7 remain for the rest: $9 \cdot 9 \cdot 8 \cdot 7 = 4536$.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m1-p02",
    module: 1,
    kind: "practice",
    difficulty: 2,
    tags: ["complement", "dice"],
    minutes: 2,
    title: "At least one five in five rolls",
    prompt: String.raw`You roll a fair six-sided die five times. What is the probability that at least one roll shows a 5?`,
    answer: {
      type: "numeric",
      value: 1 - Math.pow(5 / 6, 5),
      exact: "1 - \\left(\\tfrac{5}{6}\\right)^5 = \\tfrac{4651}{7776} \\approx 0.598",
    },
    hints: [
      "'At least one' is a signal to look at the opposite event.",
      "What is the probability that a single roll is not a 5? The rolls are independent.",
      "Subtract the probability of zero fives from 1.",
    ],
    solution: String.raw`Counting the ways to get one, two, three, four or five fives is tedious. The complement is a single event: *no roll shows a 5*.

Each roll avoids a 5 with probability $\frac{5}{6}$, and the rolls are independent, so the probability that all five avoid it is $\left(\frac{5}{6}\right)^5 = \frac{3125}{7776}$.

Therefore the probability of at least one 5 is $1 - \frac{3125}{7776} = \frac{4651}{7776} \approx 0.598$.`,
    steps: [
      "Translate 'at least one' into 'one minus the probability of none'.",
      "Use independence to multiply the per-roll miss probability five times.",
      "Subtract from 1.",
    ],
    keyIdea: "'At least one' almost always means compute the complement 'none' and subtract.",
    commonMistake: "Adding $\\frac{1}{6}$ five times to get $\\frac{5}{6}$; the events overlap, so simple addition overcounts.",
    fastPath: String.raw`Square twice, then one more factor: $(5/6)^2 \approx 0.694$, so $(5/6)^4 \approx 0.694^2 \approx 0.482$ and $(5/6)^5 \approx 0.482 \cdot 0.833 \approx 0.402$. Answer $1 - 0.402 \approx 0.60$.`,
    variation: "How many rolls do you need before the probability of at least one 5 exceeds one half?",
    variationAnswer: String.raw`Need $(5/6)^n < 1/2$, so $n > \ln 2 / \ln(6/5) \approx 3.8$; four rolls (probability $\approx 0.518$).`,
    family: "at-least-one",
    verifiedBy: ["enumeration", "simulation"],
  },

  // ---------------------------------------------------------------- difficulty 1
  {
    id: "m1-p03",
    module: 1,
    kind: "practice",
    difficulty: 1,
    tags: ["permutations"],
    minutes: 1,
    title: "Trader handles with repeats allowed",
    prompt: String.raw`A clearing system gives every trader a handle made of one uppercase letter (A to Z) followed by two digits (0 to 9). Letters and digits may repeat, and a leading zero in the digits is allowed. How many different handles are possible?`,
    answer: { type: "numeric", value: 2600, exact: String.raw`26 \cdot 10 \cdot 10 = 2600` },
    hints: [
      "Each position is filled independently of the others. Count the options for each position.",
      "The letter has 26 options. Each digit slot has 10, and a repeated digit is allowed, so nothing is removed.",
      "Multiply 26 by 10 by 10.",
    ],
    solution: String.raw`Build a handle one position at a time. The letter slot has 26 options. Because repeats are allowed, the first digit slot has all 10 digits available whatever letter was chosen, and the second digit slot again has all 10, whatever the first digit was.

The multiplication rule says that when a choice is made in stages and the number of options at each stage does not depend on the earlier choices, the total is the product. Here that gives $26 \cdot 10 \cdot 10 = 2600$ handles.

Contrast this with the no-repeats case: if the two digits had to differ, the second digit slot would have only 9 options and the count would drop to $26 \cdot 10 \cdot 9 = 2340$. The phrase 'may repeat' is what keeps every slot at full size. Answer: $2600$.`,
    steps: [
      "Identify the slots: one letter, two digits.",
      "Count the options in each slot: 26, 10, 10 (repeats allowed, so nothing shrinks).",
      "Multiply to get 2600.",
    ],
    keyIdea: "Independent slots with repeats allowed multiply at full size: $n^k$ for $k$ slots of $n$ options.",
    commonMistake: "Shrinking the second digit slot to 9 out of habit from no-repeat problems, giving 2340 instead of 2600.",
    fastPath: "Twenty-six times one hundred. Done.",
    variation: "Now the two digits must be different. How many handles?",
    variationAnswer: String.raw`$26 \cdot 10 \cdot 9 = 2340$: the second digit slot loses one option.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m1-p04",
    module: 1,
    kind: "practice",
    difficulty: 1,
    tags: ["permutations"],
    minutes: 2,
    title: "Order log with repeated symbols",
    prompt: String.raw`A trader sent exactly seven orders today: four buys, two sells and one cancel. The log records them in time order as a string of seven symbols, each B, S or C. How many different strings could the log show?`,
    answer: { type: "numeric", value: 105, exact: String.raw`\frac{7!}{4!\,2!\,1!} = 105` },
    hints: [
      "The seven symbols are not all different, so plain $7!$ overcounts. Think about which positions the buys occupy.",
      "Choose the 4 positions for the B's out of 7, then choose the 2 positions for the S's out of the remaining 3. The C takes the one position left over.",
      String.raw`$\binom{7}{4}\binom{3}{2} = 35 \cdot 3$.`,
    ],
    solution: String.raw`If the seven symbols were all distinct there would be $7! = 5040$ orderings. They are not: swapping two B's changes nothing. Each distinct string is counted $4!$ times by the swaps of the B's and $2!$ times by the swaps of the S's, so the number of distinct strings is $\frac{7!}{4!\,2!\,1!} = \frac{5040}{24 \cdot 2} = 105$.

A second route avoids the division. A string is determined by which positions hold the B's and which hold the S's: choose the 4 positions for the B's in $\binom{7}{4} = 35$ ways, then the 2 positions for the S's among the remaining 3 in $\binom{3}{2} = 3$ ways. The cancel takes whatever position is left. That gives $35 \cdot 3 = 105$ again.

Both routes compute the multinomial coefficient $\binom{7}{4,\,2,\,1}$. Answer: $105$.`,
    steps: [
      "Notice the repeated symbols: 7! overcounts.",
      "Divide by 4! for the buys and 2! for the sells, or place the buys then the sells with binomials.",
      "Compute 5040 / 48 = 105 (or 35 times 3).",
    ],
    keyIdea: "Arrangements of a multiset: divide $n!$ by the factorial of each repeat count.",
    commonMistake: String.raw`Dividing by $4! + 2!$ instead of $4! \cdot 2!$, forgetting one of the repeated groups, or answering $3^7$, which counts strings with any mix of symbols.`,
    fastPath: String.raw`Place the buys: $\binom{7}{4} = 35$. Place the sells in the 3 free spots: 3 ways. $35 \cdot 3 = 105$.`,
    variation: "The cancel is known to be the last order of the day. How many strings now?",
    variationAnswer: String.raw`Arrange four B's and two S's in the first six positions: $\binom{6}{2} = 15$.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m1-p05",
    module: 1,
    kind: "practice",
    difficulty: 1,
    tags: ["combinations"],
    minutes: 1,
    title: "Handshakes at the dinner",
    prompt: String.raw`Twelve people attend a conference dinner. At the start, every attendee shakes hands exactly once with every other attendee. How many handshakes take place?`,
    answer: { type: "numeric", value: 66, exact: String.raw`\binom{12}{2} = 66` },
    hints: [
      "A handshake is an unordered pair of people.",
      "Each of the 12 people shakes 11 hands. Does that count every handshake once?",
      String.raw`Divide 12 times 11 by 2, or compute $\binom{12}{2}$.`,
    ],
    solution: String.raw`Each handshake involves exactly two people and no pair shakes twice, so handshakes correspond one-to-one with unordered pairs of attendees. The number of unordered pairs from 12 people is $\binom{12}{2} = \frac{12 \cdot 11}{2} = 66$.

The division by 2 is the whole story. If you count '12 people, 11 handshakes each', you reach $132$, but every handshake has been counted twice, once from each participant's side. Halving gives $66$.

A third view: the first person shakes 11 hands, the second shakes 10 new hands, and so on down to the eleventh person shaking 1 new hand: $11 + 10 + \dots + 1 = 66$. Answer: $66$.`,
    steps: [
      "Recognise handshakes as unordered pairs.",
      "Count ordered pairs: 12 times 11 = 132.",
      "Halve to remove the double count: 66.",
    ],
    keyIdea: String.raw`Unordered pairs: $\binom{n}{2} = n(n-1)/2$.`,
    commonMistake: String.raw`Forgetting to halve (answering 132), or using $12 \cdot 12 = 144$ as if people could shake their own hand.`,
    fastPath: "Twelve times eleven is 132; half is 66.",
    variation: "Three of the twelve arrive late. The nine early arrivals shake hands among themselves, and each late arrival shakes hands only with the nine who were already there. How many handshakes now?",
    variationAnswer: String.raw`$\binom{9}{2} + 3 \cdot 9 = 36 + 27 = 63$.`,
    verifiedBy: ["enumeration", "formula"],
  },

  // ---------------------------------------------------------------- difficulty 2
  {
    id: "m1-p06",
    module: 1,
    kind: "practice",
    difficulty: 2,
    tags: ["permutations"],
    minutes: 2,
    title: "Round table for the risk committee",
    prompt: String.raw`The seven members of a risk committee sit at a round table with seven identical seats. Two seatings are considered the same if one can be rotated into the other. How many different seatings are there?`,
    answer: { type: "numeric", value: 720, exact: String.raw`(7-1)! = 6! = 720` },
    hints: [
      "Rotating everyone one seat to the left does not change the seating. How many rotations does a round table of 7 have?",
      "Each seating in a row-of-seven count corresponds to 7 rotations of the same circular seating.",
      "Divide $7!$ by 7, or fix one person's seat and arrange the other six.",
    ],
    solution: String.raw`Start by pretending the seats are numbered 1 to 7. Then there are $7! = 5040$ ways to assign people to seats. Now erase the numbers. Rotating a seating by one seat gives a different numbered assignment but the same circular seating, and there are 7 rotations (including the trivial one), so each circular seating has been counted exactly 7 times. The number of circular seatings is $\frac{7!}{7} = 6! = 720$.

The cleaner way to see it: because only relative positions matter, sit the committee chair (or any one member) in any seat; that seat becomes the reference point. The remaining six members fill the six remaining seats in $6! = 720$ ways, and no two of those are rotations of each other because the committee chair is pinned.

Two things to watch. Reflections are *not* identified here (a mirror-image seating counts as different), so we do not halve again. And the seats are identical; if they were different chairs, the answer would go back to $7!$. Answer: $720$.`,
    steps: [
      "Fix one person to kill the rotational symmetry.",
      "Arrange the remaining 6 people in the remaining seats.",
      "Answer 6! = 720, equivalently 7!/7.",
    ],
    keyIdea: "Circular arrangements of $n$ distinct people: $(n-1)!$, because rotations are the same seating.",
    commonMistake: "Answering $7! = 5040$ (forgetting rotations) or halving to 360 (treating mirror images as the same, which the problem does not ask for).",
    fastPath: "Pin one seat, arrange six: 720.",
    variation: "The committee chair and the deputy insist on sitting next to each other. How many seatings?",
    variationAnswer: String.raw`Glue them into one block (2 internal orders), then seat 6 units around the table: $2 \cdot 5! = 240$.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m1-p07",
    module: 1,
    kind: "practice",
    difficulty: 2,
    tags: ["combinations"],
    minutes: 2,
    title: "Audit team with a fixed lead",
    prompt: String.raw`A four-person audit team is chosen from a pool of 10 analysts. The lead analyst must be on the team, and one other analyst is on leave and cannot be chosen. The team has no roles beyond that. How many different teams are possible?`,
    answer: { type: "numeric", value: 56, exact: String.raw`\binom{8}{3} = 56` },
    hints: [
      "Handle the constrained people first: one is forced in, one is forced out.",
      "After placing the lead and removing the analyst on leave, how many seats are left to fill, and from how many people?",
      "Choose 3 more from the 8 unconstrained analysts.",
    ],
    solution: String.raw`Deal with the constraints before counting anything. The lead analyst is on the team, so one of the four seats is already taken. The analyst on leave is unavailable, so remove them from the pool. That leaves $10 - 2 = 8$ ordinary analysts and $4 - 1 = 3$ open seats.

The team has no roles, so the open seats are filled by an unordered choice of 3 from 8: $\binom{8}{3} = \frac{8 \cdot 7 \cdot 6}{6} = 56$.

It is worth seeing why this is not $\binom{9}{3}$ or $\binom{8}{4}$. The pool of eligible people is 8, not 9, because the analyst on leave is gone; and we choose 3, not 4, because the lead already fills a seat. Answer: $56$.`,
    steps: [
      "Place the forced member; remove the excluded one.",
      "Count what remains: 8 eligible analysts, 3 open seats.",
      "Compute C(8,3) = 56.",
    ],
    keyIdea: "Satisfy must-include and must-exclude constraints first, then count the free choices.",
    commonMistake: "Choosing from 9 instead of 8 (forgetting to remove the excluded analyst), or choosing 4 instead of 3 (forgetting the lead already has a seat).",
    fastPath: "Eight choose three is 56; recall it or compute 8 times 7 times 6 over 6.",
    variation: "Drop both constraints: nobody is on leave and no one is forced onto the team. Instead, the team of four must include at least one of two particular senior analysts. How many teams can be chosen from the 10?",
    variationAnswer: String.raw`All teams minus teams with neither senior: $\binom{10}{4} - \binom{8}{4} = 210 - 70 = 140$.`,
    family: "committee",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m1-p08",
    module: 1,
    kind: "practice",
    difficulty: 2,
    tags: ["stars-and-bars"],
    minutes: 2,
    title: "Ten identical lots across four desks",
    prompt: String.raw`A portfolio manager must spread 10 identical lots of a bond across 4 desks. A desk may receive any whole number of lots, including zero, and all 10 lots must be placed. How many different allocations are there?`,
    answer: { type: "numeric", value: 286, exact: String.raw`\binom{10 + 4 - 1}{4 - 1} = \binom{13}{3} = 286` },
    hints: [
      "The lots are identical, so an allocation is just four non-negative counts that add to 10.",
      "Write the 10 lots as stars in a row and separate the desks with 3 bars. Every arrangement of stars and bars is one allocation.",
      String.raw`Count arrangements of 13 symbols where 3 are bars: $\binom{13}{3}$.`,
    ],
    solution: String.raw`Because the lots are indistinguishable, an allocation is a solution in non-negative integers to $x_1 + x_2 + x_3 + x_4 = 10$, where $x_i$ is the number of lots desk $i$ receives.

Picture the 10 lots as 10 stars in a row, and insert 3 bars to cut the row into 4 segments; the segments are the desks, left to right. A segment may be empty (two bars side by side, or a bar at an end), which is exactly the 'zero lots' case. Every string of 10 stars and 3 bars is one allocation and every allocation is one string, so the count is the number of ways to choose which 3 of the 13 positions hold bars: $\binom{13}{3} = \frac{13 \cdot 12 \cdot 11}{6} = 286$.

The general rule: $k$ identical items into $n$ bins with empty bins allowed is $\binom{k + n - 1}{n - 1}$. Answer: $286$.`,
    steps: [
      "Translate to non-negative integer solutions of x1 + x2 + x3 + x4 = 10.",
      "Model as 10 stars and 3 bars in a row.",
      "Count bar positions: C(13,3) = 286.",
    ],
    keyIdea: "Identical items into distinct bins: choose where the $n-1$ bars go among $k + n - 1$ symbols.",
    commonMistake: String.raw`Using $\binom{13}{4}$ (wrong number of bars) or $4^{10}$ (which treats the lots as distinct).`,
    fastPath: "Thirteen choose three: 13 times 12 times 11 is 1716, over 6 gives 286.",
    variation: "Every desk must receive at least one lot. How many allocations?",
    variationAnswer: String.raw`Hand one lot to each desk first, then distribute the remaining 6 freely: $\binom{6 + 3}{3} = \binom{9}{3} = 84$.`,
    family: "stars-and-bars",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m1-p09",
    module: 1,
    kind: "practice",
    difficulty: 2,
    tags: ["complement", "urns"],
    minutes: 2,
    title: "At least one red token",
    prompt: String.raw`A bag holds 5 red and 7 blue tokens. You draw 3 tokens at random without replacement. What is the probability that at least one of the three is red?`,
    answer: {
      type: "numeric",
      value: 37 / 44,
      exact: String.raw`1 - \frac{\binom{7}{3}}{\binom{12}{3}} = 1 - \frac{35}{220} = \frac{37}{44} \approx 0.841`,
    },
    hints: [
      "'At least one red' has three cases. Its opposite has one.",
      "Count the 3-token draws that are all blue, and count all possible 3-token draws.",
      String.raw`$1 - \binom{7}{3}/\binom{12}{3}$.`,
    ],
    solution: String.raw`Every 3-subset of the 12 tokens is equally likely, so probabilities are ratios of counts. There are $\binom{12}{3} = 220$ possible draws.

The event 'at least one red' splits into one, two or three reds, which is three separate counts. Its complement, 'no red at all', is a single clean count: all three tokens blue, which can happen in $\binom{7}{3} = 35$ ways.

So the probability of no red is $\frac{35}{220} = \frac{7}{44}$, and the probability of at least one red is $1 - \frac{7}{44} = \frac{37}{44} \approx 0.841$.

As a check, the direct count gives $\binom{5}{1}\binom{7}{2} + \binom{5}{2}\binom{7}{1} + \binom{5}{3} = 105 + 70 + 10 = 185$, and $\frac{185}{220} = \frac{37}{44}$, the same answer. Answer: $\frac{37}{44} \approx 0.841$.`,
    steps: [
      "Flip 'at least one red' to 'no red'.",
      "Count all-blue draws: C(7,3) = 35; count all draws: C(12,3) = 220.",
      "Subtract the ratio from 1: 37/44.",
    ],
    keyIdea: "'At least one' means count the complement 'none' as a ratio of combinations and subtract from 1.",
    commonMistake: String.raw`Treating the draws as independent and writing $1 - (7/12)^3$; without replacement you need the ratio of combinations, or the product $\frac{7}{12}\cdot\frac{6}{11}\cdot\frac{5}{10}$.`,
    fastPath: String.raw`Sequential: $\frac{7}{12}\cdot\frac{6}{11}\cdot\frac{5}{10} = \frac{7}{44}$ is the all-blue chance; answer $\frac{37}{44}$.`,
    variation: "Same bag, but each token is put back before the next draw (with replacement). Probability of at least one red in three draws?",
    variationAnswer: String.raw`$1 - (7/12)^3 = 1 - \frac{343}{1728} = \frac{1385}{1728} \approx 0.802$.`,
    family: "at-least-one",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m1-p10",
    module: 1,
    kind: "practice",
    difficulty: 2,
    tags: ["combinations"],
    minutes: 2,
    title: "Shortest routes for a delivery robot",
    prompt: String.raw`A delivery robot starts at the south-west corner of a rectangular street grid and must reach the north-east corner, which is 5 blocks east and 4 blocks north. It only ever moves one block east or one block north at a time, so every route it takes is a shortest route. How many different routes are there?`,
    answer: { type: "numeric", value: 126, exact: String.raw`\binom{9}{4} = \binom{9}{5} = 126` },
    hints: [
      "Every route is a sequence of 9 moves. How many of them are 'east'?",
      "A route is determined by which 4 of the 9 moves are 'north'.",
      String.raw`$\binom{9}{4}$.`,
    ],
    solution: String.raw`Any shortest route uses exactly 5 east moves and 4 north moves, in some order, for 9 moves in total. Write the route as a string of 9 letters, E or N, with exactly 4 N's. Each such string is a different route and every route gives such a string.

So count the strings: choose which 4 of the 9 positions hold the N's, $\binom{9}{4} = \frac{9 \cdot 8 \cdot 7 \cdot 6}{24} = 126$. Choosing the 5 E positions instead gives $\binom{9}{5}$, the same number.

Another way to see it is the grid recursion: the number of routes to an intersection equals the routes to the intersection just west of it plus the routes to the one just south, because the last move came from one of those two. Filling the grid from the start with that rule reaches 126 at the far corner. Answer: $126$.`,
    steps: [
      "Encode a route as a string of 5 E's and 4 N's.",
      "Count strings by choosing the positions of the N's.",
      "C(9,4) = 126.",
    ],
    keyIdea: "A monotone lattice path is a word in E and N; counting paths is counting positions for one letter.",
    commonMistake: String.raw`Counting intersections instead of blocks and using $\binom{8}{4}$ or $\binom{10}{5}$, or answering $5 \cdot 4 = 20$.`,
    fastPath: "Nine choose four: 9 times 8 times 7 times 6 = 3024, over 24 gives 126.",
    variation: "The robot must pass through the intersection 2 blocks east and 2 blocks north of the start. How many routes?",
    variationAnswer: String.raw`Routes to the waypoint times routes from it: $\binom{4}{2} \cdot \binom{5}{3} = 6 \cdot 10 = 60$.`,
    verifiedBy: ["dp", "formula"],
  },
  {
    id: "m1-p11",
    module: 1,
    kind: "practice",
    difficulty: 2,
    tags: ["permutations"],
    minutes: 2,
    title: "Two volumes that must stay together",
    prompt: String.raw`Six different reference books are to be arranged in a row on a shelf. Two of them are the two volumes of the same handbook and must be placed side by side, in either order. How many arrangements are possible?`,
    answer: { type: "numeric", value: 240, exact: String.raw`2 \cdot 5! = 240` },
    hints: [
      "Treat the two volumes as a single object while you place things.",
      "How many objects are you arranging now, and how many ways can the pair be ordered internally?",
      "$5!$ arrangements of the block and four other books, times 2 for the order inside the block.",
    ],
    solution: String.raw`Glue the two volumes into one block. Now there are 5 objects on the shelf: the block and the four other books. Five distinct objects can be ordered in $5! = 120$ ways.

Inside the block, the two volumes can be in either order (volume 1 on the left or volume 2 on the left), which doubles every arrangement: $2 \cdot 120 = 240$.

Sanity check against the total: there are $6! = 720$ arrangements in all, and the two volumes are adjacent in $\frac{240}{720} = \frac{1}{3}$ of them. That matches a direct count of positions: 5 adjacent pairs of shelf slots out of $\binom{6}{2} = 15$ possible slot pairs, also $\frac{1}{3}$. Answer: $240$.`,
    steps: [
      "Glue the adjacent pair into one block.",
      "Arrange 5 objects: 5! = 120.",
      "Multiply by 2 for the internal order: 240.",
    ],
    keyIdea: "Items that must be adjacent are one block; multiply by the number of internal orders of the block.",
    commonMistake: "Forgetting the factor of 2 for the internal order (answering 120), or arranging 6 objects instead of 5.",
    fastPath: "Five objects, 120 ways, doubled: 240.",
    variation: "Instead, three of the six books are the volumes of a three-volume set and must stay together (in any internal order); the other three books have no restriction. How many arrangements?",
    variationAnswer: String.raw`One block plus three other books: $4!$ arrangements, times $3!$ internal orders: $24 \cdot 6 = 144$.`,
    family: "arrangements-with-blocks",
    verifiedBy: ["enumeration", "formula"],
  },

  // ---------------------------------------------------------------- difficulty 3
  {
    id: "m1-p12",
    module: 1,
    kind: "practice",
    difficulty: 3,
    tags: ["permutations"],
    minutes: 4,
    title: "Keep the new hires apart",
    prompt: String.raw`Seven analysts line up in a row for a team photo. Three of them are new hires. How many lineups have no two new hires standing next to each other?`,
    answer: { type: "numeric", value: 1440, exact: String.raw`4! \cdot \binom{5}{3} \cdot 3! = 24 \cdot 10 \cdot 6 = 1440` },
    hints: [
      "Place the people who have no restriction first, then slot the restricted ones into the gaps.",
      "Four experienced analysts in a row create 5 gaps (including both ends). Each new hire needs a different gap.",
      String.raw`$4! \cdot \binom{5}{3} \cdot 3!$.`,
    ],
    solution: String.raw`Arrange the four experienced analysts first: $4! = 24$ ways. Their row creates 5 gaps where a new hire could stand: before the first, between each neighbouring pair (3 gaps), and after the last.

Two new hires are adjacent exactly when they share a gap. So 'no two adjacent' means the three new hires occupy three different gaps: choose the gaps in $\binom{5}{3} = 10$ ways, then decide which new hire goes in which chosen gap in $3! = 6$ ways.

By the multiplication rule the count is $24 \cdot 10 \cdot 6 = 1440$. Out of $7! = 5040$ lineups, that is a fraction $\frac{1440}{5040} = \frac{2}{7}$.

Why not complement counting here? 'At least two adjacent' includes the case where all three are together and the cases where exactly two are, which overlap awkwardly; the gap method handles every case at once. Answer: $1440$.`,
    steps: [
      "Arrange the 4 unrestricted analysts: 24 ways.",
      "Identify the 5 gaps they create.",
      "Choose 3 distinct gaps: C(5,3) = 10, and order the new hires in them: 6.",
      "Multiply: 1440.",
    ],
    keyIdea: "For 'no two adjacent', place the free items first and drop the restricted items into distinct gaps.",
    commonMistake: String.raw`Subtracting only the 'all three together' block count, $5! \cdot 3! = 720$, from $5040$; that ignores lineups where exactly two are adjacent.`,
    fastPath: String.raw`$24 \cdot 10 \cdot 6$: say 'twenty-four times sixty' and get 1440.`,
    variation: "The same seven analysts line up in a uniformly random order. What is the probability that at least two new hires are adjacent?",
    variationAnswer: String.raw`$1 - \frac{1440}{5040} = \frac{5}{7} \approx 0.714$.`,
    family: "arrangements-with-blocks",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m1-p13",
    module: 1,
    kind: "practice",
    difficulty: 3,
    tags: ["stars-and-bars"],
    minutes: 3,
    title: "Risk units with a floor per strategy",
    prompt: String.raw`A fund must place exactly 15 identical risk units across 4 strategies, and every strategy must receive at least 2 units. How many allocations are possible?`,
    answer: { type: "numeric", value: 120, exact: String.raw`\binom{15 - 8 + 3}{3} = \binom{10}{3} = 120` },
    hints: [
      "Give each strategy its mandatory minimum first.",
      "After handing out 2 units to each of the 4 strategies, how many units are left to distribute with no restriction?",
      String.raw`Stars and bars on the remaining 7 units: $\binom{7 + 3}{3}$.`,
    ],
    solution: String.raw`Let $x_i \ge 2$ be the units for strategy $i$, with $x_1 + x_2 + x_3 + x_4 = 15$. Pre-allocate the floor: give every strategy 2 units, using $8$ units in total. Set $y_i = x_i - 2 \ge 0$. Then $y_1 + y_2 + y_3 + y_4 = 15 - 8 = 7$ with no further restriction.

Non-negative solutions of a sum of 4 variables equal to 7 are counted by stars and bars: 7 stars and 3 bars, $\binom{7 + 3}{3} = \binom{10}{3} = 120$.

The substitution is the whole trick: a lower bound of $m$ on each of $n$ variables removes $mn$ from the total and then becomes a plain non-negative problem. With a floor of 1 instead of 2 the answer would be $\binom{14}{3} = 364$. Answer: $120$.`,
    steps: [
      "Pre-allocate the minimum of 2 to each strategy (8 units).",
      "Substitute y_i = x_i - 2 so the remaining 7 units are unrestricted.",
      "Stars and bars: C(10,3) = 120.",
    ],
    keyIdea: "Lower bounds in stars and bars: hand out the minimums first, then count the leftover freely.",
    commonMistake: String.raw`Subtracting the floor only once (using $15 - 2 = 13$) instead of once per strategy, or using $\binom{10}{4}$ with the wrong number of bars.`,
    fastPath: "Fifteen minus eight is seven; seven stars, three bars: ten choose three, 120.",
    variation: "Every strategy needs at least 1 unit instead of at least 2. How many allocations?",
    variationAnswer: String.raw`Remaining $15 - 4 = 11$ units: $\binom{11 + 3}{3} = \binom{14}{3} = 364$.`,
    family: "stars-and-bars",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m1-p14",
    module: 1,
    kind: "practice",
    difficulty: 3,
    tags: ["inclusion-exclusion", "complement"],
    minutes: 4,
    title: "A PIN with a seven and a zero",
    prompt: String.raw`A 4-digit PIN is generated by choosing each digit independently and uniformly at random from 0 to 9. Repeats and leading zeros are allowed. What is the probability that the PIN contains at least one 7 and at least one 0?`,
    answer: {
      type: "numeric",
      value: 974 / 10000,
      exact: String.raw`\frac{10^4 - 2 \cdot 9^4 + 8^4}{10^4} = \frac{974}{10000} = 0.0974`,
    },
    hints: [
      "Two 'at least one' conditions at once. Look at the complement: the PIN is missing a 7, or missing a 0, or both.",
      "Count PINs with no 7: $9^4$. With no 0: $9^4$. With neither digit: $8^4$. Combine them with inclusion-exclusion.",
      String.raw`Good PINs $= 10^4 - 9^4 - 9^4 + 8^4$.`,
    ],
    solution: String.raw`There are $10^4 = 10000$ equally likely PINs. Let $A$ be the set with no 7 and $B$ the set with no 0. The PIN we want avoids both $A$ and $B$, so count $|A \cup B|$ and subtract from the total.

$|A| = 9^4 = 6561$ (each digit from the nine non-7 digits), $|B| = 9^4 = 6561$, and $|A \cap B| = 8^4 = 4096$ (each digit from the eight digits that are neither 7 nor 0). Inclusion-exclusion gives $|A \cup B| = 6561 + 6561 - 4096 = 9026$.

So the number of PINs containing at least one 7 and at least one 0 is $10000 - 9026 = 974$, and the probability is $\frac{974}{10000} = 0.0974$.

A direct count confirms it. With $a \ge 1$ sevens, $b \ge 1$ zeros and the other $4 - a - b$ digits drawn from the remaining 8, the count is $\sum \frac{4!}{a!\,b!\,(4-a-b)!}\,8^{\,4-a-b}$ over the allowed pairs $(a,b)$: $(1,1)$ gives $12 \cdot 64 = 768$, $(2,1)$ and $(1,2)$ give $12 \cdot 8 = 96$ each, $(3,1)$ and $(1,3)$ give $4$ each, and $(2,2)$ gives $6$; total $768 + 96 + 96 + 4 + 4 + 6 = 974$. Answer: $0.0974$.`,
    steps: [
      "Name the bad events: no 7, no 0.",
      "Count each: 9^4 and 9^4; and their overlap: 8^4.",
      "Inclusion-exclusion for the union: 9026.",
      "Subtract from 10^4 and divide: 974/10000.",
    ],
    keyIdea: "Two 'at least one' requirements: subtract each failure, add back the double failure.",
    commonMistake: String.raw`Multiplying the two single probabilities, $(1 - 0.9^4)^2 \approx 0.118$, as if 'has a 7' and 'has a 0' were independent. They are not.`,
    fastPath: String.raw`$9^4 = 6561$ and $8^4 = 4096$ are worth memorising: $10000 - 13122 + 4096 = 974$.`,
    variation: "What is the probability the PIN contains at least one 7 or at least one 0 (or both)?",
    variationAnswer: String.raw`The complement is 'neither digit appears': $1 - 0.8^4 = 1 - 0.4096 = 0.5904$.`,
    family: "inclusion-exclusion",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m1-p15",
    module: 1,
    kind: "practice",
    difficulty: 3,
    tags: ["birthday", "complement"],
    minutes: 3,
    title: "Twelve orders, one hundred batch codes",
    prompt: String.raw`An exchange stamps each incoming order with a two-digit batch code from 00 to 99, chosen independently and uniformly at random. Twelve orders arrive. What is the probability that at least two of them receive the same batch code?`,
    answer: {
      type: "numeric",
      value:
        1 -
        (99 / 100) * (98 / 100) * (97 / 100) * (96 / 100) * (95 / 100) * (94 / 100) * (93 / 100) * (92 / 100) * (91 / 100) * (90 / 100) * (89 / 100),
      exact: String.raw`1 - \frac{100 \cdot 99 \cdot 98 \cdots 89}{100^{12}} = 1 - \prod_{i=0}^{11}\left(1 - \frac{i}{100}\right) \approx 0.4968`,
    },
    hints: [
      "'At least two share' is the complement of 'all twelve codes are different'.",
      "Assign codes one order at a time. The second order avoids the first with probability $99/100$, the third avoids both with $98/100$, and so on.",
      "Multiply the eleven shrinking fractions from $99/100$ down to $89/100$ and subtract from 1.",
    ],
    solution: String.raw`Direct counting of 'at least one shared code' is hopeless: pairs, triples and several different pairs at once all overlap. The complement, 'all twelve codes distinct', is one clean product.

The first order can have any code. The second order avoids the first order's code with probability $\frac{99}{100}$. Given the first two are distinct, the third avoids both with probability $\frac{98}{100}$. Continuing, the twelfth order avoids the eleven codes already used with probability $\frac{89}{100}$. By independence the probability that all twelve are distinct is $P(\text{all distinct}) = \frac{99}{100} \cdot \frac{98}{100} \cdots \frac{89}{100} = \frac{100!/88!}{100^{12}} \approx 0.5032$.

Therefore $P(\text{at least one shared code}) \approx 1 - 0.5032 = 0.4968$. Equivalently, the number of assignments with all codes distinct is $100 \cdot 99 \cdots 89$ out of $100^{12}$ equally likely assignments, and the answer is one minus that ratio.

For a fast estimate, $\ln P(\text{all distinct}) \approx -\sum_{i=1}^{11} \frac{i}{100} = -0.66$, so $P(\text{all distinct}) \approx e^{-0.66} \approx 0.517$ and the collision probability is roughly $0.48$. The exact value is a little higher because $\ln(1 - x) < -x$: each factor shrinks slightly more than the first-order estimate says. Answer: $\approx 0.4968$.`,
    steps: [
      "Flip to 'all 12 codes distinct'.",
      "Multiply the shrinking fractions 99/100 down to 89/100.",
      "Subtract from 1: about 0.497.",
    ],
    keyIdea: String.raw`Collision probability among $n$ draws from $N$ categories: $1 - \prod_{i=0}^{n-1}(1 - i/N) \approx 1 - e^{-n(n-1)/(2N)}$.`,
    commonMistake: String.raw`Answering $12/100$, or $\binom{12}{2}/100 = 0.66$; the pair count estimates the expected number of collisions, not a probability.`,
    fastPath: String.raw`$\binom{12}{2} = 66$ pairs, each colliding with chance $1/100$: $1 - e^{-0.66} \approx 0.48$; nudge upward to $\approx 0.50$.`,
    variation: "How many orders are needed before the probability of a shared code exceeds one half?",
    variationAnswer: String.raw`Twelve orders give $0.497$; thirteen give $1 - 0.5032 \cdot 0.88 \approx 0.557$. So 13 orders.`,
    family: "birthday",
    verifiedBy: ["formula", "simulation"],
  },
  {
    id: "m1-p16",
    module: 1,
    kind: "practice",
    difficulty: 3,
    tags: ["derangements"],
    minutes: 3,
    title: "Name tags handed back at random",
    prompt: String.raw`Five guests leave their name tags at reception. When they leave, the receptionist hands the five tags back in a uniformly random order, one tag per guest. What is the probability that no guest receives their own tag?`,
    answer: { type: "numeric", value: 11 / 30, exact: String.raw`\frac{D_5}{5!} = \frac{44}{120} = \frac{11}{30} \approx 0.367` },
    hints: [
      "A random hand-back of tags is a random permutation; 'no guest gets their own' means no fixed point.",
      "Count permutations of 5 with no fixed point using inclusion-exclusion on the events 'guest $i$ gets their own tag', or the recurrence $D_n = (n-1)(D_{n-1} + D_{n-2})$.",
      String.raw`$D_5 = 5!\left(1 - 1 + \frac{1}{2} - \frac{1}{6} + \frac{1}{24} - \frac{1}{120}\right) = 44$.`,
    ],
    solution: String.raw`Model the hand-back as a uniformly random permutation of the 5 tags; all $5! = 120$ permutations are equally likely. We want the number of derangements, permutations with no fixed point.

Inclusion-exclusion on the events $F_i$ = 'guest $i$ gets their own tag': the number of permutations with at least one fixed point is $\sum_{k \ge 1} (-1)^{k+1}\binom{5}{k}(5-k)! = 5 \cdot 24 - 10 \cdot 6 + 10 \cdot 2 - 5 \cdot 1 + 1 = 120 - 60 + 20 - 5 + 1 = 76$. So the number with no fixed point is $D_5 = 120 - 76 = 44$.

Dividing each term by $5!$ gives the familiar form: the probability is $\frac{D_5}{5!} = \sum_{k=0}^{5}\frac{(-1)^k}{k!} = 1 - 1 + \frac{1}{2} - \frac{1}{6} + \frac{1}{24} - \frac{1}{120} = \frac{44}{120} = \frac{11}{30} \approx 0.3667$.

As a check, the recurrence $D_n = (n-1)(D_{n-1} + D_{n-2})$ with $D_1 = 0$, $D_2 = 1$ gives $D_3 = 2$, $D_4 = 9$, $D_5 = 4(9 + 2) = 44$. And $\frac{11}{30}$ is already close to the limit $1/e \approx 0.3679$. Answer: $\frac{11}{30} \approx 0.367$.`,
    steps: [
      "Model as a uniform random permutation of 5 items.",
      "Count derangements: D_5 = 44 (inclusion-exclusion or recurrence).",
      "Divide by 5! = 120 to get 11/30.",
    ],
    keyIdea: String.raw`No fixed points: $D_n/n! = \sum_{k=0}^n (-1)^k/k!$, which is about $1/e$ for any $n \ge 4$.`,
    commonMistake: String.raw`Treating guests as independent and answering $(4/5)^5 \approx 0.328$; the assignments form a permutation, so the events are dependent.`,
    fastPath: String.raw`Know $D_5 = 44$ (the sequence 0, 1, 2, 9, 44, 265). $44/120 = 11/30$; or just say 'about $1/e$, slightly under $0.37$'.`,
    variation: "What is the probability that exactly one guest receives their own tag?",
    variationAnswer: String.raw`Choose the lucky guest (5 ways) and derange the other four ($D_4 = 9$): $\frac{5 \cdot 9}{120} = \frac{3}{8}$.`,
    family: "derangement",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m1-p17",
    module: 1,
    kind: "practice",
    difficulty: 3,
    tags: ["combinations", "cards"],
    minutes: 4,
    title: "A pair from a forty-card deck",
    prompt: String.raw`A custom deck has 40 cards: 8 ranks, each appearing in 5 suits. You are dealt 3 cards at random, every 3-card hand being equally likely. What is the probability that exactly two of the three cards share a rank, with the third card of a different rank?`,
    answer: {
      type: "numeric",
      value: 70 / 247,
      exact: String.raw`\frac{8 \cdot \binom{5}{2} \cdot 35}{\binom{40}{3}} = \frac{2800}{9880} = \frac{70}{247} \approx 0.283`,
    },
    hints: [
      "Count hands, not sequences. How many 3-card hands are there in total?",
      "Build a pair hand: pick the paired rank, pick 2 of its 5 suits, then pick a third card of any other rank.",
      String.raw`$\dfrac{8 \cdot \binom{5}{2} \cdot 35}{\binom{40}{3}}$.`,
    ],
    solution: String.raw`The total number of 3-card hands is $\binom{40}{3} = \frac{40 \cdot 39 \cdot 38}{6} = 9880$, all equally likely.

Now count the favourable hands by construction. Choose the rank that appears twice: 8 ways. Choose which 2 of its 5 suits are in the hand: $\binom{5}{2} = 10$ ways. Choose the third card from the $40 - 5 = 35$ cards of the other seven ranks: 35 ways. Each pair hand is built exactly once by this recipe (the paired rank is determined by the hand), so there are $8 \cdot 10 \cdot 35 = 2800$ such hands.

The probability is $\frac{2800}{9880} = \frac{70}{247} \approx 0.2834$.

A common slip is to pick the third card from the 38 remaining cards instead of 35; that includes the three remaining cards of the paired rank and would count three-of-a-kind hands, each three times. Answer: $\frac{70}{247} \approx 0.283$.`,
    steps: [
      "Total hands: C(40,3) = 9880.",
      "Pick the pair rank (8), its two suits (C(5,2) = 10), and an off-rank third card (35).",
      "Divide: 2800/9880 = 70/247.",
    ],
    keyIdea: "Count a hand by choosing its structure in stages: rank, suits within the rank, then the rest from what remains.",
    commonMistake: "Choosing the third card from 38 cards instead of 35, which sneaks in three-of-a-kind hands.",
    fastPath: "2800 over 9880; divide both by 40 to get 70/247, about 0.28.",
    variation: "What is the probability that all three cards share a rank?",
    variationAnswer: String.raw`$\frac{8 \cdot \binom{5}{3}}{\binom{40}{3}} = \frac{80}{9880} = \frac{2}{247} \approx 0.0081$.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m1-p18",
    module: 1,
    kind: "practice",
    difficulty: 3,
    tags: ["combinations", "complement"],
    minutes: 4,
    title: "At least three quants on the panel",
    prompt: String.raw`A five-person review panel is drawn at random from 6 quants and 5 developers, with every 5-person subset of the 11 people equally likely. What is the probability that the panel contains at least 3 quants?`,
    answer: {
      type: "numeric",
      value: 281 / 462,
      exact: String.raw`\frac{\binom{6}{3}\binom{5}{2} + \binom{6}{4}\binom{5}{1} + \binom{6}{5}}{\binom{11}{5}} = \frac{281}{462} \approx 0.608`,
    },
    hints: [
      "'At least 3 quants' on a panel of 5 means exactly 3, 4 or 5 quants. Count each case.",
      "Exactly $k$ quants: choose $k$ of the 6 quants and $5-k$ of the 5 developers.",
      String.raw`$\dfrac{20 \cdot 10 + 15 \cdot 5 + 6 \cdot 1}{462}$.`,
    ],
    solution: String.raw`All $\binom{11}{5} = 462$ panels are equally likely, so the probability is a ratio of counts.

A panel with exactly $k$ quants has $k$ members chosen from the 6 quants and $5 - k$ from the 5 developers, for $\binom{6}{k}\binom{5}{5-k}$ panels. For $k = 3$: $\binom{6}{3}\binom{5}{2} = 20 \cdot 10 = 200$. For $k = 4$: $\binom{6}{4}\binom{5}{1} = 15 \cdot 5 = 75$. For $k = 5$: $\binom{6}{5}\binom{5}{0} = 6$. Total $200 + 75 + 6 = 281$.

So the probability is $\frac{281}{462} \approx 0.6082$.

Check via the complement, at most 2 quants: $k = 2$ gives $\binom{6}{2}\binom{5}{3} = 15 \cdot 10 = 150$, $k = 1$ gives $6 \cdot 5 = 30$, $k = 0$ gives $1$; that is $181$ panels, and $462 - 181 = 281$. Answer: $\frac{281}{462} \approx 0.608$.`,
    steps: [
      "Total panels: C(11,5) = 462.",
      "Count exactly 3, 4, 5 quants with products of binomials: 200, 75, 6.",
      "Add and divide: 281/462.",
    ],
    keyIdea: "Mixed-group selections are sums of products: choose from each group separately, then add over the allowed splits.",
    commonMistake: String.raw`Using $\binom{6}{3}\binom{8}{2}$ ('pick 3 quants then any 2 others'), which counts panels with 4 or 5 quants several times.`,
    fastPath: String.raw`Three products and a sum: $200 + 75 + 6 = 281$ over $462$. The complement ($150 + 30 + 1 = 181$) is no quicker here.`,
    variation: "What is the probability of exactly 3 quants?",
    variationAnswer: String.raw`$\frac{200}{462} = \frac{100}{231} \approx 0.433$.`,
    family: "committee",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m1-p19",
    module: 1,
    kind: "practice",
    difficulty: 3,
    tags: ["combinations", "permutations"],
    minutes: 4,
    title: "First-round pairings",
    prompt: String.raw`Ten players enter a knockout tournament. For the first round they are split into five matches of two players each. The matches are not numbered or ordered; only who plays whom matters. How many different sets of five matches are possible?`,
    answer: { type: "numeric", value: 945, exact: String.raw`\frac{10!}{2^5 \cdot 5!} = 9 \cdot 7 \cdot 5 \cdot 3 \cdot 1 = 945` },
    hints: [
      "Number the players 1 to 10 and take the lowest-numbered player who is not yet matched. How many opponents can they be given?",
      "After the first player is matched, 8 players remain and the same question repeats.",
      String.raw`$9 \cdot 7 \cdot 5 \cdot 3 \cdot 1$.`,
    ],
    solution: String.raw`Number the players 1 to 10. Player 1 must be in some match; their opponent can be any of the other 9 players. Remove that pair. The lowest-numbered remaining player has 7 possible opponents. Remove that pair, and the next lowest has 5, then 3, then 1. Because we always match 'the lowest unmatched player', each set of five matches is produced exactly once, so the count is $9 \cdot 7 \cdot 5 \cdot 3 \cdot 1 = 945$.

The division route gives the same thing. Line the 10 players up in $10!$ ways and pair positions (1,2), (3,4), and so on. Each set of matches is produced many times: the two players inside each match can swap ($2^5$ ways) and the five matches can be listed in any order ($5!$ ways). So the number of distinct match sets is $\frac{10!}{2^5 \cdot 5!} = \frac{3628800}{3840} = 945$.

The two traps are forgetting the $5!$ (treating the matches as labelled, which gives $113400$) or forgetting the $2^5$. Answer: $945$.`,
    steps: [
      "Match the lowest unmatched player: 9 choices, then 7, 5, 3, 1.",
      "Or: 10! orderings divided by 2^5 (swaps within matches) and 5! (order of matches).",
      "945.",
    ],
    keyIdea: String.raw`Perfect matchings of $2n$ people: $(2n-1)(2n-3)\cdots 1 = \frac{(2n)!}{2^n\, n!}$.`,
    commonMistake: String.raw`Dividing by $2^5$ but not by $5!$, which counts the matches as if they were played on five numbered courts.`,
    fastPath: "Nine times seven is 63, times five is 315, times three is 945.",
    variation: "If the pairings are drawn uniformly at random, what is the probability that two specific players meet in the first round?",
    variationAnswer: String.raw`Player A's opponent is uniform over the other 9 players: $\frac{1}{9}$.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m1-p20",
    module: 1,
    kind: "practice",
    difficulty: 3,
    tags: ["inclusion-exclusion"],
    minutes: 3,
    title: "Flagged order IDs",
    prompt: String.raw`Order IDs run from 1 to 600 inclusive. A compliance script flags every ID that is divisible by 3, by 4 or by 5; an ID divisible by more than one of these is still flagged only once. How many IDs are flagged?`,
    answer: { type: "numeric", value: 360, exact: String.raw`200 + 150 + 120 - 50 - 40 - 30 + 10 = 360` },
    hints: [
      "Adding the three counts (multiples of 3, of 4, of 5) double-counts IDs divisible by two of them.",
      "Subtract the pairwise overlaps (multiples of 12, 15 and 20), then add back the IDs divisible by all three (multiples of 60).",
      "$200 + 150 + 120 - 50 - 40 - 30 + 10$.",
    ],
    solution: String.raw`Let $A$, $B$, $C$ be the sets of IDs divisible by 3, 4 and 5. Among 1 to 600: $|A| = 600/3 = 200$, $|B| = 600/4 = 150$, $|C| = 600/5 = 120$. The sum $470$ counts an ID divisible by both 3 and 4 twice, so the overlaps must come off.

Pairwise overlaps are multiples of the least common multiples: $|A \cap B|$ counts multiples of 12, $600/12 = 50$; $|A \cap C|$ multiples of 15, $600/15 = 40$; $|B \cap C|$ multiples of 20, $600/20 = 30$. Subtracting all three removes an ID divisible by 3, 4 and 5 (a multiple of 60) three times after it was added three times, so it must be added back once: $|A \cap B \cap C| = 600/60 = 10$.

Inclusion-exclusion: $|A \cup B \cup C| = 200 + 150 + 120 - 50 - 40 - 30 + 10 = 360$. So 360 IDs are flagged and $240$ are not. Because 600 is a multiple of 60, every division came out exact; otherwise each term would be a floor.

A slick cross-check: over any block of 60 consecutive IDs, divisibility by 3, 4 and 5 behave like independent events with probabilities $\frac{1}{3}$, $\frac{1}{4}$, $\frac{1}{5}$, so the fraction divisible by none is $\frac{2}{3}\cdot\frac{3}{4}\cdot\frac{4}{5} = \frac{2}{5}$, leaving $\frac{3}{5} \cdot 600 = 360$ flagged. Answer: $360$.`,
    steps: [
      "Count multiples of 3, 4, 5: 200, 150, 120.",
      "Subtract pairwise overlaps via the lcm: multiples of 12, 15, 20.",
      "Add back multiples of 60.",
      "Total 360.",
    ],
    keyIdea: "Union of three sets: add singles, subtract pairs, add back the triple.",
    commonMistake: "Stopping after subtracting the pairwise overlaps (350) and forgetting to add the multiples of 60 back, or adding the three counts and never subtracting (470).",
    fastPath: String.raw`Fraction divisible by none is $\frac{2}{3}\cdot\frac{3}{4}\cdot\frac{4}{5} = \frac{2}{5}$ (valid because 3, 4, 5 are pairwise coprime and 600 is a multiple of 60): $600 - 240 = 360$.`,
    variation: "How many IDs from 1 to 600 are divisible by none of 3, 4 and 5?",
    variationAnswer: String.raw`$600 - 360 = 240$, which is also $600 \cdot \frac{2}{3}\cdot\frac{3}{4}\cdot\frac{4}{5} = 240$.`,
    family: "inclusion-exclusion",
    verifiedBy: ["enumeration", "formula"],
  },

  // ---------------------------------------------------------------- difficulty 4
  {
    id: "m1-p21",
    module: 1,
    kind: "practice",
    difficulty: 4,
    tags: ["stars-and-bars", "inclusion-exclusion"],
    minutes: 5,
    title: "Risk units with a cap per desk",
    prompt: String.raw`A trading book must allocate exactly 20 identical risk units across 4 desks. A desk may receive zero units, but no desk may hold more than 7 units. How many allocations are possible?`,
    answer: { type: "numeric", value: 161, exact: String.raw`\binom{23}{3} - 4\binom{15}{3} + 6\binom{7}{3} = 1771 - 1820 + 210 = 161` },
    hints: [
      "Upper bounds do not substitute away like lower bounds do. Count without the cap, then remove the allocations that break it.",
      "An allocation where desk 1 holds at least 8 units: give desk 1 eight units up front, then distribute the remaining 12 freely. Some allocations break the cap on two desks at once.",
      String.raw`$\binom{23}{3} - \binom{4}{1}\binom{15}{3} + \binom{4}{2}\binom{7}{3}$; three desks over the cap would need 24 units, impossible.`,
    ],
    solution: String.raw`Without the cap, the number of non-negative solutions of $x_1 + x_2 + x_3 + x_4 = 20$ is $\binom{20 + 3}{3} = \binom{23}{3} = 1771$. Now remove the allocations in which some desk holds 8 or more.

Let $E_i$ be the event 'desk $i$ holds at least 8'. To count $E_1$, pre-load desk 1 with 8 units and distribute the remaining 12 with no restriction: $\binom{12 + 3}{3} = \binom{15}{3} = 455$. By symmetry each $E_i$ has 455 allocations, for $4 \cdot 455 = 1820$ in total; but allocations where two desks both exceed the cap have now been subtracted twice.

For $E_1 \cap E_2$, pre-load both desks with 8 units (16 in total) and distribute the remaining 4: $\binom{4 + 3}{3} = \binom{7}{3} = 35$. There are $\binom{4}{2} = 6$ such pairs, so add back $6 \cdot 35 = 210$. Three desks over the cap would need at least 24 units, more than 20, so the higher terms vanish.

Inclusion-exclusion gives $1771 - 1820 + 210 = 161$ allocations. Note that $1820 > 1771$ is not a contradiction; it is the double counting that the add-back corrects. Answer: $161$.`,
    steps: [
      "Count with no cap: C(23,3) = 1771.",
      "Subtract allocations with a desk at 8 or more: 4 times C(15,3) = 1820.",
      "Add back two desks over the cap: 6 times C(7,3) = 210.",
      "Confirm three over is impossible; total 161.",
    ],
    keyIdea: "Upper bounds in stars and bars are handled by inclusion-exclusion on 'bin $i$ overflows'.",
    commonMistake: "Subtracting the single-overflow cases and stopping, which gives the impossible negative count 1771 - 1820 = -49; the pair term must come back.",
    fastPath: String.raw`Pattern: $\sum_k (-1)^k \binom{n}{k}\binom{S - k(c+1) + n - 1}{n - 1}$ with $n = 4$, $S = 20$, $c = 7$. Only $k = 0, 1, 2$ survive.`,
    variation: "Raise the cap to 9 units per desk. How many allocations?",
    variationAnswer: String.raw`$\binom{23}{3} - 4\binom{13}{3} + 6\binom{3}{3} = 1771 - 1144 + 6 = 633$.`,
    family: "stars-and-bars",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m1-p22",
    module: 1,
    kind: "practice",
    difficulty: 4,
    tags: ["inclusion-exclusion", "complement"],
    minutes: 5,
    title: "No empty hash bucket",
    prompt: String.raw`A hash function sends each of 6 distinct keys independently and uniformly at random into one of 4 buckets. What is the probability that every bucket ends up with at least one key?`,
    answer: {
      type: "numeric",
      value: 195 / 512,
      exact: String.raw`\frac{4^6 - 4 \cdot 3^6 + 6 \cdot 2^6 - 4 \cdot 1^6}{4^6} = \frac{1560}{4096} = \frac{195}{512} \approx 0.381`,
    },
    hints: [
      "'Every bucket non-empty' is a surjection from keys to buckets. Count the complement: at least one bucket empty.",
      "Assignments that avoid a particular set of $k$ buckets number $(4-k)^6$. Combine over $k$ with alternating signs.",
      String.raw`Good assignments $= 4^6 - \binom{4}{1}3^6 + \binom{4}{2}2^6 - \binom{4}{3}1^6$.`,
    ],
    solution: String.raw`There are $4^6 = 4096$ equally likely assignments of keys to buckets. Let $E_j$ be the event 'bucket $j$ is empty'. We want the assignments in none of the $E_j$.

Assignments that avoid a specific set of $k$ buckets send every key into the other $4 - k$ buckets: $(4-k)^6$ of them. Inclusion-exclusion over the $\binom{4}{k}$ choices of which buckets are empty gives the number of assignments with every bucket non-empty: $4^6 - \binom{4}{1}3^6 + \binom{4}{2}2^6 - \binom{4}{3}1^6 + \binom{4}{4}0^6$, that is $4096 - 2916 + 384 - 4 + 0 = 1560$.

So the probability is $\frac{1560}{4096} = \frac{195}{512} \approx 0.3809$.

Cross-check with Stirling numbers: the number of ways to partition 6 keys into 4 non-empty unlabelled groups is $S(6,4) = 65$, and labelling the groups with the 4 buckets multiplies by $4!$: $24 \cdot 65 = 1560$. Same count. Answer: $\frac{195}{512} \approx 0.381$.`,
    steps: [
      "Total assignments: 4^6 = 4096.",
      "Define 'bucket j empty'; assignments avoiding k given buckets: (4-k)^6.",
      "Alternate signs over k = 0..4: 4096 - 2916 + 384 - 4.",
      "Divide: 1560/4096 = 195/512.",
    ],
    keyIdea: String.raw`Surjections from $n$ items onto $k$ bins: $\sum_j (-1)^j \binom{k}{j}(k-j)^n$, also $k!\,S(n,k)$.`,
    commonMistake: String.raw`'Place one key in each bucket first, then the rest anywhere' counts, such as $4!\binom{6}{4}\cdot 4^2$; they count assignments where a bucket holds several keys more than once.`,
    fastPath: String.raw`Powers of small numbers: $3^6 = 729$, $2^6 = 64$. $4096 - 2916 + 384 - 4 = 1560$; divide by 4096.`,
    variation: "What is the probability that exactly one bucket is empty?",
    variationAnswer: String.raw`Choose the empty bucket (4 ways) and map 6 keys onto the other 3 with none empty: $3^6 - 3 \cdot 2^6 + 3 = 540$. Probability $\frac{4 \cdot 540}{4096} = \frac{135}{256} \approx 0.527$.`,
    family: "inclusion-exclusion",
    verifiedBy: ["enumeration", "dp"],
  },
  {
    id: "m1-p23",
    module: 1,
    kind: "practice",
    difficulty: 4,
    tags: ["derangements", "inclusion-exclusion"],
    minutes: 5,
    title: "Exactly two parcels delivered correctly",
    prompt: String.raw`A courier has 7 parcels for 7 different addresses, but the labels have come off, so the parcels are delivered in a uniformly random order, one parcel to each address. What is the probability that exactly 2 parcels reach their correct address?`,
    answer: { type: "numeric", value: 11 / 60, exact: String.raw`\frac{\binom{7}{2} D_5}{7!} = \frac{21 \cdot 44}{5040} = \frac{11}{60} \approx 0.183` },
    hints: [
      "Exactly two fixed points: pick which two parcels are correct, then make sure none of the other five is.",
      "The other five parcels must be deranged among their five addresses. How many derangements of 5 are there?",
      String.raw`$\binom{7}{2} \cdot D_5 / 7!$ with $D_5 = 44$.`,
    ],
    solution: String.raw`The delivery is a uniformly random permutation of 7 parcels; there are $7! = 5040$ of them. A permutation with exactly 2 fixed points is built in two independent steps: choose the 2 parcels that land correctly, $\binom{7}{2} = 21$ ways, and then arrange the remaining 5 parcels among their 5 addresses so that none is correct, which is a derangement of 5 items.

$D_5 = 5!\sum_{k=0}^{5}\frac{(-1)^k}{k!} = 120 - 120 + 60 - 20 + 5 - 1 = 44$ (or via $D_n = (n-1)(D_{n-1} + D_{n-2})$: $D_3 = 2$, $D_4 = 9$, $D_5 = 44$).

The count is $21 \cdot 44 = 924$, so the probability is $\frac{924}{5040} = \frac{11}{60} \approx 0.1833$.

The key word is 'exactly'. Choosing 2 correct parcels and letting the other 5 land anywhere, $\binom{7}{2} \cdot 5! = 2520$, counts permutations with 3 or more fixed points many times over, and gives the nonsense probability $\frac{1}{2}$. In general $P(\text{exactly } k \text{ fixed points}) = \frac{1}{k!}\cdot\frac{D_{n-k}}{(n-k)!} \approx \frac{e^{-1}}{k!}$. Answer: $\frac{11}{60} \approx 0.183$.`,
    steps: [
      "Choose the 2 correct parcels: C(7,2) = 21.",
      "Derange the other 5: D_5 = 44.",
      "Divide 21 times 44 = 924 by 7! = 5040.",
      "Simplify to 11/60.",
    ],
    keyIdea: String.raw`Exactly $k$ fixed points: $\binom{n}{k} D_{n-k}$; the word 'exactly' forces a derangement of the rest.`,
    commonMistake: String.raw`Using $5!$ instead of $D_5$ for the other five parcels, which allows extra correct deliveries and gives $1/2$.`,
    fastPath: String.raw`Approximation: $e^{-1}/2! \approx 0.184$. Exact: $21 \cdot 44 = 924$; $924/5040 = 11/60$.`,
    variation: "What is the probability that at least 2 parcels reach the correct address?",
    variationAnswer: String.raw`$1 - \frac{D_7}{7!} - \frac{7 D_6}{7!} = 1 - \frac{1854 + 1855}{5040} = \frac{1331}{5040} \approx 0.264$.`,
    family: "derangement",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m1-p24",
    module: 1,
    kind: "practice",
    difficulty: 4,
    tags: ["combinations"],
    minutes: 5,
    title: "Three teams of four, two people kept apart",
    prompt: String.raw`Twelve analysts are divided into three teams of four. The teams have no names or roles, so two divisions count as the same if they produce the same three groups of people. Two of the analysts, Priya and Tom, must not be on the same team. How many divisions are possible?`,
    answer: { type: "numeric", value: 4200, exact: String.raw`\binom{10}{3}\binom{7}{3} = 120 \cdot 35 = 4200` },
    hints: [
      "Unlabelled teams are the trap: the $12!/(4!)^3$ count treats the teams as team 1, 2, 3. Fix that first.",
      "A clean route: build Priya's team, then Tom's team. Because Priya and Tom are in different teams, those two teams are distinguishable and the third is whatever is left.",
      String.raw`Priya plus 3 of the 10 others (not Tom), then Tom plus 3 of the remaining 7: $\binom{10}{3}\binom{7}{3}$.`,
    ],
    solution: String.raw`Because Priya and Tom are in different teams, we can name the teams after them: 'Priya's team', 'Tom's team' and 'the other team'. That labelling is forced by the people, so there is no overcounting from team order.

Priya's team needs 3 more members chosen from the 10 analysts who are neither Priya nor Tom: $\binom{10}{3} = 120$. Tom's team needs 3 more from the 7 analysts still unassigned: $\binom{7}{3} = 35$. The remaining 4 form the third team automatically. Total $120 \cdot 35 = 4200$.

The subtraction route confirms it. With no restriction, there are $\frac{12!}{(4!)^3} = 34650$ ways to fill three *labelled* teams; dividing by $3!$ for the team order gives $5775$ divisions into unlabelled teams. Divisions with Priya and Tom together: fill their team with 2 of the other 10 ($\binom{10}{2} = 45$), then split the remaining 8 into two unlabelled teams of 4, $\frac{1}{2}\binom{8}{4} = 35$; that is $45 \cdot 35 = 1575$. So $5775 - 1575 = 4200$.

If you forget to divide by $3!$ you get $34650 - 9450 = 25200$, six times too large. Answer: $4200$.`,
    steps: [
      "Use Priya and Tom to label two of the teams.",
      "Fill Priya's team: C(10,3) = 120; fill Tom's team: C(7,3) = 35.",
      "Multiply: 4200 (or 5775 total minus 1575 together).",
    ],
    keyIdea: "Unlabelled equal-size groups: divide by the factorial of the number of groups, or let named people label the groups for you.",
    commonMistake: "Forgetting the division by 3! for unlabelled teams (25200), or dividing by 3! in the Priya-then-Tom construction where the teams are already distinguished (700).",
    fastPath: "Ten choose three is 120, seven choose three is 35; 120 times 35 = 4200.",
    variation: "Priya and Tom must be on the same team. How many divisions?",
    variationAnswer: String.raw`$\binom{10}{2} \cdot \frac{1}{2}\binom{8}{4} = 45 \cdot 35 = 1575$.`,
    family: "committee",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m1-p25",
    module: 1,
    kind: "practice",
    difficulty: 4,
    tags: ["combinations", "complement"],
    minutes: 5,
    title: "Routes around a closed intersection",
    prompt: String.raw`A courier walks on a city grid from the south-west corner to the north-east corner, 6 blocks east and 5 blocks north, moving one block east or one block north at each step. The intersection 3 blocks east and 2 blocks north of the start is closed and cannot be passed through. How many shortest routes avoid the closed intersection?`,
    answer: { type: "numeric", value: 262, exact: String.raw`\binom{11}{5} - \binom{5}{2}\binom{6}{3} = 462 - 200 = 262` },
    hints: [
      "Count all shortest routes, then subtract the ones that go through the closed intersection.",
      "A route through a point splits into a route to the point and a route from the point; multiply the two counts.",
      String.raw`$\binom{11}{5} - \binom{5}{2}\cdot\binom{6}{3}$.`,
    ],
    solution: String.raw`With no closure, a shortest route is a word with 6 E's and 5 N's: $\binom{11}{5} = 462$ routes.

A route passes through the closed point $(3, 2)$ exactly when its first 5 moves contain 3 E's and 2 N's and its last 6 moves contain 3 E's and 3 N's. The two parts can be chosen independently, so the number of routes through $(3,2)$ is $\binom{5}{2} \cdot \binom{6}{3} = 10 \cdot 20 = 200$.

Every route either passes through $(3,2)$ or avoids it, so the number of routes that avoid it is $462 - 200 = 262$.

The same answer comes from the grid recursion with the closed intersection zeroed out: give each intersection the value (routes from the west) plus (routes from the south), except the closed one, which gets 0; the far corner reads 262. Answer: $262$.`,
    steps: [
      "All routes: C(11,5) = 462.",
      "Routes through the closed point: C(5,2) to it times C(6,3) from it = 200.",
      "Subtract: 262.",
    ],
    keyIdea: "Routes through a point factor into 'to' times 'from'; avoid a point by subtracting those from the total.",
    commonMistake: String.raw`Computing the second leg with the wrong remaining distances (for example $\binom{5}{2}$ for both halves), or subtracting routes that merely pass next to the point.`,
    fastPath: "462 minus 10 times 20 is 262.",
    variation: "A second intersection, 2 blocks east and 4 blocks north of the start, is also closed. How many routes avoid both?",
    variationAnswer: String.raw`No route can visit both closed points (it would have to move west or south), so subtract both counts: $462 - 200 - \binom{6}{2}\binom{5}{1} = 462 - 200 - 75 = 187$.`,
    verifiedBy: ["dp", "formula"],
  },

  // ---------------------------------------------------------------- difficulty 5
  {
    id: "m1-p26",
    module: 1,
    kind: "practice",
    difficulty: 5,
    tags: ["inclusion-exclusion", "permutations"],
    minutes: 7,
    title: "Four teams in a row, no teammates together",
    prompt: String.raw`Four two-person teams, eight people in total, sit down in a single row of eight chairs in a uniformly random order. What is the probability that no team has its two members sitting next to each other?`,
    answer: {
      type: "numeric",
      value: 12 / 35,
      exact: String.raw`\frac{1}{8!}\sum_{k=0}^{4}(-1)^k\binom{4}{k}2^k(8-k)! = \frac{13824}{40320} = \frac{12}{35} \approx 0.343`,
    },
    hints: [
      "Let $T_i$ be the event 'team $i$ sits together'. You want the probability of none of them, which calls for inclusion-exclusion.",
      "If $k$ specific teams sit together, glue each into a block: $8 - k$ objects to arrange, times $2^k$ for the orders inside the blocks.",
      String.raw`$\sum_{k=0}^{4}(-1)^k\binom{4}{k}2^k(8-k)!$, then divide by $8!$.`,
    ],
    solution: String.raw`All $8! = 40320$ seatings are equally likely. Let $T_i$ be the event that the two members of team $i$ are adjacent. We want the number of seatings in none of $T_1, \dots, T_4$.

For any specific set of $k$ teams, the seatings in which all $k$ of those teams sit together are counted by gluing each such team into a block: there are $8 - k$ objects (the $k$ blocks and the $8 - 2k$ loose people) to arrange in $(8-k)!$ ways, and each block has 2 internal orders, giving $2^k(8-k)!$. There are $\binom{4}{k}$ ways to pick which $k$ teams.

Inclusion-exclusion: the number of seatings with no team together is $\sum_{k=0}^{4}(-1)^k\binom{4}{k}2^k(8-k)!$. Term by term that is $40320 - 4 \cdot 2 \cdot 5040 + 6 \cdot 4 \cdot 720 - 4 \cdot 8 \cdot 120 + 1 \cdot 16 \cdot 24$, which is $40320 - 40320 + 17280 - 3840 + 384 = 13824$.

So the probability is $\frac{13824}{40320} = \frac{12}{35} \approx 0.3429$. The $k = 1$ term exactly cancels the total, a coincidence of $4 \cdot 2 \cdot 7! = 8!$, so everything rides on the higher terms. Answer: $\frac{12}{35} \approx 0.343$.`,
    steps: [
      "Define T_i = team i adjacent; the target is none of the T_i.",
      "Count seatings with k given teams glued: C(4,k) 2^k (8-k)!.",
      "Alternate signs: 40320 - 40320 + 17280 - 3840 + 384 = 13824.",
      "Divide by 8!: 12/35.",
    ],
    keyIdea: "'No pair adjacent' for several pairs is inclusion-exclusion over glued blocks, with $2^k$ for the internal orders.",
    commonMistake: String.raw`Multiplying single-team probabilities as if independent, $(1 - \tfrac{1}{4})^4 \approx 0.316$, or forgetting the $2^k$ factor inside the blocks.`,
    fastPath: String.raw`Divide each term by $8!$ as you go: $1 - 1 + \tfrac{3}{7} - \tfrac{2}{21} + \tfrac{1}{105} = \tfrac{45 - 10 + 1}{105} = \tfrac{12}{35}$.`,
    variation: "The eight people sit at a round table instead (rotations are the same seating). What is the probability that no team is together?",
    variationAnswer: String.raw`Glue $k$ blocks around a circle: $2^k(7-k)!$ seatings for each choice of teams. $\frac{5040 - 5760 + 2880 - 768 + 96}{5040} = \frac{1488}{5040} = \frac{31}{105} \approx 0.295$.`,
    family: "arrangements-with-blocks",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m1-p27",
    module: 1,
    kind: "practice",
    difficulty: 5,
    tags: ["inclusion-exclusion", "permutations"],
    minutes: 7,
    title: "No back-to-back fills in the same symbol",
    prompt: String.raw`A desk made exactly six fills today, two in each of three symbols. The fills are written to a log in a uniformly random order, all $6!$ orderings of the six individual fills being equally likely. What is the probability that no two consecutive entries in the log are fills in the same symbol?`,
    answer: { type: "numeric", value: 1 / 3, exact: String.raw`\frac{90 - 3 \cdot 30 + 3 \cdot 12 - 6}{90} = \frac{30}{90} = \frac{1}{3}` },
    hints: [
      String.raw`Only the symbol pattern matters. Work with arrangements of the multiset with two each of three symbols; there are $\frac{6!}{2!\,2!\,2!} = 90$ patterns, all equally likely.`,
      "Let $A_X$ be 'the two X fills are adjacent'. Count patterns in $A_X$ by gluing XX into one symbol: arrangements of the multiset XX, Y, Y, Z, Z.",
      String.raw`Good patterns $= 90 - 3 \cdot \frac{5!}{2!\,2!} + 3 \cdot \frac{4!}{2!} - 3!$.`,
    ],
    solution: String.raw`Each of the $6!$ orderings of the individual fills produces a symbol pattern, a string with two X's, two Y's and two Z's, and every pattern arises from exactly $2!\,2!\,2! = 8$ orderings. So the $\frac{6!}{8} = 90$ patterns are equally likely, and we can count patterns.

Let $A_X$ be the set of patterns in which the two X's are adjacent, and similarly $A_Y$, $A_Z$. We want patterns in none of them. Glue the two X's into a single super-symbol: patterns in $A_X$ correspond to arrangements of the multiset $\{XX, Y, Y, Z, Z\}$, of which there are $\frac{5!}{2!\,2!} = 30$. The same count holds for $A_Y$ and $A_Z$.

Patterns in $A_X \cap A_Y$ are arrangements of $\{XX, YY, Z, Z\}$: $\frac{4!}{2!} = 12$, and likewise for each pair. Patterns in all three are arrangements of $\{XX, YY, ZZ\}$: $3! = 6$.

Inclusion-exclusion: patterns with no adjacent repeat number $90 - 3 \cdot 30 + 3 \cdot 12 - 6 = 30$. The probability is $\frac{30}{90} = \frac{1}{3}$.

The gluing works cleanly because at the pattern level the glued pair is a single new symbol with no internal order; the two X fills are interchangeable. If you count labelled orderings instead, each glued block gains a factor $2$ and the total gains $2!\,2!\,2!$, and everything cancels in the ratio. Answer: $\frac{1}{3}$.`,
    steps: [
      "Reduce to the 90 equally likely symbol patterns.",
      "Glue a pair: |A_X| = 5!/(2!2!) = 30; pairwise 4!/2! = 12; triple 3! = 6.",
      "Inclusion-exclusion: 90 - 90 + 36 - 6 = 30.",
      "Divide: 30/90 = 1/3.",
    ],
    keyIdea: "Adjacency constraints on repeated symbols: glue the repeats, count multiset arrangements, alternate signs.",
    commonMistake: String.raw`Using $5!$ for a glued pattern as if all symbols were distinct, or dividing the glued counts by an extra $2!$ for the internal order of the pair when the pattern-level count has none.`,
    fastPath: String.raw`Three symmetric events, so the sum is $90 - 3 \cdot 30 + 3 \cdot 12 - 6 = 30$; one third.`,
    variation: "The desk made five fills: two in each of two symbols and one in a third. What is the probability of no two consecutive same-symbol fills?",
    variationAnswer: String.raw`Patterns: $\frac{5!}{2!\,2!} = 30$. Glue one pair: $\frac{4!}{2!} = 12$ each; both pairs: $3! = 6$. Good $= 30 - 24 + 6 = 12$, probability $\frac{12}{30} = \frac{2}{5}$.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m1-p28",
    module: 1,
    kind: "practice",
    difficulty: 5,
    tags: ["combinations", "complement", "sample-space"],
    minutes: 8,
    title: "A price that never dips below the open",
    prompt: String.raw`Over a stretch of 12 ticks a stock moved up one tick exactly 6 times and down one tick exactly 6 times, so it finished where it started. Suppose every one of the $\binom{12}{6}$ orderings of those moves was equally likely. What is the probability that the price was never below its starting level at any point during the stretch? Touching the starting level is allowed.`,
    answer: {
      type: "numeric",
      value: 1 / 7,
      exact: String.raw`\frac{C_6}{\binom{12}{6}} = \frac{\binom{12}{6} - \binom{12}{7}}{\binom{12}{6}} = \frac{132}{924} = \frac{1}{7}`,
    },
    hints: [
      "Draw the path: 12 steps of $+1$ or $-1$ with 6 of each. You want paths whose running total never goes negative.",
      "Count the bad paths instead. A bad path touches level $-1$; reflect the part of the path up to its first visit to $-1$ across that level.",
      String.raw`Bad paths from $0$ to $0$ correspond one-to-one with all paths from $-2$ to $0$, which have 7 ups and 5 downs: $\binom{12}{7}$. Good paths $= \binom{12}{6} - \binom{12}{7}$.`,
    ],
    solution: String.raw`Represent the stretch as a path of 12 steps, each $+1$ (up) or $-1$ (down), with exactly 6 of each; there are $\binom{12}{6} = 924$ equally likely paths, all ending at level 0. We want the paths whose running total is never negative.

Count the complement. A bad path dips to $-1$ at some point. Take its first visit to $-1$ and reflect the initial segment (from the start up to that moment) across the line at level $-1$: the start moves from $0$ to $-2$ and the rest of the path is unchanged. This reflection is a bijection between bad paths from $0$ to $0$ and *all* paths from $-2$ to $0$ with 12 steps, because every path from $-2$ to $0$ must cross $-1$, so the inverse reflection is always defined. A path from $-2$ to $0$ in 12 steps needs 7 ups and 5 downs, so there are $\binom{12}{7} = 792$ bad paths.

Hence the good paths number $924 - 792 = 132$, which is the Catalan number $C_6 = \frac{1}{7}\binom{12}{6}$, and the probability is $\frac{132}{924} = \frac{1}{7} \approx 0.1429$.

For $n$ ups and $n$ downs the probability is $\frac{C_n}{\binom{2n}{n}} = \frac{1}{n+1}$, so the answer can be read off as $\frac{1}{6+1}$ once you recognise the Catalan structure. Answer: $\frac{1}{7}$.`,
    steps: [
      "Model as +1/-1 paths with 6 of each; total C(12,6) = 924.",
      "Bad paths touch -1; reflect the prefix up to the first touch.",
      "Bad paths biject with paths from -2 to 0: C(12,7) = 792.",
      "Good = 924 - 792 = 132 (Catalan); probability 1/7.",
    ],
    keyIdea: "Reflection principle: paths that cross a barrier biject with unrestricted paths from the reflected start, leaving Catalan numbers for 'never below'.",
    commonMistake: "Treating the 12 ticks as independent coin flips (they are conditioned on 6 up and 6 down), or requiring the path to stay strictly positive, which is a different count.",
    fastPath: String.raw`Balanced $\pm 1$ paths of length $2n$ that never go negative: probability $\frac{1}{n+1}$. Here $n = 6$.`,
    variation: "Same setup, but the stretch had 7 up-ticks and 5 down-ticks. What is the probability the price never dipped below its starting level?",
    variationAnswer: String.raw`Ballot count $\frac{a - b + 1}{a + 1}\binom{a+b}{a}$ with $a = 7$, $b = 5$: $\frac{3}{8}\cdot 792 = 297$ good paths out of $792$, probability $\frac{3}{8}$.`,
    verifiedBy: ["enumeration", "formula"],
  },

  // ---------------------------------------------------------------- lesson checks
  {
    id: "m1-lc1",
    module: 1,
    kind: "lessonCheck",
    difficulty: 1,
    tags: ["permutations"],
    minutes: 1,
    title: "Stack of five reports",
    prompt: String.raw`Five different audit reports are stacked in a single pile. How many different orders, from top to bottom, are possible?`,
    answer: { type: "numeric", value: 120, exact: "5! = 120" },
    hints: [
      "Choose the top report, then the next one down, and so on.",
      "5 options for the top, then 4, then 3, 2, 1.",
      "$5!$.",
    ],
    solution: String.raw`Fill the pile from the top. Any of the 5 reports can be on top; once it is placed, 4 remain for the second position, then 3, then 2, and finally 1 for the bottom.

By the multiplication rule the number of orders is $5 \cdot 4 \cdot 3 \cdot 2 \cdot 1 = 5! = 120$. This is the number of permutations of 5 distinct objects. Answer: $120$.`,
    steps: ["Recognise an ordering of distinct items.", "Multiply 5 times 4 times 3 times 2 times 1.", "Answer 120."],
    keyIdea: "Orderings of $n$ distinct items: $n!$.",
    commonMistake: "Answering $5^5 = 3125$, which would let one report appear in several positions at once.",
    fastPath: "Five factorial is 120.",
    variation: "The thickest report must be at the bottom. How many orders?",
    variationAnswer: "Fix the bottom and order the other four: $4! = 24$.",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m1-lc2",
    module: 1,
    kind: "lessonCheck",
    difficulty: 1,
    tags: ["combinations"],
    minutes: 1,
    title: "Two sectors to cover",
    prompt: String.raw`A junior trader is asked to cover 2 of the 7 sectors the desk follows. The two sectors are not ranked or ordered in any way. How many different choices does the trader have?`,
    answer: { type: "numeric", value: 21, exact: String.raw`\binom{7}{2} = 21` },
    hints: [
      "The pair is unordered: choosing energy then banks is the same as banks then energy.",
      "Count ordered pairs first: 7 times 6.",
      String.raw`Halve it, or compute $\binom{7}{2}$.`,
    ],
    solution: String.raw`An ordered choice would give $7 \cdot 6 = 42$ possibilities: 7 for the first sector and 6 for the second. But the assignment is a set of two sectors, so each unordered pair has been counted twice, once in each order.

Halving gives $\frac{42}{2} = 21$, which is $\binom{7}{2}$. Answer: $21$.`,
    steps: ["Spot that order does not matter.", "Count ordered pairs: 42.", "Divide by 2!: 21."],
    keyIdea: "Unordered selection of $k$ from $n$: divide the ordered count by $k!$.",
    commonMistake: "Leaving the answer at 42, the ordered count.",
    fastPath: "Seven times six over two: 21.",
    variation: "Now the trader covers 3 of the 7 sectors. How many choices?",
    variationAnswer: String.raw`$\binom{7}{3} = 35$.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m1-lc3",
    module: 1,
    kind: "lessonCheck",
    difficulty: 2,
    tags: ["complement", "coins"],
    minutes: 1,
    title: "At least one head in four flips",
    prompt: String.raw`A fair coin is flipped 4 times, the flips independent. What is the probability of getting at least one head?`,
    answer: { type: "numeric", value: 15 / 16, exact: String.raw`1 - \left(\tfrac{1}{2}\right)^4 = \tfrac{15}{16}` },
    hints: [
      "The opposite of 'at least one head' is 'no heads at all'.",
      "No heads means four tails in a row. Multiply the four probabilities.",
      "$1 - 1/16$.",
    ],
    solution: String.raw`The complement of 'at least one head' is 'all four flips are tails'. Because the flips are independent and fair, that has probability $\left(\frac{1}{2}\right)^4 = \frac{1}{16}$.

So the probability of at least one head is $1 - \frac{1}{16} = \frac{15}{16} = 0.9375$. Counting the sample space says the same: 16 equally likely sequences, and only TTTT has no head, so 15 of the 16 sequences qualify. Answer: $\frac{15}{16}$.`,
    steps: ["Flip to the complement: no heads.", "Probability of four tails: 1/16.", "Subtract from 1: 15/16."],
    keyIdea: "'At least one' is one minus 'none'.",
    commonMistake: String.raw`Adding $\frac{1}{2}$ four times, or answering $\frac{1}{2}$ because each flip is a coin toss.`,
    fastPath: "One minus one sixteenth.",
    variation: "The coin lands heads with probability 0.3 instead. What is the probability of at least one head in four flips?",
    variationAnswer: "$1 - 0.7^4 = 1 - 0.2401 = 0.7599$.",
    family: "at-least-one",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m1-lc4",
    module: 1,
    kind: "lessonCheck",
    difficulty: 2,
    tags: ["stars-and-bars"],
    minutes: 1,
    title: "Six coins into three jars",
    prompt: String.raw`Six identical coins are dropped into three distinguishable jars. A jar may stay empty. In how many different ways can the coins end up distributed among the jars?`,
    answer: { type: "numeric", value: 28, exact: String.raw`\binom{6 + 3 - 1}{3 - 1} = \binom{8}{2} = 28` },
    hints: [
      "The coins are identical, so only the three counts matter, and they add to 6.",
      "Picture six stars and two bars in a row; the bars split the stars into three jars.",
      String.raw`Choose the positions of the 2 bars among 8 symbols: $\binom{8}{2}$.`,
    ],
    solution: String.raw`A distribution is a triple of non-negative integers $(a, b, c)$ with $a + b + c = 6$. Represent it as 6 stars with 2 bars inserted: the stars before the first bar go to jar 1, those between the bars to jar 2, the rest to jar 3. Empty jars are allowed, which is exactly what adjacent bars (or a bar at an end) represent.

Every arrangement of 6 stars and 2 bars is one distribution, so the count is the number of ways to choose which 2 of the 8 positions are bars: $\binom{8}{2} = 28$. Answer: $28$.`,
    steps: ["Translate to a + b + c = 6 in non-negative integers.", "Stars and bars: 6 stars, 2 bars.", "C(8,2) = 28."],
    keyIdea: String.raw`$k$ identical items into $n$ distinct bins: $\binom{k + n - 1}{n - 1}$.`,
    commonMistake: "Answering $3^6 = 729$, which treats the coins as distinguishable.",
    fastPath: "Eight choose two: 28.",
    variation: "Every jar must get at least one coin. How many ways?",
    variationAnswer: String.raw`Place one coin in each jar first, then distribute 3 freely: $\binom{5}{2} = 10$.`,
    family: "stars-and-bars",
    verifiedBy: ["enumeration", "formula"],
  },
];
