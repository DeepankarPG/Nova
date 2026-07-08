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
 * Mobile-first: hug strip (closing copy + compact chips) then utility actions.
 * Chips scroll horizontally on narrow viewports; action buttons have 36px hit area.
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
    <div className="mt-2.5 space-y-2.5">
      {showTopBlock && (
        <div className="max-w-full space-y-2">
          {closingLine ? (
            <p className="text-[13px] leading-relaxed text-foreground">{closingLine}</p>
          ) : null}
          {chips.length > 0 ? (
            <div className="flex w-full max-w-full gap-2 overflow-x-auto pb-0.5 scrollbar-none">
              {chips.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={disabled}
                  onClick={() => onFollowUp(q)}
                  className={cn(
                    "min-h-[36px] shrink-0 rounded-lg border border-border/60",
                    "bg-muted/50 px-3 py-2 text-left text-[12px] leading-snug text-foreground",
                    "max-w-[min(100%,10rem)]",
                    "dark:bg-muted/35",
                    "transition-colors active:border-border active:bg-muted/70",
                    "hover:border-border hover:bg-muted/70",
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
