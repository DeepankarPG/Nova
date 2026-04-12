"use client";

import { BarChart3, MoreHorizontal } from "lucide-react";
import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Stack,
} from "@payglocal/ui";

export function CardPlayground() {
  return (
    <Stack gap="lg" className="w-full">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BarChart3 className="size-[1.35rem]" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <CardTitle className="text-xl">Default size</CardTitle>
                <CardDescription>Card with default padding scale.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">Content uses card tokens.</p>
          </CardContent>
          <CardFooter>
            <Button size="lg" variant="secondary">
              Secondary
            </Button>
            <Button size="lg" variant="primary">
              Primary
            </Button>
          </CardFooter>
        </Card>

        <Card size="sm" className="shadow-md">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <CardTitle>Small + action</CardTitle>
                <CardDescription>size=&quot;sm&quot; with CardAction.</CardDescription>
              </div>
              <CardAction>
                <Button type="button" size="md" variant="ghost" className="size-9 shrink-0 p-0" aria-label="More">
                  <MoreHorizontal className="size-4" />
                </Button>
              </CardAction>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Tighter rhythm for dense dashboards.</p>
          </CardContent>
          <CardFooter className="justify-end">
            <Button size="md" variant="outline">
              Dismiss
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Stack>
  );
}
