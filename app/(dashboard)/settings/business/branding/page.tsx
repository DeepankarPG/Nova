import { BrandingSettingsPanel } from "@/components/settings/BrandingSettingsPanel";

export default function BusinessBrandingPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-[22px]">Branding</h2>
        <p className="text-sm text-muted-foreground">
          Colours, logos, and corner styling customers see on checkout, links, and receipts — with a live payflow preview.
        </p>
      </div>
      <BrandingSettingsPanel />
    </div>
  );
}
