import { AiStorefrontShell } from "@/components/ai-storefront/AiStorefrontShell";

/**
 * Fills the dashboard content column (`flex-1 min-h-0`) so the shell can keep the
 * AI Storefront sub-nav fixed while only the right pane scrolls (desktop).
 */
export default function AiStorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="-m-4 flex min-h-0 flex-1 flex-col overflow-hidden md:-m-6">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-4 pl-2 pr-4 md:flex-row md:pb-6 md:pl-3 md:pr-6">
        <AiStorefrontShell>{children}</AiStorefrontShell>
      </div>
    </div>
  );
}
