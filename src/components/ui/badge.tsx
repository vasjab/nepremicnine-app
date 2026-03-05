import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-gray-800 text-white hover:bg-gray-700",
        secondary: "border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700",
        destructive: "border-transparent bg-red-50 text-red-600 hover:bg-red-100",
        outline: "text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300",
        accent: "border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200",
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
