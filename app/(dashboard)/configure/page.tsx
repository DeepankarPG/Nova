"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2, Users, Landmark, CreditCard, Globe, RefreshCw,
  Shield, FileCheck, KeyRound, Webhook, Bell, Mail,
  Copy, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/shared/Button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ─── Nav structure ──────────────────────────────────────────────────────── */
const NAV = [
  {
    group: "Account",
    items: [
      { id: "business",     label: "Business Profile",    icon: Building2,  desc: "Name, logo, website, contact info"            },
      { id: "team",         label: "Team & Permissions",  icon: Users,      desc: "Members, roles, and access levels"             },
      { id: "bank",         label: "Bank Accounts",       icon: Landmark,   desc: "Settlement payout accounts"                   },
    ],
  },
  {
    group: "Payments",
    items: [
      { id: "methods",      label: "Payment Methods",     icon: CreditCard,  desc: "Cards, UPI, netbanking, international"        },
      { id: "currencies",   label: "Currencies",          icon: Globe,       desc: "Settlement currency and exchange config"      },
      { id: "refunds",      label: "Refund Policy",       icon: RefreshCw,   desc: "Automatic refund rules and timelines"         },
    ],
  },
  {
    group: "Security",
    items: [
      { id: "security",     label: "Security",            icon: Shield,      desc: "2FA, session management, IP allowlisting"     },
      { id: "compliance",   label: "KYC & Compliance",    icon: FileCheck,   desc: "Verification documents and eBRC config"       },
    ],
  },
  {
    group: "Developer",
    items: [
      { id: "api",          label: "API Keys",            icon: KeyRound,    desc: "Live and test API credentials"                },
      { id: "webhooks",     label: "Webhooks",            icon: Webhook,     desc: "Event notification endpoints"                 },
    ],
  },
  {
    group: "Notifications",
    items: [
      { id: "email",        label: "Email Alerts",        icon: Mail,        desc: "Transaction, settlement, dispute emails"      },
      { id: "inapp",        label: "In-app & SMS",        icon: Bell,        desc: "Real-time alerts inside the dashboard"        },
    ],
  },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function useField(init: string) {
  const [v, sv] = useState(init);
  const [touched, st] = useState(false);
  const err = touched && !v.trim() ? "Required" : "";
  return {
    value: v, error: err, touched,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => { sv(e.target.value); },
    onBlur: () => st(true),
  };
}

function Field({ label, desc, error, children }: { label: string; desc?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-8 py-4" style={{ borderBottom: "1px solid #f0f0f0" }}>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
        {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
      </div>
      <div className="w-72 flex-shrink-0">{children}</div>
    </div>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none transition-all"
      onFocus={(e) => { e.currentTarget.style.borderColor = "#6b7280"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(75,85,99,0.10)"; }}
      onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; props.onBlur?.(e); }}
    />
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className={cn("relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0",
        on ? "bg-[#0061E3]" : "bg-gray-200")}>
      <div className={cn("absolute top-[3px] w-[14px] h-[14px] rounded-full bg-white shadow transition-transform duration-200",
        on ? "translate-x-[18px]" : "translate-x-[3px]")} />
    </button>
  );
}

/* ─── Detail sections ────────────────────────────────────────────────────── */
function BusinessSection() {
  const [saving, setSaving] = useState(false);
  const name    = useField("mcatest123 Pvt Ltd");
  const website = useField("https://mcatest123.com");
  const email   = useField("support@mcatest123.com");
  const phone   = useField("+91 98765 43210");

  const save = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    toast.success("Business profile saved");
  };

  return (
    <>
      <Field label="Business Name" desc="Your registered legal business name" error={name.error}>
        <Input value={name.value} onChange={name.onChange} onBlur={name.onBlur} />
      </Field>
      <Field label="Website" desc="Your public-facing business website">
        <Input value={website.value} onChange={website.onChange} />
      </Field>
      <Field label="Support Email" desc="Where customer queries will be directed">
        <Input type="email" value={email.value} onChange={email.onChange} />
      </Field>
      <Field label="Support Phone" desc="Contact number shown to customers">
        <Input value={phone.value} onChange={phone.onChange} />
      </Field>
      <Field label="Settlement Currency" desc="Primary currency for payouts">
        <select className="w-full h-9 px-3 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none">
          <option>INR — Indian Rupee</option>
          <option>USD — US Dollar</option>
          <option>EUR — Euro</option>
          <option>GBP — British Pound</option>
        </select>
      </Field>
      <div className="pt-4 flex justify-end">
        <Button variant="primary" size="sm" isLoading={saving} onClick={save}>Save Changes</Button>
      </div>
    </>
  );
}

function TeamSection() {
  const members = [
    { name: "Deepankar Raj", email: "deepankar@mcatest123.com", role: "Admin",  joined: "Dec 19, 2025", active: true  },
    { name: "Priya Patel",   email: "priya@mcatest123.com",    role: "Finance", joined: "Jan 5, 2026",  active: true  },
    { name: "Arjun Mehta",   email: "arjun@mcatest123.com",    role: "Developer", joined: "Jan 12, 2026", active: false },
  ];
  return (
    <>
      <div className="flex items-center justify-between mb-4 pt-2">
        <p className="text-sm text-gray-400">{members.length} members</p>
        <Button variant="primary" size="sm" onClick={() => toast.success("Invite sent!")}>Invite teammate</Button>
      </div>
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
        <table style={{ tableLayout: "fixed", width: "100%" }}>
          <colgroup><col style={{ width: 220 }} /><col style={{ width: 120 }} /><col style={{ width: 130 }} /><col style={{ width: 80 }} /></colgroup>
          <thead>
            <tr style={{ background: "#f0f2f5", borderBottom: "1px solid #e8eaed" }}>
              {["Member", "Role", "Joined", ""].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <tr key={m.email}
                style={{ borderBottom: i < members.length - 1 ? "1px solid #f5f5f5" : "none" }}
                className="transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[11px] font-bold text-gray-600 flex-shrink-0">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-gray-800">{m.name}</p>
                      <p className="text-[10px] text-gray-400">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border"
                    style={m.role === "Admin"
                      ? { background: "#eff4ff", color: "#0047b0", borderColor: "#c7d9fb" }
                      : { background: "#f9fafb", color: "#6b7280", borderColor: "#e5e7eb" }}>
                    {m.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-[11px] text-gray-400">{m.joined}</td>
                <td className="px-4 py-3">
                  <button className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ToggleSection({ title, desc, items }: { title: string; desc: string; items: { label: string; desc: string; on: boolean }[] }) {
  const [states, setStates] = useState(items.map(i => i.on));
  const toggle = (i: number) => setStates(s => s.map((v, j) => j === i ? !v : v));
  return (
    <>
      {items.map((item, i) => (
        <Field key={item.label} label={item.label} desc={item.desc}>
          <div className="flex justify-end"><Toggle on={states[i]} onChange={() => toggle(i)} /></div>
        </Field>
      ))}
      <div className="pt-4 flex justify-end">
        <Button variant="primary" size="sm" onClick={() => toast.success("Preferences saved")}>Save</Button>
      </div>
    </>
  );
}

function ApiKeysSection() {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const keys = [
    { id: "lpub",  label: "Live Public Key",  value: "pk_live_mcatest123_pub_abcde12345", secret: false },
    { id: "lsec",  label: "Live Secret Key",  value: "sk_live_mcatest123_sec_xyzw98765",  secret: true  },
    { id: "tpub",  label: "Test Public Key",  value: "pk_test_mcatest123_pub_test12345",   secret: false },
    { id: "tsec",  label: "Test Secret Key",  value: "sk_test_mcatest123_sec_test98765",   secret: true  },
  ];
  return (
    <>
      <div className="space-y-3 pt-4">
        {keys.map((k) => (
          <div key={k.id} className="rounded-xl p-4" style={{ background: "#fafafa", border: "1px solid #efefef" }}>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">{k.label}</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-[11px] font-mono text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-lg overflow-hidden text-ellipsis whitespace-nowrap">
                {k.secret && !showSecrets[k.id] ? "••••••••••••••••••••••••••••••••" : k.value}
              </code>
              {k.secret && (
                <button onClick={() => setShowSecrets(s => ({ ...s, [k.id]: !s[k.id] }))}
                  className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0">
                  {showSecrets[k.id] ? <EyeOff className="w-3.5 h-3.5 text-gray-400" /> : <Eye className="w-3.5 h-3.5 text-gray-400" />}
                </button>
              )}
              <button onClick={() => { navigator.clipboard.writeText(k.value); toast.success("Copied!"); }}
                className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0">
                <Copy className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 pt-4 flex items-center gap-1.5">
        <Shield className="w-3.5 h-3.5" />
        Never share secret keys. Rotate them immediately if compromised.
      </p>
    </>
  );
}

function WebhooksSection() {
  return (
    <>
      <div className="flex justify-end pt-2 mb-4">
        <Button variant="primary" size="sm" onClick={() => toast.success("Add your endpoint URL")}>Add Endpoint</Button>
      </div>
      <div className="rounded-xl p-4" style={{ border: "1px solid #e5e7eb" }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <code className="text-[11px] font-mono text-gray-700">https://api.mcatest123.com/webhooks/payglocal</code>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {["payment.success", "payment.failed", "settlement.created", "dispute.opened"].map((e) => (
                <span key={e} className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: "#eff4ff", color: "#0047b0", border: "1px solid #c7d9fb" }}>
                  {e}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #86efac" }}>Active</span>
            <Button variant="ghost" size="sm">Edit</Button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Content router ─────────────────────────────────────────────────────── */
function SectionContent({ id }: { id: string }) {
  switch (id) {
    case "business":
      return <BusinessSection />;
    case "team":
      return <TeamSection />;
    case "methods":
      return <ToggleSection
        title="Payment Methods"
        desc="Enable or disable payment channels for your customers"
        items={[
          { label: "Cards (Visa / Mastercard / Amex)", desc: "Domestic and international card payments",    on: true  },
          { label: "UPI",                              desc: "Real-time bank transfers via UPI",            on: true  },
          { label: "Net Banking",                      desc: "Direct bank transfers for Indian customers",  on: true  },
          { label: "International Cards",              desc: "Cross-border card payments in 135+ currencies", on: true },
          { label: "Global Fund Transfers",            desc: "Wire transfers and SWIFT-based payments",    on: false },
        ]}
      />;
    case "currencies":
      return <ToggleSection
        title="Currencies"
        desc="Configure the currencies you accept and settle in"
        items={[
          { label: "INR Settlement",   desc: "Receive payouts in Indian Rupees",        on: true  },
          { label: "USD Settlement",   desc: "Receive payouts in US Dollars",           on: true  },
          { label: "Mid-market rates", desc: "Use live mid-market FX for conversions",  on: true  },
          { label: "Lock-in rates",    desc: "Fix exchange rate at transaction time",   on: false },
        ]}
      />;
    case "refunds":
      return <ToggleSection
        title="Refund Policy"
        desc="Configure how and when refunds are processed"
        items={[
          { label: "Instant Refunds",      desc: "Refund to source within minutes for UPI", on: false },
          { label: "Auto-refund on failure", desc: "Automatically refund failed captures",   on: true  },
          { label: "Partial refunds",      desc: "Allow refunding less than the full amount", on: true },
        ]}
      />;
    case "security":
      return <ToggleSection
        title="Security"
        desc="Protect your account with additional authentication layers"
        items={[
          { label: "Two-Factor Authentication",  desc: "Require OTP on every login",                    on: true  },
          { label: "IP Allowlisting",            desc: "Restrict API access to approved IP addresses",  on: false },
          { label: "Session Timeout",            desc: "Auto-logout after 30 min of inactivity",        on: true  },
          { label: "Login notifications",        desc: "Email alert on every new login",                on: true  },
        ]}
      />;
    case "compliance":
      return <ToggleSection
        title="KYC & Compliance"
        desc="Manage verification documents and compliance settings"
        items={[
          { label: "eBRC Auto-generation",   desc: "Auto-generate export benefit certificates",     on: true  },
          { label: "KYC reminders",          desc: "Notify team when docs are expiring",            on: true  },
          { label: "PCI-DSS mode",           desc: "Strict PCI compliance logging and auditing",   on: true  },
        ]}
      />;
    case "api":
      return <ApiKeysSection />;
    case "webhooks":
      return <WebhooksSection />;
    case "email":
      return <ToggleSection
        title="Email Alerts"
        desc="Choose which transaction events trigger email notifications"
        items={[
          { label: "Successful Payments",  desc: "Email on every successful capture",              on: true  },
          { label: "Failed Payments",      desc: "Alert when a payment is declined",               on: true  },
          { label: "New Settlements",      desc: "Daily digest of settlement activity",            on: true  },
          { label: "Dispute Created",      desc: "Immediate alert on new disputes",                on: true  },
          { label: "Low Balance Alert",    desc: "Warn when available balance drops below limit",  on: false },
          { label: "Weekly Summary",       desc: "Performance digest every Monday",               on: false },
        ]}
      />;
    case "inapp":
      return <ToggleSection
        title="In-app & SMS Alerts"
        desc="Real-time notifications inside the dashboard and via SMS"
        items={[
          { label: "In-app notifications",  desc: "Show alerts in the dashboard notification tray", on: true  },
          { label: "SMS on failures",       desc: "SMS alert for payment failures",                 on: true  },
          { label: "SMS on settlement",     desc: "SMS when funds are settled",                     on: false },
        ]}
      />;
    case "bank":
      return (
        <>
          <div className="space-y-3 pt-4">
            {[
              { name: "HDFC Bank", num: "****4521", type: "Current", status: "Primary" },
              { name: "ICICI Bank", num: "****8820", type: "Savings", status: "Secondary" },
            ].map((b) => (
              <div key={b.num} className="flex items-center justify-between p-4 rounded-xl"
                style={{ border: "1px solid #e5e7eb" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Landmark className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{b.name}</p>
                    <p className="text-xs text-gray-400">{b.type} · {b.num}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={b.status === "Primary"
                      ? { background: "#eff4ff", color: "#0047b0", border: "1px solid #c7d9fb" }
                      : { background: "#f9fafb", color: "#6b7280", border: "1px solid #e5e7eb" }}>
                    {b.status}
                  </span>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => toast.success("Bank account linking coming soon")}>
              + Add bank account
            </Button>
          </div>
        </>
      );
    default:
      return <p className="text-sm text-gray-400">Coming soon.</p>;
  }
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function ConfigurePage() {
  const [active, setActive] = useState<string>("business");

  // Resolve which group the active item belongs to
  const activeGroup = NAV.find(g => g.items.some(i => i.id === active))!;

  return (
    <div className="max-w-[1100px] flex gap-5 items-start">

      {/* ── Left settings nav ─────────────────────────────────── */}
      <motion.aside
        className="w-52 flex-shrink-0"
        initial={{ opacity: 0, x: -28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-5 px-2.5">
          <h1 className="text-[16px] font-semibold text-gray-900">Settings</h1>
        </div>

        <nav className="space-y-4">
          {NAV.map((group) => (
            <div key={group.group}>
              {/* Group label */}
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest px-2.5 mb-1.5">
                {group.group}
              </p>
              {/* Items */}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActive(item.id)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[6px] text-[14px] transition-colors text-left",
                        isActive
                          ? "bg-[#e9e9e9] text-gray-900 font-medium"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-800 font-normal"
                      )}
                    >
                      {/* Icon stays neutral gray regardless of active state */}
                      <Icon style={{ width: 16, height: 16, flexShrink: 0, color: "#9ca3af" }} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </motion.aside>

      {/* ── Right content card ────────────────────────────────── */}
      <motion.div
        className="flex-1 min-w-0 bg-white rounded-xl"
        style={{ border: "1px solid #e5e7eb", minHeight: 560 }}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.58, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      >

        {/* ── Group title + tab row ── */}
        <div className="px-8 pt-7">
          {/* Group name is the large heading, matching the reference "General Settings" style */}
          <h2 className="text-[22px] font-semibold text-gray-900 tracking-tight">
            {activeGroup.group}
          </h2>

          {/* Tab strip — one tab per item in the active group */}
          <div className="flex items-center mt-4" style={{ borderBottom: "1px solid #e8eaed" }}>
            {activeGroup.items.map((item) => {
              const isTab = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={cn(
                    "relative pb-3 mr-7 text-[14px] transition-colors whitespace-nowrap",
                    isTab
                      ? "text-gray-900 font-semibold"
                      : "text-gray-400 font-medium hover:text-gray-700"
                  )}
                >
                  {item.label}
                  {isTab && (
                    /* Dark underline matching the reference — NOT blue */
                    <span
                      className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                      style={{ background: "#111827" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Section content ── */}
        <div className="px-8 py-6">
          <SectionContent id={active} />
        </div>
      </motion.div>

    </div>
  );
}
