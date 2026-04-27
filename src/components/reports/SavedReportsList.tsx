"use client";

import { FileText, Trash2 } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataTable, {
  dataTableCellClassName,
  dataTableHeadCellClassName,
} from "@/components/ui/DataTable";
import EmptyState from "@/components/ui/EmptyState";
import SectionHeader from "@/components/ui/SectionHeader";
import type { PeriodReport } from "@/lib/report-types";
import {
  formatDateTime,
  formatMonthLabel,
  formatWeekLabel,
} from "@/lib/utils";

interface SavedReportsListProps {
  reports: PeriodReport[];
  onOpen: (report: PeriodReport) => void;
  onDelete: (id: string) => void;
}

export default function SavedReportsList({
  reports,
  onOpen,
  onDelete,
}: SavedReportsListProps) {
  const { dictionary: copy, locale } = useLanguage();
  const displayReports = [...reports]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 10);

  function getPeriodLabel(report: PeriodReport) {
    return report.periodType === "weekly"
      ? formatWeekLabel(report.periodKey, locale)
      : formatMonthLabel(report.periodKey, locale);
  }

  function handleDelete(report: PeriodReport) {
    if (window.confirm(copy.reportsPage.deleteConfirm)) {
      onDelete(report.id);
    }
  }

  return (
    <Card as="section">
      <SectionHeader
        title={copy.reportsPage.savedReports}
        action={<Badge variant="purple">{displayReports.length}</Badge>}
      />

      {displayReports.length === 0 ? (
        <EmptyState
          title={copy.reportsPage.noSavedReports}
          icon={FileText}
          className="mt-5 min-h-[220px]"
        />
      ) : (
        <DataTable minWidth={760} className="mt-5">
            <thead>
              <tr>
                <th className={dataTableHeadCellClassName}>
                  {copy.reportsPage.type}
                </th>
                <th className={dataTableHeadCellClassName}>
                  {copy.reportsPage.period}
                </th>
                <th className={dataTableHeadCellClassName}>
                  {copy.reportsPage.titleColumn}
                </th>
                <th className={dataTableHeadCellClassName}>
                  {copy.reportsPage.updated}
                </th>
                <th className={dataTableHeadCellClassName}>
                  {copy.reportsPage.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              {displayReports.map((report) => (
                <tr key={report.id} className="group">
                  <td className={dataTableCellClassName}>
                    <Badge variant="purple">
                      <FileText className="h-4 w-4" />
                      {report.periodType === "weekly"
                        ? copy.reportsPage.weekly
                        : copy.reportsPage.monthly}
                    </Badge>
                  </td>
                  <td className={dataTableCellClassName}>
                    {getPeriodLabel(report)}
                  </td>
                  <td className={`${dataTableCellClassName} max-w-[300px] truncate font-semibold text-slate-900`}>
                    {report.title}
                  </td>
                  <td className={dataTableCellClassName}>
                    {formatDateTime(report.updatedAt, locale)}
                  </td>
                  <td className={dataTableCellClassName}>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        onClick={() => onOpen(report)}
                        variant="outline"
                        size="sm"
                      >
                        {copy.reportsPage.open}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => handleDelete(report)}
                        variant="danger"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                        {copy.reportsPage.delete}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
        </DataTable>
      )}
    </Card>
  );
}
