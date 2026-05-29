"use client";

import { cn } from "@/lib/utils";

/** Inner glass top radius — keep in sync with inner screen `rounded-3xl` below */
const MOBILE_GLASS_TOP = "rounded-t-3xl";

function MobileStatusBar() {
  return (
    <div
      className={cn(
        "relative flex h-12 shrink-0 items-end justify-center bg-zinc-950 pb-2.5 pt-1.5 text-white",
        MOBILE_GLASS_TOP
      )}
      aria-hidden
    >
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-semibold tabular-nums tracking-tight">
        9:41
      </span>
      <div className="h-[26px] w-[92px] rounded-full bg-black shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-white/[0.08]" />
      <div className="absolute right-3.5 top-1/2 flex -translate-y-1/2 items-center gap-1.5 opacity-[0.92]">
        <svg width="17" height="11" viewBox="0 0 17 11" fill="none" className="shrink-0" aria-hidden>
          <path
            d="M1 7.5h2v2H1v-2zm3.5-1h2v3h-2v-3zm3.5-2h2v5h-2V4.5zm3.5-2h2v7h-2v-7zm3.5 2h2v5h-2v-5z"
            fill="currentColor"
          />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none" className="shrink-0" aria-hidden>
          <rect x="1" y="2" width="21" height="8" rx="2" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1" />
          <rect x="22.5" y="4.5" width="1.5" height="3" rx="0.5" fill="currentColor" fillOpacity="0.45" />
          <rect x="2.5" y="3.5" width="16" height="5" rx="1" fill="currentColor" fillOpacity="0.9" />
        </svg>
      </div>
    </div>
  );
}

export function BrandingMobileFrame({
  children,
  className,
  /** Overrides fixed screen height (default portrait checkout ~640px / 80svh). */
  screenClassName,
  /** When false, children fill the screen and manage their own inner scroll (e.g. chat + fixed composer). Default wraps children in a scroll region. */
  scrollBody = true,
  /** Dark status row + island (off for email-in-phone layouts that bring their own top chrome). */
  showDeviceStatusBar = true,
}: {
  children: React.ReactNode;
  className?: string;
  screenClassName?: string;
  scrollBody?: boolean;
  showDeviceStatusBar?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[min(100%,384px)] rounded-[2.125rem] border-0",
        "shadow-[0_0_0_2px_#d4d4d8,0_24px_48px_-12px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(0,0,0,0.05)]",
        "dark:shadow-[0_0_0_2px_#52525b,0_28px_56px_-14px_rgba(0,0,0,0.62),inset_0_1px_0_rgba(255,255,255,0.06)]",
        className
      )}
      style={{
        padding: "10px",
        backgroundColor: "rgb(24 24 27)",
        boxSizing: "border-box",
      }}
    >
      {/* Side buttons (decorative) */}
      <div
        className="pointer-events-none absolute left-0 top-[28%] h-7 w-[2px] rounded-l-full bg-zinc-500/80"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-0 top-[38%] h-10 w-[2px] rounded-l-full bg-zinc-500/80"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 top-[34%] h-12 w-[2px] rounded-r-full bg-zinc-500/80"
        aria-hidden
      />

      {/*
        Portrait viewport + inner scroll: checkout is as tall as it needs; only this region scrolls.
      */}
      <div
        className={cn(
          "relative flex h-[min(720px,82svh)] max-h-[90svh] w-full min-w-0 flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-black/[0.05] dark:ring-white/[0.08]",
          screenClassName
        )}
      >
        {showDeviceStatusBar ? <MobileStatusBar /> : null}
        {scrollBody ? (
          <div className="min-h-0 w-full min-w-0 flex-1 touch-pan-y overflow-y-auto overflow-x-hidden overscroll-y-contain bg-white [-webkit-overflow-scrolling:touch]">
            <div className="w-full min-w-0">{children}</div>
          </div>
        ) : (
          <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-white">{children}</div>
        )}
        <div className="flex shrink-0 justify-center rounded-b-3xl bg-white px-2 pb-2.5 pt-1.5">
          <div className="h-[5px] w-[104px] rounded-full bg-zinc-900/35 dark:bg-zinc-500/70" aria-hidden />
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
  /** When false, page chrome does not scroll — use with a scaled/fit inner preview. */
  scrollableContent = true,
}: {
  children: React.ReactNode;
  className?: string;
  /** URL shown in the mock browser bar */
  addressBar?: string;
  /** Width constraint for centered content (default: checkout-sized column); ignored when fullBleedContent */
  contentClassName?: string;
  fullBleedContent?: boolean;
  bodyClassName?: string;
  scrollableContent?: boolean;
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
            : cn(
                "flex min-h-[min(420px,48vh)] max-h-[min(620px,68vh)] flex-col p-2 sm:p-3",
                scrollableContent ? "overflow-y-auto" : "overflow-hidden"
              ),
          bodyClassName
        )}
      >
        <div
          className={cn(
            "w-full",
            fullBleedContent
              ? "flex h-full min-h-0 min-w-0 flex-col"
              : cn(
                  "mx-auto min-h-0 min-w-0",
                  scrollableContent ? "" : "flex min-h-0 flex-1 flex-col"
                ),
            fullBleedContent ? (contentClassName ?? "max-w-none") : (contentClassName ?? "max-w-md")
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
