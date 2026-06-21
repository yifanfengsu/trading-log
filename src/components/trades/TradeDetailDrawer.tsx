"use client";

import { useRouter } from "next/navigation";

import LinkedNotesPreview from "@/components/notes/LinkedNotesPreview";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useNotes } from "@/components/providers/NotesStoreProvider";
import { usePlaybooks } from "@/components/providers/PlaybookStoreProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import DrawerShell from "@/components/ui/DrawerShell";
import {
  computeMargin,
  computeReturnOnMargin,
} from "@/lib/trade-calculations";
import type { Trade } from "@/lib/trade-types";
import {
  cn,
  formatCurrency,
  formatPercent,
  formatRMultiple,
  formatRisk,
  formatTradePrice,
  formatTradeTimestamp,
} from "@/lib/utils";

interface TradeDetailDrawerProps {
  trade: Trade;
  onClose: () => void;
  onEdit: (trade: Trade) => void;
}

interface DetailRowProps {
  label: string;
  value: string;
  valueClassName?: string;
}

function DetailRow({ label, value, valueClassName }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[rgba(148,163,184,0.12)] py-3 last:border-b-0">
      <p className="text-sm text-slate-400">{label}</p>
      <p
        className={cn(
          "text-right text-sm font-semibold text-slate-100",
          valueClassName,
        )}
      >
        {value}
      </p>
    </div>
  );
}

