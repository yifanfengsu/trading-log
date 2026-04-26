import type { Locale } from "@/lib/i18n";
import type { DailyReview } from "@/lib/review-types";
import type {
  DailyReportBreakdownRow,
  ReportPeriodType,
  ReportStats,
  ReportTopTrades,
  SetupReportBreakdownRow,
  SuggestedReportText,
  TagReportBreakdownRow,
} from "@/lib/report-types";
import {
  getMaxDrawdown,
  STARTING_BALANCE,
  getPeriodStats,
} from "@/lib/trade-calculations";
import type { CurrencyCode } from "@/lib/settings-types";
import type { Trade, TradeSetup } from "@/lib/trade-types";
import {
  formatCurrency,
  formatPercent,
  getDateKey,
} from "@/lib/utils";

const millisecondsPerDay = 24 * 60 * 60 * 1000;
const tradeSetupOrder: TradeSetup[] = [
  "trendFollowing",
  "breakout",
  "scalping",
  "meanReversion",
  "other",
];
const setupLabels: Record<Locale, Record<TradeSetup, string>> = {
  zh: {
    trendFollowing: "趋势跟随",
    breakout: "突破策略",
    scalping: "剥头皮",
    meanReversion: "均值回归",
    other: "其他",
  },
  en: {
    trendFollowing: "Trend Following",
    breakout: "Breakout",
    scalping: "Scalping",
    meanReversion: "Mean Reversion",
    other: "Other",
  },
};

export interface ReportSelection {
  periodType: ReportPeriodType;
  periodKey: string;
}

export interface ReportDateRange {
  startDate: string;
  endDate: string;
}

