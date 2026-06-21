"use client";

import { useState } from "react";

import AnalyticsPage from "@/components/analytics/AnalyticsPage";
import ReportsPage from "@/components/reports/ReportsPage";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { cn } from "@/lib/utils";

type AnalyticsView = "analytics" | "reports";

const views: AnalyticsView[] = ["analytics", "reports"];

export default function AnalyticsWorkspace() {
  const { dictionary: copy } = useLanguage();
  const [view, setView] = useState<AnalyticsView>("analytics");

  return (
    <>
      <div className="inline-flex w-fit rounded-full border border-white/10 bg-[rgba(2,6,23,0.34)] p-1">
        {views.map((item) => {
          const isActive = view === item;
          const label =
            item === "analytics"
              ? copy.analyticsPage.tabAnalytics
              : copy.analyticsPage.tabReports;

          return (
            <button
              key={item}
              type="button"
              onClick={() => setView(item)}
              aria-pressed={isActive}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-all",
                isActive
                  ? "bg-[linear-gradient(135deg,rgba(124,92,255,0.38),rgba(34,211,238,0.18))] text-white shadow-[0_8px_20px_rgba(124,92,255,0.20)]"
                  : "text-slate-400 hover:text-slate-50",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {view === "analytics" ? <AnalyticsPage /> : <ReportsPage />}
    </>
  );
}