export default function TradeDetailDrawer({
  trade,
  onClose,
  onEdit,
}: TradeDetailDrawerProps) {
  const { dictionary: copy } = useLanguage();
  const router = useRouter();
  const { getNotesForTrade } = useNotes();
  const { getPlaybookById } = usePlaybooks();
  const { settings } = useUserSettings();
  const linkedNotes = getNotesForTrade(trade.id);
  // Leverage-derived metrics are only meaningful when the trade has both a
  // quantity and a recorded leverage (i.e. new computed trades). Legacy rows
  // missing either show "—" rather than a misleading 1x-based number.
  const margin =
    trade.quantity !== undefined && trade.leverage !== undefined
      ? computeMargin({
          entryPrice: trade.entryPrice,
          quantity: trade.quantity,
          leverage: trade.leverage,
        })
      : null;
  const returnOnMargin =
    margin !== null && margin > 0
      ? computeReturnOnMargin({ pnl: trade.pnl, margin })
      : null;
  const playbookLabel = trade.playbookId
    ? (getPlaybookById(trade.playbookId)?.name ??
      copy.playbookPage.deletedPlaybook)
    : "—";

  function handleAddNote() {
    onClose();
    router.push(`/notes?tradeId=${encodeURIComponent(trade.id)}`);
  }

  return (
    <DrawerShell
      title={trade.symbol}
      eyebrow={copy.tradesPage.viewDetails}
      closeLabel={copy.tradesPage.close}
      labelledById="trade-detail-title"
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            {copy.tradesPage.close}
          </Button>
          <Button type="button" onClick={() => onEdit(trade)}>
            {copy.tradesPage.editTrade}
          </Button>
        </div>
      }
    >
        <div className="space-y-5">
          {trade.pnlSource === "manual" ? (
            <div className="flex items-start gap-3 rounded-[18px] border border-[rgba(245,158,11,0.24)] bg-[rgba(245,158,11,0.08)] px-4 py-3">
              <Badge variant="amber">{copy.tradesPage.legacyManual}</Badge>
              <p className="text-xs leading-5 text-amber-200/90">
                {copy.tradesPage.legacyManualHint}
              </p>
            </div>
          ) : null}

          <div className="rounded-[20px] border border-white/10 bg-[rgba(15,23,42,0.46)] px-4">
            <DetailRow
              label={copy.tradeForm.closeTime}
              value={formatTradeTimestamp(trade.closedAt)}
            />
            <DetailRow label={copy.tradeForm.symbol} value={trade.symbol} />
            <DetailRow label={copy.tradeForm.side} value={copy.side[trade.side]} />
            <DetailRow
              label={copy.tradeForm.setup}
              value={copy.strategies[trade.setup]}
            />
            <DetailRow label={copy.tradeForm.playbook} value={playbookLabel} />
            <DetailRow
              label={copy.tradeForm.entryPrice}
              value={formatTradePrice(trade.entryPrice)}
            />
            <DetailRow
              label={copy.tradeForm.exitPrice}
              value={formatTradePrice(trade.exitPrice)}
            />
            <DetailRow
              label={copy.tradeForm.quantity}
              value={
                trade.quantity !== undefined ? String(trade.quantity) : "—"
              }
            />
            <DetailRow
              label={copy.tradeForm.stopPrice}
              value={
                trade.stopPrice !== undefined
                  ? formatTradePrice(trade.stopPrice)
                  : "—"
              }
            />
            <DetailRow
              label={copy.tradeForm.takeProfit}
              value={
                trade.takeProfit !== undefined
                  ? formatTradePrice(trade.takeProfit)
                  : "—"
              }
            />
            <DetailRow
              label={copy.tradeForm.riskPercent}
              value={formatRisk(trade.riskPercent)}
            />
            <DetailRow
              label={copy.tradeForm.fees}
              value={
                trade.fees !== undefined
                  ? formatCurrency(trade.fees, settings.currency)
                  : "—"
              }
            />
            <DetailRow
              label={copy.tradeForm.leverage}
              value={trade.leverage !== undefined ? `${trade.leverage}x` : "—"}
            />
            <DetailRow
              label={copy.tradeForm.netPnl}
              value={formatCurrency(trade.pnl, settings.currency)}
              valueClassName={
                trade.pnl >= 0 ? "text-emerald-300" : "text-rose-300"
              }
            />
            <DetailRow
              label={copy.tradeForm.rMultiple}
              value={formatRMultiple(trade.rMultiple)}
              valueClassName={
                trade.rMultiple >= 0 ? "text-emerald-300" : "text-rose-300"
              }
            />
            <DetailRow
              label={copy.tradeForm.margin}
              value={
                margin !== null
                  ? formatCurrency(margin, settings.currency)
                  : "—"
              }
            />
            <DetailRow
              label={copy.tradeForm.returnOnMargin}
              value={
                returnOnMargin !== null
                  ? formatPercent(returnOnMargin * 100)
                  : "—"
              }
              valueClassName={
                returnOnMargin === null
                  ? undefined
                  : returnOnMargin >= 0
                    ? "text-emerald-300"
                    : "text-rose-300"
              }
            />
            <DetailRow
              label={copy.recentTrades.columns.status}
              value={copy.status[trade.status]}
            />
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-slate-100">
              {copy.tradesPage.notes}
            </p>
            <div className="mt-2 rounded-[18px] border border-white/10 bg-[rgba(15,23,42,0.46)] p-4 text-sm leading-6 text-slate-300">
              {trade.notes || copy.tradesPage.noNotes}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-slate-100">
              {copy.tradesPage.tags}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {trade.tags && trade.tags.length > 0 ? (
                trade.tags.map((tag) => (
                  <Badge key={tag} variant="purple" className="text-sm">
                    {tag}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-slate-400">
                  {copy.tradesPage.noTags}
                </span>
              )}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-slate-100">
              {copy.tradesPage.screenshots}
            </p>
            {trade.screenshots && trade.screenshots.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-3">
                {trade.screenshots.map((screenshot) => (
                  <a
                    key={screenshot}
                    href={`/api/${screenshot}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-[rgba(2,6,23,0.34)] transition-transform hover:-translate-y-0.5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/${screenshot}`}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-400">
                {copy.tradesPage.noScreenshots}
              </p>
            )}
          </div>

          <LinkedNotesPreview notes={linkedNotes} onAdd={handleAddNote} />
        </div>
    </DrawerShell>
  );
}
