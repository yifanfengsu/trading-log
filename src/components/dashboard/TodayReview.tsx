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
    wrapper:
      "bg-[rgba(184,241,53,0.12)] text-[var(--success)] ring-[rgba(184,241,53,0.24)]",
    icon: "text-[var(--success)]",
  },
  negative: {
    wrapper:
      "bg-[rgba(244,63,94,0.12)] text-rose-300 ring-[rgba(244,63,94,0.24)]",
    icon: "text-rose-300",
  },
  neutral: {
    wrapper:
      "bg-[rgba(155,163,155,0.10)] text-slate-300 ring-[rgba(155,163,155,0.18)]",
    icon: "text-slate-400",
  },
  accent: {
    wrapper:
      "bg-[rgba(184,241,53,0.12)] text-[var(--accent)] ring-[rgba(184,241,53,0.26)]",
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
            className="rounded-[16px] border border-[rgba(184,241,53,0.22)] bg-[rgba(184,241,53,0.08)] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
          >
            <p className="text-xs font-medium text-slate-400">{item.label}</p>
            <p
              className={cn(
                "mt-1 text-sm font-semibold",
                item.value > 0 && "text-[var(--success)]",
                item.value < 0 && "text-rose-300",
                item.value === 0 && "text-slate-300",
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
              className="rounded-[18px] border border-white/10 bg-[rgba(30,33,30,0.44)] p-4 transition-colors hover:border-[rgba(184,241,53,0.24)] hover:bg-[rgba(30,33,30,0.62)]"
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
                  <p className="text-sm font-semibold text-slate-100">
                    {content.label}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
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
