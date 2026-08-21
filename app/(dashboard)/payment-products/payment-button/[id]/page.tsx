"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Copy, Link2, MousePointerClick, Wallet } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/ui/status-badge";
import { paymentButtonsSeed } from "@/lib/mock-data/payment-button-create";
import { paymentPagesSeed } from "@/lib/mock-data/payment-page-create";
import { formatDate } from "@/lib/utils";

function currencySymbol(currency: string) {
  return currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹";
}

export default function PaymentButtonDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const button = paymentButtonsSeed.find((b) => b.id === params.id);

  if (!button) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-4">
        <button
          type="button"
          onClick={() => router.push("/payment-products/payment-button")}
          className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Payment Button
        </button>
        <p className="text-[14px] text-muted-foreground">This payment button couldn&apos;t be found.</p>
      </div>
    );
  }

  const linkedPage = button.linkedPageId ? paymentPagesSeed.find((p) => p.id === button.linkedPageId) : null;
  const sym = currencySymbol(button.currency);
  const embedCode = `<form><script src="https://checkout.payglocal.in/v1/payment-button.js" data-payment_button_id="${button.id}" async></script></form>`;

  const copyCode = () => {
    navigator.clipboard.writeText(embedCode).catch(() => {});
    toast.success("Embed code copied");
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <button
        type="button"
        onClick={() => router.push("/payment-products/payment-button")}
        className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Payment Button
      </button>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap gap-5 p-5">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MousePointerClick className="h-9 w-9" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">{button.title}</h1>
              <StatusBadge status={button.status} size="sm" />
            </div>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">Button label: "{button.buttonLabel}"</p>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                <Wallet className="h-3.5 w-3.5" />
                {button.amountType === "fixed"
                  ? `${sym}${Number(button.fixedAmount || 0).toLocaleString("en-IN")}`
                  : "Customer decides amount"}
              </span>
              <span className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Created on {formatDate(button.createdAt)}
              </span>
              <span className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                <Link2 className="h-3.5 w-3.5" />
                {linkedPage ? `Linked to ${linkedPage.product?.name || linkedPage.title}` : "Not connected to a page"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-border border-t border-border sm:grid-cols-2">
          <div className="px-5 py-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Total Payments</p>
            <p className="mt-0.5 text-[18px] font-semibold text-foreground">{button.totalPayments}</p>
          </div>
          <div className="px-5 py-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Total Revenue</p>
            <p className="mt-0.5 text-[18px] font-semibold text-foreground">
              {sym}
              {button.totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-3 text-[15px] font-semibold text-foreground">Embed code</h2>
        <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-muted/50 p-3 text-[12px] text-foreground">
          {embedCode}
        </pre>
        <button
          type="button"
          onClick={copyCode}
          className="mt-3 flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground hover:opacity-90"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy Code
        </button>
      </div>
    </div>
  );
}
