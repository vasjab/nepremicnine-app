import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: Date | string;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  minDate,
  maxDate,
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse the value to a Date object if it's a string
  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    onChange(date);
    if (date) {
      setOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  const handleToday = () => {
    const today = new Date();
    onChange(today);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full h-12 justify-start text-left font-normal px-4 bg-background hover:bg-accent/5",
            !dateValue && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-3 h-4 w-4 opacity-60" />
          <span className="flex-1">
            {dateValue ? format(dateValue, "MMM d, yyyy") : placeholder}
          </span>
          {dateValue && (
            <button
              type="button"
              onClick={handleClear}
              className="ml-2 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-3.5 w-3.5 opacity-60" />
            </button>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
          initialFocus
          className="pointer-events-auto"
        />
        <div className="flex items-center justify-between border-t border-border p-3 bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange(undefined);
              setOpen(false);
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="font-medium"
          >
            Today
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
