import Link from "next/link";
import { DESIGN_DOCS_NAV } from "@/components/design-system/design-docs-nav";

/** shadcn-style directory grid of component doc links. */
export function AtlasComponentGrid() {
  const section = DESIGN_DOCS_NAV.find((s) => s.label === "Components");
  if (!section) return null;

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {section.items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary/25 hover:bg-muted/40"
        >
          {item.title}
        </Link>
      ))}
    </div>
  );
}
