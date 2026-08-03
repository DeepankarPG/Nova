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

/* ── Mobile MID switcher — used by the /m and /p mobile screens ─────────── */
export type ProductKey = "pg" | "mca";
export type ProductView = "all" | "pg" | "mca";

export interface MidRecord {
  id: string;
  name: string;
  /** Last 4 digits of the MID, displayed as ···XXXX */
  maskedId: string;
  products: ProductKey[];
}

export const MOCK_MIDS: MidRecord[] = [
  { id: "mid-1", name: "SwiftPay Pvt Ltd", maskedId: "4582", products: ["pg", "mca"] },
  { id: "mid-2", name: "Acme Foods",        maskedId: "9831", products: ["pg"]        },
  { id: "mid-3", name: "Global Exports",    maskedId: "4472", products: ["mca"]       },
];

function resolveView(view: ProductView, products: ProductKey[]): ProductView {
  const hasPg  = products.includes("pg");
  const hasMca = products.includes("mca");
  if (hasPg && hasMca) return view;
  if (hasPg)  return "pg";
  return "mca";
}

/* ── Combined context value — desktop business-group model + mobile MID model ── */
type CombinedWorkspaceCtx = WorkspaceContextValue & {
  mids: MidRecord[];
  selectedMid: MidRecord;
  productView: ProductView;
  setMid: (id: string) => void;
  setProductView: (view: ProductView) => void;
};

const Ctx = createContext<CombinedWorkspaceCtx | null>(null);

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

const FALLBACK_USER: WorkspaceUser = mockExecUser;
const FALLBACK_GROUP: MerchantGroup = mockMerchantGroups[0]!;

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  /* ── Desktop: business-group model ── */
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

  const [activeProductTab, setActiveProductTabState] = useState<ProductTab>("home");

  const setActiveBusiness = useCallback((id: ActiveBusinessId) => {
    saveSession(id);
    setActiveBusinessIdState(id);
    setActiveProductTabState("home");
  }, []);

  // Auto-select home tab when switching business
  useEffect(() => {
    setActiveProductTabState("home");
  }, [activeBusinessId]);

  const setActiveProductTab = useCallback((tab: ProductTab) => {
    setActiveProductTabState(tab);
  }, []);

  /* ── Mobile: MID switcher model ── */
  const [selectedMidId, setSelectedMidId] = useState<string>(MOCK_MIDS[0].id);
  const [productView,   setProductViewRaw] = useState<ProductView>("all");

  const selectedMid = MOCK_MIDS.find(m => m.id === selectedMidId) ?? MOCK_MIDS[0];

  const setMid = useCallback((id: string) => {
    const next = MOCK_MIDS.find(m => m.id === id);
    if (!next) return;
    setSelectedMidId(id);
    setProductViewRaw(prev => resolveView(prev, next.products));
  }, []);

  const setProductView = useCallback((view: ProductView) => {
    const mid = MOCK_MIDS.find(m => m.id === selectedMidId) ?? MOCK_MIDS[0];
    setProductViewRaw(resolveView(view, mid.products));
  }, [selectedMidId]);

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
        mids: MOCK_MIDS,
        selectedMid,
        productView,
        setMid,
        setProductView,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useWorkspace(): CombinedWorkspaceCtx {
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
      mids: MOCK_MIDS,
      selectedMid: MOCK_MIDS[0],
      productView: "all",
      setMid: () => {},
      setProductView: () => {},
    }
  );
}
