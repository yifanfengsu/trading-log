"use client";

import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useDailyReviews } from "@/components/providers/ReviewStoreProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import type { CalendarStats } from "@/lib/trade-calculations";
import {
  buildCalendarGrid,
  cn,
  formatCompactCurrency,
  formatCurrency,
  formatMonthLabel,
  getNextMonthKey,
  getPreviousMonthKey,
  formatPercent,
  parseSelectedMonth,
} from "@/lib/utils";

interface PnlCalendarProps {
  selectedMonth: string;
  dailyPnlMap: Record<string, number>;
  summary: CalendarStats;
  onMonthChange: (nextMonth: string) => void;
}

export default function PnlCalendar({
  selectedMonth,
  dailyPnlMap,
  summary,
  onMonthChange,
}: PnlCalendarProps) {
  const { dictionary: copy, locale } = useLanguage();
  const { settings } = useUserSettings();
  const { dailyReviews } = useDailyReviews();
  const { year, month } = parseSelectedMonth(selectedMonth);
  const cells = buildCalendarGrid(year, month - 1, dailyPnlMap);
  const reviewedDates = new Set(dailyReviews.map((review) => review.date));
  const tradedDays = summary.winningDays + summary.losingDays;
  const winningDayRate =
    tradedDays > 0 ? (summary.winningDays / tradedDays) * 100 : 0;
  const losingDayRate =
    tradedDays > 0 ? (summary.losingDays / tradedDays) * 100 : 0;

  function shiftMonth(offset: number) {
    onMonthChange(
      offset < 0
        ? getPreviousMonthKey(selectedMonth)
        : getNextMonthKey(selectedMonth),
    );
  }

  return (
    <section className="panel-card p-5 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="panel-title">{copy.calendar.title}</h2>
          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(108,77,255,0.08)] text-[var(--accent)] transition-colors hover:bg-[rgba(108,77,255,0.14)]"
              aria-label={copy.calendarPage.previousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm text-slate-500">
              {formatMonthLabel(selectedMonth, locale)}
            </p>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(108,77,255,0.08)] text-[var(--accent)] transition-colors hover:bg-[rgba(108,77,255,0.14)]"
              aria-label={copy.calendarPage.nextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="soft-pill w-fit cursor-default" aria-hidden="true">
          <span>{copy.monthlyLabel}</span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto pb-1">
        <div className="grid min-w-[640px] grid-cols-7 gap-2">
          {copy.calendar.weekdays.map((day) => (
            <div
              key={day}
              className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-[0.08em] text-slate-400"
            >
              {day}
            </div>
          ))}

          {cells.map((cell) => {
          const dateKey =
            cell.inCurrentMonth && cell.day
              ? `${selectedMonth}-${String(cell.day).padStart(2, "0")}`
              : null;
          const hasTrade =
            dateKey !== null &&
            Object.prototype.hasOwnProperty.call(dailyPnlMap, dateKey);
          const isReviewed = dateKey !== null && reviewedDates.has(dateKey);
          const isProfit = (cell.pnl ?? 0) > 0;
          const isLoss = (cell.pnl ?? 0) < 0;
          const className = cn(
            "flex min-h-[82px] flex-col rounded-[18px] border p-3 transition-colors lg:min-h-[96px]",
            !cell.inCurrentMonth &&
              "border-[rgba(151,161,184,0.14)] bg-[rgba(241,243,251,0.7)]",
            cell.inCurrentMonth &&
              !hasTrade &&
              "border-[rgba(151,161,184,0.12)] bg-white/70",
            isProfit &&
              "border-emerald-100 bg-[linear-gradient(180deg,rgba(22,163,74,0.12),rgba(255,255,255,0.9))]",
            isLoss &&
              "border-rose-100 bg-[linear-gradient(180deg,rgba(244,63,94,0.12),rgba(255,255,255,0.92))]",
          );
          const content = (
            <>
              <span
                className={cn(
                  "text-sm font-semibold",
                  cell.inCurrentMonth ? "text-slate-700" : "text-slate-300",
                )}
              >
                {cell.day ?? ""}
              </span>
              <div className="mt-1 flex gap-1">
                {isReviewed ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                ) : null}
                {!isReviewed && hasTrade ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                ) : null}
              </div>
              {hasTrade && cell.pnl !== null ? (
                <span
                  className={cn(
                    "mt-auto text-sm font-semibold tracking-[-0.02em]",
                    isProfit && "text-emerald-700",
                    isLoss && "text-rose-700",
                  )}
                >
                  {formatCompactCurrency(cell.pnl, settings.currency)}
                </span>
              ) : null}
            </>
          );

          return dateKey ? (
            <Link
              key={cell.key}
              href={`/calendar?date=${dateKey}`}
              className={cn(className, "hover:border-[rgba(108,77,255,0.24)]")}
            >
              {content}
            </Link>
          ) : (
            <div key={cell.key} className={className}>
              {content}
            </div>
          );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
        <div className="rounded-[18px] bg-[rgba(108,77,255,0.05)] px-4 py-4">
          <p className="text-sm text-slate-500">{copy.calendar.summary.totalPnl}</p>
          <p
            className={cn(
              "mt-2 text-lg font-semibold",
              summary.totalPnl > 0 && "text-emerald-600",
              summary.totalPnl < 0 && "text-rose-600",
              summary.totalPnl === 0 && "text-slate-900",
            )}
          >
            {formatCurrency(summary.totalPnl, settings.currency)}
          </p>
        </div>
        <div className="rounded-[18px] bg-[rgba(15,23,42,0.03)] px-4 py-4">
          <p className="text-sm text-slate-500">
            {copy.calendar.summary.winningDays}
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {summary.winningDays} ({formatPercent(winningDayRate)})
          </p>
        </div>
        <div className="rounded-[18px] bg-[rgba(15,23,42,0.03)] px-4 py-4">
          <p className="text-sm text-slate-500">
            {copy.calendar.summary.losingDays}
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {summary.losingDays} ({formatPercent(losingDayRate)})
          </p>
        </div>
        <div className="rounded-[18px] bg-[rgba(15,23,42,0.03)] px-4 py-4">
          <p className="text-sm text-slate-500">{copy.calendar.summary.bestDay}</p>
          <p className="mt-2 text-lg font-semibold text-[var(--accent)]">
            {formatCurrency(summary.bestDayPnl, settings.currency)}
          </p>
        </div>
      </div>
    </section>
  );
}