export interface ReportSuggestionBreakdowns {
  setupBreakdown: SetupReportBreakdownRow[];
  tagBreakdown: TagReportBreakdownRow[];
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function dateToDateKey(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate(),
  )}`;
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getMonthKeyFromDate(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}

function getCurrentMonthKey() {
  return getMonthKeyFromDate(new Date());
}

function getWeekOneMonday(weekYear: number) {
  const januaryFourth = new Date(weekYear, 0, 4);
  const dayIndex = (januaryFourth.getDay() + 6) % 7;

  return new Date(weekYear, 0, 4 - dayIndex);
}

function getAvgR(trades: Trade[]) {
  if (trades.length === 0) {
    return 0;
  }

  return trades.reduce((total, trade) => total + trade.rMultiple, 0) / trades.length;
}

function getNormalizedTags(trade: Trade) {
  const normalizedTags = new Set<string>();

  for (const tagValue of trade.tags ?? []) {
    for (const tag of tagValue.split(/[,，]/)) {
      const normalizedTag = tag.trim();

      if (normalizedTag) {
        normalizedTags.add(normalizedTag);
      }
    }
  }

  return normalizedTags;
}

function buildGroupStats(trades: Trade[]) {
  const stats = getPeriodStats(trades);

  return {
    netPnl: stats.netPnl,
    trades: stats.totalTrades,
    winRate: stats.winRate,
    avgR: getAvgR(trades),
  };
}

export function getDefaultReportSelection(trades: Trade[]): ReportSelection {
  const latestTrade = [...trades].sort((a, b) =>
    b.closedAt.localeCompare(a.closedAt),
  )[0];

  return {
    periodType: "monthly",
    periodKey: latestTrade ? getDateKey(latestTrade.closedAt).slice(0, 7) : getCurrentMonthKey(),
  };
}

export function getWeekKeyFromDateKey(dateKey: string): string {
  const date = parseDateKey(dateKey);
  const dayIndex = (date.getDay() + 6) % 7;
  const thursday = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + 3 - dayIndex,
  );
  const weekYear = thursday.getFullYear();
  const weekOneMonday = getWeekOneMonday(weekYear);
  const currentWeekMonday = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - dayIndex,
  );
  const weekNumber =
    Math.floor((currentWeekMonday.getTime() - weekOneMonday.getTime()) / millisecondsPerDay / 7) +
    1;

  return `${weekYear}-W${pad2(weekNumber)}`;
}

export function getWeekRangeFromWeekKey(weekKey: string): ReportDateRange {
  const match = /^(\d{4})-W(\d{2})$/.exec(weekKey);

  if (!match) {
    return getWeekRangeFromWeekKey(getWeekKeyFromDateKey(dateToDateKey(new Date())));
  }

  const weekYear = Number(match[1]);
  const weekNumber = Number(match[2]);
  const weekOneMonday = getWeekOneMonday(weekYear);
  const startDate = new Date(
    weekOneMonday.getFullYear(),
    weekOneMonday.getMonth(),
    weekOneMonday.getDate() + (weekNumber - 1) * 7,
  );
  const endDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate() + 6,
  );

  return {
    startDate: dateToDateKey(startDate),
    endDate: dateToDateKey(endDate),
  };
}

export function getMonthRangeFromMonthKey(monthKey: string): ReportDateRange {
  const match = /^(\d{4})-(\d{2})$/.exec(monthKey);

  if (!match) {
    return getMonthRangeFromMonthKey(getCurrentMonthKey());
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const endDay = new Date(year, month, 0).getDate();

  return {
    startDate: `${monthKey}-01`,
    endDate: `${monthKey}-${pad2(endDay)}`,
  };
}

export function getReportRange(
  periodType: ReportPeriodType,
  periodKey: string,
): ReportDateRange {
  return periodType === "weekly"
    ? getWeekRangeFromWeekKey(periodKey)
    : getMonthRangeFromMonthKey(periodKey);
}

export function filterTradesByDateRange(
  trades: Trade[],
  startDate: string,
  endDate: string,
) {
  return trades.filter((trade) => {
    const dateKey = getDateKey(trade.closedAt);

    return dateKey >= startDate && dateKey <= endDate;
  });
}

export function filterReviewsByDateRange(
  reviews: DailyReview[],
  startDate: string,
  endDate: string,
) {
  return reviews.filter(
    (review) => review.date >= startDate && review.date <= endDate,
  );
}

export function getReportStats(
  trades: Trade[],
  reviews: DailyReview[],
  startingBalance = STARTING_BALANCE,
): ReportStats {
  const stats = getPeriodStats(trades);
  const maxDrawdown = getMaxDrawdown(trades, startingBalance);
  const tradingDateSet = new Set(
    trades.map((trade) => getDateKey(trade.closedAt)),
  );
  const reviewedDays = reviews.filter((review) =>
    tradingDateSet.has(review.date),
  ).length;
  const tradingDays = tradingDateSet.size;

  return {
    netPnl: stats.netPnl,
    totalTrades: stats.totalTrades,
    winningTrades: stats.winningTrades,
    losingTrades: stats.losingTrades,
    winRate: stats.winRate,
    profitFactor: stats.profitFactor,
    avgR: getAvgR(trades),
    maxDrawdownPercent: maxDrawdown.percent,
    bestTradePnl: stats.bestTrade?.pnl ?? 0,
    worstTradePnl: stats.worstTrade?.pnl ?? 0,
    reviewedDays,
    tradingDays,
    reviewCompletionRate:
      tradingDays > 0 ? (reviewedDays / tradingDays) * 100 : 0,
  };
}

export function getDailyReportBreakdown(
  trades: Trade[],
  reviews: DailyReview[],
): DailyReportBreakdownRow[] {
  const grouped = new Map<string, { pnl: number; trades: number }>();
  const reviewedDates = new Set(reviews.map((review) => review.date));

  for (const trade of trades) {
    const date = getDateKey(trade.closedAt);
    const current = grouped.get(date) ?? { pnl: 0, trades: 0 };

    current.pnl += trade.pnl;
    current.trades += 1;
    grouped.set(date, current);
  }

  return Array.from(grouped.entries())
    .map(([date, row]) => ({
      date,
      pnl: row.pnl,
      trades: row.trades,
      reviewed: reviewedDates.has(date),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getSetupReportBreakdown(
  trades: Trade[],
): SetupReportBreakdownRow[] {
  const grouped = new Map<TradeSetup, Trade[]>();

  for (const trade of trades) {
    grouped.set(trade.setup, [...(grouped.get(trade.setup) ?? []), trade]);
  }

  return Array.from(grouped.entries())
    .map(([setup, setupTrades]) => ({
      setup,
      ...buildGroupStats(setupTrades),
    }))
    .sort((a, b) => {
      if (b.netPnl !== a.netPnl) {
        return b.netPnl - a.netPnl;
      }

      return tradeSetupOrder.indexOf(a.setup) - tradeSetupOrder.indexOf(b.setup);
    });
}

export function getTagReportBreakdown(trades: Trade[]): TagReportBreakdownRow[] {
  const grouped = new Map<string, Trade[]>();

  for (const trade of trades) {
    for (const tag of getNormalizedTags(trade)) {
      grouped.set(tag, [...(grouped.get(tag) ?? []), trade]);
    }
  }

  return Array.from(grouped.entries())
    .map(([tag, tagTrades]) => ({
      tag,
      ...buildGroupStats(tagTrades),
    }))
    .sort((a, b) => b.netPnl - a.netPnl);
}

export function getReportTopTrades(trades: Trade[]): ReportTopTrades {
  return {
    topWinners: [...trades]
      .filter((trade) => trade.pnl > 0)
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 5),
    topLosers: [...trades]
      .filter((trade) => trade.pnl < 0)
      .sort((a, b) => a.pnl - b.pnl)
      .slice(0, 5),
  };
}

export function buildSuggestedReportText(
  stats: ReportStats,
  breakdowns: ReportSuggestionBreakdowns,
  locale: Locale,
  currency: CurrencyCode = "USD",
): SuggestedReportText {
  if (stats.totalTrades === 0) {
    return locale === "zh"
      ? {
          summary: "本周期暂无交易数据，可以重点回顾市场环境、等待机会的纪律和下周期计划。",
          keyWins: "没有强行交易本身也是一种执行力。继续保持对低质量机会的克制。",
          keyMistakes: "暂无交易结果可归因，但仍需要检查是否存在错过计划内机会或准备不足的问题。",
          lessons: "空仓周期适合完善交易计划、复盘观察列表，并明确下一次入场条件。",
          nextActions: "下周期继续等待计划内机会，提前写好交易条件，并在交易日结束后完成复盘。",
        }
      : {
          summary:
            "There is no trade data for this period. Use the report to review market context, discipline, and next-period preparation.",
          keyWins:
            "Avoiding low-quality trades is still good execution. Keep protecting capital when conditions are not clear.",
          keyMistakes:
            "No trade outcomes can be attributed yet. Check whether any planned opportunities were missed or underprepared.",
          lessons:
            "A flat period is useful for refining the plan, watchlist, and entry criteria.",
          nextActions:
            "Next period, wait for planned setups, define entry conditions in advance, and complete daily reviews after each trading day.",
        };
  }

  const bestSetup = breakdowns.setupBreakdown[0];
  const worstTag = [...breakdowns.tagBreakdown].sort(
    (a, b) => a.netPnl - b.netPnl,
  )[0];
  const isProfitable = stats.netPnl > 0;
  const pnlText = formatCurrency(stats.netPnl, currency);
  const winRateText = formatPercent(stats.winRate);

  if (locale === "zh") {
    const setupText = bestSetup
      ? `表现较好的部分来自 ${setupLabels.zh[bestSetup.setup]}。`
      : "";
    const tagText = worstTag
      ? `亏损或低质量机会需要重点检查标签为 ${worstTag.tag} 的交易。`
      : "亏损交易需要从入场质量、持仓管理和情绪执行三个维度继续归因。";

    return {
      summary: `本周期净盈亏为 ${pnlText}，共完成 ${stats.totalTrades} 笔交易，胜率为 ${winRateText}。整体表现${
        isProfitable ? "为盈利" : "仍需修复"
      }，需要持续关注亏损来源和执行一致性。`,
      keyWins: `${setupText}盈利交易能够${
        isProfitable ? "覆盖亏损" : "提供部分缓冲"
      }，说明部分策略仍具备可复用的执行价值。`,
      keyMistakes: `${tagText}需要减少非计划内入场，并避免在低质量信号上放大风险。`,
      lessons:
        "本周期的重点经验是保持耐心、控制风险，并优先执行 A+ 级别机会。",
      nextActions:
        "下周期继续控制单笔风险，只交易计划内机会，并在每个交易日结束后完成复盘。",
    };
  }

  const setupText = bestSetup
    ? `The strongest contribution came from ${setupLabels.en[bestSetup.setup]}.`
    : "";
  const tagText = worstTag
    ? `Pay close attention to trades tagged ${worstTag.tag}.`
    : "Review losing trades by entry quality, trade management, and emotional execution.";

  return {
    summary: `This period closed at ${pnlText} across ${stats.totalTrades} trades with a ${winRateText} win rate. Overall performance was ${
      isProfitable ? "profitable" : "below target"
    }, so the main focus is keeping execution consistent and reducing loss concentration.`,
    keyWins: `${setupText} Winning trades ${
      isProfitable ? "covered losses" : "still provided some offset"
    }, which shows there are repeatable parts of the current process.`,
    keyMistakes: `${tagText} Reduce unplanned entries and avoid increasing risk on low-quality signals.`,
    lessons:
      "The main lesson is to stay patient, control risk, and prioritize A+ opportunities.",
    nextActions:
      "Next period, keep single-trade risk controlled, trade only planned setups, and complete a review after every trading day.",
  };
}
