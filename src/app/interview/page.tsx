"use client";

import clsx from "clsx";
import { ArrowRight, MessagesSquare, Mic, MicOff, Shuffle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MODULE_META, PROBLEMS, getProblem } from "@/content";
import type { Problem } from "@/content/types";
import { formatDuration } from "@/lib/format";
import { mulberry32, shuffle } from "@/lib/rng";
import { useData, useStore } from "@/lib/store";
import { useDictation } from "@/lib/useSpeech";
import { MathText } from "@/components/Math";
import { Badge, DifficultyBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, Stat } from "@/components/ui/Card";
import { Field, Select, Textarea } from "@/components/ui/Input";
import { PageHeader } from "@/components/ui/PageHeader";

interface FollowUp {
  kind: string;
  question: string;
  answer: string;
}

function followUpsFor(p: Problem): FollowUp[] {
  const list: FollowUp[] = [
    { kind: "Change an assumption", question: p.variation, answer: p.variationAnswer },
    { kind: "Intuition", question: "Before any algebra: in one sentence, why is the answer roughly that size and not, say, twice as big or half as big?", answer: p.keyIdea },
    { kind: "Sanity check", question: "Give me a quick check that your number is plausible: a bound, a limiting case, or a symmetry.", answer: p.fastPath },
  ];
  if (p.tags.includes("dice") || p.tags.includes("coins")) {
    list.splice(1, 0, {
      kind: "Bias",
      question: p.tags.includes("dice") ? "Now suppose the die is biased so that a six comes up with probability 1/4 and the other faces share the rest equally. Which parts of your argument survive?" : "Now suppose the coin lands heads with probability 0.6. What changes, and in which direction does the answer move?",
      answer: "Independence and the structure of the argument survive; only the per-trial probabilities change. Redo the count with the new probabilities and check the direction of the change against intuition.",
    });
  }
  if (p.answer.type === "numeric" && !Number.isInteger(p.answer.value)) {
    list.push({ kind: "Bound", question: "Without recomputing, give me an upper bound on the answer and explain why it is a bound.", answer: "Use the complement, a union bound, or a crude count that ignores a constraint; name which constraint you dropped." });
  }
  list.push({ kind: "Recovery", question: "Suppose you had answered too quickly and I told you the answer was wrong. Where would you look first for the mistake?", answer: p.commonMistake });
  return list;
}

