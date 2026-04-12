"use client";

import { BarChart2, Globe2, TrendingUp } from "lucide-react";
import { EchoGlobeMark } from "./EchoGlobeMark";
import { QUICK_PROMPT_CHIPS } from "@/lib/echo/genUIQueries";
import { cn } from "@/lib/utils";

type Props = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

const QUICK_ACTIONS = [
  {
    icon: BarChart2,
    title: "Analyze Payment Trends",
    description: "Domestic vs international split with mode distribution",
    prompt:
      "Show last 6 months domestic vs international split with payment mode distribution",
  },
  {
    icon: TrendingUp,
    title: "Success Rate Deep Dive",
    description: "Compare success rates across last 3 months",
    prompt: "Compare this month's success rate to the previous 3 months",
  },
  {
    icon: Globe2,
    title: "Top International Markets",
    description: "Country-wise revenue breakdown and growth",
    prompt: "Country-wise revenue breakdown with top markets",
  },
] as const;

export function EchoFullPageWelcome({ onSend, disabled }: Props) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 sm:py-14 min-h-full">
      <div className="w-full max-w-3xl flex flex-col items-center gap-6">
        {/* Logo — transparent SVG only (no GIF matte, no glow / pulse) */}
        <div className="relative flex items-center justify-center">
          <EchoGlobeMark className="h-16 w-16 sm:h-20 sm:w-20" animate={false} />
        </div>

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-[1.6rem] sm:text-[2rem] font-bold tracking-tight text-foreground leading-snug">
            Hi! I&apos;m Echo.
            <br />
            <span className="text-[1.4rem] sm:text-[1.7rem] font-semibold text-foreground/90">
              How can I help you today?
            </span>
          </h1>
        </div>

        {/* Quick action cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
                type="button"
                disabled={disabled}
                onClick={() => onSend(action.prompt)}
                aria-label={action.title}
                className={cn(
                  "group relative flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-4 text-left",
                  "shadow-[0_1px_0_rgba(0,0,0,0.03)]",
                  "transition-colors duration-150",
                  "hover:bg-muted/30 hover:border-border",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
                  "disabled:pointer-events-none disabled:opacity-60"
                )}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-muted/50 text-muted-foreground">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-foreground">{action.title}</p>
                  <p className="mt-0.5 text-[12px] text-muted-foreground leading-snug">
                    {action.description}
                  </p>
                </div>
                <span className="absolute bottom-3.5 right-3.5 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </button>
            );
          })}
        </div>

        {/* Suggested prompts — no outer card; chips keep their own surfaces */}
        <div className="flex w-full flex-col gap-3">
          <div className="flex w-full items-center gap-3">
            <div className="h-px flex-1 bg-border/50" />
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground select-none">
              Suggested prompts
            </span>
            <div className="h-px flex-1 bg-border/50" />
          </div>
          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
            {QUICK_PROMPT_CHIPS.slice(3, 7).map((chip) => (
              <button
                key={chip}
                type="button"
                disabled={disabled}
                onClick={() => onSend(chip)}
                aria-label={`Ask: ${chip}`}
                className={cn(
                  "flex items-start gap-2 rounded-lg px-3 py-2.5 text-left text-[12px] leading-snug",
                  "border border-border/70 bg-card text-muted-foreground",
                  "shadow-[0_1px_0_rgba(0,0,0,0.03)]",
                  "hover:bg-muted/35 hover:text-foreground hover:border-border",
                  "transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
                  "disabled:pointer-events-none disabled:opacity-50"
                )}
              >
                <span className="mt-0.5 text-muted-foreground/50 text-[11px] shrink-0">↗</span>
                <span>{chip}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
