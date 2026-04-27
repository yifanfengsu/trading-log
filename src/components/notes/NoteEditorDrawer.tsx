"use client";

import { Check } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useNotes } from "@/components/providers/NotesStoreProvider";
import { usePlaybooks } from "@/components/providers/PlaybookStoreProvider";
import { useTrades } from "@/components/providers/TradeStoreProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import Button from "@/components/ui/Button";
import DrawerShell from "@/components/ui/DrawerShell";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import {
  isNoteDateKey,
  noteLinkTypes,
  noteStatuses,
  noteTypes,
  type Note,
  type NoteInput,
  type NoteLink,
  type NoteStatus,
  type NoteType,
} from "@/lib/note-types";
import {
  formatCurrency,
  formatDateTime,
  getTodayDateKey,
} from "@/lib/utils";

type NoteEditorMode = "create" | "edit";

interface NoteEditorDrawerProps {
  mode: NoteEditorMode;
  note?: Note;
  initialLink?: NoteLink;
  initialTitle?: string;
  initialType?: NoteType;
  onClose: () => void;
}

interface NoteFormState {
  title: string;
  content: string;
  type: NoteType;
  status: NoteStatus;
  pinned: boolean;
  tags: string;
  linkType: NoteLink["type"];
  tradeId: string;
  date: string;
  playbookId: string;
}

