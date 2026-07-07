"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ChevronRight, Bell, Sun, Globe, Fingerprint,
  HelpCircle, MessageCircle, Bug, Shield, FileText, BookOpen,
  Sparkles, Star, Share2, Users, ExternalLink, Instagram,
  Linkedin, Twitter, Youtube, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Toggle ───────────────────────────────────────────────────── */
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className={cn(
        "relative inline-flex h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-200",
        on ? "bg-[#34C759]" : "bg-foreground/20"
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white transition-transform duration-200",
          on ? "translate-x-[22px]" : "translate-x-[2px]"
        )}
        style={{ boxShadow: "0 2px 5px rgba(0,0,0,0.22)" }}
      />
    </button>
  );
}

/* ─── Row ──────────────────────────────────────────────────────── */
interface RowProps {
  iconBg?: string;
  iconStyle?: React.CSSProperties;
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  onTap?: () => void;
  divider?: boolean;
}

function Row({ iconBg, iconStyle, icon, label, subtitle, trailing, onTap, divider = true }: RowProps) {
  const inner = (
    <>
      <div
        className={cn("h-[34px] w-[34px] rounded-[9px] flex items-center justify-center shrink-0", iconBg)}
        style={iconStyle}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-foreground leading-tight">{label}</p>
        {subtitle && <p className="text-[12px] text-muted-foreground leading-tight mt-0.5">{subtitle}</p>}
      </div>
      {trailing !== undefined && <div className="shrink-0 ml-1">{trailing}</div>}
    </>
  );

  return (
    <div>
      {onTap ? (
        <button
          type="button"
          onClick={onTap}
          className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-muted/40 transition-colors"
          style={{ minHeight: 52 }}
        >
          {inner}
        </button>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3" style={{ minHeight: 52 }}>
          {inner}
        </div>
      )}
      {divider && <div className="h-px bg-border/40 ml-[62px]" />}
    </div>
  );
}

/* ─── Group ────────────────────────────────────────────────────── */
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/55 px-5 mb-2">
        {title}
      </p>
      <div
        className="mx-4 bg-card rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)" }}
      >
        {children}
      </div>
    </div>
  );
}

/* ─── Shared trailing helpers ──────────────────────────────────── */
const Chevron = <ChevronRight className="h-4 w-4 text-foreground/25" strokeWidth={2} />;

function ValueChevron({ value }: { value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[14px] text-muted-foreground">{value}</span>
      <ChevronRight className="h-4 w-4 text-foreground/25" strokeWidth={2} />
    </div>
  );
}

const ExternalTrailing = (
  <ExternalLink className="h-3.5 w-3.5 text-foreground/30" strokeWidth={1.75} />
);

/* ─── MobileAppSettings ────────────────────────────────────────── */
interface MobileAppSettingsProps {
  open: boolean;
  onClose: () => void;
  contained?: boolean;
}

