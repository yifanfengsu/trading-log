"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import { getDateDisplay, getMonthMatrix } from "@/lib/calendar-utils";
import {
  cn,
  formatCompactCurrency,
  parseSelectedMonth,
} from "@/lib/utils";

interface CalendarMonthGridProps {
  selectedMonth: string;
  selectedDate: string | null;
  dailyPnlMap: Record<string, number>;
  tradeCountMap: Record<string, number>;
  reviewedDates: ReadonlySet<string>;
  onSelectDate: (date: string) => void;
}

export default function CalendarMonthGrid({
  selectedMonth,
  selectedDate,
  dailyPnlMap,
  tradeCountMap,
  reviewedDates,
  onSelectDate,
}: CalendarMonthGridProps) {
  const { dictionary: copy, locale } = useLanguage();
  const { settings } = useUserSettings();
  const { year, month } = parseSelectedMonth(selectedMonth);
  const cells = getMonthMatrix(year, month);

  return (
    <section className="panel-card overflow-hidden p-4 sm:p-5 lg:p-6">
      <div className="overflow-x-auto pb-1">
        <div className="grid min-w-[760px] grid-cols-7 gap-2">
          {copy.calendar.weekdays.map((day) => (
            <div
              key={day}
              className="px-2 py-2 text-center text-xs font-semibold uppercase text-slate-400"
            >
              {day}
            </div>
          ))}

          {cells.map((cell) => {
            const tradeCount = tradeCountMap[cell.dateKey] ?? 0;
            const hasTrades = tradeCount > 0;
            const pnl = dailyPnlMap[cell.dateKey] ?? 0;
            const isProfit = hasTrades && pnl > 0;
            const isLoss = hasTrades && pnl < 0;
            const isReviewed = reviewedDates.has(cell.dateKey);
            const isSelected = selectedDate === cell.dateKey;

            if (!cell.isCurrentMonth) {
              return (
                <div
                  key={cell.dateKey}
                  className="min-h-[122px] rounded-[18px] border border-[rgba(151,161,184,0.10)] bg-[rgba(241,243,251,0.42)] p-3 text-slate-300"
                >
                  <span className="text-sm font-semibold">{cell.day}</span>
                </div>
              );
            }

            return (
              <button
                key={cell.dateKey}
                type="button"
                onClick={() => onSelectDate(cell.dateKey)}
                aria-label={getDateDisplay(cell.dateKey, locale)}
                className={cn(
                  "flex min-h-[122px] flex-col rounded-[18px] border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(31,15,86,0.08)]",
                  !hasTrades &&
                    "border-[rgba(151,161,184,0.12)] bg-white/74 hover:border-[rgba(108,77,255,0.20)]",
                  isProfit &&
                    "border-emerald-100 bg-[linear-gradient(180deg,rgba(22,163,74,0.13),rgba(255,255,255,0.92))]",
                  isLoss &&
                    "border-rose-100 bg-[linear-gradient(180deg,rgba(244,63,94,0.13),rgba(255,255,255,0.94))]",
                  isSelected &&
                    "border-[rgba(108,77,255,0.55)] shadow-[inset_0_0_0_1px_rgba(108,77,255,0.32),0_14px_28px_rgba(108,77,255,0.10)]",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-800">
                    {cell.day}
                  </span>
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      isReviewed && "bg-[var(--accent)]",
                      !isReviewed && hasTrades && "bg-slate-300",
                      !isReviewed && !hasTrades && "bg-transparent",
                    )}
                  />
                </div>

                {hasTrades ? (
                  <div className="mt-auto space-y-2">
                    <p
                      className={cn(
                        "text-base font-semibold tracking-[-0.03em]",
                        isProfit && "text-emerald-700",
                        isLoss && "text-rose-700",
                        !isProfit && !isLoss && "text-slate-700",
                      )}
                    >
                      {formatCompactCurrency(pnl, settings.currency)}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      {tradeCount} {copy.calendarPage.trades}
                    </p>
                    <span
                      className={cn(
                        "inline-flex w-fit rounded-full px-2 py-1 text-[11px] font-semibold",
                        isReviewed
                          ? "bg-[rgba(108,77,255,0.10)] text-[var(--accent)]"
                          : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {isReviewed
                        ? copy.calendarPage.reviewed
                        : copy.calendarPage.notReviewed}
                    </span>
                  </div>
                ) : isReviewed ? (
                  <span className="mt-auto inline-flex w-fit rounded-full bg-[rgba(108,77,255,0.10)] px-2 py-1 text-[11px] font-semibold text-[var(--accent)]">
                    {copy.calendarPage.reviewed}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
