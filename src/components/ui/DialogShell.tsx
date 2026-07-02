"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

import Button from "@/components/ui/Button";
import { useEscapeKey } from "@/lib/use-escape-key";

interface DialogShellProps {
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
  eyebrow?: string;
  footer?: ReactNode;
  labelledById?: string;
}

export default function DialogShell({
  title,
  closeLabel,
  onClose,
  children,
  eyebrow,
  footer,
  labelledById = "dialog-title",
}: DialogShellProps) {
  useEscapeKey(onClose);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto px-4 py-4 sm:py-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-[4px]"
        onClick={onClose}
        aria-label={closeLabel}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledById}
        className="relative my-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-[560px] flex-col overflow-hidden rounded-[20px] bg-[var(--card)] shadow-[0_30px_100px_rgba(0,0,0,0.6)]"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/5 bg-white/[0.02] px-5 py-5 sm:px-6">
          <div>
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
            className="h-10 w-10 bg-[var(--card-strong)] text-[var(--muted)] hover:bg-[var(--card-strong-hover)]"
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
      </section>
    </div>
  );
}
