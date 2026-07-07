"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import { useMobileOverlay } from "@/components/dashboard/mobile/MobileOverlayContext";
import { useSettingsPageActions } from "@/components/settings/SettingsPageActionsContext";

type Channel = "push" | "email" | "sms" | "whatsapp";

interface NotificationDef {
  id: string;
  label: string;
  description: string;
  available: Channel[];
  defaults: Channel[];
  note?: string;
}

const CHANNEL_LABELS: Record<Channel, string> = {
  push: "Push",
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
};

const NOTIFICATIONS: NotificationDef[] = [
  {
    id: "successful_payments",
    label: "Successful payments",
    description: "Notify when a payment is captured successfully",
    available: ["push", "email", "sms", "whatsapp"],
    defaults: ["push", "email"],
  },
  {
    id: "failed_payments",
    label: "Failed payments",
    description: "Alert when a payment is declined or fails",
    available: ["push", "email", "sms", "whatsapp"],
    defaults: ["push", "email"],
  },
  {
    id: "new_settlements",
    label: "New settlements",
    description: "Daily digest of settlement activity",
    available: ["email"],
    defaults: ["email"],
  },
  {
    id: "dispute_created",
    label: "Dispute created",
    description: "Immediate alert on new disputes",
    available: ["push", "email", "sms", "whatsapp"],
    defaults: ["push", "email"],
  },
  {
    id: "low_balance",
    label: "Low balance alert",
    description: "Warn when available balance drops below limit",
    available: ["push", "email", "sms", "whatsapp"],
    defaults: ["push"],
    note: "Time-sensitive",
  },
  {
    id: "weekly_summary",
    label: "Weekly summary",
    description: "Performance digest every Monday",
    available: ["email"],
    defaults: [],
  },
  {
    id: "in_app",
    label: "In-app notifications",
    description: "Show alerts in the notification tray",
    available: ["push"],
    defaults: ["push"],
  },
  {
    id: "sms_failures",
    label: "SMS on failures",
    description: "SMS alert for payment failures",
    available: ["sms", "whatsapp"],
    defaults: ["sms"],
  },
  {
    id: "sms_settlement",
    label: "SMS on settlement",
    description: "SMS when funds are settled",
    available: ["sms", "whatsapp"],
    defaults: [],
  },
];

function channelSummary(enabled: Channel[]): string {
  if (enabled.length === 0) return "Off";
  if (enabled.length === 1) return `${CHANNEL_LABELS[enabled[0]]} only`;
  return enabled.map((c) => CHANNEL_LABELS[c]).join(", ");
}

/* ── Channel selector bottom sheet ──────────────────────────────── */
function ChannelSelectorSheet({
  def,
  initialEnabled,
  onDone,
  onClose,
}: {
  def: NotificationDef;
  initialEnabled: Channel[];
  onDone: (channels: Channel[]) => void;
  onClose: () => void;
}) {
  const [enabled, setEnabled] = useState<Channel[]>(initialEnabled);
  const [visible, setVisible] = useState(true);

  const beginClose = useCallback(() => setVisible(false), []);

  const toggle = (ch: Channel) => {
    const next = enabled.includes(ch)
      ? enabled.filter((c) => c !== ch)
      : [...enabled, ch];
    setEnabled(next);
    onDone(next);
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
        className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl overflow-hidden"
        style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}
        initial={{ y: "100%" }}
        animate={{ y: visible ? 0 : "100%" }}
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        onAnimationComplete={() => {
          if (!visible) onClose();
        }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-foreground/15" />
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-[17px] font-bold text-foreground flex-1 pr-3">{def.label}</span>
          <button
            type="button"
            onClick={beginClose}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-muted active:opacity-60 transition-opacity shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-foreground/70" strokeWidth={2} />
          </button>
        </div>

        <p className="px-5 pb-3 text-[13px] text-muted-foreground leading-snug">
          {def.description}
          {def.note && (
            <span className="ml-1.5 text-amber-500 font-medium">{def.note}</span>
          )}
        </p>

        <div className="h-px bg-border/40 mx-5" />

        <div className="px-5 py-2">
          {def.available.map((ch) => {
            const isOn = enabled.includes(ch);
            return (
              <div key={ch} className="flex items-center justify-between py-3.5">
                <span className="text-[15px] font-medium text-foreground">
                  {CHANNEL_LABELS[ch]}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isOn}
                  onClick={() => toggle(ch)}
                  className={`relative flex h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-200 ${
                    isOn ? "bg-primary" : "bg-foreground/20"
                  }`}
                >
                  <motion.span
                    className="absolute top-[2px] left-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-sm"
                    animate={{ x: isOn ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 700, damping: 40 }}
                  />
                </button>
              </div>
            );
          })}
        </div>

      </motion.div>
    </div>
  );
}

/* ── MobileNotificationsSettings ────────────────────────────────── */
export function MobileNotificationsSettings() {
  const { pushOverlay, popOverlay } = useMobileOverlay();

  const [notifState, setNotifState] = useState<Record<string, Channel[]>>(
    () => Object.fromEntries(NOTIFICATIONS.map((n) => [n.id, [...n.defaults]])),
  );
  const [dirty, setDirty] = useState(false);

  const save = () => setDirty(false);
  const cancel = () => {
    setNotifState(Object.fromEntries(NOTIFICATIONS.map((n) => [n.id, [...n.defaults]])));
    setDirty(false);
  };

  useSettingsPageActions({ isDirty: dirty, onSave: save, onCancel: cancel });

  const openSheet = (def: NotificationDef) => {
    const currentEnabled = notifState[def.id] ?? [...def.defaults];
    pushOverlay(
      <ChannelSelectorSheet
        def={def}
        initialEnabled={currentEnabled}
        onDone={(channels) => {
          setNotifState((prev) => ({ ...prev, [def.id]: channels }));
          setDirty(true);
        }}
        onClose={popOverlay}
      />,
    );
  };

  return (
    <div
      className="bg-card rounded-2xl overflow-hidden"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)" }}
    >
      {NOTIFICATIONS.map((def, i) => {
        const enabled = notifState[def.id] ?? def.defaults;
        const summary = channelSummary(enabled);
        const isOff = enabled.length === 0;

        return (
          <div key={def.id}>
            <button
              type="button"
              onClick={() => openSheet(def)}
              className="w-full flex items-center gap-3.5 px-4 text-left active:bg-muted/40 transition-colors"
              style={{ minHeight: 58 }}
            >
              <div className="flex-1 min-w-0 py-3">
                <p className="text-[15px] font-medium text-foreground leading-snug">{def.label}</p>
                <p
                  className={`text-[13px] mt-0.5 ${
                    isOff ? "text-amber-500 font-medium" : "text-muted-foreground"
                  }`}
                >
                  {summary}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-foreground/20 shrink-0" strokeWidth={2} />
            </button>
            {i < NOTIFICATIONS.length - 1 && <div className="h-px bg-border/40 ml-4" />}
          </div>
        );
      })}
    </div>
  );
}
