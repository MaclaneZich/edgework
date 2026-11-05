/**
 * Edgework content verification.
 *
 *   npm run verify                 verify everything
 *   npm run verify -- --module 3   verify one module only (loads only that module's files)
 *   npm run verify -- --module bt  verify the brainteaser bank (bt-a / bt-b for each half)
 *   npm run verify -- --ids m1-p01,m1-p02
 *   npm run verify -- --report     also write content-report.json
 *
 * For every problem this script
 *   1. validates the schema (ids, hints, steps, answers, tags, uniqueness),
 *   2. runs every independent check in src/content/verify and compares it with the
 *      stored answer (exact methods must agree to 1e-9 relative; simulations must agree
 *      within 6 standard errors AND be precise enough to catch a 1% error),
 *   3. confirms `verifiedBy` lists exactly the methods that were run.
 * It exits with code 1 on any failure. Nothing unverified ships.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { MODULE_META, type ModuleMeta } from "../src/content/moduleMeta";
import { TAGS, type Lesson, type ModuleId, type Problem, type VerifySpec } from "../src/content/types";
import { FAMILY_BY_ID } from "../src/content/families";
import { rngFromString } from "../src/lib/rng";

const args = process.argv.slice(2);
function argValue(flag: string): string | undefined {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
}
const onlyModule = argValue("--module");
const onlyIds = argValue("--ids")?.split(",").map((s) => s.trim());
const writeReport = args.includes("--report");

const failures: string[] = [];
const warnings: string[] = [];
function fail(msg: string) {
  failures.push(msg);
}
function warn(msg: string) {
  warnings.push(msg);
}

const ID_RE = /^(m(10|[1-9])-(p\d{2}|lc\d)|bt-\d{3})$/;
const VALID_TAGS = new Set(Object.keys(TAGS));

function normalise(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

interface Loaded {
  problems: Problem[];
  specs: VerifySpec;
  lessons: Partial<Record<ModuleId, Lesson | null>>;
  meta: ModuleMeta[];
}

async function loadContent(): Promise<Loaded> {
  if (!onlyModule) {
    const content = await import("../src/content");
    const v = await import("../src/content/verify");
    return { problems: content.PROBLEMS, specs: v.VERIFY_SPECS, lessons: content.LESSONS, meta: MODULE_META };
  }
  if (onlyModule === "bt" || onlyModule === "bt-a" || onlyModule === "bt-b") {
    const file = onlyModule === "bt" ? "brainteasers" : onlyModule === "bt-a" ? "brainteasersA" : "brainteasersB";
    const p = await import(`../src/content/problems/${file}`);
    const v = await import(`../src/content/verify/${file}`);
    return { problems: p.problems, specs: v.spec, lessons: {}, meta: [] };
  }
  const n = Number(onlyModule) as ModuleId;
  if (!(n >= 1 && n <= 10)) throw new Error(`--module must be 1-10 or bt, got ${onlyModule}`);
  const p = await import(`../src/content/problems/m${n}`);
  const v = await import(`../src/content/verify/m${n}`);
  const l = await import(`../src/content/modules/m${n}`);
  return { problems: p.problems, specs: v.spec, lessons: { [n]: l.lesson }, meta: MODULE_META.filter((m) => m.id === n) };
}

function validateSchema(problems: Problem[]) {
  const ids = new Set<string>();
  const prompts = new Map<string, string>();
  for (const p of problems) {
    const where = `[${p.id}]`;
    if (!ID_RE.test(p.id)) fail(`${where} id does not match m{n}-p{nn}, m{n}-lc{n} or bt-{nnn}`);
    if (ids.has(p.id)) fail(`${where} duplicate id`);
    ids.add(p.id);
    if (p.id.startsWith("m")) {
      const mod = Number(p.id.slice(1, p.id.indexOf("-")));
      if (mod !== p.module) fail(`${where} id says module ${mod} but module field is ${p.module}`);
      if (p.id.includes("-lc") && p.kind !== "lessonCheck") fail(`${where} lc ids must have kind lessonCheck`);
      if (p.id.includes("-p") && p.kind !== "practice") fail(`${where} p ids must have kind practice`);
    } else if (p.kind !== "brainteaser") fail(`${where} bt ids must have kind brainteaser`);
    if (!(p.module >= 1 && p.module <= 10)) fail(`${where} module out of range`);
    if (!(p.difficulty >= 1 && p.difficulty <= 5)) fail(`${where} difficulty out of range`);
    if (!Array.isArray(p.tags) || p.tags.length === 0) fail(`${where} needs at least one tag`);
    for (const t of p.tags ?? []) if (!VALID_TAGS.has(t)) fail(`${where} unknown tag "${t}"`);
    if (!(p.minutes > 0 && p.minutes <= 30)) fail(`${where} minutes must be in (0, 30]`);
    if (!p.title?.trim()) fail(`${where} missing title`);
    if (!p.prompt?.trim() || p.prompt.trim().length < 20) fail(`${where} prompt too short`);
    const key = normalise(p.prompt);
    if (prompts.has(key)) fail(`${where} prompt duplicates ${prompts.get(key)}`);
    prompts.set(key, p.id);
    if (p.answer.type === "numeric") {
      if (!Number.isFinite(p.answer.value)) fail(`${where} numeric answer is not finite`);
      if (!p.answer.exact?.trim()) fail(`${where} numeric answer needs an exact form`);
      if (p.answer.tolerance !== undefined && !(p.answer.tolerance >= 0)) fail(`${where} tolerance must be >= 0`);
    } else if (p.answer.type === "choice") {
      if (!Array.isArray(p.answer.options) || p.answer.options.length < 3 || p.answer.options.length > 5)
        fail(`${where} choice answers need 3-5 options`);
      if (!Number.isInteger(p.answer.correct) || p.answer.correct < 0 || p.answer.correct >= (p.answer.options?.length ?? 0))
        fail(`${where} choice correct index out of range`);
      const seen = new Set(p.answer.options?.map(normalise));
      if (seen.size !== (p.answer.options?.length ?? 0)) fail(`${where} duplicate choice options`);
    } else fail(`${where} unknown answer type`);
    if (!Array.isArray(p.hints) || p.hints.length !== 3 || p.hints.some((h) => !h?.trim())) fail(`${where} needs exactly 3 non-empty hints`);
    if (!p.solution?.trim() || p.solution.trim().length < 120) fail(`${where} solution too short (needs a real worked solution)`);
    if (!Array.isArray(p.steps) || p.steps.length < 3 || p.steps.length > 6 || p.steps.some((s) => !s?.trim()))
      fail(`${where} steps must be 3-6 non-empty items`);
    for (const f of ["keyIdea", "commonMistake", "fastPath", "variation", "variationAnswer"] as const) {
      if (!p[f]?.trim()) fail(`${where} missing ${f}`);
    }
    if (p.family && !FAMILY_BY_ID.has(p.family)) fail(`${where} unknown family "${p.family}" (see src/content/families.ts)`);
    if (!Array.isArray(p.verifiedBy) || p.verifiedBy.length === 0) fail(`${where} verifiedBy must list at least one method`);
    for (const raw of [p.prompt, p.solution, ...p.hints, p.fastPath, p.variation, p.variationAnswer, p.keyIdea, p.commonMistake]) {
      const s = raw.replace(/\\\$/g, ""); // escaped dollars (\$) are literal currency signs
      if (/\$\$\s*\$\$/.test(s) || /(?<!\$)\$(?!\$)\s*(?<!\$)\$(?!\$)/.test(s)) fail(`${where} contains an empty math delimiter`);
      const singles = (s.match(/(?<!\$)\$(?!\$)/g) ?? []).length;
      if (singles % 2 === 1) fail(`${where} has an unbalanced $ math delimiter (write currency as \\$5)`);
    }
  }
}

function validateLessons(loaded: Loaded) {
  for (const meta of loaded.meta) {
    const lesson = loaded.lessons[meta.id];
    if (!lesson) continue;
    const where = `[module ${meta.id} lesson]`;
    if (!lesson.intro?.trim()) fail(`${where} missing intro`);
    if (!lesson.outro?.trim()) fail(`${where} missing outro`);
    if (!Array.isArray(lesson.cards) || lesson.cards.length < 4) fail(`${where} needs at least 4 concept cards`);
    if (!Array.isArray(lesson.workedExamples) || lesson.workedExamples.length < 1) fail(`${where} needs a worked example`);
    for (const ex of lesson.workedExamples ?? []) {
      if (!ex.steps || ex.steps.length < 2) fail(`${where} worked example "${ex.title}" needs at least 2 steps`);
    }
    if (!lesson.tryIt?.prompt?.trim() || !lesson.tryIt?.solution?.trim()) fail(`${where} try-it needs prompt and solution`);
    if (!Array.isArray(lesson.formulas) || lesson.formulas.length < 3) fail(`${where} needs at least 3 formula entries`);
    if (!Array.isArray(lesson.checkIds) || lesson.checkIds.length < 3) fail(`${where} needs at least 3 lesson check ids`);
    for (const id of lesson.checkIds ?? []) {
      const p = loaded.problems.find((q) => q.id === id);
      if (!p) fail(`${where} checkId ${id} does not exist`);
      else if (p.kind !== "lessonCheck" || p.module !== meta.id) fail(`${where} checkId ${id} is not a lessonCheck of this module`);
    }
  }
}

/**
 * Source-level check: a KaTeX backslash inside a plain "..." or non-raw `...` string is eaten
 * by JavaScript (backslash-f-r-a-c becomes a form feed followed by "rac"). Only String.raw
 * strings (or doubled backslashes) survive. tsc and the numeric checks cannot see this, so
 * scan the source text itself.
 */
