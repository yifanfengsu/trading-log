"use client";

import { X } from "lucide-react";
import { type FormEvent, useState } from "react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { usePlaybooks } from "@/components/providers/PlaybookStoreProvider";
import type {
  Playbook,
  PlaybookChecklistItem,
  PlaybookInput,
  PlaybookStatus,
} from "@/lib/playbook-types";
import type { TradeSetup } from "@/lib/trade-types";
import { cn } from "@/lib/utils";

interface PlaybookEditorDrawerProps {
  mode: "create" | "edit";
  playbook?: Playbook;
  onClose: () => void;
}

interface PlaybookFormState {
  name: string;
  setup: TradeSetup;
  market: string;
  timeframes: string;
  description: string;
  entryRules: string;
  exitRules: string;
  riskRules: string;
  invalidationRules: string;
  checklist: string;
  tags: string;
  status: PlaybookStatus;
}

const setupOptions: TradeSetup[] = [
  "trendFollowing",
  "breakout",
  "scalping",
  "meanReversion",
  "other",
];

const inputClass =
  "mt-2 h-11 w-full rounded-2xl border border-[rgba(148,163,184,0.18)] bg-white px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-300 focus:border-[rgba(108,77,255,0.38)]";

function getInitialFormState(playbook?: Playbook): PlaybookFormState {
  if (!playbook) {
    return {
      name: "",
      setup: "trendFollowing",
      market: "",
      timeframes: "",
      description: "",
      entryRules: "",
      exitRules: "",
      riskRules: "",
      invalidationRules: "",
      checklist: "",
      tags: "",
      status: "active",
    };
  }

  return {
    name: playbook.name,
    setup: playbook.setup,
    market: playbook.market,
    timeframes: playbook.timeframes.join(", "),
    description: playbook.description,
    entryRules: playbook.entryRules.join("\n"),
    exitRules: playbook.exitRules.join("\n"),
    riskRules: playbook.riskRules.join("\n"),
    invalidationRules: playbook.invalidationRules.join("\n"),
    checklist: playbook.checklist.map((item) => item.text).join("\n"),
    tags: playbook.tags.join(", "),
    status: playbook.status,
  };
}

