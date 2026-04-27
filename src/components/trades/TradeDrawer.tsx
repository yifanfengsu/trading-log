"use client";

import { X } from "lucide-react";
import { type FormEvent, useState } from "react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { usePlaybooks } from "@/components/providers/PlaybookStoreProvider";
import { useTrades } from "@/components/providers/TradeStoreProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import type { UserSettings } from "@/lib/settings-types";
import type {
  Trade,
  TradeInput,
  TradeSetup,
  TradeSide,
} from "@/lib/trade-types";
import { cn } from "@/lib/utils";
import { useEscapeKey } from "@/lib/use-escape-key";

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

const inputClass =
  "mt-2 h-11 w-full rounded-2xl border border-[rgba(148,163,184,0.18)] bg-white px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-300 focus:border-[rgba(108,77,255,0.38)]";

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

  useEscapeKey(onClose);

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
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/24 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={copy.tradeForm.cancel}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="trade-drawer-title"
        className="relative flex h-full w-full max-w-[520px] flex-col overflow-hidden border-l border-white/70 bg-[rgba(255,255,255,0.96)] shadow-[0_24px_80px_rgba(31,15,86,0.18)]"
      >
        <div className="flex items-center justify-between border-b border-[rgba(148,163,184,0.14)] px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              {copy.recentTrades.columns.status}: {copy.status.closed}
            </p>
            <h2
              id="trade-drawer-title"
              className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-950"
            >
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
              {copy.tradeForm.closeTime}
              <input
                type="datetime-local"
                value={form.closedAt}
                onChange={(event) => updateField("closedAt", event.target.value)}
                className={inputClass}
                required
              />
            </label>

            <label className="block text-sm font-medium text-slate-600">
              {copy.tradeForm.symbol}
              <input
                type="text"
                value={form.symbol}
                onChange={(event) =>
                  updateField("symbol", event.target.value.toUpperCase())
                }
                className={inputClass}
                placeholder={copy.tradeForm.symbolPlaceholder}
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-600">
                {copy.tradeForm.side}
                <select
                  value={form.side}
                  onChange={(event) =>
                    updateField("side", event.target.value as TradeSide)
                  }
                  className={inputClass}
                >
                  {sideOptions.map((side) => (
                    <option key={side} value={side}>
                      {copy.side[side]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-600">
                {copy.tradeForm.setup}
                <select
                  value={form.setup}
                  onChange={(event) =>
                    handleSetupChange(event.target.value as TradeSetup)
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
            </div>

            <label className="block text-sm font-medium text-slate-600">
              {copy.tradeForm.playbook}
              <select
                value={form.playbookId}
                onChange={(event) => handlePlaybookChange(event.target.value)}
                className={inputClass}
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
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-600">
                {copy.tradeForm.entryPrice}
                <input
                  type="number"
                  step="any"
                  value={form.entryPrice}
                  onChange={(event) =>
                    updateField("entryPrice", event.target.value)
                  }
                  className={inputClass}
                  required
                />
              </label>

              <label className="block text-sm font-medium text-slate-600">
                {copy.tradeForm.exitPrice}
                <input
                  type="number"
                  step="any"
                  value={form.exitPrice}
                  onChange={(event) => updateField("exitPrice", event.target.value)}
                  className={inputClass}
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-sm font-medium text-slate-600">
                {copy.tradeForm.riskPercent}
                <input
                  type="number"
                  step="any"
                  value={form.riskPercent}
                  onChange={(event) =>
                    updateField("riskPercent", event.target.value)
                  }
                  className={inputClass}
                  required
                />
              </label>

              <label className="block text-sm font-medium text-slate-600">
                {copy.tradeForm.netPnl}
                <input
                  type="number"
                  step="any"
                  value={form.pnl}
                  onChange={(event) => updateField("pnl", event.target.value)}
                  className={inputClass}
                  required
                />
              </label>

              <label className="block text-sm font-medium text-slate-600">
                {copy.tradeForm.rMultiple}
                <input
                  type="number"
                  step="any"
                  value={form.rMultiple}
                  onChange={(event) =>
                    updateField("rMultiple", event.target.value)
                  }
                  className={inputClass}
                  required
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-600">
              {copy.tradeForm.notes}
              <textarea
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                className={cn(inputClass, "h-24 resize-none py-3")}
              />
            </label>

            <label className="block text-sm font-medium text-slate-600">
              {copy.tradeForm.tags}
              <input
                type="text"
                value={form.tags}
                onChange={(event) => updateField("tags", event.target.value)}
                className={inputClass}
                placeholder={copy.tradeForm.tagsPlaceholder}
              />
            </label>
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
