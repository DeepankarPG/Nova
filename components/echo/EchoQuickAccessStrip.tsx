"use client";

import {
  CircleDollarSign,
  Link2,
  ListX,
  Scale,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  onSend: (text: string, fileNames: string[]) => void;
  disabled?: boolean;
  className?: string;
};

/** Icon stroke colour only (no tinted tile behind the glyph). */
const CHIP_ICON_TINT = [
  "text-primary",
  "text-violet-600 dark:text-violet-400",
  "text-rose-600 dark:text-rose-400",
  "text-emerald-600 dark:text-emerald-400",
  "text-sky-600 dark:text-sky-400",
  "text-amber-600 dark:text-amber-400",
] as const;

/** Compact action chips: 2-column grid, flat (no shadow), system radius. */
export function EchoQuickAccessStrip({
  onSend,
  disabled,
  className,
}: Props) {
  const items = [
    {
      id: "payment-link",
      label: "Create a payment link",
      icon: Link2,
      onActivate: () => onSend("Create a payment link for $500", []),
    },
    {
      id: "disputes",
      label: "Show me my recent disputes",
      icon: Scale,
      onActivate: () => onSend("Show me my recent disputes", []),
    },
    {
      id: "failed",
      label: "Show me all failed transactions",
      icon: ListX,
      onActivate: () => onSend("Show me all failed transactions", []),
    },
    {
      id: "earnings",
      label: "What were my earnings last week?",
      icon: TrendingUp,
      onActivate: () => onSend("What were my earnings last week?", []),
    },
    {
      id: "open-pl",
      label: "Open payment links",
      icon: Wallet,
      onActivate: () =>
        onSend("Take me to payment links", []),
    },
    {
      id: "settlements",
      label: "Open settlement reports",
      icon: CircleDollarSign,
      onActivate: () => onSend("Open settlement reports", []),
    },
  ] as const;

  return (
    <div
      className={cn(
        "shrink-0 border-t border-border/50 bg-muted/30 px-3 py-3 text-center sm:px-4",
        className
      )}
    >
      <p className="mb-2 text-[12px] font-medium tracking-tight text-muted-foreground">
        Things you can do with Echo!
      </p>
      <div className="mx-auto grid w-full max-w-md grid-cols-2 gap-2">
        {items.map((item, i) => {
          const Icon = item.icon;
          const iconTint = CHIP_ICON_TINT[i] ?? CHIP_ICON_TINT[0];
          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              title={item.label}
              onClick={() => item.onActivate()}
              className={cn(
                "flex h-9 w-full min-h-0 items-center gap-2 rounded-lg border border-border bg-muted/70 px-2 text-left text-[12px] font-medium leading-none text-foreground",
                "transition-colors",
                "hover:border-border hover:bg-muted",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
                "disabled:pointer-events-none disabled:opacity-50"
              )}
            >
              <Icon
                className={cn("h-4 w-4 shrink-0", iconTint)}
                strokeWidth={2}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
