import type { Trade, TradeSetup, TradeSide } from "@/lib/trade-types";

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
}

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

interface SeedTradeRow {
  id: string;
  closedAt: string;
  symbol: string;
  side: TradeSide;
  setup: TradeSetup;
  entryPrice: number;
  exitPrice?: number;
  riskPercent: number;
  pnl: number;
  rMultiple?: number;
  notes?: string;
  tags?: string[];
}

const seedTradeRows: SeedTradeRow[] = [
  {
    id: "seed-2025-05-01",
    closedAt: "2025-05-01T10:12:00",
    symbol: "BTCUSDT",
    side: "long",
    setup: "trendFollowing",
    entryPrice: 95420,
    riskPercent: 1,
    pnl: 620,
  },
  {
    id: "seed-2025-05-02",
    closedAt: "2025-05-02T14:08:00",
    symbol: "ETHUSDT",
    side: "long",
    setup: "breakout",
    entryPrice: 1835.6,
    riskPercent: 1,
    pnl: -180,
  },
  {
    id: "seed-2025-05-03",
    closedAt: "2025-05-03T11:20:00",
    symbol: "SOLUSDT",
    side: "short",
    setup: "meanReversion",
    entryPrice: 147.3,
    riskPercent: 0.8,
    pnl: 510,
  },
  {
    id: "seed-2025-05-04",
    closedAt: "2025-05-04T15:35:00",
    symbol: "BTCUSDT",
    side: "short",
    setup: "scalping",
    entryPrice: 96180,
    riskPercent: 0.75,
    pnl: -240,
  },
  {
    id: "seed-2025-05-05",
    closedAt: "2025-05-05T09:48:00",
    symbol: "ETHUSDT",
    side: "long",
    setup: "trendFollowing",
    entryPrice: 1882.4,
    riskPercent: 1,
    pnl: 530,
  },
  {
    id: "seed-2025-05-06",
    closedAt: "2025-05-06T13:16:00",
    symbol: "LINKUSDT",
    side: "long",
    setup: "breakout",
    entryPrice: 13.72,
    riskPercent: 1,
    pnl: 345,
  },
  {
    id: "seed-2025-05-07",
    closedAt: "2025-05-07T11:06:00",
    symbol: "SOLUSDT",
    side: "short",
    setup: "scalping",
    entryPrice: 151.15,
    riskPercent: 0.75,
    pnl: -120,
  },
  {
    id: "seed-2025-05-08",
    closedAt: "2025-05-08T16:44:00",
    symbol: "BTCUSDT",
    side: "long",
    setup: "trendFollowing",
    entryPrice: 97420,
    riskPercent: 1,
    pnl: 530,
  },
  {
    id: "seed-2025-05-09",
    closedAt: "2025-05-09T10:18:00",
    symbol: "ETHUSDT",
    side: "short",
    setup: "meanReversion",
    entryPrice: 1921.7,
    riskPercent: 0.9,
    pnl: -60,
  },
  {
    id: "seed-2025-05-10",
    closedAt: "2025-05-10T12:04:00",
    symbol: "DOGEUSDT",
    side: "long",
    setup: "scalping",
    entryPrice: 0.174,
    riskPercent: 0.6,
    pnl: 275,
  },
  {
    id: "seed-2025-05-11",
    closedAt: "2025-05-11T09:34:00",
    symbol: "SOLUSDT",
    side: "long",
    setup: "breakout",
    entryPrice: 154.85,
    riskPercent: 1,
    pnl: 315,
  },
  {
    id: "seed-2025-05-12",
    closedAt: "2025-05-12T14:28:00",
    symbol: "ETHUSDT",
    side: "long",
    setup: "scalping",
    entryPrice: 1998.1,
    riskPercent: 0.75,
    pnl: -95,
  },
  {
    id: "seed-2025-05-13",
    closedAt: "2025-05-13T10:42:00",
    symbol: "BTCUSDT",
    side: "short",
    setup: "meanReversion",
    entryPrice: 98640,
    riskPercent: 1,
    pnl: 510,
  },
  {
    id: "seed-2025-05-14",
    closedAt: "2025-05-14T15:10:00",
    symbol: "ETHUSDT",
    side: "long",
    setup: "trendFollowing",
    entryPrice: 2050.4,
    riskPercent: 1,
    pnl: 680,
  },
  {
    id: "seed-2025-05-15",
    closedAt: "2025-05-15T11:58:00",
    symbol: "SOLUSDT",
    side: "long",
    setup: "breakout",
    entryPrice: 161.45,
    riskPercent: 1,
    pnl: -210,
  },
  {
    id: "seed-2025-05-16",
    closedAt: "2025-05-16T13:22:00",
    symbol: "LINKUSDT",
    side: "short",
    setup: "meanReversion",
    entryPrice: 14.35,
    riskPercent: 0.8,
    pnl: 360,
  },
  {
    id: "seed-2025-05-17",
    closedAt: "2025-05-17T10:16:00",
    symbol: "BTCUSDT",
    side: "long",
    setup: "trendFollowing",
    entryPrice: 100420,
    riskPercent: 1,
    pnl: 405,
  },
  {
    id: "seed-2025-05-18",
    closedAt: "2025-05-18T12:40:00",
    symbol: "ETHUSDT",
    side: "short",
    setup: "scalping",
    entryPrice: 2142.7,
    riskPercent: 0.75,
    pnl: -110,
  },
  {
    id: "seed-2025-05-19",
    closedAt: "2025-05-19T09:55:00",
    symbol: "SOLUSDT",
    side: "long",
    setup: "breakout",
    entryPrice: 165.3,
    riskPercent: 1,
    pnl: 320,
  },
  {
    id: "seed-2025-05-20",
    closedAt: "2025-05-20T15:02:00",
    symbol: "BTCUSDT",
    side: "short",
    setup: "meanReversion",
    entryPrice: 102080,
    riskPercent: 1,
    pnl: 445,
  },
  {
    id: "seed-2025-05-21",
    closedAt: "2025-05-21T13:32:00",
    symbol: "ETHUSDT",
    side: "long",
    setup: "scalping",
    entryPrice: 2360.2,
    riskPercent: 0.75,
    pnl: -130,
  },
  {
    id: "seed-2025-05-22",
    closedAt: "2025-05-22T10:26:00",
    symbol: "SOLUSDT",
    side: "long",
    setup: "trendFollowing",
    entryPrice: 169.4,
    riskPercent: 1,
    pnl: 410,
  },
  {
    id: "seed-2025-05-23",
    closedAt: "2025-05-23T14:46:00",
    symbol: "LINKUSDT",
    side: "short",
    setup: "breakout",
    entryPrice: 15.18,
    riskPercent: 0.8,
    pnl: 285,
  },
  {
    id: "seed-2025-05-24",
    closedAt: "2025-05-24T11:18:00",
    symbol: "DOGEUSDT",
    side: "long",
    setup: "scalping",
    entryPrice: 0.186,
    riskPercent: 0.6,
    pnl: -70,
  },
  {
    id: "seed-2025-05-25",
    closedAt: "2025-05-25T16:12:00",
    symbol: "BTCUSDT",
    side: "long",
    setup: "trendFollowing",
    entryPrice: 102740,
    riskPercent: 1,
    pnl: 590,
  },
  {
    id: "seed-2025-05-26",
    closedAt: "2025-05-26T09:40:00",
    symbol: "ETHUSDT",
    side: "short",
    setup: "meanReversion",
    entryPrice: 2498.8,
    riskPercent: 0.9,
    pnl: -40,
  },
  {
    id: "seed-2025-05-27",
    closedAt: "2025-05-27T13:08:00",
    symbol: "SOLUSDT",
    side: "long",
    setup: "breakout",
    entryPrice: 171.8,
    riskPercent: 1,
    pnl: 430,
  },
  {
    id: "seed-2025-05-28",
    closedAt: "2025-05-28T15:24:00",
    symbol: "BTCUSDT",
    side: "long",
    setup: "other",
    entryPrice: 103380,
    riskPercent: 0.8,
    pnl: -125,
  },
  {
    id: "seed-2025-05-29",
    closedAt: "2025-05-29T10:52:00",
    symbol: "ETHUSDT",
    side: "long",
    setup: "trendFollowing",
    entryPrice: 2558.2,
    riskPercent: 1,
    pnl: 325.15,
  },
  {
    id: "seed-2025-05-30-btc",
    closedAt: "2025-05-30T11:08:00",
    symbol: "BTCUSDT",
    side: "long",
    setup: "trendFollowing",
    entryPrice: 103150,
    exitPrice: 103980,
    riskPercent: 1,
    pnl: 830,
    rMultiple: 1.66,
  },
  {
    id: "seed-2025-05-30-sol",
    closedAt: "2025-05-30T16:42:00",
    symbol: "SOLUSDT",
    side: "long",
    setup: "scalping",
    entryPrice: 163.3,
    exitPrice: 163.7,
    riskPercent: 0.75,
    pnl: -240,
    rMultiple: -0.8,
  },
  {
    id: "seed-2025-05-31-eth",
    closedAt: "2025-05-31T09:15:00",
    symbol: "ETHUSDT",
    side: "short",
    setup: "trendFollowing",
    entryPrice: 2612.5,
    exitPrice: 2574.8,
    riskPercent: 1,
    pnl: 377,
    rMultiple: 0.75,
  },
  {
    id: "seed-2025-05-31-btc",
    closedAt: "2025-05-31T10:24:00",
    symbol: "BTCUSDT",
    side: "long",
    setup: "breakout",
    entryPrice: 104250,
    exitPrice: 105420,
    riskPercent: 1,
    pnl: 1170,
    rMultiple: 2.34,
  },
];

function getDerivedExitPrice(row: SeedTradeRow) {
  if (row.exitPrice !== undefined) {
    return row.exitPrice;
  }

  const move = Math.max(0.01, Math.abs(row.pnl) / 100);
  const direction = row.pnl >= 0 ? 1 : -1;
  const sideMultiplier = row.side === "long" ? 1 : -1;

  return Number((row.entryPrice + move * direction * sideMultiplier).toFixed(4));
}

function getDerivedRMultiple(row: SeedTradeRow) {
  return row.rMultiple ?? Number((row.pnl / 300).toFixed(2));
}

export const seedTrades: Trade[] = seedTradeRows.map((row) => ({
  id: row.id,
  closedAt: row.closedAt,
  symbol: row.symbol.toUpperCase(),
  side: row.side,
  setup: row.setup,
  entryPrice: row.entryPrice,
  exitPrice: getDerivedExitPrice(row),
  riskPercent: row.riskPercent,
  pnl: row.pnl,
  rMultiple: getDerivedRMultiple(row),
  status: "closed",
  notes: row.notes,
  tags: row.tags,
}));
