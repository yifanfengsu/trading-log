"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { getSeedNotes } from "@/lib/note-seed";
import type { Note, NoteInput, NotePatch } from "@/lib/note-types";
import { normalizeNotes } from "@/lib/note-types";

export const NOTES_STORAGE_KEY = "trade-journal-notes-v1";

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

function persistNotes(notes: Note[]) {
  window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
}

export function NotesStoreProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const notesRef = useRef<Note[]>([]);

  const commitNotes = useCallback((nextNotes: Note[]) => {
    const sortedNotes = sortNotes(nextNotes);
    notesRef.current = sortedNotes;
    setNotes(sortedNotes);
    persistNotes(sortedNotes);
  }, []);

  useEffect(() => {
    const storedNotes = parseStoredNotes(
      window.localStorage.getItem(NOTES_STORAGE_KEY),
    );

    const nextNotes = storedNotes !== null ? storedNotes : getSeedNotes();

    if (storedNotes === null) {
      persistNotes(sortNotes(nextNotes));
    }

    const timeoutId = window.setTimeout(() => {
      const sortedNotes = sortNotes(nextNotes);
      notesRef.current = sortedNotes;
      setNotes(sortedNotes);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const addNote = useCallback(
    (input: NoteInput) => {
      const now = new Date().toISOString();
      const nextNote: Note = {
        ...normalizeNoteInput(input),
        id: createNoteId(),
        createdAt: now,
        updatedAt: now,
      };

      commitNotes([...notesRef.current, nextNote]);
    },
    [commitNotes],
  );

  const updateNote = useCallback(
    (id: string, patch: NotePatch) => {
      const now = new Date().toISOString();
      const nextNotes = notesRef.current.map((note) =>
        note.id === id
          ? {
              ...note,
              ...normalizeNoteInput({
                title: patch.title ?? note.title,
                content: patch.content ?? note.content,
                type: patch.type ?? note.type,
                status: patch.status ?? note.status,
                pinned: patch.pinned ?? note.pinned,
                tags: patch.tags ?? note.tags,
                link: patch.link ?? note.link,
              }),
              id: note.id,
              createdAt: note.createdAt,
              updatedAt: now,
            }
          : note,
      );

      commitNotes(nextNotes);
    },
    [commitNotes],
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
      commitNotes(notesRef.current.filter((note) => note.id !== id));
    },
    [commitNotes],
  );

  const togglePinNote = useCallback(
    (id: string) => {
      const note = notesRef.current.find((currentNote) => currentNote.id === id);

      if (note) {
        updateNote(id, { pinned: !note.pinned });
      }
    },
    [updateNote],
  );

  const replaceNotes = useCallback(
    (nextNotes: Note[]) => {
      commitNotes([...nextNotes]);
    },
    [commitNotes],
  );

  const clearNotes = useCallback(() => {
    commitNotes([]);
  }, [commitNotes]);

  const resetNotesToSeed = useCallback(() => {
    commitNotes(getSeedNotes());
  }, [commitNotes]);

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
