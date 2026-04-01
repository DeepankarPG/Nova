import { DesignDocsSidebar } from "@/components/design-system/DesignDocsSidebar";
import { DesignDocsTopBar } from "@/components/design-system/DesignDocsTopBar";
import { DesignDocsToc } from "@/components/design-system/DesignDocsToc";

export default function DesignDocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground lg:flex-row">
      <DesignDocsSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DesignDocsTopBar />
        <div className="flex min-w-0 flex-1">
          <main className="mx-auto w-full min-w-0 max-w-3xl flex-1 px-4 py-8 lg:max-w-[52rem] xl:max-w-[min(56rem,calc(100vw-14rem-13.5rem))] lg:px-8">
            {children}
          </main>
          <DesignDocsToc />
        </div>
      </div>
    </div>
  );
}
