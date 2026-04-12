"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  fetchAiStorefrontAiContext,
  fetchAiStorefrontSettings,
  patchAiStorefrontAiContext,
  patchAiStorefrontSettings,
  publishAiStorefront,
} from "@/lib/ai-storefront/client";
import type { AiGuardrails, StorefrontSettings, TonePreset } from "@/lib/ai-storefront/types";
import { toast } from "sonner";

function linesToTopics(s: string): string[] {
  return s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function topicsToLines(topics: string[]): string {
  return topics.join("\n");
}

export default function AiStorefrontSettingsPage() {
  const [settings, setSettings] = useState<StorefrontSettings | null>(null);
  const [ai, setAi] = useState<AiGuardrails | null>(null);
  const [allowedText, setAllowedText] = useState("");
  const [forbiddenText, setForbiddenText] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, g] = await Promise.all([
        fetchAiStorefrontSettings(),
        fetchAiStorefrontAiContext(),
      ]);
      setSettings(s);
      setAi(g);
      setAllowedText(topicsToLines(g.allowedTopics));
      setForbiddenText(topicsToLines(g.forbiddenTopics));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveStore = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const s = await patchAiStorefrontSettings({
        brandName: settings.brandName,
        welcomeMessage: settings.welcomeMessage,
        tonePreset: settings.tonePreset,
      });
      setSettings(s);
      toast.success("Store settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const saveGuardrails = async () => {
    if (!ai) return;
    setSaving(true);
    try {
      const g = await patchAiStorefrontAiContext({
        allowedTopics: linesToTopics(allowedText),
        forbiddenTopics: linesToTopics(forbiddenText),
        mustNotQuotePriceWithoutTool: ai.mustNotQuotePriceWithoutTool,
        mustNotPromiseDeliveryDates: ai.mustNotPromiseDeliveryDates,
        mustNotConfirmAvailabilityWithoutTool: ai.mustNotConfirmAvailabilityWithoutTool,
      });
      setAi(g);
      toast.success("AI guardrails saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onPublish = async () => {
    setPublishing(true);
    try {
      const r = await publishAiStorefront();
      toast.success(r.message ?? "Published");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  if (!settings || !ai) {
    return (
      <div className="space-y-4">
        <PageHeader title="Store & AI" subtitle="Loading…" />
        <div className="h-40 animate-pulse rounded-xl bg-muted/50" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Store & AI"
        subtitle="Brand voice for your storefront and rules for what the assistant may say."
        actions={
          <Button size="sm" disabled={publishing} onClick={() => void onPublish()}>
            {publishing ? "Publishing…" : "Publish changes"}
          </Button>
        }
      />

      <section className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-sm font-semibold text-foreground">Storefront</h2>
        <Field>
          <FieldLabel htmlFor="st-brand">Brand name</FieldLabel>
          <Input
            id="st-brand"
            value={settings.brandName}
            onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="st-welcome">Welcome message</FieldLabel>
          <Textarea
            id="st-welcome"
            rows={4}
            value={settings.welcomeMessage}
            onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel>Tone</FieldLabel>
          <Select
            value={settings.tonePreset}
            onValueChange={(v) =>
              setSettings({ ...settings, tonePreset: v as TonePreset })
            }
          >
            <SelectTrigger className="w-full sm:max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="friendly">Friendly</SelectItem>
              <SelectItem value="concise">Concise</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <div className="flex justify-end">
          <Button onClick={() => void saveStore()} disabled={saving}>
            {saving ? "Saving…" : "Save storefront"}
          </Button>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-sm font-semibold text-foreground">AI guardrails</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          One topic per line. The assistant should stay within allowed topics and avoid forbidden
          ones when describing your catalogue.
        </p>
        <Field>
          <FieldLabel htmlFor="st-allow">Allowed topics</FieldLabel>
          <Textarea
            id="st-allow"
            rows={5}
            value={allowedText}
            onChange={(e) => setAllowedText(e.target.value)}
            className="font-mono text-[13px]"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="st-deny">Forbidden topics</FieldLabel>
          <Textarea
            id="st-deny"
            rows={5}
            value={forbiddenText}
            onChange={(e) => setForbiddenText(e.target.value)}
            className="font-mono text-[13px]"
          />
        </Field>
        <div className="space-y-3">
          {(
            [
              {
                key: "mustNotQuotePriceWithoutTool" as const,
                label: "Require live tool for prices",
              },
              {
                key: "mustNotPromiseDeliveryDates" as const,
                label: "Block delivery date promises",
              },
              {
                key: "mustNotConfirmAvailabilityWithoutTool" as const,
                label: "Require tool for availability claims",
              },
            ] as const
          ).map((row) => (
            <div
              key={row.key}
              className="flex items-center justify-between gap-4 rounded-lg border border-border/60 px-3 py-3"
            >
              <span className="text-sm font-medium text-foreground">{row.label}</span>
              <Switch
                checked={ai[row.key]}
                onCheckedChange={(v) => setAi({ ...ai, [row.key]: v })}
                aria-label={row.label}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button onClick={() => void saveGuardrails()} disabled={saving}>
            {saving ? "Saving…" : "Save guardrails"}
          </Button>
        </div>
      </section>
    </div>
  );
}
