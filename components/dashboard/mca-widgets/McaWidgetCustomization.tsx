"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { writeMcaDashboardLayout, type McaWidgetId } from "@/lib/mca-widget-catalog";
import { McaWidgetRenderer } from "./McaWidgetRenderer";
import { McaSortableWidget } from "./McaSortableWidget";
import { McaWidgetLibraryModal } from "./McaWidgetLibraryModal";

const DROP_ZONE_ID = "mca-dashboard-drop-zone";

function DropGridShell({ editMode, children }: { editMode: boolean; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: DROP_ZONE_ID, disabled: !editMode });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "grid grid-cols-12 gap-4",
        editMode && cn(
          "rounded-xl p-3 min-h-[120px] transition-[box-shadow,background-color] duration-150",
          "border-[1.5px] border-dashed border-primary/30",
          isOver && "bg-primary/5 shadow-[inset_0_0_0_2px_rgba(0,97,227,0.1)]"
        )
      )}
    >
      {children}
    </div>
  );
}

function layoutsEqual(a: McaWidgetId[], b: McaWidgetId[]) {
  return a.length === b.length && a.every((id, i) => id === b[i]);
}

interface McaWidgetCustomizationProps {
  layout: McaWidgetId[];
  onLayoutChange: (next: McaWidgetId[] | ((prev: McaWidgetId[]) => McaWidgetId[])) => void;
  editMode: boolean;
  isLoading: boolean;
  onDiscardEdit: () => void;
  onDoneEdit: () => void;
}

const REMOVE_ANIMATION_MS = 200;

export function McaWidgetCustomization({
  layout,
  onLayoutChange,
  editMode,
  isLoading,
  onDiscardEdit,
  onDoneEdit,
}: McaWidgetCustomizationProps) {
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  const [libraryOpen, setLibraryOpen] = useState(false);
  useEffect(() => { if (!editMode) setLibraryOpen(false); }, [editMode]);

  const [activeSort, setActiveSort] = useState<McaWidgetId | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<McaWidgetId>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6, delay: 0, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragStart = (e: DragStartEvent) => {
    setActiveSort(e.active.id as McaWidgetId);
  };

  const onDragCancel = () => setActiveSort(null);

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveSort(null);
    if (!over || active.id === over.id) return;
    const prev = layoutRef.current;
    if (!prev.includes(active.id as McaWidgetId) || !prev.includes(over.id as McaWidgetId)) return;
    const oldIndex = prev.indexOf(active.id as McaWidgetId);
    const newIndex = prev.indexOf(over.id as McaWidgetId);
    const next = arrayMove(prev, oldIndex, newIndex);
    if (!layoutsEqual(prev, next)) {
      onLayoutChange(next);
      layoutRef.current = next;
      toast.success("Layout updated", { description: "Widgets reordered." });
    }
  };

  const handleApplyLibrary = useCallback((next: McaWidgetId[]) => {
    onLayoutChange(next);
    layoutRef.current = next;
  }, [onLayoutChange]);

  const handleRemove = useCallback((wid: McaWidgetId) => {
    if (layout.length <= 2) return;
    setRemovingIds((s) => new Set(s).add(wid));
    window.setTimeout(() => {
      onLayoutChange((prev) => prev.filter((w) => w !== wid));
      setRemovingIds((s) => { const n = new Set(s); n.delete(wid); return n; });
      toast.success("Widget removed");
    }, REMOVE_ANIMATION_MS);
  }, [layout.length, onLayoutChange]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className="space-y-3">
        {editMode && (
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-foreground">
              Use <strong className="font-semibold">Add widgets</strong> to pick cards, then{" "}
              <strong className="font-semibold">drag</strong> tiles to reorder.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<LayoutGrid className="w-3.5 h-3.5" />}
                onClick={() => setLibraryOpen(true)}
              >
                Add widgets
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  writeMcaDashboardLayout(layoutRef.current);
                  onDoneEdit();
                }}
              >
                Done
              </Button>
              <button
                type="button"
                className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline px-1"
                onClick={onDiscardEdit}
              >
                Cancel editing
              </button>
            </div>
          </div>
        )}

        <DropGridShell editMode={editMode}>
          <SortableContext items={layout} strategy={rectSortingStrategy}>
            {layout.map((wid) => (
              <McaSortableWidget
                key={wid}
                id={wid}
                editMode={editMode}
                isLoading={isLoading}
                onRemove={handleRemove}
              />
            ))}
          </SortableContext>
        </DropGridShell>
      </div>

      <McaWidgetLibraryModal
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        layout={layout}
        onApplyLayout={handleApplyLibrary}
      />

      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.2, 0, 0, 1)" }} style={{ zIndex: 200 }}>
        {activeSort && (
          <div className="w-[min(100vw-2rem,300px)] cursor-grabbing rounded-xl border border-border bg-card p-2 shadow-2xl">
            <McaWidgetRenderer widgetId={activeSort} preview />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
