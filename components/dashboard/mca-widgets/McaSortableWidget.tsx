"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { McaWidgetRenderer } from "./McaWidgetRenderer";
import { MCA_WIDGET_BY_ID } from "@/lib/mca-widget-catalog";
import type { McaWidgetId } from "@/lib/mca-widget-catalog";

interface McaSortableWidgetProps {
  id: McaWidgetId;
  editMode: boolean;
  isLoading?: boolean;
  onRemove: (id: McaWidgetId) => void;
}

const COL_SPAN: Record<number, string> = {
  3:  "col-span-12 md:col-span-6 lg:col-span-3",
  4:  "col-span-12 md:col-span-6 lg:col-span-4",
  5:  "col-span-12 md:col-span-6 lg:col-span-5",
  6:  "col-span-12 md:col-span-6 lg:col-span-6",
  7:  "col-span-12 md:col-span-8 lg:col-span-7",
  8:  "col-span-12 md:col-span-8 lg:col-span-8",
  12: "col-span-12",
};

export function McaSortableWidget({ id, editMode, isLoading, onRemove }: McaSortableWidgetProps) {
  const entry = MCA_WIDGET_BY_ID[id];
  const colSpan = COL_SPAN[entry?.lgColSpan ?? 4] ?? COL_SPAN[4];

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 40 : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn(colSpan, "relative group/widget min-h-[120px]")}>
      {editMode && (
        <>
          <button
            {...attributes}
            {...listeners}
            className="absolute left-2 top-2 z-20 p-1 rounded-md bg-background/80 border border-border text-muted-foreground opacity-0 group-hover/widget:opacity-100 transition-opacity cursor-grab active:cursor-grabbing shadow-sm"
            aria-label="Drag to reorder"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onRemove(id)}
            className="absolute right-2 top-2 z-20 p-1 rounded-md bg-background/80 border border-border text-muted-foreground hover:text-destructive opacity-0 group-hover/widget:opacity-100 transition-opacity shadow-sm"
            aria-label="Remove widget"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="absolute inset-0 z-10 rounded-xl border-2 border-dashed border-primary/30 pointer-events-none opacity-0 group-hover/widget:opacity-100 transition-opacity" />
        </>
      )}
      <McaWidgetRenderer widgetId={id} isLoading={isLoading} />
    </div>
  );
}
