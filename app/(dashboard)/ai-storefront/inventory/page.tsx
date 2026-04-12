"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  fetchAiStorefrontInventory,
  syncAiStorefrontInventorySource,
} from "@/lib/ai-storefront/client";
import type { InventoryOverview, InventorySource } from "@/lib/ai-storefront/types";
import { toast } from "sonner";

function statusBadgeKey(s: InventorySource["status"]): string {
  if (s === "connected") return "active";
  if (s === "disconnected") return "inactive";
  if (s === "error") return "failed";
  if (s === "syncing") return "processing";
  return "muted";
}

function formatIso(iso: string | null): string {
  if (!iso) return "Never";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function AiStorefrontInventoryPage() {
  const [data, setData] = useState<InventoryOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const inv = await fetchAiStorefrontInventory();
      setData(inv);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onSync = async (id: string) => {
    setSyncingId(id);
    try {
      await syncAiStorefrontInventorySource(id);
      toast.success("Sync completed");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Inventory"
        subtitle="Connect feeds and keep stock aligned. Final availability is checked when checkout starts."
      />

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive">
          {error}
          <Button variant="ghost" size="sm" className="ml-2 h-8" onClick={() => void load()}>
            Retry
          </Button>
        </div>
      ) : null}

      {data ? (
        <div className="rounded-xl border border-border bg-primary-light/40 px-4 py-3 text-sm leading-relaxed text-foreground dark:bg-muted/30">
          {data.stockCheckedAtCheckoutCopy}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data?.sources.map((src) => (
          <div
            key={src.id}
            className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-foreground">{src.label}</h2>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                  {src.kind}
                </p>
              </div>
              <StatusBadge status={statusBadgeKey(src.status)} size="sm" />
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{src.detail}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Last sync: {formatIso(src.lastSyncAt)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={syncingId === src.id}
                onClick={() => void onSync(src.id)}
                leftIcon={<RefreshCw className={syncingId === src.id ? "animate-spin" : ""} />}
              >
                {syncingId === src.id ? "Syncing…" : "Sync now"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
