import type { Problem } from "../types";

/**
 * Module 7: Betting, EV decisions, and games.
 * 26 practice problems (d1: 3, d2: 6, d3: 9, d4: 5, d5: 3) and four lesson checks.
 * Every answer is confirmed by independent routes in content/verify/m7.ts: game-tree
 * dynamic programming, exhaustive search over strategies, enumeration of the payoff
 * distribution, closed forms, and seeded simulation of the optimal strategy.
 */
export const problems: Problem[] = [
  // ---------------------------------------------------------------- difficulty 1
  {
    id: "m7-p01",
    module: 7,
    kind: "practice",
    difficulty: 1,
    tags: ["games", "expectation", "dice"],
    minutes: 1,
    title: "Price of a single die roll",
    prompt: String.raw`A booth at a trading-floor charity night offers this game: roll one fair six-sided die and get paid the face in dollars (a 4 pays \$4). What entry fee, in dollars, makes the game exactly fair, so that a player's expected profit is zero?`,
    answer: { type: "numeric", value: 7 / 2, exact: String.raw`\tfrac{1+2+3+4+5+6}{6} = \tfrac{7}{2} = 3.5`, unit: "dollars" },
    hints: [
      "A fair price is the expected payout. Average the six equally likely payouts.",
      "The faces 1 to 6 are equally likely, each with probability 1/6.",
      "Sum 1 through 6 (that is 21) and divide by 6.",
    ],
    solution: String.raw`The fair price of a game is its expected payout: at that fee the player's expected profit is exactly zero, so neither side has an edge.

Each face appears with probability $\frac{1}{6}$ and pays its own value, so the expected payout is $\frac{1}{6}(1 + 2 + 3 + 4 + 5 + 6) = \frac{21}{6} = \frac{7}{2}$.

There is a quicker symmetry: the faces are evenly spread from 1 to 6, so the mean is the midpoint $\frac{1 + 6}{2} = 3.5$. Any fee below \$3.50 is a good bet for the player, any fee above it is a good bet for the booth. Fair price: $\frac{7}{2} = 3.5$ dollars.`,
    steps: [
      "Translate 'fair price' into 'expected payout'.",
      "List the six equally likely payouts 1 to 6.",
      "Average them: 21/6 = 3.5.",
    ],
    keyIdea: "The fair price of a game is its expected payout; a fee above it favours the house, below it favours the player.",
    commonMistake: "Quoting 3 'because it is in the middle', or calling 3.5 'the most likely roll': every face is equally likely, and 3.5 is the mean, not a mode.",
    fastPath: "Mean of 1 to 6 is the midpoint 3.5.",
    variation: "The booth pays the face squared instead (a 4 pays 16 dollars). Fair price?",
    variationAnswer: String.raw`$\frac{1 + 4 + 9 + 16 + 25 + 36}{6} = \frac{91}{6} \approx 15.17$ dollars.`,
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m7-p02",
    module: 7,
    kind: "practice",
    difficulty: 1,
    tags: ["games", "expectation", "dice"],
    minutes: 2,
    title: "Seven or eleven pays eight",
    prompt: String.raw`You roll two fair dice once. If the sum is 7 or 11 you are paid \$8; for any other sum you pay \$2. What is your expected profit per play, in dollars?`,
    answer: { type: "numeric", value: 2 / 9, exact: String.raw`\tfrac{8}{36}\cdot 8 - \tfrac{28}{36}\cdot 2 = \tfrac{64 - 56}{36} = \tfrac{2}{9} \approx 0.222`, unit: "dollars" },
    hints: [
      "Count the ordered dice pairs that give 7 and the pairs that give 11, out of 36.",
      "Six pairs sum to 7 and two sum to 11, so you win with probability 8/36.",
      "Expected profit = P(win) times 8 minus P(lose) times 2.",
    ],
    solution: String.raw`With two fair dice there are $36$ equally likely ordered outcomes. The sum $7$ arises from $(1,6), (2,5), (3,4), (4,3), (5,2), (6,1)$, six outcomes, and the sum $11$ from $(5,6), (6,5)$, two outcomes. So you win on $8$ of the $36$ outcomes, probability $\frac{8}{36} = \frac{2}{9}$, and lose on the other $28$, probability $\frac{7}{9}$.

Expected profit is the probability-weighted sum of the two results: $\frac{2}{9}(8) + \frac{7}{9}(-2) = \frac{16 - 14}{9} = \frac{2}{9}$.

In dollars that is about $0.22$ per play: a small edge in your favour. Notice the asymmetry: you lose far more often than you win, yet the bet is profitable because the win is four times the size of the loss. Answer: $\frac{2}{9} \approx 0.222$ dollars.`,
    steps: [
      "Count winning outcomes: 6 ways for 7, 2 ways for 11, out of 36.",
      "Win probability 2/9, loss probability 7/9.",
      "Weight the payouts: (2/9)(8) - (7/9)(2) = 2/9.",
    ],
    keyIdea: "Expected profit weighs each outcome by its probability; a rare large win can beat a frequent small loss.",
    commonMistake: "Counting 7 and 11 as 'two sums out of eleven possible sums' and using 2/11; the sums are not equally likely.",
    fastPath: "Eight winning pairs of 36 is 2/9. Then 2/9 of 8 is 16/9, 7/9 of 2 is 14/9, difference 2/9.",
    variation: String.raw`The payout for a 7 or 11 is cut to \$6. Expected profit?`,
    variationAnswer: String.raw`$\frac{2}{9}(6) - \frac{7}{9}(2) = \frac{12 - 14}{9} = -\frac{2}{9}$: now the bet loses about 22 cents per play.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m7-p03",
    module: 7,
    kind: "practice",
    difficulty: 1,
    tags: ["auctions", "games"],
    minutes: 2,
    title: "What to bid when the second price is paid",
    prompt: String.raw`A single painting is sold by sealed bid to you and one rival. The higher bid wins, and the winner pays the *loser's* bid (a second-price auction); if the bids tie, a coin flip decides the winner, who pays the tied amount. The painting is worth exactly \$70 to you, and you want to maximise your expected profit (value minus price when you win, zero otherwise). You know nothing about the rival. What should you bid?`,
    answer: {
      type: "choice",
      options: [
        String.raw`Exactly \$70, whatever you believe about the rival: it is never worse than any other bid and sometimes strictly better.`,
        String.raw`Below \$70, shading more the weaker you think the rival is, because shading lowers the price you pay.`,
        String.raw`Above \$70, because you pay the rival's bid rather than your own, so a higher bid only raises your chance of winning.`,
        String.raw`It depends on the rival's bid distribution; without it no bid can be recommended.`,
      ],
      correct: 0,
    },
    hints: [
      "Your bid never sets the price you pay; it only decides whether you win. Ask when you want to win.",
      "You want to win exactly when the price (the rival's bid) is below 70. Which bid achieves that for every possible rival bid?",
      "Compare bidding 70 with bidding b < 70 and with b > 70, for each rival bid r, case by case.",
    ],
    solution: String.raw`Let the rival's bid be $r$. In a second-price auction your bid $b$ decides only *whether* you win (you win if $b > r$); the price you pay is $r$, which your bid does not touch. So you want to win exactly in the cases where winning is profitable, that is when $r < 70$, and to lose when $r > 70$.

Bidding $b = 70$ does exactly this. If $r < 70$ you win and earn $70 - r > 0$. If $r > 70$ you lose and earn $0$, which beats the negative profit of paying more than the painting is worth. If $r = 70$ the coin decides, and either way your profit is $0$.

Now compare with any other bid. Shading to $b < 70$ changes the outcome only when $b \le r < 70$: there you now lose and earn $0$ instead of the positive $70 - r$. Over-bidding to $b > 70$ changes the outcome only when $70 < r \le b$: there you now win and pay more than $70$, a loss. In every other case the two bids earn the same amount. So $70$ is weakly dominant: never worse, sometimes better, regardless of what the rival does. No belief about the rival is needed.

The exhaustive check in the verifier runs over every rival bid and every own bid from 0 to 140 and confirms that 70 is the unique weakly dominant bid. The second option (shading) is the right instinct for a *first-price* auction, where your bid is the price; here it only throws away profitable wins. Correct choice: bid exactly \$70.`,
    steps: [
      "Note that your bid sets whether you win, not what you pay.",
      "You want to win exactly when the rival's bid is below your value.",
      "Check that bidding your value achieves this for every rival bid.",
      "Show shading and over-bidding are each strictly worse in some cases and never better.",
    ],
    keyIdea: "When the price is set by someone else's bid, bid your true value: it wins exactly the profitable cases.",
    commonMistake: "Importing first-price instincts and shading below value, which gives up wins at prices below 70.",
    fastPath: "Second price means bid your value; no calculation needed.",
    variation: "Same painting, but now the winner pays their *own* bid (first price). Is bidding 70 still optimal?",
    variationAnswer: "No. Bidding 70 earns zero even when you win. You should shade below 70; how much depends on your beliefs about the rival.",
    family: "bidding",
    verifiedBy: ["exhaustive-search", "enumeration"],
  },

  // ---------------------------------------------------------------- difficulty 2
  {
    id: "m7-p04",
    module: 7,
    kind: "practice",
    difficulty: 2,
    tags: ["games", "expectation", "cards"],
    minutes: 2,
    title: "Price of a single card draw",
    prompt: String.raw`A dealer shuffles a standard 52-card deck and lets you draw one card. You are paid the card's rank in dollars: an ace pays \$1, the cards 2 through 10 pay their number, and each jack, queen or king pays \$10. What entry fee, in dollars, makes the game fair?`,
    answer: { type: "numeric", value: 85 / 13, exact: String.raw`\tfrac{(1 + 2 + \cdots + 10) + 3 \cdot 10}{13} = \tfrac{85}{13} \approx 6.54`, unit: "dollars" },
    hints: [
      "Suits do not affect the payout, so work with the 13 ranks, each equally likely.",
      "Ten of the ranks pay 1 through 10; the remaining three ranks all pay 10.",
      "Average the thirteen payouts: (55 + 30)/13.",
    ],
    solution: String.raw`The fair fee is the expected payout. Every one of the 52 cards is equally likely, and the payout depends only on rank, so each of the 13 ranks has probability $\frac{4}{52} = \frac{1}{13}$.

The ranks ace through 10 pay $1, 2, \dots, 10$ dollars, which sum to $\frac{10 \cdot 11}{2} = 55$. The jack, queen and king pay $10$ each, adding $30$. Total over the 13 ranks: $85$.

Expected payout $= \frac{85}{13} \approx 6.54$ dollars. Compare with a deck where face cards paid 11, 12 and 13: the mean would be $\frac{91}{13} = 7$. Capping the face cards at 10 lowers the fair price by about 46 cents. Answer: $\frac{85}{13} \approx 6.54$ dollars.`,
    steps: [
      "Reduce to 13 equally likely ranks.",
      "Sum the payouts: 55 for ace to ten, plus 30 for the three face cards.",
      "Divide by 13: 85/13.",
    ],
    keyIdea: "When only rank matters, collapse the 52 cards to 13 equally likely ranks and average the payouts.",
    commonMistake: "Averaging 1 to 13 (giving 7) and forgetting that the face cards pay 10, or dividing 85 by 52.",
    fastPath: "55 plus 30 is 85; 85/13 is 6 remainder 7, so about 6.54.",
    variation: "An ace now pays 11 dollars instead of 1. Fair price?",
    variationAnswer: String.raw`Total rises by 10 to 95: $\frac{95}{13} \approx 7.31$ dollars.`,
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m7-p05",
    module: 7,
    kind: "practice",
    difficulty: 2,
    tags: ["games", "expectation"],
    minutes: 2,
    title: "Break-even probability for a lopsided bet",
    prompt: String.raw`A colleague offers a bet on tomorrow's jobs number. You stake \$5. If you win you get your \$5 back plus \$12 of her money; if you lose she keeps your \$5. What probability of winning makes the bet exactly break even for you (expected profit zero)?`,
    answer: { type: "numeric", value: 5 / 17, exact: String.raw`\tfrac{5}{5 + 12} = \tfrac{5}{17} \approx 0.294` },
    hints: [
      "Write expected profit as (win probability)(gain) minus (loss probability)(loss) and set it to zero.",
      "Gain on a win is 12, loss on a loss is 5. The equation is 12p = 5(1 - p).",
      "Solve: 17p = 5.",
    ],
    solution: String.raw`Let $p$ be the probability you win. A win adds $12$ dollars to your wealth (you get the stake back, so the stake is not a cost in that branch), and a loss removes the $5$ stake. Expected profit is $12p - 5(1 - p)$.

Set it to zero: $12p = 5(1 - p)$, so $17p = 5$ and $p = \frac{5}{17}$.

The general pattern is worth memorising: for a bet that risks $S$ to win $W$, the break-even probability is $\frac{S}{S + W}$, the stake as a fraction of the total pot. Here $\frac{5}{17} \approx 0.294$. If you believe the true chance of winning is above $29.4\%$ the bet has positive expectation for you; below it, decline. Answer: $\frac{5}{17} \approx 0.294$.`,
    steps: [
      "Set expected profit to zero: 12p - 5(1 - p) = 0.",
      "Collect terms: 17p = 5.",
      "Recognise the pattern stake/(stake + win) = 5/17.",
    ],
    keyIdea: "Break-even probability equals the stake divided by the total at risk from both sides, S/(S + W).",
    commonMistake: "Using 5/12 (stake over winnings, the odds ratio) instead of 5/17 (stake over total pot).",
    fastPath: "Stake over stake-plus-win: 5 over 17.",
    variation: "She sweetens the deal: a win now pays 15 dollars on your 5 stake. Break-even probability?",
    variationAnswer: String.raw`$\frac{5}{20} = \frac{1}{4}$.`,
    verifiedBy: ["formula", "exhaustive-search"],
  },
  {
    id: "m7-p06",
    module: 7,
    kind: "practice",
    difficulty: 2,
    tags: ["stopping", "dice", "expectation"],
    minutes: 2,
    title: "One optional reroll",
    prompt: String.raw`You roll a fair six-sided die. You may either keep the face shown and be paid that many dollars, or reroll once and be paid the face of the second roll, whatever it is. Playing optimally, what is the expected payout of this game, in dollars?`,
    answer: { type: "numeric", value: 17 / 4, exact: String.raw`\tfrac{4 + 5 + 6}{6} + \tfrac{3}{6}\cdot\tfrac{7}{2} = \tfrac{17}{4} = 4.25`, unit: "dollars" },
    hints: [
      "Start from the end: a forced single roll is worth 3.5 on average. That is your continuation value.",
      "Keep a first roll only if it beats 3.5, so keep 4, 5 or 6 and reroll 1, 2 or 3.",
      "Average the six first-roll outcomes: three of them pay the face, three pay 3.5.",
    ],
    solution: String.raw`Solve backwards. If you reroll, you are stuck with the second roll, whose expected value is $\frac{7}{2} = 3.5$. That number is the *continuation value*: what the rest of the game is worth if you do not stop now.

After the first roll you compare what you hold with the continuation value. A $4$, $5$ or $6$ beats $3.5$, so keep it. A $1$, $2$ or $3$ is below $3.5$, so reroll. (A face equal to the continuation value would be indifferent; since $3.5$ is not a face, there is none here.)

The value of the game averages over the first roll: $\frac{1}{6}(4 + 5 + 6) + \frac{3}{6}(3.5) = \frac{15}{6} + \frac{10.5}{6} = \frac{25.5}{6} = \frac{17}{4}$.

So the option to reroll adds $0.75$ to the plain-roll value of $3.5$. The verifier confirms this by trying all 64 possible keep-sets and finding that keeping exactly $\{4, 5, 6\}$ is optimal. Answer: $\frac{17}{4} = 4.25$ dollars.`,
    steps: [
      "Compute the value of the last roll: 3.5.",
      "Keep a first roll if it exceeds 3.5: keep 4, 5, 6.",
      "Average: (4 + 5 + 6)/6 plus (3/6)(3.5) = 4.25.",
    ],
    keyIdea: "Stop when what you hold beats the expected value of continuing; the continuation value here is 3.5.",
    commonMistake: "Keeping a 3 'because it is close', or averaging 3.5 with 4.25 in the wrong proportions.",
    fastPath: "Keep 4, 5, 6 (average 5) half the time, take 3.5 the other half: (5 + 3.5)/2 = 4.25.",
    variation: "The reroll costs 50 cents. What is the optimal strategy and value now?",
    variationAnswer: String.raw`Continuation value falls to $3.5 - 0.5 = 3$; keep 3 or better (3 is indifferent). Value $\frac{3 + 3 + 3 + 4 + 5 + 6}{6} = 4$.`,
    family: "dice-reroll",
    verifiedBy: ["dp", "exhaustive-search", "simulation"],
  },
  {
    id: "m7-p07",
    module: 7,
    kind: "practice",
    difficulty: 2,
    tags: ["kelly", "expectation"],
    minutes: 2,
    title: "Kelly fraction with 2.5-to-1 odds",
    prompt: String.raw`A repeated bet wins with probability $0.4$. When it wins you receive $2.5$ dollars for every dollar staked (and keep the stake); when it loses you lose the stake. You bet the same fraction $f$ of your bankroll every time. Which $f$ maximises the long-run growth rate of your bankroll (the expected log of wealth per bet)?`,
    answer: { type: "numeric", value: 0.4 - 0.6 / 2.5, exact: String.raw`f^* = p - \tfrac{q}{b} = 0.4 - \tfrac{0.6}{2.5} = 0.16` },
    hints: [
      "Write the growth rate g(f) = p ln(1 + b f) + q ln(1 - f) and maximise it.",
      "Differentiate: p b/(1 + b f) = q/(1 - f) at the optimum.",
      "Solve for f: f = p - q/b with p = 0.4, q = 0.6, b = 2.5.",
    ],
    solution: String.raw`After one bet of fraction $f$, your bankroll is multiplied by $1 + bf$ on a win (here $b = 2.5$) and by $1 - f$ on a loss. Over many bets the bankroll grows like $e^{g(f) n}$ where $g(f) = p\ln(1 + bf) + q\ln(1 - f)$ is the expected log growth per bet, with $p = 0.4$ and $q = 0.6$.

$g$ is concave in $f$, so the maximum is where the derivative vanishes: $\frac{pb}{1 + bf} = \frac{q}{1 - f}$. Cross-multiplying, $pb(1 - f) = q(1 + bf)$, so $pb - q = f(pb + qb) = fb(p + q) = fb$, giving $f^* = \frac{pb - q}{b} = p - \frac{q}{b}$.

Plug in: $f^* = 0.4 - \frac{0.6}{2.5} = 0.4 - 0.24 = 0.16$. So bet 16% of the bankroll each time. Note the numerator $pb - q = 1 - 0.6 = 0.4$ is the edge per dollar staked, and the Kelly fraction is edge divided by odds: $\frac{0.4}{2.5} = 0.16$.

The verifier confirms this by locating the maximum of $g$ numerically. Answer: $f^* = 0.16$.`,
    steps: [
      "Write the growth rate g(f) = p ln(1 + bf) + q ln(1 - f).",
      "Set the derivative to zero.",
      "Rearrange to f = p - q/b = edge/odds.",
      "Evaluate: 0.4 - 0.24 = 0.16.",
    ],
    keyIdea: "Kelly fraction = edge over odds: f = p - q/b, where b is the profit per dollar staked.",
    commonMistake: "Using b = 3.5 (the total returned including the stake) instead of b = 2.5 (the profit), or using f = 2p - 1 which is only the even-money case.",
    fastPath: "Edge per dollar is 0.4(2.5) - 0.6 = 0.4; divide by odds 2.5 to get 0.16.",
    variation: "Same bet but now even money (b = 1) with win probability 0.6. Kelly fraction?",
    variationAnswer: String.raw`$f = 0.6 - 0.4 = 0.2$.`,
    family: "kelly",
    verifiedBy: ["formula", "exhaustive-search"],
  },
  {
    id: "m7-p08",
    module: 7,
    kind: "practice",
    difficulty: 2,
    tags: ["backward-induction", "games"],
    minutes: 3,
    title: "Twelve chips, take two or three",
    prompt: String.raw`Two players alternate turns removing chips from a single pile of 12 chips. On each turn a player must remove exactly 2 or exactly 3 chips. The player who removes the last chip wins. If it is your turn and only one chip remains, you cannot move and you lose. You move first. How many chips should you remove on your first move to guarantee a win?`,
    answer: { type: "numeric", value: 2, exact: "2", unit: "chips" },
    hints: [
      "Label small piles as winning or losing for the player about to move, starting from 0 and 1 chips (both losing).",
      "A pile is winning if some legal move leaves a losing pile. Work up: 2, 3, 4 are winning; 5 and 6 are losing.",
      "The losing piles are those with 0 or 1 chips more than a multiple of 5. Which move from 12 lands on one?",
    ],
    solution: String.raw`Label each pile size as W (the player about to move can force a win) or L (they cannot). A position is L if every legal move leads to a W position, or if there is no legal move at all.

Piles of 0 and 1 are L: with 0 chips the previous player just took the last chip, and with 1 chip you cannot move. Then 2 and 3 are W (take everything). From 4 you can take 3 and leave 1, which is L, so 4 is W. From 5 the moves lead to 3 or 2, both W, so 5 is L. From 6 the moves lead to 4 or 3, both W, so 6 is L. From 7 take 2 to leave 5 (L): W. From 8 take 2 or 3 to leave 6 or 5, both L: W. From 9 take 3 to leave 6: W. From 10 the moves lead to 8 or 7, both W, so 10 is L; from 11 to 9 or 8, both W, so 11 is L.

The pattern repeats with period 5 because the two moves are 2 and 3: the L positions are exactly the piles congruent to 0 or 1 modulo 5. From 12, removing 2 leaves 10 (L) and removing 3 leaves 9 (W). Only one first move wins.

After that, mirror the opponent: whenever they take 2 you take 3 and vice versa, so each round removes 5 chips and you always hand back a multiple of 5 or one more. Answer: remove $2$ chips.`,
    steps: [
      "Define W/L positions for the player to move; 0 and 1 are L.",
      "Fill upwards: a pile is W if some move reaches an L pile.",
      "Spot the period-5 pattern: L at 0, 1, 5, 6, 10, 11.",
      "From 12, only removing 2 reaches an L pile (10).",
    ],
    keyIdea: "Backward induction on positions: start from the terminal piles and label each pile W or L by whether some move reaches an L pile.",
    commonMistake: "Forgetting that a pile of 1 is a loss for the mover (not a win), which shifts every label afterwards.",
    fastPath: "Moves 2 and 3 pair up to 5, so losing piles are 0 or 1 mod 5. From 12 go to 10.",
    variation: "Same rules but the player who takes the last chip loses (and a player stuck with 1 chip still loses). Which first move from 12 wins?",
    variationAnswer: "Now 0 is W for the mover-to-be (the last taker lost) and 1 is still L; redoing the table gives L positions at 1, 2 mod 5 (1, 2, 6, 7, 11, 12). So 12 is a losing position: no first move wins, best to hope the opponent errs.",
    family: "backward-induction",
    verifiedBy: ["dp", "exhaustive-search"],
  },
  {
    id: "m7-p09",
    module: 7,
    kind: "practice",
    difficulty: 2,
    tags: ["kelly", "games"],
    minutes: 3,
    title: "Four sizing rules, one edge",
    prompt: String.raw`You can play an even-money bet (win one dollar per dollar staked or lose the stake) that wins with probability $0.55$, as many times as you like, always staking the same fraction of your current bankroll. Four friends recommend four fractions: 5%, 10%, 20% and 40%. Which fraction gives the highest long-run growth rate of the bankroll, measured as expected log wealth per bet?`,
    answer: {
      type: "choice",
      options: ["Stake 5% each time.", "Stake 10% each time.", "Stake 20% each time.", "Stake 40% each time."],
      correct: 1,
    },
    hints: [
      "Growth rate per bet is g(f) = 0.55 ln(1 + f) + 0.45 ln(1 - f). Compare the four values, or find the maximiser.",
      "For even money the Kelly fraction is p - q = 0.55 - 0.45.",
      "Check that 20% is already past the point where growth turns negative: 0.55 ln 1.2 + 0.45 ln 0.8 is slightly below zero.",
    ],
    solution: String.raw`Repeated proportional betting is judged by the expected log growth per bet, $g(f) = 0.55\ln(1 + f) + 0.45\ln(1 - f)$, because wealth after $n$ bets behaves like $e^{n g(f)}$ with overwhelming probability as $n$ grows.

Evaluate the four candidates. $g(0.05) = 0.55(0.04879) + 0.45(-0.05129) \approx 0.00375$. $g(0.10) = 0.55(0.09531) + 0.45(-0.10536) \approx 0.00501$. $g(0.20) = 0.55(0.18232) + 0.45(-0.22314) \approx -0.00014$. $g(0.40) = 0.55(0.33647) + 0.45(-0.51083) \approx -0.0448$.

The maximiser of $g$ is the Kelly fraction $f^* = p - q = 0.55 - 0.45 = 0.10$, and indeed 10% gives the highest growth. Staking 5% (half Kelly) grows more slowly but with far less variance, which is why many traders prefer it. Staking 20% is twice Kelly: the growth rate is essentially zero (slightly negative), so despite a 10-point edge the bankroll goes nowhere. Staking 40% has a sharply negative growth rate: you are almost sure to lose nearly everything over time, even though every single bet has positive expected value.

The verifier computes $g$ for the four fractions and confirms the ranking. Correct choice: stake 10%.`,
    steps: [
      "Write the growth rate g(f) for even money with p = 0.55.",
      "Evaluate g at 0.05, 0.10, 0.20, 0.40 (or recall f* = p - q).",
      "Note that 20% is about 2f*, where growth crosses zero, and 40% is strongly negative.",
      "Pick 10%.",
    ],
    keyIdea: "Positive expected value per bet does not imply growth; with proportional staking only fractions below about twice Kelly grow at all.",
    commonMistake: "Picking the biggest stake because every bet has positive EV, ignoring that the expectation of wealth and the growth of wealth are different objects.",
    fastPath: "Even money: f* = p - q = 0.10, so 10% wins. Growth hits zero near 2f* = 0.20.",
    variation: "The win probability improves to 0.6. Rank the same four fractions.",
    variationAnswer: "Now f* = 0.2, so 20% is best, then 10%, then 5%; 40% sits right at 2f* and has slightly negative growth (0.6 ln 1.4 + 0.4 ln 0.6 is about -0.0024).",
    family: "kelly",
    verifiedBy: ["exhaustive-search", "formula"],
  },

  // ---------------------------------------------------------------- difficulty 3
  {
    id: "m7-p10",
    module: 7,
    kind: "practice",
    difficulty: 3,
    tags: ["stopping", "dice", "backward-induction"],
    minutes: 3,
    title: "Up to three rolls",
    prompt: String.raw`You may roll a fair six-sided die up to three times. After the first or second roll you may stop and be paid the face shown, in dollars; if you take the third roll you must accept it. Playing optimally, what is the expected payout of the game?`,
    answer: { type: "numeric", value: 14 / 3, exact: String.raw`\tfrac{5 + 6}{6} + \tfrac{4}{6}\cdot\tfrac{17}{4} = \tfrac{14}{3} \approx 4.667`, unit: "dollars" },
    hints: [
      "Work backwards: the value with one roll left is 3.5, and with two rolls left it is 4.25.",
      "At the first roll, keep a face only if it beats 4.25.",
      "Only 5 and 6 beat 4.25. Average: two faces pay themselves, four faces pay 4.25.",
    ],
    solution: String.raw`Let $V_k$ be the value of the game when $k$ rolls remain and you have not yet rolled. With one roll left you must take it: $V_1 = 3.5$.

With two rolls left you roll, then keep the face if it exceeds $V_1 = 3.5$, otherwise continue. Keep $4, 5, 6$: $V_2 = \frac{4 + 5 + 6}{6} + \frac{3}{6}(3.5) = \frac{17}{4} = 4.25$.

With three rolls left, the continuation value is $V_2 = 4.25$, so keep only a $5$ or a $6$; a $4$ is worth less than continuing. $V_3 = \frac{5 + 6}{6} + \frac{4}{6}(4.25) = \frac{11}{6} + \frac{17}{6} = \frac{28}{6} = \frac{14}{3}$.

Notice the threshold rises as more rolls remain: with three rolls you reroll a 4, with two you keep it. Each extra roll adds less than the last ($0.75$, then $0.417$), and the value approaches 6 only slowly. The verifier checks all $64 \times 64$ pairs of keep-sets for the first two rolls and confirms that keeping $\{5, 6\}$ then $\{4, 5, 6\}$ is optimal. Answer: $\frac{14}{3} \approx 4.667$ dollars.`,
    steps: [
      "Set V1 = 3.5 for a forced final roll.",
      "V2 = 4.25 by keeping 4, 5, 6.",
      "With V2 = 4.25 as the continuation value, keep only 5 or 6 on the first roll.",
      "V3 = 11/6 + (4/6)(17/4) = 14/3.",
    ],
    keyIdea: "Backward induction: the value with k rolls left is E[max(face, value with k - 1 rolls left)].",
    commonMistake: "Keeping a 4 on the first roll because 4 beats 3.5; the right comparison is with 4.25, the value of the two remaining rolls.",
    fastPath: "3.5, then 4.25, then (11 + 4 times 4.25)/6 = 28/6 = 4.667.",
    variation: "Four rolls allowed. Value?",
    variationAnswer: String.raw`Continuation value $14/3 \approx 4.67$, so keep 5 or 6 again: $V_4 = \frac{11}{6} + \frac{4}{6}\cdot\frac{14}{3} = \frac{11}{6} + \frac{56}{18} = \frac{89}{18} \approx 4.944$.`,
    family: "dice-reroll",
    verifiedBy: ["dp", "exhaustive-search", "simulation"],
  },
  {
    id: "m7-p11",
    module: 7,
    kind: "practice",
    difficulty: 3,
    tags: ["stopping", "cards", "expectation"],
    minutes: 4,
    title: "Two draws without replacement",
    prompt: String.raw`Ten cards numbered 1 to 10 are shuffled face down. You turn over the top card. You may stop and be paid its number in dollars, or discard it and be paid the number on the next card, whatever it is. The discarded card is not returned to the pack. Playing optimally, what is the expected payout?`,
    answer: { type: "numeric", value: 62 / 9, exact: String.raw`\tfrac{1}{10}\left(6 + 7 + 8 + 9 + 10 + \sum_{x=1}^{5}\tfrac{55 - x}{9}\right) = \tfrac{62}{9} \approx 6.889`, unit: "dollars" },
    hints: [
      "The continuation value depends on the card you saw: the second card is uniform on the other nine numbers.",
      "If the first card is x, the second card averages (55 - x)/9. Keep x when x is at least that.",
      "x >= (55 - x)/9 means 10x >= 55, so keep 6 or higher. Then average over the ten first cards.",
    ],
    solution: String.raw`Unlike a die, the second draw here depends on the first: if the first card is $x$, the second is uniform over the nine remaining numbers, whose sum is $55 - x$. So the continuation value after seeing $x$ is $\frac{55 - x}{9}$. A high first card makes the second draw slightly *worse*, which pushes you toward keeping.

Keep $x$ when $x \ge \frac{55 - x}{9}$, that is $9x \ge 55 - x$, or $x \ge 5.5$. So keep $6, 7, 8, 9, 10$ and discard $1$ through $5$.

Now average over the equally likely first card. The five kept cards contribute $6 + 7 + 8 + 9 + 10 = 40$. The five discarded cards contribute their continuation values $\frac{54}{9} + \frac{53}{9} + \frac{52}{9} + \frac{51}{9} + \frac{50}{9} = \frac{260}{9}$. The value is $\frac{1}{10}\left(40 + \frac{260}{9}\right) = \frac{1}{10} \cdot \frac{620}{9} = \frac{62}{9}$.

For comparison, if the first card were returned to the pack (with replacement) the continuation value would be a flat $5.5$, the same keep-set $\{6, \dots, 10\}$ would apply, and the value would be $\frac{40 + 5 \cdot 5.5}{10} = 6.75$. Without replacement is worth a little more because discarding a low card improves the pool. The verifier enumerates all 90 ordered pairs of cards under every one of the 1024 possible keep-sets and finds the same optimum. Answer: $\frac{62}{9} \approx 6.889$ dollars.`,
    steps: [
      "Continuation value after seeing x is (55 - x)/9.",
      "Keep when x >= (55 - x)/9, i.e. x >= 6.",
      "Sum kept faces (40) and continuation values for 1 to 5 (260/9).",
      "Divide by 10: 62/9.",
    ],
    keyIdea: "Without replacement the continuation value depends on what you saw; compute it from the remaining pool, not from the full deck.",
    commonMistake: "Using 5.5 as the continuation value for every first card, which is the with-replacement answer 6.75.",
    fastPath: "Keep 6 to 10. Discarded cards 1 to 5 each give (55 - x)/9, averaging 52/9. Value = (40 + 260/9)/10 = 62/9.",
    variation: "Same game but you may discard twice (up to three cards seen, you must take the third). Sketch the optimal first decision.",
    variationAnswer: String.raw`Compute the two-draw value $W(x)$ of the nine-card remainder after discarding $x$ (keep the second card $y$ when $y \ge \frac{55 - x - y}{8}$), then keep the first card only if $x \ge W(x)$. $W(6) \approx 6.97$ and $W(7) \approx 6.79$, so the threshold rises to keeping 7 or higher; the value is $\frac{553}{72} \approx 7.68$.`,
    family: "dice-reroll",
    verifiedBy: ["enumeration", "exhaustive-search", "simulation"],
  },
  {
    id: "m7-p12",
    module: 7,
    kind: "practice",
    difficulty: 3,
    tags: ["stopping", "games"],
    minutes: 4,
    title: "Five applicants, one offer",
    prompt: String.raw`Five applicants for a desk seat are interviewed one at a time in a uniformly random order. All five have different quality, and after each interview you know exactly how the current applicant ranks among those seen so far, but nothing about the ones still to come. Immediately after an interview you must either hire that applicant (ending the process) or reject them for good. If you reach the fifth applicant you must hire them. You use a cutoff rule: reject the first $k$ applicants no matter what, then hire the first one who is better than everyone seen before. With the best choice of $k$, what is the probability that you hire the best of the five?`,
    answer: { type: "numeric", value: 13 / 30, exact: String.raw`\max_k \tfrac{k}{5}\sum_{j=k+1}^{5}\tfrac{1}{j-1} = \tfrac{2}{5}\left(\tfrac12 + \tfrac13 + \tfrac14\right) = \tfrac{13}{30} \approx 0.433` },
    hints: [
      "You succeed if the best applicant is at position j > k and the best of the first j - 1 applicants sits inside the first k.",
      "Given the best is at position j, the best of the earlier j - 1 is equally likely to be at any of those positions, so the probability it is in the first k is k/(j - 1).",
      "Success probability for cutoff k is (k/5) times the sum of 1/(j - 1) over j from k + 1 to 5. Compare k = 1, 2, 3.",
    ],
    solution: String.raw`The cutoff rule hires the first applicant after position $k$ who is a new record (better than all before). It picks the overall best exactly when the best sits at some position $j > k$ and no record appears at positions $k + 1, \dots, j - 1$. The latter happens precisely when the best of the first $j - 1$ applicants is among the first $k$: then every applicant between $k + 1$ and $j - 1$ is beaten by someone earlier, so none is a record.

The best is at position $j$ with probability $\frac{1}{5}$. Given that, the ordering of the other applicants is still uniform, so the best of the first $j - 1$ is equally likely to be at any of those $j - 1$ positions, and lies in the first $k$ with probability $\frac{k}{j - 1}$. Summing, $P_k = \frac{1}{5}\sum_{j = k + 1}^{5}\frac{k}{j - 1} = \frac{k}{5}\sum_{j = k + 1}^{5}\frac{1}{j - 1}$.

Evaluate: $P_1 = \frac{1}{5}\left(1 + \frac12 + \frac13 + \frac14\right) = \frac{25}{60}$; $P_2 = \frac{2}{5}\left(\frac12 + \frac13 + \frac14\right) = \frac{2}{5}\cdot\frac{13}{12} = \frac{26}{60}$; $P_3 = \frac{3}{5}\left(\frac13 + \frac14\right) = \frac{21}{60}$; $P_4 = \frac{4}{5}\cdot\frac14 = \frac{12}{60}$. (Hiring the first applicant, $k = 0$, succeeds with probability $\frac15 = \frac{12}{60}$.)

The best cutoff is $k = 2$: skip two, then take the first record. The verifier confirms this by running every cutoff on all $120$ orderings; $52$ of them succeed for $k = 2$. Answer: $\frac{13}{30} \approx 0.433$.`,
    steps: [
      "Success = best at position j > k and the best of the first j - 1 within the first k.",
      "Conditional probability of the second event is k/(j - 1).",
      "P_k = (k/5) times the sum of 1/(j - 1) for j from k + 1 to 5.",
      "Compare k = 1, 2, 3: 25/60, 26/60, 21/60; pick k = 2.",
    ],
    keyIdea: "Skip a learning phase, then take the first record; the success probability is (k/n) times a tail of the harmonic series.",
    commonMistake: "Guessing that the rule can do no better than 1/5 (random) or than 1/2, or using n/e = 1.84 and rounding to skip 1 without checking k = 2.",
    fastPath: "k = 2 gives (2/5)(1/2 + 1/3 + 1/4) = (2/5)(13/12) = 13/30; k = 1 gives 25/60, slightly less.",
    variation: "Seven applicants instead of five. Best cutoff and success probability?",
    variationAnswer: String.raw`$k = 2$ again: $\frac{2}{7}\left(\frac12 + \frac13 + \frac14 + \frac15 + \frac16\right) = \frac{2}{7}\cdot\frac{87}{60} = \frac{29}{70} \approx 0.414$; $k = 3$ gives $\frac{171}{420} \approx 0.407$.`,
    family: "secretary",
    verifiedBy: ["exhaustive-search", "formula", "simulation"],
  },
  {
    id: "m7-p13",
    module: 7,
    kind: "practice",
    difficulty: 3,
    tags: ["poker", "games"],
    minutes: 4,
    title: "How often to bluff with the low signal",
    prompt: String.raw`Ann and Ben play a one-round signalling game. Each puts \$2 into the pot. From three cards marked High, Mid and Low, each player is dealt one at random (the two cards are different, and all six deals are equally likely); each sees only their own card. Ann acts first: she may *check* or *bet* \$1. If she checks, the cards are revealed and the higher card takes the pot. If she bets, Ben may *fold* (Ann takes the pot) or *call* by adding \$1 (cards revealed, higher card takes everything). Ann always bets with High, never bets with Mid, and bets with Low with some probability $\beta$ (a bluff). Ben always calls with High and always folds with Low. What value of $\beta$ makes Ben exactly indifferent between calling and folding when he holds Mid and faces a bet?`,
    answer: { type: "numeric", value: 1 / 5, exact: String.raw`\beta = \tfrac{\text{bet}}{\text{pot} + \text{bet}} = \tfrac{1}{4 + 1} = \tfrac{1}{5} = 0.2` },
    hints: [
      "If Ben holds Mid, Ann holds High or Low with equal prior probability. A bet is certain from High and happens with probability beta from Low.",
      "Given a bet, the probability Ann has Low is beta/(1 + beta). Calling costs 1 and wins the 5 in the pot (4 of antes plus Ann's bet) when Ann is bluffing.",
      "Indifference: 5 times beta/(1 + beta) equals 1 times 1/(1 + beta), so 5 beta = 1.",
    ],
    solution: String.raw`Put yourself in Ben's seat holding Mid and facing a bet. Before the bet, Ann's card was High or Low with probability $\frac12$ each (the Mid is in Ben's hand). Ann bets with probability $1$ from High and $\beta$ from Low, so by Bayes the posterior probability that she is bluffing is $\frac{\beta}{1 + \beta}$ and that she has High is $\frac{1}{1 + \beta}$.

Compare Ben's two options relative to folding, which earns him nothing further. Calling costs \$1. If Ann has Low the call wins the whole pot: the \$4 of antes plus Ann's \$1 bet, a gain of \$5 relative to folding. If Ann has High the call simply loses the \$1. So the expected gain of calling over folding is $5\cdot\frac{\beta}{1 + \beta} - 1\cdot\frac{1}{1 + \beta} = \frac{5\beta - 1}{1 + \beta}$.

Indifference means this is zero: $5\beta = 1$, so $\beta = \frac15$. Ann should bluff with Low one time in five. Equivalently, among Ann's bets the ratio of bluffs to value bets is $1 : 5$, which is the bet size divided by the pot plus bet: $\frac{1}{4 + 1}$. Pot odds for Ben are 5-to-1, so he needs to be right one time in six, and $\frac{\beta}{1+\beta} = \frac{1}{6}$ exactly.

If Ann bluffed more, Ben would always call with Mid and Ann's Low would lose \$3 every time it bet; if she bluffed less, Ben would always fold Mid and Ann would be leaving money on the table by not bluffing more. The verifier finds the same $\beta$ by searching for the bluffing frequency that maximises Ann's payoff against a best-responding Ben. Answer: $\beta = \frac15 = 0.2$.`,
    steps: [
      "Condition on Ben holding Mid: Ann has High or Low with prior 1/2 each.",
      "Apply Bayes: P(Low | bet) = beta/(1 + beta).",
      "Call gains 5 against a bluff and loses 1 against High; set the expectation to zero.",
      "Solve 5 beta = 1: beta = 1/5.",
    ],
    keyIdea: "Bluff just often enough that the caller's pot odds exactly match the chance you are bluffing: bluffs/value bets = bet/(pot + bet).",
    commonMistake: "Setting beta/(1 + beta) equal to 1/5 (confusing bluff-to-value ratio with bluff probability given a bet) or using the pot without the bet.",
    fastPath: "Bet over pot-plus-bet: 1/(4 + 1) = 1/5.",
    variation: "The antes are 1 dollar each (pot 2) and the bet is still 1 dollar. Indifference bluffing frequency?",
    variationAnswer: String.raw`$\beta = \frac{1}{2 + 1} = \frac13$: Ben's pot odds are 3-to-1, so he must be right one time in four.`,
    family: "indifference",
    verifiedBy: ["formula", "exhaustive-search"],
  },
  {
    id: "m7-p14",
    module: 7,
    kind: "practice",
    difficulty: 3,
    tags: ["auctions", "expectation"],
    minutes: 3,
    title: "Shading against one rival",
    prompt: String.raw`Two bidders compete in a sealed-bid *first-price* auction: the higher bid wins and pays its own bid. Each bidder's value for the item is drawn independently and uniformly from $[0, 100]$ dollars, and each knows only their own value. You know your rival always bids exactly half her value. Your value is \$80. Which bid maximises your expected profit (value minus bid when you win, zero otherwise)?`,
    answer: { type: "numeric", value: 40, exact: String.raw`b^* = \tfrac{80}{2} = 40`, unit: "dollars" },
    hints: [
      "The rival's bid is uniform on [0, 50]. Your bid b wins with probability b/50 for b up to 50.",
      "Expected profit is (80 - b)(b/50) for b in [0, 50]: a downward parabola.",
      "Maximise (80 - b) b: the vertex is at b = 40.",
    ],
    solution: String.raw`The rival's value is uniform on $[0, 100]$ and she bids half of it, so her bid is uniform on $[0, 50]$. Your bid $b \le 50$ beats her with probability $\frac{b}{50}$; any bid above 50 wins for sure but pays more than necessary, so the optimum is at or below 50.

Expected profit $\pi(b) = (80 - b)\cdot\frac{b}{50}$ for $0 \le b \le 50$. This is a downward-opening parabola in $b$ with roots at $0$ and $80$, so its maximum is at the midpoint $b^* = 40$. The derivative check agrees: $\frac{d}{db}(80b - b^2) = 80 - 2b = 0$ at $b = 40$. There $\pi = 40\cdot\frac{40}{50} = 32$ dollars.

Two sanity checks. Bidding 50, which wins for sure, earns $30 < 32$. Bidding 20 earns $60 \cdot 0.4 = 24 < 32$. Shading to exactly half your value is best, which is why 'bid half your value' is the equilibrium for two uniform bidders: if the rival shades by half, your best response is to shade by half too.

The verifier scans every bid from 0 to 100 in fine steps and finds the maximum at 40. Answer: bid \$40.`,
    steps: [
      "Rival's bid is uniform on [0, 50].",
      "P(win with bid b) = b/50 for b up to 50.",
      "Maximise (80 - b) b/50: vertex at b = 40.",
      "Check the endpoints: 50 earns 30, below 32.",
    ],
    keyIdea: "In a first-price auction your bid is the price, so trade win probability against margin; with a uniform rival shading by half, the best response is to bid half your value.",
    commonMistake: "Bidding 50 'to be sure of winning', or computing P(win) as b/100 (forgetting the rival only bids up to 50).",
    fastPath: "Profit is proportional to (80 - b) b, a parabola with roots 0 and 80: peak at 40.",
    variation: "There are now two rivals, each bidding half her value independently. Best bid with value 80?",
    variationAnswer: String.raw`P(win) = $(b/50)^2$, so maximise $(80 - b)b^2$: $160b - 3b^2 = 0$ gives $b = \frac{160}{3} \approx 53.3$, but bids above 50 win for sure, so the optimum is $b = 50$ with profit 30. (The three-bidder equilibrium is to bid two thirds of value, where this rival behaviour is not an equilibrium.)`,
    family: "bidding",
    verifiedBy: ["exhaustive-search", "formula"],
  },
  {
    id: "m7-p15",
    module: 7,
    kind: "practice",
    difficulty: 3,
    tags: ["auctions", "expectation", "dice"],
    minutes: 3,
    title: "Revenue from two die-roll bidders",
    prompt: String.raw`Two bidders each roll a fair six-sided die in private; the face is the bidder's value for a trinket, in dollars. The trinket is sold by second-price sealed bid: each bidder submits a bid, the higher bid wins, and the winner pays the lower bid. If the bids tie, a coin decides the winner, who pays the tied amount. Both bidders bid their true value. What is the seller's expected revenue, in dollars?`,
    answer: { type: "numeric", value: 91 / 36, exact: String.raw`E[\min] = \sum_{k=1}^{6}\left(\tfrac{7 - k}{6}\right)^2 = \tfrac{91}{36} \approx 2.528`, unit: "dollars" },
    hints: [
      "The price paid is the smaller of the two values (the tied value when they tie). You want E[min of two dice].",
      "Use E[min] = sum over k of P(min >= k), and P(min >= k) = ((7 - k)/6)^2.",
      "Sum 36 + 25 + 16 + 9 + 4 + 1 over 36.",
    ],
    solution: String.raw`With truthful bidding the revenue is the lower of the two values, or the common value on a tie. Either way revenue $R = \min(X, Y)$ for two independent fair dice.

The cleanest route is the tail-sum formula for a non-negative integer variable: $E[R] = \sum_{k \ge 1} P(R \ge k)$. Both dice are at least $k$ with probability $\left(\frac{7 - k}{6}\right)^2$, so $E[R] = \frac{36 + 25 + 16 + 9 + 4 + 1}{36} = \frac{91}{36}$.

A direct enumeration agrees: $P(\min = k) = \frac{13 - 2k}{36}$ (one tied outcome plus $2(6 - k)$ outcomes where the other die is higher), so $E[R] = \frac{11 \cdot 1 + 9 \cdot 2 + 7 \cdot 3 + 5 \cdot 4 + 3 \cdot 5 + 1 \cdot 6}{36} = \frac{91}{36}$.

Because the two dice are symmetric around $3.5$, $E[\min] + E[\max] = 7$, so the expected maximum (what a first-price auction with truthful bids would collect) is $\frac{161}{36} \approx 4.47$. The second-price seller collects the second-highest value, about $2.53$. Answer: $\frac{91}{36} \approx 2.528$ dollars.`,
    steps: [
      "Revenue is the minimum of the two die values.",
      "P(min >= k) = ((7 - k)/6)^2.",
      "E[min] = sum of those tail probabilities = 91/36.",
    ],
    keyIdea: "Second-price revenue is the second-highest value; for two bidders that is the minimum, and E[min] is a tail sum.",
    commonMistake: "Reporting the expected maximum (161/36) or the expected value of a single die (3.5).",
    fastPath: "The squares 1, 4, 9, 16, 25, 36 sum to 91; divide by 36.",
    variation: "Three die-roll bidders, still second price. Expected revenue?",
    variationAnswer: String.raw`The second-highest of three symmetric dice is the median, and by symmetry about 3.5 its mean is exactly $3.5$.`,
    family: "bidding",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m7-p16",
    module: 7,
    kind: "practice",
    difficulty: 3,
    tags: ["games", "dice", "symmetry"],
    minutes: 3,
    title: "Sum of two against double of one",
    prompt: String.raw`Alice rolls two fair dice and scores their sum. Bob rolls one fair die and scores double its face. The higher score wins the round; a tie is replayed. Who is favoured to win?`,
    answer: {
      type: "choice",
      options: [
        "Alice: her sum is usually near 7, which beats Bob's 2, 4 and 6 and only loses to his 8, 10 and 12.",
        "Bob: his score reaches 12 one time in six, while Alice reaches 12 only one time in 36.",
        String.raw`Neither: both scores are symmetric about 7, so Alice and Bob each win exactly $\tfrac{99}{216}$ of the rounds and $\tfrac{18}{216}$ are ties.`,
        "Alice, but only slightly, because replayed ties favour the player with the less spread-out score.",
      ],
      correct: 2,
    },
    hints: [
      "Both scores have mean 7. Think about the shape of each distribution around 7.",
      "Reflect every outcome through 7: Alice's sum s becomes 14 - s and Bob's 2d becomes 14 - 2d. Both distributions are unchanged.",
      "If the reflection maps 'Alice wins' onto 'Bob wins' outcome for outcome, the two probabilities are equal. Confirm with a direct count if you like: 99 ways each.",
    ],
    solution: String.raw`Direct count first. Bob scores $2d$ for $d = 1, \dots, 6$. Alice beats a given Bob score $2d$ with probability $P(S > 2d)$ where $S$ is the sum of two dice: $P(S > 2) = \frac{35}{36}$, $P(S > 4) = \frac{30}{36}$, $P(S > 6) = \frac{21}{36}$, $P(S > 8) = \frac{10}{36}$, $P(S > 10) = \frac{3}{36}$, $P(S > 12) = 0$. Averaging over Bob's six equally likely scores, $P(\text{Alice wins}) = \frac{99}{216}$.

Ties: $P(S = 2d)$ summed over $d$ gives $\frac{1 + 3 + 5 + 5 + 3 + 1}{36} = \frac{18}{36}$, so $P(\text{tie}) = \frac{18}{216} = \frac{1}{12}$. Then $P(\text{Bob wins}) = 1 - \frac{99}{216} - \frac{18}{216} = \frac{99}{216}$. The game is exactly fair.

Why that is no coincidence: the sum of two dice is symmetric about $7$ ($P(S = s) = P(S = 14 - s)$), and so is Bob's $2d$ ($P(2d = t) = P(2d = 14 - t)$). Reflecting every outcome pair $(s, t) \mapsto (14 - s, 14 - t)$ preserves probabilities and swaps 'Alice ahead' with 'Bob ahead'. So the two win probabilities must be equal, whatever the tie rule. Replaying ties just rescales both to $\frac12$.

Options 1 and 2 each look at one tail only; option 4 invents an effect of tie replay that does not exist. Correct choice: neither player is favoured.`,
    steps: [
      "Note both scores have mean 7 and are symmetric about 7.",
      "Reflection through 7 swaps the two 'ahead' events, so the win probabilities are equal.",
      "Confirm by counting: Alice ahead in 99 of 216 outcomes, Bob in 99, ties in 18.",
    ],
    keyIdea: "Two scores with distributions symmetric about the same centre give a fair game, whatever their spreads.",
    commonMistake: "Reasoning from the concentration of the two-dice sum near 7 and concluding Alice must win, without checking the losses to 8, 10 and 12.",
    fastPath: "Both symmetric about 7: fair. If pressed, count: 99, 99 and 18 ties.",
    variation: "Bob now scores his die plus 4 instead of double. Who is favoured?",
    variationAnswer: String.raw`Bob's score $d + 4$ is uniform on 5 to 10, mean 7.5, so the centres differ and symmetry fails. Counting gives Alice ahead in $\frac{81}{216}$, Bob ahead in $\frac{108}{216}$, ties $\frac{27}{216}$: Bob is favoured.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m7-p17",
    module: 7,
    kind: "practice",
    difficulty: 3,
    tags: ["games", "expectation", "coins"],
    minutes: 4,
    title: "Doubling prize with a payout cap",
    prompt: String.raw`A fair coin is flipped until the first head. If the first head comes on flip $k$, the prize is $2^{k-1}$ dollars (\$1 for a head on the first flip, \$2 on the second, \$4 on the third, and so on). The organiser cannot pay more than \$500, so any prize above \$500 is cut to exactly \$500. What is the expected payout of this capped game, in dollars?`,
    answer: { type: "numeric", value: 9 / 2 + 500 / 512, exact: String.raw`9\cdot\tfrac12 + 500\cdot 2^{-9} = \tfrac{9}{2} + \tfrac{500}{512} = \tfrac{701}{128} \approx 5.477`, unit: "dollars" },
    hints: [
      "Each uncapped term P(first head on flip k) times the prize equals 1/2. Count how many prizes are at or below 500.",
      "The prizes 1, 2, 4, ..., 256 (k = 1 to 9) are all under the cap; from k = 10 the prize is 512 or more and pays 500.",
      "Expected payout = 9 times 1/2 plus 500 times P(k >= 10) = 4.5 + 500/512.",
    ],
    solution: String.raw`The first head lands on flip $k$ with probability $2^{-k}$. Without a cap each term of the expectation is $2^{-k}\cdot 2^{k-1} = \frac12$, and there are infinitely many terms, so the uncapped expectation is infinite. The cap is what makes the game priceable.

Prizes $2^{k-1}$ for $k = 1, \dots, 9$ are $1, 2, 4, \dots, 256$, all at most $500$, so those nine terms contribute $9 \cdot \frac12 = \frac92$. For $k \ge 10$ the prize would be $512$ or more and is cut to $500$; the probability of needing ten or more flips is $P(k \ge 10) = 2^{-9} = \frac{1}{512}$, contributing $\frac{500}{512}$.

Expected payout $= \frac92 + \frac{500}{512} = \frac{2304 + 500}{512} = \frac{2804}{512} = \frac{701}{128} \approx 5.48$ dollars.

The lesson: an 'infinite expectation' game is worth a modest amount as soon as the counterparty's bankroll is finite. Each doubling of the cap adds only another 50 cents; a cap of a million dollars gives about $\frac{20}{2} + \frac{10^6}{2^{20}} \approx 10.95$. The verifier sums the exact series and also simulates the capped game with twelve million plays. Answer: $\frac{701}{128} \approx 5.477$ dollars.`,
    steps: [
      "Each uncapped term contributes exactly 1/2.",
      "Nine prizes (1 to 256) are under the cap: contribution 9/2.",
      "The tail k >= 10 has probability 1/512 and pays 500: contribution 500/512.",
      "Add: 701/128.",
    ],
    keyIdea: "A payout cap turns an infinite expectation into a finite one: count the uncapped half-dollar terms, then add cap times tail probability.",
    commonMistake: "Counting ten uncapped terms (512 is above 500, so it is capped), or forgetting the tail term entirely and answering 4.5.",
    fastPath: "Nine halves is 4.5; tail 500/512 is just under 1; total about 5.48.",
    variation: "The cap is raised to 5,000 dollars. Expected payout?",
    variationAnswer: String.raw`Prizes up to $4096 = 2^{12}$ (k = 1 to 13) are uncapped: $\frac{13}{2} + \frac{5000}{2^{13}} = 6.5 + 0.610 \approx 7.11$ dollars.`,
    family: "st-petersburg",
    verifiedBy: ["enumeration", "formula", "simulation"],
  },
  {
    id: "m7-p18",
    module: 7,
    kind: "practice",
    difficulty: 3,
    tags: ["games", "expectation", "conditional"],
    minutes: 4,
    title: "The argument for always switching",
    prompt: String.raw`Two sealed envelopes hold money; one holds exactly twice the amount of the other. You pick one at random, open it, and find $X$ dollars. A friend argues: *The other envelope holds $2X$ or $X/2$, each with probability $\tfrac12$, so its expected content is $\tfrac12(2X) + \tfrac12(X/2) = 1.25X > X$. You should switch. And had you opened the other envelope first, the same argument would tell you to switch back.* Exactly one of the following correctly identifies the flaw. Which?`,
    answer: {
      type: "choice",
      options: [
        String.raw`The expectation $1.25X$ is correct, but switching back is not allowed because you have already seen $X$; the argument is sound in one direction only.`,
        String.raw`The step *the other envelope holds $2X$ or $X/2$ with probability $\tfrac12$ each, for every observed $X$* is false: no probability distribution over the amounts can make it true for all $X$, and under any genuine distribution the expected gain from switching, averaged over what you might see, is exactly zero.`,
        "Expected value is the wrong criterion here; the decision should be based on the median content of the other envelope, which equals X.",
        "The two envelopes are not equally likely to be the larger one once you have opened one of them, because opening it changes the physical situation.",
      ],
      correct: 1,
    },
    hints: [
      "Write down a concrete way the amounts could be chosen, say pairs (a, 2a) with a from a finite list, and compute P(other is larger | you see X) for each X.",
      "For the smallest possible X the other envelope is certainly larger; for the largest it is certainly smaller. So 'one half for every X' fails.",
      "Compute the overall expected gain from switching under your concrete distribution; by symmetry between the two envelopes it must be zero.",
    ],
    solution: String.raw`Before opening, the two envelopes are exchangeable: each is equally likely to be the larger, so $E[\text{other}] = E[\text{yours}]$ and switching blind gains nothing. The friend's argument claims that *after* seeing $X$ the other envelope still has a $\frac12$ chance of being the larger, for every value of $X$. That is the step to test.

Make the setup concrete. Suppose the pair is $(a, 2a)$ with $a$ chosen uniformly from $\{1, 2, 4, 8, 16, 32\}$, and you open a uniformly random envelope. If you see $X = 1$, the other envelope must hold $2$: the probability it is larger is $1$, not $\frac12$. If you see $X = 64$, the other must hold $32$: probability $0$. For the in-between values $X = 2, 4, 8, 16, 32$ the probability is indeed $\frac12$, because $X$ could be the small member of one pair or the large member of another, equally likely. So the conditional probability is $\frac12$ for *most* $X$ but not for *all*, and the friend's rule 'switch for every $X$' is applying a probability that fails at the ends.

Now average the gain from switching over everything you might see. For $X$ in the middle, the gain is $\frac12(2X) + \frac12(X/2) - X = X/4 > 0$. At $X = 1$ the gain is $+1$. At $X = 64$ the gain is $-32$. Weight by the probabilities: the middle values and the small end contribute a total of $\frac{1}{12}(1) + \frac{1}{6}\left(\frac{2 + 4 + 8 + 16 + 32}{4}\right) = \frac{1}{12} + \frac{62}{24} = \frac{32}{12}$, and the top end contributes $\frac{1}{12}(-32) = -\frac{32}{12}$. The total is exactly zero, as symmetry demands. The whole apparent profit of $X/4$ in the middle is paid back by the one disastrous case at the top.

For the probability to be $\frac12$ at every $X$, each amount $2^j$ would need to be exactly as likely as $2^{j+1}$ for all $j$, which is impossible for a probability distribution (the probabilities would be constant on an infinite set and could not sum to one). And under any prior with a finite expected amount, which any real pair of envelopes has, exchangeability forces the average gain from switching to be zero. Options 1, 3 and 4 do not engage with this: the argument is wrong in both directions, expectation is a fine criterion, and opening an envelope changes nothing physical. Correct choice: the second option.`,
    steps: [
      "Fix a concrete distribution of pairs (a, 2a).",
      "Compute P(other is larger | X): it is 1 at the smallest X and 0 at the largest, not 1/2.",
      "Average the switching gain over X: positive in the middle, a large negative at the top, total zero.",
      "Conclude that 'one half for every X' is the false step.",
    ],
    keyIdea: "Conditional probabilities must come from a prior; the switching argument assumes a prior that cannot exist, and any real prior makes the average gain from switching zero.",
    commonMistake: "Accepting the 1.25X computation as a general fact and hunting for the error elsewhere (in the switching back, or in the use of expectation).",
    fastPath: "By exchangeability the two envelopes have the same expectation, so the average gain is zero; the only step that can fail is the fixed 1/2 for all X.",
    variation: "Suppose you know the pair is (10, 20) with certainty before opening. You open one and see 10. Should you switch?",
    variationAnswer: "Yes: with that prior the other envelope holds 20 for sure. And if you see 20 you should keep. There is no paradox once the prior is explicit.",
    family: "two-envelopes",
    verifiedBy: ["enumeration", "formula"],
  },

  // ---------------------------------------------------------------- difficulty 4
  {
    id: "m7-p19",
    module: 7,
    kind: "practice",
    difficulty: 4,
    tags: ["backward-induction", "games"],
    minutes: 5,
    title: "Twenty chips, take one, three or four",
    prompt: String.raw`Two players alternate removing chips from a single pile of 20. On each turn a player must remove exactly 1, 3 or 4 chips (never 2). Whoever removes the last chip wins. You move first. Exactly one first move guarantees you a win against any defence. How many chips should you remove?`,
    answer: { type: "numeric", value: 4, exact: "4", unit: "chips" },
    hints: [
      "Label piles 0, 1, 2, ... as losing (L) or winning (W) for the player about to move; 0 is L.",
      "A pile is W if removing 1, 3 or 4 can reach an L pile. Build the table up to 20; look for a repeating pattern.",
      "The L piles are those congruent to 0 or 2 modulo 7. From 20, which single move reaches one?",
    ],
    solution: String.raw`Work from the bottom. A pile of $0$ is L for the player to move (the previous player took the last chip). $1$ is W (take it). From $2$ the only legal move is to take 1, leaving 1 (W), so $2$ is L. $3$ is W (take 1 to leave 2). From $4$, taking 4 leaves 0: W. From $5$, taking 3 leaves 2: W. From $6$, taking 4 leaves 2: W. From $7$ the moves leave $6, 4, 3$, all W, so $7$ is L.

Continue: $8$ is W (take 1 to leave 7). From $9$ the moves leave $8, 6, 5$, all W: L. $10$ W (leave 9). $11$ W (take 4, leave 7). $12$ W (take 3, leave 9). $13$ W (take 4, leave 9). From $14$ the moves leave $13, 11, 10$, all W: L. The L piles so far are $0, 2, 7, 9, 14$, and the pattern has period $7$: L exactly when the pile is $0$ or $2$ modulo $7$. (Period 7 is plausible because once you know the labels for seven consecutive piles, the next label depends only on them.) So $16$ is L and $15, 17, 18, 19, 20$ are W.

From $20$ the three moves leave $19$ ($\equiv 5$, W), $17$ ($\equiv 3$, W) and $16$ ($\equiv 2$, L). Only removing 4 chips hands the opponent a losing pile.

Afterwards, keep handing back piles congruent to $0$ or $2$ mod $7$: from $16$ the opponent leaves $15, 13$ or $12$, and you reply with $1, 4$ or $3$ to reach $14$. The verifier labels every pile by dynamic programming and also walks the full game tree from 20 without memoisation; both report 4 as the unique winning first move. Answer: remove $4$ chips.`,
    steps: [
      "Set 0 as L; label upwards using moves 1, 3, 4.",
      "Find L piles 0, 2, 7, 9, 14, 16: the pattern is 0 or 2 mod 7.",
      "From 20 only removing 4 reaches an L pile (16).",
      "Check uniqueness: 19 and 17 are W for the opponent.",
    ],
    keyIdea: "Label positions from the terminal state upward; a position is losing only if every move leads to a winning one, and the labels become periodic.",
    commonMistake: "Assuming the losing piles are multiples of 5 (the sum 1 + 4) or of 7 without checking, or forgetting that 2 is a losing pile because the only move from it is to take 1.",
    fastPath: "Build the L list quickly: 0, 2, then every +7. From 20 go to 16 by taking 4.",
    variation: "Same moves, but the player who takes the last chip loses. What is the first move from 20?",
    variationAnswer: "Redo the table with 0 as W for the mover-to-be (the opponent just lost). The L piles become 1, 3 mod 7 (1, 3, 8, 10, 15, 17); from 20 remove 3 to leave 17.",
    family: "backward-induction",
    verifiedBy: ["dp", "exhaustive-search"],
  },
  {
    id: "m7-p20",
    module: 7,
    kind: "practice",
    difficulty: 4,
    tags: ["stopping", "dice", "first-step"],
    minutes: 5,
    title: "Unlimited rerolls at a quarter each",
    prompt: String.raw`You may roll a fair six-sided die as many times as you like, but every roll, including the first, costs 25 cents, paid before the roll. After any roll you may stop and be paid the face shown, in dollars. Playing optimally, what is the expected net payout (payouts minus all fees) of the game?`,
    answer: { type: "numeric", value: 19 / 4, exact: String.raw`V = \tfrac{-\tfrac14 + \tfrac{5 + 6}{6}}{1 - \tfrac{4}{6}} = \tfrac{19}{4} = 4.75`, unit: "dollars" },
    hints: [
      "Let V be the value of the game before any roll. Because the game looks the same after every reroll, V is also the continuation value.",
      "You stop on face x when x >= V. Guess the keep-set, write V = -1/4 + (1/6)(sum of kept faces) + (fraction rerolled) V, and solve.",
      "Try keeping 5 and 6: V = -1/4 + 11/6 + (4/6) V. Check that the solution is consistent with 5 being kept and 4 rerolled.",
    ],
    solution: String.raw`Because rerolls are unlimited and the die has no memory, the game after a reroll is an exact copy of the game at the start. So the continuation value equals the value of the whole game, call it $V$, and the optimal rule is: stop on $x$ if $x \ge V$, otherwise pay another quarter and roll again. This is first-step analysis: condition on the first roll and let the equation do the work.

Suppose the keep-set is $\{5, 6\}$. Then $V = -\frac14 + \frac{5 + 6}{6} + \frac{4}{6}V$, because you always pay the quarter, keep with probability $\frac26$, and otherwise face the same game. Rearranging, $\frac13 V = -\frac14 + \frac{11}{6} = \frac{19}{12}$, so $V = \frac{19}{4} = 4.75$. Consistency check: $5 \ge 4.75$ (keep) and $4 < 4.75$ (reroll), so the guessed keep-set is the one the rule prescribes.

The other candidates fail the check. Keeping $\{4, 5, 6\}$ gives $\frac12 V = -\frac14 + \frac{15}{6}$, so $V = 4.5$; but then a 4 is below 4.5 and should have been rerolled, a contradiction. Keeping only $\{6\}$ gives $\frac16 V = -\frac14 + 1$, so $V = 4.5$ as well, and now a 5 beats 4.5 and should have been kept. The threshold rule with $V = 4.75$ is the unique consistent solution, and a direct comparison of the three candidate values ($4.5$, $4.75$, $4.5$) confirms it is the maximum.

Expected number of rolls is $3$ (a geometric wait for a 5 or 6), so fees average 75 cents, and the kept face averages $5.5$: $5.5 - 0.75 = 4.75$, the same answer by a different route. The verifier runs value iteration on the stopping problem, compares every threshold, and simulates the optimal play. Answer: $\frac{19}{4} = 4.75$ dollars.`,
    steps: [
      "Recognise that the game renews after each reroll, so continuation value = V.",
      "Guess keep-set {5, 6}: V = -1/4 + 11/6 + (4/6) V.",
      "Solve: V = 19/4; check 5 >= V > 4.",
      "Cross-check: 5.5 average kept face minus 3 rolls times 0.25.",
    ],
    keyIdea: "With unlimited renewals the continuation value is the game's own value; guess the keep-set, solve the linear equation, and verify the threshold is self-consistent.",
    commonMistake: "Charging the fee only on rerolls (the first roll costs too), or keeping a 4 because it beats 3.5 rather than comparing with V itself.",
    fastPath: "Keep 5 or 6: average 5.5, three rolls expected, fees 0.75. Value 4.75.",
    variation: "The fee drops to 10 cents per roll. Optimal rule and value?",
    variationAnswer: String.raw`Keep only a 6: $\frac16 V = -0.1 + 1$, so $V = 5.4$; check $5 < 5.4 \le 6$. Keeping 5 and 6 would give $V = 3(-0.1 + 11/6) = 5.2$, lower.`,
    family: "dice-reroll",
    verifiedBy: ["dp", "exhaustive-search", "simulation"],
  },
  {
    id: "m7-p21",
    module: 7,
    kind: "practice",
    difficulty: 4,
    tags: ["poker", "games"],
    minutes: 5,
    title: "How often to call with the middle signal",
    prompt: String.raw`Ann and Ben play the one-round signalling game: each puts \$2 in the pot; from three cards High, Mid and Low each is dealt one at random (all six deals of two different cards equally likely), seeing only their own. Ann may check or bet \$1. On a check the higher card takes the pot. On a bet, Ben may fold (Ann takes the pot) or call \$1, after which the higher card takes everything. Ann bets with High, checks with Mid, and may bluff with Low. Ben calls with High, folds with Low, and calls with Mid with some probability $c$. What value of $c$ makes Ann exactly indifferent between bluffing and checking when she holds Low?`,
    answer: { type: "numeric", value: 3 / 5, exact: String.raw`c = \tfrac{3}{5} = 0.6` },
    hints: [
      "Holding Low, Ann faces High or Mid with equal probability. Against High a bluff is always called and loses the extra dollar.",
      "Against Mid a bluff loses the extra dollar when called (probability c) and wins Ben's 2-dollar ante when he folds.",
      "Compare with checking, which loses Ann's 2-dollar ante for sure: -2 = (1/2)(-3) + (1/2)(-3c + 2(1 - c)). Solve for c.",
    ],
    solution: String.raw`Measure everything as Ann's net result for the hand, antes included. Holding Low, Ann is beaten by either card Ben can have, so if she checks she loses her \$2 ante: net $-2$.

If she bluffs, two cases are equally likely. Ben holds High (probability $\frac12$): he always calls, cards are shown, Ann loses ante plus bet, net $-3$. Ben holds Mid (probability $\frac12$): he calls with probability $c$ (net $-3$ for Ann) and folds with probability $1 - c$, in which case Ann takes the pot and her net is $+2$ (Ben's ante; her own bet returns to her).

Bluff value: $\frac12(-3) + \frac12\big(c(-3) + (1 - c)(2)\big) = -\frac32 + \frac12(2 - 5c) = -\frac12 - \frac52 c$.

Indifference with checking: $-\frac12 - \frac52 c = -2$, so $\frac52 c = \frac32$ and $c = \frac35$. If Ben called less often than 60% of the time with Mid, Ann's Low would profit from bluffing every time; if he called more often, she should never bluff. Calling with exactly $c = 0.6$ removes any incentive either way, which is what an equilibrium strategy must do. A useful cross-check: a bluff risks 1 to win the 2 in antes against Mid, but half the time it runs into High and loses regardless, which is why Ben can afford to fold 40% of the time rather than the 20% (fold $\frac{\text{bet}}{\text{pot} + \text{bet}} = \frac15$ of the time) that would make a bluff break even if Mid were the only hand it could run into.

The verifier confirms $c$ by searching for the calling frequency at which Ben's best guaranteed outcome against an optimising Ann is reached, which is exactly where Ann's Low is indifferent. Answer: $c = \frac35 = 0.6$.`,
    steps: [
      "Check with Low loses the ante: net -2.",
      "Bluff vs High: always called, net -3.",
      "Bluff vs Mid: -3 when called (prob c), +2 when Ben folds.",
      "Set bluff value equal to -2 and solve: c = 3/5.",
    ],
    keyIdea: "The defender's mixed strategy is set to make the attacker's bluff exactly break even against checking.",
    commonMistake: "Forgetting that half of Ann's bluffs run into High and are always called: solving -3c + 2(1 - c) = -2 as if Mid were the only hand Ben could hold gives c = 4/5 instead of 3/5.",
    fastPath: "Bluff value is -1/2 - 2.5c; set equal to -2: c = 0.6.",
    variation: "Antes are 1 dollar each (pot 2) and the bet is 1 dollar. Ben's indifference calling frequency with Mid?",
    variationAnswer: String.raw`Check loses 1; bluff gives $\frac12(-2) + \frac12(-2c + (1 - c)) = -\frac12 - \frac32 c$; equate to $-1$: $c = \frac13$.`,
    family: "indifference",
    verifiedBy: ["formula", "exhaustive-search"],
  },
  {
    id: "m7-p22",
    module: 7,
    kind: "practice",
    difficulty: 4,
    tags: ["kelly", "expectation"],
    minutes: 5,
    title: "Growth rate at full Kelly with 3-to-1 odds",
    prompt: String.raw`A repeatable bet wins with probability $0.3$ and pays 3 dollars of profit per dollar staked when it wins (the stake is lost otherwise). You stake the Kelly fraction of your bankroll on every play. What is the resulting long-run growth rate, defined as the expected natural log of the bankroll multiplier per bet? Give the exact expression or its decimal value.`,
    answer: {
      type: "numeric",
      value: 0.3 * Math.log(6 / 5) + 0.7 * Math.log(14 / 15),
      exact: String.raw`f^* = \tfrac{1}{15},\quad g^* = 0.3\ln\tfrac{6}{5} + 0.7\ln\tfrac{14}{15} \approx 0.00640`,
    },
    hints: [
      "First find the Kelly fraction f = p - q/b with p = 0.3, q = 0.7, b = 3.",
      "f = 0.3 - 0.7/3 = 1/15. Then the multipliers are 1 + 3f = 6/5 on a win and 1 - f = 14/15 on a loss.",
      "g = 0.3 ln(6/5) + 0.7 ln(14/15). Evaluate: about 0.0547 - 0.0483.",
    ],
    solution: String.raw`The edge per dollar staked is $pb - q = 0.9 - 0.7 = 0.2$, so the bet is favourable but only modestly so given how often it loses. The Kelly fraction is edge over odds: $f^* = \frac{pb - q}{b} = p - \frac{q}{b} = 0.3 - \frac{0.7}{3} = \frac{9 - 7}{30} = \frac{1}{15}$. You stake one fifteenth of the bankroll each time.

On a win the bankroll is multiplied by $1 + 3f^* = 1 + \frac{3}{15} = \frac{6}{5}$; on a loss by $1 - f^* = \frac{14}{15}$. The growth rate is the expected log multiplier: $g^* = 0.3\ln\frac65 + 0.7\ln\frac{14}{15}$.

Numerically, $\ln\frac65 \approx 0.18232$ and $\ln\frac{14}{15} \approx -0.06899$, so $g^* \approx 0.054696 - 0.048295 = 0.00640$. The bankroll grows by about $0.64\%$ per bet in log terms, roughly doubling every $\ln 2 / 0.0064 \approx 108$ bets. That is slow for a bet with a 20% edge, which is the price of a 70% loss frequency: a large edge in expectation translates to a small growth rate when wins are rare and the fraction must stay small.

For comparison, the arithmetic expected return per bet at this stake is $f^*(pb - q) = \frac{0.2}{15} \approx 0.0133$, about twice the growth rate; the gap is the variance drag that the log captures and the mean ignores. The verifier locates the maximum of the growth curve numerically, evaluates the growth there, and also computes the expected log of the bankroll after 16 bets by enumerating all $2^{16}$ win-loss sequences and dividing by 16. Answer: $0.3\ln\frac65 + 0.7\ln\frac{14}{15} \approx 0.00640$.`,
    steps: [
      "Kelly fraction f = p - q/b = 0.3 - 0.7/3 = 1/15.",
      "Multipliers: 6/5 on a win, 14/15 on a loss.",
      "g = 0.3 ln(6/5) + 0.7 ln(14/15).",
      "Evaluate: about 0.0064 per bet.",
    ],
    keyIdea: "Find the Kelly fraction first, then plug it into g(f) = p ln(1 + bf) + q ln(1 - f); the growth rate is the expected log multiplier.",
    commonMistake: "Reporting the edge (0.2) or the arithmetic expected return per bet (0.2 f = 0.0133) as the growth rate; growth is an expected log, and it is smaller.",
    fastPath: "f = 1/15. Then 0.3 ln 1.2 is about 0.0547 and 0.7 ln(0.9333) is about -0.0483: g is about 0.0064.",
    variation: "You stake half Kelly, f = 1/30. Growth rate?",
    variationAnswer: String.raw`$0.3\ln\frac{11}{10} + 0.7\ln\frac{29}{30} \approx 0.028593 - 0.023731 = 0.00486$, about 76% of the full-Kelly growth with a quarter of the variance in log wealth.`,
    family: "kelly",
    verifiedBy: ["formula", "exhaustive-search", "enumeration"],
  },
  {
    id: "m7-p23",
    module: 7,
    kind: "practice",
    difficulty: 4,
    tags: ["stopping", "dice", "backward-induction"],
    minutes: 5,
    title: "Three rolls with a bust face",
    prompt: String.raw`You may roll a fair six-sided die up to three times. After any roll you may stop and be paid the face shown, in dollars. But if any roll shows a 1, the game ends at once and you are paid nothing. If you take the third roll you must accept its result (a 1 still pays nothing). Playing optimally, what is the expected payout?`,
    answer: { type: "numeric", value: 100 / 27, exact: String.raw`V_3 = \tfrac{1}{6}\left(0 + 2\cdot\tfrac{65}{18} + 4 + 5 + 6\right) = \tfrac{100}{27} \approx 3.704`, unit: "dollars" },
    hints: [
      "A forced final roll is worth (0 + 2 + 3 + 4 + 5 + 6)/6 = 10/3, because the 1 pays nothing.",
      "With two rolls left, keep a face above 10/3 (so keep 4, 5, 6), continue on 2 or 3, and a 1 busts: V2 = (0 + 2(10/3) + 15)/6 = 65/18.",
      "With three rolls left, the continuation value is 65/18 = 3.61; keep 4, 5, 6 again and continue on 2 or 3.",
    ],
    solution: String.raw`Work backwards with the bust rule folded into the payoffs. With one roll left you must take it: faces $2$ to $6$ pay themselves and a $1$ pays zero, so $V_1 = \frac{0 + 2 + 3 + 4 + 5 + 6}{6} = \frac{20}{6} = \frac{10}{3} \approx 3.33$.

With two rolls left, you roll. A $1$ ends the game with nothing. Otherwise compare the face with the continuation value $V_1 = \frac{10}{3}$: keep $4, 5, 6$, continue on $2$ or $3$. So $V_2 = \frac16\left(0 + \frac{10}{3} + \frac{10}{3} + 4 + 5 + 6\right) = \frac16\left(\frac{20}{3} + 15\right) = \frac16\cdot\frac{65}{3} = \frac{65}{18} \approx 3.61$.

With three rolls left the continuation value is $V_2 = \frac{65}{18}$. A $4$ still beats it ($4 > 3.61$) and a $3$ still does not, so the keep-set is again $\{4, 5, 6\}$, with $2$ and $3$ rerolled and $1$ a bust. $V_3 = \frac16\left(0 + 2\cdot\frac{65}{18} + 15\right) = \frac16\left(\frac{65}{9} + \frac{135}{9}\right) = \frac16\cdot\frac{200}{9} = \frac{200}{54} = \frac{100}{27}$.

The bust face does two things: it lowers every stage value by removing the 1 from the average, and it makes continuing risky, which keeps the threshold at 4 even with three rolls (without the bust rule you would reroll a 4 on the first roll, see the plain three-roll game worth $14/3$). The verifier confirms the strategy by comparing all pairs of keep-sets for the first two rolls and by simulation. Answer: $\frac{100}{27} \approx 3.704$ dollars.`,
    steps: [
      "V1 = 10/3: a forced roll with the 1 paying zero.",
      "V2: bust on 1, continue on 2 and 3, keep 4 to 6: 65/18.",
      "V3: same keep-set since 4 > 65/18 > 3: (2(65/18) + 15)/6.",
      "Simplify to 100/27.",
    ],
    keyIdea: "Fold terminal penalties into the stage values and compare each face with the continuation value, which already prices the risk of busting.",
    commonMistake: "Treating the 1 as 'reroll' instead of 'bust', or keeping the plain-game thresholds (reroll a 4 with three rolls left) without recomputing the continuation values.",
    fastPath: "10/3, then (20/3 + 15)/6 = 65/18, then (65/9 + 15)/6 = 100/27.",
    variation: "A 1 no longer busts but pays nothing and lets you continue if rolls remain. Value with three rolls?",
    variationAnswer: String.raw`Now a 1 is just a bad face you reroll. $V_1 = 10/3$; $V_2 = \frac16(3\cdot\frac{10}{3} + 15) = \frac{25}{6}$; $V_3 = \frac16(4\cdot\frac{25}{6} + 11) = \frac{83}{18} \approx 4.61$ (keep only 5 and 6 on the first roll since $4 < 25/6$).`,
    family: "dice-reroll",
    verifiedBy: ["dp", "exhaustive-search", "simulation"],
  },

  // ---------------------------------------------------------------- difficulty 5
  {
    id: "m7-p24",
    module: 7,
    kind: "practice",
    difficulty: 5,
    tags: ["games", "dice", "stopping", "backward-induction"],
    minutes: 7,
    title: "Reroll duel with the rival moving second",
    prompt: String.raw`You and a rival each end up with one die score; the higher score wins, and ties go to the rival. You go first: roll a fair six-sided die, then either keep the face or reroll once (you must keep the second roll). Your final score is announced. The rival then rolls a fair die and may likewise keep or reroll once. Both of you play to maximise your own probability of winning. What is your probability of winning?`,
    answer: { type: "numeric", value: 233 / 648, exact: String.raw`\tfrac{1}{6}\left(\tfrac{16}{36} + \tfrac{25}{36}\right) + \tfrac{4}{6}\cdot\tfrac{55}{216} = \tfrac{233}{648} \approx 0.360` },
    hints: [
      "Solve the rival's problem first. Facing your final score s, he keeps a first roll of s or more (he wins ties) and rerolls anything lower.",
      "So you win against score s only if both of his rolls are below s: probability ((s - 1)/6)^2.",
      "Your reroll is worth the average of ((s - 1)/6)^2 over s, which is 55/216. Keep a first roll whose win probability beats that; then average.",
    ],
    solution: String.raw`Backward induction, starting with the rival. Suppose your final score is $s$. The rival wins with any final score of at least $s$ (ties go to him). If his first roll is $s$ or more he keeps it and wins outright. If it is below $s$, keeping would lose for certain, so he rerolls and wins if the second roll is at least $s$. You therefore win only when both of his rolls are below $s$: $w(s) = \left(\frac{s - 1}{6}\right)^2$. The table: $w(1) = 0$, $w(2) = \frac{1}{36}$, $w(3) = \frac{4}{36}$, $w(4) = \frac{9}{36}$, $w(5) = \frac{16}{36}$, $w(6) = \frac{25}{36}$.

Now your decision. If you reroll, your final score is a fresh roll and your win probability is the average of $w$: $\frac{0 + 1 + 4 + 9 + 16 + 25}{216} = \frac{55}{216} \approx 0.2546$. That is your continuation value. Keep a first roll $x$ when $w(x) \ge \frac{55}{216}$. A $4$ gives $\frac{9}{36} = 0.25$, just *below* $0.2546$, so you reroll a 4; a $5$ gives $0.444$, keep. Keep-set: $\{5, 6\}$.

Your win probability: $\frac16\left(\frac{16}{36} + \frac{25}{36}\right) + \frac46\cdot\frac{55}{216} = \frac{41}{216} + \frac{220}{1296} = \frac{246 + 220}{1296} = \frac{466}{1296} = \frac{233}{648}$.

So the first mover wins only about $36\%$ of the time. Moving second is worth a lot here: the rival sees the target, wins ties, and never wastes a reroll. Note the trap at $x = 4$: in the one-player reroll game a 4 is a keeper, but here the relevant comparison is win probability, not expected face, and $0.25 < 0.2546$ flips the decision. The verifier checks all 64 possible keep-sets for you with the rival best-responding, and simulates the duel a million times. Answer: $\frac{233}{648} \approx 0.360$.`,
    steps: [
      "Rival keeps any roll at or above your score s, else rerolls: you win with ((s - 1)/6)^2.",
      "Your reroll value is the average of those: 55/216.",
      "Keep x only if ((x - 1)/6)^2 >= 55/216: keep 5, 6 (a 4 is 0.25, below 0.2546).",
      "Average: (41/216) + (4/6)(55/216) = 233/648.",
    ],
    keyIdea: "Solve the second mover's best response as a function of the announced score, then optimise the first mover's stopping rule against that function, comparing win probabilities rather than expected faces.",
    commonMistake: "Keeping a 4 by analogy with the one-player game, or letting the rival keep only strictly higher rolls when ties go to him.",
    fastPath: "Win vs s is ((s - 1)/6)^2; reroll value 55/216 = 0.2546; keep 5 or 6; (41 + 110/3)/216 = 233/648.",
    variation: "Ties now go to you, the first mover. Your win probability under optimal play?",
    variationAnswer: String.raw`Rival must strictly beat s: you win with $(s/6)^2$, reroll value $\frac{91}{216} \approx 0.421$. Keep 4, 5, 6 ($\frac{16}{36} = 0.444 > 0.421$). Probability $\frac16\left(\frac{16 + 25 + 36}{36}\right) + \frac36\cdot\frac{91}{216} = \frac{77}{216} + \frac{91}{432} = \frac{245}{432} \approx 0.567$.`,
    family: "dice-reroll",
    verifiedBy: ["dp", "exhaustive-search", "simulation"],
  },
  {
    id: "m7-p25",
    module: 7,
    kind: "practice",
    difficulty: 5,
    tags: ["poker", "games", "expectation"],
    minutes: 8,
    title: "Value of the signalling game",
    prompt: String.raw`Ann and Ben play the one-round signalling game: each puts \$2 in the pot; from three cards High, Mid and Low each is dealt one at random (all six deals of two different cards equally likely), seeing only their own card. Ann may check or bet \$1. On a check the higher card takes the pot. On a bet, Ben may fold (Ann takes the pot, keeping her bet) or call \$1, after which the higher card takes everything. Both players may randomise. Under optimal play by both, what is Ann's expected net gain per hand, in dollars (antes included)?`,
    answer: { type: "numeric", value: 1 / 10, exact: String.raw`\tfrac{1}{6}\left(\tfrac{13}{5} + 2 - 2 + 2 - \tfrac{11}{5} - \tfrac{9}{5}\right) = \tfrac{1}{6}\cdot\tfrac{3}{5} = \tfrac{1}{10}`, unit: "dollars" },
    hints: [
      "Find the equilibrium first. Ann always bets High and never bets Mid (betting Mid only gets called by High and folded by Low). Ben always calls with High and folds Low.",
      "The mixed parts: Ann bluffs Low with probability 1/5 (Ben's Mid indifferent) and Ben calls Mid with probability 3/5 (Ann's Low indifferent).",
      "Compute Ann's net result for each of the six deals under these strategies and average.",
    ],
    solution: String.raw`First pin down the equilibrium. Betting with High can only help Ann: Ben's Low folds, which wins the same pot a check would have won, and a call from Ben's Mid adds a dollar. So she always bets High. Betting with Mid is dominated: Ben's High always calls and wins an extra dollar, Ben's Low always folds and Ann wins the same pot she would have won by checking. So Ann checks Mid. Ben with High never folds, and Ben with Low never calls (a call can only lose). The two decisions that remain are mixed: Ann's bluffing probability $\beta$ with Low and Ben's calling probability $c$ with Mid.

Ben's Mid must be indifferent to calling: facing a bet, Ann has Low with probability $\frac{\beta}{1 + \beta}$; a call gains 5 against a bluff and loses 1 against High, so $5\beta = 1$, $\beta = \frac15$. Ann's Low must be indifferent to bluffing: checking nets $-2$; bluffing nets $\frac12(-3) + \frac12\big(-3c + 2(1 - c)\big) = -\frac12 - \frac52 c$; equality gives $c = \frac35$.

Now Ann's net result deal by deal (each deal has probability $\frac16$; Ann's card is listed first). High vs Mid: Ann bets, Ben calls $\frac35$ of the time (Ann nets $+3$: Ben's ante and call) and folds $\frac25$ (Ann nets $+2$): $\frac95 + \frac45 = \frac{13}{5}$. High vs Low: Ann bets, Ben folds: $+2$. Mid vs High: Ann checks and loses her ante: $-2$. Mid vs Low: check, Ann wins Ben's ante: $+2$. Low vs High: Ann bluffs $\frac15$ (called, $-3$) or checks $\frac45$ ($-2$): $-\frac35 - \frac85 = -\frac{11}{5}$. Low vs Mid: bluff $\frac15$ (called $\frac35$: $-3$; folded $\frac25$: $+2$, worth $-\frac95 + \frac45 = -1$) or check $\frac45$ ($-2$): $-\frac15 - \frac85 = -\frac95$.

Sum: $\frac{13}{5} + 2 - 2 + 2 - \frac{11}{5} - \frac95 = 2 + \frac{13 - 11 - 9}{5} = 2 - \frac75 = \frac35$. Divide by 6: Ann's expected net gain is $\frac{1}{10}$ dollars per hand.

Acting first with the option to bet is worth 10 cents a hand to Ann at these stakes. The verifier does not trust the derivation: it searches a grid over all of Ann's betting mixtures (one probability per card) with Ben best-responding, and separately over all of Ben's calling mixtures with Ann best-responding. The maximin and minimax both equal $\frac{1}{10}$, which certifies the value. Answer: $\frac{1}{10} = 0.10$ dollars.`,
    steps: [
      "Eliminate dominated actions: Ann bets High, checks Mid; Ben calls High, folds Low.",
      "Indifference for Ben's Mid gives beta = 1/5; indifference for Ann's Low gives c = 3/5.",
      "Tabulate Ann's net result for all six deals under these strategies.",
      "Average: (3/5)/6 = 1/10.",
    ],
    keyIdea: "Remove dominated actions, fix the two mixed probabilities by indifference, then the value is just the average payoff over the deals under those strategies.",
    commonMistake: "Dropping the antes from the payoff (which changes the value) or letting Ann bet Mid, which Ben's High punishes and Ben's Low never pays off.",
    fastPath: "Equilibrium (1/5, 3/5); per-deal nets 13/5, 2, -2, 2, -11/5, -9/5 sum to 3/5; over six deals, 1/10.",
    variation: "Antes 1 dollar each (pot 2) and bet 1 dollar. Value to Ann?",
    variationAnswer: String.raw`Equilibrium $\beta = c = \frac13$. Per-deal nets: $\frac43, 1, -1, 1, -\frac43, -\frac23$, sum $\frac13$, so the value is $\frac{1}{18} \approx 0.056$ dollars.`,
    family: "indifference",
    verifiedBy: ["exhaustive-search", "enumeration"],
  },
  {
    id: "m7-p26",
    module: 7,
    kind: "practice",
    difficulty: 5,
    tags: ["stopping", "games"],
    minutes: 7,
    title: "Six applicants, top two will do",
    prompt: String.raw`Six applicants of distinct quality are interviewed in a uniformly random order. After each interview you learn only how the current applicant ranks among those seen so far. You must hire or reject each applicant on the spot; if you reach the sixth you must hire them. You use a cutoff rule: reject the first $k$ applicants regardless, then hire the first applicant who is better than everyone seen before. You are satisfied if the applicant you hire is either the best or the second best of the six. With the best choice of $k$, what is the probability that you are satisfied?`,
    answer: { type: "numeric", value: 59 / 90, exact: String.raw`\max_k P_k = P_2 = \tfrac{308 + 164}{720} = \tfrac{472}{720} = \tfrac{59}{90} \approx 0.656` },
    hints: [
      "Split the success event: you hire the best, or you hire the second best. The first part is the usual (k/6) times a harmonic tail.",
      "You hire the second best at position j > k only if the best comes after j and the best of the first j - 1 lies in the first k. Add the case where no record appears after k and the last applicant happens to be the second best.",
      "Evaluate k = 1, 2, 3 and compare: k = 2 gives 308/720 for the best plus 164/720 for the second best.",
    ],
    solution: String.raw`Let $n = 6$. The cutoff rule hires the first record (best so far) after position $k$, or the last applicant if no record appears. You succeed if the hired applicant is the best or the second best.

**Hiring the best.** As in the classic analysis, this needs the best at some position $j > k$ with the best of the first $j - 1$ among the first $k$: $P^{(1)}_k = \frac{k}{6}\sum_{j = k + 1}^{6}\frac{1}{j - 1}$. For $k = 2$: $\frac26\left(\frac12 + \frac13 + \frac14 + \frac15\right) = \frac13\cdot\frac{77}{60} = \frac{77}{180} = \frac{308}{720}$.

**Hiring the second best.** Suppose the second best is at position $j > k$. It is hired exactly when it is a record (so the best must come later, probability $\frac{6 - j}{5}$ given the second best is at $j$) and no earlier record occurred after $k$, which, as before, means the best of the first $j - 1$ lies in the first $k$ (probability $\frac{k}{j - 1}$; the best is not among them, and the other applicants are in uniformly random order). So $P^{(2)}_k = \sum_{j = k + 1}^{6}\frac16\cdot\frac{6 - j}{5}\cdot\frac{k}{j - 1} + \frac16\cdot\frac{k}{5}$, where the last term is the fallback: the sixth applicant is hired by default when no record appears after $k$, and is the second best with the best inside the first $k$ (probability $\frac16\cdot\frac{k}{5}$). For $k = 2$: $\frac{2}{30}\left(\frac{3}{2} + \frac{2}{3} + \frac{1}{4} + 0\right) + \frac{2}{30} = \frac{1}{15}\cdot\frac{29}{12} + \frac{1}{15} = \frac{29}{180} + \frac{12}{180} = \frac{41}{180} = \frac{164}{720}$.

**Total for $k = 2$:** $\frac{308 + 164}{720} = \frac{472}{720} = \frac{59}{90} \approx 0.656$. The other cutoffs: $k = 1$ gives $\frac{274 + 178}{720} = \frac{452}{720} \approx 0.628$, $k = 3$ gives $\frac{282 + 138}{720} = \frac{420}{720} \approx 0.583$, and $k = 0$ (hire the first) gives $\frac{240}{720} = \frac13$. So skip two, then take the first record.

Relaxing the goal from 'the best' to 'top two' lifts the success rate from $\frac{77}{180} \approx 0.43$ to about $0.66$ with the same cutoff. The verifier runs every cutoff over all $720$ orderings and simulates the optimal rule. Answer: $\frac{59}{90} \approx 0.656$.`,
    steps: [
      "Split success into hiring the best and hiring the second best.",
      "Best: (k/6) times the harmonic tail; for k = 2 this is 308/720.",
      "Second best at j: needs the best later and the first j - 1's best in the first k; add the default-last case: 164/720 for k = 2.",
      "Compare cutoffs; k = 2 wins with 472/720 = 59/90.",
    ],
    keyIdea: "Decompose the success event by which top candidate is hired, condition on the positions of the top two, and sum; the cutoff rule's structure makes each term a product of simple fractions.",
    commonMistake: "Forgetting the fallback case where the last applicant is hired by default, or assuming the second best is hired whenever it is a record (the best may already have appeared, in which case it is not a record).",
    fastPath: "For k = 2 count orderings: 308 hire the best, 164 hire the second best, 472 of 720.",
    variation: "Same six applicants and rule, but you are satisfied only with the best. Best cutoff and probability?",
    variationAnswer: String.raw`$k = 2$: $\frac{77}{180} \approx 0.428$ ($k = 3$ gives $\frac{47}{120} \approx 0.392$).`,
    family: "secretary",
    verifiedBy: ["exhaustive-search", "formula", "simulation"],
  },

  // ---------------------------------------------------------------- lesson checks
  {
    id: "m7-lc1",
    module: 7,
    kind: "lessonCheck",
    difficulty: 1,
    tags: ["games", "expectation", "dice"],
    minutes: 1,
    title: "Die game with a four-dollar fee",
    prompt: String.raw`A game pays the face of one fair six-sided die in dollars. The entry fee is \$4. What is your expected profit per play, in dollars?`,
    answer: { type: "numeric", value: -1 / 2, exact: String.raw`\tfrac{7}{2} - 4 = -\tfrac{1}{2}`, unit: "dollars" },
    hints: ["Expected payout minus fee.", "The expected face of a fair die is 3.5.", "3.5 - 4."],
    solution: String.raw`The expected payout is the mean face of a fair die, $\frac{1 + 2 + 3 + 4 + 5 + 6}{6} = 3.5$ dollars. The fee is a certain cost of $4$ dollars, so expected profit is $3.5 - 4 = -0.5$ dollars.

The game loses you 50 cents per play on average. Any fee above the fair price of \$3.50 makes the game unfavourable. Answer: $-\frac12$ dollars.`,
    steps: ["Expected payout 3.5.", "Subtract the fee of 4.", "Expected profit -0.5."],
    keyIdea: "Expected profit = expected payout minus the price paid.",
    commonMistake: "Reporting the fair price 3.5 instead of the profit, or forgetting the sign.",
    fastPath: "3.5 minus 4 is -0.5.",
    variation: "What fee would make your expected profit exactly +0.25 dollars?",
    variationAnswer: "A fee of 3.25 dollars.",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m7-lc2",
    module: 7,
    kind: "lessonCheck",
    difficulty: 1,
    tags: ["games", "expectation"],
    minutes: 1,
    title: "Break-even at four to one",
    prompt: String.raw`A bet pays 4 to 1: for each dollar staked you win 4 dollars if it comes off and lose the dollar otherwise. At what win probability does the bet have zero expected profit?`,
    answer: { type: "numeric", value: 1 / 5, exact: String.raw`p^* = \tfrac{1}{4 + 1} = \tfrac{1}{5} = 0.2` },
    hints: ["Set 4p - (1 - p) = 0.", "That is 5p = 1.", "p = 1/5."],
    solution: String.raw`Expected profit per dollar staked is $4p - (1 - p) = 5p - 1$, where $p$ is the win probability. It is zero when $p = \frac15$.

In general a bet paying $b$ to 1 breaks even at $p^* = \frac{1}{b + 1}$: the longer the odds, the smaller the win probability you need. Here any $p$ above 20% makes the bet profitable in expectation. Answer: $\frac15 = 0.2$.`,
    steps: ["Expected profit 4p - (1 - p).", "Set to zero: 5p = 1.", "p = 1/5."],
    keyIdea: "A b-to-1 bet breaks even at p = 1/(b + 1).",
    commonMistake: "Answering 1/4 (ignoring the lost stake in the denominator).",
    fastPath: "One over four-plus-one.",
    variation: "The bet pays 3 to 2 (win 1.5 per dollar). Break-even probability?",
    variationAnswer: String.raw`$\frac{1}{1.5 + 1} = \frac{2}{5}$.`,
    verifiedBy: ["formula", "exhaustive-search"],
  },
  {
    id: "m7-lc3",
    module: 7,
    kind: "lessonCheck",
    difficulty: 2,
    tags: ["backward-induction", "games"],
    minutes: 1,
    title: "Seven chips, first or second",
    prompt: String.raw`A pile has 7 chips. Players alternate removing 1 or 2 chips, and whoever takes the last chip wins. Would you rather move first or second, and if first, how many chips do you take?`,
    answer: {
      type: "choice",
      options: ["Move first and take 1 chip.", "Move first and take 2 chips.", "Move second; the first player cannot force a win.", "It makes no difference; the game is a draw with best play."],
      correct: 0,
    },
    hints: ["Label 0 as losing for the player to move, then 1 and 2 as winning, 3 as losing.", "Losing piles are the multiples of 3.", "From 7, leave the opponent a multiple of 3."],
    solution: String.raw`Label piles for the player about to move. A pile of $0$ is losing (the previous player took the last chip). Piles $1$ and $2$ are winning (take everything). Pile $3$ is losing: both moves leave a winning pile. Then $4$ and $5$ are winning (reach 3), $6$ is losing, and so on: the losing piles are exactly the multiples of $3$.

From $7$ you want to leave a multiple of $3$. Taking 1 leaves $6$, a losing pile for the opponent; taking 2 leaves $5$, a winning one. So move first and take 1, then always restore a multiple of 3. Correct choice: move first and take 1.`,
    steps: ["Losing piles are multiples of 3.", "7 is not a multiple of 3, so the first mover wins.", "Take 1 to leave 6."],
    keyIdea: "With moves 1 and 2 the losing piles are the multiples of 3; move to one of them.",
    commonMistake: "Taking 2 to leave 5, which lets the opponent move to 3.",
    fastPath: "7 mod 3 is 1: take 1.",
    variation: "Pile of 9 chips, same rules. First or second?",
    variationAnswer: "9 is a multiple of 3, so move second and mirror to keep the pile a multiple of 3.",
    family: "backward-induction",
    verifiedBy: ["dp", "exhaustive-search"],
  },
  {
    id: "m7-lc4",
    module: 7,
    kind: "lessonCheck",
    difficulty: 2,
    tags: ["kelly"],
    minutes: 1,
    title: "Kelly on a 55% coin",
    prompt: String.raw`An even-money bet (win one dollar per dollar staked, or lose the stake) wins with probability $0.55$. What fraction of your bankroll should you stake each time to maximise the long-run growth rate?`,
    answer: { type: "numeric", value: 0.55 - 0.45, exact: String.raw`f^* = p - q = 0.55 - 0.45 = 0.10` },
    hints: ["For even money the Kelly fraction is p - q.", "q = 1 - 0.55 = 0.45.", "0.55 - 0.45."],
    solution: String.raw`For an even-money bet the growth rate is $g(f) = p\ln(1 + f) + q\ln(1 - f)$, and setting $g'(f) = 0$ gives $\frac{p}{1 + f} = \frac{q}{1 - f}$, so $f^* = p - q$.

With $p = 0.55$ and $q = 0.45$, $f^* = 0.10$: stake 10% of the bankroll. Betting twice that, 20%, gives roughly zero growth; more than that loses money in the long run despite the edge. Answer: $0.10$.`,
    steps: ["Even money: f* = p - q.", "p - q = 0.55 - 0.45.", "Stake 10%."],
    keyIdea: "Even-money Kelly fraction is the edge p - q.",
    commonMistake: "Staking the win probability (55%) or the edge over total (0.1/2).",
    fastPath: "Fifty-five minus forty-five: ten percent.",
    variation: "The bet now pays 2 to 1 with the same 55% win probability. Kelly fraction?",
    variationAnswer: String.raw`$f^* = 0.55 - \frac{0.45}{2} = 0.325$.`,
    family: "kelly",
    verifiedBy: ["formula", "exhaustive-search"],
  },
];
