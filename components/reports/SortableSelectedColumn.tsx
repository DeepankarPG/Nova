"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SelectedColumn = {
  /** Stable id, e.g. "Payments.Payment ID" */
  id: string;
  group: string;
  column: string;
  /** User-editable export header, defaults to a slugified column name */
  label: string;
};

export function SortableSelectedColumn({
  entry,
  onLabelChange,
  onRemove,
}: {
  entry: SelectedColumn;
  onLabelChange: (id: string, label: string) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: entry.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 shadow-sm",
        isDragging && "opacity-90 shadow-md"
      )}
    >
      <button
        type="button"
        className="flex h-6 w-6 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground hover:bg-muted active:cursor-grabbing"
        aria-label={`Reorder ${entry.column}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10.5px] text-muted-foreground">
          {entry.group}.{entry.column}
        </p>
      </div>
      <Input
        value={entry.label}
        onChange={(e) => onLabelChange(entry.id, e.target.value)}
        maxLength={50}
        className="h-7 w-36 shrink-0 text-[12.5px]"
        aria-label={`Export header for ${entry.column}`}
      />
      <button
        type="button"
        onClick={() => onRemove(entry.id)}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label={`Remove ${entry.column}`}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
