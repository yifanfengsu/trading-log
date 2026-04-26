"use client";

import { NotebookPen, Plus } from "lucide-react";

interface NotesEmptyStateProps {
  title: string;
  actionLabel: string;
  onCreate: () => void;
}

export default function NotesEmptyState({
  title,
  actionLabel,
  onCreate,
}: NotesEmptyStateProps) {
  return (
    <section className="panel-card flex min-h-[320px] flex-col items-center justify-center px-5 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[rgba(108,77,255,0.09)] text-[var(--accent)]">
        <NotebookPen className="h-6 w-6" />
      </div>
      <h2 className="mt-5 text-lg font-semibold tracking-[-0.03em] text-slate-950">
        {title}
      </h2>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(108,77,255,0.22)] transition-colors hover:bg-[var(--accent-strong)]"
      >
        <Plus className="h-4 w-4" />
        {actionLabel}
      </button>
    </section>
  );
}
