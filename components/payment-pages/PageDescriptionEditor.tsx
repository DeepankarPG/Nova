"use client";

import { useRef } from "react";
import { Bold, Image as ImageIcon, Italic, Link as LinkIcon, List, ListOrdered, Underline, Video } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Lightweight formatting: wraps the current textarea selection with plain
 * markers (**bold**, _italic_, __underline__, "- " list prefix) instead of
 * producing real HTML - no rich text editor library in this codebase yet.
 */
function wrapSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  onChange: (v: string) => void
) {
  const { selectionStart, selectionEnd, value } = textarea;
  const selected = value.slice(selectionStart, selectionEnd);
  const next = `${value.slice(0, selectionStart)}${before}${selected}${after}${value.slice(selectionEnd)}`;
  onChange(next);
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(selectionStart + before.length, selectionEnd + before.length);
  });
}

function prefixLines(textarea: HTMLTextAreaElement, prefix: string, onChange: (v: string) => void) {
  const { selectionStart, selectionEnd, value } = textarea;
  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  const lineEnd = value.indexOf("\n", selectionEnd);
  const end = lineEnd === -1 ? value.length : lineEnd;
  const block = value.slice(lineStart, end);
  const prefixed = block
    .split("\n")
    .map((line) => (line.startsWith(prefix) ? line : `${prefix}${line}`))
    .join("\n");
  onChange(`${value.slice(0, lineStart)}${prefixed}${value.slice(end)}`);
  requestAnimationFrame(() => textarea.focus());
}

export function PageDescriptionEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyWrap = (before: string, after: string) => {
    const el = textareaRef.current;
    if (el) wrapSelection(el, before, after, onChange);
  };

  const applyListPrefix = (prefix: string) => {
    const el = textareaRef.current;
    if (el) prefixLines(el, prefix, onChange);
  };

  const toolbarButtonClass =
    "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground";

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter page description"
        rows={3}
        className="w-full resize-none bg-background px-3.5 py-2.5 text-[13.5px] text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      <div className="flex items-center gap-0.5 border-t border-border bg-muted/30 px-2 py-1.5">
        <button type="button" onClick={() => applyWrap("**", "**")} aria-label="Bold" className={cn(toolbarButtonClass)}>
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={() => applyWrap("_", "_")} aria-label="Italic" className={toolbarButtonClass}>
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={() => applyWrap("__", "__")} aria-label="Underline" className={toolbarButtonClass}>
          <Underline className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={() => applyListPrefix("- ")} aria-label="Bulleted list" className={toolbarButtonClass}>
          <List className="h-3.5 w-3.5" />
        </button>
        <button type="button" onClick={() => applyListPrefix("1. ")} aria-label="Numbered list" className={toolbarButtonClass}>
          <ListOrdered className="h-3.5 w-3.5" />
        </button>
        <span className="mx-1 h-4 w-px bg-border" />
        <button
          type="button"
          onClick={() => applyWrap("[", "](https://)")}
          aria-label="Insert link"
          className={toolbarButtonClass}
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyWrap("![", "](https://)")}
          aria-label="Insert image"
          className={toolbarButtonClass}
        >
          <ImageIcon className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => applyWrap("[video](", ")")}
          aria-label="Insert video"
          className={toolbarButtonClass}
        >
          <Video className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
