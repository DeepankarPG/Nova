/**
 * Business settings routes rely on the left settings sidebar (same pattern as Payments & platform).
 * No duplicate in-page header or tab bar — saves vertical space.
 */
export default function BusinessSettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
