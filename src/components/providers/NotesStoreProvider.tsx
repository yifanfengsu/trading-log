"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import { useCollectionStore } from "@/components/providers/use-collection-store";
import { getSeedNotes } from "@/lib/note-seed";
import type { Note, NoteInput, NotePatch } from "@/lib/note-types";
import { normalizeNotes } from "@/lib/note-types";
import { getLocalDateTime } from "@/lib/utils";

// Legacy localStorage key — only read once, during the one-time migration into
// SQLite. Notes are now persisted server-side via /api/notes.
export const NOTES_STORAGE_KEY = "trade-journal-notes-v1";

// Set in localStorage after the legacy notes have been imported into SQLite so
// the migration never runs twice. The legacy data itself is left in place.
const NOTES_MIGRATION_FLAG_KEY = "notes-migrated-to-sqlite";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

interface NotesStoreContextValue {
  notes: Note[];
  addNote: (input: NoteInput) => void;
  updateNote: (id: string, patch: NotePatch) => void;
  archiveNote: (id: string) => void;
  restoreNote: (id: string) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;
  replaceNotes: (notes: Note[]) => void;
  clearNotes: () => void;
  resetNotesToSeed: () => void;
  reloadNotes: () => Promise<void>;
  getNoteById: (id: string) => Note | undefined;
  getNotesForTrade: (tradeId: string) => Note[];
  getNotesForDate: (date: string) => Note[];
  getNotesForPlaybook: (playbookId: string) => Note[];
}

const NotesStoreContext = createContext<NotesStoreContextValue | null>(null);

function parseStoredNotes(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return normalizeNotes(parsed);
  } catch {
    return null;
  }
}

function createNoteId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `note-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeNoteInput(input: NoteInput): NoteInput {
  return {
    ...input,
    title: input.title.trim(),
    content: input.content,
    tags: input.tags
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0),
  };
}

function sortNotes(notes: Note[]) {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1;
    }

    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

const collectionConfig = {
  name: "notes",
  basePath: "/api/notes",
  sort: sortNotes,
  seed: getSeedNotes,
  legacy: {
    storageKey: NOTES_STORAGE_KEY,
    migrationFlagKey: NOTES_MIGRATION_FLAG_KEY,
    parse: parseStoredNotes,
  },
};

export function NotesStoreProvider({ children }: { children: ReactNode }) {
  const {
    items: notes,
    itemsRef: notesRef,
    apply: applyNotes,
    persist,
    reload: reloadNotes,
    replace: replaceNotes,
    clear: clearNotes,
    reset: resetNotesToSeed,
  } = useCollectionStore<Note>(collectionConfig);

  const addNote = useCallback(
    (input: NoteInput) => {
      const now = getLocalDateTime();
      const nextNote: Note = {
        ...normalizeNoteInput(input),
        id: createNoteId(),
        createdAt: now,
        updatedAt: now,
      };
      const previousNotes = notesRef.current;

      applyNotes([...previousNotes, nextNote]);

      void persist(
        () =>
          fetch("/api/notes", {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify(nextNote),
          }),
        previousNotes,
        "POST /api/notes",
      );
    },
    [applyNotes, persist, notesRef],
  );

  const updateNote = useCallback(
    (id: string, patch: NotePatch) => {
      const existingNote = notesRef.current.find((note) => note.id === id);

      if (!existingNote) {
        return;
      }

      const now = getLocalDateTime();
      const nextNote: Note = {
        ...existingNote,
        ...normalizeNoteInput({
          title: patch.title ?? existingNote.title,
          content: patch.content ?? existingNote.content,
          type: patch.type ?? existingNote.type,
          status: patch.status ?? existingNote.status,
          pinned: patch.pinned ?? existingNote.pinned,
          tags: patch.tags ?? existingNote.tags,
          link: patch.link ?? existingNote.link,
        }),
        id: existingNote.id,
        createdAt: existingNote.createdAt,
        updatedAt: now,
      };
      const previousNotes = notesRef.current;

      applyNotes(
        previousNotes.map((note) => (note.id === id ? nextNote : note)),
      );

      void persist(
        () =>
          fetch(`/api/notes/${id}`, {
            method: "PUT",
            headers: JSON_HEADERS,
            body: JSON.stringify(nextNote),
          }),
        previousNotes,
        `PUT /api/notes/${id}`,
      );
    },
    [applyNotes, persist, notesRef],
  );

  const archiveNote = useCallback(
    (id: string) => {
      updateNote(id, { status: "archived" });
    },
    [updateNote],
  );

  const restoreNote = useCallback(
    (id: string) => {
      updateNote(id, { status: "active" });
    },
    [updateNote],
  );

  const deleteNote = useCallback(
    (id: string) => {
      const previousNotes = notesRef.current;

      applyNotes(previousNotes.filter((note) => note.id !== id));

      void persist(
        () => fetch(`/api/notes/${id}`, { method: "DELETE" }),
        previousNotes,
        `DELETE /api/notes/${id}`,
      );
    },
    [applyNotes, persist, notesRef],
  );

  const togglePinNote = useCallback(
    (id: string) => {
      const note = notesRef.current.find((currentNote) => currentNote.id === id);

      if (note) {
        updateNote(id, { pinned: !note.pinned });
      }
    },
    [updateNote, notesRef],
  );

  const getNoteById = useCallback(
    (id: string) => notes.find((note) => note.id === id),
    [notes],
  );

  const getNotesForTrade = useCallback(
    (tradeId: string) =>
      notes.filter(
        (note) => note.link.type === "trade" && note.link.tradeId === tradeId,
      ),
    [notes],
  );

  const getNotesForDate = useCallback(
    (date: string) =>
      notes.filter((note) => note.link.type === "date" && note.link.date === date),
    [notes],
  );

  const getNotesForPlaybook = useCallback(
    (playbookId: string) =>
      notes.filter(
        (note) =>
          note.link.type === "playbook" && note.link.playbookId === playbookId,
      ),
    [notes],
  );

  const value = useMemo(
    () => ({
      notes,
      addNote,
      updateNote,
      archiveNote,
      restoreNote,
      deleteNote,
      togglePinNote,
      replaceNotes,
      clearNotes,
      resetNotesToSeed,
      reloadNotes,
      getNoteById,
      getNotesForTrade,
      getNotesForDate,
      getNotesForPlaybook,
    }),
    [
      addNote,
      archiveNote,
      clearNotes,
      deleteNote,
      getNoteById,
      getNotesForDate,
      getNotesForPlaybook,
      getNotesForTrade,
      notes,
      reloadNotes,
      replaceNotes,
      resetNotesToSeed,
      restoreNote,
      togglePinNote,
      updateNote,
    ],
  );

  return (
    <NotesStoreContext.Provider value={value}>
      {children}
    </NotesStoreContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesStoreContext);

  if (!context) {
    throw new Error("useNotes must be used within NotesStoreProvider");
  }

  return context;
}
