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
  compact: "p-4",
  normal: "p-5 lg:p-6",
  spacious: "p-6 lg:p-7",
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
        "rounded-[20px] bg-[var(--card)] shadow-[var(--shadow-card)]",
        "transition-[background-color,transform] duration-200",
        hover && "hover:-translate-y-0.5 hover:bg-[var(--card-hover)]",
        densityClassMap[density],
        className,
      )}
      {...props}
    />
  );
}
