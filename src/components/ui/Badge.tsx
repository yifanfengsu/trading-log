"use client";

import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type BadgeVariant =
  | "purple"
  | "green"
  | "red"
  | "amber"
  | "gray"
  | "blue"
  | "cyan";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClassMap: Record<BadgeVariant, string> = {
  purple:
    "border-[rgba(124,92,255,0.32)] bg-[rgba(124,92,255,0.12)] text-violet-200",
  green:
    "border-[rgba(16,185,129,0.24)] bg-[rgba(16,185,129,0.12)] text-emerald-300",
  red:
    "border-[rgba(244,63,94,0.24)] bg-[rgba(244,63,94,0.12)] text-rose-300",
  amber:
    "border-[rgba(245,158,11,0.24)] bg-[rgba(245,158,11,0.12)] text-amber-300",
  gray:
    "border-[rgba(148,163,184,0.18)] bg-[rgba(148,163,184,0.10)] text-slate-300",
  blue:
    "border-[rgba(99,102,241,0.26)] bg-[rgba(99,102,241,0.12)] text-indigo-200",
  cyan:
    "border-[rgba(34,211,238,0.24)] bg-[rgba(34,211,238,0.12)] text-cyan-200",
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
