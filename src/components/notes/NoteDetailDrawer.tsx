"use client";

import {
  Archive,
  Pencil,
  RotateCcw,
  Star,
  Trash2,
  X,
} from "lucide-react";
import type { ReactNode } from "react";

import LinkedEntityBadge from "@/components/notes/LinkedEntityBadge";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useNotes } from "@/components/providers/NotesStoreProvider";
import type { Note } from "@/lib/note-types";
import type { Playbook } from "@/lib/playbook-types";
import type { Trade } from "@/lib/trade-types";
import { cn, formatDateTime } from "@/lib/utils";

interface NoteDetailDrawerProps {
  note: Note;
  trades: Trade[];
  playbooks: Playbook[];
  onClose: () => void;
  onEdit: (note: Note) => void;
}

interface DetailRowProps {
  label: string;
  children: ReactNode;
}

function DetailRow({ label, children }: DetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[rgba(148,163,184,0.12)] py-3 last:border-b-0">
      <p className="text-sm text-slate-500">{label}</p>
      <div className="min-w-0 text-right text-sm font-semibold text-slate-900">
        {children}
      </div>
    </div>
  );
}

export default function NoteDetailDrawer({
  note,
  trades,
  playbooks,
  onClose,
  onEdit,
}: NoteDetailDrawerProps) {
  const { dictionary: copy, locale } = useLanguage();
  const { archiveNote, restoreNote, deleteNote, togglePinNote } = useNotes();
  const isArchived = note.status === "archived";

  function handleDelete() {
    if (!window.confirm(copy.notesPage.deleteConfirm)) {
      return;
    }

    deleteNote(note.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/24 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={copy.tradesPage.close}
      />
      <aside className="relative flex h-full w-full max-w-[620px] flex-col overflow-hidden border-l border-white/70 bg-[rgba(255,255,255,0.97)] shadow-[0_24px_80px_rgba(31,15,86,0.18)]">
        <div className="flex items-start justify-between gap-4 border-b border-[rgba(148,163,184,0.14)] px-6 py-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-[rgba(108,77,255,0.09)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                {copy.noteTypes[note.type]}
              </span>
              <span
                className={cn(
                  "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
                  isArchived
                    ? "bg-slate-100 text-slate-500 ring-slate-200"
                    : "bg-emerald-50 text-emerald-700 ring-emerald-100",
                )}
              >
                {copy.noteStatus[note.status]}
              </span>
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-slate-950">
              {note.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(15,23,42,0.04)] text-slate-500 transition-colors hover:bg-[rgba(15,23,42,0.08)] hover:text-slate-900"
            aria-label={copy.tradesPage.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <section className="rounded-[20px] bg-[rgba(250,250,255,0.86)] px-4">
            <DetailRow label={copy.notesPage.created}>
              {formatDateTime(note.createdAt, locale)}
            </DetailRow>
            <DetailRow label={copy.notesPage.updated}>
              {formatDateTime(note.updatedAt, locale)}
            </DetailRow>
            <DetailRow label={copy.notesPage.pinned}>
              {note.pinned ? copy.notesPage.pinned : "—"}
            </DetailRow>
            <DetailRow label={copy.notesPage.linkedTo}>
              <LinkedEntityBadge
                link={note.link}
                trades={trades}
                playbooks={playbooks}
                locale={locale}
                labels={{
                  noLink: copy.noteLinkTypes.none,
                  deletedTrade: copy.notesPage.deletedTrade,
                  deletedPlaybook: copy.notesPage.deletedPlaybook,
                }}
              />
            </DetailRow>
            <DetailRow label={copy.notesPage.tags}>
              {note.tags.length > 0 ? (
                <div className="flex flex-wrap justify-end gap-2">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                "—"
              )}
            </DetailRow>
          </section>

          <section className="mt-5">
            <h3 className="text-sm font-semibold text-slate-950">
              {copy.notesPage.content}
            </h3>
            <div className="mt-3 min-h-48 whitespace-pre-wrap rounded-[20px] bg-[rgba(15,23,42,0.04)] p-4 text-sm leading-7 text-slate-600">
              {note.content || "—"}
            </div>
          </section>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[rgba(148,163,184,0.14)] bg-white/92 px-6 py-4 backdrop-blur">
          <button
            type="button"
            onClick={() => onEdit(note)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(108,77,255,0.22)] transition-colors hover:bg-[var(--accent-strong)]"
          >
            <Pencil className="h-4 w-4" />
            {copy.playbookPage.edit}
          </button>
          <button
            type="button"
            onClick={() => togglePinNote(note.id)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[rgba(148,163,184,0.18)] bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
          >
            <Star className={cn("h-4 w-4", note.pinned && "fill-current")} />
            {note.pinned ? copy.notesPage.unpinNote : copy.notesPage.pinNote}
          </button>
          <button
            type="button"
            onClick={() => (isArchived ? restoreNote(note.id) : archiveNote(note.id))}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[rgba(148,163,184,0.18)] bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
          >
            {isArchived ? (
              <RotateCcw className="h-4 w-4" />
            ) : (
              <Archive className="h-4 w-4" />
            )}
            {isArchived ? copy.notesPage.restore : copy.notesPage.archive}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-rose-50 px-5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-100"
          >
            <Trash2 className="h-4 w-4" />
            {copy.playbookPage.delete}
          </button>
        </div>
      </aside>
    </div>
  );
}
