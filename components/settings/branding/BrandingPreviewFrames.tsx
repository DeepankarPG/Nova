"use client";

import { cn } from "@/lib/utils";

export function BrandingMobileFrame({
  children,
  className,
  /** Overrides fixed screen height (default ~560px / 72svh). Use for taller preview shells. */
  screenClassName,
  /** When false, children fill the screen and manage their own inner scroll (e.g. chat + fixed composer). Default wraps children in a scroll region. */
  scrollBody = true,
}: {
  children: React.ReactNode;
  className?: string;
  screenClassName?: string;
  scrollBody?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[min(100%,340px)] rounded-[2.75rem] border-[12px] border-zinc-800 bg-zinc-800 shadow-2xl dark:border-zinc-600",
        className
      )}
    >
      {/* Side buttons (decorative) */}
      <div className="pointer-events-none absolute -left-[2px] top-[22%] h-8 w-[3px] rounded-l-sm bg-zinc-600" aria-hidden />
      <div className="pointer-events-none absolute -left-[2px] top-[32%] h-12 w-[3px] rounded-l-sm bg-zinc-600" aria-hidden />
      <div className="pointer-events-none absolute -right-[2px] top-[28%] h-16 w-[3px] rounded-r-sm bg-zinc-600" aria-hidden />

      {/*
        Single clipped screen stack: avoids subpixel gaps / black wedges at bottom corners.
        Do not put separate border-radius on the scroll region — parent overflow-hidden + rounded-[2.1rem] clips everything.
      */}
      {/*
        Taller viewport reads more like a phone (less “square”); scroll inside if content grows.
      */}
      {/*
        Fixed viewport height (not min-height): content scrolls inside so the device shell
        does not grow when the thread gets longer — matches a real phone bezel size.
      */}
      <div
        className={cn(
          "relative flex h-[min(560px,72svh)] max-h-[88svh] flex-col overflow-hidden rounded-[2.1rem] bg-white",
          screenClassName
        )}
      >
        {scrollBody ? (
          <div className="min-h-0 w-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-white [scrollbar-gutter:stable]">
            <div className="flex min-h-full w-full min-w-0 flex-col">{children}</div>
          </div>
        ) : (
          <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-white">{children}</div>
        )}
        <div className="flex shrink-0 justify-center bg-white px-2 pb-2 pt-1.5">
          <div className="h-1 w-24 rounded-full bg-zinc-300/90" aria-hidden />
        </div>
      </div>
    </div>
  );
}

export function BrandingDesktopFrame({
  children,
  className,
  addressBar = "https://pay.payglocal.in/checkout/mock",
  contentClassName,
  /** Full-width page area (no grey side gutters); fixed viewport height so inner chat layouts can use h-full. */
  fullBleedContent = false,
  bodyClassName,
}: {
  children: React.ReactNode;
  className?: string;
  /** URL shown in the mock browser bar */
  addressBar?: string;
  /** Width constraint for centered content (default: checkout-sized column); ignored when fullBleedContent */
  contentClassName?: string;
  fullBleedContent?: boolean;
  bodyClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-md ring-1 ring-black/5 dark:ring-white/10",
        fullBleedContent ? "max-w-full" : "max-w-2xl",
        className
      )}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/80 px-3 py-2 dark:bg-zinc-900/80">
        <div className="flex gap-1.5 pl-1">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="min-w-0 flex-1 rounded-md border border-border bg-background/90 px-2.5 py-1 text-[11px] text-muted-foreground">
          <span className="truncate font-mono">{addressBar}</span>
        </div>
      </div>
      <div
        className={cn(
          "min-h-0 bg-[#f3f4f6] dark:bg-zinc-950/50",
          fullBleedContent
            ? "h-[min(760px,78vh)] max-h-[min(900px,88vh)] min-h-[min(520px,52vh)] overflow-hidden p-0"
            : "max-h-[min(640px,70vh)] overflow-y-auto p-3 sm:p-4",
          bodyClassName
        )}
      >
        <div
          className={cn(
            "w-full",
            fullBleedContent
              ? "flex h-full min-h-0 min-w-0 flex-col"
              : "mx-auto",
            fullBleedContent ? (contentClassName ?? "max-w-none") : (contentClassName ?? "max-w-md")
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
