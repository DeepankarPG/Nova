import type { ProductTab } from "@/lib/workspace-types";

// ─── Report scope ────────────────────────────────────────────────────────────
// A report can belong to PG, MCA, or both ("home" reports show everywhere).
export type ReportProduct = "pg" | "mca";

export type ReportCategory =
  | "Payments"
  | "Payment Links & Pages"
  | "Settlements"
  | "Disputes & Chargebacks"
  | "Refunds"
  | "Multi-Currency Accounts"
  | "Invoices"
  | "Compliance & Regulatory"
  | "Customers";

export type ReportKind = "standard" | "custom";

export type ReportFormat = "csv" | "xlsx" | "txt" | "pdf";

export type ReportDefinition = {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  products: ReportProduct[];
  kind: ReportKind;
  /** lucide icon name resolved in the UI layer */
  icon:
    | "link"
    | "file-text"
    | "refresh-ccw"
    | "list"
    | "arrow-right"
    | "indian-rupee"
    | "landmark"
    | "receipt"
    | "globe"
    | "badge-check"
    | "users"
    | "alert-triangle"
    | "credit-card"
    | "shield-alert"
    | "file-warning"
    | "scale"
    | "wallet"
    | "banknote"
    | "clipboard-list"
    | "file-check";
  /** columns available if a merchant builds a custom variant from this base type */
  availableColumnGroups?: { group: string; columns: string[] }[];
  /** Format shown as the file-type badge on report cards; also the pre-selected format in Download/Schedule. */
  defaultFormat: ReportFormat;
  createdBy?: string; // for custom reports
  createdAt?: string; // ISO, for custom reports
  /** Column headers + 2-3 sample rows shown in the download preview, before generating */
  preview?: { columns: string[]; rows: string[][] };
  /**
   * Present on custom reports saved from the builder — lets "Report type" reopen this
   * exact configuration (columns, labels, order, format) instead of starting from a
   * blank/standard template.
   */
  savedTemplateConfig?: {
    selectedColumns: { id: string; group: string; column: string; label: string }[];
    format: ReportFormat;
  };
};

// ─── Standard report catalog ─────────────────────────────────────────────────

