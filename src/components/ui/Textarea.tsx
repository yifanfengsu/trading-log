"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-24 w-full rounded-[20px] border border-transparent bg-[var(--card-strong)] px-4 py-3 text-sm font-medium text-[var(--foreground)] outline-none transition-all",
        "placeholder:text-[var(--weak)] hover:bg-[var(--card-strong-hover)] focus:border-[rgba(184,241,53,0.55)] focus:ring-4 focus:ring-[rgba(184,241,53,0.14)]",
        "disabled:bg-white/[0.04] disabled:text-[var(--weak)]",
        className,
      )}
      {...props}
    />
  );
});

export default Textarea;
