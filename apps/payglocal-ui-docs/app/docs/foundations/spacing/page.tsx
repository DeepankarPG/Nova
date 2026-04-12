import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Spacing",
  description: "Layout spacing scale and dashboard rhythms for PayGlocal UI.",
};

const layoutScale = [
  { token: "none", tailwind: "0", note: "Reset" },
  { token: "xs", tailwind: "0.25rem (1)", note: "Tight stacks" },
  { token: "sm", tailwind: "0.5rem (2)", note: "Compact groups" },
  { token: "md", tailwind: "1rem (4)", note: "Card padding, form gaps" },
  { token: "lg", tailwind: "1.5rem (6)", note: "Section gaps (Stack default)" },
  { token: "xl", tailwind: "2rem (8)", note: "Loose sections" },
];

export default function SpacingFoundationsPage() {
  return (
    <article className="space-y-10 pb-16">
      <header className="space-y-3 border-b border-border pb-8">
        <p className="text-sm font-medium text-muted-foreground">
          <Link href="/docs/foundations" className="hover:text-foreground">
            Foundations
          </Link>
          <span className="mx-2 text-border">/</span>
          Spacing
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Spacing</h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-[17px]">
          Dashboard pages typically use <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px]">gap-3</code> /{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px]">gap-4</code> and content gutters{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px]">p-4 md:p-6</code>.{" "}
          <Link href="/docs/components/layout-primitives" className="font-medium text-primary underline-offset-4 hover:underline">
            Layout primitives
          </Link>{" "}
          map friendly names to the same Tailwind steps.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[15px]">LayoutSpacing</code> (Box / Stack / Inline)
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="border-b border-border bg-card">
              <tr>
                <th className="px-4 py-3 font-semibold text-foreground">Prop value</th>
                <th className="px-4 py-3 font-semibold text-foreground">Tailwind spacing</th>
                <th className="px-4 py-3 font-semibold text-foreground">Notes</th>
              </tr>
            </thead>
            <tbody>
              {layoutScale.map((r) => (
                <tr key={r.token} className="border-b border-border/80 last:border-0">
                  <td className="px-4 py-3 font-mono text-[13px] text-foreground">{r.token}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.tailwind}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Consistency</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Within one screen, pick one vertical rhythm (for example all parallel regions use <code className="rounded bg-muted px-1 font-mono text-xs">gap-4</code>). See the root{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">DESIGN.md</code> for the full playbook.
        </p>
      </section>
    </article>
  );
}
