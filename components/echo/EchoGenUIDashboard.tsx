"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { DashboardSpec } from "@/lib/echo/genUITypes";
import { EchoGenUICard } from "./EchoGenUICard";
import { cn } from "@/lib/utils";

type Props = {
  spec: DashboardSpec;
  className?: string;
};

export function EchoGenUIDashboard({ spec, className }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("mt-3 px-0", className)}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Dashboard title bar */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="truncate text-[11px] font-semibold uppercase tracking-wider text-foreground">
          {spec.title}
        </h3>
        <span className="shrink-0 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Live Demo
        </span>
      </div>

      {/* Single-column card stack — no side-by-side on mobile sheet */}
      <div className="grid grid-cols-1 items-start gap-3">
        {spec.cards.map((card, i) => (
          <motion.div
            key={card.id}
            className="self-start"
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
