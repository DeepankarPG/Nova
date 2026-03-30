"use client";

import { cn } from "@/lib/utils";

export function SettingsToggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onChange}
      className={cn(
        "relative flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200",
        on ? "bg-primary" : "bg-muted-foreground/30"
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] h-[14px] w-[14px] rounded-full bg-white shadow transition-transform duration-200",
          on ? "translate-x-[18px]" : "translate-x-[3px]"
        )}
      />
    </button>
  );
}
