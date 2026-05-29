"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ChevronDown, ImagePlus, Minus, Monitor, Plus, Smartphone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SettingsTextInput } from "@/components/settings/SettingsTextInput";
import { BrandingDesktopFrame, BrandingMobileFrame } from "@/components/settings/branding/BrandingPreviewFrames";
import { PaymentRequestEmailPreview } from "@/components/settings/branding/PaymentRequestEmailPreview";
import { PayflowPreview } from "@/components/settings/branding/PayflowPreview";
import { PayflowPreviewFit } from "@/components/settings/branding/PayflowPreviewFit";
import {
  DEFAULT_ENABLED_METHODS,
  PAYFLOW_METHOD_CONFIG,
  type PayflowMethodId,
} from "@/components/settings/branding/payflow-methods-config";
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
  description?: string;
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
          {description ? <p className="mt-0.5 text-xs text-muted-foreground">{description}</p> : null}
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
  const [previewTab, setPreviewTab] = useState<PreviewTab>("checkout");
  const [previewViewport, setPreviewViewport] = useState<PreviewViewport>("desktop");
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [brandName, setBrandName] = useState("Acme Corp");
  const [showLogoBrandDivider, setShowLogoBrandDivider] = useState(true);
  const [brandingSectionOpen, setBrandingSectionOpen] = useState(true);
  const [paymentSectionOpen, setPaymentSectionOpen] = useState(false);
  const [enabledPaymentMethods, setEnabledPaymentMethods] = useState<Record<PayflowMethodId, boolean>>(() => ({
    ...DEFAULT_ENABLED_METHODS,
  }));
  const [radiusPx, setRadiusPx] = useState(12);
  const [saving, setSaving] = useState(false);

  const merchantNamePreview = brandName.trim() || "Acme Corp";

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

  const togglePaymentMethod = (id: PayflowMethodId) => {
    setEnabledPaymentMethods((prev) => {
      const enabledCount = PAYFLOW_METHOD_CONFIG.filter((m) => prev[m.id]).length;
      if (prev[id] && enabledCount <= 1) {
        toast.error("At least one payment method must stay enabled.");
        return prev;
      }
      return { ...prev, [id]: !prev[id] };
    });
  };

  const payflowProps = {
    brandColor,
    accentColor,
    radiusPx,
    preferLogo,
    logoUrl,
    iconUrl,
    showLogoBrandDivider,
    enabledMethods: enabledPaymentMethods,
    merchantName: merchantNamePreview,
  };

  const emailProps = {
    brandColor,
    accentColor,
    radiusPx,
    merchantName: merchantNamePreview,
  };

  return (
    <div className="w-full min-w-0 max-w-none space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-[22px]">Branding</h2>
          <p className="text-sm text-muted-foreground">
            Configure how your brand appears on checkout and payment emails—the preview updates as you edit.
          </p>
        </div>
        <div className="flex shrink-0 sm:pt-1">
          <Button variant="primary" size="sm" type="button" isLoading={saving} onClick={save}>
            Save branding
          </Button>
        </div>
      </div>

      <div className="grid w-full min-w-0 max-w-none grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-12">
        <div className="min-w-0 space-y-4 pb-14">
          <section className="overflow-hidden rounded-xl border border-border bg-card/50" aria-labelledby="branding-section-trigger">
            <h3 className="border-b border-border text-base font-semibold leading-none text-foreground">
              <button
                type="button"
                id="branding-section-trigger"
                onClick={() => setBrandingSectionOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
                aria-expanded={brandingSectionOpen}
                aria-controls="branding-section-panel"
              >
                <span>Branding</span>
                <ChevronDown
                  className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", brandingSectionOpen && "rotate-180")}
                  aria-hidden
                />
              </button>
            </h3>
            {brandingSectionOpen ? (
              <div id="branding-section-panel" role="region" aria-labelledby="branding-section-trigger" className="space-y-6 p-4 pb-6">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">Brand name</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Shown beside your logo on checkout.</p>
                  </div>
                  <SettingsTextInput
                    id="branding-brand-name"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Acme Corp"
                    autoComplete="organization"
                    maxLength={120}
                    aria-label="Brand name"
                  />
                </div>
                <div className="border-t border-border pt-6">
                  <BrandAssetUpload
                    label="Icon"
                    description="Square mark when the logo is off or missing."
                    requirement="PNG or JPG, 128×128 min. Max 5 MB."
                    url={iconUrl}
                    inputId="branding-icon"
                    onPick={onAssetFile(setIconUrlTracked)}
                    onRemove={() => setIconUrlTracked(null)}
                  />
                </div>
                <div className="border-t border-border pt-6">
                  <BrandAssetUpload
                    label="Logo"
                    description="Wide image for the checkout header."
                    requirement="PNG or JPG. Max 5 MB."
                    url={logoUrl}
                    inputId="branding-logo"
                    onPick={onAssetFile(setLogoUrlTracked)}
                    onRemove={() => setLogoUrlTracked(null)}
                  />
                </div>
                <div className="border-t border-border pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">Logo / name divider</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">Thin line between logo and name in the header.</p>
                    </div>
                    <Switch
                      id="branding-logo-brand-divider"
                      checked={showLogoBrandDivider}
                      onCheckedChange={setShowLogoBrandDivider}
                      aria-label="Show divider between logo and brand name"
                      className="mt-0.5 shrink-0"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 border-t border-border pt-5">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                    <input type="checkbox" checked={preferLogo} onChange={() => setPreferLogo((v) => !v)} className="rounded border-border" />
                    Prefer logo over icon
                  </label>
                  <p className="text-xs text-muted-foreground">If both are uploaded: on uses the logo in the header; off uses the icon.</p>
                </div>
                <div className="space-y-3 border-t border-border pt-6">
                  <div>
                    <p className="text-sm font-medium text-foreground">Colours</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Brand fills the bar; accent is buttons and highlights.</p>
                  </div>
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
                <div className="space-y-3 border-t border-border pt-6">
                  <div>
                    <p className="text-sm font-medium text-foreground">Corners</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Rounding for cards and fields in checkout.</p>
                  </div>
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
              </div>
            ) : null}
          </section>

          <section className="overflow-hidden rounded-xl border border-border bg-card/50" aria-labelledby="payment-section-trigger">
            <h3 className="border-b border-border text-base font-semibold leading-none text-foreground">
              <button
                type="button"
                id="payment-section-trigger"
                onClick={() => setPaymentSectionOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
                aria-expanded={paymentSectionOpen}
                aria-controls="payment-section-panel"
              >
                <span>Payment methods</span>
                <ChevronDown
                  className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", paymentSectionOpen && "rotate-180")}
                  aria-hidden
                />
              </button>
            </h3>
            {paymentSectionOpen ? (
              <div id="payment-section-panel" role="region" aria-labelledby="payment-section-trigger" className="space-y-3 p-4">
                <p className="text-xs text-muted-foreground">Checkout preview. At least one method stays on.</p>
                {PAYFLOW_METHOD_CONFIG.map((m) => (
                  <label
                    key={m.id}
                    className="flex cursor-pointer items-start gap-3 rounded-md border border-transparent py-0.5 hover:bg-muted/40"
                  >
                    <input
                      type="checkbox"
                      checked={enabledPaymentMethods[m.id]}
                      onChange={() => togglePaymentMethod(m.id)}
                      className="mt-0.5 rounded border-border"
                    />
                    <span className="min-w-0 text-sm font-medium text-foreground">{m.label}</span>
                  </label>
                ))}
              </div>
            ) : null}
          </section>
        </div>

      <div className="flex min-h-0 w-full min-w-0 max-w-none flex-col space-y-3 pb-12 lg:sticky lg:top-4 lg:self-start">
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

        <div className="flex w-full min-w-0 justify-center overflow-x-hidden pt-1">
          {previewTab === "checkout" ? (
            previewViewport === "mobile" ? (
              <div className="mx-auto w-full max-w-[min(100%,408px)] rounded-2xl border border-border bg-muted/50 p-3 shadow-inner sm:p-4 dark:border-zinc-700/90 dark:bg-zinc-950/60">
                <BrandingMobileFrame scrollBody>
                  <PayflowPreview {...payflowProps} compact mobileScrollLayout />
                </BrandingMobileFrame>
              </div>
            ) : (
              <BrandingDesktopFrame scrollableContent={false}>
                <PayflowPreviewFit className="min-h-0 flex-1">
                  <PayflowPreview {...payflowProps} compact={false} />
                </PayflowPreviewFit>
              </BrandingDesktopFrame>
            )
          ) : previewViewport === "mobile" ? (
            <div className="mx-auto w-full max-w-[min(100%,408px)] rounded-2xl border border-border bg-muted/50 p-3 shadow-inner sm:p-4 dark:border-zinc-700/90 dark:bg-zinc-950/60">
              <BrandingMobileFrame showDeviceStatusBar={false}>
                <PaymentRequestEmailPreview {...emailProps} compact />
              </BrandingMobileFrame>
            </div>
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
    </div>
  );
}
