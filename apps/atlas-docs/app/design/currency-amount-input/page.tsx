import type { Metadata } from "next";
import { PrimitiveDocLayout } from "@/components/design-system/PrimitiveDocLayout";

export const metadata: Metadata = {
  title: "Currency amount input — PayGlocal UI",
  description: "Amount field with currency selector.",
};

const IMPORT = `import { CurrencyAmountInput } from "@/components/ui/currency-amount-input";`;

const USAGE = `"use client";

<CurrencyAmountInput
  currency={currency}
  amount={amount}
  onCurrencyChange={setCurrency}
  onAmountChange={setAmount}
  placeholder="0.00"
/>`;

export default function DesignCurrencyAmountInputPage() {
  return (
    <PrimitiveDocLayout
      title="Currency amount input"
      description="Paired currency dropdown and text input for money fields. Client-only; keep state in the parent."
      importSnippet={IMPORT}
      usageSnippet={USAGE}
    />
  );
}
