"use client";

import { useState } from "react";

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
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useTrades } from "@/components/providers/TradeStoreProvider";
import TradeDrawer from "@/components/trades/TradeDrawer";
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

type DrawerState =
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      trade: Trade;
    };

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

export default function AppShell() {
  const { dictionary } = useLanguage();
  const { trades } = useTrades();
  const [selectedMonth, setSelectedMonth] = useState("2025-05");
  const [drawerState, setDrawerState] = useState<DrawerState | null>(null);
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
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(123,97,255,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(76,134,255,0.08),transparent_22%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-[1760px] flex-col gap-6 px-4 py-4 sm:px-5 lg:flex-row lg:px-6">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <TopBar
            selectedMonth={selectedMonth}
            onAddTrade={() => setDrawerState({ mode: "create" })}
          />
          <main className="flex flex-col gap-6 pb-8">
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
              <EquityCurve
                data={equityCurveData}
                selectedMonth={selectedMonth}
              />
              <StrategyPerformance rows={strategyStats} />
            </section>

            <RecentTrades
              rows={recentTrades}
              onEdit={(trade) => setDrawerState({ mode: "edit", trade })}
            />
          </main>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(247,247,251,0)_0%,rgba(247,247,251,0.82)_100%)]" />
      <div className="sr-only">{dictionary.pageTitle}</div>
      {drawerState ? (
        <TradeDrawer
          mode={drawerState.mode}
          trade={drawerState.mode === "edit" ? drawerState.trade : undefined}
          onClose={() => setDrawerState(null)}
        />
      ) : null}
    </div>
  );
}
