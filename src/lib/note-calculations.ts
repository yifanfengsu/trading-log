import type { Note, NoteLink, NoteStatus, NoteType } from "@/lib/note-types";

export type NoteFilters = {
  query: string;
  type: "all" | NoteType;
  status: "all" | NoteStatus;
  linkType: "all" | NoteLink["type"];
  tag: "all" | string;
};

export type NotesSummary = {
  totalNotes: number;
  pinnedNotes: number;
  archivedNotes: number;
  linkedNotes: number;
};

export const defaultNoteFilters: NoteFilters = {
  query: "",
  type: "all",
  status: "all",
  linkType: "all",
  tag: "all",
};

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function matchesQuery(note: Note, query: string) {
  const normalizedQuery = normalizeSearch(query);

  if (!normalizedQuery) {
    return true;
  }

  return (
    note.title.toLowerCase().includes(normalizedQuery) ||
    note.content.toLowerCase().includes(normalizedQuery) ||
    note.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
  );
}

export function getNotesSummary(notes: Note[]): NotesSummary {
  return {
    totalNotes: notes.length,
    pinnedNotes: notes.filter((note) => note.pinned).length,
    archivedNotes: notes.filter((note) => note.status === "archived").length,
    linkedNotes: notes.filter((note) => note.link.type !== "none").length,
  };
}

export function filterNotes(notes: Note[], filters: NoteFilters): Note[] {
  return notes
    .filter((note) => matchesQuery(note, filters.query))
    .filter((note) => filters.type === "all" || note.type === filters.type)
    .filter(
      (note) => filters.status === "all" || note.status === filters.status,
    )
    .filter(
      (note) => filters.linkType === "all" || note.link.type === filters.linkType,
    )
    .filter((note) => filters.tag === "all" || note.tags.includes(filters.tag))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }

      return b.updatedAt.localeCompare(a.updatedAt);
    });
}

export function getAllNoteTags(notes: Note[]) {
  const tags: string[] = [];

  notes.forEach((note) => {
    note.tags.forEach((tag) => {
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    });
  });

  return tags;
}

export function getNotesByLink(notes: Note[], link: NoteLink) {
  return notes.filter((note) => {
    if (link.type === "none") {
      return note.link.type === "none";
    }

    if (link.type === "trade") {
      return note.link.type === "trade" && note.link.tradeId === link.tradeId;
    }

    if (link.type === "date") {
      return note.link.type === "date" && note.link.date === link.date;
    }

    return note.link.type === "playbook" && note.link.playbookId === link.playbookId;
  });
}
