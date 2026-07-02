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
    "border border-transparent bg-[var(--accent)] text-[#0a0b0a] hover:bg-[var(--accent-strong)] active:scale-[0.99]",
  secondary:
    "border border-transparent bg-[var(--card-strong)] text-[var(--foreground)] hover:bg-[var(--card-strong-hover)]",
  ghost:
    "border border-transparent bg-transparent text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)]",
  danger:
    "border border-transparent bg-[var(--danger-soft)] text-rose-300 hover:bg-[rgba(244,63,94,0.20)] hover:text-rose-200",
  outline:
    "border border-transparent bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[rgba(184,241,53,0.22)]",
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
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(184,241,53,0.55)]",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClassMap[variant],
        sizeClassMap[size],
        className,
      )}
      {...props}
    />
  );
}