export const standardReports: ReportDefinition[] = [
  // ── 1. Payments (Core Transactions) ─────────────────────────────────────
  {
    id: "rpt_all_payments",
    name: "All Payments",
    description: "Every transaction across all payment modes. Filter by date range, status, currency, and payment method.",
    category: "Payments",
    products: ["pg"],
    kind: "standard",
    icon: "indian-rupee",
    defaultFormat: "csv",
    availableColumnGroups: [
      {
        group: "Payments",
        columns: [
          "Txn ID", "Date", "Amount", "Currency", "INR Settled Amount", "Method", "Status", "Merchant Order ID",
          "Amount Refunded", "Amount Transferred", "Auth Code", "Bank", "Captured At", "Card ID", "Card Network",
          "Contact", "Email", "Error Code", "Error Description", "Fee", "International", "Tax", "Wallet",
        ],
      },
    ],
    preview: {
      columns: ["Txn ID", "Date", "Amount", "Method", "Status"],
      rows: [
        ["pay_N4tXz2A", "2 Jul 2026", "₹2,340.00", "UPI", "Captured"],
        ["pay_M3sWy1B", "2 Jul 2026", "₹6,750.00", "Card", "Failed"],
        ["pay_L2rVx0C", "1 Jul 2026", "₹18,900.00", "Netbanking", "Captured"],
      ],
    },
  },
  {
    id: "rpt_cards_payment",
    name: "Cards Payment Report",
    description:
      "Card-specific transactions. Filter by card network (Visa/Mastercard/Amex), card type (credit/debit), and issuing country.",
    category: "Payments",
    products: ["pg"],
    kind: "standard",
    icon: "credit-card",
    defaultFormat: "csv",
    availableColumnGroups: [
      {
        group: "Cards Payment Report",
        columns: ["Txn ID", "Card Network", "BIN / Country", "Auth Code", "3DS Status", "Amount", "Card Type", "Issuing Bank"],
      },
    ],
  },
  {
    id: "rpt_failed_declined_payments",
    name: "Failed/Declined Payments",
    description: "Failed attempts with decline reason. Filter by decline reason code and gateway response.",
    category: "Payments",
    products: ["pg"],
    kind: "standard",
    icon: "alert-triangle",
    defaultFormat: "csv",
    availableColumnGroups: [
      {
        group: "Failed/Declined Payments",
        columns: ["Txn ID", "Decline Reason", "Bank Response Code", "Retry Status", "Amount", "Method", "Created At"],
      },
    ],
  },
  {
    id: "rpt_international_card_txns",
    name: "International Card Transactions",
    description: "Cross-border card-specific view. Filter by issuing country, card scheme, and FX markup.",
    category: "Payments",
    products: ["pg"],
    kind: "standard",
    icon: "globe",
    defaultFormat: "csv",
    availableColumnGroups: [
      {
        group: "International Card Transactions",
        columns: ["Txn ID", "Cardholder Country", "FX Rate Applied", "Markup", "Card Scheme", "Amount"],
      },
    ],
  },
  {
    id: "rpt_standing_instructions",
    name: "Standing Instructions (SI) Report",
    description:
      "All recurring/mandate-based payments — UPI Autopay, e-mandate, and card SI. Filter by mandate status, frequency, and next debit date.",
    category: "Payments",
    products: ["pg"],
    kind: "standard",
    icon: "refresh-ccw",
    defaultFormat: "csv",
    availableColumnGroups: [
      {
        group: "Standing Instructions (SI) Report",
        columns: [
          "Mandate ID", "Txn ID", "Customer Contact", "Amount", "Frequency", "Mandate Status",
          "Next Debit Date", "Failure Reason", "Created At",
        ],
      },
    ],
  },

  // ── 2. Payment Links & Payment Pages ─────────────────────────────────────
  {
    id: "rpt_payment_links",
    name: "Payment Links Report",
    description: "All links created and their status. Filter by created date, expiry, and status (paid/unpaid/expired).",
    category: "Payment Links & Pages",
    products: ["pg"],
    kind: "standard",
    icon: "link",
    defaultFormat: "csv",
    availableColumnGroups: [
      {
        group: "Payment Links Report",
        columns: ["Link ID", "Amount", "Currency", "Purpose / Description", "Status", "Customer Email", "Customer Phone", "Created At", "Expiry"],
      },
    ],
    preview: {
      columns: ["Link ID", "Amount", "Status", "Customer", "Created"],
      rows: [
        ["plink_9K2mQ", "₹4,500.00", "Paid", "Ravi Shankar", "2 Jul 2026"],
        ["plink_8H1nR", "₹12,000.00", "Expired", "Meera Iyer", "1 Jul 2026"],
        ["plink_7G0oS", "₹899.00", "Paid", "Arjun Verma", "1 Jul 2026"],
      ],
    },
  },
  {
    id: "rpt_payment_link_compliance",
    name: "Payment Link Compliance Report",
    description: "Visa TL attestation fields — purpose category and attestation status per link.",
    category: "Payment Links & Pages",
    products: ["pg"],
    kind: "standard",
    icon: "shield-alert",
    defaultFormat: "csv",
    availableColumnGroups: [
      {
        group: "Payment Link Compliance Report",
        columns: ["Link ID", "Purpose Text", "Category Tag", "Attestation Status", "Attestation Timestamp"],
      },
    ],
  },
  {
    id: "rpt_payment_page",
    name: "Payment Page Report",
    description: "Page-based collections. Filter by page ID and template used.",
    category: "Payment Links & Pages",
    products: ["pg"],
    kind: "standard",
    icon: "file-text",
    defaultFormat: "csv",
    availableColumnGroups: [
      {
        group: "Payment Page Report",
        columns: ["Page ID", "Page Name", "Txn Count", "Conversion Rate", "Amount Collected"],
      },
    ],
  },
  {
    id: "rpt_payment_button",
    name: "Payment Button Report",
    description: "Details of all payments created in the selected time range using Payment Button.",
    category: "Payment Links & Pages",
    products: ["pg"],
    kind: "standard",
    icon: "file-text",
    defaultFormat: "csv",
  },
  {
    id: "rpt_bulk_payment_page",
    name: "Bulk Payment Page Report",
    description: "Bulk-generated link/page batches. Filter by batch ID and upload date.",
    category: "Payment Links & Pages",
    products: ["pg"],
    kind: "standard",
    icon: "file-text",
    defaultFormat: "xlsx",
    availableColumnGroups: [
      {
        group: "Bulk Payment Page Report",
        columns: ["Batch ID", "Total Links", "Success Count", "Fail Count", "Upload Date"],
      },
    ],
  },

  // ── 3. Settlements ────────────────────────────────────────────────────────
  {
    id: "rpt_settlements",
    name: "Settlements Report",
    description: "Settlement batches to merchant bank. Filter by settlement date, UTR, and bank account.",
    category: "Settlements",
    products: ["pg", "mca"],
    kind: "standard",
    icon: "landmark",
    defaultFormat: "xlsx",
    availableColumnGroups: [
      {
        group: "Settlements Report",
        columns: ["Settlement ID", "UTR", "Amount", "Currency", "T+1 / T+n Date", "Bank Account"],
      },
    ],
    preview: {
      columns: ["Settlement ID", "Amount", "Bank Account", "UTR", "Settled"],
      rows: [
        ["setl_7Q1kM", "₹8,42,300.00", "HDFC ****4521", "UTR2607020091", "2 Jul 2026"],
        ["setl_6P0jL", "₹6,18,750.00", "HDFC ****4521", "UTR2607010084", "1 Jul 2026"],
      ],
    },
  },
  {
    id: "rpt_settlement_recon",
    name: "Settlement Recon Report",
    description: "Txn-level mapping to settlement batch. Filter by settlement ID and txn ID.",
    category: "Settlements",
    products: ["pg", "mca"],
    kind: "standard",
    icon: "landmark",
    defaultFormat: "xlsx",
    availableColumnGroups: [
      {
        group: "Settlement Recon Report",
        columns: ["Txn ID", "Settlement ID", "Gross Amount", "Fees Deducted", "Net Settled"],
      },
      {
        group: "Settlements",
        columns: ["Settlement ID", "Amount", "UTR", "Status", "Bank Account", "Settled At"],
      },
    ],
  },
  {
    id: "rpt_pending_settlements",
    name: "Pending Settlements",
    description: "Not-yet-settled transactions. Filter by aging bucket.",
    category: "Settlements",
    products: ["pg", "mca"],
    kind: "standard",
    icon: "landmark",
    defaultFormat: "csv",
    availableColumnGroups: [
      {
        group: "Pending Settlements",
        columns: ["Txn ID", "Days Pending", "Expected Settlement Date", "Amount"],
      },
    ],
  },
  {
    id: "rpt_fx_settlement",
    name: "FX Settlement Report",
    description: "Currency conversion detail per settlement. Filter by source currency, conversion rate, and markup.",
    category: "Settlements",
    products: ["mca"],
    kind: "standard",
    icon: "banknote",
    defaultFormat: "xlsx",
    availableColumnGroups: [
      {
        group: "FX Settlement Report",
        columns: ["Txn ID", "FX Rate", "PayGlocal Rate vs Interbank Rate", "Spread Earned"],
      },
    ],
  },

  // ── 4. Disputes & Chargebacks ────────────────────────────────────────────
  {
    id: "rpt_chargebacks",
    name: "Chargeback Report",
    description: "All chargeback cases. Filter by status (open/won/lost) and reason code.",
    category: "Disputes & Chargebacks",
    products: ["pg", "mca"],
    kind: "standard",
    icon: "alert-triangle",
    defaultFormat: "csv",
    availableColumnGroups: [
      {
        group: "Chargeback Report",
        columns: ["Case ID", "Txn ID", "Reason Code", "Amount", "Deadline", "Current Status"],
      },
    ],
  },
  {
    id: "rpt_dispute_evidence_tracker",
    name: "Dispute Evidence Tracker",
    description: "Docs submitted vs required. Filter by evidence status.",
    category: "Disputes & Chargebacks",
    products: ["pg", "mca"],
    kind: "standard",
    icon: "clipboard-list",
    defaultFormat: "csv",
    availableColumnGroups: [
      {
        group: "Dispute Evidence Tracker",
        columns: ["Case ID", "Docs Uploaded", "Missing Docs", "Submission Deadline"],
      },
    ],
  },
  {
    id: "rpt_chargeback_ratio",
    name: "Chargeback Ratio Report",
    description: "Merchant-level chargeback ratio trend. Filter by monthly or rolling window.",
    category: "Disputes & Chargebacks",
    products: ["pg", "mca"],
    kind: "standard",
    icon: "scale",
    defaultFormat: "xlsx",
    availableColumnGroups: [
      {
        group: "Chargeback Ratio Report",
        columns: ["Month", "Total Txns", "CB Count", "CB Ratio %", "Network Threshold Flag"],
      },
    ],
  },

  // ── 5. Refunds ────────────────────────────────────────────────────────────
  {
    id: "rpt_refunds",
    name: "Refunds Report",
    description: "All refunds issued. Filter by status (processed/pending/failed) and refund type (full/partial).",
    category: "Refunds",
    products: ["pg"],
    kind: "standard",
    icon: "refresh-ccw",
    defaultFormat: "csv",
    availableColumnGroups: [
      {
        group: "Refunds Report",
        columns: ["Refund ID", "Original Txn ID", "Amount", "Currency", "Initiated Date", "Processed Date", "Status", "Speed Requested", "Speed Processed", "Fee"],
      },
    ],
  },
  {
    id: "rpt_refund_reconciliation",
    name: "Refund Reconciliation",
    description: "Refund vs original settlement mapping. Filter by settlement batch.",
    category: "Refunds",
    products: ["pg"],
    kind: "standard",
    icon: "refresh-ccw",
    defaultFormat: "xlsx",
    availableColumnGroups: [
      {
        group: "Refund Reconciliation",
        columns: ["Refund ID", "Original Settlement ID", "Net Impact on Settlement"],
      },
    ],
  },

  // ── 6. Multi-Currency Accounts (MCA) ──────────────────────────────────────
  {
    id: "rpt_mca_statement",
    name: "MCA Statement",
    description: "Bank-style account statement per currency. Filter by currency, account, and date range.",
    category: "Multi-Currency Accounts",
    products: ["mca"],
    kind: "standard",
    icon: "wallet",
    defaultFormat: "pdf",
    availableColumnGroups: [
      {
        group: "MCA Statement",
        columns: ["Date", "Description", "Credit", "Debit", "Running Balance"],
      },
    ],
  },
  {
    id: "rpt_collections",
    name: "Collections Report",
    description: "Inbound receipts into MCA. Filter by currency, sender country, and purpose code.",
    category: "Multi-Currency Accounts",
    products: ["mca"],
    kind: "standard",
    icon: "wallet",
    defaultFormat: "csv",
    availableColumnGroups: [
      {
        group: "Collections Report",
        columns: ["Receipt ID", "Amount", "Currency", "Sender Name", "Sender Country", "Purpose Code"],
      },
    ],
  },
  {
    id: "rpt_fira",
    name: "FIRA Report",
    description: "Foreign Inward Remittance Advice, auto-generated. Filter by date and txn ID.",
    category: "Multi-Currency Accounts",
    products: ["mca"],
    kind: "standard",
    icon: "file-check",
    defaultFormat: "pdf",
    availableColumnGroups: [
      {
        group: "FIRA Report",
        columns: ["FIRA Number", "Txn ID", "Amount", "Currency", "IEC", "Purpose Code", "Issue Date"],
      },
    ],
  },
  {
    id: "rpt_inr_conversion_repatriation",
    name: "INR Conversion & Repatriation Report",
    description: "MCA balance converted/repatriated to India. Filter by conversion date and rate.",
    category: "Multi-Currency Accounts",
    products: ["mca"],
    kind: "standard",
    icon: "banknote",
    defaultFormat: "xlsx",
    availableColumnGroups: [
      {
        group: "INR Conversion & Repatriation Report",
        columns: ["Txn ID", "Source Currency", "INR Credited", "FX Rate", "Repatriation Date"],
      },
    ],
  },
  {
    id: "rpt_currencywise_balance_summary",
    name: "Currency-wise Balance Summary",
    description: "Snapshot of holdings across all 33+ currencies, including EEFC balances. Filter by as-of date.",
    category: "Multi-Currency Accounts",
    products: ["mca"],
    kind: "standard",
    icon: "wallet",
    defaultFormat: "xlsx",
    availableColumnGroups: [
      {
        group: "Currency-wise Balance Summary",
        columns: ["Currency", "Balance", "INR Equivalent"],
      },
    ],
  },
  {
    id: "rpt_eefc_statement",
    name: "EEFC Account Statement",
    description:
      "Exchange Earners' Foreign Currency account ledger — forex retained without mandatory conversion to INR (per RBI's EEFC scheme, typically up to permissible %). Filter by currency and date range.",
    category: "Multi-Currency Accounts",
    products: ["mca"],
    kind: "standard",
    icon: "wallet",
    defaultFormat: "pdf",
    availableColumnGroups: [
      {
        group: "EEFC Account Statement",
        columns: ["Date", "Description", "Credit (Forex Retained)", "Debit (Utilized/Converted)", "Running FC Balance"],
      },
    ],
  },
  {
    id: "rpt_eefc_utilization",
    name: "EEFC Utilization Report",
    description:
      "Tracks how retained forex was used — permitted purposes only (import payments, business travel, etc. per FEMA). Filter by utilization category.",
    category: "Multi-Currency Accounts",
    products: ["mca"],
    kind: "standard",
    icon: "wallet",
    defaultFormat: "csv",
    availableColumnGroups: [
      {
        group: "EEFC Utilization Report",
        columns: ["Date", "Amount Utilized", "Purpose", "Permitted Category Flag"],
      },
    ],
  },
  {
    id: "rpt_international_accounts",
    name: "International Accounts Report",
    description:
      "Details of all inbound payments received into your international collection accounts in the selected time range.",
    category: "Multi-Currency Accounts",
    products: ["mca"],
    kind: "standard",
    icon: "globe",
    defaultFormat: "csv",
  },
  {
    id: "rpt_platform_withdrawal",
    name: "Platform Withdrawal Report",
    description: "Details of all platform withdrawals initiated in the selected time range, by region and currency.",
    category: "Multi-Currency Accounts",
    products: ["mca"],
    kind: "standard",
    icon: "globe",
    defaultFormat: "csv",
  },
  {
    id: "rpt_unmapped_payments",
    name: "Unmapped Payments Report",
    description: "Inbound payments received that could not be automatically mapped to an invoice or client.",
    category: "Multi-Currency Accounts",
    products: ["mca"],
    kind: "standard",
    icon: "globe",
    defaultFormat: "csv",
  },

  // ── 7. Invoices ───────────────────────────────────────────────────────────
  {
    id: "rpt_invoices",
    name: "Invoices Report",
    description: "GST-compliant tax invoices for fees charged. Filter by invoice date and GSTIN.",
    category: "Invoices",
    products: ["mca"],
    kind: "standard",
    icon: "receipt",
    defaultFormat: "pdf",
    availableColumnGroups: [
      {
        group: "Invoices Report",
        columns: ["Invoice ID", "Period", "Fee Amount", "GST", "Total", "Invoice Number", "Customer Name", "Email", "Amount", "Currency", "Status", "Due Date", "Created At"],
      },
    ],
    preview: {
      columns: ["Invoice #", "Customer", "Amount", "Status", "Due"],
      rows: [
        ["INV-2026-041", "Acme Corp", "$4,500.00", "Paid", "18 Jul 2026"],
        ["INV-2026-040", "TechVentures Ltd", "$12,800.00", "Pending", "20 Jul 2026"],
      ],
    },
  },
  {
    id: "rpt_fee_charges_statement",
    name: "Fee & Charges Statement",
    description: "Breakdown of MDR/platform fees per transaction. Filter by fee type.",
    category: "Invoices",
    products: ["pg", "mca"],
    kind: "standard",
    icon: "receipt",
    defaultFormat: "xlsx",
    availableColumnGroups: [
      {
        group: "Fee & Charges Statement",
        columns: ["Txn ID", "Fee Category", "Fee Amount", "Tax"],
      },
    ],
  },
  {
    id: "rpt_invoice_links",
    name: "Invoice Links Report",
    description: "Details of all invoice links created in the selected time range.",
    category: "Invoices",
    products: ["mca"],
    kind: "standard",
    icon: "receipt",
    defaultFormat: "csv",
  },

  // ── 8. Compliance & Regulatory ────────────────────────────────────────────
  {
    id: "rpt_ebrc",
    name: "eBRC Report",
    description:
      "Digital certificate confirming export proceeds realized, filed to DGFT for RoDTEP/duty drawback/export incentive claims. Filter by date range, IEC, and shipping bill no.",
    category: "Compliance & Regulatory",
    products: ["mca"],
    kind: "standard",
    icon: "badge-check",
    defaultFormat: "pdf",
    availableColumnGroups: [
      {
        group: "eBRC Report",
        columns: ["eBRC Number", "Txn ID", "Shipping Bill Ref", "Export Value", "Realization Date", "IEC", "Status"],
      },
    ],
  },
  {
    id: "rpt_ebrc_pending",
    name: "eBRC Pending/Exceptions Report",
    description:
      "Transactions where eBRC generation failed or is delayed (mismatch with shipping bill, GSTIN, etc). Filter by status and aging.",
    category: "Compliance & Regulatory",
    products: ["mca"],
    kind: "standard",
    icon: "file-warning",
    defaultFormat: "csv",
    availableColumnGroups: [
      {
        group: "eBRC Pending/Exceptions Report",
        columns: ["Txn ID", "Reason for Pending", "Shipping Bill Ref", "Days Pending"],
      },
    ],
  },
  {
    id: "rpt_purpose_code_summary",
    name: "Purpose Code Summary",
    description: "Aggregated view by RBI purpose code. Filter by purpose code and period.",
    category: "Compliance & Regulatory",
    products: ["mca"],
    kind: "standard",
    icon: "clipboard-list",
    defaultFormat: "csv",
    availableColumnGroups: [
      {
        group: "Purpose Code Summary",
        columns: ["Purpose Code", "Description", "Txn Count", "Total Value"],
      },
    ],
  },
  {
    id: "rpt_iec_wise_transaction",
    name: "IEC-wise Transaction Report",
    description: "For merchants with multiple IEC codes. Filter by IEC.",
    category: "Compliance & Regulatory",
    products: ["mca"],
    kind: "standard",
    icon: "clipboard-list",
    defaultFormat: "xlsx",
    availableColumnGroups: [
      {
        group: "IEC-wise Transaction Report",
        columns: ["IEC", "Txn Count", "Total Value", "FIRA/eBRC Status"],
      },
    ],
  },
  // ── 9. Customers ──────────────────────────────────────────────────────────
  {
    id: "rpt_customers",
    name: "Customer Report",
    description: "Customer profile and contact details, with lifetime transaction summary.",
    category: "Customers",
    products: ["pg"],
    kind: "standard",
    icon: "users",
    defaultFormat: "csv",
    availableColumnGroups: [
      {
        group: "Customer Report",
        columns: ["Customer ID", "Name", "Email", "Contact", "Total Txns", "Lifetime Value", "First Txn Date", "Last Txn Date"],
      },
    ],
  },
  {
    id: "rpt_customer_txn_summary",
    name: "Customer-wise Transaction Summary",
    description: "Per-customer transaction rollup — count, success rate, total amount, and average order value.",
    category: "Customers",
    products: ["pg"],
    kind: "standard",
    icon: "users",
    defaultFormat: "xlsx",
    availableColumnGroups: [
      {
        group: "Customer-wise Transaction Summary",
        columns: ["Customer ID", "Txn Count", "Success Rate", "Total Amount", "Avg Order Value"],
      },
    ],
  },
];

