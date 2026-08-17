"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import { useCollectionStore } from "@/components/providers/use-collection-store";
import { getSeedGoals } from "@/lib/goal-seed";
import type { Goal, GoalInput, GoalPatch } from "@/lib/goal-types";
import { normalizeGoals } from "@/lib/goal-types";
import { getLocalDateTime } from "@/lib/utils";

// Legacy localStorage key — only read once, during the one-time migration into
// SQLite. Goals are now persisted server-side via /api/goals.
export const GOALS_STORAGE_KEY = "trade-journal-goals-v1";

// Set in localStorage after the legacy goals have been imported into SQLite so
// the migration never runs twice. The legacy data itself is left in place.
const GOALS_MIGRATION_FLAG_KEY = "goals-migrated-to-sqlite";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

interface GoalStoreContextValue {
  goals: Goal[];
  addGoal: (input: GoalInput) => void;
  updateGoal: (id: string, patch: GoalPatch) => void;
  pauseGoal: (id: string) => void;
  resumeGoal: (id: string) => void;
  completeGoal: (id: string) => void;
  archiveGoal: (id: string) => void;
  restoreGoal: (id: string) => void;
  deleteGoal: (id: string) => void;
  replaceGoals: (goals: Goal[]) => void;
  clearGoals: () => void;
  resetGoalsToSeed: () => void;
  reloadGoals: () => Promise<void>;
  getGoalById: (id: string) => Goal | undefined;
}

const GoalStoreContext = createContext<GoalStoreContextValue | null>(null);

function parseStoredGoals(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return normalizeGoals(parsed);
  } catch {
    return null;
  }
}

function createGoalId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `goal-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function sortGoals(goals: Goal[]) {
  return [...goals].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

const collectionConfig = {
  name: "goals",
  basePath: "/api/goals",
  sort: sortGoals,
  seed: getSeedGoals,
  legacy: {
    storageKey: GOALS_STORAGE_KEY,
    migrationFlagKey: GOALS_MIGRATION_FLAG_KEY,
    parse: parseStoredGoals,
  },
};

export function GoalStoreProvider({ children }: { children: ReactNode }) {
  const {
    items: goals,
    itemsRef: goalsRef,
    apply: applyGoals,
    persist,
    reload: reloadGoals,
    replace: replaceGoals,
    clear: clearGoals,
    reset: resetGoalsToSeed,
  } = useCollectionStore<Goal>(collectionConfig);

  const addGoal = useCallback(
    (input: GoalInput) => {
      const now = getLocalDateTime();
      const nextGoal: Goal = {
        ...input,
        id: createGoalId(),
        createdAt: now,
        updatedAt: now,
        manualCurrentValue:
          input.metric === "custom" ? input.manualCurrentValue ?? 0 : undefined,
      };
      const previousGoals = goalsRef.current;

      applyGoals([...previousGoals, nextGoal]);

      void persist(
        () =>
          fetch("/api/goals", {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify(nextGoal),
          }),
        previousGoals,
        "POST /api/goals",
      );
    },
    [applyGoals, persist, goalsRef],
  );

  const updateGoal = useCallback(
    (id: string, patch: GoalPatch) => {
      const existingGoal = goalsRef.current.find((goal) => goal.id === id);

      if (!existingGoal) {
        return;
      }

      const now = getLocalDateTime();
      const nextGoal: Goal = {
        ...existingGoal,
        ...patch,
        id: existingGoal.id,
        createdAt: existingGoal.createdAt,
        updatedAt: now,
        manualCurrentValue:
          (patch.metric ?? existingGoal.metric) === "custom"
            ? patch.manualCurrentValue ?? existingGoal.manualCurrentValue ?? 0
            : undefined,
      };
      const previousGoals = goalsRef.current;

      applyGoals(
        previousGoals.map((goal) => (goal.id === id ? nextGoal : goal)),
      );

      void persist(
        () =>
          fetch(`/api/goals/${id}`, {
            method: "PUT",
            headers: JSON_HEADERS,
            body: JSON.stringify(nextGoal),
          }),
        previousGoals,
        `PUT /api/goals/${id}`,
      );
    },
    [applyGoals, persist, goalsRef],
  );

  const pauseGoal = useCallback(
    (id: string) => {
      updateGoal(id, { status: "paused" });
    },
    [updateGoal],
  );

  const resumeGoal = useCallback(
    (id: string) => {
      updateGoal(id, { status: "active" });
    },
    [updateGoal],
  );

  const completeGoal = useCallback(
    (id: string) => {
      updateGoal(id, { status: "completed" });
    },
    [updateGoal],
  );

  const archiveGoal = useCallback(
    (id: string) => {
      updateGoal(id, { status: "archived" });
    },
    [updateGoal],
  );

  const restoreGoal = useCallback(
    (id: string) => {
      updateGoal(id, { status: "active" });
    },
    [updateGoal],
  );

  const deleteGoal = useCallback(
    (id: string) => {
      const previousGoals = goalsRef.current;

      applyGoals(previousGoals.filter((goal) => goal.id !== id));

      void persist(
        () => fetch(`/api/goals/${id}`, { method: "DELETE" }),
        previousGoals,
        `DELETE /api/goals/${id}`,
      );
    },
    [applyGoals, persist, goalsRef],
  );

  const getGoalById = useCallback(
    (id: string) => goals.find((goal) => goal.id === id),
    [goals],
  );

  const value = useMemo(
    () => ({
      goals,
      addGoal,
      updateGoal,
      pauseGoal,
      resumeGoal,
      completeGoal,
      archiveGoal,
      restoreGoal,
      deleteGoal,
      replaceGoals,
      clearGoals,
      resetGoalsToSeed,
      reloadGoals,
      getGoalById,
    }),
    [
      addGoal,
      archiveGoal,
      clearGoals,
      completeGoal,
      deleteGoal,
      getGoalById,
      goals,
      pauseGoal,
      reloadGoals,
      replaceGoals,
      resetGoalsToSeed,
      restoreGoal,
      resumeGoal,
      updateGoal,
    ],
  );

  return (
    <GoalStoreContext.Provider value={value}>
      {children}
    </GoalStoreContext.Provider>
  );
}

export function useGoals() {
  const context = useContext(GoalStoreContext);

  if (!context) {
    throw new Error("useGoals must be used within GoalStoreProvider");
  }

  return context;
}
