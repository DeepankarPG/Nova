/**
 * Service stubs — all return hardcoded mock data with a simulated delay.
 * To connect to a real backend, replace the Promise.resolve() with fetch() calls.
 */

import * as mockData from "../mock-data";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function getDashboardStats() {
  await delay(1200);
  return mockData.dashboardStats;
}

export async function getCountryInsights() {
  await delay(1400);
  return mockData.countryInsights;
}

export async function getMonthlyVolume() {
  await delay(1100);
  return mockData.monthlyVolume;
}

export async function getRecentTransactions() {
  await delay(1300);
  return mockData.recentTransactions;
}

export async function getRecentSettlements() {
  await delay(1300);
  return mockData.recentSettlements;
}

export async function getAllTransactions() {
  await delay(1200);
  return mockData.allTransactions;
}

export async function getAllSettlements() {
  await delay(1200);
  return mockData.allSettlements;
}

export async function getDisputes() {
  await delay(1100);
  return mockData.disputes;
}

export async function getPaymentProducts() {
  await delay(1000);
  return mockData.paymentProducts;
}

export async function getWithdrawals() {
  await delay(1100);
  return mockData.withdrawals;
}

export async function getInvoices() {
  await delay(1000);
  return mockData.invoices;
}

export async function getEbrcEntries() {
  await delay(1100);
  return mockData.ebrcEntries;
}

export async function getClients() {
  await delay(1000);
  return mockData.clients;
}
