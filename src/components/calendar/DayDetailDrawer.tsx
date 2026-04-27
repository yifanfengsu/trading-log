"use client";

import { Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";

import DailyReviewForm from "@/components/calendar/DailyReviewForm";
import LinkedNotesPreview from "@/components/notes/LinkedNotesPreview";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useNotes } from "@/components/providers/NotesStoreProvider";
import { useTradeDrawer } from "@/components/providers/TradeDrawerProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
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
import { useEscapeKey } from "@/lib/use-escape-key";

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

  useEscapeKey(onClose);

  function handleAddNote() {
    onClose();
    router.push(`/notes?date=${encodeURIComponent(date)}`);
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/24 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={copy.calendarPage.close}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-detail-title"
        className="relative flex h-full w-full max-w-[560px] flex-col overflow-hidden border-l border-white/70 bg-[rgba(255,255,255,0.97)] shadow-[0_24px_80px_rgba(31,15,86,0.18)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[rgba(148,163,184,0.14)] px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              {copy.calendarPage.dailyReview}
            </p>
            <h2
              id="day-detail-title"
              className="mt-1 text-xl font-semibold tracking-[-0.03em] text-slate-950"
            >
              {getDateDisplay(date, locale)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(15,23,42,0.04)] text-slate-500 transition-colors hover:bg-[rgba(15,23,42,0.08)] hover:text-slate-900"
            aria-label={copy.calendarPage.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
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
                      className="rounded-[20px] border border-[rgba(148,163,184,0.13)] bg-[rgba(250,250,255,0.86)] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-950">
                              {trade.symbol}
                            </p>
                            <span className="rounded-full bg-[rgba(108,77,255,0.08)] px-2 py-1 text-xs font-semibold text-[var(--accent)]">
                              {copy.side[trade.side]}
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-slate-500">
                            {copy.strategies[trade.setup]} ·{" "}
                            {formatTradeTimestamp(trade.closedAt)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            openEditTrade(trade);
                          }}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-400 shadow-[0_8px_18px_rgba(31,15,86,0.06)] transition-colors hover:text-[var(--accent)]"
                          aria-label={copy.tradesPage.editTrade}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
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
              <div className="mt-3 rounded-[20px] border border-dashed border-[rgba(148,163,184,0.22)] bg-[rgba(248,250,252,0.8)] px-4 py-8 text-center text-sm text-slate-500">
                {copy.calendarPage.noTradesOnThisDay}
              </div>
            )}
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-950">
              {copy.calendarPage.dailyReview}
            </h3>
            <div className="mt-3 rounded-[20px] border border-[rgba(148,163,184,0.13)] bg-[rgba(250,250,255,0.86)] p-4">
              <DailyReviewForm
                key={`${date}-${review?.updatedAt ?? "new"}`}
                date={date}
                review={review}
              />
            </div>
          </section>

          <LinkedNotesPreview notes={linkedNotes} onAdd={handleAddNote} />
        </div>
      </aside>
    </div>
  );
}
