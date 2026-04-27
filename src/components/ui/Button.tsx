"use client";

import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClassMap: Record<ButtonVariant, string> = {
  primary:
    "border border-violet-600 bg-violet-600 text-white shadow-[0_12px_24px_rgba(109,93,246,0.22)] hover:border-violet-700 hover:bg-violet-700 active:bg-violet-800",
  secondary:
    "border border-slate-200 bg-white text-slate-700 shadow-[0_8px_18px_rgba(30,41,59,0.04)] hover:border-violet-200 hover:text-slate-950",
  ghost:
    "border border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-950",
  danger:
    "border border-rose-100 bg-rose-50 text-rose-600 hover:border-rose-200 hover:bg-rose-100",
  outline:
    "border border-violet-200 bg-white text-violet-600 hover:bg-violet-50 hover:text-violet-700",
};

const sizeClassMap: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 rounded-full px-3 text-xs",
  md: "h-11 gap-2 rounded-full px-4 text-sm",
  lg: "h-12 gap-2.5 rounded-full px-5 text-sm",
  icon: "h-9 w-9 rounded-full p-0",
};

export default function Button({
  variant = "primary",
  size = "md",
  type,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-semibold transition-all duration-200",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClassMap[variant],
        sizeClassMap[size],
        className,
      )}
      {...props}
    />
  );
}
