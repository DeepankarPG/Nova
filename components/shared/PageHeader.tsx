import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: React.ReactNode;
  /** When title is non-plain text (e.g. includes a flag), set for screen readers. */
  titleAriaLabel?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, titleAriaLabel, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between mb-6", className)}>
      <div>
        <h1
          className="text-xl font-semibold text-gray-900 tracking-tight flex items-center gap-2.5 flex-wrap"
          {...(titleAriaLabel ? { "aria-label": titleAriaLabel } : {})}
        >
          {title}
        </h1>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
