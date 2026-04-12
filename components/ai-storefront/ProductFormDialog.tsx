"use client";

import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyAmountInput } from "@/components/shared/CurrencyAmountInput";
import type { StorefrontProduct } from "@/lib/ai-storefront/types";

export type ProductFormValues = Omit<StorefrontProduct, "id" | "updatedAt">;

function rupeesFromPaise(paise: number): string {
  return (paise / 100).toFixed(2);
}

function paiseFromRupeesStr(s: string): number {
  const n = Number.parseFloat(s);
  if (Number.isNaN(n) || n < 0) return 0;
  return Math.round(n * 100);
}

const emptyValues: ProductFormValues = {
  sku: "",
  name: "",
  description: "",
  priceInPaise: 0,
  currency: "INR",
  imageUrl: null,
  inventoryLabel: "In stock (synced)",
};

export function ProductFormDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: StorefrontProduct | null;
  onSubmit: (values: ProductFormValues) => void | Promise<void>;
  submitting?: boolean;
}) {
  const [values, setValues] = useState<ProductFormValues>(emptyValues);
  const [amountStr, setAmountStr] = useState("0.00");

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setValues({
        sku: initial.sku,
        name: initial.name,
        description: initial.description,
        priceInPaise: initial.priceInPaise,
        currency: initial.currency,
        imageUrl: initial.imageUrl,
        inventoryLabel: initial.inventoryLabel,
      });
      setAmountStr(rupeesFromPaise(initial.priceInPaise));
    } else {
      setValues(emptyValues);
      setAmountStr("0.00");
    }
  }, [open, initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceInPaise = paiseFromRupeesStr(amountStr);
    void onSubmit({ ...values, priceInPaise });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-lg">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 px-5 pb-4 pt-4 pr-12">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Package className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0">
            <DialogTitle className="text-sm font-semibold leading-snug tracking-tight">
              {initial ? "Edit product" : "Add product"}
            </DialogTitle>
            <DialogDescription className="mt-1 text-[13px] leading-snug">
              SKU, pricing, and copy are served to AI shopping tools after you publish.
            </DialogDescription>
          </div>
        </div>

        {/* ── Divider ──────────────────────────────────────────────────── */}
        <div className="h-px bg-border" />

        {/* ── Form body ────────────────────────────────────────────────── */}
        <form
          id="product-form"
          onSubmit={handleSubmit}
          className="max-h-[min(70vh,560px)] space-y-4 overflow-y-auto px-5 py-4"
        >
          <Field>
            <FieldLabel htmlFor="pf-sku">SKU</FieldLabel>
            <Input
              id="pf-sku"
              required
              value={values.sku}
              onChange={(e) => setValues((v) => ({ ...v, sku: e.target.value }))}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="pf-name">Name</FieldLabel>
            <Input
              id="pf-name"
              required
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="pf-desc">Description</FieldLabel>
            <Textarea
              id="pf-desc"
              rows={3}
              value={values.description}
              onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
            />
          </Field>
          <Field>
            <FieldLabel>Price</FieldLabel>
            <CurrencyAmountInput
              currency={values.currency}
              amount={amountStr}
              onCurrencyChange={(c) => setValues((v) => ({ ...v, currency: c }))}
              onAmountChange={setAmountStr}
              currencies={["INR", "USD", "EUR", "GBP"]}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="pf-inv">Inventory label</FieldLabel>
            <Input
              id="pf-inv"
              value={values.inventoryLabel}
              onChange={(e) => setValues((v) => ({ ...v, inventoryLabel: e.target.value }))}
              placeholder="Shown in dashboard; verified at checkout"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="pf-img">Image URL (optional)</FieldLabel>
            <Input
              id="pf-img"
              value={values.imageUrl ?? ""}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  imageUrl: e.target.value.trim() === "" ? null : e.target.value,
                }))
              }
              placeholder="https://"
            />
          </Field>
        </form>

        {/* ── Divider ──────────────────────────────────────────────────── */}
        <div className="h-px bg-border" />

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button form="product-form" type="submit" variant="primary" size="sm" disabled={submitting} isLoading={submitting}>
            {submitting ? "Saving…" : initial ? "Save changes" : "Create product"}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