function validateSources(files: string[]) {
  const badEscape = /(?<!\\)\\[a-mo-qs-wyzA-Z]/; // backslash + letter other than n, r, t, u, x
  for (const file of files) {
    let text: string;
    try {
      text = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const shown = file.replace(/\\/g, "/");
    // template literals not prefixed with String.raw (may span lines)
    const tl = /(String\.raw)?`(?:[^`\\]|\\.)*`/g;
    // blank out every template literal (keeping newlines) before looking for plain strings,
    // so a straight quote inside a raw template is not mistaken for a plain string
    const withoutTemplates = text.replace(tl, (m) => m.replace(/[^\n]/g, " "));
    const lines = withoutTemplates.split("\n");
    // double-quoted strings
    const dq = /"(?:[^"\\\n]|\\.)*"/g;
    lines.forEach((line, i) => {
      for (const m of line.matchAll(dq)) {
        if (badEscape.test(m[0])) fail(`[${shown}:${i + 1}] plain string contains a KaTeX backslash that JavaScript will eat; use String.raw: ${m[0].slice(0, 60)}`);
      }
    });
    for (const m of text.matchAll(tl)) {
      if (m[1]) continue;
      if (badEscape.test(m[0])) {
        const line = text.slice(0, m.index).split("\n").length;
        fail(`[${shown}:${line}] template literal contains a KaTeX backslash but is not String.raw`);
      }
    }
  }
}

function contentSourceFiles(onlyModule?: string): string[] {
  const dirs = [join("src", "content", "problems"), join("src", "content", "modules")];
  const out: string[] = [];
  for (const d of dirs) {
    for (const f of readdirSync(d)) {
      if (!f.endsWith(".ts")) continue;
      if (onlyModule === "bt" && !f.startsWith("brainteasers")) continue;
      if (onlyModule === "bt-a" && f !== "brainteasersA.ts") continue;
      if (onlyModule === "bt-b" && f !== "brainteasersB.ts") continue;
      if (onlyModule && /^\d+$/.test(onlyModule) && f !== `m${onlyModule}.ts`) continue;
      out.push(join(d, f));
    }
  }
  return out;
}

interface CheckOutcome {
  id: string;
  method: string;
  ok: boolean;
  computed: number;
  expected: number;
  se?: number;
  ms: number;
}

function runChecks(problems: Problem[], specs: VerifySpec): CheckOutcome[] {
  const outcomes: CheckOutcome[] = [];
  for (const p of problems) {
    const checks = specs[p.id];
    const where = `[${p.id}]`;
    if (!checks || checks.length === 0) {
      fail(`${where} has no verification checks in src/content/verify`);
      continue;
    }
    const methods = checks.map((c) => c.method);
    const declared = [...(p.verifiedBy ?? [])].sort();
    const actual = [...new Set(methods)].sort();
    if (JSON.stringify(declared) !== JSON.stringify(actual))
      fail(`${where} verifiedBy ${JSON.stringify(declared)} does not match checks ${JSON.stringify(actual)}`);
    if (new Set(methods).size !== methods.length) fail(`${where} lists the same method twice`);

    const expected = p.answer.type === "numeric" ? p.answer.value : p.answer.correct;
    for (const check of checks) {
      const rng = rngFromString(`${p.id}:${check.method}`);
      const t0 = performance.now();
      let result: number | { value: number; se: number };
      try {
        result = check.run(rng);
      } catch (e) {
        fail(`${where} ${check.method} threw: ${e instanceof Error ? e.message : String(e)}`);
        continue;
      }
      const ms = performance.now() - t0;
      if (typeof result === "number") {
        const tol = Math.max(1e-9, 1e-9 * Math.abs(expected));
        const ok = Number.isFinite(result) && Math.abs(result - expected) <= tol;
        outcomes.push({ id: p.id, method: check.method, ok, computed: result, expected, ms });
        if (!ok) fail(`${where} ${check.method} computed ${result} but answer is ${expected}`);
      } else {
        const { value, se } = result;
        if (p.answer.type === "choice") {
          fail(`${where} ${check.method} returned a simulation result for a choice answer; return the index`);
          continue;
        }
        const noiseBudget = Math.max(0.01 * Math.abs(expected), 5e-4);
        const precise = 6 * se <= noiseBudget;
        const agrees = Number.isFinite(value) && Math.abs(value - expected) <= Math.max(6 * se, 1e-12);
        const ok = precise && agrees;
        outcomes.push({ id: p.id, method: check.method, ok, computed: value, expected, se, ms });
        if (!agrees)
          fail(
            `${where} ${check.method} estimated ${value.toFixed(6)} ± ${se.toExponential(2)} but answer is ${expected} (off by ${(Math.abs(value - expected) / Math.max(se, 1e-300)).toFixed(1)} se)`,
          );
        else if (!precise)
          fail(`${where} ${check.method} is too noisy to be a real check: 6·se = ${(6 * se).toExponential(2)} > budget ${noiseBudget.toExponential(2)}; increase trials`);
      }
      if (ms > 8000) warn(`${where} ${check.method} took ${(ms / 1000).toFixed(1)}s`);
    }
  }
  return outcomes;
}

function summarise(problems: Problem[], outcomes: CheckOutcome[], meta: ModuleMeta[]) {
  const lines: string[] = [];
  const practice = problems.filter((p) => p.kind === "practice");
  const byModule = new Map<number, number[]>();
  for (const p of practice) {
    const row = byModule.get(p.module) ?? [0, 0, 0, 0, 0];
    row[p.difficulty - 1]++;
    byModule.set(p.module, row);
  }
  if (meta.length) {
    lines.push("module   total   d1  d2  d3  d4  d5   hard%");
    for (const m of meta) {
      const row = byModule.get(m.id) ?? [0, 0, 0, 0, 0];
      const total = row.reduce((a, b) => a + b, 0);
      const hard = total ? (((row[3] + row[4]) / total) * 100).toFixed(0) : "-";
      lines.push(`${String(m.id).padStart(6)}   ${String(total).padStart(5)}   ${row.map((r) => String(r).padStart(2)).join("  ")}   ${String(hard).padStart(4)}%`);
    }
    lines.push("");
  }
  const hardTotal = practice.filter((p) => p.difficulty >= 4).length;
  const checks = problems.filter((p) => p.kind === "lessonCheck").length;
  const brain = problems.filter((p) => p.kind === "brainteaser").length;
  lines.push(`practice problems: ${practice.length}   (difficulty 4-5: ${hardTotal}, ${practice.length ? ((100 * hardTotal) / practice.length).toFixed(1) : 0}%)`);
  lines.push(`lesson checks: ${checks}   brainteasers: ${brain}   total items: ${problems.length}`);
  const perProblemMethods = new Map<string, Set<string>>();
  for (const o of outcomes) {
    if (!o.ok) continue;
    const s = perProblemMethods.get(o.id) ?? new Set();
    s.add(o.method);
    perProblemMethods.set(o.id, s);
  }
  const twoPlus = [...perProblemMethods.values()].filter((s) => s.size >= 2).length;
  lines.push(`verified by two or more independent methods: ${twoPlus} / ${problems.length}`);
  lines.push(`checks run: ${outcomes.length}   passed: ${outcomes.filter((o) => o.ok).length}`);
  return {
    lines,
    stats: { practice: practice.length, hard: hardTotal, checks, brain, total: problems.length, twoPlus, byModule: Object.fromEntries(byModule) },
  };
}

async function main() {
  const loaded = await loadContent();
  let problems = loaded.problems;
  if (onlyIds) problems = problems.filter((p) => onlyIds.includes(p.id));

  const t0 = performance.now();
  validateSources(contentSourceFiles(onlyModule));
  validateSchema(problems);
  if (!onlyIds) validateLessons(loaded);
  const outcomes = runChecks(problems, loaded.specs);
  const { lines, stats } = summarise(problems, outcomes, loaded.meta);

  console.log("\nEdgework content verification" + (onlyModule ? ` (module ${onlyModule})` : ""));
  console.log("=============================\n");
  console.log(lines.join("\n"));
  console.log(`\nelapsed: ${((performance.now() - t0) / 1000).toFixed(1)}s`);

  if (warnings.length) {
    console.log(`\n${warnings.length} warning(s):`);
    for (const w of warnings) console.log("  ! " + w);
  }
  if (failures.length) {
    console.log(`\n${failures.length} FAILURE(S):`);
    for (const f of failures) console.log("  x " + f);
    console.log("\nVerification FAILED. Fix every item above; nothing unverified ships.");
    process.exitCode = 1;
  } else {
    console.log(`\nAll ${problems.length} item(s) verified.`);
  }

  if (writeReport) {
    const report = {
      generatedAt: new Date().toISOString(),
      stats,
      failures,
      warnings,
      outcomes: outcomes.map((o) => ({ id: o.id, method: o.method, ok: o.ok, computed: o.computed, expected: o.expected, se: o.se })),
    };
    writeFileSync("content-report.json", JSON.stringify(report, null, 2));
    console.log("wrote content-report.json");
  }
}

main().catch((e) => {
  console.error("verify crashed:", e);
  process.exitCode = 1;
});
