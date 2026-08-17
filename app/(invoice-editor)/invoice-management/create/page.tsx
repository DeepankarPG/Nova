"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, Download, RefreshCw, Send, X } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InvoiceTemplatePicker } from "@/components/invoices/InvoiceTemplatePicker";
import { InvoiceNumberChip, IssueDateChip, DueDateChip } from "@/components/invoices/InvoiceHeaderChips";
import { InvoiceDetailsSection } from "@/components/invoices/InvoiceDetailsSection";
import { BillToSection } from "@/components/invoices/BillToSection";
import { LineItemsSection } from "@/components/invoices/LineItemsSection";
import { NotesAndTermsSection } from "@/components/invoices/NotesAndTermsSection";
import { PaymentDetailsSection } from "@/components/invoices/PaymentDetailsSection";
import { InvoicePreviewSidebar } from "@/components/invoices/InvoicePreviewSidebar";
import { InvoiceDocumentPreview } from "@/components/invoices/InvoiceDocumentPreview";
import { BrandingSection } from "@/components/invoices/BrandingSection";
import { SaveAsTemplateDialog } from "@/components/invoices/SaveAsTemplateDialog";
import { ManageTemplatesDialog } from "@/components/invoices/ManageTemplatesDialog";
import {
  defaultBankDetails,
  invoiceTemplates as invoiceTemplatesSeed,
  invoiceBrandingStyles,
  dueTermOptions,
  billingContacts,
} from "@/lib/mock-data/invoice-create";
import type { DueTermId } from "@/lib/mock-data/invoice-create";
import { merchantProductsEnabledSeed } from "@/lib/mock-data/merchant-products";
import type { BillToRecipientDraft, InvoiceFormState, InvoiceLineItemDraft } from "@/lib/invoice-form-types";

