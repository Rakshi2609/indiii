import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-on-primary",
        secondary:
          "bg-surface-container-high text-on-surface-variant border border-outline-variant",
        destructive:
          "bg-error-container text-on-error-container border border-error/20",
        verified:
          "bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]",
        warning:
          "bg-[#FFEDD5] text-[#C2410C] border border-[#FDBA74]",
        ai:
          "bg-[#E0E7FF] text-[#4338CA] border border-[#A5B4FC]",
        outline: "border border-outline-variant text-on-surface-variant",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
