"use client";

/**
 * Client-side test runner for the coding warmup. JavaScript runs inside a Web Worker built
 * from a Blob (so a runaway loop can be terminated); Python runs through Pyodide, loaded on
 * demand from a CDN the first time it is requested.
 */

import type { CodingProblem, CodingTest } from "@/content/coding";

export interface TestResult {
  name: string;
  passed: boolean;
  expected: unknown;
  received: unknown;
  error?: string;
  ms: number;
}

export interface RunOutcome {
  ok: boolean;
  results: TestResult[];
  error?: string;
  logs: string[];
}

const WORKER_SOURCE = `
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function materialise(arg) {
  if (typeof arg === "string" && arg.startsWith("__rng__:")) return mulberry32(Number(arg.slice(8)));
  return arg;
}
function approxEqual(a, b, tol) {
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) <= (tol || 1e-9) * Math.max(1, Math.abs(b));
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => approxEqual(x, b[i], tol));
  if (a && b && typeof a === "object" && typeof b === "object") {
    const ka = Object.keys(a).sort(); const kb = Object.keys(b).sort();
    return JSON.stringify(ka) === JSON.stringify(kb) && ka.every((k) => approxEqual(a[k], b[k], tol));
  }
  return a === b;
}
self.onmessage = (e) => {
  const { code, functionName, tests } = e.data;
  const logs = [];
  const console = { log: (...a) => logs.push(a.map((x) => typeof x === "string" ? x : JSON.stringify(x)).join(" ")) };
  let fn;
  try {
    fn = new Function("console", code + "\\n; return typeof " + functionName + " === 'function' ? " + functionName + " : undefined;")(console);
  } catch (err) {
    self.postMessage({ ok: false, error: "Could not load your code: " + (err && err.message ? err.message : String(err)), results: [], logs });
    return;
  }
  if (typeof fn !== "function") {
    self.postMessage({ ok: false, error: "Define a function named " + functionName + ".", results: [], logs });
    return;
  }
  const results = [];
  for (const t of tests) {
    const t0 = performance.now();
    try {
      const received = fn(...t.args.map(materialise));
      const passed = approxEqual(received, t.expected, t.tolerance);
      results.push({ name: t.name, passed, expected: t.expected, received, ms: performance.now() - t0 });
    } catch (err) {
      results.push({ name: t.name, passed: false, expected: t.expected, received: undefined, error: err && err.message ? err.message : String(err), ms: performance.now() - t0 });
    }
  }
  self.postMessage({ ok: results.every((r) => r.passed), results, logs });
};
`;

export function runJavaScript(problem: CodingProblem, code: string, timeoutMs = 4000): Promise<RunOutcome> {
  return new Promise((resolve) => {
    const blob = new Blob([WORKER_SOURCE], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    const timer = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ ok: false, results: [], error: `Timed out after ${timeoutMs / 1000}s. Check for an infinite loop or a very slow approach.`, logs: [] });
    }, timeoutMs);
    worker.onmessage = (e) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(e.data as RunOutcome);
    };
    worker.onerror = (e) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ ok: false, results: [], error: e.message || "Worker error", logs: [] });
    };
    worker.postMessage({ code, functionName: problem.functionName, tests: problem.tests });
  });
}

/* ---------------- Python via Pyodide ---------------- */

const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.27.2/full/pyodide.js";

interface PyodideLike {
  runPythonAsync: (code: string) => Promise<unknown>;
  globals: { get: (name: string) => unknown };
}

let pyodidePromise: Promise<PyodideLike> | null = null;

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<PyodideLike>;
  }
}

export function pyodideAvailable(): boolean {
  return pyodidePromise !== null;
}

