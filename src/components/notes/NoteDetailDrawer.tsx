"use client";

import {
  Archive,
  Pencil,
  RotateCcw,
  Star,
  Trash2,
} from "lucide-react";
import type { ReactNode } from "react";

import LinkedEntityBadge from "@/components/notes/LinkedEntityBadge";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useNotes } from "@/components/providers/NotesStoreProvider";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import DrawerShell from "@/components/ui/DrawerShell";
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
    <div className="flex items-start justify-between gap-4 border-b border-[rgba(155,163,155,0.12)] py-3 last:border-b-0">
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
    <DrawerShell
      title={note.title}
      eyebrow={copy.noteTypes[note.type]}
      closeLabel={copy.tradesPage.close}
      labelledById="note-detail-title"
      onClose={onClose}
      size="lg"
      zIndexClassName="z-[60]"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <Button type="button" onClick={() => onEdit(note)}>
            <Pencil className="h-4 w-4" />
            {copy.playbookPage.edit}
          </Button>
          <Button
            type="button"
            onClick={() => togglePinNote(note.id)}
            variant="secondary"
          >
            <Star className={cn("h-4 w-4", note.pinned && "fill-current")} />
            {note.pinned ? copy.notesPage.unpinNote : copy.notesPage.pinNote}
          </Button>
          <Button
            type="button"
            onClick={() => (isArchived ? restoreNote(note.id) : archiveNote(note.id))}
            variant="secondary"
          >
            {isArchived ? (
              <RotateCcw className="h-4 w-4" />
            ) : (
              <Archive className="h-4 w-4" />
            )}
            {isArchived ? copy.notesPage.restore : copy.notesPage.archive}
          </Button>
          <Button type="button" onClick={handleDelete} variant="danger">
            <Trash2 className="h-4 w-4" />
            {copy.playbookPage.delete}
          </Button>
        </div>
      }
    >
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge variant="purple">{copy.noteTypes[note.type]}</Badge>
            <Badge variant={isArchived ? "gray" : "green"}>
              {copy.noteStatus[note.status]}
            </Badge>
          </div>
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
            <div className="mt-3 min-h-48 whitespace-pre-wrap rounded-[20px] bg-[rgba(30,33,30,0.04)] p-4 text-sm leading-7 text-slate-600">
              {note.content || "—"}
            </div>
          </section>
        </div>
    </DrawerShell>
  );
}
