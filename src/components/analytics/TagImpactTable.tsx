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
import type { TagImpactRow } from "@/lib/analytics-calculations";
import {
  cn,
  formatCurrency,
  formatPercent,
  formatRMultiple,
} from "@/lib/utils";

interface TagImpactTableProps {
  rows: TagImpactRow[];
}

export default function TagImpactTable({ rows }: TagImpactTableProps) {
  const { dictionary: copy } = useLanguage();
  const { settings } = useUserSettings();
  const displayRows = rows.slice(0, 8);

  return (
    <Card as="section">
      <SectionHeader title={copy.analyticsPage.tagImpact} />

      {displayRows.length === 0 ? (
        <EmptyState title={copy.analyticsPage.noTagData} className="mt-5 min-h-[300px]" />
      ) : (
        <DataTable minWidth={680} className="mt-5">
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
              {displayRows.map((row) => (
                <tr key={row.tag} className="group">
                  <td className={dataTableCellClassName}>
                    <Badge variant="purple">{row.tag}</Badge>
                  </td>
                  <td className={dataTableCellClassName}>
                    {row.totalTrades}
                  </td>
                  <td
                    className={cn(
                      dataTableCellClassName,
                      "font-semibold",
                      row.netPnl >= 0 ? "text-emerald-600" : "text-rose-600",
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
    </Card>
  );
}
