"use client";

import { useState } from "react";
import { Code2, Copy, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GetButtonCodeDialog } from "./GetButtonCodeDialog";
import { ButtonPreviewNode } from "./ButtonPreviewNode";
import { buildButtonEmbedCode, type PaymentButtonFormState } from "@/lib/payment-button-form-types";

function currencySymbol(currency: string) {
  return currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹";
}

/**
 * A static mock storefront checkout card - the button itself is the only part
 * that live-updates from the form, styled and labelled exactly as it will
 * appear to real customers.
 */
export function ButtonStorefrontPreview({ form, buttonId }: { form: PaymentButtonFormState; buttonId: string }) {
  const sym = currencySymbol(form.currency);
  const price = form.fixedAmount ? `${sym}${Number(form.fixedAmount).toLocaleString("en-IN")}` : null;
  const [codeDialogOpen, setCodeDialogOpen] = useState(false);

  const embedCode = buildButtonEmbedCode(form, buttonId);

  const copyCode = () => {
    navigator.clipboard.writeText(embedCode).catch(() => {});
    toast.success("Embed code copied");
  };

  return (
    <div>
      <div className="flex items-center justify-between px-1 pb-3">
        <div>
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Preview</h2>
          <p className="text-[11.5px] text-muted-foreground">How your button will look on a checkout page</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Code2 className="h-3.5 w-3.5" />} onClick={() => setCodeDialogOpen(true)}>
            Get code
          </Button>
          <Button variant="outline" size="sm" leftIcon={<Copy className="h-3.5 w-3.5" />} onClick={copyCode}>
            Copy code
          </Button>
        </div>
      </div>

      <div
        className="rounded-2xl border border-border bg-white px-6 pb-14 pt-6"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "16px 16px",
          color: "rgb(0 0 0 / 0.08)",
        }}
      >
        <div className="mx-auto max-w-[420px] overflow-hidden rounded-xl border border-border bg-card shadow-md">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
              A
            </span>
            <span className="text-[12.5px] font-semibold text-foreground">acme.com</span>
          </div>

          <div className="p-5">
            <div className="mb-4 flex h-40 items-center justify-center rounded-lg bg-muted/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/image.png" alt="Monstera deliciosa in a ceramic planter" className="h-full object-contain" />
            </div>

            <div className="flex items-center gap-2">
              <p className="text-[17px] font-bold leading-snug text-foreground">Monstera Deliciosa Planter</p>
              <span className="shrink-0 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-600">
                DEMO PRODUCT
              </span>
            </div>

            {price && (
              <div className="mt-2 flex items-center gap-3">
                <p className="text-[18px] font-bold text-foreground">{price}</p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-[11.5px] text-muted-foreground">(121)</span>
                </div>
              </div>
            )}

            <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">
              A statement Monstera deliciosa potted in a matte ceramic planter, bringing lush, low-maintenance greenery
              to any room.
            </p>

            {!price && (
              <p className="mt-2 text-[12px] text-muted-foreground">
                You&apos;ll be able to enter the amount to pay on the next page.
              </p>
            )}

            <div className="mt-5">
              <ButtonPreviewNode
                label={form.buttonLabel}
                buttonType={form.buttonType}
                theme={form.theme}
                brandColor={form.brandColor}
                cornerRadius={form.cornerRadius}
                size={form.size}
                fullWidth
              />
            </div>
          </div>
        </div>
      </div>

      <GetButtonCodeDialog open={codeDialogOpen} onOpenChange={setCodeDialogOpen} embedCode={embedCode} />
    </div>
  );
}
