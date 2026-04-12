export function DocsIntroHero() {
  return (
    <header
      id="overview"
      className="mb-10 scroll-mt-24 rounded-xl border border-border bg-card px-6 py-7 shadow-sm sm:px-8 sm:py-8"
    >
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-primary">Introduction</p>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Welcome to PayGlocal UI</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-[15px]">
        Merchant-grade primitives you install and own — same stack we ship in the dashboard.
      </p>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
        The package is published as{" "}
        <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground ring-1 ring-border">
          @payglocal/ui
        </code>{" "}
        so you can reuse the same tokens, spacing, and components in your own product.
      </p>
    </header>
  );
}
