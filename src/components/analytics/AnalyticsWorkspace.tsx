"use client";

import { useState } from "react";

import AnalyticsPage from "@/components/analytics/AnalyticsPage";
import ReportsPage from "@/components/reports/ReportsPage";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { cn } from "@/lib/utils";

type AnalyticsView = "analytics" | "reports";

const views: AnalyticsView[] = ["analytics", "reports"];

interface AnalyticsWorkspaceProps {
  // Initial tab, derived from the ?view= query param by the route (defaults to
  // "analytics"). /reports redirects here with ?view=reports.
  initialView?: AnalyticsView;
}

export default function AnalyticsWorkspace({
  initialView = "analytics",
}: AnalyticsWorkspaceProps) {
  const { dictionary: copy } = useLanguage();
  const [view, setView] = useState<AnalyticsView>(initialView);

  return (
    <>
      <div className="inline-flex w-fit rounded-full border border-white/10 bg-[rgba(0,0,0,0.34)] p-1">
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
                  ? "bg-[var(--accent)] text-[#0a0b0a]"
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
