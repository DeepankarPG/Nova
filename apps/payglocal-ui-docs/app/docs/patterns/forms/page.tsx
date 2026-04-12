import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/docs/CodeBlock";

export const metadata: Metadata = {
  title: "Forms & fields",
  description: "Form layout pattern using PayGlocal UI Field primitives.",
};

const EXAMPLE = `import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
  Input,
  Button,
} from "@payglocal/ui";

<FieldGroup className="max-w-md space-y-4">
  <Field>
    <FieldLabel htmlFor="email">Work email</FieldLabel>
    <FieldDescription>Used for receipts and alerts.</FieldDescription>
    <Input id="email" type="email" placeholder="you@company.com" />
  </Field>
  <div className="flex justify-end gap-2 pt-2">
    <Button variant="outline" size="md">Cancel</Button>
    <Button variant="primary" size="md">Save</Button>
  </div>
</FieldGroup>`;

export default function FormsPatternPage() {
  return (
    <article className="space-y-10 pb-16">
      <header className="space-y-3 border-b border-border pb-8">
        <p className="text-sm font-medium text-muted-foreground">
          <Link href="/docs/patterns" className="hover:text-foreground">
            Patterns
          </Link>
          <span className="mx-2 text-border">/</span>
          Forms & fields
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Forms & fields</h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-[17px]">
          Stack <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px]">FieldGroup</code> →{" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px]">Field</code> → label, optional description, then control.
          Controls use dashboard-sized <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[13px]">Input</code> (see component docs).
        </p>
      </header>

      <section id="example" className="scroll-mt-24 space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Example</h2>
        <CodeBlock code={EXAMPLE} />
      </section>

      <section id="related" className="scroll-mt-24 space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Related</h2>
        <ul className="text-sm text-muted-foreground">
          <li>
            <Link href="/docs/components/field" className="font-medium text-primary underline-offset-4 hover:underline">
              Field
            </Link>
          </li>
          <li>
            <Link href="/docs/components/input" className="font-medium text-primary underline-offset-4 hover:underline">
              Input
            </Link>
          </li>
        </ul>
      </section>
    </article>
  );
}
