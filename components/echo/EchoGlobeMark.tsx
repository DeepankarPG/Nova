"use client";

import { cn } from "@/lib/utils";

const ECHO_LOGO_GIF = "/branding/echo-logo.gif";
/** Blue vertical gradient — matches chat panel empty state / full-page hero */
const ECHO_LOGO_STATIC = "/echo_logo_gradient.svg";

type Props = {
  className?: string;
  /**
   * When true, animated GIF (thinking / creating / finalising).
   * When false, static PNG (messages, empty state, header).
   */
  animate?: boolean;
  /** Slow vertical-axis spin (rotateY) — e.g. empty chat hero. */
  axisSpin?: boolean;
};

/**
 * Echo logo: static blue-gradient SVG by default; animated GIF when `animate` is true.
 * Sidebar nav uses `/echo_logo.svg` (spectrum) via `navMarkSrc` separately.
 */
export function EchoGlobeMark({
  className,
  animate = false,
  axisSpin = false,
}: Props) {
  const src = animate ? ECHO_LOGO_GIF : ECHO_LOGO_STATIC;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-transparent leading-none",
        !axisSpin && "[transform:translateZ(0)]",
        animate && "echo-globe-mark--live",
        axisSpin && "echo-globe-mark--axis-spin",
        className
      )}
      aria-hidden
    >
      <img
        key={src}
        src={src}
        alt=""
        width={200}
        height={200}
        className={cn(
          "pointer-events-none block h-full w-full max-h-full max-w-full object-contain object-center select-none",
          axisSpin && "echo-globe-mark--axis-spin-img"
        )}
        draggable={false}
        decoding="async"
      />
    </span>
  );
}
