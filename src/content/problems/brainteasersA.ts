import type { Problem } from "../types";

/**
 * Brainteaser bank, first half (bt-001 .. bt-040).
 * 40 items (d2: 8, d3: 17, d4: 11, d5: 4): trading-interview probability teasers, pigeonhole and
 * extremal counts, weighing puzzles, hat puzzles, number puzzles, grid and lattice counts.
 * Every answer is confirmed by content/verify/brainteasersA.ts.
 */
export const problems: Problem[] = [
  // ------------------------------------------------------------ probability teasers
  {
    id: "bt-001",
    module: 9,
    kind: "brainteaser",
    difficulty: 4,
    tags: ["expectation", "symmetry", "search-strategy"],
    minutes: 6,
    title: "Robots on a rail",
    prompt: String.raw`Five toy robots sit on a straight rail 100 cm long, at 10, 25, 50, 70 and 90 cm from the left end. At time zero each robot independently picks left or right with probability $\tfrac12$ and starts moving at 1 cm per second. When two robots meet they both reverse direction instantly and keep moving at the same speed. A robot that reaches either end drops off the rail. What is the expected time, in seconds, until the rail is empty?`,
    answer: { type: "numeric", value: 675 / 8, exact: String.raw`\tfrac{675}{8} = 84.375`, unit: "seconds" },
    hints: [
      "Two robots that meet and reverse are indistinguishable from two robots that pass straight through each other. Which quantity does that leave unchanged?",
      "Pretend the robots are ghosts that walk through one another. The rail is empty exactly when every ghost has walked off, so the clearing time is the largest of the five individual exit times.",
      "Each ghost exits after either $x$ or $100 - x$ seconds. Work out when the maximum is 90, 75, 70 or 50 and average.",
    ],
    solution: String.raw`The bounce rule looks like it creates a mess of interacting trajectories, but it does not change the set of positions occupied at any moment. When two robots meet and reverse, the pair of positions evolves exactly as it would if the two had walked through each other. Since we only care about when the rail becomes empty, and not about which robot is where, we may replace the robots by ghosts that never interact.

A ghost starting at $x$ walking left exits after $x$ seconds; walking right it exits after $100 - x$ seconds. The rail clears when the last ghost leaves, so the clearing time $T$ is the maximum of the five exit times. The possible exit times are 10 or 90 for the robot at 10, 25 or 75 for the one at 25, 50 either way for the middle one, 70 or 30 for the one at 70, and 90 or 10 for the one at 90.

$T = 90$ unless the robot at 10 goes left *and* the robot at 90 goes right, so $P(T = 90) = 1 - \tfrac14 = \tfrac34$. In the remaining quarter of cases those two robots are gone by time 10 and $T$ is the maximum of the other three: if the robot at 25 heads right (probability $\tfrac12$) then $T = 75$; otherwise $T = 70$ if the robot at 70 heads right and $T = 50$ if it heads left.

Putting it together:
$$E[T] = \tfrac34 \cdot 90 + \tfrac14\left(\tfrac12 \cdot 75 + \tfrac14 \cdot 70 + \tfrac14 \cdot 50\right) = 67.5 + \tfrac14 \cdot 67.5 = \tfrac{675}{8} = 84.375 \text{ seconds}.$$
The verification runs the honest event-driven simulation with bounces for all 32 direction choices and gets the same number, which is the whole point: the collisions are invisible to the clearing time.`,
    steps: [
      "Replace bounces by pass-throughs: the set of occupied positions is identical.",
      "Clearing time equals the latest exit time among non-interacting ghosts.",
      "List each robot's two possible exit times.",
      "Compute the distribution of the maximum case by case.",
      "Average: 675/8 = 84.375 seconds.",
    ],
    keyIdea: "A collision that swaps directions is the same as two walkers passing through each other, so track positions, not identities.",
    commonMistake: "Trying to follow the actual robots through their collisions, or assuming the answer is simply the worst case of 90 seconds.",
    fastPath: "Ghosts. The maximum is 90 unless the two outer robots both head inward (probability 1/4); handle that quarter by hand and average.",
    variation: "Same rail and start, but now ask: what is the probability that the rail is empty within 60 seconds?",
    variationAnswer: String.raw`All five ghost exit times must be at most 60: the robot at 10 must go left, the one at 90 right, the one at 25 left, the one at 70 right; the middle one is free. Probability $\left(\tfrac12\right)^4 = \tfrac{1}{16}$.`,
    family: "ants-on-stick",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "bt-002",
    module: 9,
    kind: "brainteaser",
    difficulty: 2,
    tags: ["birthday", "complement", "independence"],
    minutes: 3,
    title: "Orders landing on the same shard",
    prompt: String.raw`An exchange spreads incoming orders over 40 matching-engine shards. Each order is assigned a shard uniformly at random, independently of the others. Nine orders arrive in the same millisecond. What is the probability that at least two of them land on the same shard?`,
    answer: {
      type: "numeric",
      value: 1 - (40 * 39 * 38 * 37 * 36 * 35 * 34 * 33 * 32) / Math.pow(40, 9),
      exact: String.raw`1 - \frac{40 \cdot 39 \cdots 32}{40^9} \approx 0.621`,
    },
    hints: [
      "'At least two share' is hard to count directly. Its complement is a single clean event.",
      "Place the orders one at a time. The second must avoid one shard, the third must avoid two, and so on.",
      String.raw`$P(\text{all distinct}) = \tfrac{40}{40}\cdot\tfrac{39}{40}\cdots\tfrac{32}{40}$; subtract from one.`,
    ],
    solution: String.raw`This is a birthday problem with 40 'days' and 9 'people'. Counting the ways two or more orders can coincide is messy because the overlaps come in many shapes; the complement, *all nine orders land on different shards*, is a single product.

Assign the orders in sequence. The first order can land anywhere. The second avoids the first order's shard with probability $\tfrac{39}{40}$. Given the first two are distinct, the third avoids both with probability $\tfrac{38}{40}$, and so on down to the ninth order, which must avoid eight occupied shards: $\tfrac{32}{40}$. Independence of the assignments makes the conditional probabilities exactly these fractions, so
$$P(\text{all distinct}) = \prod_{k=0}^{8} \frac{40 - k}{40} \approx 0.3785.$$

Therefore $P(\text{at least one shared shard}) = 1 - 0.3785 \approx 0.621$. A quick sanity check uses the approximation $P(\text{all distinct}) \approx e^{-\binom{9}{2}/40} = e^{-0.9} \approx 0.41$, which lands in the right neighbourhood; the exact product is a little smaller because the pairwise approximation ignores the second-order terms. Answer: about $0.621$.`,
    steps: [
      "Recognise a birthday-style collision question.",
      "Switch to the complement: all nine shards distinct.",
      "Multiply the shrinking fractions 40/40 down to 32/40.",
      "Subtract from 1: about 0.621.",
    ],
    keyIdea: "Collisions are counted through their complement: a product of shrinking fractions.",
    commonMistake: String.raw`Answering $\tfrac{9}{40}$ or $\binom{9}{2}/40$, which treats the pairs as if they could not overlap and ignores that 36 pairs give a probability near 0.6, not 0.9.`,
    fastPath: String.raw`$\binom{9}{2} = 36$ pairs, each colliding with probability $1/40$; $e^{-36/40} \approx 0.41$ no-collision, so roughly 0.6. For the exact value multiply the nine fractions.`,
    variation: "How many simultaneous orders make a shared shard more likely than not?",
    variationAnswer: String.raw`Eight orders give $P(\text{distinct}) = \prod_{k=0}^{7}(40-k)/40 \approx 0.473$, so a collision has probability $\approx 0.527$ and is already more likely than not. Seven orders give $P(\text{distinct}) \approx 0.574$, so a collision has probability only $\approx 0.43$. The answer is 8.`,
    family: "birthday",
    verifiedBy: ["formula", "simulation"],
  },
  {
    id: "bt-003",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["monty-hall", "conditional", "total-probability"],
    minutes: 4,
    title: "Four lockers and a helpful quant",
    prompt: String.raw`A bonus cheque is hidden in one of four identical lockers; each locker is equally likely. You point at one locker. A colleague who knows where the cheque is then opens one of the *other three* lockers that she knows to be empty, choosing uniformly at random when she has more than one empty locker to pick from. Three lockers remain closed: yours and two others. Which action gives you the best chance of the cheque, and what is that chance?`,
    answer: {
      type: "choice",
      options: [
        String.raw`Stay with your locker: probability $\tfrac14$.`,
        String.raw`Switch to one of the two other closed lockers at random: probability $\tfrac38$.`,
        String.raw`Switch to one of the two other closed lockers at random: probability $\tfrac12$.`,
        String.raw`It makes no difference: every closed locker has probability $\tfrac13$.`,
      ],
      correct: 1,
    },
    hints: [
      "Your locker was chosen before the colleague acted, and her rule never touches your locker. Does her action change the probability that yours holds the cheque?",
      String.raw`Your locker keeps probability $\tfrac14$. The $\tfrac34$ that was spread over the three others now sits on just two closed lockers.`,
      String.raw`Each of the two other closed lockers carries $\tfrac38$. Switching at random picks one of them.`,
    ],
    solution: String.raw`Start with what the colleague's action can and cannot tell you. Her rule is: open an empty locker that is not the one you pointed at. Whatever the cheque's location, she can always do this, and she never opens your locker. So the event 'she opens some empty locker' has probability 1 regardless of whether your locker holds the cheque, and your locker's probability stays at exactly $\tfrac14$.

The opened locker is now known to be empty, so the probability mass $\tfrac34$ that belonged to the three lockers you did not choose must live on the two other closed lockers. By symmetry between them (her rule treats them identically), each has probability $\tfrac38$.

Check with the rule explicitly. If the cheque is in your locker (probability $\tfrac14$) she picks uniformly among three empty lockers. If it is in one of the others (probability $\tfrac34$) she must avoid it and picks uniformly among the two remaining empties. Conditioning on which locker she opened, Bayes' rule gives your locker $\tfrac{(1/4)(1/3)}{(1/4)(1/3) + 2 \cdot (1/4)(1/2)} = \tfrac{1/12}{1/12 + 1/4} = \tfrac14$ for your locker and $\tfrac38$ for each of the other two, as claimed.

Switching to one of the two closed lockers at random therefore wins with probability $\tfrac38 = 0.375$, better than staying at $\tfrac14 = 0.25$. Option 3's $\tfrac12$ would be right only if she had opened *two* empty lockers, leaving a single alternative (and then switching would in fact win with probability $\tfrac34$, not $\tfrac12$). Option 4 ignores that her rule never touches your locker, so the three closed lockers are not symmetric.`,
    steps: [
      "Note that the host's rule can never open your locker, so your probability stays 1/4.",
      "Spread the remaining 3/4 over the two other closed lockers: 3/8 each.",
      "Compare: switch (3/8) beats stay (1/4).",
      "Confirm with Bayes if in doubt.",
    ],
    keyIdea: "A host who is forbidden from opening your door gives you no information about your door; all the information lands on the others.",
    commonMistake: String.raw`Jumping to 'two doors left, so $\tfrac12$ each' by analogy with the three-door version, or declaring all three closed lockers equal at $\tfrac13$.`,
    fastPath: "Yours stays 1/4; the other 3/4 splits over two lockers: 3/8 each. Switch.",
    variation: "Same setup, but the colleague opens two empty lockers among the other three. What is the probability of winning if you switch to the single remaining closed locker?",
    variationAnswer: String.raw`Your locker is still $\tfrac14$, so the lone alternative carries $\tfrac34$.`,
    family: "monty-hall",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "bt-004",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["dice", "recursion", "geometric-dist", "first-step"],
    minutes: 4,
    title: "Second in line to roll",
    prompt: String.raw`Three traders, Ana, Ben and Cy, take turns in that fixed order rolling one fair six-sided die. The first person to roll a 6 wins the pot and the game ends; if nobody has rolled a 6 after Cy, the turn goes back to Ana. What is the probability that Ben wins?`,
    answer: { type: "numeric", value: 30 / 91, exact: String.raw`\tfrac{30}{91} \approx 0.330` },
    hints: [
      "Ben wins on his first roll if Ana misses and he hits. If all three miss, the game is back where it started.",
      String.raw`$P(\text{Ben}) = \tfrac56 \cdot \tfrac16 + \left(\tfrac56\right)^3 P(\text{Ben})$.`,
      String.raw`Solve for $P(\text{Ben})$: $\tfrac{5/36}{1 - 125/216}$.`,
    ],
    solution: String.raw`Let $p = \tfrac16$ be the chance of a 6 and $q = \tfrac56$ the chance of a miss. Ben wins on the first round only if Ana misses and Ben hits: probability $qp = \tfrac{5}{36}$. If all three miss in a round, which happens with probability $q^3 = \tfrac{125}{216}$, the game restarts in exactly the same state with Ana rolling, so Ben's winning probability from that point is the same number we are after.

Writing $b$ for Ben's probability, the first-round analysis gives $b = qp + q^3 b$, hence
$$b = \frac{qp}{1 - q^3} = \frac{5/36}{91/216} = \frac{5}{36} \cdot \frac{216}{91} = \frac{30}{91} \approx 0.330.$$

A cross-check uses the ratio structure: Ana, Ben and Cy win with probabilities proportional to $1, q, q^2$ (each later player needs one more miss in front of them in every round), so Ben's share is $\tfrac{q}{1 + q + q^2} = \tfrac{5/6}{1 + 5/6 + 25/36} = \tfrac{30}{36 + 30 + 25} = \tfrac{30}{91}$. Ana gets $\tfrac{36}{91}$ and Cy $\tfrac{25}{91}$; going first is worth about 6 percentage points over going second.`,
    steps: [
      "Set up the first-round events: Ana misses, Ben hits.",
      "Note the game restarts after three misses.",
      "Write b = qp + q^3 b and solve.",
      "Cross-check with the 1 : q : q^2 share ratio.",
    ],
    keyIdea: "After a full round of misses the game is back at the start, so one linear equation captures the infinite series.",
    commonMistake: String.raw`Using the two-player formula $\tfrac{q}{1+q}$, or forgetting that Ben needs Ana to miss first and answering $\tfrac{1/6}{1 - (5/6)^3}$.`,
    fastPath: String.raw`Shares are $1 : q : q^2 = 36 : 30 : 25$. Ben gets $30/91$.`,
    variation: "Same game with four players. What is the probability that the last player in the order wins?",
    variationAnswer: String.raw`Shares $1 : q : q^2 : q^3$, so the last gets $\tfrac{q^3}{1 + q + q^2 + q^3} = \tfrac{125}{216 + 180 + 150 + 125} = \tfrac{125}{671} \approx 0.186$.`,
    verifiedBy: ["recursion", "simulation"],
  },
  {
    id: "bt-005",
    module: 9,
    kind: "brainteaser",
    difficulty: 4,
    tags: ["gamblers-ruin", "random-walk", "first-step", "games"],
    minutes: 7,
    title: "Bet small or bet big with an edge",
    prompt: String.raw`You hold 2 dollars and want to reach exactly 6 dollars; you stop as soon as you hold 6 or hold 0. Each round you bet on a coin that lands your way with probability $0.6$ and against you with probability $0.4$, winning or losing the amount staked. You must use the same stake every round, either 1 dollar per round or 2 dollars per round. Which stake gives the higher probability of reaching 6 dollars, and what is that probability?`,
    answer: {
      type: "choice",
      options: [
        String.raw`One-dollar stakes: probability $\tfrac{81}{133} \approx 0.609$.`,
        String.raw`Two-dollar stakes: probability $\tfrac{9}{19} \approx 0.474$.`,
        String.raw`Both stakes give the same probability, $\tfrac{2}{6} = \tfrac13$, because only the start and target matter.`,
        String.raw`Two-dollar stakes: probability $\tfrac{81}{133} \approx 0.609$.`,
      ],
      correct: 0,
    },
    hints: [
      "This is gambler's ruin with a favourable coin. With an edge, do you want many small bets or few large ones?",
      String.raw`With win probability $p$ and $r = q/p = \tfrac23$, the probability of reaching $N$ from $k$ is $\dfrac{1 - r^k}{1 - r^N}$.`,
      String.raw`One-dollar stakes: $k = 2, N = 6$. Two-dollar stakes: the ladder is 0, 2, 4, 6, so $k = 1, N = 3$.`,
    ],
    solution: String.raw`Both options are gambler's ruin problems. Let $p = 0.6$, $q = 0.4$ and $r = q/p = \tfrac23$. For a walk that steps up with probability $p$ and down with probability $q$, the probability of hitting $N$ before $0$ from position $k$ is
$$P_k = \frac{1 - r^k}{1 - r^N},$$
which comes from the first-step equations $P_k = p P_{k+1} + q P_{k-1}$ with $P_0 = 0$ and $P_N = 1$.

With one-dollar stakes the positions are the dollar amounts: $k = 2$, $N = 6$. Then
$$P = \frac{1 - (2/3)^2}{1 - (2/3)^6} = \frac{5/9}{665/729} = \frac{5 \cdot 81}{665} = \frac{81}{133} \approx 0.609.$$

With two-dollar stakes the only reachable amounts are 0, 2, 4, 6, so in units of two dollars the walk starts at $k = 1$ with target $N = 3$:
$$P = \frac{1 - 2/3}{1 - (2/3)^3} = \frac{1/3}{19/27} = \frac{9}{19} \approx 0.474.$$

Small stakes win by a wide margin. The intuition is the law of large numbers: with a favourable coin, more rounds let the edge express itself, while a two-dollar stake exposes you to ruin on a single bad flip. The opposite holds with an unfavourable coin, where you should bet as boldly as possible. Option 3's $\tfrac13$ would be the answer for a fair coin with either stake, where the stake size is irrelevant; it is wrong here precisely because the coin is biased.`,
    steps: [
      "Recognise gambler's ruin with p = 0.6 and r = q/p = 2/3.",
      "Write the hitting probability (1 - r^k)/(1 - r^N).",
      "One-dollar stakes: k = 2, N = 6 gives 81/133.",
      "Two-dollar stakes: rescale to k = 1, N = 3 gives 9/19.",
      "With an edge, small stakes win; with a fair coin they would tie.",
    ],
    keyIdea: "With a favourable game, bet small to let the edge compound; with an unfavourable one, bet bold to limit the number of rounds.",
    commonMistake: String.raw`Using the fair-coin answer $k/N$ for both stakes, or forgetting to rescale the ladder for two-dollar stakes and plugging $k = 2, N = 6$ into the biased formula again.`,
    fastPath: String.raw`$r = 2/3$. Small stakes: $(1 - 4/9)/(1 - 64/729) \approx 0.61$. Big stakes: $(1/3)/(19/27) \approx 0.47$. Small wins.`,
    variation: "Same question with the coin against you: it lands your way with probability 0.4. Which stake is better now, and what is the probability?",
    variationAnswer: String.raw`Now $r = 3/2$. One-dollar: $(1 - 2.25)/(1 - 11.39) \approx 0.120$. Two-dollar: $(1 - 1.5)/(1 - 3.375) \approx 0.211$. Bet big when the odds are against you.`,
    family: "gamblers-ruin",
    verifiedBy: ["recursion", "formula"],
  },
  {
    id: "bt-006",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["indicators", "linearity", "expectation", "permutations"],
    minutes: 3,
    title: "Consecutive tickets in a shuffled pile",
    prompt: String.raw`Eight tickets numbered 1 to 8 are shuffled into a uniformly random order and laid out in a row. Call a position a *step* if the ticket there is immediately followed by the ticket with the next number (for example 4 directly followed by 5). What is the expected number of steps in the row?`,
    answer: { type: "numeric", value: 7 / 8, exact: String.raw`7 \cdot \tfrac{1}{8} = \tfrac{7}{8} = 0.875` },
    hints: [
      "Do not try to find the distribution of the count. Write it as a sum of simpler quantities.",
      "For each number k from 1 to 7, let an indicator be 1 if k is immediately followed by k + 1. How many such indicators are there?",
      String.raw`The ordered pair $(k, k+1)$ sits in adjacent positions with probability $\tfrac{7 \cdot 6!}{8!} = \tfrac18$. Add up seven of them.`,
    ],
    solution: String.raw`Let $I_k$ be 1 if ticket $k$ is immediately followed by ticket $k + 1$, and 0 otherwise, for $k = 1, \dots, 7$. The number of steps is $S = I_1 + \dots + I_7$, and linearity of expectation gives $E[S] = \sum_k P(I_k = 1)$ regardless of how the indicators depend on one another.

Fix $k$. Glue the two tickets $k$ and $k+1$ into a single block in that order. The block and the other six tickets can be arranged in $7!$ ways, out of $8!$ total orders, so $P(I_k = 1) = \tfrac{7!}{8!} = \tfrac18$. Equivalently: the pair occupies one of 7 adjacent position pairs, in the right order, out of $8 \cdot 7$ ordered position pairs, again $\tfrac{7}{56} = \tfrac18$.

Therefore $E[S] = 7 \cdot \tfrac18 = \tfrac78 = 0.875$. The indicators are not independent (for instance $P(I_3 = 1 \text{ and } I_4 = 1) = \tfrac{6!}{8!} = \tfrac{1}{56}$, not $\tfrac{1}{64}$, because gluing 3, 4, 5 into one block leaves $6!$ orders), but linearity does not care. Brute force over all $8! = 40320$ orders confirms the value. In general $n$ tickets give $(n-1)/n$ expected steps, just under one.`,
    steps: [
      "Define an indicator for each of the 7 ascending neighbour pairs.",
      "Compute P(k is immediately followed by k+1) = 1/8 by gluing the pair.",
      "Sum by linearity: 7/8.",
    ],
    keyIdea: "Linearity of expectation turns a count of overlapping events into a sum of easy probabilities.",
    commonMistake: String.raw`Using $\tfrac{1}{7}$ per pair (the probability that two specific tickets are adjacent in either order is $\tfrac{2}{8} = \tfrac14$; the specific order is $\tfrac18$), or trying to account for dependence between the indicators.`,
    fastPath: "Seven pairs times 1/8 each. Done: 0.875.",
    variation: "Same eight tickets, but now count a step whenever two adjacent tickets differ by exactly 1, in either order. Expected count?",
    variationAnswer: String.raw`Each of the 7 unordered pairs is adjacent with probability $\tfrac{2}{8} = \tfrac14$, so $7 \cdot \tfrac14 = \tfrac74$.`,
    family: "linearity-of-expectation",
    verifiedBy: ["enumeration", "formula", "simulation"],
  },
  {
    id: "bt-007",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["geometric-probability", "symmetry"],
    minutes: 5,
    title: "Three usable cable pieces",
    prompt: String.raw`A 1-metre network cable is cut at two points chosen independently and uniformly along its length, producing three pieces. A piece is usable only if it is at least 20 cm long. What is the probability that all three pieces are usable?`,
    answer: { type: "numeric", value: 4 / 25, exact: String.raw`(1 - 3 \cdot 0.2)^2 = \tfrac{4}{25} = 0.16` },
    hints: [
      "Let the cut points be U and V. Draw the unit square of (U, V) and shade the region where all three pieces are at least 0.2.",
      "The pieces have lengths min(U,V), |U - V| and 1 - max(U,V). Each condition is a half-plane cut of the square.",
      String.raw`The good region is two congruent triangles with legs $1 - 3(0.2) = 0.4$: total area $0.4^2$.`,
    ],
    solution: String.raw`Write the cut points as $U$ and $V$, independent and uniform on $[0, 1]$. Suppose first that $U < V$; the other case is the mirror image and has the same probability. The three pieces are then $U$, $V - U$ and $1 - V$, and we need all three to be at least $a = 0.2$.

In the $(U, V)$ plane the region $U < V$ is the triangle above the diagonal with area $\tfrac12$. The three constraints $U \ge a$, $V - U \ge a$ and $V \le 1 - a$ cut off a strip of width $a$ from each side of this triangle, leaving a smaller similar triangle. Its legs are $1 - 3a$ long (the original leg of length 1 minus three strips of width $a$), so its area is $\tfrac12 (1 - 3a)^2$.

Doubling for the mirror case $V < U$ gives the probability $(1 - 3a)^2$. With $a = 0.2$ this is $0.4^2 = 0.16 = \tfrac{4}{25}$.

An alternative view explains the formula: the three piece lengths are uniformly distributed over the simplex $x + y + z = 1$. Requiring each to be at least $a$ is the same as asking a uniform point in a simplex of side 1 to land in the sub-simplex of side $1 - 3a$, whose relative area is $(1 - 3a)^2$. The formula only makes sense for $a \le \tfrac13$; for larger $a$ the probability is 0. Answer: $0.16$.`,
    steps: [
      "Model the cuts as a uniform point (U, V) in the unit square.",
      "Order the cuts and write the three piece lengths.",
      "Each 'at least 0.2' condition shaves a strip of width 0.2 off the triangle.",
      "Remaining area: (1 - 3a)^2 = 0.16.",
    ],
    keyIdea: "Three uniform pieces live on a simplex; a minimum-length condition shrinks the simplex to side 1 - 3a.",
    commonMistake: String.raw`Treating the three piece lengths as independent uniforms and answering $0.8^3 = 0.512$, or forgetting the middle piece and answering $0.6^2 = 0.36$.`,
    fastPath: String.raw`$(1 - 3a)^2$ with $a = 0.2$: $0.4^2 = 0.16$.`,
    variation: "What is the probability that the three pieces can be arranged as the sides of a triangle?",
    variationAnswer: String.raw`No piece may exceed $\tfrac12$. The complement region has area $\tfrac34$, so the probability is $\tfrac14$.`,
    family: "broken-stick",
    verifiedBy: ["formula", "simulation"],
  },
  {
    id: "bt-008",
    module: 9,
    kind: "brainteaser",
    difficulty: 4,
    tags: ["conditional", "expectation", "games", "logic"],
    minutes: 6,
    title: "The always-switch argument",
    prompt: String.raw`Two sealed envelopes are placed in front of you. You are told, truthfully, that one contains exactly twice as much money as the other. You pick one at random and open it: it holds \$80. A colleague argues: "The other envelope holds either \$40 or \$160, each equally likely, so its expected content is $0.5 \cdot 40 + 0.5 \cdot 160 = 100 > 80$. You should switch. And since the same reasoning works for any amount you might have seen, you should switch even without opening, which is absurd." Where exactly does this argument fail?`,
    answer: {
      type: "choice",
      options: [
        String.raw`The arithmetic is wrong: the correct average of \$40 and \$160 is \$80, so switching is neutral.`,
        String.raw`The 'equally likely' step: no probability distribution over the pair of amounts can make the other envelope equally likely to be the larger one for every amount you might observe, so the two $\tfrac12$'s are an unjustified assumption.`,
        String.raw`Switching is genuinely right once you have opened the envelope; the paradox only concerns the unopened version, where expectation is undefined.`,
        String.raw`Expected value cannot be used to make one-off decisions, so the argument has no force either way.`,
      ],
      correct: 1,
    },
    hints: [
      "Separate the two facts: 'I picked the larger envelope with probability 1/2' is true before opening. Is 'given I see 80, the other is larger with probability 1/2' the same statement?",
      "Try any concrete prior over the pairs, say pairs (10, 20), (20, 40), (40, 80), (80, 160) equally likely. Given you see 80, what is the probability the other holds 160?",
      "For the argument to hold at *every* amount you would need a prior that is flat over all powers of two, which is not a probability distribution.",
    ],
    solution: String.raw`The argument quietly slides from an unconditional statement to a conditional one. Before opening, you did pick the smaller envelope with probability $\tfrac12$; that much is true by symmetry. But once you see \$80, the relevant probability is $P(\text{other} = 160 \mid \text{I see } 80)$, and that depends on how likely the pair $(80, 160)$ was compared with the pair $(40, 80)$ to begin with. Bayes' rule says the conditional odds are the prior odds of the two pairs, not automatically $1 : 1$.

Try a concrete prior: suppose the pairs $(10, 20), (20, 40), (40, 80), (80, 160)$ are equally likely and you open a random envelope. Seeing 80 happens either from pair $(40, 80)$ or from $(80, 160)$, equally, so here the conditional probability is indeed $\tfrac12$. But seeing 160 can only come from $(80, 160)$: the other envelope is certainly 80 and switching loses for sure. Seeing 10 can only come from $(10, 20)$: switching wins for sure. Averaged over everything the gain from always switching is exactly zero, because $E[\text{other}] - E[\text{mine}] = 0$ by symmetry under any prior.

For the colleague's argument to work at *every* observed amount, you would need the pairs $(x, 2x)$ to be equally likely for every $x$ in an infinite chain, which means a flat prior over infinitely many values. That is not a probability distribution (its total mass is infinite), so the two $\tfrac12$'s are an assumption with no distribution behind them. That is exactly option 2.

The other options miss the point. The arithmetic in option 1 is fine: $0.5 \cdot 40 + 0.5 \cdot 160$ really is 100; the error is in the probabilities, not the sum. Option 3 gets things backwards: with a real prior, switching after opening is sometimes right and sometimes wrong, and overall neutral. Option 4 is a non-answer; expectations are perfectly usable for one-off decisions, and the fix is to use the correct conditional probabilities.`,
    steps: [
      "Distinguish the unconditional 1/2 from the conditional probability given the observed amount.",
      "Apply Bayes: conditional odds equal prior odds of the two candidate pairs.",
      "Test a finite prior: at the extremes the probability is 0 or 1, and the overall switching gain is zero.",
      "Observe that 'equally likely for every amount' would require an improper flat prior.",
    ],
    keyIdea: "A conditional probability needs a prior; 'the other is twice or half with equal probability' is a claim about the prior, not a fact.",
    commonMistake: "Accepting the symmetric 1/2 because 'I chose at random', which confuses the random choice of envelope with the unknown distribution of the amounts.",
    fastPath: "Name the step: 'equally likely given 80' is a Bayesian claim that needs a prior; a flat prior over all doublings has infinite mass. Done.",
    variation: "You know the amounts are drawn as follows: a fair coin picks between the pairs (40, 80) and (80, 160); then an envelope is handed to you at random. You open it and see 80. Should you switch?",
    variationAnswer: String.raw`Seeing 80 is equally likely under both pairs, so the other holds 40 or 160 with probability $\tfrac12$ each and its expectation is 100. Switch. Here the prior genuinely makes the argument valid at this one amount (and only this one).`,
    family: "two-envelopes",
    verifiedBy: ["enumeration"],
  },
  {
    id: "bt-009",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["expectation", "coins", "games", "recursion"],
    minutes: 4,
    title: "Doubling down with a 15-dollar bankroll",
    prompt: String.raw`You sit down with exactly \$15 and play a coin game in which each flip wins with probability $0.45$ and loses with probability $0.55$, independently; a win pays the stake, a loss costs it. Your rule: stake \$1 on the first flip; after each loss double the stake (\$2, then \$4, then \$8); stop immediately after your first win, or when you have lost four flips in a row and cannot afford the next stake. What is your expected profit in dollars at the end of the game?`,
    answer: {
      type: "numeric",
      value: 1 - 16 * Math.pow(0.55, 4),
      exact: String.raw`1 - 16\left(\tfrac{11}{20}\right)^4 = -\tfrac{4641}{10000} = -0.4641`,
      unit: "dollars",
    },
    hints: [
      "Work out the profit in each possible ending. A win after k losses pays 2^k and has cost 1 + 2 + ... + 2^(k-1).",
      String.raw`Any sequence ending in a win nets exactly $+1$. Losing all four flips nets $-15$.`,
      String.raw`$E = 1 \cdot (1 - 0.55^4) - 15 \cdot 0.55^4 = 1 - 16 \cdot 0.55^4$.`,
    ],
    solution: String.raw`Follow the money in each scenario. If the first flip wins you are up \$1. If you lose \$1 then win \$2 you are up \$1. Lose 1, lose 2, win 4: up \$1. Lose 1, 2, 4 and win 8: again up \$1, because $2^k - (2^k - 1) = 1$. Every path that ends in a win nets exactly one dollar. The only other path is four straight losses, which costs $1 + 2 + 4 + 8 = 15$: the whole bankroll.

The probability of four straight losses is $0.55^4 = 0.09150625$. So the profit is $+1$ with probability $1 - 0.55^4$ and $-15$ with probability $0.55^4$:
$$E[\text{profit}] = (1 - 0.55^4) - 15 \cdot 0.55^4 = 1 - 16 \cdot 0.55^4 = 1 - 1.4641 = -0.4641.$$

A different route confirms it. Each individual flip has expected value $(0.45 - 0.55) \times \text{stake} = -0.1 \times \text{stake}$, and the expected total amount staked is $1 + 0.55 \cdot 2 + 0.55^2 \cdot 4 + 0.55^3 \cdot 8 = 1 + 1.1 + 1.21 + 1.331 = 4.641$. Multiplying gives $-0.4641$ again: no stopping rule can rescue a game where every flip is $-10\%$. You win \$1 about $91\%$ of the time and lose \$15 about $9\%$ of the time; the frequent small wins hide a negative expectation. Answer: $-0.4641$ dollars.`,
    steps: [
      "Show that any winning path nets exactly +1.",
      "Identify the single losing path: four losses, -15.",
      "P(four losses) = 0.55^4; compute the two-point expectation.",
      "Cross-check: expected stake times the per-dollar edge of -0.1.",
    ],
    keyIdea: "A doubling scheme converts a negative edge into frequent small wins and a rare large loss; the expectation per dollar staked never changes.",
    commonMistake: String.raw`Treating the game as 'win \$1 with probability 91%' and calling it positive, or using $0.5^4$ for the losing path because the coin 'looks' fair.`,
    fastPath: String.raw`Expected stake $1 + 1.1 + 1.21 + 1.331 = 4.641$; edge $-0.1$ per dollar; $-0.4641$.`,
    variation: "Same rule with a fair coin. Expected profit, and the probability of ending the night a winner?",
    variationAnswer: String.raw`$E = 1 - 16 \cdot (1/2)^4 = 0$; you finish ahead with probability $1 - 1/16 = 15/16$.`,
    verifiedBy: ["enumeration", "recursion"],
  },
  {
    id: "bt-010",
    module: 9,
    kind: "brainteaser",
    difficulty: 5,
    tags: ["permutations", "symmetry", "conditional"],
    minutes: 9,
    title: "Following the slips around the floor",
    prompt: String.raw`Eight desks on a trading floor each receive one slip of paper naming a desk, arranged so that every desk is named on exactly one slip; a slip may name its own desk. The assignment is a uniformly random permutation of the eight desks. Starting at Ana's desk you read the slip, walk to the desk it names, read that slip, and so on until you are back at Ana's desk. What is the probability that this walk visits both Ben's desk and Cy's desk?`,
    answer: { type: "numeric", value: 1 / 3, exact: String.raw`\tfrac{1}{3}` },
    hints: [
      "The walk is the cycle of the permutation that contains Ana. You need Ana, Ben and Cy in the same cycle.",
      "Build the permutation by the 'seating' process: start a cycle at Ana, insert the remaining elements one at a time. Only the relative arrangement of the three named desks matters.",
      String.raw`Among the three named desks, the cycle structure restricted to them is a uniform random permutation of 3 elements; a single 3-cycle happens with probability $\tfrac{2}{6} = \tfrac13$.`,
    ],
    solution: String.raw`Following slips from Ana traces the cycle of the permutation containing Ana, so the question is: what is the probability that Ana, Ben and Cy all lie in one cycle?

Here is the key structural fact. Take a uniformly random permutation of $n$ items and look only at how it moves a fixed set of $k$ items, skipping over everything else: each time the cycle leaves the set, follow it until it returns. The result is a permutation of the $k$ items, and it is *uniformly distributed* over all $k!$ permutations of them, whatever $n$ is. One way to see this is the sequential construction of a random permutation: insert items one at a time, each new item either starting a new cycle or being placed immediately after any existing item, all $i$ choices for the $i$-th item equally likely. Inserting the $k$ named items first produces a uniform permutation of them, and inserting the other $n - k$ items afterwards never merges or splits cycles among the named items; it only lengthens them.

So the three named desks form a single cycle with probability equal to the fraction of permutations of 3 items that are a single 3-cycle: there are $(3-1)! = 2$ of these out of $3! = 6$, giving $\tfrac13$. More generally, $k$ named items share a cycle with probability $\tfrac{(k-1)!}{k!} = \tfrac1k$, independent of $n$.

A direct count for the sceptic: the number of permutations of 8 items in which three given items share a cycle is $\tfrac{8!}{3} = 13440$, and $13440/40320 = \tfrac13$. The brute-force enumeration in the verifier confirms this. Note how counter-intuitive the independence from $n$ is: with 8 desks or 8000, the chance is still exactly one third.`,
    steps: [
      "Translate the walk into the cycle containing Ana.",
      "Restrict the permutation to the three named desks: the induced permutation is uniform on S_3.",
      "A single 3-cycle has probability 2/6 = 1/3.",
      "Notice the answer does not depend on the number of desks.",
    ],
    keyIdea: "The cycle structure induced on any fixed set of k items in a uniform random permutation is itself uniform, so k named items share a cycle with probability 1/k.",
    commonMistake: String.raw`Guessing that it depends on $n$ (for instance $\binom{7}{2}/\binom{8}{3}$-style counts), or multiplying $\tfrac12$ for Ben by $\tfrac12$ for Cy as if independent, giving $\tfrac14$.`,
    fastPath: "k specific items in one cycle: 1/k. Here k = 3, so 1/3.",
    variation: "What is the probability that the walk from Ana's desk visits Ben's desk at all?",
    variationAnswer: String.raw`Two specific items share a cycle with probability $\tfrac12$, again independent of the number of desks.`,
    family: "symmetry",
    verifiedBy: ["enumeration", "formula", "simulation"],
  },

  // ------------------------------------------------------------ pigeonhole and extremal
  {
    id: "bt-011",
    module: 9,
    kind: "brainteaser",
    difficulty: 2,
    tags: ["pigeonhole", "logic"],
    minutes: 2,
    title: "Cables from the bin",
    prompt: String.raw`A storage bin holds a large supply of charging cables in five colours, thoroughly mixed. You pull cables out one at a time without looking. What is the smallest number of pulls that *guarantees* you are holding at least four cables of the same colour?`,
    answer: { type: "numeric", value: 16, exact: String.raw`3 \cdot 5 + 1 = 16` },
    hints: [
      "Think about the worst case: how many cables can you hold without any colour reaching four?",
      "You could have three of each colour and still have no group of four.",
      "Three of each of the five colours is 15 cables; the sixteenth cable must complete a four.",
    ],
    solution: String.raw`A guarantee has to survive the unluckiest possible sequence of pulls, so ask how long bad luck can last. As long as every colour appears at most three times you have no group of four, and with five colours that allows at most $3 \times 5 = 15$ cables. The sequence 'three red, three blue, three green, three white, three black' shows 15 pulls really can fail.

The 16th cable, whatever colour it is, joins a colour that already has three, producing four of a kind. So 16 pulls always suffice, 15 do not, and the answer is 16.

This is the pigeonhole principle in its counting form: with 5 holes, more than $3 \times 5$ pigeons forces some hole to contain at least 4. The general formula for forcing $k$ of a kind among $c$ colours is $(k-1)c + 1$. Answer: $16$.`,
    steps: [
      "Find the longest failing sequence: three of each colour.",
      "That is 15 cables; one more forces a fourth of some colour.",
      "Answer (k - 1) * c + 1 = 16.",
    ],
    keyIdea: "To guarantee k of a kind among c kinds, saturate every kind at k - 1 and add one.",
    commonMistake: "Answering 15 (the worst case that still fails) or reasoning about probabilities when the question asks for a guarantee.",
    fastPath: "Three per colour, five colours, plus one: 16.",
    variation: "Same bin, but one of the five colours has only two cables in total. Now how many pulls guarantee four of one colour?",
    variationAnswer: String.raw`Worst case: $3 + 3 + 3 + 3 + 2 = 14$ without a four, so 15 pulls.`,
    family: "pigeonhole",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "bt-012",
    module: 9,
    kind: "brainteaser",
    difficulty: 4,
    tags: ["pigeonhole", "invariants", "number-puzzle"],
    minutes: 6,
    title: "Forcing a gap of exactly five",
    prompt: String.raw`You select distinct integers from 1 to 30 inclusive. What is the smallest number of integers you must select to *guarantee* that two of them differ by exactly 5?`,
    answer: { type: "numeric", value: 16, exact: String.raw`5 \cdot 3 + 1 = 16` },
    hints: [
      "Two numbers differing by 5 have the same remainder on division by 5. Split 1 to 30 into the five remainder classes.",
      "Each class is a chain of six numbers spaced 5 apart, e.g. 2, 7, 12, 17, 22, 27. Picking two neighbours in a chain gives a difference of 5.",
      "In a chain of six you can pick at most 3 without taking two neighbours. Five chains give 15 safe picks; the 16th forces a gap of 5.",
    ],
    solution: String.raw`A difference of exactly 5 can only occur between two numbers with the same remainder modulo 5, so sort the integers 1 to 30 into five classes by remainder: $\{1, 6, 11, 16, 21, 26\}$, $\{2, 7, 12, 17, 22, 27\}$, and so on. Each class is a chain of six numbers in which consecutive members differ by exactly 5, and no two numbers from different chains differ by 5.

The question becomes: how many numbers can we pick from a chain of six without taking two consecutive members? Picking alternate members, say the 1st, 3rd and 5th, gives 3 picks with no neighbours; four picks are impossible because among four of six chain positions two must be adjacent (four picks need three gaps between them but only two spare positions exist). So each chain safely contributes at most 3, and the five chains together allow at most $5 \times 3 = 15$ numbers with no pair at distance 5. The set $\{1,\dots,5\} \cup \{11,\dots,15\} \cup \{21,\dots,25\}$ realises this: 15 numbers, no two differing by 5.

Any 16th number lands in some chain that already holds 3 picks, and a fourth pick in a chain of six must be adjacent to an existing one. So 16 selections guarantee a difference of exactly 5, while 15 do not. Answer: $16$.`,
    steps: [
      "Reduce modulo 5: a difference of 5 stays within a residue class.",
      "Each class is a chain of 6 with consecutive gaps of 5.",
      "Max picks per chain without neighbours: 3.",
      "15 safe picks total; the 16th forces the gap.",
    ],
    keyIdea: "Choose pigeonholes so that the forbidden pair lives inside a hole, then count the maximum safe picks per hole.",
    commonMistake: "Using the 'differ by a multiple of 5' pigeonhole (which gives 6) instead of 'differ by exactly 5', or taking 2 per chain instead of 3.",
    fastPath: "Five chains of six; three safe per chain; 15 + 1 = 16.",
    variation: "Same range 1 to 30, but now you want to guarantee two numbers differing by exactly 6. How many selections?",
    variationAnswer: String.raw`Six chains of five (remainders mod 6): at most 3 per chain without neighbours, so $6 \cdot 3 + 1 = 19$.`,
    family: "pigeonhole",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "bt-013",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["pigeonhole", "number-puzzle", "logic"],
    minutes: 4,
    title: "Three with a sum divisible by three",
    prompt: String.raw`A risk report lists $n$ whole-number position sizes (repeats allowed, any integers). What is the smallest $n$ that *guarantees* you can find three of the listed numbers whose sum is divisible by 3?`,
    answer: { type: "numeric", value: 5, exact: "5" },
    hints: [
      "Only the remainders on division by 3 matter. Each number is a 0, a 1 or a 2.",
      "A sum of three is divisible by 3 if the three remainders are all equal, or are 0, 1, 2 one each.",
      "Find the longest list of remainders with neither pattern, then add one.",
    ],
    solution: String.raw`Replace each number by its remainder on division by 3; a triple sums to a multiple of 3 exactly when its remainders sum to a multiple of 3. With remainders in $\{0, 1, 2\}$, that happens in two cases: three equal remainders ($0+0+0$, $1+1+1$, $2+2+2$) or one of each ($0+1+2$).

How long can a list avoid both? If all three remainders appear, we are done at once by the mixed triple. So an avoiding list uses at most two remainder values, and each value may appear at most twice (three copies give an equal triple). That caps an avoiding list at $2 \times 2 = 4$ entries, and the list $0, 0, 1, 1$ (for example sizes 3, 6, 1, 4) shows 4 entries really can avoid every good triple.

With 5 entries either three remainders appear, giving a mixed triple, or only two values appear and one of them occurs at least three times by pigeonhole, giving an equal triple. So $n = 5$ guarantees the triple and $n = 4$ does not. Answer: $5$. The verifier checks every one of the $3^5 = 243$ remainder patterns.`,
    steps: [
      "Reduce to remainders mod 3.",
      "Good triples: all equal, or one of each remainder.",
      "Longest avoiding list: two values, twice each, so 4.",
      "Five entries force a good triple.",
    ],
    keyIdea: "Work modulo 3 and look for the longest list that avoids both the 'all equal' and the 'one of each' patterns.",
    commonMistake: "Answering 7 by analogy with 'three equal remainders need 2 * 3 + 1', forgetting the mixed triple 0 + 1 + 2 kills lists that use all three remainders.",
    fastPath: "Avoid: at most two remainder values, at most two each: 4. Answer 5.",
    variation: "Smallest n guaranteeing two of the listed numbers whose sum is divisible by 3?",
    variationAnswer: String.raw`Avoiding pairs: at most one 0, and no 1 together with a 2, so lists like $1, 1, 1, 1, \dots$ avoid forever. No finite $n$ guarantees it; the answer is that no such $n$ exists.`,
    family: "pigeonhole",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "bt-014",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["pigeonhole", "invariants", "number-puzzle"],
    minutes: 4,
    title: "A block of trades that nets to a multiple of six",
    prompt: String.raw`A ticker tape shows a list of $n$ trade sizes, each a positive whole number. What is the smallest $n$ that *guarantees* some block of one or more *consecutive* trades on the tape has a total divisible by 6?`,
    answer: { type: "numeric", value: 6, exact: "6" },
    hints: [
      "Look at the running totals after 1, 2, ..., n trades. A block from position i + 1 to j has sum equal to the difference of two running totals.",
      "If two running totals have the same remainder mod 6, the block between them is divisible by 6. If some running total is itself divisible by 6, the prefix works.",
      "Six running totals and only five non-zero remainders available if none is 0 mod 6.",
    ],
    solution: String.raw`Let $S_j$ be the sum of the first $j$ trades, for $j = 1, \dots, n$. The block from trade $i + 1$ to trade $j$ has total $S_j - S_i$ (with $S_0 = 0$). So we want two running totals, possibly including $S_0 = 0$, that are congruent modulo 6.

With $n = 6$ trades we have seven running totals $S_0, S_1, \dots, S_6$ and only six possible remainders modulo 6. By pigeonhole two of them share a remainder, say $S_i \equiv S_j$ with $i < j$, and the consecutive block $i+1, \dots, j$ has total divisible by 6. So $n = 6$ always works.

Five trades do not suffice: the tape $1, 1, 1, 1, 1$ has running totals $1, 2, 3, 4, 5$, all with distinct non-zero remainders, so no block sums to a multiple of 6 (block sums are the numbers 1 to 5). The verifier confirms this by checking every one of the $6^6$ remainder patterns for six trades and exhibiting the failing pattern for five. Answer: $6$.

Note what the argument does *not* need: the trades being distinct, or positive, or even integers larger than 1. The guarantee comes entirely from counting remainders of prefix sums.`,
    steps: [
      "Define prefix sums S_0 = 0, S_1, ..., S_n.",
      "A consecutive block is a difference of two prefix sums.",
      "n + 1 prefix sums into 6 remainder classes: n = 6 forces a repeat.",
      "Show n = 5 can fail with all ones.",
    ],
    keyIdea: "Consecutive blocks are differences of prefix sums, so pigeonhole the prefix sums by remainder.",
    commonMistake: "Pigeonholing the trades themselves instead of the prefix sums (which would wrongly suggest 7), or forgetting that S_0 = 0 counts as a prefix sum.",
    fastPath: "Prefix sums, m remainder classes: m trades always suffice. Here 6.",
    variation: "Same tape, but now you want a consecutive block whose total is divisible by 10. Smallest n?",
    variationAnswer: String.raw`Ten: eleven prefix sums $S_0, \dots, S_{10}$ into ten remainder classes force a repeat, and the tape of nine ones (prefix sums 1 to 9) shows nine trades can fail.`,
    family: "pigeonhole",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "bt-015",
    module: 9,
    kind: "brainteaser",
    difficulty: 4,
    tags: ["pigeonhole", "logic", "search-strategy"],
    minutes: 6,
    title: "Mutual acquaintances at the offsite",
    prompt: String.raw`At a company offsite, any two attendees have either met before or not. What is the smallest number of attendees that *guarantees* there are either three people who have all met one another, or three people none of whom have met?`,
    answer: { type: "numeric", value: 6, exact: "R(3,3) = 6" },
    hints: [
      "Draw people as points and colour each pair red (met) or blue (not met). You want a one-colour triangle.",
      "Pick one person. Among the others, by pigeonhole, at least how many are joined to her by the same colour?",
      "With 6 people, one person has 3 same-colour links. Look at the three people at the other ends.",
    ],
    solution: String.raw`Model the attendees as points and colour the pair between two people red if they have met and blue if not. A trio who have all met is a red triangle; a trio of strangers is a blue triangle. We want the smallest group size that forces a one-colour triangle.

Six people suffice. Fix any person $A$. She has 5 links to the others, coloured red or blue, so by pigeonhole at least 3 of them share a colour, say red to $B$, $C$ and $D$. Now look at the three links among $B$, $C$, $D$. If any one of them is red, it closes a red triangle with $A$. If none is red, then all three are blue and $BCD$ is a blue triangle. Either way a one-colour triangle exists.

Five people do not suffice. Seat $P_1, \dots, P_5$ around a circle, colour the five neighbouring pairs red and the five 'skip one' pairs blue. Any three people include a neighbouring pair (red) and a non-neighbouring pair (blue), so no triangle is monochromatic. The verifier checks all $2^{10}$ colourings of five people and finds this counterexample, and all $2^{15}$ colourings of six and finds none.

So the answer is $6$. This number is the Ramsey number $R(3,3)$; the general phenomenon, that enough structure of any kind forces order somewhere, is why the question feels paradoxical at first.`,
    steps: [
      "Translate into two-colouring the pairs of a complete graph.",
      "Pigeonhole: one person has 3 links of one colour.",
      "Among those three, either one link closes the triangle or all three form the other colour's triangle.",
      "Exhibit the pentagon colouring to show 5 fails.",
    ],
    keyIdea: "Pigeonhole on one person's links produces three same-colour neighbours; then there is no way out.",
    commonMistake: "Answering 5 ('three of one colour among four others') without checking the pentagon counterexample, or 7 to be safe.",
    fastPath: "One vertex, five links, three same colour; those three finish it. Pentagon with red edges and blue diagonals shows five is not enough. Answer 6.",
    variation: "What is the smallest group that guarantees four people who have all met, or three who have never met?",
    variationAnswer: String.raw`That is the Ramsey number $R(4,3) = 9$, much harder to show by hand; an interviewer expects you to know it is larger than 6 and to describe the search.`,
    family: "pigeonhole",
    verifiedBy: ["exhaustive-search"],
  },

  // ------------------------------------------------------------ weighing puzzles
  {
    id: "bt-016",
    module: 9,
    kind: "brainteaser",
    difficulty: 2,
    tags: ["weighing", "search-strategy"],
    minutes: 3,
    title: "One heavy coin in twenty",
    prompt: String.raw`You have 20 coins that look identical. Exactly one is counterfeit and is *heavier* than the rest; the other 19 weigh the same. You have a two-pan balance that tells you which pan is heavier or that they balance. What is the minimum number of weighings that guarantees you identify the counterfeit?`,
    answer: { type: "numeric", value: 3, exact: String.raw`\lceil \log_3 20 \rceil = 3` },
    hints: [
      "Each weighing has three outcomes: left heavier, right heavier, balance. How many cases can k weighings tell apart?",
      String.raw`Two weighings separate at most $3^2 = 9$ cases; you have 20.`,
      "Split into groups of 7, 7, 6: the heavy pan or the leftover group holds the coin. Then 3, 3, 1 or 2, 2, 2.",
    ],
    solution: String.raw`A balance weighing has three possible outcomes, so a sequence of $k$ weighings has at most $3^k$ distinct outcome patterns. To identify one of 20 possible counterfeit positions you need at least 20 patterns, and $3^2 = 9 < 20 \le 27 = 3^3$. So at least 3 weighings are needed.

Three weighings are enough with a thirds strategy. Weigh 7 coins against 7 coins, leaving 6 aside. If a pan drops, the heavy coin is among its 7; if they balance, it is among the 6 aside. With at most 7 suspects, weigh 3 against 3 leaving 1 (or 2 against 2 leaving 2 if there are 6). After this weighing you have at most 3 suspects, and a final 1-versus-1 weighing with one left aside settles it.

The verifier does a full minimax search over all possible decision trees (every way to split the suspects between pans and the side) and confirms that no two-weighing strategy exists and that three always suffice. Answer: $3$.`,
    steps: [
      "Count outcomes: 3^k patterns for k weighings.",
      "Lower bound: 3^2 = 9 < 20, so at least 3.",
      "Construct: 7 / 7 / 6, then 3 / 3 / 1 or 2 / 2 / 2, then 1 / 1 / 1.",
    ],
    keyIdea: "Three outcomes per weighing: split the suspects into three nearly equal groups each time.",
    commonMistake: "Weighing half against half (a binary split), which needs 5 weighings for 20 coins, or forgetting the coins left off the scale also get information.",
    fastPath: "Powers of three: 9 < 20 <= 27. Three weighings.",
    variation: "Up to how many coins can you handle in four weighings if the counterfeit is known to be heavier?",
    variationAnswer: String.raw`$3^4 = 81$ coins.`,
    family: "weighing",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "bt-017",
    module: 9,
    kind: "brainteaser",
    difficulty: 4,
    tags: ["weighing", "search-strategy", "logic"],
    minutes: 8,
    title: "Thirteen coins and a reference",
    prompt: String.raw`You have 13 coins that look identical. Exactly one is counterfeit; it differs in weight from the others but you do *not* know whether it is heavier or lighter. You also have one extra coin that is certified genuine. Using a two-pan balance, what is the minimum number of weighings that guarantees you find the counterfeit *and* learn whether it is heavy or light?`,
    answer: { type: "numeric", value: 3, exact: "3" },
    hints: [
      "Count the possibilities you must distinguish: 13 coins, each possibly heavy or light. Compare with the number of outcome patterns of k weighings.",
      String.raw`$26$ possibilities need $3^k \ge 26$, so $k \ge 3$. But the first weighing's 'balance' and 'tilt' branches must each stay within what two more weighings can resolve.`,
      "First weighing: put 4 suspects plus the genuine coin on one pan against 5 suspects on the other, leaving 4 suspects aside. Each branch leaves at most 9 possibilities.",
    ],
    solution: String.raw`There are $13 \times 2 = 26$ possible answers (which coin, and heavy or light) and a weighing has three outcomes, so $k$ weighings can resolve at most $3^k$ answers. Since $3^2 = 9 < 26 \le 27$, at least 3 weighings are needed. The question is whether 3 can actually be achieved; the information bound is only a necessary condition, and without the reference coin it would *not* be achievable for 13 coins.

The reference coin unlocks a balanced first weighing. Put suspects 1 to 4 plus the genuine coin on the left pan and suspects 5 to 9 on the right, leaving suspects 10 to 13 aside. If the pans balance, the counterfeit is among 10 to 13 with unknown direction: 8 possibilities, and we have four known-genuine coins to use as references. If the left pan is heavy, the counterfeit is one of 1 to 4 and heavy, or one of 5 to 9 and light: 9 possibilities, each with a known direction. If the right pan is heavy, similarly 9 possibilities.

Each branch holds at most 9 possibilities, which is exactly what two weighings can resolve, and the splits can be arranged. Take the left-heavy branch: heavy-candidates $H_1, \dots, H_4$ and light-candidates $L_1, \dots, L_5$. Weigh $H_1, H_2, L_1$ against $H_3, H_4, L_2$ with $L_3, L_4, L_5$ aside. Left heavy leaves $\{H_1, H_2 \text{ heavy}, L_2 \text{ light}\}$, right heavy leaves $\{H_3, H_4 \text{ heavy}, L_1 \text{ light}\}$, balance leaves $\{L_3, L_4, L_5 \text{ light}\}$: three possibilities each, and a final weighing of the two candidates that share a direction against each other settles it (for $\{H_1, H_2, L_2\}$ weigh $H_1$ against $H_2$: the pan that drops names a heavy coin, a balance points to $L_2$; for $\{L_3, L_4, L_5\}$ weigh any two). Pairing a heavy-candidate with a light-candidate would not work, since either could explain a tilt. The balance branch has four unknown-direction suspects $S_1, \dots, S_4$ and plenty of genuine coins: weigh $S_1, S_2, S_3$ against three genuine coins. A tilt tells you the direction and leaves three candidates, resolved by weighing $S_1$ against $S_2$; a balance leaves $S_4$ alone, and weighing it against a genuine coin gives its direction. The verifier's exhaustive minimax search over every possible split confirms that 3 weighings suffice and 2 do not.

So the answer is 3. The lesson is that the pure counting bound ($26 \le 27$) is not enough on its own; what makes 13 feasible is the extra genuine coin, which lets the first weighing have unequal numbers of suspects on the two pans. Without it, the most you can handle in 3 weighings with the direction required is 12.`,
    steps: [
      "Count the hypotheses: 13 coins times 2 directions = 26.",
      "Information bound: 3^2 = 9 < 26, so at least 3.",
      "Design the first weighing: 4 + reference vs 5, 4 aside; each branch has at most 9 hypotheses.",
      "Check that each branch resolves in two more weighings.",
    ],
    keyIdea: "A certified coin lets you weigh unequal numbers of suspects, keeping every branch within the 3^k budget.",
    commonMistake: "Answering 4 because 'the 12-coin puzzle is the limit for three weighings', forgetting that the reference coin raises the limit to 13.",
    fastPath: "26 hypotheses, 27 patterns, and the reference coin makes a 9 / 9 / 8 first split possible. Three.",
    variation: "Same 13 coins, same reference coin, but you only need to find the counterfeit, not whether it is heavy or light. Does the minimum change?",
    variationAnswer: String.raw`Still 3. Two weighings have only 9 outcome patterns, and with the direction unknown they can locate the counterfeit among at most 5 coins when a reference coin is available (for example weigh suspects 1, 2 against suspect 3 plus the reference; the balance branch leaves two suspects for one weighing against the reference) and at most 4 without one. Both are far short of 13, so a third weighing is still needed. Dropping the direction requirement only raises the three-weighing capacity from 13 to 14 coins.`,
    family: "weighing",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "bt-018",
    module: 9,
    kind: "brainteaser",
    difficulty: 5,
    tags: ["weighing", "search-strategy", "logic"],
    minutes: 10,
    title: "How many coins can three weighings handle?",
    prompt: String.raw`A batch of coins contains exactly one counterfeit, which is either heavier or lighter than a genuine coin; you do not know which. You have no reference coin and a two-pan balance. You must identify the counterfeit *and* report whether it is heavy or light using at most three weighings, with a strategy that works for every possible position and direction. What is the largest batch size for which this is possible?`,
    answer: { type: "numeric", value: 12, exact: String.raw`\tfrac{3^3 - 3}{2} = 12` },
    hints: [
      String.raw`With $n$ coins there are $2n$ hypotheses and three weighings give $27$ outcome patterns, so $n \le 13$. But can every pattern really be used?`,
      "The first weighing must put equal numbers of coins on the two pans. Think about how many hypotheses the 'balance' outcome leaves, and how many the two 'tilt' outcomes leave.",
      String.raw`If $m$ coins go on each pan, a tilt leaves $2m$ hypotheses (one direction each) and balance leaves $2(n - 2m)$. Both must be at most 9, and the all-balance pattern and the two 'all three tilt the same way' patterns can never all be used.`,
    ],
    solution: String.raw`Each of $n$ coins could be heavy or light, so there are $2n$ hypotheses to separate, and three weighings produce at most $3^3 = 27$ outcome patterns. That gives $2n \le 27$, so $n \le 13$. The real answer is 12, and the argument needs one more idea.

Without a reference coin, the first weighing must have the same number $m$ of coins on each pan. If it tilts, the counterfeit is one of the $2m$ coins on the scale, and for each the direction is now known (a coin on the heavy pan can only be heavy, one on the light pan only light): $2m$ hypotheses. If it balances, the counterfeit is among the $n - 2m$ coins set aside with unknown direction: $2(n - 2m)$ hypotheses. Two remaining weighings resolve at most 9 hypotheses, so we need $2m \le 9$ and $2(n - 2m) \le 9$, giving $m \le 4$ and $n \le 2m + 4 \le 12$. So 13 is impossible and the bound is $n \le 12$.

Twelve is achievable: weigh four against four with four aside. If balance, you hold four unknown-direction suspects and eight genuine coins, and two weighings suffice (weigh three suspects against three genuine coins; the tilt or balance then leaves at most three hypotheses, finished by one more weighing). If tilt, you have four heavy-candidates and four light-candidates, 8 hypotheses, and the classic rotation (move some coins across, replace others with genuine ones) splits them 3 / 3 / 2 for a two-weighing finish. The verifier performs the full minimax search over all decision trees and reports that 12 coins can be solved in 3 weighings and 13 cannot.

The general formula is $(3^k - 3)/2$ coins for $k$ weighings when direction is required and no reference coin is available; the $-3$ accounts for the three unusable patterns (all balance, and all tilts the same way). With a reference coin the bound rises to $(3^k - 1)/2 = 13$. Answer: $12$.`,
    steps: [
      "Count hypotheses 2n against 27 patterns: n <= 13.",
      "First weighing m vs m: tilt leaves 2m hypotheses, balance leaves 2(n - 2m).",
      "Both at most 9: m <= 4 and n <= 12.",
      "Show 12 works via 4 / 4 / 4 and the standard follow-ups.",
    ],
    keyIdea: "The first weighing's equal pans waste the patterns where the counterfeit's direction cannot be read; the usable count is (3^k - 3)/2.",
    commonMistake: String.raw`Stopping at the raw bound $2n \le 27$ and answering 13, or forgetting the direction requirement and answering 13 for that reason.`,
    fastPath: "Tilt leaves 2m, balance leaves 2(n - 2m); both <= 9 force m = 4, n = 12. Twelve.",
    variation: "Same conditions but you do not need to report heavy or light. What is the largest batch for three weighings?",
    variationAnswer: String.raw`13: the unused pattern can be spent on a coin whose direction is never learned, giving $(3^3 - 1)/2 = 13$.`,
    family: "weighing",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "bt-019",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["weighing", "search-strategy", "logic"],
    minutes: 5,
    title: "Two bad bags on a digital scale",
    prompt: String.raw`Ten bags each contain a large stock of coins, well over a thousand apiece. Genuine coins weigh exactly 10 g. In exactly *two* of the bags every coin weighs 11 g instead; the other eight bags are all genuine. You have a digital scale that reports the exact total weight of whatever you place on it, but you may use it only *once*. Which plan lets you identify both bad bags from a single reading?`,
    answer: {
      type: "choice",
      options: [
        "Take 1 coin from bag 1, 2 from bag 2, ..., 10 from bag 10 and weigh them together.",
        "Take 1 coin from bag 1, 2 from bag 2, 4 from bag 3, ..., 512 from bag 10 and weigh them together.",
        "Take 10 coins from every bag and weigh them together.",
        "No single weighing can work; two weighings are needed to find two bags.",
      ],
      correct: 1,
    },
    hints: [
      "The excess over the genuine weight tells you the total number of heavy coins on the scale. You need that number to identify the pair of bags uniquely.",
      "With counts 1 to 10, the pair (1, 4) and the pair (2, 3) both put 5 heavy coins on the scale: ambiguous.",
      "You need ten counts whose pairwise sums are all different. Powers of two do this because binary representations are unique.",
    ],
    solution: String.raw`Whatever coins you place on the scale, the reading minus 10 g per coin equals the number of heavy coins present. If you took $c_k$ coins from bag $k$ and the bad bags are $i$ and $j$, the excess is $c_i + c_j$ grams. A single weighing therefore identifies the pair exactly when the 45 pairwise sums $c_i + c_j$ (for $i < j$) are all different.

Counts $1, 2, \dots, 10$ fail: $1 + 4 = 2 + 3 = 5$, so an excess of 5 g does not tell you which pair is bad. Taking 10 from every bag is worse still: every pair gives an excess of 20 g. These rule out options 1 and 3.

Powers of two work. With $c_k = 2^{k-1}$ the excess is $2^{i-1} + 2^{j-1}$, a number with exactly two 1-bits in binary, and the positions of those bits name the two bags. For example an excess of 36 g $= 32 + 4$ means bags 6 and 3. Every pair gives a different sum because binary representations are unique, so one weighing suffices and option 4 is wrong. The verifier checks all 45 pair sums for each proposed count vector.

The underlying trick generalises: to detect any subset of bad bags with one weighing, use counts whose subset sums are all distinct, and powers of two are the canonical choice. For exactly one bad bag the simpler counts $1, 2, \dots, 10$ already suffice, which is why option 1 is the tempting wrong answer here.`,
    steps: [
      "The excess weight equals the total number of heavy coins placed.",
      "Need all 45 pairwise sums of the counts to be distinct.",
      "1..10 fails (1 + 4 = 2 + 3); powers of two succeed by uniqueness of binary.",
      "Decode: the two 1-bits of the excess name the bags.",
    ],
    keyIdea: "Encode bag identity in coin counts so that the sum of any two counts is unique: powers of two.",
    commonMistake: "Reusing the one-bad-bag trick (1, 2, ..., 10) without checking that pair sums collide.",
    fastPath: "Two unknowns, one reading: need distinct pair sums. Powers of two. Option 2.",
    variation: "Same ten bags, but now some unknown number of bags (possibly zero, possibly all) are bad. Can one weighing still identify them all, and how many coins does it need?",
    variationAnswer: String.raw`Yes: powers of two make every subset sum unique. You need $1 + 2 + \dots + 512 = 1023$ coins on the scale.`,
    family: "weighing",
    verifiedBy: ["exhaustive-search"],
  },
  {
    id: "bt-020",
    module: 9,
    kind: "brainteaser",
    difficulty: 5,
    tags: ["weighing", "search-strategy", "logic"],
    minutes: 12,
    title: "Sorting five coins by weight",
    prompt: String.raw`Five coins all have different weights, but they look identical. You have a two-pan balance that compares exactly one coin against one coin and tells you which is heavier. What is the minimum number of comparisons that *guarantees* you can arrange all five coins in order of weight, whatever the true order is?`,
    answer: { type: "numeric", value: 7, exact: String.raw`\lceil \log_2 5! \rceil = \lceil \log_2 120 \rceil = 7` },
    hints: [
      String.raw`There are $5! = 120$ possible orders and each comparison has two outcomes. How many comparisons are needed just to have enough outcome patterns?`,
      String.raw`$2^6 = 64 < 120 \le 128 = 2^7$, so at least 7. Now find a procedure that never uses more than 7.`,
      "Compare two pairs (2 comparisons), compare the two winners (1), insert the fifth coin into the chain of three by binary search (2), then insert the remaining coin into the right part of the chain (2).",
    ],
    solution: String.raw`Lower bound first. A sorting procedure is a decision tree whose leaves are the possible orders. With $5! = 120$ orders and two outcomes per comparison, a tree of depth $d$ has at most $2^d$ leaves, so we need $2^d \ge 120$, hence $d \ge 7$ because $2^6 = 64$. Six comparisons can never be enough.

Seven comparisons suffice, by a careful merge-insertion. Compare $a$ with $b$ and $c$ with $d$ (2 comparisons); relabel so that $a < b$ and $c < d$. Compare the two heavier coins $b$ and $d$ (1 comparison); say $b < d$. We now know the chain $a < b < d$ and that $c < d$, with $e$ unplaced: three comparisons used.

Insert $e$ into the chain $a < b < d$ by binary search: compare $e$ with $b$, then with $a$ or $d$ as appropriate (2 comparisons). We now have a sorted chain of the four coins $a, b, d, e$, and we still know $c < d$. So $c$ only needs to be placed among the coins below $d$ in the chain. If $e$ landed below $d$ those coins are $a, b, e$, giving four possible gaps for $c$, which two comparisons resolve by binary search; if $e$ landed above $d$ the coins below $d$ are just $a, b$, three gaps, again at most two comparisons. Total: $3 + 2 + 2 = 7$.

The verifier does not trust the hand argument: it runs a full minimax search over all comparison decision trees (states are the sets of orders still consistent with the answers so far) and finds that the optimum is exactly 7. The information bound happens to be tight for 5 items; it is also tight for 4 ($5$) and 6 ($10$), but famously fails for 12, where 30 comparisons are needed although $\lceil \log_2 12! \rceil = 29$. Answer: $7$.`,
    steps: [
      "Count orders: 120; each comparison halves at best.",
      "Lower bound: 2^6 = 64 < 120, so at least 7.",
      "Construct: two pairs, compare winners, binary-insert the fifth, binary-insert the last into the part below its known upper bound.",
      "Confirm by exhaustive minimax search over decision trees.",
    ],
    keyIdea: "Information-theoretic lower bound plus a merge-insertion that never wastes a comparison on a coin whose position is partly known.",
    commonMistake: "Answering 10 (all pairs) or 8 (a naive insertion sort), or claiming the information bound is always achievable without constructing the procedure.",
    fastPath: "log2(120) is just under 7, so 7 is the floor; the pairs-then-insert procedure hits it. Seven.",
    variation: "Same balance, but now you only need to find the heaviest and the lightest coin among the five. Minimum comparisons?",
    variationAnswer: String.raw`Six: compare $a$ with $b$ and $c$ with $d$ (2), the two winners against each other (1), the two losers against each other (1), then the fifth coin against the current maximum (1) and against the current minimum (1). The general bound for $n$ items is $\lceil 3n/2 \rceil - 2$, which is 6 for $n = 5$.`,
    family: "weighing",
    verifiedBy: ["exhaustive-search", "formula"],
  },

  // ------------------------------------------------------------ hat puzzles
  {
    id: "bt-021",
    module: 9,
    kind: "brainteaser",
    difficulty: 4,
    tags: ["hats", "logic", "symmetry", "coins"],
    minutes: 7,
    title: "Guess or stay silent",
    prompt: String.raw`Three analysts each get a hat that is red or blue, decided by independent fair coin flips. Each sees the other two hats but not their own. At a signal, every analyst must *simultaneously* either announce a colour for their own hat or stay silent. The team wins if at least one analyst announces and every announcement is correct; they lose if everyone stays silent or anyone is wrong. They may agree on a strategy beforehand but cannot communicate afterwards. What is the highest probability of winning that any strategy can achieve?`,
    answer: { type: "numeric", value: 3 / 4, exact: String.raw`\tfrac{3}{4}` },
    hints: [
      "Any single announcement is correct with probability exactly 1/2, whatever the strategy. So the trick is to arrange *which* hat assignments produce wrong announcements.",
      "Make the wrong guesses pile up on the same few assignments: in a losing assignment, let everyone be wrong at once; in a winning one, let only one person speak.",
      "Rule: if the two hats you see match, announce the opposite colour; otherwise stay silent. Check all 8 assignments.",
    ],
    solution: String.raw`Start with a bound. Whatever the strategy, each analyst's announcement, when made, is correct with probability exactly $\tfrac12$: their own hat is independent of everything they see. Over the 8 equally likely assignments, count announcements: if a strategy produces $A$ announcements in total across the 8 assignments, exactly $A/2$ of them are correct and $A/2$ are wrong. A winning assignment needs at least one correct announcement and no wrong ones; a losing assignment can absorb many wrong ones. With 3 analysts, each assignment supports at most 3 wrong announcements, so the $A/2$ wrong announcements need at least $A/6$ losing assignments, while the $A/2$ correct announcements can cover at most $A/2$ winning assignments. Wins $\le 8 - \text{losses}$, and to have 7 wins you would need $A/2 \ge 7$ correct and only one losing assignment absorbing $A/2 \ge 7 > 3$ wrong ones: impossible. So at most 6 of the 8 assignments can be wins, and the probability is at most $\tfrac68 = \tfrac34$.

Now achieve it. Strategy: if the two hats you see are the same colour, announce the *other* colour; if they differ, stay silent. In the 6 assignments with two hats of one colour and one of the other, the two analysts wearing the majority colour each see mixed hats and stay silent, while the odd one out sees two matching hats and correctly announces the opposite. One correct announcement, no wrong ones: a win. In the 2 assignments where all three hats match, everyone sees two matching hats and everyone announces the wrong colour: a loss, but all three wrong guesses are packed into these two assignments. Six wins out of eight gives $\tfrac34$.

The verifier enumerates all $81^3 = 531441$ strategy profiles (each analyst maps the 4 possible views to red, blue or silent) and confirms that no profile wins more than 6 of the 8 assignments. The structure here is a toy Hamming code: with 7 players the same idea reaches $\tfrac78$.`,
    steps: [
      "Each announcement is right with probability 1/2: the total count of wrong guesses is fixed by the number of guesses.",
      "Concentrate wrong guesses into few assignments; use single correct guesses to win the rest.",
      "Strategy: see a matching pair, call the opposite; see a mixed pair, stay silent.",
      "Six of eight assignments win: 3/4.",
    ],
    keyIdea: "You cannot make guesses more accurate, but you can make wrong guesses coincide and right guesses spread out.",
    commonMistake: String.raw`Claiming $\tfrac12$ is the ceiling because 'no one can know their hat', or proposing that one designated person always guesses (which gives exactly $\tfrac12$).`,
    fastPath: "Odd-one-out speaks: wins on the 6 mixed assignments, loses on the 2 uniform ones. 3/4.",
    variation: "Same rules with the team winning only if *everyone* announces and all are correct (silence is forbidden). Best probability?",
    variationAnswer: String.raw`$\tfrac12$, not $\tfrac18$. The team can never beat the chance that one fixed analyst is right, which is $\tfrac12$, but a parity rule reaches it: everyone announces the colour that would make the total number of blue hats even. If the true count of blues is even, all three are right; if it is odd, all three are wrong. The three guesses are right or wrong *together*, so the team wins on exactly 4 of the 8 assignments. Guessing independently would give $\tfrac18$; coordination cannot raise any single guess above $\tfrac12$, but it can make the guesses succeed simultaneously.`,
    family: "hats",
    verifiedBy: ["exhaustive-search", "enumeration"],
  },
  {
    id: "bt-022",
    module: 9,
    kind: "brainteaser",
    difficulty: 4,
    tags: ["hats", "invariants", "logic"],
    minutes: 6,
    title: "Seven in a line, three colours",
    prompt: String.raw`Seven analysts stand in a single file. An adversary places a hat on each head, choosing each colour freely from red, green and blue (any combination is possible, including all the same). Each analyst sees every hat in front of them, but not their own hat and none of the hats behind them. Starting from the back of the line and moving forward, each analyst in turn says exactly one colour out loud; everyone hears every call. Before the hats go on, the group agrees on a strategy. What is the largest number of correct calls the strategy can *guarantee*, whatever hats the adversary chooses?`,
    answer: { type: "numeric", value: 6, exact: "7 - 1 = 6" },
    hints: [
      "The analyst at the back sees six hats and knows nothing about her own. Whatever rule she follows, the adversary can choose her hat to make her wrong. Can everyone else still be saved?",
      "Encode the colours as 0, 1, 2. The back analyst announces the sum of the six hats she sees, modulo 3, as a colour.",
      "The next analyst sees five hats and heard the total of six; the difference is his own hat. Each later analyst subtracts the hats already called and the hats still visible.",
    ],
    solution: String.raw`First, the ceiling. The analyst at the back sees the six hats in front of her and nothing else. Her call is some function of those six hats. For any such function, the adversary can simply put a different colour on her head, so no strategy can guarantee that she is right. At most 6 correct calls can be guaranteed.

Six is achievable with a modular sum. Code the colours as 0, 1, 2. The back analyst computes the sum $s$ of the six hats she sees modulo 3 and calls the colour with that code. She is right or wrong by luck. The sixth analyst sees five hats with sum $t$; his own hat must be $s - t \pmod 3$, which he calls, correctly. The fifth analyst heard $s$ and the sixth's correct call $h_6$, sees four hats with sum $u$, and deduces $h_5 = s - h_6 - u \pmod 3$. Each analyst in turn subtracts from $s$ the hats already called behind them (all correct) and the hats they can see in front, and what remains is their own colour. Every analyst from the sixth to the first is correct, for every hat assignment: six guaranteed.

The verifier runs this strategy on all $3^7 = 2187$ assignments and checks the minimum number of correct calls is 6. Notice that the number of colours does not matter for the count: with $c$ colours the same sum-mod-$c$ trick saves everyone except the first speaker, and the first speaker can never be saved.`,
    steps: [
      "The first speaker's call cannot depend on her own hat: she is never guaranteed.",
      "Encode colours as 0, 1, 2 and have her announce the sum mod 3 of the hats she sees.",
      "Each subsequent analyst subtracts heard and seen hats from the announced total.",
      "All six remaining analysts are correct: the guarantee is 6.",
    ],
    keyIdea: "The first speaker sacrifices her call to broadcast a modular checksum; everyone else decodes their own hat from it.",
    commonMistake: "Trying to make the first call carry 'the colour of the person in front' (which only saves one person) or reasoning about majority colours, which fails for an adversarial assignment.",
    fastPath: "n people, c colours, adversarial hats: n - 1 guaranteed via sum mod c. Here 6.",
    variation: "Same line of seven, same rules, but the adversary now has five colours to choose from instead of three. How many correct calls can be guaranteed?",
    variationAnswer: String.raw`Still 6. Code the colours 0 to 4 and run the identical scheme with sums modulo 5; the back analyst is still unprotectable and everyone else decodes exactly.`,
    family: "hats",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "bt-023",
    module: 9,
    kind: "brainteaser",
    difficulty: 4,
    tags: ["hats", "invariants", "logic", "expectation"],
    minutes: 6,
    title: "Numbered hats, one must be right",
    prompt: String.raw`Three traders each receive a hat showing a number 0, 1 or 2, chosen independently and uniformly at random. Each sees the other two numbers but not their own. At a signal, all three *simultaneously* announce a guess for their own number (silence is not allowed). The team wins if at least one guess is correct. They agree a strategy in advance and cannot communicate afterwards. Which statement about the best possible strategy is true?`,
    answer: {
      type: "choice",
      options: [
        String.raw`No strategy beats $1 - (2/3)^3 = 19/27$: each guess is an independent one-in-three shot.`,
        "There is a strategy that wins with certainty: at least one trader is always right.",
        String.raw`The best possible probability is $\tfrac13$, because what a trader sees is independent of their own number.`,
        String.raw`The best possible probability is $\tfrac23$, achieved by two traders coordinating and the third guessing freely.`,
      ],
      correct: 1,
    },
    hints: [
      "Each individual guess is right with probability exactly 1/3. The expected number of correct guesses is therefore 1 no matter what. Can you make the number of correct guesses *always* equal to 1?",
      "The total of the three numbers mod 3 is 0, 1 or 2. Assign one of these three possibilities to each trader.",
      "Trader k assumes the total is k mod 3 and guesses the number that would make it so. Exactly one trader's assumption is right.",
    ],
    solution: String.raw`Each trader's own number is independent of what they see, so any individual guess is correct with probability exactly $\tfrac13$, and by linearity the expected number of correct guesses is $3 \times \tfrac13 = 1$ for every strategy. That sounds like a limitation, but it is an opportunity: if some strategy makes the number of correct guesses *exactly* 1 in every case, the team always wins.

Here is such a strategy. Label the traders 0, 1 and 2 and let $S$ be the sum of all three numbers modulo 3; $S$ is one of 0, 1, 2. Trader $k$ assumes $S = k$: seeing the other two numbers with sum $t$, they announce $k - t \pmod 3$. Whichever value $S$ actually takes, exactly one trader has assumed correctly, and that trader's announcement equals their true number; the other two are wrong. So in every one of the 27 assignments exactly one guess is right and the team wins with probability 1. The verifier runs this over all 27 assignments.

Option 1 fails because the guesses are not independent events under a coordinated strategy; only their *marginal* probabilities are fixed. Option 3 confuses 'each trader is right with probability 1/3' with 'the team is right with probability 1/3'. Option 4 is a weaker strategy than the one above. The correct statement is option 2.`,
    steps: [
      "Each guess is right with probability 1/3; the expected count of correct guesses is 1.",
      "Aim for exactly one correct guess in every assignment.",
      "Trader k assumes the total is k mod 3 and guesses accordingly.",
      "Exactly one assumption is true every time: certain win.",
    ],
    keyIdea: "Fixed marginals do not fix the joint: spread the three 'total mod 3' hypotheses across the three players so exactly one is always right.",
    commonMistake: "Treating the three guesses as independent and bounding the win probability by 19/27.",
    fastPath: "Three players, three residues of the total mod 3, one each. Someone is always right. Option 2.",
    variation: "Same game with 3 traders but hats numbered 0 to 3 (four values). What is the best possible win probability?",
    variationAnswer: String.raw`The expected number of correct guesses is $3/4 < 1$, so certainty is impossible; the best is $\tfrac34$, achieved by the same residue trick covering three of the four possible totals mod 4.`,
    family: "hats",
    verifiedBy: ["enumeration"],
  },
  {
    id: "bt-024",
    module: 9,
    kind: "brainteaser",
    difficulty: 2,
    tags: ["hats", "logic", "coins"],
    minutes: 3,
    title: "Two hats, one must be right",
    prompt: String.raw`Two colleagues, Priya and Tom, each receive a hat that is red or blue, decided by independent fair coin flips. Each sees the other's hat but not their own. At a signal they *simultaneously* each announce a colour for their own hat. They win as a team if at least one of them is correct. They agree on a strategy beforehand and cannot communicate afterwards. Which strategy guarantees a win every time?`,
    answer: {
      type: "choice",
      options: [
        "Both announce the colour of the hat they see.",
        "Priya announces the colour she sees; Tom announces the opposite of the colour he sees.",
        "Both always announce red.",
        String.raw`No strategy can guarantee a win; the best possible is $\tfrac34$.`,
      ],
      correct: 1,
    },
    hints: [
      "Each guess alone is right half the time. Try to make the two guesses right in complementary situations.",
      "If the hats match, who should be right? If they differ, who should be right?",
      "'Same as I see' is right exactly when the hats match; 'opposite of what I see' is right exactly when they differ.",
    ],
    solution: String.raw`There are four equally likely hat assignments: both red, both blue, Priya red and Tom blue, Priya blue and Tom red. Call the first two *matching* and the last two *mixed*.

If Priya announces the colour she sees on Tom, she is right exactly in the matching cases. If Tom announces the opposite of the colour he sees on Priya, he is right exactly in the mixed cases. The matching and mixed cases together cover all four assignments, so in every assignment one of them is correct and the team always wins. That is option 2.

Option 1 has both players right in the matching cases and both wrong in the mixed cases: a $\tfrac12$ win rate. Option 3 wins unless both hats are blue: $\tfrac34$. Option 4 is false because option 2 exists. The verifier checks all 16 possible strategy pairs (each player's guess is a function of the one hat they see) and finds exactly the two complementary pairings win in all four cases.

The lesson generalises: with two players the win condition 'at least one right' can be made certain because the events 'hats match' and 'hats differ' partition the possibilities and each player can target one part.`,
    steps: [
      "List the four assignments as matching or mixed.",
      "'Same as seen' is right in matching cases; 'opposite of seen' is right in mixed cases.",
      "Assign one rule to each player: every assignment has a correct guess.",
    ],
    keyIdea: "Partition the hat assignments into 'match' and 'differ' and give each player one part to cover.",
    commonMistake: "Giving both players the same rule, which makes them right and wrong together, or concluding that independence of each guess caps the team at 3/4.",
    fastPath: "One says same, one says opposite. Certain win. Option 2.",
    variation: "Three colleagues, hats red or blue, same rules: at least one correct simultaneous guess wins. Can a win be guaranteed?",
    variationAnswer: String.raw`Yes, and easily: the two-player trick already covers it. Let two players follow the match / differ rules about each other and let the third guess anything.`,
    family: "hats",
    verifiedBy: ["exhaustive-search", "enumeration"],
  },

  // ------------------------------------------------------------ number puzzles
  {
    id: "bt-025",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["number-puzzle", "search-strategy"],
    minutes: 4,
    title: "Digit sum twenty, divisible by twenty",
    prompt: String.raw`What is the smallest positive integer whose digits add up to 20 and which is divisible by 20?`,
    answer: { type: "numeric", value: 3980, exact: "3980" },
    hints: [
      "Divisible by 20 means divisible by 4 and by 5. What does that say about the last two digits?",
      "The number must end in 00, 20, 40, 60 or 80. The remaining digits must supply the rest of the digit sum 20.",
      "Three digits cannot reach a sum of 20 with a trailing zero (max 9 + 8 + 0 = 17). With four digits, minimise the leading digit.",
    ],
    solution: String.raw`A multiple of 20 ends in 0 and its tens digit is even, so the last two digits are 00, 20, 40, 60 or 80. The digit sum contributed by the last two digits is therefore 0, 2, 4, 6 or 8, and the earlier digits must contribute $20, 18, 16, 14$ or $12$ respectively.

A three-digit number has only one earlier digit, at most 9, so it cannot work. With four digits $ab$ followed by the tail, we need $a + b$ equal to one of those targets with $a \ge 1$ and $b \le 9$. To make the number as small as possible we want the smallest leading digit $a$, and $a = (\text{target}) - b \ge \text{target} - 9$. The smallest target, 12, comes from the tail 80, giving $a = 3, b = 9$: the number 3980. The other tails give 5960, 7960, 9920 and no solution for 00 (target 20 is too big for two digits).

Check: $3 + 9 + 8 + 0 = 20$ and $3980 = 20 \times 199$. Nothing smaller works: among four-digit candidates the leading digit 3 is forced by the tail 80 and is the smallest achievable, and with leading digit 3 and tail 80 the tens-of-hundreds digit must be 9. Answer: $3980$. The verifier scans upward from 1 and also builds the minimum via a digit-by-digit dynamic programme over (digit sum, remainder mod 20).`,
    steps: [
      "Divisible by 20: last two digits are 00, 20, 40, 60 or 80.",
      "Earlier digits must supply 20 minus the tail's digit sum.",
      "Three digits are impossible; with four, minimise the leading digit.",
      "Tail 80 gives 3 + 9: 3980.",
    ],
    keyIdea: "Pin down the forced tail, then greedily minimise from the most significant digit.",
    commonMistake: "Minimising the digit sum of the tail (choosing 00) instead of minimising the leading digit, or forgetting that the tens digit must be even.",
    fastPath: "Tail 80 leaves 12 for two digits: 3 and 9. 3980.",
    variation: "Smallest positive integer with digit sum 20 that is divisible by 25?",
    variationAnswer: String.raw`A multiple of 25 ends in 00, 25, 50 or 75, leaving 20, 13, 15 or 8 for the other digits. A single leading digit can supply 8: $875 = 25 \cdot 35$ with digit sum $8 + 7 + 5 = 20$, and no three-digit number with another tail works, so the answer is 875.`,
    verifiedBy: ["exhaustive-search", "dp"],
  },
  {
    id: "bt-026",
    module: 9,
    kind: "brainteaser",
    difficulty: 2,
    tags: ["number-puzzle", "search-strategy"],
    minutes: 3,
    title: "Crates that never pack evenly",
    prompt: String.raw`A warehouse has a stack of identical crates. Packing them in rows of 3 leaves 2 over; rows of 4 leave 2 over; rows of 5 leave 2 over; rows of 7 pack perfectly. What is the smallest possible number of crates?`,
    answer: { type: "numeric", value: 182, exact: "182" },
    hints: [
      "The same remainder for 3, 4 and 5 means that n minus 2 is divisible by all three.",
      "So n = 60k + 2 for some k. Now impose divisibility by 7.",
      String.raw`$60k + 2 \equiv 4k + 2 \pmod 7$; find the smallest $k \ge 0$ with $4k \equiv 5 \pmod 7$.`,
    ],
    solution: String.raw`Since $n$ leaves remainder 2 on division by 3, 4 and 5, the number $n - 2$ is divisible by each of them, hence by their least common multiple $60$. So $n = 60k + 2$ for some whole number $k \ge 0$.

Now require $7 \mid n$. Modulo 7, $60 \equiv 4$, so we need $4k + 2 \equiv 0$, i.e. $4k \equiv 5 \pmod 7$. The inverse of 4 modulo 7 is 2 (because $4 \cdot 2 = 8 \equiv 1$), so $k \equiv 10 \equiv 3 \pmod 7$. The smallest such $k$ is 3, giving $n = 182$.

Check: $182 = 3 \cdot 60 + 2$, $182 = 4 \cdot 45 + 2$, $182 = 5 \cdot 36 + 2$ and $182 = 7 \cdot 26$. The next solutions are $182 + 420 = 602$, then $1022$, since the full period is $\operatorname{lcm}(3, 4, 5, 7) = 420$. Answer: $182$.`,
    steps: [
      "Shared remainder 2: n - 2 is a multiple of lcm(3, 4, 5) = 60.",
      "Write n = 60k + 2 and reduce mod 7: 4k + 2 = 0.",
      "Solve: k = 3, so n = 182.",
      "Verify all four conditions.",
    ],
    keyIdea: "A common remainder collapses several congruences into one; then solve the last congruence by hand.",
    commonMistake: "Trying multiples of 7 one by one, or using lcm(3, 4, 5) = 120 by mistake (it is 60).",
    fastPath: "n = 60k + 2; 62, 122, 182: 182 = 7 * 26. Done.",
    variation: "Rows of 3, 4 and 5 all leave 1 crate over, and rows of 11 pack perfectly. Smallest stack?",
    variationAnswer: String.raw`$n = 60k + 1 \equiv 5k + 1 \pmod{11}$, so $5k \equiv 10$, $k = 2$: $n = 121 = 11^2$.`,
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "bt-027",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["number-puzzle", "stars-and-bars", "inclusion-exclusion"],
    minutes: 4,
    title: "Account numbers with digit sum thirteen",
    prompt: String.raw`Internal account numbers run from 1 to 999. How many of them have digits that add up to exactly 13?`,
    answer: { type: "numeric", value: 75, exact: String.raw`\binom{15}{2} - 3\binom{5}{2} = 105 - 30 = 75` },
    hints: [
      "Pad every number to three digits with leading zeros; the digit sum does not change. You are counting digit triples (a, b, c) with a + b + c = 13.",
      String.raw`Without the digit cap the count is stars and bars: $\binom{13 + 2}{2} = 105$.`,
      "Subtract the triples where some digit is 10 or more: substitute a' = a - 10 and count a' + b + c = 3.",
    ],
    solution: String.raw`Write each account number with three digits, padding with leading zeros; the digit sum is unchanged and 000 has sum 0, so it never interferes. We want the number of triples $(a, b, c)$ with $0 \le a, b, c \le 9$ and $a + b + c = 13$.

Ignore the upper bound first. Non-negative integer solutions of $a + b + c = 13$ are counted by stars and bars: $\binom{13 + 3 - 1}{3 - 1} = \binom{15}{2} = 105$.

Now remove the solutions where some digit exceeds 9. If $a \ge 10$, write $a = a' + 10$ with $a' \ge 0$; then $a' + b + c = 3$ has $\binom{5}{2} = 10$ solutions. The same count applies to $b \ge 10$ and $c \ge 10$. Two digits cannot both be at least 10 since $20 > 13$, so there is no double-counting to add back. Inclusion-exclusion gives $105 - 3 \cdot 10 = 75$.

A direct check: the possible first digits run from 0 to 9, and for each the remaining two digits must sum to $13 - a$ with each at most 9. For $a = 0$ to 4 the pair sum is 13 down to 9 and the pair counts are 6, 7, 8, 9, 10; for $a = 5$ to 9 the pair sums are 8 down to 4 with counts 9, 8, 7, 6, 5. Total $6 + 7 + 8 + 9 + 10 + 9 + 8 + 7 + 6 + 5 = 75$. Answer: $75$.`,
    steps: [
      "Pad to three digits; count triples with a + b + c = 13.",
      "Stars and bars without caps: C(15, 2) = 105.",
      "Subtract triples with a digit >= 10: 3 * C(5, 2) = 30.",
      "No double overlap; answer 75.",
    ],
    keyIdea: "Stars and bars for the raw count, then inclusion-exclusion to enforce the digit cap of 9.",
    commonMistake: String.raw`Forgetting the cap and answering 105, or subtracting $\binom{6}{2}$ instead of $\binom{5}{2}$ by miscounting the shifted sum.`,
    fastPath: "105 minus three times 10. 75.",
    variation: "How many numbers from 1 to 9999 have digit sum 13?",
    variationAnswer: String.raw`Four digits: $\binom{16}{3} - 4\binom{6}{3} = 560 - 80 = 480$ (no double overlaps since $20 > 13$).`,
    family: "stars-and-bars",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "bt-028",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["number-puzzle", "search-strategy"],
    minutes: 4,
    title: "Ten zeros at the end of a factorial",
    prompt: String.raw`What is the smallest positive integer $n$ such that $n!$ (the product $1 \cdot 2 \cdots n$) ends in at least ten zeros?`,
    answer: { type: "numeric", value: 45, exact: "45" },
    hints: [
      "A trailing zero comes from a factor 10 = 2 * 5. In a factorial there are far more factors of 2 than of 5, so count the 5s.",
      String.raw`The number of factors of 5 in $n!$ is $\lfloor n/5 \rfloor + \lfloor n/25 \rfloor + \lfloor n/125 \rfloor + \cdots$`,
      String.raw`$40!$ has $8 + 1 = 9$ trailing zeros. What about 45?`,
    ],
    solution: String.raw`Each trailing zero of $n!$ is a factor of $10 = 2 \times 5$. Since every second number contributes a factor of 2 but only every fifth contributes a 5, the 5s are the bottleneck and the number of trailing zeros equals the exponent of 5 in $n!$.

That exponent is given by Legendre's formula: $\lfloor n/5 \rfloor$ multiples of 5 each give one factor, the multiples of 25 give a second one, the multiples of 125 a third, and so on:
$$z(n) = \left\lfloor \frac{n}{5} \right\rfloor + \left\lfloor \frac{n}{25} \right\rfloor + \left\lfloor \frac{n}{125} \right\rfloor + \cdots$$

Tabulate: $z(40) = 8 + 1 = 9$, and $z(n) = 9$ for all $n$ from 40 to 44 because no new multiple of 5 appears. At $n = 45$ the term $\lfloor 45/5 \rfloor$ becomes 9, so $z(45) = 9 + 1 = 10$. Therefore $45$ is the smallest $n$ with at least ten trailing zeros. The verifier also computes $n!$ exactly as a big integer and counts the zeros directly.

Two traps are worth naming. First, not every count is achievable: $z(n)$ jumps from 4 to 6 at $n = 25$, so no factorial ends in exactly 5 zeros. Second, the naive guess $n = 50$ ('ten multiples of five') ignores the extra factor from 25. Answer: $45$.`,
    steps: [
      "Trailing zeros = number of factors of 5 (2s are plentiful).",
      "Legendre: floor(n/5) + floor(n/25) + ...",
      "z(40) = 9; z(45) = 10.",
      "Smallest n is 45.",
    ],
    keyIdea: "Count factors of 5 with Legendre's formula; the multiples of 25 add a second factor each.",
    commonMistake: "Answering 50 by counting only multiples of 5, or counting factors of 10 directly.",
    fastPath: "Need 10 fives: 45/5 = 9 plus 45/25 = 1. Forty-five.",
    variation: "How many trailing zeros does 125! have?",
    variationAnswer: String.raw`$25 + 5 + 1 = 31$.`,
    verifiedBy: ["formula", "exhaustive-search"],
  },
  {
    id: "bt-029",
    module: 9,
    kind: "brainteaser",
    difficulty: 2,
    tags: ["number-puzzle", "invariants"],
    minutes: 3,
    title: "A huge power, a small remainder",
    prompt: String.raw`What is the remainder when $3^{2026}$ is divided by 7?`,
    answer: { type: "numeric", value: 4, exact: "4" },
    hints: [
      "Write down the remainders of 3, 9, 27, 81, ... on division by 7. They repeat.",
      String.raw`$3^1, 3^2, \dots, 3^6$ leave $3, 2, 6, 4, 5, 1$ modulo 7; the cycle has length 6.`,
      String.raw`Reduce the exponent modulo 6: $2026 = 6 \cdot 337 + 4$, so the answer is the remainder of $3^4$.`,
    ],
    solution: String.raw`Compute the powers of 3 modulo 7: $3^1 \equiv 3$, $3^2 = 9 \equiv 2$, $3^3 = 27 \equiv 6$, $3^4 = 81 \equiv 4$, $3^5 \equiv 12 \equiv 5$, $3^6 \equiv 15 \equiv 1$. Once a power is $1$ the pattern repeats, so the remainders cycle with period 6. (Fermat's little theorem guarantees $3^6 \equiv 1 \pmod 7$ in advance, since 7 is prime and does not divide 3.)

Therefore $3^{2026} \equiv 3^{2026 \bmod 6}$. Dividing, $2026 = 6 \cdot 337 + 4$, so $3^{2026} \equiv 3^4 = 81 \equiv 4 \pmod 7$.

The verifier confirms this by multiplying out $3^{2026}$ exactly with big integers and reducing. Answer: $4$.`,
    steps: [
      "List powers of 3 mod 7 until you hit 1: period 6.",
      "Reduce the exponent: 2026 mod 6 = 4.",
      "3^4 = 81 = 4 mod 7.",
    ],
    keyIdea: "Powers modulo a prime cycle; reduce the exponent by the cycle length.",
    commonMistake: "Reducing the exponent modulo 7 instead of modulo the cycle length 6.",
    fastPath: "Cycle length 6; 2026 mod 6 is 4; 81 mod 7 is 4.",
    variation: "What is the last digit of 7^2026?",
    variationAnswer: String.raw`Powers of 7 mod 10 cycle 7, 9, 3, 1 with period 4; $2026 \bmod 4 = 2$, so the last digit is 9.`,
    verifiedBy: ["formula", "enumeration"],
  },
  {
    id: "bt-030",
    module: 9,
    kind: "brainteaser",
    difficulty: 2,
    tags: ["number-puzzle", "search-strategy"],
    minutes: 3,
    title: "Counting the digit three",
    prompt: String.raw`A clerk writes out all the integers from 1 to 500 inclusive, one after another. How many times does the digit 3 appear in total?`,
    answer: { type: "numeric", value: 200, exact: "50 + 50 + 100 = 200" },
    hints: [
      "Count the 3s in the units place, the tens place and the hundreds place separately.",
      "In the units place a 3 appears once in every block of ten: 3, 13, 23, ... How many blocks of ten are there up to 500?",
      "Tens place: ten numbers (30 to 39) in every block of 100. Hundreds place: all of 300 to 399.",
    ],
    solution: String.raw`Count by position. In the *units* place, the digit 3 appears exactly once in each block of ten consecutive integers ($3, 13, 23, \dots, 493$). From 1 to 500 there are 50 complete blocks of ten, so 50 appearances.

In the *tens* place, the digit 3 appears in the ten numbers $30$ to $39$ of each block of one hundred ($30$–$39$, $130$–$139$, …, $430$–$439$). Five blocks of a hundred give $5 \times 10 = 50$ appearances.

In the *hundreds* place, the digit 3 appears in every number from $300$ to $399$: 100 appearances. The number 500 contributes nothing.

Total: $50 + 50 + 100 = 200$. Note that a number such as 333 is counted three times, once per position, which is exactly what 'how many times does the digit appear' asks for. Answer: $200$.`,
    steps: [
      "Split by digit position.",
      "Units: once per block of ten, 50 blocks: 50.",
      "Tens: ten per block of a hundred, 5 blocks: 50.",
      "Hundreds: all of 300 to 399: 100. Total 200.",
    ],
    keyIdea: "Count digit occurrences position by position; each position is periodic.",
    commonMistake: "Counting numbers that *contain* a 3 (which gives 176) instead of occurrences of the digit, or forgetting the hundreds block.",
    fastPath: "50 units, 50 tens, 100 hundreds: 200.",
    variation: "How many of the integers from 1 to 500 contain at least one digit 3?",
    variationAnswer: String.raw`Write 0 to 499 as three-digit strings. Strings with no 3 have a hundreds digit in $\{0, 1, 2, 4\}$ and two free digits from nine choices: $4 \cdot 9 \cdot 9 = 324$. Dropping 000 (out of range) and adding 500 (no 3) leaves 324 numbers in 1 to 500 without a 3, so $500 - 324 = 176$ contain one.`,
    verifiedBy: ["enumeration", "formula"],
  },

  // ------------------------------------------------------------ logic
  {
    id: "bt-031",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["knights-knaves", "logic"],
    minutes: 4,
    title: "Three statements at the help desk",
    prompt: String.raw`On a certain trading floor every person is either *honest* (every statement they make is true) or a *bluffer* (every statement they make is false). You meet three of them, Pat, Quinn and Rae. Pat says: "Exactly one of the three of us is honest." Quinn says: "Pat is a bluffer." Rae says: "Quinn and I are the same type." Who is honest?`,
    answer: {
      type: "choice",
      options: ["Pat only", "Quinn only", "Quinn and Rae", "Pat and Rae", "None of them"],
      correct: 2,
    },
    hints: [
      "Start with Rae's statement. If Rae is honest, what follows about Quinn? If Rae is a bluffer, what follows?",
      "Either way Quinn turns out honest. Now use Quinn's statement.",
      "Pat is a bluffer, so Pat's statement is false: it is not true that exactly one is honest.",
    ],
    solution: String.raw`Begin with Rae, whose statement is about Rae herself. If Rae is honest, her statement is true, so Quinn is the same type as Rae: honest. If Rae is a bluffer, her statement is false, so Quinn is *not* the same type as Rae; Rae is a bluffer, hence Quinn is honest. In both cases Quinn is honest. (A statement of the form 'X and I are the same type' always forces X to be honest.)

Quinn is honest, so Quinn's statement is true: Pat is a bluffer. Then Pat's statement is false, so the number of honest people is *not* exactly one. We already have Quinn honest and Pat not, so the count is one or two depending on Rae; 'not exactly one' forces Rae to be honest.

Check the full assignment Pat bluffer, Quinn honest, Rae honest: Pat's claim 'exactly one honest' is false (two are honest), consistent with Pat bluffing; Quinn's 'Pat is a bluffer' is true; Rae's 'Quinn and I are the same type' is true. Everything is consistent, and the verifier's search over all eight type assignments finds this is the only consistent one. Answer: Quinn and Rae are honest.`,
    steps: [
      "Rae's self-referential statement forces Quinn to be honest.",
      "Quinn honest means Pat is a bluffer.",
      "Pat bluffing means 'exactly one honest' is false, so Rae is honest.",
      "Verify the assignment against all three statements.",
    ],
    keyIdea: "'X and I are the same type' is true from an honest speaker and false from a bluffer, and either way X is honest.",
    commonMistake: "Assuming Pat is honest because his statement sounds like a neutral observation, or stopping at 'Quinn is honest' without using Pat's false claim to pin down Rae.",
    fastPath: "Rae's line makes Quinn honest; Quinn makes Pat a bluffer; Pat's false count makes Rae honest.",
    variation: "Replace Rae's statement with 'Quinn and I are different types.' Who is honest now?",
    variationAnswer: String.raw`'X and I are different types' forces X to be a bluffer whatever the speaker is, so Quinn bluffs; then Pat is honest; Pat's 'exactly one honest' must be true, so Rae is a bluffer. Pat only.`,
    family: "knights-knaves",
    verifiedBy: ["exhaustive-search"],
  },
  {
    id: "bt-032",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["knights-knaves", "logic", "pigeonhole"],
    minutes: 4,
    title: "Six answers, six different numbers",
    prompt: String.raw`Six traders sit at a table. Each is either *honest* (always tells the truth) or a *bluffer* (always lies). You ask each of them, privately, "How many of the six people at this table are honest?" The six answers are 0, 1, 2, 3, 4 and 5, each given by a different person. What can you conclude?`,
    answer: {
      type: "choice",
      options: [
        "Exactly one trader is honest: the one who answered 1.",
        "Exactly one trader is honest: the one who answered 0.",
        "Nobody at the table is honest.",
        "The information is not enough to determine how many are honest.",
      ],
      correct: 0,
    },
    hints: [
      "All honest traders would give the same answer: the true count. The six answers are all different.",
      "So there is at most one honest trader. Could there be zero?",
      "If nobody were honest, the true count would be 0, and the person who answered 0 would have told the truth.",
    ],
    solution: String.raw`Every honest trader states the true number of honest traders, so all honest traders give the same answer. Since the six answers are all different, at most one trader is honest.

Suppose none is honest. Then the true count is 0, and whoever answered 0 told the truth, contradicting the assumption that they are a bluffer. So there is exactly one honest trader, and that trader's answer must equal the true count, which is 1. The honest trader is the one who said 1.

Check the whole table: the person who said 1 is honest and correct; the others said 0, 2, 3, 4, 5, all different from the true count 1, so they are all lying, as bluffers must. The verifier runs through all $2^6 = 64$ honest/bluffer assignments and finds this is the only consistent one. Option 2 fails because 0 cannot be a truthful answer when its speaker is honest. Option 3 fails by the contradiction above. Option 4 is wrong since the answer is pinned down uniquely.`,
    steps: [
      "Honest traders all give the true count, so distinct answers mean at most one honest.",
      "Zero honest is impossible: the '0' answer would then be true.",
      "Exactly one honest, who must have said 1.",
      "Confirm every other answer is false.",
    ],
    keyIdea: "Truth-tellers agree with each other, so a set of distinct answers contains at most one truth; then rule out zero.",
    commonMistake: "Concluding 'nobody is honest' because the answers conflict, forgetting that the 0-answer would then be true.",
    fastPath: "At most one honest (answers differ); not zero (the 0 would be true); so the 1 is honest.",
    variation: "Same six traders, but the answers are 1, 2, 3, 4, 5 and 6. What can you conclude?",
    variationAnswer: String.raw`Still at most one honest. If none, every answer is false (true count 0 is not among them): consistent. If exactly one, the honest one answered 1: also consistent. So either world is possible: you cannot determine the count.`,
    family: "knights-knaves",
    verifiedBy: ["exhaustive-search"],
  },

  // ------------------------------------------------------------ grid and lattice
  {
    id: "bt-033",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["combinations", "search-strategy", "complement"],
    minutes: 4,
    title: "Courier through a checkpoint, around a closure",
    prompt: String.raw`A courier walks on a city grid from the corner $(0, 0)$ to the corner $(7, 6)$, moving only one block east or one block north at a time. The route must pass through the checkpoint at $(3, 2)$ and must *not* pass through the closed intersection at $(5, 4)$. How many routes are possible?`,
    answer: { type: "numeric", value: 340, exact: String.raw`\binom{5}{2}\left[\binom{8}{4} - \binom{4}{2}\binom{4}{2}\right] = 10 \cdot 34 = 340` },
    hints: [
      "Split the route at the checkpoint: count paths to (3, 2), then paths from (3, 2) to (7, 6), and multiply.",
      String.raw`From $(3, 2)$ to $(7, 6)$ there are $\binom{8}{4} = 70$ paths. Subtract those that touch $(5, 4)$.`,
      String.raw`Paths through $(5,4)$ from $(3,2)$: $\binom{4}{2}$ to reach it times $\binom{4}{2}$ onward.`,
    ],
    solution: String.raw`A monotone route from $(0,0)$ to $(7,6)$ is a word of 7 E's and 6 N's, and the number of such words is $\binom{13}{6} = 1716$. The constraints cut this down in two independent stages.

Passing through $(3, 2)$ splits the route into a first leg from $(0,0)$ to $(3,2)$, with $\binom{5}{2} = 10$ orderings of 3 E's and 2 N's, and a second leg from $(3,2)$ to $(7,6)$, which has 4 E's and 4 N's and $\binom{8}{4} = 70$ orderings. Any first leg combines with any second leg, so without the closure there would be $10 \times 70 = 700$ routes.

The closed intersection $(5, 4)$ lies on the second leg's rectangle (it is north-east of $(3,2)$ and south-west of $(7,6)$), so only the second leg needs fixing; the first leg can never reach it. The second-leg paths through $(5,4)$ go from $(3,2)$ to $(5,4)$ in $\binom{4}{2} = 6$ ways and on to $(7,6)$ in $\binom{4}{2} = 6$ ways: 36 bad paths. The good second legs number $70 - 36 = 34$.

Routes: $10 \times 34 = 340$. The verifier enumerates all 1716 monotone words and checks the two conditions directly, and also fills a dynamic-programming table with the closed cell set to zero. Answer: $340$.`,
    steps: [
      "Split at the checkpoint: multiply the two leg counts.",
      "First leg: C(5, 2) = 10. Second leg unrestricted: C(8, 4) = 70.",
      "Subtract second-leg paths through (5, 4): 6 * 6 = 36.",
      "Total 10 * 34 = 340.",
    ],
    keyIdea: "Forced points multiply leg counts; forbidden points subtract the product of the two half-counts.",
    commonMistake: "Subtracting paths through (5, 4) from the full 1716 count before imposing the checkpoint, or forgetting the closure cannot affect the first leg.",
    fastPath: "10 times (70 minus 36). 340.",
    variation: "Same grid, same checkpoint, but the closed intersection moves to (2, 4). How many routes?",
    variationAnswer: String.raw`Before the checkpoint a route has $y \le 2$, and after it $x \ge 3$. The point $(2, 4)$ has $y = 4$ and $x = 2$, so no route through $(3, 2)$ can visit it and the closure is irrelevant: $10 \cdot 70 = 700$.`,
    family: "lattice-paths",
    verifiedBy: ["enumeration", "formula", "dp"],
  },
  {
    id: "bt-034",
    module: 9,
    kind: "brainteaser",
    difficulty: 4,
    tags: ["combinations", "symmetry", "search-strategy"],
    minutes: 6,
    title: "Squares hiding in a four-by-four array of pins",
    prompt: String.raw`Sixteen pins are set in a $4 \times 4$ square array with unit spacing. How many squares, of *any* size and *any* orientation (tilted squares count), have all four corners on pins?`,
    answer: { type: "numeric", value: 20, exact: "14 + 6 = 20" },
    hints: [
      "First count the axis-aligned squares of side 1, 2 and 3. Then remember that a square can be tilted.",
      "A tilted square is determined by its side vector (a, b) with a, b >= 1; its bounding box is a square of side a + b.",
      "Every square, tilted or not, with bounding box of side s fits in (4 - s)^2 positions. Sum over all side vectors (a, b) with a >= 1, b >= 0, a + b <= 3.",
    ],
    solution: String.raw`Describe a square by the vector from one corner to the next corner going counter-clockwise, $(a, b)$ with $a \ge 1$ and $b \ge 0$ (this convention picks each square exactly once). The square's axis-aligned bounding box then has side $a + b$, and a bounding box of side $s$ can be placed in $(4 - s)^2$ positions within a $4 \times 4$ array of pins (its lower-left pin ranges over a $(4 - s) \times (4 - s)$ block).

Axis-aligned squares have $b = 0$: sides 1, 2, 3 give $3^2 + 2^2 + 1^2 = 9 + 4 + 1 = 14$.

Tilted squares have $b \ge 1$ and need $a + b \le 3$: the vector $(1, 1)$ has bounding box 2 and fits in $2^2 = 4$ positions; $(1, 2)$ and $(2, 1)$ have bounding box 3 and fit in $1$ position each. That gives $4 + 1 + 1 = 6$ tilted squares.

Total $14 + 6 = 20$. The verifier checks every one of the $\binom{16}{4} = 1820$ four-pin sets for the square condition (four equal shortest distances and two equal diagonals of twice the squared side) and finds exactly 20. Answer: $20$.`,
    steps: [
      "Parametrise squares by a side vector (a, b), a >= 1, b >= 0.",
      "Bounding box side a + b fits in (4 - a - b)^2 positions.",
      "Axis-aligned: 9 + 4 + 1 = 14. Tilted: 4 + 1 + 1 = 6.",
      "Total 20.",
    ],
    keyIdea: "Every square, tilted or not, sits in an axis-aligned bounding box; count by side vector.",
    commonMistake: "Counting only the 14 axis-aligned squares, or counting each tilted square four times, once per side vector (a, b), (-b, a), (-a, -b), (b, -a), instead of fixing the convention a >= 1, b >= 0 that picks one vector per square. Note that (1, 2) and (2, 1) are genuinely different squares, mirror images of each other, and both count.",
    fastPath: "Sum over (a, b) with a >= 1, b >= 0, a + b <= 3 of (4 - a - b)^2: 9 + 4 + 1 + 4 + 1 + 1 = 20.",
    variation: "How many squares of any orientation have all four corners in a 5 by 5 array of pins?",
    variationAnswer: String.raw`$\sum_{s=1}^{4} s \cdot (5 - s)^2 = 1 \cdot 16 + 2 \cdot 9 + 3 \cdot 4 + 4 \cdot 1 = 50$ (a bounding box of side $s$ hosts $s$ squares, one per side vector).`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "bt-035",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["combinations", "complement", "search-strategy"],
    minutes: 4,
    title: "Rectangles that are not squares",
    prompt: String.raw`A spreadsheet region is 6 cells wide and 4 cells tall. A *block* is any rectangle made of whole cells with sides along the grid lines. How many blocks are there that are *not* squares?`,
    answer: { type: "numeric", value: 160, exact: String.raw`\binom{7}{2}\binom{5}{2} - (24 + 15 + 8 + 3) = 210 - 50 = 160` },
    hints: [
      "A rectangle is fixed by choosing two of the 7 vertical grid lines and two of the 5 horizontal grid lines.",
      String.raw`All rectangles: $\binom{7}{2} \cdot \binom{5}{2} = 210$. Now subtract the squares.`,
      "Squares of side k fit in (7 - k)(5 - k) positions for k = 1, 2, 3, 4.",
    ],
    solution: String.raw`A rectangle of whole cells is determined by its left and right edges, which are two of the $7$ vertical grid lines, and its bottom and top edges, two of the $5$ horizontal grid lines. The number of rectangles is therefore $\binom{7}{2} \binom{5}{2} = 21 \times 10 = 210$.

Among these, the squares of side $k$ have their lower-left corner anywhere in a $(7 - k) \times (5 - k)$ block of positions, for $k = 1$ to $4$ (a side of 5 does not fit in a height of 4). That gives $6 \cdot 4 + 5 \cdot 3 + 4 \cdot 2 + 3 \cdot 1 = 24 + 15 + 8 + 3 = 50$ squares.

Non-square blocks: $210 - 50 = 160$. The verifier loops over all pairs of vertical and horizontal lines and counts those with unequal width and height. Answer: $160$.`,
    steps: [
      "Rectangles = choose 2 of 7 vertical lines times 2 of 5 horizontal lines: 210.",
      "Squares of side k: (7 - k)(5 - k), summed: 50.",
      "Subtract: 160.",
    ],
    keyIdea: "Count rectangles by choosing grid lines, then remove the squares as a separate easy count.",
    commonMistake: String.raw`Using $\binom{6}{2}\binom{4}{2} = 90$ (choosing cells instead of lines), or forgetting that squares of side 4 exist.`,
    fastPath: "21 times 10 is 210; squares 24 + 15 + 8 + 3 = 50; 160.",
    variation: "How many blocks in the 6 by 4 region have an area of exactly 6 cells?",
    variationAnswer: String.raw`By width $\times$ height: $6 \times 1$ fits in $1 \cdot 4 = 4$ positions, $3 \times 2$ in $4 \cdot 3 = 12$, $2 \times 3$ in $5 \cdot 2 = 10$, and $1 \times 6$ does not fit in a height of 4. Total $26$.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "bt-036",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["combinations", "symmetry", "recursion"],
    minutes: 5,
    title: "A queue that never runs dry",
    prompt: String.raw`An order queue starts empty. Over a session exactly 5 orders arrive and exactly 5 orders are filled, one event at a time, in some order. An order can only be filled if the queue is non-empty at that moment. How many different sequences of the 10 events (arrival or fill, in time order) are possible?`,
    answer: { type: "numeric", value: 42, exact: String.raw`C_5 = \tfrac{1}{6}\binom{10}{5} = 42` },
    hints: [
      "Write A for arrival and F for fill. You need words of 5 A's and 5 F's in which no prefix has more F's than A's.",
      "Draw it as a lattice path: A is a step right, F a step up, and the path must never cross above the diagonal.",
      String.raw`These are the Catalan paths: $C_5 = \frac{1}{5+1}\binom{10}{5}$. Or build the count by a small table.`,
    ],
    solution: String.raw`Encode the session as a word of five A's (arrivals) and five F's (fills). The queue is non-empty when a fill happens exactly when, at every prefix of the word, the number of F's is at most the number of A's. These are the ballot sequences, equivalently monotone lattice paths from $(0,0)$ to $(5,5)$ that never rise above the diagonal.

The count is the Catalan number $C_5$. The reflection argument: of the $\binom{10}{5} = 252$ unrestricted words, the bad ones are those with some prefix having one more F than A. Flip every letter after the first such moment; this bijects bad words with words of 4 A's and 6 F's, of which there are $\binom{10}{4} = 210$. So the good words number $252 - 210 = 42$.

A table confirms it: let $f(a, d)$ be the number of valid prefixes with $a$ arrivals and $d$ fills, $d \le a$. Then $f(a, d) = f(a-1, d) + f(a, d-1)$, where the first term is present only when $d \le a - 1$ (the prefix before the last arrival must itself be valid), and $f(5, 5) = 42$. The general formula $C_n = \frac{1}{n+1}\binom{2n}{n}$ gives $\frac{252}{6} = 42$. Answer: $42$.`,
    steps: [
      "Encode as a word of 5 A's and 5 F's with every prefix having #F <= #A.",
      "Recognise Catalan / ballot sequences.",
      "Reflection: 252 - 210 = 42, or C_5 = 252 / 6.",
    ],
    keyIdea: "A 'never go negative' constraint on a balanced sequence is the Catalan condition; reflect bad paths to count them.",
    commonMistake: String.raw`Answering $\binom{10}{5} = 252$ with no constraint, or $2^{10}$, or applying the Catalan formula with $n = 10$.`,
    fastPath: "Catalan 5 = 42. Know the first few: 1, 2, 5, 14, 42, 132.",
    variation: "Same session, but the queue starts with one order already waiting. How many sequences now?",
    variationAnswer: String.raw`Now the queue length starts at 1 and must never reach $-1$. Reflecting a bad path at its first visit to $-1$ turns it into a path from $-3$ to $1$ in ten steps, i.e. 7 arrivals and 3 fills: $\binom{10}{3} = 120$ bad paths. Valid sequences: $252 - 120 = 132$, which is the next Catalan number $C_6$.`,
    family: "lattice-paths",
    verifiedBy: ["dp", "formula"],
  },
  {
    id: "bt-037",
    module: 9,
    kind: "brainteaser",
    difficulty: 3,
    tags: ["induction", "recursion", "search-strategy"],
    minutes: 4,
    title: "Tiling a two-row rack with pairs",
    prompt: String.raw`A server rack has 2 rows of 10 unit slots. You must fill every slot using identical $1 \times 2$ modules, each placed either horizontally (covering two adjacent slots in the same row) or vertically (covering one slot in each row at the same column). How many different ways are there to fill the rack?`,
    answer: { type: "numeric", value: 89, exact: String.raw`F_{11} = 89` },
    hints: [
      "Look at the leftmost column. It is covered either by one vertical module or by two horizontal modules stacked.",
      "Let t(n) be the count for 2 by n. A vertical module leaves 2 by (n - 1); two horizontal modules leave 2 by (n - 2).",
      "t(n) = t(n - 1) + t(n - 2) with t(1) = 1, t(2) = 2: Fibonacci.",
    ],
    solution: String.raw`Let $t(n)$ be the number of tilings of a $2 \times n$ rack. Consider how the leftmost column is covered. Either a single vertical module covers both of its slots, leaving a $2 \times (n-1)$ rack to tile, or the top slot is covered by a horizontal module, which forces the bottom slot to be covered by another horizontal module directly beneath it (nothing else can fill it), leaving a $2 \times (n-2)$ rack. These two cases are exclusive and exhaustive, so
$$t(n) = t(n-1) + t(n-2), \qquad t(1) = 1, \quad t(2) = 2.$$

This is the Fibonacci recurrence with $t(n) = F_{n+1}$ in the convention $F_1 = F_2 = 1$. Computing: $1, 2, 3, 5, 8, 13, 21, 34, 55, 89$, so $t(10) = 89$.

The verifier does not rely on the recurrence: it places modules one at a time into the first empty slot by backtracking and counts complete tilings, getting 89. Answer: $89$.`,
    steps: [
      "Case on the leftmost column: vertical, or two stacked horizontals.",
      "Recurrence t(n) = t(n-1) + t(n-2), t(1) = 1, t(2) = 2.",
      "Iterate to n = 10: 89.",
    ],
    keyIdea: "Case on how the first column is covered; the remaining shape is the same problem one or two columns shorter.",
    commonMistake: "Starting the Fibonacci sequence at the wrong offset and answering 55 or 144, or thinking a horizontal module in the top row leaves a free choice for the bottom slot.",
    fastPath: "Fibonacci shifted: 2 x 10 gives F_11 = 89.",
    variation: "Same 2 by 10 rack, but you may also use 2 by 2 square modules. How many fillings?",
    variationAnswer: String.raw`$u(n) = u(n-1) + 2u(n-2)$ with $u(1) = 1, u(2) = 3$: $1, 3, 5, 11, 21, 43, 85, 171, 341, 683$, so 683 (in closed form $(2^{n+1} + (-1)^n)/3$).`,
    family: "induction",
    verifiedBy: ["dp", "exhaustive-search"],
  },
  {
    id: "bt-038",
    module: 9,
    kind: "brainteaser",
    difficulty: 5,
    tags: ["combinations", "recursion", "search-strategy"],
    minutes: 10,
    title: "Drone legs across the block grid",
    prompt: String.raw`A delivery drone flies from the south-west corner to the north-east corner of a $7 \times 7$ block grid (corners at $(0,0)$ and $(7,7)$). Each *leg* of the flight is a straight run of one or more whole blocks either due east or due north; the drone may stop at any intersection and the next leg may continue in the same direction or turn. Two flights are different if their sequences of legs differ (so east 2 then east 5 differs from east 7). How many different flights are there?`,
    answer: { type: "numeric", value: 470010, exact: String.raw`\sum_{h,v \ge 1} \binom{6}{h-1}\binom{6}{v-1}\binom{h+v}{h} = 470010` },
    hints: [
      "A flight is a sequence of legs. Decide how many east legs h and how many north legs v it has.",
      String.raw`The east legs split 7 into $h$ positive parts: $\binom{6}{h-1}$ ways. Likewise $\binom{6}{v-1}$ for north. Then interleave the $h + v$ legs.`,
      String.raw`Total $\sum_{h=1}^{7}\sum_{v=1}^{7} \binom{6}{h-1}\binom{6}{v-1}\binom{h+v}{h}$. Alternatively fill a table $f(x,y) = \sum_{i<x} f(i,y) + \sum_{j<y} f(x,j)$.`,
    ],
    solution: String.raw`Think of a flight as an ordered list of legs, each labelled with a direction and a positive length. The east legs' lengths sum to 7 and the north legs' lengths sum to 7.

Fix the number of east legs $h$ and north legs $v$. The east lengths form a composition of 7 into $h$ positive parts, of which there are $\binom{6}{h-1}$ (place $h - 1$ cutters among the 6 gaps between 7 unit blocks). Similarly there are $\binom{6}{v-1}$ compositions for the north legs. Finally the $h + v$ legs are arranged in time order; any interleaving is allowed, including two consecutive legs in the same direction, so there are $\binom{h+v}{h}$ orderings. Multiplying and summing over $h, v$ from 1 to 7:
$$N = \sum_{h=1}^{7}\sum_{v=1}^{7}\binom{6}{h-1}\binom{6}{v-1}\binom{h+v}{h}.$$
Row by row (over $h$) the inner sums are $320, 6048, 37920, 110000, 162540, 118950, 34232$, totalling $470010$.

A cleaner computational route is a two-dimensional recursion. Let $f(x, y)$ be the number of flights from $(0,0)$ to $(x,y)$. The last leg ends at $(x,y)$ and started at some $(i, y)$ with $i < x$ (an east leg) or some $(x, j)$ with $j < y$ (a north leg), so
$$f(x,y) = \sum_{i<x} f(i,y) + \sum_{j<y} f(x,j), \qquad f(0,0) = 1.$$
Filling the $8 \times 8$ table gives $f(7,7) = 470010$, in agreement with the formula. (The diagonal values $f(n,n)$ are $1, 2, 14, 106, 838, 6802, 56190, 470010$.) Answer: $470010$.`,
    steps: [
      "A flight is a sequence of (direction, positive length) legs.",
      "Fix h east legs and v north legs: compositions C(6, h-1) and C(6, v-1).",
      "Interleave the legs in C(h + v, h) orders.",
      "Sum over h, v, or fill the table f(x, y) = sum of f over the row and column behind it.",
    ],
    keyIdea: "Decompose by the number of legs in each direction, or recurse on where the last leg started.",
    commonMistake: String.raw`Answering $\binom{14}{7} = 3432$, which counts unit-step paths and treats 'east 2 then east 5' as the same as 'east 7'; or forcing the legs to alternate direction.`,
    fastPath: "Set up f(x, y) = row sum + column sum and fill an 8 by 8 table; the diagonal ends at 470010. No shortcut formula is expected in an interview; the recursion is the deliverable.",
    variation: "Same grid but every leg must *turn*: consecutive legs cannot point the same way. How many flights?",
    variationAnswer: String.raw`Legs alternate, so $|h - v| \le 1$ and the interleaving is forced (2 ways if $h = v$, 1 way otherwise): $2\sum_h \binom{6}{h-1}^2 + 2\sum_h \binom{6}{h-1}\binom{6}{h} = 2 \cdot 924 + 2 \cdot 792 = 3432 = \binom{14}{7}$, the ordinary lattice-path count.`,
    family: "lattice-paths",
    verifiedBy: ["dp", "formula"],
  },

  // ------------------------------------------------------------ invariants and induction
  {
    id: "bt-039",
    module: 9,
    kind: "brainteaser",
    difficulty: 4,
    tags: ["invariants", "search-strategy", "logic"],
    minutes: 5,
    title: "Erase two, write the difference",
    prompt: String.raw`The numbers 1, 2, 3, 4, 5, 6, 7, 8 are written on a whiteboard. A move consists of erasing any two numbers $a$ and $b$ and writing $|a - b|$ in their place. After seven moves one number remains. Which of the following could be that final number?`,
    answer: {
      type: "choice",
      options: ["1", "3", "6", "9"],
      correct: 2,
    },
    hints: [
      "Look for a quantity that every move leaves unchanged. What happens to the sum of the numbers on the board when a and b are replaced by |a - b|?",
      String.raw`$a + b$ and $|a - b|$ have the same parity, so the parity of the total never changes. The starting total is 36.`,
      "The final number must be even. It also cannot exceed the largest number ever on the board. Which option survives?",
    ],
    solution: String.raw`Look for an invariant. Replacing $a$ and $b$ by $|a - b|$ changes the board's sum by $|a - b| - (a + b)$, which is $-2\min(a, b)$: an even number. So the parity of the sum never changes. The initial sum is $1 + 2 + \dots + 8 = 36$, even, so the final number is even. That rules out 1, 3 and 9.

A second observation bounds the size: $|a - b| \le \max(a, b)$, so the largest number on the board never increases. The final number is therefore at most 8, which rules out 9 a second time. Among the options only 6 survives both tests.

Surviving the tests is necessary but not sufficient, so check that 6 is actually reachable. Pair $8$ and $2$ to get $6$; then reduce $\{1, 3, 4, 5, 6, 7\}$ to zero: $7 - 6 = 1$, $5 - 4 = 1$, $3 - 1 = 2$, then $2 - 1 = 1$ and $1 - 1 = 0$, leaving $\{0, 6\}$ and finally $|6 - 0| = 6$. The verifier explores every reachable board by exhaustive search and finds that the possible final numbers are exactly $0, 2, 4, 6, 8$.`,
    steps: [
      "Invariant: the sum's parity is preserved because a + b and |a - b| have the same parity.",
      "Initial sum 36 is even, so the final number is even.",
      "The maximum never increases, so the final number is at most 8.",
      "Exhibit a sequence reaching 6.",
    ],
    keyIdea: "Find what the move cannot change (parity of the sum) and what it cannot increase (the maximum).",
    commonMistake: "Assuming any number from 0 to 8 is reachable, or thinking that the final number must be the gcd of the starting numbers. The gcd only divides every reachable final number (here gcd 1 says nothing); replacing a pair by |a - b| can raise the board's gcd, for example {3, 5} becomes {2}.",
    fastPath: "Sum 36 is even; final is even and at most 8. Only 6 fits. Option 3.",
    variation: "Start with 1, 2, ..., 9 instead. What are the possible final numbers?",
    variationAnswer: String.raw`The sum is 45, odd, so the final number is odd and at most 9: the candidates are 1, 3, 5, 7, 9, and all five are reachable (for 9, keep 9 aside and reduce 1..8 to 0).`,
    family: "invariant",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "bt-040",
    module: 9,
    kind: "brainteaser",
    difficulty: 2,
    tags: ["invariants", "induction", "logic"],
    minutes: 3,
    title: "Tearing a sheet of stamps",
    prompt: String.raw`A sheet of 24 postage stamps is perforated into a $4 \times 6$ grid. A *tear* takes a single piece and separates it along one straight perforation line into two pieces; you may not stack pieces and tear several at once. You want to end with 24 separate stamps. Which statement is correct about the number of tears required?`,
    answer: {
      type: "choice",
      options: [
        "8 tears: 3 along one direction and 5 along the other.",
        "23 tears, no matter in which order you tear.",
        "24 tears, one per stamp.",
        "It depends on the order: 23 at best, more if you tear carelessly.",
      ],
      correct: 1,
    },
    hints: [
      "Count pieces instead of tears. How does the number of pieces change with each tear?",
      "Every tear turns one piece into two, so the piece count rises by exactly 1 each time.",
      "You start with 1 piece and must end with 24. How many increments is that?",
    ],
    solution: String.raw`Instead of tracking the tears, track the number of pieces on the table. A tear acts on one piece and produces two, so each tear increases the number of pieces by exactly one, no more and no less, regardless of where the tear is made or how big the piece is.

You start with 1 piece and finish with 24 single stamps. Going from 1 to 24 takes exactly 23 increments, so every sequence of tears that finishes the job uses exactly 23 tears. There is no clever order that saves tears and no careless order that wastes them.

Option 1 describes cutting straight across the whole sheet with a guillotine, which is not allowed here since each tear acts on a single piece (the 'count the lines' intuition is the classic trap). Option 3 overcounts: the last tear produces two stamps at once. Option 4 is wrong because the count is forced. The verifier explores every reachable configuration of pieces by exhaustive search and finds the minimum and maximum number of tears are both 23. Answer: option 2.`,
    steps: [
      "Track pieces, not tears.",
      "Each tear adds exactly one piece.",
      "From 1 piece to 24 pieces: 23 tears, always.",
    ],
    keyIdea: "A monovariant that moves by exactly one per step pins down the step count regardless of strategy.",
    commonMistake: "Counting the perforation lines (3 + 5 = 8) as if a tear could run across several pieces at once.",
    fastPath: "Pieces go 1 to 24, one per tear: 23.",
    variation: "Same sheet, but now you are allowed to stack any pieces and tear the whole stack along a common line in one go. Minimum number of tears?",
    variationAnswer: String.raw`A stacked tear at most doubles the number of pieces, so at least $\lceil \log_2 24 \rceil = 5$ tears are needed. Five suffice: tear the 4-side as $4 \to 2 + 2$, stack and tear $2 \to 1 + 1$ (two tears, giving four $1 \times 6$ strips), then stack the strips and tear $6 \to 3 + 3$, $3 \to 1 + 2$, and finally the $2$'s into $1 + 1$ (three tears).`,
    family: "invariant",
    verifiedBy: ["exhaustive-search", "formula"],
  },
];
