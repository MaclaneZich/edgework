import type { Lesson } from "../types";

/** Module 7 lesson: Betting, EV decisions, and games. */
export const lesson: Lesson = {
  intro: String.raw`Trading interviews love games because a game is a trade with the noise removed. Someone offers you a die roll for \$4, a reroll for a quarter, a bet at 3-to-1, a sealed-bid auction. You have to say a number, explain it in one breath, and then survive the follow-up: "and if the payout changes to this?" The question is rarely about arithmetic. It is about whether you can price an option (the right to stop or continue), think one move ahead of an opponent, and size a bet so that being right pays and being wrong does not end you.

This module gives you the small toolkit that answers almost all of these. First, fair value: a game is worth its expected payout, and a price above or below that is the edge. Second, the stop-or-continue rule: compare what you hold with the value of what remains, solved from the end backwards. Third, backward induction in two-player games, where positions rather than payoffs are labelled winning or losing. Fourth, sizing: Kelly tells you why a positive-expectation bet can still ruin you if you bet too much of it. Then auctions, where first-price and second-price call for opposite instincts, and a toy poker game, where the right strategy is to make the other player indifferent.

By the end you will be able to value a reroll in ten seconds, find the winning move in a take-away game by writing down six labels, size a 55% coin, bid correctly in either auction format, and explain why the "always switch envelopes" argument fails. The practice set then stacks these ideas the way an interviewer would: a reroll game where a 1 busts you, a duel where the rival moves second and wins ties, and a full solution of the three-card bluffing game.`,

  cards: [
    {
      title: "Fair value and the price of a game",
      body: String.raw`A game is worth its expected payout. That number is the **fair price**: paying less is positive expectation, paying more is negative. Everything else in this module is a refinement of that one comparison.

- Roll a die, get the face: the payouts 1 to 6 are equally likely, so the fair price is their mean, $3.5$. For a uniform spread the mean is the midpoint.
- Draw a card, get the rank with jacks, queens and kings worth 10: collapse 52 cards to 13 equally likely ranks and average, $\frac{55 + 30}{13} \approx 6.54$.
- Asymmetric bets: win \$8 on a 7 or 11 with two dice, lose \$2 otherwise. Expected profit is $\frac{8}{36}(8) - \frac{28}{36}(2) = \frac{2}{9}$. A rare large win can beat a frequent small loss.

Say the fair value, then say the edge. "Fair is 3.50, you are charging 4, so I lose 50 cents a play, I pass" is the full answer.`,
      formula: String.raw`\text{fair price} = E[\text{payout}] = \sum_x x\,P(X = x), \qquad \text{edge} = E[\text{payout}] - \text{price}`,
      example: "Face of a die for 4 dollars: fair 3.50, edge -0.50 per play.",
    },
    {
      title: "Stop or continue: the continuation value",
      body: String.raw`When you may stop and take what you hold or carry on, the rule is: **stop if what you hold beats the expected value of continuing.** That expected value is the *continuation value*, and it is computed from the end of the game backwards.

- One optional reroll of a die: the forced last roll is worth $3.5$, so keep $4, 5, 6$ and reroll $1, 2, 3$. Value $\frac{4 + 5 + 6}{6} + \frac36(3.5) = 4.25$.
- Two optional rerolls: the continuation value is now $4.25$, so keep only $5, 6$ on the first roll. Value $\frac{11}{6} + \frac46(4.25) = \frac{14}{3}$. The threshold rises as more chances remain.
- Without replacement the continuation value depends on what you saw: discarding a card numbered $x$ from 1 to 10 leaves a pool averaging $\frac{55 - x}{9}$.
- Unlimited rerolls at a fee: the game renews, so the continuation value is the game's own value $V$. Guess the keep-set, solve the linear equation for $V$, check the threshold is self-consistent.

Trap: compare with the value of *what remains*, not with the value of a single roll. With three rolls a 4 is a reroll, with two it is a keeper.`,
      formula: String.raw`V_k = E\big[\max(X,\ V_{k-1})\big], \qquad V_1 = E[X]`,
      example: "Die, up to three rolls: 3.5, then 4.25, then 14/3 = 4.667.",
    },
    {
      title: "Backward induction in two-player games",
      body: String.raw`In a take-away game, label each position **W** (the player about to move can force a win) or **L** (they cannot). Start from the terminal positions and work upwards: a position is W if *some* legal move reaches an L position, and L if *every* move reaches a W position (or there is no legal move).

- Moves 1 or 2, last chip wins: L positions are the multiples of 3. From 7 take 1 to leave 6.
- Moves 2 or 3 (a lone chip means you are stuck and lose): L positions are 0 or 1 mod 5. From 12 take 2 to leave 10.
- Moves 1, 3 or 4: L positions are 0 or 2 mod 7. From 20 take 4 to leave 16.

The labels become periodic once you have a full window of them, so you rarely need to go far. Write the L list, find the one move that lands on it, then mirror the opponent to stay on it. For "last chip loses" (misère) redo the table with the terminal labels flipped; do not guess that the answer just shifts by one.`,
      formula: String.raw`W(n) \iff \exists\, m \in M:\ m \le n \text{ and } \neg W(n - m)`,
      example: "Write the losing positions as a residue class mod (period); the winning move is whatever reaches it.",
    },
    {
      title: "Break-even probability and asymmetric payouts",
      body: String.raw`A bet that risks $S$ to win $W$ has expected profit $pW - (1 - p)S$. It breaks even at $p^* = \frac{S}{S + W}$: the stake as a fraction of the total at risk from both sides. For odds quoted as "$b$ to 1" that is $p^* = \frac{1}{b + 1}$.

- Risk 5 to win 12: $p^* = \frac{5}{17} \approx 0.29$. Risk 1 to win 4: $p^* = \frac15$.
- The interview move: they state the odds and ask "would you take it?" Answer with the break-even probability, then compare it with your honest estimate of the true probability. Above break-even, take it; below, pass.
- Pot odds in poker are the same object: calling 1 to win a pot of 5 needs the bluff to be live one time in six.

Trap: using $\frac{S}{W}$ (the odds ratio) instead of $\frac{S}{S + W}$. Risk 5 to win 12 breaks even at $\frac{5}{17}$, not $\frac{5}{12}$.`,
      formula: String.raw`p^* = \frac{S}{S + W} = \frac{1}{b + 1} \quad (\text{odds } b \text{ to } 1)`,
      example: "4 to 1 pays off at p = 0.2; if you think the true chance is 0.25 the bet earns 0.25 per dollar staked.",
    },
    {
      title: "Kelly: edge over odds, and why half-Kelly",
      body: String.raw`Repeatedly staking a fraction $f$ of your bankroll on a bet that pays $b$ to 1 with win probability $p$ grows wealth at the rate $g(f) = p\ln(1 + bf) + q\ln(1 - f)$ per bet, where $q = 1 - p$. Maximising $g$ gives the **Kelly fraction** $f^* = p - \frac{q}{b}$, which is the edge per dollar ($pb - q$) divided by the odds $b$.

- Even money with $p = 0.55$: $f^* = 0.10$. Odds 2.5 to 1 with $p = 0.4$: $f^* = 0.4 - 0.24 = 0.16$.
- Growth at twice Kelly is about zero and beyond that it is negative: a 55% coin staked at 20% goes nowhere, staked at 40% loses almost surely, even though every single bet has positive expected value. The mean of wealth grows; the typical path does not.
- **Half-Kelly** keeps about three quarters of the growth with half the swings (the growth curve is a parabola near its peak, so halving $f$ costs a quarter of the height). Real desks size well below full Kelly because $p$ is never known exactly, and over-estimating it pushes you past the peak.

Quote the growth rate as the expected log, not as the expected return. For $p = 0.3$ at 3 to 1, $f^* = \frac{1}{15}$ and $g^* = 0.3\ln\frac65 + 0.7\ln\frac{14}{15} \approx 0.0064$ per bet.`,
      formula: String.raw`f^* = p - \frac{q}{b}, \qquad g(f) = p\ln(1 + bf) + q\ln(1 - f), \qquad g\!\left(\tfrac{f^*}{2}\right) \approx \tfrac34\, g(f^*)`,
      example: "60% coin, even money: Kelly 20%, growth about 2.0% per bet; half-Kelly 10% grows about 1.5% per bet.",
    },
    {
      title: "Auctions: first price versus second price",
      body: String.raw`**Second price** (winner pays the loser's bid): bid your true value. Your bid only decides whether you win; the price is set by the other bidder. Bidding your value wins exactly the cases where the price is below your value, so it is weakly dominant whatever the rival does. Expected revenue is the second-highest value: for two die-roll bidders, $E[\min] = \frac{91}{36}$.

**First price** (winner pays own bid): shade. Profit is (value minus bid) times the probability the bid wins; raising the bid trades margin for probability. With two bidders whose values are uniform on $[0, 1]$ the equilibrium is to bid half your value; with $n$ bidders, $\frac{n-1}{n}$ of it. Against a rival who bids half her value, your best response at value 80 is $\frac{80}{2} = 40$: maximise $(80 - b)\cdot\frac{b}{50}$.

The two formats produce the same expected revenue when bidders are symmetric and risk-neutral (revenue equivalence), but the *bids* are completely different. Interviewers check that you do not shade in a second-price auction or bid your value in a first-price one.`,
      formula: String.raw`\text{second price: } b = v; \qquad \text{first price, } n \text{ uniform bidders: } b = \frac{n - 1}{n}\,v`,
      example: "Value 70, second price: bid 70. Value 80, first price against one uniform rival: bid 40.",
    },
    {
      title: "Indifference and mixed strategies in toy poker",
      body: String.raw`Three cards (High, Mid, Low), one each to Ann and Ben, antes in the pot, Ann may bet, Ben may call or fold. The structure is always the same: Ann bets High for value, checks Mid, and bluffs Low *sometimes*; Ben calls High, folds Low, and calls Mid *sometimes*. The "sometimes" are set by **indifference**: each mixed probability is chosen so that the other player's marginal decision has zero expected gain either way.

- Ann's bluff frequency makes Ben's Mid indifferent to calling. Given a bet, Ben needs $P(\text{bluff}) \ge \frac{\text{call}}{\text{pot} + \text{bet} + \text{call}}$ (pot odds), so the ratio of bluffs to value bets is $\frac{\text{bet}}{\text{pot} + \text{bet}}$. Pot 2, bet 1: bluff one time in three; pot 4, bet 1: one time in five.
- Ben's calling frequency makes Ann's Low indifferent between bluffing and checking. Remember that half of Ann's bluffs run into High and are always called.
- The value of the game is then just Ann's average net result over the six deals under those strategies. Pot 4, bet 1 gives Ann $\frac{1}{10}$ per hand; pot 2, bet 1 gives $\frac{1}{18}$.

Interviewers ask this as "how often should you bluff?" and accept the pot-odds answer only if you can say *why*: bluffing more makes Ben always call; bluffing less makes him always fold, and either pure response costs you money.`,
      formula: String.raw`\frac{\#\text{bluffs}}{\#\text{value bets}} = \frac{\text{bet}}{\text{pot} + \text{bet}}, \qquad \text{indifference: } E[\text{call}] = E[\text{fold}]`,
      example: "Antes 2 each, bet 1: Ann bluffs Low with probability 1/5, Ben calls Mid with probability 3/5.",
    },
    {
      title: "Secretary-style stopping: skip, then take the first record",
      body: String.raw`You see candidates one at a time in random order, learn only relative ranks, and must accept or reject on the spot. The good rules are **cutoff rules**: reject the first $k$, then accept the first candidate who beats everyone so far. The rule succeeds (hires the best) when the best sits at position $j > k$ and the best of the earlier $j - 1$ lies within the first $k$, which has probability $\frac{k}{j-1}$.

- $P_k = \frac{k}{n}\sum_{j = k + 1}^{n}\frac{1}{j - 1}$. For $n = 5$ the best cutoff is $k = 2$ with $P = \frac{13}{30}$; for $n = 7$ it is again $k = 2$ with $P = \frac{29}{70}$.
- For large $n$ skip about $\frac{n}{e}$ and succeed with probability about $\frac1e \approx 0.37$, far above the $\frac1n$ of guessing.
- For small $n$ do not trust $n/e$ blindly: compute $P_k$ for the two or three plausible $k$ and compare. With a relaxed goal ("best or second best") decompose the success event by which top candidate gets hired and add the pieces.

Everything here is checkable by brute force over the $n!$ orderings, which is exactly how the practice set verifies it.`,
      formula: String.raw`P_k = \frac{k}{n}\sum_{j = k + 1}^{n}\frac{1}{j - 1} \ \xrightarrow{\ n \to \infty\ }\ \max_k P_k \approx \frac1e`,
      example: "Five candidates: skip two, then take the first record: 13/30, about 43%.",
    },
    {
      title: "Traps: EV is not the whole story",
      body: String.raw`- **You can go broke.** A bet with positive expectation, staked too large, has negative growth; after enough rounds you are almost surely down. Expectation describes the average over imaginary parallel bankrolls; you only live one path. Size with Kelly or below.
- **Infinite expectation is a bookkeeping artefact.** A prize that doubles each flip until the first head has infinite expected value, but any real payer has a cap. With a cap $C$ the value is (number of uncapped doublings) $\times \frac12$ plus $C$ times the tail probability: cap \$500 gives $\frac92 + \frac{500}{512} \approx 5.48$. Each doubling of the cap adds just 50 cents.
- **Conditional probabilities need a prior.** "The other envelope holds $2X$ or $X/2$ with probability one half each, for every $X$" cannot be true under any distribution of amounts; at the smallest possible $X$ the other envelope is surely larger, at the largest surely smaller. Under any genuine prior the average gain from switching is exactly zero.
- **Who moves second matters.** In a duel with one reroll each, the player who sees the target, wins ties and rerolls only when behind wins about 64% of the time. Symmetric-looking games are often not.
- **Symmetry can hide fairness.** Two scores with distributions symmetric about the same centre give a fair game whatever their spreads: the sum of two dice against double a single die is exactly even.`,
      formula: String.raw`E[\min(2^{k-1}, C)] = \frac{\lfloor \log_2 C \rfloor + 1}{2} + \frac{C}{2^{\lfloor \log_2 C \rfloor + 1}}`,
      example: "A 60% coin staked at 50% has growth 0.6 ln 1.5 + 0.4 ln 0.5 = -0.034 per bet: positive EV, almost sure ruin.",
    },
  ],

  workedExamples: [
    {
      title: "A reroll that costs fifty cents",
      prompt: String.raw`You roll a fair die and are paid the face in dollars. After the first roll you may pay 50 cents to reroll once; you must then take the second roll. What is the optimal strategy and the value of the game?`,
      steps: [
        {
          text: "Start at the end. If you reroll, you pay 0.50 and receive a fresh roll worth 3.5 on average. The continuation value is the net of the two.",
          math: String.raw`V_{\text{cont}} = 3.5 - 0.5 = 3`,
        },
        {
          text: "Compare each first-roll face with the continuation value. Keep a face that beats 3, reroll a face below 3; a 3 is exactly indifferent.",
          math: String.raw`\text{keep } \{3, 4, 5, 6\}\ (\text{or } \{4,5,6\}), \qquad \text{reroll } \{1, 2\}`,
        },
        {
          text: "Average over the first roll. Faces 3 to 6 pay themselves (a kept 3 pays 3, the same as rerolling it); faces 1 and 2 are worth the continuation value 3.",
          math: String.raw`V = \frac{3 + 3 + 3 + 4 + 5 + 6}{6} = \frac{24}{6} = 4`,
        },
        {
          text: "Sanity-check against the free-reroll game, worth 4.25 with keep-set {4, 5, 6}. The fee costs you 0.25 in value and makes a 3 a keeper rather than a reroll. The option is still worth 0.50 over a plain roll.",
          math: String.raw`4.25 - 4 = 0.25 = 0.5 \times P(\text{reroll in the free game}) = 0.5 \times \tfrac36`,
        },
      ],
      answer: "Keep 3 or better (3 is indifferent), reroll 1 and 2. Value 4 dollars.",
    },
    {
      title: "Bluffing and calling frequencies at pot 2, bet 1",
      prompt: String.raw`Ann and Ben each ante \$1. From High, Mid and Low each gets one card. Ann may check or bet \$1; on a bet Ben folds or calls \$1. Ann bets High, checks Mid, and bluffs Low with probability $\beta$. Ben calls High, folds Low, and calls Mid with probability $c$. Find the $\beta$ and $c$ that make each player's marginal decision indifferent.`,
      steps: [
        {
          text: "Ben holds Mid and faces a bet. Before the bet Ann held High or Low with equal probability; she bets with probability 1 from High and beta from Low. Update with Bayes.",
          math: String.raw`P(\text{Low} \mid \text{bet}) = \frac{\beta}{1 + \beta}, \qquad P(\text{High} \mid \text{bet}) = \frac{1}{1 + \beta}`,
        },
        {
          text: "Relative to folding, a call costs 1 and, against a bluff, wins the pot of 2 plus Ann's bet of 1: a gain of 3. Against High it loses the 1. Set the expected gain to zero.",
          math: String.raw`3\cdot\frac{\beta}{1 + \beta} - 1\cdot\frac{1}{1 + \beta} = 0 \ \Rightarrow\ \beta = \frac13`,
        },
        {
          text: "Check it against the pot-odds rule: bluffs to value bets should equal bet over pot plus bet, which is 1/3. Ann bets High always and Low one time in three, so the ratio is 1 : 3.",
          math: String.raw`\frac{\text{bet}}{\text{pot} + \text{bet}} = \frac{1}{2 + 1} = \frac13`,
        },
        {
          text: "Now Ann holds Low. Checking loses her ante: net -1. Bluffing runs into High half the time (always called, net -2) and Mid half the time (called with probability c for -2, folded otherwise for +1). Equate the two.",
          math: String.raw`\frac12(-2) + \frac12\big(-2c + (1 - c)\big) = -1 \ \Rightarrow\ -\frac12 - \frac32 c = -1 \ \Rightarrow\ c = \frac13`,
        },
        {
          text: "With these frequencies neither player can gain by changing their mixed decision, which is what makes the pair an equilibrium. Averaging Ann's net result over the six deals gives the value of the game.",
          math: String.raw`\text{value to Ann} = \frac16\left(\frac43 + 1 - 1 + 1 - \frac43 - \frac23\right) = \frac{1}{18}`,
        },
      ],
      answer: String.raw`\beta = \tfrac13,\quad c = \tfrac13,\quad \text{game value } \tfrac{1}{18} \text{ to Ann}`,
    },
  ],

  tryIt: {
    prompt: String.raw`Priya rolls one fair die and scores its face. Tom rolls two fair dice and scores the larger face. The higher score wins and ties go to Priya. What is the probability that Tom wins?`,
    answer: { type: "numeric", value: 125 / 216, exact: String.raw`1 - \tfrac{1}{6}\sum_{a=1}^{6}\left(\tfrac{a}{6}\right)^2 = 1 - \tfrac{91}{216} = \tfrac{125}{216} \approx 0.579` },
    solution: String.raw`Condition on Priya's roll $a$. Priya wins (ties included) exactly when both of Tom's dice are at most $a$, which has probability $\left(\frac{a}{6}\right)^2$. Averaging over the six equally likely values of $a$: $P(\text{Priya wins}) = \frac{1}{6}\cdot\frac{1 + 4 + 9 + 16 + 25 + 36}{36} = \frac{91}{216}$.

Tom wins otherwise: $1 - \frac{91}{216} = \frac{125}{216} \approx 0.579$. The second die is worth a lot more than the tie rule: without ties going to Priya, Tom would also win the $\frac{1}{6}\sum_a \frac{2a - 1}{36} = \frac{36}{216}$ of outcomes that tie, and his chance would rise to $\frac{161}{216}$.

Fast route: Tom loses only when his maximum is at most Priya's face, and $P(\max \le a) = (a/6)^2$ is the standard "max of two dice" fact from the dice-sums family.`,
  },

  checkIds: ["m7-lc1", "m7-lc2", "m7-lc3", "m7-lc4"],

  formulas: [
    {
      name: "Fair price of a game",
      latex: String.raw`\text{fair price} = E[\text{payout}]`,
      note: "Pay less than this for positive expectation; the difference is the edge per play.",
    },
    {
      name: "Stop-or-continue rule",
      latex: String.raw`\text{stop at } x \iff x \ge V_{\text{cont}}, \qquad V_k = E[\max(X, V_{k-1})]`,
      note: "Continuation value is the value of what remains, computed from the last stage backwards.",
    },
    {
      name: "Renewal stopping with a fee",
      latex: String.raw`V = -c + \sum_{x \ge t}\frac{x}{6} + P(X < t)\,V \ \Rightarrow\ V = \frac{-c + \sum_{x \ge t} x/6}{P(X \ge t)}`,
      note: "Unlimited rerolls: guess the keep-set, solve for V, confirm the threshold t is consistent with V.",
    },
    {
      name: "Winning and losing positions",
      latex: String.raw`W(n) \iff \exists\, m \in M,\ m \le n,\ \neg W(n - m)`,
      note: "Take-away games: label from the terminal position upward; the losing positions become periodic.",
    },
    {
      name: "Break-even probability",
      latex: String.raw`p^* = \frac{S}{S + W} = \frac{1}{b + 1}`,
      note: "Risk S to win W, or odds b to 1; take the bet only if your estimate of p exceeds p*.",
    },
    {
      name: "Kelly fraction",
      latex: String.raw`f^* = p - \frac{q}{b} = \frac{pb - q}{b}`,
      note: "Edge per dollar over odds; even money gives p - q. Stake less when p is uncertain.",
    },
    {
      name: "Growth rate of proportional betting",
      latex: String.raw`g(f) = p\ln(1 + bf) + q\ln(1 - f)`,
      note: "Expected log wealth per bet; zero near 2f*, negative beyond; half-Kelly keeps about 3/4 of g(f*).",
    },
    {
      name: "First-price equilibrium bid (uniform values)",
      latex: String.raw`b(v) = \frac{n - 1}{n}\,v`,
      note: "n bidders with values uniform on [0, 1]; two bidders shade to half. Second price: bid v.",
    },
    {
      name: "Second-price expected revenue",
      latex: String.raw`E[\text{revenue}] = E[V_{(n-1)}] = \sum_{k \ge 1} P(\text{second highest} \ge k)`,
      note: "Second-highest value; for two bidders that is E[min], a tail sum.",
    },
    {
      name: "Cutoff rule success probability",
      latex: String.raw`P_k = \frac{k}{n}\sum_{j = k + 1}^{n}\frac{1}{j - 1}`,
      note: "Skip k, then take the first record; optimum near n/e with success about 1/e for large n.",
    },
    {
      name: "Bluff-to-value ratio",
      latex: String.raw`\frac{\#\text{bluffs}}{\#\text{value bets}} = \frac{\text{bet}}{\text{pot} + \text{bet}}`,
      note: "Makes the caller indifferent at pot odds; the caller's frequency is set by the bluffer's indifference.",
    },
    {
      name: "Capped doubling prize",
      latex: String.raw`E = \frac{m}{2} + \frac{C}{2^m}, \quad m = \lfloor \log_2 C \rfloor + 1`,
      note: "First head on flip k pays 2^(k-1), capped at C; m prizes are uncapped and contribute 1/2 each.",
    },
  ],

  outro: String.raw`In a trading interview these questions are almost never asked once. The interviewer offers the die game at \$3, you take it; they raise the price to \$4, you decline; they add a reroll and ask what you would pay now; then a second reroll; then they charge for the reroll. Each step tests the same reflex: name the continuation value, compare, and give a number with the reasoning in one sentence. Practise saying the stop-or-continue argument out loud until "the rest of the game is worth 4.25, so I only keep a 5 or a 6" comes out without a pause.

The sizing questions come in the same escalating form. "Would you take this 55% coin at even money?" Yes. "How much of your bankroll?" About 10%, half that in practice. "Why not all of it?" Because the growth rate is negative past 20% and I would be broke with probability one. Say Kelly, say half-Kelly, and be ready to write $g(f)$. For auctions, know which format you are in before you speak: shade in first price, bid value in second price. For the bluffing game, get to the pot-odds ratio quickly and then explain the indifference logic, because the follow-up is always "what if the pot were bigger?"

To practise next: redo every reroll problem with a fee or a bust face, re-solve each take-away game as misère, and for the signalling game change the antes and recompute both frequencies. The brainteaser bank in module 9 has more two-player games, and module 8 turns the same expected-value reflex toward quoting markets.`,
};
