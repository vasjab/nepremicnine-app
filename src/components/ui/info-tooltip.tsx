import * as React from "react";
import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  content: string;
  className?: string;
  iconClassName?: string;
}

export function InfoTooltip({ content, className, iconClassName }: InfoTooltipProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Info className={cn("h-3.5 w-3.5", iconClassName)} />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="max-w-xs text-sm p-3 pointer-events-auto" 
        side="top"
        align="center"
      >
        <p className="text-foreground leading-relaxed">{content}</p>
      </PopoverContent>
    </Popover>
  );
}
