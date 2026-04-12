"use client";

import type { EchoPaymentLinkResult } from "@/lib/echo/types";
import { EchoPaymentLinkSentCard } from "./EchoPaymentLinkSentCard";
import { GeneratingReveal, type GeneratingRevealProps } from "./GeneratingReveal";

type Props = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  result: EchoPaymentLinkResult;
  className?: string;
} & Partial<
  Pick<
    GeneratingRevealProps,
    | "introSettleMs"
    | "skeletonMinMs"
    | "crossfadeOutSec"
    | "crossfadeInSec"
    | "reducedIntroMs"
    | "skeleton"
    | "introMinHeightClassName"
    | "skeletonMotionKey"
    | "contentMotionKey"
  >
>;

export function EchoPaymentLinkSentReveal({
  customerName,
  customerEmail,
  customerPhone,
  result,
  className,
  ...generating
}: Props) {
  return (
    <GeneratingReveal className={className} {...generating}>
      <EchoPaymentLinkSentCard
        customerName={customerName}
        customerEmail={customerEmail}
        customerPhone={customerPhone}
        result={result}
      />
    </GeneratingReveal>
  );
}
