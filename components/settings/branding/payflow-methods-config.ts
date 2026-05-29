import { PAYFLOW_ICONS } from "@/components/settings/branding/payflow-brand-icons";

export const PAYFLOW_METHOD_CONFIG = [
  {
    id: "card" as const,
    label: "Credit or debit card",
    icons: [...PAYFLOW_ICONS.card],
    more: "+4" as const,
  },
  {
    id: "upi" as const,
    label: "UPI",
    icons: [...PAYFLOW_ICONS.upi],
    more: "+4" as const,
  },
  {
    id: "netBanking" as const,
    label: "Net banking",
    icons: [...PAYFLOW_ICONS.netBanking],
    more: "+32" as const,
  },
  {
    id: "paypal" as const,
    label: "Paypal",
    icons: [...PAYFLOW_ICONS.paypal],
    more: undefined,
  },
  {
    id: "global" as const,
    label: "Global Payment Methods",
    icons: [...PAYFLOW_ICONS.global],
    more: "+4" as const,
  },
] as const;

export type PayflowMethodId = (typeof PAYFLOW_METHOD_CONFIG)[number]["id"];

export const DEFAULT_ENABLED_METHODS: Record<PayflowMethodId, boolean> = {
  card: true,
  upi: true,
  netBanking: true,
  paypal: true,
  global: true,
};
