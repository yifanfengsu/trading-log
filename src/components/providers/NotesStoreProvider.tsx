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

async function fetchNotes(): Promise<Note[]> {
  const response = await fetch("/api/notes");

  if (!response.ok) {
    throw new Error(`GET /api/notes failed with status ${response.status}`);
  }

  const data: unknown = await response.json();
  return Array.isArray(data) ? (data as Note[]) : [];
}

// One-time import of legacy localStorage notes into SQLite. Runs only when the
// migration flag is unset (checked here) and the database is empty (checked by
// the caller). The flag is recorded even when there is no legacy data so the
// check never runs again — the marker, not "database empty", is the real gate.
async function migrateLegacyNotesIfNeeded(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  if (window.localStorage.getItem(NOTES_MIGRATION_FLAG_KEY)) {
    return false;
  }

  const legacyNotes = parseStoredNotes(
    window.localStorage.getItem(NOTES_STORAGE_KEY),
  );

  if (!legacyNotes || legacyNotes.length === 0) {
    window.localStorage.setItem(
      NOTES_MIGRATION_FLAG_KEY,
      new Date().toISOString(),
    );
    return false;
  }

  try {
    const response = await fetch("/api/notes/import", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(legacyNotes),
    });

    if (!response.ok) {
      throw new Error(`import failed with status ${response.status}`);
    }

    window.localStorage.setItem(
      NOTES_MIGRATION_FLAG_KEY,
      new Date().toISOString(),
    );

    return true;
  } catch (error) {
    console.error("[notes] migration from localStorage failed", error);
    return false;
  }
}

export function NotesStoreProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const notesRef = useRef<Note[]>([]);

  const applyNotes = useCallback((nextNotes: Note[]) => {
    const sortedNotes = sortNotes(nextNotes);
    notesRef.current = sortedNotes;
    setNotes(sortedNotes);
  }, []);

  const persist = useCallback(
    async (
      request: () => Promise<Response>,
      previousNotes: Note[],
      label: string,
    ) => {
      try {
        const response = await request();

        if (!response.ok) {
          throw new Error(`${label} failed with status ${response.status}`);
        }
      } catch (error) {
        console.error(`[notes] ${label} failed — rolling back`, error);
        applyNotes(previousNotes);
      }
    },
    [applyNotes],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        let serverNotes = await fetchNotes();

        if (serverNotes.length === 0) {
          const migrated = await migrateLegacyNotesIfNeeded();

          if (migrated) {
            serverNotes = await fetchNotes();
          }
        }

        if (!cancelled) {
          applyNotes(serverNotes);
        }
      } catch (error) {
        console.error("[notes] failed to load from API", error);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [applyNotes]);

  const addNote = useCallback(
    (input: NoteInput) => {
      const now = new Date().toISOString();
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
    [applyNotes, persist],
  );

  const updateNote = useCallback(
    (id: string, patch: NotePatch) => {
      const existingNote = notesRef.current.find((note) => note.id === id);

      if (!existingNote) {
        return;
      }

      const now = new Date().toISOString();
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
    [applyNotes, persist],
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
    [applyNotes, persist],
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
      const previousNotes = notesRef.current;
      const snapshot = [...nextNotes];

      applyNotes(snapshot);

      void persist(
        () =>
          fetch("/api/notes/import", {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify(snapshot),
          }),
        previousNotes,
        "POST /api/notes/import (replace)",
      );
    },
    [applyNotes, persist],
  );

  const clearNotes = useCallback(() => {
    const previousNotes = notesRef.current;

    applyNotes([]);

    void persist(
      () =>
        fetch("/api/notes/import", {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify([]),
        }),
      previousNotes,
      "POST /api/notes/import (clear)",
    );
  }, [applyNotes, persist]);

  const resetNotesToSeed = useCallback(() => {
    const seedNotes = getSeedNotes();
    const previousNotes = notesRef.current;

    applyNotes(seedNotes);

    void persist(
      () =>
        fetch("/api/notes/import", {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify(seedNotes),
        }),
      previousNotes,
      "POST /api/notes/import (reset)",
    );
  }, [applyNotes, persist]);

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
