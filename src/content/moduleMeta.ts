import type { ModuleId } from "./types";

export interface ModuleMeta {
  id: ModuleId;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  /** Planned study hours (lesson + practice + quiz + hard set). */
  hours: number;
  /** Short list of what the module covers, for the modules index. */
  topics: string[];
}

export const MODULE_META: ModuleMeta[] = [
  {
    id: 1,
    slug: "counting",
    title: "Counting and complements",
    subtitle: "Permutations, combinations, and the art of counting what you do not want",
    description:
      "Every probability question starts with a count. This module builds the counting toolkit from scratch: ordered and unordered selections, stars and bars, the complement trick for 'at least one', inclusion-exclusion, and derangements.",
    hours: 1.5,
    topics: ["Permutations", "Combinations", "Stars and bars", "Complements", "Inclusion-exclusion", "Derangements", "Birthday collisions"],
  },
  {
    id: 2,
    slug: "probability-basics",
    title: "Probability basics",
    subtitle: "Sample spaces, independence, and symmetry",
    description:
      "Dice, coins, cards and urns: the raw material of every quant interview. Learn to write down the sample space, spot independence, use symmetry to skip the arithmetic, and handle drawing with and without replacement.",
    hours: 1.5,
    topics: ["Sample spaces", "Independence", "Dice and coins", "Cards and urns", "With and without replacement", "Symmetry", "Geometric probability"],
  },
  {
    id: 3,
    slug: "conditional-bayes",
    title: "Conditional probability and Bayes",
    subtitle: "Updating beliefs on evidence",
    description:
      "The most heavily tested idea in trading interviews. Trees, tables of counts, false positives, the two-children and Monty Hall families, the law of total probability, and updating on evidence that arrives in sequence.",
    hours: 1.75,
    topics: ["Conditional probability", "Bayes' rule", "Total probability", "False positives", "Monty Hall family", "Sequential updating"],
  },
  {
    id: 4,
    slug: "expectation",
    title: "Expectation and linearity",
    subtitle: "Indicators, sums, and the trick that solves half of all problems",
    description:
      "Linearity of expectation turns impossible-looking problems into one-line sums. Indicator variables, fixed points, the coupon collector, expected maxima of dice, and a first look at order statistics.",
    hours: 1.75,
    topics: ["Expected value", "Linearity", "Indicator variables", "Fixed points", "Coupon collector", "Expected max", "Order statistics"],
  },
  {
    id: 5,
    slug: "distributions",
    title: "Variance, distributions, and approximations",
    subtitle: "Binomial, geometric, Poisson, normal, and quick approximations",
    description:
      "Know the standard distributions cold and approximate fast. Variance of sums, covariance, the law of large numbers as intuition, and normal approximations for sums of dice and coin flips.",
    hours: 1.25,
    topics: ["Variance", "Binomial", "Geometric", "Poisson", "Normal", "Covariance", "LLN", "Approximations"],
  },
  {
    id: 6,
    slug: "recursion",
    title: "First-step analysis and recursion",
    subtitle: "Condition on the first step, then let the equation do the work",
    description:
      "Expected flips to see a pattern, gambler's ruin, random walks, and absorbing Markov chains. One technique, first-step analysis, unlocks all of them.",
    hours: 1.5,
    topics: ["First-step analysis", "Waiting for patterns", "Gambler's ruin", "Random walks", "Absorbing Markov chains"],
  },
  {
    id: 7,
    slug: "games",
    title: "Betting, EV decisions, and games",
    subtitle: "Stopping, sizing, and thinking one move ahead",
    description:
      "Reroll and stopping decisions, backward induction, Kelly sizing intuition, simple dice and card games, auction basics, secretary-style optimal stopping, and indifference reasoning in toy poker.",
    hours: 1.25,
    topics: ["Optimal stopping", "Backward induction", "Kelly", "Dice and card games", "Auctions", "Toy poker"],
  },
  {
    id: 8,
    slug: "market-making",
    title: "Market-making and estimation",
    subtitle: "Quote a market, size a spread, estimate anything",
    description:
      "Bid-ask quoting drills, Fermi estimation with honest ranges, expected value of a contract under uncertainty, basic options intuition, and why adverse selection makes wide markets.",
    hours: 1,
    topics: ["Bid-ask quoting", "Fermi estimation", "Expected value of contracts", "Options payoffs", "Put-call parity", "Adverse selection"],
  },
  {
    id: 9,
    slug: "logic",
    title: "Logic, brainteasers, and combinatorial puzzles",
    subtitle: "Structure a search instead of guessing",
    description:
      "Pigeonhole, invariants and parity, weighing problems, hat puzzles, induction, knights and knaves, number puzzles, and clean ways to organise a search when the problem looks open-ended.",
    hours: 1.25,
    topics: ["Pigeonhole", "Invariants", "Weighing", "Hat puzzles", "Induction", "Knights and knaves", "Number puzzles", "Search strategy"],
  },
  {
    id: 10,
    slug: "test-and-coding",
    title: "Test simulation and coding warmup",
    subtitle: "Mixed review plus the one coding question",
    description:
      "Mixed-topic problems that look like the real test, pacing practice, and a light coding warmup (arrays, hashing, sorting, simple DP, probability simulation) for the single coding question.",
    hours: 0.75,
    topics: ["Mixed review", "Pacing", "Arrays and hashing", "Sorting", "Simple DP", "Simulation"],
  },
];

export const MODULE_BY_ID = new Map(MODULE_META.map((m) => [m.id, m]));

export function moduleMeta(id: ModuleId): ModuleMeta {
  const m = MODULE_BY_ID.get(id);
  if (!m) throw new Error(`Unknown module ${id}`);
  return m;
}
