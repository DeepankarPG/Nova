"use client";

import { EchoIconAnimated } from "@/components/echo/EchoIconAnimated";
import { useEchoPanel } from "@/components/echo/EchoPanelContext";
import { cn } from "@/lib/utils";

type AskEchoButtonProps = {
  className?: string;
};

/**
 * Opens the Echo side panel (context + focus restore on close).
 * Gradient ring + Echo logo GIF; both respect reduced motion (CSS + EchoIconAnimated).
 */
export function AskEchoButton({ className }: AskEchoButtonProps) {
  const { open, toggle, openerRef } = useEchoPanel();

  const onClick = () => {
    if (!open) {
      openerRef.current = document.activeElement as HTMLElement | null;
    }
    toggle();
  };

  return (
    <span className={cn("echo-ask-ring-wrap rounded-lg", className)}>
      <button
        type="button"
        className={cn(
          "relative z-[1] flex h-9 shrink-0 items-center gap-2 rounded-[7px] px-2.5 text-[13px] font-medium tracking-tight sm:px-3",
          "border-0 bg-muted text-foreground shadow-sm backdrop-blur-sm",
          "transition-colors hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
        )}
        onClick={onClick}
      >
        <EchoIconAnimated className="h-6 w-6 shrink-0" />
        <span>Ask Echo</span>
      </button>
    </span>
  );
}
