"use client";

import {
  Archive,
  Eye,
  Pencil,
  RotateCcw,
  Star,
} from "lucide-react";
import type { KeyboardEvent, MouseEvent } from "react";

import LinkedEntityBadge from "@/components/notes/LinkedEntityBadge";
import { useLanguage } from "@/components/providers/LanguageProvider";
import type { Note } from "@/lib/note-types";
import type { Playbook } from "@/lib/playbook-types";
import type { Trade } from "@/lib/trade-types";
import { cn, formatDateTime } from "@/lib/utils";

interface NoteCardProps {
  note: Note;
  trades: Trade[];
  playbooks: Playbook[];
  onView: (note: Note) => void;
  onEdit: (note: Note) => void;
  onTogglePin: (note: Note) => void;
  onArchive: (note: Note) => void;
  onRestore: (note: Note) => void;
}

function stopEvent(event: MouseEvent<HTMLButtonElement>) {
  event.stopPropagation();
}

export default function NoteCard({
  note,
  trades,
  playbooks,
  onView,
  onEdit,
  onTogglePin,
  onArchive,
  onRestore,
}: NoteCardProps) {
  const { dictionary: copy, locale } = useLanguage();
  const isArchived = note.status === "archived";

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onView(note);
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onView(note)}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative flex min-h-[280px] cursor-pointer flex-col overflow-hidden rounded-[22px] border border-[rgba(255,255,255,0.72)] bg-white/95 p-5 shadow-[0_18px_48px_rgba(31,15,86,0.07)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_54px_rgba(31,15,86,0.10)]",
        note.pinned && "ring-1 ring-[rgba(108,77,255,0.18)]",
      )}
    >
      {note.pinned ? (
        <div className="absolute inset-x-0 top-0 h-1 bg-[var(--accent)]" />
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-base font-semibold tracking-[-0.03em] text-slate-950">
            {note.title}
          </h3>
          <p className="mt-2 text-xs font-medium text-slate-400">
            {copy.notesPage.updated}: {formatDateTime(note.updatedAt, locale)}
          </p>
        </div>
        {note.pinned ? (
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(108,77,255,0.10)] text-[var(--accent)]">
            <Star className="h-4 w-4 fill-current" />
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
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

      <p className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-600">
        {note.content || "—"}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {note.tags.length > 0 ? (
          note.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500"
            >
              {tag}
            </span>
          ))
        ) : (
          <span className="text-xs font-medium text-slate-400">—</span>
        )}
      </div>

      <div className="mt-4">
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
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
        <button
          type="button"
          onClick={(event) => {
            stopEvent(event);
            onView(note);
          }}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-slate-100 px-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200"
        >
          <Eye className="h-3.5 w-3.5" />
          {copy.playbookPage.view}
        </button>
        <button
          type="button"
          onClick={(event) => {
            stopEvent(event);
            onEdit(note);
          }}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-[rgba(108,77,255,0.09)] px-3 text-xs font-semibold text-[var(--accent)] transition-colors hover:bg-[rgba(108,77,255,0.14)]"
        >
          <Pencil className="h-3.5 w-3.5" />
          {copy.playbookPage.edit}
        </button>
        <button
          type="button"
          onClick={(event) => {
            stopEvent(event);
            onTogglePin(note);
          }}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-white px-3 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-[rgba(148,163,184,0.18)] transition-colors hover:text-slate-950"
        >
          <Star className={cn("h-3.5 w-3.5", note.pinned && "fill-current")} />
          {note.pinned ? copy.notesPage.unpin : copy.notesPage.pin}
        </button>
        <button
          type="button"
          onClick={(event) => {
            stopEvent(event);
            if (isArchived) {
              onRestore(note);
              return;
            }

            onArchive(note);
          }}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-white px-3 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-[rgba(148,163,184,0.18)] transition-colors hover:text-slate-950"
        >
          {isArchived ? (
            <RotateCcw className="h-3.5 w-3.5" />
          ) : (
            <Archive className="h-3.5 w-3.5" />
          )}
          {isArchived ? copy.notesPage.restore : copy.notesPage.archive}
        </button>
      </div>
    </article>
  );
}
