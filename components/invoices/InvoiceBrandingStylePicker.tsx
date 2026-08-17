"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { invoiceBrandingStyles } from "@/lib/mock-data/invoice-create";
import type { InvoiceFormState } from "@/lib/invoice-form-types";
import { InvoiceDocumentPreview } from "./InvoiceDocumentPreview";

const THUMB_WIDTH = 860;
const THUMB_HEIGHT = 1080;

export function InvoiceBrandingStylePicker({
  form,
  brandingStyleId,
  onChange,
}: {
  form: InvoiceFormState;
  brandingStyleId: string;
  onChange: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-1 snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {invoiceBrandingStyles.map((s) => {
          const isSelected = s.id === brandingStyleId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onChange(s.id)}
              className={cn(
                "group shrink-0 snap-start rounded-xl border p-2.5 text-left transition-colors",
                isSelected ? "border-primary bg-primary/[0.04] shadow-sm" : "border-border bg-card hover:border-primary/40"
              )}
              style={{ width: 168 }}
            >
              <div className="mb-2.5 flex items-center gap-1.5 px-0.5">
                <span className="text-[12.5px] font-semibold text-foreground">{s.name}</span>
                {s.isNew && <span className="text-[10px] font-bold text-primary">New</span>}
              </div>

              <div
                className="overflow-hidden rounded-lg border border-border bg-background"
                style={{ height: 168, position: "relative" }}
              >
                <div
                  style={{
                    width: THUMB_WIDTH,
                    height: THUMB_HEIGHT,
                    transform: `scale(${168 / THUMB_WIDTH})`,
                    transformOrigin: "top left",
                  }}
                >
                  <InvoiceDocumentPreview
                    form={{ ...form, brandingStyleId: s.id }}
                    className="h-full w-full overflow-hidden bg-card"
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="Previous styles"
        className="absolute -left-3 top-[4.4rem] flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm hover:bg-muted"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="Next styles"
        className="absolute -right-3 top-[4.4rem] flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm hover:bg-muted"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
