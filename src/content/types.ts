/**
 * Edgework content schema.
 *
 * Every lesson, problem, hint and solution in this app is original text written
 * for Edgework. Prompts and solutions may use KaTeX inline ($...$) and display
 * ($$...$$) math. Prefer String.raw`...` for any string that contains backslashes.
 */

export type Difficulty = 1 | 2 | 3 | 4 | 5;
export type ModuleId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/** practice = counts toward the main bank; lessonCheck = short checks inside the lesson; brainteaser = logic bank. */
export type ProblemKind = "practice" | "lessonCheck" | "brainteaser";

export const TAGS = {
  // Module 1
  permutations: "Permutations",
  combinations: "Combinations",
  "stars-and-bars": "Stars and bars",
  complement: "Complement counting",
  "inclusion-exclusion": "Inclusion-exclusion",
  derangements: "Derangements",
  birthday: "Birthday-style collisions",
  // Module 2
  "sample-space": "Sample spaces",
  independence: "Independence",
  dice: "Dice",
  coins: "Coins",
  cards: "Cards",
  urns: "Urns and drawing",
  symmetry: "Symmetry arguments",
  "geometric-probability": "Geometric probability",
  // Module 3
  conditional: "Conditional probability",
  bayes: "Bayes' rule",
  "total-probability": "Law of total probability",
  "monty-hall": "Monty Hall family",
  "sequential-updating": "Sequential updating",
  // Module 4
  expectation: "Expected value",
  linearity: "Linearity of expectation",
  indicators: "Indicator variables",
  "coupon-collector": "Coupon collector",
  "order-statistics": "Order statistics",
  // Module 5
  variance: "Variance",
  binomial: "Binomial",
  "geometric-dist": "Geometric distribution",
  poisson: "Poisson",
  normal: "Normal approximation",
  covariance: "Covariance and correlation",
  lln: "Law of large numbers",
  // Module 6
  "first-step": "First-step analysis",
  recursion: "Recursion",
  "random-walk": "Random walks",
  "gamblers-ruin": "Gambler's ruin",
  markov: "Markov chains",
  patterns: "Waiting for patterns",
  // Module 7
  stopping: "Optimal stopping",
  "backward-induction": "Backward induction",
  kelly: "Kelly and bet sizing",
  games: "Games and EV decisions",
  auctions: "Auctions and bidding",
  poker: "Toy poker and indifference",
  // Module 8
  "market-making": "Market making",
  fermi: "Fermi estimation",
  options: "Options intuition",
  "adverse-selection": "Adverse selection",
  // Module 9
  pigeonhole: "Pigeonhole",
  invariants: "Invariants and parity",
  weighing: "Weighing puzzles",
  hats: "Hat puzzles",
  induction: "Induction",
  "knights-knaves": "Knights and knaves",
  "number-puzzle": "Number puzzles",
  "search-strategy": "Structured search",
  logic: "Logic",
  // Module 10
  coding: "Coding",
  simulation: "Simulation thinking",
  "mental-math": "Mental math",
  "mixed-review": "Mixed review",
} as const;

export type Tag = keyof typeof TAGS;

export interface NumericAnswer {
  type: "numeric";
  /** The exact numeric value, as a JS number (e.g. 3/8 = 0.375). */
  value: number;
  /** KaTeX for the exact form, shown in the solution (e.g. "\\frac{3}{8}" or "1 - \\left(\\frac{5}{6}\\right)^4"). */
  exact: string;
  /**
   * Absolute tolerance for grading. Default: exact match (1e-9) when the value is an
   * integer with |value| >= 1, otherwise 1% of |value| (so 0.33 is accepted for 1/3).
   */
  tolerance?: number;
  /** Optional unit label shown next to the input, e.g. "dollars" or "flips". */
  unit?: string;
}

export interface ChoiceAnswer {
  type: "choice";
  /** 3-5 options, KaTeX allowed. */
  options: string[];
  /** 0-based index of the correct option. */
  correct: number;
}

