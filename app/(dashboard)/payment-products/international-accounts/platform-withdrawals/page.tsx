import { redirect } from "next/navigation";
import { platformPayoutGuides } from "@/lib/mock-data";

export default function PlatformWithdrawalsIndexPage() {
  const id = platformPayoutGuides[0]?.id ?? "amazon";
  redirect(`/payment-products/international-accounts/platform-withdrawals/${id}`);
}
