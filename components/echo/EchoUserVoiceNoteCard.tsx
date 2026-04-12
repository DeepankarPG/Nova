"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EchoVoiceWaveform } from "@/components/echo/voice/EchoVoiceWaveform";
import { echoVoiceMessageTitle } from "@/lib/echo/voiceMessage";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  className?: string;
};

/**
 * User message surface for voice-origin content — Notion-like voice note, not a plain text bubble.
 */
export function EchoUserVoiceNoteCard({ text, className }: Props) {
  const reduceMotion = useReducedMotion();
  const title = echoVoiceMessageTitle(text);

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex max-w-[min(92%,22rem)] items-stretch overflow-hidden rounded-2xl",
        "border border-border bg-card text-left shadow-sm",
        "shadow-[0_1px_0_rgba(0,0,0,0.04)]",
        "dark:bg-card/95",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 sm:px-3.5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/80 bg-muted/40"
          aria-hidden
        >
          <EchoVoiceWaveform paused className="scale-90" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold leading-snug text-foreground">
            {title}
          </p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">Voice message · demo</p>
        </div>
      </div>
    </motion.div>
  );
}
