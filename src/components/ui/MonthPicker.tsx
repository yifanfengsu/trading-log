"use client";

import { CalendarDays } from "lucide-react";

import Input from "@/components/ui/Input";
import { isValidMonthKey } from "@/lib/utils";

interface MonthPickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  className?: string;
}

export default function MonthPicker({
  value,
  onChange,
  label,
  className,
}: MonthPickerProps) {
  return (
    <div className={className}>
      <div className="relative">
        <CalendarDays
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--accent)]"
        />
        <Input
          type="month"
          value={value}
          onChange={(event) => {
            if (isValidMonthKey(event.target.value)) {
              onChange(event.target.value);
            }
          }}
          aria-label={label}
          title={label}
          className="w-[176px] border-white/10 bg-[var(--accent-soft)] pl-10 pr-3 text-[var(--accent)] hover:bg-[rgba(184,241,53,0.18)]"
        />
      </div>
    </div>
  );
}
