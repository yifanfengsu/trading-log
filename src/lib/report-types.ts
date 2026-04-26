import type { Trade, TradeSetup } from "@/lib/trade-types";

export type ReportPeriodType = "weekly" | "monthly";

export type PeriodReport = {
  id: string;
  periodType: ReportPeriodType;
  periodKey: string;
  startDate: string;
  endDate: string;
  title: string;
  summary: string;
  keyWins: string;
  keyMistakes: string;
  lessons: string;
  nextActions: string;
  createdAt: string;
  updatedAt: string;
};

export type ReportStats = {
  netPnl: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  avgR: number;
  maxDrawdownPercent: number;
  bestTradePnl: number;
  worstTradePnl: number;
  reviewedDays: number;
  tradingDays: number;
  reviewCompletionRate: number;
};

export type DailyReportBreakdownRow = {
  date: string;
  pnl: number;
  trades: number;
  reviewed: boolean;
};

export type SetupReportBreakdownRow = {
  setup: TradeSetup;
  netPnl: number;
  trades: number;
  winRate: number;
  avgR: number;
};

export type TagReportBreakdownRow = {
  tag: string;
  netPnl: number;
  trades: number;
  winRate: number;
  avgR: number;
};

export type ReportTopTrades = {
  topWinners: Trade[];
  topLosers: Trade[];
};

export type SuggestedReportText = Pick<
  PeriodReport,
  "summary" | "keyWins" | "keyMistakes" | "lessons" | "nextActions"
>;
