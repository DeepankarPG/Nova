"use client";

import { useState } from "react";
import { Building2, ExternalLink, Link2, MapPin, Pencil, QrCode } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import type { BankDetailsDraft, PaymentMethodsDraft } from "@/lib/invoice-form-types";
import { canUsePaymentLink, type MerchantProductsEnabled } from "@/lib/mock-data/merchant-products";
import { PaymentLinkUpsellCard } from "./PaymentLinkUpsellCard";

function MethodRow({
  icon: Icon,
  label,
  hint,
  enabled,
  onEnabledChange,
  badge,
  children,
}: {
  icon: React.ElementType;
  label: string;
  hint: string;
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  badge?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between px-3.5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[13.5px] font-medium text-foreground">{label}</p>
            <p className="text-[11.5px] text-muted-foreground">{hint}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          {badge}
          <Switch checked={enabled} onCheckedChange={onEnabledChange} aria-label={`Toggle ${label.toLowerCase()}`} />
        </div>
      </div>
      {enabled && children && <div className="border-t border-border p-3.5">{children}</div>}
    </div>
  );
}

export function PaymentDetailsSection({
  bankDetails,
  onBankDetailsChange,
  paymentMethods,
  onPaymentMethodsChange,
  merchantProducts,
  onEnableProducts,
}: {
  bankDetails: BankDetailsDraft;
  onBankDetailsChange: (patch: Partial<BankDetailsDraft>) => void;
  paymentMethods: PaymentMethodsDraft;
  onPaymentMethodsChange: (patch: Partial<PaymentMethodsDraft>) => void;
  merchantProducts: MerchantProductsEnabled;
  onEnableProducts: () => void;
}) {
  const paymentLinkAvailable = canUsePaymentLink(merchantProducts);
  const [editingBank, setEditingBank] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Building2 className="h-4 w-4" />
        </div>
        <h2 className="text-[15px] font-semibold text-foreground">How you&apos;ll be paid</h2>
      </div>

      <div className="space-y-3">
        <MethodRow
          icon={Building2}
          label="Local bank transfer"
          hint="Recipient pays directly into your bank account"
          enabled={paymentMethods.bankTransferEnabled}
          onEnabledChange={(bankTransferEnabled) => onPaymentMethodsChange({ bankTransferEnabled })}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">Bank details</span>
            {!editingBank && (
              <button
                type="button"
                onClick={() => setEditingBank(true)}
                className="flex items-center gap-1 text-[12.5px] font-medium text-primary hover:underline"
              >
                <Pencil className="h-3 w-3" />
                Change
              </button>
            )}
          </div>

          {editingBank ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-medium text-foreground">Account holder</label>
                  <Input
                    value={bankDetails.accountHolder}
                    onChange={(e) => onBankDetailsChange({ accountHolder: e.target.value })}
                    className="h-10 text-[13.5px]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-medium text-foreground">Account number</label>
                  <Input
                    value={bankDetails.accountNumber}
                    onChange={(e) => onBankDetailsChange({ accountNumber: e.target.value })}
                    className="h-10 font-mono text-[13.5px]"
                    placeholder="Masked for security"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-medium text-foreground">Bank name</label>
                  <Input
                    value={bankDetails.bankName}
                    onChange={(e) => onBankDetailsChange({ bankName: e.target.value })}
                    className="h-10 text-[13.5px]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-medium text-foreground">IFSC / Routing</label>
                  <Input
                    value={bankDetails.ifscOrRouting}
                    onChange={(e) => onBankDetailsChange({ ifscOrRouting: e.target.value })}
                    className="h-10 font-mono text-[13.5px]"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingBank(false)}
                className="h-9 rounded-lg bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:opacity-90"
              >
                Done
              </button>
            </div>
          ) : (
            <dl className="space-y-2.5">
              {[
                { label: "Account holder", value: bankDetails.accountHolder },
                { label: "Account no.", value: bankDetails.accountNumber },
                { label: "Bank", value: bankDetails.bankName },
                { label: "IFSC / Routing", value: bankDetails.ifscOrRouting },
              ].map((row) => (
                <div key={row.label} className="flex gap-3">
                  <dt className="w-28 shrink-0 text-[12px] text-muted-foreground">{row.label}</dt>
                  <dd className="text-[13px] font-semibold text-foreground">{row.value || "-"}</dd>
                </div>
              ))}
            </dl>
          )}
        </MethodRow>

        <MethodRow
          icon={Link2}
          label="Payment link"
          hint="Recipient pays online through a hosted link"
          enabled={paymentMethods.paymentLinkEnabled}
          onEnabledChange={(paymentLinkEnabled) => onPaymentMethodsChange({ paymentLinkEnabled })}
          badge={
            !paymentLinkAvailable && (
              <span className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                Not enabled
              </span>
            )
          }
        >
          {paymentLinkAvailable ? (
            <>
              <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
                Payment link
              </label>
              <Input
                value={paymentMethods.paymentLinkUrl}
                onChange={(e) => onPaymentMethodsChange({ paymentLinkUrl: e.target.value })}
                placeholder="pay.payglocal.in/inv/..."
                className="h-10 font-mono text-[13px]"
              />
              <p className="mt-1.5 text-[11.5px] text-muted-foreground">
                Shared with the recipient so they can pay online instead of by transfer.
              </p>
            </>
          ) : (
            <PaymentLinkUpsellCard onEnable={onEnableProducts} />
          )}
        </MethodRow>

        <MethodRow
          icon={ExternalLink}
          label="External payment link"
          hint="Already have an online payment link? Paste it here"
          enabled={paymentMethods.externalPaymentLinkEnabled}
          onEnabledChange={(externalPaymentLinkEnabled) => onPaymentMethodsChange({ externalPaymentLinkEnabled })}
        >
          <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
            Payment link
          </label>
          <Input
            value={paymentMethods.externalPaymentLinkUrl}
            onChange={(e) => onPaymentMethodsChange({ externalPaymentLinkUrl: e.target.value })}
            placeholder="Put your online payment link from any platform here"
            className="h-10 font-mono text-[13px]"
          />
          <p className="mt-1.5 text-[11.5px] text-muted-foreground">
            We&apos;ll add this to your invoice automatically, whichever platform it&apos;s from.
          </p>
        </MethodRow>

        <MethodRow
          icon={QrCode}
          label="Virtual account QR"
          hint="Recipient scans to see your virtual account details"
          enabled={paymentMethods.qrCodeEnabled}
          onEnabledChange={(qrCodeEnabled) => onPaymentMethodsChange({ qrCodeEnabled })}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted">
              <QrCode className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-[12.5px] text-muted-foreground">
              Scanning shows the recipient your virtual account details for their location, so they can pay by bank
              transfer without a gateway.
            </p>
          </div>
          <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-muted/40 px-3 py-2 text-[11.5px] text-muted-foreground">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            The account details shown adjust automatically based on where the recipient is paying from.
          </div>
        </MethodRow>
      </div>
    </div>
  );
}
