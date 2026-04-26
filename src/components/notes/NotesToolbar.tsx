"use client";

import { RotateCcw, Search } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import type { NoteFilters } from "@/lib/note-calculations";
import { noteLinkTypes, noteTypes, type NoteLink, type NoteStatus, type NoteType } from "@/lib/note-types";

interface NotesToolbarProps {
  filters: NoteFilters;
  tags: string[];
  onFiltersChange: (filters: NoteFilters) => void;
  onReset: () => void;
}

const inputClass =
  "h-11 w-full rounded-2xl border border-[rgba(148,163,184,0.16)] bg-white px-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-300 focus:border-[rgba(108,77,255,0.38)]";

function noteStatusOptions(): Array<"all" | NoteStatus> {
  return ["all", "active", "archived"];
}

export default function NotesToolbar({
  filters,
  tags,
  onFiltersChange,
  onReset,
}: NotesToolbarProps) {
  const { dictionary: copy } = useLanguage();

  function updateFilter<Key extends keyof NoteFilters>(
    key: Key,
    value: NoteFilters[Key],
  ) {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  }

  return (
    <section className="panel-card p-5 lg:p-6">
      <div className="grid gap-3 xl:grid-cols-[minmax(260px,1.5fr)_repeat(4,minmax(150px,1fr))_auto]">
        <label className="relative block">
          <span className="sr-only">{copy.notesPage.searchPlaceholder}</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
          <input
            type="search"
            value={filters.query}
            onChange={(event) => updateFilter("query", event.target.value)}
            className={`${inputClass} pl-9`}
            placeholder={copy.notesPage.searchPlaceholder}
          />
        </label>

        <label className="block">
          <span className="sr-only">{copy.notesPage.allTypes}</span>
          <select
            value={filters.type}
            onChange={(event) =>
              updateFilter("type", event.target.value as "all" | NoteType)
            }
            className={inputClass}
          >
            <option value="all">{copy.notesPage.allTypes}</option>
            {noteTypes.map((type) => (
              <option key={type} value={type}>
                {copy.noteTypes[type]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">{copy.notesPage.allStatuses}</span>
          <select
            value={filters.status}
            onChange={(event) =>
              updateFilter("status", event.target.value as "all" | NoteStatus)
            }
            className={inputClass}
          >
            {noteStatusOptions().map((status) => (
              <option key={status} value={status}>
                {status === "all"
                  ? copy.notesPage.allStatuses
                  : copy.noteStatus[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">{copy.notesPage.allLinks}</span>
          <select
            value={filters.linkType}
            onChange={(event) =>
              updateFilter("linkType", event.target.value as "all" | NoteLink["type"])
            }
            className={inputClass}
          >
            <option value="all">{copy.notesPage.allLinks}</option>
            {noteLinkTypes.map((linkType) => (
              <option key={linkType} value={linkType}>
                {copy.noteLinkTypes[linkType]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">{copy.notesPage.allTags}</span>
          <select
            value={filters.tag}
            onChange={(event) => updateFilter("tag", event.target.value)}
            className={inputClass}
          >
            <option value="all">{copy.notesPage.allTags}</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[rgba(148,163,184,0.18)] bg-white px-4 text-sm font-semibold text-slate-600 shadow-[0_8px_18px_rgba(31,15,86,0.04)] transition-colors hover:text-slate-950"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="whitespace-nowrap">{copy.tradesPage.resetFilters}</span>
        </button>
      </div>
    </section>
  );
}
