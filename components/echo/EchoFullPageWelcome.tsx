"use client";

import { EchoGlobeMark } from "./EchoGlobeMark";
import { QUICK_PROMPT_CHIPS } from "@/lib/echo/genUIQueries";
import { cn } from "@/lib/utils";

type Props = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

export function EchoFullPageWelcome({ onSend, disabled }: Props) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-8 min-h-full">
      <div className="w-full max-w-md flex flex-col items-center gap-6">

        {/* Globe mark */}
        <EchoGlobeMark className="h-14 w-14" animate={false} />

        {/* Heading */}
        <div className="text-center space-y-1">
          <h1 className="text-[1.45rem] font-bold tracking-tight text-foreground leading-snug">
            Hi! I&apos;m Echo.
          </h1>
          <p className="text-[1rem] font-medium text-foreground/70 leading-snug">
            How can I help you today?
          </p>
        </div>

        {/* Suggested prompts */}
        <div className="flex w-full flex-col gap-2.5">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Try asking
          </p>
          <div className="flex w-full flex-col gap-2">
            {QUICK_PROMPT_CHIPS.slice(0, 4).map((chip) => (
              <button
                key={chip}
                type="button"
                disabled={disabled}
                onClick={() => onSend(chip)}
                aria-label={`Ask: ${chip}`}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-4 py-3 text-left text-[13px] font-medium leading-snug",
                  "border border-border/70 bg-card/80 text-foreground",
                  "shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
                  "hover:bg-muted/40 hover:border-border",
                  "transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
                  "disabled:pointer-events-none disabled:opacity-50"
                )}
              >
                <span className="text-primary/60 text-[13px] shrink-0">↗</span>
                <span>{chip}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
