import { EchoFullPage } from "@/components/echo/EchoFullPage";

export const metadata = { title: "Echo — PayGlocal" };

export default function EchoPage() {
  /**
   * Negative margins cancel the p-4/p-6 added by the shared dashboard content wrapper,
   * letting EchoFullPage fill the full available height and handle its own padding/scrolling.
   */
  return (
    <div className="-m-4 md:-m-6 flex min-h-0 flex-1 flex-col overflow-hidden">
      <EchoFullPage />
    </div>
  );
}
