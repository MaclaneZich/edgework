"use client";

import clsx from "clsx";
import { Check, Mic, MicOff, Shuffle, Timer, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MODULE_META, PROBLEMS, getProblem } from "@/content";
import type { Problem } from "@/content/types";
import { mulberry32, shuffle } from "@/lib/rng";
import { useData, useStore } from "@/lib/store";
import { speak, stopSpeaking, synthesisSupported, useDictation } from "@/lib/useSpeech";
import { MathText } from "@/components/Math";
import { ConfidencePicker } from "@/components/session/ConfidencePicker";
import { Badge, DifficultyBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, Stat } from "@/components/ui/Card";
import { Field, Select, Textarea } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";

type Rating = "got" | "partly" | "missed";

const CONCEPTS: Array<{ id: string; title: string; rubric: string[] }> = [
  { id: "linearity", title: "Linearity of expectation", rubric: ["State it: E[X+Y] = E[X] + E[Y] with no independence needed", "Give the indicator trick with an example", "Explain why dependence does not matter", "Mention when it is not enough (variance, distribution)"] },
  { id: "bayes", title: "Bayes' rule", rubric: ["State the rule or the odds form", "Explain prior, likelihood, posterior in plain words", "Walk a false-positive example with a 10,000 table", "Name the base-rate trap"] },
  { id: "complement", title: "The complement trick", rubric: ["Explain when 'at least one' means compute 'none'", "Give the independent-trials formula 1 - (1-p)^n", "Show a case where events overlap so adding fails", "Mention inclusion-exclusion as the general version"] },
  { id: "first-step", title: "First-step analysis", rubric: ["Define the unknown as an expectation from a state", "Condition on the first step and write the equation", "Solve a small example (expected rolls to a six)", "Explain progress states for patterns like HH"] },
  { id: "gamblers-ruin", title: "Gambler's ruin", rubric: ["Set up states 0..N and the absorbing ends", "Give the fair-game answer k/N and the duration k(N-k)", "Explain what changes with a biased coin", "Say why a casino with an edge always wins in the long run"] },
  { id: "kelly", title: "Kelly sizing", rubric: ["State the objective: maximise expected log growth", "Give f = p - q/b and interpret edge over odds", "Explain why over-betting loses with an edge", "Explain why half-Kelly is common in practice"] },
  { id: "market", title: "How to make a market", rubric: ["Fair value first: the conditional expectation", "Width: uncertainty and informed flow", "Skew for inventory", "Adverse selection: why informed trades always cost you"] },
  { id: "variance", title: "Variance of a sum", rubric: ["State Var(X+Y) = Var X + Var Y + 2 Cov", "Independent terms add; give the n dice example", "Contrast X+X with X+Y", "Mention standard error shrinking like 1/sqrt(n)"] },
  { id: "monty", title: "The Monty Hall family", rubric: ["State the rules precisely: the host knows and always opens a goat door", "Give the 2/3 answer and the intuition", "Explain what changes with a random host", "Generalise to more doors"] },
  { id: "coupon", title: "Coupon collector", rubric: ["Decompose into waiting times for each new coupon", "Each wait is geometric with p = (n-k)/n", "Sum to n times the harmonic number", "Give the n ln n approximation"] },
];

export default function SpeakPage() {
  const [tab, setTab] = useState<"speak" | "teach">("speak");
  return (
    <div>
      <PageHeader
        eyebrow="Spoken practice"
        title="Speak it out"
        description="Interviews are spoken. Explain your approach out loud, see the transcript, then grade yourself against the solution's key steps. Dictation is opt-in (Settings); typing always works."
      />
      <Tabs items={[{ id: "speak", label: "Explain a problem" }, { id: "teach", label: "Teach it back (60s)" }]} value={tab} onChange={setTab} className="mb-6" />
      {tab === "speak" ? <SpeakProblem /> : <TeachBack />}
    </div>
  );
}

function useVoiceSettings() {
  const voiceEnabled = useStore((s) => s.settings.voiceEnabled);
  const readAloud = useStore((s) => s.settings.readAloud);
  return { voiceEnabled, readAloud };
}

