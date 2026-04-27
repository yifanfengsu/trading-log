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
        "h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-[0_1px_0_rgba(15,23,42,0.02)] outline-none transition-all",
        "hover:border-slate-300 focus:border-violet-300 focus:ring-4 focus:ring-violet-100 disabled:bg-slate-50 disabled:text-slate-400",
        className,
      )}
      {...props}
    />
  );
});

export default Select;
