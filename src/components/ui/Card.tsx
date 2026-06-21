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
        "rounded-[22px] border border-white/10 bg-[rgba(15,23,42,0.72)] shadow-[0_22px_70px_rgba(2,6,23,0.32)] backdrop-blur-xl",
        "transition-[border-color,box-shadow,transform] duration-200",
        hover &&
          "hover:-translate-y-0.5 hover:border-[rgba(124,92,255,0.38)] hover:shadow-[0_28px_90px_rgba(2,6,23,0.42),0_0_34px_rgba(124,92,255,0.12)]",
        densityClassMap[density],
        className,
      )}
      {...props}
    />
  );
}