// ─── Custom reports (already created by the merchant) ───────────────────────

export const customReports: ReportDefinition[] = [
  {
    id: "rpt_custom_monthly_invoice",
    name: "Monthly Invoice Report",
    description: "This report reflects all transactions in a month against your invoice. You can use this to validate the invoice amount.",
    category: "Invoices",
    products: ["mca"],
    kind: "custom",
    icon: "receipt",
    defaultFormat: "pdf",
    createdBy: "yajat.gupta1993@gmail.com",
    createdAt: "2026-06-12T10:00:00",
  },
];

export const allReports: ReportDefinition[] = [...standardReports, ...customReports];

const FALLBACK_PREVIEW = {
  columns: ["ID", "Amount", "Status", "Date"],
  rows: [
    ["ref_2fJ8kL", "₹3,200.00", "Success", "2 Jul 2026"],
    ["ref_1eI7jK", "₹9,650.00", "Pending", "1 Jul 2026"],
  ],
};

export function previewForReport(report: ReportDefinition) {
  return report.preview ?? FALLBACK_PREVIEW;
}

/** IDs of reports this merchant downloads or schedules often — drives the "Recent & Favorites" row. */
export const recentReportIds = [
  "rpt_settlements",
  "rpt_all_payments",
  "rpt_payment_links",
  "rpt_settlement_recon",
  "rpt_invoices",
];

