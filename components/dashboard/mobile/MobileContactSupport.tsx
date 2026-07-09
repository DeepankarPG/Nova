"use client";

import { useState } from "react";
import { Mail, Phone, Copy, Check, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// TODO: replace with authenticated user email from session/context
const USER_EMAIL = "deepankar.raj@payglocal.in";
const PHONE = "+91 92402 19400";
const EMAIL = "support@payglocal.in";

function generateTicketId() {
  // TODO: replace with ticket ID returned from the real support API response
  const num = Math.floor(100000 + Math.random() * 900000);
  return `#PG-${num}`;
}

type SubmitState = "idle" | "submitting" | "success" | "error";

const inputBase = [
  "w-full rounded-lg border border-border bg-muted/40 px-3 text-sm text-foreground shadow-sm transition-colors",
  "placeholder:text-muted-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
].join(" ");

export function MobileContactSupport() {
  const [subject,     setSubject]     = useState("");
  const [description, setDescription] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [ticketId,    setTicketId]    = useState("");
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) return;
    setSubmitState("submitting");
    try {
      // TODO: replace with real API call; derive ticketId from response
      await new Promise((res) => setTimeout(res, 1200));
      setTicketId(generateTicketId());
      setSubmitState("success");
    } catch {
      setSubmitState("error");
    }
  };

  const handleRaiseAnother = () => {
    setSubject("");
    setDescription("");
    setTicketId("");
    setSubmitState("idle");
  };

  const copyValue = (text: string, type: "phone" | "email") => {
    navigator.clipboard.writeText(text).catch(() => {});
    if (type === "phone") {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 1500);
    } else {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 1500);
    }
  };

  return (
    <div className="space-y-5">

      {/* ── RAISE A TICKET ───────────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/55 px-1 mb-2">
          Raise a Ticket
        </p>
        <div
          className="bg-card rounded-2xl px-4 py-4 space-y-4"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)" }}
        >
          {submitState === "success" ? (
            <div className="flex flex-col items-center gap-2 py-3">
              <CheckCircle2 className="h-8 w-8 text-foreground" strokeWidth={1.5} />
              <p className="text-[17px] font-bold text-foreground mt-1">Ticket raised</p>
              <p className="text-[14px] font-semibold text-primary">{ticketId}</p>
              <p className="text-[13px] text-muted-foreground text-center leading-relaxed">
                {"We'll get back to you at "}
                <span className="font-medium text-foreground">{USER_EMAIL}</span>
                {". Typical response time is 1 business day."}
              </p>
              <button
                type="button"
                onClick={handleRaiseAnother}
                className="mt-1 text-[14px] font-medium text-primary active:opacity-60 transition-opacity"
              >
                Raise another ticket
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <p className="text-[13px] font-semibold text-foreground">Subject</p>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Briefly describe your issue"
                  className={cn(inputBase, "h-9")}
                />
              </div>

              <div className="space-y-1.5">
                <p className="text-[13px] font-semibold text-foreground">Description</p>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide as much detail as possible — transaction IDs, error messages, steps to reproduce"
                  rows={5}
                  className={cn(inputBase, "py-2 resize-none min-h-30")}
                />
              </div>

              <Button
                type="button"
                variant="primary"
                isLoading={submitState === "submitting"}
                onClick={handleSubmit}
                disabled={!subject.trim() || !description.trim()}
                className="w-full h-13 rounded-xl text-sm font-semibold"
              >
                Submit ticket
              </Button>

              {submitState === "error" && (
                <p className="text-[12px] text-red-600 dark:text-red-400">
                  Something went wrong. Please try again or contact us directly below.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── "or reach us directly" divider ───────────────────────── */}
      <div className="flex items-center gap-3 px-1">
        <div className="flex-1 h-px bg-border/50" />
        <span className="text-[11px] text-muted-foreground whitespace-nowrap">or reach us directly</span>
        <div className="flex-1 h-px bg-border/50" />
      </div>

      {/* ── Contact card ─────────────────────────────────────────── */}
      <div
        className="bg-card rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)" }}
      >
        {/* Call us */}
        <div className="flex items-center gap-3.5 px-4" style={{ minHeight: 58 }}>
          <Phone className="h-5 w-5 text-muted-foreground shrink-0" strokeWidth={1.75} />
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-foreground">Call us</p>
            <div className="flex items-center gap-1.5">
              <a href="tel:+919240219400" className="text-[13px] font-medium text-primary">
                {PHONE}
              </a>
              <button
                type="button"
                onClick={() => copyValue(PHONE, "phone")}
                className="flex items-center justify-center active:opacity-60 transition-opacity"
                aria-label="Copy phone number"
              >
                {copiedPhone
                  ? <Check  className="h-4.5 w-4.5 text-muted-foreground" strokeWidth={1.75} />
                  : <Copy   className="h-4.5 w-4.5 text-muted-foreground" strokeWidth={1.75} />
                }
              </button>
            </div>
          </div>
        </div>

        <div className="h-px bg-border/40 ml-[58px]" />

        {/* Email us */}
        <div className="flex items-center gap-3.5 px-4" style={{ minHeight: 58 }}>
          <Mail className="h-5 w-5 text-muted-foreground shrink-0" strokeWidth={1.75} />
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-foreground">Email us</p>
            <div className="flex items-center gap-1.5">
              <a href="mailto:support@payglocal.in" className="text-[13px] font-medium text-primary">
                {EMAIL}
              </a>
              <button
                type="button"
                onClick={() => copyValue(EMAIL, "email")}
                className="flex items-center justify-center active:opacity-60 transition-opacity"
                aria-label="Copy email address"
              >
                {copiedEmail
                  ? <Check  className="h-4.5 w-4.5 text-muted-foreground" strokeWidth={1.75} />
                  : <Copy   className="h-4.5 w-4.5 text-muted-foreground" strokeWidth={1.75} />
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[13px] text-muted-foreground px-1 leading-relaxed">
        Available Monday to Friday, 9 AM to 6 PM IST. Email is monitored for urgent issues outside hours.
      </p>
    </div>
  );
}
