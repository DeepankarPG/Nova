"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StorefrontPreviewJourney } from "@/components/ai-storefront/preview/StorefrontPreviewJourney";
import { fetchAiStorefrontPreview } from "@/lib/ai-storefront/client";
import type { PreviewScenario, PreviewScript } from "@/lib/ai-storefront/types";
import { cn } from "@/lib/utils";

export default function AiStorefrontPreviewPage() {
  const [scenario, setScenario] = useState<PreviewScenario>("default");
  const [script, setScript] = useState<PreviewScript | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [demoKey, setDemoKey] = useState(0);

  const load = useCallback(async (s: PreviewScenario) => {
    setError(null);
    try {
      const p = await fetchAiStorefrontPreview(s);
      setScript(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load preview");
      setScript(null);
    }
  }, []);

  useEffect(() => {
    void load(scenario);
  }, [load, scenario]);

  const restartDemo = () => {
    setDemoKey((k) => k + 1);
  };

  return (
    <div className="space-y-5">
      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {script ? (
        <>
          {script.journey ? (
            <StorefrontPreviewJourney
              key={`${scenario}-${demoKey}`}
              journey={script.journey}
              scenario={scenario}
              onScenarioChange={setScenario}
              onRestartDemo={restartDemo}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">Scenario</span>
                <Select value={scenario} onValueChange={(v) => setScenario(v as PreviewScenario)}>
                  <SelectTrigger className="h-9 w-[min(100%,240px)] sm:w-[260px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Shopping + PayGlocal checkout</SelectItem>
                    <SelectItem value="catalogue_unavailable">Catalogue unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm lg:col-span-2">
                  <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Assistant chat
                  </h2>
                  <div className="space-y-3">
                    {script.messages.map((m) => (
                      <div
                        key={m.id}
                        className={cn(
                          "rounded-xl border px-3 py-2.5 text-sm leading-relaxed",
                          m.role === "user"
                            ? "ml-6 border-border bg-muted/40"
                            : "mr-6 border-border/80 bg-card"
                        )}
                      >
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {m.role}
                        </span>
                        {m.content}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm lg:col-span-2">
                  <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Tool results
                  </h2>
                  <div className="space-y-3">
                    {script.toolBlocks.map((t) => (
                      <div
                        key={t.id}
                        className="rounded-xl border border-border bg-muted/25 px-3 py-3 shadow-sm"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                          {t.toolName}
                        </p>
                        <p className="mt-1 text-sm font-medium text-foreground">{t.title}</p>
                        <pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-muted-foreground">
                          {t.body}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : !error ? (
        <div className="h-48 animate-pulse rounded-xl bg-muted/50" />
      ) : null}
    </div>
  );
}
