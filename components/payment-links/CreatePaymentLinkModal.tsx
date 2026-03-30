"use client";

import { useState, useRef, type FocusEvent } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  RefreshCw,
  Copy,
  X,
  Check,
  ChevronDown,
  Calendar,
  Facebook,
} from "lucide-react";
import { CurrencyAmountInput } from "@/components/shared/CurrencyAmountInput";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { PaymentLink } from "./types";


/* ─── Create modal ───────────────────────────────────────────────────────── */
const inputCls = "w-full h-10 px-3.5 text-[13px] bg-white border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all";
const focusIn  = (e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = "#6b7280"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(75,85,99,0.10)"; };
const focusOut = (e: FocusEvent<HTMLInputElement | HTMLSelectElement>) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; };

function OptionalBadge() {
  return (
    <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-md"
      style={{ background: "#f0f2f5", color: "#6b7280" }}>
      Optional
    </span>
  );
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[13px] font-semibold text-gray-800 mb-2">{children}</label>;
}

export function CreatePaymentLinkModal({ onClose, onCreate }: { onClose: () => void; onCreate: (link: PaymentLink) => void }) {
  const [currency,    setCurrency]    = useState("USD");
  const [amount,      setAmount]      = useState("");
  const [description, setDescription] = useState("");
  const [fullName,    setFullName]    = useState("");
  const [phone,       setPhone]       = useState("");
  const [email,       setEmail]       = useState("");
  const [notify,      setNotify]      = useState<string[]>(["SMS", "Email"]);
  const [showBilling, setShowBilling] = useState(false);
  const [expiry,      setExpiry]      = useState<"none" | "24h" | "7d" | "custom">("none");
  const [creating,    setCreating]    = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const toggleNotify = (ch: string) =>
    setNotify((n) => n.includes(ch) ? n.filter((x) => x !== ch) : [...n, ch]);

  const valid = amount && fullName && phone && email;

  const handleCreate = async () => {
    if (!valid) return;
    setCreating(true);
    await new Promise((r) => setTimeout(r, 1400));
    const newLink: PaymentLink = {
      id: `pl_${Math.random().toString(36).slice(2, 10)}`,
      amount: parseFloat(amount),
      currency,
      status: "active",
      customer: fullName,
      phone,
      email,
      description: description || "Payment link",
      createdAt: "Now",
      expiresAt: expiry === "24h" ? "In 24 hrs" : expiry === "7d" ? "In 7 days" : null,
      notifyVia: notify,
      transactions: [],
    };
    setCreating(false);
    onCreate(newLink);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 14 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-2xl w-full max-w-[560px] flex flex-col"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: "1px solid #e5e7eb", maxHeight: "min(92vh, 780px)" }}
      >
        {/* ── Sticky header ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-7 pt-7 pb-5 rounded-t-2xl bg-white"
          style={{
            borderBottom: "1px solid #f0f0f0",
            boxShadow: scrolled ? "0 4px 12px rgba(0,0,0,0.06)" : "none",
            transition: "box-shadow 0.2s ease",
          }}>
          <h2 className="text-[20px] font-bold text-gray-900">Create payment link</h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div
          ref={bodyRef}
          onScroll={() => setScrolled((bodyRef.current?.scrollTop ?? 0) > 4)}
          className="flex-1 overflow-y-auto"
        >
        <div className="px-7 py-6 space-y-5">

          {/* ── Amount + What's this for ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <FormLabel>Amount <span className="text-red-500">*</span></FormLabel>
              <CurrencyAmountInput
                currency={currency}
                amount={amount}
                onCurrencyChange={setCurrency}
                onAmountChange={setAmount}
                currencies={["USD", "INR", "EUR", "GBP"]}
              />
            </div>
            {/* What's this for */}
            <div>
              <FormLabel>What&apos;s this for? <OptionalBadge /></FormLabel>
              <input value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="eg. Freelance project"
                className={inputCls}
                onFocus={focusIn} onBlur={focusOut} />
            </div>
          </div>

          {/* ── Customer details ── */}
          <div>
            <FormLabel>Customer details <span className="text-red-500">*</span></FormLabel>
            <div className="space-y-2.5">
              <input value={fullName} onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className={inputCls}
                onFocus={focusIn} onBlur={focusOut} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Phone with country code */}
                <div className="flex items-center h-10 rounded-xl border border-gray-200 bg-white overflow-hidden transition-all focus-within:border-gray-400 focus-within:shadow-[0_0_0_2px_rgba(75,85,99,0.10)]">
                  <div className="flex items-center gap-1.5 pl-3 pr-2 border-r border-gray-100 bg-gray-50/60 flex-shrink-0 h-full">
                    <span className="text-base leading-none">🇮🇳</span>
                    <span className="text-[13px] font-semibold text-gray-700">+91</span>
                    <ChevronDown style={{ width: 11, height: 11, color: "#d1d5db" }} />
                  </div>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210" type="tel"
                    className="flex-1 h-full px-2.5 text-[13px] text-gray-800 placeholder:text-gray-400 bg-transparent focus:outline-none" />
                </div>
                <input value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Id" type="email"
                  className={inputCls}
                  onFocus={focusIn} onBlur={focusOut} />
              </div>
            </div>
          </div>

          {/* ── Notify via ── */}
          <div>
            <FormLabel>Notify customer via</FormLabel>
            <div className="flex gap-2 flex-wrap">
              {["SMS", "Email", "WhatsApp"].map((ch) => {
                const on = notify.includes(ch);
                return (
                  <button key={ch} onClick={() => toggleNotify(ch)}
                    className={cn("flex items-center gap-1.5 h-9 px-4 rounded-xl text-[13px] font-semibold border transition-all",
                      on
                        ? "text-white border-transparent"
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
                    )}
                    style={on ? { background: "#111" } : {}}>
                    {on
                      ? <Check style={{ width: 12, height: 12 }} />
                      : <Plus style={{ width: 12, height: 12 }} />}
                    {ch}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Billing details ── */}
          {!showBilling ? (
            <button onClick={() => setShowBilling(true)}
              className="w-full flex items-center gap-3 h-12 px-4 rounded-xl border border-dashed text-[13px] font-medium transition-all"
              style={{ borderColor: "#d1d5db", color: "#374151" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0061E3"; e.currentTarget.style.color = "#0061E3"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.color = "#374151"; }}>
              <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0 text-gray-400">
                <Plus style={{ width: 11, height: 11 }} />
              </div>
              <span>Add billing details</span>
              <OptionalBadge />
            </button>
          ) : (
            <div className="rounded-xl space-y-2.5 p-4" style={{ background: "#f6f8fa", border: "1px solid #e5e7eb" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-gray-800">Billing details</span>
                  <OptionalBadge />
                </div>
                <button onClick={() => setShowBilling(false)}
                  className="flex items-center gap-1 text-[12px] font-medium text-red-400 hover:text-red-500 transition-colors">
                  Remove <X style={{ width: 12, height: 12 }} />
                </button>
              </div>
              {["Address line 1", "Address line 2"].map((ph) => (
                <input key={ph} placeholder={ph}
                  className="w-full h-10 px-3.5 text-[13px] bg-white border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all"
                  onFocus={focusIn} onBlur={focusOut} />
              ))}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {["Country", "State", "City", "Zipcode"].map((ph) => (
                  <input key={ph} placeholder={ph}
                    className="h-10 px-3.5 text-[13px] bg-white border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all"
                    onFocus={focusIn} onBlur={focusOut} />
                ))}
              </div>
              <input placeholder="Landmark (Optional)"
                className="w-full h-10 px-3.5 text-[13px] bg-white border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all"
                onFocus={focusIn} onBlur={focusOut} />
              <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "12px" }}>
                <p className="text-[13px] font-semibold text-gray-800 mb-2">Shipping address</p>
                <label className="flex items-center gap-2.5 text-[13px] text-gray-600 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#0061E3] rounded" />
                  Shipping address is the same as my billing address
                </label>
              </div>
            </div>
          )}

          {/* ── Link expiry ── */}
          <div>
            <FormLabel>Link expiry</FormLabel>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "none",   label: "No expiry", icon: null,     isDefault: true  },
                { key: "24h",    label: "24 hrs",    icon: null,     isDefault: false },
                { key: "7d",     label: "7 days",    icon: null,     isDefault: false },
                { key: "custom", label: "Custom",    icon: Calendar, isDefault: false },
              ].map(({ key, label, icon: Icon, isDefault }) => {
                const selected = expiry === key;
                return (
                  <button key={key} onClick={() => setExpiry(key as typeof expiry)}
                    className="relative flex items-center gap-1.5 h-9 px-4 rounded-xl text-[13px] font-semibold border transition-all"
                    style={{
                      background:  selected ? "#111" : "white",
                      borderColor: selected ? "#111" : "#e5e7eb",
                      color:       selected ? "#fff"  : "#6b7280",
                    }}>
                    {isDefault && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] px-2 py-px rounded-full font-semibold whitespace-nowrap"
                        style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}>
                        Default
                      </span>
                    )}
                    {selected && <Check style={{ width: 12, height: 12 }} />}
                    {Icon && !selected && <Icon style={{ width: 12, height: 12 }} />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        </div>

        {/* ── Sticky footer ── */}
        <div className="flex-shrink-0 flex gap-3 px-7 pb-7 pt-5 rounded-b-2xl bg-white"
          style={{ borderTop: "1px solid #f0f0f0" }}>
          <button onClick={onClose}
            className="flex-1 h-11 rounded-xl text-[14px] font-semibold border border-gray-200 transition-all hover:bg-gray-50"
            style={{ color: "#0061E3" }}>
            Cancel
          </button>
          <button onClick={handleCreate} disabled={!valid || creating}
            className={cn("flex-1 h-11 rounded-xl text-[14px] font-semibold text-white transition-all flex items-center justify-center gap-2",
              valid && !creating ? "hover:opacity-90" : "opacity-50 cursor-not-allowed"
            )}
            style={{ background: "#0061E3" }}>
            {creating ? (
              <><RefreshCw style={{ width: 14, height: 14 }} className="animate-spin" /> Creating…</>
            ) : "Create payment link"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Success modal ──────────────────────────────────────────────────────── */
export function PaymentLinkSuccessModal({ link, onClose }: { link: PaymentLink; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const fakeUrl = `https://api.uat.payglocal.in/gl/.../payments/${link.id.slice(-8)}`;
  const currSym = link.currency === "INR" ? "₹" : link.currency === "USD" ? "$" : link.currency;

  const copyLink = () => {
    navigator.clipboard.writeText(fakeUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied!");
  };

  const notifyStr  = link.notifyVia.join(" & ");
  const expiryStr  = link.expiresAt ? link.expiresAt : null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-2xl w-full max-w-[460px] shadow-2xl overflow-hidden"
        style={{ border: "1px solid #e5e7eb" }}
      >
        {/* Close */}
        <div className="flex justify-end px-5 pt-5">
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <div className="flex flex-col items-center px-7 pt-1 pb-7 gap-5">
          {/* Success icon */}
          <div>
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(145deg, #22c55e, #16a34a)", boxShadow: "0 8px 20px rgba(22,163,74,0.30)" }}>
              <Check style={{ width: 30, height: 30, color: "white", strokeWidth: 3 }} />
            </div>
          </div>

          {/* Title + subtitle */}
          <div className="text-center">
            <h2 className="text-[19px] font-bold text-gray-900 mb-1.5">Payment link is live</h2>
            <div className="flex items-center justify-center gap-2 text-[13px] text-gray-500 flex-wrap">
              <span>Sent to <span className="font-semibold text-gray-800">{link.customer}</span> via {notifyStr}</span>
              {expiryStr && (
                <>
                  <span className="text-gray-300">|</span>
                  <span>Expires {expiryStr}</span>
                </>
              )}
            </div>
          </div>

          {/* URL row */}
          <div className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl"
            style={{ background: "#f0f6ff", border: "1px solid #c7d9fb" }}>
            <span className="flex-1 text-[12.5px] font-mono text-[#0061E3] truncate">{fakeUrl}</span>
            <button onClick={copyLink}
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#dceafe] transition-colors">
              <Copy style={{ width: 13, height: 13, color: "#0061E3" }} />
            </button>
          </div>

          {/* Summary strip — single row with dividers */}
          <div className="w-full rounded-xl overflow-hidden"
            style={{ border: "1px solid #f0f0f0" }}>
            <div className="grid grid-cols-4 divide-x divide-gray-100">
              {[
                { label: "Amount",          value: `${currSym}${link.amount.toLocaleString("en-IN")}` },
                { label: "Payment link Id", value: `${link.id.slice(0, 8)}…${link.id.slice(-4)}` },
                { label: "Payment for",     value: link.description },
                { label: "Status",          isStatus: true },
              ].map((item) => (
                <div key={item.label} className="px-3 py-3.5 bg-gray-50/60">
                  <p className="text-[10.5px] text-gray-400 mb-1">{item.label}</p>
                  {item.isStatus ? (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                      style={{ color: "#15803d", border: "1px solid #86efac", background: "#f0fdf4" }}>
                      Active
                    </span>
                  ) : (
                    <p className="text-[12px] font-semibold text-gray-800 truncate">{item.value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Copy CTA */}
          <button onClick={copyLink}
            className="w-full h-12 rounded-xl text-[14px] font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            style={{ background: "#0061E3" }}>
            {copied
              ? <><Check style={{ width: 16, height: 16 }} /> Copied!</>
              : <>Copy link <Copy style={{ width: 15, height: 15 }} /></>}
          </button>

          {/* OR divider */}
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[12px] text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Share via */}
          <div className="flex flex-col items-center gap-3 -mt-2">
            <p className="text-[13px] text-gray-500">Share via</p>
            <div className="flex gap-3">
              {/* Facebook */}
              <button className="w-11 h-11 rounded-full flex items-center justify-center transition-opacity hover:opacity-85"
                style={{ background: "#1877f2" }}>
                <Facebook style={{ width: 20, height: 20, color: "white" }} />
              </button>
              {/* Instagram */}
              <button className="w-11 h-11 rounded-full flex items-center justify-center transition-opacity hover:opacity-85"
                style={{ background: "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </button>
              {/* Telegram */}
              <button className="w-11 h-11 rounded-full flex items-center justify-center transition-opacity hover:opacity-85"
                style={{ background: "#26a5e4" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
