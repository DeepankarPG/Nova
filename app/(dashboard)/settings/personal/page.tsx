"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/shared/Button";
import { SettingsFieldRow } from "@/components/settings/SettingsFieldRow";
import { SettingsTextInput } from "@/components/settings/SettingsTextInput";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "U";
}

export default function PersonalSettingsPage() {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("Deepankar Raj");
  const [email, setEmail] = useState("deepankar.raj@payglocal.in");
  const [backupEmail, setBackupEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setAvatarUrl(url);
    toast.success("Profile photo updated (mock)");
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-[22px]">Personal details</h2>
          <p className="mt-1 text-sm text-muted-foreground">Information for your PayGlocal user, not the public business profile.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditing((v) => !v)}>
          {editing ? "Done" : "Edit"}
        </Button>
      </div>

      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
        <div
          className={cn(
            "flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-lg font-semibold text-foreground"
          )}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- blob preview from file input
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initials(fullName)
          )}
        </div>
        <div className="min-w-0">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
          <Button variant="outline" size="sm" type="button" onClick={() => fileRef.current?.click()}>
            Change photo
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">JPG or PNG, up to 5 MB (mock upload).</p>
        </div>
      </div>

      <div>
        <SettingsFieldRow label="Full name" description="Shown to teammates in Client Management and audit logs.">
          <SettingsTextInput
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={!editing}
          />
        </SettingsFieldRow>
        <SettingsFieldRow label="Email" description="Primary login and security notifications.">
          <SettingsTextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!editing} />
        </SettingsFieldRow>
        <SettingsFieldRow
          label="Backup email"
          description="Used if you lose access to your primary inbox."
        >
          {backupEmail ? (
            <div className="flex flex-col gap-2">
              <SettingsTextInput
                type="email"
                value={backupEmail}
                onChange={(e) => setBackupEmail(e.target.value)}
                disabled={!editing}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="text-red-600 hover:text-red-700 dark:text-red-400"
                  onClick={() => {
                    setBackupEmail("");
                    toast.success("Backup email removed");
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" size="sm" type="button" onClick={() => setBackupEmail("backup.you@example.com")}>
              Add backup email
            </Button>
          )}
        </SettingsFieldRow>
        <SettingsFieldRow label="Contact phone" description="For urgent account alerts (mock — no OTP sent).">
          {phone ? (
            <div className="flex flex-col gap-2">
              <SettingsTextInput value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!editing} />
              <Button variant="secondary" size="sm" type="button" onClick={() => toast.success("Verification started (mock)")}>
                Verify now
              </Button>
            </div>
          ) : (
            <Button variant="secondary" size="sm" type="button" onClick={() => setPhone("+91 98765 43210")}>
              Add contact phone number
            </Button>
          )}
        </SettingsFieldRow>
      </div>

      {editing && (
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" type="button" onClick={() => setEditing(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="button"
            onClick={() => {
              setEditing(false);
              toast.success("Personal details saved");
            }}
          >
            Save
          </Button>
        </div>
      )}
    </div>
  );
}
