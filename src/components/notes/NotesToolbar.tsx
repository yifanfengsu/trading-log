"use client";

import { RotateCcw, Search } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Toolbar from "@/components/ui/Toolbar";
import type { NoteFilters } from "@/lib/note-calculations";
import { noteLinkTypes, noteTypes, type NoteLink, type NoteStatus, type NoteType } from "@/lib/note-types";

interface NotesToolbarProps {
  filters: NoteFilters;
  tags: string[];
  onFiltersChange: (filters: NoteFilters) => void;
  onReset: () => void;
}

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
    <Toolbar>
      <div className="grid gap-3 xl:grid-cols-[minmax(260px,1.5fr)_repeat(4,minmax(150px,1fr))_auto]">
        <label className="relative block">
          <span className="sr-only">{copy.notesPage.searchPlaceholder}</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
          <Input
            type="search"
            value={filters.query}
            onChange={(event) => updateFilter("query", event.target.value)}
            className="pl-9"
            placeholder={copy.notesPage.searchPlaceholder}
          />
        </label>

        <label className="block">
          <span className="sr-only">{copy.notesPage.allTypes}</span>
          <Select
            value={filters.type}
            onChange={(event) =>
              updateFilter("type", event.target.value as "all" | NoteType)
            }
          >
            <option value="all">{copy.notesPage.allTypes}</option>
            {noteTypes.map((type) => (
              <option key={type} value={type}>
                {copy.noteTypes[type]}
              </option>
            ))}
          </Select>
        </label>

        <label className="block">
          <span className="sr-only">{copy.notesPage.allStatuses}</span>
          <Select
            value={filters.status}
            onChange={(event) =>
              updateFilter("status", event.target.value as "all" | NoteStatus)
            }
          >
            {noteStatusOptions().map((status) => (
              <option key={status} value={status}>
                {status === "all"
                  ? copy.notesPage.allStatuses
                  : copy.noteStatus[status]}
              </option>
            ))}
          </Select>
        </label>

        <label className="block">
          <span className="sr-only">{copy.notesPage.allLinks}</span>
          <Select
            value={filters.linkType}
            onChange={(event) =>
              updateFilter("linkType", event.target.value as "all" | NoteLink["type"])
            }
          >
            <option value="all">{copy.notesPage.allLinks}</option>
            {noteLinkTypes.map((linkType) => (
              <option key={linkType} value={linkType}>
                {copy.noteLinkTypes[linkType]}
              </option>
            ))}
          </Select>
        </label>

        <label className="block">
          <span className="sr-only">{copy.notesPage.allTags}</span>
          <Select
            value={filters.tag}
            onChange={(event) => updateFilter("tag", event.target.value)}
          >
            <option value="all">{copy.notesPage.allTags}</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </Select>
        </label>

        <Button onClick={onReset} variant="secondary">
          <RotateCcw className="h-4 w-4" />
          <span className="whitespace-nowrap">{copy.tradesPage.resetFilters}</span>
        </Button>
      </div>
    </Toolbar>
  );
}
