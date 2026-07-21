"use client";

import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type CardElement = "article" | "aside" | "div" | "section";
type CardDensity = "compact" | "normal" | "spacious" | "none";

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: CardElement;
  density?: CardDensity;
  hover?: boolean;
}

const densityClassMap: Record<CardDensity, string> = {
  compact: "p-3.5",
  normal: "p-4 lg:p-5",
  spacious: "p-5 lg:p-6",
  none: "p-0",
};

export default function Card({
  as: Component = "section",
  density = "normal",
  hover = false,
  className,
  ...props
}: CardProps) {
  return (
    <Component
      className={cn(
        "rounded-[var(--radius-card)] border border-[var(--card-border)]",
        "bg-[var(--card)] shadow-[var(--shadow-card)]",
        "transition-[background-color,border-color] duration-200",
        hover &&
          "hover:border-[var(--card-border-hover)] hover:bg-[var(--card-hover)]",
        densityClassMap[density],
        className,
      )}
      {...props}
    />
  );
}