function DictationBox({ value, onChange, placeholder, rows = 6 }: { value: string; onChange: (v: string) => void; placeholder: string; rows?: number }) {
  const { voiceEnabled } = useVoiceSettings();
  const d = useDictation();
  const lastApplied = useRef("");
  useEffect(() => {
    if (!d.transcript || d.transcript === lastApplied.current) return;
    const addition = d.transcript.slice(lastApplied.current.length);
    lastApplied.current = d.transcript;
    onChange((value ? value + " " : "") + addition.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.transcript]);
  return (
    <div>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} aria-label="Your explanation" className="font-sans" />
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
        {voiceEnabled && d.supported ? (
          <Button size="sm" variant={d.listening ? "danger" : "secondary"} leftIcon={d.listening ? <MicOff size={14} /> : <Mic size={14} />} onClick={d.listening ? d.stop : d.start}>
            {d.listening ? "Stop dictation" : "Dictate"}
          </Button>
        ) : (
          <span className="text-faint">{voiceEnabled ? "This browser has no dictation; type instead." : "Dictation is off. Enable it in Settings to speak instead of typing."}</span>
        )}
        {d.listening && <span className="text-accent">Listening… {d.interim && <em className="text-muted">{d.interim}</em>}</span>}
        {d.error && <span className="text-danger">{d.error}</span>}
      </div>
    </div>
  );
}

