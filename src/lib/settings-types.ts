import type { TradeSetup, TradeSide } from "@/lib/trade-types";

export type CurrencyCode = "USD" | "CNY" | "HKD" | "EUR" | "USDT";

export type UserSettings = {
  currency: CurrencyCode;
  startingBalance: number;
  defaultSymbol: string;
  defaultSide: TradeSide;
  defaultSetup: TradeSetup;
  defaultRiskPercent: number;
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
  currency: "USD",
  startingBalance: 100000,
  defaultSymbol: "BTCUSDT",
  defaultSide: "long",
  defaultSetup: "breakout",
  defaultRiskPercent: 1,
};

export const currencyOptions: {
  code: CurrencyCode;
  label: string;
  symbol: string;
}[] = [
  { code: "USD", label: "USD - $", symbol: "$" },
  { code: "CNY", label: "CNY - ¥", symbol: "¥" },
  { code: "HKD", label: "HKD - HK$", symbol: "HK$" },
  { code: "EUR", label: "EUR - €", symbol: "€" },
  { code: "USDT", label: "USDT - USDT", symbol: "USDT" },
];

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return (
    value === "USD" ||
    value === "CNY" ||
    value === "HKD" ||
    value === "EUR" ||
    value === "USDT"
  );
}

export function isTradeSide(value: unknown): value is TradeSide {
  return value === "long" || value === "short";
}

export function isTradeSetup(value: unknown): value is TradeSetup {
  return (
    value === "trendFollowing" ||
    value === "breakout" ||
    value === "scalping" ||
    value === "meanReversion" ||
    value === "other"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function isUserSettings(value: unknown): value is UserSettings {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isCurrencyCode(value.currency) &&
    isNonNegativeNumber(value.startingBalance) &&
    typeof value.defaultSymbol === "string" &&
    value.defaultSymbol.trim().length > 0 &&
    isTradeSide(value.defaultSide) &&
    isTradeSetup(value.defaultSetup) &&
    isNonNegativeNumber(value.defaultRiskPercent)
  );
}

export function normalizeUserSettings(value: unknown): UserSettings | null {
  if (!isUserSettings(value)) {
    return null;
  }

  return {
    ...value,
    defaultSymbol: value.defaultSymbol.trim().toUpperCase(),
  };
}
