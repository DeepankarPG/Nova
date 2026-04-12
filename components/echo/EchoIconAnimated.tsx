"use client";

import { EchoGlobeMark } from "@/components/echo/EchoGlobeMark";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

export function EchoIconAnimated({ className }: { className?: string }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  return (
    <EchoGlobeMark
      className={cn("h-[18px] w-[18px]", className)}
      animate={!prefersReducedMotion}
    />
  );
}
