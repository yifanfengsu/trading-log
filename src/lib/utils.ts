import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { GoalUnit } from "@/lib/goal-types";
import type { Locale } from "@/lib/i18n";
import type { MetricFormat } from "@/lib/mock-data";
import type { CurrencyCode } from "@/lib/settings-types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NumberOptions {
  digits?: number;
  signed?: boolean;
}

interface CurrencyFormatOptions extends NumberOptions {
  currency?: CurrencyCode;
}

const currencySymbols: Record<CurrencyCode, string> = {
  USD: "$",
  CNY: "¥",
  HKD: "HK$",
  EUR: "€",
  USDT: "USDT",
};

function resolveNumberOptions(
  options: NumberOptions | number | undefined,
): Required<NumberOptions> {
  if (typeof options === "number") {
    return {
      digits: options,
      signed: false,
    };
  }

  return {
    digits: options?.digits ?? 2,
    signed: options?.signed ?? false,
  };
}

function resolveCurrencyOptions(
  currencyOrOptions: CurrencyCode | CurrencyFormatOptions | undefined,
): Required<CurrencyFormatOptions> {
  if (typeof currencyOrOptions === "string") {
    return {
      currency: currencyOrOptions,
      digits: 2,
      signed: false,
    };
  }

  return {
    currency: currencyOrOptions?.currency ?? "USD",
    digits: currencyOrOptions?.digits ?? 2,
    signed: currencyOrOptions?.signed ?? false,
  };
}

function formatDecimal(value: number, digits: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatCurrency(
  value: number,
  currencyOrOptions?: CurrencyCode | CurrencyFormatOptions,
) {
  if (!Number.isFinite(value)) {
    return value === Infinity ? "∞" : "—";
  }

  const { currency, digits, signed } = resolveCurrencyOptions(currencyOrOptions);
  const absText = formatDecimal(Math.abs(value), digits);
  const sign = value < 0 ? "-" : signed && value > 0 ? "+" : "";

  if (currency === "USDT") {
    return `${sign}${absText} USDT`;
  }

  return `${sign}${currencySymbols[currency]}${absText}`;
}

export function formatPercent(
  value: number,
  options?: NumberOptions | number,
) {
  if (!Number.isFinite(value)) {
    return value === Infinity ? "∞" : "—";
  }

  const { digits, signed } = resolveNumberOptions(options);
  const formatted = `${Math.abs(value).toFixed(digits)}%`;

  if (signed) {
    if (value > 0) {
      return `+${formatted}`;
    }

    if (value < 0) {
      return `-${formatted}`;
    }
  }

  return value < 0 ? `-${formatted}` : formatted;
}

export function formatNumber(
  value: number,
  options?: NumberOptions | number,
) {
  if (!Number.isFinite(value)) {
    return value === Infinity ? "∞" : "—";
  }

  const { digits, signed } = resolveNumberOptions(options);
  const formatted = formatDecimal(Math.abs(value), digits);

  if (signed) {
    if (value > 0) {
      return `+${formatted}`;
    }

    if (value < 0) {
      return `-${formatted}`;
    }
  }

  return value < 0 ? `-${formatted}` : formatted;
}

export function formatMetricValue(
  value: number,
  format: MetricFormat,
  digits = 2,
  currency: CurrencyCode = "USD",
) {
  if (format === "currency") {
    return formatCurrency(value, { currency, digits });
  }

  if (format === "percent") {
    return formatPercent(value, { digits });
  }

  return formatNumber(value, { digits });
}

export function formatMetricChange(
  value: number,
  format: MetricFormat,
  digits = 2,
  currency: CurrencyCode = "USD",
) {
  if (format === "currency") {
    return formatCurrency(value, { currency, digits, signed: true });
  }

  if (format === "percent") {
    return formatPercent(value, { digits, signed: true });
  }

  return formatNumber(value, { digits, signed: true });
}

export function formatAxisCurrencyTick(value: number, currency: CurrencyCode = "USD") {
  if (!Number.isFinite(value)) {
    return "—";
  }

  const symbol = currencySymbols[currency];

  if (value === 0) {
    return currency === "USDT" ? "0 USDT" : `${symbol}0`;
  }

  const abs = Math.abs(value) / 1000;
  const prefix = value < 0 ? "-" : "";

  return currency === "USDT"
    ? `${prefix}${abs.toFixed(0)}K USDT`
    : `${prefix}${symbol}${abs.toFixed(0)}K`;
}

export function formatCompactCurrency(value: number, currency: CurrencyCode = "USD") {
  return formatCurrency(value, { currency, digits: 0 });
}

export function formatTradePrice(value: number) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  const digits = value < 1 ? 4 : value >= 1000 ? 1 : 2;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatRisk(value: number) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return `${value.toFixed(2)}%`;
}

