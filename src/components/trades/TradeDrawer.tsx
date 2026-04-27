"use client";

import { type FormEvent, useState } from "react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { usePlaybooks } from "@/components/providers/PlaybookStoreProvider";
import { useTrades } from "@/components/providers/TradeStoreProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import Button from "@/components/ui/Button";
import DrawerShell from "@/components/ui/DrawerShell";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import type { UserSettings } from "@/lib/settings-types";
import type {
  Trade,
  TradeInput,
  TradeSetup,
  TradeSide,
} from "@/lib/trade-types";

interface TradeDrawerProps {
  mode: "create" | "edit";
  trade?: Trade;
  onClose: () => void;
}

interface TradeFormState {
  closedAt: string;
  symbol: string;
  side: TradeSide;
  setup: TradeSetup;
  entryPrice: string;
  exitPrice: string;
  riskPercent: string;
  pnl: string;
  rMultiple: string;
  playbookId: string;
  notes: string;
  tags: string;
}

const sideOptions: TradeSide[] = ["long", "short"];
const setupOptions: TradeSetup[] = [
  "trendFollowing",
  "breakout",
  "scalping",
  "meanReversion",
  "other",
];

function getCurrentDatetimeLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getInitialFormState(
  trade: Trade | undefined,
  settings: UserSettings,
): TradeFormState {
  if (!trade) {
    return {
      closedAt: getCurrentDatetimeLocal(),
      symbol: settings.defaultSymbol,
      side: settings.defaultSide,
      setup: settings.defaultSetup,
      entryPrice: "",
      exitPrice: "",
      riskPercent: String(settings.defaultRiskPercent),
      pnl: "",
      rMultiple: "",
      playbookId: "",
      notes: "",
      tags: "",
    };
  }

  return {
    closedAt: trade.closedAt.slice(0, 16),
    symbol: trade.symbol,
    side: trade.side,
    setup: trade.setup,
    entryPrice: String(trade.entryPrice),
    exitPrice: String(trade.exitPrice),
    riskPercent: String(trade.riskPercent),
    pnl: String(trade.pnl),
    rMultiple: String(trade.rMultiple),
    playbookId: trade.playbookId ?? "",
    notes: trade.notes ?? "",
    tags: trade.tags?.join(", ") ?? "",
  };
}

