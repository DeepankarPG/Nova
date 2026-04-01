"use client";

import { useState, type ReactNode } from "react";
import { CodeBlock } from "@/components/design-system/CodeBlock";
import { cn } from "@/lib/utils";

type InstallTabsProps = {
  cliLabel?: string;
  manualLabel?: string;
  cliCode: string;
  manual: ReactNode;
};

export function InstallTabs({
  cliLabel = "Command",
  manualLabel = "Manual",
  cliCode,
  manual,
}: InstallTabsProps) {
  const [tab, setTab] = useState<"cli" | "manual">("cli");

  return (
    <div className="space-y-3">
      <div
        role="tablist"
        aria-label="Installation"
        className="inline-flex gap-1 rounded-lg border border-border bg-muted/30 p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "cli"}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            tab === "cli" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setTab("cli")}
        >
          {cliLabel}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "manual"}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            tab === "manual" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setTab("manual")}
        >
          {manualLabel}
        </button>
      </div>
      {tab === "cli" ? <CodeBlock code={cliCode} /> : <div className="space-y-4">{manual}</div>}
    </div>
  );
}
