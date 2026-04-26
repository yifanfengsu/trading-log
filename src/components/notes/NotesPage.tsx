"use client";

import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import NoteDetailDrawer from "@/components/notes/NoteDetailDrawer";
import NoteEditorDrawer from "@/components/notes/NoteEditorDrawer";
import NotesEmptyState from "@/components/notes/NotesEmptyState";
import NotesList from "@/components/notes/NotesList";
import NotesToolbar from "@/components/notes/NotesToolbar";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useNotes } from "@/components/providers/NotesStoreProvider";
import { usePlaybooks } from "@/components/providers/PlaybookStoreProvider";
import { useTrades } from "@/components/providers/TradeStoreProvider";
import {
  defaultNoteFilters,
  filterNotes,
  getAllNoteTags,
  getNotesSummary,
  type NoteFilters,
} from "@/lib/note-calculations";
import type { Note, NoteLink, NoteType } from "@/lib/note-types";
import { cn, formatDateLabel } from "@/lib/utils";

type EditorState =
  | {
      mode: "create";
      initialLink?: NoteLink;
      initialTitle?: string;
      initialType?: NoteType;
    }
  | {
      mode: "edit";
      note: Note;
    };

interface NotesPageProps {
  initialLink?: NoteLink | null;
  initialLinkKey?: string | null;
}

interface SummaryCardProps {
  label: string;
  value: string;
  tone?: "neutral" | "accent";
}

function SummaryCard({ label, value, tone = "neutral" }: SummaryCardProps) {
  return (
    <article className="panel-card p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p
        className={cn(
          "mt-5 text-[30px] font-semibold tracking-[-0.04em]",
          tone === "accent" ? "text-[var(--accent)]" : "text-slate-950",
        )}
      >
        {value}
      </p>
    </article>
  );
}

export default function NotesPage({
  initialLink = null,
  initialLinkKey = null,
}: NotesPageProps) {
  const { dictionary: copy, locale } = useLanguage();
  const {
    notes,
    archiveNote,
    restoreNote,
    togglePinNote,
  } = useNotes();
  const { trades } = useTrades();
  const { playbooks } = usePlaybooks();
  const [filters, setFilters] = useState<NoteFilters>(defaultNoteFilters);
  const [detailNoteId, setDetailNoteId] = useState<string | null>(null);
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const openedInitialLinkKeyRef = useRef<string | null>(null);
  const summary = useMemo(() => getNotesSummary(notes), [notes]);
  const tags = useMemo(() => getAllNoteTags(notes), [notes]);
  const filteredNotes = useMemo(
    () => filterNotes(notes, filters),
    [filters, notes],
  );
  const detailNote = detailNoteId
    ? notes.find((note) => note.id === detailNoteId)
    : undefined;

  const getDefaultTitleForLink = useCallback((link: NoteLink) => {
    if (link.type === "trade") {
      const trade = trades.find((item) => item.id === link.tradeId);
      return `${copy.notesPage.tradeNoteTitle} - ${
        trade?.symbol ?? copy.notesPage.deletedTrade
      }`;
    }

    if (link.type === "date") {
      return `${copy.notesPage.dateNoteTitle} - ${formatDateLabel(
        link.date,
        locale,
      )}`;
    }

    if (link.type === "playbook") {
      const playbook = playbooks.find((item) => item.id === link.playbookId);
      return `${copy.notesPage.playbookNoteTitle} - ${
        playbook?.name ?? copy.notesPage.deletedPlaybook
      }`;
    }

    return copy.notesPage.newNote;
  }, [copy.notesPage, locale, playbooks, trades]);

  function openCreateNote() {
    setDetailNoteId(null);
    setEditorState({ mode: "create" });
  }

  function openEditNote(note: Note) {
    setDetailNoteId(null);
    setEditorState({ mode: "edit", note });
  }

  useEffect(() => {
    if (
      !initialLink ||
      !initialLinkKey ||
      openedInitialLinkKeyRef.current === initialLinkKey
    ) {
      return;
    }

    openedInitialLinkKeyRef.current = initialLinkKey;
    setDetailNoteId(null);
    setEditorState({
      mode: "create",
      initialLink,
      initialTitle: getDefaultTitleForLink(initialLink),
      initialType: initialLink.type === "playbook" ? "strategy" : "review",
    });
  }, [getDefaultTitleForLink, initialLink, initialLinkKey]);

  return (
    <>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-[30px]">
            {copy.notesPage.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {copy.notesPage.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateNote}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(108,77,255,0.22)] transition-colors hover:bg-[var(--accent-strong)]"
        >
          <Plus className="h-4 w-4" />
          {copy.notesPage.newNote}
        </button>
      </section>

      <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
        <SummaryCard
          label={copy.notesPage.totalNotes}
          value={String(summary.totalNotes)}
          tone="accent"
        />
        <SummaryCard
          label={copy.notesPage.pinnedNotes}
          value={String(summary.pinnedNotes)}
        />
        <SummaryCard
          label={copy.notesPage.archived}
          value={String(summary.archivedNotes)}
        />
        <SummaryCard
          label={copy.notesPage.linkedNotes}
          value={String(summary.linkedNotes)}
        />
      </section>

      {notes.length === 0 ? (
        <NotesEmptyState
          title={copy.notesPage.noNotesYet}
          actionLabel={copy.notesPage.newNote}
          onCreate={openCreateNote}
        />
      ) : (
        <>
          <NotesToolbar
            filters={filters}
            tags={tags}
            onFiltersChange={setFilters}
            onReset={() => setFilters(defaultNoteFilters)}
          />

          {filteredNotes.length === 0 ? (
            <section className="panel-card px-5 py-14 text-center">
              <p className="text-sm font-semibold text-slate-500">
                {copy.notesPage.noFilterResults}
              </p>
              <button
                type="button"
                onClick={() => setFilters(defaultNoteFilters)}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(108,77,255,0.18)]"
              >
                {copy.tradesPage.resetFilters}
              </button>
            </section>
          ) : (
            <NotesList
              notes={filteredNotes}
              trades={trades}
              playbooks={playbooks}
              onView={(note) => setDetailNoteId(note.id)}
              onEdit={openEditNote}
              onTogglePin={(note) => togglePinNote(note.id)}
              onArchive={(note) => archiveNote(note.id)}
              onRestore={(note) => restoreNote(note.id)}
            />
          )}
        </>
      )}

      {detailNote ? (
        <NoteDetailDrawer
          note={detailNote}
          trades={trades}
          playbooks={playbooks}
          onClose={() => setDetailNoteId(null)}
          onEdit={openEditNote}
        />
      ) : null}

      {editorState ? (
        <NoteEditorDrawer
          mode={editorState.mode}
          note={editorState.mode === "edit" ? editorState.note : undefined}
          initialLink={
            editorState.mode === "create" ? editorState.initialLink : undefined
          }
          initialTitle={
            editorState.mode === "create" ? editorState.initialTitle : undefined
          }
          initialType={
            editorState.mode === "create" ? editorState.initialType : undefined
          }
          onClose={() => setEditorState(null)}
        />
      ) : null}
    </>
  );
}