function parseNumber(value: string) {
  if (value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseTags(value: string) {
  return value
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

export default function TradeDrawer({ mode, trade, onClose }: TradeDrawerProps) {
  const { dictionary: copy } = useLanguage();
  const { playbooks, getPlaybookById } = usePlaybooks();
  const { addTrade, updateTrade } = useTrades();
  const { settings } = useUserSettings();
  const [form, setForm] = useState<TradeFormState>(() =>
    getInitialFormState(mode === "edit" ? trade : undefined, settings),
  );
  const [error, setError] = useState<string | null>(null);
  const title =
    mode === "create" ? copy.tradeForm.addTitle : copy.tradeForm.editTitle;
  const saveLabel =
    mode === "create" ? copy.tradeForm.saveTrade : copy.tradeForm.saveChanges;
  const activePlaybooks = playbooks.filter(
    (playbook) => playbook.status === "active",
  );
  const selectedPlaybook = form.playbookId
    ? getPlaybookById(form.playbookId)
    : undefined;
  const playbookOptions =
    selectedPlaybook &&
    !activePlaybooks.some((playbook) => playbook.id === selectedPlaybook.id)
      ? [...activePlaybooks, selectedPlaybook]
      : activePlaybooks;
  const hasDeletedSelectedPlaybook = Boolean(
    form.playbookId && !selectedPlaybook,
  );

  function updateField<Key extends keyof TradeFormState>(
    key: Key,
    value: TradeFormState[Key],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
  }

  function handlePlaybookChange(playbookId: string) {
    const nextPlaybook = playbooks.find((playbook) => playbook.id === playbookId);

    setForm((currentForm) => ({
      ...currentForm,
      playbookId,
      setup: nextPlaybook ? nextPlaybook.setup : currentForm.setup,
    }));
  }

  function handleSetupChange(setup: TradeSetup) {
    setForm((currentForm) => {
      const currentPlaybook = currentForm.playbookId
        ? playbooks.find((playbook) => playbook.id === currentForm.playbookId)
        : undefined;

      return {
        ...currentForm,
        setup,
        playbookId:
          currentForm.playbookId &&
          (!currentPlaybook || currentPlaybook.setup !== setup)
            ? ""
            : currentForm.playbookId,
      };
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const symbol = form.symbol.trim().toUpperCase();
    const entryPrice = parseNumber(form.entryPrice);
    const exitPrice = parseNumber(form.exitPrice);
    const riskPercent = parseNumber(form.riskPercent);
    const pnl = parseNumber(form.pnl);
    const rMultiple = parseNumber(form.rMultiple);

    if (!form.closedAt || !symbol) {
      setError(!symbol ? copy.tradeForm.enterSymbol : copy.tradeForm.requiredFields);
      return;
    }

    if (
      entryPrice === null ||
      exitPrice === null ||
      riskPercent === null ||
      pnl === null ||
      rMultiple === null
    ) {
      setError(copy.tradeForm.enterValidNumber);
      return;
    }

    const tradeInput: TradeInput = {
      closedAt:
        form.closedAt.length === 16 ? `${form.closedAt}:00` : form.closedAt,
      symbol,
      side: form.side,
      setup: form.setup,
      entryPrice,
      exitPrice,
      riskPercent,
      pnl,
      rMultiple,
      playbookId: form.playbookId || undefined,
      status: "closed",
      notes: form.notes.trim() || undefined,
      tags: parseTags(form.tags),
    };

    if (mode === "edit" && trade) {
      updateTrade(trade.id, tradeInput);
    } else {
      addTrade(tradeInput);
    }

    onClose();
  }

  return (
    <DrawerShell
      title={title}
      eyebrow={`${copy.recentTrades.columns.status}: ${copy.status.closed}`}
      closeLabel={copy.tradeForm.cancel}
      labelledById="trade-drawer-title"
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            {copy.tradeForm.cancel}
          </Button>
          <Button type="submit" form="trade-form">
            {saveLabel}
          </Button>
        </div>
      }
    >
        <form
          id="trade-form"
          onSubmit={handleSubmit}
          className="grid gap-4"
        >
            <label className="block text-sm font-medium text-slate-600">
              {copy.tradeForm.closeTime}
              <Input
                type="datetime-local"
                value={form.closedAt}
                onChange={(event) => updateField("closedAt", event.target.value)}
                className="mt-2"
                required
              />
            </label>

            <label className="block text-sm font-medium text-slate-600">
              {copy.tradeForm.symbol}
              <Input
                type="text"
                value={form.symbol}
                onChange={(event) =>
                  updateField("symbol", event.target.value.toUpperCase())
                }
                className="mt-2"
                placeholder={copy.tradeForm.symbolPlaceholder}
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-600">
                {copy.tradeForm.side}
                <Select
                  value={form.side}
                  onChange={(event) =>
                    updateField("side", event.target.value as TradeSide)
                  }
                  className="mt-2"
                >
                  {sideOptions.map((side) => (
                    <option key={side} value={side}>
                      {copy.side[side]}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="block text-sm font-medium text-slate-600">
                {copy.tradeForm.setup}
                <Select
                  value={form.setup}
                  onChange={(event) =>
                    handleSetupChange(event.target.value as TradeSetup)
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
            </div>

            <label className="block text-sm font-medium text-slate-600">
              {copy.tradeForm.playbook}
              <Select
                value={form.playbookId}
                onChange={(event) => handlePlaybookChange(event.target.value)}
                className="mt-2"
              >
                <option value="">{copy.playbookPage.none}</option>
                {playbookOptions.map((playbook) => (
                  <option key={playbook.id} value={playbook.id}>
                    {playbook.name}
                    {playbook.status === "archived"
                      ? ` (${copy.playbookStatus.archived})`
                      : ""}
                  </option>
                ))}
                {hasDeletedSelectedPlaybook ? (
                  <option value={form.playbookId}>
                    {copy.playbookPage.deletedPlaybook}
                  </option>
                ) : null}
              </Select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-600">
                {copy.tradeForm.entryPrice}
                <Input
                  type="number"
                  step="any"
                  value={form.entryPrice}
                  onChange={(event) =>
                    updateField("entryPrice", event.target.value)
                  }
                  className="mt-2"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-slate-600">
                {copy.tradeForm.exitPrice}
                <Input
                  type="number"
                  step="any"
                  value={form.exitPrice}
                  onChange={(event) => updateField("exitPrice", event.target.value)}
                  className="mt-2"
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-sm font-medium text-slate-600">
                {copy.tradeForm.riskPercent}
                <Input
                  type="number"
                  step="any"
                  value={form.riskPercent}
                  onChange={(event) =>
                    updateField("riskPercent", event.target.value)
                  }
                  className="mt-2"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-slate-600">
                {copy.tradeForm.netPnl}
                <Input
                  type="number"
                  step="any"
                  value={form.pnl}
                  onChange={(event) => updateField("pnl", event.target.value)}
                  className="mt-2"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-slate-600">
                {copy.tradeForm.rMultiple}
                <Input
                  type="number"
                  step="any"
                  value={form.rMultiple}
                  onChange={(event) =>
                    updateField("rMultiple", event.target.value)
                  }
                  className="mt-2"
                  required
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-600">
              {copy.tradeForm.notes}
              <Textarea
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                className="mt-2 h-24 resize-none"
              />
            </label>

            <label className="block text-sm font-medium text-slate-600">
              {copy.tradeForm.tags}
              <Input
                type="text"
                value={form.tags}
                onChange={(event) => updateField("tags", event.target.value)}
                className="mt-2"
                placeholder={copy.tradeForm.tagsPlaceholder}
              />
            </label>

          {error ? (
            <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {error}
            </p>
          ) : null}
        </form>
    </DrawerShell>
  );
}
