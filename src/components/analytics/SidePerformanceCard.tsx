"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import type { SidePerformanceRow } from "@/lib/analytics-calculations";
import {
  cn,
  formatCurrency,
  formatPercent,
  formatRMultiple,
} from "@/lib/utils";

interface SidePerformanceCardProps {
  rows: SidePerformanceRow[];
}

const sideOrder = ["long", "short"] as const;

export default function SidePerformanceCard({ rows }: SidePerformanceCardProps) {
  const { dictionary: copy } = useLanguage();
  const { settings } = useUserSettings();
  const maxAbsPnl = Math.max(
    ...rows.map((row) => Math.abs(row.netPnl)),
    1,
  );

  return (
    <section className="panel-card p-5 lg:p-6">
      <h2 className="panel-title">{copy.analyticsPage.longVsShort}</h2>

      {rows.length === 0 ? (
        <div className="mt-5 flex min-h-[300px] items-center justify-center rounded-[20px] border border-dashed border-[rgba(148,163,184,0.22)] bg-[rgba(250,250,255,0.72)] text-sm font-medium text-slate-400">
          {copy.analyticsPage.noTradeData}
        </div>
      ) : (
        <div className="mt-5 grid gap-4">
          {sideOrder.map((side) => {
            const row =
              rows.find((sideRow) => sideRow.side === side) ?? {
                side,
                netPnl: 0,
                totalTrades: 0,
                winRate: 0,
                avgR: 0,
              };
            const Icon = side === "long" ? ArrowUpRight : ArrowDownRight;
            const barWidth = `${Math.max((Math.abs(row.netPnl) / maxAbsPnl) * 100, 6)}%`;
            const isPositive = row.netPnl >= 0;

            return (
              <article
                key={side}
                className="rounded-[20px] border border-[rgba(148,163,184,0.14)] bg-[rgba(250,250,255,0.82)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-2xl",
                        side === "long"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-950">
                        {copy.side[side]}
                      </p>
                      <p className="text-sm text-slate-500">
                        {row.totalTrades} {copy.analyticsPage.trades}
                      </p>
                    </div>
                  </div>
                  <p
                    className={cn(
                      "text-xl font-semibold tracking-[-0.03em]",
                      isPositive ? "text-emerald-600" : "text-rose-600",
                    )}
                  >
                    {formatCurrency(row.netPnl, settings.currency)}
                  </p>
                </div>

                <div className="mt-4 h-2.5 rounded-full bg-[rgba(15,23,42,0.06)]">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      isPositive
                        ? "bg-[linear-gradient(90deg,#a7f3d0,#16a34a)]"
                        : "bg-[linear-gradient(90deg,#fecdd3,#e11d48)]",
                    )}
                    style={{ width: barWidth }}
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-400">{copy.metrics.winRate.label}</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {formatPercent(row.winRate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">{copy.analyticsPage.avgR}</p>
                    <p
                      className={cn(
                        "mt-1 font-semibold",
                        row.avgR > 0
                          ? "text-emerald-600"
                          : row.avgR < 0
                            ? "text-rose-600"
                            : "text-slate-900",
                      )}
                    >
                      {formatRMultiple(row.avgR)}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
