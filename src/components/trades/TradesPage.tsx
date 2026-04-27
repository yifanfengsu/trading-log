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
  const filteredTrades = filterTrades(trades, filters);
  const sortedTrades = sortTrades(filteredTrades, sortState);
  const stats = getPeriodStats(filteredTrades);
  const avgR = getAverageR(filteredTrades);

  function handleSort(key: TradeSortKey) {
    setSortState((currentSort) => getNextSortState(currentSort, key));
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
        onFiltersChange={setFilters}
        onReset={() => setFilters(defaultTradeFilters)}
      />

      <TradesTable
        trades={sortedTrades}
        hasAnyTrades={trades.length > 0}
        sortState={sortState}
        onSort={handleSort}
        onView={setDetailTrade}
        onResetFilters={() => setFilters(defaultTradeFilters)}
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
