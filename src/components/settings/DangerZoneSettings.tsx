"use client";

import { AlertTriangle, Trash2 } from "lucide-react";

import { useGoals } from "@/components/providers/GoalStoreProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useNotes } from "@/components/providers/NotesStoreProvider";
import { usePeriodReports } from "@/components/providers/PeriodReportStoreProvider";
import { usePlaybooks } from "@/components/providers/PlaybookStoreProvider";
import { useDailyReviews } from "@/components/providers/ReviewStoreProvider";
import { useTrades } from "@/components/providers/TradeStoreProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";

interface DangerActionProps {
  label: string;
  onClick: () => void;
}

function DangerAction({ label, onClick }: DangerActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-12 items-center justify-between gap-4 rounded-[18px] border border-rose-100 bg-white px-4 py-3 text-left text-sm font-semibold text-rose-600 transition-colors hover:border-rose-200 hover:bg-rose-50"
    >
      <span>{label}</span>
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

export default function DangerZoneSettings() {
  const { dictionary: copy } = useLanguage();
  const { clearTrades } = useTrades();
  const { clearDailyReviews } = useDailyReviews();
  const { clearPeriodReports } = usePeriodReports();
  const { clearPlaybooks } = usePlaybooks();
  const { clearNotes } = useNotes();
  const { clearGoals } = useGoals();
  const { resetSettings } = useUserSettings();

  function handleClearTrades() {
    if (window.confirm(copy.settingsPage.clearTradesConfirm)) {
      clearTrades();
    }
  }

  function handleClearDailyReviews() {
    if (window.confirm(copy.settingsPage.clearDailyReviewsConfirm)) {
      clearDailyReviews();
    }
  }

  function handleClearPeriodReports() {
    if (window.confirm(copy.settingsPage.clearPeriodReportsConfirm)) {
      clearPeriodReports();
    }
  }

  function handleClearPlaybooks() {
    if (window.confirm(copy.settingsPage.clearPlaybooksConfirm)) {
      clearPlaybooks();
    }
  }

  function handleClearNotes() {
    if (window.confirm(copy.settingsPage.clearNotesConfirm)) {
      clearNotes();
    }
  }

  function handleClearGoals() {
    if (window.confirm(copy.settingsPage.clearGoalsConfirm)) {
      clearGoals();
    }
  }

  function handleClearAllData() {
    if (!window.confirm(copy.settingsPage.clearAllDataConfirm)) {
      return;
    }

    clearTrades();
    clearDailyReviews();
    clearPeriodReports();
    clearPlaybooks();
    clearNotes();
    clearGoals();
    resetSettings();
  }

  return (
    <section className="panel-card border-rose-100 p-5 lg:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <h2 className="panel-title text-rose-600">
            {copy.settingsPage.dangerZone}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {copy.settingsPage.irreversible}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <DangerAction
          label={copy.settingsPage.clearTrades}
          onClick={handleClearTrades}
        />
        <DangerAction
          label={copy.settingsPage.clearDailyReviews}
          onClick={handleClearDailyReviews}
        />
        <DangerAction
          label={copy.settingsPage.clearPeriodReports}
          onClick={handleClearPeriodReports}
        />
        <DangerAction
          label={copy.settingsPage.clearPlaybooks}
          onClick={handleClearPlaybooks}
        />
        <DangerAction
          label={copy.settingsPage.clearNotes}
          onClick={handleClearNotes}
        />
        <DangerAction
          label={copy.settingsPage.clearGoals}
          onClick={handleClearGoals}
        />
        <DangerAction
          label={copy.settingsPage.clearAllData}
          onClick={handleClearAllData}
        />
      </div>
    </section>
  );
}
