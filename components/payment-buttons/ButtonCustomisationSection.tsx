"use client";

import { useState } from "react";
import { ChevronDown, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsTextInput } from "@/components/settings/SettingsTextInput";
import {
  buttonCornerRadiusOptions,
  buttonSizeOptions,
  buttonThemeOptions,
  type ButtonCornerRadius,
  type ButtonSize,
  type ButtonThemeId,
} from "@/lib/payment-button-form-types";

function normalizeHex(v: string) {
  const s = v.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{6}$/.test(s)) return `#${s.toUpperCase()}`;
  return null;
}

export function ButtonCustomisationSection({
  theme,
  onThemeChange,
  brandColor,
  onBrandColorChange,
  cornerRadius,
  onCornerRadiusChange,
  size,
  onSizeChange,
}: {
  theme: ButtonThemeId;
  onThemeChange: (v: ButtonThemeId) => void;
  brandColor: string;
  onBrandColorChange: (v: string) => void;
  cornerRadius: ButtonCornerRadius;
  onCornerRadiusChange: (v: ButtonCornerRadius) => void;
  size: ButtonSize;
  onSizeChange: (v: ButtonSize) => void;
}) {
  const [hexInput, setHexInput] = useState(brandColor);
  const [open, setOpen] = useState(false);

  const commitHex = () => {
    const normalized = normalizeHex(hexInput);
    if (normalized) {
      onBrandColorChange(normalized);
      setHexInput(normalized);
    } else {
      setHexInput(brandColor);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 px-5 py-4 text-left hover:bg-muted/30"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Palette className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <h2 className="text-[15px] font-semibold text-foreground">Customisation</h2>
          <p className="text-[12.5px] text-muted-foreground">Fine-tune how the button looks</p>
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="space-y-5 border-t border-border px-5 py-4">
          <div>
            <p className="mb-2 text-[13px] font-medium text-foreground">Theme</p>
            <div className="inline-flex flex-wrap rounded-lg border border-border bg-muted/40 p-0.5" role="group" aria-label="Button theme">
              {buttonThemeOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onThemeChange(opt.id)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                    theme === opt.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-medium text-foreground">Colour</p>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={brandColor}
                onChange={(e) => {
                  onBrandColorChange(e.target.value);
                  setHexInput(e.target.value);
                }}
                className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-border bg-card p-0.5"
                aria-label="Button colour"
              />
              <SettingsTextInput
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                onBlur={commitHex}
                className="max-w-[7rem] font-mono text-[12.5px]"
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-medium text-foreground">Corner radius</p>
            <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5" role="group" aria-label="Button corner radius">
              {buttonCornerRadiusOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onCornerRadiusChange(opt.id)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                    cornerRadius === opt.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-medium text-foreground">Size</p>
            <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5" role="group" aria-label="Button size">
              {buttonSizeOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSizeChange(opt.id)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                    size === opt.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
