import type { Metadata } from "next";
import { CodeBlock } from "@/components/docs/CodeBlock";

export const metadata: Metadata = {
  title: "Theming",
  description: "CSS variables, Tailwind mapping, and dark mode for PayGlocal UI.",
};

const THEME_INLINE = `@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-border: var(--border);
  /* …map remaining tokens */
}`;

export default function ThemingPage() {
  return (
    <article className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Theming</h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-[15px]">
          PayGlocal UI reads semantic CSS variables. Tailwind utilities are wired through{" "}
          <code className="font-mono text-xs">@theme inline</code> so you theme once and every primitive updates.
        </p>
      </div>

      <section id="variables" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg font-semibold text-foreground">CSS variables</h2>
        <p className="text-sm text-muted-foreground">
          Define <code className="font-mono text-xs">:root</code> for light and <code className="font-mono text-xs">.dark</code>{" "}
          for dark. Components use <code className="font-mono text-xs">bg-card</code>,{" "}
          <code className="font-mono text-xs">text-primary</code>, etc., which resolve to{" "}
          <code className="font-mono text-xs">var(--card)</code>, <code className="font-mono text-xs">var(--primary)</code>.
        </p>
      </section>

      <section id="mapping" className="scroll-mt-24 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Mapping to Tailwind</h2>
        <p className="text-sm text-muted-foreground">Example bridge (trim or extend to match your app):</p>
        <CodeBlock code={THEME_INLINE} />
      </section>

      <section id="dark" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Dark theme</h2>
        <p className="text-sm text-muted-foreground">
          Add <code className="font-mono text-xs">className=&quot;dark&quot;</code> on <code className="font-mono text-xs">html</code>{" "}
          (e.g. <code className="font-mono text-xs">next-themes</code> with <code className="font-mono text-xs">attribute=&quot;class&quot;</code>
          ). Use the <code className="font-mono text-xs">@custom-variant dark</code> pattern from the installation guide so{" "}
          <code className="font-mono text-xs">dark:</code> utilities follow your toggle, not only{" "}
          <code className="font-mono text-xs">prefers-color-scheme</code>.
        </p>
      </section>
    </article>
  );
}
