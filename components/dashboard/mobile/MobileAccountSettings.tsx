"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  SettingsPageActionsContext,
  useSettingsPageActionsProvider,
} from "@/components/settings/SettingsPageActionsContext";
import {
  MobileOverlayContext,
  type MobileOverlayCtx,
} from "@/components/dashboard/mobile/MobileOverlayContext";
import {
  ArrowLeft, ChevronRight, ExternalLink,
  LayoutGrid, User, Building2, Briefcase, Landmark, Receipt, Palette,
  CreditCard, Shield, Code2, Bell, Plug, Zap,
  UserPlus, MessageSquare, HelpCircle, Headphones,
  Lock, FileText, Cookie, Info, List,
  Pencil, X, Check, Search,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useProfileAvatar } from "@/hooks/useProfileAvatar";
import { useWorkspace } from "@/lib/workspace-context";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";

// Existing settings page components — rendered as-is inside the mobile overlay.
// NOTE: These pages are designed for desktop widths and may overflow the 393px phone frame.
// That is a known issue; no mobile-specific layout changes are made here per scope.
import PersonalSettingsPage         from "@/app/(dashboard)/settings/personal/page";
import BusinessAccountPage          from "@/app/(dashboard)/settings/business/account/page";
import BusinessDetailsPage          from "@/app/(dashboard)/settings/business/details/page";
import BusinessBankingPage          from "@/app/(dashboard)/settings/business/banking/page";
import BusinessTaxPage              from "@/app/(dashboard)/settings/business/tax/page";
import BusinessBrandingPage         from "@/app/(dashboard)/settings/business/branding/page";
import PaymentsSettingsPage         from "@/app/(dashboard)/settings/payments/page";
import SecuritySettingsPage         from "@/app/(dashboard)/settings/security/page";
import DeveloperSettingsPage        from "@/app/(dashboard)/settings/developer/page";
import { MobileNotificationsSettings } from "@/components/dashboard/mobile/MobileNotificationsSettings";
import { MobileContactSupport }        from "@/components/dashboard/mobile/MobileContactSupport";
import { MobileInviteTeamMember }      from "@/components/dashboard/mobile/MobileInviteTeamMember";
import { MobileShareFeedback }         from "@/components/dashboard/mobile/MobileShareFeedback";
import { MobileIntegrations }          from "@/components/dashboard/mobile/MobileIntegrations";
import { MobileWebhooks }              from "@/components/dashboard/mobile/MobileWebhooks";
import { MobileAddFeedback }           from "@/components/dashboard/mobile/MobileAddFeedback";
import {
  HeaderActionsContext,
  useHeaderActionsProvider,
} from "@/components/dashboard/mobile/MobileHeaderActionsContext";

const USER_NAME  = "Deepankar Raj";
const USER_ROLE  = "Admin · Instamart";
const USER_EMAIL = "deepankar.raj@payglocal.in";

function getInitials(name: string) {
  return name.trim().split(/\s+/).map(p => p[0]).join("").slice(0, 2).toUpperCase();
}

/* ── Detail screen keys ─────────────────────────────────────────── */
type DetailKey =
  | "personal"
  | "business/account"
  | "business/details"
  | "business/banking"
  | "business/tax"
  | "business/branding"
  | "payments"
  | "security"
  | "developer"
  | "notifications"
  | "contact_support"
  | "invite_team_member"
  | "share_feedback"
  | "integrations"
  | "webhooks"
  | "add_feedback";

const DETAIL_TITLES: Record<DetailKey, string> = {
  "personal":          "Personal details",
  "business/account":  "Account details",
  "business/details":  "Business details",
  "business/banking":  "Banking & currencies",
  "business/tax":      "Tax details",
  "business/branding": "Branding",
  "payments":          "Payments",
  "security":          "Security",
  "developer":         "Developer",
  "notifications":        "Notifications",
  "contact_support":      "Contact support",
  "invite_team_member":   "Invite a team member",
  "share_feedback":       "Share feedback",
  "integrations":         "Integrations",
  "webhooks":             "Webhooks",
  "add_feedback":         "Feedback",
};

/* ── Business Details — three-tab view ──────────────────────────── */
type BusinessTab = "details" | "banking" | "tax";

const BUSINESS_TABS: { id: BusinessTab; label: string }[] = [
  { id: "details", label: "Business details" },
  { id: "banking", label: "Banking & currencies" },
  { id: "tax",     label: "Tax details" },
];

