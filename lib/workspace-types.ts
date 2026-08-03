export type PortalRole = "merchant" | "partner" | "internal";

export type ProductType = "pg" | "mca";

export const ALL_BUSINESSES_ID = "__all__" as const;
export type ActiveBusinessId = string | typeof ALL_BUSINESSES_ID;

export type BusinessAccount = {
  id: string;
  mid: string;
  businessName: string;
  products: ProductType[];
  status: "active" | "inactive";
};

export type Business = {
  id: string;
  name: string;
  primaryAccount: BusinessAccount;
};

export type MerchantGroup = {
  id: string;
  name: string;
  businesses: Business[];
};

export type WorkspaceUser = {
  name: string;
  email: string;
  role: PortalRole;
  allowedBusinessIds: string[];
};

export type ProductTab = "home" | "pg" | "mca" | "partner";

export type WorkspaceContextValue = {
  user: WorkspaceUser;
  group: MerchantGroup;
  accessibleBusinesses: Business[];
  activeBusinessId: ActiveBusinessId;
  activeBusiness: Business | null;
  setActiveBusiness: (id: ActiveBusinessId) => void;
  setRole: (role: PortalRole) => void;
  activeProductTab: ProductTab;
  setActiveProductTab: (tab: ProductTab) => void;
};

export function portalRoleLabel(role: PortalRole): string {
  if (role === "internal") return "PayGlocal Staff";
  if (role === "partner") return "Partner";
  return "Merchant";
}
