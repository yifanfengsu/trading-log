export const sidebarMenuIds = [
  "dashboard",
  "trades",
  "calendar",
  "analytics",
  "reports",
  "playbook",
  "notes",
  "goals",
  "settings",
] as const;

export type SidebarMenuId = (typeof sidebarMenuIds)[number];

export const metricIds = [
  "netPnl",
  "winRate",
  "profitFactor",
  "maxDrawdown",
] as const;

export type MetricId = (typeof metricIds)[number];
export type MetricFormat = "currency" | "percent" | "number";
export type Tone = "positive" | "negative" | "neutral" | "accent";

export interface MetricData {
  id: MetricId;
  value: number;
  valueFormat: MetricFormat;
  valueDigits?: number;
  valueTone: Tone;
  change: number;
  changeFormat: MetricFormat;
  changeDigits?: number;
  changeTone: Tone;
}

export const dashboardMetrics: MetricData[] = [
  {
    id: "netPnl",
    value: 8642.15,
    valueFormat: "currency",
    valueDigits: 2,
    valueTone: "positive",
    change: 12.41,
    changeFormat: "percent",
    changeDigits: 2,
    changeTone: "positive",
  },
  {
    id: "winRate",
    value: 62.7,
    valueFormat: "percent",
    valueDigits: 1,
    valueTone: "accent",
    change: 6.3,
    changeFormat: "percent",
    changeDigits: 1,
    changeTone: "positive",
  },
  {
    id: "profitFactor",
    value: 1.86,
    valueFormat: "number",
    valueDigits: 2,
    valueTone: "accent",
    change: 0.28,
    changeFormat: "number",
    changeDigits: 2,
    changeTone: "positive",
  },
  {
    id: "maxDrawdown",
    value: -7.32,
    valueFormat: "percent",
    valueDigits: 2,
    valueTone: "negative",
    change: -1.12,
    changeFormat: "percent",
    changeDigits: 2,
    changeTone: "positive",
  },
];

export interface CalendarDayPnl {
  day: number;
  pnl: number;
}

export const monthlyPnlDays: CalendarDayPnl[] = [
  { day: 1, pnl: 420 },
  { day: 2, pnl: -180 },
  { day: 3, pnl: 210 },
  { day: 4, pnl: 95 },
  { day: 5, pnl: 310 },
  { day: 6, pnl: -240 },
  { day: 7, pnl: 520 },
  { day: 8, pnl: 145 },
  { day: 9, pnl: -120 },
  { day: 10, pnl: 330 },
  { day: 11, pnl: 75 },
  { day: 12, pnl: -60 },
  { day: 13, pnl: 215 },
  { day: 14, pnl: 410 },
  { day: 15, pnl: -95 },
  { day: 16, pnl: 680 },
  { day: 17, pnl: -210 },
  { day: 18, pnl: 160 },
  { day: 19, pnl: 305 },
  { day: 20, pnl: 120 },
  { day: 21, pnl: -110 },
  { day: 22, pnl: 245 },
  { day: 23, pnl: 310 },
  { day: 24, pnl: 85 },
  { day: 25, pnl: -130 },
  { day: 26, pnl: 590 },
  { day: 27, pnl: -70 },
  { day: 28, pnl: 230 },
  { day: 29, pnl: 115 },
  { day: 30, pnl: -40 },
  { day: 31, pnl: 275 },
];

export interface CalendarSummary {
  totalPnl: number;
  winningDays: number;
  winningRate: number;
  losingDays: number;
  losingRate: number;
  bestDay: number;
}

export const monthlyPnlSummary: CalendarSummary = {
  totalPnl: 8642.15,
  winningDays: 20,
  winningRate: 64.5,
  losingDays: 11,
  losingRate: 35.5,
  bestDay: 680,
};

export const reviewIds = [
  "rulesFollowed",
  "mainMistake",
  "marketCondition",
  "tomorrowFocus",
] as const;

export type ReviewId = (typeof reviewIds)[number];
export type ReviewTone = "positive" | "negative" | "neutral" | "accent";

export interface ReviewItemData {
  id: ReviewId;
  tone: ReviewTone;
}

export const todayReviewItems: ReviewItemData[] = [
  { id: "rulesFollowed", tone: "positive" },
  { id: "mainMistake", tone: "negative" },
  { id: "marketCondition", tone: "neutral" },
  { id: "tomorrowFocus", tone: "accent" },
];

