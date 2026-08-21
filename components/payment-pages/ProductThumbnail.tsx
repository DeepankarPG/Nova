import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductThumbnail({
  imageUrl,
  className,
}: {
  imageUrl: string | null;
  className?: string;
}) {
  if (imageUrl) {
    return <img src={imageUrl} alt="" className={cn("h-9 w-9 shrink-0 rounded-lg object-cover", className)} />;
  }
  return (
    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary", className)}>
      <Package className="h-4 w-4" />
    </div>
  );
}
