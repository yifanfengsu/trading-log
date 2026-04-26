import type { DailyReview, ReviewEmotion } from "@/lib/review-types";
import {
  getMaxDrawdown,
  getPeriodStats,
} from "@/lib/trade-calculations";
import type { Trade, TradeSetup, TradeSide } from "@/lib/trade-types";
import { getDateKey, getWeekdayIndexFromDateKey } from "@/lib/utils";

export interface AnalyticsSummary {
  netPnl: number;
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  avgR: number;
  maxDrawdownPercent: number;
}

export interface SetupPerformanceRow {
  setup: TradeSetup;
  netPnl: number;
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  avgR: number;
}

export interface SymbolPerformanceRow {
  symbol: string;
  netPnl: number;
  totalTrades: number;
  winRate: number;
  avgR: number;
}

export interface SidePerformanceRow {
  side: TradeSide;
  netPnl: number;
  totalTrades: number;
  winRate: number;
  avgR: number;
}

export interface WeekdayPerformanceRow {
  weekday: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  netPnl: number;
  totalTrades: number;
  winRate: number;
  avgR: number;
}

export interface RMultipleDistributionRow {
  bucket: string;
  count: number;
  netPnl: number;
}

export interface TagImpactRow {
  tag: string;
  netPnl: number;
  totalTrades: number;
  winRate: number;
  avgR: number;
}

export interface ReviewEmotionStats {
  emotion: ReviewEmotion;
  reviewedDays: number;
  netPnl: number;
  avgDailyPnl: number;
  avgScore: number;
}

export interface ReviewBehaviorInsights {
  reviewedTradingDays: number;
  unreviewedTradingDays: number;
  reviewedDaysPnl: number;
  unreviewedDaysPnl: number;
  averageExecutionScore: number;
  emotionStats: ReviewEmotionStats[];
}

interface GroupStats {
  netPnl: number;
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  avgR: number;
}

const sideOrder: TradeSide[] = ["long", "short"];
const weekdayOrder: WeekdayPerformanceRow["weekday"][] = [1, 2, 3, 4, 5, 6, 7];

const rMultipleBuckets = [
  "<= -2R",
  "-2R ~ -1R",
  "-1R ~ 0R",
  "0R ~ 1R",
  "1R ~ 2R",
  ">= 2R",
] as const;

function getAvgR(trades: Trade[]) {
  if (trades.length === 0) {
    return 0;
  }

  return trades.reduce((total, trade) => total + trade.rMultiple, 0) / trades.length;
}

function buildGroupStats(trades: Trade[]): GroupStats {
  const stats = getPeriodStats(trades);

  return {
    netPnl: stats.netPnl,
    totalTrades: stats.totalTrades,
    winRate: stats.winRate,
    profitFactor: stats.profitFactor,
    avgR: getAvgR(trades),
  };
}

function getRMultipleBucket(rMultiple: number): (typeof rMultipleBuckets)[number] {
  if (rMultiple <= -2) {
    return "<= -2R";
  }

  if (rMultiple <= -1) {
    return "-2R ~ -1R";
  }

  if (rMultiple < 0) {
    return "-1R ~ 0R";
  }

  if (rMultiple < 1) {
    return "0R ~ 1R";
  }

  if (rMultiple < 2) {
    return "1R ~ 2R";
  }

  return ">= 2R";
}

function getNormalizedTags(trade: Trade) {
  const tags = trade.tags ?? [];
  const normalizedTags = new Set<string>();

  for (const tagValue of tags) {
    for (const tag of tagValue.split(/[,，]/)) {
      const normalizedTag = tag.trim();

      if (normalizedTag) {
        normalizedTags.add(normalizedTag);
      }
    }
  }

  return normalizedTags;
}

function getDailyPnlEntries(trades: Trade[]) {
  const dailyPnlMap = new Map<string, number>();

  for (const trade of trades) {
    const dateKey = getDateKey(trade.closedAt);
    dailyPnlMap.set(dateKey, (dailyPnlMap.get(dateKey) ?? 0) + trade.pnl);
  }

  return Array.from(dailyPnlMap.entries()).sort(([dateA], [dateB]) =>
    dateA.localeCompare(dateB),
  );
}

export function getAnalyticsSummary(trades: Trade[]): AnalyticsSummary {
  const stats = getPeriodStats(trades);
  const maxDrawdown = getMaxDrawdown(trades);

  return {
    netPnl: stats.netPnl,
    totalTrades: stats.totalTrades,
    winRate: stats.winRate,
    profitFactor: stats.profitFactor,
    avgR: getAvgR(trades),
    maxDrawdownPercent: maxDrawdown.percent,
  };
}

export function getSetupPerformance(trades: Trade[]): SetupPerformanceRow[] {
  const grouped = new Map<TradeSetup, Trade[]>();

  for (const trade of trades) {
    grouped.set(trade.setup, [...(grouped.get(trade.setup) ?? []), trade]);
  }

  return Array.from(grouped.entries())
    .map(([setup, setupTrades]) => ({
      setup,
      ...buildGroupStats(setupTrades),
    }))
    .sort((a, b) => b.netPnl - a.netPnl);
}

export function getSymbolPerformance(trades: Trade[]): SymbolPerformanceRow[] {
  const grouped = new Map<string, Trade[]>();

  for (const trade of trades) {
    grouped.set(trade.symbol, [...(grouped.get(trade.symbol) ?? []), trade]);
  }

  return Array.from(grouped.entries())
    .map(([symbol, symbolTrades]) => {
      const stats = buildGroupStats(symbolTrades);

      return {
        symbol,
        netPnl: stats.netPnl,
        totalTrades: stats.totalTrades,
        winRate: stats.winRate,
        avgR: stats.avgR,
      };
    })
    .sort((a, b) => b.netPnl - a.netPnl);
}

