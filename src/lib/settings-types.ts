import { isNonNegativeNumber, isRecord } from "@/lib/guards";
import {
  isTradeSetup,
  isTradeSide,
  type TradeSetup,
  type TradeSide,
} from "@/lib/trade-types";

// Re-exported so existing importers (e.g. backup-utils) can keep pulling the
// trade guards through the settings module without a second definition.
export { isTradeSetup, isTradeSide };

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

// Symbol lookup derived from currencyOptions so the display symbol lives in a
// single place (utils.ts used to maintain a second copy).
export const currencySymbols = Object.fromEntries(
  currencyOptions.map((option) => [option.code, option.symbol]),
) as Record<CurrencyCode, string>;

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return (
    value === "USD" ||
    value === "CNY" ||
    value === "HKD" ||
    value === "EUR" ||
    value === "USDT"
  );
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
  if (!isRecord(value)) {
    return null;
  }

  return {
    currency: isCurrencyCode(value.currency)
      ? value.currency
      : DEFAULT_USER_SETTINGS.currency,
    startingBalance: isNonNegativeNumber(value.startingBalance)
      ? value.startingBalance
      : DEFAULT_USER_SETTINGS.startingBalance,
    defaultSymbol:
      typeof value.defaultSymbol === "string" &&
      value.defaultSymbol.trim().length > 0
        ? value.defaultSymbol.trim().toUpperCase()
        : DEFAULT_USER_SETTINGS.defaultSymbol,
    defaultSide: isTradeSide(value.defaultSide)
      ? value.defaultSide
      : DEFAULT_USER_SETTINGS.defaultSide,
    defaultSetup: isTradeSetup(value.defaultSetup)
      ? value.defaultSetup
      : DEFAULT_USER_SETTINGS.defaultSetup,
    defaultRiskPercent: isNonNegativeNumber(value.defaultRiskPercent)
      ? value.defaultRiskPercent
      : DEFAULT_USER_SETTINGS.defaultRiskPercent,
  };
}
