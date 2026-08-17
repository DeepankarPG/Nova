"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, ZoomIn, ZoomOut } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const STAGE_SIZE = 320;
const OUTPUT_SIZE = 256;
const HANDLE_HIT_SIZE = 20;

type CropBox = { x: number; y: number; size: number };

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

type Corner = "nw" | "ne" | "sw" | "se";

type DragMode =
  | { kind: "move"; startX: number; startY: number; origin: CropBox }
  | { kind: "resize"; corner: Corner; startX: number; startY: number; origin: CropBox };

export function LogoUploadDialog({
  open,
  onOpenChange,
  onUpload,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [displaySize, setDisplaySize] = useState({ width: STAGE_SIZE, height: STAGE_SIZE });
  const [zoom, setZoom] = useState(1);
  const [crop, setCrop] = useState<CropBox>({ x: 0, y: 0, size: STAGE_SIZE });
  const dragRef = useRef<DragMode | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const reset = () => {
    setRawSrc(null);
    setZoom(1);
    setDisplaySize({ width: STAGE_SIZE, height: STAGE_SIZE });
    setCrop({ x: 0, y: 0, size: STAGE_SIZE });
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setRawSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!rawSrc) return;
    loadImage(rawSrc).then((img) => {
      const scale = Math.min(STAGE_SIZE / img.naturalWidth, STAGE_SIZE / img.naturalHeight);
      const width = img.naturalWidth * scale;
      const height = img.naturalHeight * scale;
      setDisplaySize({ width, height });
      const size = Math.min(width, height);
      setCrop({ x: (width - size) / 2, y: (height - size) / 2, size });
    });
  }, [rawSrc]);

  const boundsFor = (zoomLevel: number) => ({
    width: displaySize.width * zoomLevel,
    height: displaySize.height * zoomLevel,
  });

  const clampCrop = (box: CropBox, zoomLevel: number): CropBox => {
    const { width, height } = boundsFor(zoomLevel);
    const maxSize = Math.min(width, height);
    const size = clamp(box.size, 24, maxSize);
    const x = clamp(box.x, 0, width - size);
    const y = clamp(box.y, 0, height - size);
    return { x, y, size };
  };

  useEffect(() => {
    setCrop((prev) => clampCrop(prev, zoom));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  const handleMoveStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { kind: "move", startX: e.clientX, startY: e.clientY, origin: crop };
  };

  const handleResizeStart = (corner: Corner) => (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { kind: "resize", corner, startX: e.clientX, startY: e.clientY, origin: crop };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    if (drag.kind === "move") {
      setCrop(clampCrop({ ...drag.origin, x: drag.origin.x + dx, y: drag.origin.y + dy }, zoom));
      return;
    }

    const { corner, origin } = drag;
    let { x, y, size } = origin;
    const delta = corner === "se" || corner === "ne" ? Math.max(dx, dy) : Math.max(-dx, -dy);

    if (corner === "se") {
      size = origin.size + delta;
    } else if (corner === "nw") {
      size = origin.size + delta;
      x = origin.x - delta;
      y = origin.y - delta;
    } else if (corner === "ne") {
      size = origin.size + delta;
      y = origin.y - delta;
    } else {
      size = origin.size + delta;
      x = origin.x - delta;
    }

    setCrop(clampCrop({ x, y, size }, zoom));
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  const handleApply = async () => {
    if (!rawSrc) return;
    const img = await loadImage(rawSrc);

    const { width: zoomedWidth } = boundsFor(zoom);
    const naturalPerDisplayPx = img.naturalWidth / zoomedWidth;

    const sx = crop.x * naturalPerDisplayPx;
    const sy = crop.y * naturalPerDisplayPx;
    const ssize = crop.size * naturalPerDisplayPx;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, sx, sy, ssize, ssize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "logo.png", { type: "image/png" });
      onUpload(file);
      reset();
      onOpenChange(false);
    }, "image/png");
  };

  const zoomedSize = boundsFor(zoom);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogTitle>{rawSrc ? "Crop your logo" : "Add your logo"}</DialogTitle>

        {!rawSrc ? (
          <>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFile(e.dataTransfer.files?.[0]);
              }}
              className="mt-4 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/20 px-6 py-10 text-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-sm">
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-[14px] font-medium text-foreground">Drop your logo here to upload it</p>
              <input
                ref={inputRef}
                type="file"
                accept=".png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-lg bg-primary px-5 py-2 text-[13.5px] font-semibold text-primary-foreground hover:opacity-90"
              >
                Select file
              </button>
            </div>

            <p className="mt-3 text-center text-[12px] text-muted-foreground">File must be smaller than 2MB.</p>
            <p className="mt-1 text-center text-[12px] text-muted-foreground">
              Your logo will be shown when you request payment using invoices, payment links and Quick Pay.
            </p>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="mt-5 h-11 w-full rounded-xl border border-border bg-card text-[14px] font-semibold text-foreground hover:bg-muted/50"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              Drag the frame to reposition, pull a corner to resize, and use the slider to zoom.
            </p>

            <div
              className="relative mx-auto mt-4 select-none overflow-hidden rounded-lg bg-black/80"
              style={{ width: displaySize.width, height: displaySize.height, touchAction: "none" }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              <img
                ref={imgRef}
                src={rawSrc}
                alt="Logo preview"
                draggable={false}
                className="pointer-events-none absolute left-0 top-0 max-w-none"
                style={{ width: zoomedSize.width, height: zoomedSize.height }}
              />

              {/* Dim outside the crop box */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  boxShadow: `0 0 0 9999px rgba(0,0,0,0.55)`,
                  left: crop.x,
                  top: crop.y,
                  width: crop.size,
                  height: crop.size,
                  position: "absolute",
                }}
              />

              {/* Crop box */}
              <div
                onPointerDown={handleMoveStart}
                className="absolute cursor-move border-2 border-white"
                style={{ left: crop.x, top: crop.y, width: crop.size, height: crop.size }}
              >
                {(["nw", "ne", "sw", "se"] as const).map((corner) => (
                  <div
                    key={corner}
                    onPointerDown={handleResizeStart(corner)}
                    className="absolute flex items-center justify-center"
                    style={{
                      width: HANDLE_HIT_SIZE,
                      height: HANDLE_HIT_SIZE,
                      cursor: corner === "nw" || corner === "se" ? "nwse-resize" : "nesw-resize",
                      top: corner.includes("n") ? -HANDLE_HIT_SIZE / 2 : undefined,
                      bottom: corner.includes("s") ? -HANDLE_HIT_SIZE / 2 : undefined,
                      left: corner.includes("w") ? -HANDLE_HIT_SIZE / 2 : undefined,
                      right: corner.includes("e") ? -HANDLE_HIT_SIZE / 2 : undefined,
                    }}
                  >
                    <span className="block h-3 w-3 rounded-[2px] border-2 border-white bg-white/40" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <ZoomOut className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={reset}
                className="h-11 rounded-xl border border-border bg-card text-[14px] font-semibold text-foreground hover:bg-muted/50"
              >
                Choose another
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="h-11 rounded-xl bg-primary text-[14px] font-semibold text-primary-foreground hover:opacity-90"
              >
                Apply
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
