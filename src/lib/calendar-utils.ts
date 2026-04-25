import type { Locale } from "@/lib/i18n";
import {
  formatDateLabel,
  formatMonthLabel,
  getMonthEndDay,
  parseSelectedMonth,
  shiftSelectedMonth,
} from "@/lib/utils";

export interface MonthMatrixCell {
  dateKey: string;
  day: number;
  isCurrentMonth: boolean;
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function isValidDateKey(value: string | undefined): value is string {
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

export function getMonthMatrix(year: number, month: number) {
  const firstDate = new Date(year, month - 1, 1);
  const startOffset = (firstDate.getDay() + 6) % 7;
  const firstCellDate = new Date(year, month - 1, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index): MonthMatrixCell => {
    const date = new Date(
      firstCellDate.getFullYear(),
      firstCellDate.getMonth(),
      firstCellDate.getDate() + index,
    );
    const cellYear = date.getFullYear();
    const cellMonth = date.getMonth() + 1;
    const day = date.getDate();

    return {
      dateKey: toDateKey(cellYear, cellMonth, day),
      day,
      isCurrentMonth: cellYear === year && cellMonth === month,
    };
  });
}

export function getMonthStartEnd(selectedMonth: string) {
  const { year, month } = parseSelectedMonth(selectedMonth);

  return {
    startDate: `${selectedMonth}-01`,
    endDate: `${selectedMonth}-${String(getMonthEndDay(selectedMonth)).padStart(2, "0")}`,
    year,
    month,
  };
}

export function getMonthNavigation(selectedMonth: string) {
  return {
    prevMonth: shiftSelectedMonth(selectedMonth, -1),
    nextMonth: shiftSelectedMonth(selectedMonth, 1),
  };
}

export function getDateDisplay(dateKey: string, locale: Locale) {
  return formatDateLabel(dateKey, locale);
}

export function getMonthLabel(selectedMonth: string, locale: Locale) {
  return formatMonthLabel(selectedMonth, locale);
}
