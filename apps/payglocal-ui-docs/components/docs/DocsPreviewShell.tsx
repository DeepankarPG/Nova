import { cn } from "@/lib/utils";
import type { PreviewChrome } from "@/lib/preview-layout";

type DocsPreviewShellProps = {
  children: React.ReactNode;
  /** `stretch` — tables, headers, charts. `center` — compact controls */
  layout?: "center" | "stretch";
  /** Product-like framing for the inner canvas */
  chrome?: PreviewChrome;
};

function chromeClass(chrome: PreviewChrome): string {
  switch (chrome) {
    case "minimal":
      return "rounded-xl border border-border bg-card shadow-sm";
    case "dashboard":
      return "rounded-xl border border-border bg-card p-5 shadow-sm md:p-7 dark:border-border";
    case "inset-card":
      return "rounded-xl border border-border bg-card p-6 shadow-sm dark:border-border";
    default:
      return chromeClass("dashboard");
  }
}

export function DocsPreviewShell({
  children,
  layout = "center",
  chrome = "dashboard",
}: DocsPreviewShellProps) {
  const isCenter = layout === "center";
  const innerChrome = chromeClass(chrome);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 shrink-0 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 shrink-0 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 shrink-0 rounded-full bg-[#28c840]" />
        </span>
        <span className="text-xs font-medium text-muted-foreground">Live preview</span>
      </div>
      <div className="bg-card p-4 sm:p-5">
        <div
          className={cn(
            innerChrome,
            isCenter
              ? "flex min-h-0 flex-col px-5 py-6 sm:px-7 sm:py-8"
              : "min-h-[min(280px,40vh)] px-4 py-6 sm:px-6 sm:py-8"
          )}
        >
          <div
            className={cn(
              "w-full min-w-0 text-[15px] leading-relaxed text-foreground antialiased",
              isCenter ? "mx-auto flex max-w-3xl flex-col items-stretch" : "mx-auto max-w-6xl"
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
