import type { Metadata } from "next";
import { ButtonDesignDemo } from "@/components/design-system/demos/ButtonDesignDemo";
import { CodeBlock } from "@/components/design-system/CodeBlock";

export const metadata: Metadata = {
  title: "Button — Atlas",
  description: "Button variants, sizes, and usage for the PayGlocal portal.",
};

const IMPORT_SNIPPET = `import { Button } from "@/components/ui/button";`;

const USAGE_SNIPPET = `<Button variant="primary" size="md">
  Pay now
</Button>

<Button variant="outline" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>
  Export
</Button>

<Button variant="primary" isLoading>
  Saving
</Button>`;

export default function DesignButtonPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Button</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          Primary action control for forms, dialogs, and toolbars. Built on native{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">&lt;button&gt;</code> with token-based
          variants.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Preview</h2>
        <div className="rounded-2xl border border-border bg-muted/20 p-6 dark:bg-muted/10">
          <ButtonDesignDemo />
        </div>
      </section>

      <section id="import" className="scroll-mt-20 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Import</h2>
        <CodeBlock code={IMPORT_SNIPPET} />
      </section>

      <section id="usage" className="scroll-mt-20 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Usage</h2>
        <CodeBlock code={USAGE_SNIPPET} />
      </section>

      <section id="props" className="scroll-mt-20 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Props</h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-2.5 font-medium text-foreground">Prop</th>
                <th className="px-4 py-2.5 font-medium text-foreground">Type</th>
                <th className="px-4 py-2.5 font-medium text-foreground">Default</th>
                <th className="px-4 py-2.5 font-medium text-foreground">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-4 py-2.5 font-mono text-xs text-foreground">variant</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  <code className="text-xs">
                    &quot;primary&quot; | &quot;secondary&quot; | &quot;outline&quot; | &quot;ghost&quot; | &quot;danger&quot; | &quot;link&quot;
                  </code>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">primary</td>
                <td className="px-4 py-2.5 text-muted-foreground">Visual style</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono text-xs text-foreground">size</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  <code className="text-xs">&quot;sm&quot; | &quot;md&quot; | &quot;lg&quot;</code>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">md</td>
                <td className="px-4 py-2.5 text-muted-foreground">Height and padding</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono text-xs text-foreground">isLoading</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  <code className="text-xs">boolean</code>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">false</td>
                <td className="px-4 py-2.5 text-muted-foreground">Shows spinner and disables interaction</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono text-xs text-foreground">leftIcon</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  <code className="text-xs">ReactNode</code>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">—</td>
                <td className="px-4 py-2.5 text-muted-foreground">Hidden while loading</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono text-xs text-foreground">rightIcon</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  <code className="text-xs">ReactNode</code>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">—</td>
                <td className="px-4 py-2.5 text-muted-foreground">Trailing icon</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono text-xs text-foreground">…rest</td>
                <td className="px-4 py-2.5 text-muted-foreground" colSpan={3}>
                  Standard <code className="text-xs">button</code> HTML attributes (<code className="text-xs">type</code>,{" "}
                  <code className="text-xs">onClick</code>, <code className="text-xs">disabled</code>, etc.)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
