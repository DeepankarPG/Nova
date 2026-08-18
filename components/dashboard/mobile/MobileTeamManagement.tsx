"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, Search, Plus, Check, ArrowRight, X, ChevronDown, Loader2, Send, Download,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ─── Types ───────────────────────────────────────────────────────── */
type TeamRole   = "admin" | "view-only";
type TeamStatus = "active" | "invite-sent" | "inactive";
type TeamTab    = "all" | TeamStatus;

interface TeamMember {
  id:         string;
  name:       string;
  username:   string;
  role:       TeamRole;
  merchantId: string;
  status:     TeamStatus;
  phone:      string;
  email:      string;
}

/* ─── Mock data ───────────────────────────────────────────────────── */
const MERCHANT_ID = "700010045821";

const INITIAL_TEAM: TeamMember[] = [
  { id: "tm1", name: "Aditi Rao",     username: "aditi.rao",     role: "admin",     merchantId: MERCHANT_ID, status: "active",      phone: "+91 9820011223", email: "aditi.rao@merchant.com" },
  { id: "tm2", name: "Karan Mehta",   username: "karan.mehta",   role: "admin",     merchantId: MERCHANT_ID, status: "active",      phone: "+91 9845566778", email: "karan.mehta@merchant.com" },
  { id: "tm3", name: "Sneha Iyer",    username: "sneha.iyer",    role: "view-only", merchantId: MERCHANT_ID, status: "active",      phone: "+91 9900112233", email: "sneha.iyer@merchant.com" },
  { id: "tm4", name: "Rohit Verma",   username: "rohit.verma",   role: "view-only", merchantId: MERCHANT_ID, status: "active",      phone: "+91 9765432109", email: "rohit.verma@merchant.com" },
  { id: "tm5", name: "Priya Nair",    username: "priya.nair",    role: "admin",     merchantId: MERCHANT_ID, status: "invite-sent", phone: "+91 9911223344", email: "priya.nair@merchant.com" },
  { id: "tm6", name: "Farhan Sheikh", username: "farhan.sheikh", role: "view-only", merchantId: MERCHANT_ID, status: "invite-sent", phone: "+91 9822334455", email: "farhan.sheikh@merchant.com" },
  { id: "tm7", name: "Meera Pillai",  username: "meera.pillai",  role: "view-only", merchantId: MERCHANT_ID, status: "inactive",    phone: "+91 9877001122", email: "meera.pillai@merchant.com" },
  { id: "tm8", name: "Nikhil Desai",  username: "nikhil.desai",  role: "admin",     merchantId: MERCHANT_ID, status: "active",      phone: "+91 9833445566", email: "nikhil.desai@merchant.com" },
];

const TEAM_TABS: { id: TeamTab; label: string }[] = [
  { id: "all",          label: "All"         },
  { id: "active",       label: "Active"      },
  { id: "invite-sent",  label: "Invite Sent" },
  { id: "inactive",     label: "Inactive"    },
];

const STATUS_CFG: Record<TeamStatus, { label: string; text: string; bg: string }> = {
  active:       { label: "Active",      text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  "invite-sent": { label: "Invite Sent", text: "text-blue-700 dark:text-blue-400",       bg: "bg-blue-50 dark:bg-blue-950/40"       },
  inactive:     { label: "Inactive",    text: "text-muted-foreground",                  bg: "bg-muted"                             },
};

/* ─── Badges ──────────────────────────────────────────────────────── */
function RoleBadge({ role }: { role: TeamRole }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-muted text-muted-foreground">
      {role === "admin" ? "Admin" : "View-only"}
    </span>
  );
}

function TeamStatusBadge({ status }: { status: TeamStatus }) {
  const cfg = STATUS_CFG[status];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap", cfg.text, cfg.bg)}>
      {cfg.label}
      {status === "active" && <Check className="h-3 w-3 shrink-0" strokeWidth={2.5} />}
      {status === "invite-sent" && <ArrowRight className="h-3 w-3 shrink-0" strokeWidth={2.5} />}
      {status === "inactive" && <X className="h-3 w-3 shrink-0" strokeWidth={2.5} />}
    </span>
  );
}

