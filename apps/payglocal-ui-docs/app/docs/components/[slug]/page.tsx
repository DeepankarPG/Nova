import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { DocsComponentPreviewSection } from "@/components/docs/DocsComponentPreviewSection";
import { COMPONENT_BY_SLUG, getSortedComponentPages } from "@/lib/component-registry";
import { getNpmInstallCommand } from "@/lib/site-config";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getSortedComponentPages().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = COMPONENT_BY_SLUG[slug];
  if (!doc) return {};
  return {
    title: doc.title,
    description: doc.description,
  };
}

export default async function ComponentDocPage({ params }: Props) {
  const { slug } = await params;
  const doc = COMPONENT_BY_SLUG[slug];
  if (!doc) notFound();

  const install = getNpmInstallCommand();

  return (
    <article className="space-y-12 pb-16">
      <header className="space-y-3 border-b border-border pb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{doc.title}</h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-[17px]">{doc.description}</p>
      </header>

      <section id="preview" className="scroll-mt-24 space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Preview</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Interactive examples use the same <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px]">@payglocal/ui</code>{" "}
            build as production. Toggle theme in the header for light and dark. Motion tokens and layout patterns live under{" "}
            <a href="/docs/foundations/motion" className="font-medium text-primary underline-offset-4 hover:underline">
              Motion
            </a>{" "}
            and{" "}
            <a href="/docs/patterns" className="font-medium text-primary underline-offset-4 hover:underline">
              Patterns
            </a>{" "}
            in the sidebar.
          </p>
        </div>
        <DocsComponentPreviewSection slug={slug} />
      </section>

      <section id="installation" className="scroll-mt-24 space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Installation</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Add the package to your app (full Next.js + Tailwind steps on{" "}
            <Link href="/docs/installation" className="font-medium text-primary underline-offset-4 hover:underline">
              Installation
            </Link>
            ):
          </p>
        </div>
        <CodeBlock code={install} />
      </section>

      <section id="usage" className="scroll-mt-24 space-y-8">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Usage</h2>

        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Import</p>
          <CodeBlock code={doc.importSnippet} />
        </div>

        <div className="h-px w-full bg-border" aria-hidden />

        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Example</p>
          <CodeBlock code={doc.usageSnippet} />
        </div>
      </section>
    </article>
  );
}
