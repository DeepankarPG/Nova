import type { Metadata } from "next";
import { CodeBlock } from "@/components/design-system/CodeBlock";

export const metadata: Metadata = {
  title: "Overlays & menus — Atlas",
  description: "Select, tabs, tooltip, popover, dropdown menu, scroll area, avatar, and Sonner toasts.",
};

const SELECT_IMPORT = `import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";`;

const SELECT_USAGE = `<Select defaultValue="a">
  <SelectTrigger className="w-[200px]">
    <SelectValue placeholder="Pick one" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="a">Option A</SelectItem>
    <SelectItem value="b">Option B</SelectItem>
  </SelectContent>
</Select>`;

const TABS_IMPORT = `import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";`;

const TOOLTIP_IMPORT = `import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";`;

const TOOLTIP_NOTE =
  "Wrap the relevant subtree (or the app) with TooltipProvider so tooltips can open.";

const SONNER_IMPORT = `import { Toaster, toast } from "@/components/ui/sonner";`;

const SONNER_USAGE = `// Root layout (once)
<Toaster />

// Any client component
toast.success("Saved");`;

export default function DesignOverlaysPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Overlays &amp; menus</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          Radix-based floating UI and Sonner toasts, aligned with portal tokens (
          <code className="rounded bg-muted px-1 font-mono text-xs">bg-popover</code>,{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">border-border</code>). Import from{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">@/components/ui/*</code> or{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">@payglocal/ui</code>.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Select</h2>
        <CodeBlock code={SELECT_IMPORT} />
        <CodeBlock code={SELECT_USAGE} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Tabs</h2>
        <CodeBlock code={TABS_IMPORT} />
        <CodeBlock
          code={`<Tabs defaultValue="one">
  <TabsList>
    <TabsTrigger value="one">One</TabsTrigger>
    <TabsTrigger value="two">Two</TabsTrigger>
  </TabsList>
  <TabsContent value="one">First panel</TabsContent>
  <TabsContent value="two">Second panel</TabsContent>
</Tabs>`}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Tooltip</h2>
        <p className="text-xs text-muted-foreground">{TOOLTIP_NOTE}</p>
        <CodeBlock code={TOOLTIP_IMPORT} />
        <CodeBlock
          code={`<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <button type="button" className="text-sm underline-offset-4">
        Hover me
      </button>
    </TooltipTrigger>
    <TooltipContent>Hint text</TooltipContent>
  </Tooltip>
</TooltipProvider>`}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Popover</h2>
        <CodeBlock code={`import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";`} />
        <CodeBlock
          code={`<Popover>
  <PopoverTrigger asChild>
    <button type="button" className="text-sm">Open</button>
  </PopoverTrigger>
  <PopoverContent>Panel content</PopoverContent>
</Popover>`}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Dropdown menu</h2>
        <CodeBlock
          code={`import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";`}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Scroll area</h2>
        <CodeBlock code={`import { ScrollArea } from "@/components/ui/scroll-area";`} />
        <CodeBlock code={`<ScrollArea className="h-48 rounded-lg border border-border p-3">…</ScrollArea>`} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Avatar</h2>
        <CodeBlock code={`import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";`} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Toaster (Sonner)</h2>
        <CodeBlock code={SONNER_IMPORT} />
        <CodeBlock code={SONNER_USAGE} />
      </section>
    </div>
  );
}
