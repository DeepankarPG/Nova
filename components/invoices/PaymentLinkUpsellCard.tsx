"use client";

import { MousePointerClick } from "lucide-react";

export function PaymentLinkUpsellCard({ onEnable }: { onEnable: () => void }) {
  return (
    <div>
      <div className="relative mb-4 flex h-28 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="relative flex h-16 w-24 flex-col gap-1.5 rounded-md border border-border bg-card p-2.5 shadow-sm">
          <span className="h-1.5 w-3/4 rounded-full bg-muted" />
          <span className="h-1.5 w-1/2 rounded-full bg-muted" />
          <span className="mt-auto inline-flex h-4 w-12 items-center justify-center rounded-full bg-primary text-[7px] font-semibold text-primary-foreground">
            Pay now
          </span>
        </div>
        <MousePointerClick className="absolute bottom-6 right-[38%] h-4 w-4 rotate-[-8deg] text-foreground" />
      </div>

      <p className="text-center text-[13.5px] font-semibold text-foreground">Add a payment link to this invoice</p>
      <p className="mx-auto mt-1 max-w-[26rem] text-center text-[12px] text-muted-foreground">
        Let recipients pay online by card or bank transfer, in their own currency. Enable cards or international
        payment gateways for your account to turn this on.
      </p>

      <button
        type="button"
        onClick={onEnable}
        className="mt-4 w-full rounded-lg bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground hover:opacity-90"
      >
        Enable now
      </button>
    </div>
  );
}
