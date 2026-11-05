import type { Problem } from "../types";

/**
 * Module 8: Market-making and estimation.
 * 24 practice problems (d1: 4, d2: 6, d3: 8, d4: 4, d5: 2) and four lesson checks.
 * Quoting drills, expected value of contracts, options intuition, Fermi estimation and
 * adverse selection. Every answer is confirmed independently in content/verify/m8.ts.
 */
export const problems: Problem[] = [
  // ---------------------------------------------------------------- difficulty 1
  {
    id: "m8-p01",
    module: 8,
    kind: "practice",
    difficulty: 1,
    tags: ["market-making", "dice", "conditional", "expectation"],
    minutes: 1,
    title: "Three dice, one revealed",
    prompt: String.raw`An interviewer is about to roll three fair six-sided dice behind a screen. Before the roll you point at one of the dice; after the roll only that die is shown to you, and it reads 5. The other two stay hidden. A contract pays the total of the three dice in dollars. What is your fair value for the contract, in dollars?`,
    answer: { type: "numeric", value: 12, exact: String.raw`5 + 3.5 + 3.5 = 12` },
    hints: [
      "Fair value is the expected payout given what you know. Which parts of the total are still random?",
      "The revealed die contributes exactly 5. Each hidden die is still a fair die.",
      "Add 5 to twice the mean of one fair die.",
    ],
    solution: String.raw`Fair value is a conditional expectation: the expected payout given everything you have seen. The die you chose was fixed before the roll, so seeing it tells you nothing about the other two; they are still independent fair dice.

The total is $5 + X_2 + X_3$ where $X_2, X_3$ are the hidden dice. By linearity, $E[\text{total} \mid \text{shown die} = 5] = 5 + E[X_2] + E[X_3] = 5 + 3.5 + 3.5 = 12$.

A quote around this value would be, for example, 11.5 bid and 12.5 offer. Note that the mean of one fair die is $\frac{1 + 2 + \cdots + 6}{6} = 3.5$. Answer: $12$.`,
    steps: [
      "Recognise fair value as the conditional expectation given the revealed die.",
      "Split the total into the known die plus two independent fair dice.",
      "Add 5 to 3.5 + 3.5 to get 12.",
    ],
    keyIdea: "Fair value is the expected payout conditional on what you have observed; known parts are constants, unknown parts keep their means.",
    commonMistake: String.raw`Quoting the unconditional mean 10.5, forgetting the revealed die; or treating the shown die as if it were the largest, which it is not, since you chose it before the roll.`,
    fastPath: "Five plus seven. Say 12 and quote 11.5 at 12.5.",
    variation: "The interviewer instead rolls all three and shows you the highest die, which reads 5. Is your fair value still 12?",
    variationAnswer: String.raw`No. Now the other two dice are known to be at most 5. There are $5^3 - 4^3 = 61$ triples with maximum 5, and their totals add to $125 \cdot 9 - 64 \cdot 7.5 = 645$, so the fair value is $\tfrac{645}{61} \approx 10.57$, well below 12. Selection changes the conditioning.`,
    family: "market-making",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m8-p02",
    module: 8,
    kind: "practice",
    difficulty: 1,
    tags: ["market-making", "coins", "conditional", "expectation"],
    minutes: 1,
    title: "Heads count, four flips in",
    prompt: String.raw`A fair coin will be flipped 10 times and a contract pays 1 dollar for every head. The first four flips have already landed: heads, tails, heads, heads. Six flips remain. What is your fair value for the contract now, in dollars?`,
    answer: { type: "numeric", value: 6, exact: String.raw`3 + 6 \cdot \tfrac{1}{2} = 6` },
    hints: [
      "Count the heads already banked, then think about the flips still to come.",
      "Three heads are certain. The remaining six flips are independent of the past.",
      "Add 3 to the expected number of heads in six fair flips.",
    ],
    solution: String.raw`Three heads are already on the board, so the payout is at least 3 dollars. The remaining six flips are independent fair coins, so their expected contribution is $6 \cdot \frac{1}{2} = 3$.

By linearity of expectation the fair value is $3 + 3 = 6$ dollars. The coin has no memory: three heads in four does not make tails "due", and it does not make heads "hot".

Before any flips the fair value was $10 \cdot \frac{1}{2} = 5$; the first four flips moved it up by one because they produced one more head than expected. Answer: $6$.`,
    steps: [
      "Bank the three heads already seen.",
      "Treat the six remaining flips as independent fair coins.",
      "Add 3 to 6 times one half.",
    ],
    keyIdea: "Known outcomes become constants; the rest of the contract is repriced at its unconditional mean.",
    commonMistake: String.raw`Answering 5 (the unconditional mean) or 7 (extrapolating the observed 75% heads rate to the remaining flips).`,
    fastPath: "Three seen plus three expected equals six.",
    variation: "The same contract, but the coin is known to land heads with probability 0.6. Fair value after the same first four flips?",
    variationAnswer: String.raw`$3 + 6 \cdot 0.6 = 6.6$ dollars.`,
    family: "market-making",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m8-p03",
    module: 8,
    kind: "practice",
    difficulty: 1,
    tags: ["options"],
    minutes: 1,
    title: "Two options at expiry",
    prompt: String.raw`At expiry the underlying settles at 112. You hold one European call with strike 105 and one European put with strike 120, both on one unit of the underlying and both expiring right now. What is the total payoff of your two options, in dollars?`,
    answer: { type: "numeric", value: 15, exact: String.raw`(112 - 105) + (120 - 112) = 7 + 8 = 15` },
    hints: [
      "Write down the payoff formula for a call and for a put at expiry.",
      String.raw`Call pays $\max(S - K, 0)$, put pays $\max(K - S, 0)$. Plug in $S = 112$ for each.`,
      "7 from the call plus 8 from the put.",
    ],
    solution: String.raw`A call gives the right to buy at the strike, so at expiry it is worth $\max(S - K, 0)$: positive only when the underlying finishes above the strike. A put gives the right to sell at the strike and is worth $\max(K - S, 0)$.

With $S = 112$: the 105 call pays $112 - 105 = 7$, since buying at 105 something worth 112 gains 7. The 120 put pays $120 - 112 = 8$, since selling at 120 something worth 112 gains 8.

Both options finish in the money here because the put's strike is above the call's strike and the price landed between them. The total payoff is $7 + 8 = 15$ dollars.`,
    steps: [
      "Call payoff: max(S minus K, 0).",
      "Put payoff: max(K minus S, 0).",
      "Evaluate both at S = 112 and add.",
    ],
    keyIdea: "At expiry an option is worth its intrinsic value: the gain from exercising, or zero.",
    commonMistake: "Giving the put a negative payoff or forgetting that an option can never be worth less than zero at expiry.",
    fastPath: "Call: 112 minus 105 is 7. Put: 120 minus 112 is 8. Fifteen.",
    variation: "Same two options, but the underlying settles at 125. Total payoff?",
    variationAnswer: String.raw`Call pays $125 - 105 = 20$, put pays $\max(120 - 125, 0) = 0$. Total 20.`,
    verifiedBy: ["formula"],
  },
  {
    id: "m8-p04",
    module: 8,
    kind: "practice",
    difficulty: 1,
    tags: ["expectation", "market-making"],
    minutes: 1,
    title: "A rain contract",
    prompt: String.raw`A binary contract pays 100 dollars if it rains at the airport tomorrow and 0 otherwise. Take the probability of rain to be exactly 0.35 and ignore interest. At what price, in dollars, is the expected profit from buying the contract zero? (That price is its fair value.)`,
    answer: { type: "numeric", value: 35, exact: String.raw`100 \cdot 0.35 = 35` },
    hints: [
      "Expected payout is probability times payout.",
      "Buying at price P gives expected profit 100 times 0.35 minus P.",
      "Set that to zero.",
    ],
    solution: String.raw`The payout is a Bernoulli variable scaled by 100: it is 100 with probability 0.35 and 0 with probability 0.65. Its expectation is $100 \cdot 0.35 + 0 \cdot 0.65 = 35$ dollars.

If you pay $P$ for the contract your expected profit is $35 - P$, which is zero exactly when $P = 35$. Below 35 you expect to make money buying; above 35 you expect to make money selling. That is why 35 is the fair value, and a market maker would quote around it, say 33 bid and 37 offer.

A binary contract is the simplest contract there is: its fair value in dollars is just 100 times the probability, so a market on the contract is a market on the probability itself. Answer: $35$.`,
    steps: [
      "Identify the payout as 100 times an indicator.",
      "Expected payout is 100 times the probability.",
      "Fair price equals that expectation: 35.",
    ],
    keyIdea: "The fair value of a binary contract is the payout times the probability; quoting it is quoting a probability.",
    commonMistake: "Quoting the probability (0.35) instead of the dollar value (35), or adding a spread into the fair value itself.",
    fastPath: "Thirty-five percent of a hundred.",
    variation: "The contract instead pays 100 if it rains on at least one of the next two days, each day raining independently with probability 0.35. Fair value?",
    variationAnswer: String.raw`$100 \cdot (1 - 0.65^2) = 100 \cdot 0.5775 = 57.75$ dollars.`,
    verifiedBy: ["formula", "simulation"],
  },

  // ---------------------------------------------------------------- difficulty 2
  {
    id: "m8-p05",
    module: 8,
    kind: "practice",
    difficulty: 2,
    tags: ["expectation", "dice"],
    minutes: 2,
    title: "Paid the square of the roll",
    prompt: String.raw`A contract pays, in dollars, the square of the number shown by one fair six-sided die: a 1 pays 1, a 2 pays 4, and so on up to a 6 paying 36. What is the fair value of the contract, in dollars?`,
    answer: { type: "numeric", value: 91 / 6, exact: String.raw`\frac{1 + 4 + 9 + 16 + 25 + 36}{6} = \frac{91}{6} \approx 15.17` },
    hints: [
      "Fair value is the expected payout. List the six payouts.",
      "Each face has probability one sixth. Add the squares 1 through 36.",
      "The squares sum to 91; divide by 6.",
    ],
    solution: String.raw`Each face shows with probability $\frac{1}{6}$, so the expected payout is the average of the six payouts: $E[X^2] = \frac{1^2 + 2^2 + 3^2 + 4^2 + 5^2 + 6^2}{6} = \frac{91}{6} \approx 15.17$ dollars.

A second route uses $E[X^2] = \operatorname{Var}(X) + (E[X])^2$. For a fair die, $E[X] = 3.5$ and $\operatorname{Var}(X) = \frac{35}{12}$, so $E[X^2] = \frac{35}{12} + \frac{49}{4} = \frac{35 + 147}{12} = \frac{182}{12} = \frac{91}{6}$.

Notice that $\frac{91}{6} \approx 15.17$ is well above $(3.5)^2 = 12.25$: squaring is convex, so the expectation of the square exceeds the square of the expectation. That gap is exactly the variance. Answer: $\frac{91}{6} \approx 15.17$.`,
    steps: [
      "Write the payout as a function of the face: X squared.",
      "Average the six values 1, 4, 9, 16, 25, 36.",
      "Divide 91 by 6.",
      "Cross-check with variance plus mean squared.",
    ],
    keyIdea: "Price a contract by averaging its payout over the outcomes; a convex payout is worth more than the payout at the mean.",
    commonMistake: String.raw`Squaring the mean: $3.5^2 = 12.25$ understates the value by the variance of the die.`,
    fastPath: "Squares one to six sum to 91. Ninety-one over six is a bit over 15.",
    variation: "The contract instead pays the square of the sum of two fair dice. Fair value?",
    variationAnswer: String.raw`$E[S^2] = \operatorname{Var}(S) + 49 = \tfrac{35}{6} + 49 = \tfrac{329}{6} \approx 54.83$ dollars.`,
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m8-p06",
    module: 8,
    kind: "practice",
    difficulty: 2,
    tags: ["market-making", "cards", "conditional", "expectation"],
    minutes: 3,
    title: "Three cards, one turned over",
    prompt: String.raw`Three cards are dealt face down from a well-shuffled standard 52-card deck. Card values are ace = 1, two through ten at face value, jack = 11, queen = 12, king = 13. A contract pays the total value of the three cards in dollars. The leftmost card, designated before the deal as the one to be revealed, is turned over: it is a 9. What is your fair value for the contract now, in dollars?`,
    answer: {
      type: "numeric",
      value: 9 + (2 * 355) / 51,
      exact: String.raw`9 + 2 \cdot \frac{364 - 9}{51} = \frac{1169}{51} \approx 22.92`,
    },
    hints: [
      "The revealed card is a constant. The two hidden cards are a random draw from the remaining 51.",
      "The whole deck's values sum to 4 times (1 + 2 + ... + 13) = 364. Remove the 9.",
      "Each hidden card has mean 355/51; add twice that to 9.",
    ],
    solution: String.raw`The leftmost card was designated before the deal, so revealing it carries no selection effect: the other two cards are simply a uniformly random pair from the 51 cards that remain.

The full deck's values add to $4(1 + 2 + \cdots + 13) = 4 \cdot 91 = 364$. Removing the 9 leaves 51 cards with total value $355$, so each hidden card has conditional mean $\frac{355}{51}$. The two hidden cards are not independent (they are drawn without replacement), but linearity does not care: $E[\text{hidden pair}] = 2 \cdot \frac{355}{51} = \frac{710}{51}$.

Fair value $= 9 + \frac{710}{51} = \frac{459 + 710}{51} = \frac{1169}{51} \approx 22.92$ dollars. For comparison, before the reveal the fair value was $3 \cdot 7 = 21$; a 9 is above the mean card, so the value rose, but the remaining cards got slightly poorer because a high card left the deck. Answer: $\frac{1169}{51} \approx 22.92$.`,
    steps: [
      "Fix the revealed card as a constant 9.",
      "Compute the remaining deck's mean: (364 minus 9) over 51.",
      "Use linearity for the two hidden cards despite dependence.",
      "Add: 9 + 710/51.",
    ],
    keyIdea: "Without replacement, condition on the removed cards by updating the pool, then apply linearity to the rest.",
    commonMistake: String.raw`Using the full-deck mean 7 for the hidden cards (giving 23) instead of the updated mean $355/51 \approx 6.96$.`,
    fastPath: "Nine plus two times roughly 6.96; about 22.9.",
    variation: "Same deal, but the revealed card is a king. Fair value?",
    variationAnswer: String.raw`$13 + 2 \cdot \tfrac{364 - 13}{51} = 13 + \tfrac{702}{51} = \tfrac{1365}{51} \approx 26.76$ dollars.`,
    family: "market-making",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m8-p07",
    module: 8,
    kind: "practice",
    difficulty: 2,
    tags: ["expectation", "dice", "order-statistics"],
    minutes: 2,
    title: "Paid the larger die",
    prompt: String.raw`A contract pays, in dollars, the larger of two fair six-sided dice rolled independently (if they tie, it pays the common value). What is the fair value of the contract, in dollars?`,
    answer: { type: "numeric", value: 161 / 36, exact: String.raw`\sum_{k=1}^{6}\left(1 - \left(\tfrac{k-1}{6}\right)^2\right) = \frac{161}{36} \approx 4.47` },
    hints: [
      "Find the distribution of the maximum, or use the tail-sum formula for expectation.",
      String.raw`$P(\max \le k) = (k/6)^2$, so $P(\max = k) = \frac{k^2 - (k-1)^2}{36} = \frac{2k - 1}{36}$.`,
      "Sum k times (2k minus 1) over 36 for k from 1 to 6.",
    ],
    solution: String.raw`Let $M$ be the larger die. Both dice are at most $k$ with probability $(k/6)^2$, so $P(M = k) = \frac{k^2 - (k - 1)^2}{36} = \frac{2k - 1}{36}$: the values 1 through 6 have probabilities $\frac{1}{36}, \frac{3}{36}, \frac{5}{36}, \frac{7}{36}, \frac{9}{36}, \frac{11}{36}$.

Then $E[M] = \frac{1 \cdot 1 + 2 \cdot 3 + 3 \cdot 5 + 4 \cdot 7 + 5 \cdot 9 + 6 \cdot 11}{36} = \frac{1 + 6 + 15 + 28 + 45 + 66}{36} = \frac{161}{36} \approx 4.47$ dollars.

The tail-sum route is quicker: $E[M] = \sum_{k=1}^{6} P(M \ge k) = \sum_{k=1}^{6} \left(1 - \left(\frac{k-1}{6}\right)^2\right) = 6 - \frac{0 + 1 + 4 + 9 + 16 + 25}{36} = 6 - \frac{55}{36} = \frac{161}{36}$. Either way the contract is worth about 4.47 dollars, almost a dollar more than a single die. Answer: $\frac{161}{36} \approx 4.47$.`,
    steps: [
      "Write P(max at most k) as (k/6) squared.",
      "Difference the CDF or use the tail sum.",
      "Add the terms to get 161/36.",
    ],
    keyIdea: "The maximum of independent draws has an easy CDF; sum the tail probabilities to get its mean.",
    commonMistake: String.raw`Guessing 3.5 (the mean of one die) or taking the average of the two dice; the max is biased upward.`,
    fastPath: "Six minus 55/36: that is 6 minus about 1.53, so 4.47.",
    variation: "The contract pays the smaller of the two dice instead. Fair value?",
    variationAnswer: String.raw`$E[\min] = 7 - E[\max] = \tfrac{252 - 161}{36} = \tfrac{91}{36} \approx 2.53$ dollars, since $\min + \max$ equals the sum of the two dice.`,
    family: "expected-max",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m8-p08",
    module: 8,
    kind: "practice",
    difficulty: 2,
    tags: ["market-making", "adverse-selection", "expectation"],
    minutes: 2,
    title: "Picked off on the offer",
    prompt: String.raw`You are quoting a contract 48 bid, 52 offer, one unit each side. A scheduled announcement is seconds away. After it, the contract will be worth 45 with probability 0.2, 50 with probability 0.5, or 56 with probability 0.3. A faster trader will read the announcement before you can move your quote and will lift your offer (buy from you at 52) whenever the new value is above 52, and will do nothing to your offer otherwise. What is your expected loss, in dollars, from being picked off on the offer side?`,
    answer: { type: "numeric", value: 1.2, exact: String.raw`0.3 \cdot (56 - 52) = 1.2` },
    hints: [
      "Your offer only gets traded in the scenario where it is below the new value.",
      "In that scenario you sell at 52 something now worth 56.",
      "Multiply the loss per pick-off by its probability.",
    ],
    solution: String.raw`A stale quote is a free option for anyone faster than you. The fast trader only acts when it pays: they lift your 52 offer exactly when the new value exceeds 52, which happens only in the 56 scenario, with probability 0.3.

In that case you have sold at 52 a contract now worth 56, a loss of 4 dollars. In the 45 and 50 scenarios your offer is left alone (the 45 case would hurt your bid, but the question asks only about the offer side), so the loss there is 0.

Expected loss on the offer $= 0.3 \cdot 4 + 0.7 \cdot 0 = 1.2$ dollars. Including the bid side, which gets hit at 48 when the value drops to 45, would add $0.2 \cdot 3 = 0.6$, for a total pick-off cost of 1.8 dollars; a market maker either widens ahead of the announcement or pulls the quote. Answer: $1.2$.`,
    steps: [
      "Identify the scenario in which the offer is traded: value above 52.",
      "Compute the loss in that scenario: 56 minus 52 = 4.",
      "Weight by its probability 0.3.",
    ],
    keyIdea: "A stale quote is an option granted to faster traders; its expected cost is the probability of being picked off times the loss when it happens.",
    commonMistake: "Counting the 45 scenario against the offer (it hits the bid, not the offer), or using the gap between the new value and your fair value rather than your offer price.",
    fastPath: "Only the 56 case touches the offer: 0.3 times 4 equals 1.2.",
    variation: "Same scenarios. You widen to 46 bid, 54 offer before the announcement. Total expected pick-off loss on both sides?",
    variationAnswer: String.raw`Offer: $0.3 \cdot (56 - 54) = 0.6$. Bid: $0.2 \cdot (46 - 45) = 0.2$. Total $0.8$ dollars, down from 1.8 at the tighter quote.`,
    family: "adverse-selection",
    verifiedBy: ["formula", "simulation"],
  },
  {
    id: "m8-p09",
    module: 8,
    kind: "practice",
    difficulty: 2,
    tags: ["options"],
    minutes: 2,
    title: "Parity with zero rates",
    prompt: String.raw`A stock trades at 50 and pays no dividends. The interest rate is zero. A European call and a European put on the stock, both with strike 48 and the same expiry, are quoted. The call trades at 5.5. Assuming no arbitrage, what is the fair price of the put, in dollars?`,
    answer: { type: "numeric", value: 3.5, exact: String.raw`P = C - S + K = 5.5 - 50 + 48 = 3.5` },
    hints: [
      "Put-call parity links a call, a put, the stock and the strike.",
      String.raw`With zero interest, $C - P = S - K$.`,
      "Solve for P: 5.5 minus 50 plus 48.",
    ],
    solution: String.raw`Consider the portfolio long one call and short one put, both struck at $K = 48$. At expiry it is worth $\max(S_T - 48, 0) - \max(48 - S_T, 0) = S_T - 48$ whatever $S_T$ is: when the stock finishes above 48 the call pays the difference, when below the short put costs the difference.

So "call minus put" is the same as "stock minus 48 dollars paid at expiry". With zero interest, 48 dollars at expiry costs 48 dollars today, giving the parity relation $C - P = S - K$ today: $C - P = 50 - 48 = 2$.

Therefore $P = C - 2 = 5.5 - 2 = 3.5$ dollars. If the put traded higher, you could buy the call, sell the put, sell the stock and lock in a riskless profit; if lower, do the reverse. Answer: $3.5$.`,
    steps: [
      "Write the payoff of long call, short put: S minus K at expiry.",
      "Equate its price today to S minus K (zero rates).",
      "Solve for the put: 5.5 minus 50 plus 48 = 3.5.",
    ],
    keyIdea: "Long call plus short put is a forward on the stock, so C minus P equals S minus the discounted strike.",
    commonMistake: String.raw`Getting the sign wrong and computing $P = C + S - K = 7.5$; remember that when the stock is above the strike the call is the pricier of the two.`,
    fastPath: "Stock is 2 above strike, so call exceeds put by 2. Put is 3.5.",
    variation: "Same numbers, but the stock now trades at 45. Put price?",
    variationAnswer: String.raw`$C - P = 45 - 48 = -3$, so $P = 5.5 + 3 = 8.5$ dollars; now the put is the expensive one.`,
    family: "put-call-parity",
    verifiedBy: ["formula", "enumeration"],
  },
  {
    id: "m8-p10",
    module: 8,
    kind: "practice",
    difficulty: 2,
    tags: ["fermi"],
    minutes: 2,
    title: "Trades per year on a venue",
    prompt: String.raw`A matching engine averages 4,000 trades per minute while the market is open. The session lasts 6.5 hours a day and there are 252 trading days in the year. Using only these figures, how many trades does the engine match in a year? Report the number (an answer within 1% is accepted).`,
    answer: {
      type: "numeric",
      value: 4000 * 60 * 6.5 * 252,
      exact: String.raw`4000 \cdot 60 \cdot 6.5 \cdot 252 = 393{,}120{,}000 \approx 3.9 \times 10^8`,
      tolerance: 3_931_200,
    },
    hints: [
      "Convert the per-minute rate to a per-day count first.",
      "6.5 hours is 390 minutes, so a day is 4,000 times 390 trades.",
      "Multiply the daily figure by 252.",
    ],
    solution: String.raw`Chain the units: trades per minute, times minutes per day, times days per year. A 6.5-hour session is $6.5 \cdot 60 = 390$ minutes, so one day holds $4000 \cdot 390 = 1{,}560{,}000$ trades.

Over a year: $1{,}560{,}000 \cdot 252 = 393{,}120{,}000$ trades, about $3.9 \times 10^8$.

For a quick mental version: $4000 \cdot 390 \approx 1.56 \text{ million}$, and $1.56 \text{ million} \cdot 250 \approx 390 \text{ million}$. The exact product differs from that estimate by under 1%, which is the kind of precision an interviewer wants in a Fermi answer: the right order of magnitude, with the leading digit defensible. Answer: $393{,}120{,}000$.`,
    steps: [
      "Write the chain: per minute, per day, per year.",
      "Minutes per day: 6.5 times 60 = 390.",
      "Trades per day: 4000 times 390 = 1.56 million.",
      "Times 252 days: about 393 million.",
    ],
    keyIdea: "Fermi estimation is a chain of unit conversions; write each factor down and multiply.",
    commonMistake: "Using 365 days or 24 hours instead of the stated session length and trading-day count.",
    fastPath: "1.56 million a day times 250 is 390 million; nudge up slightly for 252.",
    variation: "The venue also runs a 2-hour pre-market session at one tenth of the main-session rate. Trades per year now?",
    variationAnswer: String.raw`Pre-market adds $400 \cdot 120 \cdot 252 = 12{,}096{,}000$, for a total of $405{,}216{,}000$, about 3% more.`,
    family: "fermi",
    verifiedBy: ["formula", "enumeration"],
  },

  // ---------------------------------------------------------------- difficulty 3
  {
    id: "m8-p11",
    module: 8,
    kind: "practice",
    difficulty: 3,
    tags: ["market-making", "adverse-selection", "expectation"],
    minutes: 3,
    title: "Profit per trade against mixed flow",
    prompt: String.raw`A contract is worth either 110 or 90, each with probability one half; you do not know which. You quote 96 bid, 104 offer, one unit each side. Exactly one customer arrives and trades one unit. With probability 0.2 the customer is informed: they know the true value, buy at your offer if it is 110 and sell at your bid if it is 90. With probability 0.8 the customer is uninformed: they buy or sell one unit with probability one half each, regardless of the value. The contract then settles at its true value. What is your expected profit on the trade, in dollars?`,
    answer: { type: "numeric", value: 2, exact: String.raw`0.8 \cdot 4 - 0.2 \cdot 6 = 2` },
    hints: [
      "Split by customer type. What do you make on average against an uninformed trade?",
      "Uninformed: you earn the half-spread 4 in expectation on either side. Informed: you always lose.",
      "Informed loss is 110 minus 104 or 96 minus 90, both 6. Combine with the weights 0.8 and 0.2.",
    ],
    solution: String.raw`Your fair value is 100 and your half-spread is 4. Condition on the customer type.

Uninformed (probability 0.8): if they buy, you sell at 104 a contract whose expected value is 100, an expected profit of 4; if they sell, you buy at 96, again an expected profit of 4. Either way the uninformed trade is worth $+4$ to you in expectation.

Informed (probability 0.2): they only trade on the side that hurts you. If the value is 110 they buy at 104 and you lose $110 - 104 = 6$; if it is 90 they sell to you at 96 and you lose $96 - 90 = 6$. The informed trade costs you exactly 6.

Expected profit $= 0.8 \cdot 4 - 0.2 \cdot 6 = 3.2 - 1.2 = 2$ dollars. In general, with half-spread $h$, informed fraction $q$ and informed edge $D$ (here 10), the expected profit per trade is $(1 - q)h - q(D - h) = h - qD$: you keep the half-spread from everyone and pay the full edge to the informed. Answer: $2$.`,
    steps: [
      "Set fair value 100 and half-spread 4.",
      "Uninformed trade: expected profit equals the half-spread, 4.",
      "Informed trade: loss equals edge minus half-spread, 6.",
      "Weight by 0.8 and 0.2: 3.2 minus 1.2 = 2.",
    ],
    keyIdea: "Expected profit per trade is the half-spread minus the informed fraction times the informed edge: h minus qD.",
    commonMistake: String.raw`Charging the informed trade the full edge 10 instead of $10 - 4 = 6$ (the informed customer still pays your half-spread), which gives $3.2 - 2 = 1.2$; or forgetting that the uninformed trade earns the half-spread on both sides.`,
    fastPath: "h minus qD: 4 minus 0.2 times 10 equals 2.",
    variation: "The informed fraction rises to 0.5 with the same quote. Expected profit per trade?",
    variationAnswer: String.raw`$4 - 0.5 \cdot 10 = -1$ dollar per trade: the quote now loses money, so you must widen to at least a half-spread of 5 to break even.`,
    family: "market-making",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m8-p12",
    module: 8,
    kind: "practice",
    difficulty: 3,
    tags: ["adverse-selection", "market-making", "dice", "conditional"],
    minutes: 3,
    title: "The counterparty who peeked",
    prompt: String.raw`Two fair six-sided dice will be rolled and a contract pays their total in dollars. Before the roll you quote 6.5 bid, 7.5 offer, one unit each side. Your counterparty has secretly looked at one of the two dice (you know they looked, but not what they saw). They buy one unit if their own fair value is strictly above your offer, sell one unit if it is strictly below your bid, and otherwise pass. What is the counterparty's expected profit per round, in dollars?`,
    answer: { type: "numeric", value: 1, exact: String.raw`\frac{2 + 1 + 0 + 0 + 1 + 2}{6} = 1` },
    hints: [
      "Their fair value is the seen die plus 3.5. For which values of the seen die do they trade?",
      "Seen die 5 or 6: fair 8.5 or 9.5, above 7.5, they buy. Seen die 1 or 2: fair 4.5 or 5.5, below 6.5, they sell. Seen 3 or 4: pass.",
      "Their expected edge given the seen die is the gap between their fair and your price; average over the six faces.",
    ],
    solution: String.raw`Call the seen die $d$. The counterparty's fair value is $d + 3.5$, because the other die still has mean 3.5. They trade only when that fair value is strictly outside your quote.

- $d = 6$: fair 9.5, they buy at 7.5, expected edge $2$.
- $d = 5$: fair 8.5, they buy at 7.5, expected edge $1$.
- $d = 4$: fair 7.5, equal to your offer, pass. $d = 3$: fair 6.5, equal to your bid, pass.
- $d = 2$: fair 5.5, they sell at 6.5, expected edge $1$.
- $d = 1$: fair 4.5, they sell at 6.5, expected edge $2$.

Each value of $d$ has probability $\frac{1}{6}$, so their expected profit per round is $\frac{2 + 1 + 0 + 0 + 1 + 2}{6} = 1$ dollar. That dollar is your expected loss: the counterparty's information lets them choose the side and the moment, and a quote that is fair against an uninformed roll is a losing quote against someone who has peeked. Even widening to 5.5 at 8.5 leaves them an edge of 1 on faces 1 and 6; only a quote of 4.5 at 9.5 (or wider) shuts them out on every face, which is why informed flow makes markets wide. Answer: $1$.`,
    steps: [
      "Write the counterparty's fair value as seen die plus 3.5.",
      "Determine the faces on which they buy, sell, or pass.",
      "Edge per face: 2, 1, 0, 0, 1, 2.",
      "Average over the six faces: 1 dollar.",
    ],
    keyIdea: "An informed counterparty's edge is the gap between their conditional fair value and your price, averaged only over the states in which they choose to trade.",
    commonMistake: "Letting them trade on every face (including 3 and 4, where their fair equals your price), or forgetting that their edge is in expectation over the unseen die, not the realised total.",
    fastPath: "Edges 2, 1, 0, 0, 1, 2 over six faces: average 1.",
    variation: "You widen to 5.5 bid, 8.5 offer. Counterparty's expected profit per round?",
    variationAnswer: String.raw`Their fair is at most 9.5 and at least 4.5; with a 6 they buy at 8.5 for edge 1, with a 1 they sell at 5.5 for edge 1, otherwise they pass. Expected profit $\tfrac{1 + 1}{6} = \tfrac{1}{3}$ dollar.`,
    family: "adverse-selection",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m8-p13",
    module: 8,
    kind: "practice",
    difficulty: 3,
    tags: ["expectation", "total-probability"],
    minutes: 3,
    title: "A two-stage trial contract",
    prompt: String.raw`A contract pays out according to a two-stage drug trial. Stage 1 succeeds with probability 0.6. If stage 1 fails, the contract pays 10 dollars and ends. If stage 1 succeeds, stage 2 runs: the drug is approved with probability 0.5, in which case the contract pays 200 dollars; otherwise it pays 40 dollars. Whenever stage 2 runs, the holder must also pay a 5 dollar fee. Ignore interest. What is the fair value of the contract today, in dollars?`,
    answer: { type: "numeric", value: 73, exact: String.raw`0.6 \cdot (0.5 \cdot 200 + 0.5 \cdot 40 - 5) + 0.4 \cdot 10 = 73` },
    hints: [
      "Draw the tree and value it from the leaves back to the root.",
      "At the stage-2 node the expected payout is 0.5 times 200 plus 0.5 times 40, minus the fee.",
      "Weight the stage-2 node value by 0.6 and the failure payout by 0.4.",
    ],
    solution: String.raw`Work backwards through the scenario tree. If stage 2 runs, the expected payout is $0.5 \cdot 200 + 0.5 \cdot 40 = 120$ dollars, and the holder pays the 5 dollar fee for certain in that branch, so the stage-2 node is worth $120 - 5 = 115$ dollars.

At the root: with probability 0.6 you reach the stage-2 node worth 115; with probability 0.4 stage 1 fails and you receive 10. The fair value is $0.6 \cdot 115 + 0.4 \cdot 10 = 69 + 4 = 73$ dollars.

Equivalently, list the three leaves with their path probabilities: approval ($0.3$, net $195$), rejection ($0.3$, net $35$), early failure ($0.4$, net $10$): $0.3 \cdot 195 + 0.3 \cdot 35 + 0.4 \cdot 10 = 58.5 + 10.5 + 4 = 73$. Answer: $73$.`,
    steps: [
      "Value the stage-2 node: 0.5 times 200 plus 0.5 times 40 is 120, minus the fee is 115.",
      "Weight by the stage-1 success probability 0.6.",
      "Add the failure branch: 0.4 times 10.",
      "Check against the three-leaf sum.",
    ],
    keyIdea: "Price a scenario tree from the leaves backwards; every node is the probability-weighted average of its children, net of costs incurred at that node.",
    commonMistake: "Charging the 5 dollar fee in every branch (including early failure, where stage 2 never runs), or applying the 0.5 approval probability to the whole contract instead of only the stage-2 branch.",
    fastPath: "Stage 2 node is 115; 0.6 times 115 is 69; plus 4 is 73.",
    variation: "After stage 1 succeeds, you may instead sell the contract for a fixed 110 dollars rather than run stage 2. Fair value today with that option?",
    variationAnswer: String.raw`Running stage 2 is worth 115 > 110, so you never sell; the value stays 73. If the offer were 120 instead, value becomes $0.6 \cdot 120 + 4 = 76$.`,
    verifiedBy: ["formula", "simulation"],
  },
  {
    id: "m8-p14",
    module: 8,
    kind: "practice",
    difficulty: 3,
    tags: ["options"],
    minutes: 3,
    title: "Parity with a discount factor",
    prompt: String.raw`A stock trades at 100 and pays no dividends. A European call and a European put on it, both with strike 100, expire in exactly one year. The continuously compounded risk-free rate is 5% per year. The put trades at 6. Assuming no arbitrage, what is the fair price of the call, in dollars?`,
    answer: {
      type: "numeric",
      value: 6 + 100 - 100 * Math.exp(-0.05),
      exact: String.raw`C = P + S - K e^{-rT} = 6 + 100 - 100 e^{-0.05} \approx 10.88`,
    },
    hints: [
      "Put-call parity, but now the strike must be discounted.",
      String.raw`$C - P = S - K e^{-rT}$ with $r = 0.05$, $T = 1$.`,
      String.raw`$100 e^{-0.05} \approx 95.12$, so $C \approx 6 + 4.88$.`,
    ],
    solution: String.raw`Long a call and short a put with the same strike pays $S_T - K$ at expiry, which is the payoff of a forward contract struck at $K$. Replicating that forward today costs the stock price minus the present value of $K$: with continuous compounding, $S - K e^{-rT}$.

So $C - P = 100 - 100 e^{-0.05}$. Since $e^{-0.05} \approx 0.95123$, the present value of the strike is about $95.12$ and $C - P \approx 4.88$. With interest, the at-the-money call is worth more than the at-the-money put: holding the call instead of the stock lets you keep $K$ earning interest.

Therefore $C = 6 + 100 - 100 e^{-0.05} = 106 - 100 e^{-0.05} \approx 10.88$ dollars. With zero interest the call would have been worth exactly 6, so the whole gap between 6 and 10.88 is the interest on the strike. Answer: $106 - 100 e^{-0.05} \approx 10.88$.`,
    steps: [
      "Recall parity with discounting: C minus P equals S minus K e^(-rT).",
      "Discount the strike: 100 e^(-0.05) is about 95.12.",
      "Solve for the call: 6 + 100 minus 95.12.",
    ],
    keyIdea: "Parity compares the stock with the present value of the strike, not the strike itself; interest makes the call worth more than the matching put.",
    commonMistake: String.raw`Forgetting to discount (giving $C = P = 6$ at the money), or discounting the stock instead of the strike.`,
    fastPath: String.raw`$e^{-0.05} \approx 1 - 0.05 + 0.00125 = 0.95125$. Strike PV 95.12; call is 6 plus 4.88 is 10.88.`,
    variation: "Same setup, but with simple annual compounding at 5% instead of continuous. Call price?",
    variationAnswer: String.raw`$K/(1 + r) = 100/1.05 \approx 95.24$, so $C = 6 + 100 - 95.24 \approx 10.76$ dollars.`,
    family: "put-call-parity",
    verifiedBy: ["formula", "enumeration"],
  },
  {
    id: "m8-p15",
    module: 8,
    kind: "practice",
    difficulty: 3,
    tags: ["options"],
    minutes: 4,
    title: "One-period call by replication",
    prompt: String.raw`A stock trades at 100 today. In one period it will be worth either 125 or 80; you are not told the probabilities. The interest rate is zero. Using a portfolio of the stock and cash that reproduces the option's payoff in both states, find the no-arbitrage price, in dollars, of a European call with strike 100 expiring at the end of the period.`,
    answer: { type: "numeric", value: 100 / 9, exact: String.raw`\Delta S_0 + B = \frac{5}{9}\cdot 100 - \frac{400}{9} = \frac{100}{9} \approx 11.11` },
    hints: [
      "Write the call's payoff in each state, then find how many shares match the payoff difference.",
      String.raw`Payoffs are 25 (up) and 0 (down). Shares $\Delta = \frac{25 - 0}{125 - 80} = \frac{5}{9}$.`,
      String.raw`Pick cash $B$ so that $\Delta \cdot 80 + B = 0$, then price $= \Delta \cdot 100 + B$.`,
    ],
    solution: String.raw`The call pays $\max(125 - 100, 0) = 25$ in the up state and $\max(80 - 100, 0) = 0$ in the down state. Look for a portfolio of $\Delta$ shares and $B$ dollars of cash (zero interest, so cash is worth $B$ in both states) that pays the same.

Up state: $125\Delta + B = 25$. Down state: $80\Delta + B = 0$. Subtracting gives $45\Delta = 25$, so $\Delta = \frac{5}{9}$; then $B = -80 \cdot \frac{5}{9} = -\frac{400}{9}$, meaning you borrow about 44.44 dollars.

The portfolio costs $\Delta \cdot 100 + B = \frac{500}{9} - \frac{400}{9} = \frac{100}{9} \approx 11.11$ dollars today, and since it pays exactly what the call pays in both states, that must be the call's price; any other price allows a riskless profit.

Risk-neutral check: the probability $p$ that makes the stock's expected return zero solves $125p + 80(1 - p) = 100$, so $p = \frac{20}{45} = \frac{4}{9}$, and the call is worth $\frac{4}{9} \cdot 25 = \frac{100}{9}$. The real-world probability of the up move never entered. Answer: $\frac{100}{9} \approx 11.11$.`,
    steps: [
      "Compute the call payoff in each state: 25 and 0.",
      "Shares: payoff spread over stock spread, 25/45 = 5/9.",
      "Cash: make the down state zero, B = minus 400/9.",
      "Price the portfolio today: 500/9 minus 400/9.",
      "Cross-check with the risk-neutral probability 4/9.",
    ],
    keyIdea: "In a two-state world a stock and cash span every payoff, so the option's price is the cost of the portfolio that copies it; real probabilities are irrelevant.",
    commonMistake: "Guessing a probability for the up move and discounting the expected payoff with it, or forgetting to borrow, which gives 500/9 instead of 100/9.",
    fastPath: "Risk-neutral p = (100 minus 80)/(125 minus 80) = 4/9; times 25 is 100/9, about 11.1.",
    variation: "Same tree, but price a put with strike 100 instead.",
    variationAnswer: String.raw`Put pays 0 up, 20 down; risk-neutral value $\tfrac{5}{9} \cdot 20 = \tfrac{100}{9}$, the same as the call, exactly as parity with $S = K$ and zero rates demands.`,
    verifiedBy: ["dp", "formula", "simulation"],
  },
  {
    id: "m8-p16",
    module: 8,
    kind: "practice",
    difficulty: 3,
    tags: ["adverse-selection", "bayes", "conditional"],
    minutes: 3,
    title: "Who just traded with you?",
    prompt: String.raw`Customers approach your desk one at a time. Each is informed with probability 0.2 and uninformed with probability 0.8, independently. After seeing your quote, an informed customer trades with probability 0.9 and an uninformed customer trades with probability 0.5; otherwise they walk away. A customer has just traded with you. What is the probability that they were informed?`,
    answer: { type: "numeric", value: 9 / 29, exact: String.raw`\frac{0.2 \cdot 0.9}{0.2 \cdot 0.9 + 0.8 \cdot 0.5} = \frac{18}{58} = \frac{9}{29} \approx 0.310` },
    hints: [
      "This is Bayes' rule: you observed a trade and want the posterior on the customer's type.",
      "Out of 100 customers, how many informed ones trade? How many uninformed ones trade?",
      "18 informed trades against 40 uninformed trades.",
    ],
    solution: String.raw`Think in counts over 100 customers. Twenty are informed, and $0.9 \cdot 20 = 18$ of them trade. Eighty are uninformed, and $0.5 \cdot 80 = 40$ of them trade. So 58 customers trade, 18 of them informed.

Bayes' rule says $P(\text{informed} \mid \text{trade}) = \frac{P(\text{trade} \mid \text{informed}) P(\text{informed})}{P(\text{trade})} = \frac{0.18}{0.18 + 0.40} = \frac{18}{58} = \frac{9}{29} \approx 0.310$.

The act of trading raised your estimate of "informed" from 20% to 31%, because the informed are more eager to trade. This is adverse selection in one line: the people who accept your price are not a random sample of the people who saw it. Every fill should make you a little more suspicious, and the more selective the informed are relative to the uninformed, the bigger the update. Answer: $\frac{9}{29} \approx 0.310$.`,
    steps: [
      "Set up Bayes with the event 'traded'.",
      "Informed trades: 0.2 times 0.9 = 0.18.",
      "Uninformed trades: 0.8 times 0.5 = 0.40.",
      "Posterior: 0.18 over 0.58 = 9/29.",
    ],
    keyIdea: "A fill is evidence: the posterior probability of an informed counterparty is the informed share of all trades, not of all arrivals.",
    commonMistake: "Answering 0.2 (ignoring the evidence) or 0.9 (confusing the likelihood with the posterior).",
    fastPath: "18 informed trades, 40 uninformed trades; 18 out of 58 is about 0.31.",
    variation: "Uninformed customers become pickier and trade only with probability 0.25. Posterior after a trade?",
    variationAnswer: String.raw`$\tfrac{0.18}{0.18 + 0.20} = \tfrac{18}{38} = \tfrac{9}{19} \approx 0.474$.`,
    family: "adverse-selection",
    verifiedBy: ["formula", "simulation"],
  },
  {
    id: "m8-p17",
    module: 8,
    kind: "practice",
    difficulty: 3,
    tags: ["options"],
    minutes: 3,
    title: "Hedging five hundred short calls",
    prompt: String.raw`A stock trades at 60 today and in one period will be worth either 75 or 50. The interest rate is zero. You have sold 500 European calls with strike 65 expiring at the end of the period, each on one share. How many shares of the stock must you hold now so that the combined value of your shares and your short calls is the same in both states?`,
    answer: { type: "numeric", value: 200, exact: String.raw`500 \cdot \Delta = 500 \cdot \frac{10 - 0}{75 - 50} = 200` },
    hints: [
      "Write the value of shares minus calls in each state and set them equal.",
      "Each call pays 10 in the up state and 0 in the down state.",
      String.raw`With $n$ shares: $75n - 5000 = 50n$.`,
    ],
    solution: String.raw`In the up state each call pays $75 - 65 = 10$, so your 500 short calls cost you 5000; in the down state they expire worthless. Holding $n$ shares, your position is worth $75n - 5000$ in the up state and $50n$ in the down state.

Setting them equal: $75n - 5000 = 50n$, so $25n = 5000$ and $n = 200$ shares. With 200 shares the position is worth $15{,}000 - 5000 = 10{,}000$ in both states: the hedge has removed all the risk.

This is the delta of the call times the number of calls: $\Delta = \frac{10 - 0}{75 - 50} = \frac{2}{5}$ share per call, and $500 \cdot \frac{2}{5} = 200$. Delta is the number of shares that moves in step with one option; a short option is hedged by holding delta shares. Answer: $200$.`,
    steps: [
      "Payoff of the short calls in each state: minus 5000 and 0.",
      "Position value with n shares: 75n minus 5000 versus 50n.",
      "Equate and solve: n = 200.",
      "Interpret as 500 times delta 2/5.",
    ],
    keyIdea: "Delta is the payoff spread over the stock spread; a hedged book holds delta shares per option sold.",
    commonMistake: "Using the stock move as 75 minus 60 (from today) instead of the spread between the two future states, or hedging with 500 shares (one per call).",
    fastPath: "Delta is 10 over 25, two fifths. Two fifths of 500 is 200.",
    variation: "Strike 55 instead of 65. Shares needed?",
    variationAnswer: String.raw`Payoffs 20 and 0, so $\Delta = \tfrac{20}{25} = \tfrac{4}{5}$ and you need $400$ shares.`,
    verifiedBy: ["formula", "exhaustive-search"],
  },
  {
    id: "m8-p18",
    module: 8,
    kind: "practice",
    difficulty: 3,
    tags: ["fermi"],
    minutes: 2,
    title: "Order of magnitude of a message archive",
    prompt: String.raw`A venue archives every order message it receives: 1.2 billion messages a day, each stored as 80 bytes, kept for 7 years. Take a year to be 365 days and assume the venue runs every day. Which power of ten is closest to the total number of bytes archived?`,
    answer: {
      type: "choice",
      options: [
        String.raw`$10^{12}$ bytes (about a terabyte).`,
        String.raw`$10^{13}$ bytes (about ten terabytes).`,
        String.raw`$10^{14}$ bytes (about a hundred terabytes).`,
        String.raw`$10^{15}$ bytes (about a petabyte).`,
      ],
      correct: 2,
    },
    hints: [
      "Multiply in scientific notation: separate the leading digits from the powers of ten.",
      String.raw`$1.2 \times 10^9$ messages times $8 \times 10^1$ bytes is $9.6 \times 10^{10}$ bytes a day.`,
      String.raw`Days: $7 \cdot 365 = 2555 \approx 2.6 \times 10^3$. Multiply the mantissas and add the exponents.`,
    ],
    solution: String.raw`Write each factor in scientific notation and handle mantissas and exponents separately. Messages per day: $1.2 \times 10^9$. Bytes per message: $8 \times 10^1$. Days: $7 \cdot 365 = 2555 = 2.555 \times 10^3$.

Exponents: $9 + 1 + 3 = 13$. Mantissas: $1.2 \cdot 8 \cdot 2.555 = 9.6 \cdot 2.555 \approx 24.5$. So the total is about $24.5 \times 10^{13} = 2.45 \times 10^{14}$ bytes.

Is $2.45 \times 10^{14}$ closer to $10^{14}$ or $10^{15}$? On a log scale the midpoint between consecutive powers is $\sqrt{10} \approx 3.16$; a mantissa of 2.45 is below that, so $10^{14}$ is nearer (it is also nearer in plain distance: $1.45 \times 10^{14}$ away versus $7.5 \times 10^{14}$). About a hundred terabytes. Answer: $10^{14}$ bytes.`,
    steps: [
      "Convert every factor to scientific notation.",
      "Add the exponents: 9 + 1 + 3 = 13.",
      "Multiply the mantissas: about 24.5, so 2.45 times 10^14.",
      "Round to the nearest power of ten using the 3.16 rule.",
    ],
    keyIdea: "Track exponents and mantissas separately; a mantissa below about 3.2 rounds down to the lower power of ten.",
    commonMistake: String.raw`Rounding $2.45 \times 10^{14}$ up to $10^{15}$ because 24.5 'looks big', or dropping the factor of 7 years.`,
    fastPath: "9.6e10 a day, times 2.5e3 days: 2.4e14. Hundred terabytes.",
    variation: "The venue compresses the archive 5 to 1 and keeps it for 10 years instead. Nearest power of ten?",
    variationAnswer: String.raw`$9.6 \times 10^{10} \cdot 3650 / 5 \approx 7.0 \times 10^{13}$, which rounds to $10^{14}$ on a log scale (mantissa 7 is above 3.16).`,
    family: "fermi",
    verifiedBy: ["formula", "exhaustive-search"],
  },

  // ---------------------------------------------------------------- difficulty 4
  {
    id: "m8-p19",
    module: 8,
    kind: "practice",
    difficulty: 4,
    tags: ["market-making", "adverse-selection", "dice", "expectation"],
    minutes: 6,
    title: "Break-even half-spread on a die",
    prompt: String.raw`A contract pays, in dollars, the value of one fair six-sided die that has already been rolled under a cup. You quote a symmetric market around 3.5: bid $3.5 - h$ and offer $3.5 + h$, one unit each side, with $h > 0$. Each arriving customer is, independently, informed with probability 0.4 (they have seen the die) or uninformed with probability 0.6. An informed customer buys one unit at your offer if the die is strictly above the offer, sells one unit at your bid if the die is strictly below the bid, and otherwise passes. An uninformed customer buys or sells one unit with probability one half each. The contract settles at the die's value. Find the half-spread $h$ at which your expected profit per arriving customer is exactly zero.`,
    answer: { type: "numeric", value: 8 / 13, exact: String.raw`h = \frac{4 \cdot 0.4}{3 - 0.4} = \frac{8}{13} \approx 0.615` },
    hints: [
      "Expected profit per arrival is 0.6 times h (uninformed) minus 0.4 times your expected loss to an informed customer, which depends on h.",
      String.raw`Guess that the answer lies between 0.5 and 1.5. Then the informed trade only on faces 1, 2, 5, 6, and your loss on face $x$ is $|x - 3.5| - h$.`,
      String.raw`Expected informed loss $= \frac{2(1.5 - h) + 2(2.5 - h)}{6} = \frac{4 - 2h}{3}$. Solve $0.6h = 0.4 \cdot \frac{4 - 2h}{3}$ and check the root is in your assumed range.`,
    ],
    solution: String.raw`An uninformed customer trades at a price $h$ away from the contract's mean 3.5 on either side, so they are worth $+h$ to you in expectation. An informed customer trades only on faces where your price is wrong by more than $h$, and on face $x$ your loss is $|x - 3.5| - h$. The distances $|x - 3.5|$ are 2.5 (faces 1 and 6), 1.5 (faces 2 and 5) and 0.5 (faces 3 and 4).

Which faces trade depends on $h$, so there are cases. Try $0.5 < h < 1.5$: faces 3 and 4 no longer trade, faces 1, 2, 5, 6 do. Expected loss to an informed customer is $\frac{2(2.5 - h) + 2(1.5 - h)}{6} = \frac{8 - 4h}{6} = \frac{4 - 2h}{3}$.

Expected profit per arrival: $0.6h - 0.4 \cdot \frac{4 - 2h}{3} = 0.6h - \frac{1.6 - 0.8h}{3}$. Setting it to zero: $1.8h = 1.6 - 0.8h$, so $2.6h = 1.6$ and $h = \frac{16}{26} = \frac{8}{13} \approx 0.615$. This lies in $(0.5, 1.5)$, so the case assumption holds.

Check the other cases for completeness. For $h < 0.5$ all six faces trade and the loss is $1.5 - h$; the break-even would be $0.6h = 0.4(1.5 - h)$, giving $h = 0.6$, which is not below 0.5, so no root there. For $1.5 < h < 2.5$ only faces 1 and 6 trade, the loss is $\frac{2.5 - h}{3}$, and the break-even would be $h = \frac{1}{2.2} \approx 0.45$, not in range either. Since expected profit is continuous and strictly increasing in $h$, the root is unique: $h = \frac{8}{13}$, a quote of about $2.88$ bid, $4.12$ offer. Answer: $\frac{8}{13} \approx 0.615$.`,
    steps: [
      "Uninformed arrival is worth +h in expectation.",
      "Informed loss on face x is |x minus 3.5| minus h when positive.",
      "Guess the case 0.5 < h < 1.5: faces 1, 2, 5, 6 trade, loss (4 minus 2h)/3.",
      "Solve 0.6h = 0.4(4 minus 2h)/3 to get h = 8/13.",
      "Verify the root sits inside the assumed case.",
    ],
    keyIdea: "Against informed flow the loss is the average of (edge minus half-spread) over the faces that still trade; solve the break-even inside the case where the root lands.",
    commonMistake: "Letting the informed trade on every face regardless of h (that gives h = 0.6, which contradicts its own assumption) or charging the uninformed less than the full half-spread.",
    fastPath: "Assume faces 3 and 4 drop out. Loss (4 minus 2h)/3; 0.6h equals 0.4(4 minus 2h)/3; h is 1.6 over 2.6, which is 8/13.",
    variation: "The informed fraction falls to 0.2. Break-even half-spread?",
    variationAnswer: String.raw`In the same case: $0.8h = 0.2 \cdot \tfrac{4 - 2h}{3}$ gives $2.4h = 0.8 - 0.4h$, $h = \tfrac{0.8}{2.8} = \tfrac{2}{7} \approx 0.286$; but that is below 0.5, so switch to the all-faces case: $0.8h = 0.2(1.5 - h)$, $h = 0.3$, which is consistent. Break-even half-spread $0.3$.`,
    family: "market-making",
    verifiedBy: ["formula", "exhaustive-search"],
  },
  {
    id: "m8-p20",
    module: 8,
    kind: "practice",
    difficulty: 4,
    tags: ["adverse-selection", "bayes", "market-making"],
    minutes: 5,
    title: "Fair value given that they are buying",
    prompt: String.raw`A contract pays 100 dollars if a fair coin, already flipped and hidden, shows heads, and 0 otherwise. A customer arrives. With probability 0.4 the customer is informed: they have a signal that matches the coin with probability 0.8, and they buy if the signal says heads and sell if it says tails. With probability 0.6 the customer is uninformed and buys or sells with probability one half each. The customer says they want to buy. What is the fair value of the contract, in dollars, given that this customer is buying? (Equivalently, the lowest offer at which selling to them has non-negative expected profit.)`,
    answer: { type: "numeric", value: 62, exact: String.raw`100 \cdot P(H \mid \text{buy}) = 100 \cdot \frac{0.62}{0.62 + 0.38} = 62` },
    hints: [
      "You need P(heads | buy). Compute P(buy | heads) and P(buy | tails) first.",
      String.raw`$P(\text{buy} \mid H) = 0.4 \cdot 0.8 + 0.6 \cdot 0.5 = 0.62$ and $P(\text{buy} \mid T) = 0.4 \cdot 0.2 + 0.6 \cdot 0.5 = 0.38$.`,
      "The prior is one half each, so the posterior on heads is 0.62 over (0.62 + 0.38).",
    ],
    solution: String.raw`The order to buy is evidence about the coin, because informed customers buy more often when it is heads. Compute the likelihood of a buy under each state.

If the coin is heads: an informed customer's signal says heads with probability 0.8, so they buy with probability 0.8; an uninformed customer buys with probability 0.5. $P(\text{buy} \mid H) = 0.4 \cdot 0.8 + 0.6 \cdot 0.5 = 0.32 + 0.30 = 0.62$.

If the coin is tails: the informed signal wrongly says heads with probability 0.2. $P(\text{buy} \mid T) = 0.4 \cdot 0.2 + 0.6 \cdot 0.5 = 0.08 + 0.30 = 0.38$.

With a fair prior, Bayes gives $P(H \mid \text{buy}) = \frac{0.5 \cdot 0.62}{0.5 \cdot 0.62 + 0.5 \cdot 0.38} = 0.62$. The fair value given the buy order is therefore $100 \cdot 0.62 = 62$ dollars, and by symmetry the fair value given a sell order is 38. If you want to sell to this customer without losing money in expectation, your offer must be at least 62: the buy order itself moved your fair from 50 to 62, so a market of 38 bid, 62 offer is the tightest zero-edge quote against this flow. Answer: $62$.`,
    steps: [
      "Treat the buy order as evidence about the coin.",
      "Likelihood of a buy given heads: 0.4 times 0.8 plus 0.6 times 0.5 = 0.62.",
      "Likelihood of a buy given tails: 0.4 times 0.2 plus 0.3 = 0.38.",
      "Posterior on heads: 0.62; fair value 62.",
    ],
    keyIdea: "Condition on the direction of the order: the fair value you should sell at is the expectation given that someone chose to buy.",
    commonMistake: String.raw`Treating the informed as perfectly informed ($P(H \mid \text{buy}) = 0.7$) or forgetting that uninformed buys dilute the signal; the 0.8 accuracy matters.`,
    fastPath: "Buy likelihood under heads 0.62, under tails 0.38; they already sum to 1, so posterior is 0.62. Fair value 62.",
    variation: "The informed signal becomes perfect (matches the coin with probability 1). Fair value given a buy?",
    variationAnswer: String.raw`$P(\text{buy} \mid H) = 0.4 + 0.3 = 0.7$, $P(\text{buy} \mid T) = 0.3$, posterior $0.7$, fair value $70$; the break-even quote widens to 30 bid, 70 offer.`,
    family: "adverse-selection",
    verifiedBy: ["enumeration", "simulation"],
  },
  {
    id: "m8-p21",
    module: 8,
    kind: "practice",
    difficulty: 4,
    tags: ["options"],
    minutes: 3,
    title: "Call or put: which is worth more?",
    prompt: String.raw`A stock trades at 100 and pays no dividends. A European call and a European put on it both have strike 100 and expire in one year. The continuously compounded risk-free rate is 4% per year and is positive for certain. Without any model for the stock's future distribution, which option is worth more today?`,
    answer: {
      type: "choice",
      options: [
        String.raw`The call: by parity $C - P = S - K e^{-rT} = 100(1 - e^{-0.04}) \approx 3.92 > 0$, whatever the volatility.`,
        String.raw`The put: downside protection on a stock at the strike is worth more than upside participation.`,
        String.raw`They are worth the same: the strike equals the stock price, so the two options are mirror images.`,
        String.raw`It cannot be decided without knowing the stock's volatility.`,
      ],
      correct: 0,
    },
    hints: [
      "You do not need a pricing model. There is a model-free relation between a call and a put with the same strike and expiry.",
      String.raw`Put-call parity: $C - P = S - K e^{-rT}$. Here $S = K$.`,
      String.raw`With $S = K$ and $r > 0$, $K e^{-rT} < S$, so the sign of $C - P$ is fixed.`,
    ],
    solution: String.raw`Put-call parity holds for any arbitrage-free market, regardless of how the stock moves: $C - P = S - K e^{-rT}$. The relation comes from the fact that long call plus short put pays $S_T - K$ at expiry, the same as holding the stock and owing $K$.

Here $S = K = 100$, so $C - P = 100 - 100 e^{-0.04} = 100(1 - e^{-0.04}) \approx 100 \cdot 0.0392 = 3.92$ dollars. The call is worth about 3.92 more than the put.

Volatility affects both prices equally, since it does not appear in parity: higher volatility raises the call and the put by the same amount, leaving the difference fixed. The intuition is that the call lets you hold the stock's upside while keeping the strike in the bank earning interest, whereas a put only gives the same exposure if you also hold the stock, which earns nothing. With zero rates the two would be equal; with positive rates the at-the-money call wins. Answer: the call.`,
    steps: [
      "Recall that parity is model-free.",
      "Set S = K: C minus P equals K(1 minus e^(-rT)).",
      "Positive rate makes the difference positive, so the call is worth more.",
      "Note that volatility cancels from the difference.",
    ],
    keyIdea: "Parity fixes the difference between a call and a put without any model; at the money with positive rates, the call is worth the interest on the strike more.",
    commonMistake: "Appealing to symmetry of the payoffs around the strike and calling them equal, which is only true when the forward equals the strike (zero rates, no dividends).",
    fastPath: "C minus P equals S minus PV(K); PV(K) is below S whenever rates are positive. Call.",
    variation: "The stock will pay a known 6 dollar dividend just before expiry, everything else unchanged. Which is worth more now?",
    variationAnswer: String.raw`Parity becomes $C - P = S - \mathrm{PV}(D) - K e^{-rT} \approx 100 - 5.76 - 96.08 < 0$, so now the put is worth more; dividends lower the forward.`,
    family: "put-call-parity",
    verifiedBy: ["formula", "dp"],
  },
  {
    id: "m8-p22",
    module: 8,
    kind: "practice",
    difficulty: 4,
    tags: ["fermi"],
    minutes: 3,
    title: "Order of magnitude of a risk run",
    prompt: String.raw`A risk system revalues 1,500 positions against 25,000 scenarios every time it runs, and it runs once every 2 minutes throughout a 6.5-hour trading day, for 252 days a year. Count one valuation as one position priced under one scenario. Which power of ten is closest to the number of valuations the system performs in a year?`,
    answer: {
      type: "choice",
      options: [
        String.raw`$10^{11}$ valuations.`,
        String.raw`$10^{12}$ valuations.`,
        String.raw`$10^{13}$ valuations.`,
        String.raw`$10^{14}$ valuations.`,
      ],
      correct: 1,
    },
    hints: [
      "Build the chain: valuations per run, runs per day, days per year.",
      String.raw`Per run: $1.5 \times 10^3 \cdot 2.5 \times 10^4 = 3.75 \times 10^7$. Runs per day: $6.5 \cdot 60 / 2 = 195$.`,
      String.raw`$3.75 \times 10^7 \cdot 195 \approx 7.3 \times 10^9$ per day; times 252 days.`,
    ],
    solution: String.raw`Per run: $1500 \cdot 25{,}000 = 3.75 \times 10^7$ valuations. Runs per day: the session is $6.5 \cdot 60 = 390$ minutes and the system runs every 2 minutes, so $195$ runs. Per day: $3.75 \times 10^7 \cdot 195 \approx 7.31 \times 10^9$.

Per year: $7.31 \times 10^9 \cdot 252 \approx 1.84 \times 10^{12}$ valuations.

The mantissa 1.84 is well below $\sqrt{10} \approx 3.16$, so the nearest power of ten on a log scale is $10^{12}$ (and in plain distance it is $0.84 \times 10^{12}$ from $10^{12}$ against $8.2 \times 10^{12}$ from $10^{13}$). A trillion valuations a year: that is the scale at which pricing speed starts to decide system design. Answer: $10^{12}$.`,
    steps: [
      "Valuations per run: 1500 times 25,000 = 3.75e7.",
      "Runs per day: 390 minutes over 2 = 195.",
      "Per day about 7.3e9; per year times 252 is about 1.8e12.",
      "Nearest power of ten: 10^12.",
    ],
    keyIdea: "Keep a running exponent and a running mantissa; a chain of four factors is still just one multiplication.",
    commonMistake: "Reading 'every 2 minutes' as 2 runs per minute: a factor of 4 error that gives about 7.4e12, which rounds to 10^13 and gets the question wrong. Using 24 hours instead of the 6.5-hour session is the other classic slip.",
    fastPath: "3.75e7 per run, roughly 200 runs a day is 7.5e9, times 250 is about 1.9e12. Twelve.",
    variation: "The scenario count is cut to 2,500 and the system runs every 30 seconds. Nearest power of ten?",
    variationAnswer: String.raw`Per run $3.75 \times 10^6$; 780 runs a day; $2.9 \times 10^9$ a day; $7.4 \times 10^{11}$ a year, which rounds to $10^{12}$ on a log scale (mantissa 7.4 > 3.16).`,
    family: "fermi",
    verifiedBy: ["formula", "exhaustive-search"],
  },

  // ---------------------------------------------------------------- difficulty 5
  {
    id: "m8-p23",
    module: 8,
    kind: "practice",
    difficulty: 5,
    tags: ["market-making", "adverse-selection", "expectation"],
    minutes: 8,
    title: "The spread that maximises profit",
    prompt: String.raw`A contract is worth either 110 or 90, each with probability one half; you do not know which. You quote $100 - h$ bid and $100 + h$ offer, one unit each side, choosing $h$ between 0 and 5. Each arriving customer is, independently, informed with probability 0.1 or uninformed with probability 0.9. An informed customer knows the value and always trades one unit on the side that profits them (buys at your offer if the value is 110, sells at your bid if it is 90). An uninformed customer trades one unit with probability $1 - h/5$ (buying or selling with equal probability) and otherwise walks away without trading. The contract settles at its true value. Which half-spread $h$ maximises your expected profit per arriving customer?`,
    answer: { type: "numeric", value: 25 / 9, exact: String.raw`h^* = \frac{5}{2(1 - 0.1)} = \frac{25}{9} \approx 2.78` },
    hints: [
      "Write expected profit per arrival as a function of h: the uninformed term shrinks as h grows, the informed loss shrinks too.",
      String.raw`$\pi(h) = 0.9\left(1 - \frac{h}{5}\right)h - 0.1(10 - h)$.`,
      String.raw`Differentiate: $0.9\left(1 - \frac{2h}{5}\right) + 0.1 = 0$.`,
    ],
    solution: String.raw`Expected profit per arrival has two parts. An uninformed customer (probability 0.9) trades with probability $1 - h/5$ and, when they do, pays you the half-spread $h$ in expectation on either side; that part is worth $0.9(1 - h/5)h$. An informed customer (probability 0.1) always trades and costs you the edge $10$ less the half-spread $h$: that part is $-0.1(10 - h)$.

So $\pi(h) = 0.9\left(h - \frac{h^2}{5}\right) - 1 + 0.1h = h - \frac{0.9 h^2}{5} - 1$. This is a downward parabola, so the maximum is at the stationary point: $\pi'(h) = 1 - \frac{1.8h}{5} = 0$, giving $h^* = \frac{5}{1.8} = \frac{25}{9} \approx 2.78$.

Interpretation: without informed flow the revenue from uninformed customers, $(1 - h/5)h$, is maximised at $h = 2.5$, halfway along the range over which their trade probability falls from 1 to 0. Informed flow pushes the optimum wider because every extra unit of width also reduces the loss on each informed trade. The general formula is $h^* = \frac{5}{2(1 - q)}$ for informed fraction $q$: more informed flow, wider market.

At the optimum, $\pi(25/9) = \frac{25}{9} - \frac{0.9}{5}\cdot\frac{625}{81} - 1 = \frac{25}{9} - \frac{125}{90} - 1 = \frac{250 - 125 - 90}{90} = \frac{35}{90} = \frac{7}{18} \approx 0.39$ dollars per arrival, positive, so quoting is worth it. Answer: $h^* = \frac{25}{9} \approx 2.78$.`,
    steps: [
      "Uninformed term: 0.9 times (1 minus h/5) times h.",
      "Informed term: minus 0.1 times (10 minus h).",
      "Combine into a quadratic in h and differentiate.",
      "Solve 1 minus 1.8h/5 = 0 for h = 25/9.",
      "Check the profit at the optimum is positive.",
    ],
    keyIdea: "Width trades off volume from uninformed flow against protection from informed flow; the optimum sits wider than the pure-volume optimum.",
    commonMistake: "Maximising the uninformed revenue alone (h = 2.5) and treating the informed loss as a constant; the informed loss depends on h too and shifts the optimum.",
    fastPath: "Profit is h minus 0.18h squared minus 1; vertex at h = 1/0.36 = 2.78.",
    variation: "The informed fraction doubles to 0.2. Optimal h and the resulting expected profit?",
    variationAnswer: String.raw`$h^* = \tfrac{5}{1.6} = 3.125$, and $\pi(h^*) = 0.8 \cdot 0.375 \cdot 3.125 - 0.2 \cdot 6.875 = 0.9375 - 1.375 = -0.4375 < 0$. No spread makes money: with this much informed flow you should not quote at all.`,
    family: "market-making",
    verifiedBy: ["formula", "exhaustive-search"],
  },
  {
    id: "m8-p24",
    module: 8,
    kind: "practice",
    difficulty: 5,
    tags: ["options"],
    minutes: 8,
    title: "Two-period call with interest",
    prompt: String.raw`A stock trades at 100. Over each of the next two periods its price either rises by 20% or falls by 20% (so after one period it is 120 or 80, and after two it is 144, 96 or 64). Cash grows by 5% per period, compounded each period: one dollar becomes 1.05 dollars after one period and 1.1025 dollars after two. A European call with strike 100 expires at the end of the second period. Assuming no arbitrage, what is the call's price today, in dollars?`,
    answer: {
      type: "numeric",
      value: 6875 / 441,
      exact: String.raw`\frac{p^2 \cdot 44}{1.05^2} \text{ with } p = \frac{1.05 - 0.8}{0.4} = \frac{5}{8}: \quad \frac{6875}{441} \approx 15.59`,
    },
    hints: [
      "Find the risk-neutral up probability from the one-period tree, then work backwards through the two steps.",
      String.raw`$p$ solves $1.2p + 0.8(1 - p) = 1.05$, so $p = \frac{0.25}{0.4} = \frac{5}{8}$.`,
      String.raw`Only the up-up node pays: $144 - 100 = 44$. Discount $p^2 \cdot 44$ by $1.05^2$.`,
    ],
    solution: String.raw`In a one-period step the stock goes to $1.2S$ or $0.8S$ while cash grows by $1.05$. The risk-neutral probability $p$ makes the stock's expected growth equal the cash growth: $1.2p + 0.8(1 - p) = 1.05$, so $0.4p = 0.25$ and $p = \frac{5}{8}$. Because the up and down factors are the same at every node, this $p$ applies throughout the tree.

At expiry the call pays $144 - 100 = 44$ at the up-up node, $0$ at 96 and $0$ at 64. Step back one period. At the 120 node the call is worth $\frac{p \cdot 44 + (1 - p) \cdot 0}{1.05} = \frac{27.5}{1.05} \approx 26.19$; at the 80 node it is worth 0.

Step back again to today: $C_0 = \frac{p \cdot 26.19 + (1 - p) \cdot 0}{1.05} = \frac{p^2 \cdot 44}{1.05^2} = \frac{\frac{25}{64} \cdot 44}{1.1025} = \frac{17.1875}{1.1025} = \frac{6875}{441} \approx 15.59$ dollars.

Replication gives the same number node by node. At the 120 node, hold $\Delta = \frac{44 - 0}{144 - 96} = \frac{11}{12}$ shares and borrow $\frac{(11/12) \cdot 96}{1.05} = \frac{88}{1.05}$; the portfolio costs $110 - 83.81 = 26.19$. Today, hold $\Delta = \frac{26.19 - 0}{120 - 80} \approx 0.655$ shares and borrow $\frac{0.655 \cdot 80}{1.05} \approx 49.9$, costing $65.5 - 49.9 \approx 15.6$. Answer: $\frac{6875}{441} \approx 15.59$.`,
    steps: [
      "Risk-neutral probability: (1.05 minus 0.8)/(1.2 minus 0.8) = 5/8.",
      "Terminal payoffs: 44, 0, 0.",
      "Value at the 120 node: (5/8)(44)/1.05.",
      "Value today: multiply by 5/8 and discount again.",
      "Cross-check one node by replication.",
    ],
    keyIdea: "On a recombining tree, price by stepping backwards: each node is the risk-neutral expectation of its children discounted one period.",
    commonMistake: "Using the zero-rate probability 1/2 instead of 5/8, or discounting only once over two periods.",
    fastPath: "p = 5/8; only up-up pays 44; 44 times 25/64 is 17.19; divide by 1.1025 to get 15.59.",
    variation: "Same tree. Price the European put with strike 100 and check parity.",
    variationAnswer: String.raw`Put pays 4 at 96 and 36 at 64: $\tfrac{2p(1-p)\cdot 4 + (1-p)^2 \cdot 36}{1.05^2} = \tfrac{1.875 + 5.0625}{1.1025} \approx 6.29$. Parity: $C - P \approx 15.59 - 6.29 = 9.30 = 100 - 100/1.1025$, as required.`,
    verifiedBy: ["dp", "formula", "simulation"],
  },

  // ---------------------------------------------------------------- lesson checks
  {
    id: "m8-lc1",
    module: 8,
    kind: "lessonCheck",
    difficulty: 1,
    tags: ["market-making", "dice", "conditional"],
    minutes: 1,
    title: "Two dice, one shown",
    prompt: String.raw`Two fair six-sided dice are rolled. You are shown one of them (chosen before the roll): it reads 6. The other is hidden. A contract pays the total of the two dice in dollars. What is your fair value, in dollars?`,
    answer: { type: "numeric", value: 9.5, exact: String.raw`6 + 3.5 = 9.5` },
    hints: [
      "Fair value is the conditional expectation of the payout.",
      "The shown die is a constant; the hidden die is still fair.",
      "6 plus 3.5.",
    ],
    solution: String.raw`The die you are shown was fixed before the roll, so it says nothing about the other die. The total is $6 + X$ where $X$ is a fair die with mean 3.5.

Fair value $= 6 + 3.5 = 9.5$ dollars. You might quote 9 bid, 10 offer around it. Answer: $9.5$.`,
    steps: ["Fix the shown die at 6.", "Mean of the hidden die is 3.5.", "Add to get 9.5."],
    keyIdea: "Known parts are constants; unknown parts keep their means.",
    commonMistake: "Quoting 7, the unconditional mean of two dice.",
    fastPath: "Six plus three and a half: nine and a half.",
    variation: "The shown die reads 1 instead. Fair value?",
    variationAnswer: String.raw`$1 + 3.5 = 4.5$ dollars.`,
    family: "market-making",
    verifiedBy: ["enumeration", "formula"],
  },
  {
    id: "m8-lc2",
    module: 8,
    kind: "lessonCheck",
    difficulty: 2,
    tags: ["market-making", "adverse-selection"],
    minutes: 1,
    title: "Break-even against informed flow",
    prompt: String.raw`A contract is worth 24 or 16 with equal probability; you do not know which, so your fair value is 20. You quote $20 - h$ bid and $20 + h$ offer. Each trade is with an informed customer with probability 0.25 (they know the value and trade on the side that profits them) and with an uninformed customer with probability 0.75 (they buy or sell with equal probability). What half-spread $h$ makes your expected profit per trade exactly zero?`,
    answer: { type: "numeric", value: 1, exact: String.raw`h = qD = 0.25 \cdot 4 = 1` },
    hints: [
      "Uninformed trades earn you h; informed trades cost you the edge minus h.",
      String.raw`Expected profit $= 0.75h - 0.25(4 - h) = h - 1$.`,
      "Set h minus 1 to zero.",
    ],
    solution: String.raw`The informed edge is $D = 4$ (the value is 4 away from your fair in either direction). Against an uninformed trade you earn $h$; against an informed trade you lose $4 - h$.

Expected profit per trade $= 0.75h - 0.25(4 - h) = 0.75h - 1 + 0.25h = h - 1$. It is zero at $h = 1$: quote 19 bid, 21 offer. In general the break-even half-spread is the informed fraction times the informed edge, $h = qD$. Answer: $1$.`,
    steps: ["Edge D = 4, informed fraction q = 0.25.", "Profit per trade is h minus qD.", "Break-even h = qD = 1."],
    keyIdea: "Break-even half-spread equals informed fraction times informed edge.",
    commonMistake: "Setting h equal to the full edge 4, which ignores the uninformed customers paying the spread.",
    fastPath: "A quarter of four is one.",
    variation: "Informed fraction 0.5. Break-even half-spread?",
    variationAnswer: String.raw`$h = 0.5 \cdot 4 = 2$: quote 18 at 22.`,
    family: "market-making",
    verifiedBy: ["formula", "exhaustive-search"],
  },
  {
    id: "m8-lc3",
    module: 8,
    kind: "lessonCheck",
    difficulty: 2,
    tags: ["options"],
    minutes: 1,
    title: "Parity for the call",
    prompt: String.raw`A stock trades at 40, pays no dividends, and the interest rate is zero. A European put with strike 45 trades at 7. What is the no-arbitrage price, in dollars, of the European call with the same strike and expiry?`,
    answer: { type: "numeric", value: 2, exact: String.raw`C = P + S - K = 7 + 40 - 45 = 2` },
    hints: [
      "Put-call parity with zero rates.",
      String.raw`$C - P = S - K$.`,
      "C = 7 + 40 minus 45.",
    ],
    solution: String.raw`With zero interest, put-call parity reads $C - P = S - K$. Here $S - K = 40 - 45 = -5$, so the call is worth 5 less than the put.

$C = P + S - K = 7 + 40 - 45 = 2$ dollars. The stock is below the strike, so the put carries intrinsic value 5 and the call is pure time value. Answer: $2$.`,
    steps: ["Write C minus P = S minus K.", "S minus K = minus 5.", "C = 7 minus 5 = 2."],
    keyIdea: "Call minus put equals stock minus strike when rates are zero.",
    commonMistake: "Adding 5 instead of subtracting: the call is the cheaper option when the stock is below the strike.",
    fastPath: "Put minus five.",
    variation: "The stock is at 48 instead. Call price?",
    variationAnswer: String.raw`$C = 7 + 48 - 45 = 10$ dollars.`,
    family: "put-call-parity",
    verifiedBy: ["formula", "enumeration"],
  },
  {
    id: "m8-lc4",
    module: 8,
    kind: "lessonCheck",
    difficulty: 1,
    tags: ["fermi"],
    minutes: 1,
    title: "Quotes in a year",
    prompt: String.raw`A trader prices 30 customer requests an hour, for 6 hours a day, on 200 days a year. Using only these figures, how many requests does the trader price in a year? (An answer within 1% is accepted.)`,
    answer: { type: "numeric", value: 30 * 6 * 200, exact: String.raw`30 \cdot 6 \cdot 200 = 36{,}000`, tolerance: 360 },
    hints: [
      "Chain the rates: per hour, per day, per year.",
      "Per day: 30 times 6 = 180.",
      "Times 200 days.",
    ],
    solution: String.raw`Per day the trader prices $30 \cdot 6 = 180$ requests. Over 200 days that is $180 \cdot 200 = 36{,}000$ requests a year.

Any Fermi estimate is a chain like this one: write the factors, multiply, and keep the units straight. Answer: $36{,}000$.`,
    steps: ["Per day: 30 times 6 = 180.", "Per year: 180 times 200.", "36,000."],
    keyIdea: "Multiply the chain of rates and keep the units.",
    commonMistake: "Using 250 or 365 days instead of the stated 200.",
    fastPath: "180 a day, times 200 is 36,000.",
    variation: "The trader works 250 days instead. Requests per year?",
    variationAnswer: String.raw`$180 \cdot 250 = 45{,}000$.`,
    family: "fermi",
    verifiedBy: ["formula", "enumeration"],
  },
];
