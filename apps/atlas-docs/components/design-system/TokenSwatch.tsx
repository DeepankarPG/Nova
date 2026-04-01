export function TokenSwatch({
  name,
  variable,
  description,
}: {
  name: string;
  variable: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <div
        className="h-10 w-10 shrink-0 rounded-md border border-border shadow-inner"
        style={{ backgroundColor: `var(${variable})` }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="font-mono text-xs font-medium text-foreground">{name}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>
        <p className="mt-1 font-mono text-[10px] text-muted-foreground/80">{variable}</p>
      </div>
    </div>
  );
}
