import type { Locale } from "@/lib/i18n";
import type {
  DailyReportBreakdownRow,
  PeriodReport,
  ReportPeriodType,
  ReportStats,
  SetupReportBreakdownRow,
  TagReportBreakdownRow,
} from "@/lib/report-types";
import type { CurrencyCode } from "@/lib/settings-types";
import type { Trade } from "@/lib/trade-types";
import {
  formatCurrency,
  formatDateRange,
  formatDateTime,
  formatPercent,
  formatProfitFactor,
  formatRMultiple,
} from "@/lib/utils";

type ManualReportMarkdownFields = Pick<
  PeriodReport,
  "summary" | "keyWins" | "keyMistakes" | "lessons" | "nextActions"
>;

export interface GenerateReportMarkdownParams {
  locale: Locale;
  periodType: ReportPeriodType;
  periodKey: string;
  startDate: string;
  endDate: string;
  stats: ReportStats;
  setupBreakdown: SetupReportBreakdownRow[];
  tagBreakdown: TagReportBreakdownRow[];
  dailyBreakdown: DailyReportBreakdownRow[];
  topWinners: Trade[];
  topLosers: Trade[];
  manualReport: ManualReportMarkdownFields;
  currency?: CurrencyCode;
}

const setupLabels = {
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
} as const;

const sideLabels = {
  zh: {
    long: "做多",
    short: "做空",
  },
  en: {
    long: "Long",
    short: "Short",
  },
} as const;

function textOrNoData(value: string, noData: string) {
  const trimmed = value.trim();

  return trimmed || noData;
}

