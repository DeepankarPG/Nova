"use client";

import { ComponentPreview } from "@/components/docs/ComponentPreview";
import { DocsPreviewShell } from "@/components/docs/DocsPreviewShell";
import { getDocsPreviewConfig } from "@/lib/preview-layout";

export function DocsComponentPreviewSection({ slug }: { slug: string }) {
  const cfg = getDocsPreviewConfig(slug);

  return (
    <DocsPreviewShell layout={cfg.layout} chrome={cfg.chrome}>
      <ComponentPreview slug={slug} />
    </DocsPreviewShell>
  );
}
