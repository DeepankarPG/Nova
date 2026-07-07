"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Zap } from "lucide-react";
import { useMobileOverlay } from "@/components/dashboard/mobile/MobileOverlayContext";
import { useHeaderActions } from "@/components/dashboard/mobile/MobileHeaderActionsContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WebhookDef {
  id: string;
  url: string;
  events: string[];
  active: boolean;
}

const EVENT_OPTIONS: { key: string; label: string }[] = [
  { key: "payment.success",    label: "Successful payments" },
  { key: "payment.failed",     label: "Failed payments" },
  { key: "settlement.created", label: "New settlements" },
  { key: "refund.initiated",   label: "Refund initiated" },
  { key: "dispute.opened",     label: "Dispute opened" },
];

function isValidHttpsUrl(url: string) {
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

function WebhookSheet({
  initial,
  onSave,
  onDelete,
  onClose,
}: {
  initial?: WebhookDef;
  onSave: (data: Omit<WebhookDef, "id">) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [url, setUrl]           = useState(initial?.url ?? "");
  const [events, setEvents]     = useState<string[]>(initial?.events ?? []);
  const [secret, setSecret]     = useState("");
  const [visible, setVisible]   = useState(true);
  const [urlError, setUrlError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const isEditing = !!initial;
  const beginClose = useCallback(() => setVisible(false), []);

  const toggleEvent = (key: string) =>
    setEvents((prev) =>
      prev.includes(key) ? prev.filter((e) => e !== key) : [...prev, key],
    );

  const handleSave = () => {
    if (!url.trim()) { setUrlError("Endpoint URL is required."); return; }
    if (!isValidHttpsUrl(url.trim())) { setUrlError("Enter a valid HTTPS URL."); return; }
    onSave({ url: url.trim(), events, active: true });
    beginClose();
  };

  const handleDeletePress = () => {
    if (!showConfirm) { setShowConfirm(true); return; }
    onDelete?.();
    beginClose();
  };

  return (
    <div className="absolute inset-0 z-10">
      <motion.div
        className="absolute inset-0 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        onClick={beginClose}
      />
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl"
        style={{
          maxHeight: "88%",
          paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
        }}
        initial={{ y: "100%" }}
        animate={{ y: visible ? 0 : "100%" }}
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        onAnimationComplete={() => { if (!visible) onClose(); }}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="h-1 w-10 rounded-full bg-foreground/15" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 shrink-0">
          <span className="text-[17px] font-bold text-foreground">
            {isEditing ? "Edit webhook" : "Add webhook"}
          </span>
          <button
            type="button"
            onClick={beginClose}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-muted active:opacity-60 transition-opacity shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-foreground/70" strokeWidth={2} />
          </button>
        </div>

        <div
          className="overflow-y-auto px-5 space-y-5 pb-2 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Endpoint URL */}
          <div className="space-y-1.5">
            <p className="text-[13px] font-medium text-foreground/70">Endpoint URL</p>
            <input
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setUrlError(""); }}
              placeholder="https://your-server.com/webhook"
              autoCapitalize="none"
              className="w-full rounded-[10px] bg-[#F5F7FA] border border-[#E2E8F2] px-3 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 transition-colors"
            />
            {urlError && (
              <p className="text-[12px] text-destructive">{urlError}</p>
            )}
          </div>

          {/* Events */}
          <div className="space-y-1.5">
            <p className="text-[13px] font-medium text-foreground/70">Events</p>
            <div className="rounded-[10px] bg-[#F5F7FA] border border-[#E2E8F2] overflow-hidden">
              {EVENT_OPTIONS.map((opt, i) => {
                const checked = events.includes(opt.key);
                return (
                  <div key={opt.key}>
                    <button
                      type="button"
                      onClick={() => toggleEvent(opt.key)}
                      className="w-full flex items-center gap-3 px-3 py-3 text-left active:bg-black/5 transition-colors"
                    >
                      <span className="flex-1 text-[14px] text-foreground">
                        {opt.label}
                      </span>
                      <div
                        className={cn(
                          "h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-colors",
                          checked
                            ? "bg-primary border-primary"
                            : "border-[#C7CDD6] bg-transparent",
                        )}
                      >
                        {checked && (
                          <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
                        )}
                      </div>
                    </button>
                    {i < EVENT_OPTIONS.length - 1 && (
                      <div className="h-px bg-[#E2E8F2] ml-3" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Signing secret */}
          <div className="space-y-1.5">
            <p className="text-[13px] font-medium text-foreground/70">
              Signing secret (optional)
            </p>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="whsec_..."
              className="w-full rounded-[10px] bg-[#F5F7FA] border border-[#E2E8F2] px-3 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <Button
            variant="primary"
            type="button"
            className="w-full h-13 rounded-xl text-sm font-semibold"
            onClick={handleSave}
          >
            Save webhook
          </Button>

          {isEditing && (
            showConfirm ? (
              <div className="rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-4 space-y-3">
                <p className="text-[14px] font-semibold text-foreground text-center">
                  Delete webhook?
                </p>
                <p className="text-[13px] text-muted-foreground text-center leading-snug">
                  This endpoint will stop receiving events.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 h-10 rounded-xl border border-border text-[14px] font-medium text-foreground active:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeletePress}
                    className="flex-1 h-10 rounded-xl bg-destructive text-white text-[14px] font-semibold active:opacity-80 transition-opacity"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleDeletePress}
                className="w-full text-center text-[14px] font-medium text-destructive py-1 active:opacity-60 transition-opacity"
              >
                Delete webhook
              </button>
            )
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function MobileWebhooks() {
  const { pushOverlay, popOverlay } = useMobileOverlay();
  const { setHeaderRight, clearHeaderRight } = useHeaderActions();
  const [webhooks, setWebhooks] = useState<WebhookDef[]>([]);

  const openAddSheet = useCallback(() => {
    pushOverlay(
      <WebhookSheet
        onSave={(data) =>
          setWebhooks((prev) => [
            ...prev,
            { ...data, id: String(Date.now()) },
          ])
        }
        onClose={popOverlay}
      />,
    );
  }, [pushOverlay, popOverlay]);

  useEffect(() => {
    setHeaderRight(
      <button
        type="button"
        onClick={openAddSheet}
        className="text-[15px] font-semibold text-primary active:opacity-60 transition-opacity"
      >
        Add
      </button>,
    );
    return () => clearHeaderRight();
  }, [setHeaderRight, clearHeaderRight, openAddSheet]);

  const openEditSheet = (wh: WebhookDef) => {
    pushOverlay(
      <WebhookSheet
        initial={wh}
        onSave={(data) =>
          setWebhooks((prev) =>
            prev.map((w) => (w.id === wh.id ? { ...data, id: wh.id } : w)),
          )
        }
        onDelete={() =>
          setWebhooks((prev) => prev.filter((w) => w.id !== wh.id))
        }
        onClose={popOverlay}
      />,
    );
  };

  if (webhooks.length === 0) {
    return (
      <div className="flex flex-col items-center px-8 pt-16 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
          <Zap
            className="h-8 w-8"
            style={{ color: "#C7CDD6" }}
            strokeWidth={1.5}
          />
        </div>
        <p className="text-[17px] font-semibold text-foreground mt-4">
          No webhooks yet
        </p>
        <p className="text-[14px] text-muted-foreground mt-2 leading-snug">
          Add a webhook endpoint to receive real-time event notifications.
        </p>
        <Button
          variant="primary"
          type="button"
          className="w-full h-13 rounded-xl text-sm font-semibold mt-6"
          onClick={openAddSheet}
        >
          Add webhook
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/55 px-1">
        Active endpoints
      </p>
      <div
        className="bg-card rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)" }}
      >
        {webhooks.map((wh, i) => (
          <div key={wh.id}>
            <button
              type="button"
              onClick={() => openEditSheet(wh)}
              className="w-full flex items-center gap-3.5 px-4 text-left active:bg-muted/40 transition-colors"
              style={{ minHeight: 60 }}
            >
              <div className="flex-1 min-w-0 py-3">
                <p className="text-[14px] font-medium text-foreground truncate">
                  {wh.url}
                </p>
                <p className="text-[12px] text-muted-foreground mt-0.5 truncate">
                  {wh.events.length === 0
                    ? "No events subscribed"
                    : wh.events
                        .map(
                          (e) =>
                            EVENT_OPTIONS.find((o) => o.key === e)?.label ?? e,
                        )
                        .join(", ")}
                </p>
              </div>
              <div
                className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  wh.active ? "bg-[#10B981]" : "bg-[#E2E8F2]",
                )}
              />
            </button>
            {i < webhooks.length - 1 && (
              <div className="h-px bg-border/40 ml-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
