"use client";

import { useRef, useState, useEffect } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface CodeWindowProps {
  filename?: string;
  lines: string[];
  typing?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Lightweight regex-based syntax highlighter
// Produces an array of React elements per line.
// ---------------------------------------------------------------------------
type Token = { type: "tag" | "string" | "comment" | "keyword" | "plain"; text: string };

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let remaining = line;

  while (remaining.length > 0) {
    // JSX/HTML tag (opening/closing)
    const tagMatch = remaining.match(/^(<\/?[A-Za-z][A-Za-z0-9.]*\s*\/?>)/);
    if (tagMatch) {
      tokens.push({ type: "tag", text: tagMatch[1] });
      remaining = remaining.slice(tagMatch[1].length);
      continue;
    }

    // Double-quoted string
    const dqMatch = remaining.match(/^("(?:[^"\\]|\\.)*")/);
    if (dqMatch) {
      tokens.push({ type: "string", text: dqMatch[1] });
      remaining = remaining.slice(dqMatch[1].length);
      continue;
    }

    // Single-quoted string
    const sqMatch = remaining.match(/^('(?:[^'\\]|\\.)*')/);
    if (sqMatch) {
      tokens.push({ type: "string", text: sqMatch[1] });
      remaining = remaining.slice(sqMatch[1].length);
      continue;
    }

    // Template literal
    const tlMatch = remaining.match(/^(`(?:[^`\\]|\\.)*`)/);
    if (tlMatch) {
      tokens.push({ type: "string", text: tlMatch[1] });
      remaining = remaining.slice(tlMatch[1].length);
      continue;
    }

    // Line comment
    const commentMatch = remaining.match(/^(\/\/.*)/);
    if (commentMatch) {
      tokens.push({ type: "comment", text: commentMatch[1] });
      remaining = remaining.slice(commentMatch[1].length);
      continue;
    }

    // JS/TS keywords
    const kwMatch = remaining.match(/^(const|let|var|return|function|export|default|import|from|if|else|async|await|type|interface|extends|implements|class|new|this|null|undefined|true|false)\b/);
    if (kwMatch) {
      tokens.push({ type: "keyword", text: kwMatch[1] });
      remaining = remaining.slice(kwMatch[1].length);
      continue;
    }

    // Plain text (advance one char)
    tokens.push({ type: "plain", text: remaining[0] });
    remaining = remaining.slice(1);
  }

  // Merge adjacent plain tokens
  return tokens.reduce<Token[]>((acc, tok) => {
    const last = acc[acc.length - 1];
    if (last && last.type === "plain" && tok.type === "plain") {
      last.text += tok.text;
    } else {
      acc.push({ ...tok });
    }
    return acc;
  }, []);
}

const tokenColors: Record<Token["type"], string> = {
  tag: "text-brand-violet",
  string: "text-brand-blue-bright",
  comment: "text-muted italic",
  keyword: "text-brand-violet-bright",
  plain: "text-foreground",
};

function HighlightedLine({ text }: { text: string }) {
  const tokens = tokenizeLine(text);
  return (
    <>
      {tokens.map((tok, i) => (
        <span key={i} className={tokenColors[tok.type]}>
          {tok.text}
        </span>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function CodeWindow({ filename, lines, typing, className }: CodeWindowProps) {
  const reducedMotion = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // `visibleChars` = total characters revealed so far (across all lines)
  const totalChars = lines.join("\n").length;
  const [visibleChars, setVisibleChars] = useState<number>(
    typing && !reducedMotion ? 0 : totalChars,
  );
  const [hasStarted, setHasStarted] = useState(!typing || reducedMotion);

  // Start typing when scrolled into view
  useGSAP(
    () => {
      if (!typing || reducedMotion) return;

      const trigger = ScrollTrigger.create({
        trigger: wrapperRef.current,
        start: "top 85%",
        once: true,
        onEnter: () => setHasStarted(true),
      });

      return () => trigger.kill();
    },
    { scope: wrapperRef, dependencies: [typing, reducedMotion] },
  );

  // Run typing effect once hasStarted
  useEffect(() => {
    if (!hasStarted || reducedMotion) return;
    if (visibleChars >= totalChars) return;

    // ~30ms per char → ~33 chars/sec
    const intervalMs = 28;
    const charsPerTick = 1;

    const id = setInterval(() => {
      setVisibleChars((prev) => {
        const next = prev + charsPerTick;
        if (next >= totalChars) {
          clearInterval(id);
          return totalChars;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(id);
  }, [hasStarted, reducedMotion, totalChars, visibleChars]);

  // Compute which lines/chars to show
  function getDisplayLines(): { text: string; complete: boolean }[] {
    if (!typing || reducedMotion || visibleChars >= totalChars) {
      return lines.map((l) => ({ text: l, complete: true }));
    }

    let remaining = visibleChars;
    return lines.map((line, i) => {
      if (remaining <= 0) return { text: "", complete: false };
      const lineWithNewline = i < lines.length - 1 ? line.length + 1 : line.length;
      if (remaining >= lineWithNewline) {
        remaining -= lineWithNewline;
        return { text: line, complete: true };
      }
      const partial = line.slice(0, remaining);
      remaining = 0;
      return { text: partial, complete: false };
    });
  }

  const displayLines = getDisplayLines();
  const isTyping = typing && !reducedMotion && visibleChars < totalChars;

  return (
    <div
      ref={wrapperRef}
      className={cn("glass rounded-2xl overflow-hidden font-mono text-sm", className)}
    >
      {/* Top bar */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        {/* Traffic-light dots */}
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" aria-hidden="true" />
        {filename && (
          <span className="ml-3 text-xs text-muted">{filename}</span>
        )}
      </div>

      {/* Code body */}
      <div className="p-5 leading-6">
        {displayLines.map((dl, lineIdx) => (
          <div key={lineIdx} className="flex">
            {/* Line number */}
            <span className="mr-5 w-5 select-none text-right text-muted/50 text-xs leading-6">
              {lineIdx + 1}
            </span>
            {/* Code */}
            <span className="flex-1 whitespace-pre-wrap break-all">
              {dl.text.length > 0 ? (
                <HighlightedLine text={dl.text} />
              ) : null}
              {/* Blinking caret on the active (last visible) line */}
              {isTyping && lineIdx === displayLines.findLastIndex((d) => d.text.length > 0 || !d.complete) && (
                <span
                  aria-hidden="true"
                  className="inline-block w-0.5 h-4 bg-brand-blue align-text-bottom animate-blink ml-px"
                />
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
