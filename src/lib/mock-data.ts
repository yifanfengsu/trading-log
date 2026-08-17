import type { Trade, TradeSetup, TradeSide } from "@/lib/trade-types";
import { DEFAULT_USER_SETTINGS } from "@/lib/settings-types";
import {
  computeInitialRisk,
  computePnl,
  computeRMultiple,
  computeRiskPercent,
} from "@/lib/trade-calculations";
import {
  getCurrentMonthKey,
  getMonthRangeFromMonthKey,
  pad2,
} from "@/lib/utils";

export const sidebarMenuIds = [
  "dashboard",
  "trades",
  "calendar",
  "analytics",
  "playbook",
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
  day: number;
  time: string;
  symbol: string;
  side: TradeSide;
  setup: TradeSetup;
  entryPrice: number;
  riskPercent: number;
  pnl: number;
  notes?: string;
  tags?: string[];
}

const seedTradeRows: SeedTradeRow[] = [
  {
    day: 1,
    time: "10:12:00",
    symbol: "BTCUSDT",
    side: "long",
    setup: "trendFollowing",
    entryPrice: 95420,
    riskPercent: 1,
    pnl: 620,
  },
  {
    day: 2,
    time: "14:08:00",
    symbol: "ETHUSDT",
    side: "long",
    setup: "breakout",
    entryPrice: 1835.6,
    riskPercent: 1,
    pnl: -180,
  },
  {
    day: 3,
    time: "11:20:00",
    symbol: "SOLUSDT",
    side: "short",
    setup: "meanReversion",
    entryPrice: 147.3,
    riskPercent: 0.8,
    pnl: 510,
  },
  {
    day: 4,
    time: "15:35:00",
    symbol: "BTCUSDT",
    side: "short",
    setup: "scalping",
    entryPrice: 96180,
    riskPercent: 0.75,
    pnl: -240,
  },
  {
    day: 5,
    time: "09:48:00",
    symbol: "ETHUSDT",
    side: "long",
    setup: "trendFollowing",
    entryPrice: 1882.4,
    riskPercent: 1,
    pnl: 530,
  },
  {
    day: 6,
    time: "13:16:00",
    symbol: "LINKUSDT",
    side: "long",
    setup: "breakout",
    entryPrice: 13.72,
    riskPercent: 1,
    pnl: 345,
  },
  {
    day: 7,
    time: "11:06:00",
    symbol: "SOLUSDT",
    side: "short",
    setup: "scalping",
    entryPrice: 151.15,
    riskPercent: 0.75,
    pnl: -120,
  },
  {
    day: 8,
    time: "16:44:00",
    symbol: "BTCUSDT",
    side: "long",
    setup: "trendFollowing",
    entryPrice: 97420,
    riskPercent: 1,
    pnl: 530,
  },
  {
    day: 9,
    time: "10:18:00",
    symbol: "ETHUSDT",
    side: "short",
    setup: "meanReversion",
    entryPrice: 1921.7,
    riskPercent: 0.9,
    pnl: -60,
  },
  {
    day: 10,
    time: "12:04:00",
    symbol: "DOGEUSDT",
    side: "long",
    setup: "scalping",
    entryPrice: 0.174,
    riskPercent: 0.6,
    pnl: 275,
  },
  {
    day: 11,
    time: "09:34:00",
    symbol: "SOLUSDT",
    side: "long",
    setup: "breakout",
    entryPrice: 154.85,
    riskPercent: 1,
    pnl: 315,
  },
  {
    day: 12,
    time: "14:28:00",
    symbol: "ETHUSDT",
    side: "long",
    setup: "scalping",
    entryPrice: 1998.1,
    riskPercent: 0.75,
    pnl: -95,
  },
  {
    day: 13,
    time: "10:42:00",
    symbol: "BTCUSDT",
    side: "short",
    setup: "meanReversion",
    entryPrice: 98640,
    riskPercent: 1,
    pnl: 510,
  },
  {
    day: 14,
    time: "15:10:00",
    symbol: "ETHUSDT",
    side: "long",
    setup: "trendFollowing",
    entryPrice: 2050.4,
    riskPercent: 1,
    pnl: 680,
  },
  {
    day: 15,
    time: "11:58:00",
    symbol: "SOLUSDT",
    side: "long",
    setup: "breakout",
    entryPrice: 161.45,
    riskPercent: 1,
    pnl: -210,
  },
  {
    day: 16,
    time: "13:22:00",
    symbol: "LINKUSDT",
    side: "short",
    setup: "meanReversion",
    entryPrice: 14.35,
    riskPercent: 0.8,
    pnl: 360,
  },
  {
    day: 17,
    time: "10:16:00",
    symbol: "BTCUSDT",
    side: "long",
    setup: "trendFollowing",
    entryPrice: 100420,
    riskPercent: 1,
    pnl: 405,
  },
  {
    day: 18,
    time: "12:40:00",
    symbol: "ETHUSDT",
    side: "short",
    setup: "scalping",
    entryPrice: 2142.7,
    riskPercent: 0.75,
    pnl: -110,
  },
  {
    day: 19,
    time: "09:55:00",
    symbol: "SOLUSDT",
    side: "long",
    setup: "breakout",
    entryPrice: 165.3,
    riskPercent: 1,
    pnl: 320,
  },
  {
    day: 20,
    time: "15:02:00",
    symbol: "BTCUSDT",
    side: "short",
    setup: "meanReversion",
    entryPrice: 102080,
    riskPercent: 1,
    pnl: 445,
  },
  {
    day: 21,
    time: "13:32:00",
    symbol: "ETHUSDT",
    side: "long",
    setup: "scalping",
    entryPrice: 2360.2,
    riskPercent: 0.75,
    pnl: -130,
  },
  {
    day: 22,
    time: "10:26:00",
    symbol: "SOLUSDT",
    side: "long",
    setup: "trendFollowing",
    entryPrice: 169.4,
    riskPercent: 1,
    pnl: 410,
  },
  {
    day: 23,
    time: "14:46:00",
    symbol: "LINKUSDT",
    side: "short",
    setup: "breakout",
    entryPrice: 15.18,
    riskPercent: 0.8,
    pnl: 285,
  },
  {
    day: 24,
    time: "11:18:00",
    symbol: "DOGEUSDT",
    side: "long",
    setup: "scalping",
    entryPrice: 0.186,
    riskPercent: 0.6,
    pnl: -70,
  },
  {
    day: 25,
    time: "16:12:00",
    symbol: "BTCUSDT",
    side: "long",
    setup: "trendFollowing",
    entryPrice: 102740,
    riskPercent: 1,
    pnl: 590,
  },
  {
    day: 26,
    time: "09:40:00",
    symbol: "ETHUSDT",
    side: "short",
    setup: "meanReversion",
    entryPrice: 2498.8,
    riskPercent: 0.9,
    pnl: -40,
  },
  {
    day: 27,
    time: "13:08:00",
    symbol: "SOLUSDT",
    side: "long",
    setup: "breakout",
    entryPrice: 171.8,
    riskPercent: 1,
    pnl: 430,
  },
  {
    day: 28,
    time: "15:24:00",
    symbol: "BTCUSDT",
    side: "long",
    setup: "other",
    entryPrice: 103380,
    riskPercent: 0.8,
    pnl: -125,
  },
  {
    day: 29,
    time: "10:52:00",
    symbol: "ETHUSDT",
    side: "long",
    setup: "trendFollowing",
    entryPrice: 2558.2,
    riskPercent: 1,
    pnl: 325.15,
  },
  {
    day: 30,
    time: "11:08:00",
    symbol: "BTCUSDT",
    side: "long",
    setup: "trendFollowing",
    entryPrice: 103150,
    riskPercent: 1,
    pnl: 830,
  },
  {
    day: 30,
    time: "16:42:00",
    symbol: "SOLUSDT",
    side: "long",
    setup: "scalping",
    entryPrice: 163.3,
    riskPercent: 0.75,
    pnl: -240,
  },
  {
    day: 31,
    time: "09:15:00",
    symbol: "ETHUSDT",
    side: "short",
    setup: "trendFollowing",
    entryPrice: 2612.5,
    riskPercent: 1,
    pnl: 377,
  },
  {
    day: 31,
    time: "10:24:00",
    symbol: "BTCUSDT",
    side: "long",
    setup: "breakout",
    entryPrice: 104250,
    riskPercent: 1,
    pnl: 1170,
  },
];

