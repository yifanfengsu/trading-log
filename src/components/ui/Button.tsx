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
    "border border-[rgba(124,92,255,0.65)] bg-[linear-gradient(135deg,#7C5CFF_0%,#6366F1_48%,#22D3EE_100%)] text-white shadow-[0_14px_32px_rgba(124,92,255,0.28)] hover:border-[rgba(34,211,238,0.65)] hover:shadow-[0_18px_42px_rgba(124,92,255,0.34),0_0_24px_rgba(34,211,238,0.16)] active:scale-[0.99]",
  secondary:
    "border border-white/10 bg-[rgba(15,23,42,0.66)] text-slate-200 shadow-[0_10px_24px_rgba(2,6,23,0.22)] hover:border-[rgba(124,92,255,0.38)] hover:bg-[rgba(30,41,59,0.78)] hover:text-white",
  ghost:
    "border border-transparent bg-transparent text-slate-300 hover:bg-[rgba(124,92,255,0.10)] hover:text-white",
  danger:
    "border border-[rgba(244,63,94,0.30)] bg-[rgba(244,63,94,0.10)] text-rose-300 hover:border-[rgba(244,63,94,0.46)] hover:bg-[rgba(244,63,94,0.16)] hover:text-rose-200",
  outline:
    "border border-[rgba(124,92,255,0.30)] bg-[rgba(124,92,255,0.08)] text-violet-200 hover:border-[rgba(34,211,238,0.34)] hover:bg-[rgba(124,92,255,0.14)] hover:text-white",
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
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(124,92,255,0.55)]",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClassMap[variant],
        sizeClassMap[size],
        className,
      )}
      {...props}
    />
  );
}
