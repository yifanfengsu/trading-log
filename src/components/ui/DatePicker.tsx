"use client";

import { CalendarDays } from "lucide-react";

import Input from "@/components/ui/Input";
import { isValidDateKey } from "@/lib/utils";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  className?: string;
}

export default function DatePicker({
  value,
  onChange,
  label,
  className,
}: DatePickerProps) {
  return (
    <div className={className}>
      <div className="relative">
        <CalendarDays
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--accent)]"
        />
        <Input
          type="date"
          value={value}
          onChange={(event) => {
            if (isValidDateKey(event.target.value)) {
              onChange(event.target.value);
            }
          }}
          aria-label={label}
          title={label}
          className="w-[188px] border-white/10 bg-[var(--accent-soft)] pl-10 pr-3 text-[var(--accent)] hover:bg-[rgba(184,241,53,0.18)]"
        />
      </div>
    </div>
  );
}
