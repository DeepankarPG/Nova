import type { PaymentPageCustomField } from "@/lib/payment-page-form-types";

export type ButtonThemeId = "brand_color" | "dark" | "light" | "outline";

export const buttonThemeOptions: { id: ButtonThemeId; label: string }[] = [
  { id: "brand_color", label: "Brand Color" },
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
  { id: "outline", label: "Outline" },
];

export type ButtonTypeId = "custom" | "quick_pay" | "donation" | "buy_now";

export const buttonTypeOptions: { id: ButtonTypeId; label: string }[] = [
  { id: "custom", label: "Custom Button" },
  { id: "quick_pay", label: "Quick-Pay Button" },
  { id: "donation", label: "Donations Button" },
  { id: "buy_now", label: "Buy Now Button" },
];

export type ButtonCornerRadius = "sharp" | "rounded" | "pill";

export const buttonCornerRadiusOptions: { id: ButtonCornerRadius; label: string }[] = [
  { id: "sharp", label: "Sharp" },
  { id: "rounded", label: "Rounded" },
  { id: "pill", label: "Pill" },
];

export type ButtonSize = "small" | "medium" | "large";

export const buttonSizeOptions: { id: ButtonSize; label: string }[] = [
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium" },
  { id: "large", label: "Large" },
];

export type PaymentButtonFormState = {
  title: string; // internal, dashboard-only label
  buttonLabel: string; // customer-facing label on the button itself
  buttonType: ButtonTypeId;
  theme: ButtonThemeId;
  brandColor: string;
  cornerRadius: ButtonCornerRadius;
  size: ButtonSize;

  // Optional - if left blank, the customer enters the amount on the checkout page.
  fixedAmount: string;
  currency: string;

  nameFieldEnabled: boolean;
  addressFieldEnabled: boolean;
  emailFieldEnabled: boolean;
  phoneFieldEnabled: boolean;

  contactUsEnabled: boolean;
  supportEmail: string;
  supportPhone: string;
  supportPhoneCountry: string;
  supportWebsite: string;

  customFields: PaymentPageCustomField[];
};

export function isPaymentButtonReadyToPublish(form: PaymentButtonFormState): boolean {
  return form.buttonLabel.trim().length > 0;
}

/** Builds the embeddable <script> snippet, including which customer fields this button collects. */
export function buildButtonEmbedCode(form: PaymentButtonFormState, buttonId: string): string {
  const collect = [
    form.nameFieldEnabled && "name",
    form.addressFieldEnabled && "address",
    form.emailFieldEnabled && "email",
    form.phoneFieldEnabled && "phone",
  ].filter(Boolean) as string[];

  const attrs = [`  src="https://checkout.payglocal.in/v1/payment-button.js"`, `  data-payment_button_id="${buttonId}"`];

  if (form.fixedAmount) {
    attrs.push(`  data-amount="${form.fixedAmount}"`, `  data-currency="${form.currency}"`);
  }
  if (collect.length > 0) {
    attrs.push(`  data-collect-fields="${collect.join(",")}"`);
  }
  if (form.customFields.length > 0) {
    const customFieldNames = form.customFields.map((f) => f.label || "field").join(",");
    attrs.push(`  data-custom-fields="${customFieldNames}"`);
  }

  return `<form>\n<script async\n${attrs.join("\n")}\n></script>\n</form>`;
}
