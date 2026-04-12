"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  FileText,
} from "lucide-react";
import {
  AttentionListTemplate,
  Avatar,
  Box,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CategoryBarChartTemplate,
  CurrencyAmountInput,
  DashboardAreaChartTemplate,
  DataTable,
  type Column,
  DatePicker,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  EmptyState,
  GroupedBarChartTemplate,
  Inline,
  MetricSparklineCard,
  MiniSparklineChartCard,
  PageHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RankedBarListTemplate,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Stack,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  toast,
} from "@payglocal/ui";
import { ButtonPlayground } from "@/components/docs/playgrounds/ButtonPlayground";
import { CalendarPlayground } from "@/components/docs/playgrounds/CalendarPlayground";
import { CardPlayground } from "@/components/docs/playgrounds/CardPlayground";
import { ChartPlayground } from "@/components/docs/playgrounds/ChartPlayground";
import { DataTablePlayground } from "@/components/docs/playgrounds/DataTablePlayground";
import { DropdownMenuPlayground } from "@/components/docs/playgrounds/DropdownMenuPlayground";
import { FieldPlayground } from "@/components/docs/playgrounds/FieldPlayground";
import { InputGroupPlayground } from "@/components/docs/playgrounds/InputGroupPlayground";
import { InputPlayground } from "@/components/docs/playgrounds/InputPlayground";
import { ScrollAreaPlayground } from "@/components/docs/playgrounds/ScrollAreaPlayground";
import { SelectPlayground } from "@/components/docs/playgrounds/SelectPlayground";
import { SkeletonPlayground } from "@/components/docs/playgrounds/SkeletonPlayground";
import { StatusBadgePlayground } from "@/components/docs/playgrounds/StatusBadgePlayground";

type Row = { id: string; name: string };

const tableData: Row[] = [
  { id: "1", name: "Acme Corp" },
  { id: "2", name: "Globex" },
];

const tableColumns: Column<Row>[] = [
  { key: "name", header: "Merchant", render: (r) => r.name },
];

