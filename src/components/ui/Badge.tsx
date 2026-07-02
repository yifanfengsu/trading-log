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
  purple: "bg-[var(--accent-soft)] text-[var(--accent)]",
  green: "bg-[var(--success-soft)] text-[var(--success)]",
  red: "bg-[var(--danger-soft)] text-rose-300",
  amber: "bg-[rgba(245,158,11,0.14)] text-amber-300",
  gray: "bg-white/[0.06] text-[var(--muted)]",
  blue: "bg-white/[0.08] text-[#c9cfc9]",
  cyan: "bg-white/[0.08] text-[#c9cfc9]",
};

export default function Badge({
  variant = "gray",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold leading-none",
        variantClassMap[variant],
        className,
      )}
      {...props}
    />
  );
}
