export type AmountType = "fixed" | "customer_decides";

export type CustomFieldInputType =
  | "single_line_text"
  | "alphabets"
  | "alphanumeric"
  | "number"
  | "email"
  | "phone";

export type PaymentPageCustomField = {
  id: string;
  label: string;
  inputType: CustomFieldInputType;
  optional: boolean;
  hasDefaultValue: boolean;
  defaultValue: string;
};

export type PaymentPageProduct = {
  id: string;
  name: string;
  description: string; // lightweight markdown-ish: **bold**, _italic_, lines starting with "- " for bullets
  imageUrl: string | null;
};

export type PaymentPageFormState = {
  businessName: string;
  product: PaymentPageProduct | null;

  amountType: AmountType;
  fixedAmount: string; // "" when unset
  minAmount: string; // only used when amountType === "customer_decides"

  emailFieldEnabled: boolean;
  emailFieldRequired: boolean;
  phoneFieldEnabled: boolean;
  phoneFieldRequired: boolean;
  billingAddressEnabled: boolean;
  customFields: PaymentPageCustomField[];

  contactUsEnabled: boolean;
  supportEmail: string;
  supportPhone: string;
  supportPhoneCountry: string; // e.g. "+91 (IN)"
  supportWebsite: string;

  currency: string;
  brandColor: string;
};

export function isAmountConfigured(form: PaymentPageFormState): boolean {
  if (form.amountType === "fixed") return Number(form.fixedAmount) > 0;
  return true;
}

export function isPaymentPageReadyToPublish(form: PaymentPageFormState): boolean {
  return !!form.product && form.product.name.trim().length > 0 && isAmountConfigured(form);
}
