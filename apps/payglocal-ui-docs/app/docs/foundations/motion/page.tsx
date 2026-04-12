import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Motion",
  description: "PayGlocal motion tokens and Tailwind duration/easing utilities.",
};

const rows = [
  { name: "--motion-duration-instant", value: "0ms", utility: "duration-pg-instant" },
  { name: "--motion-duration-fast", value: "120ms", utility: "duration-pg-fast" },
  { name: "--motion-duration-normal", value: "200ms", utility: "duration-pg-normal" },
  { name: "--motion-duration-slow", value: "320ms", utility: "duration-pg-slow" },
  { name: "--motion-duration-slower", value: "480ms", utility: "duration-pg-slower" },
];

const easeRows = [
  { name: "--motion-ease-standard", utility: "ease-pg-standard", note: "Default UI transitions" },
  { name: "--motion-ease-emphasized", utility: "ease-pg-emphasized", note: "Bouncy overlays" },
  { name: "--motion-ease-linear", utility: "ease-pg-linear", note: "Progress, loops" },
];

export default function MotionFoundationsPage() {
  return (
    <article className="space-y-10 pb-16">
      <header className="space-y-3 border-b border-border pb-8">
        <p className="text-sm font-medium text-muted-foreground">
          <Link href="/docs/foundations" className="hover:text-foreground">
            Foundations
          </Link>
          <span className="mx-2 text-border">/</span>
          Motion
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Motion</h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-[17px]">
          Durations and easings are defined once in the shared theme and exposed as Tailwind utilities. Prefer these over ad-hoc{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px]">duration-150</code> values in library components.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Duration tokens</h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="border-b border-border bg-card">
              <tr>
                <th className="px-4 py-3 font-semibold text-foreground">CSS variable</th>
                <th className="px-4 py-3 font-semibold text-foreground">Value</th>
                <th className="px-4 py-3 font-semibold text-foreground">Tailwind</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-b border-border/80 last:border-0">
                  <td className="px-4 py-3 font-mono text-[13px] text-foreground">{r.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.value}</td>
                  <td className="px-4 py-3 font-mono text-[13px] text-foreground">{r.utility}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Easing tokens</h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="border-b border-border bg-card">
              <tr>
                <th className="px-4 py-3 font-semibold text-foreground">CSS variable</th>
                <th className="px-4 py-3 font-semibold text-foreground">Tailwind</th>
                <th className="px-4 py-3 font-semibold text-foreground">Use for</th>
              </tr>
            </thead>
            <tbody>
              {easeRows.map((r) => (
                <tr key={r.name} className="border-b border-border/80 last:border-0">
                  <td className="px-4 py-3 font-mono text-[13px] text-foreground">{r.name}</td>
                  <td className="px-4 py-3 font-mono text-[13px] text-foreground">{r.utility}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Reduced motion</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Respect <code className="rounded bg-muted px-1 font-mono text-xs">prefers-reduced-motion: reduce</code> for decorative or
          non-essential animations. The product app wraps several patterns with media queries; extend the same approach when adding
          motion to <code className="rounded bg-muted px-1 font-mono text-xs">@payglocal/ui</code> components.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Example</h2>
        <pre className="overflow-x-auto rounded-xl border border-border bg-card p-4 text-left shadow-sm sm:p-5">
          <code className="font-mono text-[13px] text-foreground">
            {`className="transition-colors duration-pg-fast ease-pg-standard"`}
          </code>
        </pre>
      </section>
    </article>
  );
}
