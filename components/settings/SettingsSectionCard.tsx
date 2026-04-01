import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
  /** e.g. Edit — rendered top-right of the header */
  headerActions?: ReactNode;
  children: ReactNode;
  /** Cancel / Save — rendered in a dedicated footer row */
  footerActions?: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
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
      {footerActions ? (
        <div className="flex flex-wrap justify-end gap-2 border-t border-border/60 bg-card px-4 py-3 sm:px-5 dark:border-border/80">
          {footerActions}
        </div>
      ) : null}
    </section>
  );
}
