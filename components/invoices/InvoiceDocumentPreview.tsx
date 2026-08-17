"use client";

import { invoiceBrandingStyles } from "@/lib/mock-data/invoice-create";
import type { InvoiceFormState } from "@/lib/invoice-form-types";
import { ClassicLayout } from "./layouts/ClassicLayout";
import { MinimalMonoLayout } from "./layouts/MinimalMonoLayout";
import { BoldSidebarLayout } from "./layouts/BoldSidebarLayout";
import { PlayfulBorderLayout } from "./layouts/PlayfulBorderLayout";
import { Y2kBoldLayout } from "./layouts/Y2kBoldLayout";
import { GeometricModernLayout } from "./layouts/GeometricModernLayout";

export { currencySymbol, formatAmount } from "@/lib/invoice-preview-data";

export function InvoiceDocumentPreview({
  form,
  onLogoClick,
  className,
}: {
  form: InvoiceFormState;
  onLogoClick?: () => void;
  className?: string;
}) {
  const style = invoiceBrandingStyles.find((s) => s.id === form.brandingStyleId) ?? invoiceBrandingStyles[0]!;

  const Layout = {
    classic: ClassicLayout,
    "minimal-mono": MinimalMonoLayout,
    "bold-sidebar": BoldSidebarLayout,
    "playful-border": PlayfulBorderLayout,
    "y2k-bold": Y2kBoldLayout,
    "geometric-modern": GeometricModernLayout,
  }[style.layout];

  return (
    <div className={className ?? "overflow-hidden rounded-2xl border border-border bg-card shadow-md"}>
      <Layout form={form} onLogoClick={onLogoClick} />
    </div>
  );
}
