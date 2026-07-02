"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

import Button from "@/components/ui/Button";
import { useEscapeKey } from "@/lib/use-escape-key";
import { cn } from "@/lib/utils";

type DrawerSize = "md" | "lg" | "xl";

interface DrawerShellProps {
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
  eyebrow?: string;
  footer?: ReactNode;
  labelledById?: string;
  size?: DrawerSize;
  zIndexClassName?: string;
}

const sizeClassMap: Record<DrawerSize, string> = {
  md: "max-w-[520px]",
  lg: "max-w-[640px]",
  xl: "max-w-[760px]",
};

export default function DrawerShell({
  title,
  closeLabel,
  onClose,
  children,
  eyebrow,
  footer,
  labelledById = "drawer-title",
  size = "md",
  zIndexClassName = "z-50",
}: DrawerShellProps) {
  useEscapeKey(onClose);

  return (
    <div className={cn("fixed inset-0 flex justify-end", zIndexClassName)}>
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-[4px] transition-opacity"
        onClick={onClose}
        aria-label={closeLabel}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledById}
        className={cn(
          "relative flex h-full w-full max-w-[100vw] flex-col overflow-hidden bg-[var(--card)] shadow-[0_30px_100px_rgba(0,0,0,0.6)]",
          sizeClassMap[size],
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/5 bg-white/[0.02] px-5 py-5 sm:px-6">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                {eyebrow}
              </p>
            ) : null}
            <h2
              id={labelledById}
              className="mt-1 text-xl font-semibold tracking-normal text-slate-50"
            >
              {title}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label={closeLabel}
            title={closeLabel}
            className="h-10 w-10 shrink-0 bg-[var(--card-strong)] text-[var(--muted)] hover:bg-[var(--card-strong-hover)]"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>

        {footer ? (
          <div className="shrink-0 border-t border-white/5 bg-white/[0.02] px-5 py-4 sm:px-6">
            {footer}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
