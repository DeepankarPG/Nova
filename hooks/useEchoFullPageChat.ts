"use client";

import { useCallback, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { AgentStep, DashboardSpec } from "@/lib/echo/genUITypes";
import { runFullPagePipeline } from "@/lib/echo/mockEchoFullPagePipeline";
import { streamAssistantBody } from "@/lib/echo/streamAssistantText";

/** How the user sent the message — drives voice-note vs text bubble (do not infer from text alone). */
export type EchoUserInputChannel = "text" | "voice";

export type FullPageMessage = {
  id: string;
  role: "user" | "assistant";
  createdAt: number;
  text: string;
  /** User messages only: `voice` when sent from mock voice flow. */
  inputChannel?: EchoUserInputChannel;
  /** Agent steps — only on assistant messages during / after generation. */
  steps?: AgentStep[];
  /** Populated after pipeline completes. */
  dashboardSpec?: DashboardSpec | null;
  /** Suggested follow-up prompts (assistant only). */
  followUps?: string[];
  /** Line shown in the hug strip after the streamed body. */
  closingLine?: string;
  /** True after stream + closing/dashboard applied — drives footer visibility. */
  replyComplete?: boolean;
};

type ChatState = "idle" | "streaming" | "done" | "error";

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `m_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function useEchoFullPageChat() {
  const [messages, setMessages] = useState<FullPageMessage[]>([]);
  const [state, setState] = useState<ChatState>("idle");
  const [replyStreaming, setReplyStreaming] = useState(false);
  const reduceMotion = useReducedMotion();

  const busy = state === "streaming" || replyStreaming;

  const reset = useCallback(() => {
    setMessages([]);
    setState("idle");
    setReplyStreaming(false);
  }, []);

  const sendMessage = useCallback(
    async (
      text: string,
      options?: { inputChannel?: EchoUserInputChannel }
    ) => {
      const trimmed = text.trim();
      if (!trimmed || state === "streaming" || replyStreaming) return;

      const inputChannel: EchoUserInputChannel =
        options?.inputChannel ?? "text";

      const userMsgId = newId();
      const assistantMsgId = newId();

      setMessages((prev) => [
        ...prev,
        {
          id: userMsgId,
          role: "user",
          createdAt: Date.now(),
          text: trimmed,
          inputChannel,
        },
      ]);

      setState("streaming");

      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: "assistant",
          createdAt: Date.now(),
          text: "",
          steps: [],
          dashboardSpec: null,
          replyComplete: false,
        },
      ]);

      try {
        const { summary, closingLine, spec, followUps } = await runFullPagePipeline(
          trimmed,
          {
            onStepsUpdate: (steps) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, steps } : m
                )
              );
            },
          }
        );

        setReplyStreaming(true);
        try {
          await streamAssistantBody(
            summary,
            (acc) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, text: acc } : m
                )
              );
            },
            { reducedMotion: !!reduceMotion }
          );
        } finally {
          setReplyStreaming(false);
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  closingLine,
                  dashboardSpec: spec,
                  followUps,
                  replyComplete: true,
                }
              : m
          )
        );
        setState("done");
      } catch {
        setReplyStreaming(false);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  text: "Something went wrong. Please try again.",
                  closingLine: "Try again or pick a suggestion below.",
                  followUps: [
                    "Retry last question",
                    "Show payment overview",
                    "What can Echo do?",
                  ],
                  replyComplete: true,
                  steps: m.steps?.map((s) => ({
                    ...s,
                    status: s.status === "active" ? "error" : s.status,
                  })),
                }
              : m
          )
        );
        setState("error");
      } finally {
        setState((s) => (s === "streaming" ? "idle" : s));
      }
    },
    [state, replyStreaming, reduceMotion]
  );

  return { messages, busy, state, sendMessage, reset };
}
