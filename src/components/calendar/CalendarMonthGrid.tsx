"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import Card from "@/components/ui/Card";
import { getDateDisplay, getMonthMatrix } from "@/lib/calendar-utils";
import { getMaxAbsPnl, getPnlHeatStyle } from "@/lib/pnl-heat";
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
  const maxAbsPnl = getMaxAbsPnl(dailyPnlMap);

  return (
    <Card className="overflow-hidden">
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
            // Magnitude-scaled green/red heat for traded days (deeper = larger).
            const heatStyle = hasTrades
              ? getPnlHeatStyle(pnl, maxAbsPnl)
              : undefined;

            if (!cell.isCurrentMonth) {
              return (
                <div
                  key={cell.dateKey}
                  className="min-h-[122px] rounded-[18px] border border-white/5 bg-[rgba(30,33,30,0.22)] p-3 text-slate-600"
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
                style={heatStyle}
                className={cn(
                  "flex min-h-[122px] flex-col rounded-[18px] border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(0,0,0,0.28)]",
                  !hasTrades &&
                    "border-white/10 bg-[rgba(30,33,30,0.46)] hover:border-[rgba(184,241,53,0.24)] hover:bg-[rgba(30,33,30,0.66)]",
                  isSelected &&
                    "border-[rgba(184,241,53,0.70)] shadow-[inset_0_0_0_1px_rgba(184,241,53,0.30),0_0_24px_rgba(184,241,53,0.18)]",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-200">
                    {cell.day}
                  </span>
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      isReviewed &&
                        "bg-[var(--accent)] shadow-[0_0_10px_rgba(184,241,53,0.8)]",
                      !isReviewed && hasTrades && "bg-slate-600",
                      !isReviewed && !hasTrades && "bg-transparent",
                    )}
                  />
                </div>

                {hasTrades ? (
                  <div className="mt-auto space-y-2">
                    <p
                      className={cn(
                        "text-base font-semibold tracking-normal",
                        isProfit && "text-[var(--success)]",
                        isLoss && "text-rose-300",
                        !isProfit && !isLoss && "text-slate-300",
                      )}
                    >
                      {formatCompactCurrency(pnl, settings.currency)}
                    </p>
                    <p className="text-xs font-medium text-slate-400">
                      {tradeCount} {copy.calendarPage.trades}
                    </p>
                    <span
                      className={cn(
                        "inline-flex w-fit rounded-full px-2 py-1 text-[11px] font-semibold",
                        isReviewed
                          ? "bg-[rgba(184,241,53,0.14)] text-[var(--accent)]"
                          : "bg-[rgba(155,163,155,0.10)] text-slate-400",
                      )}
                    >
                      {isReviewed
                        ? copy.calendarPage.reviewed
                        : copy.calendarPage.notReviewed}
                    </span>
                  </div>
                ) : isReviewed ? (
                  <span className="mt-auto inline-flex w-fit rounded-full bg-[rgba(184,241,53,0.14)] px-2 py-1 text-[11px] font-semibold text-[var(--accent)]">
                    {copy.calendarPage.reviewed}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
