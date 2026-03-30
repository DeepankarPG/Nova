export type LinkStatus = "active" | "paid" | "expired" | "deactivated";

export interface PaymentLink {
  id: string;
  amount: number;
  currency: string;
  status: LinkStatus;
  customer: string;
  phone: string;
  email: string;
  description: string;
  createdAt: string;
  expiresAt: string | null;
  notifyVia: string[];
  transactions: { id: string; status: string; cardLast4: string; date: string }[];
}
