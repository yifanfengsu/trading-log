import type { BackupFile } from "@/lib/backup-types";
import { isValidDateKey } from "@/lib/calendar-utils";
import { normalizeGoals, type Goal } from "@/lib/goal-types";
import { isFiniteNumber, isRecord, isStringArray } from "@/lib/guards";
import { normalizeNotes, type Note } from "@/lib/note-types";
import { normalizePlaybooks, type Playbook } from "@/lib/playbook-types";
import {
  isDailyReviewScore,
  isReviewEmotion,
  type DailyReview,
} from "@/lib/review-types";
import type { PeriodReport, ReportPeriodType } from "@/lib/report-types";
import {
  DEFAULT_USER_SETTINGS,
  normalizeUserSettings,
  type UserSettings,
} from "@/lib/settings-types";
import {
  isTradeSetup,
  isTradeSide,
  isTradeStatus,
  type Trade,
} from "@/lib/trade-types";

interface CreateBackupParams {
  settings: UserSettings;
  trades: Trade[];
  dailyReviews: DailyReview[];
  periodReports: PeriodReport[];
  playbooks: Playbook[];
  notes: Note[];
  goals: Goal[];
}

type BackupShell = {
  app: "trade-journal";
  version: 1;
  exportedAt: string;
  data: Record<string, unknown>;
};

function isIsoDateTime(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
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
    isFiniteNumber(value.entryPrice) &&
    isFiniteNumber(value.exitPrice) &&
    isFiniteNumber(value.riskPercent) &&
    isFiniteNumber(value.pnl) &&
    isFiniteNumber(value.rMultiple) &&
    (value.playbookId === undefined || typeof value.playbookId === "string") &&
    isTradeStatus(value.status) &&
    (value.notes === undefined || typeof value.notes === "string") &&
    (value.tags === undefined || isStringArray(value.tags))
  );
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

function normalizeArray<T>(
  value: unknown,
  guard: (item: unknown) => item is T,
): T[] | null {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) && value.every(guard) ? value : null;
}

function isBackupShell(value: unknown): value is BackupShell {
  if (!isRecord(value)) {
    return false;
  }

  const data = value.data;

  if (!isRecord(data)) {
    return false;
  }

  return (
    value.app === "trade-journal" &&
    value.version === 1 &&
    isIsoDateTime(value.exportedAt)
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

    if (!isBackupShell(parsed)) {
      return null;
    }

    const settings =
      parsed.data.settings === undefined
        ? DEFAULT_USER_SETTINGS
        : normalizeUserSettings(parsed.data.settings);
    const trades = normalizeArray(parsed.data.trades, isTrade);
    const dailyReviews = normalizeArray(
      parsed.data.dailyReviews,
      isDailyReview,
    );
    const periodReports = normalizeArray(
      parsed.data.periodReports,
      isPeriodReport,
    );
    const playbooks = normalizePlaybooks(parsed.data.playbooks ?? []);
    const notes = normalizeNotes(parsed.data.notes ?? []);
    const goals = normalizeGoals(parsed.data.goals ?? []);

    if (
      settings === null ||
      trades === null ||
      dailyReviews === null ||
      periodReports === null ||
      playbooks === null ||
      notes === null ||
      goals === null
    ) {
      return null;
    }

    return {
      app: parsed.app,
      version: parsed.version,
      exportedAt: parsed.exportedAt,
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
