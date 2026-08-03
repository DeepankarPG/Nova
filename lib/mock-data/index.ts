// ─── Dashboard ────────────────────────────────────────────────────────────────

export const dashboardStats = {
  successfulPayments: { value: 847250.75, currency: "INR", count: 342, change: 12.4 },
  settlementsDue: { value: 124890.50, currency: "INR", count: 18, change: -3.2 },
  fundsOnHold: { value: 52340.00, currency: "INR", count: 7, change: 2.1 },
  openDisputes: { value: 14200.00, currency: "INR", count: 3, change: -1 },
};

/** Today's analytics hero — hourly series in lakhs (₹) or counts for payments tab */
export const todaysAnalytics = {
  grossVolume: { todayTotal: 9_42_800, yesterdayTotal: 8_26_000, changePct: 14.1 },
  netVolume: { todayTotal: 8_89_400, yesterdayTotal: 7_95_200, changePct: 11.8 },
  paymentCount: { todayTotal: 1362, yesterdayTotal: 1198, changePct: 13.7 },
  successRate: {
    pct: 94.2,
    succeeded: 1284,
    attempted: 1362,
    failed: 78,
    avgTicket: 6600,
    byMode: { upi: 96.1, card: 93.4, netbanking: 89.2, wallets: 91.0 },
  },
  declineBreakdown: {
    issuer: {
      count: 66,
      pct: 85,
      reasons: [
        { reason: "Insufficient funds", count: 38 },
        { reason: "Issuer declined", count: 19 },
        { reason: "Limit exceeded", count: 9 },
      ],
    },
    general: {
      count: 12,
      pct: 15,
      reasons: [
        { reason: "OTP / 3DS timeout", count: 24 },
        { reason: "Incorrect CVV", count: 12 },
      ],
    },
  },
  attention: {
    fundsOnHold: { amount: 52_340, releaseLabel: "12 Transactions" },
    disputes: { openCount: 4, disputedAmount: 14_200 },
    settlementsDue: {
      amount: 1_24_890,
      expectedLabel: "Settles at 12:00AM IST",
      bankAccountLast4: "4521",
      cycleLabel: "T+1",
    },
  },
  /**
   * payments* = successful + failed + disputed (per hour).
   * payMixToday / payMixYesterday = share of volume (or attempts) by payment mode for tooltips [UPI, Cards, Net banking, Wallets].
   */
  hourly: [
    { label: "00:00", grossL: 0.35, grossYesterdayL: 0.28, netL: 0.32, netYesterdayL: 0.26, payments: 48, paymentsYesterday: 41, payOk: 45, payFail: 2, payDisp: 1, payOkY: 38, payFailY: 2, payDispY: 1, payMixToday: [0.46, 0.28, 0.18, 0.08] as const, payMixYesterday: [0.44, 0.29, 0.19, 0.08] as const },
    { label: "02:00", grossL: 0.22, grossYesterdayL: 0.2, netL: 0.2, netYesterdayL: 0.18, payments: 32, paymentsYesterday: 29, payOk: 30, payFail: 1, payDisp: 1, payOkY: 27, payFailY: 1, payDispY: 1, payMixToday: [0.42, 0.3, 0.2, 0.08] as const, payMixYesterday: [0.45, 0.28, 0.19, 0.08] as const },
    { label: "04:00", grossL: 0.18, grossYesterdayL: 0.15, netL: 0.16, netYesterdayL: 0.14, payments: 26, paymentsYesterday: 22, payOk: 24, payFail: 2, payDisp: 0, payOkY: 20, payFailY: 2, payDispY: 0, payMixToday: [0.4, 0.32, 0.2, 0.08] as const, payMixYesterday: [0.43, 0.3, 0.19, 0.08] as const },
    { label: "06:00", grossL: 0.45, grossYesterdayL: 0.38, netL: 0.42, netYesterdayL: 0.35, payments: 58, paymentsYesterday: 51, payOk: 55, payFail: 2, payDisp: 1, payOkY: 48, payFailY: 2, payDispY: 1, payMixToday: [0.44, 0.29, 0.19, 0.08] as const, payMixYesterday: [0.46, 0.27, 0.19, 0.08] as const },
    { label: "08:00", grossL: 1.2, grossYesterdayL: 0.95, netL: 1.12, netYesterdayL: 0.88, payments: 142, paymentsYesterday: 118, payOk: 134, payFail: 6, payDisp: 2, payOkY: 112, payFailY: 4, payDispY: 2, payMixToday: [0.48, 0.27, 0.17, 0.08] as const, payMixYesterday: [0.45, 0.28, 0.19, 0.08] as const },
    { label: "10:00", grossL: 2.8, grossYesterdayL: 2.2, netL: 2.62, netYesterdayL: 2.05, payments: 268, paymentsYesterday: 221, payOk: 252, payFail: 13, payDisp: 3, payOkY: 208, payFailY: 10, payDispY: 3, payMixToday: [0.5, 0.26, 0.16, 0.08] as const, payMixYesterday: [0.47, 0.27, 0.18, 0.08] as const },
    { label: "12:00", grossL: 4.1, grossYesterdayL: 3.6, netL: 3.85, netYesterdayL: 3.38, payments: 312, paymentsYesterday: 285, payOk: 294, payFail: 14, payDisp: 4, payOkY: 268, payFailY: 13, payDispY: 4, payMixToday: [0.49, 0.26, 0.17, 0.08] as const, payMixYesterday: [0.46, 0.28, 0.18, 0.08] as const },
    { label: "14:00", grossL: 5.2, grossYesterdayL: 4.5, netL: 4.88, netYesterdayL: 4.22, payments: 356, paymentsYesterday: 318, payOk: 335, payFail: 17, payDisp: 4, payOkY: 299, payFailY: 15, payDispY: 4, payMixToday: [0.47, 0.27, 0.18, 0.08] as const, payMixYesterday: [0.45, 0.29, 0.18, 0.08] as const },
    { label: "16:00", grossL: 6.4, grossYesterdayL: 5.8, netL: 6.02, netYesterdayL: 5.45, payments: 398, paymentsYesterday: 362, payOk: 375, payFail: 19, payDisp: 4, payOkY: 340, payFailY: 18, payDispY: 4, payMixToday: [0.46, 0.28, 0.18, 0.08] as const, payMixYesterday: [0.44, 0.29, 0.19, 0.08] as const },
    { label: "18:00", grossL: 7.8, grossYesterdayL: 7.1, netL: 7.32, netYesterdayL: 6.65, payments: 442, paymentsYesterday: 401, payOk: 416, payFail: 22, payDisp: 4, payOkY: 377, payFailY: 20, payDispY: 4, payMixToday: [0.45, 0.28, 0.19, 0.08] as const, payMixYesterday: [0.43, 0.3, 0.19, 0.08] as const },
    { label: "20:00", grossL: 8.9, grossYesterdayL: 8.2, netL: 8.35, netYesterdayL: 7.68, payments: 498, paymentsYesterday: 455, payOk: 468, payFail: 25, payDisp: 5, payOkY: 428, payFailY: 22, payDispY: 5, payMixToday: [0.44, 0.29, 0.19, 0.08] as const, payMixYesterday: [0.42, 0.3, 0.2, 0.08] as const },
    { label: "22:00", grossL: 9.2, grossYesterdayL: 8.45, netL: 8.64, netYesterdayL: 7.92, payments: 512, paymentsYesterday: 468, payOk: 482, payFail: 25, payDisp: 5, payOkY: 440, payFailY: 23, payDispY: 5, payMixToday: [0.43, 0.29, 0.2, 0.08] as const, payMixYesterday: [0.41, 0.31, 0.2, 0.08] as const },
  ],
};

export const countryInsights = [
  { country: "United States", code: "US", amount: 410196, transactions: 142 },
  { country: "Ireland", code: "IE", amount: 183635, transactions: 68 },
  { country: "United Kingdom", code: "GB", amount: 97420, transactions: 44 },
  { country: "Canada", code: "CA", amount: 64800, transactions: 31 },
  { country: "Qatar", code: "QA", amount: 32100, transactions: 12 },
  { country: "Singapore", code: "SG", amount: 28900, transactions: 19 },
  { country: "Germany", code: "DE", amount: 17400, transactions: 9 },
];

export const monthlyVolume = [
  { month: "Sep", volume: 620000, settlements: 580000 },
  { month: "Oct", volume: 740000, settlements: 690000 },
  { month: "Nov", volume: 810000, settlements: 760000 },
  { month: "Dec", volume: 950000, settlements: 880000 },
  { month: "Jan", volume: 720000, settlements: 670000 },
  { month: "Feb", volume: 880000, settlements: 820000 },
  { month: "Mar", volume: 1020000, settlements: 960000 },
];

/** Dashboard widget zone — hourly line chart */
export const hourlyTraffic = [
  { t: "00", v: 8 }, { t: "04", v: 12 }, { t: "08", v: 42 }, { t: "12", v: 68 },
  { t: "16", v: 55 }, { t: "20", v: 38 }, { t: "23", v: 22 },
];

/** Donut / legend for payment method split widget (matches dashboard chart blues) */
export const paymentMethodSplit = [
  { key: "card", label: "Card", value: 52, color: "#0061E3" },
  { key: "upi", label: "UPI", value: 31, color: "#60a5fa" },
  { key: "netbanking", label: "Net banking", value: 12, color: "#0891b2" },
  { key: "other", label: "Other", value: 5, color: "#94a3b8" },
];

/** Weekly UPI vs card volume — SMB India rail mix */
export const weeklyUpiVsCard = [
  { week: "W1", upi: 420000, card: 280000 },
  { week: "W2", upi: 465000, card: 265000 },
  { week: "W3", upi: 510000, card: 248000 },
  { week: "W4", upi: 548000, card: 239000 },
];

