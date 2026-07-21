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

// The palette only has one accent hue, so the variants are pulled apart by
// FORM (soft fill / outline / solid) as well as hue. Before this, purple+green
// both rendered as the same green and blue+cyan+gray as the same grey, which
// made e.g. a trade's side badge indistinguishable from its status badge.
const variantClassMap: Record<BadgeVariant, string> = {
  // Neutral emphasis — the workhorse label (tags, months, side, filters).
  purple: "border-white/[0.12] bg-white/[0.07] text-[#dfe4df]",
  // Positive / achieved.
  green: "border-[rgba(184,241,53,0.28)] bg-[var(--success-soft)] text-[var(--success)]",
  // Negative / failed.
  red: "border-[rgba(244,63,94,0.30)] bg-[var(--danger-soft)] text-rose-300",
  // Caution / legacy data.
  amber: "border-[rgba(245,158,11,0.30)] bg-[rgba(245,158,11,0.12)] text-amber-300",
  // Quietest — outline only.
  gray: "border-white/[0.12] bg-transparent text-[var(--muted)]",
  // Counts / metadata — solid, borderless.
  blue: "border-transparent bg-white/[0.13] text-[#eef1ee]",
  // Brand / live status — accent outline, no fill.
  cyan: "border-[rgba(184,241,53,0.34)] bg-transparent text-[var(--accent)]",
};

export default function Badge({
  variant = "gray",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold leading-none",
        variantClassMap[variant],
        className,
      )}
      {...props}
    />
  );
}
