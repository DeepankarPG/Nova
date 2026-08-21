"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, ZoomIn, ZoomOut } from "lucide-react";

const STAGE_WIDTH = 400;
const MAX_STAGE_HEIGHT = 320;
const OUTPUT_WIDTH = 800;

type Offset = { x: number; y: number };

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

/**
 * Fixed-size crop stage matching the target aspect ratio - drag the image to
 * reposition, use the slider to zoom. The stage itself is the crop window (like
 * the Twitter/LinkedIn avatar cropper), so its size never depends on the source
 * image's dimensions and the dialog height stays predictable. Dialog-agnostic:
 * renders its own steps (pick file -> crop) as plain content so callers can host
 * it inline or inside their own dialog, rather than nesting a second Radix Dialog
 * root (which stacks/overlaps unpredictably).
 */
export function ImageCropFields({
  onUpload,
  onCancel,
  aspectRatio = 16 / 9,
}: {
  onUpload: (file: File) => void;
  onCancel: () => void;
  aspectRatio?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState({ width: 1, height: 1 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; origin: Offset } | null>(null);

  const stageWidth = STAGE_WIDTH;
  const stageHeight = Math.min(STAGE_WIDTH / aspectRatio, MAX_STAGE_HEIGHT);
  const outputHeight = Math.round(OUTPUT_WIDTH / aspectRatio);

  const resetToFilePicker = () => {
    setRawSrc(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
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
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    });
  }, [rawSrc]);

  // Base scale so the image always covers the fixed stage at zoom = 1.
  const coverScale = Math.max(stageWidth / naturalSize.width, stageHeight / naturalSize.height);
  const renderedWidth = naturalSize.width * coverScale * zoom;
  const renderedHeight = naturalSize.height * coverScale * zoom;

  const clampOffset = (next: Offset, width: number, height: number): Offset => ({
    x: clamp(next.x, Math.min(0, stageWidth - width), 0),
    y: clamp(next.y, Math.min(0, stageHeight - height), 0),
  });

  useEffect(() => {
    setOffset((prev) => clampOffset(prev, renderedWidth, renderedHeight));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, naturalSize]);

  const handleDragStart = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origin: offset };
  };

  const handleDragMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    setOffset(clampOffset({ x: drag.origin.x + dx, y: drag.origin.y + dy }, renderedWidth, renderedHeight));
  };

  const handleDragEnd = () => {
    dragRef.current = null;
  };

  const handleApply = async () => {
    if (!rawSrc) return;
    const img = await loadImage(rawSrc);

    // Map the stage window back to source-image pixels: the stage's top-left,
    // in rendered (post cover-scale + zoom + pan) space, is (-offset.x, -offset.y).
    const naturalPerRenderedPx = 1 / (coverScale * zoom);
    const sx = -offset.x * naturalPerRenderedPx;
    const sy = -offset.y * naturalPerRenderedPx;
    const swidth = stageWidth * naturalPerRenderedPx;
    const sheight = stageHeight * naturalPerRenderedPx;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_WIDTH;
    canvas.height = outputHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, sx, sy, swidth, sheight, 0, 0, OUTPUT_WIDTH, outputHeight);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "cover.png", { type: "image/png" });
      onUpload(file);
    }, "image/png");
  };

  if (!rawSrc) {
    return (
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
          <p className="text-[14px] font-medium text-foreground">Drop your image here to upload it</p>
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

        <p className="mt-3 text-center text-[12px] text-muted-foreground">File must be smaller than 5MB.</p>

        <button
          type="button"
          onClick={onCancel}
          className="mt-5 h-11 w-full rounded-xl border border-border bg-card text-[14px] font-semibold text-foreground hover:bg-muted/50"
        >
          Cancel
        </button>
      </>
    );
  }

  return (
    <>
      <p className="mt-1 text-[12.5px] text-muted-foreground">
        Drag the image to reposition, and use the slider to zoom.
      </p>

      <div
        className="relative mx-auto mt-4 select-none overflow-hidden rounded-lg bg-black/80"
        style={{ width: stageWidth, height: stageHeight, touchAction: "none" }}
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerLeave={handleDragEnd}
      >
        <img
          src={rawSrc}
          alt="Preview"
          draggable={false}
          className="pointer-events-none absolute left-0 top-0 max-w-none cursor-move"
          style={{ width: renderedWidth, height: renderedHeight, transform: `translate(${offset.x}px, ${offset.y}px)` }}
        />
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
          onClick={resetToFilePicker}
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
  );
}
