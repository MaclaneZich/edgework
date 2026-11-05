import type { Lesson } from "../types";

/** Module 8 lesson: Market-making and estimation. */
export const lesson: Lesson = {
  intro: String.raw`"Make me a market on the number of windows in this building." Sooner or later every trading interview arrives at a sentence like that. It is not a trick and it is not about windows. The interviewer wants to see you turn a vague quantity into a number you believe, put a price on each side of it, trade against you, and then hear how you adjust when you have just been filled. This module is about doing that calmly.

Underneath the game sit a few ideas you already own. Fair value is a conditional expectation: what you have seen becomes a constant, what you have not seen keeps its mean. Width comes from two sources: how uncertain the value is, and how much of the flow you face knows more than you do. Adverse selection is Bayes' rule applied to a fill: the person who accepted your price was more likely to be informed than the person who walked away. Options enter because a quote is itself a pair of options you have written for free, and because put-call parity and the two-state model are the smallest pieces of derivatives thinking an interviewer expects you to hold.

Fermi estimation belongs here too. A market on "trades per year on this venue" is only as good as your decomposition of the number, and an honest range is the width of your market. By the end of this module you will be able to quote a fair value from partial information, size a half-spread against a stated informed fraction, update your fair after a trade, price a one- or two-period option by replication, and chain a Fermi estimate without losing a power of ten.`,

  cards: [
    {
      title: "Make me a market: the three questions",
      body: String.raw`A market is a bid (where you buy) and an offer (where you sell), each for a stated size. Behind every quote are three decisions.

- **Fair value**: your best estimate of what the thing is worth, the centre of the quote.
- **Width**: how far each side sits from fair. The half-spread $h$ is your fee for taking the other side.
- **Skew**: whether to shift the whole quote up or down, usually because of the position you already hold.

Say the quote out loud as a pair of numbers with a size: "I am 11.5 bid, 12.5 offered, for one." Never quote a single number; a single number is a fair value, not a market.`,
      formula: String.raw`\text{bid} = \hat{V} - h, \qquad \text{offer} = \hat{V} + h`,
      example: "Three dice with one shown as a 5: fair 12, so quote 11.5 at 12.5.",
    },
    {
      title: "Fair value is a conditional expectation",
      body: String.raw`The fair value of a contract is the expected payout given everything you know right now. Known parts are constants. Unknown parts contribute their conditional means, and linearity lets you add them even when they are dependent.

- Sum of three dice, one revealed as 5: $5 + 3.5 + 3.5 = 12$.
- Heads in ten flips, first four gave three heads: $3 + 6 \cdot \tfrac12 = 6$.
- Three cards from a deck, one shown as a 9: the other two come from the remaining 51 cards, mean $\tfrac{364 - 9}{51}$ each.

Ask how the information reached you. A die you chose before the roll is uninformative about the rest; "the largest die is 5" conditions the others to be at most 5. Selection changes the conditioning.`,
      formula: String.raw`\hat{V} = E[\,\text{payout} \mid \text{information}\,]`,
      example: "Without replacement, update the pool before taking the mean; with replacement, nothing changes.",
    },
    {
      title: "Width: uncertainty and informed flow",
      body: String.raw`Two things make a market wide. The first is plain uncertainty about the value: the more the payout can move against you between the fill and settlement, the more you need to be paid for carrying it. The second is who you are trading with.

Model the flow as a mix: a fraction $q$ of counterparties are informed (they know the value, which sits an edge $D$ away from your fair) and $1 - q$ are uninformed (they buy or sell at random). Each uninformed trade earns you $h$; each informed trade costs you $D - h$. Expected profit per trade is $(1 - q)h - q(D - h) = h - qD$.

So the break-even half-spread is $h = qD$: informed fraction times informed edge. At $q = 0.2$ and $D = 10$, you need a half-spread of 2 just to stand still. If the interviewer starts trading against you with confidence, raise your estimate of $q$ and widen.`,
      formula: String.raw`\pi(h) = h - qD, \qquad h_{\text{break-even}} = qD`,
      example: "Quote 96 at 104 on a 110-or-90 contract with 20% informed flow: profit per trade 4 minus 2 = 2.",
    },
    {
      title: "Adverse selection and the winner's curse",
      body: String.raw`The people who trade with you are not a random sample of the people who saw your price. Informed traders accept more often, and only on the side that hurts you. Every fill is therefore evidence.

- Posterior on the counterparty: $P(\text{informed} \mid \text{trade}) = \dfrac{q\,t_I}{q\,t_I + (1 - q)\,t_U}$, where $t_I, t_U$ are the trade probabilities of the two types.
- Posterior on the value: a buy order raises $P(\text{value is high})$. On a 110-or-90 contract with informed fraction $q$ who always trade the right way, $E[V \mid \text{buy}] = 100 + 10q$.

The winner's curse in auction language: you only win the trade when your price was the most attractive one around, which is exactly when it was most likely wrong. Price the side you are about to trade at the expectation given that someone wants to trade it.`,
      formula: String.raw`E[V \mid \text{buy}] = \frac{\sum_v v\, P(\text{buy} \mid v) P(v)}{\sum_v P(\text{buy} \mid v) P(v)}`,
      example: "Informed trade with probability 0.9, uninformed with 0.5, prior 20% informed: a fill makes it 18/58, about 31%.",
    },
    {
      title: "Inventory skew",
      body: String.raw`After you buy, you are long. If the value moves down you lose on that position before you can lay it off. Inventory does two things to the next quote.

- **Skew it.** Lower both bid and offer so you are more likely to sell and less likely to buy more. Long inventory: quote lower. Short inventory: quote higher.
- **Keep the width.** Skewing is not tightening; the spread still has to cover uncertainty and informed flow.

In the interview game, after each fill you should state your new position, your new fair (if the fill carried information), and the direction of the skew. "I am now long one at 12; the fill makes me slightly suspicious, so my fair drops to 11.8 and I show 11 at 12.3."`,
      formula: String.raw`\text{quote centre} = \hat{V} - \kappa \cdot \text{inventory}, \quad \kappa > 0`,
      example: "Bought twice in a row? Move the whole market down a tick and keep the width.",
    },
    {
      title: "Fermi decomposition and honest ranges",
      body: String.raw`A Fermi estimate breaks an unknown quantity into factors you can bound, multiplies them, and reports the result with a range. The product is only as good as the chain of units.

- Write the chain explicitly: trades per minute, times minutes per day, times days per year.
- Work in scientific notation: multiply the mantissas, add the exponents. $1.2 \times 10^9 \cdot 8 \times 10^1 \cdot 2.6 \times 10^3 \approx 25 \times 10^{13} = 2.5 \times 10^{14}$.
- Nearest power of ten: a mantissa below $\sqrt{10} \approx 3.16$ rounds down, above rounds up.
- Range: if each of three factors could be off by a factor of 2 in either direction, the product is typically off by about a factor of 3 (independent errors partly cancel: $2^{\sqrt{3}} \approx 3.3$); a factor of 8 is the worst case, not the expectation.

Then quote the market: fair at the point estimate, width from the range. An interviewer prefers 'about $4 \times 10^8$, somewhere between 2 and 8 hundred million' to a precise number you cannot defend.`,
      formula: String.raw`N = \prod_i f_i, \qquad \log_{10} N = \sum_i \log_{10} f_i`,
      example: "4,000 trades a minute, 390 minutes a day, 252 days: 1.56 million a day, about 390 million a year.",
    },
    {
      title: "Option payoffs and put-call parity",
      body: String.raw`A European call struck at $K$ pays $\max(S_T - K, 0)$ at expiry; a put pays $\max(K - S_T, 0)$. Long call plus short put with the same strike and expiry pays $S_T - K$ in every state, the payoff of a forward.

Replicating that forward today costs the stock price minus the present value of the strike, which gives parity: $C - P = S - K e^{-rT}$ (no dividends). With zero rates, $C - P = S - K$.

- Parity is model-free: volatility affects $C$ and $P$ equally and cancels from the difference.
- At the money ($S = K$) with positive rates, the call is worth more than the put by the interest on the strike.
- Given three of $C$, $P$, $S$ and $K e^{-rT}$, the fourth is fixed; any other price is an arbitrage.`,
      formula: String.raw`C - P = S - K e^{-rT}`,
      example: "Stock 50, strike 48, zero rates, call at 5.5: the put must be 3.5.",
    },
    {
      title: "The two-state model and delta",
      body: String.raw`Suppose the stock is $S_0$ today and will be either $S_u$ or $S_d$ in one period, with cash growing by a factor $R$. Any payoff $(V_u, V_d)$ can be copied with $\Delta$ shares and $B$ of cash: solve $\Delta S_u + BR = V_u$ and $\Delta S_d + BR = V_d$.

- **Delta** is the hedge ratio: $\Delta = \dfrac{V_u - V_d}{S_u - S_d}$, the payoff spread over the stock spread. Short an option? Hold $\Delta$ shares per option.
- **Price** is the portfolio cost $\Delta S_0 + B$. The real probability of the up move never appears.
- **Risk-neutral shortcut**: $p = \dfrac{R S_0 - S_d}{S_u - S_d}$ makes the stock grow like cash; the price is $\dfrac{p V_u + (1 - p) V_d}{R}$.

Multi-period trees are the same step repeated backwards from expiry. With constant up and down factors the risk-neutral $p$ is the same at every node.`,
      formula: String.raw`\Delta = \frac{V_u - V_d}{S_u - S_d}, \qquad p = \frac{R S_0 - S_d}{S_u - S_d}, \qquad V_0 = \frac{p V_u + (1-p) V_d}{R}`,
      example: "Stock 100 to 125 or 80, zero rates, 100 call: delta 5/9, price 100/9 about 11.1.",
    },
  ],

  workedExamples: [
    {
      title: "Quoting against partly informed flow",
      prompt: String.raw`A contract is worth 120 or 80 with equal probability; you do not know which. Each trade is with an informed customer with probability 0.3 (they know the value and trade the side that profits them) or an uninformed customer with probability 0.7 (they buy or sell at random). You quote $100 - h$ bid and $100 + h$ offer. What is your expected profit per trade as a function of $h$, and what half-spread breaks even?`,
      steps: [
        {
          text: "Fair value is the unconditional mean, since you have no information about which value is true.",
          math: String.raw`\hat{V} = \tfrac12 \cdot 120 + \tfrac12 \cdot 80 = 100`,
        },
        {
          text: "An uninformed customer buys at your offer or sells at your bid, each a half-spread away from fair, so the trade is worth h to you in expectation.",
          math: String.raw`E[\text{profit} \mid \text{uninformed}] = h`,
        },
        {
          text: "An informed customer buys at 100 + h only when the value is 120, or sells at 100 minus h only when it is 80. Either way you are wrong by the edge D = 20, less the half-spread you charged.",
          math: String.raw`E[\text{profit} \mid \text{informed}] = -(20 - h)`,
        },
        {
          text: "Weight the two cases by the informed fraction.",
          math: String.raw`\pi(h) = 0.7h - 0.3(20 - h) = h - 6`,
        },
        {
          text: "Break even where the profit is zero: the half-spread must equal the informed fraction times the informed edge.",
          math: String.raw`h = 0.3 \cdot 20 = 6 \quad\Rightarrow\quad \text{quote } 94 \text{ at } 106`,
        },
      ],
      answer: String.raw`\pi(h) = h - 6; \ \text{break-even half-spread } h = 6`,
    },
    {
      title: "A one-period call by replication",
      prompt: String.raw`A stock is at 50 and will be 65 or 40 next period. The interest rate is zero. Price a European call with strike 55 expiring next period.`,
      steps: [
        {
          text: "Write the call's payoff in each state.",
          math: String.raw`V_u = \max(65 - 55, 0) = 10, \qquad V_d = \max(40 - 55, 0) = 0`,
        },
        {
          text: "Find the number of shares that matches the payoff difference across the two states: delta.",
          math: String.raw`\Delta = \frac{10 - 0}{65 - 40} = \frac{10}{25} = 0.4`,
        },
        {
          text: "Choose the cash so that the portfolio matches the payoff in the down state (it then matches in the up state automatically).",
          math: String.raw`0.4 \cdot 40 + B = 0 \quad\Rightarrow\quad B = -16`,
        },
        {
          text: "The call must cost what the replicating portfolio costs today, or there is an arbitrage.",
          math: String.raw`C = \Delta S_0 + B = 0.4 \cdot 50 - 16 = 4`,
        },
        {
          text: "Check with the risk-neutral probability: the p that makes the stock's expected value equal 50.",
          math: String.raw`p = \frac{50 - 40}{65 - 40} = 0.4, \qquad C = 0.4 \cdot 10 + 0.6 \cdot 0 = 4`,
        },
      ],
      answer: String.raw`C = 4 \ (\Delta = 0.4,\ \text{borrow } 16)`,
    },
  ],

  tryIt: {
    prompt: String.raw`You are quoting 9 bid, 11 offer on a contract whose fair value is 10. Of the trades you receive, 90% are with uninformed customers, on which you earn the half-spread in expectation, and 10% are with informed customers, each of which costs you 6 dollars. What is your expected profit per trade, in dollars?`,
    answer: { type: "numeric", value: 0.3, exact: String.raw`0.9 \cdot 1 - 0.1 \cdot 6 = 0.3` },
    solution: String.raw`The half-spread is 1 (your prices sit 1 away from the fair value of 10), so an uninformed trade is worth $+1$ to you in expectation whichever side they take.

Weighting the two kinds of trade: $0.9 \cdot 1 - 0.1 \cdot 6 = 0.9 - 0.6 = 0.3$ dollars per trade. The quote makes money, but only just: if the informed fraction rose above $1/7 \approx 14\%$ the same quote would lose, and you would have to widen.`,
  },

  checkIds: ["m8-lc1", "m8-lc2", "m8-lc3", "m8-lc4"],

  formulas: [
    {
      name: "Fair value",
      latex: String.raw`\hat{V} = E[\text{payout} \mid \text{information}]`,
      note: "Known parts are constants; unknown parts contribute their conditional means (linearity handles dependence).",
    },
    {
      name: "Quote from fair and half-spread",
      latex: String.raw`\text{bid} = \hat{V} - h, \qquad \text{offer} = \hat{V} + h`,
      note: "Always quote two prices and a size; skew the centre against your inventory.",
    },
    {
      name: "Profit per trade against mixed flow",
      latex: String.raw`\pi(h) = (1 - q)h - q(D - h) = h - qD`,
      note: "q = informed fraction, D = informed edge; uninformed pay the half-spread, informed collect the edge.",
    },
    {
      name: "Break-even half-spread",
      latex: String.raw`h^{*} = qD`,
      note: "Width needed to stand still against informed flow; wider when q or D grows.",
    },
    {
      name: "Posterior that the counterparty is informed",
      latex: String.raw`P(I \mid \text{trade}) = \frac{q\,t_I}{q\,t_I + (1 - q)\,t_U}`,
      note: "t_I and t_U are the trade probabilities of informed and uninformed customers; a fill raises the odds of 'informed'.",
    },
    {
      name: "Fair value after a buy order",
      latex: String.raw`E[V \mid \text{buy}] = \frac{\sum_v v\,P(\text{buy} \mid v)P(v)}{\sum_v P(\text{buy} \mid v)P(v)}`,
      note: "Price the side being traded at the expectation given someone chose to trade it; two-point case gives 100 + 10q on a 110/90 contract.",
    },
    {
      name: "Pick-off cost of a stale quote",
      latex: String.raw`E[\text{loss}] = \sum_{\text{scenarios}} P(s)\,\max(V_s - \text{offer}, 0) + \sum_{\text{scenarios}} P(s)\,\max(\text{bid} - V_s, 0)`,
      note: "Expected loss to a faster trader who hits whichever side is wrong after news; widen or pull before announcements.",
    },
    {
      name: "Expected maximum of two dice",
      latex: String.raw`E[\max] = \sum_{k=1}^{6}\left(1 - \left(\tfrac{k-1}{6}\right)^2\right) = \tfrac{161}{36}`,
      note: "Tail-sum formula; the minimum follows from min + max = sum, so E[min] = 91/36.",
    },
    {
      name: "Option payoffs at expiry",
      latex: String.raw`C_T = \max(S_T - K, 0), \qquad P_T = \max(K - S_T, 0)`,
      note: "Intrinsic value; never negative.",
    },
    {
      name: "Put-call parity",
      latex: String.raw`C - P = S - K e^{-rT}`,
      note: "Model-free; with zero rates C - P = S - K. At the money with r > 0 the call is worth more.",
    },
    {
      name: "Two-state model",
      latex: String.raw`\Delta = \frac{V_u - V_d}{S_u - S_d}, \qquad p = \frac{R S_0 - S_d}{S_u - S_d}, \qquad V_0 = \frac{pV_u + (1-p)V_d}{R}`,
      note: "Replicate with delta shares and cash, or take the risk-neutral expectation and discount; repeat backwards for multi-period trees.",
    },
    {
      name: "Fermi chain and nearest power of ten",
      latex: String.raw`N = \prod_i f_i, \qquad \log_{10} N = \sum_i \log_{10} f_i`,
      note: "Multiply mantissas, add exponents; a mantissa below about 3.16 rounds down to the lower power of ten.",
    },
  ],

  outro: String.raw`In a live interview the market-making question is a game, not a calculation. The interviewer names a quantity, you ask one or two clarifying questions, state a fair value with a sentence of reasoning, and quote a two-sided market with a size. Then they trade. "I buy." Now you are short, and the fact that they bought is information: your fair should tick up and your quote should skew up, but you must say why, out loud, and keep your width. They may trade again on the same side to see whether you keep updating or dig in. They may ask "why that width?" and the answer they want is the one from this module: uncertainty in the value plus the chance that the person across the table knows more than you do.

Practise the rhythm, not just the arithmetic. Fair value in one breath, half-spread justified in the next, then a quote in the form "bid at offer, for size". After each fill, three short sentences: your new position, your new fair, your new quote. If they announce news, pull or widen before they can pick you off, and say that you are doing it because a stale quote is a free option. For Fermi markets, state the decomposition first; a good interviewer will trade against your factors one at a time.

Next: Module 9 is logic and brainteasers, a different muscle. Before you leave this module, redo the difficulty 3 quoting problems until the formula h minus qD is reflex, and do the two-period tree once more by replication without looking at the risk-neutral shortcut; the shortcut is only trustworthy once you can show where it comes from.`,
};
