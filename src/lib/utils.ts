import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { Locale } from "@/lib/i18n";
import type { MetricFormat } from "@/lib/mock-data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NumberOptions {
  digits?: number;
  signed?: boolean;
}

export function formatCurrency(
  value: number,
  { digits = 2, signed = false }: NumberOptions = {},
) {
  if (!Number.isFinite(value)) {
    return value === Infinity ? "∞" : "—";
  }

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

  if (!signed || value < 0) {
    return formatter.format(value);
  }

  return `+${formatter.format(value)}`;
}

export function formatPercent(
  value: number,
  { digits = 1, signed = false }: NumberOptions = {},
) {
  if (!Number.isFinite(value)) {
    return value === Infinity ? "∞" : "—";
  }

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
  { digits = 2, signed = false }: NumberOptions = {},
) {
  if (!Number.isFinite(value)) {
    return value === Infinity ? "∞" : "—";
  }

  const formatted = Math.abs(value).toFixed(digits);

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
) {
  if (format === "currency") {
    return formatCurrency(value, { digits });
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
) {
  if (format === "currency") {
    return formatCurrency(value, { digits, signed: true });
  }

  if (format === "percent") {
    return formatPercent(value, { digits, signed: true });
  }

  return formatNumber(value, { digits, signed: true });
}

export function formatAxisCurrencyTick(value: number) {
  if (value === 0) {
    return "$0";
  }

  const abs = Math.abs(value) / 1000;
  return `${value < 0 ? "-" : ""}$${abs.toFixed(0)}K`;
}

export function formatCompactCurrency(value: number) {
  return formatCurrency(value, { digits: 0 });
}

export function formatTradePrice(value: number) {
  const digits = value < 1 ? 4 : value >= 1000 ? 1 : 2;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatRisk(value: number) {
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

  if (locale === "zh") {
    return `${dateKey}${time ? ` ${time}` : ""}`;
  }

  const [year, month, day] = dateKey.split("-").map(Number);
  const dateLabel = `${englishShortMonthNames[month - 1]} ${day}, ${year}`;

  return `${dateLabel}${time ? ` ${time}` : ""}`;
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
