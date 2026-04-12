"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EchoAgentSteps } from "./EchoAgentSteps";
import { EchoAssistantMessageFooter } from "./EchoAssistantMessageFooter";
import { EchoGenUIDashboard } from "./EchoGenUIDashboard";
import { EchoGlobeMark } from "./EchoGlobeMark";
import { EchoFullPageWelcome } from "./EchoFullPageWelcome";
import { EchoFullPageComposer } from "./EchoFullPageComposer";
import { EchoUserVoiceNoteCard } from "./EchoUserVoiceNoteCard";
import { useEchoFullPageChat } from "@/hooks/useEchoFullPageChat";
import { cn } from "@/lib/utils";

function assistantPlainTextForCopy(text: string, closingLine?: string) {
  return closingLine ? `${text}\n\n${closingLine}` : text;
}

export function EchoFullPage() {
  const { messages, busy, sendMessage, reset } = useEchoFullPageChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const hasMessages = messages.length > 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    /**
     * Root fills the height granted by the negative-margin page wrapper.
     * overflow-hidden here is intentional: it clamps both states so neither
     * bleeds past the viewport — the inner scroll containers handle scrolling.
     */
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#fafcff] dark:bg-background">
      <AnimatePresence mode="wait">
        {!hasMessages ? (
          /* ─── Welcome state ────────────────────────────────────────────── */
          <motion.div
            key="welcome"
            className="flex min-h-0 flex-1 flex-col echo-stripe-bg"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Scrollable welcome content — above animated bg layers */}
            <div className="relative z-10 flex-1 min-h-0 overflow-y-auto">
              <EchoFullPageWelcome onSend={sendMessage} disabled={busy} />
            </div>

            {/* Composer: no grey strip — sits on lighter bottom of gradient */}
            <div className="relative z-10 shrink-0 px-4 pb-4 pt-2">
              <EchoFullPageComposer
                onSend={sendMessage}
                onReset={reset}
                disabled={busy}
              />
            </div>
          </motion.div>
        ) : (
          /* ─── Active chat state ─────────────────────────────────────────── */
          <motion.div
            key="chat"
            className="flex min-h-0 flex-1 flex-col overflow-hidden echo-stripe-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Scrollable message feed */}
            <div className="relative z-10 flex-1 min-h-0 overflow-y-auto">
              <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 md:px-6">
                {messages.map((msg, msgIndex) => {
                  const isLatestAssistant =
                    msg.role === "assistant" &&
                    msg.id === messages[messages.length - 1]?.id;
                  return (
                  <div key={msg.id}>
                    {msg.role === "user" ? (
                      /* User bubble — voice note vs text */
                      <div className="flex justify-end">
                        {msg.inputChannel === "voice" ? (
                          <EchoUserVoiceNoteCard text={msg.text} />
                        ) : (
                          <motion.div
                            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="max-w-[80%] rounded-2xl border border-border bg-card px-4 py-3 text-[14px] leading-relaxed text-foreground shadow-sm"
                          >
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      /* Assistant — logo always aligns to bottom of this block (steps/stream/footer) */
                      <div className="flex min-w-0 items-end gap-3">
                        <EchoGlobeMark
                          className="h-8 w-8 shrink-0 self-end"
                          animate={
                            !!(isLatestAssistant && busy && !reduceMotion)
                          }
                        />
                        <div className="min-w-0 flex-1 space-y-3">
                          {/* Agent steps */}
                          {msg.steps && msg.steps.length > 0 && (
                            <EchoAgentSteps steps={msg.steps} busy={busy} />
                          )}

                          {/* Streamed body only */}
                          {msg.text ? (
                            <motion.div
                              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                              className="max-w-[65ch] text-[15px] leading-relaxed text-foreground"
                            >
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                            </motion.div>
                          ) : null}

                          {/* GenUI Dashboard — appears with reply completion */}
                          {msg.dashboardSpec ? (
                            <EchoGenUIDashboard spec={msg.dashboardSpec} />
                          ) : null}

                          {/* Busy placeholder */}
                          {busy && !msg.text && (!msg.steps || msg.steps.length === 0) && (
                            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                              <span className="echo-status-ellipsis inline-flex" aria-hidden>
                                <span className="echo-status-ellipsis-dot">.</span>
                                <span className="echo-status-ellipsis-dot">.</span>
                                <span className="echo-status-ellipsis-dot">.</span>
                              </span>
                            </div>
                          )}

                          {msg.replyComplete &&
                            (!busy || msg.id !== messages[messages.length - 1]?.id) && (
                              <EchoAssistantMessageFooter
                                plainText={assistantPlainTextForCopy(
                                  msg.text,
                                  msg.closingLine
                                )}
                                closingLine={msg.closingLine}
                                followUps={msg.followUps ?? []}
                                onFollowUp={sendMessage}
                                disabled={busy}
                                onRegenerate={
                                  msgIndex > 0 &&
                                  messages[msgIndex - 1]?.role === "user"
                                    ? () =>
                                        sendMessage(messages[msgIndex - 1]!.text)
                                    : undefined
                                }
                              />
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })}
                <div ref={bottomRef} className="h-1 shrink-0" />
              </div>
            </div>

            {/* Composer — same as welcome: no grey footer strip */}
            <div className="relative z-10 shrink-0 px-4 pb-4 pt-2">
              <EchoFullPageComposer
                onSend={sendMessage}
                onReset={reset}
                disabled={busy}
                hasActiveChat
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
