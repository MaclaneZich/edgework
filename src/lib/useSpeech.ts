"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Minimal typing for the Web Speech API recognition object. */
interface RecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
}

type RecognitionCtor = new () => RecognitionLike;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function dictationSupported(): boolean {
  return getRecognitionCtor() !== null;
}

export function synthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Live dictation. `transcript` accumulates final results; `interim` is the in-progress phrase. */
export function useDictation() {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<RecognitionLike | null>(null);
  const wantListening = useRef(false);

  useEffect(() => {
    setSupported(dictationSupported());
  }, []);

  const stop = useCallback(() => {
    wantListening.current = false;
    recRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setError("Dictation is not available in this browser. Type instead.");
      return;
    }
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript + " ";
        else interimText += r[0].transcript;
      }
      if (finalText) setTranscript((t) => (t + finalText).replace(/\s+/g, " "));
      setInterim(interimText);
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed") setError("Microphone access was blocked. Allow it in the browser, or type instead.");
      else if (e.error !== "no-speech" && e.error !== "aborted") setError(`Dictation error: ${e.error}`);
    };
    rec.onend = () => {
      // Chrome stops after silence; restart while the user still wants to dictate.
      if (wantListening.current) {
        try {
          rec.start();
          return;
        } catch {
          /* fall through */
        }
      }
      setListening(false);
    };
    recRef.current = rec;
    wantListening.current = true;
    setError(null);
    try {
      rec.start();
      setListening(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start dictation");
    }
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
    setInterim("");
  }, []);

  useEffect(() => () => recRef.current?.abort(), []);

  return { supported, listening, transcript, interim, error, start, stop, reset, setTranscript };
}

/** Read text aloud with the browser's speech synthesis. Strips KaTeX markers crudely. */
export function speak(text: string, opts: { rate?: number } = {}): void {
  if (!synthesisSupported()) return;
  const cleaned = text
    .replace(/\$\$?([^$]*)\$\$?/g, (_, tex: string) =>
      tex
        .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1 over $2")
        .replace(/\\binom\{([^}]*)\}\{([^}]*)\}/g, "$1 choose $2")
        .replace(/\\cdot|\\times/g, " times ")
        .replace(/\\le(q)?/g, " at most ")
        .replace(/\\ge(q)?/g, " at least ")
        .replace(/\\[a-zA-Z]+/g, " ")
        .replace(/[{}^_]/g, " "),
    )
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ");
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(cleaned);
  u.rate = opts.rate ?? 1;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking(): void {
  if (synthesisSupported()) window.speechSynthesis.cancel();
}
