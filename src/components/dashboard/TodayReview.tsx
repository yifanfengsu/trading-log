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
            <Badge variant="purple" className="h-8 px-3">
              {copy.calendarPage.editReview}
            </Badge>
          </Link>
        }
      />

      {/* Neutral tiles — the number carries the win/loss colour. Previously
          every tile was wrapped in green regardless of sign, so a losing day
          still read as green at a glance. */}
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {pnlItems.map((item) => (
          <div
            key={item.label}
            className="rounded-[var(--radius-inner)] border border-[var(--inner-border)] bg-[var(--card-strong)] px-3 py-2.5"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--weak)]">
              {item.label}
            </p>
            <p
              className={cn(
                "mt-1 text-[17px] font-semibold tabular-nums",
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

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = iconMap[item.id];
          const content = copy.review.items[item.id];
          const body = savedReviewItems
            ? savedReviewItems[item.id] || "—"
            : content.body;

          return (
            <article
              key={item.id}
              className="rounded-[var(--radius-inner)] border border-[var(--inner-border)] bg-[var(--card-strong)] p-3 transition-colors hover:border-[var(--card-border-hover)]"
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] ring-1 ring-inset",
                    toneClasses[item.tone].wrapper,
                  )}
                >
                  <Icon
                    className={cn("h-4 w-4", toneClasses[item.tone].icon)}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-100">
                    {content.label}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-5 text-slate-400">
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
