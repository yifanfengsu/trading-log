import type { DailyReview } from "@/lib/review-types";
import type { Trade } from "@/lib/trade-types";
import { getDateKey } from "@/lib/utils";

export interface CalendarMonthSummary {
  monthlyPnl: number;
  tradingDays: number;
  winningDays: number;
  losingDays: number;
  reviewedDays: number;
}

export interface CalendarInsights {
  bestDayDate: string | null;
  bestDayPnl: number;
  worstDayDate: string | null;
  worstDayPnl: number;
  averageTradingDayPnl: number;
  tradingDays: number;
  reviewedDays: number;
  reviewCompletionRate: number;
}

export interface DailyTradeStats {
  dailyPnl: number;
  totalTrades: number;
  winningTrades: number;
  winRate: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number | null;
  averageR: number;
}

function getMonthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function getMonthlyDailyPnlEntries(trades: Trade[], year: number, month: number) {
  const monthKey = getMonthKey(year, month);
  const dailyMap = new Map<string, number>();

  for (const trade of trades) {
    const dateKey = getDateKey(trade.closedAt);

    if (dateKey.startsWith(monthKey)) {
      dailyMap.set(dateKey, (dailyMap.get(dateKey) ?? 0) + trade.pnl);
    }
  }

  return Array.from(dailyMap.entries()).sort(([dateA], [dateB]) =>
    dateA.localeCompare(dateB),
  );
}

export function getTradeCountByDate(
  trades: Trade[],
  year: number,
  month: number,
) {
  const monthKey = getMonthKey(year, month);
  const countMap: Record<string, number> = {};

  for (const trade of trades) {
    const dateKey = getDateKey(trade.closedAt);

    if (dateKey.startsWith(monthKey)) {
      countMap[dateKey] = (countMap[dateKey] ?? 0) + 1;
    }
  }

  return countMap;
}

export function getReviewedDaysCount(
  reviews: DailyReview[],
  year: number,
  month: number,
) {
  const monthKey = getMonthKey(year, month);

  return reviews.filter((review) => review.date.startsWith(monthKey)).length;
}

export function getReviewCompletionRate(
  reviews: DailyReview[],
  trades: Trade[],
  year: number,
  month: number,
) {
  const tradingDays = new Set(
    getMonthlyDailyPnlEntries(trades, year, month).map(([date]) => date),
  );

  if (tradingDays.size === 0) {
    return 0;
  }

  const reviewedTradingDays = reviews.filter((review) =>
    tradingDays.has(review.date),
  ).length;

  return (reviewedTradingDays / tradingDays.size) * 100;
}

export function getCalendarMonthSummary(
  trades: Trade[],
  reviews: DailyReview[],
  year: number,
  month: number,
): CalendarMonthSummary {
  const entries = getMonthlyDailyPnlEntries(trades, year, month);

  return {
    monthlyPnl: entries.reduce((total, [, pnl]) => total + pnl, 0),
    tradingDays: entries.length,
    winningDays: entries.filter(([, pnl]) => pnl > 0).length,
    losingDays: entries.filter(([, pnl]) => pnl < 0).length,
    reviewedDays: getReviewedDaysCount(reviews, year, month),
  };
}

export function getCalendarInsights(
  trades: Trade[],
  reviews: DailyReview[],
  year: number,
  month: number,
): CalendarInsights {
  const entries = getMonthlyDailyPnlEntries(trades, year, month);
  const tradingDayDates = new Set(entries.map(([date]) => date));
  const reviewedTradingDays = reviews.filter((review) =>
    tradingDayDates.has(review.date),
  ).length;

  if (entries.length === 0) {
    return {
      bestDayDate: null,
      bestDayPnl: 0,
      worstDayDate: null,
      worstDayPnl: 0,
      averageTradingDayPnl: 0,
      tradingDays: 0,
      reviewedDays: 0,
      reviewCompletionRate: 0,
    };
  }

  const bestDay = entries.reduce((best, entry) =>
    entry[1] > best[1] ? entry : best,
  );
  const worstDay = entries.reduce((worst, entry) =>
    entry[1] < worst[1] ? entry : worst,
  );
  const totalPnl = entries.reduce((total, [, pnl]) => total + pnl, 0);

  return {
    bestDayDate: bestDay[0],
    bestDayPnl: bestDay[1],
    worstDayDate: worstDay[0],
    worstDayPnl: worstDay[1],
    averageTradingDayPnl: totalPnl / entries.length,
    tradingDays: entries.length,
    reviewedDays: reviewedTradingDays,
    reviewCompletionRate: getReviewCompletionRate(reviews, trades, year, month),
  };
}

export function getDailyTradeStats(trades: Trade[]): DailyTradeStats {
  const winningTrades = trades.filter((trade) => trade.pnl > 0);
  const losingTrades = trades.filter((trade) => trade.pnl < 0);
  const grossProfit = winningTrades.reduce((total, trade) => total + trade.pnl, 0);
  const grossLoss = losingTrades.reduce((total, trade) => total + trade.pnl, 0);
  const totalTrades = trades.length;
  const dailyPnl = trades.reduce((total, trade) => total + trade.pnl, 0);
  const averageR =
    totalTrades > 0
      ? trades.reduce((total, trade) => total + trade.rMultiple, 0) / totalTrades
      : 0;

  return {
    dailyPnl,
    totalTrades,
    winningTrades: winningTrades.length,
    winRate: totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0,
    grossProfit,
    grossLoss,
    profitFactor: grossLoss < 0 ? grossProfit / Math.abs(grossLoss) : null,
    averageR,
  };
}
