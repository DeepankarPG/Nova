"use client";

import type { ReactNode } from "react";
import { useContext } from "react";
import { cn } from "@/lib/utils";
import { SettingsPageActionsContext } from "@/components/settings/SettingsPageActionsContext";

export function SettingsSectionCard({
  title,
  description,
  headerActions,
  children,
  footerActions,
  className,
  bodyClassName,
}: {
  title: string;
  description?: ReactNode;
  headerActions?: ReactNode;
  children: ReactNode;
  footerActions?: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  // When rendered inside the mobile settings shell, the shell's bottom action bar
  // replaces the inline footer — suppress it here to avoid duplication.
  const inMobileShell = useContext(SettingsPageActionsContext) !== null;
  const showInlineFooter = !inMobileShell && !!footerActions;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-border/60 bg-card dark:border-border/80",
        className
      )}
    >
      <div className="border-b border-border/60 px-4 py-4 sm:px-5 dark:border-border/80">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            {description ? <div className="mt-1 text-sm text-muted-foreground">{description}</div> : null}
          </div>
          {headerActions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{headerActions}</div> : null}
        </div>
      </div>
      <div className={cn("bg-muted/25 px-4 py-4 sm:px-5 dark:bg-zinc-900/40", bodyClassName)}>{children}</div>
      {showInlineFooter ? (
        <div className="flex flex-wrap justify-end gap-2 border-t border-border/60 bg-card px-4 py-3 sm:px-5 dark:border-border/80">
          {footerActions}
        </div>
      ) : null}
    </section>
  );
}
