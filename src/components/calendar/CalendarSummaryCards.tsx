"use client";

import { CalendarCheck2, CircleCheck, CircleX, LineChart, NotebookTabs } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import StatCard from "@/components/ui/StatCard";
import type { CalendarMonthSummary } from "@/lib/review-calculations";
import { formatCurrency } from "@/lib/utils";

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
          <StatCard
            key={card.key}
            label={copy.calendarPage[card.key]}
            value={
              card.valueType === "currency"
                ? formatCurrency(value, settings.currency)
                : String(value)
            }
            tone={
              isPositive
                ? "positive"
                : isNegative
                  ? "negative"
                  : card.key === "reviewedDays"
                    ? "accent"
                    : "neutral"
            }
            icon={Icon}
            className="min-h-[132px]"
          />
        );
      })}
    </section>
  );
}