function createChecklistId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `checklist-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function parseCommaList(value: string) {
  return value
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function parseLineList(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function parseChecklist(
  value: string,
  existingItems: PlaybookChecklistItem[] = [],
) {
  return parseLineList(value).map((text, index) => ({
    id: existingItems[index]?.id ?? createChecklistId(),
    text,
    required: true,
  }));
}

export default function PlaybookEditorDrawer({
  mode,
  playbook,
  onClose,
}: PlaybookEditorDrawerProps) {
  const { dictionary: copy } = useLanguage();
  const { addPlaybook, updatePlaybook } = usePlaybooks();
  const [form, setForm] = useState<PlaybookFormState>(() =>
    getInitialFormState(mode === "edit" ? playbook : undefined),
  );
  const [error, setError] = useState<string | null>(null);
  const title =
    mode === "create"
      ? copy.playbookPage.newPlaybook
      : copy.playbookPage.editPlaybook;
  const saveLabel =
    mode === "create"
      ? copy.playbookPage.savePlaybook
      : copy.playbookPage.saveChanges;

  function updateField<Key extends keyof PlaybookFormState>(
    key: Key,
    value: PlaybookFormState[Key],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
  }

  function buildInput(): PlaybookInput {
    return {
      name: form.name.trim(),
      setup: form.setup,
      market: form.market.trim(),
      timeframes: parseCommaList(form.timeframes),
      description: form.description.trim(),
      entryRules: parseLineList(form.entryRules),
      exitRules: parseLineList(form.exitRules),
      riskRules: parseLineList(form.riskRules),
      invalidationRules: parseLineList(form.invalidationRules),
      checklist: parseChecklist(form.checklist, playbook?.checklist),
      tags: parseCommaList(form.tags),
      status: form.status,
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (form.name.trim().length === 0) {
      setError(copy.playbookPage.nameRequired);
      return;
    }

    const input = buildInput();

    if (mode === "edit" && playbook) {
      updatePlaybook(playbook.id, input);
    } else {
      addPlaybook(input);
    }

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/24 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={copy.tradeForm.cancel}
      />
      <aside className="relative flex h-full w-full max-w-[600px] flex-col overflow-hidden border-l border-white/70 bg-[rgba(255,255,255,0.96)] shadow-[0_24px_80px_rgba(31,15,86,0.18)]">
        <div className="flex items-center justify-between border-b border-[rgba(148,163,184,0.14)] px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              {copy.playbookPage.playbook}
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-950">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(15,23,42,0.04)] text-slate-500 transition-colors hover:bg-[rgba(15,23,42,0.08)] hover:text-slate-900"
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
              {copy.playbookPage.playbookName}
              <input
                type="text"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className={inputClass}
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-600">
                {copy.playbookPage.setupType}
                <select
                  value={form.setup}
                  onChange={(event) =>
                    updateField("setup", event.target.value as TradeSetup)
                  }
                  className={inputClass}
                >
                  {setupOptions.map((setup) => (
                    <option key={setup} value={setup}>
                      {copy.strategies[setup]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-600">
                {copy.recentTrades.columns.status}
                <select
                  value={form.status}
                  onChange={(event) =>
                    updateField("status", event.target.value as PlaybookStatus)
                  }
                  className={inputClass}
                >
                  <option value="active">{copy.playbookStatus.active}</option>
                  <option value="archived">{copy.playbookStatus.archived}</option>
                </select>
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-600">
              {copy.playbookPage.market}
              <input
                type="text"
                value={form.market}
                onChange={(event) => updateField("market", event.target.value)}
                className={inputClass}
                placeholder={copy.playbookPage.marketPlaceholder}
              />
            </label>

            <label className="block text-sm font-medium text-slate-600">
              {copy.playbookPage.timeframes}
              <input
                type="text"
                value={form.timeframes}
                onChange={(event) =>
                  updateField("timeframes", event.target.value)
                }
                className={inputClass}
                placeholder={copy.playbookPage.timeframesPlaceholder}
              />
            </label>

            <label className="block text-sm font-medium text-slate-600">
              {copy.playbookPage.description}
              <textarea
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                className={cn(inputClass, "h-24 resize-none py-3")}
              />
            </label>

            <label className="block text-sm font-medium text-slate-600">
              {copy.playbookPage.entryRules}
              <textarea
                value={form.entryRules}
                onChange={(event) =>
                  updateField("entryRules", event.target.value)
                }
                className={cn(inputClass, "h-28 resize-none py-3")}
                placeholder={copy.playbookPage.oneRulePerLine}
              />
            </label>

            <label className="block text-sm font-medium text-slate-600">
              {copy.playbookPage.exitRules}
              <textarea
                value={form.exitRules}
                onChange={(event) => updateField("exitRules", event.target.value)}
                className={cn(inputClass, "h-28 resize-none py-3")}
                placeholder={copy.playbookPage.oneRulePerLine}
              />
            </label>

            <label className="block text-sm font-medium text-slate-600">
              {copy.playbookPage.riskRules}
              <textarea
                value={form.riskRules}
                onChange={(event) => updateField("riskRules", event.target.value)}
                className={cn(inputClass, "h-28 resize-none py-3")}
                placeholder={copy.playbookPage.oneRulePerLine}
              />
            </label>

            <label className="block text-sm font-medium text-slate-600">
              {copy.playbookPage.avoidConditions}
              <textarea
                value={form.invalidationRules}
                onChange={(event) =>
                  updateField("invalidationRules", event.target.value)
                }
                className={cn(inputClass, "h-28 resize-none py-3")}
                placeholder={copy.playbookPage.oneRulePerLine}
              />
            </label>

            <label className="block text-sm font-medium text-slate-600">
              {copy.playbookPage.executionChecklist}
              <textarea
                value={form.checklist}
                onChange={(event) => updateField("checklist", event.target.value)}
                className={cn(inputClass, "h-28 resize-none py-3")}
                placeholder={copy.playbookPage.oneChecklistItemPerLine}
              />
            </label>

            <label className="block text-sm font-medium text-slate-600">
              {copy.tradesPage.tags}
              <input
                type="text"
                value={form.tags}
                onChange={(event) => updateField("tags", event.target.value)}
                className={inputClass}
                placeholder={copy.playbookPage.tagsPlaceholder}
              />
            </label>
          </div>

          {error ? (
            <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {error}
            </p>
          ) : null}

          <div className="sticky bottom-0 -mx-6 mt-6 flex items-center justify-end gap-3 border-t border-[rgba(148,163,184,0.14)] bg-white/92 px-6 py-4 backdrop-blur">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[rgba(148,163,184,0.18)] bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
            >
              {copy.tradeForm.cancel}
            </button>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(108,77,255,0.22)] transition-colors hover:bg-[var(--accent-strong)]"
            >
              {saveLabel}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