function escapeTableCell(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function buildSetupRows(
  rows: SetupReportBreakdownRow[],
  locale: Locale,
  noData: string,
  currency: CurrencyCode,
) {
  if (rows.length === 0) {
    return `| ${noData} | - | - | - | - |`;
  }

  return rows
    .map(
      (row) =>
        `| ${setupLabels[locale][row.setup]} | ${row.trades} | ${formatCurrency(
          row.netPnl,
          currency,
        )} | ${formatPercent(row.winRate)} | ${formatRMultiple(row.avgR)} |`,
    )
    .join("\n");
}

function buildTagRows(
  rows: TagReportBreakdownRow[],
  noData: string,
  currency: CurrencyCode,
) {
  if (rows.length === 0) {
    return `| ${noData} | - | - | - | - |`;
  }

  return rows
    .map(
      (row) =>
        `| ${escapeTableCell(row.tag)} | ${row.trades} | ${formatCurrency(
          row.netPnl,
          currency,
        )} | ${formatPercent(row.winRate)} | ${formatRMultiple(row.avgR)} |`,
    )
    .join("\n");
}

function buildDailyRows(
  rows: DailyReportBreakdownRow[],
  locale: Locale,
  noData: string,
  currency: CurrencyCode,
) {
  if (rows.length === 0) {
    return `| ${noData} | - | - | - |`;
  }

  return rows
    .map(
      (row) =>
        `| ${formatDateTime(row.date, locale)} | ${formatCurrency(row.pnl, currency)} | ${
          row.trades
        } | ${row.reviewed ? copyReviewed(locale) : copyNotReviewed(locale)} |`,
    )
    .join("\n");
}

function buildTradeRows(
  trades: Trade[],
  locale: Locale,
  noData: string,
  currency: CurrencyCode,
) {
  if (trades.length === 0) {
    return `| ${noData} | - | - | - | - | - |`;
  }

  return trades
    .map(
      (trade) =>
        `| ${formatDateTime(trade.closedAt, locale)} | ${escapeTableCell(
          trade.symbol,
        )} | ${sideLabels[locale][trade.side]} | ${
          setupLabels[locale][trade.setup]
        } | ${formatCurrency(trade.pnl, currency)} | ${formatRMultiple(trade.rMultiple)} |`,
    )
    .join("\n");
}

function copyReviewed(locale: Locale) {
  return locale === "zh" ? "已复盘" : "Reviewed";
}

function copyNotReviewed(locale: Locale) {
  return locale === "zh" ? "未复盘" : "Not reviewed";
}

export function generateReportMarkdown({
  locale,
  periodType,
  periodKey,
  startDate,
  endDate,
  stats,
  setupBreakdown,
  tagBreakdown,
  dailyBreakdown,
  topWinners,
  topLosers,
  manualReport,
  currency = "USD",
}: GenerateReportMarkdownParams) {
  const noData = locale === "zh" ? "暂无数据" : "No data";
  const title =
    locale === "zh"
      ? periodType === "weekly"
        ? "交易周报"
        : "交易月报"
      : periodType === "weekly"
        ? "Trading Weekly Report"
        : "Trading Monthly Report";

  if (locale === "zh") {
    return `# ${title}

## 周期
${formatDateRange(startDate, endDate, locale)}

## 核心表现
- 净盈亏：${formatCurrency(stats.netPnl, currency)}
- 总交易数：${stats.totalTrades}
- 胜率：${formatPercent(stats.winRate)}
- 盈利因子：${formatProfitFactor(stats.profitFactor)}
- 平均 R：${formatRMultiple(stats.avgR)}
- 复盘完成率：${formatPercent(stats.reviewCompletionRate)}

## 每日表现
| 日期 | 盈亏 | 交易数 | 复盘 |
| --- | ---: | ---: | --- |
${buildDailyRows(dailyBreakdown, locale, noData, currency)}

## 策略表现
| 策略 | 交易数 | 净盈亏 | 胜率 | 平均 R |
| --- | ---: | ---: | ---: | ---: |
${buildSetupRows(setupBreakdown, locale, noData, currency)}

## 标签影响
| 标签 | 交易数 | 净盈亏 | 胜率 | 平均 R |
| --- | ---: | ---: | ---: | ---: |
${buildTagRows(tagBreakdown, noData, currency)}

## 最大盈利交易
| 时间 | 交易对 | 方向 | 策略 | 盈亏 | R |
| --- | --- | --- | --- | ---: | ---: |
${buildTradeRows(topWinners, locale, noData, currency)}

## 最大亏损交易
| 时间 | 交易对 | 方向 | 策略 | 盈亏 | R |
| --- | --- | --- | --- | ---: | ---: |
${buildTradeRows(topLosers, locale, noData, currency)}

## 周期复盘
### 总结
${textOrNoData(manualReport.summary, noData)}

### 做得好的地方
${textOrNoData(manualReport.keyWins, noData)}

### 主要问题
${textOrNoData(manualReport.keyMistakes, noData)}

### 经验教训
${textOrNoData(manualReport.lessons, noData)}

### 下周期行动计划
${textOrNoData(manualReport.nextActions, noData)}

<!-- ${periodKey} -->
`;
  }

  return `# ${title}

## Period
${formatDateRange(startDate, endDate, locale)}

## Core Performance
- Net P&L: ${formatCurrency(stats.netPnl, currency)}
- Total Trades: ${stats.totalTrades}
- Win Rate: ${formatPercent(stats.winRate)}
- Profit Factor: ${formatProfitFactor(stats.profitFactor)}
- Avg R: ${formatRMultiple(stats.avgR)}
- Review Completion: ${formatPercent(stats.reviewCompletionRate)}

## Daily Breakdown
| Date | P&L | Trades | Review |
| --- | ---: | ---: | --- |
${buildDailyRows(dailyBreakdown, locale, noData, currency)}

## Setup Performance
| Setup | Trades | Net P&L | Win Rate | Avg R |
| --- | ---: | ---: | ---: | ---: |
${buildSetupRows(setupBreakdown, locale, noData, currency)}

## Tag Impact
| Tag | Trades | Net P&L | Win Rate | Avg R |
| --- | ---: | ---: | ---: | ---: |
${buildTagRows(tagBreakdown, noData, currency)}

## Top Winning Trades
| Time | Symbol | Side | Setup | P&L | R |
| --- | --- | --- | --- | ---: | ---: |
${buildTradeRows(topWinners, locale, noData, currency)}

## Top Losing Trades
| Time | Symbol | Side | Setup | P&L | R |
| --- | --- | --- | --- | ---: | ---: |
${buildTradeRows(topLosers, locale, noData, currency)}

## Period Review
### Summary
${textOrNoData(manualReport.summary, noData)}

### What Went Well
${textOrNoData(manualReport.keyWins, noData)}

### Main Issues
${textOrNoData(manualReport.keyMistakes, noData)}

### Lessons
${textOrNoData(manualReport.lessons, noData)}

### Next Actions
${textOrNoData(manualReport.nextActions, noData)}

<!-- ${periodKey} -->
`;
}
