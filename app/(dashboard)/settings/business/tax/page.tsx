"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { FileText, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsFieldRow } from "@/components/settings/SettingsFieldRow";
import { SettingsSectionCard } from "@/components/settings/SettingsSectionCard";
import { SettingsTextInput } from "@/components/settings/SettingsTextInput";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function BusinessTaxPage() {
  const [gstStatus, setGstStatus] = useState("registered");
  const [pan, setPan] = useState("AAAAA0000A");
  const [saving, setSaving] = useState(false);
  const [tdsFiles, setTdsFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter((f) => {
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name} exceeds 10 MB limit`);
        return false;
      }
      return true;
    });
    setTdsFiles((prev) => [...prev, ...valid]);
  };

  const removeFile = (idx: number) => setTdsFiles((prev) => prev.filter((_, i) => i !== idx));

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success("Tax details saved");
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-[22px]">Tax details</h2>
        <p className="text-sm text-muted-foreground">
          GST and PAN are used for invoicing and regulatory filings. For complex structures, consult your CA — this screen is a
          lightweight mock.
        </p>
      </div>

      <SettingsSectionCard
        title="Tax registrations"
        description="Identifiers used on invoices and regulatory submissions."
        footerActions={
          <>
            <Button variant="ghost" size="sm" type="button" onClick={() => toast.message("Changes discarded (mock)")}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="button" isLoading={saving} onClick={save}>
              Save changes
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            PayGlocal surfaces GST on settlements and exports where required. Customer-facing pages follow RBI and branding
            guidelines; your legal team remains responsible for filings.
          </div>
          <div>
            <SettingsFieldRow label="GST registration status" description="Matches your current compliance posture.">
              <select
                value={gstStatus}
                onChange={(e) => setGstStatus(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm"
              >
                <option value="registered">Registered — regular taxpayer</option>
                <option value="composition">Composition / special scheme</option>
                <option value="exempt">Exempt / not applicable</option>
              </select>
            </SettingsFieldRow>
            <SettingsFieldRow label="PAN (legal entity)" description="10-character PAN of the business.">
              <SettingsTextInput value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} maxLength={10} />
            </SettingsFieldRow>
            <SettingsFieldRow label="Additional tax IDs" description="Placeholder for SEZ, LUT, or state registrations.">
              <SettingsTextInput placeholder="e.g. LUT ARN, SEZ unit ID" />
            </SettingsFieldRow>
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="TDS Certificates"
        description="Upload Form 16A or other TDS certificates for reconciliation and compliance records."
        footerActions={
          <>
            <Button variant="ghost" size="sm" type="button" onClick={() => toast.message("Changes discarded (mock)")}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="button"
              onClick={() => toast.success("TDS documents saved", { description: `${tdsFiles.length} file${tdsFiles.length !== 1 ? "s" : ""} saved` })}
            >
              Save changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground rounded-lg border border-dashed border-border bg-muted/20 p-4">
            Accepted formats: PDF, JPEG, PNG. Maximum file size: 10 MB per file.
          </p>

          {/* Dropzone */}
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/20 px-6 py-8 text-center transition-colors cursor-pointer",
              dragOver && "border-primary bg-primary/5"
            )}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-foreground">Click to upload or drag and drop</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">PDF, JPEG or PNG up to 10 MB</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </div>

          {/* Uploaded files list */}
          {tdsFiles.length > 0 && (
            <div className="space-y-2">
              {tdsFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
                  <FileText className="h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-foreground">{file.name}</p>
                    <p className="text-[11px] text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                    className="shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    aria-label={`Remove ${file.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </SettingsSectionCard>
    </div>
  );
}
