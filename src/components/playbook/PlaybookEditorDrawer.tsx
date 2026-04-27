"use client";

import { type FormEvent, useState } from "react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { usePlaybooks } from "@/components/providers/PlaybookStoreProvider";
import Button from "@/components/ui/Button";
import DrawerShell from "@/components/ui/DrawerShell";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import type {
  Playbook,
  PlaybookChecklistItem,
  PlaybookInput,
  PlaybookStatus,
} from "@/lib/playbook-types";
import type { TradeSetup } from "@/lib/trade-types";

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
    <DrawerShell
      title={title}
      eyebrow={copy.playbookPage.playbook}
      closeLabel={copy.tradeForm.cancel}
      labelledById="playbook-editor-title"
      onClose={onClose}
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button type="button" onClick={onClose} variant="secondary">
            {copy.tradeForm.cancel}
          </Button>
          <Button type="submit" form="playbook-editor-form">
            {saveLabel}
          </Button>
        </div>
      }
    >
        <form
          id="playbook-editor-form"
          onSubmit={handleSubmit}
          className="grid gap-4"
        >
            <label className="block text-sm font-medium text-slate-600">
              {copy.playbookPage.playbookName}
              <Input
                type="text"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="mt-2"
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-600">
                {copy.playbookPage.setupType}
                <Select
                  value={form.setup}
                  onChange={(event) =>
                    updateField("setup", event.target.value as TradeSetup)
                  }
                  className="mt-2"
                >
                  {setupOptions.map((setup) => (
                    <option key={setup} value={setup}>
                      {copy.strategies[setup]}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="block text-sm font-medium text-slate-600">
                {copy.recentTrades.columns.status}
                <Select
                  value={form.status}
                  onChange={(event) =>
                    updateField("status", event.target.value as PlaybookStatus)
                  }
                  className="mt-2"
                >
                  <option value="active">{copy.playbookStatus.active}</option>
                  <option value="archived">{copy.playbookStatus.archived}</option>
                </Select>
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-600">
              {copy.playbookPage.market}
              <Input
                type="text"
                value={form.market}
                onChange={(event) => updateField("market", event.target.value)}
                className="mt-2"
                placeholder={copy.playbookPage.marketPlaceholder}
              />
            </label>

            <label className="block text-sm font-medium text-slate-600">
              {copy.playbookPage.timeframes}
              <Input
                type="text"
                value={form.timeframes}
                onChange={(event) =>
                  updateField("timeframes", event.target.value)
                }
                className="mt-2"
                placeholder={copy.playbookPage.timeframesPlaceholder}
              />
            </label>

            <label className="block text-sm font-medium text-slate-600">
              {copy.playbookPage.description}
              <Textarea
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                className="mt-2 h-24 resize-none"
              />
            </label>

            <label className="block text-sm font-medium text-slate-600">
              {copy.playbookPage.entryRules}
              <Textarea
                value={form.entryRules}
                onChange={(event) =>
                  updateField("entryRules", event.target.value)
                }
                className="mt-2 h-28 resize-none"
                placeholder={copy.playbookPage.oneRulePerLine}
              />
            </label>

            <label className="block text-sm font-medium text-slate-600">
              {copy.playbookPage.exitRules}
              <Textarea
                value={form.exitRules}
                onChange={(event) => updateField("exitRules", event.target.value)}
                className="mt-2 h-28 resize-none"
                placeholder={copy.playbookPage.oneRulePerLine}
              />
            </label>

            <label className="block text-sm font-medium text-slate-600">
              {copy.playbookPage.riskRules}
              <Textarea
                value={form.riskRules}
                onChange={(event) => updateField("riskRules", event.target.value)}
                className="mt-2 h-28 resize-none"
                placeholder={copy.playbookPage.oneRulePerLine}
              />
            </label>

            <label className="block text-sm font-medium text-slate-600">
              {copy.playbookPage.avoidConditions}
              <Textarea
                value={form.invalidationRules}
                onChange={(event) =>
                  updateField("invalidationRules", event.target.value)
                }
                className="mt-2 h-28 resize-none"
                placeholder={copy.playbookPage.oneRulePerLine}
              />
            </label>

            <label className="block text-sm font-medium text-slate-600">
              {copy.playbookPage.executionChecklist}
              <Textarea
                value={form.checklist}
                onChange={(event) => updateField("checklist", event.target.value)}
                className="mt-2 h-28 resize-none"
                placeholder={copy.playbookPage.oneChecklistItemPerLine}
              />
            </label>

            <label className="block text-sm font-medium text-slate-600">
              {copy.tradesPage.tags}
              <Input
                type="text"
                value={form.tags}
                onChange={(event) => updateField("tags", event.target.value)}
                className="mt-2"
                placeholder={copy.playbookPage.tagsPlaceholder}
              />
            </label>

          {error ? (
            <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {error}
            </p>
          ) : null}
        </form>
    </DrawerShell>
  );
}
