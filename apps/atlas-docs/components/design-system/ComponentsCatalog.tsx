"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  INVENTORY_CATEGORIES,
  getInventoryStats,
  type InventoryItem,
  type InventoryStatus,
} from "@/components/design-system/component-inventory-data";
import { cn } from "@/lib/utils";

const STATUS_META: Record<
  InventoryStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  available: {
    label: "Available",
    badgeClass:
      "bg-blue-500/15 text-blue-800 border-blue-500/25 dark:bg-blue-500/20 dark:text-blue-100 dark:border-blue-400/35",
    dotClass: "bg-blue-500 dark:bg-blue-400",
  },
  "needs-review": {
    label: "Needs review",
    badgeClass:
      "bg-emerald-500/15 text-emerald-900 border-emerald-500/25 dark:bg-emerald-500/20 dark:text-emerald-100 dark:border-emerald-400/35",
    dotClass: "bg-emerald-500 dark:bg-emerald-400",
  },
  planned: {
    label: "Planned",
    badgeClass:
      "bg-amber-500/15 text-amber-950 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-100 dark:border-amber-400/35",
    dotClass: "bg-amber-500 dark:bg-amber-400",
  },
};

function InventoryCard({ item }: { item: InventoryItem }) {
  const meta = STATUS_META[item.status];

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-snug text-foreground">{item.name}</h3>
        <span
          className={cn(
            "shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            meta.badgeClass
          )}
        >
          {meta.label}
        </span>
      </div>
      <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
      {item.importPath || item.designHref || item.hint ? (
        <div className="mt-3 space-y-2 border-t border-border/60 pt-3">
          {item.importPath || item.designHref ? (
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              {item.importPath ? (
                <code className="max-w-full break-all rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                  {item.importPath}
                </code>
              ) : null}
              {item.designHref ? (
                <Link href={item.designHref} className="font-medium text-primary hover:underline">
                  Docs
                </Link>
              ) : null}
            </div>
          ) : null}
          {item.hint ? <p className="text-[11px] leading-snug text-muted-foreground">{item.hint}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 dark:bg-muted/15">
      <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

export function ComponentsCatalog() {
  const [query, setQuery] = useState("");
  const stats = useMemo(() => getInventoryStats(INVENTORY_CATEGORIES), []);

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return INVENTORY_CATEGORIES;
    return INVENTORY_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.hint?.toLowerCase().includes(q) ?? false) ||
          cat.title.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [query]);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard value={stats.total} label="Total items" />
        <StatCard value={stats.categories} label="Categories" />
        <StatCard value={stats.needsReview} label="Needs review" />
        <StatCard value={stats.planned} label="Not started" />
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Legend</p>
          <div className="mt-2 flex flex-wrap gap-4">
            {(Object.keys(STATUS_META) as InventoryStatus[]).map((key) => (
              <div key={key} className="flex items-center gap-2 text-sm text-foreground">
                <span className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_META[key].dotClass)} aria-hidden />
                <span className="font-medium">{STATUS_META[key].label}</span>
                <span className="text-muted-foreground">
                  {key === "available" && "Ready to use from tokens or @/components/ui"}
                  {key === "needs-review" && "In the app; wrap, document, or refine"}
                  {key === "planned" && "On the roadmap"}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative sm:w-64">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name…"
            className="h-9 w-full rounded-lg border border-input bg-background pl-8 pr-3 text-sm text-foreground outline-none ring-ring/50 placeholder:text-muted-foreground focus-visible:ring-2"
            aria-label="Filter component inventory"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{stats.available}</span> available ·{" "}
        <span className="font-medium text-foreground">{stats.needsReview}</span> need review ·{" "}
        <span className="font-medium text-foreground">{stats.planned}</span> planned
      </p>

      {filteredCategories.map((category) => (
        <section key={category.id} className="scroll-mt-8" id={category.id}>
          <div className="mb-4 border-b border-border pb-3">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{category.title}</h2>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{category.description}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {category.items.map((item) => (
              <InventoryCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}

      {filteredCategories.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          No components match &quot;{query}&quot;.
        </p>
      ) : null}
    </div>
  );
}
