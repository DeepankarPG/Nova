"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/shared/Button";
import { SettingsFieldRow } from "@/components/settings/SettingsFieldRow";
import { SettingsToggle } from "@/components/settings/SettingsToggle";

export function SettingsToggleSection({
  items,
}: {
  items: { label: string; description: string; on: boolean }[];
}) {
  const [states, setStates] = useState(() => items.map((i) => i.on));
  const toggle = (i: number) => setStates((s) => s.map((v, j) => (j === i ? !v : v)));

  return (
    <>
      {items.map((item, i) => (
        <SettingsFieldRow key={item.label} label={item.label} description={item.description}>
          <div className="flex justify-end sm:justify-start">
            <SettingsToggle on={states[i]} onChange={() => toggle(i)} />
          </div>
        </SettingsFieldRow>
      ))}
      <div className="flex justify-end border-t border-border pt-4">
        <Button variant="primary" size="sm" type="button" onClick={() => toast.success("Preferences saved")}>
          Save
        </Button>
      </div>
    </>
  );
}
