"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function MobileShareFeedback() {
  const [rating, setRating]     = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Thanks for your feedback!");
      setRating(0);
      setFeedback("");
    }, 900);
  };

  return (
    <div className="space-y-4">
      <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/55 px-1">
        Your feedback
      </p>
      <div
        className="bg-card rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)" }}
      >
        <div className="px-4 py-5">
          <p className="text-[15px] font-semibold text-foreground mb-4 leading-snug">
            How would you rate your experience?
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="active:scale-90 transition-transform"
                aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
              >
                <Star
                  style={{ width: 32, height: 32 }}
                  className={
                    n <= rating
                      ? "text-primary fill-primary"
                      : "text-[#E2E8F2] fill-[#E2E8F2]"
                  }
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-border/40 mx-4" />

        <div className="px-4 py-4">
          <p className="text-[13px] text-muted-foreground mb-2">Tell us more (optional)</p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="What can we improve?"
            rows={5}
            className="w-full rounded-xl bg-[#F5F7FA] border border-[#E2E8F2] px-3 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none resize-none"
          />
        </div>
      </div>

      <Button
        variant="primary"
        type="button"
        className="w-full h-13 rounded-xl text-sm font-semibold"
        isLoading={submitting}
        onClick={handleSubmit}
        disabled={rating === 0}
      >
        Submit feedback
      </Button>
    </div>
  );
}
