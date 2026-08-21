"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Copy, ExternalLink, Package, Share2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/ui/status-badge";
import { PaymentPageTransactionsSection } from "@/components/payment-pages/PaymentPageTransactionsSection";
import { renderPageDescription } from "@/lib/payment-page-description-renderer";
import { paymentPagesSeed, paymentPageTransactionsSeed } from "@/lib/mock-data/payment-page-create";
import { formatDate } from "@/lib/utils";

function currencySymbol(currency: string) {
  return currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹";
}

export default function PaymentPageDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const page = paymentPagesSeed.find((p) => p.id === params.id);

  if (!page) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-4">
        <button
          type="button"
          onClick={() => router.push("/payment-products/payment-pages")}
          className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Payment Pages
        </button>
        <p className="text-[14px] text-muted-foreground">This payment page couldn&apos;t be found.</p>
      </div>
    );
  }

  const pageUrl = `https://pay.payglocal.in/${page.slug}`;
  const sym = currencySymbol(page.currency);

  const copyUrl = () => {
    navigator.clipboard.writeText(pageUrl).catch(() => {});
    toast.success("Page URL copied");
  };

  const shareUrl = () => {
    if (navigator.share) {
      navigator.share({ url: pageUrl, title: page.title }).catch(() => {});
    } else {
      copyUrl();
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <button
        type="button"
        onClick={() => router.push("/payment-products/payment-pages")}
        className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Payment Pages
      </button>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap gap-5 p-5">
          {page.product?.imageUrl ? (
            <img
              src={page.product.imageUrl}
              alt={page.product.name}
              className="h-28 w-28 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <div
              className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${page.brandColor}14`, color: page.brandColor }}
            >
              <Package className="h-9 w-9" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                {page.product?.name || page.title}
              </h1>
              <StatusBadge status={page.status} size="sm" />
            </div>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">Sold by {page.businessName}</p>

            {page.product?.description && (
              <div className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
                {renderPageDescription(page.product.description)}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                <Wallet className="h-3.5 w-3.5" />
                {page.amountType === "fixed"
                  ? `${sym}${Number(page.fixedAmount || 0).toLocaleString("en-IN")}`
                  : "Customer decides amount"}
              </span>
              <span className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Created on {formatDate(page.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
              <span className="max-w-[16rem] truncate text-[12.5px] font-medium text-foreground">{pageUrl}</span>
              <button
                type="button"
                onClick={copyUrl}
                aria-label="Copy page URL"
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={shareUrl}
                aria-label="Share page"
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <Share2 className="h-3.5 w-3.5" />
              </button>
              <a
                href={pageUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open page"
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-border border-t border-border sm:grid-cols-2">
          <div className="px-5 py-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Total Payments</p>
            <p className="mt-0.5 text-[18px] font-semibold text-foreground">{page.totalPayments}</p>
          </div>
          <div className="px-5 py-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Total Revenue</p>
            <p className="mt-0.5 text-[18px] font-semibold text-foreground">
              {sym}
              {page.totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      <PaymentPageTransactionsSection transactions={page.id === "pp_books" ? paymentPageTransactionsSeed : []} />
    </div>
  );
}
