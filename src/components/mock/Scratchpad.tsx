"use client";

import clsx from "clsx";
import { Eraser, PenLine, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/Input";

export function Scratchpad({ text, onText }: { text: string; onText: (t: string) => void }) {
  const [mode, setMode] = useState<"type" | "draw">("type");
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const resize = () => {
      const rect = c.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      // preserve content on resize
      const snapshot = document.createElement("canvas");
      snapshot.width = c.width;
      snapshot.height = c.height;
      snapshot.getContext("2d")?.drawImage(c, 0, 0);
      c.width = Math.max(1, Math.floor(rect.width * ratio));
      c.height = Math.max(1, Math.floor(rect.height * ratio));
      const ctx = c.getContext("2d");
      if (ctx) {
        ctx.drawImage(snapshot, 0, 0);
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    return () => ro.disconnect();
  }, [mode]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    const ratio = c.width / rect.width;
    return { x: (e.clientX - rect.left) * ratio, y: (e.clientY - rect.top) * ratio };
  };

  const stroke = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const ratio = window.devicePixelRatio || 1;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 24 * ratio;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--fg").trim() || "#fff";
      ctx.lineWidth = 2.2 * ratio;
    }
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const clear = () => {
    const c = canvasRef.current;
    c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-lg bg-surface-2 p-0.5 text-xs">
          <button onClick={() => setMode("type")} className={clsx("rounded-md px-2.5 py-1", mode === "type" ? "bg-surface text-fg" : "text-muted")} aria-pressed={mode === "type"}>
            Type
          </button>
          <button onClick={() => setMode("draw")} className={clsx("rounded-md px-2.5 py-1", mode === "draw" ? "bg-surface text-fg" : "text-muted")} aria-pressed={mode === "draw"}>
            Draw
          </button>
        </div>
        {mode === "draw" && (
          <div className="flex items-center gap-1">
            <button onClick={() => setTool("pen")} className={clsx("rounded-md p-1.5", tool === "pen" ? "bg-accent-soft text-accent" : "text-muted hover:text-fg")} aria-label="Pen" aria-pressed={tool === "pen"}>
              <PenLine size={14} />
            </button>
            <button onClick={() => setTool("eraser")} className={clsx("rounded-md p-1.5", tool === "eraser" ? "bg-accent-soft text-accent" : "text-muted hover:text-fg")} aria-label="Eraser" aria-pressed={tool === "eraser"}>
              <Eraser size={14} />
            </button>
            <button onClick={clear} className="rounded-md p-1.5 text-muted hover:text-danger" aria-label="Clear drawing">
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
      {mode === "type" ? (
        <Textarea value={text} onChange={(e) => onText(e.target.value)} placeholder="Scratch work. Not graded, not saved after the mock." className="min-h-0 flex-1 resize-none font-mono text-[13px]" aria-label="Scratchpad" />
      ) : (
        <canvas
          ref={canvasRef}
          className="min-h-0 flex-1 touch-none rounded-xl border border-border bg-surface-2/40"
          aria-label="Drawing scratchpad"
          onPointerDown={(e) => {
            drawing.current = true;
            last.current = pos(e);
            (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!drawing.current || !last.current) return;
            const p = pos(e);
            stroke(last.current, p);
            last.current = p;
          }}
          onPointerUp={() => {
            drawing.current = false;
            last.current = null;
          }}
          onPointerLeave={() => {
            drawing.current = false;
            last.current = null;
          }}
        />
      )}
    </div>
  );
}
