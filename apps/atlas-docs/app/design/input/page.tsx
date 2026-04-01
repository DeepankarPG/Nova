import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/design-system/CodeBlock";
import { InputDesignDemos } from "@/components/design-system/demos/InputDesignDemos";

export const metadata: Metadata = {
  title: "Input — Atlas",
  description: "Text input for forms with Field, states, and input groups (Radix Label).",
};

const INSTALL_CLI = `npx shadcn@latest add input label field separator textarea input-group`;

const FILES_NOTE = `This repo already includes the sources under:

• components/ui/input.tsx
• components/ui/textarea.tsx
• components/ui/label.tsx (uses @radix-ui/react-label)
• components/ui/separator.tsx
• components/ui/field.tsx
• components/ui/input-group.tsx

Match import paths to @/components/ui/…`;

const USAGE_IMPORT = `import { Input } from "@/components/ui/input"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"`;

const USAGE_BASIC = `<Input type="email" placeholder="Email" />`;

const USAGE_FIELD = `<FieldGroup>
  <Field invalid={false} disabled={false}>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <FieldDescription>We will never share your email.</FieldDescription>
    <Input id="email" type="email" />
    <FieldError errors={[{ message: "Invalid email" }]} />
  </Field>
</FieldGroup>`;

const USAGE_INVALID = `<Field invalid>
  <FieldLabel htmlFor="x">Amount</FieldLabel>
  <Input id="x" aria-invalid defaultValue="NaN" />
  <FieldError>Enter a number.</FieldError>
</Field>`;

export default function DesignInputPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Base · Radix (Label)</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Input</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          Text field for forms and data entry, aligned with{" "}
          <a
            href="https://ui.shadcn.com/docs/components/input"
            className="font-medium text-primary underline-offset-4 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            shadcn/ui Input
          </a>
          : <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">Input</code>,{" "}
          <code className="font-mono text-xs">Field</code> composition, disabled and{" "}
          <code className="font-mono text-xs">aria-invalid</code> styling, file type, groups, and RTL-friendly markup.
        </p>
      </div>

      <section id="installation" className="scroll-mt-20 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Installation</h2>
        <p className="text-sm text-muted-foreground">
          In a fresh project you can use the CLI; here the components are already vendored.
        </p>
        <p className="text-xs font-medium text-foreground">Command (reference)</p>
        <CodeBlock code={INSTALL_CLI} />
        <p className="text-xs font-medium text-foreground">Manual / this monorepo</p>
        <CodeBlock code={FILES_NOTE} />
      </section>

      <section id="usage" className="scroll-mt-20 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Usage</h2>
        <CodeBlock code={USAGE_IMPORT} />
        <CodeBlock code={USAGE_BASIC} />
        <CodeBlock code={USAGE_FIELD} />
        <p className="text-xs text-muted-foreground">
          For validation UI, set <code className="font-mono">aria-invalid</code> on{" "}
          <code className="font-mono">Input</code> and <code className="font-mono">invalid</code> on{" "}
          <code className="font-mono">Field</code> so labels pick up destructive color.
        </p>
        <CodeBlock code={USAGE_INVALID} />
      </section>

      <section id="examples" className="scroll-mt-20 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Examples</h2>
        <InputDesignDemos />
      </section>

      <p className="text-xs text-muted-foreground">
        See{" "}
        <Link href="/design/components" className="font-medium text-primary hover:underline">
          Component inventory
        </Link>{" "}
        for overall coverage. Destructive tokens live in <code className="font-mono">app/globals.css</code> (
        <code className="font-mono">--destructive</code>, <code className="font-mono">--radius</code>).
      </p>
    </div>
  );
}
