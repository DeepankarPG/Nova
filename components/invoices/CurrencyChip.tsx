"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { currencyFlagIso2, currencyFlags, currencyOptions } from "@/lib/mock-data/invoice-create";

function CurrencyFlagCircle({ currency, size = 20 }: { currency: string; size?: number }) {
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
    <span
      className="relative block overflow-hidden rounded-full shrink-0 ring-1 ring-black/5"
      style={{ width: size, height: size }}
    >
      <Image
        src={`https://flagcdn.com/w80/${iso2}.png`}
        alt={`${currency} flag`}
        fill
        sizes={`${size}px`}
        className="object-cover"
      />
    </span>
  );
}

export function CurrencyChip({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-[14px] font-medium text-foreground hover:border-primary/50"
        >
          <CurrencyFlagCircle currency={value} />
          {value}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-44 p-1.5">
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
              <CurrencyFlagCircle currency={c} />
              {c}
            </span>
            {c === value && <Check className="h-3.5 w-3.5 text-primary" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
