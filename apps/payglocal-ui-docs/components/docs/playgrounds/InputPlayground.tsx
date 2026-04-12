"use client";

import { useMemo, useState } from "react";
import { Input, Label, Textarea } from "@payglocal/ui";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { DocsVariantField, DocsVariantSelect, DocsVariantToolbar } from "@/components/docs/DocsVariantToolbar";

type FieldState = "default" | "disabled" | "invalid" | "readonly";

export function InputPlayground() {
  const [fieldState, setFieldState] = useState<FieldState>("default");
  const [inputType, setInputType] = useState<"text" | "email" | "password" | "search">("text");
  const [placeholder, setPlaceholder] = useState("Jane Merchant");
  const [width, setWidth] = useState<"full" | "md">("md");
  const [showCode, setShowCode] = useState(false);

  const disabled = fieldState === "disabled";
  const readOnly = fieldState === "readonly";
  const invalid = fieldState === "invalid";

  const code = useMemo(() => {
    const cls = width === "full" ? ` className="w-full"` : ` className="w-full max-w-md"`;
    const typeAttr = inputType !== "text" ? ` type="${inputType}"` : "";
    let extra = "";
    if (disabled) extra += " disabled";
    if (readOnly) extra += " readOnly";
    if (invalid) extra += ` aria-invalid={true}`;
    const ph = placeholder ? ` placeholder="${placeholder.replace(/"/g, '\\"')}"` : "";
    return `<Label htmlFor="demo">Name</Label>\n<Input id="demo"${typeAttr}${cls}${ph}${extra} />`;
  }, [disabled, readOnly, invalid, placeholder, width, inputType]);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="w-full max-w-xl space-y-4">
        <DocsVariantToolbar>
          <DocsVariantField label="State">
            <DocsVariantSelect
              value={fieldState}
              onChange={(v) => setFieldState(v as FieldState)}
              options={[
                { value: "default", label: "Default" },
                { value: "disabled", label: "Disabled" },
                { value: "invalid", label: "Invalid" },
                { value: "readonly", label: "Read only" },
              ]}
            />
          </DocsVariantField>
          <DocsVariantField label="Type">
            <DocsVariantSelect
              value={inputType}
              onChange={(v) => setInputType(v as typeof inputType)}
              options={[
                { value: "text", label: "text" },
                { value: "email", label: "email" },
                { value: "password", label: "password" },
                { value: "search", label: "search" },
              ]}
            />
          </DocsVariantField>
          <DocsVariantField label="Width">
            <DocsVariantSelect
              value={width}
              onChange={(v) => setWidth(v as typeof width)}
              options={[
                { value: "md", label: "max-w-md" },
                { value: "full", label: "w-full" },
              ]}
            />
          </DocsVariantField>
          <DocsVariantField label="Placeholder">
            <Input
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              className="h-10"
              placeholder="Edit placeholder…"
            />
          </DocsVariantField>
        </DocsVariantToolbar>
        <button
          type="button"
          onClick={() => setShowCode((s) => !s)}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {showCode ? "Hide generated code" : "Show generated code"}
        </button>
        {showCode ? <CodeBlock code={code} /> : null}
      </div>
      <div
        className={cn(
          "rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8",
          width === "full" ? "w-full max-w-xl" : "w-full max-w-md"
        )}
      >
        <Label htmlFor="playground-input">Name</Label>
        <Input
          id="playground-input"
          type={inputType}
          className="mt-2"
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={invalid || undefined}
        />
        {invalid ? (
          <p className="mt-2 text-sm text-destructive" role="alert">
            Please enter a valid value.
          </p>
        ) : null}
      </div>

      <div className="w-full max-w-xl rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <Label htmlFor="playground-textarea">Notes</Label>
        <Textarea
          id="playground-textarea"
          className="mt-2 min-h-[6rem]"
          placeholder="Multi-line text uses the same focus ring and radius as Input."
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={invalid || undefined}
        />
      </div>
    </div>
  );
}
