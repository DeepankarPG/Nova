"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/shared/Button";
import { SettingsFieldRow } from "@/components/settings/SettingsFieldRow";
import { SettingsTextInput } from "@/components/settings/SettingsTextInput";

const ACCOUNT_ID = "acct_mcatest123_in";

export default function BusinessAccountPage() {
  const [merchantName, setMerchantName] = useState("mcatest123 Pvt Ltd");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [saving, setSaving] = useState(false);

  const copyId = () => {
    void navigator.clipboard.writeText(ACCOUNT_ID);
    toast.success("Account ID copied");
  };

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    toast.success("Account settings saved");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">Account details</h3>
        <p className="text-sm text-muted-foreground">Identifiers and preferences for this merchant account.</p>
      </div>

      <div>
        <SettingsFieldRow label="Account / merchant name" description="Shown in the dashboard and on internal documents.">
          <SettingsTextInput value={merchantName} onChange={(e) => setMerchantName(e.target.value)} />
        </SettingsFieldRow>
        <SettingsFieldRow label="Account ID" description="Use this when talking to PayGlocal support.">
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs font-mono text-foreground">
              {ACCOUNT_ID}
            </code>
            <Button variant="outline" size="sm" type="button" aria-label="Copy account ID" onClick={copyId}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </SettingsFieldRow>
        <SettingsFieldRow
          label="Phone verification"
          description="We’ll use this number for high-risk changes (mock — no SMS sent)."
        >
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Status: <span className="font-medium text-amber-600 dark:text-amber-400">Not verified</span></p>
            <Button variant="secondary" size="sm" type="button" onClick={() => toast.success("Verification link sent (mock)")}>
              Verify phone number
            </Button>
          </div>
        </SettingsFieldRow>
        <SettingsFieldRow label="Timezone" description="Used for settlement cutoffs and scheduled reports.">
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="Asia/Dubai">Asia/Dubai (GST)</option>
            <option value="Europe/London">Europe/London (GMT/BST)</option>
            <option value="America/New_York">America/New_York (ET)</option>
          </select>
        </SettingsFieldRow>
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
        <Button variant="ghost" size="sm" type="button" onClick={() => toast.message("Changes discarded (mock)")}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" type="button" isLoading={saving} onClick={save}>
          Save changes
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-5">
        <h4 className="text-sm font-semibold text-foreground">Danger zone</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Closing your account stops payouts and access to the dashboard. This action is irreversible in production.
        </p>
        <Button
          variant="danger"
          size="sm"
          className="mt-4"
          type="button"
          onClick={() => toast.error("Close account is disabled in this demo")}
        >
          Close account
        </Button>
      </div>
    </div>
  );
}
