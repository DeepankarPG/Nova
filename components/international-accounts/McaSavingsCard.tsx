"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, PiggyBank } from "lucide-react";
import { useCounterAnimation } from "@/hooks/useCounterAnimation";

function splitInrDisplay(value: number) {
  const rounded = Math.round(value * 100) / 100;
  const [ints, dec] = rounded.toFixed(2).split(".");
  const intFormatted = Number(ints).toLocaleString("en-IN");
  return { intFormatted, dec };
}

export function McaSavingsCard({
  thisMonthInr,
  vsBankPct,
  tooltip = "Illustrative savings vs typical bank FX spreads and wire fees on this corridor. Not a guarantee.",
  index = 2,
}: {
  thisMonthInr: number;
  vsBankPct: number;
  tooltip?: string;
  index?: number;
}) {
  const animated = useCounterAnimation(thisMonthInr, 900, true);
  const { intFormatted, dec } = splitInrDisplay(animated);
  const [tipVisible, setTipVisible] = useState(false);

  const pctLabel = Number.isInteger(vsBankPct)
    ? `${vsBankPct}`
    : vsBankPct.toFixed(1).replace(/\.0$/, "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -1, transition: { duration: 0.12 } }}
      className="bg-card text-card-foreground rounded-xl p-5 flex flex-col border border-border shadow-sm"
    >
      <div className="flex items-center gap-2">
        <PiggyBank className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 opacity-85" aria-hidden />
        <span className="text-[13px] font-normal text-muted-foreground">Amount saved</span>
        <div
          className="relative flex items-center"
          onMouseEnter={() => setTipVisible(true)}
          onMouseLeave={() => setTipVisible(false)}
        >
          <Info
            className="w-[13px] h-[13px] text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-default shrink-0"
            aria-hidden
          />
          <AnimatePresence>
            {tipVisible && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 max-w-[calc(100vw-2rem)] pointer-events-none"
              >
                <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 rounded-sm bg-popover border-r border-b border-border" />
                <div className="relative rounded-xl px-3.5 py-3 text-left bg-popover text-popover-foreground border border-border shadow-lg">
                  <p className="text-[11px] font-semibold mb-1 tracking-wide">Amount saved</p>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">{tooltip}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-0.5 flex-wrap">
        <span className="text-lg font-semibold text-foreground tabular-nums">₹</span>
        <span className="text-[1.5rem] sm:text-[1.9rem] font-bold text-foreground leading-none tracking-tight tabular-nums">
          {intFormatted}
        </span>
        <span className="text-base sm:text-lg font-semibold text-foreground tabular-nums leading-none">
          .{dec}
        </span>
      </div>

      <p className="mt-3 text-[13px] font-medium text-emerald-700 dark:text-emerald-400 leading-snug">
        You’ve saved <span className="font-semibold">{pctLabel}%</span> on fees vs typical bank pricing this month.
      </p>
    </motion.div>
  );
}
