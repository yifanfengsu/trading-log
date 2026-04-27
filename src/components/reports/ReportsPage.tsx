"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import ReportBreakdownCards from "@/components/reports/ReportBreakdownCards";
import ReportEditor from "@/components/reports/ReportEditor";
import ReportFilters from "@/components/reports/ReportFilters";
import ReportPreview from "@/components/reports/ReportPreview";
import ReportSummaryCards from "@/components/reports/ReportSummaryCards";
import ReportTopTrades from "@/components/reports/ReportTopTrades";
import SavedReportsList from "@/components/reports/SavedReportsList";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { usePeriodReports } from "@/components/providers/PeriodReportStoreProvider";
import { useDailyReviews } from "@/components/providers/ReviewStoreProvider";
import { useTrades } from "@/components/providers/TradeStoreProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import PageHeader from "@/components/ui/PageHeader";
import {
  buildSuggestedReportText,
  filterReviewsByDateRange,
  filterTradesByDateRange,
  getDailyReportBreakdown,
  getDefaultReportSelection,
  getReportRange,
  getReportStats,
  getReportTopTrades,
  getSetupReportBreakdown,
  getTagReportBreakdown,
} from "@/lib/report-calculations";
import { generateReportMarkdown } from "@/lib/report-markdown";
import type {
  PeriodReport,
  ReportPeriodType,
  SuggestedReportText,
} from "@/lib/report-types";
import {
  formatDateRange,
  getCurrentMonthKey,
  getCurrentWeekKey,
  formatMonthLabel,
  formatWeekLabel,
} from "@/lib/utils";

const emptyManualReport: SuggestedReportText = {
  summary: "",
  keyWins: "",
  keyMistakes: "",
  lessons: "",
  nextActions: "",
};

