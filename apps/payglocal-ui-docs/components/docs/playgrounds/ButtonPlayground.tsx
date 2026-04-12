"use client";

import { useMemo, useState } from "react";
import { Button } from "@payglocal/ui";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { DocsVariantField, DocsVariantSelect, DocsVariantToolbar } from "@/components/docs/DocsVariantToolbar";

export function ButtonPlayground() {
  const [variant, setVariant] = useState<"primary" | "secondary" | "ghost" | "danger" | "outline" | "link">("primary");
  const [size, setSize] = useState<"sm" | "md" | "lg">("lg");
  const [isLoading, setIsLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const code = useMemo(() => {
    const attrs: string[] = [`variant="${variant}"`];
    if (variant !== "link") attrs.push(`size="${size}"`);
    if (isLoading) attrs.push("isLoading");
    if (disabled) attrs.push("disabled");
    return `<Button ${attrs.join(" ")}>\n  Button\n</Button>`;
  }, [variant, size, isLoading, disabled]);

  const demoClass = cn(
    variant === "link" && "min-w-0 max-w-full shrink-0",
    variant !== "link" && "min-w-[9.5rem]"
  );

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="w-full space-y-4">
        <DocsVariantToolbar>
          <DocsVariantField label="Variant">
            <DocsVariantSelect
              value={variant}
              onChange={(v) => {
                const next = v as typeof variant;
                setVariant(next);
                if (next === "link") setIsLoading(false);
              }}
              options={[
                { value: "primary", label: "Primary" },
                { value: "secondary", label: "Secondary" },
                { value: "outline", label: "Outline" },
                { value: "ghost", label: "Ghost" },
                { value: "danger", label: "Danger" },
                { value: "link", label: "Link" },
              ]}
            />
          </DocsVariantField>
          <DocsVariantField label="Size">
            <DocsVariantSelect
              value={size}
              onChange={(v) => setSize(v as typeof size)}
              disabled={variant === "link"}
              options={[
                { value: "sm", label: "Small" },
                { value: "md", label: "Medium" },
                { value: "lg", label: "Large" },
              ]}
            />
          </DocsVariantField>
          <DocsVariantField label="State">
            <div className="flex flex-wrap gap-3 text-sm">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={isLoading}
                  onChange={(e) => setIsLoading(e.target.checked)}
                  disabled={variant === "link"}
                  className="rounded border-border"
                />
                Loading
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={disabled}
                  onChange={(e) => setDisabled(e.target.checked)}
                  className="rounded border-border"
                />
                Disabled
              </label>
            </div>
          </DocsVariantField>
        </DocsVariantToolbar>
        {variant === "link" ? (
          <p className="text-xs text-muted-foreground">Link ignores size and loading; use for in-flow actions.</p>
        ) : null}
        <button
          type="button"
          onClick={() => setShowCode((s) => !s)}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {showCode ? "Hide generated code" : "Show generated code"}
        </button>
        {showCode ? <CodeBlock code={code} className="max-w-xl" /> : null}
      </div>
      <div
        className={cn(
          "flex min-h-[min(13rem,30vh)] w-full items-center justify-center rounded-xl border border-border bg-card py-10 shadow-sm sm:min-h-[15rem] sm:py-12",
          variant === "ghost" && "bg-muted/20 dark:bg-muted/10"
        )}
      >
        <Button variant={variant} size={size} isLoading={isLoading} disabled={disabled} className={demoClass}>
          {variant === "link" ? "Link action" : "Button"}
        </Button>
      </div>
    </div>
  );
}