/** Settlement speed buckets (T+N working days) — cash-flow planning */
export const settlementSpeedBuckets = [
  { bucket: "T+0", pct: 28 },
  { bucket: "T+1", pct: 54 },
  { bucket: "T+2", pct: 14 },
  { bucket: "T+3+", pct: 4 },
];

/** Apple Pay / Google Pay digital wallet contribution stats */
export const walletStats = {
  applePay: { volume: 48_200, transactions: 82, pctOfTotal: 5.1 },
  googlePay: { volume: 31_400, transactions: 54, pctOfTotal: 3.3 },
};

/** Top decline / failure reasons (issuer + customer behaviour) */
export const paymentFailureReasons = [
  { reason: "Insufficient funds", count: 38 },
  { reason: "OTP / 3DS timeout", count: 24 },
  { reason: "Issuer declined", count: 19 },
  { reason: "Incorrect CVV", count: 12 },
  { reason: "Limit exceeded", count: 9 },
];

/** India state-wise domestic volume (GST / regional view) */
export const indiaStateInsights = [
  { state: "Maharashtra", code: "MH", amount: 312000, transactions: 118 },
  { state: "Karnataka", code: "KA", amount: 241500, transactions: 96 },
  { state: "Delhi NCR", code: "DL", amount: 198200, transactions: 82 },
  { state: "Tamil Nadu", code: "TN", amount: 156400, transactions: 61 },
  { state: "Telangana", code: "TG", amount: 124800, transactions: 48 },
  { state: "Gujarat", code: "GJ", amount: 98200, transactions: 39 },
];

/** INR settlements vs cross-border FX — export / SaaS SMBs */
export const inrVsFxSplit = [
  { key: "inr", label: "INR settlements", value: 72, color: "#0061E3" },
  { key: "fx", label: "FX / multi-currency", value: 28, color: "#93c5fd" },
];

/** Gross captured vs net after fees (MDR + tax) */
export const netVsGrossWeekly = [
  { label: "W1", gross: 720000, net: 698400 },
  { label: "W2", gross: 758000, net: 735260 },
  { label: "W3", gross: 802000, net: 777940 },
  { label: "W4", gross: 834000, net: 808980 },
];

export const topCustomersBySpend = [
  { name: "Sarah Mitchell", email: "sarah.m@example.com", total: 284_500 },
  { name: "Rohan Sharma", email: "rohan.s@techcorp.io", total: 198_200 },
  { name: "Yajat Gupta", email: "yajat.g@payglocal.in", total: 142_800 },
  { name: "Priya Patel", email: "priya.p@startup.co", total: 96_400 },
  { name: "James O'Brien", email: "james.ob@gmail.com", total: 72_150 },
];

export const dashboardWidgetKpis = {
  paymentAttempts: { value: 364, change: 4.8 },
  successRate: { value: 94.2, change: 1.1 },
  avgTicket: { value: 2473, currency: "INR" as const },
  refunds: { value: 18_420, currency: "INR" as const, change: -2.3 },
  failedPayments: { value: 22, change: -8 },
  settledToday: { value: 412_300, currency: "INR" as const },
  nextSettlementLabel: "Mar 21, 2026 · 11:00 AM IST",
  activeCustomers: { value: 1284, change: 6.2 },
  newCustomers: { value: 42, change: 12 },
  repeatRate: { value: 38.5, change: 0.4 },
  disputeRate: { value: 0.82, change: -0.15 },
  blockedTx: { value: 7, change: 0 },
};

export const recentTransactions = [
  {
    id: "gl_o-9d...sj0l7X2",
    amount: 325.58,
    currency: "INR",
    status: "in_progress",
    method: "card",
    cardBrand: "visa",
    cardLast4: "9903",
    customerName: "Yajat Gupta",
    email: "yajat.gupta@payglocal.in",
    date: "2026-03-12T13:30:00",
  },
  {
    id: "gl_o-8c...pk3m9Y4",
    amount: 1250.00,
    currency: "USD",
    status: "sent_for_capture",
    method: "card",
    cardBrand: "mastercard",
    cardLast4: "5100",
    customerName: "Sarah Mitchell",
    email: "sarah.m@example.com",
    date: "2026-03-12T11:15:00",
  },
  {
    id: "gl_o-7b...qr2n8Z3",
    amount: 8900.00,
    currency: "INR",
    status: "sent_for_capture",
    method: "upi",
    cardBrand: null,
    cardLast4: null,
    customerName: "Rohan Sharma",
    email: "rohan.s@techcorp.io",
    date: "2026-03-12T10:42:00",
  },
  {
    id: "gl_o-6a...wt4p6A1",
    amount: 450.75,
    currency: "EUR",
    status: "failed",
    method: "card",
    cardBrand: "visa",
    cardLast4: "4242",
    customerName: "James O'Brien",
    email: "james.ob@gmail.com",
    date: "2026-03-12T09:20:00",
  },
  {
    id: "gl_o-5f...mn5q7B8",
    amount: 2800.00,
    currency: "INR",
    status: "sent_for_capture",
    method: "netbanking",
    cardBrand: null,
    cardLast4: null,
    customerName: "Priya Patel",
    email: "priya.p@startup.co",
    date: "2026-03-11T17:55:00",
  },
  {
    id: "gl_o-4e...lk8r5C6",
    amount: 3200.00,
    currency: "INR",
    status: "sent_for_capture",
    method: "card",
    cardBrand: "mastercard",
    cardLast4: "1859",
    customerName: "Karan Gopalan Krishnamurthy Ghaiii",
    email: "arjun.m@design.co",
    date: "2026-03-11T16:30:00",
  },
  {
    id: "gl_o-3d...ji9s4D5",
    amount: 580.25,
    currency: "GBP",
    status: "refunded",
    method: "card",
    cardBrand: "visa",
    cardLast4: "7118",
    customerName: "Emma Thompson",
    email: "emma.t@outlook.com",
    date: "2026-03-11T14:10:00",
  },
];

export const recentSettlements = [
  {
    id: "stl_a1b2c3d4",
    amount: 124890.50,
    currency: "INR",
    status: "processing",
    bankAccount: "HDFC ****4521",
    transactionCount: 48,
    date: "2026-03-12T00:00:00",
  },
  {
    id: "stl_e5f6g7h8",
    amount: 98420.00,
    currency: "INR",
    status: "settled",
    bankAccount: "HDFC ****4521",
    transactionCount: 36,
    date: "2026-03-11T00:00:00",
  },
  {
    id: "stl_i9j0k1l2",
    amount: 142650.75,
    currency: "INR",
    status: "settled",
    bankAccount: "HDFC ****4521",
    transactionCount: 62,
    date: "2026-03-10T00:00:00",
  },
];

// ─── Transactions ──────────────────────────────────────────────────────────────

export const allTransactions = [
  ...recentTransactions,
  {
    id: "gl_o-2c...gh0t3E4",
    amount: 15600.00,
    currency: "INR",
    status: "sent_for_capture",
    method: "card",
    cardBrand: "visa",
    cardLast4: "3302",
    customerName: "Vikram Singh",
    email: "vikram.s@enterprise.com",
    date: "2026-03-11T12:00:00",
  },
  {
    id: "gl_o-1b...fe1u2F3",
    amount: 720.00,
    currency: "AED",
    status: "sent_for_capture",
    method: "card",
    cardBrand: "mastercard",
    cardLast4: "4488",
    customerName: "Fatima Al-Hassan",
    email: "fatima.ah@dubai.ae",
    date: "2026-03-10T19:30:00",
  },
  {
    id: "gl_o-0a...cd2v1G2",
    amount: 4200.00,
    currency: "INR",
    status: "in_progress",
    method: "upi",
    cardBrand: null,
    cardLast4: null,
    customerName: "Kavya Reddy",
    email: "kavya.r@tech.in",
    date: "2026-03-10T15:45:00",
  },
  {
    id: "gl_o-9z...bc3w0H1",
    amount: 890.50,
    currency: "SGD",
    status: "failed",
    method: "card",
    cardBrand: "jcb",
    cardLast4: "6612",
    customerName: "Lim Wei Ming",
    email: "lim.wm@sg.com",
    date: "2026-03-10T11:20:00",
  },
  {
    id: "gl_o-8y...ab4x9I0",
    amount: 6750.00,
    currency: "INR",
    status: "sent_for_capture",
    method: "netbanking",
    cardBrand: null,
    cardLast4: null,
    customerName: "Ravi Kumar",
    email: "ravi.k@bank.co.in",
    date: "2026-03-09T14:00:00",
  },
];

// ─── Settlements ───────────────────────────────────────────────────────────────

export const allSettlements = [
  {
    id: "stl_a1b2c3d4",
    amount: 124890.50,
    currency: "INR",
    status: "processing",
    bankAccount: "HDFC ****4521",
    transactionCount: 48,
    utrNumber: "UTR2603120001",
    date: "2026-03-12T00:00:00",
  },
  {
    id: "stl_e5f6g7h8",
    amount: 98420.00,
    currency: "INR",
    status: "settled",
    bankAccount: "HDFC ****4521",
    transactionCount: 36,
    utrNumber: "UTR2603110002",
    date: "2026-03-11T00:00:00",
  },
  {
    id: "stl_i9j0k1l2",
    amount: 142650.75,
    currency: "INR",
    status: "settled",
    bankAccount: "HDFC ****4521",
    transactionCount: 62,
    utrNumber: "UTR2603100003",
    date: "2026-03-10T00:00:00",
  },
  {
    id: "stl_m3n4o5p6",
    amount: 76200.00,
    currency: "INR",
    status: "settled",
    bankAccount: "HDFC ****4521",
    transactionCount: 29,
    utrNumber: "UTR2603090004",
    date: "2026-03-09T00:00:00",
  },
  {
    id: "stl_q7r8s9t0",
    amount: 189340.25,
    currency: "INR",
    status: "settled",
    bankAccount: "HDFC ****4521",
    transactionCount: 74,
    utrNumber: "UTR2603080005",
    date: "2026-03-08T00:00:00",
  },
];

