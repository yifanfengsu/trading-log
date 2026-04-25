import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { CalendarDayPnl, MetricFormat } from "@/lib/mock-data";

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
  const digits = value >= 1000 ? 1 : 2;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatRisk(value: number) {
  return `${value.toFixed(2)}%`;
}

export function formatRMultiple(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}R`;
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
  dayValues: CalendarDayPnl[],
) {
  const cells: CalendarCell[] = [];
  const dayMap = new Map(dayValues.map((entry) => [entry.day, entry.pnl]));
  const firstDate = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startOffset = (firstDate.getDay() + 6) % 7;

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
      pnl: dayMap.get(day) ?? null,
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
