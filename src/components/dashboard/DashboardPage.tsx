"use client";

import { useMemo, useState } from "react";

import {
  todayReviewItems,
  type MetricData,
  type Tone,
} from "@/lib/mock-data";
import GoalsOverview from "@/components/dashboard/GoalsOverview";
import MetricCard from "@/components/dashboard/MetricCard";
import PerformanceRadar from "@/components/dashboard/PerformanceRadar";
import TodayReview from "@/components/dashboard/TodayReview";
import EquityCurve from "@/components/dashboard/EquityCurve";
import StrategyPerformance from "@/components/dashboard/StrategyPerformance";
import RecentTrades from "@/components/dashboard/RecentTrades";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSelectedMonth } from "@/components/providers/SelectedMonthProvider";
import { useTrades } from "@/components/providers/TradeStoreProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import Badge from "@/components/ui/Badge";
import DatePicker from "@/components/ui/DatePicker";
import PageHeader from "@/components/ui/PageHeader";
import { getAnalyticsSummary } from "@/lib/analytics-calculations";
import {
  getCalendarStats,
  getDailyWeeklyMonthlyPnl,
  getEquityCurveData,
  getMaxDrawdown,
  getPeriodStats,
  getStrategyStats,
  getTradesByMonth,
} from "@/lib/trade-calculations";
import type { Trade } from "@/lib/trade-types";
import {
  getMonthKeyFromDateKey,
  getTodayDateKey,
  parseSelectedMonth,
  formatMonthRange,
} from "@/lib/utils";

function getValueTone(value: number): Tone {
  if (value > 0) {
    return "positive";
  }

  if (value < 0) {
    return "negative";
  }

  return "neutral";
}

function buildMetrics(trades: Trade[], startingBalance: number): MetricData[] {
  const stats = getPeriodStats(trades);
  const maxDrawdown = getMaxDrawdown(trades, startingBalance);
  const drawdownValue = maxDrawdown.percent > 0 ? -maxDrawdown.percent : 0;

  return [
    {
      id: "netPnl",
      value: stats.netPnl,
      valueFormat: "currency",
      valueDigits: 2,
      valueTone: getValueTone(stats.netPnl),
    },
    {
      id: "winRate",
      value: stats.winRate,
      valueFormat: "percent",
      valueDigits: 1,
      valueTone: "accent",
    },
    {
      id: "profitFactor",
      value: stats.profitFactor,
      valueFormat: "number",
      valueDigits: 2,
      valueTone: "accent",
    },
    {
      id: "maxDrawdown",
      value: drawdownValue,
      valueFormat: "percent",
      valueDigits: 2,
      valueTone: drawdownValue < 0 ? "negative" : "neutral",
    },
  ];
}

export default function DashboardPage() {
  const { dictionary: copy, locale } = useLanguage();
  const { trades } = useTrades();
  const { settings } = useUserSettings();
  const { selectedMonth, setSelectedMonth } = useSelectedMonth();
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateKey());
  const { year, month } = useMemo(
    () => parseSelectedMonth(selectedMonth),
    [selectedMonth],
  );
  const monthTrades = useMemo(
    () => getTradesByMonth(trades, year, month),
    [month, trades, year],
  );
  const {
    dashboardMetrics,
    dayConsistency,
    equityCurveData,
    payoffRatio,
    performanceSummary,
    strategyStats,
  } = useMemo(() => {
    // calendarStats remains an input to the radar consistency metric even
    // though the dashboard's duplicate monthly calendar was removed.
    const calendarStats = getCalendarStats(monthTrades, year, month);
    const periodStats = getPeriodStats(monthTrades);
    const tradedDays = calendarStats.winningDays + calendarStats.losingDays;

    return {
      dashboardMetrics: buildMetrics(monthTrades, settings.startingBalance),
      dayConsistency:
        tradedDays > 0 ? (calendarStats.winningDays / tradedDays) * 100 : 0,
      equityCurveData: getEquityCurveData(monthTrades),
      payoffRatio:
        periodStats.averageLoss < 0
          ? periodStats.averageWin / Math.abs(periodStats.averageLoss)
          : periodStats.averageWin > 0
            ? Number.POSITIVE_INFINITY
            : 0,
      // Radar normalization stays in the PerformanceRadar display layer.
      performanceSummary: getAnalyticsSummary(
        monthTrades,
        settings.startingBalance,
      ),
      strategyStats: getStrategyStats(monthTrades),
    };
  }, [month, monthTrades, settings.startingBalance, year]);
  const recentTrades = useMemo(
    () =>
      [...trades]
        .sort((a, b) => b.closedAt.localeCompare(a.closedAt))
        .slice(0, 6),
    [trades],
  );
  const reviewPnlSummary = useMemo(
    () => getDailyWeeklyMonthlyPnl(trades, selectedDate),
    [selectedDate, trades],
  );

  function handleDateChange(nextDate: string) {
    setSelectedDate(nextDate);
    setSelectedMonth(getMonthKeyFromDateKey(nextDate));
  }

  return (
    <>
      <PageHeader
        title={copy.dashboardPage.title}
        description={copy.dashboardPage.subtitle}
        badge={
          <Badge variant="cyan" className="h-7 px-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] shadow-[0_0_12px_rgba(184,241,53,0.8)]" />
            {copy.dashboardPage.localMode}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-500 lg:inline">
              {formatMonthRange(selectedMonth, locale)}
            </span>
            <DatePicker
              value={selectedDate}
              onChange={handleDateChange}
              label={copy.selectDate}
            />
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </section>

      <PerformanceRadar
        winRate={performanceSummary.winRate}
        profitFactor={performanceSummary.profitFactor}
        avgR={performanceSummary.avgR}
        payoffRatio={payoffRatio}
        maxDrawdownPercent={performanceSummary.maxDrawdownPercent}
        consistency={dayConsistency}
      />

      {/* The monthly P&L calendar lived here next to Today's Review; it was
          removed (it duplicated the dedicated /calendar page) and Today's Review
          now spans the full width to fill the space. */}
      <TodayReview
        items={todayReviewItems}
        activeDate={selectedDate}
        pnlSummary={reviewPnlSummary}
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
        <EquityCurve data={equityCurveData} selectedMonth={selectedMonth} />
        <StrategyPerformance rows={strategyStats} />
      </section>

      <GoalsOverview />

      <RecentTrades rows={recentTrades} />
    </>
  );
}