// ─── FIRC Documents ────────────────────────────────────────────────────────────

export const fircDocuments = [
  { id: "firc_001", settlementId: "stl_e5f6g7h8", amountUsd: 1184.22, fxRate: 83.12, issuedDate: "2026-03-12", downloadUrl: "#" },
  { id: "firc_002", settlementId: "stl_i9j0k1l2", amountUsd: 1716.28, fxRate: 83.08, issuedDate: "2026-03-11", downloadUrl: "#" },
  { id: "firc_003", settlementId: "stl_m3n4o5p6", amountUsd: 916.87, fxRate: 83.15, issuedDate: "2026-03-10", downloadUrl: "#" },
  { id: "firc_004", settlementId: "stl_q7r8s9t0", amountUsd: 2278.80, fxRate: 83.09, issuedDate: "2026-03-09", downloadUrl: "#" },
];

// ─── Disputes ──────────────────────────────────────────────────────────────────

export type DisputeMockRow = {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  /** Optional row-specific badge key (e.g. evidence phase); falls back to `status`. */
  badgeStatus?: string;
  /** Dispute lifecycle stage shown as its own chip, separate from `status`/`badgeStatus`. */
  stage: "dispute" | "pre_arbitration";
  reason: string;
  customerName: string;
  email: string;
  dueDate: string;
  createdAt: string;
  cardBrand?: "visa" | "mastercard" | "amex";
  cardLast4?: string;
  countryCode?: string;
  /** When the original payment succeeded — feeds the dispute detail's Timeline section. */
  paymentDate: string;
  /** Transaction-detail reference numbers, feeds the dispute detail's Transaction details section. */
  merchantTxnId: string;
  paymentId: string;
  arn: string;
  rrn: string;
  caseId: string;
  /** Who the ball is currently in the court of — drives the desktop Resolution column. */
  resolutionOwner?: "merchant" | "customer" | "bank";
};

export const disputes: DisputeMockRow[] = [
  {
    id: "dsp_x1y2z3",
    transactionId: "gl_o-4e...lk8r5C6",
    amount: 19.23,
    currency: "USD",
    status: "open",
    badgeStatus: "deadline_missed",
    stage: "dispute",
    reason: "Product not received",
    customerName: "James O'Brien",
    email: "james.ob@gmail.com",
    dueDate: "2026-03-31T05:29:00",
    createdAt: "2026-01-23T09:20:00",
    cardBrand: "visa",
    cardLast4: "2685",
    countryCode: "US",
    paymentDate: "2026-01-05T10:00:00",
    merchantTxnId: "23AEE8CB6B62EE2A00",
    paymentId: "pay_gl00x9k2m",
    arn: "345678987600",
    rrn: "123456789600",
    caseId: "345678987600",
    resolutionOwner: "merchant",
  },
  {
    id: "dsp_a2b3c4",
    transactionId: "gl_o-3d...ji9s4D5",
    amount: 580.25,
    currency: "GBP",
    status: "under_review",
    badgeStatus: "evidence_submitted",
    stage: "dispute",
    reason: "Duplicate charge",
    customerName: "Emma Thompson",
    email: "emma.t@outlook.com",
    dueDate: "2026-03-18T14:00:00",
    createdAt: "2026-01-22T14:10:00",
    cardBrand: "mastercard",
    cardLast4: "4411",
    countryCode: "GB",
    paymentDate: "2026-01-02T11:30:00",
    merchantTxnId: "23AEE8CB6B62EE2A07",
    paymentId: "pay_gl07x9k2m",
    arn: "345678987607",
    rrn: "123456789607",
    caseId: "345678987607",
    resolutionOwner: "bank",
  },
  {
    id: "dsp_u1v9a1",
    transactionId: "gl_o-2f...mk9t6D7",
    amount: 19.0,
    currency: "INR",
    status: "open",
    badgeStatus: "upload_documents",
    stage: "dispute",
    reason: "Other reason",
    customerName: "Aditi Sharma",
    email: "aditi.sharma@gmail.com",
    createdAt: "2026-02-03T18:40:00",
    dueDate: "2026-02-08T18:40:00",
    cardBrand: "visa",
    cardLast4: "0006",
    countryCode: "IN",
    paymentDate: "2026-01-20T17:57:00",
    merchantTxnId: "23AEE8CB6B62EE2A01",
    paymentId: "pay_gl01x9k2m",
    arn: "345678987601",
    rrn: "123456789601",
    caseId: "345678987601",
  },
  {
    id: "dsp_u2v9b2",
    transactionId: "gl_o-3g...nk0u7E8",
    amount: 10.0,
    currency: "INR",
    status: "open",
    badgeStatus: "upload_documents",
    stage: "pre_arbitration",
    reason: "Other reason",
    customerName: "Karthik Iyer",
    email: "karthik.iyer@outlook.com",
    createdAt: "2026-04-20T12:35:00",
    dueDate: "2026-04-24T12:44:00",
    cardBrand: "mastercard",
    cardLast4: "8210",
    countryCode: "IN",
    paymentDate: "2026-04-02T10:12:00",
    merchantTxnId: "23AEE8CB6B62EE2A02",
    paymentId: "pay_gl02x9k2m",
    arn: "345678987602",
    rrn: "123456789602",
    caseId: "345678987602",
  },
  {
    id: "dsp_u6v9f6",
    transactionId: "gl_o-7k...rk4y1I2",
    amount: 150.0,
    currency: "INR",
    status: "open",
    badgeStatus: "upload_documents",
    stage: "dispute",
    reason: "Other Fraud - Card Absent",
    customerName: "Vikram Nair",
    email: "vikram.nair@gmail.com",
    createdAt: "2026-06-25T15:00:00",
    dueDate: "2026-06-30T15:00:00",
    cardBrand: "visa",
    cardLast4: "1111",
    countryCode: "IN",
    paymentDate: "2026-06-01T08:47:00",
    merchantTxnId: "23AEE8CB6B62EE2A06",
    paymentId: "pay_gl06x9k2m",
    arn: "345678987606",
    rrn: "123456789606",
    caseId: "345678987606",
  },
  {
    id: "dsp_u3v9c3",
    transactionId: "gl_o-4h...ok1v8F9",
    amount: 1000.0,
    currency: "INR",
    status: "under_review",
    badgeStatus: "under_review",
    stage: "dispute",
    reason: "Goods or Services Not Provided",
    customerName: "Neha Gupta",
    email: "neha.gupta@yahoo.com",
    createdAt: "2026-06-25T15:00:00",
    dueDate: "2026-06-30T15:00:00",
    cardBrand: "visa",
    cardLast4: "4444",
    countryCode: "IN",
    paymentDate: "2026-06-05T09:30:00",
    merchantTxnId: "23AEE8CB6B62EE2A03",
    paymentId: "pay_gl03x9k2m",
    arn: "345678987603",
    rrn: "123456789603",
    caseId: "345678987603",
  },
  {
    id: "dsp_u4v9d4",
    transactionId: "gl_o-5i...pk2w9G0",
    amount: 200.0,
    currency: "INR",
    status: "open",
    badgeStatus: "insufficient_documents",
    stage: "dispute",
    reason: "No Cardholder Authorization",
    customerName: "Rohit Verma",
    email: "rohit.verma@gmail.com",
    createdAt: "2026-06-25T15:00:00",
    dueDate: "2026-06-30T15:00:00",
    cardBrand: "visa",
    cardLast4: "2222",
    countryCode: "IN",
    paymentDate: "2026-06-04T14:20:00",
    merchantTxnId: "23AEE8CB6B62EE2A04",
    paymentId: "pay_gl04x9k2m",
    arn: "345678987604",
    rrn: "123456789604",
    caseId: "345678987604",
  },
  {
    id: "dsp_u5v9e5",
    transactionId: "gl_o-6j...qk3x0H1",
    amount: 480.0,
    currency: "INR",
    status: "open",
    badgeStatus: "action_required",
    stage: "dispute",
    reason: "Item Not Received",
    customerName: "Simran Kaur",
    email: "simran.kaur@gmail.com",
    createdAt: "2026-07-14T16:24:00",
    dueDate: "2026-07-21T16:24:00",
    cardBrand: "visa",
    cardLast4: "1097",
    countryCode: "IN",
    paymentDate: "2026-06-28T11:05:00",
    merchantTxnId: "23AEE8CB6B62EE2A05",
    paymentId: "pay_gl05x9k2m",
    arn: "345678987605",
    rrn: "123456789605",
    caseId: "345678987605",
  },
  {
    id: "dsp_d5e6f7",
    transactionId: "gl_o-8y...ab4x9I0",
    amount: 2100.0,
    currency: "INR",
    status: "won",
    badgeStatus: "won",
    stage: "dispute",
    reason: "Unauthorized transaction",
    customerName: "Ravi Kumar",
    email: "ravi.k@bank.co.in",
    dueDate: "2026-03-10T00:00:00",
    createdAt: "2026-01-21T11:00:00",
    cardBrand: "visa",
    cardLast4: "9021",
    countryCode: "IN",
    paymentDate: "2026-01-08T09:15:00",
    merchantTxnId: "23AEE8CB6B62EE2A08",
    paymentId: "pay_gl08x9k2m",
    arn: "345678987608",
    rrn: "123456789608",
    caseId: "345678987608",
    resolutionOwner: "customer",
  },
  {
    id: "dsp_l0s1t2",
    transactionId: "gl_o-1a...zz9y8X7",
    amount: 124.5,
    currency: "USD",
    status: "lost",
    badgeStatus: "lost",
    stage: "dispute",
    reason: "Fraudulent",
    customerName: "Alex Morgan",
    email: "alex.m@example.com",
    dueDate: "2026-02-01T12:00:00",
    createdAt: "2026-01-20T08:15:00",
    cardBrand: "visa",
    cardLast4: "1144",
    countryCode: "US",
    paymentDate: "2026-01-10T13:40:00",
    merchantTxnId: "23AEE8CB6B62EE2A09",
    paymentId: "pay_gl09x9k2m",
    arn: "345678987609",
    rrn: "123456789609",
    caseId: "345678987609",
    resolutionOwner: "merchant",
  },
];

