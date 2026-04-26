import type {
  Playbook,
  PlaybookStatus,
} from "@/lib/playbook-types";
import type { Trade, TradeSetup } from "@/lib/trade-types";

export type PlaybookFilters = {
  query: string;
  setup: "all" | TradeSetup;
  status: "all" | PlaybookStatus;
};

export type PlaybookStats = {
  linkedTrades: number;
  netPnl: number;
  winRate: number;
  profitFactor: number;
  avgR: number;
  bestTradePnl: number;
  worstTradePnl: number;
};

export type PlaybookSummary = {
  activeCount: number;
  archivedCount: number;
  linkedTradesCount: number;
  avgWinRate: number;
};

export function getTradesForPlaybook(trades: Trade[], playbook: Playbook) {
  return trades.filter((trade) => {
    if (trade.playbookId) {
      return trade.playbookId === playbook.id;
    }

    return trade.setup === playbook.setup;
  });
}

export function getPlaybookStats(
  trades: Trade[],
  playbook: Playbook,
): PlaybookStats {
  const linkedTrades = getTradesForPlaybook(trades, playbook);
  const winners = linkedTrades.filter((trade) => trade.pnl > 0);
  const losers = linkedTrades.filter((trade) => trade.pnl < 0);
  const grossProfit = winners.reduce((total, trade) => total + trade.pnl, 0);
  const grossLoss = losers.reduce((total, trade) => total + trade.pnl, 0);
  const netPnl = linkedTrades.reduce((total, trade) => total + trade.pnl, 0);
  const bestTrade =
    linkedTrades.length > 0
      ? linkedTrades.reduce((best, trade) => (trade.pnl > best.pnl ? trade : best))
      : null;
  const worstTrade =
    linkedTrades.length > 0
      ? linkedTrades.reduce((worst, trade) =>
          trade.pnl < worst.pnl ? trade : worst,
        )
      : null;

  return {
    linkedTrades: linkedTrades.length,
    netPnl,
    winRate:
      linkedTrades.length > 0 ? (winners.length / linkedTrades.length) * 100 : 0,
    profitFactor:
      grossLoss < 0
        ? grossProfit / Math.abs(grossLoss)
        : grossProfit > 0
          ? Infinity
          : 0,
    avgR:
      linkedTrades.length > 0
        ? linkedTrades.reduce((total, trade) => total + trade.rMultiple, 0) /
          linkedTrades.length
        : 0,
    bestTradePnl: bestTrade?.pnl ?? 0,
    worstTradePnl: worstTrade?.pnl ?? 0,
  };
}

export function getPlaybookSummary(
  playbooks: Playbook[],
  trades: Trade[],
): PlaybookSummary {
  const activeCount = playbooks.filter(
    (playbook) => playbook.status === "active",
  ).length;
  const archivedCount = playbooks.filter(
    (playbook) => playbook.status === "archived",
  ).length;
  const linkedTradeIds = new Set<string>();
  const winRates: number[] = [];

  for (const playbook of playbooks) {
    const linkedTrades = getTradesForPlaybook(trades, playbook);

    for (const trade of linkedTrades) {
      linkedTradeIds.add(trade.id);
    }

    if (linkedTrades.length > 0) {
      winRates.push(getPlaybookStats(trades, playbook).winRate);
    }
  }

  return {
    activeCount,
    archivedCount,
    linkedTradesCount: linkedTradeIds.size,
    avgWinRate:
      winRates.length > 0
        ? winRates.reduce((total, winRate) => total + winRate, 0) /
          winRates.length
        : 0,
  };
}

export function getRecentPlaybookTrades(
  trades: Trade[],
  playbook: Playbook,
  limit: number,
) {
  return [...getTradesForPlaybook(trades, playbook)]
    .sort((a, b) => b.closedAt.localeCompare(a.closedAt))
    .slice(0, limit);
}

export function filterPlaybooks(
  playbooks: Playbook[],
  filters: PlaybookFilters,
) {
  const query = filters.query.trim().toLowerCase();

  return playbooks.filter((playbook) => {
    const matchesQuery =
      query.length === 0 ||
      playbook.name.toLowerCase().includes(query) ||
      playbook.market.toLowerCase().includes(query) ||
      playbook.tags.some((tag) => tag.toLowerCase().includes(query));

    if (!matchesQuery) {
      return false;
    }

    if (filters.setup !== "all" && playbook.setup !== filters.setup) {
      return false;
    }

    if (filters.status !== "all" && playbook.status !== filters.status) {
      return false;
    }

    return true;
  });
}
