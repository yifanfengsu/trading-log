"use client";

import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import GoalDetailDrawer from "@/components/goals/GoalDetailDrawer";
import GoalEditorDrawer from "@/components/goals/GoalEditorDrawer";
import GoalList from "@/components/goals/GoalList";
import GoalsEmptyState from "@/components/goals/GoalsEmptyState";
import GoalsSummaryCards from "@/components/goals/GoalsSummaryCards";
import GoalsToolbar from "@/components/goals/GoalsToolbar";
import RiskGuardrailsPanel from "@/components/goals/RiskGuardrailsPanel";
import { useGoals } from "@/components/providers/GoalStoreProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useDailyReviews } from "@/components/providers/ReviewStoreProvider";
import { useTrades } from "@/components/providers/TradeStoreProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import {
  filterGoals,
  getGoalProgress,
  getGoalsSummary,
  getRiskGuardrails,
  type GoalFilters,
} from "@/lib/goal-calculations";
import type { Goal } from "@/lib/goal-types";

type EditorState =
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      goalId: string;
    };

const defaultFilters: GoalFilters = {
  query: "",
  category: "all",
  status: "all",
  metric: "all",
  periodType: "all",
};

export default function GoalsPage() {
  const { dictionary: copy } = useLanguage();
  const {
    goals,
    pauseGoal,
    resumeGoal,
    completeGoal,
    archiveGoal,
    restoreGoal,
    deleteGoal,
    getGoalById,
  } = useGoals();
  const { trades } = useTrades();
  const { dailyReviews } = useDailyReviews();
  const { settings } = useUserSettings();
  const [filters, setFilters] = useState<GoalFilters>(defaultFilters);
  const [detailGoalId, setDetailGoalId] = useState<string | null>(null);
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const progressByGoalId = useMemo(
    () => {
      const progressMap: Record<string, ReturnType<typeof getGoalProgress>> = {};

      for (const goal of goals) {
        progressMap[goal.id] = getGoalProgress(
          goal,
          trades,
          dailyReviews,
          settings.startingBalance,
        );
      }

      return progressMap;
    },
    [dailyReviews, goals, settings.startingBalance, trades],
  );
  const summary = useMemo(
    () =>
      getGoalsSummary(
        goals,
        trades,
        dailyReviews,
        settings.startingBalance,
      ),
    [dailyReviews, goals, settings.startingBalance, trades],
  );
  const filteredGoals = useMemo(
    () =>
      filterGoals(goals, filters).sort((a, b) => {
        const aAtRisk = a.status === "active" && progressByGoalId[a.id]?.atRisk;
        const bAtRisk = b.status === "active" && progressByGoalId[b.id]?.atRisk;

        if (aAtRisk !== bAtRisk) {
          return aAtRisk ? -1 : 1;
        }

        return 0;
      }),
    [filters, goals, progressByGoalId],
  );
  const guardrails = useMemo(
    () =>
      getRiskGuardrails(
        goals,
        trades,
        dailyReviews,
        settings.startingBalance,
      ),
    [dailyReviews, goals, settings.startingBalance, trades],
  );
  const detailGoal = detailGoalId ? getGoalById(detailGoalId) : undefined;
  const editGoal =
    editorState?.mode === "edit" ? getGoalById(editorState.goalId) : undefined;

  function openCreateEditor() {
    setDetailGoalId(null);
    setEditorState({ mode: "create" });
  }

  function openEditEditor(goal: Goal) {
    setDetailGoalId(null);
    setEditorState({ mode: "edit", goalId: goal.id });
  }

  function handlePause(goal: Goal) {
    pauseGoal(goal.id);
  }

  function handleResume(goal: Goal) {
    resumeGoal(goal.id);
  }

  function handleComplete(goal: Goal) {
    completeGoal(goal.id);
  }

  function handleArchive(goal: Goal) {
    archiveGoal(goal.id);
  }

  function handleRestore(goal: Goal) {
    restoreGoal(goal.id);
  }

  function handleDelete(goal: Goal) {
    deleteGoal(goal.id);
    setDetailGoalId(null);
  }

  return (
    <>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-[30px]">
            {copy.goalsPage.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {copy.goalsPage.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateEditor}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(108,77,255,0.22)] transition-colors hover:bg-[var(--accent-strong)]"
        >
          <Plus className="h-4 w-4" />
          {copy.goalsPage.newGoal}
        </button>
      </section>

      <GoalsSummaryCards summary={summary} />

      {goals.length === 0 ? (
        <GoalsEmptyState mode="empty" onCreate={openCreateEditor} />
      ) : (
        <>
          <GoalsToolbar
            filters={filters}
            onFiltersChange={setFilters}
            onReset={() => setFilters(defaultFilters)}
          />

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
            <GoalList
              goals={filteredGoals}
              progressByGoalId={progressByGoalId}
              onCreate={openCreateEditor}
              onView={(goal) => setDetailGoalId(goal.id)}
              onEdit={openEditEditor}
              onPause={handlePause}
              onResume={handleResume}
              onComplete={handleComplete}
              onArchive={handleArchive}
              onRestore={handleRestore}
            />
            <RiskGuardrailsPanel guardrails={guardrails} />
          </section>
        </>
      )}

      {detailGoal ? (
        <GoalDetailDrawer
          goal={detailGoal}
          progress={progressByGoalId[detailGoal.id]}
          trades={trades}
          reviews={dailyReviews}
          onClose={() => setDetailGoalId(null)}
          onEdit={openEditEditor}
          onPause={handlePause}
          onResume={handleResume}
          onComplete={handleComplete}
          onArchive={handleArchive}
          onRestore={handleRestore}
          onDelete={handleDelete}
        />
      ) : null}

      {editorState?.mode === "create" ? (
        <GoalEditorDrawer
          mode="create"
          onClose={() => setEditorState(null)}
        />
      ) : null}

      {editorState?.mode === "edit" && editGoal ? (
        <GoalEditorDrawer
          mode="edit"
          goal={editGoal}
          onClose={() => setEditorState(null)}
        />
      ) : null}
    </>
  );
}