// ─── Payment Products ──────────────────────────────────────────────────────────

export const paymentProducts = [
  {
    id: "pp_cards",
    name: "Cards",
    icon: "credit-card",
    description: "Accept Visa, Mastercard, Amex & RuPay",
    status: "active",
    transactions: 1248,
    volume: 4820000,
    successRate: 94.2,
  },
  {
    id: "pp_upi",
    name: "UPI",
    icon: "smartphone",
    description: "Real-time UPI payments",
    status: "active",
    transactions: 892,
    volume: 2140000,
    successRate: 98.7,
  },
  {
    id: "pp_netbanking",
    name: "Net Banking",
    icon: "building-2",
    description: "50+ bank integrations",
    status: "active",
    transactions: 312,
    volume: 890000,
    successRate: 91.5,
  },
  {
    id: "pp_wallets",
    name: "Wallets",
    icon: "wallet",
    description: "Paytm, PhonePe, Amazon Pay",
    status: "inactive",
    transactions: 0,
    volume: 0,
    successRate: 0,
  },
];

// ─── International accounts (client location–first) ─────────────────────────────

export type BankDetailRow = { label: string; value: string };

/** Mock corridor KPIs for MCA location page (illustrative — not tied to ledger balances). */
export type McaCorridorAnalyticsStrip = {
  totalRevenue: number;
  outstanding: number;
  changeRevenue: number;
  sparkRevenue: number[];
  /** Replaces trend % on Outstanding — clearing context (illustrative). */
  outstandingContext: string;
  /** INR — illustrative savings this month vs bank-style fees (MCA savings card). */
  savingsThisMonthInr: number;
  /** Shown as “saved X% on fees vs banks”. */
  savingsVsBankPct: number;
};

export type ClientReceivingLocation = {
  id: string;
  label: string;
  flag: string;
  receiveTitle: string;
  localCurrency: string;
  localAccountTitle: string;
  localAccountSubtitle: string;
  paymentMethodLocal: string;
  available: number;
  pending: number;
  fxRateToInr: number;
  fxUpdatedAt: string;
  estimatedSettlementDays: string;
  localRows: BankDetailRow[];
  swiftAccountTitle: string;
  swiftCurrenciesNote: string;
  swiftWarning?: string;
  swiftRows: BankDetailRow[];
  preferredRibbon?: string;
  payerNote?: string;
  corridorAnalytics: McaCorridorAnalyticsStrip;
};