function parseTags(value: string) {
  return value
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

function getInitialLinkState(link: NoteLink | undefined) {
  if (!link || link.type === "none") {
    return {
      linkType: "none" as const,
      tradeId: "",
      date: "",
      playbookId: "",
    };
  }

  if (link.type === "trade") {
    return {
      linkType: "trade" as const,
      tradeId: link.tradeId,
      date: "",
      playbookId: "",
    };
  }

  if (link.type === "date") {
    return {
      linkType: "date" as const,
      tradeId: "",
      date: link.date,
      playbookId: "",
    };
  }

  return {
    linkType: "playbook" as const,
    tradeId: "",
    date: "",
    playbookId: link.playbookId,
  };
}

function getInitialFormState({
  note,
  initialLink,
  initialTitle,
  initialType,
}: {
  note?: Note;
  initialLink?: NoteLink;
  initialTitle?: string;
  initialType?: NoteType;
}): NoteFormState {
  const linkState = getInitialLinkState(note?.link ?? initialLink);

  return {
    title: note?.title ?? initialTitle ?? "",
    content: note?.content ?? "",
    type: note?.type ?? initialType ?? "general",
    status: note?.status ?? "active",
    pinned: note?.pinned ?? false,
    tags: note?.tags.join(", ") ?? "",
    ...linkState,
  };
}

export default function NoteEditorDrawer({
  mode,
  note,
  initialLink,
  initialTitle,
  initialType,
  onClose,
}: NoteEditorDrawerProps) {
  const { dictionary: copy, locale } = useLanguage();
  const { addNote, updateNote } = useNotes();
  const { trades } = useTrades();
  const { playbooks } = usePlaybooks();
  const { settings } = useUserSettings();
  const [form, setForm] = useState<NoteFormState>(() =>
    getInitialFormState({ note, initialLink, initialTitle, initialType }),
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<number | null>(null);
  const title =
    mode === "create" ? copy.notesPage.newNote : copy.notesPage.editNote;
  const saveLabel =
    saved
      ? copy.reportsPage.saved
      : mode === "create"
        ? copy.notesPage.saveNote
        : copy.notesPage.saveChanges;
  const selectedTrade = trades.find((trade) => trade.id === form.tradeId);
  const selectedPlaybook = playbooks.find(
    (playbook) => playbook.id === form.playbookId,
  );

  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    },
    [],
  );

  function updateField<Key extends keyof NoteFormState>(
    key: Key,
    value: NoteFormState[Key],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
    setError(null);
  }

  function handleLinkTypeChange(linkType: NoteLink["type"]) {
    setForm((currentForm) => ({
      ...currentForm,
      linkType,
      date:
        linkType === "date" && !currentForm.date
          ? getTodayDateKey()
          : currentForm.date,
    }));
    setError(null);
  }

  function buildLink(): NoteLink | null {
    if (form.linkType === "none") {
      return { type: "none" };
    }

    if (form.linkType === "trade") {
      return form.tradeId ? { type: "trade", tradeId: form.tradeId } : null;
    }

    if (form.linkType === "date") {
      return isNoteDateKey(form.date) ? { type: "date", date: form.date } : null;
    }

    return form.playbookId
      ? { type: "playbook", playbookId: form.playbookId }
      : null;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const titleValue = form.title.trim();
    const link = buildLink();

    if (!titleValue) {
      setError(copy.notesPage.titleRequired);
      return;
    }

    if (!link) {
      setError(copy.notesPage.linkRequired);
      return;
    }

    const input: NoteInput = {
      title: titleValue,
      content: form.content,
      type: form.type,
      status: form.status,
      pinned: form.pinned,
      tags: parseTags(form.tags),
      link,
    };

    if (mode === "edit" && note) {
      updateNote(note.id, input);
    } else {
      addNote(input);
    }

    setSaved(true);
    timerRef.current = window.setTimeout(onClose, 300);
  }

  return (
    <DrawerShell
      title={title}
      eyebrow={`${copy.notesPage.type}: ${copy.noteTypes[form.type]}`}
      closeLabel={copy.tradeForm.cancel}
      labelledById="note-editor-title"
      onClose={onClose}
      size="lg"
      zIndexClassName="z-[70]"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button type="button" onClick={onClose} variant="secondary">
            {copy.tradeForm.cancel}
          </Button>
          <Button type="submit" form="note-editor-form">
            {saved ? <Check className="h-4 w-4" /> : null}
            {saveLabel}
          </Button>
        </div>
      }
    >
        <form
          id="note-editor-form"
          onSubmit={handleSubmit}
          className="grid gap-4"
        >
            <label className="block text-sm font-medium text-slate-600">
              {copy.notesPage.titleField}
              <Input
                type="text"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                className="mt-2"
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-600">
                {copy.notesPage.type}
                <Select
                  value={form.type}
                  onChange={(event) =>
                    updateField("type", event.target.value as NoteType)
                  }
                  className="mt-2"
                >
                  {noteTypes.map((type) => (
                    <option key={type} value={type}>
                      {copy.noteTypes[type]}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="block text-sm font-medium text-slate-600">
                {copy.notesPage.status}
                <Select
                  value={form.status}
                  onChange={(event) =>
                    updateField("status", event.target.value as NoteStatus)
                  }
                  className="mt-2"
                >
                  {noteStatuses.map((status) => (
                    <option key={status} value={status}>
                      {copy.noteStatus[status]}
                    </option>
                  ))}
                </Select>
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-600">
              {copy.notesPage.content}
              <Textarea
                value={form.content}
                onChange={(event) => updateField("content", event.target.value)}
                className="mt-2 min-h-40 resize-y leading-6"
              />
            </label>

            <label className="block text-sm font-medium text-slate-600">
              {copy.notesPage.tags}
              <Input
                type="text"
                value={form.tags}
                onChange={(event) => updateField("tags", event.target.value)}
                className="mt-2"
                placeholder={copy.playbookPage.tagsPlaceholder}
              />
            </label>

            <label className="flex items-center gap-3 rounded-[18px] bg-[rgba(250,250,255,0.88)] px-4 py-3 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.pinned}
                onChange={(event) => updateField("pinned", event.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              {copy.notesPage.pinNote}
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-600">
                {copy.notesPage.linkType}
                <Select
                  value={form.linkType}
                  onChange={(event) =>
                    handleLinkTypeChange(event.target.value as NoteLink["type"])
                  }
                  className="mt-2"
                >
                  {noteLinkTypes.map((linkType) => (
                    <option key={linkType} value={linkType}>
                      {copy.noteLinkTypes[linkType]}
                    </option>
                  ))}
                </Select>
              </label>

              {form.linkType === "trade" ? (
                <label className="block text-sm font-medium text-slate-600">
                  {copy.notesPage.selectTrade}
                  <Select
                    value={form.tradeId}
                    onChange={(event) =>
                      updateField("tradeId", event.target.value)
                    }
                    className="mt-2"
                  >
                    <option value="">{copy.notesPage.selectTrade}</option>
                    {trades.map((trade) => (
                      <option key={trade.id} value={trade.id}>
                        {trade.symbol} · {formatDateTime(trade.closedAt, locale)} ·{" "}
                        {formatCurrency(trade.pnl, {
                          currency: settings.currency,
                          signed: true,
                        })}
                      </option>
                    ))}
                    {form.tradeId && !selectedTrade ? (
                      <option value={form.tradeId}>
                        {copy.notesPage.deletedTrade}
                      </option>
                    ) : null}
                  </Select>
                </label>
              ) : null}

              {form.linkType === "date" ? (
                <label className="block text-sm font-medium text-slate-600">
                  {copy.notesPage.selectDate}
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(event) => updateField("date", event.target.value)}
                    className="mt-2"
                  />
                </label>
              ) : null}

              {form.linkType === "playbook" ? (
                <label className="block text-sm font-medium text-slate-600">
                  {copy.notesPage.selectPlaybook}
                  <Select
                    value={form.playbookId}
                    onChange={(event) =>
                      updateField("playbookId", event.target.value)
                    }
                    className="mt-2"
                  >
                    <option value="">{copy.notesPage.selectPlaybook}</option>
                    {playbooks.map((playbook) => (
                      <option key={playbook.id} value={playbook.id}>
                        {playbook.name}
                      </option>
                    ))}
                    {form.playbookId && !selectedPlaybook ? (
                      <option value={form.playbookId}>
                        {copy.notesPage.deletedPlaybook}
                      </option>
                    ) : null}
                  </Select>
                </label>
              ) : null}
            </div>

          {error ? (
            <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {error}
            </p>
          ) : null}
        </form>
    </DrawerShell>
  );
}
