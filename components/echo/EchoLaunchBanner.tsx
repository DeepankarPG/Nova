"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEchoPanel } from "@/components/echo/EchoPanelContext";
import { cn } from "@/lib/utils";

/**
 * Echo launch announcement. Shown after a short delay on each full page load.
 * Dismiss ("Not now", overlay, Esc, or "Try it now") hides it until the user refreshes
 * or opens a new tab — no localStorage, so refresh always gives another chance to see it.
 */
export function EchoLaunchBanner() {
  const [open, setOpen] = useState(false);
  const [suppressed, setSuppressed] = useState(false);
  const { setOpen: setEchoOpen } = useEchoPanel();

  useEffect(() => {
    if (suppressed) return;
    const t = window.setTimeout(() => setOpen(true), 400);
    return () => window.clearTimeout(t);
  }, [suppressed]);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setSuppressed(true);
  }, []);

  const dismiss = useCallback(() => {
    setSuppressed(true);
    setOpen(false);
  }, []);

  const onTryNow = useCallback(() => {
    dismiss();
    queueMicrotask(() => setEchoOpen(true));
  }, [dismiss, setEchoOpen]);

  const onNotNow = dismiss;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showClose={false}
        className={cn(
          "left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 gap-0 p-0",
          "!overflow-hidden",
          "w-[calc(100%-2rem)] max-w-[min(100%,60rem)]",
          "max-h-[min(92dvh,48rem)]"
        )}
      >
        <div className="relative">
          <button
            type="button"
            onClick={onNotNow}
            className={cn(
              "absolute right-3 top-3 z-30 inline-flex h-9 w-9 items-center justify-center rounded-xl",
              "border border-border/90 bg-card text-foreground shadow-md",
              "ring-1 ring-black/5 dark:ring-white/10",
              "transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            )}
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={2.25} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(22rem,1.12fr)] md:items-stretch">
            <div
              className={cn(
                "flex min-w-0 flex-col justify-between gap-4 overflow-visible",
                "bg-card px-6 pb-5 pt-6 md:border-r md:border-border/60 md:px-8 md:pb-6 md:pr-7 md:pt-7"
              )}
            >
              <div className="min-w-0 pr-11 md:pr-2">
                <span
                  className={cn(
                    "inline-flex max-w-full flex-wrap items-center gap-x-1 rounded-md bg-primary",
                    "px-2.5 py-1.5 text-left text-[11px] font-extrabold leading-tight text-primary-foreground",
                    "sm:text-xs"
                  )}
                >
                  Introducing{" "}
                  <span className="font-extrabold tracking-normal">ECHO</span>
                </span>

                <DialogTitle className="mt-3 text-left text-2xl font-extrabold leading-[1.15] tracking-tight text-foreground sm:text-3xl md:text-[2rem]">
                  Your payments just got smarter.
                </DialogTitle>

                <DialogDescription asChild>
                  <p className="mt-2.5 text-left text-[13px] leading-relaxed text-foreground sm:text-sm">
                    Echo is your assistant in the dashboard—for payment links,
                    disputes, settlements, reports, and getting to the right screen
                    without digging through menus.
                  </p>
                </DialogDescription>
              </div>

              <div className="flex shrink-0 flex-col-reverse gap-2.5 pt-1 sm:flex-row sm:justify-start">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="w-full sm:w-auto"
                  onClick={onNotNow}
                >
                  Not now
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto"
                  onClick={onTryNow}
                >
                  Try it now
                </Button>
              </div>
            </div>

            <div
              className={cn(
                "relative min-h-[13rem] w-full shrink-0 overflow-hidden border-t border-border/60",
                "bg-sky-200/90 dark:bg-sky-950/60",
                "md:h-full md:min-h-[24rem] md:border-l-0 md:border-t-0"
              )}
            >
              <Image
                src="/banner_echo.png"
                alt=""
                fill
                unoptimized
                className="object-cover object-center"
                sizes="(max-width: 767px) 100vw, 52vw"
                priority
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