export const clientReceivingLocations: ClientReceivingLocation[] = [
  {
    id: "usa",
    label: "United States",
    flag: "🇺🇸",
    receiveTitle: "United States of America",
    localCurrency: "USD",
    localAccountTitle: "USD account",
    localAccountSubtitle: "Your client pays via ACH or Fedwire — lower fees than SWIFT for US payers.",
    paymentMethodLocal: "ACH / Fedwire",
    available: 8420.5,
    pending: 0,
    fxRateToInr: 83.25,
    fxUpdatedAt: "2026-03-17T10:41:00",
    estimatedSettlementDays: "1–3 business days",
    preferredRibbon: "Preferred by payers in the US",
    localRows: [
      { label: "Account holder", value: "Acme Exports Pvt Ltd" },
      { label: "Account number", value: "9876543210" },
      { label: "Routing (ABA)", value: "021000021" },
      { label: "Bank name", value: "JPMorgan Chase Bank N.A." },
      { label: "Account type", value: "Business checking" },
      { label: "Beneficiary address", value: "5 Penn Plaza, 14th Floor, New York, NY 10001, US" },
    ],
    swiftAccountTitle: "International SWIFT account",
    swiftCurrenciesNote: "USD, GBP, EUR, and 25+ more",
    swiftWarning: "SWIFT charges may apply on the sender or intermediary banks.",
    swiftRows: [
      { label: "Payment method", value: "SWIFT (international wire)" },
      { label: "IBAN (account number)", value: "GB10TCCL04140480893347" },
      { label: "BIC / SWIFT", value: "TCCLGB3L" },
      { label: "Bank name", value: "The Currency Cloud Limited" },
      { label: "Beneficiary bank country", value: "United Kingdom" },
      { label: "Account holder", value: "Acme Exports Pvt Ltd" },
      { label: "Beneficiary address", value: "12 Steward Street, London, E1 6FQ, GB" },
    ],
    corridorAnalytics: {
      totalRevenue: 128400,
      outstanding: 14200,
      changeRevenue: 8.4,
      sparkRevenue: [58, 62, 59, 71, 68, 76, 74, 82, 79, 88, 91, 96],
      outstandingContext:
        "3 payers · ACH/Fedwire usually clears in 1–3 business days",
      savingsThisMonthInr: 8240.25,
      savingsVsBankPct: 4,
    },
  },
  {
    id: "uk",
    label: "United Kingdom",
    flag: "🇬🇧",
    receiveTitle: "the United Kingdom",
    localCurrency: "GBP",
    localAccountTitle: "GBP account",
    localAccountSubtitle: "Client pays via FPS, CHAPS, or BACS — UK payment rails.",
    paymentMethodLocal: "FPS / CHAPS / BACS",
    available: 2100,
    pending: 450,
    fxRateToInr: 103.5,
    fxUpdatedAt: "2026-03-17T10:40:00",
    estimatedSettlementDays: "2–5 business days",
    preferredRibbon: "Preferred by payers in the UK",
    localRows: [
      { label: "Account holder", value: "Acme Exports Pvt Ltd" },
      { label: "Account number", value: "80273629" },
      { label: "Sort code", value: "20-00-00" },
      { label: "Bank name", value: "Barclays Bank UK" },
      { label: "Account type", value: "Business checking" },
      { label: "Beneficiary address", value: "1 Churchill Place, London, E14 5HP, GB" },
    ],
    swiftAccountTitle: "International SWIFT account",
    swiftCurrenciesNote: "GBP, USD, EUR, and 25+ more",
    swiftWarning: "SWIFT charges may apply on the sender or intermediary banks.",
    swiftRows: [
      { label: "Payment method", value: "SWIFT (international wire)" },
      { label: "IBAN (account number)", value: "GB10TCCL04140480893347" },
      { label: "BIC / SWIFT", value: "TCCLGB3L" },
      { label: "Bank name", value: "The Currency Cloud Limited" },
      { label: "Account holder", value: "Acme Exports Pvt Ltd" },
      { label: "Beneficiary address", value: "12 Steward Street, London, E1 6FQ, GB" },
    ],
    corridorAnalytics: {
      totalRevenue: 48600,
      outstanding: 8200,
      changeRevenue: 5.7,
      sparkRevenue: [52, 55, 54, 60, 58, 64, 62, 68, 66, 72, 70, 76],
      outstandingContext: "FPS/CHAPS/BACS · most clear in 2–5 business days",
      savingsThisMonthInr: 28940.0,
      savingsVsBankPct: 3.5,
    },
  },
  {
    id: "uae",
    label: "United Arab Emirates",
    flag: "🇦🇪",
    receiveTitle: "the United Arab Emirates",
    localCurrency: "AED",
    localAccountTitle: "AED account",
    localAccountSubtitle: "Your client pays in UAE dirhams via bank transfer.",
    paymentMethodLocal: "Bank transfer",
    available: 128400,
    pending: 22000,
    fxRateToInr: 22.65,
    fxUpdatedAt: "2026-03-17T09:55:00",
    estimatedSettlementDays: "Same day – 2 business days",
    localRows: [
      { label: "Account holder", value: "Acme Exports Pvt Ltd" },
      { label: "IBAN", value: "AE123456789012345678901" },
      { label: "Bank name", value: "Emirates NBD" },
      { label: "Account type", value: "Business current" },
      { label: "Beneficiary address", value: "DIFC, Dubai, United Arab Emirates" },
    ],
    swiftAccountTitle: "International SWIFT account",
    swiftCurrenciesNote: "AED, USD, EUR, and 25+ more",
    swiftWarning: "SWIFT charges may apply on the sender or intermediary banks.",
    swiftRows: [
      { label: "Payment method", value: "SWIFT (international wire)" },
      { label: "IBAN (account number)", value: "GB10TCCL04140480893347" },
      { label: "BIC / SWIFT", value: "TCCLGB3L" },
      { label: "Bank name", value: "The Currency Cloud Limited" },
      { label: "Account holder", value: "Acme Exports Pvt Ltd" },
      { label: "Beneficiary address", value: "12 Steward Street, London, E1 6FQ, GB" },
    ],
    corridorAnalytics: {
      totalRevenue: 892000,
      outstanding: 118000,
      changeRevenue: 12.1,
      sparkRevenue: [55, 62, 58, 68, 64, 74, 71, 80, 77, 86, 82, 91],
      outstandingContext: "Local transfers · same day to 2 business days for most credits",
      savingsThisMonthInr: 156200.4,
      savingsVsBankPct: 5.2,
    },
  },
  {
    id: "europe",
    label: "Europe",
    flag: "🇪🇺",
    receiveTitle: "Europe (SEPA)",
    localCurrency: "EUR",
    localAccountTitle: "EUR account",
    localAccountSubtitle: "SEPA transfers for clients in the Eurozone.",
    paymentMethodLocal: "SEPA",
    available: 18420,
    pending: 0,
    fxRateToInr: 90.2,
    fxUpdatedAt: "2026-03-17T09:50:00",
    estimatedSettlementDays: "1–2 business days",
    localRows: [
      { label: "Account holder", value: "Acme Exports Pvt Ltd" },
      { label: "IBAN", value: "DE89370400440532013000" },
      { label: "BIC / SWIFT", value: "COBADEFFXXX" },
      { label: "Bank name", value: "Commerzbank AG" },
      { label: "Account type", value: "Business" },
      { label: "Beneficiary address", value: "Frankfurt am Main, Germany" },
    ],
    swiftAccountTitle: "International SWIFT account",
    swiftCurrenciesNote: "EUR, USD, GBP, and 25+ more",
    swiftWarning: "SWIFT charges may apply on the sender or intermediary banks.",
    swiftRows: [
      { label: "Payment method", value: "SWIFT (international wire)" },
      { label: "IBAN (account number)", value: "GB10TCCL04140480893347" },
      { label: "BIC / SWIFT", value: "TCCLGB3L" },
      { label: "Bank name", value: "The Currency Cloud Limited" },
      { label: "Account holder", value: "Acme Exports Pvt Ltd" },
      { label: "Beneficiary address", value: "12 Steward Street, London, E1 6FQ, GB" },
    ],
    corridorAnalytics: {
      totalRevenue: 71200,
      outstanding: 9600,
      changeRevenue: 3.9,
      sparkRevenue: [48, 51, 50, 55, 53, 58, 56, 61, 59, 64, 62, 67],
      outstandingContext: "SEPA SCT — majority of credits land in 1–2 business days",
      savingsThisMonthInr: 42118.65,
      savingsVsBankPct: 4.1,
    },
  },
  {
    id: "canada",
    label: "Canada",
    flag: "🇨🇦",
    receiveTitle: "Canada",
    localCurrency: "CAD",
    localAccountTitle: "CAD account",
    localAccountSubtitle: "EFT and other payment rails for Canadian payers.",
    paymentMethodLocal: "EFT",
    available: 0,
    pending: 4890,
    fxRateToInr: 61.05,
    fxUpdatedAt: "2026-03-17T09:45:00",
    estimatedSettlementDays: "2–4 business days",
    localRows: [
      { label: "Account holder", value: "Acme Exports Pvt Ltd" },
      { label: "Account number", value: "00345678912" },
      { label: "Institution number", value: "003" },
      { label: "Transit number", value: "45678" },
      { label: "Bank name", value: "Royal Bank of Canada" },
      { label: "Beneficiary address", value: "Toronto, ON, Canada" },
    ],
    swiftAccountTitle: "International SWIFT account",
    swiftCurrenciesNote: "CAD, USD, and 25+ more",
    swiftWarning: "SWIFT charges may apply on the sender or intermediary banks.",
    swiftRows: [
      { label: "Payment method", value: "SWIFT (international wire)" },
      { label: "IBAN (account number)", value: "GB10TCCL04140480893347" },
      { label: "BIC / SWIFT", value: "TCCLGB3L" },
      { label: "Bank name", value: "The Currency Cloud Limited" },
      { label: "Account holder", value: "Acme Exports Pvt Ltd" },
      { label: "Beneficiary address", value: "12 Steward Street, London, E1 6FQ, GB" },
    ],
    corridorAnalytics: {
      totalRevenue: 22400,
      outstanding: 6120,
      changeRevenue: -2.2,
      sparkRevenue: [42, 40, 41, 38, 39, 36, 37, 35, 36, 34, 35, 33],
      outstandingContext: "EFT batch cutoffs apply · expect 2–4 business days to clear",
      savingsThisMonthInr: 12890.5,
      savingsVsBankPct: 3.8,
    },
  },
  {
    id: "australia",
    label: "Australia",
    flag: "🇦🇺",
    receiveTitle: "Australia",
    localCurrency: "AUD",
    localAccountTitle: "AUD account",
    localAccountSubtitle: "BECS, NPP, or Osko for Australian payers.",
    paymentMethodLocal: "BECS / NPP / Osko",
    available: 0,
    pending: 12450.75,
    fxRateToInr: 55.22,
    fxUpdatedAt: "2026-03-17T10:42:00",
    estimatedSettlementDays: "2–4 business days",
    preferredRibbon: "Preferred by payers in Australia",
    payerNote: "Some Australian banks may ask your client to verify beneficiary details — share your invoice and this page if needed.",
    localRows: [
      { label: "Account holder", value: "Acme Exports Pvt Ltd" },
      { label: "Account number", value: "051472898" },
      { label: "BSB", value: "252-000" },
      { label: "Bank name", value: "Commonwealth Bank of Australia" },
      { label: "Account type", value: "Business checking" },
      { label: "Beneficiary address", value: "Sydney, NSW, Australia" },
    ],
    swiftAccountTitle: "International SWIFT account",
    swiftCurrenciesNote: "AUD, USD, GBP, and 25+ more",
    swiftWarning: "SWIFT charges may apply on the sender or intermediary banks.",
    swiftRows: [
      { label: "Payment method", value: "SWIFT (international wire)" },
      { label: "IBAN (account number)", value: "GB10TCCL04140480893347" },
      { label: "BIC / SWIFT", value: "TCCLGB3L" },
      { label: "Bank name", value: "The Currency Cloud Limited" },
      { label: "Beneficiary bank country", value: "United Kingdom" },
      { label: "Account holder", value: "Acme Exports Pvt Ltd" },
      { label: "Beneficiary address", value: "12 Steward Street, London, E1 6FQ, GB" },
    ],
    corridorAnalytics: {
      totalRevenue: 198800,
      outstanding: 24800,
      changeRevenue: 9.6,
      sparkRevenue: [60, 64, 62, 70, 67, 74, 72, 79, 76, 84, 81, 88],
      outstandingContext: "BECS/NPP/OSKO · many receipts same day, some overnight",
      savingsThisMonthInr: 58920.1,
      savingsVsBankPct: 4.4,
    },
  },
  {
    id: "singapore",
    label: "Singapore",
    flag: "🇸🇬",
    receiveTitle: "Singapore",
    localCurrency: "SGD",
    localAccountTitle: "SGD account",
    localAccountSubtitle: "FAST and GIRO for Singapore-based payers.",
    paymentMethodLocal: "FAST / GIRO",
    available: 12800,
    pending: 0,
    fxRateToInr: 62.1,
    fxUpdatedAt: "2026-03-16T16:00:00",
    estimatedSettlementDays: "Same day – 1 business day",
    localRows: [
      { label: "Account holder", value: "Acme Exports Pvt Ltd" },
      { label: "Account number", value: "8855123456" },
      { label: "Bank / branch code", value: "7375" },
      { label: "Bank name", value: "DBS Bank Ltd" },
      { label: "Account type", value: "Business" },
      { label: "Beneficiary address", value: "Marina Bay, Singapore" },
    ],
    swiftAccountTitle: "International SWIFT account",
    swiftCurrenciesNote: "SGD, USD, and 25+ more",
    swiftWarning: "SWIFT charges may apply on the sender or intermediary banks.",
    swiftRows: [
      { label: "Payment method", value: "SWIFT (international wire)" },
      { label: "IBAN (account number)", value: "GB10TCCL04140480893347" },
      { label: "BIC / SWIFT", value: "TCCLGB3L" },
      { label: "Bank name", value: "The Currency Cloud Limited" },
      { label: "Account holder", value: "Acme Exports Pvt Ltd" },
      { label: "Beneficiary address", value: "12 Steward Street, London, E1 6FQ, GB" },
    ],
    corridorAnalytics: {
      totalRevenue: 84200,
      outstanding: 11200,
      changeRevenue: 6.3,
      sparkRevenue: [54, 57, 56, 61, 59, 64, 62, 67, 65, 70, 68, 73],
      outstandingContext: "FAST/GIRO — most inflows same day to 1 business day",
      savingsThisMonthInr: 24100.0,
      savingsVsBankPct: 3.2,
    },
  },
  {
    id: "rest-of-world",
    label: "Rest of the world",
    flag: "🌍",
    receiveTitle: "rest of the world",
    localCurrency: "USD",
    localAccountTitle: "SWIFT (USD and more)",
    localAccountSubtitle: "When your client is outside supported collection rails, use this international account.",
    paymentMethodLocal: "SWIFT",
    available: 3200,
    pending: 0,
    fxRateToInr: 83.25,
    fxUpdatedAt: "2026-03-17T10:00:00",
    estimatedSettlementDays: "3–7 business days",
    swiftWarning: "SWIFT charges may apply on the sender or intermediary banks.",
    localRows: [
      { label: "IBAN (account number)", value: "GB10TCCL04140480893347" },
      { label: "BIC / SWIFT", value: "TCCLGB3L" },
      { label: "Bank name", value: "The Currency Cloud Limited" },
      { label: "Account holder", value: "Acme Exports Pvt Ltd" },
      { label: "Beneficiary address", value: "12 Steward Street, London, E1 6FQ, GB" },
    ],
    swiftAccountTitle: "International SWIFT account",
    swiftCurrenciesNote: "USD, GBP, EUR, and 25+ more",
    swiftRows: [
      { label: "Payment method", value: "SWIFT (international wire)" },
      { label: "IBAN (account number)", value: "GB10TCCL04140480893347" },
      { label: "BIC / SWIFT", value: "TCCLGB3L" },
      { label: "Bank name", value: "The Currency Cloud Limited" },
      { label: "Account holder", value: "Acme Exports Pvt Ltd" },
      { label: "Beneficiary address", value: "12 Steward Street, London, E1 6FQ, GB" },
    ],
    corridorAnalytics: {
      totalRevenue: 58200,
      outstanding: 15400,
      changeRevenue: 4.1,
      sparkRevenue: [50, 53, 51, 56, 54, 59, 57, 62, 60, 65, 63, 68],
      outstandingContext: "SWIFT path varies by sender & correspondent banks (3–7 days)",
      savingsThisMonthInr: 31880.22,
      savingsVsBankPct: 6.1,
    },
  },
];

