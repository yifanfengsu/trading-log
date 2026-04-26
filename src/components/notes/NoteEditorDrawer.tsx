"use client";

import { Check, X } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useNotes } from "@/components/providers/NotesStoreProvider";
import { usePlaybooks } from "@/components/providers/PlaybookStoreProvider";
import { useTrades } from "@/components/providers/TradeStoreProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
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
  cn,
  formatCurrency,
  formatDateTime,
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

const inputClass =
  "mt-2 h-11 w-full rounded-2xl border border-[rgba(148,163,184,0.18)] bg-white px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-300 focus:border-[rgba(108,77,255,0.38)]";

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
    <div className="fixed inset-0 z-[70] flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/24 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={copy.tradeForm.cancel}
      />
      <aside className="relative flex h-full w-full max-w-[620px] flex-col overflow-hidden border-l border-white/70 bg-[rgba(255,255,255,0.97)] shadow-[0_24px_80px_rgba(31,15,86,0.18)]">
        <div className="flex items-start justify-between gap-4 border-b border-[rgba(148,163,184,0.14)] px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              {copy.notesPage.type}: {copy.noteTypes[form.type]}
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-950">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(15,23,42,0.04)] text-slate-500 transition-colors hover:bg-[rgba(15,23,42,0.08)] hover:text-slate-900"
            aria-label={copy.tradeForm.cancel}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5"
        >
          <div className="grid gap-4">
            <label className="block text-sm font-medium text-slate-600">
              {copy.notesPage.titleField}
              <input
                type="text"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                className={inputClass}
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-600">
                {copy.notesPage.type}
                <select
                  value={form.type}
                  onChange={(event) =>
                    updateField("type", event.target.value as NoteType)
                  }
                  className={inputClass}
                >
                  {noteTypes.map((type) => (
                    <option key={type} value={type}>
                      {copy.noteTypes[type]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-600">
                {copy.notesPage.status}
                <select
                  value={form.status}
                  onChange={(event) =>
                    updateField("status", event.target.value as NoteStatus)
                  }
                  className={inputClass}
                >
                  {noteStatuses.map((status) => (
                    <option key={status} value={status}>
                      {copy.noteStatus[status]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-600">
              {copy.notesPage.content}
              <textarea
                value={form.content}
                onChange={(event) => updateField("content", event.target.value)}
                className={cn(inputClass, "min-h-40 resize-y py-3 leading-6")}
              />
            </label>

            <label className="block text-sm font-medium text-slate-600">
              {copy.notesPage.tags}
              <input
                type="text"
                value={form.tags}
                onChange={(event) => updateField("tags", event.target.value)}
                className={inputClass}
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
                <select
                  value={form.linkType}
                  onChange={(event) =>
                    updateField("linkType", event.target.value as NoteLink["type"])
                  }
                  className={inputClass}
                >
                  {noteLinkTypes.map((linkType) => (
                    <option key={linkType} value={linkType}>
                      {copy.noteLinkTypes[linkType]}
                    </option>
                  ))}
                </select>
              </label>

              {form.linkType === "trade" ? (
                <label className="block text-sm font-medium text-slate-600">
                  {copy.notesPage.selectTrade}
                  <select
                    value={form.tradeId}
                    onChange={(event) =>
                      updateField("tradeId", event.target.value)
                    }
                    className={inputClass}
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
                  </select>
                </label>
              ) : null}

              {form.linkType === "date" ? (
                <label className="block text-sm font-medium text-slate-600">
                  {copy.notesPage.selectDate}
                  <input
                    type="date"
                    value={form.date}
                    onChange={(event) => updateField("date", event.target.value)}
                    className={inputClass}
                  />
                </label>
              ) : null}

              {form.linkType === "playbook" ? (
                <label className="block text-sm font-medium text-slate-600">
                  {copy.notesPage.selectPlaybook}
                  <select
                    value={form.playbookId}
                    onChange={(event) =>
                      updateField("playbookId", event.target.value)
                    }
                    className={inputClass}
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
                  </select>
                </label>
              ) : null}
            </div>
          </div>

          {error ? (
            <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {error}
            </p>
          ) : null}

          <div className="sticky bottom-0 -mx-6 mt-6 flex flex-col-reverse gap-3 border-t border-[rgba(148,163,184,0.14)] bg-white/92 px-6 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[rgba(148,163,184,0.18)] bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
            >
              {copy.tradeForm.cancel}
            </button>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(108,77,255,0.22)] transition-colors hover:bg-[var(--accent-strong)]"
            >
              {saved ? <Check className="h-4 w-4" /> : null}
              {saveLabel}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
