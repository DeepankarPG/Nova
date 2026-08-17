"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { PaymentPagePreview } from "./PaymentPagePreview";
import { MobilePaymentPagePreview } from "./MobilePaymentPagePreview";
import { paymentPageSlug } from "@/lib/mock-data/payment-page-create";
import type { PaymentPageFormState } from "@/lib/payment-page-form-types";

export function PaymentPagePreviewSidebar({ form }: { form: PaymentPageFormState }) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const slug = paymentPageSlug(form.businessName, form.product?.name);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="pl-[6.5%] text-[13px] font-semibold uppercase tracking-wide text-foreground">Preview</h2>
        <Tabs value={device} onValueChange={(v) => setDevice(v as "desktop" | "mobile")}>
          <TabsList className="h-auto gap-1 rounded-lg border border-border bg-muted/30 p-1">
            <TabsTrigger
              value="desktop"
              className="rounded-md px-3.5 py-1.5 text-[13px] font-medium data-[state=active]:border data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Desktop
            </TabsTrigger>
            <TabsTrigger
              value="mobile"
              className="rounded-md px-3.5 py-1.5 text-[13px] font-medium data-[state=active]:border data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Mobile
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {device === "desktop" ? (
        <div className="mx-auto w-[87%] overflow-hidden rounded-none border border-border bg-card shadow-md">
          <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-3.5 py-2.5">
            <span className="flex shrink-0 items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded-full bg-red-400" />
              <span className="h-3.5 w-3.5 rounded-full bg-yellow-400" />
              <span className="h-3.5 w-3.5 rounded-full bg-green-400" />
            </span>
            <span className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-card px-3 py-1 text-[11.5px] text-muted-foreground">
              <Lock className="h-3 w-3" />
              pay.payglocal.in/{slug}
            </span>
          </div>

          <PaymentPagePreview form={form} className="border-0 bg-card shadow-none" />
        </div>
      ) : (
        <div className="flex justify-center rounded-2xl border border-border bg-muted/20 p-6">
          <div className="w-full max-w-[300px] overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-md">
            <div className={cn("flex items-center justify-center border-b border-border py-2")}>
              <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[10px] text-muted-foreground">
                <Lock className="h-2.5 w-2.5" />
                pay.payglocal.in/{slug}
              </span>
            </div>
            <MobilePaymentPagePreview form={form} />
          </div>
        </div>
      )}
    </div>
  );
}
