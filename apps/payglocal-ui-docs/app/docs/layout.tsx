import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { DocsTopBar } from "@/components/docs/DocsTopBar";
import { DocsToc } from "@/components/docs/DocsToc";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground lg:flex-row">
      <DocsSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DocsTopBar />
        <div className="flex min-w-0 flex-1">
          <main className="mx-auto w-full min-w-0 max-w-3xl flex-1 px-4 py-8 lg:max-w-[52rem] xl:max-w-[min(56rem,calc(100vw-15.5rem-13.5rem))] lg:px-8">
            {children}
          </main>
          <DocsToc />
        </div>
      </div>
    </div>
  );
}
