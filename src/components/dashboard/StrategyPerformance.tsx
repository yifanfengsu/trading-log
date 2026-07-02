"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import Card from "@/components/ui/Card";
import DataTable, {
  dataTableCellClassName,
  dataTableHeadCellClassName,
} from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";
import SectionHeader from "@/components/ui/SectionHeader";
import type { StrategyStats } from "@/lib/trade-calculations";
import {
  cn,
  formatCurrency,
  formatPercent,
  formatProfitFactor,
} from "@/lib/utils";

interface StrategyPerformanceProps {
  rows: StrategyStats[];
}

export default function StrategyPerformance({
  rows,
}: StrategyPerformanceProps) {
  const { dictionary: copy } = useLanguage();
  const { settings } = useUserSettings();

  return (
    <Card>
      <SectionHeader
        title={copy.strategyPerformance.title}
        description={copy.strategyPerformance.subtitle}
        action={
          <Link
            href="/analytics"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]"
          >
            {copy.strategyPerformance.viewAll}
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      {rows.length === 0 ? (
        <EmptyState title={copy.emptyState} className="mt-5 min-h-[248px]" />
      ) : (
        <DataTable minWidth={640} className="mt-5">
          <thead>
            <tr className="table-head-row">
              <th className={dataTableHeadCellClassName}>
                {copy.strategyPerformance.strategy}
              </th>
              <th className={dataTableHeadCellClassName}>
                {copy.strategyPerformance.netPnl}
              </th>
              <th className={dataTableHeadCellClassName}>
                {copy.strategyPerformance.winRate}
              </th>
              <th className={dataTableHeadCellClassName}>
                {copy.strategyPerformance.profitFactor}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const winRateWidth = `${Math.min(row.winRate, 100)}%`;
              const factorWidth = `${
                Number.isFinite(row.profitFactor)
                  ? Math.min((row.profitFactor / 2.5) * 100, 100)
                  : 100
              }%`;

                return (
                  <tr key={row.setup} className="table-row-surface">
                    <td className={dataTableCellClassName}>
                      <div className="font-semibold text-slate-100">
                        {copy.strategies[row.setup]}
                      </div>
                    </td>
                    <td
                      className={cn(
                        dataTableCellClassName,
                        "font-semibold",
                        row.netPnl >= 0 ? "text-[var(--success)]" : "text-rose-300",
                      )}
                    >
                      {formatCurrency(row.netPnl, settings.currency)}
                    </td>
                    <td className={dataTableCellClassName}>
                      <div className="min-w-[132px]">
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="font-semibold text-slate-100">
                            {formatPercent(row.winRate)}
                          </span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-[rgba(155,163,155,0.14)]">
                          <div
                            className="h-full rounded-full bg-[var(--accent)]"
                            style={{ width: winRateWidth }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className={dataTableCellClassName}>
                      <div className="min-w-[132px]">
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span
                            className={cn(
                              "font-semibold",
                              row.profitFactor >= 1.5 ||
                              row.profitFactor === Infinity
                                ? "text-[var(--accent)]"
                                : "text-slate-100",
                            )}
                          >
                            {formatProfitFactor(row.profitFactor)}
                          </span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-[rgba(155,163,155,0.14)]">
                          <div
                            className="h-full rounded-full bg-[var(--accent)]"
                            style={{ width: factorWidth }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
            })}
          </tbody>
        </DataTable>
      )}
    </Card>
  );
}
