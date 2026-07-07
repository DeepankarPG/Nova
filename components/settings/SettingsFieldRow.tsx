import { cn } from "@/lib/utils";

export function SettingsFieldRow({
  label,
  description,
  error,
  children,
  className,
}: {
  label: string;
  description?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border py-4 last:border-b-0 @md:flex-row @md:items-start @md:justify-between @md:gap-8",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        {error && <p className="mt-1 text-[11px] text-red-600 dark:text-red-400">{error}</p>}
      </div>
      <div className="w-full shrink-0 @md:w-72">{children}</div>
    </div>
  );
}
