"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CardLoginDemo() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>Enter your email below to login to your account</CardDescription>
        <CardAction>
          <Button type="button" variant="link">
            Sign Up
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="atlas-card-email">Email</Label>
              <Input id="atlas-card-email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="atlas-card-password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="atlas-card-password" type="password" required />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="button" className="w-full">
          Login
        </Button>
        <Button type="button" variant="outline" className="w-full">
          Login with Google
        </Button>
      </CardFooter>
    </Card>
  );
}

export function CardSmallDemo() {
  return (
    <Card size="sm" className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle>Small Card</CardTitle>
        <CardDescription>This card uses the small size variant.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          The card component supports a <code className="font-mono text-xs">size</code> prop that can be set to
          &quot;sm&quot; for a more compact appearance.
        </p>
      </CardContent>
      <CardFooter>
        <Button type="button" variant="outline" size="sm" className="w-full">
          Action
        </Button>
      </CardFooter>
    </Card>
  );
}

export function CardImageDemo() {
  return (
    <Card className="relative mx-auto w-full max-w-sm overflow-hidden pt-0">
      <div className="absolute inset-0 z-30 aspect-video bg-black/35" aria-hidden />
      <img
        src="https://avatar.vercel.sh/shadcn1"
        alt="Event cover"
        className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
      />
      <CardHeader>
        <CardAction>
          <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
            Featured
          </span>
        </CardAction>
        <CardTitle>Design systems meetup</CardTitle>
        <CardDescription>
          A practical talk on component APIs, accessibility, and shipping faster.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button type="button" className="w-full">
          View Event
        </Button>
      </CardFooter>
    </Card>
  );
}

export function CardDesignDemo() {
  return (
    <div className="space-y-10">
      <div>
        <p className="mb-3 text-xs font-medium text-muted-foreground">Login</p>
        <div className="flex justify-center">
          <CardLoginDemo />
        </div>
      </div>
      <div>
        <p className="mb-3 text-xs font-medium text-muted-foreground">Small size</p>
        <div className="flex justify-center">
          <CardSmallDemo />
        </div>
      </div>
      <div>
        <p className="mb-3 text-xs font-medium text-muted-foreground">With image</p>
        <div className="flex justify-center">
          <CardImageDemo />
        </div>
      </div>
    </div>
  );
}
