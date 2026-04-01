import type { ReactNode } from "react";
import { CodeBlock } from "@/components/design-system/CodeBlock";

type PrimitiveDocLayoutProps = {
  title: string;
  description: string;
  importSnippet: string;
  usageSnippet: string;
  preview?: ReactNode;
};

export function PrimitiveDocLayout({
  title,
  description,
  importSnippet,
  usageSnippet,
  preview,
}: PrimitiveDocLayoutProps) {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">{description}</p>
      </div>

      {preview != null && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Preview</h2>
          <div className="rounded-2xl border border-border bg-muted/20 p-6 dark:bg-muted/10">{preview}</div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Import</h2>
        <CodeBlock code={importSnippet} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Usage</h2>
        <CodeBlock code={usageSnippet} />
      </section>
    </div>
  );
}
