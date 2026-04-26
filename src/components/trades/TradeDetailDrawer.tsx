"use client";

import { X } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import type { Trade } from "@/lib/trade-types";
import {
  cn,
  formatCurrency,
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
      <p className="text-sm text-slate-500">{label}</p>
      <p
        className={cn(
          "text-right text-sm font-semibold text-slate-900",
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
  const { settings } = useUserSettings();

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/24 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={copy.tradesPage.close}
      />
      <aside className="relative flex h-full w-full max-w-[520px] flex-col overflow-hidden border-l border-white/70 bg-[rgba(255,255,255,0.96)] shadow-[0_24px_80px_rgba(31,15,86,0.18)]">
        <div className="flex items-center justify-between border-b border-[rgba(148,163,184,0.14)] px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              {copy.tradesPage.viewDetails}
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-950">
              {trade.symbol}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(15,23,42,0.04)] text-slate-500 transition-colors hover:bg-[rgba(15,23,42,0.08)] hover:text-slate-900"
            aria-label={copy.tradesPage.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="rounded-[20px] bg-[rgba(250,250,255,0.86)] px-4">
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
            <DetailRow
              label={copy.tradeForm.entryPrice}
              value={formatTradePrice(trade.entryPrice)}
            />
            <DetailRow
              label={copy.tradeForm.exitPrice}
              value={formatTradePrice(trade.exitPrice)}
            />
            <DetailRow
              label={copy.tradeForm.riskPercent}
              value={formatRisk(trade.riskPercent)}
            />
            <DetailRow
              label={copy.tradeForm.netPnl}
              value={formatCurrency(trade.pnl, settings.currency)}
              valueClassName={trade.pnl >= 0 ? "text-emerald-600" : "text-rose-600"}
            />
            <DetailRow
              label={copy.tradeForm.rMultiple}
              value={formatRMultiple(trade.rMultiple)}
              valueClassName={
                trade.rMultiple >= 0 ? "text-emerald-600" : "text-rose-600"
              }
            />
            <DetailRow
              label={copy.recentTrades.columns.status}
              value={copy.status[trade.status]}
            />
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-slate-900">
              {copy.tradesPage.notes}
            </p>
            <div className="mt-2 rounded-[18px] bg-[rgba(15,23,42,0.04)] p-4 text-sm leading-6 text-slate-600">
              {trade.notes || copy.tradesPage.noNotes}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-slate-900">
              {copy.tradesPage.tags}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {trade.tags && trade.tags.length > 0 ? (
                trade.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex rounded-full bg-[rgba(108,77,255,0.08)] px-3 py-1 text-sm font-medium text-[var(--accent)]"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400">
                  {copy.tradesPage.noTags}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[rgba(148,163,184,0.14)] bg-white/92 px-6 py-4 backdrop-blur">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[rgba(148,163,184,0.18)] bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
          >
            {copy.tradesPage.close}
          </button>
          <button
            type="button"
            onClick={() => onEdit(trade)}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(108,77,255,0.22)] transition-colors hover:bg-[var(--accent-strong)]"
          >
            {copy.tradesPage.editTrade}
          </button>
        </div>
      </aside>
    </div>
  );
}