export interface EquityPoint {
  date: string;
  equity: number;
}

export const equityCurveData: EquityPoint[] = [
  { date: "2025-05-01", equity: -820 },
  { date: "2025-05-02", equity: -460 },
  { date: "2025-05-03", equity: -120 },
  { date: "2025-05-04", equity: 240 },
  { date: "2025-05-05", equity: 790 },
  { date: "2025-05-06", equity: 380 },
  { date: "2025-05-07", equity: 1420 },
  { date: "2025-05-08", equity: 1765 },
  { date: "2025-05-09", equity: 1600 },
  { date: "2025-05-10", equity: 2140 },
  { date: "2025-05-11", equity: 2360 },
  { date: "2025-05-12", equity: 2250 },
  { date: "2025-05-13", equity: 2695 },
  { date: "2025-05-14", equity: 3240 },
  { date: "2025-05-15", equity: 3010 },
  { date: "2025-05-16", equity: 3980 },
  { date: "2025-05-17", equity: 3620 },
  { date: "2025-05-18", equity: 4095 },
  { date: "2025-05-19", equity: 4550 },
  { date: "2025-05-20", equity: 4780 },
  { date: "2025-05-21", equity: 4510 },
  { date: "2025-05-22", equity: 5090 },
  { date: "2025-05-23", equity: 5565 },
  { date: "2025-05-24", equity: 5700 },
  { date: "2025-05-25", equity: 5420 },
  { date: "2025-05-26", equity: 6510 },
  { date: "2025-05-27", equity: 6350 },
  { date: "2025-05-28", equity: 7025 },
  { date: "2025-05-29", equity: 7540 },
  { date: "2025-05-30", equity: 7420 },
  { date: "2025-05-31", equity: 8642 },
];

export const strategyIds = [
  "trendFollowing",
  "breakout",
  "scalping",
  "meanReversion",
] as const;

export type StrategyId = (typeof strategyIds)[number];

export interface StrategyPerformanceRow {
  id: StrategyId;
  netPnl: number;
  winRate: number;
  profitFactor: number;
}

export const strategyPerformanceRows: StrategyPerformanceRow[] = [
  {
    id: "trendFollowing",
    netPnl: 4125.3,
    winRate: 64.8,
    profitFactor: 2.18,
  },
  {
    id: "breakout",
    netPnl: 2310.75,
    winRate: 61.5,
    profitFactor: 1.74,
  },
  {
    id: "scalping",
    netPnl: 1436.1,
    winRate: 58.1,
    profitFactor: 1.52,
  },
  {
    id: "meanReversion",
    netPnl: 770,
    winRate: 53.2,
    profitFactor: 1.21,
  },
];

export const tradeSideIds = ["long", "short"] as const;
export type TradeSide = (typeof tradeSideIds)[number];

export const tradeStatusIds = ["closed"] as const;
export type TradeStatus = (typeof tradeStatusIds)[number];

export interface RecentTrade {
  time: string;
  symbol: string;
  side: TradeSide;
  setup: StrategyId;
  entry: number;
  exit: number;
  risk: number;
  pnl: number;
  rMultiple: number;
  status: TradeStatus;
}

export const recentTrades: RecentTrade[] = [
  {
    time: "2025-05-31 10:24",
    symbol: "BTCUSDT",
    side: "long",
    setup: "breakout",
    entry: 104250,
    exit: 105420,
    risk: 1,
    pnl: 1170,
    rMultiple: 2.34,
    status: "closed",
  },
  {
    time: "2025-05-31 09:15",
    symbol: "ETHUSDT",
    side: "short",
    setup: "trendFollowing",
    entry: 2612.5,
    exit: 2574.8,
    risk: 1,
    pnl: 377,
    rMultiple: 0.75,
    status: "closed",
  },
  {
    time: "2025-05-30 16:42",
    symbol: "SOLUSDT",
    side: "long",
    setup: "scalping",
    entry: 163.3,
    exit: 163.7,
    risk: 0.75,
    pnl: -240,
    rMultiple: -0.8,
    status: "closed",
  },
  {
    time: "2025-05-30 11:08",
    symbol: "BTCUSDT",
    side: "long",
    setup: "trendFollowing",
    entry: 103150,
    exit: 103980,
    risk: 1,
    pnl: 830,
    rMultiple: 1.66,
    status: "closed",
  },
];