export type InboundStageStatus = "complete" | "current" | "upcoming";

export type InboundPaymentStage = {
  id: string;
  label: string;
  detail?: string;
  status: InboundStageStatus;
};

export type InboundPaymentExample = {
  id: string;
  locationId: string;
  reference: string;
  amount: number;
  currency: string;
  counterparty?: string;
  initiatedAt: string;
  stages: InboundPaymentStage[];
};

/** Sample inbound payments — illustrates a status trail per payment (mock). */
export const inboundPaymentExamples: InboundPaymentExample[] = [
  {
    id: "inb_001",
    locationId: "usa",
    reference: "INV-2026-0142",
    amount: 4200,
    currency: "USD",
    counterparty: "Northwind LLC",
    initiatedAt: "2026-03-18T09:12:00",
    stages: [
      { id: "s1", label: "Received at collection account", detail: "USD 4,200.00", status: "complete" },
      { id: "s2", label: "Compliance & FX", detail: "In progress", status: "current" },
      { id: "s3", label: "Settlement to India", detail: "Expected by 21 Mar", status: "upcoming" },
      { id: "s4", label: "Credited to partner bank", detail: "—", status: "upcoming" },
    ],
  },
  {
    id: "inb_002",
    locationId: "australia",
    reference: "INV-2026-0098",
    amount: 12450.75,
    currency: "AUD",
    counterparty: "Koala Design Pty Ltd",
    initiatedAt: "2026-03-17T08:15:00",
    stages: [
      { id: "s1", label: "Received at collection account", detail: "AUD 12,450.75", status: "complete" },
      { id: "s2", label: "Compliance & FX", detail: "Completed", status: "complete" },
      { id: "s3", label: "Settlement to India", detail: "In transit", status: "current" },
      { id: "s4", label: "Credited to partner bank", detail: "Typically 1–2 business days", status: "upcoming" },
    ],
  },
];

export function getClientReceivingLocation(
  id: string
): ClientReceivingLocation | undefined {
  return clientReceivingLocations.find((l) => l.id === id);
}

export function inboundPaymentsForLocation(
  locationId: string
): InboundPaymentExample[] {
  return inboundPaymentExamples.filter((p) => p.locationId === locationId);
}

/** Recent inbounds to a virtual account (mock ledger — no country column in UI). */
export type McaRecentInbound = {
  id: string;
  locationId: string;
  amount: number;
  currency: string;
  status: string;
  remitterName: string;
  date: string;
};

export const mcaRecentInbounds: McaRecentInbound[] = [
  {
    id: "mca_tx_usa_01",
    locationId: "usa",
    amount: 4200,
    currency: "USD",
    status: "sent_for_settlement",
    remitterName: "Northwind LLC",
    date: "2026-03-24T12:50:00",
  },
  {
    id: "mca_tx_usa_02",
    locationId: "usa",
    amount: 1890.5,
    currency: "USD",
    status: "sent_for_review",
    remitterName: "Amazon",
    date: "2026-03-23T16:22:00",
  },
  {
    id: "mca_tx_usa_03",
    locationId: "usa",
    amount: 975,
    currency: "USD",
    status: "success",
    remitterName: "Stripe Payouts",
    date: "2026-03-22T09:10:00",
  },
  {
    id: "mca_tx_usa_04",
    locationId: "usa",
    amount: 12000,
    currency: "USD",
    status: "in_progress",
    remitterName: "Contoso Ltd",
    date: "2026-03-21T14:33:00",
  },
  {
    id: "mca_tx_usa_05",
    locationId: "usa",
    amount: 640,
    currency: "USD",
    status: "sent_for_review",
    remitterName: "Amazon",
    date: "2026-03-20T11:05:00",
  },
  {
    id: "mca_tx_usa_06",
    locationId: "usa",
    amount: 250,
    currency: "USD",
    status: "success",
    remitterName: "Shopify Capital",
    date: "2026-03-18T08:40:00",
  },
  {
    id: "mca_tx_uk_01",
    locationId: "uk",
    amount: 3200,
    currency: "GBP",
    status: "sent_for_settlement",
    remitterName: "Fabrikam UK Ltd",
    date: "2026-03-24T10:15:00",
  },
  {
    id: "mca_tx_uk_02",
    locationId: "uk",
    amount: 890.25,
    currency: "GBP",
    status: "sent_for_review",
    remitterName: "Amazon",
    date: "2026-03-23T13:00:00",
  },
  {
    id: "mca_tx_uk_03",
    locationId: "uk",
    amount: 450,
    currency: "GBP",
    status: "success",
    remitterName: "Adyen BV",
    date: "2026-03-22T15:20:00",
  },
  {
    id: "mca_tx_uk_04",
    locationId: "uk",
    amount: 2100,
    currency: "GBP",
    status: "in_progress",
    remitterName: "Tailwind Traders",
    date: "2026-03-19T09:45:00",
  },
  {
    id: "mca_tx_uk_05",
    locationId: "uk",
    amount: 175.5,
    currency: "GBP",
    status: "success",
    remitterName: "Wise Ltd",
    date: "2026-03-17T12:00:00",
  },
  {
    id: "mca_tx_au_01",
    locationId: "australia",
    amount: 5600,
    currency: "AUD",
    status: "sent_for_review",
    remitterName: "Koala Design Pty Ltd",
    date: "2026-03-24T08:30:00",
  },
  {
    id: "mca_tx_au_02",
    locationId: "australia",
    amount: 12450.75,
    currency: "AUD",
    status: "in_progress",
    remitterName: "BigCommerce AU",
    date: "2026-03-21T11:00:00",
  },
  {
    id: "mca_tx_au_03",
    locationId: "australia",
    amount: 980,
    currency: "AUD",
    status: "success",
    remitterName: "Afterpay",
    date: "2026-03-19T16:40:00",
  },
  {
    id: "mca_tx_au_04",
    locationId: "australia",
    amount: 2200,
    currency: "AUD",
    status: "sent_for_settlement",
    remitterName: "Canva Pty Ltd",
    date: "2026-03-18T10:10:00",
  },
  {
    id: "mca_tx_au_05",
    locationId: "australia",
    amount: 415,
    currency: "AUD",
    status: "success",
    remitterName: "eBay Commerce",
    date: "2026-03-15T14:25:00",
  },
  {
    id: "mca_tx_sg_01",
    locationId: "singapore",
    amount: 12800,
    currency: "SGD",
    status: "success",
    remitterName: "Grab Financial",
    date: "2026-03-23T09:00:00",
  },
  {
    id: "mca_tx_sg_02",
    locationId: "singapore",
    amount: 2400,
    currency: "SGD",
    status: "sent_for_review",
    remitterName: "Shopee Pte Ltd",
    date: "2026-03-22T11:30:00",
  },
  {
    id: "mca_tx_sg_03",
    locationId: "singapore",
    amount: 890,
    currency: "SGD",
    status: "in_progress",
    remitterName: "Lazada SG",
    date: "2026-03-20T15:00:00",
  },
  {
    id: "mca_tx_sg_04",
    locationId: "singapore",
    amount: 3100,
    currency: "SGD",
    status: "sent_for_settlement",
    remitterName: "Sea Ltd",
    date: "2026-03-19T08:15:00",
  },
  {
    id: "mca_tx_sg_05",
    locationId: "singapore",
    amount: 650,
    currency: "SGD",
    status: "success",
    remitterName: "PayPal Pte",
    date: "2026-03-16T12:45:00",
  },
  {
    id: "mca_tx_row_01",
    locationId: "rest-of-world",
    amount: 3200,
    currency: "USD",
    status: "sent_for_review",
    remitterName: "Global Freight Co",
    date: "2026-03-24T07:00:00",
  },
  {
    id: "mca_tx_row_02",
    locationId: "rest-of-world",
    amount: 15000,
    currency: "USD",
    status: "in_progress",
    remitterName: "Swiss Pharma AG",
    date: "2026-03-22T13:20:00",
  },
  {
    id: "mca_tx_row_03",
    locationId: "rest-of-world",
    amount: 780,
    currency: "USD",
    status: "success",
    remitterName: "Remote.com Inc",
    date: "2026-03-20T10:00:00",
  },
  {
    id: "mca_tx_row_04",
    locationId: "rest-of-world",
    amount: 4250,
    currency: "USD",
    status: "sent_for_settlement",
    remitterName: "Deel Inc",
    date: "2026-03-18T09:30:00",
  },
  {
    id: "mca_tx_row_05",
    locationId: "rest-of-world",
    amount: 199.99,
    currency: "USD",
    status: "success",
    remitterName: "Paddle.com",
    date: "2026-03-14T17:00:00",
  },
  {
    id: "mca_tx_uae_01",
    locationId: "uae",
    amount: 45000,
    currency: "AED",
    status: "sent_for_settlement",
    remitterName: "Emirates Trading LLC",
    date: "2026-03-23T14:00:00",
  },
  {
    id: "mca_tx_uae_02",
    locationId: "uae",
    amount: 12000,
    currency: "AED",
    status: "success",
    remitterName: "Noon E-commerce",
    date: "2026-03-21T10:30:00",
  },
  {
    id: "mca_tx_uae_03",
    locationId: "uae",
    amount: 8800,
    currency: "AED",
    status: "sent_for_review",
    remitterName: "Amazon.ae",
    date: "2026-03-20T09:00:00",
  },
  {
    id: "mca_tx_uae_04",
    locationId: "uae",
    amount: 22000,
    currency: "AED",
    status: "in_progress",
    remitterName: "ADNOC Supply",
    date: "2026-03-19T11:45:00",
  },
  {
    id: "mca_tx_uae_05",
    locationId: "uae",
    amount: 3400,
    currency: "AED",
    status: "success",
    remitterName: "Careem Pay",
    date: "2026-03-17T16:00:00",
  },
  {
    id: "mca_tx_eu_01",
    locationId: "europe",
    amount: 9200,
    currency: "EUR",
    status: "sent_for_review",
    remitterName: "Zalando SE",
    date: "2026-03-24T06:45:00",
  },
  {
    id: "mca_tx_eu_02",
    locationId: "europe",
    amount: 15400,
    currency: "EUR",
    status: "sent_for_settlement",
    remitterName: "SAP SE",
    date: "2026-03-22T12:00:00",
  },
  {
    id: "mca_tx_eu_03",
    locationId: "europe",
    amount: 2100,
    currency: "EUR",
    status: "success",
    remitterName: "Klarna Bank",
    date: "2026-03-21T08:20:00",
  },
  {
    id: "mca_tx_eu_04",
    locationId: "europe",
    amount: 6750,
    currency: "EUR",
    status: "in_progress",
    remitterName: "Booking.com BV",
    date: "2026-03-19T14:10:00",
  },
  {
    id: "mca_tx_eu_05",
    locationId: "europe",
    amount: 890,
    currency: "EUR",
    status: "success",
    remitterName: "Adyen NV",
    date: "2026-03-16T11:00:00",
  },
  {
    id: "mca_tx_ca_01",
    locationId: "canada",
    amount: 4890,
    currency: "CAD",
    status: "in_progress",
    remitterName: "Shopify Inc",
    date: "2026-03-23T15:30:00",
  },
  {
    id: "mca_tx_ca_02",
    locationId: "canada",
    amount: 1200,
    currency: "CAD",
    status: "sent_for_review",
    remitterName: "Amazon.ca",
    date: "2026-03-22T10:00:00",
  },
  {
    id: "mca_tx_ca_03",
    locationId: "canada",
    amount: 560,
    currency: "CAD",
    status: "success",
    remitterName: "Stripe Canada",
    date: "2026-03-20T13:15:00",
  },
  {
    id: "mca_tx_ca_04",
    locationId: "canada",
    amount: 3300,
    currency: "CAD",
    status: "sent_for_settlement",
    remitterName: "Lightspeed POS",
    date: "2026-03-18T09:00:00",
  },
  {
    id: "mca_tx_ca_05",
    locationId: "canada",
    amount: 275.5,
    currency: "CAD",
    status: "success",
    remitterName: "PayPal Canada",
    date: "2026-03-15T12:30:00",
  },
];

