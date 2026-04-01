"use client";

import type { ReactNode } from "react";
import { Mail, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function Section({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <div className={cn("rounded-xl border border-border bg-card p-4 shadow-sm", className)}>{children}</div>
    </section>
  );
}

export function InputDesignDemos() {
  return (
    <div className="space-y-10">
      <Section title="Basic">
        <div className="max-w-xs space-y-2">
          <Label htmlFor="input-basic">Email</Label>
          <Input id="input-basic" type="email" placeholder="Email" />
        </div>
      </Section>

      <Section title="Field">
        <FieldGroup className="max-w-xs">
          <Field>
            <FieldLabel htmlFor="input-field">Username</FieldLabel>
            <FieldDescription>Choose a unique name for your profile.</FieldDescription>
            <Input id="input-field" placeholder="shadcn" autoComplete="off" />
          </Field>
        </FieldGroup>
      </Section>

      <Section title="Field group">
        <FieldSet className="max-w-md space-y-0 border-0 p-0">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="fg-name">Full name</FieldLabel>
              <Input id="fg-name" placeholder="Ada Lovelace" autoComplete="name" />
            </Field>
            <Field>
              <FieldLabel htmlFor="fg-email">Email</FieldLabel>
              <FieldDescription>We will never share your email.</FieldDescription>
              <Input id="fg-email" type="email" placeholder="hello@example.com" autoComplete="email" />
            </Field>
          </FieldGroup>
        </FieldSet>
      </Section>

      <Section title="Disabled">
        <FieldGroup className="max-w-xs">
          <Field disabled>
            <FieldLabel htmlFor="input-dis">API key</FieldLabel>
            <FieldDescription>This key is managed by your admin.</FieldDescription>
            <Input id="input-dis" disabled defaultValue="sk_live_••••••••" />
          </Field>
        </FieldGroup>
      </Section>

      <Section title="Invalid">
        <FieldGroup className="max-w-xs">
          <Field invalid>
            <FieldLabel htmlFor="input-inv">Card number</FieldLabel>
            <Input id="input-inv" aria-invalid placeholder="0000 0000 0000 0000" defaultValue="abc" />
            <FieldError>Enter a valid card number.</FieldError>
          </Field>
        </FieldGroup>
      </Section>

      <Section title="File">
        <div className="max-w-xs space-y-2">
          <Label htmlFor="input-file">Attachment</Label>
          <Input id="input-file" type="file" />
        </div>
      </Section>

      <Section title="Inline (horizontal field + button)">
        <Field orientation="horizontal" className="max-w-md gap-2">
          <FieldLabel htmlFor="input-search" className="sr-only">
            Search
          </FieldLabel>
          <FieldContent className="!flex-row flex-1 items-center gap-2">
            <Input id="input-search" placeholder="Search…" className="min-w-0 flex-1" />
            <Button type="button" variant="primary" size="sm">
              Search
            </Button>
          </FieldContent>
        </Field>
      </Section>

      <Section title="Grid" className="p-6">
        <div className="grid max-w-lg grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="g-first">First name</Label>
            <Input id="g-first" placeholder="Jane" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="g-last">Last name</Label>
            <Input id="g-last" placeholder="Doe" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="g-addr">Address</Label>
            <Input id="g-addr" placeholder="123 Main St" />
          </div>
        </div>
      </Section>

      <Section title="Required">
        <div className="max-w-xs space-y-2">
          <Label htmlFor="input-req">
            Legal name <span className="text-destructive">*</span>
          </Label>
          <Input id="input-req" required placeholder="As on government ID" />
        </div>
      </Section>

      <Section title="Badge in label">
        <FieldGroup className="max-w-xs">
          <Field>
            <FieldLabel htmlFor="input-badge" className="flex flex-wrap items-center gap-2">
              Workspace
              <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                Recommended
              </span>
            </FieldLabel>
            <Input id="input-badge" placeholder="acme-payments" />
          </Field>
        </FieldGroup>
      </Section>

      <Section title="Input group">
        <InputGroup className="max-w-xs">
          <InputGroupAddon>
            <Search className="text-muted-foreground" aria-hidden />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search…" />
        </InputGroup>
        <InputGroup className="mt-4 max-w-xs">
          <InputGroupAddon>
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="example.com" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton type="button" aria-label="Copy">
              .com
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </Section>

      <Section title="Input group + button">
        <InputGroup className="max-w-sm">
          <InputGroupAddon>
            <Mail className="text-muted-foreground" aria-hidden />
          </InputGroupAddon>
          <InputGroupInput type="email" placeholder="you@company.com" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton type="button">Invite</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </Section>

      <Section title="Form" className="max-w-md space-y-4">
        <FieldSet className="space-y-0 border-0 p-0">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="form-name">Name</FieldLabel>
              <Input id="form-name" name="name" autoComplete="name" />
            </Field>
            <Field>
              <FieldLabel htmlFor="form-email">Email</FieldLabel>
              <Input id="form-email" name="email" type="email" autoComplete="email" />
            </Field>
            <Field>
              <FieldLabel htmlFor="form-role">Role</FieldLabel>
              <select
                id="form-role"
                name="role"
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                defaultValue=""
              >
                <option value="" disabled>
                  Select a role
                </option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </select>
            </Field>
            <FieldSeparator>Or continue with</FieldSeparator>
            <Field>
              <FieldLabel htmlFor="form-sso">SSO email</FieldLabel>
              <Input id="form-sso" type="email" placeholder="work email" />
            </Field>
          </FieldGroup>
        </FieldSet>
        <Button type="button" variant="primary" size="md">
          Save changes
        </Button>
      </Section>

      <Section title="RTL">
        <div dir="rtl" className="max-w-xs space-y-2">
          <Label htmlFor="input-rtl">البريد الإلكتروني</Label>
          <Input id="input-rtl" type="email" placeholder="you@example.com" />
        </div>
      </Section>
    </div>
  );
}
