import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { GoalUnit } from "@/lib/goal-types";
import type { Locale } from "@/lib/i18n";
import type { MetricFormat } from "@/lib/mock-data";
import {
  currencySymbols,
  type CurrencyCode,
} from "@/lib/settings-types";

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

  const { digits, signed } = resolveNumberOptions(
    options ?? {
      digits: 1,
    },
  );
  const formatted = `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
  }).format(Math.abs(value))}%`;

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

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
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

const millisecondsPerDay = 24 * 60 * 60 * 1000;

export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function getDateKey(dateOrIso: string) {
  return dateOrIso.slice(0, 10);
}

export function getDateKeyFromLocalDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate(),
  )}`;
}

export function getTodayDateKey(): string {
  return getDateKeyFromLocalDate(new Date());
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function getCurrentMonthNumber(): number {
  return new Date().getMonth() + 1;
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}`;
}

export function isValidDateKey(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function isValidMonthKey(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month] = value.split("-").map(Number);

  return Number.isFinite(year) && month >= 1 && month <= 12;
}

function parseDateKeyToLocalDate(dateKey: string) {
  const fallbackDateKey = isValidDateKey(dateKey) ? dateKey : getTodayDateKey();
  const [year, month, day] = fallbackDateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function getWeekOneMonday(weekYear: number) {
  const januaryFourth = new Date(weekYear, 0, 4);
  const dayIndex = (januaryFourth.getDay() + 6) % 7;

  return new Date(weekYear, 0, 4 - dayIndex);
}

export function getWeekKeyFromDateKey(dateKey: string): string {
  const date = parseDateKeyToLocalDate(dateKey);
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
    Math.floor(
      (currentWeekMonday.getTime() - weekOneMonday.getTime()) /
        millisecondsPerDay /
        7,
    ) + 1;

  return `${weekYear}-W${pad2(weekNumber)}`;
}

export function getCurrentWeekKey(): string {
  return getWeekKeyFromDateKey(getTodayDateKey());
}

export function getMonthKeyFromDateKey(dateKey: string): string {
  return isValidDateKey(dateKey) ? dateKey.slice(0, 7) : getCurrentMonthKey();
}

export function getWeekdayIndexFromDateKey(dateKey: string): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  const [year, month, day] = dateKey.split("-").map(Number);
  const dayOfWeek = new Date(year, month - 1, day).getDay();

  return (dayOfWeek === 0 ? 7 : dayOfWeek) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

export function parseSelectedMonth(selectedMonth: string) {
  const now = new Date();
  const [year, month] = selectedMonth.split("-").map(Number);

  return {
    year: Number.isFinite(year) ? year : now.getFullYear(),
    month: Number.isFinite(month) && month >= 1 && month <= 12
      ? month
      : now.getMonth() + 1,
  };
}

export function getMonthEndDay(selectedMonth: string) {
  const { year, month } = parseSelectedMonth(selectedMonth);
  return new Date(year, month, 0).getDate();
}

export function getMonthEndDateKey(selectedMonth: string) {
  const { endDate } = getMonthRangeFromMonthKey(selectedMonth);
  return endDate;
}

export function shiftSelectedMonth(selectedMonth: string, offset: number) {
  const { year, month } = parseSelectedMonth(selectedMonth);
  const nextDate = new Date(year, month - 1 + offset, 1);

  return `${nextDate.getFullYear()}-${pad2(nextDate.getMonth() + 1)}`;
}

export function getPreviousMonthKey(monthKey: string): string {
  return shiftSelectedMonth(monthKey, -1);
}

export function getNextMonthKey(monthKey: string): string {
  return shiftSelectedMonth(monthKey, 1);
}

export function getMonthRangeFromMonthKey(monthKey: string): {
  startDate: string;
  endDate: string;
} {
  const { year, month } = parseSelectedMonth(monthKey);
  const normalizedMonthKey = `${year}-${pad2(month)}`;
  const endDay = new Date(year, month, 0).getDate();

  return {
    startDate: `${normalizedMonthKey}-01`,
    endDate: `${normalizedMonthKey}-${pad2(endDay)}`,
  };
}

export function formatMonthRange(selectedMonth: string, locale: Locale) {
  const { year, month } = parseSelectedMonth(selectedMonth);
  const endDay = getMonthEndDay(selectedMonth);
  const monthName = englishMonthNames[month - 1];

  if (!monthName) {
    return selectedMonth || "—";
  }

  if (locale === "zh") {
    return `${year}年${month}月1日 - ${year}年${month}月${endDay}日`;
  }

  return `${monthName} 1 - ${monthName} ${endDay}, ${year}`;
}

export function formatMonthLabel(selectedMonth: string, locale: Locale) {
  const { year, month } = parseSelectedMonth(selectedMonth);
  const monthName = englishMonthNames[month - 1];

  if (!monthName) {
    return selectedMonth || "—";
  }

  if (locale === "zh") {
    return `${year}年${month}月`;
  }

  return `${monthName} ${year}`;
}

export function formatDateLabel(dateKey: string, locale: Locale) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const monthName = englishMonthNames[month - 1];

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(dateKey) ||
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !monthName
  ) {
    return dateKey || "—";
  }

  if (locale === "zh") {
    return `${year}年${month}月${day}日`;
  }

  return `${monthName} ${day}, ${year}`;
}

export function formatDateRange(
  startDate: string,
  endDate: string,
  locale: Locale,
) {
  const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
  const [endYear, endMonth, endDay] = endDate.split("-").map(Number);
  const startMonthName = englishShortMonthNames[startMonth - 1];
  const endMonthName = englishShortMonthNames[endMonth - 1];

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(endDate) ||
    !Number.isFinite(startYear) ||
    !Number.isFinite(startMonth) ||
    !Number.isFinite(startDay) ||
    !Number.isFinite(endYear) ||
    !Number.isFinite(endMonth) ||
    !Number.isFinite(endDay) ||
    !startMonthName ||
    !endMonthName
  ) {
    return startDate && endDate ? `${startDate} - ${endDate}` : "—";
  }

  if (locale === "zh") {
    return `${startYear}年${startMonth}月${startDay}日 - ${endYear}年${endMonth}月${endDay}日`;
  }

  if (startYear === endYear) {
    return `${startMonthName} ${startDay} - ${endMonthName} ${endDay}, ${endYear}`;
  }

  return `${startMonthName} ${startDay}, ${startYear} - ${endMonthName} ${endDay}, ${endYear}`;
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
  const monthName = englishShortMonthNames[month - 1];

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(dateKey) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !monthName
  ) {
    return dateKey || "—";
  }

  if (locale === "zh") {
    return `${month}月${day}日`;
  }

  return `${monthName} ${day}`;
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
