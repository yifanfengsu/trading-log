"use client";

import { ShieldAlert } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import type { RiskGuardrail } from "@/lib/goal-calculations";
import { cn, formatGoalValue, formatPercent } from "@/lib/utils";

interface RiskGuardrailsPanelProps {
  guardrails: RiskGuardrail[];
}

function getUsagePercent(currentValue: number, targetValue: number) {
  if (targetValue <= 0) {
    return currentValue > 0 ? 100 : 0;
  }

  if (!Number.isFinite(currentValue)) {
    return 100;
  }

  return Math.min(Math.max((currentValue / targetValue) * 100, 0), 100);
}

export default function RiskGuardrailsPanel({
  guardrails,
}: RiskGuardrailsPanelProps) {
  const { dictionary: copy, locale } = useLanguage();
  const { settings } = useUserSettings();

  return (
    <aside className="panel-card h-fit p-5 lg:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(124,92,255,0.14)] text-violet-200 ring-1 ring-inset ring-[rgba(124,92,255,0.24)]">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <h2 className="panel-title">{copy.goalsPage.riskGuardrails}</h2>
      </div>

      {guardrails.length === 0 ? (
        <p className="mt-5 rounded-[18px] border border-white/10 bg-[rgba(15,23,42,0.42)] px-4 py-8 text-center text-sm font-medium text-slate-400">
          {copy.goalsPage.noActiveRiskGoals}
        </p>
      ) : (
        <div className="mt-5 grid gap-3">
          {guardrails.map(({ goal, progress }) => {
            const usagePercent = getUsagePercent(
              progress.currentValue,
              progress.targetValue,
            );
            const status =
              progress.currentValue > progress.targetValue
                ? "exceeded"
                : usagePercent >= 80
                  ? "warning"
                  : "normal";

            return (
              <article
                key={goal.id}
                className="rounded-[18px] border border-white/10 bg-[rgba(15,23,42,0.46)] px-4 py-4 shadow-[0_12px_28px_rgba(2,6,23,0.22)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="line-clamp-1 text-sm font-semibold text-slate-100">
                      {goal.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {copy.goalMetrics[goal.metric]}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
                      status === "normal" && "bg-emerald-50 text-emerald-700",
                      status === "warning" && "bg-amber-50 text-amber-700",
                      status === "exceeded" && "bg-rose-50 text-rose-600",
                    )}
                  >
                    {status === "normal"
                      ? copy.goalsPage.normal
                      : status === "warning"
                        ? copy.goalsPage.warning
                        : copy.goalsPage.exceeded}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      {copy.goalsPage.current}
                    </p>
                    <p
                      className={cn(
                        "mt-1 font-semibold text-slate-100",
                        status === "exceeded" && "text-rose-300",
                      )}
                    >
                      {formatGoalValue(
                        progress.currentValue,
                        goal.unit,
                        locale,
                        settings.currency,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      {copy.goalsPage.limit}
                    </p>
                    <p className="mt-1 font-semibold text-slate-100">
                      {formatGoalValue(
                        progress.targetValue,
                        goal.unit,
                        locale,
                        settings.currency,
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="h-2.5 overflow-hidden rounded-full bg-[rgba(148,163,184,0.14)]">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        status === "normal" && "bg-emerald-500",
                        status === "warning" && "bg-amber-500",
                        status === "exceeded" && "bg-rose-500",
                      )}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-right text-xs font-semibold text-slate-400">
                    {formatPercent(usagePercent, { digits: 0 })}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </aside>
  );
}