function BusinessDetailsTabbed() {
  const [activeTab, setActiveTab] = useState<BusinessTab>("details");
  const tabScrollRef = useHorizontalScroll<HTMLDivElement>();

  return (
    <>
      {/* Tab bar: -mx-4 -mt-5 breaks out of the @container's px-4 py-5 so the
          bar spans edge-to-edge and sits flush against the header border.
          Tabs switch by unmounting the inactive component — dirty state is lost
          on switch, consistent with pressing Back also discarding unsaved changes. */}
      <div className="sticky top-0 z-10 -mx-4 -mt-5 bg-white dark:bg-zinc-950 border-b border-border/50">
        <div ref={tabScrollRef} className="[&::-webkit-scrollbar]:hidden" style={{ overflowX: "scroll", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", cursor: "grab" } as React.CSSProperties}>
        <div className="flex w-max">
          {BUSINESS_TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "relative shrink-0 px-4 h-10 text-[13.5px] whitespace-nowrap transition-colors",
                  active ? "font-semibold text-primary" : "font-normal text-muted-foreground"
                )}
              >
                {t.label}
                {active && (
                  <span className="absolute inset-x-4 bottom-0 h-[2.5px] bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
        </div>
      </div>

      <div className="pt-5">
        {activeTab === "details" && <BusinessDetailsPage />}
        {activeTab === "banking" && <BusinessBankingPage />}
        {activeTab === "tax"     && <BusinessTaxPage />}
      </div>
    </>
  );
}

function DetailContent({ screen }: { screen: DetailKey }) {
  switch (screen) {
    case "personal":          return <PersonalSettingsPage />;
    case "business/account":  return <BusinessAccountPage />;
    case "business/details":  return <BusinessDetailsTabbed />;
    case "business/banking":  return <BusinessBankingPage />;
    case "business/tax":      return <BusinessTaxPage />;
    case "business/branding": return <BusinessBrandingPage />;
    case "payments":          return <PaymentsSettingsPage />;
    case "security":          return <SecuritySettingsPage />;
    case "developer":         return <DeveloperSettingsPage />;
    case "notifications":       return <MobileNotificationsSettings />;
    case "contact_support":     return <MobileContactSupport />;
    case "invite_team_member":  return <MobileInviteTeamMember />;
    case "share_feedback":      return <MobileShareFeedback />;
    case "integrations":        return <MobileIntegrations />;
    case "webhooks":            return <MobileWebhooks />;
    case "add_feedback":        return <MobileAddFeedback />;
  }
}

/* ── Detail shell — slides over Account Settings ────────────────── */
interface DetailShellProps {
  screen: DetailKey | null;
  onBack: () => void;
  pos: "absolute" | "fixed";
}

function SettingsDetailShell({ screen, onBack, pos }: DetailShellProps) {
  const { snapshot, ctxValue } = useSettingsPageActionsProvider();
  const { headerRight, ctxValue: headerActionsCtxValue } = useHeaderActionsProvider();

  const [overlayContent, setOverlayContent] = useState<ReactNode>(null);
  const pushOverlay = useCallback((node: ReactNode) => setOverlayContent(node), []);
  const popOverlay = useCallback(() => setOverlayContent(null), []);
  const overlayCtxValue = useMemo<MobileOverlayCtx>(
    () => ({ pushOverlay, popOverlay }),
    [pushOverlay, popOverlay],
  );

  return (
    <AnimatePresence>
      {screen && (
        <motion.div
          key={screen}
          className={`${pos} inset-0 z-61 flex flex-col bg-white dark:bg-zinc-950`}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="shrink-0 border-b border-border/40 bg-white dark:bg-zinc-950">
            <div style={{ height: 44 }} />
            <div className="flex items-center gap-3 px-4" style={{ height: 52 }}>
              <button
                type="button"
                onClick={onBack}
                className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-foreground active:scale-95 transition-transform shrink-0"
                aria-label="Back to Settings"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              </button>
              <span className="text-[17px] font-bold text-foreground tracking-tight flex-1 truncate">
                {DETAIL_TITLES[screen]}
              </span>
              {headerRight}
            </div>
          </div>

          <HeaderActionsContext.Provider value={headerActionsCtxValue}>
          <MobileOverlayContext.Provider value={overlayCtxValue}>
            <SettingsPageActionsContext.Provider value={ctxValue}>
              <div
                className="flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [&_h2]:hidden"
                style={{ scrollbarWidth: "none" }}
              >
                <div className="@container px-4 py-5">
                  <DetailContent screen={screen} />
                </div>
              </div>

              <AnimatePresence>
                {snapshot?.isDirty && (
                  <motion.div
                    key="settings-bottom-bar"
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="shrink-0 border-t border-border/60 bg-background flex gap-3 px-4"
                    style={{
                      paddingTop: 12,
                      paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
                    }}
                  >
                    <Button
                      variant="outline"
                      type="button"
                      className="flex-1 h-13 rounded-xl text-sm font-medium"
                      onClick={() => snapshot.onCancel()}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      type="button"
                      isLoading={snapshot.isSaving}
                      className="flex-1 h-13 rounded-xl text-sm font-semibold"
                      onClick={() => snapshot.onSave()}
                    >
                      Save changes
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </SettingsPageActionsContext.Provider>

            {overlayContent && (
              <div className="absolute inset-0 z-70">
                {overlayContent}
              </div>
            )}
          </MobileOverlayContext.Provider>
          </HeaderActionsContext.Provider>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Row types ───────────────────────────────────────────────────── */
type RowKind = "nav" | "external" | "active" | "value";

interface RowDef {
  icon: React.ElementType;
  label: string;
  kind?: RowKind;
  value?: string;
}

interface SectionDef {
  title: string;
  rows: RowDef[];
}

const SECTIONS: SectionDef[] = [
  {
    title: "Personal",
    rows: [
      { icon: User, label: "Personal details" },
    ],
  },
  {
    title: "Account & Business",
    rows: [
      { icon: Building2,  label: "Account details" },
      { icon: Briefcase,  label: "Business details" },
      { icon: CreditCard, label: "Payments" },
      { icon: Palette,    label: "Branding" },
    ],
  },
  {
    title: "Payments & Platform",
    rows: [
      { icon: Shield, label: "Security" },
      { icon: Code2,  label: "Developer" },
      { icon: Bell,   label: "Notifications" },
      { icon: Plug,   label: "Integrations" },
      { icon: Zap,    label: "Webhooks" },
    ],
  },
  {
    title: "Team",
    rows: [
      { icon: UserPlus, label: "Invite a team member" },
    ],
  },
  {
    title: "Help & Feedback",
    rows: [
      { icon: HelpCircle,    label: "Help center",    kind: "external" },
      { icon: Headphones,    label: "Contact support" },
      { icon: MessageSquare, label: "Share feedback" },
    ],
  },
  {
    title: "Legal",
    rows: [
      { icon: Lock,     label: "Privacy policy",    kind: "external" },
      { icon: FileText, label: "Terms & conditions", kind: "external" },
      { icon: Cookie,   label: "Cookie policy",      kind: "external" },
    ],
  },
  {
    title: "About",
    rows: [
      { icon: Info, label: "App version", kind: "value", value: "2.4.1" },
    ],
  },
];

/* ── Row component ───────────────────────────────────────────────── */
function Row({
  def,
  divider,
  onTap,
}: {
  def: RowDef;
  divider: boolean;
  onTap?: () => void;
}) {
  const { icon: Icon, label, kind = "nav", value } = def;
  const isActive   = kind === "active";
  const isExternal = kind === "external";
  const isValue    = kind === "value";

  const content = (
    <>
      <Icon
        className={cn("shrink-0", isActive ? "text-foreground" : "text-[#666666]")}
        style={{ height: 22, width: 22 }}
        strokeWidth={1.75}
      />
      <span className={cn(
        "flex-1 text-[15px] min-w-0 truncate",
        isActive ? "font-semibold text-foreground" : "font-medium text-foreground",
      )}>
        {label}
      </span>
      {isValue && value && (
        <span className="text-[14px] text-muted-foreground shrink-0">{value}</span>
      )}
      {isExternal && (
        <ExternalLink className="h-4 w-4 text-muted-foreground/40 shrink-0" strokeWidth={1.75} />
      )}
      {!isActive && !isExternal && !isValue && (
        <ChevronRight className="h-4 w-4 text-foreground/20 shrink-0" strokeWidth={2} />
      )}
    </>
  );

  return (
    <div>
      {isActive || isValue ? (
        <div
          className={cn("flex items-center gap-3.5 px-4", isActive && "bg-muted/50")}
          style={{ minHeight: 52 }}
        >
          {content}
        </div>
      ) : (
        <button
          type="button"
          onClick={onTap}
          className="w-full flex items-center gap-3.5 px-4 text-left active:bg-muted/40 transition-colors"
          style={{ minHeight: 52 }}
        >
          {content}
        </button>
      )}
      {divider && <div className="h-px bg-border/40 ml-13" />}
    </div>
  );
}

/* ── Section group ───────────────────────────────────────────────── */
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground/55 px-1 mb-2">
        {title}
      </p>
      <div
        className="bg-card rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)" }}
      >
        {children}
      </div>
    </div>
  );
}

/* ── MID switcher bottom sheet ──────────────────────────────────── */
function MidSwitcherSheet({
  open,
  onClose,
  pos,
}: {
  open: boolean;
  onClose: () => void;
  pos: "absolute" | "fixed";
}) {
  const { mids, selectedMid, setMid } = useWorkspace();
  const [query, setQuery] = useState("");
  const showSearch = mids.length >= 10;
  const filtered = showSearch
    ? mids.filter(
        (m) =>
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.maskedId.includes(query),
      )
    : mids;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="mid-backdrop"
            className={`${pos} inset-0 z-62`}
            style={{ background: "rgba(0,0,0,0.4)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mid-sheet"
            className={`${pos} inset-x-0 bottom-0 z-63 bg-card flex flex-col overflow-hidden`}
            style={{
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "70%",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="flex justify-center pt-3 pb-0 shrink-0">
              <div className="h-1 w-9 rounded-full bg-muted-foreground/20" />
            </div>

            <div className="flex items-center justify-between px-5 py-3 shrink-0">
              <span className="text-[15px] font-bold text-foreground">Switch MID</span>
              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-muted active:opacity-60 transition-opacity"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-foreground/70" strokeWidth={2} />
              </button>
            </div>

            {showSearch && (
              <div className="px-5 pb-3 shrink-0">
                <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 h-10">
                  <Search
                    className="h-4 w-4 text-muted-foreground/50 shrink-0"
                    strokeWidth={1.75}
                  />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search MID or merchant"
                    className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/50 outline-none"
                  />
                </div>
              </div>
            )}

            <div
              className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none" }}
            >
              {filtered.map((mid) => {
                const isActive = mid.id === selectedMid.id;
                return (
                  <button
                    key={mid.id}
                    type="button"
                    onClick={() => {
                      // TODO: wire to MID switch action
                      setMid(mid.id);
                      toast.success(`Switched to ${mid.name}`);
                      onClose();
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-colors",
                      isActive
                        ? "bg-primary/8 border border-primary/15"
                        : "bg-muted/30 active:bg-muted/60",
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-[14px] leading-tight truncate",
                          isActive ? "font-bold text-foreground" : "font-semibold text-foreground",
                        )}
                      >
                        MID ···{mid.maskedId}
                      </p>
                      <p className="text-[12px] text-muted-foreground leading-tight mt-0.5 truncate">
                        {mid.name}
                      </p>
                    </div>
                    {isActive && (
                      <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={2.5} />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── MobileAccountSettings ───────────────────────────────────────── */
interface MobileAccountSettingsProps {
  open: boolean;
  onClose: () => void;
  contained?: boolean;
  onEditProfile?: () => void;
  directDetail?: DetailKey;
}

export function MobileAccountSettings({
  open,
  onClose,
  contained = false,
  onEditProfile,
  directDetail,
}: MobileAccountSettingsProps) {
  const { avatarUrl } = useProfileAvatar();
  const { mids, selectedMid } = useWorkspace();
  const pos = contained ? "absolute" : "fixed";

  const [activeDetail, setActiveDetail] = useState<DetailKey | null>(null);
  const [midSheetOpen, setMidSheetOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setActiveDetail(null);
    } else if (directDetail) {
      setActiveDetail(directDetail);
    }
  }, [open, directDetail]);

  const DETAIL_HANDLERS: Partial<Record<string, DetailKey>> = {
    "Personal details":     "personal",
    "Account details":      "business/account",
    "Business details":     "business/details",
    "Banking & currencies": "business/banking",
    "Tax details":          "business/tax",
    "Branding":             "business/branding",
    "Payments":             "payments",
    "Security":             "security",
    "Developer":            "developer",
    "Notifications":          "notifications",
    "Contact support":        "contact_support",
    "Invite a team member":   "invite_team_member",
    "Share feedback":         "share_feedback",
    "Integrations":           "integrations",
    "Webhooks":               "webhooks",
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {!directDetail && (
          <motion.div
            key="account-settings"
            className={`${pos} inset-0 z-60 flex flex-col`}
            style={{ backgroundColor: "#f2f2f7" }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Status bar spacer */}
            <div style={{ height: 44, flexShrink: 0 }} />

            {/* Scrollable body */}
            <div
              className="flex-1 overflow-y-auto pb-12 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none" }}
            >
              {/* Inline page header with back icon */}
              <div className="px-4 pt-4 pb-5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-foreground active:scale-95 transition-transform shrink-0"
                    aria-label="Back"
                  >
                    <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                  </button>
                  <h1 className="text-[28px] font-bold text-foreground leading-tight tracking-tight">
                    Settings
                  </h1>
                </div>
                <p className="text-[14px] text-muted-foreground mt-1 ml-7">
                  Manage your profile and account
                </p>
              </div>

              {/* Combined profile card — tapping anywhere navigates to Personal Details */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setActiveDetail("personal")}
                onKeyDown={(e) => e.key === "Enter" && setActiveDetail("personal")}
                className="mx-4 mt-3 mb-6 bg-card rounded-2xl p-5 relative cursor-pointer active:opacity-80 transition-opacity"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.04)" }}
              >
                {/* Row: avatar + user info */}
                <div className="flex items-center gap-3.5">
                  {/* Avatar 56×56 with edit pencil anchored bottom-right */}
                  <div className="relative w-14 h-14 shrink-0">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-primary flex items-center justify-center">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[20px] font-bold text-white tracking-wide">
                          {getInitials(USER_NAME)}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveDetail("personal"); }}
                      className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-white border-[1.5px] border-[#E2E8F2] flex items-center justify-center shadow-sm active:opacity-60 transition-opacity"
                      aria-label="Edit profile"
                    >
                      <Pencil className="h-3 w-3 text-primary" strokeWidth={2} />
                    </button>
                  </div>

                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-bold text-foreground leading-tight truncate">
                      {USER_NAME}
                    </p>

                    {/* Email only */}
                    <p className="text-[13px] text-muted-foreground mt-0.5 truncate">
                      {USER_EMAIL}
                    </p>

                    {/* MID pill — left-aligned */}
                    <div className="mt-2">
                      {mids.length === 1 ? (
                        // TODO: hide tap if single MID
                        <div className="inline-flex px-3 py-1 rounded-full bg-primary/10">
                          <span className="text-[12px] font-semibold text-primary/60">
                            MID ···{selectedMid.maskedId}
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setMidSheetOpen(true)}
                          className="inline-flex px-3 py-1 rounded-full bg-primary/10 active:bg-primary/20 transition-colors"
                        >
                          <span className="text-[12px] font-semibold text-primary">
                            MID ···{selectedMid.maskedId}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-foreground/25 shrink-0 ml-2" strokeWidth={2} />
                </div>
              </div>

              {/* Settings sections */}
              <div className="px-4 space-y-6 pb-12">
                {SECTIONS.map(section => (
                  <Group key={section.title} title={section.title}>
                    {section.rows.map((row, i) => {
                      const detailKey = DETAIL_HANDLERS[row.label];
                      return (
                        <Row
                          key={row.label}
                          def={row}
                          divider={i < section.rows.length - 1}
                          onTap={detailKey ? () => setActiveDetail(detailKey) : undefined}
                        />
                      );
                    })}
                  </Group>
                ))}
              </div>

            </div>
          </motion.div>
          )}

          <SettingsDetailShell
            screen={activeDetail}
            onBack={directDetail ? onClose : () => setActiveDetail(null)}
            pos={pos}
          />

          <MidSwitcherSheet
            open={midSheetOpen}
            onClose={() => setMidSheetOpen(false)}
            pos={pos}
          />
        </>
      )}
    </AnimatePresence>
  );
}

/* Suppress unused-import hint — DETAIL_TITLES exported for potential future use */
export { DETAIL_TITLES };
