"use client";

import { EchoMessageActions } from "./EchoMessageActions";
import { cn } from "@/lib/utils";

type Props = {
  plainText: string;
  closingLine?: string;
  followUps: string[];
  onFollowUp: (text: string) => void;
  onRegenerate?: () => void;
  disabled?: boolean;
};

/**
 * Claude-style: hug strip (closing copy + compact chips) then utility actions.
 */
export function EchoAssistantMessageFooter({
  plainText,
  closingLine,
  followUps,
  onFollowUp,
  onRegenerate,
  disabled,
}: Props) {
  const chips = followUps.slice(0, 3);
  const showTopBlock = Boolean(closingLine) || chips.length > 0;

  return (
    <div className="mt-4 space-y-3">
      {showTopBlock && (
        <div className="max-w-full space-y-2.5">
          {closingLine ? (
            <p className="text-[15px] leading-relaxed text-foreground">{closingLine}</p>
          ) : null}
          {chips.length > 0 ? (
            <div className="flex w-full max-w-full flex-wrap gap-2">
              {chips.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={disabled}
                  onClick={() => onFollowUp(q)}
                  className={cn(
                    "max-w-[min(100%,11rem)] rounded-lg border border-border/60",
                    "bg-muted/50 px-3 py-2 text-left text-[15px] leading-snug text-foreground",
                    "dark:bg-muted/35",
                    "transition-colors hover:border-border hover:bg-muted/70",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
                    "disabled:pointer-events-none disabled:opacity-50"
                  )}
                >
                  {q}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      )}
      <EchoMessageActions
        plainText={plainText}
        onRegenerate={onRegenerate}
        className="mt-0"
      />
    </div>
  );
}
