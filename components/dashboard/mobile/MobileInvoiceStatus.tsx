"use client";

import { useRef, useState } from "react";
import { X, TriangleAlert, FileText, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type FileItem = {
  id: string;
  name: string;
  size: number;
  mimeType: string;
};

const MAX_FILES = 5;
const MAX_SIZE  = 10 * 1024 * 1024;

function fmtSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MobileInvoiceStatus({
  invId,
  onClose,
  onSuccess,
}: {
  invId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [files,   setFiles]   = useState<FileItem[]>([]);
  const [hint,    setHint]    = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const maxReached = files.length >= MAX_FILES;
  const hasFiles   = files.length > 0;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    setFiles(prev => {
      const next = [...prev];
      for (const f of picked) {
        if (next.length >= MAX_FILES) break;
        if (f.size > MAX_SIZE) continue;
        next.push({ id: `${f.name}-${f.size}-${f.lastModified}`, name: f.name, size: f.size, mimeType: f.type });
      }
      return next;
    });
    e.target.value = "";
  }

  function removeFile(id: string) {
    setFiles(prev => prev.filter(f => f.id !== id));
  }

  function handleSubmit() {
    if (!hasFiles) {
      setHint(true);
      setTimeout(() => setHint(false), 3000);
      return;
    }
    onSuccess();
    onClose();
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-4 pt-5 pb-3 shrink-0 border-b border-border/30">
        <div className="min-w-0">
          <p className="text-[15px] font-normal text-muted-foreground leading-snug">Change invoice status</p>
          <p className="text-[12px] text-muted-foreground/60 mt-1 leading-none">Invoice ID: {invId}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto pb-[92px]">

        {/* Warning banner */}
        <div className="mx-4 mt-4 flex items-start gap-3 bg-amber-50 border border-amber-200/60 rounded-[10px] px-3.5 py-3">
          <TriangleAlert className="h-[18px] w-[18px] text-amber-600 shrink-0 mt-[1px]" strokeWidth={1.75} />
          <p className="text-[13px] text-amber-800 leading-relaxed">
            By submitting the document here, you confirm that this invoice has been manually marked as PAID. This action is final and cannot be reversed.
          </p>
        </div>

        {/* Upload section */}
        <div className="mx-4 mt-5">
          <p className="text-[14px] font-medium text-foreground mb-3">Upload proof documents</p>

          {/* Upload zone */}
          <button
            type="button"
            onClick={() => !maxReached && fileRef.current?.click()}
            disabled={maxReached}
            className={cn(
              "w-full flex flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed transition-colors",
              maxReached
                ? "border-border/40 bg-muted/20 cursor-default opacity-50"
                : "border-primary/50 bg-primary/[0.03] active:bg-primary/[0.07]",
            )}
            style={{ height: 160 }}
          >
            <FileText
              className={cn("h-7 w-7", maxReached ? "text-muted-foreground" : "text-primary/70")}
              strokeWidth={1.5}
            />
            <p className={cn("text-[14px] font-medium", maxReached ? "text-muted-foreground" : "text-primary")}>
              Tap to upload files
            </p>
            <p className="text-[12px] text-muted-foreground">Accepted: .pdf, .jpg, .png under 10MB</p>
            <p className="text-[12px] text-muted-foreground">Max 5 files</p>
          </button>

          {/* Inline hint */}
          {hint && (
            <p className="text-[12px] text-destructive mt-2">Please upload at least one proof document.</p>
          )}

          {/* File list */}
          {files.length > 0 && (
            <div className="mt-3 rounded-xl border border-border overflow-hidden bg-white">
              {files.map((file, idx) => (
                <div
                  key={file.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3",
                    idx > 0 && "border-t border-border/30",
                  )}
                >
                  <FileText className="h-5 w-5 text-primary shrink-0" strokeWidth={1.75} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-foreground font-medium truncate">{file.name}</p>
                    <p className="text-[12px] text-muted-foreground">{fmtSize(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="h-8 w-8 flex items-center justify-center text-destructive/70 active:opacity-60 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fixed bottom bar */}
      <div className="absolute inset-x-0 bottom-0 px-4 pt-3 bg-background border-t border-border/40 shrink-0">
        <button
          type="button"
          onClick={handleSubmit}
          className={cn(
            "w-full h-11 rounded-2xl text-[14px] font-bold transition-all",
            hasFiles
              ? "bg-primary text-primary-foreground shadow-sm active:scale-[0.98]"
              : "bg-muted text-muted-foreground cursor-default",
          )}
        >
          Update status
        </button>
        <div style={{ height: "env(safe-area-inset-bottom)", minHeight: 8 }} />
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
}
