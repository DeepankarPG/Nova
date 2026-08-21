"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ImageCropFields } from "./ImageCropFields";

/** Standalone dialog wrapper around ImageCropFields for callers that aren't already inside their own dialog. */
export function ImageCropDialog({
  open,
  onOpenChange,
  onUpload,
  aspectRatio = 16 / 9,
  title = "Add image",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File) => void;
  aspectRatio?: number;
  title?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle>{title}</DialogTitle>
        <ImageCropFields
          aspectRatio={aspectRatio}
          onCancel={() => onOpenChange(false)}
          onUpload={(file) => {
            onUpload(file);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
