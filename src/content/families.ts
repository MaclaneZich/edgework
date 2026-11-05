import type { Family } from "./types";

/**
 * Classic problem families that circulate in quant interviews. Problems reference a
 * family by id; the formula sheet shows this index with the one-line trick for each.
 * The families are public-domain ideas; every Edgework problem that uses one is written
 * fresh with its own framing and numbers.
 */
export const FAMILIES: Family[] = [
  { id: "at-least-one", name: "At least one", module: 1, trick: "Compute the probability of none and subtract from one." },
  { id: "birthday", name: "Birthday collisions", module: 1, trick: "P(no collision) is a product of shrinking fractions; about sqrt(2N ln 2) draws give a 50% collision chance." },
  { id: "stars-and-bars", name: "Stars and bars", module: 1, trick: "k identical items into n bins: choose(k + n - 1, n - 1); force one per bin first if bins must be non-empty." },
  { id: "inclusion-exclusion", name: "Inclusion-exclusion", module: 1, trick: "Add singles, subtract pairs, add triples; for symmetric events it collapses to a binomial sum." },
  { id: "derangement", name: "Derangements", module: 1, trick: "No fixed points: n!/e rounded; the probability tends to 1/e ≈ 0.368 fast." },
  { id: "committee", name: "Committees and teams", module: 1, trick: "Choose the constrained members first, then fill the rest; divide by k! for unlabelled groups." },
  { id: "arrangements-with-blocks", name: "Blocks and separations", module: 1, trick: "Glue items that must be adjacent into one block; for 'not adjacent' count the complement or place gaps." },
  { id: "lattice-paths", name: "Lattice paths", module: 1, trick: "A path of R rights and U ups is a word; count choose(R + U, R), and subtract paths through a forbidden point by multiplying the two halves." },
  { id: "pairings", name: "Pairings and matchings", module: 1, trick: "Pair up 2n people in (2n)!/(2^n n!) ways: pick a partner for the first unmatched person each time." },
  { id: "matching-socks", name: "Drawing until a match", module: 2, trick: "Think about the last item drawn or use symmetry; with and without replacement differ only in the denominator." },
  { id: "dice-sums", name: "Dice sums and maxima", module: 2, trick: "P(max <= k) = (k/6)^n; sums of two dice count lattice points on a diagonal." },
  { id: "symmetry", name: "Symmetry arguments", module: 2, trick: "If the question is symmetric under swapping labels, the probability is 1 over the number of symmetric roles." },
  { id: "broken-stick", name: "Broken stick and uniform points", module: 2, trick: "Draw the unit square (or simplex) and measure the region; triangle inequalities become half-plane cuts." },
  { id: "bertrand-box", name: "Bertrand's boxes", module: 3, trick: "Condition on the object you observed, not on the container you think you picked." },
  { id: "monty-hall", name: "Monty Hall", module: 3, trick: "The host's choice is informative only when it was constrained; switching wins 2/3 with a knowing host." },
  { id: "two-children", name: "Two children", module: 3, trick: "Ask how the information was generated; 'at least one boy' gives 1/3, 'the elder is a boy' gives 1/2." },
  { id: "false-positive", name: "False positives", module: 3, trick: "Work with 10,000 people: compute true positives and false positives as counts, then divide." },
  { id: "sequential-updating", name: "Sequential updating", module: 3, trick: "Multiply likelihood ratios; the posterior odds after several independent signals is the product of ratios." },
  { id: "coupon-collector", name: "Coupon collector", module: 4, trick: "Sum of geometric waits: n(1 + 1/2 + ... + 1/n) ≈ n ln n + 0.577n." },
  { id: "fixed-points", name: "Fixed points and matches", module: 4, trick: "Indicator per position: expected matches equal the number of positions times the per-position probability." },
  { id: "expected-max", name: "Expected maximum", module: 4, trick: "E[max] = sum over k of P(max >= k); for dice use P(max >= k) = 1 - ((k-1)/6)^n." },
  { id: "linearity-of-expectation", name: "Linearity of expectation", module: 4, trick: "Expectation of a sum is the sum of expectations, independent or not; write the quantity as a sum of indicators." },
  { id: "order-statistics", name: "Order statistics", module: 4, trick: "For n uniforms the k-th smallest has mean k/(n+1); the gaps are exchangeable." },
  { id: "ants-on-stick", name: "Ants on a stick", module: 4, trick: "Collisions that swap directions are the same as ants passing through; track the positions, not the identities." },
  { id: "two-envelopes", name: "Two envelopes", module: 7, trick: "There is no uniform prior on all amounts; fix the prior and the paradox disappears." },
  { id: "st-petersburg", name: "St. Petersburg and infinite EV", module: 7, trick: "Infinite expectation does not mean infinite value; cap the bankroll or use utility." },
  { id: "normal-approximation", name: "Normal approximation", module: 5, trick: "Mean and variance of the sum, then z-score with a half-step continuity correction." },
  { id: "variance-of-sums", name: "Variance of sums", module: 5, trick: "Var(X+Y) = Var X + Var Y + 2 Cov; independent terms simply add." },
  { id: "pattern-waiting", name: "Waiting for a pattern", module: 6, trick: "Set up first-step equations on the progress states; HH waits 6 flips, HT waits 4." },
  { id: "gamblers-ruin", name: "Gambler's ruin", module: 6, trick: "Fair game: P(reach N before 0 from k) = k/N and expected duration k(N-k); biased game uses (q/p)^k." },
  { id: "random-walk", name: "Random walk hitting times", module: 6, trick: "Condition on the first step; expected time to leave an interval from the midpoint is the product of distances." },
  { id: "absorbing-chain", name: "Absorbing Markov chains", module: 6, trick: "One linear equation per transient state; solve the small system." },
  { id: "dice-reroll", name: "Reroll and stopping decisions", module: 7, trick: "Compare what you hold with the expected value of continuing; stop when you beat the continuation value." },
  { id: "secretary", name: "Secretary problem", module: 7, trick: "Skip the first n/e candidates, then take the first that beats them all; success about 37%." },
  { id: "kelly", name: "Kelly criterion", module: 7, trick: "Bet fraction f = p - q/b (edge over odds) for a b-to-1 payout; half-Kelly is the practical choice." },
  { id: "backward-induction", name: "Backward induction", module: 7, trick: "Solve the last decision first and work backwards; the value at each stage is the max over actions." },
  { id: "bidding", name: "Auctions and bidding", module: 7, trick: "Shade your bid below your value in a first-price auction; bid your value in a second-price auction." },
  { id: "indifference", name: "Indifference in toy poker", module: 7, trick: "Make the opponent indifferent between their options; bluff frequency equals pot odds offered." },
  { id: "market-making", name: "Making a market", module: 8, trick: "Centre the quote on the conditional expectation, widen for uncertainty and informed flow, skew toward inventory." },
  { id: "fermi", name: "Fermi estimation", module: 8, trick: "Decompose into factors you can bound, multiply, and quote a range that honestly reflects uncertainty." },
  { id: "put-call-parity", name: "Put-call parity", module: 8, trick: "C - P = S - K e^{-rT}; a long call plus short put is a forward." },
  { id: "adverse-selection", name: "Adverse selection", module: 8, trick: "A counterparty who chooses when to trade knows something; price the quote assuming they are informed some of the time." },
  { id: "pigeonhole", name: "Pigeonhole", module: 9, trick: "More pigeons than holes forces a shared hole; pick the holes to make the forced pair useful." },
  { id: "invariant", name: "Invariants and parity", module: 9, trick: "Find a quantity the moves never change and show the target has a different value." },
  { id: "weighing", name: "Weighing puzzles", module: 9, trick: "Each weighing has three outcomes, so k weighings distinguish at most 3^k cases; split into thirds." },
  { id: "hats", name: "Hat puzzles", module: 9, trick: "Agree on a parity or sum convention in advance; the first speaker encodes the total." },
  { id: "knights-knaves", name: "Knights and knaves", module: 9, trick: "A statement 'X is true' from a knight or a knave is true exactly when the speaker is a knight; chain the biconditionals." },
  { id: "river-crossing", name: "River crossing and state search", module: 9, trick: "Write the state as a tuple, list legal moves, and search the small graph." },
  { id: "induction", name: "Induction puzzles", module: 9, trick: "Solve n = 1 and n = 2 by hand, then show how a solution for n builds from n - 1." },
  { id: "hashing-and-counting", name: "Counting with a hash map", module: 10, trick: "One pass with a frequency map turns a quadratic search into a linear one." },
  { id: "simple-dp", name: "Simple dynamic programming", module: 10, trick: "Define the state, write the recurrence, and fill a table from the base case." },
];

export const FAMILY_BY_ID: ReadonlyMap<string, Family> = new Map(FAMILIES.map((f) => [f.id, f]));
