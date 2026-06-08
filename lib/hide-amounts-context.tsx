"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Asterisk } from "lucide-react";

type HideAmountsCtx = { hidden: boolean; toggle: () => void };

const Ctx = createContext<HideAmountsCtx | null>(null);

export function HideAmountsProvider({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const toggle = useCallback(() => setHidden((h) => !h), []);
  return <Ctx.Provider value={{ hidden, toggle }}>{children}</Ctx.Provider>;
}

export function useHideAmounts(): HideAmountsCtx {
  return useContext(Ctx) ?? { hidden: false, toggle: () => {} };
}

/** Mask a numeric display string with bullet dots, preserving ₹ prefix and +/- sign. */
export function maskVal(value: string, hidden: boolean): string {
  if (!hidden) return value;
  if (value.startsWith("₹")) return "₹ •••••";
  if (value.startsWith("+")) return "+•••";
  if (value.startsWith("-") || value.startsWith("−")) return "−•••";
  return "•••••";
}

/** Renders 4 Asterisk icons sized in em units so they scale with any parent font-size. */
function AsteriskMask({ value }: { value: string }) {
  const prefix = value.startsWith("₹") ? "₹ "
    : value.startsWith("+") ? "+"
    : value.startsWith("−") || value.startsWith("-") ? "−"
    : "";
  return (
    <span className="inline-flex items-center gap-[0.04em] align-baseline">
      {prefix && <span>{prefix}</span>}
      {[0, 1, 2, 3].map((i) => (
        <Asterisk
          key={i}
          strokeWidth={2}
          style={{ width: "0.85em", height: "0.85em" }}
        />
      ))}
    </span>
  );
}

/**
 * Inline number display that animates between the real value and Asterisk icons.
 * Reveal animation (slide up + fade) plays when hidden → false.
 */
export function MaskedNumber({
  value,
  hidden,
  rollKey,
}: {
  value: string;
  hidden: boolean;
  /** Changing this key triggers the rolling digit animation (e.g. pass the active period). */
  rollKey?: string;
}) {
  // Key encodes hidden state + rollKey so both hide-toggle and period-switch animate
  const animKey = hidden
    ? `m-${rollKey ?? ""}`
    : `s-${rollKey ?? ""}-${value}`;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={animKey}
        style={{ display: "inline-block" }}
        initial={{ opacity: 0, y: hidden ? 0 : 7 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: hidden ? 0 : -5 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden={hidden || undefined}
      >
        {hidden ? <AsteriskMask value={value} /> : value}
      </motion.span>
    </AnimatePresence>
  );
}
