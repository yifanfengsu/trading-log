"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import CalendarMonthGrid from "@/components/calendar/CalendarMonthGrid";
import CalendarSummaryCards from "@/components/calendar/CalendarSummaryCards";
import DayDetailDrawer from "@/components/calendar/DayDetailDrawer";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useDailyReviews } from "@/components/providers/ReviewStoreProvider";
import { useTrades } from "@/components/providers/TradeStoreProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import {
  getMonthLabel,
  getMonthNavigation,
  isValidDateKey,
} from "@/lib/calendar-utils";
import {
  getCalendarInsights,
  getCalendarMonthSummary,
  getTradeCountByDate,
} from "@/lib/review-calculations";
import { getDailyPnlMap, getTradesByDate } from "@/lib/trade-calculations";
import {
  cn,
  formatCurrency,
  formatPercent,
  formatShortDateLabel,
  getCurrentMonthKey,
  getMonthKeyFromDateKey,
  getTodayDateKey,
  parseSelectedMonth,
} from "@/lib/utils";

interface CalendarPageProps {
  initialDate?: string;
}

interface InsightRowProps {
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

function InsightRow({ label, value, tone = "neutral" }: InsightRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[18px] bg-[rgba(15,23,42,0.03)] px-4 py-3">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={cn("text-sm font-semibold", toneClasses[tone])}>{value}</p>
    </div>
  );
}

export default function CalendarPage({ initialDate }: CalendarPageProps) {
  const { dictionary: copy, locale } = useLanguage();
  const { trades } = useTrades();
  const { settings } = useUserSettings();
  const { dailyReviews, getReviewByDate } = useDailyReviews();
  const initialSelectedDate =
    initialDate && isValidDateKey(initialDate) ? initialDate : null;
  const [selectedMonth, setSelectedMonth] = useState(() =>
    initialSelectedDate
      ? getMonthKeyFromDateKey(initialSelectedDate)
      : getCurrentMonthKey(),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(() =>
    initialSelectedDate ?? getTodayDateKey(),
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(Boolean(initialSelectedDate));
  const { year, month } = parseSelectedMonth(selectedMonth);
  const { prevMonth, nextMonth } = getMonthNavigation(selectedMonth);
  const dailyPnlMap = useMemo(
    () => getDailyPnlMap(trades, year, month),
    [month, trades, year],
  );
  const tradeCountMap = useMemo(
    () => getTradeCountByDate(trades, year, month),
    [month, trades, year],
  );
  const reviewedDates = useMemo(
    () => new Set(dailyReviews.map((review) => review.date)),
    [dailyReviews],
  );
  const summary = useMemo(
    () => getCalendarMonthSummary(trades, dailyReviews, year, month),
    [dailyReviews, month, trades, year],
  );
  const insights = useMemo(
    () => getCalendarInsights(trades, dailyReviews, year, month),
    [dailyReviews, month, trades, year],
  );
  const selectedDateTrades = selectedDate
    ? getTradesByDate(trades, selectedDate)
    : [];
  const selectedReview = selectedDate ? getReviewByDate(selectedDate) : undefined;

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setIsDrawerOpen(true);
  }

  function handleMonthChange(nextSelectedMonth: string) {
    setSelectedMonth(nextSelectedMonth);
    setSelectedDate(null);
    setIsDrawerOpen(false);
  }

  function formatInsightDay(date: string | null, value: number) {
    if (!date) {
      return copy.calendarPage.noDataForMonth;
    }

    return `${formatShortDateLabel(date, locale)} · ${formatCurrency(
      value,
      settings.currency,
    )}`;
  }

  return (
    <>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-[30px]">
            {copy.calendarPage.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {copy.calendarPage.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleMonthChange(prevMonth)}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[rgba(148,163,184,0.16)] bg-white px-4 text-sm font-semibold text-slate-600 shadow-[0_8px_18px_rgba(31,15,86,0.04)] transition-colors hover:border-[rgba(108,77,255,0.22)] hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4" />
            {copy.calendarPage.previousMonth}
          </button>
          <div className="inline-flex h-11 items-center rounded-full bg-[rgba(108,77,255,0.10)] px-4 text-sm font-semibold text-[var(--accent)]">
            {getMonthLabel(selectedMonth, locale)}
          </div>
          <button
            type="button"
            onClick={() => handleMonthChange(nextMonth)}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[rgba(148,163,184,0.16)] bg-white px-4 text-sm font-semibold text-slate-600 shadow-[0_8px_18px_rgba(31,15,86,0.04)] transition-colors hover:border-[rgba(108,77,255,0.22)] hover:text-slate-900"
          >
            {copy.calendarPage.nextMonth}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <CalendarSummaryCards summary={summary} />

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.72fr)]">
        <CalendarMonthGrid
          selectedMonth={selectedMonth}
          selectedDate={selectedDate}
          dailyPnlMap={dailyPnlMap}
          tradeCountMap={tradeCountMap}
          reviewedDates={reviewedDates}
          onSelectDate={handleSelectDate}
        />

        <aside className="panel-card h-fit p-5 lg:p-6">
          <h2 className="panel-title">{copy.calendarPage.monthlyInsights}</h2>
          {insights.tradingDays > 0 ? (
            <div className="mt-5 space-y-3">
              <InsightRow
                label={copy.calendarPage.bestDay}
                value={formatInsightDay(insights.bestDayDate, insights.bestDayPnl)}
                tone="positive"
              />
              <InsightRow
                label={copy.calendarPage.worstDay}
                value={formatInsightDay(
                  insights.worstDayDate,
                  insights.worstDayPnl,
                )}
                tone="negative"
              />
              <InsightRow
                label={copy.calendarPage.avgDailyPnl}
                value={formatCurrency(
                  insights.averageTradingDayPnl,
                  settings.currency,
                )}
                tone={
                  insights.averageTradingDayPnl > 0
                    ? "positive"
                    : insights.averageTradingDayPnl < 0
                      ? "negative"
                      : "neutral"
                }
              />
              <InsightRow
                label={copy.calendarPage.reviewCompletion}
                value={`${formatPercent(insights.reviewCompletionRate)} · ${insights.reviewedDays}/${insights.tradingDays}`}
                tone="accent"
              />
            </div>
          ) : (
            <div className="mt-5 rounded-[20px] border border-dashed border-[rgba(148,163,184,0.22)] bg-[rgba(248,250,252,0.82)] px-4 py-10 text-center text-sm text-slate-500">
              {copy.calendarPage.noDataForMonth}
            </div>
          )}
        </aside>
      </section>

      {selectedDate && isDrawerOpen ? (
        <DayDetailDrawer
          date={selectedDate}
          trades={selectedDateTrades}
          review={selectedReview}
          onClose={() => setIsDrawerOpen(false)}
        />
      ) : null}
    </>
  );
}
