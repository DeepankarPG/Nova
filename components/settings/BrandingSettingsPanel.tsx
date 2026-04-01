"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ImagePlus, Minus, Monitor, Plus, Smartphone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SettingsTextInput } from "@/components/settings/SettingsTextInput";
import { BrandingDesktopFrame, BrandingMobileFrame } from "@/components/settings/branding/BrandingPreviewFrames";
import { PaymentRequestEmailPreview } from "@/components/settings/branding/PaymentRequestEmailPreview";
import { PayflowPreview } from "@/components/settings/branding/PayflowPreview";
import { cn } from "@/lib/utils";

type PreviewTab = "checkout" | "email";
type PreviewViewport = "mobile" | "desktop";

const MAX_ASSET_BYTES = 5 * 1024 * 1024;

/** Same dashed drop target size for icon and logo */
const THUMB_BOX = "h-20 w-[180px] shrink-0 rounded-lg";

function normalizeHex(v: string) {
  const s = v.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{6}$/.test(s)) return `#${s.toUpperCase()}`;
  return null;
}

function replaceBlobUrl(
  prev: string | null,
  next: string | null
): { next: string | null; revoke?: string } {
  if (prev?.startsWith("blob:")) return { next, revoke: prev };
  return { next };
}

function BrandAssetUpload({
  label,
  description,
  requirement,
  url,
  onPick,
  onRemove,
  inputId,
}: {
  label: string;
  description: string;
  requirement: string;
  url: string | null;
  onPick: (file: File) => void;
  onRemove: () => void;
  inputId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onPick(f);
  };

  const toggleId = `${inputId}-expand`;

  return (
    <div className="space-y-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          {!expanded && url ? (
            <p className="mt-1.5 text-xs font-medium text-primary">File attached — expand to replace or remove.</p>
          ) : null}
        </div>
        <button
          type="button"
          id={toggleId}
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted",
            expanded && "bg-muted"
          )}
          aria-expanded={expanded}
          aria-controls={`${inputId}-panel`}
          aria-label={expanded ? `Collapse ${label} upload` : `Expand ${label} upload`}
        >
          {expanded ? <Minus className="h-4 w-4" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
        </button>
      </div>

      {expanded ? (
        <div id={`${inputId}-panel`} role="region" aria-labelledby={toggleId} className="mt-3 space-y-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={cn(
                "flex cursor-pointer items-center justify-center overflow-hidden border-2 border-dashed border-border bg-muted/30 transition-colors hover:bg-muted/50",
                THUMB_BOX,
                dragOver && "border-primary bg-primary/5"
              )}
              aria-label={`Upload ${label.toLowerCase()}`}
            >
              {url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt="" className="max-h-full max-w-full object-contain p-1.5" />
              ) : (
                <ImagePlus className="h-6 w-6 text-muted-foreground" aria-hidden />
              )}
            </button>
            <div className="min-w-0 flex-1 space-y-2">
              <input
                ref={inputRef}
                id={inputId}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) onPick(f);
                }}
              />
              <div className="flex min-h-8 flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => inputRef.current?.click()}>
                  Upload {label.toLowerCase()}
                </Button>
                {url ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    className="h-8 w-8 shrink-0 p-0 text-muted-foreground"
                    onClick={onRemove}
                    aria-label={`Remove ${label.toLowerCase()}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">{requirement}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function BrandingSettingsPanel() {
  const [brandColor, setBrandColor] = useState("#0061E3");
  const [accentColor, setAccentColor] = useState("#0061E3");
  const [brandHexInput, setBrandHexInput] = useState("#0061E3");
  const [accentHexInput, setAccentHexInput] = useState("#0061E3");
  const [preferLogo, setPreferLogo] = useState(true);
  const [hosted, setHosted] = useState(true);
  const [previewTab, setPreviewTab] = useState<PreviewTab>("checkout");
  const [previewViewport, setPreviewViewport] = useState<PreviewViewport>("desktop");
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [radiusPx, setRadiusPx] = useState(12);
  const [saving, setSaving] = useState(false);

  const setIconUrlTracked = useCallback((next: string | null) => {
    setIconUrl((prev) => {
      const { next: n, revoke } = replaceBlobUrl(prev, next);
      if (revoke) URL.revokeObjectURL(revoke);
      return n;
    });
  }, []);

  const setLogoUrlTracked = useCallback((next: string | null) => {
    setLogoUrl((prev) => {
      const { next: n, revoke } = replaceBlobUrl(prev, next);
      if (revoke) URL.revokeObjectURL(revoke);
      return n;
    });
  }, []);

  const syncBrandFromPicker = (hex: string) => {
    setBrandColor(hex);
    setBrandHexInput(hex.toUpperCase());
  };
  const syncAccentFromPicker = (hex: string) => {
    setAccentColor(hex);
    setAccentHexInput(hex.toUpperCase());
  };

  const onBrandHexBlur = () => {
    const n = normalizeHex(brandHexInput);
    if (n) {
      setBrandColor(n);
      setBrandHexInput(n);
    } else {
      setBrandHexInput(brandColor);
      toast.error("Enter a valid hex colour");
    }
  };
  const onAccentHexBlur = () => {
    const n = normalizeHex(accentHexInput);
    if (n) {
      setAccentColor(n);
      setAccentHexInput(n);
    } else {
      setAccentHexInput(accentColor);
      toast.error("Enter a valid hex colour");
    }
  };

  const previewTabs = useMemo(
    () =>
      [
        { id: "checkout" as const, label: "Checkout" },
        { id: "email" as const, label: "Email" },
      ] as const,
    []
  );

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    toast.success("Branding saved");
  };

  const onAssetFile = (setter: (u: string | null) => void) => (file: File) => {
    if (file.size > MAX_ASSET_BYTES) {
      toast.error("Please choose an image under 5 MB.");
      return;
    }
    setter(URL.createObjectURL(file));
    toast.success("Asset updated (mock)");
  };

  const payflowProps = {
    brandColor,
    accentColor,
    radiusPx,
    hosted,
    preferLogo,
    logoUrl,
    iconUrl,
    merchantName: "Acme Corp",
  };

  const emailProps = {
    brandColor,
    accentColor,
    radiusPx,
    merchantName: "Acme Corp",
  };

  return (
    <div className="grid min-w-0 gap-8 lg:grid-cols-2 lg:gap-10">
      <div className="min-w-0 space-y-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">Brand assets</h3>
          <p className="mt-1 text-sm text-muted-foreground">Shown on hosted flows and customer communications (mock).</p>
        </div>

        <div className="space-y-6 rounded-xl border border-border bg-card/50 p-4">
          <BrandAssetUpload
            label="Icon"
            description="Square mark for headers when logo is off or unavailable."
            requirement="PNG or JPG, at least 128×128. Up to 5 MB."
            url={iconUrl}
            inputId="branding-icon"
            onPick={onAssetFile(setIconUrlTracked)}
            onRemove={() => setIconUrlTracked(null)}
          />
          <div className="border-t border-border pt-6">
            <BrandAssetUpload
              label="Logo"
              description="Wide logo for checkout header and emails."
              requirement="PNG or JPG with transparent background recommended. Up to 5 MB."
              url={logoUrl}
              inputId="branding-logo"
              onPick={onAssetFile(setLogoUrlTracked)}
              onRemove={() => setLogoUrlTracked(null)}
            />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={preferLogo} onChange={() => setPreferLogo((v) => !v)} className="rounded border-border" />
          Prefer logo over icon
        </label>

        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Colours</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-muted-foreground">Brand</span>
            <input
              type="color"
              value={brandColor}
              onChange={(e) => syncBrandFromPicker(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded border border-border bg-card p-0.5"
              aria-label="Brand colour"
            />
            <SettingsTextInput
              value={brandHexInput}
              onChange={(e) => setBrandHexInput(e.target.value)}
              onBlur={onBrandHexBlur}
              className="max-w-[7rem] font-mono text-xs"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-muted-foreground">Accent</span>
            <input
              type="color"
              value={accentColor}
              onChange={(e) => syncAccentFromPicker(e.target.value)}
              className="h-9 w-12 cursor-pointer rounded border border-border bg-card p-0.5"
              aria-label="Accent colour"
            />
            <SettingsTextInput
              value={accentHexInput}
              onChange={(e) => setAccentHexInput(e.target.value)}
              onBlur={onAccentHexBlur}
              className="max-w-[7rem] font-mono text-xs"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Corner radius</p>
          <p className="text-xs text-muted-foreground">Applies to checkout cards, buttons, and inputs in the payflow preview.</p>
          <div
            className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 dark:bg-zinc-800/80"
            role="group"
            aria-label="Border radius style"
          >
            <button
              type="button"
              onClick={() => setRadiusPx(0)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                radiusPx === 0 ? "bg-white font-semibold text-foreground shadow-sm dark:bg-zinc-700" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sharp
            </button>
            <button
              type="button"
              onClick={() => setRadiusPx(12)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                radiusPx !== 0 ? "bg-white font-semibold text-foreground shadow-sm dark:bg-zinc-700" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Rounded
            </button>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={hosted} onChange={() => setHosted((v) => !v)} className="rounded border-border" />
          Preview as hosted page (visual only)
        </label>

        <Button variant="primary" size="sm" type="button" isLoading={saving} onClick={save}>
          Save branding
        </Button>
      </div>

      <div className="min-w-0 space-y-3">
        <h3 className="text-base font-semibold text-foreground">Preview</h3>

        <div className="flex flex-col gap-2 border-b border-border pb-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="flex flex-wrap gap-1.5">
            {previewTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setPreviewTab(t.id)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-sm transition-colors",
                  previewTab === t.id ? "bg-muted font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div
            className="inline-flex shrink-0 rounded-lg border border-border bg-muted/40 p-0.5 dark:bg-zinc-800/80"
            role="group"
            aria-label="Preview viewport"
          >
            <button
              type="button"
              onClick={() => setPreviewViewport("mobile")}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                previewViewport === "mobile"
                  ? "bg-white text-foreground shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-pressed={previewViewport === "mobile"}
              aria-label="Mobile preview"
            >
              <Smartphone className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewViewport("desktop")}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                previewViewport === "desktop"
                  ? "bg-white text-foreground shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-pressed={previewViewport === "desktop"}
              aria-label="Desktop preview"
            >
              <Monitor className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex justify-center pt-1">
          {previewTab === "checkout" ? (
            previewViewport === "mobile" ? (
              <BrandingMobileFrame>
                <PayflowPreview {...payflowProps} compact />
              </BrandingMobileFrame>
            ) : (
              <BrandingDesktopFrame>
                <PayflowPreview {...payflowProps} compact={false} />
              </BrandingDesktopFrame>
            )
          ) : previewViewport === "mobile" ? (
            <BrandingMobileFrame>
              <PaymentRequestEmailPreview {...emailProps} compact />
            </BrandingMobileFrame>
          ) : (
            <BrandingDesktopFrame
              addressBar="https://mail.payglocal.in/view/payment-request/mock"
              contentClassName="max-w-xl"
            >
              <PaymentRequestEmailPreview {...emailProps} compact={false} />
            </BrandingDesktopFrame>
          )}
        </div>
      </div>
    </div>
  );
}
