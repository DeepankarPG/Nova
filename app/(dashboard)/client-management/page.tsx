"use client";

import { useEffect, useState } from "react";
import { UserPlus, Users, Shield, Eye, Settings } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/shared/Button";
import { Shimmer } from "@/components/shared/ShimmerSkeleton";
import { cn, formatDate } from "@/lib/utils";
import { clients } from "@/lib/mock-data";
import { toast } from "sonner";

type Client = typeof clients[number];

const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Admin: Shield,
  Manager: Settings,
  Developer: Settings,
  Viewer: Eye,
};

const roleBadgeStyle: Record<string, string> = {
  Admin: "bg-purple-50 text-purple-700 border-purple-200",
  Manager: "bg-blue-50 text-blue-700 border-blue-200",
  Developer: "bg-[#eff4ff] text-[#0047b0] border-[#c7d9fb]",
  Viewer: "bg-slate-100 text-slate-600 border-slate-200",
};

const columns: Column<Client>[] = [
  {
    key: "user",
    header: "User",
    render: (row) => (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">{row.name.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-800">{row.name}</p>
          <p className="text-[11px] text-slate-400">{row.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: "role",
    header: "Role",
    render: (row) => {
      const Icon = roleIcons[row.role] ?? Eye;
      return (
        <span className={cn(
          "inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border",
          roleBadgeStyle[row.role] ?? "bg-slate-100 text-slate-600 border-slate-200"
        )}>
          <Icon className="w-3 h-3" />
          {row.role}
        </span>
      );
    },
  },
  {
    key: "status",
    header: "Status",
    render: (row) => <StatusBadge status={row.status} size="sm" />,
  },
  {
    key: "lastActive",
    header: "Last Active",
    render: (row) => (
      <span className="text-xs text-slate-500">{formatDate(row.lastActive)}</span>
    ),
  },
  {
    key: "joined",
    header: "Joined",
    render: (row) => (
      <span className="text-xs text-slate-500">
        {formatDate(row.joinedAt, { day: "2-digit", month: "short", year: "2-digit" })}
      </span>
    ),
  },
  {
    key: "actions",
    header: "",
    render: (row) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => toast.success(`Editing ${row.name}`)}>
          Edit
        </Button>
        {row.role !== "Admin" && (
          <Button variant="ghost" size="sm" onClick={() => toast.error(`${row.name} removed`)}>
            Remove
          </Button>
        )}
      </div>
    ),
  },
];

export default function ClientManagementPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const validateEmail = (val: string) => {
    if (!val) { setEmailError(""); return; }
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    setEmailError(valid ? "" : "Please enter a valid email address");
  };

  const handleInvite = async () => {
    if (!email || emailError) return;
    setIsInviting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsInviting(false);
    setEmail("");
    toast.success("Invitation sent!", { description: `Invite sent to ${email}` });
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      <PageHeader
        title="Client Management"
        subtitle="Manage teammates and their access levels"
      />

      {/* Invite card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">Invite Teammate</h3>
        <p className="text-xs text-slate-500 mb-4">Send an invite link to add a new team member</p>
        <div className="flex items-start gap-3">
          <div className="flex-1 max-w-sm">
            <input
              type="email"
              placeholder="teammate@company.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); validateEmail(e.target.value); }}
              className={cn(
                "w-full px-3 py-2 text-sm bg-slate-50 border rounded-lg text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all",
                emailError
                  ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                  : "border-slate-200 focus:ring-[#0061E3]/20 focus:border-[#0061E3]"
              )}
            />
            {emailError && (
              <p className="mt-1.5 text-[11px] text-red-600 flex items-center gap-1">
                <span>⚠</span> {emailError}
              </p>
            )}
            {email && !emailError && (
              <p className="mt-1.5 text-[11px] text-green-600 flex items-center gap-1">
                <span>✓</span> Valid email address
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select className="h-9 px-3 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0061E3]/20 focus:border-[#0061E3] transition-all">
              <option>Viewer</option>
              <option>Developer</option>
              <option>Manager</option>
            </select>
            <Button
              variant="primary"
              size="md"
              leftIcon={<UserPlus className="w-3.5 h-3.5" />}
              isLoading={isInviting}
              onClick={handleInvite}
              disabled={!email || !!emailError}
            >
              Send Invite
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Members", value: isLoading ? null : clients.length.toString(), icon: Users },
          { label: "Active", value: isLoading ? null : clients.filter((c) => c.status === "active").length.toString(), icon: Shield },
          { label: "Inactive", value: isLoading ? null : clients.filter((c) => c.status === "inactive").length.toString(), icon: Eye },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{s.label}</p>
                {isLoading ? <Shimmer className="h-6 w-8 mt-0.5" /> : (
                  <p className="text-xl font-bold text-slate-900">{s.value}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <DataTable
        columns={columns}
        data={clients}
        isLoading={isLoading}
        skeletonRows={4}
        emptyTitle="No team members"
        emptyDescription="Invite teammates to collaborate on this account"
        rowKey={(row) => row.id}
        pageSize={10}
        rowCta={{ label: "View client" }}
      />
    </div>
  );
}