export function MobileAppSettings({ open, onClose, contained = false }: MobileAppSettingsProps) {
  const [notifs,    setNotifs]    = useState(true);
  const [biometric, setBiometric] = useState(false);
  const pos = contained ? "absolute" : "fixed";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="app-settings"
          className={`${pos} inset-0 z-[60] flex flex-col`}
          style={{ backgroundColor: "#f2f2f7" }}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* Status bar spacer */}
          <div style={{ height: 44, flexShrink: 0 }} />

          {/* Header */}
          <div className="flex items-center gap-3 px-4 shrink-0" style={{ height: 52 }}>
            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-foreground active:scale-95 transition-transform shrink-0"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            </button>
            <p className="text-[17px] font-semibold text-foreground tracking-tight flex-1 truncate">
              App Settings
            </p>
          </div>

          {/* Scrollable content */}
          <div
            className="flex-1 overflow-y-auto pb-10 pt-5 space-y-6 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {/* ── APP ── */}
            <Group title="App">
              <Row
                iconBg="bg-[#FF3B30]"
                icon={<Bell className="h-[18px] w-[18px] text-white" strokeWidth={1.75} />}
                label="Notifications"
                trailing={<Toggle on={notifs} onToggle={() => setNotifs(v => !v)} />}
                divider
              />
              <Row
                iconBg="bg-[#636366]"
                icon={<Sun className="h-[18px] w-[18px] text-white" strokeWidth={1.75} />}
                label="Appearance"
                trailing={<ValueChevron value="System" />}
                onTap={() => {}}
                divider
              />
              <Row
                iconBg="bg-[#007AFF]"
                icon={<Globe className="h-[18px] w-[18px] text-white" strokeWidth={1.75} />}
                label="Language"
                trailing={<ValueChevron value="English" />}
                onTap={() => {}}
                divider
              />
              <Row
                iconBg="bg-[#34C759]"
                icon={<Fingerprint className="h-[18px] w-[18px] text-white" strokeWidth={1.75} />}
                label="Biometric Login"
                subtitle="Face ID or fingerprint"
                trailing={<Toggle on={biometric} onToggle={() => setBiometric(v => !v)} />}
                divider={false}
              />
            </Group>

            {/* ── SUPPORT ── */}
            <Group title="Support">
              <Row
                iconBg="bg-[#007AFF]"
                icon={<HelpCircle className="h-[18px] w-[18px] text-white" strokeWidth={1.75} />}
                label="Help Center"
                trailing={Chevron}
                onTap={() => {}}
                divider
              />
              <Row
                iconBg="bg-[#34C759]"
                icon={<MessageCircle className="h-[18px] w-[18px] text-white" strokeWidth={1.75} />}
                label="Contact Support"
                trailing={Chevron}
                onTap={() => {}}
                divider
              />
              <Row
                iconBg="bg-[#FF9500]"
                icon={<Bug className="h-[18px] w-[18px] text-white" strokeWidth={1.75} />}
                label="Report a Bug"
                trailing={Chevron}
                onTap={() => {}}
                divider={false}
              />
            </Group>

            {/* ── LEGAL ── */}
            <Group title="Legal">
              <Row
                iconBg="bg-[#5856D6]"
                icon={<Shield className="h-[18px] w-[18px] text-white" strokeWidth={1.75} />}
                label="Privacy Policy"
                trailing={Chevron}
                onTap={() => {}}
                divider
              />
              <Row
                iconBg="bg-[#636366]"
                icon={<FileText className="h-[18px] w-[18px] text-white" strokeWidth={1.75} />}
                label="Terms & Conditions"
                trailing={Chevron}
                onTap={() => {}}
                divider
              />
              <Row
                iconBg="bg-[#AF52DE]"
                icon={<BookOpen className="h-[18px] w-[18px] text-white" strokeWidth={1.75} />}
                label="Open Source Licenses"
                trailing={Chevron}
                onTap={() => {}}
                divider={false}
              />
            </Group>

            {/* ── ABOUT ── */}
            <Group title="About">
              <Row
                iconBg="bg-[#007AFF]"
                icon={<Info className="h-[18px] w-[18px] text-white" strokeWidth={1.75} />}
                label="Version"
                trailing={<span className="text-[14px] text-muted-foreground">v2.4.1 (245)</span>}
                divider
              />
              <Row
                iconBg="bg-[#FF9500]"
                icon={<Sparkles className="h-[18px] w-[18px] text-white" strokeWidth={1.75} />}
                label="What's New"
                trailing={Chevron}
                onTap={() => {}}
                divider={false}
              />
            </Group>

            {/* ── CONNECT WITH US ── */}
            <Group title="Connect With Us">
              <Row
                iconBg="bg-[#007AFF]"
                icon={<Globe className="h-[18px] w-[18px] text-white" strokeWidth={1.75} />}
                label="Website"
                trailing={ExternalTrailing}
                onTap={() => {}}
                divider
              />
              <Row
                iconStyle={{ background: "linear-gradient(135deg, #F58529, #DD2A7B 50%, #8134AF)" }}
                icon={<Instagram className="h-[18px] w-[18px] text-white" strokeWidth={1.75} />}
                label="Instagram"
                trailing={ExternalTrailing}
                onTap={() => {}}
                divider
              />
              <Row
                iconBg="bg-[#0A66C2]"
                icon={<Linkedin className="h-[18px] w-[18px] text-white" strokeWidth={1.75} />}
                label="LinkedIn"
                trailing={ExternalTrailing}
                onTap={() => {}}
                divider
              />
              <Row
                iconBg="bg-[#1A1A1A]"
                icon={<Twitter className="h-[18px] w-[18px] text-white" strokeWidth={1.75} />}
                label="X (Twitter)"
                trailing={ExternalTrailing}
                onTap={() => {}}
                divider
              />
              <Row
                iconBg="bg-[#FF0000]"
                icon={<Youtube className="h-[18px] w-[18px] text-white" strokeWidth={1.75} />}
                label="YouTube"
                trailing={ExternalTrailing}
                onTap={() => {}}
                divider={false}
              />
            </Group>

            {/* ── SHARE ── */}
            <Group title="Share">
              <Row
                iconBg="bg-[#FF9500]"
                icon={<Star className="h-[18px] w-[18px] text-white" strokeWidth={1.75} />}
                label="Rate the App"
                trailing={Chevron}
                onTap={() => {}}
                divider
              />
              <Row
                iconBg="bg-[#007AFF]"
                icon={<Share2 className="h-[18px] w-[18px] text-white" strokeWidth={1.75} />}
                label="Share App"
                trailing={Chevron}
                onTap={() => {}}
                divider
              />
              <Row
                iconBg="bg-[#5856D6]"
                icon={<Users className="h-[18px] w-[18px] text-white" strokeWidth={1.75} />}
                label="Recommend to a Friend"
                trailing={Chevron}
                onTap={() => {}}
                divider={false}
              />
            </Group>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
