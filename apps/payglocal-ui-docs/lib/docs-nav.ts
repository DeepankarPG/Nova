import { getSortedComponentPages } from "@/lib/component-registry";

export type DocsNavSection = {
  label: string;
  items: { title: string; href: string }[];
};

export function getDocsNavSections(): DocsNavSection[] {
  const components = getSortedComponentPages().map((p) => ({
    title: p.title,
    href: `/docs/components/${p.slug}`,
  }));

  return [
    {
      label: "Get started",
      items: [
        { title: "Introduction", href: "/docs" },
        { title: "Guidelines", href: "/docs/guidelines" },
        { title: "Installation", href: "/docs/installation" },
        { title: "Theming", href: "/docs/theming" },
        { title: "Components", href: "/docs/components" },
      ],
    },
    {
      label: "Foundations",
      items: [
        { title: "Overview", href: "/docs/foundations" },
        { title: "Motion", href: "/docs/foundations/motion" },
        { title: "Typography", href: "/docs/foundations/typography" },
        { title: "Spacing", href: "/docs/foundations/spacing" },
      ],
    },
    {
      label: "Patterns",
      items: [
        { title: "Overview", href: "/docs/patterns" },
        { title: "Dashboard shell", href: "/docs/patterns/dashboard-shell" },
        { title: "Forms & fields", href: "/docs/patterns/forms" },
      ],
    },
    {
      label: "Components",
      items: components,
    },
  ];
}
