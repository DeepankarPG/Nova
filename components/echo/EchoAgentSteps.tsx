"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, ChevronUp, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentStep } from "@/lib/echo/genUITypes";

type Props = {
  steps: AgentStep[];
  busy: boolean;
  className?: string;
};

export function EchoAgentSteps({ steps, busy, className }: Props) {
  // Open by default so the user sees progress immediately
  const [expanded, setExpanded] = useState(true);
  const reduceMotion = useReducedMotion();

  const doneCount = steps.filter((s) => s.status === "done").length;
  const hasError = steps.some((s) => s.status === "error");
  const allDone = doneCount === steps.length && !hasError && steps.length > 0;

  // Auto-collapse once the pipeline finishes so the dashboard gets focus
  useEffect(() => {
    if (!allDone) return;
    const t = setTimeout(() => setExpanded(false), 1000);
    return () => clearTimeout(t);
  }, [allDone]);

  if (!steps || steps.length === 0) return null;

  const headerLabel = hasError
    ? "Something went wrong"
    : busy
    ? "Working on it"
    : "Completed analysis";

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card text-[13px] shadow-sm",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={`${headerLabel} — ${doneCount} of ${steps.length} steps`}
    >
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="flex-1 text-[14px] font-medium text-foreground">
          {headerLabel}
          {busy && !reduceMotion && (
            <span className="echo-status-ellipsis ml-px inline-flex" aria-hidden>
              <span className="echo-status-ellipsis-dot">.</span>
              <span className="echo-status-ellipsis-dot">.</span>
              <span className="echo-status-ellipsis-dot">.</span>
            </span>
          )}
        </span>

        <span className="shrink-0 text-[12px] text-muted-foreground">
          {doneCount}/{steps.length} steps
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {/* Step list */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="steps"
            initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <ul className="border-t border-border/60 px-4 pb-2 pt-3">
              {steps.map((step, idx) => {
                const isLast = idx === steps.length - 1;

                return (
                  <li key={step.id} className="flex gap-3">
                    {/* ── Icon column + connector line ────────────────── */}
                    <div className="flex flex-col items-center">
                      {/* Status icon */}
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                        {step.status === "done" ? (
                          <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-emerald-500 text-white">
                            <Check className="h-2.5 w-2.5" strokeWidth={3} />
                          </span>
                        ) : step.status === "active" ? (
                          <Loader2
                            className={cn(
                              "h-4 w-4 text-primary",
                              !reduceMotion && "animate-spin"
                            )}
                            strokeWidth={2.5}
                          />
                        ) : step.status === "error" ? (
                          <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-destructive text-white">
                            <X className="h-2.5 w-2.5" strokeWidth={3} />
                          </span>
                        ) : (
                          /* pending */
                          <span className="h-2 w-2 rounded-full bg-border" />
                        )}
                      </span>

                      {/* Vertical connector (hidden on last item) */}
                      {!isLast && (
                        <div
                          className={cn(
                            "mt-1 w-px flex-1",
                            step.status === "done"
                              ? "bg-emerald-500/35"
                              : "bg-border/60"
                          )}
                        />
                      )}
                    </div>

                    {/* ── Label + detail ──────────────────────────────── */}
                    <div className={cn("min-w-0 flex-1", !isLast && "pb-4")}>
                      <p
                        className={cn(
                          "text-[13px] font-medium leading-snug",
                          step.status === "done"
                            ? "text-foreground"
                            : step.status === "active"
                            ? "text-primary"
                            : step.status === "error"
                            ? "text-destructive"
                            : "text-muted-foreground/60"
                        )}
                      >
                        {step.label}
                      </p>
                      {step.detail && step.status !== "pending" && (
                        <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
                          {step.detail}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