function SpeakProblem() {
  const data = useData();
  const saveSpeak = useStore((s) => s.saveSpeak);
  const updateError = useStore((s) => s.updateError);
  const { readAloud } = useVoiceSettings();
  const [moduleId, setModuleId] = useState(0);
  const pool = useMemo(() => PROBLEMS.filter((p) => p.kind === "practice" && (!moduleId || p.module === moduleId)), [moduleId]);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [explanation, setExplanation] = useState("");
  const [phase, setPhase] = useState<"explain" | "grade" | "done">("explain");
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [confidence, setConfidence] = useState<number | null>(null);
  const startedAt = useRef(Date.now());
  const [speaking, setSpeaking] = useState(false);

  const pick = useCallback(() => {
    const attempted = new Set(data.attempts.map((a) => a.problemId));
    const fresh = pool.filter((p) => !attempted.has(p.id));
    const list = shuffle(fresh.length ? fresh : pool, mulberry32(Date.now() % 100_000));
    setProblem(list[0] ?? null);
    setExplanation("");
    setPhase("explain");
    setRatings([]);
    setConfidence(null);
    startedAt.current = Date.now();
    stopSpeaking();
    setSpeaking(false);
  }, [pool, data.attempts]);

  useEffect(() => {
    if (!problem && pool.length) pick();
  }, [problem, pool, pick]);

  const finish = () => {
    if (!problem || confidence === null) return;
    saveSpeak({ problemId: problem.id, mode: "speak", timestamp: Date.now(), transcript: explanation, stepRatings: ratings, confidence, durationMs: Date.now() - startedAt.current });
    const entry = useStore.getState().errorLog.find((e) => e.problemId === problem.id && e.resolvedAt === null);
    if (entry && explanation.trim()) updateError(entry.id, { transcript: explanation });
    setPhase("done");
  };

  if (!problem) return <Card className="p-8 text-sm text-muted">No problems available for that module yet.</Card>;
  const meta = MODULE_META.find((m) => m.id === problem.module)!;
  const score = ratings.length ? (ratings.filter((r) => r === "got").length + 0.5 * ratings.filter((r) => r === "partly").length) / ratings.length : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <Card>
          <CardBody className="pt-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <DifficultyBadge level={problem.difficulty} />
              <Badge tone="outline">{meta.title}</Badge>
              <span className="text-xs text-faint">{problem.title}</span>
              <span className="ml-auto flex gap-2">
                {synthesisSupported() && readAloud && (
                  <Button
                    size="sm"
                    variant="ghost"
                    leftIcon={speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    onClick={() => {
                      if (speaking) {
                        stopSpeaking();
                        setSpeaking(false);
                      } else {
                        speak(problem.prompt);
                        setSpeaking(true);
                      }
                    }}
                  >
                    {speaking ? "Stop" : "Read aloud"}
                  </Button>
                )}
                <Button size="sm" variant="ghost" leftIcon={<Shuffle size={14} />} onClick={pick}>
                  Another
                </Button>
              </span>
            </div>
            <MathText className="text-[17px] leading-relaxed text-fg">{problem.prompt}</MathText>
          </CardBody>
        </Card>

        {phase === "explain" && (
          <Card>
            <CardHeader title="Explain your approach" subtitle="Say what you would say to an interviewer: the model, the key step, the answer, and a sanity check. Do not aim for perfect; aim for structured." />
            <CardBody>
              <DictationBox value={explanation} onChange={setExplanation} placeholder="First I would define the sample space as... The key observation is... So the probability is... A quick check: ..." />
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-faint">{explanation.trim().split(/\s+/).filter(Boolean).length} words</span>
                <Button onClick={() => setPhase("grade")} disabled={explanation.trim().length < 20}>
                  Compare with the solution
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {phase !== "explain" && (
          <Card>
            <CardHeader title="Key steps" subtitle="Rate each step: did your explanation cover it?" />
            <CardBody>
              <ol className="flex flex-col gap-3">
                {problem.steps.map((s, i) => {
                  const r = ratings[i];
                  return (
                    <li key={i} className="flex flex-col gap-2 rounded-xl border border-border p-3 md:flex-row md:items-center md:justify-between">
                      <span className="text-sm text-fg">
                        <span className="mr-2 font-mono text-xs text-faint">{i + 1}</span>
                        <MathText as="span">{s}</MathText>
                      </span>
                      <div className="flex gap-1.5">
                        {(["got", "partly", "missed"] as Rating[]).map((opt) => (
                          <button
                            key={opt}
                            disabled={phase === "done"}
                            onClick={() =>
                              setRatings((arr) => {
                                const next = [...arr];
                                while (next.length < problem.steps.length) next.push("missed");
                                next[i] = opt;
                                return next;
                              })
                            }
                            className={clsx(
                              "rounded-lg border px-2.5 py-1 text-xs capitalize",
                              r === opt ? (opt === "got" ? "border-success bg-success-soft text-success" : opt === "partly" ? "border-accent-fill bg-accent-soft text-accent" : "border-danger bg-danger-soft text-danger") : "border-border text-muted hover:text-fg",
                            )}
                            aria-pressed={r === opt}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ol>
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-muted hover:text-fg">Full worked solution</summary>
                <MathText className="mt-2 text-[15px] text-fg">{problem.solution}</MathText>
              </details>
              {phase === "grade" && (
                <div className="mt-4 space-y-3">
                  <ConfidencePicker value={confidence} onChange={setConfidence} />
                  <div className="text-xs text-muted">How confident are you that your explanation would satisfy an interviewer?</div>
                  <Button onClick={finish} disabled={ratings.length < problem.steps.length || confidence === null} leftIcon={<Check size={16} />}>
                    Save self-assessment
                  </Button>
                </div>
              )}
              {phase === "done" && (
                <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-surface-2/60 p-4">
                  <Stat label="Coverage" value={`${Math.round(score * 100)}%`} hint="got = 1, partly = ½" />
                  <Stat label="Confidence" value={`${Math.round((confidence ?? 0) * 100)}%`} />
                  <p className="flex-1 text-sm text-muted">
                    {score >= 0.8 ? "Clean. Next time say it faster and add the sanity check first." : score >= 0.5 ? "Half the structure was there. Re-read the solution and explain it again from memory." : "Most steps were missing. Read the solution, close it, and explain the whole thing out loud once more before moving on."}
                  </p>
                  <Button onClick={pick} variant="secondary" leftIcon={<Shuffle size={14} />}>
                    Next problem
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {phase === "explain" && explanation.trim() && (
          <Card className="p-4">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">Transcript</div>
            <p className="text-sm text-fg">{explanation}</p>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader title="Pick from" />
          <CardBody>
            <Field label="Module">
              <Select
                value={moduleId}
                onChange={(e) => {
                  setModuleId(Number(e.target.value));
                  setProblem(null);
                }}
              >
                <option value={0}>Any module with content</option>
                {MODULE_META.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id}. {m.title}
                  </option>
                ))}
              </Select>
            </Field>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Recent explanations" subtitle={`${data.speak.length} saved`} />
          <CardBody className="pt-2">
            {data.speak.length === 0 ? (
              <p className="text-sm text-faint">Transcripts and self-ratings are stored locally and also attached to the error log entry when one exists.</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {[...data.speak]
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .slice(0, 8)
                  .map((s) => {
                    const p = s.problemId ? getProblem(s.problemId) : null;
                    const cov = s.stepRatings.length ? (s.stepRatings.filter((r) => r === "got").length + 0.5 * s.stepRatings.filter((r) => r === "partly").length) / s.stepRatings.length : null;
                    return (
                      <li key={s.id} className="flex items-center gap-2 py-2">
                        <span className="min-w-0 flex-1 truncate text-fg">{p?.title ?? s.concept ?? "Concept"}</span>
                        <span className="font-mono text-xs text-muted">{cov === null ? "–" : `${Math.round(cov * 100)}%`}</span>
                      </li>
                    );
                  })}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function TeachBack() {
  const saveSpeak = useStore((s) => s.saveSpeak);
  const [conceptId, setConceptId] = useState(CONCEPTS[0].id);
  const concept = CONCEPTS.find((c) => c.id === conceptId)!;
  const [text, setText] = useState("");
  const [left, setLeft] = useState(60);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<"ready" | "talking" | "grade" | "done">("ready");
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [confidence, setConfidence] = useState<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          setRunning(false);
          setPhase("grade");
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const start = () => {
    setText("");
    setRatings([]);
    setConfidence(null);
    setLeft(60);
    setPhase("talking");
    setRunning(true);
  };

  const score = ratings.length ? (ratings.filter((r) => r === "got").length + 0.5 * ratings.filter((r) => r === "partly").length) / ratings.length : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader title={concept.title} subtitle="Sixty seconds. Explain it to a smart friend who has never seen it. Start with the one-sentence version." action={<span className={clsx("font-mono text-2xl tabular", left <= 10 && running ? "text-danger" : "text-fg")}>{left}s</span>} />
        <CardBody>
          {phase === "ready" && (
            <Button onClick={start} leftIcon={<Timer size={16} />}>
              Start the 60 seconds
            </Button>
          )}
          {phase === "talking" && (
            <>
              <DictationBox value={text} onChange={setText} placeholder="In one sentence, ... The reason it works is ... For example, ..." rows={7} />
              <Button
                className="mt-3"
                variant="secondary"
                onClick={() => {
                  setRunning(false);
                  setPhase("grade");
                }}
              >
                Done early
              </Button>
            </>
          )}
          {(phase === "grade" || phase === "done") && (
            <div className="space-y-4">
              {text.trim() && (
                <div className="rounded-xl border border-border bg-surface-2/60 p-3 text-sm text-fg">
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-faint">What you said</div>
                  {text}
                </div>
              )}
              <div className="text-sm font-medium text-fg">Rubric</div>
              <ol className="flex flex-col gap-2">
                {concept.rubric.map((item, i) => (
                  <li key={i} className="flex flex-col gap-2 rounded-xl border border-border p-3 md:flex-row md:items-center md:justify-between">
                    <span className="text-sm text-fg">{item}</span>
                    <div className="flex gap-1.5">
                      {(["got", "partly", "missed"] as Rating[]).map((opt) => (
                        <button
                          key={opt}
                          disabled={phase === "done"}
                          onClick={() =>
                            setRatings((arr) => {
                              const next = [...arr];
                              while (next.length < concept.rubric.length) next.push("missed");
                              next[i] = opt;
                              return next;
                            })
                          }
                          className={clsx("rounded-lg border px-2.5 py-1 text-xs capitalize", ratings[i] === opt ? (opt === "got" ? "border-success bg-success-soft text-success" : opt === "partly" ? "border-accent-fill bg-accent-soft text-accent" : "border-danger bg-danger-soft text-danger") : "border-border text-muted hover:text-fg")}
                          aria-pressed={ratings[i] === opt}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>
              {phase === "grade" && (
                <>
                  <ConfidencePicker value={confidence} onChange={setConfidence} />
                  <Button
                    disabled={ratings.length < concept.rubric.length || confidence === null}
                    onClick={() => {
                      saveSpeak({ problemId: null, concept: concept.title, mode: "teach", timestamp: Date.now(), transcript: text, stepRatings: ratings, confidence: confidence ?? 0.5, durationMs: (60 - left) * 1000 });
                      setPhase("done");
                    }}
                  >
                    Save
                  </Button>
                </>
              )}
              {phase === "done" && (
                <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-surface-2/60 p-4">
                  <Stat label="Rubric" value={`${Math.round(score * 100)}%`} />
                  <Button variant="secondary" onClick={() => setPhase("ready")}>
                    Again
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>
      <Card className="h-fit">
        <CardHeader title="Concept" />
        <CardBody>
          <Select
            value={conceptId}
            onChange={(e) => {
              setConceptId(e.target.value);
              setPhase("ready");
              setRunning(false);
            }}
          >
            {CONCEPTS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </Select>
          <p className="mt-3 text-xs text-muted">The rubric stays hidden until the minute is up, so you cannot read from it.</p>
        </CardBody>
      </Card>
    </div>
  );
}
