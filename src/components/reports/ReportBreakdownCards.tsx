"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import DataTable, {
  dataTableCellClassName,
  dataTableHeadCellClassName,
} from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";
import SectionHeader from "@/components/ui/SectionHeader";
import type {
  DailyReportBreakdownRow,
  SetupReportBreakdownRow,
  TagReportBreakdownRow,
} from "@/lib/report-types";
import {
  cn,
  formatCurrency,
  formatDateTime,
  formatPercent,
  formatRMultiple,
} from "@/lib/utils";

interface ReportBreakdownCardsProps {
  dailyBreakdown: DailyReportBreakdownRow[];
  setupBreakdown: SetupReportBreakdownRow[];
  tagBreakdown: TagReportBreakdownRow[];
}

export default function ReportBreakdownCards({
  dailyBreakdown,
  setupBreakdown,
  tagBreakdown,
}: ReportBreakdownCardsProps) {
  const { dictionary: copy, locale } = useLanguage();
  const { settings } = useUserSettings();

  return (
    <Card as="section">
      <div className="grid gap-7">
        <div>
          <SectionHeader title={copy.reportsPage.dailyBreakdown} />
          {dailyBreakdown.length === 0 ? (
            <div className="mt-4">
              <EmptyState title={copy.reportsPage.noData} className="min-h-[180px]" />
            </div>
          ) : (
            <DataTable minWidth={560} className="mt-4">
                <thead>
                  <tr>
                    <th className={dataTableHeadCellClassName}>
                      {copy.recentTrades.columns.time}
                    </th>
                    <th className={dataTableHeadCellClassName}>
                      {copy.recentTrades.columns.pnl}
                    </th>
                    <th className={dataTableHeadCellClassName}>
                      {copy.analyticsPage.trades}
                    </th>
                    <th className={dataTableHeadCellClassName}>
                      {copy.reportsPage.periodReview}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dailyBreakdown.slice(0, 8).map((row) => (
                    <tr key={row.date} className="group">
                      <td className={dataTableCellClassName}>
                        {formatDateTime(row.date, locale)}
                      </td>
                      <td
                        className={cn(
                          dataTableCellClassName,
                          "font-semibold",
                          row.pnl >= 0 ? "text-emerald-600" : "text-rose-600",
                        )}
                      >
                        {formatCurrency(row.pnl, settings.currency)}
                      </td>
                      <td className={dataTableCellClassName}>
                        {row.trades}
                      </td>
                      <td className={dataTableCellClassName}>
                        <Badge variant={row.reviewed ? "green" : "gray"}>
                          {row.reviewed
                            ? copy.reportsPage.reviewed
                            : copy.reportsPage.notReviewed}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </DataTable>
          )}
        </div>

        <div>
          <SectionHeader title={copy.reportsPage.setupBreakdown} />
          {setupBreakdown.length === 0 ? (
            <div className="mt-4">
              <EmptyState title={copy.reportsPage.noData} className="min-h-[180px]" />
            </div>
          ) : (
            <DataTable minWidth={620} className="mt-4">
                <thead>
                  <tr>
                    <th className={dataTableHeadCellClassName}>
                      {copy.recentTrades.columns.setup}
                    </th>
                    <th className={dataTableHeadCellClassName}>
                      {copy.analyticsPage.trades}
                    </th>
                    <th className={dataTableHeadCellClassName}>
                      {copy.metrics.netPnl.label}
                    </th>
                    <th className={dataTableHeadCellClassName}>
                      {copy.metrics.winRate.label}
                    </th>
                    <th className={dataTableHeadCellClassName}>
                      {copy.analyticsPage.avgR}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {setupBreakdown.slice(0, 8).map((row) => (
                    <tr key={row.setup} className="group">
                      <td className={cn(dataTableCellClassName, "font-semibold text-slate-900")}>
                        {copy.strategies[row.setup]}
                      </td>
                      <td className={dataTableCellClassName}>
                        {row.trades}
                      </td>
                      <td
                        className={cn(
                          dataTableCellClassName,
                          "font-semibold",
                          row.netPnl >= 0
                            ? "text-emerald-600"
                            : "text-rose-600",
                        )}
                      >
                        {formatCurrency(row.netPnl, settings.currency)}
                      </td>
                      <td className={dataTableCellClassName}>
                        {formatPercent(row.winRate)}
                      </td>
                      <td
                        className={cn(
                          dataTableCellClassName,
                          "font-semibold",
                          row.avgR > 0
                            ? "text-emerald-600"
                            : row.avgR < 0
                              ? "text-rose-600"
                              : "text-slate-600",
                        )}
                      >
                        {formatRMultiple(row.avgR)}
                      </td>
                    </tr>
                  ))}
                </tbody>
            </DataTable>
          )}
        </div>

        <div>
          <SectionHeader title={copy.reportsPage.tagBreakdown} />
          {tagBreakdown.length === 0 ? (
            <div className="mt-4">
              <EmptyState title={copy.reportsPage.noData} className="min-h-[180px]" />
            </div>
          ) : (
            <DataTable minWidth={620} className="mt-4">
                <thead>
                  <tr>
                    <th className={dataTableHeadCellClassName}>
                      {copy.analyticsPage.tag}
                    </th>
                    <th className={dataTableHeadCellClassName}>
                      {copy.analyticsPage.trades}
                    </th>
                    <th className={dataTableHeadCellClassName}>
                      {copy.metrics.netPnl.label}
                    </th>
                    <th className={dataTableHeadCellClassName}>
                      {copy.metrics.winRate.label}
                    </th>
                    <th className={dataTableHeadCellClassName}>
                      {copy.analyticsPage.avgR}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tagBreakdown.slice(0, 8).map((row) => (
                    <tr key={row.tag} className="group">
                      <td className={dataTableCellClassName}>
                        <Badge variant="purple">{row.tag}</Badge>
                      </td>
                      <td className={dataTableCellClassName}>
                        {row.trades}
                      </td>
                      <td
                        className={cn(
                          dataTableCellClassName,
                          "font-semibold",
                          row.netPnl >= 0
                            ? "text-emerald-600"
                            : "text-rose-600",
                        )}
                      >
                        {formatCurrency(row.netPnl, settings.currency)}
                      </td>
                      <td className={dataTableCellClassName}>
                        {formatPercent(row.winRate)}
                      </td>
                      <td
                        className={cn(
                          dataTableCellClassName,
                          "font-semibold",
                          row.avgR > 0
                            ? "text-emerald-600"
                            : row.avgR < 0
                              ? "text-rose-600"
                              : "text-slate-600",
                        )}
                      >
                        {formatRMultiple(row.avgR)}
                      </td>
                    </tr>
                  ))}
                </tbody>
            </DataTable>
          )}
        </div>
      </div>
    </Card>
  );
}
