"use client";

import Link from "next/link";
import {
  CheckCircle2,
  CircleMinus,
  Target,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useDailyReviews } from "@/components/providers/ReviewStoreProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import SectionHeader from "@/components/ui/SectionHeader";
import { type ReviewItemData, type ReviewId } from "@/lib/mock-data";
import type { PnlPeriodSummary } from "@/lib/trade-calculations";
import { cn, formatCurrency, formatDateLabel } from "@/lib/utils";

interface TodayReviewProps {
  items: ReviewItemData[];
  activeDate: string;
  pnlSummary: PnlPeriodSummary;
}

const iconMap: Record<ReviewId, LucideIcon> = {
  rulesFollowed: CheckCircle2,
  mainMistake: XCircle,
  marketCondition: CircleMinus,
  tomorrowFocus: Target,
};

const toneClasses = {
  positive: {
    wrapper: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    icon: "text-emerald-600",
  },
  negative: {
    wrapper: "bg-rose-50 text-rose-700 ring-rose-100",
    icon: "text-rose-600",
  },
  neutral: {
    wrapper: "bg-slate-100 text-slate-700 ring-slate-200",
    icon: "text-slate-500",
  },
  accent: {
    wrapper:
      "bg-[rgba(108,77,255,0.10)] text-[var(--accent)] ring-[rgba(108,77,255,0.16)]",
    icon: "text-[var(--accent)]",
  },
} as const;

export default function TodayReview({
  items,
  activeDate,
  pnlSummary,
}: TodayReviewProps) {
  const { dictionary: copy, locale } = useLanguage();
  const { settings } = useUserSettings();
  const { getReviewByDate } = useDailyReviews();
  const savedReview = getReviewByDate(activeDate);
  const pnlItems = [
    {
      label: copy.review.pnlSummary.daily,
      value: pnlSummary.dailyPnl,
    },
    {
      label: copy.review.pnlSummary.weekly,
      value: pnlSummary.weeklyPnl,
    },
    {
      label: copy.review.pnlSummary.monthly,
      value: pnlSummary.monthlyPnl,
    },
  ];
  const savedReviewItems: Record<ReviewId, string> | null = savedReview
    ? {
        rulesFollowed: savedReview.rulesFollowed,
        mainMistake: savedReview.mainMistake,
        marketCondition: savedReview.marketCondition,
        tomorrowFocus: savedReview.tomorrowFocus,
      }
    : null;

  return (
    <Card>
      <SectionHeader
        title={copy.review.title}
        description={formatDateLabel(activeDate, locale)}
        action={
          <Link href={`/calendar?date=${activeDate}`} className="inline-flex">
            <Badge variant="purple" className="h-9 px-3">
              {copy.calendarPage.editReview}
            </Badge>
          </Link>
        }
      />

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        {pnlItems.map((item) => (
          <div
            key={item.label}
            className="rounded-[16px] border border-violet-100 bg-violet-50/70 px-3 py-3"
          >
            <p className="text-xs font-medium text-slate-500">{item.label}</p>
            <p
              className={cn(
                "mt-1 text-sm font-semibold",
                item.value > 0 && "text-emerald-600",
                item.value < 0 && "text-rose-600",
                item.value === 0 && "text-slate-700",
              )}
            >
              {formatCurrency(item.value, settings.currency)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {items.map((item) => {
          const Icon = iconMap[item.id];
          const content = copy.review.items[item.id];
          const body = savedReviewItems
            ? savedReviewItems[item.id] || "—"
            : content.body;

          return (
            <article
              key={item.id}
              className="rounded-[18px] border border-[rgba(148,163,184,0.12)] bg-[rgba(250,250,255,0.82)] p-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 ring-inset",
                    toneClasses[item.tone].wrapper,
                  )}
                >
                  <Icon
                    className={cn("h-[18px] w-[18px]", toneClasses[item.tone].icon)}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {content.label}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {body}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </Card>
  );
}
