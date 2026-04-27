import type { Locale } from "@/lib/i18n";
import {
  formatDateLabel,
  formatMonthLabel,
  getMonthRangeFromMonthKey,
  getNextMonthKey,
  getPreviousMonthKey,
  isValidDateKey,
  pad2,
  parseSelectedMonth,
} from "@/lib/utils";

export interface MonthMatrixCell {
  dateKey: string;
  day: number;
  isCurrentMonth: boolean;
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
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
  const range = getMonthRangeFromMonthKey(selectedMonth);

  return {
    startDate: range.startDate,
    endDate: range.endDate,
    year,
    month,
  };
}

export function getMonthNavigation(selectedMonth: string) {
  return {
    prevMonth: getPreviousMonthKey(selectedMonth),
    nextMonth: getNextMonthKey(selectedMonth),
  };
}

export function getDateDisplay(dateKey: string, locale: Locale) {
  return formatDateLabel(dateKey, locale);
}

export function getMonthLabel(selectedMonth: string, locale: Locale) {
  return formatMonthLabel(selectedMonth, locale);
}

export { isValidDateKey };