export function recentReports(reports: ReportDefinition[] = allReports): ReportDefinition[] {
  const byId = new Map(reports.map((r) => [r.id, r]));
  return recentReportIds.map((id) => byId.get(id)).filter((r): r is ReportDefinition => !!r);
}

export function reportsForProductTab(tab: ProductTab, reports: ReportDefinition[] = allReports): ReportDefinition[] {
  if (tab === "pg") return reports.filter((r) => r.products.includes("pg"));
  if (tab === "mca") return reports.filter((r) => r.products.includes("mca"));
  return reports;
}

export const categoryOrderPg: ReportCategory[] = [
  "Payments", "Payment Links & Pages", "Settlements", "Disputes & Chargebacks", "Refunds", "Customers",
];
export const categoryOrderMca: ReportCategory[] = [
  "Multi-Currency Accounts", "Invoices", "Compliance & Regulatory", "Settlements", "Disputes & Chargebacks",
];
export const categoryOrderAll: ReportCategory[] = [
  "Payments", "Payment Links & Pages", "Settlements", "Disputes & Chargebacks", "Refunds",
  "Multi-Currency Accounts", "Invoices", "Compliance & Regulatory", "Customers",
];

export function categoryOrderForTab(tab: ProductTab): ReportCategory[] {
  if (tab === "pg") return categoryOrderPg;
  if (tab === "mca") return categoryOrderMca;
  return categoryOrderAll;
}

