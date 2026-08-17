// Whether this merchant has opted into the payment products that let a
// Payment Link actually be paid online (cards or international gateways).
// This is page-local mock state, not a shared store: no other settings page
// in this app persists its toggles anywhere either (see /settings/payments).
export type MerchantProductsEnabled = {
  cardsEnabled: boolean;
  internationalGatewaysEnabled: boolean;
};

export const merchantProductsEnabledSeed: MerchantProductsEnabled = {
  cardsEnabled: false,
  internationalGatewaysEnabled: false,
};

export function canUsePaymentLink(products: MerchantProductsEnabled): boolean {
  return products.cardsEnabled || products.internationalGatewaysEnabled;
}
