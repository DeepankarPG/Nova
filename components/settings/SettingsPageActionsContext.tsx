"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

export interface SettingsPageActions {
  isDirty: boolean;
  isSaving?: boolean;
  onSave: () => void | Promise<void>;
  onCancel: () => void;
}

export interface SettingsPageActionsCtx {
  setActions: (a: SettingsPageActions | null) => void;
}

export const SettingsPageActionsContext = createContext<SettingsPageActionsCtx | null>(null);

/**
 * Provides the context for the mobile settings bottom action bar.
 * Rendered once inside SettingsDetailShell; exposes snapshot for bar rendering.
 */
export function useSettingsPageActionsProvider() {
  const [snapshot, setSnapshot] = useState<SettingsPageActions | null>(null);
  const setActions = useCallback((a: SettingsPageActions | null) => setSnapshot(a), []);
  const ctxValue = useMemo<SettingsPageActionsCtx>(() => ({ setActions }), [setActions]);
  return { snapshot, ctxValue };
}

/**
 * Call in any settings page to wire save / cancel / dirty state into the mobile
 * bottom bar. On desktop (no context) this is a no-op.
 */
export function useSettingsPageActions({
  isDirty,
  isSaving = false,
  onSave,
  onCancel,
}: {
  isDirty: boolean;
  isSaving?: boolean;
  onSave: () => void | Promise<void>;
  onCancel: () => void;
}) {
  const ctx = useContext(SettingsPageActionsContext);

  // Keep handlers in a ref so the effect deps don't include function identity.
  const handlersRef = useRef({ onSave, onCancel });
  handlersRef.current = { onSave, onCancel };

  useEffect(() => {
    if (!ctx) return;
    ctx.setActions({
      isDirty,
      isSaving,
      onSave: () => handlersRef.current.onSave(),
      onCancel: () => handlersRef.current.onCancel(),
    });
  }, [ctx, isDirty, isSaving]);

  // Clear registration when the page unmounts.
  useEffect(() => () => { ctx?.setActions(null); }, [ctx]);
}
