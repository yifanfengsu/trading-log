import type { Trade, TradeSetup, TradeSide } from "@/lib/trade-types";
import { getCurrentMonthKey, getDateKey } from "@/lib/utils";

export type TradeResultFilter = "all" | "winner" | "loser";

export type AnalyticsFilters = {
  selectedMonth: string;
  symbol: "all" | string;
  side: "all" | TradeSide;
  setup: "all" | TradeSetup;
  result: TradeResultFilter;
};

export type TradeFilters = {
  query: string;
  side: "all" | TradeSide;
  setup: "all" | TradeSetup;
  result: TradeResultFilter;
  startDate: string;
  endDate: string;
};

export type TradeSortKey = "closedAt" | "symbol" | "pnl" | "rMultiple";
export type SortDirection = "asc" | "desc";

export type TradeSortState = {
  key: TradeSortKey;
  direction: SortDirection;
} | null;

export const defaultTradeFilters: TradeFilters = {
  query: "",
  side: "all",
  setup: "all",
  result: "all",
  startDate: "",
  endDate: "",
};

export function getDefaultAnalyticsFilters(): AnalyticsFilters {
  return {
    selectedMonth: getCurrentMonthKey(),
    symbol: "all",
    side: "all",
    setup: "all",
    result: "all",
  };
}

export function filterAnalyticsTrades(
  trades: Trade[],
  filters: AnalyticsFilters,
) {
  return trades.filter((trade) => {
    const dateKey = getDateKey(trade.closedAt);

    if (!dateKey.startsWith(filters.selectedMonth)) {
      return false;
    }

    if (filters.symbol !== "all" && trade.symbol !== filters.symbol) {
      return false;
    }

    if (filters.side !== "all" && trade.side !== filters.side) {
      return false;
    }

    if (filters.setup !== "all" && trade.setup !== filters.setup) {
      return false;
    }

    if (filters.result === "winner" && trade.pnl <= 0) {
      return false;
    }

    if (filters.result === "loser" && trade.pnl >= 0) {
      return false;
    }

    return true;
  });
}

export function filterTrades(trades: Trade[], filters: TradeFilters) {
  const query = filters.query.trim().toUpperCase();

  return trades.filter((trade) => {
    const dateKey = getDateKey(trade.closedAt);

    if (query && !trade.symbol.toUpperCase().includes(query)) {
      return false;
    }

    if (filters.side !== "all" && trade.side !== filters.side) {
      return false;
    }

    if (filters.setup !== "all" && trade.setup !== filters.setup) {
      return false;
    }

    if (filters.result === "winner" && trade.pnl <= 0) {
      return false;
    }

    if (filters.result === "loser" && trade.pnl >= 0) {
      return false;
    }

    if (filters.startDate && dateKey < filters.startDate) {
      return false;
    }

    if (filters.endDate && dateKey > filters.endDate) {
      return false;
    }

    return true;
  });
}

export function sortTrades(trades: Trade[], sortState: TradeSortState) {
  const sortedTrades = [...trades];

  if (!sortState) {
    return sortedTrades.sort((a, b) => b.closedAt.localeCompare(a.closedAt));
  }

  const direction = sortState.direction === "asc" ? 1 : -1;

  return sortedTrades.sort((a, b) => {
    if (sortState.key === "closedAt") {
      return a.closedAt.localeCompare(b.closedAt) * direction;
    }

    if (sortState.key === "symbol") {
      return a.symbol.localeCompare(b.symbol) * direction;
    }

    return (a[sortState.key] - b[sortState.key]) * direction;
  });
}

export function getNextSortState(
  currentSort: TradeSortState,
  key: TradeSortKey,
): TradeSortState {
  if (!currentSort || currentSort.key !== key) {
    return {
      key,
      direction: "asc",
    };
  }

  if (currentSort.direction === "asc") {
    return {
      key,
      direction: "desc",
    };
  }

  return null;
}
