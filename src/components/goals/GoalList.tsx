"use client";

import GoalCard from "@/components/goals/GoalCard";
import GoalsEmptyState from "@/components/goals/GoalsEmptyState";
import type { Goal, GoalProgress } from "@/lib/goal-types";

interface GoalListProps {
  goals: Goal[];
  progressByGoalId: Record<string, GoalProgress>;
  onCreate: () => void;
  onView: (goal: Goal) => void;
  onEdit: (goal: Goal) => void;
  onPause: (goal: Goal) => void;
  onResume: (goal: Goal) => void;
  onComplete: (goal: Goal) => void;
  onArchive: (goal: Goal) => void;
  onRestore: (goal: Goal) => void;
}

const fallbackProgress: GoalProgress = {
  currentValue: 0,
  targetValue: 0,
  progressPercent: 0,
  remainingValue: 0,
  achieved: false,
  atRisk: false,
};

export default function GoalList({
  goals,
  progressByGoalId,
  onCreate,
  onView,
  onEdit,
  onPause,
  onResume,
  onComplete,
  onArchive,
  onRestore,
}: GoalListProps) {
  if (goals.length === 0) {
    return <GoalsEmptyState mode="filtered" onCreate={onCreate} />;
  }

  return (
    <section className="grid gap-5 md:grid-cols-2">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          progress={progressByGoalId[goal.id] ?? fallbackProgress}
          onView={onView}
          onEdit={onEdit}
          onPause={onPause}
          onResume={onResume}
          onComplete={onComplete}
          onArchive={onArchive}
          onRestore={onRestore}
        />
      ))}
    </section>
  );
}
