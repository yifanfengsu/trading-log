"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import TradeDetailDrawer from "@/components/trades/TradeDetailDrawer";
import TradesTable from "@/components/trades/TradesTable";
import TradesToolbar from "@/components/trades/TradesToolbar";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useTradeDrawer } from "@/components/providers/TradeDrawerProvider";
import { useTrades } from "@/components/providers/TradeStoreProvider";
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
import { cn, formatCurrency, formatPercent, formatRMultiple } from "@/lib/utils";

interface SummaryCardProps {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative" | "accent";
}

const toneClassMap = {
  neutral: "text-slate-950",
  positive: "text-emerald-600",
  negative: "text-rose-600",
  accent: "text-[var(--accent)]",
} as const;

function SummaryCard({ label, value, tone = "neutral" }: SummaryCardProps) {
  return (
    <article className="panel-card p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p
        className={cn(
          "mt-5 text-[30px] font-semibold tracking-[-0.04em]",
          toneClassMap[tone],
        )}
      >
        {value}
      </p>
    </article>
  );
}

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
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-[30px]">
            {copy.tradesPage.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {copy.tradesPage.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateTrade}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(108,77,255,0.22)] transition-colors hover:bg-[var(--accent-strong)]"
        >
          <Plus className="h-4 w-4" />
          {copy.addTrade}
        </button>
      </section>

      <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
        <SummaryCard
          label={copy.tradesPage.totalTrades}
          value={String(filteredTrades.length)}
          tone="accent"
        />
        <SummaryCard
          label={copy.tradesPage.totalPnl}
          value={formatCurrency(stats.netPnl)}
          tone={stats.netPnl > 0 ? "positive" : stats.netPnl < 0 ? "negative" : "neutral"}
        />
        <SummaryCard
          label={copy.strategyPerformance.winRate}
          value={formatPercent(stats.winRate)}
          tone="neutral"
        />
        <SummaryCard
          label={copy.tradesPage.avgR}
          value={formatRMultiple(avgR)}
          tone={avgR > 0 ? "positive" : avgR < 0 ? "negative" : "neutral"}
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
