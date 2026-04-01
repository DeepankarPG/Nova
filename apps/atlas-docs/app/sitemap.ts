import type { MetadataRoute } from "next";
import { DESIGN_DOCS_NAV } from "@/components/design-system/design-docs-nav";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl().replace(/\/$/, "");
  const paths = new Set<string>(["/", "/design"]);

  for (const section of DESIGN_DOCS_NAV) {
    for (const item of section.items) {
      paths.add(item.href);
    }
  }

  return [...paths].map((path) => ({
    url: path === "/" ? `${base}/` : `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "/design" ? 1 : path === "/" ? 0.9 : 0.75,
  }));
}
