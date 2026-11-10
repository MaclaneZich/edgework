import { describe, expect, it } from "vitest";
import { emptyData } from "./store-types";
import { decideSync, isPristine, normalizeData, sameData, summarize, type SyncMeta } from "./syncLogic";

const meta = (base: number, dirty: boolean): SyncMeta => ({ email: "a@b.co", base, dirty });

describe("decideSync", () => {
  it("pushes when the account holds nothing yet", () => {
    expect(decideSync({ remoteUpdatedAt: 0, meta: meta(0, true), localPristine: false, identical: false })).toBe("push");
    expect(decideSync({ remoteUpdatedAt: 0, meta: meta(0, false), localPristine: true, identical: false })).toBe("push");
  });
  it("pushes local changes when the account has not moved", () => {
    expect(decideSync({ remoteUpdatedAt: 5, meta: meta(5, true), localPristine: false, identical: false })).toBe("push");
  });
  it("does nothing when both sides already match", () => {
    expect(decideSync({ remoteUpdatedAt: 5, meta: meta(5, false), localPristine: false, identical: true })).toBe("noop");
  });
  it("takes the account copy on a fresh device", () => {
    expect(decideSync({ remoteUpdatedAt: 5, meta: meta(0, false), localPristine: true, identical: false })).toBe("apply-remote");
  });
  it("takes a newer account copy when this device has nothing unsaved", () => {
    expect(decideSync({ remoteUpdatedAt: 9, meta: meta(5, false), localPristine: false, identical: false })).toBe("apply-remote");
  });
  it("asks when a device with progress first meets an account with progress", () => {
    expect(decideSync({ remoteUpdatedAt: 5, meta: meta(0, true), localPristine: false, identical: false })).toBe("conflict");
    expect(decideSync({ remoteUpdatedAt: 5, meta: meta(0, false), localPristine: false, identical: false })).toBe("conflict");
  });
  it("asks when both sides changed since the last sync", () => {
    expect(decideSync({ remoteUpdatedAt: 9, meta: meta(5, true), localPristine: false, identical: false })).toBe("conflict");
  });
  it("only records the version when the two copies are identical", () => {
    expect(decideSync({ remoteUpdatedAt: 9, meta: meta(0, true), localPristine: false, identical: true })).toBe("adopt-version");
  });
});

describe("normalizeData", () => {
  it("fills every missing field so summaries never crash", () => {
    const d = normalizeData({ attempts: [], settings: { name: "Other" }, lessonsCompleted: { "1": 5 } });
    expect(d.studyLog).toEqual([]);
    expect(d.settings.name).toBe("Other");
    expect(d.settings.theme).toBe("dark");
    expect(d.streak).toEqual({ current: 0, best: 0, lastActive: "" });
    expect(summarize(d).lessons).toBe(1);
    expect(isPristine(d)).toBe(false);
  });
  it("replaces mistyped fields with safe defaults", () => {
    const d = normalizeData({ attempts: "nope", notes: null, mastery: [], session: "x", settings: null });
    expect(d.attempts).toEqual([]);
    expect(d.notes).toEqual({});
    expect(d.mastery).toEqual({});
    expect(d.session).toBeNull();
    expect(d.settings.hoursGoal).toBe(20);
    expect(normalizeData(null)).toEqual(emptyData());
  });
  it("leaves a complete copy unchanged", () => {
    const full = emptyData();
    full.notes["1"] = "x";
    expect(sameData(normalizeData(JSON.parse(JSON.stringify(full))), full)).toBe(true);
  });
});

describe("progress helpers", () => {
  it("treats settings-only data as pristine", () => {
    const d = emptyData();
    d.settings.name = "Sam";
    d.settings.onboarded = true;
    expect(isPristine(d)).toBe(true);
  });
  it("treats any study record as progress", () => {
    const d = emptyData();
    d.lessonsCompleted["1"] = 123;
    expect(isPristine(d)).toBe(false);
    const e = emptyData();
    e.notes["2"] = "Bayes: flip the conditional";
    expect(isPristine(e)).toBe(false);
  });
  it("compares and summarizes", () => {
    const a = emptyData();
    const b = emptyData();
    expect(sameData(a, b)).toBe(true);
    b.studyLog.push({ id: "s-1", minutes: 25, startedAt: 1000 } as never);
    expect(sameData(a, b)).toBe(false);
    expect(summarize(b)).toMatchObject({ attempts: 0, studyMinutes: 25, lastActivity: 1000 });
  });
});
