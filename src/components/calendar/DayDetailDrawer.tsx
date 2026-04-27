"use client";

import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

import DailyReviewForm from "@/components/calendar/DailyReviewForm";
import LinkedNotesPreview from "@/components/notes/LinkedNotesPreview";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useNotes } from "@/components/providers/NotesStoreProvider";
import { useTradeDrawer } from "@/components/providers/TradeDrawerProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import DrawerShell from "@/components/ui/DrawerShell";
import EmptyState from "@/components/ui/EmptyState";
import { getDateDisplay } from "@/lib/calendar-utils";
import type { DailyReview } from "@/lib/review-types";
import { getDailyTradeStats } from "@/lib/review-calculations";
import type { Trade } from "@/lib/trade-types";
import {
  cn,
  formatCurrency,
  formatPercent,
  formatProfitFactor,
  formatRMultiple,
  formatTradeTimestamp,
} from "@/lib/utils";

interface DayDetailDrawerProps {
  date: string;
  trades: Trade[];
  review?: DailyReview;
  onClose: () => void;
}

interface StatCardProps {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative" | "accent";
}

const toneClasses = {
  neutral: "text-slate-950",
  positive: "text-emerald-600",
  negative: "text-rose-600",
  accent: "text-[var(--accent)]",
} as const;

function StatCard({ label, value, tone = "neutral" }: StatCardProps) {
  return (
    <div className="rounded-[18px] bg-[rgba(108,77,255,0.05)] px-4 py-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={cn("mt-2 text-lg font-semibold", toneClasses[tone])}>
        {value}
      </p>
    </div>
  );
}

export default function DayDetailDrawer({
  date,
  trades,
  review,
  onClose,
}: DayDetailDrawerProps) {
  const { dictionary: copy, locale } = useLanguage();
  const router = useRouter();
  const { settings } = useUserSettings();
  const { getNotesForDate } = useNotes();
  const { openEditTrade } = useTradeDrawer();
  const stats = getDailyTradeStats(trades);
  const linkedNotes = getNotesForDate(date);
  const sortedTrades = [...trades].sort((a, b) =>
    b.closedAt.localeCompare(a.closedAt),
  );

  function handleAddNote() {
    onClose();
    router.push(`/notes?date=${encodeURIComponent(date)}`);
  }

  return (
    <DrawerShell
      title={getDateDisplay(date, locale)}
      eyebrow={copy.calendarPage.dailyReview}
      closeLabel={copy.calendarPage.close}
      labelledById="day-detail-title"
      onClose={onClose}
      size="lg"
      zIndexClassName="z-40"
    >
        <div className="space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-slate-950">
              {copy.calendarPage.dailyStats}
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <StatCard
                label={copy.calendarPage.dailyPnl}
                value={formatCurrency(stats.dailyPnl, settings.currency)}
                tone={
                  stats.dailyPnl > 0
                    ? "positive"
                    : stats.dailyPnl < 0
                      ? "negative"
                      : "neutral"
                }
              />
              <StatCard
                label={copy.calendarPage.tradeCount}
                value={String(stats.totalTrades)}
                tone="accent"
              />
              <StatCard
                label={copy.calendarPage.winRate}
                value={formatPercent(stats.winRate)}
              />
              <StatCard
                label={copy.calendarPage.profitFactor}
                value={formatProfitFactor(stats.profitFactor)}
              />
              <StatCard
                label={copy.calendarPage.avgR}
                value={formatRMultiple(stats.averageR)}
                tone={
                  stats.averageR > 0
                    ? "positive"
                    : stats.averageR < 0
                      ? "negative"
                      : "neutral"
                }
              />
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-950">
              {copy.calendarPage.tradesOnThisDay}
            </h3>
            {sortedTrades.length > 0 ? (
              <div className="mt-3 space-y-3">
                {sortedTrades.map((trade) => {
                  const isProfit = trade.pnl > 0;
                  const isLoss = trade.pnl < 0;

                  return (
                    <article
                      key={trade.id}
                      className="rounded-[20px] border border-slate-100 bg-slate-50/70 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-950">
                              {trade.symbol}
                            </p>
                            <Badge variant="purple">
                              {copy.side[trade.side]}
                            </Badge>
                          </div>
                          <p className="mt-2 text-xs text-slate-500">
                            {copy.strategies[trade.setup]} ·{" "}
                            {formatTradeTimestamp(trade.closedAt)}
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            onClose();
                            openEditTrade(trade);
                          }}
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          aria-label={copy.tradesPage.editTrade}
                          title={copy.tradesPage.editTrade}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <p
                          className={cn(
                            "text-lg font-semibold tracking-[-0.03em]",
                            isProfit && "text-emerald-600",
                            isLoss && "text-rose-600",
                            !isProfit && !isLoss && "text-slate-700",
                          )}
                        >
                          {formatCurrency(trade.pnl, settings.currency)}
                        </p>
                        <p
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            isProfit && "bg-emerald-50 text-emerald-700",
                            isLoss && "bg-rose-50 text-rose-700",
                            !isProfit && !isLoss && "bg-slate-100 text-slate-600",
                          )}
                        >
                          {formatRMultiple(trade.rMultiple)}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title={copy.calendarPage.noTradesOnThisDay}
                className="mt-3 min-h-[180px]"
              />
            )}
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-950">
              {copy.calendarPage.dailyReview}
            </h3>
            <div className="mt-3 rounded-[20px] border border-slate-100 bg-slate-50/70 p-4">
              <DailyReviewForm
                key={`${date}-${review?.updatedAt ?? "new"}`}
                date={date}
                review={review}
              />
            </div>
          </section>

          <LinkedNotesPreview notes={linkedNotes} onAdd={handleAddNote} />
        </div>
    </DrawerShell>
  );
}
