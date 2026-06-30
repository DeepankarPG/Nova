"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

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

interface WorkspaceCtx {
  mids: MidRecord[];
  selectedMid: MidRecord;
  productView: ProductView;
  setMid: (id: string) => void;
  setProductView: (view: ProductView) => void;
}

const Ctx = createContext<WorkspaceCtx | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
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
    <Ctx.Provider value={{ mids: MOCK_MIDS, selectedMid, productView, setMid, setProductView }}>
      {children}
    </Ctx.Provider>
  );
}

export function useWorkspace(): WorkspaceCtx {
  const ctx = useContext(Ctx);
  return ctx ?? {
    mids: MOCK_MIDS,
    selectedMid: MOCK_MIDS[0],
    productView: "all",
    setMid: () => {},
    setProductView: () => {},
  };
}
