"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, ChevronDown, IndianRupee, Type } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { currencyFlagIso2, currencyFlags, currencyOptions } from "@/lib/mock-data/invoice-create";
import type { AmountType } from "@/lib/payment-page-form-types";

function CurrencyFlag({ currency, size = 16 }: { currency: string; size?: number }) {
  const iso2 = currencyFlagIso2[currency];
  if (!iso2) {
    return (
      <span
        className="flex items-center justify-center rounded-full bg-muted shrink-0"
        style={{ width: size, height: size, fontSize: size * 0.6 }}
      >
        {currencyFlags[currency] ?? "🏳️"}
      </span>
    );
  }
  return (
    <span className="relative block shrink-0 overflow-hidden rounded-full ring-1 ring-black/5" style={{ width: size, height: size }}>
      <Image src={`https://flagcdn.com/w80/${iso2}.png`} alt="" fill sizes={`${size}px`} className="object-cover" />
    </span>
  );
}

function CurrencyDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-full shrink-0 items-center gap-1 border-r border-border px-3 text-[13px] font-medium text-foreground hover:bg-muted/40"
        >
          <CurrencyFlag currency={value} />
          {value}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-40 p-1.5">
        {currencyOptions.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              onChange(c);
              setOpen(false);
            }}
            className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-[13px] hover:bg-muted/60"
          >
            <span className="flex items-center gap-2">
              <CurrencyFlag currency={c} />
              {c}
            </span>
            {c === value && <Check className="h-3.5 w-3.5 text-primary" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

/** Shared "Amount" row (type dropdown + currency/price field) used by both payment pages and payment buttons. */
export function AmountFieldsRow({
  amountType,
  onAmountTypeChange,
  fixedAmount,
  onFixedAmountChange,
  currency,
  onCurrencyChange,
}: {
  amountType: AmountType;
  onAmountTypeChange: (v: AmountType) => void;
  fixedAmount: string;
  onFixedAmountChange: (v: string) => void;
  currency: string;
  onCurrencyChange: (v: string) => void;
}) {
  return (
    <div className="mb-4 flex items-end gap-3">
      <div className="w-[48%] shrink-0">
        <span className="mb-1.5 block text-[13px] font-medium text-foreground">Amount</span>
        <Select value={amountType} onValueChange={(v) => onAmountTypeChange(v as AmountType)}>
          <SelectTrigger className="h-10 w-full text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed" className="text-[13px]">
              <span className="flex items-center gap-2">
                <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                Fixed Amount
              </span>
            </SelectItem>
            <SelectItem value="customer_decides" className="text-[13px]">
              <span className="flex items-center gap-2">
                <Type className="h-3.5 w-3.5 text-muted-foreground" />
                Customer Decides
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {amountType === "fixed" ? (
        <div className="min-w-0 flex-1">
          <label className="mb-1.5 block text-[12px] font-medium text-foreground">Item price</label>
          <div className="flex h-10 items-center rounded-lg border border-border bg-card shadow-sm">
            <CurrencyDropdown value={currency} onChange={onCurrencyChange} />
            <input
              value={fixedAmount}
              onChange={(e) => onFixedAmountChange(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0.00"
              inputMode="decimal"
              className="h-full w-full min-w-0 bg-transparent px-3 text-[14px] text-foreground focus:outline-none"
            />
          </div>
        </div>
      ) : (
        <div className="min-w-0 flex-1">
          <label className="mb-1.5 block text-[12px] font-medium text-foreground">Item price</label>
          <div className="flex h-10 cursor-not-allowed items-center rounded-lg border border-border bg-muted/40 opacity-60">
            <span className="flex h-full shrink-0 items-center gap-1 border-r border-border px-3 text-[13px] font-medium text-muted-foreground">
              <CurrencyFlag currency={currency} />
              {currency}
            </span>
            <input
              value=""
              disabled
              readOnly
              placeholder="To be filled by customer"
              className="h-full w-full min-w-0 cursor-not-allowed bg-transparent px-3 text-[13px] text-muted-foreground placeholder:text-muted-foreground/70 focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/** Standalone optional amount input (currency + value, no fixed/customer-decides toggle). */
export function OptionalAmountInput({
  amount,
  onAmountChange,
  currency,
  onCurrencyChange,
}: {
  amount: string;
  onAmountChange: (v: string) => void;
  currency: string;
  onCurrencyChange: (v: string) => void;
}) {
  return (
    <div className="flex h-10 items-center rounded-lg border border-border bg-card shadow-sm">
      <CurrencyDropdown value={currency} onChange={onCurrencyChange} />
      <input
        value={amount}
        onChange={(e) => onAmountChange(e.target.value.replace(/[^0-9.]/g, ""))}
        placeholder="0.00"
        inputMode="decimal"
        className="h-full w-full min-w-0 bg-transparent px-3 text-[14px] text-foreground focus:outline-none"
      />
    </div>
  );
}
