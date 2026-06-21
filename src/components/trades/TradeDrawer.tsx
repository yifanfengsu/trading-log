"use client";

import { ImagePlus, X } from "lucide-react";
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
import {
  computeInitialRisk,
  computePnl,
  computeRMultiple,
  computeRiskPercent,
} from "@/lib/trade-calculations";
import type {
  Trade,
  TradeInput,
  TradeSetup,
  TradeSide,
} from "@/lib/trade-types";
import { useUploadScreenshot } from "@/lib/use-upload-screenshot";
import { cn, formatCurrency, formatRMultiple } from "@/lib/utils";

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
  quantity: string;
  stopPrice: string;
  takeProfit: string;
  fees: string;
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

function numberToField(value: number | undefined) {
  return value === undefined ? "" : String(value);
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
      quantity: "",
      stopPrice: "",
      takeProfit: "",
      fees: "",
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
    quantity: numberToField(trade.quantity),
    stopPrice: numberToField(trade.stopPrice),
    takeProfit: numberToField(trade.takeProfit),
    fees: numberToField(trade.fees),
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
  const [screenshots, setScreenshots] = useState<string[]>(
    () => (mode === "edit" ? (trade?.screenshots ?? []) : []),
  );
  const { uploadScreenshots, uploading, uploadError } = useUploadScreenshot();
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

  // Live preview of the system-computed pnl / R from the current inputs. Mirrors
  // exactly what handleSubmit persists, so the user sees the result while typing.
  const entryPreview = parseNumber(form.entryPrice);
  const exitPreview = parseNumber(form.exitPrice);
  const quantityPreview = parseNumber(form.quantity);
  const stopPreview = parseNumber(form.stopPrice);
  const feesPreview = parseNumber(form.fees);
  const pnlPreview =
    entryPreview !== null && exitPreview !== null && quantityPreview !== null
      ? computePnl({
          side: form.side,
          entryPrice: entryPreview,
          exitPrice: exitPreview,
          quantity: quantityPreview,
          fees: feesPreview ?? 0,
        })
      : null;
  const initialRiskPreview =
    entryPreview !== null && stopPreview !== null && quantityPreview !== null
      ? computeInitialRisk({
          entryPrice: entryPreview,
          stopPrice: stopPreview,
          quantity: quantityPreview,
        })
      : null;
  const rPreview =
    pnlPreview !== null && initialRiskPreview !== null
      ? computeRMultiple({ pnl: pnlPreview, initialRisk: initialRiskPreview })
      : null;

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

  async function handleFilesSelected(fileList: FileList | null) {
    const uploaded = await uploadScreenshots(fileList, trade?.id);

    if (uploaded.length > 0) {
      setScreenshots((current) => [...current, ...uploaded]);
    }
  }

  function handleRemoveScreenshot(index: number) {
    setScreenshots((current) => current.filter((_, i) => i !== index));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const symbol = form.symbol.trim().toUpperCase();
    const entryPrice = parseNumber(form.entryPrice);
    const exitPrice = parseNumber(form.exitPrice);
    const quantity = parseNumber(form.quantity);
    const stopPrice = parseNumber(form.stopPrice);
    const takeProfit = parseNumber(form.takeProfit);
    const fees = parseNumber(form.fees);

    if (!form.closedAt || !symbol) {
      setError(!symbol ? copy.tradeForm.enterSymbol : copy.tradeForm.requiredFields);
      return;
    }

    if (
      entryPrice === null ||
      exitPrice === null ||
      quantity === null ||
      stopPrice === null
    ) {
      setError(copy.tradeForm.enterValidNumber);
      return;
    }

    if (quantity <= 0 || stopPrice <= 0) {
      setError(copy.tradeForm.positiveNumberRequired);
      return;
    }

    // pnl / R / risk% are always system-computed here — never taken from input.
    const pnl = computePnl({
      side: form.side,
      entryPrice,
      exitPrice,
      quantity,
      fees: fees ?? 0,
    });
    const initialRisk = computeInitialRisk({ entryPrice, stopPrice, quantity });
    const rMultiple = computeRMultiple({ pnl, initialRisk });
    const riskPercent = computeRiskPercent({
      initialRisk,
      accountBalance: settings.startingBalance,
    });

    const tradeInput: TradeInput = {
      closedAt:
        form.closedAt.length === 16 ? `${form.closedAt}:00` : form.closedAt,
      symbol,
      side: form.side,
      setup: form.setup,
      entryPrice,
      exitPrice,
      quantity,
      stopPrice,
      takeProfit: takeProfit !== null ? takeProfit : undefined,
      fees: fees !== null ? fees : undefined,
      riskPercent,
      pnl,
      rMultiple,
      pnlSource: "computed",
      screenshots,
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

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-600">
                {copy.tradeForm.quantity}
                <Input
                  type="number"
                  step="any"
                  min="0"
                  value={form.quantity}
                  onChange={(event) => updateField("quantity", event.target.value)}
                  className="mt-2"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-slate-600">
                {copy.tradeForm.stopPrice}
                <Input
                  type="number"
                  step="any"
                  min="0"
                  value={form.stopPrice}
                  onChange={(event) => updateField("stopPrice", event.target.value)}
                  className="mt-2"
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-600">
                {copy.tradeForm.takeProfit}
                <Input
                  type="number"
                  step="any"
                  value={form.takeProfit}
                  onChange={(event) =>
                    updateField("takeProfit", event.target.value)
                  }
                  className="mt-2"
                />
              </label>

              <label className="block text-sm font-medium text-slate-600">
                {copy.tradeForm.fees}
                <Input
                  type="number"
                  step="any"
                  value={form.fees}
                  onChange={(event) => updateField("fees", event.target.value)}
                  className="mt-2"
                />
              </label>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[rgba(15,23,42,0.46)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-300">
                {copy.tradeForm.computedPreview}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400">{copy.tradeForm.netPnl}</p>
                  <p
                    className={cn(
                      "mt-1 text-lg font-semibold",
                      pnlPreview === null
                        ? "text-slate-500"
                        : pnlPreview >= 0
                          ? "text-emerald-300"
                          : "text-rose-300",
                    )}
                  >
                    {pnlPreview === null
                      ? "—"
                      : formatCurrency(pnlPreview, settings.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">
                    {copy.tradeForm.rMultiple}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-lg font-semibold",
                      rPreview === null
                        ? "text-slate-500"
                        : rPreview >= 0
                          ? "text-emerald-300"
                          : "text-rose-300",
                    )}
                  >
                    {rPreview === null ? "—" : formatRMultiple(rPreview)}
                  </p>
                </div>
              </div>
            </div>

            <div className="block text-sm font-medium text-slate-600">
              {copy.tradeForm.screenshots}
              <div className="mt-2 flex flex-wrap gap-3">
                {screenshots.map((screenshot, index) => (
                  <div
                    key={screenshot}
                    className="relative h-20 w-20 overflow-hidden rounded-2xl border border-white/10 bg-[rgba(2,6,23,0.34)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/${screenshot}`}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveScreenshot(index)}
                      aria-label={copy.tradeForm.removeScreenshot}
                      title={copy.tradeForm.removeScreenshot}
                      className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(2,6,23,0.78)] text-slate-200 ring-1 ring-white/10 transition-colors hover:bg-rose-500/80 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                <label
                  className={cn(
                    "inline-flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-[rgba(148,163,184,0.30)] bg-[rgba(2,6,23,0.30)] text-xs font-medium text-slate-400 transition-colors hover:border-[rgba(124,92,255,0.50)] hover:text-slate-100",
                    uploading && "pointer-events-none opacity-60",
                  )}
                >
                  <ImagePlus className="h-5 w-5" />
                  <span>
                    {uploading
                      ? copy.tradeForm.uploading
                      : copy.tradeForm.uploadScreenshot}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    multiple
                    className="hidden"
                    disabled={uploading}
                    onChange={(event) => {
                      void handleFilesSelected(event.target.files);
                      event.target.value = "";
                    }}
                  />
                </label>
              </div>
              {uploadError ? (
                <p className="mt-2 text-xs font-medium text-rose-300">
                  {uploadError}
                </p>
              ) : null}
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
