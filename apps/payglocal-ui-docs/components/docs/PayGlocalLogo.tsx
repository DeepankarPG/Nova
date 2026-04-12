import Image from "next/image";
import { cn } from "@/lib/utils";

const sizeClass = {
  sm: "h-6 sm:h-7",
  md: "h-7 sm:h-8",
  lg: "h-9 sm:h-10",
} as const;

type PayGlocalLogoProps = {
  className?: string;
  size?: keyof typeof sizeClass;
  priority?: boolean;
};

export function PayGlocalLogo({ className, size = "md", priority }: PayGlocalLogoProps) {
  return (
    <Image
      src="/payglocal-logo.png"
      alt="PayGlocal"
      width={274}
      height={48}
      className={cn("w-auto shrink-0 object-contain object-left", sizeClass[size], className)}
      priority={priority}
      sizes="(max-width: 640px) 160px, 200px"
    />
  );
}
