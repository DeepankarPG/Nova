"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useWheelScrollFix } from "./useWheelScrollFix";

export function GroupColumnPicker({
  group,
  columns,
  selectedColumns,
  onToggle,
}: {
  group: string;
  columns: string[];
  selectedColumns: string[];
  onToggle: (column: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const scrollRef = useWheelScrollFix<HTMLDivElement>();
  const selectedSet = new Set(selectedColumns);

  return (
    <div>
      <label className="mb-1.5 block text-[12.5px] font-medium text-foreground">{group}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-left shadow-sm transition-colors",
              "hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
            )}
          >
            {selectedColumns.length === 0 ? (
              <span className="py-0.5 text-[13px] text-muted-foreground">Select columns for {group}</span>
            ) : (
              selectedColumns.map((col) => (
                <span
                  key={col}
                  className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[12px] font-medium text-foreground"
                >
                  {col}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(col);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggle(col);
                      }
                    }}
                    className="rounded-full p-0.5 hover:bg-border/60"
                    aria-label={`Remove ${col}`}
                  >
                    <X className="h-3 w-3" />
                  </span>
                </span>
              ))
            )}
            <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          ref={scrollRef}
          align="start"
          className="w-[16rem] overflow-y-auto p-1.5"
          style={{ maxHeight: "min(18rem, var(--radix-popover-content-available-height, 18rem))" }}
        >
          {columns.map((col) => {
            const checked = selectedSet.has(col);
            return (
              <label
                key={col}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-foreground hover:bg-muted/60 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(col)}
                  className="h-3.5 w-3.5 rounded border-border accent-primary"
                />
                <span className="truncate">{col}</span>
              </label>
            );
          })}
        </PopoverContent>
      </Popover>
    </div>
  );
}
