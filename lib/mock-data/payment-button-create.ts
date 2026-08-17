import type { PaymentButtonFormState } from "@/lib/payment-button-form-types";
import type { AmountType } from "@/lib/payment-page-form-types";

export function initialPaymentButtonForm(): PaymentButtonFormState {
  return {
    title: "",
    buttonLabel: "Pay Now",
    buttonType: "custom",
    theme: "brand_color",
    brandColor: "#0061E3",
    cornerRadius: "rounded",
    size: "medium",
    fixedAmount: "",
    currency: "INR",
    nameFieldEnabled: true,
    addressFieldEnabled: false,
    emailFieldEnabled: true,
    phoneFieldEnabled: true,
    contactUsEnabled: true,
    supportEmail: "support@acme-inc.com",
    supportPhone: "9876543210",
    supportPhoneCountry: "+91 (IN)",
    supportWebsite: "acme-inc.com",
    customFields: [],
  };
}

export type PaymentButtonSummary = {
  id: string;
  publicId: string;
  title: string;
  status: "draft" | "live" | "paused";
  buttonLabel: string;
  amountType: AmountType;
  fixedAmount: string;
  currency: string;
  createdAt: string;
  linkedPageId: string | null;
  totalPayments: number;
  totalRevenue: number;
};

export const paymentButtonsSeed: PaymentButtonSummary[] = [
  {
    id: "pb_website1",
    publicId: "pl_TOIAYILUARsiPl",
    title: "Website-1",
    status: "live",
    buttonLabel: "Pay Now",
    amountType: "fixed",
    fixedAmount: "5000",
    currency: "INR",
    createdAt: "2026-07-20",
    linkedPageId: "pp_consulting",
    totalPayments: 102,
    totalRevenue: 30000,
  },
  {
    id: "pb_donate_widget",
    publicId: "pl_QXZ81FnKdEurLo",
    title: "Donate widget",
    status: "live",
    buttonLabel: "Donate",
    amountType: "customer_decides",
    fixedAmount: "",
    currency: "INR",
    createdAt: "2026-08-02",
    linkedPageId: "pp_donation",
    totalPayments: 12,
    totalRevenue: 1200,
  },
  {
    id: "pb_workshop_checkout",
    publicId: "pl_9mVebGtyXsQ2Rp",
    title: "Workshop checkout",
    status: "draft",
    buttonLabel: "Buy Ticket",
    amountType: "fixed",
    fixedAmount: "1500",
    currency: "CAD",
    createdAt: "2026-08-09",
    linkedPageId: null,
    totalPayments: 0,
    totalRevenue: 0,
  },
];
