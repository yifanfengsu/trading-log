"use client";

import NoteCard from "@/components/notes/NoteCard";
import type { Note } from "@/lib/note-types";
import type { Playbook } from "@/lib/playbook-types";
import type { Trade } from "@/lib/trade-types";

interface NotesListProps {
  notes: Note[];
  trades: Trade[];
  playbooks: Playbook[];
  onView: (note: Note) => void;
  onEdit: (note: Note) => void;
  onTogglePin: (note: Note) => void;
  onArchive: (note: Note) => void;
  onRestore: (note: Note) => void;
}

export default function NotesList({
  notes,
  trades,
  playbooks,
  onView,
  onEdit,
  onTogglePin,
  onArchive,
  onRestore,
}: NotesListProps) {
  return (
    <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          trades={trades}
          playbooks={playbooks}
          onView={onView}
          onEdit={onEdit}
          onTogglePin={onTogglePin}
          onArchive={onArchive}
          onRestore={onRestore}
        />
      ))}
    </section>
  );
}
