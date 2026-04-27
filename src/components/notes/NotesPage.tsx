"use client";

import { Archive, Link2, NotebookPen, Pin, Plus } from "lucide-react";
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
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import {
  defaultNoteFilters,
  filterNotes,
  getAllNoteTags,
  getNotesSummary,
  type NoteFilters,
} from "@/lib/note-calculations";
import type { Note, NoteLink, NoteType } from "@/lib/note-types";
import { formatDateLabel } from "@/lib/utils";

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
      <PageHeader
        title={copy.notesPage.title}
        description={copy.notesPage.subtitle}
        actions={
          <Button onClick={openCreateNote}>
            <Plus className="h-4 w-4" />
            {copy.notesPage.newNote}
          </Button>
        }
      />

      <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
        <StatCard
          label={copy.notesPage.totalNotes}
          value={String(summary.totalNotes)}
          tone="accent"
          icon={NotebookPen}
        />
        <StatCard
          label={copy.notesPage.pinnedNotes}
          value={String(summary.pinnedNotes)}
          icon={Pin}
        />
        <StatCard
          label={copy.notesPage.archived}
          value={String(summary.archivedNotes)}
          icon={Archive}
        />
        <StatCard
          label={copy.notesPage.linkedNotes}
          value={String(summary.linkedNotes)}
          icon={Link2}
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
              <EmptyState
                title={copy.notesPage.noFilterResults}
                action={
                  <Button onClick={() => setFilters(defaultNoteFilters)}>
                    {copy.tradesPage.resetFilters}
                  </Button>
                }
              />
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