export function loadPyodideRuntime(onStatus?: (s: string) => void): Promise<PyodideLike> {
  if (pyodidePromise) return pyodidePromise;
  pyodidePromise = new Promise<PyodideLike>((resolve, reject) => {
    onStatus?.("Downloading the Python runtime (about 10 MB, once)...");
    const script = document.createElement("script");
    script.src = PYODIDE_URL;
    script.async = true;
    script.onload = async () => {
      try {
        if (!window.loadPyodide) throw new Error("Pyodide did not initialise");
        onStatus?.("Starting Python...");
        const py = await window.loadPyodide({ indexURL: PYODIDE_URL.replace(/pyodide\.js$/, "") });
        onStatus?.("Python ready.");
        resolve(py);
      } catch (e) {
        pyodidePromise = null;
        reject(e);
      }
    };
    script.onerror = () => {
      pyodidePromise = null;
      reject(new Error("Could not download Pyodide. Check your connection, or use JavaScript."));
    };
    document.head.appendChild(script);
  });
  return pyodidePromise;
}

function pyName(functionName: string): string {
  return functionName.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase());
}

export async function runPython(problem: CodingProblem, code: string, onStatus?: (s: string) => void): Promise<RunOutcome> {
  let py: PyodideLike;
  try {
    py = await loadPyodideRuntime(onStatus);
  } catch (e) {
    return { ok: false, results: [], error: e instanceof Error ? e.message : String(e), logs: [] };
  }
  const fn = pyName(problem.functionName);
  const testsJson = JSON.stringify(problem.tests.map((t: CodingTest) => ({ name: t.name, args: t.args, expected: t.expected, tolerance: t.tolerance ?? null })));
  const harness = `
import json, time, math
__logs = []
def __mulberry32(seed):
    state = [seed & 0xFFFFFFFF]
    def rand():
        state[0] = (state[0] + 0x6D2B79F5) & 0xFFFFFFFF
        t = state[0]
        t = ((t ^ (t >> 15)) * (t | 1)) & 0xFFFFFFFF
        t ^= (t + (((t ^ (t >> 7)) * (t | 61)) & 0xFFFFFFFF)) & 0xFFFFFFFF
        return ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296
    return rand
def __materialise(a):
    if isinstance(a, str) and a.startswith("__rng__:"):
        return __mulberry32(int(a[8:]))
    return a
def __approx(a, b, tol):
    if isinstance(a, bool) or isinstance(b, bool):
        return a == b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return abs(a - b) <= (tol if tol is not None else 1e-9) * max(1, abs(b))
    if isinstance(a, (list, tuple)) and isinstance(b, (list, tuple)):
        return len(a) == len(b) and all(__approx(x, y, tol) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        return sorted(a.keys()) == sorted(b.keys()) and all(__approx(a[k], b[k], tol) for k in a)
    return a == b
__results = []
__error = None
try:
    exec(${JSON.stringify(code)}, globals())
    if "${fn}" not in globals():
        __error = "Define a function named ${fn}."
    else:
        for t in json.loads(${JSON.stringify(testsJson)}):
            t0 = time.time()
            try:
                received = globals()["${fn}"](*[__materialise(a) for a in t["args"]])
                if isinstance(received, tuple):
                    received = list(received)
                passed = __approx(received, t["expected"], t["tolerance"])
                __results.append({"name": t["name"], "passed": bool(passed), "expected": t["expected"], "received": received, "ms": (time.time() - t0) * 1000})
            except Exception as e:
                __results.append({"name": t["name"], "passed": False, "expected": t["expected"], "received": None, "error": repr(e), "ms": (time.time() - t0) * 1000})
except Exception as e:
    __error = "Could not load your code: " + repr(e)
json.dumps({"ok": __error is None and all(r["passed"] for r in __results), "results": __results, "error": __error, "logs": __logs})
`;
  try {
    const out = (await py.runPythonAsync(harness)) as string;
    return JSON.parse(out) as RunOutcome;
  } catch (e) {
    return { ok: false, results: [], error: e instanceof Error ? e.message : String(e), logs: [] };
  }
}

export async function runCode(problem: CodingProblem, code: string, language: "js" | "py", onStatus?: (s: string) => void): Promise<RunOutcome> {
  return language === "js" ? runJavaScript(problem, code) : runPython(problem, code, onStatus);
}
