"use client";

import { ChevronsUpDown } from "lucide-react";
import { useRef } from "react";

const CURRENCIES = ["USD", "INR", "EUR", "GBP", "SGD", "AED", "JPY"];

interface CurrencyAmountInputProps {
  currency:     string;
  amount:       string;
  onCurrencyChange: (currency: string) => void;
  onAmountChange:   (amount: string)   => void;
  placeholder?: string;
  disabled?:    boolean;
  required?:    boolean;
  currencies?:  string[];
  id?:          string;
}

export function CurrencyAmountInput({
  currency,
  amount,
  onCurrencyChange,
  onAmountChange,
  placeholder  = "0.00",
  disabled     = false,
  required     = false,
  currencies   = CURRENCIES,
  id,
}: CurrencyAmountInputProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  function handleFocus() {
    if (wrapperRef.current) {
      wrapperRef.current.style.borderColor = "#6b7280";
      wrapperRef.current.style.boxShadow   = "0 0 0 2px rgba(75,85,99,0.10)";
    }
  }

  function handleBlur() {
    if (wrapperRef.current) {
      wrapperRef.current.style.borderColor = "#e5e7eb";
      wrapperRef.current.style.boxShadow   = "none";
    }
  }

  return (
    <div
      ref={wrapperRef}
      className="flex items-center h-10 rounded-xl border border-gray-200 bg-white overflow-hidden transition-all"
    >
      {/* ── Currency selector ── */}
      <div className="relative flex items-center gap-1 pl-3 pr-3 border-r border-gray-100 flex-shrink-0 h-full bg-gray-50/60">
        <select
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          aria-label="Currency"
          className="appearance-none text-[13px] font-semibold text-gray-700 bg-transparent focus:outline-none cursor-pointer pr-4 h-full"
        >
          {currencies.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <ChevronsUpDown className="absolute right-2 pointer-events-none w-3 h-3 text-gray-300" />
      </div>

      {/* ── Amount input ── */}
      <input
        id={id}
        type="number"
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        min="0"
        step="0.01"
        className="flex-1 h-full px-3 text-[13px] text-gray-800 placeholder:text-gray-400 bg-transparent focus:outline-none disabled:opacity-50"
      />
    </div>
  );
}
