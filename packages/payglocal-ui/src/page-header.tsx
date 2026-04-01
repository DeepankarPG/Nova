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
    <div className={cn("flex items-start justify-between mb-6", className)}>
      <div>
        <h1
          className="text-xl font-semibold text-foreground tracking-tight flex items-center gap-2.5 flex-wrap"
          {...(titleAriaLabel ? { "aria-label": titleAriaLabel } : {})}
        >
          {title}
        </h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
