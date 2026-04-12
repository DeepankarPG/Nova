"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import type { EchoPhase } from "@/lib/echo/types";
import { EchoGlobeMark } from "@/components/echo/EchoGlobeMark";

const LABELS: Record<Exclude<EchoPhase, "idle" | "done" | "error">, string> = {
  thinking: "Give me a sec",
  creating: "Putting it together",
  finalizing: "Finishing up",
};

type Props = {
  phase: EchoPhase;
  busy: boolean;
};

export function EchoCollapsibleStatus({ phase, busy }: Props) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  if (!busy || phase === "idle" || phase === "done" || phase === "error") {
    return null;
  }

  const labelBase = LABELS[phase as keyof typeof LABELS] ?? "Hang tight";

  return (
    <div className="mb-3 rounded-xl border border-border/80 bg-muted/40 px-3 py-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 text-left text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <EchoGlobeMark
          className="h-8 w-8 shrink-0"
          animate={!reduceMotion}
        />
        <span className="flex-1 font-medium text-foreground">
          {labelBase}
          {reduceMotion ? (
            "…"
          ) : (
            <span
              className="echo-status-ellipsis ml-px inline-flex"
              aria-hidden
            >
              <span className="echo-status-ellipsis-dot">.</span>
              <span className="echo-status-ellipsis-dot">.</span>
              <span className="echo-status-ellipsis-dot">.</span>
            </span>
          )}
        </span>
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 opacity-60" />
        )}
      </button>
      {open && (
        <div className="mt-2 flex gap-2.5 border-t border-border/60 pt-2">
          <div className="w-8 shrink-0" aria-hidden />
          <p className="min-w-0 flex-1 text-[12px] leading-relaxed text-muted-foreground">
            Echo is working with your dashboard context — this is a demo, so responses are instant-ish but not live data.
          </p>
        </div>
      )}
    </div>
  );
}