/* ─── Role dropdown (used inside Add team member form) ─────────────── */
function RoleDropdown({ value, onChange }: { value: TeamRole; onChange: (r: TeamRole) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between rounded-xl border border-border bg-[#f6f8fa] px-3.5 py-3 text-left"
      >
        <span className="text-[14px] font-medium text-foreground">{value === "admin" ? "Admin" : "View-only"}</span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} strokeWidth={2} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[95]" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1.5 z-[96] rounded-xl border border-border bg-card shadow-lg overflow-hidden">
            {(["admin", "view-only"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { onChange(r); setOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-left text-[13px] transition-colors hover:bg-muted",
                  value === r ? "text-primary font-semibold" : "text-foreground font-medium"
                )}
              >
                {r === "admin" ? "Admin" : "View-only"}
                {value === r && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Form field helpers ─────────────────────────────────────────── */
function FieldLabel({ text }: { text: string }) {
  return <p className="text-[12px] font-semibold text-muted-foreground mb-1.5">{text}</p>;
}

function FormField({
  label, value, onChange, onBlur, placeholder, error, type = "text",
}: {
  label:        string;
  value:        string;
  onChange:     (v: string) => void;
  onBlur?:      () => void;
  placeholder?: string;
  error?:       string;
  type?:        string;
}) {
  return (
    <div>
      <FieldLabel text={label} />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-xl border bg-[#f6f8fa] px-3.5 py-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors",
          error ? "border-red-400" : "border-border"
        )}
      />
      {error && <p className="text-[12px] text-red-600 dark:text-red-400 mt-1">{error}</p>}
    </div>
  );
}

/* ─── Add team member — bottom sheet form ───────────────────────────
 * Rises from the bottom and covers most of the screen, matching the
 * settlement-statement sheet convention used elsewhere in the app. */
interface NewMemberInput {
  firstName: string;
  lastName:  string;
  username:  string;
  role:      TeamRole;
  email:     string;
  phone:     string;
  whatsapp:  boolean;
}

function emptyNewMember(): NewMemberInput {
  return { firstName: "", lastName: "", username: "", role: "view-only", email: "", phone: "", whatsapp: false };
}

function AddTeamMemberSheet({
  open,
  onClose,
  contained,
  onInvited,
}: {
  open:      boolean;
  onClose:   () => void;
  contained: boolean;
  onInvited: (member: TeamMember) => void;
}) {
  const pos = contained ? "absolute" : "fixed";
  const [form,      setForm]      = useState<NewMemberInput>(emptyNewMember());
  const [touched,   setTouched]   = useState<Record<string, boolean>>({});
  const [sending,   setSending]   = useState(false);

  const REQUIRED: (keyof NewMemberInput)[] = ["firstName", "username", "email"];
  const isMissing  = (f: keyof NewMemberInput) => !String(form[f]).trim();
  const isComplete = REQUIRED.every((f) => !isMissing(f));

  const setField = (f: keyof NewMemberInput, v: string | boolean) => setForm((prev) => ({ ...prev, [f]: v }));
  const markTouched = (f: string) => setTouched((t) => ({ ...t, [f]: true }));

  const handleClose = () => {
    if (sending) return;
    setForm(emptyNewMember());
    setTouched({});
    onClose();
  };

  const handleSendInvite = () => {
    if (sending) return;
    if (!isComplete) {
      setTouched((t) => ({ ...t, ...Object.fromEntries(REQUIRED.map((f) => [f, true])) }));
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      const member: TeamMember = {
        id: `tm-${Date.now()}`,
        name: `${form.firstName} ${form.lastName}`.trim(),
        username: form.username.trim(),
        role: form.role,
        merchantId: MERCHANT_ID,
        status: "invite-sent",
        phone: form.phone ? `+91 ${form.phone}` : "—",
        email: form.email.trim(),
      };
      onInvited(member);
      toast.success(`Invite sent to ${member.username}`);
      setForm(emptyNewMember());
      setTouched({});
      onClose();
    }, 900);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className={`${pos} inset-0 z-[90] bg-black/40 backdrop-blur-sm`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
          />
          <motion.div
            className={`${pos} inset-x-0 bottom-0 z-[91] flex flex-col bg-background overflow-hidden rounded-t-[24px]`}
            style={{ height: "88%" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0" aria-hidden>
              <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-4 pb-3 border-b border-border/40 shrink-0">
              <div className="min-w-0">
                <p className="text-[17px] font-bold text-foreground tracking-tight leading-tight">Add team member</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">Invite a teammate and set their access role for this account.</p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-foreground active:scale-95 transition-transform shrink-0"
                aria-label="Close"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
              <div className="px-4 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="First name" value={form.firstName} onChange={(v) => setField("firstName", v)}
                    onBlur={() => markTouched("firstName")}
                    error={touched.firstName && isMissing("firstName") ? "Required" : undefined} />
                  <FormField label="Last name" value={form.lastName} onChange={(v) => setField("lastName", v)} />
                </div>

                <FormField label="Username" value={form.username} onChange={(v) => setField("username", v)}
                  onBlur={() => markTouched("username")} placeholder="e.g. priya.nair"
                  error={touched.username && isMissing("username") ? "Required" : undefined} />

                <div>
                  <FieldLabel text="Role" />
                  <RoleDropdown value={form.role} onChange={(r) => setField("role", r)} />
                </div>

                <FormField label="Email ID" value={form.email} onChange={(v) => setField("email", v)}
                  onBlur={() => markTouched("email")} type="email"
                  error={touched.email && isMissing("email") ? "Required" : undefined} />

                <FormField label="Phone number" value={form.phone} onChange={(v) => setField("phone", v)} placeholder="98765 43210" />

                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-[#f6f8fa] px-3.5 py-3.5">
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-foreground">Enable Echo on WhatsApp</p>
                    <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-snug">
                      Send this member account activity updates over WhatsApp.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setField("whatsapp", !form.whatsapp)}
                    className={cn("relative h-6 w-11 rounded-full shrink-0 transition-colors", form.whatsapp ? "bg-primary" : "bg-muted-foreground/25")}
                    aria-label="Toggle Echo on WhatsApp"
                  >
                    <span className={cn(
                      "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                      form.whatsapp && "translate-x-5"
                    )} />
                  </button>
                </div>
              </div>
            </div>

            {/* Sticky footer */}
            <div
              className="shrink-0 bg-background border-t border-border/60 px-4 pt-3 flex gap-2.5"
              style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom))" }}
            >
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 h-12 rounded-2xl border border-border text-[14.5px] font-bold text-foreground active:scale-[0.98] transition-transform"
              >
                Cancel
              </button>
              <button
                type="button"
                aria-disabled={!isComplete}
                onClick={handleSendInvite}
                className={cn(
                  "flex-1 h-12 rounded-2xl text-[14.5px] font-bold transition-all flex items-center justify-center gap-2",
                  isComplete ? "bg-primary text-white active:scale-[0.98]" : "bg-muted text-muted-foreground"
                )}
              >
                {sending
                  ? <><Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} /> Sending...</>
                  : <><Send className="h-4 w-4" strokeWidth={2.25} /> Send Invite</>}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Root — Team Management landing screen ─────────────────────── */
export function MobileTeamManagement({
  open,
  onClose,
  contained = false,
}: {
  open:       boolean;
  onClose:    () => void;
  contained?: boolean;
}) {
  const pos = contained ? "absolute" : "fixed";
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_TEAM);
  const [tab,     setTab]     = useState<TeamTab>("all");
  const [search,  setSearch]  = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const q = search.trim().toLowerCase();
  const filtered = members
    .filter((m) => tab === "all" || m.status === tab)
    .filter((m) => !q || m.name.toLowerCase().includes(q) || m.username.toLowerCase().includes(q));

  const adminCount    = members.filter((m) => m.role === "admin").length;
  const viewOnlyCount = members.filter((m) => m.role === "view-only").length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="team-management-screen"
          className={`${pos} inset-x-0 bottom-0 z-[80] flex flex-col bg-background overflow-hidden`}
          style={{ top: 44 }}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 bg-background border-b border-border/40 shrink-0"
            style={{ paddingTop: 14, paddingBottom: 14 }}
          >
            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-foreground active:scale-95 transition-transform shrink-0"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[17px] font-bold text-foreground tracking-tight leading-tight">Team Management</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">{members.length} Members</p>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>

            {/* Role breakdown — styled like Transactions metric cards */}
            <div className="mx-4 mt-4 grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl border border-border bg-card shadow-sm px-4 py-3.5">
                <p className="text-[12px] font-medium text-muted-foreground mb-1">Admin</p>
                <p className="text-[26px] font-bold text-foreground tabular-nums leading-tight">{adminCount}</p>
                <p className="text-[11.5px] text-muted-foreground mt-1.5">Full access</p>
              </div>
              <div className="rounded-2xl border border-border bg-card shadow-sm px-4 py-3.5">
                <p className="text-[12px] font-medium text-muted-foreground mb-1">View-only</p>
                <p className="text-[26px] font-bold text-foreground tabular-nums leading-tight">{viewOnlyCount}</p>
                <p className="text-[11.5px] text-muted-foreground mt-1.5">Restricted access</p>
              </div>
            </div>

            <div className="mx-4 mt-3 mb-6 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">

              {/* Header — matches Payment Links: title + Export + primary "+" */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3 gap-2">
                <p className="text-[15px] font-bold text-foreground shrink-0">All Members</p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toast.success("Exporting team members...")}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-[11.5px] font-medium text-muted-foreground active:bg-muted/40 transition-colors"
                  >
                    <Download className="h-[12px] w-[12px]" strokeWidth={2} />
                    Export
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddOpen(true)}
                    className="h-[30px] w-[30px] flex items-center justify-center rounded-lg bg-primary text-white active:scale-[0.97] transition-all shrink-0"
                    aria-label="Add team member"
                  >
                    <Plus className="h-[14px] w-[14px]" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Search — matches Payment Links: single-level wrapper */}
              <div className="px-4 pb-3">
                <div className="flex items-center gap-2.5 bg-muted/50 rounded-xl px-3.5 py-2.5">
                  <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={2} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by username"
                    className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none min-w-0"
                  />
                  {search && (
                    <button type="button" onClick={() => setSearch("")}>
                      <X className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>

              {/* Status tabs — matches Payment Links: single flex row, centered labels */}
              <div className="flex gap-1 mx-4 mb-3 bg-muted/60 p-1 rounded-xl overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
                {TEAM_TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center py-1.5 text-[11.5px] font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 px-1",
                      tab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Member rows */}
              <div className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <p className="px-4 py-8 text-center text-[13px] text-muted-foreground">No team members found</p>
                ) : filtered.map((m) => (
                  <div key={m.id} className="px-4 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-bold text-foreground leading-snug truncate">{m.name}</p>
                        <p className="text-[12px] text-muted-foreground mt-0.5 font-mono truncate">{m.username}</p>
                        <div className="mt-1.5">
                          <RoleBadge role={m.role} />
                        </div>
                      </div>
                      <div className="shrink-0 text-right flex flex-col items-end gap-1.5">
                        <TeamStatusBadge status={m.status} />
                        <p className="text-[11px] text-muted-foreground leading-snug">{m.phone}</p>
                      </div>
                    </div>
                    <p className="text-[11.5px] text-muted-foreground mt-1.5 truncate">{m.email}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <AddTeamMemberSheet
            open={addOpen}
            onClose={() => setAddOpen(false)}
            contained={contained}
            onInvited={(member) => setMembers((prev) => [member, ...prev])}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
