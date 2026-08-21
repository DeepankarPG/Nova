"use client";

import { Fragment } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Very small manual tokenizer - enough to colour tags/attrs/strings without pulling in a highlighter dependency. */
function CodeLine({ code }: { code: string }) {
  const tokenPattern = /("(?:[^"\\]|\\.)*")|(<\/?[a-zA-Z][\w-]*)|(\/?>)|([a-zA-Z-]+(?==))/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = tokenPattern.exec(code))) {
    if (match.index > lastIndex) {
      parts.push(<Fragment key={key++}>{code.slice(lastIndex, match.index)}</Fragment>);
    }
    const [full, str, tag, bracket, attr] = match;
    if (str) {
      parts.push(
        <span key={key++} className="text-emerald-600 dark:text-emerald-400">
          {str}
        </span>
      );
    } else if (tag) {
      parts.push(
        <span key={key++} className="text-rose-600 dark:text-rose-400">
          {tag}
        </span>
      );
    } else if (bracket) {
      parts.push(
        <span key={key++} className="text-rose-600 dark:text-rose-400">
          {bracket}
        </span>
      );
    } else if (attr) {
      parts.push(<span key={key++}>{attr}</span>);
    }
    lastIndex = match.index + full.length;
  }
  if (lastIndex < code.length) {
    parts.push(<Fragment key={key++}>{code.slice(lastIndex)}</Fragment>);
  }

  return <>{parts}</>;
}

/** Shared line-numbered, lightly syntax-coloured embed-code block with a copy action. */
export function EmbedCodeBlock({ code, label = "Copy code to your site" }: { code: string; label?: string }) {
  const lines = code.split("\n");

  const copyCode = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    toast.success("Embed code copied");
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border text-left">
      <div className="flex items-center justify-between bg-muted/50 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <Button variant="outline" size="sm" leftIcon={<Copy className="h-3.5 w-3.5" />} onClick={copyCode}>
          Copy code
        </Button>
      </div>
      <pre className="overflow-x-auto bg-card p-4 text-[12.5px] leading-relaxed text-foreground">
        <code>
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="mr-4 w-4 shrink-0 select-none text-right text-muted-foreground/50">{i + 1}</span>
              <span className="whitespace-pre-wrap break-all">
                <CodeLine code={line} />
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
