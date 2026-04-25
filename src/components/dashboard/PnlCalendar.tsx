"use client";

import { ChevronDown } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  type CalendarDayPnl,
  type CalendarSummary,
} from "@/lib/mock-data";
import {
  buildCalendarGrid,
  cn,
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
} from "@/lib/utils";

interface PnlCalendarProps {
  dayValues: CalendarDayPnl[];
  summary: CalendarSummary;
}

export default function PnlCalendar({
  dayValues,
  summary,
}: PnlCalendarProps) {
  const { dictionary: copy } = useLanguage();
  const cells = buildCalendarGrid(2025, 4, dayValues);

  return (
    <section className="panel-card p-5 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="panel-title">{copy.calendar.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{copy.monthLabel}</p>
        </div>
        <button type="button" className="soft-pill w-fit">
          <span>{copy.monthlyLabel}</span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2">
        {copy.calendar.weekdays.map((day) => (
          <div
            key={day}
            className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-[0.08em] text-slate-400"
          >
            {day}
          </div>
        ))}

        {cells.map((cell) => {
          const isProfit = (cell.pnl ?? 0) > 0;
          const isLoss = (cell.pnl ?? 0) < 0;

          return (
            <div
              key={cell.key}
              className={cn(
                "flex min-h-[82px] flex-col rounded-[18px] border p-3 transition-colors lg:min-h-[96px]",
                !cell.inCurrentMonth &&
                  "border-[rgba(151,161,184,0.14)] bg-[rgba(241,243,251,0.7)]",
                cell.inCurrentMonth &&
                  !cell.pnl &&
                  "border-[rgba(151,161,184,0.12)] bg-white/70",
                isProfit &&
                  "border-emerald-100 bg-[linear-gradient(180deg,rgba(22,163,74,0.12),rgba(255,255,255,0.9))]",
                isLoss &&
                  "border-rose-100 bg-[linear-gradient(180deg,rgba(244,63,94,0.12),rgba(255,255,255,0.92))]",
              )}
            >
              <span
                className={cn(
                  "text-sm font-semibold",
                  cell.inCurrentMonth ? "text-slate-700" : "text-slate-300",
                )}
              >
                {cell.day ?? ""}
              </span>
              {cell.pnl !== null ? (
                <span
                  className={cn(
                    "mt-auto text-sm font-semibold tracking-[-0.02em]",
                    isProfit && "text-emerald-700",
                    isLoss && "text-rose-700",
                  )}
                >
                  {formatCompactCurrency(cell.pnl)}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
        <div className="rounded-[18px] bg-[rgba(108,77,255,0.05)] px-4 py-4">
          <p className="text-sm text-slate-500">{copy.calendar.summary.totalPnl}</p>
          <p className="mt-2 text-lg font-semibold text-emerald-600">
            {formatCurrency(summary.totalPnl)}
          </p>
        </div>
        <div className="rounded-[18px] bg-[rgba(15,23,42,0.03)] px-4 py-4">
          <p className="text-sm text-slate-500">
            {copy.calendar.summary.winningDays}
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {summary.winningDays} ({formatPercent(summary.winningRate)})
          </p>
        </div>
        <div className="rounded-[18px] bg-[rgba(15,23,42,0.03)] px-4 py-4">
          <p className="text-sm text-slate-500">
            {copy.calendar.summary.losingDays}
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {summary.losingDays} ({formatPercent(summary.losingRate)})
          </p>
        </div>
        <div className="rounded-[18px] bg-[rgba(15,23,42,0.03)] px-4 py-4">
          <p className="text-sm text-slate-500">{copy.calendar.summary.bestDay}</p>
          <p className="mt-2 text-lg font-semibold text-[var(--accent)]">
            {formatCurrency(summary.bestDay)}
          </p>
        </div>
      </div>
    </section>
  );
}
