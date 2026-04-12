import type { EchoAssistantBlock, EchoPaymentLinkResult, PaymentLinkIntent } from "./types";
import { parsePaymentLinkIntent } from "./parsePaymentLinkIntent";

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function buildPaymentLinkResult(intent: PaymentLinkIntent): EchoPaymentLinkResult {
  const id = `pl_${Math.random().toString(36).slice(2, 10)}`;
  return {
    kind: "payment_link",
    id,
    url: `https://pay.payglocal.test/l/${id}`,
    amount: intent.amount,
    currency: intent.currency,
  };
}

export type PipelineCallbacks = {
  onPhase: (phase: "thinking" | "creating" | "finalizing") => void;
};

export async function runMockEchoPipeline(
  userText: string,
  cb: PipelineCallbacks
): Promise<{ blocks: EchoAssistantBlock[]; error?: string }> {
  const intent = parsePaymentLinkIntent(userText);

  cb.onPhase("thinking");
  await delay(2200 + Math.random() * 800);
  cb.onPhase("creating");
  await delay(2600 + Math.random() * 900);
  cb.onPhase("finalizing");
  await delay(1800 + Math.random() * 700);

  if (intent) {
    const result = buildPaymentLinkResult(intent);
    const blocks: EchoAssistantBlock[] = [
      {
        type: "text",
        content: `Here’s a **${intent.currency} ${intent.amount.toLocaleString()}** link — grab it from the card or hop into **Payment links** when you need to tweak it.`,
      },
      { type: "payment_link", result },
      {
        type: "text",
        content: `Want me to **note who you’re sending it to**? Drop their **name**, **email**, and **phone** whenever it works for you — one message is enough, e.g. *Priya Sharma, priya@email.com, +91 98765 43210*. Totally optional.`,
      },
    ];
    return { blocks };
  }

  const t = userText.toLowerCase();
  if (/payment\s*links|take me to payment|open payment link/.test(t)) {
    return {
      blocks: [
        {
          type: "text",
          content:
            "You can open **Payment links** from **Payments → Payment Products → Payment Links**, or start a new one from the blue **+** button in the header.",
        },
      ],
    };
  }
  if (/earning|revenue|sales|last week/.test(t)) {
    return {
      blocks: [
        {
          type: "text",
          content:
            "For **earnings and trends**, use the **Dashboard** and **Finance** sections. **Settlement reports** show what has been paid out. This demo doesn't load live numbers — open those pages for current data.",
        },
      ],
    };
  }
  if (/settlement/.test(t)) {
    return {
      blocks: [
        {
          type: "text",
          content:
            "**Settlement reports** list payouts to your bank. Go to **Finance → Settlement reports** for downloads and filters.",
        },
      ],
    };
  }
  if (/dispute|chargeback/.test(t)) {
    return {
      blocks: [
        {
          type: "text",
          content:
            "**Disputes** and chargebacks show up under **Payments → Transactions** (filter by dispute or chargeback status). This demo doesn’t load live dispute rows — use that view for current cases.",
        },
      ],
    };
  }
  if (/failed transaction|declined|failed payment/.test(t)) {
    return {
      blocks: [
        {
          type: "text",
          content:
            "**Failed transactions** are in **Payments → Transactions**. Filter by **Failed** or **Declined** to see errors and retry options. Open a row for the gateway response code.",
        },
      ],
    };
  }
  return {
    blocks: [
      {
        type: "text",
        content:
          "I can help with **payment links**, **settlements**, and navigation in this dashboard. Try asking something like: *Create a payment link for $500*.",
      },
    ],
  };
}
