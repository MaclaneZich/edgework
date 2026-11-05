import { beforeEach, describe, expect, it } from "vitest";
import { useStore } from "./store";

describe("store", () => {
  beforeEach(() => {
    useStore.getState().resetAll();
  });

  const attempt = {
    problemId: "m1-p01",
    module: 1 as const,
    tags: ["permutations" as const],
    difficulty: 1 as const,
    estMinutes: 2,
    correct: true,
    confidence: 0.9,
    timeMs: 30_000,
    hintsUsed: 0,
    given: "5040",
    context: "practice" as const,
  };

  it("records attempts, updates mastery and unlocks the first achievement", () => {
    const s = useStore.getState();
    s.recordAttempt(attempt);
    const after = useStore.getState();
    expect(after.attempts).toHaveLength(1);
    expect(after.mastery.permutations.rating).toBeGreaterThan(1200);
    expect(after.achievements["first-correct"]).toBeTruthy();
    expect(after.streak.current).toBe(1);
    expect(after.errorLog).toHaveLength(0);
  });

  it("opens an error-log entry and an SRS card on a miss", () => {
    useStore.getState().recordAttempt({ ...attempt, correct: false, confidence: 0.5, given: "120" });
    const s = useStore.getState();
    expect(s.errorLog).toHaveLength(1);
    expect(s.errorLog[0].reason).toBe("wrong");
    expect(s.srs["m1-p01"]).toBeTruthy();
    expect(s.srs["m1-p01"].interval).toBe(1);
  });

  it("round-trips through export and import", () => {
    useStore.getState().recordAttempt(attempt);
    useStore.getState().setNote(1, "complement trick");
    const json = useStore.getState().exportJSON();
    useStore.getState().resetAll();
    expect(useStore.getState().attempts).toHaveLength(0);
    const r = useStore.getState().importJSON(json);
    expect(r.ok).toBe(true);
    expect(useStore.getState().attempts).toHaveLength(1);
    expect(useStore.getState().notes["1"]).toBe("complement trick");
    expect(useStore.getState().importJSON("{}").ok).toBe(false);
    expect(useStore.getState().importJSON("not json").ok).toBe(false);
  });

  it("records quiz passes", () => {
    expect(useStore.getState().recordQuiz(2, 5, 8, 0.75)).toBe(false);
    expect(useStore.getState().recordQuiz(2, 7, 8, 0.75)).toBe(true);
    expect(useStore.getState().quiz["2"].passed).toBe(true);
    expect(useStore.getState().quiz["2"].attempts).toBe(2);
    expect(useStore.getState().achievements["mastery-m2"]).toBeTruthy();
  });
});
