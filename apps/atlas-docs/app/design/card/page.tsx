import type { Metadata } from "next";
import { CardDesignDemo } from "@/components/design-system/demos/CardDesignDemo";
import { CodeBlock } from "@/components/design-system/CodeBlock";
import { InstallTabs } from "@/components/design-system/InstallTabs";

export const metadata: Metadata = {
  title: "Card — Atlas",
  description: "Displays a card with header, content, and footer.",
};

const DEMO_SNIPPET = `import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function CardDemo() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
        <CardAction>
          <Button variant="link">Sign Up</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" required />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full">
          Login
        </Button>
        <Button variant="outline" className="w-full">
          Login with Google
        </Button>
      </CardFooter>
    </Card>
  )
}`;

const USAGE_IMPORT = `import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"`;

const USAGE_MARKUP = `<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
    <CardAction>Card Action</CardAction>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
    <p>Card Footer</p>
  </CardFooter>
</Card>`;

const CLI_INSTALL = `# From the payglocal-gcc monorepo — copy the source into your app’s ui folder
cp packages/payglocal-ui/src/card.tsx ./components/ui/card.tsx

# Ensure cn() resolves (same as other ui components) and Tailwind sees card classes.`;

const MANUAL_SOURCE_NOTE = `// Canonical implementation:
// packages/payglocal-ui/src/card.tsx

// This app re-exports for docs and dashboard:
// components/ui/card.tsx`;

export default function DesignCardPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Card</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          Displays a card with header, content, and footer.
        </p>
      </div>

      <section id="preview" className="space-y-3 scroll-mt-20">
        <h2 className="text-sm font-semibold text-foreground">Preview</h2>
        <div className="rounded-2xl border border-border bg-muted/20 p-6 dark:bg-muted/10">
          <CardDesignDemo />
        </div>
        <CodeBlock code={DEMO_SNIPPET} />
      </section>

      <section id="installation" className="space-y-3 scroll-mt-20">
        <h2 className="text-sm font-semibold text-foreground">Installation</h2>
        <InstallTabs
          cliCode={CLI_INSTALL}
          manual={
            <>
              <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                <li>Copy the implementation into your project (see code below).</li>
                <li>Update import paths to match your app (e.g. <code className="font-mono text-xs">@/lib/utils</code> for{" "}
                <code className="font-mono text-xs">cn</code>).</li>
              </ol>
              <CodeBlock code={MANUAL_SOURCE_NOTE} />
            </>
          }
        />
      </section>

      <section id="usage" className="space-y-3 scroll-mt-20">
        <h2 className="text-sm font-semibold text-foreground">Usage</h2>
        <CodeBlock code={USAGE_IMPORT} />
        <CodeBlock code={USAGE_MARKUP} />
      </section>

      <section id="examples" className="space-y-6 scroll-mt-20">
        <h2 className="text-sm font-semibold text-foreground">Examples</h2>
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Size</h3>
          <p className="text-sm text-muted-foreground">
            Use the <code className="rounded bg-muted px-1 font-mono text-xs">size=&quot;sm&quot;</code> prop for tighter
            spacing.
          </p>
          <CodeBlock
            code={`import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function CardSmall() {
  return (
    <Card size="sm" className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle>Small Card</CardTitle>
        <CardDescription>
          This card uses the small size variant.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Compact spacing via the size prop.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full">
          Action
        </Button>
      </CardFooter>
    </Card>
  )
}`}
          />
        </div>
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Image</h3>
          <p className="text-sm text-muted-foreground">
            Place media above the header content; use layering utilities for overlays.
          </p>
          <CodeBlock
            code={`import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function CardImage() {
  return (
    <Card className="relative mx-auto w-full max-w-sm overflow-hidden pt-0">
      <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
      <img
        src="https://avatar.vercel.sh/shadcn1"
        alt="Event cover"
        className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
      />
      <CardHeader>
        <CardAction>
          <span className="inline-flex rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium">
            Featured
          </span>
        </CardAction>
        <CardTitle>Design systems meetup</CardTitle>
        <CardDescription>
          A practical talk on component APIs, accessibility, and shipping faster.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button className="w-full">View Event</Button>
      </CardFooter>
    </Card>
  )
}`}
          />
        </div>
      </section>

      <section id="api" className="space-y-3 scroll-mt-20">
        <h2 className="text-sm font-semibold text-foreground">API Reference</h2>
        <div className="space-y-6 text-sm">
          <div>
            <h3 className="mb-2 font-semibold text-foreground">Card</h3>
            <p className="mb-2 text-muted-foreground">Root container for card content.</p>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-2.5 font-medium text-foreground">Prop</th>
                    <th className="px-4 py-2.5 font-medium text-foreground">Type</th>
                    <th className="px-4 py-2.5 font-medium text-foreground">Default</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-2.5 font-mono text-xs">size</td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      <code className="text-xs">&quot;default&quot; | &quot;sm&quot;</code>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">default</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-mono text-xs">className</td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      <code className="text-xs">string</code>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {(
            [
              ["CardHeader", "Title, description, and optional action."],
              ["CardTitle", "Primary heading."],
              ["CardDescription", "Helper text under the title."],
              ["CardAction", "Top-right of the header (e.g. link or badge)."],
              ["CardContent", "Main body."],
              ["CardFooter", "Actions or secondary content."],
            ] as const
          ).map(([name, desc]) => (
            <div key={name}>
              <h3 className="mb-2 font-semibold text-foreground">{name}</h3>
              <p className="mb-2 text-muted-foreground">{desc}</p>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full min-w-[28rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-4 py-2.5 font-medium text-foreground">Prop</th>
                      <th className="px-4 py-2.5 font-medium text-foreground">Type</th>
                      <th className="px-4 py-2.5 font-medium text-foreground">Default</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2.5 font-mono text-xs">className</td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        <code className="text-xs">string</code>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
