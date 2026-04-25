import type { Trade, TradeSetup } from "@/lib/trade-types";
import { getDateKey } from "@/lib/utils";

export const STARTING_BALANCE = 100000;

export interface PeriodStats {
  netPnl: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  expectancy: number;
  bestTrade: Trade | null;
  worstTrade: Trade | null;
}

export interface CalendarStats {
  totalPnl: number;
  winningDays: number;
  losingDays: number;
  bestDayPnl: number;
  bestDayDate: string | null;
}

export interface EquityCurvePoint {
  date: string;
  pnl: number;
  equity: number;
}

export interface MaxDrawdown {
  amount: number;
  percent: number;
}

export interface StrategyStats {
  setup: TradeSetup;
  netPnl: number;
  totalTrades: number;
  winRate: number;
  profitFactor: number;
}

export interface PnlPeriodSummary {
  dailyPnl: number;
  weeklyPnl: number;
  monthlyPnl: number;
}

function compareTradesAsc(a: Trade, b: Trade) {
  return a.closedAt.localeCompare(b.closedAt);
}

function getMonthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function getTradesByMonth(trades: Trade[], year: number, month: number) {
  const monthKey = getMonthKey(year, month);
  return trades.filter((trade) => getDateKey(trade.closedAt).startsWith(monthKey));
}

export function getTradesByDate(trades: Trade[], date: string) {
  return trades.filter((trade) => getDateKey(trade.closedAt) === date);
}

export function getDailyPnlMap(
  trades: Trade[],
  year: number,
  month: number,
) {
  const dailyMap: Record<string, number> = {};

  for (const trade of getTradesByMonth(trades, year, month)) {
    const dateKey = getDateKey(trade.closedAt);
    dailyMap[dateKey] = (dailyMap[dateKey] ?? 0) + trade.pnl;
  }

  return dailyMap;
}

export function getPeriodStats(trades: Trade[]): PeriodStats {
  const winningTrades = trades.filter((trade) => trade.pnl > 0);
  const losingTrades = trades.filter((trade) => trade.pnl < 0);
  const grossProfit = winningTrades.reduce((total, trade) => total + trade.pnl, 0);
  const grossLoss = losingTrades.reduce((total, trade) => total + trade.pnl, 0);
  const netPnl = trades.reduce((total, trade) => total + trade.pnl, 0);
  const totalTrades = trades.length;
  const bestTrade =
    trades.length > 0
      ? trades.reduce((best, trade) => (trade.pnl > best.pnl ? trade : best))
      : null;
  const worstTrade =
    trades.length > 0
      ? trades.reduce((worst, trade) => (trade.pnl < worst.pnl ? trade : worst))
      : null;

  return {
    netPnl,
    totalTrades,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate: totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0,
    grossProfit,
    grossLoss,
    profitFactor:
      grossLoss < 0
        ? grossProfit / Math.abs(grossLoss)
        : grossProfit > 0
          ? Infinity
          : 0,
    averageWin:
      winningTrades.length > 0 ? grossProfit / winningTrades.length : 0,
    averageLoss:
      losingTrades.length > 0 ? grossLoss / losingTrades.length : 0,
    expectancy: totalTrades > 0 ? netPnl / totalTrades : 0,
    bestTrade,
    worstTrade,
  };
}

export function getCalendarStats(
  trades: Trade[],
  year: number,
  month: number,
): CalendarStats {
  const dailyMap = getDailyPnlMap(trades, year, month);
  const entries = Object.entries(dailyMap);
  const bestEntry = entries.reduce<[string | null, number]>(
    (best, [date, pnl]) => {
      if (best[0] === null || pnl > best[1]) {
        return [date, pnl];
      }

      return best;
    },
    [null, 0],
  );

  return {
    totalPnl: entries.reduce((total, [, pnl]) => total + pnl, 0),
    winningDays: entries.filter(([, pnl]) => pnl > 0).length,
    losingDays: entries.filter(([, pnl]) => pnl < 0).length,
    bestDayPnl: bestEntry[1],
    bestDayDate: bestEntry[0],
  };
}

export function getEquityCurveData(trades: Trade[]): EquityCurvePoint[] {
  const sortedTrades = [...trades].sort(compareTradesAsc);
  let equity = 0;

  return sortedTrades.map((trade) => {
    equity += trade.pnl;

    return {
      date: getDateKey(trade.closedAt),
      pnl: trade.pnl,
      equity,
    };
  });
}

export function getMaxDrawdown(trades: Trade[]): MaxDrawdown {
  let peak = 0;
  let maxDrawdown = 0;

  for (const point of getEquityCurveData(trades)) {
    peak = Math.max(peak, point.equity);
    maxDrawdown = Math.max(maxDrawdown, peak - point.equity);
  }

  return {
    amount: maxDrawdown,
    percent: (maxDrawdown / STARTING_BALANCE) * 100,
  };
}

export function getStrategyStats(trades: Trade[]): StrategyStats[] {
  const grouped = new Map<TradeSetup, Trade[]>();

  for (const trade of trades) {
    grouped.set(trade.setup, [...(grouped.get(trade.setup) ?? []), trade]);
  }

  return Array.from(grouped.entries())
    .map(([setup, setupTrades]) => {
      const stats = getPeriodStats(setupTrades);

      return {
        setup,
        netPnl: stats.netPnl,
        totalTrades: stats.totalTrades,
        winRate: stats.winRate,
        profitFactor: stats.profitFactor,
      };
    })
    .sort((a, b) => b.netPnl - a.netPnl);
}

export function getDailyWeeklyMonthlyPnl(
  trades: Trade[],
  activeDate: string,
): PnlPeriodSummary {
  const [year, month, day] = activeDate.split("-").map(Number);
  const active = new Date(year, month - 1, day);
  const dayOfWeek = active.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(year, month - 1, day + mondayOffset);
  const weekEnd = new Date(
    weekStart.getFullYear(),
    weekStart.getMonth(),
    weekStart.getDate() + 6,
  );
  const monthKey = getMonthKey(year, month);

  return trades.reduce<PnlPeriodSummary>(
    (summary, trade) => {
      const dateKey = getDateKey(trade.closedAt);
      const [tradeYear, tradeMonth, tradeDay] = dateKey.split("-").map(Number);
      const tradeDate = new Date(tradeYear, tradeMonth - 1, tradeDay);

      if (dateKey === activeDate) {
        summary.dailyPnl += trade.pnl;
      }

      if (tradeDate >= weekStart && tradeDate <= weekEnd) {
        summary.weeklyPnl += trade.pnl;
      }

      if (dateKey.startsWith(monthKey)) {
        summary.monthlyPnl += trade.pnl;
      }

      return summary;
    },
    {
      dailyPnl: 0,
      weeklyPnl: 0,
      monthlyPnl: 0,
    },
  );
}
