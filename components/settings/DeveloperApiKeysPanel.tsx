"use client";

import { useState } from "react";
import { Copy, Eye, EyeOff, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const keys = [
  { id: "lpub", label: "Live Public Key", value: "pk_live_mcatest123_pub_abcde12345", secret: false },
  { id: "lsec", label: "Live Secret Key", value: "sk_live_mcatest123_sec_xyzw98765", secret: true },
  { id: "tpub", label: "Test Public Key", value: "pk_test_mcatest123_pub_test12345", secret: false },
  { id: "tsec", label: "Test Secret Key", value: "sk_test_mcatest123_sec_test98765", secret: true },
] as const;

export function DeveloperApiKeysPanel() {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-4">
      <div className="space-y-3 pt-2">
        {keys.map((k) => (
          <div key={k.id} className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{k.label}</p>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded-lg border border-border bg-card px-3 py-2 font-mono text-[11px] text-foreground">
                {k.secret && !showSecrets[k.id] ? "••••••••••••••••••••••••••••••••" : k.value}
              </code>
              {k.secret ? (
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  className="h-8 w-8 shrink-0 p-0"
                  aria-label={showSecrets[k.id] ? "Hide key" : "Show key"}
                  onClick={() => setShowSecrets((s) => ({ ...s, [k.id]: !s[k.id] }))}
                >
                  {showSecrets[k.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              ) : null}
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="h-8 w-8 shrink-0 p-0"
                aria-label="Copy key"
                onClick={() => {
                  void navigator.clipboard.writeText(k.value);
                  toast.success("Copied");
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Shield className="h-3.5 w-3.5 shrink-0" />
        Never share secret keys. Rotate them immediately if compromised.
      </p>
    </div>
  );
}
