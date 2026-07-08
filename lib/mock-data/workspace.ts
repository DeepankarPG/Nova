import type { MerchantGroup, WorkspaceUser } from "@/lib/workspace-types";
import { dashboardStats } from "@/lib/mock-data";

export const mockMerchantGroups: MerchantGroup[] = [
  {
    id: "swiggy",
    name: "Swiggy",
    businesses: [
      {
        id: "instamart",
        name: "Instamart",
        primaryAccount: {
          id: "mid-ins-001",
          mid: "MID-SWIG-INS-001",
          businessName: "Instamart",
          products: ["pg", "mca"],
          status: "active",
        },
      },
      {
        id: "dineout",
        name: "Dineout",
        primaryAccount: {
          id: "mid-din-002",
          mid: "MID-SWIG-DIN-002",
          businessName: "Dineout",
          products: ["mca"],
          status: "active",
        },
      },
      {
        id: "genie",
        name: "Genie",
        primaryAccount: {
          id: "mid-gen-003",
          mid: "MID-SWIG-GEN-003",
          businessName: "Genie",
          products: ["pg"],
          status: "active",
        },
      },
    ],
  },
];

export const mockExecUser: WorkspaceUser = {
  name: "Deepankar Raj",
  email: "deepankar.raj@payglocal.in",
  role: "merchant",
  allowedBusinessIds: [],
};

export const mockScopedUser: WorkspaceUser = {
  name: "Arjun Mehta",
  email: "arjun.m@swiggy.in",
  role: "merchant",
  allowedBusinessIds: ["instamart"],
};

export const mockInternalUser: WorkspaceUser = {
  name: "PG Staff",
  email: "staff@payglocal.in",
  role: "internal",
  allowedBusinessIds: [],
};

export const mockPartnerUser: WorkspaceUser = {
  name: "Partner Admin",
  email: "admin@partnerco.in",
  role: "partner",
  allowedBusinessIds: [],
};

export function aggregateDashboardStats(businessCount: number) {
  const s = businessCount > 1 ? businessCount : 1;
  return {
    successfulPayments: {
      value: dashboardStats.successfulPayments.value * s,
      currency: "INR" as const,
      count: dashboardStats.successfulPayments.count * s,
      change: dashboardStats.successfulPayments.change,
    },
    settlementsDue: {
      value: dashboardStats.settlementsDue.value * s,
      currency: "INR" as const,
      count: dashboardStats.settlementsDue.count * s,
      change: dashboardStats.settlementsDue.change,
    },
    fundsOnHold: {
      value: dashboardStats.fundsOnHold.value * s,
      currency: "INR" as const,
      count: dashboardStats.fundsOnHold.count * s,
      change: dashboardStats.fundsOnHold.change,
    },
    openDisputes: {
      value: dashboardStats.openDisputes.value * s,
      currency: "INR" as const,
      count: dashboardStats.openDisputes.count * s,
      change: dashboardStats.openDisputes.change,
    },
  };
}
