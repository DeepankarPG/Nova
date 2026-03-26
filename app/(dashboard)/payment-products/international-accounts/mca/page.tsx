import { redirect } from "next/navigation";
import { clientReceivingLocations } from "@/lib/mock-data";

export default function McaIndexPage() {
  const id = clientReceivingLocations[0]?.id ?? "usa";
  redirect(`/payment-products/international-accounts/mca/${id}`);
}
