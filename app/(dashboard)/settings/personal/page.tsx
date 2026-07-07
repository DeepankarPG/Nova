"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SettingsFieldRow } from "@/components/settings/SettingsFieldRow";
import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard";
import { SettingsTextInput } from "@/components/settings/SettingsTextInput";
import { cn } from "@/lib/utils";
import { useProfileAvatar } from "@/hooks/useProfileAvatar";
import { useSettingsPageActions } from "@/components/settings/SettingsPageActionsContext";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "U"
  );
}

export default function PersonalSettingsPage() {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("Deepankar Raj");
  const [email, setEmail] = useState("deepankar.raj@payglocal.in");
  const [backupEmail, setBackupEmail] = useState("");
  const [phone, setPhone] = useState("");
  const { avatarUrl, setFromFile } = useProfileAvatar();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = () => { setEditing(false); toast.success("Personal details saved"); };
  useSettingsPageActions({ isDirty: editing, onSave: handleSave, onCancel: () => setEditing(false) });

  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > MAX_PHOTO_BYTES) {
      toast.error("Please choose an image under 5 MB.");
      return;
    }
    void setFromFile(f)
      .then(() => toast.success("Profile photo updated"))
      .catch(() => toast.error("Could not use that image. Try a JPG or PNG."));
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-[22px]">Personal details</h2>
        <p className="text-sm text-muted-foreground">Information for your PayGlocal user, not the public business profile.</p>
      </div>

      <SettingsSectionCard
        title="Profile & contact"
        description="Your name, photo, and how we reach you."
        headerActions={
          <Button variant="outline" size="sm" onClick={() => setEditing((v) => !v)}>
            {editing ? "Done" : "Edit"}
          </Button>
        }
        footerActions={
          editing ? (
            <>
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
            </>
          ) : undefined
        }
      >
        <div className="space-y-6">
          <div className="flex flex-row items-center gap-5 border-b border-border py-4">
            <div
              className={cn(
                "flex h-18 w-18 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-lg font-semibold text-foreground"
              )}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- session blob URL
                <img src={avatarUrl} alt="Profile photo" className="h-full w-full object-cover" />
              ) : (
                initials(fullName)
              )}
            </div>
            <div className="flex flex-1 flex-col items-start gap-2.5">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={onPickPhoto}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="px-4 py-2.5 rounded-xl border border-[#E2E8F2] bg-white text-sm font-semibold text-foreground active:bg-muted/40 transition-colors"
              >
                Change photo
              </button>
              <p className="text-[12px] leading-4.5" style={{ color: "#8A97AB" }}>
                JPG or PNG, up to 5 MB.
              </p>
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
            <SettingsFieldRow label="Backup email" description="Used if you lose access to your primary inbox.">
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
                <Button variant="outline" size="sm" type="button" onClick={() => setPhone("+91 98765 43210")}>
                  Add contact phone number
                </Button>
              )}
            </SettingsFieldRow>
          </div>
        </div>
      </SettingsSectionCard>
    </div>
  );
}
