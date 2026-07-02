"use client";

import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useDailyReviews } from "@/components/providers/ReviewStoreProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";
import { getMaxAbsPnl, getPnlHeatStyle } from "@/lib/pnl-heat";
import type { CalendarStats } from "@/lib/trade-calculations";
import {
  buildCalendarGrid,
  cn,
  formatCompactCurrency,
  formatCurrency,
  formatMonthLabel,
  formatPercent,
  getNextMonthKey,
  getPreviousMonthKey,
  getTodayDateKey,
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
  const maxAbsPnl = getMaxAbsPnl(dailyPnlMap);
  const reviewedDates = new Set(dailyReviews.map((review) => review.date));
  const tradedDays = summary.winningDays + summary.losingDays;
  const winningDayRate =
    tradedDays > 0 ? (summary.winningDays / tradedDays) * 100 : 0;
  const losingDayRate =
    tradedDays > 0 ? (summary.losingDays / tradedDays) * 100 : 0;
  const todayDateKey = getTodayDateKey();

  function shiftMonth(offset: number) {
    onMonthChange(
      offset < 0
        ? getPreviousMonthKey(selectedMonth)
        : getNextMonthKey(selectedMonth),
    );
  }

  return (
    <Card>
      <SectionHeader
        title={copy.calendar.title}
        action={
          <Badge variant="purple" className="h-9 px-3">
            <span>{copy.monthlyLabel}</span>
            <ChevronDown className="h-4 w-4 text-[var(--accent)]" />
          </Badge>
        }
      />
      <div className="mt-3 flex items-center gap-2">
        <Button
          onClick={() => shiftMonth(-1)}
          variant="ghost"
          size="icon"
          aria-label={copy.calendarPage.previousMonth}
          title={copy.calendarPage.previousMonth}
          className="h-8 w-8 bg-[rgba(184,241,53,0.12)] text-[var(--accent)] hover:bg-[rgba(184,241,53,0.20)]"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <p className="text-sm font-medium text-slate-400">
          {formatMonthLabel(selectedMonth, locale)}
        </p>
        <Button
          onClick={() => shiftMonth(1)}
          variant="ghost"
          size="icon"
          aria-label={copy.calendarPage.nextMonth}
          title={copy.calendarPage.nextMonth}
          className="h-8 w-8 bg-[rgba(184,241,53,0.12)] text-[var(--accent)] hover:bg-[rgba(184,241,53,0.20)]"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-6 overflow-x-auto pb-1">
        <div className="grid min-w-[620px] grid-cols-7 gap-2">
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
            const isToday = dateKey === todayDateKey;
            const isProfit = (cell.pnl ?? 0) > 0;
            const isLoss = (cell.pnl ?? 0) < 0;
            // Magnitude-scaled green/red heat for traded days (deeper = larger);
            // no-trade days stay neutral.
            const heatStyle =
              hasTrade && cell.pnl !== null
                ? getPnlHeatStyle(cell.pnl, maxAbsPnl)
                : undefined;
            const className = cn(
              "flex min-h-[84px] flex-col rounded-[18px] border p-3 transition-all lg:min-h-[96px]",
              !cell.inCurrentMonth &&
                "border-white/5 bg-[rgba(30,33,30,0.22)]",
              cell.inCurrentMonth &&
                !hasTrade &&
                "border-white/10 bg-[rgba(30,33,30,0.46)] hover:border-[rgba(184,241,53,0.24)] hover:bg-[rgba(30,33,30,0.66)]",
              isToday &&
                "ring-2 ring-[rgba(184,241,53,0.60)] ring-offset-1 ring-offset-[#0a0b0a] shadow-[0_0_22px_rgba(184,241,53,0.18)]",
            );
            const content = (
              <>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    cell.inCurrentMonth ? "text-slate-200" : "text-slate-600",
                  )}
                >
                  {cell.day ?? ""}
                </span>
                <div className="mt-1 flex gap-1">
                  {isReviewed ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_10px_rgba(184,241,53,0.8)]" />
                  ) : null}
                  {!isReviewed && hasTrade ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                  ) : null}
                </div>
                {hasTrade && cell.pnl !== null ? (
                  <span
                    className={cn(
                      "mt-auto text-sm font-semibold tracking-normal",
                      isProfit && "text-[var(--success)]",
                      isLoss && "text-rose-300",
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
                className={cn(className, "hover:border-[rgba(184,241,53,0.40)]")}
                style={heatStyle}
              >
                {content}
              </Link>
            ) : (
              <div key={cell.key} className={className} style={heatStyle}>
                {content}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
        <div className="rounded-[18px] border border-[rgba(184,241,53,0.24)] bg-[rgba(184,241,53,0.10)] px-4 py-4">
          <p className="text-sm text-slate-400">{copy.calendar.summary.totalPnl}</p>
          <p
            className={cn(
              "mt-2 text-lg font-semibold",
              summary.totalPnl > 0 && "text-[var(--success)]",
              summary.totalPnl < 0 && "text-rose-300",
              summary.totalPnl === 0 && "text-slate-100",
            )}
          >
            {formatCurrency(summary.totalPnl, settings.currency)}
          </p>
        </div>
        <div className="rounded-[18px] border border-white/10 bg-[rgba(30,33,30,0.42)] px-4 py-4">
          <p className="text-sm text-slate-400">
            {copy.calendar.summary.winningDays}
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-100">
            {summary.winningDays} ({formatPercent(winningDayRate)})
          </p>
        </div>
        <div className="rounded-[18px] border border-white/10 bg-[rgba(30,33,30,0.42)] px-4 py-4">
          <p className="text-sm text-slate-400">
            {copy.calendar.summary.losingDays}
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-100">
            {summary.losingDays} ({formatPercent(losingDayRate)})
          </p>
        </div>
        <div className="rounded-[18px] border border-[rgba(184,241,53,0.18)] bg-[rgba(184,241,53,0.08)] px-4 py-4">
          <p className="text-sm text-slate-400">{copy.calendar.summary.bestDay}</p>
          <p className="mt-2 text-lg font-semibold text-[var(--accent)]">
            {formatCurrency(summary.bestDayPnl, settings.currency)}
          </p>
        </div>
      </div>
    </Card>
  );
}
