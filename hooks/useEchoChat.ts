"use client";

import { useCallback, useState } from "react";
import type {
  EchoMessage,
  EchoPaymentLinkResult,
  EchoPhase,
} from "@/lib/echo/types";
import { runMockEchoPipeline } from "@/lib/echo/mockEchoPipeline";
import { parsePaymentLinkIntent } from "@/lib/echo/parsePaymentLinkIntent";
import { parseShareFollowUp } from "@/lib/echo/parseShareFollowUp";

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `m_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function useEchoChat() {
  const [messages, setMessages] = useState<EchoMessage[]>([]);
  const [phase, setPhase] = useState<EchoPhase>("idle");
  const [busy, setBusy] = useState(false);
  const [pendingPaymentShare, setPendingPaymentShare] =
    useState<EchoPaymentLinkResult | null>(null);

  const reset = useCallback(() => {
    setMessages([]);
    setPhase("idle");
    setBusy(false);
    setPendingPaymentShare(null);
  }, []);

  const sendUserMessage = useCallback(
    async (text: string, fileNames: string[]) => {
      const trimmed = text.trim();
      if (!trimmed && fileNames.length === 0) return;

      const userMsg: EchoMessage = {
        id: newId(),
        role: "user",
        createdAt: Date.now(),
        text: trimmed || "(attachment)",
        attachmentNames: fileNames.length ? fileNames : undefined,
      };
      setMessages((m) => [...m, userMsg]);
      setBusy(true);
      setPhase("thinking");

      const pipelineInput = [trimmed, ...fileNames.map((f) => `file:${f}`)].join(
        " "
      );
      const newLinkIntent = parsePaymentLinkIntent(pipelineInput);

      try {
        if (!newLinkIntent && pendingPaymentShare) {
          await delay(480);
          const parsed = parseShareFollowUp(trimmed);
          const link = pendingPaymentShare;

          const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(
            trimmed
          );
          const bailToMainPipeline =
            parsed.kind === "need_details" &&
            !hasEmail &&
            (parsePaymentLinkIntent(trimmed) !== null ||
              /\b(dispute|settlement|earning|dashboard|failed transaction|show me my|open settlement|chargeback|payment links)\b/i.test(
                trimmed
              ));

          if (!bailToMainPipeline) {
            if (parsed.kind === "declined") {
              setPendingPaymentShare(null);
              setMessages((m) => [
                ...m,
                {
                  id: newId(),
                  role: "assistant",
                  createdAt: Date.now(),
                  text: "",
                  blocks: [
                    {
                      type: "text",
                      content:
                        "No worries — the link is still in the card above. **Copy** it whenever you like, or open **Payment links** to manage it later.",
                    },
                  ],
                },
              ]);
              return;
            }

            if (parsed.kind === "need_details") {
              setMessages((m) => [
                ...m,
                {
                  id: newId(),
                  role: "assistant",
                  createdAt: Date.now(),
                  text: "",
                  blocks: [
                    {
                      type: "text",
                      content:
                        "Whenever you’re ready, send **name**, **email**, and **phone** in one go — like *Ravi Nair, ravi@email.com, 9876543210*.",
                    },
                  ],
                },
              ]);
              return;
            }

            setPendingPaymentShare(null);
            setMessages((m) => [
              ...m,
              {
                id: newId(),
                role: "assistant",
                createdAt: Date.now(),
                text: "",
                blocks: [
                  {
                    type: "text",
                    content: `Perfect — I’ve noted **${parsed.name}** and queued this link for them. Here’s your confirmation:`,
                  },
                  {
                    type: "payment_link_sent",
                    customerName: parsed.name,
                    customerEmail: parsed.email,
                    customerPhone: parsed.phone,
                    result: link,
                  },
                ],
              },
            ]);
            return;
          }

          setPendingPaymentShare(null);
        }

        const { blocks } = await runMockEchoPipeline(pipelineInput, {
          onPhase: (p) => setPhase(p),
        });

        setPhase("done");
        const assistantMsg: EchoMessage = {
          id: newId(),
          role: "assistant",
          createdAt: Date.now(),
          text: "",
          blocks,
        };
        setMessages((m) => [...m, assistantMsg]);

        const pl = blocks.find((b) => b.type === "payment_link");
        setPendingPaymentShare(pl ? pl.result : null);
      } catch {
        setPhase("error");
        setMessages((m) => [
          ...m,
          {
            id: newId(),
            role: "assistant",
            createdAt: Date.now(),
            text: "Something went wrong. Please try again.",
          },
        ]);
      } finally {
        setBusy(false);
        setPhase("idle");
      }
    },
    [pendingPaymentShare]
  );

  return { messages, phase, busy, sendUserMessage, reset };
}
