import type { TocItem } from "@/lib/docs-toc";

export type ComponentDocPage = {
  slug: string;
  title: string;
  description: string;
  importSnippet: string;
  usageSnippet: string;
  toc: TocItem[];
};

const baseToc: TocItem[] = [
  { id: "preview", label: "Preview" },
  { id: "installation", label: "Installation" },
  { id: "usage", label: "Usage" },
];

export const COMPONENT_DOC_PAGES: ComponentDocPage[] = [
  {
    slug: "avatar",
    title: "Avatar",
    description: "Image with fallback for users and entities (Radix Avatar).",
    importSnippet: `import { Avatar, AvatarFallback, AvatarImage } from "@payglocal/ui";`,
    usageSnippet: `<Avatar>
  <AvatarImage src="/photo.png" alt="User" />
  <AvatarFallback>PG</AvatarFallback>
</Avatar>`,
    toc: baseToc,
  },
  {
    slug: "button",
    title: "Button",
    description: "Actions and form submission with variants, sizes, loading, and icons.",
    importSnippet: `import { Button } from "@payglocal/ui";`,
    usageSnippet: `<Button variant="primary">Continue</Button>
<Button variant="outline" isLoading>Save</Button>`,
    toc: baseToc,
  },
  {
    slug: "calendar",
    title: "Calendar",
    description:
      "React DayPicker with PayGlocal tokens: single, range, dropdown captions, week numbers, presets, RTL, and timezone support.",
    importSnippet: `import { Calendar, type DateRange } from "@payglocal/ui";`,
    usageSnippet: `const [date, setDate] = useState<Date | undefined>();

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  captionLayout="dropdown"
  className="rounded-xl border border-border"
/>`,
    toc: baseToc,
  },
  {
    slug: "card",
    title: "Card",
    description: "Surface with header, title, description, content, and footer slots.",
    importSnippet: `import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@payglocal/ui";`,
    usageSnippet: `<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Supporting text.</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>`,
    toc: baseToc,
  },
  {
    slug: "chart",
    title: "Chart",
    description: "Recharts composition layer with ChartContainer, tooltips, and theme tokens.",
    importSnippet: `import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@payglocal/ui";
import { Bar, BarChart, XAxis } from "recharts";`,
    usageSnippet: `const config = {
  sales: { label: "Sales", color: "var(--chart-1)" },
} satisfies ChartConfig;

<ChartContainer config={config} className="h-48">
  <BarChart data={[{ m: "Jan", sales: 12 }]}>
    <XAxis dataKey="m" />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Bar dataKey="sales" fill="var(--color-chart-1)" radius={4} />
  </BarChart>
</ChartContainer>`,
    toc: baseToc,
  },
  {
    slug: "chart-templates",
    title: "Chart templates",
    description:
      "Dashboard-ready chart and KPI layouts built on Recharts: hero area, grouped bars, ranked lists, category bars, metric sparklines, and attention lists. Pass your data and copy the pattern.",
    importSnippet: `import {
  MetricSparklineCard,
  DashboardAreaChartTemplate,
  GroupedBarChartTemplate,
  RankedBarListTemplate,
  CategoryBarChartTemplate,
  MiniSparklineChartCard,
  AttentionListTemplate,
} from "@payglocal/ui";`,
    usageSnippet: `// Compose templates with your data; each component is a styled card + chart.
<DashboardAreaChartTemplate
  title="Gross volume"
  tabs={[{ id: "gross", label: "Gross volume" }]}
  activeTabId="gross"
  onTabChange={() => {}}
  headline="₹9,42,800"
  data={series}
  xKey="hour"
  areaKey="amount"
  compareLineKey="yesterday"
/>

<MetricSparklineCard
  title="Total volume"
  value="₹8,47,250"
  trend={{ direction: "up", label: "+8.4% vs last month" }}
  data={sparkPoints}
/>`,
    toc: baseToc,
  },
  {
    slug: "currency-amount-input",
    title: "Currency amount input",
    description: "Amount field with currency selector for payment-style flows.",
    importSnippet: `import { CurrencyAmountInput } from "@payglocal/ui";`,
    usageSnippet: `const [currency, setCurrency] = useState("USD");
const [amount, setAmount] = useState("");

<CurrencyAmountInput
  currency={currency}
  amount={amount}
  onCurrencyChange={setCurrency}
  onAmountChange={setAmount}
/>`,
    toc: baseToc,
  },
  {
    slug: "data-table",
    title: "Data table",
    description: "Column-driven table with pagination, loading skeleton, and empty state.",
    importSnippet: `import { DataTable, type Column } from "@payglocal/ui";`,
    usageSnippet: `const columns: Column<Row>[] = [
  { key: "name", header: "Name", render: (r) => r.name },
];

<DataTable rowKey={(r) => r.id} columns={columns} data={rows} />`,
    toc: baseToc,
  },
  {
    slug: "date-picker",
    title: "Date picker",
    description: "Single-date calendar popover with keyboard-friendly grid.",
    importSnippet: `import { DatePicker } from "@payglocal/ui";`,
    usageSnippet: `const [value, setValue] = useState("");

<DatePicker value={value} onChange={setValue} placeholder="Pick a date" />`,
    toc: baseToc,
  },
  {
    slug: "dialog",
    title: "Dialog",
    description: "Modal layer with overlay, focus management, and close control.",
    importSnippet: `import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@payglocal/ui";`,
    usageSnippet: `<Dialog>
  <DialogTrigger asChild>
    <button type="button">Open</button>
  </DialogTrigger>
  <DialogContent>
    <DialogTitle>Title</DialogTitle>
    <DialogDescription>Description</DialogDescription>
  </DialogContent>
</Dialog>`,
    toc: baseToc,
  },
  {
    slug: "dropdown-menu",
    title: "Dropdown menu",
    description: "Anchored menu for row actions, headers, and compact command lists.",
    importSnippet: `import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@payglocal/ui";`,
    usageSnippet: `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button type="button">Open</button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
    toc: baseToc,
  },
  {
    slug: "empty-state",
    title: "Empty state",
    description: "Centered empty panels with title, description, and optional action.",
    importSnippet: `import { EmptyState, Button } from "@payglocal/ui";`,
    usageSnippet: `<EmptyState
  title="No results"
  description="Try adjusting filters."
  action={<Button variant="outline" size="sm">Reset</Button>}
/>`,
    toc: baseToc,
  },
  {
    slug: "field",
    title: "Field",
    description: "Form layout primitives: Field, FieldLabel, FieldError, FieldGroup, FieldSet.",
    importSnippet: `import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldDescription,
  FieldError,
  Input,
} from "@payglocal/ui";`,
    usageSnippet: `<FieldGroup className="max-w-sm">
  <Field>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <FieldDescription>We will never share your email.</FieldDescription>
    <Input id="email" type="email" />
    <FieldError>Invalid email</FieldError>
  </Field>
</FieldGroup>`,
    toc: [...baseToc, { id: "related", label: "Related" }],
  },
  {
    slug: "input",
    title: "Input",
    description: "Text field, textarea, and label primitives for forms.",
    importSnippet: `import { Input, Textarea, Label } from "@payglocal/ui";`,
    usageSnippet: `<Label htmlFor="x">Name</Label>
<Input id="x" placeholder="Jane" />
<Textarea placeholder="Notes" rows={3} />`,
    toc: [
      { id: "preview", label: "Preview" },
      { id: "installation", label: "Installation" },
      { id: "usage", label: "Usage" },
    ],
  },
  {
    slug: "input-group",
    title: "Input group",
    description: "Addons, icons, and inline actions around inputs and textareas.",
    importSnippet: `import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@payglocal/ui";`,
    usageSnippet: `<InputGroup>
  <InputGroupAddon>https://</InputGroupAddon>
  <InputGroupInput placeholder="example.com" />
</InputGroup>`,
    toc: baseToc,
  },
  {
    slug: "layout-primitives",
    title: "Layout primitives",
    description:
      "Box, Stack, and Inline helpers with token-aligned spacing props (same Tailwind steps as the dashboard). Prefer Tailwind `className` for radii and colors.",
    importSnippet: `import { Box, Stack, Inline } from "@payglocal/ui";`,
    usageSnippet: `<Stack gap="lg">
  <Box p="md" className="rounded-xl border border-border">
    <Stack gap="sm">…</Stack>
  </Box>
  <Inline gap="md" justify="between">
    <span>Title</span>
    <Button size="sm" variant="outline">Action</Button>
  </Inline>
</Stack>`,
    toc: baseToc,
  },
  {
    slug: "page-header",
    title: "Page header",
    description: "List and detail page titles with optional actions slot.",
    importSnippet: `import { PageHeader, Button } from "@payglocal/ui";`,
    usageSnippet: `<PageHeader
  title="Transactions"
  subtitle="Recent transactions"
  actions={<Button size="sm">Export</Button>}
/>`,
    toc: baseToc,
  },
  {
    slug: "popover",
    title: "Popover",
    description: "Anchored floating panel for filters, pickers, and compact forms.",
    importSnippet: `import { Popover, PopoverContent, PopoverTrigger } from "@payglocal/ui";`,
    usageSnippet: `<Popover>
  <PopoverTrigger asChild>
    <button type="button">Open</button>
  </PopoverTrigger>
  <PopoverContent>Content</PopoverContent>
</Popover>`,
    toc: baseToc,
  },
  {
    slug: "scroll-area",
    title: "Scroll area",
    description: "Custom scrollbars for dense panels and sidebars.",
    importSnippet: `import { ScrollArea } from "@payglocal/ui";`,
    usageSnippet: `<ScrollArea className="h-48 rounded-xl border border-border p-3">
  …long content…
</ScrollArea>`,
    toc: baseToc,
  },
  {
    slug: "select",
    title: "Select",
    description: "Styled native-style select built on Radix Select.",
    importSnippet: `import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@payglocal/ui";`,
    usageSnippet: `<Select defaultValue="a">
  <SelectTrigger className="w-[200px]">
    <SelectValue placeholder="Choose" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="a">Option A</SelectItem>
    <SelectItem value="b">Option B</SelectItem>
  </SelectContent>
</Select>`,
    toc: baseToc,
  },
  {
    slug: "separator",
    title: "Separator",
    description: "Visual divider; also composed inside FieldSeparator.",
    importSnippet: `import { Separator } from "@payglocal/ui";`,
    usageSnippet: `<Separator className="my-4" />
<Separator orientation="vertical" className="mx-2 h-6" />`,
    toc: baseToc,
  },
  {
    slug: "skeleton",
    title: "Skeleton",
    description: "Shimmer placeholders for tables, charts, and stat cards.",
    importSnippet: `import { Shimmer, StatCardSkeleton, TableRowSkeleton } from "@payglocal/ui";`,
    usageSnippet: `<StatCardSkeleton />
<TableRowSkeleton cols={4} />`,
    toc: baseToc,
  },
  {
    slug: "sonner",
    title: "Sonner",
    description: "Themed toast host and toast() API (wraps sonner + next-themes).",
    importSnippet: `import { Toaster, toast } from "@payglocal/ui";`,
    usageSnippet: `// Root layout
<Toaster />

// Client
toast.success("Saved");`,
    toc: baseToc,
  },
  {
    slug: "status-badge",
    title: "Status badge",
    description: "Workflow states for payments, disputes, and settlements.",
    importSnippet: `import { StatusBadge } from "@payglocal/ui";`,
    usageSnippet: `<StatusBadge status="settled" />
<StatusBadge status="pending" />`,
    toc: baseToc,
  },
  {
    slug: "tabs",
    title: "Tabs",
    description: "Section switching without navigation (Radix Tabs).",
    importSnippet: `import { Tabs, TabsContent, TabsList, TabsTrigger } from "@payglocal/ui";`,
    usageSnippet: `<Tabs defaultValue="a">
  <TabsList>
    <TabsTrigger value="a">Tab A</TabsTrigger>
    <TabsTrigger value="b">Tab B</TabsTrigger>
  </TabsList>
  <TabsContent value="a">Panel A</TabsContent>
  <TabsContent value="b">Panel B</TabsContent>
</Tabs>`,
    toc: baseToc,
  },
  {
    slug: "tooltip",
    title: "Tooltip",
    description: "Hover and focus hints; wrap with TooltipProvider.",
    importSnippet: `import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@payglocal/ui";`,
    usageSnippet: `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <button type="button">Hover</button>
    </TooltipTrigger>
    <TooltipContent>Hint</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
    toc: baseToc,
  },
];

export const COMPONENT_BY_SLUG = Object.fromEntries(COMPONENT_DOC_PAGES.map((p) => [p.slug, p]));

export function getSortedComponentPages(): ComponentDocPage[] {
  return [...COMPONENT_DOC_PAGES].sort((a, b) => a.title.localeCompare(b.title));
}