function ChartTemplatesDemo() {
  const [dashTab, setDashTab] = useState("gross");

  const areaData = [
    { t: "04:00", v: 320000, cmp: 280000 },
    { t: "08:00", v: 540000, cmp: 410000 },
    { t: "12:00", v: 720000, cmp: 650000 },
    { t: "16:00", v: 890000, cmp: 720000 },
    { t: "20:00", v: 620000, cmp: 580000 },
    { t: "22:00", v: 480000, cmp: 450000 },
  ];

  const grouped = [
    { m: "Sep", volume: 520000, settled: 410000 },
    { m: "Oct", volume: 610000, settled: 480000 },
    { m: "Nov", volume: 540000, settled: 500000 },
    { m: "Dec", volume: 720000, settled: 620000 },
    { m: "Jan", volume: 680000, settled: 590000 },
    { m: "Feb", volume: 750000, settled: 640000 },
    { m: "Mar", volume: 820000, settled: 700000 },
  ];

  const miniSpark = Array.from({ length: 12 }, (_, i) => ({
    x: i,
    y: 93 + Math.sin(i / 2.2) * 2.2,
    compare: 91 + Math.cos(i / 2.5) * 1.8,
  }));

  const metricSpark = Array.from({ length: 14 }, (_, i) => ({ x: i, y: 40 + i * 2 + (i % 3) * 4 }));

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricSparklineCard
          title="Total volume"
          icon={<BarChart3 />}
          value="₹8,47,250.00"
          trend={{ direction: "up", label: "+8.4% vs last month" }}
          data={metricSpark}
          accentColor="var(--chart-1)"
        />
        <MetricSparklineCard
          title="Success rate"
          icon={<CheckCircle2 />}
          value="94.20%"
          trend={{ direction: "up", label: "+1.2% vs last month" }}
          data={miniSpark.map((d) => ({ x: d.x, y: d.y }))}
          accentColor="var(--chart-4)"
        />
        <MetricSparklineCard
          title="Avg. ticket size"
          icon={<DollarSign />}
          value="₹2,475.00"
          trend={{ direction: "down", label: "−3.1% vs last month" }}
          data={metricSpark.map((d, i) => ({ x: d.x, y: 80 - i * 3 }))}
          accentColor="var(--chart-5)"
        />
        <MetricSparklineCard
          title="Failed"
          icon={<AlertCircle />}
          value="2"
          trend={{ direction: "down", label: "−50% vs last month" }}
          data={metricSpark.map((d, i) => ({ x: d.x, y: Math.max(2, 8 - i) }))}
          accentColor="var(--destructive)"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <DashboardAreaChartTemplate
          title="Gross volume"
          tabs={[
            { id: "gross", label: "Gross volume" },
            { id: "net", label: "Net volume" },
            { id: "pay", label: "No. of payments" },
          ]}
          activeTabId={dashTab}
          onTabChange={setDashTab}
          headline="₹9,42,800 INR"
          delta={
            <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="size-4 shrink-0" aria-hidden />
              +14.1% vs yesterday
            </span>
          }
          data={areaData}
          xKey="t"
          areaKey="v"
          compareLineKey="cmp"
          height={220}
          footer={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Upcoming settlement:{" "}
                <span className="font-semibold tabular-nums text-foreground">₹1,24,890</span>
              </p>
              <Button type="button" variant="outline" size="md" className="gap-1.5 self-start sm:self-auto">
                View settlement history
                <ExternalLink className="size-3.5 opacity-70" aria-hidden />
              </Button>
            </div>
          }
        />
        <div className="flex min-w-0 flex-col gap-4">
          <MiniSparklineChartCard
            title="Payment success rate"
            value="94.2%"
            accentColor="var(--chart-4)"
            data={miniSpark}
            stats={[
              { label: "Successful", value: "1,240", dotClassName: "bg-emerald-500" },
              { label: "Failed", value: "78", dotClassName: "bg-red-500" },
              { label: "Avg. value", value: "₹2,120" },
            ]}
          />
          <AttentionListTemplate
            title="Needs attention"
            items={[
              {
                id: "hold",
                title: "Funds on hold",
                value: "₹48,200",
                valueTone: "warning",
                meta: "12 transactions",
                actionLabel: "Take action",
              },
              {
                id: "disputes",
                title: "Open disputes",
                value: "3",
                valueTone: "danger",
                meta: "Due this week",
                actionLabel: "Take action",
              },
            ]}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GroupedBarChartTemplate
          title="Monthly volume"
          subtitle="Payment volume vs settlements"
          data={grouped}
          xKey="m"
          series={[
            { key: "volume", label: "Volume", color: "var(--chart-1)" },
            { key: "settled", label: "Settled", color: "var(--chart-2)" },
          ]}
          height={220}
        />
        <CategoryBarChartTemplate
          title="Settlement speed (T+N)"
          subtitle="% of volume by working-day lag"
          data={[
            { category: "T+0", value: 42 },
            { category: "T+1", value: 28 },
            { category: "T+2", value: 14 },
            { category: "T+3+", value: 8 },
          ]}
          height={220}
        />
      </div>

      <RankedBarListTemplate
        title="Country insights"
        subtitle="Share of volume"
        headerRight={
          <Select defaultValue="30d">
            <SelectTrigger className="h-8 w-[8.5rem] text-xs">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        }
        items={[
          { id: "in", label: "India", value: "₹4.1L", percent: 100, leading: <span className="text-xs">IN</span> },
          { id: "us", label: "United States", value: "₹3.1L", percent: 76, leading: <span className="text-xs">US</span> },
          { id: "gb", label: "United Kingdom", value: "₹1.8L", percent: 44, leading: <span className="text-xs">GB</span> },
          { id: "sg", label: "Singapore", value: "₹1.2L", percent: 29, leading: <span className="text-xs">SG</span> },
        ]}
      />
    </div>
  );
}

