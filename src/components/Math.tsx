"use client";

import katex from "katex";
import { Fragment, memo, type ReactNode } from "react";
import clsx from "clsx";

/**
 * Renders Edgework's markdown-lite: paragraphs separated by blank lines, "- " bullets,
 * **bold**, `code`, *italic*, inline $...$ and display $$...$$ math, and \$ for a literal
 * dollar sign. Everything is rendered through KaTeX with throwOnError off, so a typo shows
 * the raw TeX instead of crashing the page.
 */

function renderTex(tex: string, display: boolean): string {
  try {
    return katex.renderToString(tex, { displayMode: display, throwOnError: false, output: "html", strict: "ignore" });
  } catch {
    return `<code>${escapeHtml(tex)}</code>`;
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Split a line into text and math segments. */
function tokenizeInline(src: string): Array<{ kind: "text" | "math" | "display"; value: string }> {
  const out: Array<{ kind: "text" | "math" | "display"; value: string }> = [];
  let i = 0;
  let buf = "";
  const flush = () => {
    if (buf) out.push({ kind: "text", value: buf });
    buf = "";
  };
  while (i < src.length) {
    const ch = src[i];
    if (ch === "\\" && src[i + 1] === "$") {
      buf += "$";
      i += 2;
      continue;
    }
    if (ch === "$") {
      const display = src[i + 1] === "$";
      const open = display ? 2 : 1;
      const close = src.indexOf(display ? "$$" : "$", i + open);
      // an unterminated delimiter is treated as text
      if (close === -1) {
        buf += ch;
        i++;
        continue;
      }
      flush();
      out.push({ kind: display ? "display" : "math", value: src.slice(i + open, close) });
      i = close + open;
      continue;
    }
    buf += ch;
    i++;
  }
  flush();
  return out;
}

function renderTextWithMarks(text: string, keyBase: string): ReactNode[] {
  // **bold**, *italic*, `code`
  const nodes: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(<Fragment key={`${keyBase}-t${k++}`}>{text.slice(last, m.index)}</Fragment>);
    const tok = m[0];
    if (tok.startsWith("**")) nodes.push(<strong key={`${keyBase}-b${k++}`}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`")) nodes.push(<code key={`${keyBase}-c${k++}`}>{tok.slice(1, -1)}</code>);
    else nodes.push(<em key={`${keyBase}-i${k++}`}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(<Fragment key={`${keyBase}-t${k++}`}>{text.slice(last)}</Fragment>);
  return nodes;
}

export function InlineMath({ children, className }: { children: string; className?: string }) {
  const segments = tokenizeInline(children);
  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.kind === "text" ? (
          <Fragment key={i}>{renderTextWithMarks(seg.value, `s${i}`)}</Fragment>
        ) : (
          <span key={i} dangerouslySetInnerHTML={{ __html: renderTex(seg.value, seg.kind === "display") }} />
        ),
      )}
    </span>
  );
}

/** A standalone display formula (KaTeX source without delimiters). */
export function DisplayMath({ tex, className }: { tex: string; className?: string }) {
  return <div className={clsx("overflow-x-auto", className)} dangerouslySetInnerHTML={{ __html: renderTex(tex, true) }} />;
}

export const MathText = memo(function MathText({ children, className, as = "div" }: { children: string; className?: string; as?: "div" | "span" | "p" }) {
  const blocks = children.replace(/\r\n/g, "\n").split(/\n\s*\n/);
  const Tag = as;
  if (as === "span" || as === "p") {
    return (
      <Tag className={clsx("prose-math", className)}>
        <InlineMath>{children}</InlineMath>
      </Tag>
    );
  }
  return (
    <div className={clsx("prose-math leading-relaxed", className)}>
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        const isList = lines.length > 0 && lines.every((l) => /^\s*-\s+/.test(l) || l.trim() === "");
        if (isList) {
          return (
            <ul key={bi}>
              {lines
                .filter((l) => l.trim() !== "")
                .map((l, li) => (
                  <li key={li}>
                    <InlineMath>{l.replace(/^\s*-\s+/, "")}</InlineMath>
                  </li>
                ))}
            </ul>
          );
        }
        const trimmed = block.trim();
        if (trimmed.startsWith("$$") && trimmed.endsWith("$$") && trimmed.indexOf("$$", 2) === trimmed.length - 2) {
          return <DisplayMath key={bi} tex={trimmed.slice(2, -2)} />;
        }
        return (
          <p key={bi}>
            <InlineMath>{block}</InlineMath>
          </p>
        );
      })}
    </div>
  );
});
