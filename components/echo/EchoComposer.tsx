"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { usePathname } from "next/navigation";
import { ArrowUp, PanelsTopLeft, Paperclip, Plus, X } from "lucide-react";
import { getEchoPageContextLabel } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type Props = {
  onSend: (text: string, files: string[]) => void;
  disabled?: boolean;
};

export function EchoComposer({ onSend, disabled }: Props) {
  const pathname = usePathname() ?? "/";
  const pageContext = getEchoPageContextLabel(pathname);

  /** User opted in to attach current page name; resets when route changes. */
  const [pageContextActive, setPageContextActive] = useState(false);
  const [value, setValue] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    setPageContextActive(false);
  }, [pathname]);

  const inputRef = useRef<HTMLInputElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const submit = useCallback(() => {
    if (disabled) return;
    const names = files.map((f) => f.name);
    const chunks: string[] = [];
    if (pageContextActive && pageContext) {
      chunks.push(`[Current page: ${pageContext}]`);
    }
    if (value.trim()) chunks.push(value.trim());
    const text = chunks.length > 0 ? chunks.join("\n\n") : "";
    onSend(text, names);
    setValue("");
    setFiles([]);
    if (inputRef.current) inputRef.current.value = "";
  }, [disabled, files, onSend, pageContext, pageContextActive, value]);

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="mx-3 mb-3 shrink-0">
      <div
        className={cn(
          "rounded-2xl border border-border bg-card p-3 shadow-sm",
          "dark:bg-card/95"
        )}
      >
        <div className="mb-2 flex justify-start">
          {pageContextActive ? (
            <span
              className={cn(
                "group inline-flex max-w-full items-center gap-1 truncate rounded-md border border-border/80",
                "border-solid bg-muted/70 py-1 pl-2 pr-1 text-[11px] font-medium text-neutral-700",
                "dark:border-border dark:bg-muted/50 dark:text-neutral-300"
              )}
              title={`You are on: ${pageContext}`}
            >
              <PanelsTopLeft
                className="h-3.5 w-3.5 shrink-0 text-neutral-600 dark:text-neutral-400"
                strokeWidth={2}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate">{pageContext}</span>
              <button
                type="button"
                className={cn(
                  "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm",
                  "text-neutral-500 opacity-0 transition-opacity duration-150",
                  "hover:bg-neutral-200/90 hover:text-neutral-800",
                  "group-hover:opacity-100 group-focus-within:opacity-100",
                  "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                  "dark:text-neutral-400 dark:hover:bg-neutral-700/80 dark:hover:text-neutral-100"
                )}
                aria-label="Remove page context"
                onClick={() => setPageContextActive(false)}
              >
                <X className="h-3 w-3" strokeWidth={2.5} aria-hidden />
              </button>
            </span>
          ) : (
            <button
              type="button"
              disabled={disabled}
              onClick={() => setPageContextActive(true)}
              className={cn(
                "inline-flex max-w-full items-center gap-1.5 rounded-md border border-dashed border-border/90",
                "bg-muted/70 px-2.5 py-1 text-left text-[11px] font-medium text-neutral-600",
                "transition-colors hover:border-border hover:bg-muted dark:text-neutral-400",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                "disabled:pointer-events-none disabled:opacity-50"
              )}
              title="Include the current page in your message to Echo"
            >
              <Plus
                className="h-3.5 w-3.5 shrink-0 text-neutral-600 dark:text-neutral-400"
                strokeWidth={2.5}
                aria-hidden
              />
              <span>Add context of this page</span>
            </button>
          )}
        </div>

        {files.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {files.map((f) => (
              <span
                key={f.name + f.size}
                className="inline-flex max-w-[200px] items-center gap-1 truncate rounded-md bg-muted px-2 py-0.5 text-[11px] text-foreground"
              >
                {f.name}
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={`Remove ${f.name}`}
                  onClick={() => setFiles((prev) => prev.filter((x) => x !== f))}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <textarea
          ref={taRef}
          data-echo-composer
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled}
          rows={2}
          placeholder="Ask Echo anything…"
          className="max-h-32 min-h-[44px] w-full resize-none bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
        />

        <div className="mt-2 flex items-center gap-2 border-t border-border/60 pt-2">
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              const list = e.target.files;
              if (!list?.length) return;
              setFiles((prev) => [...prev, ...Array.from(list)]);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={disabled}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
            aria-label="Attach file"
            onClick={() => inputRef.current?.click()}
          >
            <Paperclip className="h-[17px] w-[17px]" strokeWidth={2} />
          </button>
          {!pageContextActive && (
            <span className="text-[12px] font-medium text-muted-foreground">
              Auto
            </span>
          )}
          <div className="flex-1" />
          <button
            type="button"
            disabled={disabled || (!value.trim() && files.length === 0)}
            onClick={submit}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-40"
            aria-label="Send"
          >
            <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