export function getSidePerformance(trades: Trade[]): SidePerformanceRow[] {
  if (trades.length === 0) {
    return [];
  }

  return sideOrder.map((side) => {
    const sideTrades = trades.filter((trade) => trade.side === side);
    const stats = buildGroupStats(sideTrades);

    return {
      side,
      netPnl: stats.netPnl,
      totalTrades: stats.totalTrades,
      winRate: stats.winRate,
      avgR: stats.avgR,
    };
  });
}

export function getWeekdayPerformance(trades: Trade[]): WeekdayPerformanceRow[] {
  if (trades.length === 0) {
    return [];
  }

  return weekdayOrder.map((weekday) => {
    const weekdayTrades = trades.filter(
      (trade) => getWeekdayIndexFromDateKey(getDateKey(trade.closedAt)) === weekday,
    );
    const stats = buildGroupStats(weekdayTrades);

    return {
      weekday,
      netPnl: stats.netPnl,
      totalTrades: stats.totalTrades,
      winRate: stats.winRate,
      avgR: stats.avgR,
    };
  });
}

export function getRMultipleDistribution(
  trades: Trade[],
): RMultipleDistributionRow[] {
  if (trades.length === 0) {
    return [];
  }

  const bucketMap = new Map<(typeof rMultipleBuckets)[number], RMultipleDistributionRow>(
    rMultipleBuckets.map((bucket) => [bucket, { bucket, count: 0, netPnl: 0 }]),
  );

  for (const trade of trades) {
    const bucket = getRMultipleBucket(trade.rMultiple);
    const row = bucketMap.get(bucket);

    if (row) {
      row.count += 1;
      row.netPnl += trade.pnl;
    }
  }

  return rMultipleBuckets.map((bucket) => bucketMap.get(bucket) ?? {
    bucket,
    count: 0,
    netPnl: 0,
  });
}

export function getTagImpact(trades: Trade[]): TagImpactRow[] {
  const grouped = new Map<string, Trade[]>();

  for (const trade of trades) {
    for (const tag of getNormalizedTags(trade)) {
      grouped.set(tag, [...(grouped.get(tag) ?? []), trade]);
    }
  }

  return Array.from(grouped.entries())
    .map(([tag, tagTrades]) => {
      const stats = buildGroupStats(tagTrades);

      return {
        tag,
        netPnl: stats.netPnl,
        totalTrades: stats.totalTrades,
        winRate: stats.winRate,
        avgR: stats.avgR,
      };
    })
    .sort((a, b) => a.netPnl - b.netPnl);
}

export function getTopWinningTrades(trades: Trade[], limit: number) {
  return [...trades]
    .filter((trade) => trade.pnl > 0)
    .sort((a, b) => b.pnl - a.pnl)
    .slice(0, limit);
}

export function getTopLosingTrades(trades: Trade[], limit: number) {
  return [...trades]
    .filter((trade) => trade.pnl < 0)
    .sort((a, b) => a.pnl - b.pnl)
    .slice(0, limit);
}

export function getReviewBehaviorInsights(
  trades: Trade[],
  reviews: DailyReview[],
): ReviewBehaviorInsights {
  const dailyPnlEntries = getDailyPnlEntries(trades);
  const tradingDates = new Set(dailyPnlEntries.map(([date]) => date));
  const reviewByDate = new Map(reviews.map((review) => [review.date, review]));
  const reviewedEntries = dailyPnlEntries.filter(([date]) => reviewByDate.has(date));
  const unreviewedEntries = dailyPnlEntries.filter(
    ([date]) => !reviewByDate.has(date),
  );
  const reviewedTradingReviews = reviewedEntries
    .map(([date]) => reviewByDate.get(date))
    .filter((review): review is DailyReview => Boolean(review));
  const averageExecutionScore =
    reviewedTradingReviews.length > 0
      ? reviewedTradingReviews.reduce((total, review) => total + review.score, 0) /
        reviewedTradingReviews.length
      : 0;
  const emotionMap = new Map<
    ReviewEmotion,
    {
      reviewedDays: number;
      netPnl: number;
      scoreTotal: number;
    }
  >();

  for (const review of reviews) {
    if (!tradingDates.has(review.date)) {
      continue;
    }

    const current = emotionMap.get(review.emotion) ?? {
      reviewedDays: 0,
      netPnl: 0,
      scoreTotal: 0,
    };

    current.reviewedDays += 1;
    current.netPnl += dailyPnlEntries.find(([date]) => date === review.date)?.[1] ?? 0;
    current.scoreTotal += review.score;
    emotionMap.set(review.emotion, current);
  }

  return {
    reviewedTradingDays: reviewedEntries.length,
    unreviewedTradingDays: unreviewedEntries.length,
    reviewedDaysPnl: reviewedEntries.reduce((total, [, pnl]) => total + pnl, 0),
    unreviewedDaysPnl: unreviewedEntries.reduce((total, [, pnl]) => total + pnl, 0),
    averageExecutionScore,
    emotionStats: Array.from(emotionMap.entries())
      .map(([emotion, stats]) => ({
        emotion,
        reviewedDays: stats.reviewedDays,
        netPnl: stats.netPnl,
        avgDailyPnl:
          stats.reviewedDays > 0 ? stats.netPnl / stats.reviewedDays : 0,
        avgScore:
          stats.reviewedDays > 0 ? stats.scoreTotal / stats.reviewedDays : 0,
      }))
      .sort((a, b) => b.reviewedDays - a.reviewedDays),
  };
}