export function ComponentPreview({ slug }: { slug: string }) {
  const [date, setDate] = useState("");
  const [dateWithMin, setDateWithMin] = useState("");
  const [cur, setCur] = useState("USD");
  const [amt, setAmt] = useState("");
  const [currencyDisabled, setCurrencyDisabled] = useState(false);
  const [popoverSide, setPopoverSide] = useState<"top" | "right" | "bottom" | "left">("bottom");

  switch (slug) {
    case "avatar":
      return (
        <div className="flex flex-wrap items-center justify-center gap-5">
          <Avatar className="h-8 w-8 border border-border">
            <AvatarImage src="" alt="" />
            <AvatarFallback className="text-[10px] font-semibold">S</AvatarFallback>
          </Avatar>
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src="" alt="" />
            <AvatarFallback className="text-xs font-semibold">MD</AvatarFallback>
          </Avatar>
          <Avatar className="h-16 w-16 border-2 border-border shadow-sm">
            <AvatarImage src="" alt="" />
            <AvatarFallback className="text-lg font-semibold">PG</AvatarFallback>
          </Avatar>
        </div>
      );
    case "button":
      return <ButtonPlayground />;
    case "calendar":
      return <CalendarPlayground />;
    case "card":
      return <CardPlayground />;
    case "chart":
      return <ChartPlayground />;
    case "chart-templates":
      return <ChartTemplatesDemo />;
    case "currency-amount-input":
      return (
        <div className="mx-auto flex w-full max-w-md flex-col gap-4 self-center">
          <CurrencyAmountInput
            currency={cur}
            amount={amt}
            onCurrencyChange={setCur}
            onAmountChange={setAmt}
            disabled={currencyDisabled}
          />
          <Button type="button" size="md" variant="outline" className="self-start" onClick={() => setCurrencyDisabled((d) => !d)}>
            {currencyDisabled ? "Enable" : "Disable"} field
          </Button>
        </div>
      );
    case "data-table":
      return <DataTablePlayground />;
    case "date-picker":
      return (
        <Stack gap="lg" className="mx-auto w-full max-w-xs self-center text-left">
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Default</p>
            <DatePicker value={date} onChange={setDate} placeholder="Pick a date" />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">With min date</p>
            <DatePicker
              value={dateWithMin}
              onChange={setDateWithMin}
              placeholder="After today"
              min={new Date().toISOString().slice(0, 10)}
            />
          </div>
        </Stack>
      );
    case "dialog":
      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="lg"
              className="w-fit max-w-full shrink-0 self-center border-border shadow-sm hover:bg-muted/60"
            >
              Open dialog
            </Button>
          </DialogTrigger>
          <DialogContent className="space-y-3">
            <DialogTitle>Example dialog</DialogTitle>
            <DialogDescription className="text-[15px] leading-relaxed">
              This modal uses the same PayGlocal tokens as the merchant app. Close with the X or by clicking outside.
            </DialogDescription>
          </DialogContent>
        </Dialog>
      );
    case "dropdown-menu":
      return <DropdownMenuPlayground />;
    case "empty-state":
      return (
        <Stack gap="lg" className="w-full max-w-md">
          <EmptyState
            className="rounded-xl border border-dashed border-border bg-card py-12 shadow-sm"
            title="Nothing here yet"
            description="Create your first record to get started."
            action={
              <Button size="md" variant="primary">
                Create record
              </Button>
            }
          />
          <EmptyState
            className="rounded-xl border border-border bg-muted/20 py-10 shadow-sm"
            title="Title only"
            icon={FileText}
          />
        </Stack>
      );
    case "field":
      return <FieldPlayground />;
    case "input":
      return <InputPlayground />;
    case "input-group":
      return <InputGroupPlayground />;
    case "layout-primitives":
      return (
        <Stack gap="lg" className="w-full max-w-lg text-left">
          <p className="text-sm text-muted-foreground">
            Token-aligned spacing props map to the same Tailwind steps used on dashboard pages (typically <code className="rounded bg-muted px-1 font-mono text-xs">gap-3</code> /{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">gap-4</code>).
          </p>
          <Box p="md" className="rounded-xl border border-border bg-card shadow-sm">
            <Stack gap="sm">
              <span className="text-sm font-medium text-foreground">Stack (vertical)</span>
              <span className="text-xs text-muted-foreground">gap=&quot;sm&quot; inside padded Box</span>
            </Stack>
          </Box>
          <Box p="sm" className="rounded-xl border border-dashed border-border bg-muted/15">
            <Stack gap="xs">
              <span className="text-xs font-medium text-muted-foreground">Nested Stack gap=&quot;xs&quot;</span>
              <span className="text-xs text-muted-foreground">Tighter vertical rhythm for dense UI.</span>
            </Stack>
          </Box>
          <Inline gap="md" justify="between" className="w-full rounded-xl border border-border bg-card px-4 py-3">
            <span className="text-sm font-medium">Inline</span>
            <Button size="md" variant="outline">
              Action
            </Button>
          </Inline>
          <Inline gap="sm" justify="end" className="w-full rounded-xl border border-border bg-card px-4 py-2">
            <Button size="md" variant="ghost">
              Cancel
            </Button>
            <Button size="md" variant="primary">
              Save
            </Button>
          </Inline>
        </Stack>
      );
    case "page-header":
      return (
        <Stack gap="lg" className="w-full">
          <PageHeader
            className="mb-0 w-full"
            title="Page title"
            subtitle="Subtitle for this view."
            actions={
              <>
                <Button size="md" variant="outline">
                  Export
                </Button>
                <Button size="md" variant="primary">
                  Primary action
                </Button>
              </>
            }
          />
          <PageHeader className="mb-0 w-full border-t border-border pt-6" title="Title only" subtitle="No action row — copy-led header." />
        </Stack>
      );
    case "popover":
      return (
        <div className="flex w-full max-w-md flex-col items-center gap-4 self-center">
          <div className="flex flex-wrap justify-center gap-2">
            {(["top", "right", "bottom", "left"] as const).map((s) => (
              <Button
                key={s}
                type="button"
                size="sm"
                variant={popoverSide === s ? "primary" : "outline"}
                onClick={() => setPopoverSide(s)}
              >
                {s}
              </Button>
            ))}
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="lg" className="w-fit max-w-full shrink-0">
                Open popover
              </Button>
            </PopoverTrigger>
            <PopoverContent side={popoverSide} className="max-w-xs text-sm leading-relaxed">
              Popover content uses the same surface tokens as selects and menus. Current side:{" "}
              <span className="font-medium text-foreground">{popoverSide}</span>.
            </PopoverContent>
          </Popover>
        </div>
      );
    case "scroll-area":
      return <ScrollAreaPlayground />;
    case "select":
      return <SelectPlayground />;
    case "separator":
      return (
        <Stack gap="lg" className="mx-auto w-full max-w-sm text-left">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Section above</p>
            <Separator />
            <p className="text-sm text-muted-foreground">Section below</p>
          </div>
          <div className="flex h-16 items-center gap-4 rounded-lg border border-border px-4">
            <span className="text-sm text-muted-foreground">Left</span>
            <Separator orientation="vertical" className="h-8" />
            <span className="text-sm text-muted-foreground">Right</span>
          </div>
        </Stack>
      );
    case "skeleton":
      return <SkeletonPlayground />;
    case "sonner":
      return (
        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" variant="secondary" onClick={() => toast.success("Saved successfully.")}>
            Success toast
          </Button>
          <Button size="lg" variant="outline" onClick={() => toast.error("Something went wrong. Try again.")}>
            Error toast
          </Button>
        </div>
      );
    case "status-badge":
      return <StatusBadgePlayground />;
    case "tabs":
      return (
        <Tabs defaultValue="a" className="mx-auto w-full max-w-lg">
          <TabsList className="w-full justify-start sm:w-auto">
            <TabsTrigger value="a">Overview</TabsTrigger>
            <TabsTrigger value="b">Details</TabsTrigger>
            <TabsTrigger value="c" disabled>
              Disabled
            </TabsTrigger>
          </TabsList>
          <TabsContent value="a" className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <p className="text-sm leading-relaxed text-muted-foreground">First panel content.</p>
          </TabsContent>
          <TabsContent value="b" className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <p className="text-sm leading-relaxed text-muted-foreground">Second panel content.</p>
          </TabsContent>
        </Tabs>
      );
    case "tooltip":
      return (
        <TooltipProvider delayDuration={200}>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {(["top", "right", "bottom", "left"] as const).map((side) => (
              <Tooltip key={side}>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="md" className="capitalize">
                    {side}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side={side} className="max-w-xs">
                  Tooltip on the <span className="font-medium">{side}</span> side.
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      );
    default:
      return null;
  }
}
