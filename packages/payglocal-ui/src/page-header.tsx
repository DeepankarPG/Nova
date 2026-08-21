import type { ReactNode } from "react";
import { cn } from "./utils";

interface PageHeaderProps {
  title: ReactNode;
  /** When title is non-plain text (e.g. includes a flag), set for screen readers. */
  titleAriaLabel?: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, titleAriaLabel, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-x-4 gap-y-3 mb-6", className)}>
      <div className="min-w-0">
        <h1
          className="text-xl font-semibold text-foreground tracking-tight flex items-center gap-2.5 flex-wrap"
          {...(titleAriaLabel ? { "aria-label": titleAriaLabel } : {})}
        >
          {title}
        </h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
