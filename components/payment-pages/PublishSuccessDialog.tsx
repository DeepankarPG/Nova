"use client";

import { CheckCircle2, Copy, Pencil, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PaymentPagePreview } from "./PaymentPagePreview";
import type { PaymentPageFormState } from "@/lib/payment-page-form-types";

export function PublishSuccessDialog({
  open,
  onOpenChange,
  form,
  pageUrl,
  onCustomiseUrl,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: PaymentPageFormState;
  pageUrl: string;
  onCustomiseUrl: () => void;
}) {
  const copyUrl = () => {
    navigator.clipboard.writeText(pageUrl).catch(() => {});
    toast.success("Page URL copied");
  };

  const shareUrl = () => {
    if (navigator.share) {
      navigator.share({ url: pageUrl, title: form.product?.name || form.businessName }).catch(() => {});
    } else {
      copyUrl();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_16rem]">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {form.product?.name || form.businessName}
            </p>
            <DialogTitle>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Your page is now live!
              </span>
            </DialogTitle>

            <div className="mt-5">
              <label className="mb-1.5 block text-[12px] font-medium text-muted-foreground">Page URL</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 truncate rounded-lg border border-border bg-muted/40 px-3.5 py-2.5 text-[13px] font-medium text-foreground">
                  {pageUrl}
                </div>
                <button
                  type="button"
                  onClick={copyUrl}
                  className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground hover:opacity-90"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </button>
                <button
                  type="button"
                  onClick={shareUrl}
                  className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground hover:opacity-90"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </button>
                <button
                  type="button"
                  onClick={onCustomiseUrl}
                  className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-border px-3.5 text-[13px] font-semibold text-foreground hover:bg-muted/50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Customise URL
                </button>
              </div>
            </div>
          </div>

          <div
            className="hidden overflow-hidden rounded-xl border border-border shadow-sm sm:block"
            style={{ height: 220, position: "relative" }}
          >
            <div style={{ width: 640, height: 480, transform: "scale(0.375)", transformOrigin: "top left" }}>
              <PaymentPagePreview form={form} className="h-[480px] w-[640px] bg-card" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