function createPeriodReportId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `period-report-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getSavedReportText(report: PeriodReport): SuggestedReportText {
  return {
    summary: report.summary,
    keyWins: report.keyWins,
    keyMistakes: report.keyMistakes,
    lessons: report.lessons,
    nextActions: report.nextActions,
  };
}

async function writeTextToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the textarea fallback.
    }
  }

  if (typeof document === "undefined") {
    return false;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    return document.execCommand("copy");
  } finally {
    textarea.remove();
  }
}

export default function ReportsPage() {
  const { dictionary: copy, locale } = useLanguage();
  const { trades } = useTrades();
  const { settings } = useUserSettings();
  const { dailyReviews } = useDailyReviews();
  const { periodReports, getReport, upsertReport, deleteReport } =
    usePeriodReports();
  const defaultSelection = useMemo(
    () => getDefaultReportSelection(),
    [],
  );
  const [periodType, setPeriodType] = useState<ReportPeriodType>(
    defaultSelection.periodType,
  );
  const [periodKey, setPeriodKey] = useState(defaultSelection.periodKey);
  const [manualReport, setManualReport] =
    useState<SuggestedReportText>(emptyManualReport);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const selectionTouchedRef = useRef(false);
  const copyTimerRef = useRef<number | null>(null);
  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!selectionTouchedRef.current) {
      setPeriodType(defaultSelection.periodType);
      setPeriodKey(defaultSelection.periodKey);
    }
  }, [defaultSelection.periodKey, defaultSelection.periodType]);

  useEffect(
    () => () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }

      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
    },
    [],
  );

  const range = useMemo(
    () => getReportRange(periodType, periodKey),
    [periodKey, periodType],
  );
  const rangeLabel = useMemo(
    () => formatDateRange(range.startDate, range.endDate, locale),
    [locale, range.endDate, range.startDate],
  );
  const reportTrades = useMemo(
    () => filterTradesByDateRange(trades, range.startDate, range.endDate),
    [range.endDate, range.startDate, trades],
  );
  const reportReviews = useMemo(
    () =>
      filterReviewsByDateRange(dailyReviews, range.startDate, range.endDate),
    [dailyReviews, range.endDate, range.startDate],
  );
  const stats = useMemo(
    () => getReportStats(reportTrades, reportReviews, settings.startingBalance),
    [reportReviews, reportTrades, settings.startingBalance],
  );
  const dailyBreakdown = useMemo(
    () => getDailyReportBreakdown(reportTrades, reportReviews),
    [reportReviews, reportTrades],
  );
  const setupBreakdown = useMemo(
    () => getSetupReportBreakdown(reportTrades),
    [reportTrades],
  );
  const tagBreakdown = useMemo(
    () => getTagReportBreakdown(reportTrades),
    [reportTrades],
  );
  const topTrades = useMemo(
    () => getReportTopTrades(reportTrades),
    [reportTrades],
  );
  const savedReport = getReport(periodType, periodKey);
  const suggestions = useMemo(
    () =>
      buildSuggestedReportText(
        stats,
        {
          setupBreakdown,
          tagBreakdown,
        },
        locale,
        settings.currency,
      ),
    [locale, setupBreakdown, settings.currency, stats, tagBreakdown],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setManualReport(savedReport ? getSavedReportText(savedReport) : suggestions);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [periodKey, periodType, savedReport, suggestions]);

  function getDefaultReportTitle() {
    if (periodType === "weekly") {
      return locale === "zh"
        ? `${formatWeekLabel(periodKey, locale)}${copy.reportsPage.tradingWeeklyReport}`
        : `${formatWeekLabel(periodKey, locale)} ${copy.reportsPage.tradingWeeklyReport}`;
    }

    return locale === "zh"
      ? `${formatMonthLabel(periodKey, locale)}${copy.reportsPage.tradingMonthlyReport}`
      : `${formatMonthLabel(periodKey, locale)} ${copy.reportsPage.tradingMonthlyReport}`;
  }

  function generateMarkdown() {
    return generateReportMarkdown({
      locale,
      periodType,
      periodKey,
      startDate: range.startDate,
      endDate: range.endDate,
      stats,
      setupBreakdown,
      tagBreakdown,
      dailyBreakdown,
      topWinners: topTrades.topWinners,
      topLosers: topTrades.topLosers,
      manualReport,
      currency: settings.currency,
    });
  }

  function markSaved() {
    setIsSaved(true);

    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      setIsSaved(false);
      saveTimerRef.current = null;
    }, 1500);
  }

  function markCopied() {
    setIsCopied(true);

    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }

    copyTimerRef.current = window.setTimeout(() => {
      setIsCopied(false);
      copyTimerRef.current = null;
    }, 1500);
  }

  function handlePeriodTypeChange(nextPeriodType: ReportPeriodType) {
    if (nextPeriodType === periodType) {
      return;
    }

    selectionTouchedRef.current = true;
    setPeriodType(nextPeriodType);
    setPeriodKey(
      nextPeriodType === "weekly"
        ? getCurrentWeekKey()
        : getCurrentMonthKey(),
    );
  }

  function handlePeriodKeyChange(nextPeriodKey: string) {
    if (!nextPeriodKey) {
      return;
    }

    selectionTouchedRef.current = true;
    setPeriodKey(nextPeriodKey);
  }

  function handleSaveReport() {
    const now = new Date().toISOString();
    const report: PeriodReport = {
      id: savedReport?.id ?? createPeriodReportId(),
      periodType,
      periodKey,
      startDate: range.startDate,
      endDate: range.endDate,
      title: getDefaultReportTitle(),
      summary: manualReport.summary,
      keyWins: manualReport.keyWins,
      keyMistakes: manualReport.keyMistakes,
      lessons: manualReport.lessons,
      nextActions: manualReport.nextActions,
      createdAt: savedReport?.createdAt ?? now,
      updatedAt: now,
    };

    upsertReport(report);
    markSaved();
  }

  async function handleCopyMarkdown() {
    const didCopy = await writeTextToClipboard(generateMarkdown());

    if (didCopy) {
      markCopied();
    }
  }

  function handleDownloadMarkdown() {
    const markdown = generateMarkdown();
    const blob = new Blob([markdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `trade-report-${periodType}-${periodKey}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function handleOpenSavedReport(report: PeriodReport) {
    selectionTouchedRef.current = true;
    setPeriodType(report.periodType);
    setPeriodKey(report.periodKey);
  }

  return (
    <>
      <PageHeader
        title={copy.reportsPage.title}
        description={copy.reportsPage.subtitle}
      />

      <ReportFilters
        periodType={periodType}
        periodKey={periodKey}
        rangeLabel={rangeLabel}
        saveLabel={isSaved ? copy.reportsPage.saved : copy.reportsPage.saveReport}
        copyLabel={
          isCopied ? copy.reportsPage.copied : copy.reportsPage.copyMarkdown
        }
        onPeriodTypeChange={handlePeriodTypeChange}
        onPeriodKeyChange={handlePeriodKeyChange}
        onSave={handleSaveReport}
        onCopyMarkdown={handleCopyMarkdown}
        onDownloadMarkdown={handleDownloadMarkdown}
      />

      <ReportSummaryCards stats={stats} />

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.25fr)_minmax(380px,0.8fr)]">
        <ReportPreview
          periodType={periodType}
          rangeLabel={rangeLabel}
          stats={stats}
          setupBreakdown={setupBreakdown}
          tagBreakdown={tagBreakdown}
          topWinners={topTrades.topWinners}
          topLosers={topTrades.topLosers}
          manualReport={manualReport}
        />
        <ReportEditor
          value={manualReport}
          onChange={setManualReport}
          onUseSuggestions={() => setManualReport(suggestions)}
          onClear={() => setManualReport(emptyManualReport)}
        />
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
        <ReportBreakdownCards
          dailyBreakdown={dailyBreakdown}
          setupBreakdown={setupBreakdown}
          tagBreakdown={tagBreakdown}
        />
        <ReportTopTrades
          topWinners={topTrades.topWinners}
          topLosers={topTrades.topLosers}
        />
      </section>

      <SavedReportsList
        reports={periodReports}
        onOpen={handleOpenSavedReport}
        onDelete={deleteReport}
      />
    </>
  );
}
