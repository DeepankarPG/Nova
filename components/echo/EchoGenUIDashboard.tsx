"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { DashboardSpec, GenUICard } from "@/lib/echo/genUITypes";
import { EchoGenUICard } from "./EchoGenUICard";
import { cn } from "@/lib/utils";

type Props = {
  spec: DashboardSpec;
  className?: string;
};

/**
 * Returns the Tailwind col-span classes that belong on the *grid item* wrapper,
 * not on the inner card div (which the CSS grid engine never sees).
 *
 * Grid is: 1 col (mobile) → 2 cols (sm) → 3 cols (lg)
 */
function cardColSpan(card: GenUICard): string {
  switch (card.type) {
    case "line":
    case "bar":
      // Area/bar charts need horizontal room to be readable — take 2 of 3 cols
      return "sm:col-span-2";
    case "table":
      // Tables with multiple columns need at least 2 cols; full-width on mobile
      return "col-span-full sm:col-span-2";
    default:
      // metric, donut, split — compact, 1 col is enough
      return "";
  }
}

export function EchoGenUIDashboard({ spec, className }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("mt-3", className)}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Dashboard title bar */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="truncate text-[13px] font-semibold text-foreground">
          {spec.title}
        </h3>
        <span className="shrink-0 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Live Demo
        </span>
      </div>

      {/* Responsive card grid — items-start: each card hugs its own height */}
      <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {spec.cards.map((card, i) => (
          <motion.div
            key={card.id}
            // col-span MUST live here (the grid item), not inside the card
            className={cn("self-start", cardColSpan(card))}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.35,
              delay: reduceMotion ? 0 : i * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <EchoGenUICard card={card} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
