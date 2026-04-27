"use client";

import {
  BookOpenText,
  Database,
  FileText,
  NotebookPen,
  NotebookTabs,
  Target,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { usePeriodReports } from "@/components/providers/PeriodReportStoreProvider";
import { usePlaybooks } from "@/components/providers/PlaybookStoreProvider";
import { useDailyReviews } from "@/components/providers/ReviewStoreProvider";
import { useTrades } from "@/components/providers/TradeStoreProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useNotes } from "@/components/providers/NotesStoreProvider";
import { useGoals } from "@/components/providers/GoalStoreProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import { formatCurrency } from "@/lib/utils";

interface OverviewItemProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

function OverviewItem({ icon: Icon, label, value }: OverviewItemProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[18px] bg-[rgba(250,250,255,0.88)] px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(108,77,255,0.09)] text-[var(--accent)]">
          <Icon className="h-5 w-5" />
        </div>
        <p className="truncate text-sm font-medium text-slate-500">{label}</p>
      </div>
      <p className="shrink-0 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

export default function StorageOverview() {
  const { dictionary: copy } = useLanguage();
  const { settings } = useUserSettings();
  const { trades } = useTrades();
  const { dailyReviews } = useDailyReviews();
  const { periodReports } = usePeriodReports();
  const { playbooks } = usePlaybooks();
  const { notes } = useNotes();
  const { goals } = useGoals();

  return (
    <section className="panel-card p-5 lg:p-6">
      <h2 className="panel-title">{copy.settingsPage.localDataOverview}</h2>
      <div className="mt-5 grid gap-3">
        <OverviewItem
          icon={Database}
          label={copy.settingsPage.tradesCount}
          value={String(trades.length)}
        />
        <OverviewItem
          icon={NotebookTabs}
          label={copy.settingsPage.dailyReviewsCount}
          value={String(dailyReviews.length)}
        />
        <OverviewItem
          icon={FileText}
          label={copy.settingsPage.periodReportsCount}
          value={String(periodReports.length)}
        />
        <OverviewItem
          icon={BookOpenText}
          label={copy.settingsPage.playbooksCount}
          value={String(playbooks.length)}
        />
        <OverviewItem
          icon={NotebookPen}
          label={copy.settingsPage.notesCount}
          value={String(notes.length)}
        />
        <OverviewItem
          icon={Target}
          label={copy.settingsPage.goalsCount}
          value={String(goals.length)}
        />
        <OverviewItem
          icon={Wallet}
          label={copy.settingsPage.currentCurrency}
          value={settings.currency}
        />
        <OverviewItem
          icon={Wallet}
          label={copy.settingsPage.startingBalance}
          value={formatCurrency(settings.startingBalance, settings.currency)}
        />
      </div>
    </section>
  );
}
