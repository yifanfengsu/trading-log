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
import ProgressBar from "@/components/ui/ProgressBar";
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
        <EmptyState title={copy.emptyState} className="mt-4 min-h-[220px]" />
      ) : (
        <DataTable minWidth={400} className="mt-4">
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
              <th className={cn(dataTableHeadCellClassName, "text-right")}>
                {copy.strategyPerformance.profitFactor}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
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
                      <div className="min-w-[84px]">
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="font-semibold text-slate-100">
                            {formatPercent(row.winRate)}
                          </span>
                        </div>
                        <ProgressBar
                          className="mt-1.5"
                          value={row.winRate}
                          size="sm"
                        />
                      </div>
                    </td>
                    {/* Number only — a second progress bar next to the win-rate
                        one added noise without adding information, and it was
                        what pushed the table past the card's width. */}
                    <td className={cn(dataTableCellClassName, "text-right")}>
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
