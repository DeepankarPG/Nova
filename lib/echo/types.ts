export type EchoPhase =
  | "idle"
  | "thinking"
  | "creating"
  | "finalizing"
  | "done"
  | "error";

export type PaymentLinkIntent = {
  amount: number;
  currency: string;
};

export type EchoPaymentLinkResult = {
  kind: "payment_link";
  id: string;
  url: string;
  amount: number;
  currency: string;
};

export type EchoPaymentLinkSentBlock = {
  type: "payment_link_sent";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  result: EchoPaymentLinkResult;
};

export type EchoAssistantBlock =
  | { type: "text"; content: string }
  | { type: "payment_link"; result: EchoPaymentLinkResult }
  | EchoPaymentLinkSentBlock;

export type EchoMessage = {
  id: string;
  role: "user" | "assistant";
  createdAt: number;
  text: string;
  attachmentNames?: string[];
  blocks?: EchoAssistantBlock[];
};
