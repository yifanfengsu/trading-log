"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import { useCollectionStore } from "@/components/providers/use-collection-store";
import { isValidDateKey } from "@/lib/calendar-utils";
import { isRecord } from "@/lib/guards";
import type { PeriodReport, ReportPeriodType } from "@/lib/report-types";

// Legacy localStorage key — only read once, during the one-time migration into
// SQLite. Reports are now persisted server-side via /api/reports.
export const PERIOD_REPORT_STORAGE_KEY = "trade-journal-period-reports-v1";

// Set in localStorage after the legacy reports have been imported into SQLite so
// the migration never runs twice. The legacy data itself is left in place.
const REPORT_MIGRATION_FLAG_KEY = "reports-migrated-to-sqlite";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

interface PeriodReportStoreContextValue {
  periodReports: PeriodReport[];
  getReport: (
    periodType: ReportPeriodType,
    periodKey: string,
  ) => PeriodReport | undefined;
  upsertReport: (report: PeriodReport) => void;
  deleteReport: (id: string) => void;
  replacePeriodReports: (reports: PeriodReport[]) => void;
  clearPeriodReports: () => void;
  reloadPeriodReports: () => Promise<void>;
}

const PeriodReportStoreContext =
  createContext<PeriodReportStoreContextValue | null>(null);

function isReportPeriodType(value: unknown): value is ReportPeriodType {
  return value === "weekly" || value === "monthly";
}

function isPeriodKey(periodType: ReportPeriodType, value: unknown) {
  if (typeof value !== "string") {
    return false;
  }

  return periodType === "weekly"
    ? /^\d{4}-W\d{2}$/.test(value)
    : /^\d{4}-\d{2}$/.test(value);
}

function isPeriodReport(value: unknown): value is PeriodReport {
  if (!isRecord(value) || !isReportPeriodType(value.periodType)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    isPeriodKey(value.periodType, value.periodKey) &&
    typeof value.startDate === "string" &&
    isValidDateKey(value.startDate) &&
    typeof value.endDate === "string" &&
    isValidDateKey(value.endDate) &&
    typeof value.title === "string" &&
    typeof value.summary === "string" &&
    typeof value.keyWins === "string" &&
    typeof value.keyMistakes === "string" &&
    typeof value.lessons === "string" &&
    typeof value.nextActions === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function parseStoredReports(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every(isPeriodReport) ? parsed : null;
  } catch {
    return null;
  }
}

function sortReports(reports: PeriodReport[]) {
  return [...reports].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

const collectionConfig = {
  name: "reports",
  basePath: "/api/reports",
  sort: sortReports,
  legacy: {
    storageKey: PERIOD_REPORT_STORAGE_KEY,
    migrationFlagKey: REPORT_MIGRATION_FLAG_KEY,
    parse: parseStoredReports,
  },
};

export function PeriodReportStoreProvider({
  children,
}: {
  children: ReactNode;
}) {
  const {
    items: periodReports,
    itemsRef: reportsRef,
    apply: applyReports,
    persist,
    reload: reloadPeriodReports,
    replace: replacePeriodReports,
    clear: clearPeriodReports,
  } = useCollectionStore<PeriodReport>(collectionConfig);

  const getReport = useCallback(
    (periodType: ReportPeriodType, periodKey: string) =>
      periodReports.find(
        (report) =>
          report.periodType === periodType && report.periodKey === periodKey,
      ),
    [periodReports],
  );

  const upsertReport = useCallback(
    (report: PeriodReport) => {
      const previousReports = reportsRef.current;
      const hasExistingReport = previousReports.some(
        (currentReport) =>
          currentReport.id === report.id ||
          (currentReport.periodType === report.periodType &&
            currentReport.periodKey === report.periodKey),
      );
      const nextReports = hasExistingReport
        ? previousReports.map((currentReport) =>
            currentReport.id === report.id ||
            (currentReport.periodType === report.periodType &&
              currentReport.periodKey === report.periodKey)
              ? report
              : currentReport,
          )
        : [...previousReports, report];

      applyReports(nextReports);

      void persist(
        () =>
          fetch("/api/reports", {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify(report),
          }),
        previousReports,
        "POST /api/reports",
      );
    },
    [applyReports, persist, reportsRef],
  );

  const deleteReport = useCallback(
    (id: string) => {
      const previousReports = reportsRef.current;

      applyReports(
        previousReports.filter((currentReport) => currentReport.id !== id),
      );

      void persist(
        () => fetch(`/api/reports/${id}`, { method: "DELETE" }),
        previousReports,
        `DELETE /api/reports/${id}`,
      );
    },
    [applyReports, persist, reportsRef],
  );

  const value = useMemo(
    () => ({
      periodReports,
      getReport,
      upsertReport,
      deleteReport,
      replacePeriodReports,
      clearPeriodReports,
      reloadPeriodReports,
    }),
    [
      clearPeriodReports,
      deleteReport,
      getReport,
      periodReports,
      reloadPeriodReports,
      replacePeriodReports,
      upsertReport,
    ],
  );

  return (
    <PeriodReportStoreContext.Provider value={value}>
      {children}
    </PeriodReportStoreContext.Provider>
  );
}

export function usePeriodReports() {
  const context = useContext(PeriodReportStoreContext);

  if (!context) {
    throw new Error(
      "usePeriodReports must be used within PeriodReportStoreProvider",
    );
  }

  return context;
}
