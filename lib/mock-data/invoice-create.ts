// Mock data backing /invoice-management/create: templates, billing contacts,
// and the line-item catalog used to seed a new invoice draft.

export type InvoiceTemplate = {
  id: string;
  name: string;
  description: string;
  createdAt: string; // YYYY-MM-DD
  usageCount: number;
};

export const invoiceTemplates: InvoiceTemplate[] = [
  { id: "tpl_payflow_monthly", name: "Payflow design - monthly", description: "Recurring platform + usage billing", createdAt: "2026-05-12", usageCount: 24 },
  { id: "tpl_standard", name: "Standard invoice", description: "Simple one-off invoice", createdAt: "2026-06-02", usageCount: 9 },
  { id: "tpl_project", name: "Project milestone", description: "Milestone-based project billing", createdAt: "2026-07-18", usageCount: 4 },
];

export type BillingContact = {
  id: string;
  name: string;
  email: string;
};

/** Seeded from the customers already appearing in `invoices` (lib/mock-data/index.ts). */
export const billingContacts: BillingContact[] = [
  { id: "bc_acme", name: "Acme Corp", email: "accounts@acmecorp.in" },
  { id: "bc_techventures", name: "TechVentures Ltd", email: "accounts@techventures.io" },
  { id: "bc_global_imports", name: "Global Imports Inc", email: "finance@globalimports.com" },
  { id: "bc_startuphub", name: "StartupHub", email: "pay@startuphub.co" },
  { id: "bc_nimbus", name: "Nimbus Retail", email: "ap@nimbusretail.com" },
];

export type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export const lineItemPresets: Omit<InvoiceLineItem, "id">[] = [
  { description: "Monthly platform fee", quantity: 1, unitPrice: 25000 },
  { description: "API usage", quantity: 1, unitPrice: 3000 },
  { description: "Support retainer", quantity: 1, unitPrice: 15000 },
];

export const taxOptions = ["None", "5% GST", "12% GST", "18% GST", "28% GST"] as const;

export const notifyChannels = ["SMS", "Email", "WhatsApp"] as const;
export type NotifyChannel = (typeof notifyChannels)[number];

export type RecentCustomerAddress = {
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type RecentCustomer = {
  id: string;
  name: string;
  email: string;
  address: RecentCustomerAddress;
};

export const recentCustomers: RecentCustomer[] = [
  {
    id: "rc_priya",
    name: "Priya Mehta",
    email: "priya@startupxyz.in",
    address: { line1: "14 MG Road", city: "Bengaluru", state: "Karnataka", postalCode: "560001", country: "India" },
  },
  {
    id: "rc_rohan",
    name: "Rohan Shah",
    email: "rohan@venture.co",
    address: { line1: "221 Linking Road", city: "Mumbai", state: "Maharashtra", postalCode: "400050", country: "India" },
  },
  {
    id: "rc_deepankar",
    name: "Deepankar Kumar",
    email: "deepankar@acmecorp.in",
    address: { line1: "Street 123, Chikkanhalli", city: "Bengaluru", state: "Karnataka", postalCode: "560035", country: "India" },
  },
  {
    id: "rc_acme",
    name: "Acme Corp",
    email: "accounts@acmecorp.in",
    address: { line1: "1 Corporate Park", city: "Gurugram", state: "Haryana", postalCode: "122002", country: "India" },
  },
];

export const billerProfile = {
  name: "Bhavya Artworks",
  address: "Street 123, Chikkanhalli,\nBengaluru 560035",
  gstin: "29AABCU9603R1ZX",
};

export const defaultBankDetails = {
  accountHolder: "Bhavya Artworks",
  accountNumber: "XXXXXXXX9064",
  bankName: "Currency Cloud",
  ifscOrRouting: "TCCLGB3L",
};

export const currencyOptions = ["INR", "USD", "EUR", "GBP", "SGD", "AED"];

export const currencyFlags: Record<string, string> = {
  INR: "🇮🇳",
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  SGD: "🇸🇬",
  AED: "🇦🇪",
  NZD: "🇳🇿",
  AUD: "🇦🇺",
  CAD: "🇨🇦",
};

/** ISO 3166-1 alpha-2 (lowercase) used for flagcdn.com images */
export const currencyFlagIso2: Record<string, string> = {
  INR: "in",
  USD: "us",
  EUR: "eu",
  GBP: "gb",
  SGD: "sg",
  AED: "ae",
  NZD: "nz",
  AUD: "au",
  CAD: "ca",
};

export type InvoiceLayout = "classic" | "minimal-mono" | "bold-sidebar" | "playful-border" | "y2k-bold" | "geometric-modern";

export type InvoiceBrandingStyle = {
  id: string;
  name: string;
  isNew?: boolean;
  layout: InvoiceLayout;
  /** Fallback primary/accent when the user hasn't overridden them for this invoice. */
  defaultPrimaryColor: string;
  defaultAccentColor: string;
};

export const invoiceBrandingStyles: InvoiceBrandingStyle[] = [
  { id: "style_classic", name: "Classic", layout: "classic", defaultPrimaryColor: "#0061E3", defaultAccentColor: "#0061E3" },
  { id: "style_minimal_mono", name: "Minimal Mono", layout: "minimal-mono", defaultPrimaryColor: "#1F2937", defaultAccentColor: "#9CA3AF" },
  { id: "style_bold_sidebar", name: "Bold Sidebar", isNew: true, layout: "bold-sidebar", defaultPrimaryColor: "#1E3A8A", defaultAccentColor: "#C2410C" },
  { id: "style_playful_border", name: "Playful Border", isNew: true, layout: "playful-border", defaultPrimaryColor: "#3730A3", defaultAccentColor: "#EAB308" },
  { id: "style_y2k_bold", name: "Y2K Bold", isNew: true, layout: "y2k-bold", defaultPrimaryColor: "#0F0F0F", defaultAccentColor: "#EC4899" },
  { id: "style_geometric_modern", name: "Geometric Modern", layout: "geometric-modern", defaultPrimaryColor: "#4C4499", defaultAccentColor: "#A3E635" },
];

export const languageOptions = [
  "English",
  "Chinese (Simplified)",
  "Chinese (Traditional)",
  "Czech",
  "Dutch",
  "French",
  "German",
  "Hindi",
  "Italian",
  "Japanese",
  "Korean",
  "Polish",
  "Portuguese",
  "Russian",
  "Spanish",
] as const;

export const recurringFrequencies = [
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "quarterly", label: "Quarterly" },
  { id: "yearly", label: "Yearly" },
] as const;

export type RecurringFrequency = (typeof recurringFrequencies)[number]["id"];

export const dueTermOptions = [
  { id: "today", label: "Today", days: 0 },
  { id: "tomorrow", label: "Tomorrow", days: 1 },
  { id: "days_7", label: "7 days", days: 7 },
  { id: "days_14", label: "14 days", days: 14 },
  { id: "days_30", label: "30 days", days: 30 },
  { id: "days_45", label: "45 days", days: 45 },
  { id: "days_60", label: "60 days", days: 60 },
  { id: "days_90", label: "90 days", days: 90 },
] as const;

export type DueTermPresetId = (typeof dueTermOptions)[number]["id"];
export type DueTermId = DueTermPresetId | "custom";

export const GST_RATE = 0.18;
