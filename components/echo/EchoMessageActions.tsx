"use client";

import { Copy, ThumbsDown, ThumbsUp, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  plainText: string;
  className?: string;
  /** When set, the rotate/retry control replays the confirmation reveal (e.g. payment link sent). */
  onRegenerate?: () => void;
};

export function EchoMessageActions({
  plainText,
  className,
  onRegenerate,
}: Props) {
  return (
    <div className={cn("mt-2 flex items-center gap-0.5", className)}>
      <button
        type="button"
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Copy message"
        title="Copy"
        onClick={() => {
          void navigator.clipboard.writeText(plainText).then(
            () => toast.success("Copied"),
            () => toast.error("Could not copy")
          );
        }}
      >
        <Copy className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      <button
        type="button"
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Good response"
        title="Helpful"
      >
        <ThumbsUp className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      <button
        type="button"
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Bad response"
        title="Not helpful"
      >
        <ThumbsDown className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      <button
        type="button"
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={onRegenerate ? "Replay confirmation animation" : "Regenerate"}
        title={onRegenerate ? "Replay animation" : "Regenerate"}
        onClick={() => onRegenerate?.()}
      >
        <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}
