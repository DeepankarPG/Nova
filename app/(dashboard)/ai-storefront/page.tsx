"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Shimmer } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  fetchAiStorefrontOverview,
  publishAiStorefront,
} from "@/lib/ai-storefront/client";
import type { StorefrontOverview } from "@/lib/ai-storefront/types";
import { AiStorefrontAnalytics } from "@/components/ai-storefront/AiStorefrontAnalytics";
import { AiStorefrontQuickAccess } from "@/components/ai-storefront/AiStorefrontQuickAccess";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const outlineSmClass =
  "inline-flex h-9 min-h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35";

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

function mcpStatusKey(s: StorefrontOverview["mcp"]["status"]): string {
  if (s === "healthy") return "healthy";
  if (s === "degraded") return "degraded";
  return "unknown";
}

export default function AiStorefrontHubPage() {
  const [overview, setOverview] = useState<StorefrontOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const o = await fetchAiStorefrontOverview();
      setOverview(o);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onPublish = async () => {
    setPublishing(true);
    try {
      const r = await publishAiStorefront();
      toast.success(r.message ?? "Published to AI tools");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  const lifecycleBadge =
    overview?.lifecycleStatus === "live"
      ? "live"
      : overview?.lifecycleStatus === "paused"
        ? "paused"
        : "draft";

  return (
    <div className="max-w-[1400px] space-y-4">
      <PageHeader
        className="pt-1 sm:pt-2"
        title="AI Storefront"
        subtitle="Catalogue, inventory, and guardrails for AI-assisted checkout."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/ai-storefront/preview" className={cn(outlineSmClass)}>
              <Eye className="h-4 w-4" />
              Preview
            </Link>
            <Button size="sm" disabled={publishing || !overview} onClick={() => void onPublish()}>
              {publishing ? "Publishing…" : "Publish to AI tools"}
            </Button>
          </div>
        }
      />

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive">
          {error}
          <Button variant="ghost" size="sm" className="ml-2 h-8" onClick={() => void load()}>
            Retry
          </Button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Lifecycle",
            value: overview ? <StatusBadge status={lifecycleBadge} size="sm" /> : null,
            sub: overview ? `${overview.productCount} products` : "—",
          },
          {
            label: "Setup",
            value: overview ? `${overview.setupProgressPercent}%` : null,
            sub: overview?.setupComplete ? "Complete" : "In progress",
          },
          {
            label: "MCP health",
            value: overview ? <StatusBadge status={mcpStatusKey(overview.mcp.status)} size="sm" /> : null,
            sub:
              overview?.mcp.p95LatencyMs != null
                ? `P95 ${overview.mcp.p95LatencyMs} ms`
                : "Latency n/a",
          },
          {
            label: "Last published",
            value: overview ? formatIso(overview.lastPublishedAt) : null,
            sub: overview
              ? `~${overview.estimatedPropagationSeconds}s propagation`
              : "—",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-card px-4 py-3.5 text-card-foreground shadow-sm"
          >
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {s.label}
            </p>
            <div className="mt-1.5 min-h-7">
              {!overview ? (
                <Shimmer className="h-6 w-24" />
              ) : (
                <div className="text-base font-semibold text-foreground">{s.value}</div>
              )}
            </div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>

      <AiStorefrontQuickAccess />

      {overview?.analytics ? (
        <AiStorefrontAnalytics analytics={overview.analytics} />
      ) : null}

      {overview?.catalogueSyncedAt ? (
        <p className="text-xs text-muted-foreground">
          Last catalogue sync {formatIso(overview.catalogueSyncedAt)} · ~{overview.estimatedPropagationSeconds}s
          to AI tools after publish.
        </p>
      ) : null}
    </div>
  );
}
