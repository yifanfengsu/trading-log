"use client";

import { Activity, ListChecks, Percent, Plus, Wallet } from "lucide-react";
import { useState } from "react";

import TradeDetailDrawer from "@/components/trades/TradeDetailDrawer";
import TradesTable from "@/components/trades/TradesTable";
import TradesToolbar from "@/components/trades/TradesToolbar";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useTradeDrawer } from "@/components/providers/TradeDrawerProvider";
import { useTrades } from "@/components/providers/TradeStoreProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import { getPeriodStats } from "@/lib/trade-calculations";
import {
  defaultTradeFilters,
  filterTrades,
  getNextSortState,
  sortTrades,
  type TradeFilters,
  type TradeSortKey,
  type TradeSortState,
} from "@/lib/trade-filters";
import type { Trade } from "@/lib/trade-types";
import { formatCurrency, formatPercent, formatRMultiple } from "@/lib/utils";

const TRADES_PER_PAGE = 25;

function getAverageR(trades: Trade[]) {
  if (trades.length === 0) {
    return 0;
  }

  return (
    trades.reduce((total, trade) => total + trade.rMultiple, 0) / trades.length
  );
}

export default function TradesPage() {
  const { dictionary: copy } = useLanguage();
  const { trades } = useTrades();
  const { settings } = useUserSettings();
  const { openCreateTrade, openEditTrade } = useTradeDrawer();
  const [filters, setFilters] = useState<TradeFilters>(defaultTradeFilters);
  const [sortState, setSortState] = useState<TradeSortState>(null);
  const [detailTrade, setDetailTrade] = useState<Trade | null>(null);
  const [page, setPage] = useState(1);
  const filteredTrades = filterTrades(trades, filters);
  const sortedTrades = sortTrades(filteredTrades, sortState);
  const stats = getPeriodStats(filteredTrades);
  const avgR = getAverageR(filteredTrades);

  // Display-layer pagination over the already filtered + sorted list. Clamp the
  // current page so deletions / filter changes can never strand it on a blank
  // page; the slice never triggers a refetch (data already lives in the store).
  const totalPages = Math.max(1, Math.ceil(sortedTrades.length / TRADES_PER_PAGE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const pagedTrades = sortedTrades.slice(
    (currentPage - 1) * TRADES_PER_PAGE,
    currentPage * TRADES_PER_PAGE,
  );

  function handleSort(key: TradeSortKey) {
    setSortState((currentSort) => getNextSortState(currentSort, key));
  }

  // Any filter change resets to page 1 so the user never lands on a page that no
  // longer exists after the result set shrinks.
  function handleFiltersChange(nextFilters: TradeFilters) {
    setFilters(nextFilters);
    setPage(1);
  }

  function handleResetFilters() {
    setFilters(defaultTradeFilters);
    setPage(1);
  }

  function handleEditFromDetail(trade: Trade) {
    setDetailTrade(null);
    openEditTrade(trade);
  }

  return (
    <>
      <PageHeader
        title={copy.tradesPage.title}
        description={copy.tradesPage.subtitle}
        actions={
          <Button onClick={openCreateTrade}>
            <Plus className="h-4 w-4" />
            {copy.addTrade}
          </Button>
        }
      />

      <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
        <StatCard
          label={copy.tradesPage.totalTrades}
          value={String(filteredTrades.length)}
          tone="accent"
          icon={ListChecks}
        />
        <StatCard
          label={copy.tradesPage.totalPnl}
          value={formatCurrency(stats.netPnl, settings.currency)}
          tone={stats.netPnl > 0 ? "positive" : stats.netPnl < 0 ? "negative" : "neutral"}
          icon={Wallet}
        />
        <StatCard
          label={copy.strategyPerformance.winRate}
          value={formatPercent(stats.winRate)}
          tone="neutral"
          icon={Percent}
        />
        <StatCard
          label={copy.tradesPage.avgR}
          value={formatRMultiple(avgR)}
          tone={avgR > 0 ? "positive" : avgR < 0 ? "negative" : "neutral"}
          icon={Activity}
        />
      </section>

      <TradesToolbar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
      />

      <TradesTable
        trades={pagedTrades}
        hasAnyTrades={trades.length > 0}
        sortState={sortState}
        onSort={handleSort}
        onView={setDetailTrade}
        onResetFilters={handleResetFilters}
        totalCount={sortedTrades.length}
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {detailTrade ? (
        <TradeDetailDrawer
          trade={detailTrade}
          onClose={() => setDetailTrade(null)}
          onEdit={handleEditFromDetail}
        />
      ) : null}
    </>
  );
}
