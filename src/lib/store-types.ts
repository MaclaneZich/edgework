import type { Difficulty, ModuleId, Tag } from "@/content/types";
import type { TagMastery } from "./mastery";
import type { SrsCard } from "./srs";

export type AttemptContext =
  | "practice"
  | "quiz"
  | "hardset"
  | "mock"
  | "drill"
  | "smart"
  | "redo"
  | "interview"
  | "speak"
  | "lesson"
  | "brainteaser";

export interface Attempt {
  id: string;
  problemId: string;
  module: ModuleId;
  tags: Tag[];
  difficulty: Difficulty;
  estMinutes: number;
  correct: boolean;
  /** Stated confidence in [0, 1]. */
  confidence: number;
  timeMs: number;
  hintsUsed: number;
  /** What the user typed or chose. */
  given: string;
  context: AttemptContext;
  timestamp: number;
}

export type MistakeCategory = "setup" | "arithmetic" | "misread" | "concept" | "time" | "unsure";

export interface ErrorEntry {
  id: string;
  problemId: string;
  attemptId: string;
  category: MistakeCategory | null;
  /** One-line "lesson learned". */
  lesson: string;
  createdAt: number;
  redoBy: number;
  resolvedAt: number | null;
  /** Why it was added: wrong answer or shaky confidence. */
  reason: "wrong" | "low-confidence" | "hints";
  transcript?: string;
}

export interface StudyEntry {
  id: string;
  module: ModuleId | null;
  minutes: number;
  startedAt: number;
  source: "timer" | "auto";
  label?: string;
}

export interface MockQuestionResult {
  problemId: string;
  correct: boolean | null;
  timeMs: number;
  flagged: boolean;
  answer: string;
  isCoding?: boolean;
  skipped: boolean;
}

export interface MockResult {
  id: string;
  mockId: string;
  title: string;
  kind: "standard" | "hard" | "drill" | "final";
  startedAt: number;
  finishedAt: number;
  durationMs: number;
  questions: MockQuestionResult[];
  score: number;
  total: number;
  lockdown: boolean;
  focusLosses: number;
}

export interface MentalMathResult {
  id: string;
  mode: "zetamac" | "eighty" | "drill";
  drill?: string;
  score: number;
  attempted: number;
  correct: number;
  durationSec: number;
  timestamp: number;
  /** Per-operation timing: op -> { n, correct, totalMs }. */
  perOp: Record<string, { n: number; correct: number; totalMs: number }>;
}

export interface MarketGameResult {
  id: string;
  scenario: string;
  rounds: number;
  pnl: number;
  avgSpread: number;
  fills: number;
  timestamp: number;
}

export interface FermiResult {
  id: string;
  questionId: string;
  low: number;
  high: number;
  truth: number;
  score: number;
  timestamp: number;
}

export interface InterviewResult {
  id: string;
  problemId: string;
  timestamp: number;
  approach: string;
  followUps: Array<{ question: string; answer: string }>;
  rubric: { structure: number; correctness: number; communication: number; recovery: number };
  durationMs: number;
}

export interface SpeakResult {
  id: string;
  problemId: string | null;
  concept?: string;
  mode: "speak" | "teach";
  timestamp: number;
  transcript: string;
  stepRatings: Array<"got" | "partly" | "missed">;
  confidence: number;
  durationMs: number;
}

export interface QuizRecord {
  attempts: number;
  bestScore: number;
  bestTotal: number;
  passed: boolean;
  lastAt: number;
}

export interface CodingResult {
  problemId: string;
  passed: boolean;
  language: "js" | "py";
  timestamp: number;
  code: string;
}

export interface Settings {
  theme: "dark" | "light" | "system";
  fontSize: "sm" | "md" | "lg";
  voiceEnabled: boolean;
  readAloud: boolean;
  /** YYYY-MM-DD */
  testDate: string;
  dailyGoalMinutes: number;
  hoursGoal: number;
  /** When set, the planner uses a fixed daily budget instead of spreading the total. */
  hoursPerDay: number | null;
  name: string;
  reducedMotion: "system" | "reduce" | "allow";
  soundEnabled: boolean;
  /** Set once the user has seen the welcome card. */
  onboarded: boolean;
}

export interface SessionConfig {
  id: string;
  title: string;
  problemIds: string[];
  context: AttemptContext;
  module?: ModuleId;
  returnHref: string;
  /** When set the session is graded as a quiz at the end. */
  quiz?: { module: ModuleId; passRatio: number };
  /** Pacing target in minutes per problem, for drills. */
  paceMinutes?: number;
  /** Adaptive sessions swap upcoming problems from this pool as the difficulty ramps. */
  pool?: string[];
  adaptive?: boolean;
}

/** The persisted data (everything except transient flags and actions). */
export interface EdgeworkData {
  settings: Settings;
  attempts: Attempt[];
  mastery: Record<string, TagMastery>;
  srs: Record<string, SrsCard>;
  errorLog: ErrorEntry[];
  notes: Record<string, string>;
  studyLog: StudyEntry[];
  mockResults: MockResult[];
  mentalMath: MentalMathResult[];
  marketGame: MarketGameResult[];
  fermi: FermiResult[];
  interview: InterviewResult[];
  speak: SpeakResult[];
  quiz: Record<string, QuizRecord>;
  lessonsCompleted: Record<string, number>;
  achievements: Record<string, number>;
  streak: { current: number; best: number; lastActive: string };
  coding: Record<string, CodingResult>;
  session: SessionConfig | null;
  /** Checked items on the pre-test checklist. */
  checklist: Record<string, boolean>;
  /** Problems the user has looked at the solution for (used for "seen" state). */
  seenSolutions: Record<string, number>;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  fontSize: "md",
  voiceEnabled: false,
  readAloud: false,
  testDate: "2026-11-13",
  dailyGoalMinutes: 150,
  hoursGoal: 20,
  hoursPerDay: null,
  name: "",
  reducedMotion: "system",
  soundEnabled: false,
  onboarded: false,
};

export function emptyData(): EdgeworkData {
  return {
    settings: { ...DEFAULT_SETTINGS },
    attempts: [],
    mastery: {},
    srs: {},
    errorLog: [],
    notes: {},
    studyLog: [],
    mockResults: [],
    mentalMath: [],
    marketGame: [],
    fermi: [],
    interview: [],
    speak: [],
    quiz: {},
    lessonsCompleted: {},
    achievements: {},
    streak: { current: 0, best: 0, lastActive: "" },
    coding: {},
    session: null,
    checklist: {},
    seenSolutions: {},
  };
}