export default function InterviewPage() {
  const data = useData();
  const saveInterview = useStore((s) => s.saveInterview);
  const voiceEnabled = useStore((s) => s.settings.voiceEnabled);
  const [moduleId, setModuleId] = useState(0);
  const [minDiff, setMinDiff] = useState(3);
  const pool = useMemo(() => PROBLEMS.filter((p) => p.kind === "practice" && p.difficulty >= minDiff && (!moduleId || p.module === moduleId)), [moduleId, minDiff]);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [stage, setStage] = useState<"approach" | "followups" | "rubric" | "done">("approach");
  const [approach, setApproach] = useState("");
  const [fuIndex, setFuIndex] = useState(0);
  const [fuAnswers, setFuAnswers] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [rubric, setRubric] = useState({ structure: 0, correctness: 0, communication: 0, recovery: 0 });
  const startedAt = useRef(Date.now());
  const d = useDictation();
  const lastApplied = useRef("");

  useEffect(() => {
    if (!d.transcript || d.transcript === lastApplied.current) return;
    const addition = d.transcript.slice(lastApplied.current.length).trim();
    lastApplied.current = d.transcript;
    if (stage === "approach") setApproach((a) => (a ? a + " " : "") + addition);
    else setCurrent((c) => (c ? c + " " : "") + addition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.transcript]);

  const pick = useCallback(() => {
    const done = new Set(data.interview.map((i) => i.problemId));
    const fresh = pool.filter((p) => !done.has(p.id));
    const list = shuffle(fresh.length ? fresh : pool, mulberry32(Date.now() % 100_000));
    setProblem(list[0] ?? null);
    setStage("approach");
    setApproach("");
    setFuIndex(0);
    setFuAnswers([]);
    setCurrent("");
    setRevealed(false);
    setRubric({ structure: 0, correctness: 0, communication: 0, recovery: 0 });
    startedAt.current = Date.now();
    d.reset();
    lastApplied.current = "";
  }, [pool, data.interview, d]);

  useEffect(() => {
    if (!problem && pool.length) pick();
  }, [problem, pool, pick]);

  if (!problem) return <Card className="p-8 text-sm text-muted">No problems match that filter yet.</Card>;
  const followUps = followUpsFor(problem);
  const meta = MODULE_META.find((m) => m.id === problem.module)!;
  const rubricTotal = rubric.structure + rubric.correctness + rubric.communication + rubric.recovery;

  const nextFollowUp = () => {
    setFuAnswers((a) => [...a, current]);
    setCurrent("");
    setRevealed(false);
    d.reset();
    lastApplied.current = "";
    if (fuIndex + 1 >= followUps.length) setStage("rubric");
    else setFuIndex((i) => i + 1);
  };

  const finish = () => {
    saveInterview({
      problemId: problem.id,
      timestamp: Date.now(),
      approach,
      followUps: followUps.map((f, i) => ({ question: f.question, answer: fuAnswers[i] ?? "" })),
      rubric,
      durationMs: Date.now() - startedAt.current,
    });
    setStage("done");
  };

  const dictationButton = voiceEnabled && d.supported && (
    <Button size="sm" variant={d.listening ? "danger" : "secondary"} leftIcon={d.listening ? <MicOff size={14} /> : <Mic size={14} />} onClick={d.listening ? d.stop : d.start}>
      {d.listening ? "Stop" : "Dictate"}
    </Button>
  );

  return (
    <div>
      <PageHeader
        eyebrow="Live interview rehearsal"
        title="Interview simulator"
        description="One problem, then the follow-ups a real interviewer asks: change an assumption, ask for the intuition, demand a sanity check, probe a bound, watch you recover. Score yourself afterwards."
        actions={
          <Button variant="secondary" leftIcon={<Shuffle size={16} />} onClick={pick}>
            New problem
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <Card>
            <CardBody className="pt-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <DifficultyBadge level={problem.difficulty} />
                <Badge tone="outline">{meta.title}</Badge>
                <span className="ml-auto font-mono text-xs text-faint">{formatDuration(Date.now() - startedAt.current, { compact: true })} elapsed</span>
              </div>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">Interviewer</div>
              <MathText className="text-[17px] leading-relaxed text-fg">{problem.prompt}</MathText>
            </CardBody>
          </Card>

          {stage === "approach" && (
            <Card>
              <CardHeader title="Talk me through your approach" subtitle="Structure first, then the number. Say your assumptions out loud." action={dictationButton} />
              <CardBody>
                <Textarea value={approach} onChange={(e) => setApproach(e.target.value)} rows={6} placeholder="I'll model this as... The key quantity is... Therefore..." aria-label="Your approach" />
                {d.listening && <div className="mt-1 text-xs text-accent">Listening… {d.interim}</div>}
                {d.error && <div className="mt-1 text-xs text-danger">{d.error}</div>}
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => setStage("followups")} disabled={approach.trim().length < 20} rightIcon={<ArrowRight size={16} />}>
                    I&apos;m done, ask away
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {stage === "followups" && (
            <Card>
              <CardHeader title={`Follow-up ${fuIndex + 1} of ${followUps.length}`} subtitle={followUps[fuIndex].kind} action={dictationButton} />
              <CardBody>
                <div className="mb-3 rounded-xl border border-border bg-surface-2/60 p-4">
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">Interviewer</div>
                  <MathText className="text-[15.5px] text-fg">{followUps[fuIndex].question}</MathText>
                </div>
                <Textarea value={current} onChange={(e) => setCurrent(e.target.value)} rows={4} placeholder="Answer out loud or type the gist." aria-label="Your answer" />
                {d.listening && <div className="mt-1 text-xs text-accent">Listening… {d.interim}</div>}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <button className="text-xs text-muted hover:text-fg" onClick={() => setRevealed((r) => !r)}>
                    {revealed ? "Hide" : "Show"} what a strong answer covers
                  </button>
                  <Button onClick={nextFollowUp} rightIcon={<ArrowRight size={16} />}>
                    {fuIndex + 1 >= followUps.length ? "Finish" : "Next follow-up"}
                  </Button>
                </div>
                {revealed && (
                  <div className="mt-3 rounded-xl border border-info/30 bg-info-soft p-3 text-sm fade-up">
                    <MathText className="text-fg">{followUps[fuIndex].answer}</MathText>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {(stage === "rubric" || stage === "done") && (
            <Card>
              <CardHeader title="Score yourself" subtitle="0 to 3 on each dimension. Be harsh; the real panel will be." />
              <CardBody className="space-y-4">
                <details>
                  <summary className="cursor-pointer text-sm text-muted hover:text-fg">Reference solution</summary>
                  <MathText className="mt-2 text-[15px] text-fg">{problem.solution}</MathText>
                </details>
                {(
                  [
                    ["structure", "Structure", "Named the model, stated assumptions, broke the problem into steps"],
                    ["correctness", "Correctness", "Reached the right answer, or the right method with a slip you caught"],
                    ["communication", "Communication", "Clear, paced, said what you were doing before doing it"],
                    ["recovery", "Recovery", "Handled the follow-ups; when stuck, said something useful instead of freezing"],
                  ] as const
                ).map(([key, label, desc]) => (
                  <div key={key} className="flex flex-col gap-2 rounded-xl border border-border p-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-sm font-medium text-fg">{label}</div>
                      <div className="text-xs text-muted">{desc}</div>
                    </div>
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3].map((v) => (
                        <button key={v} disabled={stage === "done"} onClick={() => setRubric((r) => ({ ...r, [key]: v }))} className={clsx("h-8 w-8 rounded-lg border font-mono text-sm", rubric[key] === v ? "border-accent-fill bg-accent-soft text-fg" : "border-border text-muted hover:text-fg")} aria-pressed={rubric[key] === v}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {stage === "rubric" ? (
                  <Button onClick={finish}>Save ({rubricTotal}/12)</Button>
                ) : (
                  <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-surface-2/60 p-4">
                    <Stat label="Score" value={`${rubricTotal}/12`} />
                    <p className="flex-1 text-sm text-muted">{rubricTotal >= 10 ? "Interview-ready on this one." : rubricTotal >= 7 ? "Solid core; the follow-ups are where points are lost. Practise saying the intuition in one sentence." : "Work the module again, then redo this problem in Speak-It-Out before the next simulation."}</p>
                    <Button variant="secondary" onClick={pick} leftIcon={<Shuffle size={14} />}>
                      Next
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Set-up" action={<MessagesSquare size={18} className="text-faint" />} />
            <CardBody className="space-y-3">
              <Field label="Module">
                <Select value={moduleId} onChange={(e) => { setModuleId(Number(e.target.value)); setProblem(null); }}>
                  <option value={0}>Any</option>
                  {MODULE_META.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id}. {m.title}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Minimum difficulty">
                <Select value={minDiff} onChange={(e) => { setMinDiff(Number(e.target.value)); setProblem(null); }}>
                  <option value={2}>2 and up</option>
                  <option value={3}>3 and up (test level)</option>
                  <option value={4}>4 and up (hard)</option>
                </Select>
              </Field>
              <p className="text-xs text-muted">{voiceEnabled ? (d.supported ? "Dictation is on." : "Dictation is unavailable in this browser; type instead.") : "Enable dictation in Settings to answer by voice."}</p>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="History" subtitle={`${data.interview.length} simulation${data.interview.length === 1 ? "" : "s"}`} />
            <CardBody className="pt-2">
              {data.interview.length === 0 ? (
                <p className="text-sm text-faint">Your rubric scores appear here.</p>
              ) : (
                <ul className="divide-y divide-border text-sm">
                  {[...data.interview]
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, 8)
                    .map((i) => {
                      const p = getProblem(i.problemId);
                      const total = i.rubric.structure + i.rubric.correctness + i.rubric.communication + i.rubric.recovery;
                      return (
                        <li key={i.id} className="flex items-center gap-2 py-2">
                          <span className="min-w-0 flex-1 truncate text-fg">{p?.title ?? i.problemId}</span>
                          <span className="font-mono text-xs text-muted">{total}/12</span>
                        </li>
                      );
                    })}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
