"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

// Native date/time pickers render their popup + calendar icon from the
// element's color-scheme. Force dark and tone the indicator to match our
// slate icon language so these inputs sit in the dark UI like ui/Select.
const dateLikeTypes = new Set(["date", "datetime-local", "month", "time", "week"]);

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type, ...props },
  ref,
) {
  const isDateLike = typeof type === "string" && dateLikeTypes.has(type);

  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-11 w-full rounded-2xl border border-[rgba(148,163,184,0.20)] bg-[rgba(2,6,23,0.34)] px-3 text-sm font-medium text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition-all",
        "placeholder:text-slate-500 hover:border-[rgba(148,163,184,0.32)] focus:border-[rgba(124,92,255,0.70)] focus:ring-4 focus:ring-[rgba(124,92,255,0.16)]",
        "disabled:border-white/5 disabled:bg-slate-950/30 disabled:text-slate-600",
        isDateLike &&
          "[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:transition-opacity [&::-webkit-calendar-picker-indicator]:hover:opacity-100",
        className,
      )}
      {...props}
    />
  );
});

export default Input;
