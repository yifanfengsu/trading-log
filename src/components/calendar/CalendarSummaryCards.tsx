"use client";

import { CalendarCheck2, CircleCheck, CircleX, LineChart, NotebookTabs } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import type { CalendarMonthSummary } from "@/lib/review-calculations";
import { cn, formatCurrency } from "@/lib/utils";

interface CalendarSummaryCardsProps {
  summary: CalendarMonthSummary;
}

const cards = [
  {
    key: "monthlyPnl",
    icon: LineChart,
    valueType: "currency",
  },
  {
    key: "tradingDays",
    icon: CalendarCheck2,
    valueType: "number",
  },
  {
    key: "winningDays",
    icon: CircleCheck,
    valueType: "number",
  },
  {
    key: "losingDays",
    icon: CircleX,
    valueType: "number",
  },
  {
    key: "reviewedDays",
    icon: NotebookTabs,
    valueType: "number",
  },
] as const;

export default function CalendarSummaryCards({
  summary,
}: CalendarSummaryCardsProps) {
  const { dictionary: copy } = useLanguage();
  const { settings } = useUserSettings();
  const values = {
    monthlyPnl: summary.monthlyPnl,
    tradingDays: summary.tradingDays,
    winningDays: summary.winningDays,
    losingDays: summary.losingDays,
    reviewedDays: summary.reviewedDays,
  };

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        const value = values[card.key];
        const isPositive = card.key === "monthlyPnl" && value > 0;
        const isNegative = card.key === "monthlyPnl" && value < 0;

        return (
          <article key={card.key} className="panel-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {copy.calendarPage[card.key]}
                </p>
                <p
                  className={cn(
                    "mt-4 text-2xl font-semibold tracking-[-0.04em]",
                    isPositive && "text-emerald-600",
                    isNegative && "text-rose-600",
                    !isPositive && !isNegative && "text-slate-950",
                  )}
                >
                  {card.valueType === "currency"
                    ? formatCurrency(value, settings.currency)
                    : String(value)}
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(108,77,255,0.09)] text-[var(--accent)]">
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
