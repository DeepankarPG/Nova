"use client";

import { cn } from "@/lib/utils";

export function DocsVariantToolbar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex w-full max-w-2xl flex-wrap items-end gap-5 rounded-xl border border-border bg-card p-5 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DocsVariantField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex min-w-[7rem] flex-col gap-1.5 text-left">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

const selectCls =
  "h-11 min-h-11 rounded-lg border border-border bg-card px-4 text-[15px] text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35";

export function DocsVariantSelect({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <select
      className={cn(selectCls, disabled && "cursor-not-allowed opacity-60")}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