// ─── Base report types available when creating a custom report ──────────────
// (a subset of standard reports that expose column-level customization)
export function baseReportTypesForTab(tab: ProductTab): ReportDefinition[] {
  return reportsForProductTab(tab, standardReports).filter((r) => r.availableColumnGroups?.length);
}

// ─── Custom report column catalog ────────────────────────────────────────────
// Unlike `availableColumnGroups` (columns exposed by one base report), this is
// the full cross-entity catalog a merchant can freely mix columns from when
// building a custom report — e.g. pull Payment ID + Customer Email + Settlement
// UTR into a single report, in any order, with renamed headers.

export type CustomColumnGroup = {
  group: string;
  products: ReportProduct[];
  columns: string[];
};

export const customColumnCatalogPg: CustomColumnGroup[] = [
  {
    group: "Payments",
    products: ["pg"],
    columns: [
      "Txn ID", "Amount", "Fee", "Tax", "VPA", "Bank", "Card Network", "Card ID",
      "Payment Method", "Wallet", "Status", "Customer Contact", "Currency",
      "Auth Code", "Created At", "Error Code", "Decline Reason", "Description", "INR Settled Amount",
    ],
  },
  {
    group: "Customers",
    products: ["pg"],
    columns: ["Customer ID", "Customer Contact", "Customer Email", "Customer Name", "Billing Address", "GSTIN", "Lifetime Value"],
  },
  {
    group: "Refunds",
    products: ["pg"],
    columns: ["Refund ID", "Amount", "Status", "Speed Requested", "Speed Processed", "Fee", "Created At"],
  },
  {
    group: "Disputes",
    products: ["pg", "mca"],
    columns: ["Case ID", "Reason Code", "Deadline", "Current Status", "Docs Uploaded"],
  },
  {
    group: "Transfers",
    products: ["pg"],
    columns: ["Transfer ID", "Amount", "Amount Reversed", "Recipient", "Status", "On Hold"],
  },
  {
    group: "Settlements",
    products: ["pg", "mca"],
    columns: ["Settlement ID", "Amount", "Tax", "Status", "UTR", "Bank Account", "Settled At", "Fee"],
  },
  {
    group: "UPI Metadata",
    products: ["pg"],
    columns: ["Flow", "Payer VPA", "Payee VPA", "NPCI Reference ID", "RRN"],
  },
];

