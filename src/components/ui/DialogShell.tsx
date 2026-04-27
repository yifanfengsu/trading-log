"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

import Button from "@/components/ui/Button";

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
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto px-4 py-4 sm:py-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/25 backdrop-blur-[3px]"
        onClick={onClose}
        aria-label={closeLabel}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledById}
        className="relative my-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-[560px] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(30,41,59,0.18)]"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-6">
          <div>
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
                {eyebrow}
              </p>
            ) : null}
            <h2
              id={labelledById}
              className="mt-1 text-xl font-semibold tracking-normal text-slate-950"
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
            className="h-10 w-10 bg-slate-50 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>
        {footer ? (
          <div className="shrink-0 border-t border-slate-200 bg-white/95 px-5 py-4 sm:px-6">
            {footer}
          </div>
        ) : null}
      </section>
    </div>
  );
}
