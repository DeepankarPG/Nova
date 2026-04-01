"use client";

import { ChevronsUpDown } from "lucide-react";

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
    <div className="flex items-center h-10 rounded-xl border border-border bg-card overflow-hidden transition-all focus-within:border-muted-foreground/50 focus-within:ring-2 focus-within:ring-ring/20">
      <div className="relative flex items-center gap-1 pl-3 pr-3 border-r border-border flex-shrink-0 h-full bg-muted/40">
        <select
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          disabled={disabled}
          aria-label="Currency"
          className="appearance-none text-[13px] font-semibold text-foreground bg-transparent focus:outline-none cursor-pointer pr-4 h-full"
        >
          {currencies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <ChevronsUpDown className="absolute right-2 pointer-events-none w-3 h-3 text-muted-foreground" />
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
        className="flex-1 h-full px-3 text-[13px] text-foreground placeholder:text-muted-foreground bg-transparent focus:outline-none disabled:opacity-50"
      />
    </div>
  );
}
