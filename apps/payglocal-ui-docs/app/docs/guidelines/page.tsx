import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guidelines",
  description: "Tokens, Tailwind v4, composition, accessibility, and dark mode for PayGlocal UI.",
};

export default function GuidelinesPage() {
  return (
    <article className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Guidelines</h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-[15px]">
          How we build interfaces with PayGlocal UI — match these rules and your screens will feel native to the system.
        </p>
      </div>

      <section id="tokens" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Design tokens</h2>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          Prefer semantic utilities: <code className="font-mono text-xs">bg-background</code>,{" "}
          <code className="font-mono text-xs">text-muted-foreground</code>,{" "}
          <code className="font-mono text-xs">border-border</code>, <code className="font-mono text-xs">bg-primary</code>.
          They map to CSS variables (<code className="font-mono text-xs">--background</code>,{" "}
          <code className="font-mono text-xs">--primary</code>, …) so light and dark stay consistent. Avoid hard-coded hex in
          primitives unless you are defining a token.
        </p>
      </section>

      <section id="tailwind" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Tailwind v4</h2>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          Use <code className="font-mono text-xs">@import &quot;tailwindcss&quot;;</code> and{" "}
          <code className="font-mono text-xs">@theme inline</code> to bridge variables to utilities. Point{" "}
          <code className="font-mono text-xs">@source</code> at <code className="font-mono text-xs">@payglocal/ui</code>{" "}
          <code className="font-mono text-xs">src/**/*.tsx</code> so classes inside the package are generated.
        </p>
      </section>

      <section id="composition" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Composition</h2>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          Build forms with <code className="font-mono text-xs">Field</code>, <code className="font-mono text-xs">FieldLabel</code>
          , and <code className="font-mono text-xs">FieldError</code>; wrap inputs with{" "}
          <code className="font-mono text-xs">InputGroup</code> when you need prefixes or actions. Use{" "}
          <code className="font-mono text-xs">Dialog</code> and overlay primitives for focus-heavy tasks.
        </p>
      </section>

      <section id="accessibility" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Accessibility</h2>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          Keep labels associated with controls, preserve focus rings (token <code className="font-mono text-xs">--ring</code>
          ), and test keyboard paths for dialogs, menus, and selects. Tooltips require a{" "}
          <code className="font-mono text-xs">TooltipProvider</code> ancestor.
        </p>
      </section>

      <section id="dark-mode" className="scroll-mt-24 space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Dark mode</h2>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          Use <code className="font-mono text-xs">class=&quot;dark&quot;</code> on the root (e.g. via{" "}
          <code className="font-mono text-xs">next-themes</code>) with the <code className="font-mono text-xs">.dark</code>{" "}
          variable overrides. Every primitive on this site is checked in both themes.
        </p>
      </section>
    </article>
  );
}