export const customColumnCatalogMca: CustomColumnGroup[] = [
  {
    group: "Invoices",
    products: ["mca"],
    columns: ["Invoice ID", "Invoice Number", "Customer Name", "Email", "Amount", "Currency", "Status", "Due Date", "Created At"],
  },
  {
    group: "Clients",
    products: ["mca"],
    columns: ["Client Name", "Client Email", "Country", "Onboarded At", "KYC Status"],
  },
  {
    group: "MCA & EEFC",
    products: ["mca"],
    columns: [
      "Account ID", "Currency", "Beneficiary Bank", "SWIFT Code", "Received Amount", "FX Rate",
      "Running Balance", "EEFC Retained", "Converted to INR", "Purpose Code",
    ],
  },
  {
    group: "Settlements",
    products: ["pg", "mca"],
    columns: ["Settlement ID", "Amount", "Tax", "Status", "UTR", "Bank Account", "Settled At", "Fee"],
  },
  {
    group: "Compliance",
    products: ["mca"],
    columns: ["eBRC Number", "FIRC Number", "FIRA Number", "IEC", "Shipping Bill Ref", "Issued At", "Linked Settlement ID"],
  },
];

export function customColumnCatalogForTab(tab: ProductTab): CustomColumnGroup[] {
  const merged = [...customColumnCatalogPg, ...customColumnCatalogMca];
  const seen = new Set<string>();
  const deduped = merged.filter((g) => {
    const key = g.group;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (tab === "pg") return deduped.filter((g) => g.products.includes("pg"));
  if (tab === "mca") return deduped.filter((g) => g.products.includes("mca"));
  return deduped;
}

// ─── Duration presets ─────────────────────────────────────────────────────────

export const durationPresets = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last_7_days", label: "Last 7 days" },
  { id: "last_30_days", label: "Last 30 days" },
  { id: "this_month", label: "This month" },
  { id: "last_month", label: "Last month" },
  { id: "this_quarter", label: "This quarter" },
  { id: "custom", label: "Custom range" },
] as const;

export const reportFormats: { id: ReportFormat; label: string }[] = [
  { id: "csv", label: "CSV" },
  { id: "xlsx", label: "Excel (.xlsx)" },
  { id: "txt", label: "TXT" },
  { id: "pdf", label: "PDF" },
];

// ─── Download history (Downloads tab) ────────────────────────────────────────

export type DownloadStatus = "success" | "pending" | "failed" | "no_data";

export type ReportDownload = {
  id: string;
  reportName: string;
  durationLabel: string;
  format: ReportFormat;
  email: string | null;
  generatedAt: string; // ISO
  status: DownloadStatus;
  products: ReportProduct[];
};

export const reportDownloads: ReportDownload[] = [
  {
    id: "dl_001",
    reportName: "Payment Links Report",
    durationLabel: "1 Apr 2026 (12:00 AM) - 18 Jun 2026 (11:59 PM)",
    format: "xlsx",
    email: null,
    generatedAt: "2026-07-01T13:18:00",
    status: "no_data",
    products: ["pg"],
  },
  {
    id: "dl_002",
    reportName: "Payment Links Report",
    durationLabel: "30 Jun 2026 (12:00 AM) - 30 Jun 2026 (11:59 PM)",
    format: "txt",
    email: null,
    generatedAt: "2026-07-01T13:18:00",
    status: "no_data",
    products: ["pg"],
  },
  {
    id: "dl_003",
    reportName: "Payment Links Report",
    durationLabel: "22 Jun 2026 (12:00 AM) - 28 Jun 2026 (11:59 PM)",
    format: "csv",
    email: "yajat.gupta1993@gmail.com",
    generatedAt: "2026-06-29T17:25:00",
    status: "success",
    products: ["pg"],
  },
  {
    id: "dl_004",
    reportName: "All Payments",
    durationLabel: "14 Jun 2026 (12:00 AM) - 29 Jun 2026 (2:33 PM)",
    format: "csv",
    email: "yajat.gupta1993@gmail.com",
    generatedAt: "2026-06-29T14:33:00",
    status: "success",
    products: ["pg"],
  },
  {
    id: "dl_005",
    reportName: "Settlement Recon Report",
    durationLabel: "22 Jun 2026 (12:00 AM) - 29 Jun 2026 (2:32 PM)",
    format: "csv",
    email: "yajat.gupta1993@gmail.com",
    generatedAt: "2026-06-29T14:32:00",
    status: "success",
    products: ["pg", "mca"],
  },
  {
    id: "dl_006",
    reportName: "Settlements Report",
    durationLabel: "10 Jun 2026 (12:00 AM) - 19 Jun 2026 (11:59 PM)",
    format: "csv",
    email: "yajat.gupta1993@gmail.com",
    generatedAt: "2026-06-29T14:32:00",
    status: "success",
    products: ["pg", "mca"],
  },
  {
    id: "dl_007",
    reportName: "Invoices Report",
    durationLabel: "1 Jun 2026 (12:00 AM) - 30 Jun 2026 (11:59 PM)",
    format: "xlsx",
    email: "deepankar.raj@payglocal.in",
    generatedAt: "2026-07-01T09:10:00",
    status: "pending",
    products: ["mca"],
  },
  {
    id: "dl_008",
    reportName: "Refunds Report",
    durationLabel: "24 Jun 2026 (12:00 AM) - 1 Jul 2026 (11:59 PM)",
    format: "csv",
    email: "deepankar.raj@payglocal.in",
    generatedAt: "2026-07-01T08:02:00",
    status: "failed",
    products: ["pg"],
  },
];

// ─── Schedules (Schedules tab) ────────────────────────────────────────────────

export type ScheduleFrequency = "daily" | "weekly" | "monthly";
export type ScheduleStatus = "active" | "paused";

export type ReportSchedule = {
  id: string;
  reportName: string;
  frequency: ScheduleFrequency;
  time: string; // "09:00"
  dayOfWeek?: string; // for weekly
  dayOfMonth?: number; // for monthly
  format: ReportFormat;
  recipients: string[];
  status: ScheduleStatus;
  nextRunAt: string; // ISO
  products: ReportProduct[];
};

export const reportSchedules: ReportSchedule[] = [
  {
    id: "sch_001",
    reportName: "Settlements Report",
    frequency: "daily",
    time: "09:00",
    format: "csv",
    recipients: ["deepankar.raj@payglocal.in"],
    status: "active",
    nextRunAt: "2026-08-05T09:00:00",
    products: ["pg", "mca"],
  },
  {
    id: "sch_002",
    reportName: "All Payments",
    frequency: "weekly",
    time: "08:00",
    dayOfWeek: "Monday",
    format: "xlsx",
    recipients: ["deepankar.raj@payglocal.in", "finance@payglocal.in"],
    status: "active",
    nextRunAt: "2026-08-10T08:00:00",
    products: ["pg"],
  },
  {
    id: "sch_003",
    reportName: "Monthly Invoice Report",
    frequency: "monthly",
    time: "07:30",
    dayOfMonth: 1,
    format: "xlsx",
    recipients: ["yajat.gupta1993@gmail.com"],
    status: "paused",
    nextRunAt: "2026-09-01T07:30:00",
    products: ["mca"],
  },
];
