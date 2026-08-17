"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { InvoiceFormState } from "@/lib/invoice-form-types";
import { InvoiceDocumentPreview } from "./InvoiceDocumentPreview";
import { EmailInvoicePreview } from "./EmailInvoicePreview";
import { LogoUploadDialog } from "./LogoUploadDialog";

export function InvoicePreviewSidebar({
  form,
  onLogoUrlChange,
}: {
  form: InvoiceFormState;
  onLogoUrlChange: (url: string | null) => void;
}) {
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="pdf" className="w-full">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Preview</h2>
          <TabsList className="h-auto gap-1 rounded-lg border border-border bg-muted/30 p-1">
            <TabsTrigger
              value="pdf"
              className="rounded-md px-3.5 py-1.5 text-[13px] font-medium data-[state=active]:border data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              PDF
            </TabsTrigger>
            <TabsTrigger
              value="email"
              className="rounded-md px-3.5 py-1.5 text-[13px] font-medium data-[state=active]:border data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Email
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pdf" className="mt-3">
          <InvoiceDocumentPreview form={form} onLogoClick={() => setLogoDialogOpen(true)} />
        </TabsContent>

        <TabsContent value="email" className="mt-3">
          <EmailInvoicePreview form={form} />
        </TabsContent>
      </Tabs>

      <LogoUploadDialog
        open={logoDialogOpen}
        onOpenChange={setLogoDialogOpen}
        onUpload={(file) => onLogoUrlChange(URL.createObjectURL(file))}
      />
    </div>
  );
}
