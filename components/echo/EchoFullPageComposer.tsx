"use client";

/**
 * Voice session UI (Phase 1: mock timers, no mic). States feed a future Web Speech hook.
 * idle → listening → ending → sending → idle
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Loader2, Mic, Paperclip, RefreshCw } from "lucide-react";
import { EchoVoiceWaveform } from "@/components/echo/voice/EchoVoiceWaveform";
import { ECHO_PLACEHOLDER_HINTS } from "@/lib/echo/echoPlaceholderHints";
import { ECHO_VOICE_MESSAGE_PREFIX } from "@/lib/echo/voiceMessage";
import { cn } from "@/lib/utils";

type Props = {
  /** Pass `{ inputChannel: "voice" }` only for mock voice send — never infer from message text. */
  onSend: (
    text: string,
    options?: { inputChannel?: "text" | "voice" }
  ) => void;
  onReset?: () => void;
  disabled?: boolean;
  /** When true (thread has messages), no cycling placeholder — empty field for follow-ups. */
  hasActiveChat?: boolean;
};

type VoiceSessionState = "idle" | "listening" | "ending" | "sending";

const HINT_INTERVAL_MS = 2800;

/** Mock transcript sent to the agent pipeline (Phase 1 — replace with STT later). */
const MOCK_VOICE_TRANSCRIPT = `${ECHO_VOICE_MESSAGE_PREFIX} Show last 6 months domestic vs international split.`;

const VOICE_LISTENING_DISPLAY = `${ECHO_VOICE_MESSAGE_PREFIX} Listening… End to send a sample message.`;

const ENDING_MS = 420;
const SENDING_VISIBLE_MS = 220;

