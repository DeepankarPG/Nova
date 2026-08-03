"use client";

import {
  CircleDollarSign,
  Globe2,
  Link2,
  Receipt,
  Scale,
  Settings,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuickActionId } from "@/components/dashboard/quick-actions/types";

type QuickActionItem = {
  id: QuickActionId;
  label: string;
  icon: LucideIcon;
};

const quickActions: QuickActionItem[] = [
  { id: "payment-link", label: "Create payment link", icon: Link2 },
  { id: "invoice", label: "Create invoice", icon: Receipt },
  { id: "invite-teammate", label: "Invite teammate", icon: UserPlus },
  { id: "fx-calculator", label: "FX calculator", icon: CircleDollarSign },
  { id: "international-accounts", label: "International accounts", icon: Globe2 },
  { id: "manage-dispute", label: "Manage dispute", icon: Scale },
];

const quickAccessCardClass = cn(
  "group flex shrink-0 flex-col items-start gap-2 rounded-xl border border-border bg-card text-left",
  "px-3.5 pb-2.5 pt-3.5 shadow-sm transition-all duration-150",
  "hover:border-primary/30 hover:shadow-md",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "w-[9rem] sm:w-[9.25rem]"
);

export function QuickAccess({
  onAction,
  onEditDashboard,
  editMode = false,
}: {
  onAction: (id: QuickActionId) => void;
  onEditDashboard?: () => void;
  editMode?: boolean;
}) {
  return (
    <div className="w-full">
      <h2 className="mb-3 text-[15px] font-semibold tracking-[-0.02em] text-foreground sm:text-base">
        Quick access
      </h2>

      <div className="w-fit max-w-full">
        <div className="flex flex-wrap gap-2.5">
          {quickActions.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onAction(item.id)}
                className={quickAccessCardClass}
              >
                <Icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} aria-hidden />
                <span className="text-left text-[11px] font-medium leading-snug text-foreground sm:text-xs">
                  {item.label}
                </span>
              </button>
            );
          })}

          {onEditDashboard != null && !editMode && (
            <button
              type="button"
              onClick={onEditDashboard}
              className={cn(
                quickAccessCardClass,
                "w-[9.25rem] cursor-pointer sm:w-[9.75rem]"
              )}
              aria-label="Customise your dashboard layout"
            >
              <Settings className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} aria-hidden />
              <span className="text-left text-[11px] font-medium leading-snug text-foreground sm:text-xs">
                Customise dashboard
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
