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
              label={copy.tradeForm.riskPercent}
              value={formatRisk(trade.riskPercent)}
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

          <LinkedNotesPreview notes={linkedNotes} onAdd={handleAddNote} />
        </div>
    </DrawerShell>
  );
}
