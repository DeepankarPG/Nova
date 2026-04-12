import type { EchoAssistantBlock } from "@/lib/echo/types";

export function blocksToPlainText(blocks: EchoAssistantBlock[] | undefined): string {
  if (!blocks?.length) return "";
  return blocks
    .map((b) => {
      if (b.type === "text") return b.content.replace(/\*\*([^*]+)\*\*/g, "$1");
      if (b.type === "payment_link") {
        return `Payment link ${b.result.currency} ${b.result.amount} — ${b.result.url}`;
      }
      if (b.type === "payment_link_sent") {
        return `Payment link sent to ${b.customerName} (${b.customerEmail}, ${b.customerPhone})`;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n\n");
}
