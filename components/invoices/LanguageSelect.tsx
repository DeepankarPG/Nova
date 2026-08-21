"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Languages, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { languageOptions } from "@/lib/mock-data/invoice-create";

export function LanguageSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => languageOptions.filter((l) => l.toLowerCase().includes(query.trim().toLowerCase())),
    [query]
  );

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3.5 py-2.5 text-left hover:border-primary/50"
        >
          <span className="flex items-center gap-2 text-[13.5px] font-medium text-foreground">
            <Languages className="h-4 w-4 text-muted-foreground" />
            {value}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[16rem] p-0">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search language"
            className="w-full bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-1.5">
          {filtered.length === 0 && (
            <p className="px-2.5 py-3 text-center text-[12.5px] text-muted-foreground">No language found</p>
          )}
          {filtered.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => {
                onChange(lang);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-[13px] hover:bg-muted/60"
            >
              {lang}
              {lang === value && <Check className="h-3.5 w-3.5 text-primary" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
