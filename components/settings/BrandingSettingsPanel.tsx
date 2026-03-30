"use client";

import { useMemo, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/shared/Button";
import { SettingsTextInput } from "@/components/settings/SettingsTextInput";
import { cn } from "@/lib/utils";

type PreviewTab = "checkout" | "link" | "email";
type PreviewViewport = "mobile" | "desktop";

function normalizeHex(v: string) {
  const s = v.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{6}$/.test(s)) return `#${s.toUpperCase()}`;
  return null;
}

function PreviewCardInner({
  brandColor,
  accentColor,
  hosted,
  preferLogo,
  logoUrl,
  iconUrl,
  previewTitle,
  previewTab,
  compact,
}: {
  brandColor: string;
  accentColor: string;
  hosted: boolean;
  preferLogo: boolean;
  logoUrl: string | null;
  iconUrl: string | null;
  previewTitle: string;
  previewTab: PreviewTab;
  compact: boolean;
}) {
  const headerPad = compact ? "px-3 py-2.5" : "px-4 py-3";
  const bodyPad = compact ? "space-y-3 p-4" : "space-y-4 p-5";
  const amountClass = compact ? "text-xl font-semibold tracking-tight text-foreground" : "text-2xl font-semibold tracking-tight text-foreground";

  return (
    <>
      <div className={cn("flex items-center justify-between gap-2", headerPad)} style={{ backgroundColor: brandColor }}>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {preferLogo && logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-5 max-w-[100px] object-contain object-left brightness-0 invert sm:h-6 sm:max-w-[120px]" />
          ) : iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={iconUrl} alt="" className="h-7 w-7 rounded-md border border-white/30 object-cover sm:h-8 sm:w-8" />
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/20 text-[10px] font-bold text-white sm:h-8 sm:w-8 sm:text-xs">
              M
            </span>
          )}
          <span className="truncate text-xs font-semibold text-white sm:text-sm">{previewTitle}</span>
        </div>
        <span className="shrink-0 rounded bg-white/15 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white/90 sm:px-2 sm:text-[10px]">
          {hosted ? "Hosted" : "Embedded"}
        </span>
      </div>
      <div className={bodyPad}>
        {previewTab === "email" ? (
          <p className="text-xs text-muted-foreground sm:text-sm">
            <span className="font-medium text-foreground">₹2,450.00</span> paid to mcatest123 — thank you for your purchase.
          </p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground sm:text-sm">Amount due</p>
            <p className={amountClass}>₹2,450.00</p>
            <p className="text-[11px] text-muted-foreground sm:text-xs">Includes GST as applicable. Mock preview only.</p>
          </>
        )}
        <button
          type="button"
          className="w-full rounded-lg py-2 text-xs font-semibold text-white shadow-sm sm:py-2.5 sm:text-sm"
          style={{ backgroundColor: accentColor }}
        >
          {previewTab === "link" ? "Pay ₹2,450.00" : previewTab === "email" ? "View receipt" : "Pay now"}
        </button>
      </div>
    </>
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
  const [saving, setSaving] = useState(false);

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

  const previewTitle = useMemo(() => {
    if (previewTab === "checkout") return "Pay mcatest123";
    if (previewTab === "link") return "Payment link";
    return "Receipt from mcatest123";
  }, [previewTab]);

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    toast.success("Branding saved");
  };

  const onFile =
    (setter: (u: string | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      setter(URL.createObjectURL(f));
      toast.success("Asset updated (mock)");
      e.target.value = "";
    };

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">Brand assets</h3>
          <p className="mt-1 text-sm text-muted-foreground">Shown on hosted flows and customer communications (mock).</p>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-foreground">Icon</p>
            <p className="text-xs text-muted-foreground">Square mark, at least 128×128.</p>
            <input type="file" accept="image/*" className="mt-2 block text-xs text-muted-foreground" onChange={onFile(setIconUrl)} />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Logo</p>
            <p className="text-xs text-muted-foreground">Wide logo for headers and emails.</p>
            <input type="file" accept="image/*" className="mt-2 block text-xs text-muted-foreground" onChange={onFile(setLogoUrl)} />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={preferLogo} onChange={() => setPreferLogo((v) => !v)} className="rounded border-border" />
            Prefer logo over icon
          </label>
        </div>

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

        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={hosted} onChange={() => setHosted((v) => !v)} className="rounded border-border" />
          Preview as hosted page (visual only)
        </label>

        <Button variant="primary" size="sm" type="button" isLoading={saving} onClick={save}>
          Save branding
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Preview</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Example in <span className="font-medium text-foreground">INR</span>. Customer-facing pages follow RBI and branding
            guidelines; this is a static mock.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-border pb-2">
          {(
            [
              { id: "checkout" as const, label: "Checkout" },
              { id: "link" as const, label: "Payment link" },
              { id: "email" as const, label: "Email receipt" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setPreviewTab(t.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                previewTab === t.id ? "bg-muted font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Preview</p>
          <div
            className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 dark:bg-zinc-800/80"
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

        <div
          className={cn(
            "flex justify-center",
            previewViewport === "mobile" ? "py-2" : "py-0"
          )}
        >
          <div
            className={cn(
              "w-full overflow-hidden transition-[max-width,border-radius,box-shadow]",
              previewViewport === "mobile"
                ? "max-w-[min(100%,320px)] rounded-[2rem] border-[10px] border-zinc-800 shadow-2xl dark:border-zinc-700"
                : "max-w-2xl rounded-xl border border-border bg-background shadow-sm dark:border-zinc-800 dark:bg-zinc-950",
              hosted && previewViewport === "desktop" ? "ring-1 ring-black/5 dark:ring-white/10" : ""
            )}
          >
            {previewViewport === "mobile" ? (
              <div className="max-h-[min(520px,62vh)] overflow-y-auto rounded-[1.15rem] bg-white dark:bg-zinc-950">
                <PreviewCardInner
                  brandColor={brandColor}
                  accentColor={accentColor}
                  hosted={hosted}
                  preferLogo={preferLogo}
                  logoUrl={logoUrl}
                  iconUrl={iconUrl}
                  previewTitle={previewTitle}
                  previewTab={previewTab}
                  compact
                />
              </div>
            ) : (
              <PreviewCardInner
                brandColor={brandColor}
                accentColor={accentColor}
                hosted={hosted}
                preferLogo={preferLogo}
                logoUrl={logoUrl}
                iconUrl={iconUrl}
                previewTitle={previewTitle}
                previewTab={previewTab}
                compact={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
