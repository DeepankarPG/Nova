"use client";

import { useEffect, useRef, useState } from "react";
import type { EchoMessage, EchoPhase } from "@/lib/echo/types";
import { ECHO_USER_FIRST_NAME } from "@/lib/echo/demoUser";
import { EchoGlobeMark } from "@/components/echo/EchoGlobeMark";
import { EchoCollapsibleStatus } from "./EchoCollapsibleStatus";
import { EchoMessageActions } from "./EchoMessageActions";
import { EchoPaymentLinkCard } from "./EchoPaymentLinkCard";
import { EchoPaymentLinkSentReveal } from "./EchoPaymentLinkSentReveal";
import { renderEchoRichText } from "./renderEchoRichText";
import { blocksToPlainText } from "./blocksToPlainText";
import { cn } from "@/lib/utils";

type Props = {
  messages: EchoMessage[];
  phase: EchoPhase;
  busy: boolean;
};

export function EchoMessageList({ messages, phase, busy }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [paymentSentReplay, setPaymentSentReplay] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, phase, busy]);

  const empty = messages.length === 0 && !busy;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-3 sm:px-4">
      {empty && (
        <div className="flex flex-1 flex-col items-center justify-center px-2 py-6 text-center">
          <EchoGlobeMark className="h-12 w-12 shrink-0" />
          <p className="mt-4 text-[13px] font-medium text-muted-foreground">
            Hey {ECHO_USER_FIRST_NAME}!
          </p>
          <p className="mt-1 max-w-[18rem] text-[1.2rem] font-bold leading-snug tracking-tight text-foreground sm:text-[1.35rem]">
            How can I help you?
          </p>
        </div>
      )}

      <ul className="flex list-none flex-col gap-4 p-0">
        {messages.map((m) => (
          <li key={m.id}>
            {m.role === "user" ? (
              <div className="flex justify-end">
                <div className="max-w-[88%] rounded-2xl border border-border bg-card px-3.5 py-2.5 text-[13px] leading-relaxed text-foreground shadow-sm">
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  {m.attachmentNames?.length ? (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {m.attachmentNames.join(", ")}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2.5">
                <EchoGlobeMark className="h-8 w-8 shrink-0" />
                <div className="min-w-0 flex-1 text-[13px] leading-relaxed text-foreground">
                  {m.blocks?.map((b, i) => {
                    const gap = i > 0 ? "mt-3" : "";
                    if (b.type === "text") {
                      return (
                        <p
                          key={i}
                          className={cn("whitespace-pre-wrap", gap)}
                        >
                          {renderEchoRichText(b.content)}
                        </p>
                      );
                    }
                    if (b.type === "payment_link") {
                      return (
                        <div key={i} className={gap}>
                          <EchoPaymentLinkCard result={b.result} />
                        </div>
                      );
                    }
                    if (b.type === "payment_link_sent") {
                      return (
                        <div key={i} className={gap}>
                          <EchoPaymentLinkSentReveal
                            key={`echo-pls-${m.id}-${paymentSentReplay[m.id] ?? 0}`}
                            customerName={b.customerName}
                            customerEmail={b.customerEmail}
                            customerPhone={b.customerPhone}
                            result={b.result}
                          />
                        </div>
                      );
                    }
                    return null;
                  })}
                  {!m.blocks?.length && m.text ? (
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  ) : null}
                  {(m.blocks?.length || m.text) && (
                    <EchoMessageActions
                      plainText={blocksToPlainText(m.blocks) || m.text}
                      onRegenerate={
                        m.blocks?.some((b) => b.type === "payment_link_sent")
                          ? () =>
                              setPaymentSentReplay((prev) => ({
                                ...prev,
                                [m.id]: (prev[m.id] ?? 0) + 1,
                              }))
                          : undefined
                      }
                    />
                  )}
                </div>
              </div>
            )}
          </li>
        ))}
        {busy &&
        phase !== "idle" &&
        phase !== "done" &&
        phase !== "error" ? (
          <li key="echo-status">
            <EchoCollapsibleStatus phase={phase} busy={busy} />
          </li>
        ) : null}
      </ul>
      <div ref={bottomRef} className="h-1 shrink-0" />
    </div>
  );
}
