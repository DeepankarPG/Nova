import type { Metadata } from "next";
import { PrimitiveDocLayout } from "@/components/design-system/PrimitiveDocLayout";

export const metadata: Metadata = {
  title: "Date picker — PayGlocal UI",
  description: "Calendar popover for choosing a single date.",
};

const IMPORT = `import { DatePicker } from "@/components/ui/date-picker";`;

const USAGE = `"use client";

const [date, setDate] = useState("");

<DatePicker
  label="Settlement date"
  value={date}
  onChange={setDate}
  placeholder="Select date"
/>`;

export default function DesignDatePickerPage() {
  return (
    <PrimitiveDocLayout
      title="Date picker"
      description="Client component with month navigation, min date support, and portal-rendered panel. Wrap usage in a client boundary."
      importSnippet={IMPORT}
      usageSnippet={USAGE}
    />
  );
}
