"use client";

import { Plus } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import type { Note } from "@/lib/note-types";
import { formatDateTime } from "@/lib/utils";

interface LinkedNotesPreviewProps {
  notes: Note[];
  onAdd: () => void;
}

export default function LinkedNotesPreview({
  notes,
  onAdd,
}: LinkedNotesPreviewProps) {
  const { dictionary: copy, locale } = useLanguage();
  const visibleNotes = notes.slice(0, 3);

  return (
    <section className="mt-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-950">
          {copy.notesPage.linkedNotes}
        </h3>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-[rgba(108,77,255,0.09)] px-3 text-xs font-semibold text-[var(--accent)] transition-colors hover:bg-[rgba(108,77,255,0.14)]"
        >
          <Plus className="h-3.5 w-3.5" />
          {copy.notesPage.addNote}
        </button>
      </div>

      {visibleNotes.length > 0 ? (
        <div className="mt-3 grid gap-2">
          {visibleNotes.map((note) => (
            <article
              key={note.id}
              className="rounded-[16px] bg-[rgba(250,250,255,0.88)] px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="line-clamp-1 text-sm font-semibold text-slate-900">
                  {note.title}
                </p>
                <span className="shrink-0 rounded-full bg-[rgba(108,77,255,0.08)] px-2 py-1 text-xs font-semibold text-[var(--accent)]">
                  {copy.noteTypes[note.type]}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {formatDateTime(note.updatedAt, locale)}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-[18px] bg-[rgba(250,250,255,0.88)] px-4 py-8 text-center text-sm font-medium text-slate-400">
          {copy.notesPage.noLinkedNotesYet}
        </p>
      )}
    </section>
  );
}
