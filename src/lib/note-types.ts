import { isRecord, isStringArray } from "@/lib/guards";
import { isValidDateKey } from "@/lib/utils";

export type NoteType =
  | "general"
  | "marketObservation"
  | "tradeIdea"
  | "mistake"
  | "rule"
  | "strategy"
  | "review";

export type NoteStatus = "active" | "archived";

export type NoteLink =
  | { type: "trade"; tradeId: string }
  | { type: "date"; date: string }
  | { type: "playbook"; playbookId: string }
  | { type: "none" };

export type Note = {
  id: string;
  title: string;
  content: string;
  type: NoteType;
  status: NoteStatus;
  pinned: boolean;
  tags: string[];
  link: NoteLink;
  createdAt: string;
  updatedAt: string;
};

export type NoteInput = Omit<Note, "id" | "createdAt" | "updatedAt">;
export type NotePatch = Partial<NoteInput>;

export const noteTypes = [
  "general",
  "marketObservation",
  "tradeIdea",
  "mistake",
  "rule",
  "strategy",
  "review",
] as const satisfies readonly NoteType[];

export const noteStatuses = [
  "active",
  "archived",
] as const satisfies readonly NoteStatus[];

export const noteLinkTypes = [
  "none",
  "trade",
  "date",
  "playbook",
] as const satisfies readonly NoteLink["type"][];

export function isNoteType(value: unknown): value is NoteType {
  return noteTypes.some((type) => type === value);
}

export function isNoteStatus(value: unknown): value is NoteStatus {
  return noteStatuses.some((status) => status === value);
}

export function isNoteDateKey(value: unknown): value is string {
  return typeof value === "string" && isValidDateKey(value);
}

export function isNoteLink(value: unknown): value is NoteLink {
  if (!isRecord(value) || typeof value.type !== "string") {
    return false;
  }

  if (value.type === "none") {
    return true;
  }

  if (value.type === "trade") {
    return typeof value.tradeId === "string";
  }

  if (value.type === "date") {
    return isNoteDateKey(value.date);
  }

  if (value.type === "playbook") {
    return typeof value.playbookId === "string";
  }

  return false;
}

export function normalizeNote(value: unknown): Note | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.id !== "string" || typeof value.title !== "string") {
    return null;
  }

  return {
    id: value.id,
    title: value.title,
    content: typeof value.content === "string" ? value.content : "",
    type: isNoteType(value.type) ? value.type : "general",
    status: isNoteStatus(value.status) ? value.status : "active",
    pinned: typeof value.pinned === "boolean" ? value.pinned : false,
    tags: isStringArray(value.tags) ? value.tags : [],
    link: isNoteLink(value.link) ? value.link : { type: "none" },
    createdAt:
      typeof value.createdAt === "string"
        ? value.createdAt
        : new Date().toISOString(),
    updatedAt:
      typeof value.updatedAt === "string"
        ? value.updatedAt
        : new Date().toISOString(),
  };
}

export function normalizeNotes(value: unknown): Note[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const notes = value.map(normalizeNote);

  return notes.every((note): note is Note => note !== null) ? notes : null;
}
