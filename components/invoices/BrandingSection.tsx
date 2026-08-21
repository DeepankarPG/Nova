"use client";

import { useRef, useState } from "react";
import { ChevronDown, PenLine, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { InvoiceBrandingStylePicker } from "./InvoiceBrandingStylePicker";
import { InvoiceColorPicker } from "./InvoiceColorPicker";
import { LanguageSelect } from "./LanguageSelect";
import type { InvoiceFormState } from "@/lib/invoice-form-types";

function UploadRow({
  label,
  hint,
  icon: Icon,
  enabled,
  onEnabledChange,
  url,
  onUpload,
  onRemove,
}: {
  label: string;
  hint: string;
  icon: React.ElementType;
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  url: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="border-b border-border last:border-b-0">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-[13px] font-semibold text-foreground">{label}</p>
          <p className="text-[11px] text-muted-foreground">{hint}</p>
        </div>
        <Switch checked={enabled} onCheckedChange={onEnabledChange} aria-label={`Toggle ${label.toLowerCase()}`} />
      </div>

      {enabled &&
        (url ? (
          <div className="group/preview relative mx-4 mb-3 flex h-20 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/30">
            <img src={url} alt={label} className="pointer-events-none max-h-full max-w-full object-contain" />
            <button
              type="button"
              onClick={onRemove}
              className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card/90 text-muted-foreground opacity-0 shadow-sm transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover/preview:opacity-100"
              aria-label={`Remove ${label.toLowerCase()}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <>
            <input
              ref={inputRef}
              type="file"
              accept=".png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file);
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mx-4 mb-3 flex h-20 w-[calc(100%-2rem)] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-muted/20 transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              <Icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-[13px] font-medium text-foreground">Click to upload {label.toLowerCase()}</span>
              <span className="text-[11px] text-muted-foreground">.png, .jpg - max 10MB</span>
            </button>
          </>
        ))}
    </div>
  );
}

export function BrandingSection({
  form,
  onBrandingStyleChange,
  onPrimaryColorChange,
  onAccentColorChange,
  language,
  onLanguageChange,
  showSignature,
  onShowSignatureChange,
  signatureUrl,
  onSignatureUrlChange,
}: {
  form: InvoiceFormState;
  onBrandingStyleChange: (id: string) => void;
  onPrimaryColorChange: (hex: string) => void;
  onAccentColorChange: (hex: string) => void;
  language: string;
  onLanguageChange: (v: string) => void;
  showSignature: boolean;
  onShowSignatureChange: (v: boolean) => void;
  signatureUrl: string | null;
  onSignatureUrlChange: (url: string | null) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span>
          <span className="block text-[13px] font-semibold text-foreground">Advanced branding options</span>
          <span className="block text-[11px] text-muted-foreground">Invoice theme, colours, language and signature</span>
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="border-t border-border">
          <div className="border-b border-border p-4">
            <p className="mb-2.5 text-[13px] font-semibold text-foreground">Invoice theme</p>
            <InvoiceBrandingStylePicker
              form={form}
              brandingStyleId={form.brandingStyleId}
              onChange={onBrandingStyleChange}
            />
          </div>

          <div className="border-b border-border p-4">
            <p className="mb-2.5 text-[13px] font-semibold text-foreground">Invoice colours</p>
            <InvoiceColorPicker
              primaryColor={form.primaryColor}
              onPrimaryColorChange={onPrimaryColorChange}
              accentColor={form.accentColor}
              onAccentColorChange={onAccentColorChange}
            />
          </div>

          <div className="border-b border-border p-4">
            <p className="mb-2 text-[13px] font-semibold text-foreground">Invoice language</p>
            <p className="mb-2.5 text-[11px] text-muted-foreground">The language this invoice will use.</p>
            <LanguageSelect value={language} onChange={onLanguageChange} />
          </div>

          <UploadRow
            label="Signature"
            hint="Authorised signatory image"
            icon={PenLine}
            enabled={showSignature}
            onEnabledChange={onShowSignatureChange}
            url={signatureUrl}
            onUpload={(file) => onSignatureUrlChange(URL.createObjectURL(file))}
            onRemove={() => onSignatureUrlChange(null)}
          />
        </div>
      )}
    </div>
  );
}
