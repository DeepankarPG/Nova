"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SettingsTextInput } from "@/components/settings/SettingsTextInput";

function normalizeHex(v: string) {
  const s = v.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{6}$/.test(s)) return `#${s.toUpperCase()}`;
  return null;
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const [hexInput, setHexInput] = useState(value.toUpperCase());

  useEffect(() => {
    setHexInput(value.toUpperCase());
  }, [value]);

  const onBlur = () => {
    const n = normalizeHex(hexInput);
    if (n) {
      onChange(n);
      setHexInput(n);
    } else {
      setHexInput(value.toUpperCase());
      toast.error("Enter a valid hex colour");
    }
  };

  return (
    <div className="flex flex-1 items-center gap-2.5">
      <span className="w-14 shrink-0 text-[12px] text-muted-foreground">{label}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-10 shrink-0 cursor-pointer rounded border border-border bg-card p-0.5"
        aria-label={`${label} colour`}
      />
      <SettingsTextInput
        value={hexInput}
        onChange={(e) => setHexInput(e.target.value)}
        onBlur={onBlur}
        className="h-8 max-w-[7rem] font-mono text-xs"
      />
    </div>
  );
}

export function InvoiceColorPicker({
  primaryColor,
  onPrimaryColorChange,
  accentColor,
  onAccentColorChange,
}: {
  primaryColor: string;
  onPrimaryColorChange: (hex: string) => void;
  accentColor: string;
  onAccentColorChange: (hex: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <ColorField label="Primary" value={primaryColor} onChange={onPrimaryColorChange} />
      <ColorField label="Accent" value={accentColor} onChange={onAccentColorChange} />
    </div>
  );
}
