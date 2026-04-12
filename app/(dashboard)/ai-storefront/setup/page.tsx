"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Info,
  Package,
  RefreshCw,
  Shield,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  fetchAiStorefrontAiContext,
  fetchAiStorefrontInventory,
  fetchAiStorefrontOverview,
  fetchAiStorefrontProducts,
  fetchAiStorefrontSettings,
  patchAiStorefrontAiContext,
  patchAiStorefrontSettings,
  publishAiStorefront,
} from "@/lib/ai-storefront/client";
import type {
  AiGuardrails,
  InventoryOverview,
  InventorySourceStatus,
  StorefrontOverview,
  StorefrontSettings,
} from "@/lib/ai-storefront/types";
import {
  SETUP_STEP_COUNT,
  SETUP_STEPS,
  TONE_OPTIONS,
  tonePresetLabel,
} from "@/components/ai-storefront/setup/wizard-metadata";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/** Card shell: DESIGN.md — rounded-xl, border, comfortable insets. */
const wizardCardClass =
  "rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8";

/** Primary + secondary row: secondary first on mobile (column-reverse), primary prominent. */
const wizardFooterClass =
  "mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4";

const headerExitLinkClass = cn(
  "inline-flex h-10 min-h-10 items-center justify-center rounded-lg border border-border bg-card px-5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
);

/** Matches Button outline + lg for external navigation. */
const linkOutlineLgClass = cn(
  "inline-flex h-[3.25rem] min-h-[3.25rem] w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-card px-8 text-[15px] font-medium text-foreground shadow-sm transition-colors hover:bg-muted sm:w-auto sm:px-10",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
);

const fieldDescClass = "mt-2 text-[15px] leading-relaxed text-muted-foreground";

function formatIso(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function clampStep(n: number): number {
  if (Number.isNaN(n) || n < 1) return 1;
  if (n > SETUP_STEP_COUNT) return SETUP_STEP_COUNT;
  return n;
}

function OnboardingPill() {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
      From onboarding
    </span>
  );
}

function sourceStatusStyles(status: InventorySourceStatus): string {
  if (status === "connected") return "border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200";
  if (status === "syncing") return "border-amber-500/25 bg-amber-500/10 text-amber-900 dark:text-amber-200";
  if (status === "error") return "border-destructive/30 bg-destructive/10 text-destructive";
  return "border-border bg-muted/60 text-muted-foreground";
}

function AiStorefrontSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = clampStep(Number(searchParams.get("step") ?? "1"));

  const [settings, setSettings] = useState<StorefrontSettings | null>(null);
  const [ai, setAi] = useState<AiGuardrails | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [invOverview, setInvOverview] = useState<InventoryOverview | null>(null);
  const [overview, setOverview] = useState<StorefrontOverview | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, products, inv, ctx, ov] = await Promise.all([
        fetchAiStorefrontSettings(),
        fetchAiStorefrontProducts(),
        fetchAiStorefrontInventory(),
        fetchAiStorefrontAiContext(),
        fetchAiStorefrontOverview(),
      ]);
      setSettings(s);
      setProductCount(products.length);
      setInvOverview(inv);
      setAi(ctx);
      setOverview(ov);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stepMeta = SETUP_STEPS[step - 1]!;

  const setStep = (n: number) => {
    const q = new URLSearchParams(searchParams.toString());
    q.set("step", String(clampStep(n)));
    router.push(`/ai-storefront/setup?${q.toString()}`);
  };

  const bumpProgress = async (minStep: number) => {
    if (!settings) return;
    const next = Math.max(settings.setupStepsCompleted, minStep);
    if (next === settings.setupStepsCompleted) return;
    const s = await patchAiStorefrontSettings({ setupStepsCompleted: next });
    setSettings(s);
  };

  const onStep1Next = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const s = await patchAiStorefrontSettings({
        brandName: settings.brandName,
        welcomeMessage: settings.welcomeMessage,
        tonePreset: settings.tonePreset,
        setupStepsCompleted: Math.max(settings.setupStepsCompleted, 1),
      });
      setSettings(s);
      toast.success("Saved brand & welcome");
      setStep(2);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onStep4Next = async () => {
    if (!ai) return;
    setSaving(true);
    try {
      const next = await patchAiStorefrontAiContext({
        mustNotQuotePriceWithoutTool: ai.mustNotQuotePriceWithoutTool,
        mustNotPromiseDeliveryDates: ai.mustNotPromiseDeliveryDates,
        mustNotConfirmAvailabilityWithoutTool: ai.mustNotConfirmAvailabilityWithoutTool,
      });
      setAi(next);
      await bumpProgress(4);
      toast.success("Saved AI guardrails");
      setStep(5);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onPublish = async () => {
    setSaving(true);
    try {
      await publishAiStorefront();
      const s = await patchAiStorefrontSettings({ setupComplete: true, setupStepsCompleted: 5 });
      setSettings(s);
      toast.success("Storefront published");
      router.push("/ai-storefront");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setSaving(false);
    }
  };

  const headerSubtitle = useMemo(
    () => `Step ${step} of ${SETUP_STEP_COUNT} · ${stepMeta.title}`,
    [step, stepMeta.title]
  );

  if (!settings || !ai || !invOverview) {
    return (
      <div className="space-y-6">
        <PageHeader className="pt-4 sm:pt-5" title="AI Storefront setup" subtitle="Loading…" />
        <div className="h-48 animate-pulse rounded-xl bg-muted/50" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-2 sm:space-y-10">
      <div>
        <PageHeader
          className="pt-4 sm:pt-5"
          title="AI Storefront setup"
          subtitle={headerSubtitle}
          actions={
            <Link href="/ai-storefront" className={headerExitLinkClass}>
              Exit to overview
            </Link>
          }
        />
        <p className="max-w-3xl text-[15px] leading-relaxed text-muted-foreground">{stepMeta.blurb}</p>
      </div>

      <nav aria-label="Setup progress" className="rounded-xl border border-border bg-muted/50 p-3 sm:p-4">
        <div className="grid grid-cols-5 gap-2">
          {SETUP_STEPS.map((s) => {
            const active = s.n === step;
            const done = s.n < step;
            return (
              <button
                key={s.n}
                type="button"
                onClick={() => setStep(s.n)}
                className={cn(
                  "flex min-h-[4rem] flex-col items-center justify-center rounded-lg px-1 py-2.5 text-center transition-colors sm:min-h-[3.5rem] sm:py-3",
                  active
                    ? "bg-card font-semibold text-foreground shadow-sm ring-1 ring-border"
                    : done
                      ? "text-foreground hover:bg-card/80"
                      : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold sm:h-9 sm:w-9",
                    active && "bg-primary text-primary-foreground",
                    done && !active && "bg-primary/15 text-primary",
                    !active && !done && "bg-muted text-muted-foreground"
                  )}
                >
                  {done ? <CheckCircle2 className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden /> : s.n}
                </span>
                <span className="mt-1.5 text-xs font-medium leading-tight sm:text-sm">{s.short}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-center text-sm text-muted-foreground sm:hidden">
          {stepMeta.short} · tap a step to jump
        </p>
      </nav>

      {step === 1 && (
        <div className={cn(wizardCardClass, "space-y-8")}>
          <div className="rounded-xl border border-primary/15 bg-primary-light/80 px-5 py-4 dark:bg-primary/10">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="text-base font-semibold text-foreground">Started from your PayGlocal profile</p>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  Brand and welcome copy were pre-filled from the business details you verified when you joined
                  PayGlocal. Edit anything before it appears to shoppers in AI assistants.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Brand & welcome</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              This is the first message shoppers see when your storefront opens inside ChatGPT-style experiences.
            </p>
          </div>

          <Field>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <FieldLabel htmlFor="brand" className="text-base font-semibold">
                Brand name
              </FieldLabel>
              <OnboardingPill />
            </div>
            <Input
              id="brand"
              value={settings.brandName}
              onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
              className="max-w-xl"
            />
            <FieldDescription className={fieldDescClass}>
              Shown in the chat header and on receipts. Usually matches your legal or storefront name on file.
            </FieldDescription>
          </Field>

          <Field>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <FieldLabel htmlFor="welcome" className="text-base font-semibold">
                Welcome message
              </FieldLabel>
              <OnboardingPill />
            </div>
            <Textarea
              id="welcome"
              value={settings.welcomeMessage}
              onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
              rows={6}
              className="min-h-[140px] max-w-2xl resize-y"
            />
            <FieldDescription className={fieldDescClass}>
              One or two sentences work best. Mention what you sell and how you can help (e.g. gifts, staples,
              reorder).
            </FieldDescription>
          </Field>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <FieldLabel className="m-0 text-base font-semibold">Assistant tone</FieldLabel>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Affects every reply style
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {TONE_OPTIONS.map((t) => {
                const selected = settings.tonePreset === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSettings({ ...settings, tonePreset: t.id })}
                    className={cn(
                      "rounded-xl border bg-card p-5 text-left transition-all sm:p-6",
                      selected
                        ? "border-primary shadow-sm ring-2 ring-primary/20"
                        : "border-border hover:border-border/80 hover:bg-muted/30"
                    )}
                  >
                    <p className="text-base font-semibold text-foreground">{t.title}</p>
                    <p className="mt-1 text-sm font-medium text-primary">{t.tagline}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.detail}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={cn(wizardFooterClass, "sm:justify-end")}>
            <Button
              size="lg"
              disabled={saving}
              onClick={() => void onStep1Next()}
              rightIcon={<ChevronRight className="h-5 w-5 shrink-0" aria-hidden />}
            >
              {saving ? "Saving…" : "Save & continue"}
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className={cn(wizardCardClass, "space-y-8")}>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Catalogue</h2>
            <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
              Assistants only quote what’s in your PayGlocal catalogue. We’ve counted the products already linked to
              your account — add rich descriptions so AI tools surface the right SKU when shoppers ask in natural
              language.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-muted/30 px-5 py-5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-5 w-5" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wider">Catalogue size</span>
              </div>
              <p className="mt-3 text-3xl font-bold tabular-nums text-foreground">{productCount ?? "—"}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Products available to AI tools after publish
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 px-5 py-5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="h-5 w-5" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wider">Last catalogue sync</span>
              </div>
              <p className="mt-3 text-base font-semibold text-foreground">
                {formatIso(overview?.catalogueSyncedAt ?? null)}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Shown to you only — shoppers always see live data at checkout.
              </p>
            </div>
          </div>

          <ul className="space-y-3 rounded-xl border border-dashed border-border bg-muted/20 px-5 py-4 text-[15px] leading-relaxed text-muted-foreground">
            <li className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <span>
                <span className="font-semibold text-foreground">SKUs & prices</span> — assistants won’t invent
                numbers; they read from your catalogue.
              </span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <span>
                <span className="font-semibold text-foreground">Descriptions</span> — longer copy helps match vague
                shopper questions (“something for monsoon”, “gift under ₹500”).
              </span>
            </li>
          </ul>

          <div className={wizardFooterClass}>
            <Link href="/ai-storefront/catalogue" className={linkOutlineLgClass}>
              Open catalogue
              <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
            </Link>
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={async () => {
                await bumpProgress(2);
                setStep(3);
              }}
              rightIcon={<ChevronRight className="h-5 w-5 shrink-0" aria-hidden />}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className={cn(wizardCardClass, "space-y-8")}>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Inventory & fulfilment</h2>
            <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
              {invOverview.stockCheckedAtCheckoutCopy}
            </p>
          </div>

          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-5 py-4 dark:bg-amber-500/10">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden />
              <p className="text-[15px] leading-relaxed text-foreground">
                <span className="font-semibold">Merchant tip:</span> Even if an assistant says “likely in stock”,
                PayGlocal re-checks inventory when checkout starts — that’s when we block oversells.
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Connected sources</p>
            <ul className="mt-4 space-y-3">
              {invOverview.sources.map((src) => (
                <li
                  key={src.id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-foreground">{src.label}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{src.detail}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                        sourceStatusStyles(src.status)
                      )}
                    >
                      {src.status}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {src.lastSyncAt ? formatIso(src.lastSyncAt) : "Never synced"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className={wizardFooterClass}>
            <Link href="/ai-storefront/inventory" className={linkOutlineLgClass}>
              Manage inventory sources
              <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
            </Link>
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={async () => {
                await bumpProgress(3);
                setStep(4);
              }}
              rightIcon={<ChevronRight className="h-5 w-5 shrink-0" aria-hidden />}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className={cn(wizardCardClass, "space-y-8")}>
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-6 w-6 text-primary" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">AI guardrails</h2>
              <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
                Defaults recommended by PayGlocal risk & compliance. They reduce hallucinated prices, delivery
                promises, and stock guarantees — you can change them later under{" "}
                <Link href="/ai-storefront/settings" className="font-semibold text-primary underline-offset-4 hover:underline">
                  Store & AI
                </Link>
                .
              </p>
            </div>
          </div>

          {(ai.allowedTopics.length > 0 || ai.forbiddenTopics.length > 0) && (
            <div className="grid gap-4 md:grid-cols-2">
              {ai.allowedTopics.length > 0 ? (
                <div className="rounded-xl border border-border bg-muted/20 px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Topics assistants may cover
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground">
                    {ai.allowedTopics.map((t) => (
                      <li key={t} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {ai.forbiddenTopics.length > 0 ? (
                <div className="rounded-xl border border-border bg-muted/20 px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Topics to avoid
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground">
                    {ai.forbiddenTopics.map((t) => (
                      <li key={t} className="flex gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}

          <div className="space-y-4">
            {(
              [
                {
                  key: "mustNotQuotePriceWithoutTool" as const,
                  label: "Require live tool for prices",
                  desc: "The assistant will not state rupee amounts unless verified through a catalogue tool call.",
                  note: "Protects you from outdated or invented pricing when models drift from your feed.",
                  recommended: true,
                },
                {
                  key: "mustNotPromiseDeliveryDates" as const,
                  label: "Block delivery date promises",
                  desc: "No “arrives by Friday” unless you add an explicit policy tool later.",
                  note: "Courier and weather exceptions are common — safer to confirm post-checkout.",
                  recommended: true,
                },
                {
                  key: "mustNotConfirmAvailabilityWithoutTool" as const,
                  label: "Require tool for stock confirmation",
                  desc: "No “yes, we have it” without checking inventory at request time.",
                  note: "Pairs with PayGlocal’s checkout-time stock check for double verification.",
                  recommended: true,
                },
              ] as const
            ).map((row) => (
              <div
                key={row.key}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card px-5 py-5 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-foreground">{row.label}</p>
                    {row.recommended ? (
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                        Recommended
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{row.desc}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-foreground">Why it matters:</span> {row.note}
                  </p>
                </div>
                <div className="flex min-h-11 shrink-0 items-center sm:mt-1 sm:justify-end">
                  <Switch
                    checked={ai[row.key]}
                    onCheckedChange={(v) => setAi({ ...ai, [row.key]: v })}
                    aria-label={row.label}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className={wizardFooterClass}>
            <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => setStep(3)}>
              Back
            </Button>
            <Button
              size="lg"
              className="w-full sm:w-auto"
              disabled={saving}
              onClick={() => void onStep4Next()}
              rightIcon={<ChevronRight className="h-5 w-5 shrink-0" aria-hidden />}
            >
              {saving ? "Saving…" : "Save & continue"}
            </Button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className={cn(wizardCardClass, "space-y-8")}>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Review & publish</h2>
            <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
              You’re about to push this configuration to AI shopping surfaces. Typical propagation is under a minute;
              we’ll show status on the overview after publish.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-muted/20 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Brand</p>
              <p className="mt-3 text-base font-semibold text-foreground">{settings.brandName}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-4">
                {settings.welcomeMessage}
              </p>
              <p className="mt-3 text-sm font-semibold text-foreground">
                Tone: {tonePresetLabel(settings.tonePreset)}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Catalogue</p>
              <p className="mt-3 text-3xl font-bold tabular-nums text-foreground">{productCount ?? "—"}</p>
              <p className="text-sm text-muted-foreground">products</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Last sync {formatIso(overview?.catalogueSyncedAt ?? null)}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-5 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Safety toggles</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(
                  [
                    ["mustNotQuotePriceWithoutTool", "Live tool for prices"] as const,
                    ["mustNotPromiseDeliveryDates", "No delivery promises"] as const,
                    ["mustNotConfirmAvailabilityWithoutTool", "Tool for stock"] as const,
                  ] as const
                ).map(([k, label]) => (
                  <span
                    key={k}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium",
                      ai[k]
                        ? "border-primary/25 bg-primary/10 text-primary"
                        : "border-border bg-muted text-muted-foreground line-through"
                    )}
                  >
                    {ai[k] ? <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden /> : null}
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-primary/15 bg-primary-light/80 px-5 py-4 dark:bg-primary/10">
            <div className="flex gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <p className="text-[15px] leading-relaxed text-foreground">
                After publish, open{" "}
                <Link href="/ai-storefront/preview" className="font-semibold text-primary underline-offset-4 hover:underline">
                  Preview
                </Link>{" "}
                to walk through the shopper journey with your copy and PayGlocal checkout, end-to-end.
              </p>
            </div>
          </div>

          <div className={wizardFooterClass}>
            <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => setStep(1)}>
              Back to start
            </Button>
            <Button
              size="lg"
              className="w-full sm:w-auto"
              disabled={saving}
              onClick={() => void onPublish()}
              rightIcon={<ChevronRight className="h-5 w-5 shrink-0" aria-hidden />}
            >
              {saving ? "Publishing…" : "Publish storefront"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AiStorefrontSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <PageHeader className="pt-4 sm:pt-5" title="AI Storefront setup" subtitle="Loading…" />
          <div className="h-48 animate-pulse rounded-xl bg-muted/50" />
        </div>
      }
    >
      <AiStorefrontSetupContent />
    </Suspense>
  );
}
