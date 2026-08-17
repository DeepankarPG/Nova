"use client";

import { Info, MousePointerClick } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OptionalAmountInput } from "@/components/payment-pages/AmountAndFieldsSection";
import { buttonTypeOptions, type ButtonTypeId } from "@/lib/payment-button-form-types";

export function ButtonDetailsSection({
  title,
  onTitleChange,
  buttonType,
  onButtonTypeChange,
  buttonLabel,
  onButtonLabelChange,
  fixedAmount,
  onFixedAmountChange,
  currency,
  onCurrencyChange,
}: {
  title: string;
  onTitleChange: (v: string) => void;
  buttonType: ButtonTypeId;
  onButtonTypeChange: (v: ButtonTypeId) => void;
  buttonLabel: string;
  onButtonLabelChange: (v: string) => void;
  fixedAmount: string;
  onFixedAmountChange: (v: string) => void;
  currency: string;
  onCurrencyChange: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MousePointerClick className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-foreground">Button Details</h2>
          <p className="text-[12.5px] text-muted-foreground">Customers will see this button to initiate a transaction</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-foreground">
            Title <span className="text-destructive">*</span>
          </label>
          <Input value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="Website-1" className="h-10 text-[13px]" />
          <p className="mt-1.5 text-[11.5px] text-muted-foreground">For dashboard use, not visible to customers</p>
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-foreground">Button Type</label>
          <Select value={buttonType} onValueChange={(v) => onButtonTypeChange(v as ButtonTypeId)}>
            <SelectTrigger className="h-10 w-full text-[13px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {buttonTypeOptions.map((opt) => (
                <SelectItem key={opt.id} value={opt.id} className="text-[13px]">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-foreground">
            Button Label <span className="text-destructive">*</span>
          </label>
          <Input
            value={buttonLabel}
            onChange={(e) => onButtonLabelChange(e.target.value)}
            placeholder="Pay Now"
            className="h-10 text-[13px]"
          />
          <p className="mt-1.5 text-[11.5px] text-muted-foreground">This label is shown to your customers</p>
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-foreground">Amount (optional)</label>
          <OptionalAmountInput
            amount={fixedAmount}
            onAmountChange={onFixedAmountChange}
            currency={currency}
            onCurrencyChange={onCurrencyChange}
          />
          <p className="mt-1.5 flex items-start gap-1.5 text-[11.5px] text-muted-foreground">
            <Info className="mt-0.5 h-3 w-3 shrink-0" />
            <span>
              <span className="font-medium text-foreground">Note:</span> Leave blank to let customers enter the amount.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
