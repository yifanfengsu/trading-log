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
        "rounded-[22px] border border-[#E8EAF2] bg-white/95 shadow-[0_18px_48px_rgba(30,41,59,0.055)] backdrop-blur-[10px]",
        "transition-[border-color,box-shadow,transform] duration-200",
        hover &&
          "hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_22px_58px_rgba(30,41,59,0.09)]",
        densityClassMap[density],
        className,
      )}
      {...props}
    />
  );
}
