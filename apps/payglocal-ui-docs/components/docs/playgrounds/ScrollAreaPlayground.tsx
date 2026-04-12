"use client";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { ScrollArea, ScrollBar } from "@payglocal/ui";

export function ScrollAreaPlayground() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6 md:flex-row">
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-sm font-medium text-foreground">Vertical (default ScrollArea)</p>
        <ScrollArea className="h-48 rounded-xl border border-border shadow-sm">
          <div className="space-y-2 p-3">
            {Array.from({ length: 16 }, (_, i) => (
              <p key={i} className="text-sm text-muted-foreground">
                Row {i + 1} — scroll inside the panel
              </p>
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-sm font-medium text-foreground">Horizontal (ScrollBar orientation)</p>
        <ScrollAreaPrimitive.Root className="relative h-24 overflow-hidden rounded-xl border border-border shadow-sm">
          <ScrollAreaPrimitive.Viewport className="size-full">
            <div className="flex w-[120%] gap-3 p-3">
              {Array.from({ length: 8 }, (_, i) => (
                <div
                  key={i}
                  className="h-14 w-28 shrink-0 rounded-lg border border-border bg-muted/40 text-center text-sm leading-[3.5rem] text-muted-foreground"
                >
                  Chip {i + 1}
                </div>
              ))}
            </div>
          </ScrollAreaPrimitive.Viewport>
          <ScrollBar orientation="horizontal" />
          <ScrollAreaPrimitive.Corner />
        </ScrollAreaPrimitive.Root>
      </div>
    </div>
  );
}
