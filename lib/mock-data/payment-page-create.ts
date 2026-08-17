import type { CustomFieldInputType, PaymentPageFormState, PaymentPageProduct } from "@/lib/payment-page-form-types";

export const customFieldInputTypeOptions: { id: CustomFieldInputType; label: string }[] = [
  { id: "single_line_text", label: "Single Line Text" },
  { id: "alphabets", label: "Alphabets" },
  { id: "alphanumeric", label: "Alphanumeric" },
  { id: "number", label: "Number" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone No." },
];

export const supportPhoneCountryOptions = ["+91 (IN)", "+1 (US)", "+44 (UK)", "+971 (UAE)", "+65 (SG)"];

function slugify(value: string, fallback: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

/** Builds the "{business}/{product}" path used in the merchant's live page URL, e.g. pay.payglocal.in/acme/books. */
export function paymentPageSlug(businessName: string, productName: string | undefined): string {
  const business = slugify(businessName, "acme");
  const product = slugify(productName ?? "", "your-page");
  return `${business}/${product}`;
}

/** Products recently sold through other payment pages, offered as quick-picks in the add-product dialog. */
export const recentProducts: PaymentPageProduct[] = [
  { id: "prod_books", name: "Books", description: "A curated set of books, ready to ship.", imageUrl: null },
  { id: "prod_consulting", name: "1:1 Consulting session", description: "A 45-minute strategy call.", imageUrl: null },
  { id: "prod_donation", name: "Support our work", description: "A one-time donation to support the project.", imageUrl: null },
];

export function initialPaymentPageForm(): PaymentPageFormState {
  return {
    businessName: "Acme Inc.",
    product: null,
    amountType: "fixed",
    fixedAmount: "",
    minAmount: "",
    emailFieldEnabled: true,
    emailFieldRequired: true,
    phoneFieldEnabled: true,
    phoneFieldRequired: true,
    billingAddressEnabled: false,
    customFields: [],
    contactUsEnabled: true,
    supportEmail: "support@acme-inc.com",
    supportPhone: "9876543210",
    supportPhoneCountry: "+91 (IN)",
    supportWebsite: "acme-inc.com",
    currency: "INR",
    brandColor: "#0061E3",
  };
}

export type PaymentPageSummary = {
  id: string;
  title: string;
  status: "draft" | "live" | "paused";
  businessName: string;
  product: PaymentPageProduct | null;
  brandColor: string;
  amountType: PaymentPageFormState["amountType"];
  fixedAmount: string;
  currency: string;
  createdAt: string;
  slug: string;
  totalPayments: number;
  totalRevenue: number;
};

export const paymentPagesSeed: PaymentPageSummary[] = [
  {
    id: "pp_books",
    title: "Books",
    status: "live",
    businessName: "Acme Inc.",
    product: {
      id: "prod_books",
      name: "Books",
      description: "A curated set of books, ready to ship.",
      imageUrl: null,
    },
    brandColor: "#0061E3",
    amountType: "customer_decides",
    fixedAmount: "",
    currency: "INR",
    createdAt: "2026-07-02",
    slug: "acme/books",
    totalPayments: 11,
    totalRevenue: 10254,
  },
  {
    id: "pp_consulting",
    title: "1:1 Consulting session",
    status: "live",
    businessName: "Acme Inc.",
    product: {
      id: "prod_consulting",
      name: "1:1 Consulting session",
      description: "A 45-minute strategy call.",
      imageUrl: null,
    },
    brandColor: "#7C3AED",
    amountType: "fixed",
    fixedAmount: "5000",
    currency: "USD",
    createdAt: "2026-07-18",
    slug: "acme/1-1-consulting-session",
    totalPayments: 4,
    totalRevenue: 20000,
  },
  {
    id: "pp_donation",
    title: "Support our work",
    status: "paused",
    businessName: "Acme Inc.",
    product: {
      id: "prod_donation",
      name: "Support our work",
      description: "A one-time donation to support the project.",
      imageUrl: null,
    },
    brandColor: "#059669",
    amountType: "customer_decides",
    fixedAmount: "",
    currency: "INR",
    createdAt: "2026-08-01",
    slug: "acme/support-our-work",
    totalPayments: 0,
    totalRevenue: 0,
  },
  {
    id: "pp_workshop",
    title: "Design workshop ticket",
    status: "draft",
    businessName: "Acme Inc.",
    product: {
      id: "prod_workshop",
      name: "Design workshop ticket",
      description: "Full-day in-person workshop, includes lunch.",
      imageUrl: null,
    },
    brandColor: "#DC2626",
    amountType: "fixed",
    fixedAmount: "1500",
    currency: "CAD",
    createdAt: "2026-08-08",
    slug: "acme/design-workshop-ticket",
    totalPayments: 0,
    totalRevenue: 0,
  },
];

export const paymentPageTransactionsSeed: {
  id: string;
  amount: number;
  currency: string;
  countryName: string;
  countryFlagIso2: string;
  remitterName: string;
  createdAt: string;
  status: "sent_for_review" | "invoice_pending" | "settled";
}[] = [
  { id: "pay_R1a2B3c4D5e6F7", amount: 0.5, currency: "CAD", countryName: "Canada", countryFlagIso2: "ca", remitterName: "frm2", createdAt: "2026-07-27T09:35:00", status: "sent_for_review" },
  { id: "pay_S8g9H0i1J2k3L4", amount: 1, currency: "USD", countryName: "United States", countryFlagIso2: "us", remitterName: "frm", createdAt: "2026-07-24T15:32:00", status: "invoice_pending" },
  { id: "pay_T5m6N7o8P9q0R1", amount: 20, currency: "CAD", countryName: "Canada", countryFlagIso2: "ca", remitterName: "puneethv", createdAt: "2026-07-24T12:28:00", status: "invoice_pending" },
  { id: "pay_U2s3T4u5V6w7X8", amount: 20, currency: "USD", countryName: "United States", countryFlagIso2: "us", remitterName: "puneethv", createdAt: "2026-07-24T12:27:00", status: "invoice_pending" },
  { id: "pay_V9y0Z1a2B3c4D5", amount: 10000, currency: "USD", countryName: "United States", countryFlagIso2: "us", remitterName: "apple", createdAt: "2026-07-23T10:23:00", status: "settled" },
  { id: "pay_W6e7F8g9H0i1J2", amount: 10, currency: "USD", countryName: "United States", countryFlagIso2: "us", remitterName: "test", createdAt: "2026-07-22T17:21:00", status: "sent_for_review" },
  { id: "pay_X3k4L5m6N7o8P9", amount: 50, currency: "USD", countryName: "United States", countryFlagIso2: "us", remitterName: "EEFC", createdAt: "2026-07-22T15:52:00", status: "settled" },
  { id: "pay_Y0q1R2s3T4u5V6", amount: 12, currency: "USD", countryName: "United States", countryFlagIso2: "us", remitterName: "puneethv", createdAt: "2026-07-22T14:42:00", status: "settled" },
  { id: "pay_Z7w8X9y0Z1a2B3", amount: 11, currency: "USD", countryName: "United States", countryFlagIso2: "us", remitterName: "puneethv", createdAt: "2026-07-22T14:39:00", status: "sent_for_review" },
  { id: "pay_A4c5D6e7F8g9H0", amount: 11, currency: "CAD", countryName: "Canada", countryFlagIso2: "ca", remitterName: "test", createdAt: "2026-07-22T14:23:00", status: "sent_for_review" },
  { id: "pay_B1i2J3k4L5m6N7", amount: 150, currency: "CAD", countryName: "Canada", countryFlagIso2: "ca", remitterName: "test", createdAt: "2026-07-22T14:07:00", status: "sent_for_review" },
];
