"use client";

import type { ComponentProps } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "./utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

function DialogOverlay({ className, ...props }: ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-[100] min-h-[100dvh] w-full bg-black/50 backdrop-blur-[2px]",
        "data-[state=open]:opacity-100 data-[state=closed]:opacity-0 transition-opacity duration-200",
        className
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showClose = true,
  overlayClassName,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & {
  showClose?: boolean;
  overlayClassName?: string;
}) {
  return (
    <DialogPortal>
      <DialogOverlay className={overlayClassName} />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-[101] w-[calc(100%-1.5rem)] max-w-[min(100%,26rem)] -translate-x-1/2 -translate-y-1/2",
          // Default padding reserves space for the close button.
          // Pass p-0 in className to opt out (manage padding per section).
          "rounded-2xl border border-border bg-card p-6 pt-10 text-card-foreground shadow-2xl outline-none",
          "max-h-[min(90vh,720px)] overflow-y-auto",
          "data-[state=open]:opacity-100 data-[state=closed]:opacity-0 data-[state=open]:scale-100 data-[state=closed]:scale-[0.98]",
          "transition-[opacity,transform] duration-200 ease-out",
          className
        )}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close
            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-lg font-semibold text-foreground tracking-tight pr-10", className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description className={cn("text-[13px] text-muted-foreground mt-1", className)} {...props} />
  );
}

export { Dialog, DialogTrigger, DialogPortal, DialogClose, DialogContent, DialogTitle, DialogDescription };
