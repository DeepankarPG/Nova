"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export const DEFAULT_GENERATING_INTRO_SETTLE_MS = 520;
export const DEFAULT_GENERATING_SKELETON_MS = 3600;
export const DEFAULT_GENERATING_CROSSFADE_OUT_SEC = 0.28;
export const DEFAULT_GENERATING_CROSSFADE_IN_SEC = 0.42;
export const DEFAULT_GENERATING_REDUCED_INTRO_MS = 140;

type Phase = "intro" | "skeleton" | "content";

export function GeneratingShimmerBar({
  widthClass,
  className,
}: {
  widthClass: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-2.5 shrink-0 rounded-md bg-[length:200%_100%] animate-[shimmer_1.6s_ease-in-out_infinite",
        widthClass,
        className
      )}
      style={{
        backgroundImage:
          "linear-gradient(90deg, color-mix(in srgb, var(--primary) 10%, var(--muted)) 20%, color-mix(in srgb, var(--primary) 32%, var(--muted)) 50%, color-mix(in srgb, var(--primary) 10%, var(--muted)) 80%)",
      }}
    />
  );
}

/**
 * Default “card-shaped” generating placeholder (header row + detail lines).
 * Pass as `skeleton` to {@link GeneratingReveal} or compose your own with {@link GeneratingShimmerBar}.
 */
export function EchoGeneratingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "py-1 [mask-image:linear-gradient(to_right,black_78%,transparent_100%)]",
        className
      )}
      aria-hidden
    >
      <div className="flex gap-2">
        <div className="h-9 w-9 shrink-0 rounded-full bg-primary/15 dark:bg-primary/25" />
        <div className="min-w-0 flex-1 space-y-2 pt-1">
          <GeneratingShimmerBar widthClass="w-[58%]" />
          <GeneratingShimmerBar widthClass="w-[88%]" />
        </div>
      </div>
      <div className="mt-3 space-y-2.5 pt-1">
        <div className="flex gap-1.5">
          <GeneratingShimmerBar widthClass="w-[28%]" />
          <GeneratingShimmerBar widthClass="w-[36%]" />
          <GeneratingShimmerBar widthClass="flex-1" />
        </div>
        <div className="flex gap-1.5">
          <GeneratingShimmerBar widthClass="flex-1" />
          <GeneratingShimmerBar widthClass="w-[32%]" />
        </div>
        <div className="flex gap-1.5">
          <GeneratingShimmerBar widthClass="w-[22%]" />
          <GeneratingShimmerBar widthClass="flex-1" />
          <GeneratingShimmerBar widthClass="w-[18%]" />
        </div>
        <div className="flex gap-1.5">
          <GeneratingShimmerBar widthClass="w-[30%]" />
          <GeneratingShimmerBar widthClass="w-[24%]" />
        </div>
      </div>
    </div>
  );
}

export type GeneratingRevealProps = {
  /** Final UI after the generating sequence. */
  children: ReactNode;
  /** Placeholder while “generating”; defaults to {@link EchoGeneratingSkeleton}. */
  skeleton?: ReactNode;
  /** Pause (ms) after surrounding copy before showing the skeleton. */
  introSettleMs?: number;
  /** How long (ms) the skeleton stays visible before revealing children. */
  skeletonMinMs?: number;
  crossfadeOutSec?: number;
  crossfadeInSec?: number;
  /** With reduced motion: delay (ms) before showing children (skeleton skipped). */
  reducedIntroMs?: number;
  className?: string;
  /** Min height for the intro spacer and root (layout reserve). */
  introMinHeightClassName?: string;
  skeletonMotionKey?: string;
  contentMotionKey?: string;
};

/**
 * Staged sequence: intro spacer → optional skeleton → crossfade to `children`.
 * Remount the component (e.g. change `key`) to replay the animation.
 */
export function GeneratingReveal({
  children,
  skeleton = <EchoGeneratingSkeleton />,
  introSettleMs = DEFAULT_GENERATING_INTRO_SETTLE_MS,
  skeletonMinMs = DEFAULT_GENERATING_SKELETON_MS,
  crossfadeOutSec = DEFAULT_GENERATING_CROSSFADE_OUT_SEC,
  crossfadeInSec = DEFAULT_GENERATING_CROSSFADE_IN_SEC,
  reducedIntroMs = DEFAULT_GENERATING_REDUCED_INTRO_MS,
  className,
  introMinHeightClassName = "min-h-[11rem]",
  skeletonMotionKey = "generating-skeleton",
  contentMotionKey = "generating-content",
}: GeneratingRevealProps) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("intro");

  useEffect(() => {
    if (reduceMotion) {
      const t = window.setTimeout(() => setPhase("content"), reducedIntroMs);
      return () => clearTimeout(t);
    }
    const t1 = window.setTimeout(() => setPhase("skeleton"), introSettleMs);
    const t2 = window.setTimeout(
      () => setPhase("content"),
      introSettleMs + skeletonMinMs
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [
    reduceMotion,
    introSettleMs,
    skeletonMinMs,
    reducedIntroMs,
  ]);

  return (
    <div
      className={cn("relative", introMinHeightClassName, className)}
      aria-busy={phase !== "content"}
    >
      {phase === "intro" ? (
        <div className={introMinHeightClassName} aria-hidden />
      ) : null}
      <AnimatePresence mode="wait">
        {phase === "skeleton" ? (
          <motion.div
            key={skeletonMotionKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: crossfadeOutSec,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {skeleton}
          </motion.div>
        ) : null}
        {phase === "content" ? (
          <motion.div
            key={contentMotionKey}
            initial={{ opacity: reduceMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reduceMotion ? 0 : crossfadeInSec,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
