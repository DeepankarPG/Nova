"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DeveloperApiKeysPanel } from "@/components/settings/DeveloperApiKeysPanel";
import { DeveloperWebhooksPanel } from "@/components/settings/DeveloperWebhooksPanel";
import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard";

export default function SettingsDeveloperPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-[22px]">Developer</h2>
        <p className="text-sm text-muted-foreground">API keys and webhook endpoints for integrations.</p>
      </div>

      <SettingsSectionCard title="API keys" description="Live and test credentials for your integration.">
        <DeveloperApiKeysPanel />
      </SettingsSectionCard>

      <SettingsSectionCard
        title="Webhooks"
        description="Endpoints that receive event payloads from PayGlocal."
        footerActions={
          <>
            <Button variant="ghost" size="sm" type="button" onClick={() => toast.message("Changes discarded (mock)")}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="button" onClick={() => toast.success("Webhook settings saved")}>
              Save
            </Button>
          </>
        }
      >
        <DeveloperWebhooksPanel />
      </SettingsSectionCard>
    </div>
  );
}
