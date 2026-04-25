"use client";

import {
  CheckCircle2,
  CircleMinus,
  Target,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { type ReviewItemData, type ReviewId } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface TodayReviewProps {
  items: ReviewItemData[];
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

export default function TodayReview({ items }: TodayReviewProps) {
  const { dictionary: copy } = useLanguage();

  return (
    <section className="panel-card p-5 lg:p-6">
      <div>
        <h2 className="panel-title">{copy.review.title}</h2>
        <p className="mt-1 text-sm text-slate-500">{copy.reviewDate}</p>
      </div>

      <div className="mt-6 space-y-3">
        {items.map((item) => {
          const Icon = iconMap[item.id];
          const content = copy.review.items[item.id];

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
                    {content.body}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
