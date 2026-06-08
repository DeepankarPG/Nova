"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

/**
 * Splash — "Collapse & Bloom" (fixed)
 *
 * Phase 1 "logo"     0 → 1.0s  — Logo fades in, centred
 * Phase 2 "together" 1.0 → 2.1s — Wordmark wipes in (width 0→168px)
 * Phase 3 "exit"     2.1 → 3.0s —
 *   a) Logo + wordmark collapses (scale 1→0.4, opacity→0) in 0.28s
 *   b) A circle blooms from center — colour matches the app's own
 *      background gradient start (#dbeafe) so it blends seamlessly
 *      into the home screen underneath. No blank white flash.
 */
type Phase = "logo" | "together" | "exit" | "done";

interface Props { onDone: () => void; contained?: boolean; }

export function MobileSplashScreen({ onDone, contained = false }: Props) {
  const [phase, setPhase] = useState<Phase>("logo");
  const pos = contained ? "absolute" : "fixed";

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("together"), 1000);
    const t2 = setTimeout(() => setPhase("exit"),     2100);
    const t3 = setTimeout(() => { setPhase("done"); onDone(); }, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  const showWordmark = phase === "together" || phase === "exit";

  if (phase === "done") return null;

  return (
    <div
      className={`${pos} inset-0 z-[200] flex items-center justify-center overflow-hidden`}
    >
      {/* Blue gradient background — fades out quickly */}
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, #003d9b 0%, #0061e3 40%, #60a5fa 78%, #eff6ff 100%)",
        }}
        animate={phase === "exit" ? { opacity: 0 } : { opacity: 1 }}
        transition={
          phase === "exit"
            ? { duration: 0.3, delay: 0.1, ease: "easeIn" }
            : { duration: 0 }
        }
      />

      {/*
       * Bloom circle — colour matches the home screen's top gradient (#dbeafe)
       * so when it fills the frame there is no visible colour jump.
       * The circle expands from center WHILE the gradient fades, so the
       * home screen is revealed from underneath with no blank state.
       */}
      {phase === "exit" && (
        <motion.div
          className="absolute rounded-full"
          style={{
            background: "linear-gradient(to bottom, #dbeafe 0%, #f6f8fa 100%)",
            left: "50%",
            top: "50%",
            translateX: "-50%",
            translateY: "-50%",
          }}
          initial={{ width: 0, height: 0 }}
          animate={{ width: "320%", height: "320%" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        />
      )}

      {/* Logo + wordmark — collapses to dot before bloom */}
      <motion.div
        className="relative z-10 flex items-center"
        animate={
          phase === "exit"
            ? { scale: 0.4, opacity: 0 }
            : { scale: 1,   opacity: 1 }
        }
        transition={
          phase === "exit"
            ? { duration: 0.28, ease: [0.55, 0, 1, 0.45] }
            : { duration: 0 }
        }
      >
        {/* PG icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0"
        >
          <Image
            src="/PG-logo.svg"
            alt="PayGlocal"
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
            priority
          />
        </motion.div>

        {/* Wordmark — width 0→168 so logo stays truly centred when hidden */}
        <motion.div
          className="overflow-hidden"
          initial={{ width: 0, opacity: 0 }}
          animate={
            showWordmark
              ? { width: 168, opacity: 1 }
              : { width: 0,   opacity: 0 }
          }
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="pl-3">
            <Image
              src="/PG-logo_workmark.svg"
              alt="PayGlocal"
              width={152}
              height={44}
              className="h-11 w-[152px] object-contain object-left"
              priority
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
