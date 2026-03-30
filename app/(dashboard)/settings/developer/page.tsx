"use client";

import { DeveloperApiKeysPanel } from "@/components/settings/DeveloperApiKeysPanel";
import { DeveloperWebhooksPanel } from "@/components/settings/DeveloperWebhooksPanel";

export default function SettingsDeveloperPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-[22px]">Developer</h2>
        <p className="text-sm text-muted-foreground">API keys and webhook endpoints for integrations.</p>
      </div>

      <section className="space-y-3">
        <h3 className="text-base font-semibold text-foreground">API keys</h3>
        <DeveloperApiKeysPanel />
      </section>

      <section className="space-y-3 border-t border-border pt-8">
        <h3 className="text-base font-semibold text-foreground">Webhooks</h3>
        <DeveloperWebhooksPanel />
      </section>
    </div>
  );
}
