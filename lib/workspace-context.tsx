"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  WorkspaceContextValue,
  WorkspaceUser,
  MerchantGroup,
  ActiveBusinessId,
  PortalRole,
  ProductTab,
} from "./workspace-types";
import { ALL_BUSINESSES_ID } from "./workspace-types";
import { mockExecUser, mockMerchantGroups } from "./mock-data/workspace";

const SESSION_KEY = "payglocal-workspace-v1";
const ROLE_KEY = "payglocal-workspace-role";

function loadSession(): ActiveBusinessId | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(SESSION_KEY) as ActiveBusinessId | null;
  } catch {
    return null;
  }
}

function saveSession(id: ActiveBusinessId) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_KEY, id);
  } catch {}
}

function loadRole(): PortalRole | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(ROLE_KEY) as PortalRole | null;
  } catch {
    return null;
  }
}

function saveRole(role: PortalRole) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(ROLE_KEY, role);
  } catch {}
}

const Ctx = createContext<WorkspaceContextValue | null>(null);

const FALLBACK_USER: WorkspaceUser = mockExecUser;
const FALLBACK_GROUP: MerchantGroup = mockMerchantGroups[0]!;

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const baseUser: WorkspaceUser = mockExecUser;
  const group: MerchantGroup = mockMerchantGroups[0]!;

  const [role, setRoleState] = useState<PortalRole>(baseUser.role);

  const user: WorkspaceUser = useMemo(
    () => ({ ...baseUser, role }),
    [role, baseUser.name]
  );

  useEffect(() => {
    const stored = loadRole();
    if (stored) setRoleState(stored);
  }, []);

  const setRole = useCallback((r: PortalRole) => {
    saveRole(r);
    setRoleState(r);
  }, []);

  const accessibleBusinesses = useMemo(() => {
    if (user.allowedBusinessIds.length === 0) return group.businesses;
    return group.businesses.filter((b) =>
      user.allowedBusinessIds.includes(b.id)
    );
  }, [user.allowedBusinessIds, group.businesses]);

  const defaultBusinessId: ActiveBusinessId =
    accessibleBusinesses.length === 1
      ? accessibleBusinesses[0]!.id
      : ALL_BUSINESSES_ID;

  const [activeBusinessId, setActiveBusinessIdState] =
    useState<ActiveBusinessId>(defaultBusinessId);

  useEffect(() => {
    const stored = loadSession();
    if (!stored) return;
    if (stored === ALL_BUSINESSES_ID) {
      if (accessibleBusinesses.length > 1) setActiveBusinessIdState(ALL_BUSINESSES_ID);
      return;
    }
    const match = accessibleBusinesses.find((b) => b.id === stored);
    if (match) setActiveBusinessIdState(match.id);
  }, []);

  const activeBusiness = useMemo(() => {
    if (activeBusinessId === ALL_BUSINESSES_ID) return null;
    return accessibleBusinesses.find((b) => b.id === activeBusinessId) ?? null;
  }, [activeBusinessId, accessibleBusinesses]);

  const setActiveBusiness = useCallback((id: ActiveBusinessId) => {
    saveSession(id);
    setActiveBusinessIdState(id);
    setActiveProductTabState("home");
  }, []);

  const [activeProductTab, setActiveProductTabState] = useState<ProductTab>("home");

  // Auto-select home tab when switching business
  useEffect(() => {
    setActiveProductTabState("home");
  }, [activeBusinessId]);

  const setActiveProductTab = useCallback((tab: ProductTab) => {
    setActiveProductTabState(tab);
  }, []);

  return (
    <Ctx.Provider
      value={{
        user,
        group,
        accessibleBusinesses,
        activeBusinessId,
        activeBusiness,
        setActiveBusiness,
        setRole,
        activeProductTab,
        setActiveProductTab,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useWorkspace(): WorkspaceContextValue {
  return (
    useContext(Ctx) ?? {
      user: FALLBACK_USER,
      group: FALLBACK_GROUP,
      accessibleBusinesses: FALLBACK_GROUP.businesses,
      activeBusinessId: ALL_BUSINESSES_ID,
      activeBusiness: null,
      setActiveBusiness: () => {},
      setRole: () => {},
      activeProductTab: "home",
      setActiveProductTab: () => {},
    }
  );
}
