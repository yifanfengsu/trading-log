import type { BackupFile } from "@/lib/backup-types";
import { isValidDateKey } from "@/lib/calendar-utils";
import { normalizeGoals, type Goal } from "@/lib/goal-types";
import { normalizeNotes, type Note } from "@/lib/note-types";
import { isPlaybook, type Playbook } from "@/lib/playbook-types";
import type { DailyReview, DailyReviewScore, ReviewEmotion } from "@/lib/review-types";
import type { PeriodReport, ReportPeriodType } from "@/lib/report-types";
import {
  isTradeSetup,
  isTradeSide,
  normalizeUserSettings,
  type UserSettings,
} from "@/lib/settings-types";
import type { Trade, TradeStatus } from "@/lib/trade-types";

interface CreateBackupParams {
  settings: UserSettings;
  trades: Trade[];
  dailyReviews: DailyReview[];
  periodReports: PeriodReport[];
  playbooks: Playbook[];
  notes: Note[];
  goals: Goal[];
}

type BackupFileWithOptionalCollections = Omit<BackupFile, "data"> & {
  data: Omit<BackupFile["data"], "playbooks" | "notes" | "goals"> & {
    playbooks?: Playbook[];
    notes?: Note[];
    goals?: Goal[];
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isIsoDateTime(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isTradeStatus(value: unknown): value is TradeStatus {
  return value === "closed";
}

function isTrade(value: unknown): value is Trade {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.closedAt === "string" &&
    typeof value.symbol === "string" &&
    isTradeSide(value.side) &&
    isTradeSetup(value.setup) &&
    isNumber(value.entryPrice) &&
    isNumber(value.exitPrice) &&
    isNumber(value.riskPercent) &&
    isNumber(value.pnl) &&
    isNumber(value.rMultiple) &&
    (value.playbookId === undefined || typeof value.playbookId === "string") &&
    isTradeStatus(value.status) &&
    (value.notes === undefined || typeof value.notes === "string") &&
    (value.tags === undefined || isStringArray(value.tags))
  );
}

function isReviewEmotion(value: unknown): value is ReviewEmotion {
  return (
    value === "calm" ||
    value === "confident" ||
    value === "anxious" ||
    value === "greedy" ||
    value === "frustrated" ||
    value === "tired" ||
    value === "neutral"
  );
}

function isDailyReviewScore(value: unknown): value is DailyReviewScore {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

function isDailyReview(value: unknown): value is DailyReview {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.date === "string" &&
    isValidDateKey(value.date) &&
    typeof value.rulesFollowed === "string" &&
    typeof value.mainMistake === "string" &&
    typeof value.marketCondition === "string" &&
    typeof value.tomorrowFocus === "string" &&
    isReviewEmotion(value.emotion) &&
    isDailyReviewScore(value.score) &&
    (value.notes === undefined || typeof value.notes === "string") &&
    typeof value.updatedAt === "string"
  );
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

function isBackupFile(value: unknown): value is BackupFileWithOptionalCollections {
  if (!isRecord(value)) {
    return false;
  }

  const data = value.data;

  if (!isRecord(data)) {
    return false;
  }

  const settings = normalizeUserSettings(data.settings);

  return (
    value.app === "trade-journal" &&
    value.version === 1 &&
    isIsoDateTime(value.exportedAt) &&
    settings !== null &&
    Array.isArray(data.trades) &&
    data.trades.every(isTrade) &&
    Array.isArray(data.dailyReviews) &&
    data.dailyReviews.every(isDailyReview) &&
    Array.isArray(data.periodReports) &&
    data.periodReports.every(isPeriodReport) &&
    (data.playbooks === undefined ||
      (Array.isArray(data.playbooks) && data.playbooks.every(isPlaybook))) &&
    (data.notes === undefined || normalizeNotes(data.notes) !== null) &&
    (data.goals === undefined || normalizeGoals(data.goals) !== null)
  );
}

export function createBackupFile({
  settings,
  trades,
  dailyReviews,
  periodReports,
  playbooks,
  notes,
  goals,
}: CreateBackupParams): BackupFile {
  return {
    app: "trade-journal",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      settings,
      trades,
      dailyReviews,
      periodReports,
      playbooks,
      notes,
      goals,
    },
  };
}

export function serializeBackup(backup: BackupFile): string {
  return JSON.stringify(backup, null, 2);
}

export function parseBackupJson(json: string): BackupFile | null {
  try {
    const parsed: unknown = JSON.parse(json);

    if (!isBackupFile(parsed)) {
      return null;
    }

    return {
      ...parsed,
      data: {
        ...parsed.data,
        settings: normalizeUserSettings(parsed.data.settings) ?? parsed.data.settings,
        playbooks: parsed.data.playbooks ?? [],
        notes: normalizeNotes(parsed.data.notes ?? []) ?? [],
        goals: normalizeGoals(parsed.data.goals ?? []) ?? [],
      },
    };
  } catch {
    return null;
  }
}

export function getBackupSummary(backup: BackupFile) {
  return {
    tradesCount: backup.data.trades.length,
    dailyReviewsCount: backup.data.dailyReviews.length,
    periodReportsCount: backup.data.periodReports.length,
    playbooksCount: backup.data.playbooks.length,
    notesCount: backup.data.notes.length,
    goalsCount: backup.data.goals.length,
    exportedAt: backup.exportedAt,
  };
}

export function getBackupFileName() {
  return `trade-journal-backup-${new Date().toISOString().slice(0, 10)}.json`;
}
