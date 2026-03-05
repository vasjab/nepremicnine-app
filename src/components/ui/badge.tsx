import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-gray-900 text-white hover:bg-gray-800 shadow-sm",
        secondary: "border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200/80 hover:text-gray-800",
        destructive: "border-transparent bg-red-50 text-red-600 hover:bg-red-100/80",
        outline: "text-gray-600 border-gray-200/80 bg-white hover:bg-gray-50 hover:border-gray-300 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        accent: "border-transparent bg-gray-900/[0.06] text-gray-700 hover:bg-gray-900/[0.1]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