export type Answer = NumericAnswer | ChoiceAnswer;

export type VerifyMethod =
  | "enumeration"
  | "simulation"
  | "formula"
  | "recursion"
  | "exhaustive-search"
  | "dp";

export interface Problem {
  /** Stable id: m{module}-p{nn} for practice, m{module}-lc{n} for lesson checks, bt-{nnn} for brainteasers. */
  id: string;
  module: ModuleId;
  kind: ProblemKind;
  difficulty: Difficulty;
  tags: Tag[];
  /** Realistic minutes a prepared candidate needs. Used for pacing and speed scoring. */
  minutes: number;
  /** Short label used in lists (no math). */
  title: string;
  prompt: string;
  answer: Answer;
  /** Exactly three progressively stronger hints. */
  hints: [string, string, string];
  /** Full worked solution; paragraphs separated by blank lines. */
  solution: string;
  /** 3-6 short checklist items naming the key steps (used by speak-it-out mode). */
  steps: string[];
  /** One sentence: the idea that unlocks the problem. */
  keyIdea: string;
  /** One or two sentences: the error people make under time pressure. */
  commonMistake: string;
  /** The quickest route to the number under exam conditions. */
  fastPath: string;
  /** A follow-up that changes one assumption, the way an interviewer would. */
  variation: string;
  /** Short answer or sketch for the variation, so the interview simulator can reveal it. */
  variationAnswer: string;
  /** Classic family id (see content/families.ts), when the problem belongs to one. */
  family?: string;
  /** Methods that `npm run verify` uses to independently confirm the answer. Must match content/verify. */
  verifiedBy: VerifyMethod[];
}

export interface ConceptCard {
  title: string;
  /** Markdown-lite: paragraphs separated by blank lines, "- " bullets, **bold**, $math$. */
  body: string;
  /** Optional display formula (KaTeX, no $ delimiters). */
  formula?: string;
  /** Optional one-line example or intuition. */
  example?: string;
}

export interface WorkedStep {
  text: string;
  /** Optional display math shown under the step (KaTeX, no $ delimiters). */
  math?: string;
}

export interface WorkedExample {
  title: string;
  prompt: string;
  steps: WorkedStep[];
  /** Final answer, KaTeX allowed. */
  answer: string;
}

export interface TryIt {
  prompt: string;
  answer: Answer;
  solution: string;
}

export interface FormulaEntry {
  name: string;
  /** KaTeX, no $ delimiters. */
  latex: string;
  /** When to use it, in one line. */
  note: string;
}

export interface Lesson {
  /** 2-4 paragraphs setting up the module. */
  intro: string;
  cards: ConceptCard[];
  workedExamples: WorkedExample[];
  tryIt: TryIt;
  /** Ids of the module's lessonCheck problems (normally 4). */
  checkIds: string[];
  formulas: FormulaEntry[];
  /** Closing advice: how this topic shows up in the test and in interviews. */
  outro: string;
}

export interface ModuleDef {
  id: ModuleId;
  slug: string;
  title: string;
  subtitle: string;
  /** One paragraph for the modules list. */
  description: string;
  /** Planned study hours for the schedule planner. */
  hours: number;
  lesson: Lesson;
  /** Mastery quiz: number of questions and the fraction needed to pass. */
  quiz: { size: number; passRatio: number };
}

/** A single independent check of a problem's answer. */
export interface VerifyCheck {
  method: VerifyMethod;
  /**
   * Returns the computed answer. For a choice answer, return the 0-based index of the
   * correct option. A simulation returns { value, se } so the runner can judge noise;
   * use the provided seeded rng (uniform in [0,1)) and never Math.random.
   */
  run: (rng: () => number) => number | { value: number; se: number };
}

export type VerifySpec = Record<string, VerifyCheck[]>;

/** Classic problem family entry for the formula sheet index. */
export interface Family {
  id: string;
  name: string;
  module: ModuleId;
  trick: string;
}