function addDaysIso(fromIso: string, days: number) {
  const d = new Date(fromIso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function dueDateFor(issueDate: string, dueTermId: DueTermId | null) {
  if (!dueTermId || dueTermId === "custom") return "";
  const term = dueTermOptions.find((t) => t.id === dueTermId);
  return term ? addDaysIso(issueDate, term.days) : "";
}

const NEXT_INVOICE_NUMBER = "INV-2026-241";

/**
 * A fixed seed (no Math.random()/`new Date()`) so the server-rendered markup
 * and the client's first paint are byte-identical: this is a mock prototype
 * with no backend to source a "next invoice number" or "today" from, and any
 * value computed independently on the server vs. the client causes a
 * hydration mismatch.
 */
function initialForm(): InvoiceFormState {
  const acme = billingContacts.find((c) => c.id === "bc_acme")!;
  const issueDate = "2026-08-06";
  return {
    templateId: invoiceTemplatesSeed[0]!.id,
    invoiceNumber: NEXT_INVOICE_NUMBER,
    issueDate,
    dueTermId: null,
    dueDate: "",
    isRecurring: false,
    recurringFrequency: "monthly",
    recurringStartDate: issueDate,
    recipients: [
      {
        id: acme.id,
        name: acme.name,
        email: acme.email,
        phone: "",
        role: "primary",
        notify: ["Email"],
        address: { line1: "1 Corporate Park", city: "Gurugram", state: "Haryana", postalCode: "122002", country: "India" },
      },
    ],
    currency: "INR",
    lineItems: [
      { id: "li_0", name: "Monthly platform fee", description: "", itemType: "quantity", quantity: 1, unitPrice: 25000, hsn: "", taxLabel: "18% GST", discountValue: "", discountType: "percent" },
      { id: "li_1", name: "API usage", description: "", itemType: "quantity", quantity: 1, unitPrice: 3000, hsn: "", taxLabel: "18% GST", discountValue: "", discountType: "percent" },
      { id: "li_2", name: "Support retainer", description: "", itemType: "quantity", quantity: 1, unitPrice: 15000, hsn: "", taxLabel: "18% GST", discountValue: "", discountType: "percent" },
    ],
    discountValue: "",
    discountType: "percent",
    bankDetails: { ...defaultBankDetails },
    paymentMethods: {
      bankTransferEnabled: true,
      paymentLinkEnabled: false,
      paymentLinkUrl: "",
      qrCodeEnabled: false,
      externalPaymentLinkEnabled: false,
      externalPaymentLinkUrl: "",
    },
    memo: "",
    footer: "",
    logoUrl: null,
    showSignature: false,
    signatureUrl: null,
    brandingStyleId: invoiceBrandingStyles[0]!.id,
    primaryColor: invoiceBrandingStyles[0]!.defaultPrimaryColor,
    accentColor: invoiceBrandingStyles[0]!.defaultAccentColor,
    language: "English",
  };
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const [form, setForm] = useState<InvoiceFormState>(initialForm);
  const [templates, setTemplates] = useState(invoiceTemplatesSeed);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [manageTemplatesOpen, setManageTemplatesOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [merchantProducts, setMerchantProducts] = useState(merchantProductsEnabledSeed);
  const idSeq = useRef(100);
  const nextId = (prefix: string) => `${prefix}_${idSeq.current++}`;
  const pdfCaptureRef = useRef<HTMLDivElement>(null);

  const isUsingSavedTemplate = templates.some((t) => t.id === form.templateId);

  const patch = (p: Partial<InvoiceFormState>) => setForm((f) => ({ ...f, ...p }));

  const handleIssueDateChange = (issueDate: string) => {
    patch({ issueDate, dueDate: dueDateFor(issueDate, form.dueTermId) });
  };

  const handleDueTermChange = (dueTermId: DueTermId | null) => {
    patch({ dueTermId, dueDate: dueDateFor(form.issueDate, dueTermId) });
  };

  const handleCustomDueDateChange = (dueDate: string) => {
    patch({ dueDate });
  };

  const handleAddRecipient = (recipient: Omit<BillToRecipientDraft, "id">) => {
    patch({ recipients: [...form.recipients, { id: nextId("r"), ...recipient }] });
  };

  const handleRemoveRecipient = (id: string) => {
    const remaining = form.recipients.filter((r) => r.id !== id);
    if (remaining.length > 0 && !remaining.some((r) => r.role === "primary")) {
      remaining[0]!.role = "primary";
    }
    patch({ recipients: remaining });
  };

  const handleMakePrimary = (id: string) => {
    patch({ recipients: form.recipients.map((r) => ({ ...r, role: r.id === id ? "primary" : "cc" })) });
  };

  const handleAddLineItem = (item: Omit<InvoiceLineItemDraft, "id">) => {
    patch({ lineItems: [...form.lineItems, { id: nextId("li"), ...item }] });
  };

  const handleEditLineItem = (id: string, item: Omit<InvoiceLineItemDraft, "id">) => {
    patch({ lineItems: form.lineItems.map((li) => (li.id === id ? { id, ...item } : li)) });
  };

  const handleRemoveLineItem = (id: string) => {
    patch({ lineItems: form.lineItems.filter((item) => item.id !== id) });
  };

  const handleReorderLineItems = (nextOrder: InvoiceLineItemDraft[]) => {
    patch({ lineItems: nextOrder });
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    patch({ lineItems: form.lineItems.map((li) => (li.id === id ? { ...li, quantity } : li)) });
  };

  const handleRateChange = (id: string, unitPrice: number) => {
    patch({ lineItems: form.lineItems.map((li) => (li.id === id ? { ...li, unitPrice } : li)) });
  };

  const canSave = useMemo(() => form.invoiceNumber.trim().length > 0 && form.recipients.length > 0, [form]);

  const handleFinalizeAndSend = () => {
    if (!canSave) {
      toast.error("Add an invoice number and at least one recipient first");
      return;
    }
    toast.success("Invoice sent", { description: `${form.invoiceNumber} was finalized and sent` });
    router.push("/invoice-management");
  };

  const handleDownloadPdf = async () => {
    const node = pdfCaptureRef.current;
    if (!node || isDownloading) return;

    setIsDownloading(true);
    try {
      const { downloadNodeAsPdf } = await import("@/lib/invoice-pdf");
      await downloadNodeAsPdf(node, `${form.invoiceNumber || "invoice"}.pdf`);
      toast.success("PDF downloaded", { description: `${form.invoiceNumber || "Invoice"} was saved as a PDF` });
    } catch {
      toast.error("Couldn't generate the PDF", { description: "Please try again" });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBrandingStyleChange = (brandingStyleId: string) => {
    const style = invoiceBrandingStyles.find((s) => s.id === brandingStyleId);
    patch({
      brandingStyleId,
      ...(style && { primaryColor: style.defaultPrimaryColor, accentColor: style.defaultAccentColor }),
    });
  };

  const handleUpdateTemplate = () => {
    const template = templates.find((t) => t.id === form.templateId);
    if (!template) return;
    toast.success("Template updated", { description: `"${template.name}" now reflects this invoice's details` });
  };

  const handleSaveAsTemplate = (name: string) => {
    const id = nextId("tpl");
    setTemplates((prev) => [
      ...prev,
      { id, name, description: "Custom template", createdAt: "2026-08-06", usageCount: 0 },
    ]);
    patch({ templateId: id });
    toast.success("Template saved", { description: `"${name}" is now available in your template list` });
  };

  const handleDeleteTemplate = (id: string) => {
    const deleted = templates.find((t) => t.id === id);
    const remaining = templates.filter((t) => t.id !== id);
    setTemplates(remaining);
    if (form.templateId === id && remaining[0]) patch({ templateId: remaining[0].id });
    if (deleted) toast.success("Template deleted", { description: `"${deleted.name}" was removed` });
  };

  const handleRenameTemplate = (id: string, name: string) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)));
    toast.success("Template renamed");
  };

  const handleEnableProducts = () => {
    setMerchantProducts({ cardsEnabled: true, internationalGatewaysEnabled: true });
    patch({ paymentMethods: { ...form.paymentMethods, paymentLinkEnabled: true } });
    toast.success("Payment link enabled", { description: "Cards and international gateways are now on for your account" });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center gap-4 border-b border-border px-5 py-3">
        <button
          type="button"
          onClick={() => router.push("/invoice-management")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Create a new invoice</h1>
            <StatusBadge status="draft" size="sm" />
            <span className="flex items-center gap-1 text-[13px] text-muted-foreground">
              <RefreshCw className="h-3 w-3" />
              Auto-saved as you type
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-3.5 w-3.5" />}
            onClick={handleDownloadPdf}
            disabled={isDownloading}
          >
            {isDownloading ? "Preparing PDF…" : "Download as PDF"}
          </Button>

          <div className="flex items-center">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Send className="h-3.5 w-3.5" />}
              onClick={handleFinalizeAndSend}
              disabled={!canSave}
              className="rounded-r-none"
            >
              Finalize &amp; send
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-8 rounded-l-none border-l border-primary-foreground/20 px-0"
                  aria-label="More actions"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isUsingSavedTemplate ? (
                  <DropdownMenuItem onClick={handleUpdateTemplate}>Update template</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => setSaveTemplateOpen(true)}>Save as template</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_44rem]">
        <div className="min-h-0 overflow-y-auto">
          <div className="mx-auto max-w-[860px] space-y-5 px-[4.5rem] py-6">
            <div className="flex flex-wrap items-center gap-2">
              <InvoiceNumberChip value={form.invoiceNumber} onChange={(invoiceNumber) => patch({ invoiceNumber })} />
              <IssueDateChip value={form.issueDate} onChange={handleIssueDateChange} />
              <DueDateChip
                dueTermId={form.dueTermId}
                dueDate={form.dueDate}
                onChange={handleDueTermChange}
                onCustomDateChange={handleCustomDueDateChange}
              />
            </div>

            <InvoiceTemplatePicker
              templateId={form.templateId}
              onChange={(templateId) => patch({ templateId })}
              templates={templates}
              onManageTemplates={() => setManageTemplatesOpen(true)}
            />

            <BillToSection
              recipients={form.recipients}
              onAdd={handleAddRecipient}
              onRemove={handleRemoveRecipient}
              onMakePrimary={handleMakePrimary}
            />

            <LineItemsSection
              lineItems={form.lineItems}
              onAdd={handleAddLineItem}
              onEdit={handleEditLineItem}
              onRemove={handleRemoveLineItem}
              onReorder={handleReorderLineItems}
              onQuantityChange={handleQuantityChange}
              onRateChange={handleRateChange}
              currency={form.currency}
              onCurrencyChange={(currency) => patch({ currency })}
              discountValue={form.discountValue}
              onDiscountValueChange={(discountValue) => patch({ discountValue })}
              discountType={form.discountType}
              onDiscountTypeChange={(discountType) => patch({ discountType })}
            />

            <PaymentDetailsSection
              bankDetails={form.bankDetails}
              onBankDetailsChange={(bankPatch) => patch({ bankDetails: { ...form.bankDetails, ...bankPatch } })}
              paymentMethods={form.paymentMethods}
              onPaymentMethodsChange={(methodsPatch) =>
                patch({ paymentMethods: { ...form.paymentMethods, ...methodsPatch } })
              }
              merchantProducts={merchantProducts}
              onEnableProducts={handleEnableProducts}
            />

            <NotesAndTermsSection
              memo={form.memo}
              onMemoChange={(memo) => patch({ memo })}
              footer={form.footer}
              onFooterChange={(footer) => patch({ footer })}
            />

            <InvoiceDetailsSection
              isRecurring={form.isRecurring}
              onIsRecurringChange={(isRecurring) => patch({ isRecurring })}
              recurringFrequency={form.recurringFrequency}
              onRecurringFrequencyChange={(recurringFrequency) => patch({ recurringFrequency })}
              recurringStartDate={form.recurringStartDate}
              onRecurringStartDateChange={(recurringStartDate) => patch({ recurringStartDate })}
            />
          </div>
        </div>

        <div className="min-h-0 overflow-y-auto bg-muted">
          <div className="space-y-4 p-4 md:p-6">
            <InvoicePreviewSidebar form={form} onLogoUrlChange={(logoUrl) => patch({ logoUrl })} />
            <BrandingSection
              form={form}
              onBrandingStyleChange={handleBrandingStyleChange}
              onPrimaryColorChange={(primaryColor) => patch({ primaryColor })}
              onAccentColorChange={(accentColor) => patch({ accentColor })}
              language={form.language}
              onLanguageChange={(language) => patch({ language })}
              showSignature={form.showSignature}
              onShowSignatureChange={(showSignature) => patch({ showSignature })}
              signatureUrl={form.signatureUrl}
              onSignatureUrlChange={(signatureUrl) => patch({ signatureUrl })}
            />
          </div>
        </div>
      </div>

      <SaveAsTemplateDialog
        open={saveTemplateOpen}
        onOpenChange={setSaveTemplateOpen}
        onSave={handleSaveAsTemplate}
      />

      <ManageTemplatesDialog
        open={manageTemplatesOpen}
        onOpenChange={setManageTemplatesOpen}
        templates={templates}
        onDelete={handleDeleteTemplate}
        onRename={handleRenameTemplate}
      />

      <div className="pointer-events-none fixed left-[-9999px] top-0" aria-hidden="true">
        <div ref={pdfCaptureRef} className="w-[860px]">
          <InvoiceDocumentPreview form={form} />
        </div>
      </div>
    </div>
  );
}
