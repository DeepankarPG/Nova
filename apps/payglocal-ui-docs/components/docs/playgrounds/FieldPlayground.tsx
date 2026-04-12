"use client";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  Input,
  Stack,
} from "@payglocal/ui";

export function FieldPlayground() {
  return (
    <Stack gap="lg" className="w-full max-w-lg text-left">
      <FieldSet className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <FieldLegend variant="legend">Billing</FieldLegend>
        <FieldGroup className="gap-5">
          <Field>
            <FieldLabel htmlFor="field-pg-name">Legal name</FieldLabel>
            <FieldDescription>As on your bank account.</FieldDescription>
            <Input id="field-pg-name" placeholder="Acme Payments Pvt Ltd" />
          </Field>
          <FieldSeparator />
          <Field>
            <FieldLabel htmlFor="field-pg-gst">GSTIN</FieldLabel>
            <Input id="field-pg-gst" placeholder="22AAAAA0000A1Z5" aria-invalid />
            <FieldError>Enter a valid 15-character GSTIN.</FieldError>
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldSet className="rounded-xl border border-dashed border-border bg-muted/10 p-4">
        <FieldLegend variant="label" className="text-muted-foreground">
          Compact legend variant
        </FieldLegend>
        <FieldGroup className="gap-4">
          <Field orientation="horizontal">
            <FieldLabel htmlFor="field-pg-code">Reference</FieldLabel>
            <Input id="field-pg-code" className="max-w-[12rem]" placeholder="REF-1024" />
          </Field>
        </FieldGroup>
      </FieldSet>

      <FieldGroup className="rounded-lg border border-border p-4">
        <Field>
          <FieldLabel htmlFor="field-pg-phone">Phone</FieldLabel>
          <Input id="field-pg-phone" type="tel" placeholder="+91 …" />
        </Field>
        <FieldSeparator>Or</FieldSeparator>
        <Field invalid>
          <FieldLabel htmlFor="field-pg-email">Work email</FieldLabel>
          <Input id="field-pg-email" type="email" placeholder="name@company.com" aria-invalid />
          <FieldError errors={[{ message: "That domain is not allowlisted." }, { message: "Use your work address." }]} />
        </Field>
      </FieldGroup>
    </Stack>
  );
}
