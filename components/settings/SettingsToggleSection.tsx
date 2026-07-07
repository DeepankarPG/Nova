"use client";

import { useState } from "react";
import { SettingsFieldRow } from "@/components/settings/SettingsFieldRow";
import { SettingsToggle } from "@/components/settings/SettingsToggle";

export function SettingsToggleSection({
  items,
  onAnyChange,
}: {
  items: { label: string; description: string; on: boolean }[];
  onAnyChange?: () => void;
}) {
  const [states, setStates] = useState(() => items.map((i) => i.on));
  const toggle = (i: number) => {
    setStates((s) => s.map((v, j) => (j === i ? !v : v)));
    onAnyChange?.();
  };

  return (
    <>
      {items.map((item, i) => (
        <SettingsFieldRow key={item.label} label={item.label} description={item.description}>
          <div className="flex justify-end @md:justify-start">
            <SettingsToggle on={states[i]} onChange={() => toggle(i)} />
          </div>
        </SettingsFieldRow>
      ))}
    </>
  );
}
