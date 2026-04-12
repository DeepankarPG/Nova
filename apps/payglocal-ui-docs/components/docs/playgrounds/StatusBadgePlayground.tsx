"use client";

import { Stack, StatusBadge, STATUS_BADGE_KEYS } from "@payglocal/ui";

export function StatusBadgePlayground() {
  return (
    <Stack gap="lg" className="w-full text-left">
      <div>
        <p className="mb-3 text-sm font-medium text-foreground">Sizes (same status)</p>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status="settled" size="sm" />
          <StatusBadge status="settled" size="md" />
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-medium text-foreground">Unknown key (muted fallback)</p>
        <StatusBadge status="custom-workflow-xyz" />
      </div>
      <div>
        <p className="mb-3 text-sm font-medium text-foreground">Full catalog ({STATUS_BADGE_KEYS.length} keys)</p>
        <div className="flex max-h-[min(24rem,50vh)] flex-wrap gap-2 overflow-y-auto rounded-lg border border-border bg-muted/20 p-3">
          {STATUS_BADGE_KEYS.map((key) => (
            <StatusBadge key={key} status={key} size="sm" />
          ))}
        </div>
      </div>
    </Stack>
  );
}
