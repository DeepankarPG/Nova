import { CollectionsModuleTabs } from "@/components/collections/CollectionsModuleTabs";

export default function InternationalAccountsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-[1400px] mx-auto page-enter pb-10 px-0">
      <CollectionsModuleTabs />
      {children}
    </div>
  );
}