export function EchoFullPageComposer({
  onSend,
  onReset,
  disabled,
  hasActiveChat = false,
}: Props) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [hintIdx, setHintIdx] = useState(0);
  const [voiceSession, setVoiceSession] = useState<VoiceSessionState>("idle");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const draftBeforeVoiceRef = useRef("");
  const voiceTimersRef = useRef<number[]>([]);
  const reduceMotion = useReducedMotion();

  const voiceBusy = voiceSession !== "idle";

  const clearVoiceTimers = useCallback(() => {
    voiceTimersRef.current.forEach((id) => window.clearTimeout(id));
    voiceTimersRef.current = [];
  }, []);

  /* Cycle placeholder only on welcome (no active thread) */
  useEffect(() => {
    if (hasActiveChat || reduceMotion || focused || value || voiceBusy) return;
    const t = setInterval(
      () => setHintIdx((i) => (i + 1) % ECHO_PLACEHOLDER_HINTS.length),
      HINT_INTERVAL_MS
    );
    return () => clearInterval(t);
  }, [hasActiveChat, focused, value, reduceMotion, voiceBusy]);

  // Auto-grow textarea
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [value]);

  // Focus on mount
  useEffect(() => {
    taRef.current?.focus();
  }, []);

  // Abort voice if parent blocks interaction mid-session (e.g. external reset)
  useEffect(() => {
    if (!disabled || voiceSession === "idle") return;
    if (voiceSession === "listening") {
      clearVoiceTimers();
      setVoiceSession("idle");
      setValue(draftBeforeVoiceRef.current);
    }
  }, [disabled, voiceSession, clearVoiceTimers]);

  const submit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled || voiceBusy) return;
    onSend(trimmed);
    setValue("");
    if (taRef.current) {
      taRef.current.style.height = "auto";
    }
  }, [disabled, onSend, value, voiceBusy]);

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (voiceBusy) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const startVoice = useCallback(() => {
    if (disabled || voiceSession !== "idle") return;
    draftBeforeVoiceRef.current = value;
    setValue(VOICE_LISTENING_DISPLAY);
    setFocused(false);
    setVoiceSession("listening");
  }, [disabled, voiceSession, value]);

  const endVoice = useCallback(() => {
    if (voiceSession !== "listening") return;
    setVoiceSession("ending");
    clearVoiceTimers();
    const t1 = window.setTimeout(() => {
      setVoiceSession("sending");
      onSend(MOCK_VOICE_TRANSCRIPT, { inputChannel: "voice" });
      setValue("");
      if (taRef.current) taRef.current.style.height = "auto";
      const t2 = window.setTimeout(() => {
        setVoiceSession("idle");
      }, SENDING_VISIBLE_MS);
      voiceTimersRef.current.push(t2);
    }, ENDING_MS);
    voiceTimersRef.current.push(t1);
  }, [voiceSession, onSend, clearVoiceTimers]);

  useEffect(() => () => clearVoiceTimers(), [clearVoiceTimers]);

  const canSend =
    value.trim().length > 0 && !disabled && voiceSession === "idle";
  const showAnimatedHint =
    !hasActiveChat &&
    !value &&
    !focused &&
    !reduceMotion &&
    voiceSession === "idle";
  const textareaLocked = disabled || voiceBusy;
  const showAgentStatus = disabled && voiceSession === "idle";

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div
        className={cn(
          "rounded-2xl border border-border/80 bg-card shadow-sm transition-shadow",
          "shadow-[0_1px_0_rgba(0,0,0,0.03)]",
          "focus-within:border-primary/40 focus-within:shadow-md",
          "dark:bg-card/95"
        )}
      >
        {/* Status — agent working (after any send) */}
        {showAgentStatus && (
          <div
            className="border-b border-border/60 px-4 py-2.5"
            role="status"
            aria-live="polite"
          >
            <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <span
                className="inline-flex h-2 w-2 rounded-full bg-primary/70 motion-safe:animate-pulse"
                aria-hidden
              />
              Echo is responding…
            </p>
          </div>
        )}

        {/* Textarea + animated placeholder overlay */}
        <div
          className={cn(
            "relative overflow-hidden",
            voiceSession === "listening" && "echo-listening-field"
          )}
        >
          {voiceSession === "listening" && (
            <motion.p
              className="pointer-events-none absolute left-4 top-3 z-[2] text-[12px] font-medium text-primary"
              aria-live="polite"
              role="status"
              initial={reduceMotion ? false : { opacity: 0.88 }}
              animate={
                reduceMotion ? { opacity: 1 } : { opacity: [0.7, 1, 0.7] }
              }
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
              }
            >
              Listening…
            </motion.p>
          )}
          {showAnimatedHint && (
            <div
              className="pointer-events-none absolute left-4 top-4 z-0 max-w-[calc(100%-2rem)] overflow-hidden pr-2"
              aria-hidden
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={hintIdx}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ duration: 0.28, ease: "easeInOut" }}
                  className="block text-[14px] leading-snug text-muted-foreground"
                >
                  {ECHO_PLACEHOLDER_HINTS[hintIdx]}
                </motion.span>
              </AnimatePresence>
            </div>
          )}
          <textarea
            ref={taRef}
            value={value}
            onChange={(e) => {
              if (voiceSession !== "idle") return;
              setValue(e.target.value);
            }}
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            readOnly={voiceSession === "listening"}
            disabled={disabled || voiceSession === "ending" || voiceSession === "sending"}
            rows={1}
            placeholder={
              hasActiveChat
                ? ""
                : reduceMotion
                  ? String(ECHO_PLACEHOLDER_HINTS[0])
                  : ""
            }
            className={cn(
              "relative z-10 block w-full resize-none bg-transparent px-4 pb-2",
              voiceSession === "listening" ? "pt-9" : "pt-4",
              "text-[14px] text-foreground placeholder:text-muted-foreground",
              "focus:outline-none disabled:opacity-60",
              "min-h-[52px] max-h-40",
              showAnimatedHint &&
                "text-transparent caret-foreground [text-shadow:none]"
            )}
            style={
              showAnimatedHint
                ? ({ WebkitTextFillColor: "transparent" } satisfies CSSProperties)
                : undefined
            }
          />
        </div>

        {/* Toolbar row */}
        <div className="flex items-center gap-1.5 px-3 pb-2 pt-1">
          <button
            type="button"
            disabled={textareaLocked}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium",
              "text-muted-foreground hover:bg-muted hover:text-foreground",
              "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
              "disabled:pointer-events-none disabled:opacity-40"
            )}
            aria-label="Attach file"
            title="Attach file"
          >
            <Paperclip className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <span className="hidden sm:inline">Attach</span>
          </button>

          <div className="flex-1" />

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              disabled={textareaLocked}
              className={cn(
                "rounded-lg p-2 text-muted-foreground transition-colors",
                "hover:bg-muted hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
                "disabled:pointer-events-none disabled:opacity-40"
              )}
              aria-label="Reset conversation"
              title="Reset conversation"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={2} />
            </button>
          )}

          <div className="relative flex items-center gap-1.5">
            <AnimatePresence mode="wait" initial={false}>
              {voiceSession === "idle" ? (
                <motion.div
                  key="default-voice"
                  initial={reduceMotion ? false : { opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: -6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="flex items-center gap-1.5"
                >
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={startVoice}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full",
                      "bg-muted/80 text-muted-foreground",
                      "transition-colors hover:bg-muted hover:text-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
                      "disabled:cursor-not-allowed disabled:opacity-40"
                    )}
                    aria-label="Start voice input"
                    title="Start voice input (demo)"
                    aria-pressed={false}
                  >
                    <Mic className="h-4 w-4" strokeWidth={2} />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="voice-active"
                  initial={reduceMotion ? false : { opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: -8 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-2"
                >
                  {voiceSession === "listening" && (
                    <button
                      type="button"
                      onClick={endVoice}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border border-border bg-card/95 py-1.5 pl-2 pr-3.5",
                        "text-[12px] font-medium text-foreground shadow-sm",
                        "transition-colors hover:bg-muted/80",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
                      )}
                      aria-label="End voice and send demo message"
                    >
                      <EchoVoiceWaveform paused={!!reduceMotion} />
                      <span>End</span>
                    </button>
                  )}
                  {(voiceSession === "ending" || voiceSession === "sending") && (
                    <span
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[12px] font-medium text-muted-foreground",
                        voiceSession === "ending" && "bg-muted/40"
                      )}
                    >
                      {voiceSession === "ending" ? (
                        "Ending…"
                      ) : (
                        <>
                          <Loader2
                            className="h-3.5 w-3.5 shrink-0 text-muted-foreground motion-safe:animate-spin"
                            aria-hidden
                          />
                          Sending…
                        </>
                      )}
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {voiceSession === "idle" && (
              <button
                type="button"
                disabled={!canSend}
                onClick={submit}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full",
                  "bg-primary text-primary-foreground shadow-sm",
                  "transition-all duration-150 hover:opacity-90 active:scale-95",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35",
                  "disabled:opacity-40 disabled:cursor-not-allowed"
                )}
                aria-label="Send message"
              >
                <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="mt-1.5 text-center text-[11px] text-muted-foreground/60">
        Echo may make mistakes. Verify important information.
      </p>
    </div>
  );
}
