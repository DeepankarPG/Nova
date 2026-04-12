"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "./utils";

const CURRENCIES = ["USD", "INR", "EUR", "GBP", "SGD", "AED", "JPY"];

interface CurrencyAmountInputProps {
  currency: string;
  amount: string;
  onCurrencyChange: (currency: string) => void;
  onAmountChange: (amount: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  currencies?: string[];
  id?: string;
}

export function CurrencyAmountInput({
  currency,
  amount,
  onCurrencyChange,
  onAmountChange,
  placeholder = "0.00",
  disabled = false,
  required = false,
  currencies = CURRENCIES,
  id,
}: CurrencyAmountInputProps) {
  return (
    <div className="flex h-12 min-h-12 items-stretch overflow-hidden rounded-xl border border-border bg-card text-[15px] transition-all focus-within:border-muted-foreground/50 focus-within:ring-2 focus-within:ring-ring/20">
      <div className="relative flex min-w-[5.25rem] shrink-0 items-center border-r border-border bg-muted/25 px-3">
        <select
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          disabled={disabled}
          aria-label="Currency"
          className={cn(
            "h-full min-h-0 w-full min-w-0 cursor-pointer bg-transparent py-2 pl-1 pr-9 text-[15px] font-semibold text-foreground",
            "focus:outline-none disabled:opacity-50",
            "appearance-none [-webkit-appearance:none] [-moz-appearance:none]",
            "[&::-ms-expand]:hidden"
          )}
        >
          {currencies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground opacity-80"
          aria-hidden
        />
      </div>

      <input
        id={id}
        type="number"
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        min="0"
        step="0.01"
        className="min-h-0 min-w-0 flex-1 bg-transparent px-4 py-3 text-[15px] tabular-nums text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
      />
    </div>
  );
}
