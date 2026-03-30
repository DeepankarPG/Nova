import { BrandingSettingsPanel } from "@/components/settings/BrandingSettingsPanel";

export default function BusinessBrandingPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">Branding</h3>
        <p className="text-sm text-muted-foreground">Colours and logos customers see on checkout, links, and receipts.</p>
      </div>
      <BrandingSettingsPanel />
    </div>
  );
}
