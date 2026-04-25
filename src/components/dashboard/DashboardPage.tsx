"use client";

import {
  todayReviewItems,
  type MetricData,
  type Tone,
} from "@/lib/mock-data";
import MetricCard from "@/components/dashboard/MetricCard";
import PnlCalendar from "@/components/dashboard/PnlCalendar";
import TodayReview from "@/components/dashboard/TodayReview";
import EquityCurve from "@/components/dashboard/EquityCurve";
import StrategyPerformance from "@/components/dashboard/StrategyPerformance";
import RecentTrades from "@/components/dashboard/RecentTrades";
import { useSelectedMonth } from "@/components/providers/SelectedMonthProvider";
import { useTrades } from "@/components/providers/TradeStoreProvider";
import {
  getCalendarStats,
  getDailyPnlMap,
  getDailyWeeklyMonthlyPnl,
  getEquityCurveData,
  getMaxDrawdown,
  getPeriodStats,
  getStrategyStats,
  getTradesByMonth,
} from "@/lib/trade-calculations";
import type { Trade } from "@/lib/trade-types";
import { getDateKey, getMonthEndDateKey, parseSelectedMonth } from "@/lib/utils";

function getValueTone(value: number): Tone {
  if (value > 0) {
    return "positive";
  }

  if (value < 0) {
    return "negative";
  }

  return "neutral";
}

function getLatestTradeDate(trades: Trade[]) {
  if (trades.length === 0) {
    return null;
  }

  const latestTrade = [...trades].sort((a, b) =>
    b.closedAt.localeCompare(a.closedAt),
  )[0];

  return latestTrade ? getDateKey(latestTrade.closedAt) : null;
}

function buildMetrics(trades: Trade[]): MetricData[] {
  const stats = getPeriodStats(trades);
  const maxDrawdown = getMaxDrawdown(trades);
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
  const { trades } = useTrades();
  const { selectedMonth, setSelectedMonth } = useSelectedMonth();
  const { year, month } = parseSelectedMonth(selectedMonth);
  const monthTrades = getTradesByMonth(trades, year, month);
  const dailyPnlMap = getDailyPnlMap(trades, year, month);
  const calendarStats = getCalendarStats(trades, year, month);
  const equityCurveData = getEquityCurveData(monthTrades);
  const strategyStats = getStrategyStats(monthTrades);
  const dashboardMetrics = buildMetrics(monthTrades);
  const recentTrades = [...trades]
    .sort((a, b) => b.closedAt.localeCompare(a.closedAt))
    .slice(0, 6);
  const activeDate =
    getLatestTradeDate(monthTrades) ?? getMonthEndDateKey(selectedMonth);
  const reviewPnlSummary = getDailyWeeklyMonthlyPnl(trades, activeDate);

  return (
    <>
      <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.92fr)]">
        <PnlCalendar
          selectedMonth={selectedMonth}
          dailyPnlMap={dailyPnlMap}
          summary={calendarStats}
          onMonthChange={setSelectedMonth}
        />
        <TodayReview
          items={todayReviewItems}
          activeDate={activeDate}
          pnlSummary={reviewPnlSummary}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
        <EquityCurve data={equityCurveData} selectedMonth={selectedMonth} />
        <StrategyPerformance rows={strategyStats} />
      </section>

      <RecentTrades rows={recentTrades} />
    </>
  );
}
