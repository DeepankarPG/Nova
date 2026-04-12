"use client";

import { cn } from "@/lib/utils";

type Props = {
  /** When true, bars do not animate (reduced motion). */
  paused?: boolean;
  className?: string;
};

const BARS = 4;

/**
 * Minimal token-safe waveform for voice UI — `.echo-voice-wave__bar` keyframes in globals.css.
 */
export function EchoVoiceWaveform({ paused, className }: Props) {
  return (
    <span
      className={cn("echo-voice-wave inline-flex h-4 items-end gap-0.5", className)}
      aria-hidden
    >
      {Array.from({ length: BARS }, (_, i) => (
        <span
          key={i}
          className={cn(
            "echo-voice-wave__bar inline-block h-4 w-[3px] origin-bottom rounded-full bg-primary",
            paused && "echo-voice-wave__bar--paused"
          )}
          style={{ animationDelay: `${i * 0.09}s` }}
        />
      ))}
    </span>
  );
}
