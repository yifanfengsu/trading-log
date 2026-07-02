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
        "h-11 w-full rounded-full border border-transparent bg-[var(--card-strong)] px-4 text-sm font-medium text-[var(--foreground)] outline-none transition-all",
        "placeholder:text-[var(--weak)] hover:bg-[var(--card-strong-hover)] focus:border-[rgba(184,241,53,0.55)] focus:ring-4 focus:ring-[rgba(184,241,53,0.14)]",
        "disabled:bg-white/[0.04] disabled:text-[var(--weak)]",
        isDateLike &&
          "[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:transition-opacity [&::-webkit-calendar-picker-indicator]:hover:opacity-100",
        className,
      )}
      {...props}
    />
  );
});

export default Input;