function getSeedQuantity(symbol: string) {
  if (symbol.startsWith("BTC")) {
    return 1;
  }

  if (symbol.startsWith("ETH")) {
    return 10;
  }

  if (symbol.startsWith("SOL")) {
    return 100;
  }

  if (symbol.startsWith("DOGE")) {
    return 10_000;
  }

  return 1_000;
}

function deriveSeedTradeNumbers(row: SeedTradeRow) {
  const quantity = getSeedQuantity(row.symbol);
  const intendedRisk =
    DEFAULT_USER_SETTINGS.startingBalance * (row.riskPercent / 100);
  const stopDistance = intendedRisk / quantity;
  const pnlMove = row.pnl / quantity;
  const sideMultiplier = row.side === "long" ? 1 : -1;
  const stopPrice = row.entryPrice - stopDistance * sideMultiplier;
  const exitPrice = row.entryPrice + pnlMove * sideMultiplier;
  const initialRisk = computeInitialRisk({
    entryPrice: row.entryPrice,
    stopPrice,
    quantity,
  });
  const pnl = computePnl({
    side: row.side,
    entryPrice: row.entryPrice,
    exitPrice,
    quantity,
    fees: 0,
  });

  return {
    quantity,
    stopPrice,
    exitPrice,
    fees: 0,
    pnl,
    rMultiple: computeRMultiple({ pnl, initialRisk }),
    riskPercent: computeRiskPercent({
      initialRisk,
      accountBalance: DEFAULT_USER_SETTINGS.startingBalance,
    }),
  };
}

function getSeedDateKey(baseMonthKey: string, day: number) {
  const range = getMonthRangeFromMonthKey(baseMonthKey);
  const monthKey = range.startDate.slice(0, 7);
  const endDay = Number(range.endDate.slice(8, 10));

  return `${monthKey}-${pad2(Math.min(day, endDay))}`;
}

export function getSeedTrades(
  baseMonthKey = getCurrentMonthKey(),
): Trade[] {
  return seedTradeRows.map((row, index) => {
    const dateKey = getSeedDateKey(baseMonthKey, row.day);
    const numbers = deriveSeedTradeNumbers(row);

    return {
      id: `seed-${dateKey}-${index + 1}`,
      closedAt: `${dateKey}T${row.time}`,
      symbol: row.symbol.toUpperCase(),
      side: row.side,
      setup: row.setup,
      entryPrice: row.entryPrice,
      ...numbers,
      pnlSource: "computed",
      status: "closed",
      notes: row.notes,
      tags: row.tags,
    };
  });
}

export const seedTrades: Trade[] = getSeedTrades();
