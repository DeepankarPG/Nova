"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/* ── Data ──────────────────────────────────────────────────────────── */
const EMOJIS = [
  { emoji: "😞", label: "Very bad"  },
  { emoji: "😕", label: "Not great" },
  { emoji: "😐", label: "Okay"      },
  { emoji: "🙂", label: "Good"      },
  { emoji: "😄", label: "Excellent" },
] as const;

const FEATURES = [
  "Dashboard",
  "Payments",
  "Settlement Reports",
  "International Accounts",
  "Dispute Management",
  "eBRC",
  "Payment Links",
  "Client Management",
  "Settings",
] as const;

/* ── Shared input styles ───────────────────────────────────────────── */
const inputBase =
  "w-full rounded-lg border border-border bg-muted/40 px-3 text-sm text-foreground shadow-sm transition-colors " +
  "placeholder:text-muted-foreground " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/* ── Section label ─────────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/55 px-1 mb-2">
      {children}
    </p>
  );
}

/* ── Card wrapper ──────────────────────────────────────────────────── */
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn("bg-card rounded-2xl px-4 py-4", className)}
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)" }}
    >
      {children}
    </div>
  );
}

/* ── MobileAddFeedback ─────────────────────────────────────────────── */
export function MobileAddFeedback() {
  const [selectedRating,  setSelectedRating]  = useState<number | null>(null);
  const [selectedChips,   setSelectedChips]   = useState<Set<string>>(new Set());
  const [workedWell,      setWorkedWell]      = useState("");
  const [needsImprovement,setNeedsImprovement]= useState("");
  const [anythingElse,    setAnythingElse]    = useState("");
  const [email,           setEmail]           = useState("");
  const [ratingError,     setRatingError]     = useState(false);
  const [submitState,     setSubmitState]     = useState<"idle" | "submitting" | "success">("idle");

  const toggleChip = (chip: string) =>
    setSelectedChips(prev => {
      const next = new Set(prev);
      next.has(chip) ? next.delete(chip) : next.add(chip);
      return next;
    });

  const handleRatingSelect = (idx: number) => {
    setSelectedRating(idx);
    setRatingError(false);
  };

  const handleSubmit = async () => {
    if (selectedRating === null) {
      setRatingError(true);
      return;
    }
    setSubmitState("submitting");

    const payload = {
      rating:          { index: selectedRating, ...EMOJIS[selectedRating] },
      features:        Array.from(selectedChips),
      workedWell,
      needsImprovement,
      anythingElse,
      email:           email.trim() || undefined,
    };

    // TODO: replace with real feedback API endpoint
    console.log("[Feedback submission]", payload);
    await new Promise(res => setTimeout(res, 1000));

    setSubmitState("success");
  };

  const handleReset = () => {
    setSelectedRating(null);
    setSelectedChips(new Set());
    setWorkedWell("");
    setNeedsImprovement("");
    setAnythingElse("");
    setEmail("");
    setRatingError(false);
    setSubmitState("idle");
  };

  return (
    <div className="space-y-6">

      {/* Subtitle */}
      <p className="text-[14px] text-muted-foreground leading-relaxed px-1">
        Help us improve — your feedback goes directly to the product team.
      </p>

      {submitState === "success" ? (

        /* ── Confirmation ── */
        <div className="flex flex-col items-center gap-3 py-10">
          <CheckCircle2 className="h-8 w-8 text-foreground" strokeWidth={1.5} />
          <p className="text-[20px] font-bold text-foreground text-center mt-1">
            Thanks for your feedback!
          </p>
          <p className="text-[14px] text-muted-foreground text-center leading-relaxed max-w-[280px]">
            {"You're helping us build a better product. We read every response."}
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-2 text-[14px] font-medium text-primary active:opacity-60 transition-opacity"
          >
            Submit more feedback
          </button>
        </div>

      ) : (
        <>

          {/* ── SECTION 1: OVERALL EXPERIENCE ─────────────────────── */}
          <div>
            <SectionLabel>Overall Experience</SectionLabel>
            <Card>
              <p className="text-[15px] font-semibold text-foreground mb-4 leading-snug">
                How would you rate your experience so far?
              </p>
              <div className="flex justify-between">
                {EMOJIS.map((e, idx) => (
                  <button
                    key={e.label}
                    type="button"
                    onClick={() => handleRatingSelect(idx)}
                    className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
                    aria-label={e.label}
                    aria-pressed={selectedRating === idx}
                  >
                    <span
                      className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-2xl transition-colors",
                        selectedRating === idx ? "bg-primary/15" : ""
                      )}
                      style={{ fontSize: 32, lineHeight: 1 }}
                    >
                      {e.emoji}
                    </span>
                    <span className="text-[11px] text-muted-foreground leading-tight text-center w-12">
                      {e.label}
                    </span>
                  </button>
                ))}
              </div>
              {ratingError && (
                <p className="text-[12px] text-red-600 dark:text-red-400 mt-3">
                  Please select a rating to continue.
                </p>
              )}
            </Card>
          </div>

          {/* ── SECTION 2: WHAT DID YOU TRY? ─────────────────────── */}
          <div>
            <SectionLabel>What did you try?</SectionLabel>
            <Card>
              <div className="flex flex-wrap gap-2">
                {FEATURES.map(feature => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => toggleChip(feature)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors",
                      selectedChips.has(feature)
                        ? "bg-primary text-white"
                        : "bg-[#F5F5F5] dark:bg-muted text-muted-foreground border border-border/50"
                    )}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* ── SECTION 3: YOUR FEEDBACK ──────────────────────────── */}
          <div>
            <SectionLabel>Your Feedback</SectionLabel>
            <Card className="space-y-0 px-4 py-0">

              <div className="py-4 border-b border-border/40">
                <p className="text-[13px] font-semibold text-foreground mb-1.5">
                  What worked well?
                </p>
                <textarea
                  value={workedWell}
                  onChange={e => setWorkedWell(e.target.value)}
                  placeholder="Tell us what you liked or found useful"
                  rows={3}
                  className={cn(inputBase, "py-2 resize-none")}
                />
              </div>

              <div className="py-4 border-b border-border/40">
                <p className="text-[13px] font-semibold text-foreground mb-1.5">
                  What needs improvement?
                </p>
                <textarea
                  value={needsImprovement}
                  onChange={e => setNeedsImprovement(e.target.value)}
                  placeholder="Tell us what was confusing, broken, or missing"
                  rows={3}
                  className={cn(inputBase, "py-2 resize-none")}
                />
              </div>

              <div className="py-4">
                <p className="text-[13px] font-semibold text-foreground mb-1.5">
                  Anything else?
                </p>
                <textarea
                  value={anythingElse}
                  onChange={e => setAnythingElse(e.target.value)}
                  placeholder="Any other thoughts, suggestions, or requests"
                  rows={3}
                  className={cn(inputBase, "py-2 resize-none")}
                />
              </div>

            </Card>
          </div>

          {/* ── SECTION 4: CONTACT (OPTIONAL) ─────────────────────── */}
          <div>
            <SectionLabel>Contact (Optional)</SectionLabel>
            <Card>
              <p className="text-[13px] font-semibold text-foreground mb-1.5">Your email</p>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="So we can follow up if needed"
                className={cn(inputBase, "h-9")}
              />
              <p className="text-[12px] text-muted-foreground mt-2">
                {"We'll only use this to follow up on your feedback."}
              </p>
            </Card>
          </div>

          {/* ── Submit ────────────────────────────────────────────── */}
          <Button
            type="button"
            variant="primary"
            isLoading={submitState === "submitting"}
            onClick={handleSubmit}
            className="w-full h-13 rounded-xl text-sm font-semibold"
          >
            Submit feedback
          </Button>

        </>
      )}
    </div>
  );
}
