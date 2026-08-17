"use client";

import { ImagePlus } from "lucide-react";
import type { InvoiceFormState } from "@/lib/invoice-form-types";

/** Circular logo badge used by layouts with a round-mark identity (Minimal Mono, Bold Sidebar). */
export function LogoBadge({
  form,
  onLogoClick,
  color,
  nameLine1,
  nameLine2,
}: {
  form: InvoiceFormState;
  onLogoClick?: () => void;
  color: string;
  nameLine1?: string;
  nameLine2?: string;
}) {
  const content = (
    <div className="flex items-center gap-3">
      {form.logoUrl ? (
        <img src={form.logoUrl} alt="Logo" className="h-11 w-11 shrink-0 rounded-full object-cover" />
      ) : (
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: color }}
        >
          <ImagePlus className="h-4 w-4" />
        </span>
      )}
      {(nameLine1 || nameLine2) && (
        <span className="leading-tight">
          <span className="block text-[15px] font-extrabold uppercase tracking-wide text-foreground">{nameLine1}</span>
          {nameLine2 && <span className="block text-[12px] italic text-muted-foreground">{nameLine2}</span>}
        </span>
      )}
    </div>
  );

  return onLogoClick ? (
    <button type="button" onClick={onLogoClick} className="text-left transition-opacity hover:opacity-80">
      {content}
    </button>
  ) : (
    content
  );
}
