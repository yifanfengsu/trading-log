"use client";

import { ShieldAlert } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
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
    <aside className="panel-card h-fit p-4 lg:p-5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--accent-soft)] text-[var(--accent)] ring-1 ring-inset ring-[rgba(184,241,53,0.24)]">
          <ShieldAlert className="h-4 w-4" />
        </div>
        <h2 className="panel-title">{copy.goalsPage.riskGuardrails}</h2>
      </div>

      {guardrails.length === 0 ? (
        <p className="mt-4 rounded-[var(--radius-inner)] border border-[var(--inner-border)] bg-[var(--card-strong)] px-4 py-8 text-center text-sm font-medium text-slate-400">
          {copy.goalsPage.noActiveRiskGoals}
        </p>
      ) : (
        <div className="mt-4 grid gap-2">
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
                className="rounded-[var(--radius-inner)] border border-[var(--inner-border)] bg-[var(--card-strong)] px-3.5 py-3"
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
                  <Badge
                    variant={
                      status === "normal"
                        ? "green"
                        : status === "warning"
                          ? "amber"
                          : "red"
                    }
                    className="shrink-0"
                  >
                    {status === "normal"
                      ? copy.goalsPage.normal
                      : status === "warning"
                        ? copy.goalsPage.warning
                        : copy.goalsPage.exceeded}
                  </Badge>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
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

                <div className="mt-3">
                  <ProgressBar
                    value={usagePercent}
                    tone={
                      status === "normal"
                        ? "accent"
                        : status === "warning"
                          ? "warning"
                          : "danger"
                    }
                  />
                  <p className="mt-1.5 text-right text-xs font-semibold text-slate-400">
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