export function recentInboundsForLocation(
  locationId: string,
  limit = 5
): McaRecentInbound[] {
  return mcaRecentInbounds
    .filter((r) => r.locationId === locationId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

// ─── Platform withdrawals (marketplace / payroll payouts) ───────────────────────

export type PlatformPayoutRegion = {
  id: string;
  label: string;
  flag: string;
  currencyLabel: string;
  detailRows: BankDetailRow[];
};

export type PlatformPayoutGuide = {
  id: string;
  name: string;
  category: string;
  /** Sidebar / header visual (emoji). */
  navIcon: string;
  /** Currency suffix for earning & outstanding stats. */
  statsCurrency: string;
  /** Same shape as MCA corridor strip — illustrative. */
  payoutAnalytics: McaCorridorAnalyticsStrip;
  connected: boolean;
  headline: string;
  steps: { title: string; body: string }[];
  helpHint?: string;
  videoGuideTitle?: string;
  regions: PlatformPayoutRegion[];
};

export type PlatformRecentPayout = {
  id: string;
  platformId: string;
  amount: number;
  currency: string;
  status: string;
  reference: string;
  date: string;
};

export const platformRecentPayouts: PlatformRecentPayout[] = [
  {
    id: "pp_amz_01",
    platformId: "amazon",
    amount: 8420.5,
    currency: "USD",
    status: "success",
    reference: "US marketplace settlement",
    date: "2026-03-22T09:00:00",
  },
  {
    id: "pp_amz_02",
    platformId: "amazon",
    amount: 3120.0,
    currency: "USD",
    status: "sent_for_settlement",
    reference: "US accrual (pending)",
    date: "2026-03-21T14:20:00",
  },
  {
    id: "pp_amz_03",
    platformId: "amazon",
    amount: 1890.25,
    currency: "GBP",
    status: "success",
    reference: "UK marketplace",
    date: "2026-03-19T11:15:00",
  },
  {
    id: "pp_deel_01",
    platformId: "deel",
    amount: 12400.0,
    currency: "USD",
    status: "success",
    reference: "Payroll batch Mar 15",
    date: "2026-03-15T08:30:00",
  },
  {
    id: "pp_deel_02",
    platformId: "deel",
    amount: 5600.0,
    currency: "USD",
    status: "in_progress",
    reference: "Contractor payouts",
    date: "2026-03-14T16:00:00",
  },
  {
    id: "pp_up_01",
    platformId: "upwork",
    amount: 4250.75,
    currency: "USD",
    status: "success",
    reference: "Weekly withdrawal",
    date: "2026-03-20T10:00:00",
  },
  {
    id: "pp_up_02",
    platformId: "upwork",
    amount: 980.0,
    currency: "USD",
    status: "success",
    reference: "Weekly withdrawal",
    date: "2026-03-13T09:45:00",
  },
];

export function recentPayoutsForPlatform(platformId: string, limit = 5): PlatformRecentPayout[] {
  return platformRecentPayouts
    .filter((p) => p.platformId === platformId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export const platformPayoutGuides: PlatformPayoutGuide[] = [
  {
    id: "amazon",
    name: "Amazon",
    category: "Marketplace",
    navIcon: "🛒",
    statsCurrency: "USD",
    payoutAnalytics: {
      totalRevenue: 98650,
      outstanding: 4200,
      changeRevenue: 7.2,
      sparkRevenue: [55, 58, 56, 62, 60, 65, 63, 68, 66, 71, 69, 74],
      outstandingContext: "Settlement batch in flight · usually 3–5 business days to credit",
      savingsThisMonthInr: 9120.5,
      savingsVsBankPct: 4,
    },
    connected: true,
    headline:
      "Link this account in Seller Central so marketplace disbursements settle into your PayGlocal balance.",
    steps: [
      {
        title: "Add your payout account in Amazon",
        body: "In Seller Central, open Settings → Account Info → Deposit methods and add the bank details shown here.",
      },
      {
        title: "Withdraw to PayGlocal",
        body: "When Amazon pays out, funds arrive in this virtual account. You’ll get FIRA and ledger entries automatically where enabled.",
      },
      {
        title: "Upload supporting documents",
        body: "Attach your invoice or settlement note in the dashboard so compliance can match the inbound amount.",
      },
    ],
    helpHint: "Need help? Our team can walk through Seller Central screens with you.",
    videoGuideTitle: "Link your account on Amazon Seller Central",
    regions: [
      {
        id: "amazon-com",
        label: "amazon.com (United States)",
        flag: "🇺🇸",
        currencyLabel: "USD · ACH",
        detailRows: [
          { label: "Payment method", value: "ACH" },
          { label: "ACH routing number", value: "026073150" },
          { label: "Account number", value: "8336019414" },
          { label: "Account type", value: "Business checking account" },
          { label: "Bank name", value: "Community Federal Savings Bank" },
          { label: "Beneficiary address", value: "5 Penn Plaza, 14th Floor, New York, NY 10001, US" },
          { label: "Account holder name", value: "Acme Exports Pvt Ltd" },
        ],
      },
      {
        id: "amazon-co-uk",
        label: "amazon.co.uk (United Kingdom)",
        flag: "🇬🇧",
        currencyLabel: "GBP · FPS / BACS",
        detailRows: [
          { label: "Payment method", value: "FPS / BACS" },
          { label: "Sort code", value: "20-00-00" },
          { label: "Account number", value: "80273629" },
          { label: "Account type", value: "Business checking account" },
          { label: "Bank name", value: "Barclays Bank UK" },
          { label: "Beneficiary address", value: "1 Churchill Place, London, E14 5HP, GB" },
          { label: "Account holder name", value: "Acme Exports Pvt Ltd" },
        ],
      },
      {
        id: "amazon-ca",
        label: "amazon.ca (Canada)",
        flag: "🇨🇦",
        currencyLabel: "CAD · EFT",
        detailRows: [
          { label: "Payment method", value: "EFT" },
          { label: "Institution number", value: "003" },
          { label: "Transit number", value: "45678" },
          { label: "Account number", value: "00345678912" },
          { label: "Bank name", value: "Royal Bank of Canada" },
          { label: "Beneficiary address", value: "Toronto, ON, Canada" },
          { label: "Account holder name", value: "Acme Exports Pvt Ltd" },
        ],
      },
    ],
  },
  {
    id: "deel",
    name: "Deel",
    category: "Payroll",
    navIcon: "🌐",
    statsCurrency: "USD",
    payoutAnalytics: {
      totalRevenue: 45200,
      outstanding: 11800,
      changeRevenue: 4.8,
      sparkRevenue: [48, 50, 49, 52, 51, 54, 53, 56, 55, 58, 57, 60],
      outstandingContext: "Payroll + contractor runs · clears as Deel releases each batch",
      savingsThisMonthInr: 6840.0,
      savingsVsBankPct: 3.5,
    },
    connected: false,
    headline:
      "Use these details where Deel asks for a bank account to send contractor or employer-of-record payouts.",
    steps: [
      {
        title: "Open payout settings in Deel",
        body: "Navigate to your wallet or payout method settings and choose to add a bank transfer account.",
      },
      {
        title: "Enter the USD account below",
        body: "Copy each field exactly — mismatched names are the most common reason for failed payouts.",
      },
      {
        title: "Confirm test deposit if required",
        body: "Deel may send a small verification credit; acknowledge it in Deel and in PayGlocal when it arrives.",
      },
    ],
    regions: [
      {
        id: "deel-usd",
        label: "Global USD",
        flag: "🇺🇸",
        currencyLabel: "USD · ACH",
        detailRows: [
          { label: "Payment method", value: "ACH" },
          { label: "Routing number", value: "021000021" },
          { label: "Account number", value: "9876543210" },
          { label: "Account type", value: "Business checking" },
          { label: "Bank name", value: "JPMorgan Chase Bank N.A." },
          { label: "Beneficiary address", value: "5 Penn Plaza, 14th Floor, New York, NY 10001, US" },
          { label: "Account holder name", value: "Acme Exports Pvt Ltd" },
        ],
      },
    ],
  },
  {
    id: "upwork",
    name: "Upwork",
    category: "Freelance",
    navIcon: "💼",
    statsCurrency: "USD",
    payoutAnalytics: {
      totalRevenue: 28400,
      outstanding: 2100,
      changeRevenue: 2.4,
      sparkRevenue: [42, 44, 43, 45, 44, 46, 45, 47, 46, 48, 47, 49],
      outstandingContext: "Weekly withdrawal cycle · funds leave Upwork then post here",
      savingsThisMonthInr: 3210.75,
      savingsVsBankPct: 3.8,
    },
    connected: false,
    headline:
      "Add this account as your Get Paid method so Upwork withdrawals land in your PayGlocal collection balance.",
    steps: [
      {
        title: "Go to Upwork payment settings",
        body: "Settings → Get Paid → Add payment method → Direct to local bank.",
      },
      {
        title: "Choose United States / USD",
        body: "Select the region that matches the routing and account number shown for your active marketplace.",
      },
      {
        title: "Save and set as default",
        body: "Set as primary if you want all future withdrawals to use PayGlocal automatically.",
      },
    ],
    regions: [
      {
        id: "upwork-usd",
        label: "United States (USD)",
        flag: "🇺🇸",
        currencyLabel: "USD · ACH",
        detailRows: [
          { label: "Payment method", value: "ACH" },
          { label: "Routing number", value: "026073150" },
          { label: "Account number", value: "8336019414" },
          { label: "Account type", value: "Business checking account" },
          { label: "Bank name", value: "Community Federal Savings Bank" },
          { label: "Beneficiary address", value: "5 Penn Plaza, 14th Floor, New York, NY 10001, US" },
          { label: "Account holder name", value: "Acme Exports Pvt Ltd" },
        ],
      },
    ],
  },
];

export function getPlatformPayoutGuide(id: string): PlatformPayoutGuide | undefined {
  return platformPayoutGuides.find((p) => p.id === id);
}

// ─── Invoices ──────────────────────────────────────────────────────────────────

export const invoices = [
  {
    id: "inv_001",
    invoiceNumber: "INV-2026-001",
    customerName: "Acme Corp",
    email: "billing@acme.com",
    amount: 45000,
    currency: "INR",
    status: "paid",
    dueDate: "2026-03-15T00:00:00",
    createdAt: "2026-03-01T00:00:00",
  },
  {
    id: "inv_002",
    invoiceNumber: "INV-2026-002",
    customerName: "TechVentures Ltd",
    email: "accounts@techventures.io",
    amount: 128000,
    currency: "INR",
    status: "pending",
    dueDate: "2026-03-20T00:00:00",
    createdAt: "2026-03-05T00:00:00",
  },
  {
    id: "inv_003",
    invoiceNumber: "INV-2026-003",
    customerName: "Global Imports Inc",
    email: "finance@globalimports.com",
    amount: 8200,
    currency: "USD",
    status: "overdue",
    dueDate: "2026-03-08T00:00:00",
    createdAt: "2026-02-22T00:00:00",
  },
  {
    id: "inv_004",
    invoiceNumber: "INV-2026-004",
    customerName: "StartupHub",
    email: "pay@startuphub.co",
    amount: 32000,
    currency: "INR",
    status: "draft",
    dueDate: "2026-03-30T00:00:00",
    createdAt: "2026-03-12T00:00:00",
  },
];

// ─── Invoice Links ─────────────────────────────────────────────────────────────

export const invoiceLinks = [
  {
    id: "invl_001",
    invoiceNumber: "INV-2026-0090",
    amount: 94400,
    currency: "INR",
    status: "paid",
    customer: "Deepankar Raj",
    phone: "+91 7011458408",
    email: "deepankar@payglocal.in",
    paymentLink: "https://api.payment/48df4",
    createdAt: "2026-02-19T14:00:00",
    dueDate: "2026-03-01T00:00:00",
  },
  {
    id: "invl_002",
    invoiceNumber: "INV-2026-0089",
    amount: 1003,
    currency: "USD",
    status: "active",
    customer: "John Miller Antonio",
    phone: "+91 7011458408",
    email: "john.miller@gmail.com",
    paymentLink: "https://api.payment/29ab2",
    createdAt: "2026-02-19T14:00:00",
    dueDate: "2026-03-21T00:00:00",
  },
  {
    id: "invl_003",
    invoiceNumber: "INV-2026-0088",
    amount: 100003,
    currency: "INR",
    status: "overdue",
    customer: "Deepankar Raj",
    phone: "+91 7011458408",
    email: "deepankar@payglocal.in",
    paymentLink: "https://api.payment/c91f3",
    createdAt: "2026-02-19T14:00:00",
    dueDate: "2026-03-16T00:00:00",
  },
  {
    id: "invl_004",
    invoiceNumber: "INV-2026-0087",
    amount: 103,
    currency: "USD",
    status: "draft",
    customer: "John Miller Antonio",
    phone: "+91 7011458408",
    email: "john.miller@gmail.com",
    paymentLink: "https://api.payment/f72b1",
    createdAt: "2026-02-19T14:00:00",
    dueDate: "2026-04-01T00:00:00",
  },
];

// ─── eBRC ──────────────────────────────────────────────────────────────────────

export const ebrcEntries = [
  {
    id: "ebrc_001",
    sbNumber: "SB/2026/001234",
    bankRefNumber: "BRC2026001",
    exporterName: "mcatest123 Pvt Ltd",
    amount: 125000,
    currency: "USD",
    status: "issued",
    issueDate: "2026-03-08T00:00:00",
    expiryDate: "2026-09-08T00:00:00",
  },
  {
    id: "ebrc_002",
    sbNumber: "SB/2026/001235",
    bankRefNumber: "BRC2026002",
    exporterName: "mcatest123 Pvt Ltd",
    amount: 84500,
    currency: "EUR",
    status: "pending",
    issueDate: null,
    expiryDate: null,
  },
  {
    id: "ebrc_003",
    sbNumber: "SB/2026/001236",
    bankRefNumber: "BRC2026003",
    exporterName: "mcatest123 Pvt Ltd",
    amount: 210000,
    currency: "GBP",
    status: "issued",
    issueDate: "2026-02-20T00:00:00",
    expiryDate: "2026-08-20T00:00:00",
  },
];

// ─── Clients ───────────────────────────────────────────────────────────────────

export const clients = [
  {
    id: "cli_001",
    name: "mcatest123",
    email: "admin@mcatest123.com",
    role: "Admin",
    status: "active",
    joinedAt: "2024-01-15T00:00:00",
    lastActive: "2026-03-16T08:30:00",
  },
  {
    id: "cli_002",
    name: "Yajat Gupta",
    email: "yajat.gupta@payglocal.in",
    role: "Manager",
    status: "active",
    joinedAt: "2024-03-22T00:00:00",
    lastActive: "2026-03-16T07:15:00",
  },
  {
    id: "cli_003",
    name: "Arjun Mehta",
    email: "arjun.m@design.co",
    role: "Developer",
    status: "active",
    joinedAt: "2024-06-10T00:00:00",
    lastActive: "2026-03-15T16:45:00",
  },
  {
    id: "cli_004",
    name: "Priya Patel",
    email: "priya.p@startup.co",
    role: "Viewer",
    status: "inactive",
    joinedAt: "2024-09-05T00:00:00",
    lastActive: "2026-02-28T11:00:00",
  },
];

// ─── AI Storefront (seed only; runtime mutations live in lib/ai-storefront/dev-store) ─

export {
  aiStorefrontOverviewSeed,
  aiStorefrontSettingsSeed,
  aiStorefrontProductsSeed,
  aiStorefrontInventorySeed,
  aiStorefrontAiContextSeed,
  aiStorefrontPreviewDefaultSeed,
  aiStorefrontPreviewCatalogueDownSeed,
} from "./ai-storefront";
