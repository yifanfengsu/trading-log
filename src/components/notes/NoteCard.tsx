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
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
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
    <Card
      as="article"
      role="button"
      tabIndex={0}
      onClick={() => onView(note)}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative flex min-h-[280px] cursor-pointer flex-col overflow-hidden",
        note.pinned && "ring-1 ring-[rgba(108,77,255,0.18)]",
      )}
      hover
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
        <Badge variant="purple">
          {copy.noteTypes[note.type]}
        </Badge>
        <Badge variant={isArchived ? "gray" : "green"}>
          {copy.noteStatus[note.status]}
        </Badge>
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
        <Button
          type="button"
          onClick={(event) => {
            stopEvent(event);
            onView(note);
          }}
          variant="secondary"
          size="sm"
        >
          <Eye className="h-3.5 w-3.5" />
          {copy.playbookPage.view}
        </Button>
        <Button
          type="button"
          onClick={(event) => {
            stopEvent(event);
            onEdit(note);
          }}
          variant="outline"
          size="sm"
        >
          <Pencil className="h-3.5 w-3.5" />
          {copy.playbookPage.edit}
        </Button>
        <Button
          type="button"
          onClick={(event) => {
            stopEvent(event);
            onTogglePin(note);
          }}
          variant="secondary"
          size="sm"
        >
          <Star className={cn("h-3.5 w-3.5", note.pinned && "fill-current")} />
          {note.pinned ? copy.notesPage.unpin : copy.notesPage.pin}
        </Button>
        <Button
          type="button"
          onClick={(event) => {
            stopEvent(event);
            if (isArchived) {
              onRestore(note);
              return;
            }

            onArchive(note);
          }}
          variant="secondary"
          size="sm"
        >
          {isArchived ? (
            <RotateCcw className="h-3.5 w-3.5" />
          ) : (
            <Archive className="h-3.5 w-3.5" />
          )}
          {isArchived ? copy.notesPage.restore : copy.notesPage.archive}
        </Button>
      </div>
    </Card>
  );
}
