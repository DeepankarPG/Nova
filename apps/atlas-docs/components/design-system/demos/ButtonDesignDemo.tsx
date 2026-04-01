"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ButtonDesignDemo() {
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-3 text-xs font-medium text-muted-foreground">Variants</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>
      <div>
        <p className="mb-3 text-xs font-medium text-muted-foreground">Sizes</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>
      <div>
        <p className="mb-3 text-xs font-medium text-muted-foreground">With icons</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>
            Export
          </Button>
          <Button variant="primary" rightIcon={<Download className="h-3.5 w-3.5" />}>
            Download
          </Button>
        </div>
      </div>
      <div>
        <p className="mb-3 text-xs font-medium text-muted-foreground">Loading</p>
        <Button variant="primary" isLoading>
          Saving
        </Button>
      </div>
    </div>
  );
}
