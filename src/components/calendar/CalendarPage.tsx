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
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DatePicker from "@/components/ui/DatePicker";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import {
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
  neutral: "text-slate-100",
  positive: "text-[var(--success)]",
  negative: "text-rose-300",
  accent: "text-[var(--accent)]",
} as const;

function InsightRow({ label, value, tone = "neutral" }: InsightRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[18px] border border-white/10 bg-[rgba(30,33,30,0.42)] px-4 py-3">
      <p className="text-sm text-slate-400">{label}</p>
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
    setSelectedDate(`${nextSelectedMonth}-01`);
    setIsDrawerOpen(false);
  }

  function handleDatePickerChange(nextSelectedDate: string) {
    setSelectedMonth(getMonthKeyFromDateKey(nextSelectedDate));
    setSelectedDate(nextSelectedDate);
    setIsDrawerOpen(true);
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
      <PageHeader
        title={copy.calendarPage.title}
        description={copy.calendarPage.subtitle}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => handleMonthChange(prevMonth)}
              variant="secondary"
              title={copy.calendarPage.previousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
              {copy.calendarPage.previousMonth}
            </Button>
            <DatePicker
              value={selectedDate ?? `${selectedMonth}-01`}
              onChange={handleDatePickerChange}
              label={copy.selectDate}
            />
            <Button
              onClick={() => handleMonthChange(nextMonth)}
              variant="secondary"
              title={copy.calendarPage.nextMonth}
            >
              {copy.calendarPage.nextMonth}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        }
      />

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

        <Card as="aside" className="h-fit">
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
            <EmptyState
              title={copy.calendarPage.noDataForMonth}
              className="mt-5 min-h-[220px]"
            />
          )}
        </Card>
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