export function formatRMultiple(value: number) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}R`;
}

export function formatProfitFactor(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  if (value === Infinity) {
    return "∞";
  }

  if (!Number.isFinite(value)) {
    return "—";
  }

  return value.toFixed(2);
}

export function formatGoalValue(
  value: number,
  unit: GoalUnit,
  locale: Locale,
  currency: CurrencyCode = "USD",
) {
  if (unit === "currency") {
    return formatCurrency(value, currency);
  }

  if (unit === "percent") {
    return formatPercent(value);
  }

  if (unit === "r") {
    return formatRMultiple(value);
  }

  if (unit === "trades") {
    return `${formatNumber(value, { digits: 0 })} ${
      locale === "zh" ? "笔" : "trades"
    }`;
  }

  if (unit === "days") {
    return `${formatNumber(value, { digits: 0 })} ${
      locale === "zh" ? "天" : "days"
    }`;
  }

  return formatNumber(value);
}

const englishMonthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const englishShortMonthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function getDateKey(dateOrIso: string) {
  return dateOrIso.slice(0, 10);
}

export function getWeekdayIndexFromDateKey(dateKey: string): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  const [year, month, day] = dateKey.split("-").map(Number);
  const dayOfWeek = new Date(year, month - 1, day).getDay();

  return (dayOfWeek === 0 ? 7 : dayOfWeek) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

export function parseSelectedMonth(selectedMonth: string) {
  const [year, month] = selectedMonth.split("-").map(Number);

  return {
    year,
    month,
  };
}

export function getMonthEndDay(selectedMonth: string) {
  const { year, month } = parseSelectedMonth(selectedMonth);
  return new Date(year, month, 0).getDate();
}

export function getMonthEndDateKey(selectedMonth: string) {
  return `${selectedMonth}-${String(getMonthEndDay(selectedMonth)).padStart(2, "0")}`;
}

export function shiftSelectedMonth(selectedMonth: string, offset: number) {
  const { year, month } = parseSelectedMonth(selectedMonth);
  const nextDate = new Date(year, month - 1 + offset, 1);

  return `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthRange(selectedMonth: string, locale: Locale) {
  const { year, month } = parseSelectedMonth(selectedMonth);
  const endDay = getMonthEndDay(selectedMonth);

  if (locale === "zh") {
    return `${year}年${month}月1日 - ${year}年${month}月${endDay}日`;
  }

  return `${englishMonthNames[month - 1]} 1 - ${englishMonthNames[month - 1]} ${endDay}, ${year}`;
}

export function formatMonthLabel(selectedMonth: string, locale: Locale) {
  const { year, month } = parseSelectedMonth(selectedMonth);

  if (locale === "zh") {
    return `${year}年${month}月`;
  }

  return `${englishMonthNames[month - 1]} ${year}`;
}

export function formatDateLabel(dateKey: string, locale: Locale) {
  const [year, month, day] = dateKey.split("-").map(Number);

  if (locale === "zh") {
    return `${year}年${month}月${day}日`;
  }

  return `${englishMonthNames[month - 1]} ${day}, ${year}`;
}

export function formatDateRange(
  startDate: string,
  endDate: string,
  locale: Locale,
) {
  const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
  const [endYear, endMonth, endDay] = endDate.split("-").map(Number);

  if (locale === "zh") {
    return `${startYear}年${startMonth}月${startDay}日 - ${endYear}年${endMonth}月${endDay}日`;
  }

  if (startYear === endYear) {
    return `${englishShortMonthNames[startMonth - 1]} ${startDay} - ${
      englishShortMonthNames[endMonth - 1]
    } ${endDay}, ${endYear}`;
  }

  return `${englishShortMonthNames[startMonth - 1]} ${startDay}, ${startYear} - ${
    englishShortMonthNames[endMonth - 1]
  } ${endDay}, ${endYear}`;
}

export function formatWeekLabel(weekKey: string, locale: Locale) {
  const match = /^(\d{4})-W(\d{2})$/.exec(weekKey);

  if (!match) {
    return weekKey;
  }

  const year = Number(match[1]);
  const week = Number(match[2]);

  return locale === "zh" ? `${year}年第${week}周` : `${year} W${String(week).padStart(2, "0")}`;
}

export function formatShortDateLabel(dateKey: string, locale: Locale) {
  const [, month, day] = dateKey.split("-").map(Number);

  if (locale === "zh") {
    return `${month}月${day}日`;
  }

  return `${englishShortMonthNames[month - 1]} ${day}`;
}

export function formatTradeTimestamp(iso: string) {
  return iso.replace("T", " ").slice(0, 16);
}

export function formatDateTime(iso: string, locale: Locale) {
  const dateKey = getDateKey(iso);
  const time = iso.includes("T") ? iso.split("T")[1]?.slice(0, 5) : "";
  const [year, month, day] = dateKey.split("-").map(Number);

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(dateKey) ||
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    month < 1 ||
    month > 12
  ) {
    return iso || "—";
  }

  if (locale === "zh") {
    return `${dateKey}${time ? ` ${time}` : ""}`;
  }

  const dateLabel = `${englishShortMonthNames[month - 1]} ${day}, ${year}`;

  return `${dateLabel}${time ? ` ${time}` : ""}`;
}

export function safeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function downloadTextFile(
  fileName: string,
  content: string,
  mimeType: string,
) {
  if (typeof document === "undefined") {
    return;
  }

  const blob = new Blob([content], {
    type: mimeType,
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export interface CalendarCell {
  key: string;
  day: number | null;
  pnl: number | null;
  inCurrentMonth: boolean;
}

export function buildCalendarGrid(
  year: number,
  monthIndex: number,
  dailyPnlMap: Record<string, number>,
) {
  const cells: CalendarCell[] = [];
  const firstDate = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startOffset = (firstDate.getDay() + 6) % 7;
  const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;

  for (let index = 0; index < startOffset; index += 1) {
    cells.push({
      key: `leading-${index}`,
      day: null,
      pnl: null,
      inCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      key: `day-${day}`,
      day,
      pnl: dailyPnlMap[`${monthKey}-${String(day).padStart(2, "0")}`] ?? null,
      inCurrentMonth: true,
    });
  }

  while (cells.length % 7 !== 0 || cells.length < 35) {
    cells.push({
      key: `trailing-${cells.length}`,
      day: null,
      pnl: null,
      inCurrentMonth: false,
    });
  }

  return cells;
}
