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
        "min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-900 shadow-[0_1px_0_rgba(15,23,42,0.02)] outline-none transition-all",
        "placeholder:text-slate-300 hover:border-slate-300 focus:border-violet-300 focus:ring-4 focus:ring-violet-100",
        "disabled:bg-slate-50 disabled:text-slate-400",
        className,
      )}
      {...props}
    />
  );
});

export default Textarea;
