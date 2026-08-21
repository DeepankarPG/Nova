"use client";

import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EmbedCodeBlock } from "./EmbedCodeBlock";
import { buildButtonEmbedCode, type PaymentButtonFormState } from "@/lib/payment-button-form-types";

function SuccessIllustration({ label, brandColor }: { label: string; brandColor: string }) {
  return (
    <div className="relative flex h-[130px] w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
      <div className="relative flex w-[190px] flex-col gap-2 rounded-xl border border-border bg-card px-4 py-3.5 shadow-md">
        <span className="h-2 w-24 rounded-full bg-muted" />
        <span className="h-2 w-16 rounded-full bg-muted" />
        <span
          className="mt-1.5 flex h-8 w-fit items-center gap-1.5 rounded-full px-4 text-[12.5px] font-semibold text-white"
          style={{ backgroundColor: brandColor }}
        >
          <Check className="h-3 w-3" strokeWidth={3} />
          {label || "Pay Now"}
        </span>

        <span className="absolute -right-2.5 -top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ring-4 ring-card">
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
      </div>
    </div>
  );
}

export function PublishButtonSuccessDialog({
  open,
  onOpenChange,
  form,
  buttonId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: PaymentButtonFormState;
  buttonId: string;
}) {
  const embedCode = buildButtonEmbedCode(form, buttonId);

  const copyCode = () => {
    navigator.clipboard.writeText(embedCode).catch(() => {});
    toast.success("Embed code copied");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <SuccessIllustration label={form.buttonLabel} brandColor={form.brandColor} />

        <div className="mt-4 flex flex-col items-center text-center">
          <DialogTitle className="pr-0 text-center">Your payment button is live</DialogTitle>
          <p className="mt-1 text-[13px] text-muted-foreground">
            &quot;{form.title || form.buttonLabel}&quot; is ready to accept payments. Add the snippet below to your
            website to start collecting them.
          </p>
        </div>

        <div className="mt-5">
          <EmbedCodeBlock code={embedCode} label="HTML code" />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button variant="outline" size="sm" className="w-full" leftIcon={<Copy className="h-3.5 w-3.5" />} onClick={copyCode}>
            Copy code
          </Button>
          <Button variant="primary" size="sm" className="w-full" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
