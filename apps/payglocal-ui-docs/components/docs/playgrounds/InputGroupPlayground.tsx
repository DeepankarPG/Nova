"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
  Stack,
} from "@payglocal/ui";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { DocsVariantField, DocsVariantSelect, DocsVariantToolbar } from "@/components/docs/DocsVariantToolbar";

type Align = "inline-start" | "inline-end" | "block-start" | "block-end";

export function InputGroupPlayground() {
  const [align, setAlign] = useState<Align>("inline-start");
  const [showCode, setShowCode] = useState(false);

  const code = useMemo(
    () =>
      `<InputGroup>\n  <InputGroupAddon align="${align}">…</InputGroupAddon>\n  <InputGroupInput placeholder="…" />\n</InputGroup>`,
    [align]
  );

  return (
    <Stack gap="lg" className="w-full max-w-xl text-left">
      <DocsVariantToolbar>
        <DocsVariantField label="Addon align">
          <DocsVariantSelect
            value={align}
            onChange={(v) => setAlign(v as Align)}
            options={[
              { value: "inline-start", label: "inline-start" },
              { value: "inline-end", label: "inline-end" },
              { value: "block-start", label: "block-start" },
              { value: "block-end", label: "block-end" },
            ]}
          />
        </DocsVariantField>
      </DocsVariantToolbar>
      <button
        type="button"
        onClick={() => setShowCode((s) => !s)}
        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        {showCode ? "Hide snippet" : "Show snippet"}
      </button>
      {showCode ? <CodeBlock code={code} /> : null}

      <div className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Text + input (toolbar selection)</p>
          <InputGroup>
            <InputGroupAddon align={align}>
              <InputGroupText>https://</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput placeholder="pay.example.com" />
          </InputGroup>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Icon + button + input</p>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <Search className="size-4 opacity-70" aria-hidden />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search merchants…" />
            <InputGroupAddon align="inline-end">
              <InputGroupButton type="button">Go</InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Textarea in group</p>
          <InputGroup>
            <InputGroupAddon align="block-start">
              <InputGroupText>Notes</InputGroupText>
            </InputGroupAddon>
            <InputGroupTextarea placeholder="Internal memo…" rows={3} />
          </InputGroup>
        </div>
      </div>
    </Stack>
  );
}
