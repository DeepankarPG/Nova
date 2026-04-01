"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DeveloperWebhooksPanel() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" size="sm" type="button" onClick={() => toast.success("Add your endpoint URL (mock)")}>
          Add endpoint
        </Button>
      </div>
      <div className="rounded-xl border border-border p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <code className="break-all text-[11px] font-mono text-foreground">
              https://api.mcatest123.com/webhooks/payglocal
            </code>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["payment.success", "payment.failed", "settlement.created", "dispute.opened"].map((e) => (
                <span
                  key={e}
                  className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                >
                  {e}
                </span>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
              Active
            </span>
            <Button variant="ghost" size="sm" type="button">
              Edit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
