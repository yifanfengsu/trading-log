"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { isValidDateKey } from "@/lib/calendar-utils";
import type {
  PeriodReport,
  ReportPeriodType,
} from "@/lib/report-types";

export const PERIOD_REPORT_STORAGE_KEY = "trade-journal-period-reports-v1";

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
}

const PeriodReportStoreContext =
  createContext<PeriodReportStoreContextValue | null>(null);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

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

function persistReports(reports: PeriodReport[]) {
  window.localStorage.setItem(
    PERIOD_REPORT_STORAGE_KEY,
    JSON.stringify(reports),
  );
}

export function PeriodReportStoreProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [periodReports, setPeriodReports] = useState<PeriodReport[]>([]);
  const reportsRef = useRef<PeriodReport[]>([]);

  const commitReports = useCallback((nextReports: PeriodReport[]) => {
    const sortedReports = sortReports(nextReports);
    reportsRef.current = sortedReports;
    setPeriodReports(sortedReports);
    persistReports(sortedReports);
  }, []);

  useEffect(() => {
    const storedReports = parseStoredReports(
      window.localStorage.getItem(PERIOD_REPORT_STORAGE_KEY),
    );

    if (storedReports) {
      const timeoutId = window.setTimeout(() => {
        const sortedReports = sortReports(storedReports);
        reportsRef.current = sortedReports;
        setPeriodReports(sortedReports);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }

    reportsRef.current = [];
  }, []);

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
      const hasExistingReport = reportsRef.current.some(
        (currentReport) =>
          currentReport.id === report.id ||
          (currentReport.periodType === report.periodType &&
            currentReport.periodKey === report.periodKey),
      );
      const nextReports = hasExistingReport
        ? reportsRef.current.map((currentReport) =>
            currentReport.id === report.id ||
            (currentReport.periodType === report.periodType &&
              currentReport.periodKey === report.periodKey)
              ? report
              : currentReport,
          )
        : [...reportsRef.current, report];

      commitReports(nextReports);
    },
    [commitReports],
  );

  const deleteReport = useCallback(
    (id: string) => {
      commitReports(
        reportsRef.current.filter((currentReport) => currentReport.id !== id),
      );
    },
    [commitReports],
  );

  const replacePeriodReports = useCallback(
    (nextReports: PeriodReport[]) => {
      commitReports([...nextReports]);
    },
    [commitReports],
  );

  const clearPeriodReports = useCallback(() => {
    commitReports([]);
  }, [commitReports]);

  const value = useMemo(
    () => ({
      periodReports,
      getReport,
      upsertReport,
      deleteReport,
      replacePeriodReports,
      clearPeriodReports,
    }),
    [
      clearPeriodReports,
      deleteReport,
      getReport,
      periodReports,
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
