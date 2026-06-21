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

async function fetchReports(): Promise<PeriodReport[]> {
  const response = await fetch("/api/reports");

  if (!response.ok) {
    throw new Error(`GET /api/reports failed with status ${response.status}`);
  }

  const data: unknown = await response.json();
  return Array.isArray(data) ? (data as PeriodReport[]) : [];
}

// One-time import of legacy localStorage reports into SQLite. Runs only when the
// migration flag is unset (checked here) and the database is empty (checked by
// the caller). The flag is recorded even when there is no legacy data so the
// check never runs again — the marker, not "database empty", is the real gate.
async function migrateLegacyReportsIfNeeded(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  if (window.localStorage.getItem(REPORT_MIGRATION_FLAG_KEY)) {
    return false;
  }

  const legacyReports = parseStoredReports(
    window.localStorage.getItem(PERIOD_REPORT_STORAGE_KEY),
  );

  if (!legacyReports || legacyReports.length === 0) {
    window.localStorage.setItem(
      REPORT_MIGRATION_FLAG_KEY,
      new Date().toISOString(),
    );
    return false;
  }

  try {
    const response = await fetch("/api/reports/import", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(legacyReports),
    });

    if (!response.ok) {
      throw new Error(`import failed with status ${response.status}`);
    }

    window.localStorage.setItem(
      REPORT_MIGRATION_FLAG_KEY,
      new Date().toISOString(),
    );

    return true;
  } catch (error) {
    console.error("[reports] migration from localStorage failed", error);
    return false;
  }
}

export function PeriodReportStoreProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [periodReports, setPeriodReports] = useState<PeriodReport[]>([]);
  const reportsRef = useRef<PeriodReport[]>([]);

  const applyReports = useCallback((nextReports: PeriodReport[]) => {
    const sortedReports = sortReports(nextReports);
    reportsRef.current = sortedReports;
    setPeriodReports(sortedReports);
  }, []);

  const persist = useCallback(
    async (
      request: () => Promise<Response>,
      previousReports: PeriodReport[],
      label: string,
    ) => {
      try {
        const response = await request();

        if (!response.ok) {
          throw new Error(`${label} failed with status ${response.status}`);
        }
      } catch (error) {
        console.error(`[reports] ${label} failed — rolling back`, error);
        applyReports(previousReports);
      }
    },
    [applyReports],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        let serverReports = await fetchReports();

        if (serverReports.length === 0) {
          const migrated = await migrateLegacyReportsIfNeeded();

          if (migrated) {
            serverReports = await fetchReports();
          }
        }

        if (!cancelled) {
          applyReports(serverReports);
        }
      } catch (error) {
        console.error("[reports] failed to load from API", error);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [applyReports]);

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
    [applyReports, persist],
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
    [applyReports, persist],
  );

  const replacePeriodReports = useCallback(
    (nextReports: PeriodReport[]) => {
      const previousReports = reportsRef.current;
      const snapshot = [...nextReports];

      applyReports(snapshot);

      void persist(
        () =>
          fetch("/api/reports/import", {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify(snapshot),
          }),
        previousReports,
        "POST /api/reports/import (replace)",
      );
    },
    [applyReports, persist],
  );

  const clearPeriodReports = useCallback(() => {
    const previousReports = reportsRef.current;

    applyReports([]);

    void persist(
      () =>
        fetch("/api/reports/import", {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify([]),
        }),
      previousReports,
      "POST /api/reports/import (clear)",
    );
  }, [applyReports, persist]);

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
