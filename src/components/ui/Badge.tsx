"use client";

import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeVariant = "purple" | "green" | "red" | "amber" | "gray" | "blue";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClassMap: Record<BadgeVariant, string> = {
  purple: "border-violet-100 bg-violet-50 text-violet-600",
  green: "border-emerald-100 bg-emerald-50 text-emerald-700",
  red: "border-rose-100 bg-rose-50 text-rose-600",
  amber: "border-amber-100 bg-amber-50 text-amber-700",
  gray: "border-slate-200 bg-slate-50 text-slate-600",
  blue: "border-blue-100 bg-blue-50 text-blue-700",
};

export default function Badge({
  variant = "gray",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold leading-none",
        variantClassMap[variant],
        className,
      )}
      {...props}
    />
  );
}
