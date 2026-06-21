"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-2xl border border-[rgba(148,163,184,0.20)] bg-[rgba(2,6,23,0.34)] px-3 text-sm font-medium text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition-all",
        "placeholder:text-slate-500 hover:border-[rgba(148,163,184,0.32)] focus:border-[rgba(124,92,255,0.70)] focus:ring-4 focus:ring-[rgba(124,92,255,0.16)]",
        "disabled:border-white/5 disabled:bg-slate-950/30 disabled:text-slate-600",
        className,
      )}
      {...props}
    />
  );
});

export default Input;
