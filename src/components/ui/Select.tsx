"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full rounded-full border border-transparent bg-[var(--card-strong)] px-4 text-sm font-medium text-[var(--foreground)] outline-none transition-all",
        "hover:bg-[var(--card-strong-hover)] focus:border-[rgba(184,241,53,0.55)] focus:ring-4 focus:ring-[rgba(184,241,53,0.14)] disabled:bg-white/[0.04] disabled:text-[var(--weak)]",
        className,
      )}
      {...props}
    />
  );
});

export default Select;
