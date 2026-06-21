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
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-[4px]"
        onClick={onClose}
        aria-label={closeLabel}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledById}
        className="relative my-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-[560px] flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[rgba(15,23,42,0.96)] shadow-[0_30px_100px_rgba(2,6,23,0.56)] backdrop-blur-xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 bg-[rgba(15,23,42,0.54)] px-5 py-5 sm:px-6">
          <div>
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
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
            className="h-10 w-10 bg-[rgba(15,23,42,0.68)] text-slate-300 hover:bg-[rgba(124,92,255,0.14)]"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>
        {footer ? (
          <div className="shrink-0 border-t border-white/10 bg-[rgba(15,23,42,0.82)] px-5 py-4 sm:px-6">
            {footer}
          </div>
        ) : null}
      </section>
    </div>
  );
}
