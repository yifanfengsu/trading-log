"use client";

import { useMemo, useState } from "react";

import AnalyticsFilters from "@/components/analytics/AnalyticsFilters";
import AnalyticsSummaryCards from "@/components/analytics/AnalyticsSummaryCards";
import RMultipleDistribution from "@/components/analytics/RMultipleDistribution";
import ReviewBehaviorInsights from "@/components/analytics/ReviewBehaviorInsights";
import SetupPerformanceChart from "@/components/analytics/SetupPerformanceChart";
import SidePerformanceCard from "@/components/analytics/SidePerformanceCard";
import SymbolPerformanceChart from "@/components/analytics/SymbolPerformanceChart";
import TagImpactTable from "@/components/analytics/TagImpactTable";
import TopTradesTable from "@/components/analytics/TopTradesTable";
import WeekdayPerformanceChart from "@/components/analytics/WeekdayPerformanceChart";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useDailyReviews } from "@/components/providers/ReviewStoreProvider";
import { useTrades } from "@/components/providers/TradeStoreProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import {
  getAnalyticsSummary,
  getRMultipleDistribution,
  getReviewBehaviorInsights,
  getSetupPerformance,
  getSidePerformance,
  getSymbolPerformance,
  getTagImpact,
  getTopLosingTrades,
  getTopWinningTrades,
  getWeekdayPerformance,
} from "@/lib/analytics-calculations";
import {
  filterAnalyticsTrades,
  getDefaultAnalyticsFilters,
  type AnalyticsFilters as AnalyticsFiltersState,
} from "@/lib/trade-filters";

function AnalyticsEmptyState({ label }: { label: string }) {
  return (
    <Card>
      <EmptyState title={label} className="min-h-[320px]" />
    </Card>
  );
}

export default function AnalyticsPage() {
  const { dictionary: copy } = useLanguage();
  const { trades } = useTrades();
  const { settings } = useUserSettings();
  const { dailyReviews } = useDailyReviews();
  const [filters, setFilters] = useState<AnalyticsFiltersState>(() =>
    getDefaultAnalyticsFilters(),
  );
  const symbols = useMemo(
    () => Array.from(new Set(trades.map((trade) => trade.symbol))).sort(),
    [trades],
  );
  const filteredTrades = useMemo(
    () => filterAnalyticsTrades(trades, filters),
    [filters, trades],
  );
  const summary = useMemo(
    () => getAnalyticsSummary(filteredTrades, settings.startingBalance),
    [filteredTrades, settings.startingBalance],
  );
  const setupPerformance = useMemo(
    () => getSetupPerformance(filteredTrades),
    [filteredTrades],
  );
  const sidePerformance = useMemo(
    () => getSidePerformance(filteredTrades),
    [filteredTrades],
  );
  const symbolPerformance = useMemo(
    () => getSymbolPerformance(filteredTrades),
    [filteredTrades],
  );
  const weekdayPerformance = useMemo(
    () => getWeekdayPerformance(filteredTrades),
    [filteredTrades],
  );
  const rMultipleDistribution = useMemo(
    () => getRMultipleDistribution(filteredTrades),
    [filteredTrades],
  );
  const tagImpact = useMemo(
    () => getTagImpact(filteredTrades),
    [filteredTrades],
  );
  const reviewInsights = useMemo(
    () => getReviewBehaviorInsights(filteredTrades, dailyReviews),
    [dailyReviews, filteredTrades],
  );
  const topWinners = useMemo(
    () => getTopWinningTrades(filteredTrades, 5),
    [filteredTrades],
  );
  const topLosers = useMemo(
    () => getTopLosingTrades(filteredTrades, 5),
    [filteredTrades],
  );

  return (
    <>
      <PageHeader
        title={copy.analyticsPage.title}
        description={copy.analyticsPage.subtitle}
      />

      <AnalyticsFilters
        filters={filters}
        symbols={symbols}
        onFiltersChange={setFilters}
        onReset={() => setFilters(getDefaultAnalyticsFilters())}
      />

      {trades.length === 0 ? (
        <AnalyticsEmptyState label={copy.analyticsPage.noTradeData} />
      ) : filteredTrades.length === 0 ? (
        <AnalyticsEmptyState label={copy.analyticsPage.noFilterData} />
      ) : (
        <>
          <AnalyticsSummaryCards summary={summary} />

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.7fr)]">
            <SetupPerformanceChart rows={setupPerformance} />
            <SidePerformanceCard rows={sidePerformance} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
            <SymbolPerformanceChart rows={symbolPerformance} />
            <WeekdayPerformanceChart rows={weekdayPerformance} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.95fr)]">
            <RMultipleDistribution rows={rMultipleDistribution} />
            <TagImpactTable rows={tagImpact} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,1fr)]">
            <ReviewBehaviorInsights insights={reviewInsights} />
            <TopTradesTable winners={topWinners} losers={topLosers} />
          </section>
        </>
      )}
    </>
  );
}
