import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Typography",
  description: "Font stacks and type scale for PayGlocal UI and the dashboard.",
};

const scale = [
  { cls: "text-xs", rem: "0.75rem", use: "Meta, table captions" },
  { cls: "text-sm", rem: "0.875rem", use: "Secondary body, form hints" },
  { cls: "text-base", rem: "1rem", use: "Default body" },
  { cls: "text-lg", rem: "1.125rem", use: "Card titles, emphasis" },
  { cls: "text-xl", rem: "1.25rem", use: "Section headings" },
  { cls: "text-2xl", rem: "1.5rem", use: "KPI values, hero metrics" },
  { cls: "text-3xl", rem: "1.875rem", use: "Page titles (docs / marketing)" },
];

export default function TypographyFoundationsPage() {
  return (
    <article className="space-y-10 pb-16">
      <header className="space-y-3 border-b border-border pb-8">
        <p className="text-sm font-medium text-muted-foreground">
          <Link href="/docs/foundations" className="hover:text-foreground">
            Foundations
          </Link>
          <span className="mx-2 text-border">/</span>
          Typography
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Typography</h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-[17px]">
          The dashboard and UI docs both load <strong className="font-medium text-foreground">Geist Sans</strong> and{" "}
          <strong className="font-medium text-foreground">Geist Mono</strong> via Next.js <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px]">next/font</code>. CSS variables{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px]">--font-geist-sans</code> and{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px]">--font-geist-mono</code> map to Tailwind{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px]">font-sans</code> /{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px]">font-mono</code>.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Scale (Tailwind)</h2>
        <p className="text-sm text-muted-foreground">
          Prefer this scale for new UI; pair with <code className="rounded bg-muted px-1 font-mono text-xs">text-foreground</code> or{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">text-muted-foreground</code> for hierarchy.
        </p>
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b border-border bg-card">
              <tr>
                <th className="px-4 py-3 font-semibold text-foreground">Class</th>
                <th className="px-4 py-3 font-semibold text-foreground">Size</th>
                <th className="px-4 py-3 font-semibold text-foreground">Typical use</th>
                <th className="px-4 py-3 font-semibold text-foreground">Sample</th>
              </tr>
            </thead>
            <tbody>
              {scale.map((r) => (
                <tr key={r.cls} className="border-b border-border/80 last:border-0">
                  <td className="px-4 py-3 font-mono text-[13px] text-foreground">{r.cls}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.rem}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.use}</td>
                  <td className={`px-4 py-3 text-foreground ${r.cls}`}>Ag payment volume</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Patterns</h2>
        <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>
            Page titles: <code className="rounded bg-muted px-1 font-mono text-xs">tracking-tight</code> with semibold weight.
          </li>
          <li>
            Dense numeric data: <code className="rounded bg-muted px-1 font-mono text-xs">tabular-nums</code> +{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">font-mono</code> where alignment matters.
          </li>
          <li>Secondary copy: <code className="rounded bg-muted px-1 font-mono text-xs">leading-relaxed</code>.</li>
        </ul>
      </section>
    </article>
  );
}
