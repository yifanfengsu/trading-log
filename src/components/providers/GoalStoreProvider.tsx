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

import { getSeedGoals } from "@/lib/goal-seed";
import type { Goal, GoalInput, GoalPatch } from "@/lib/goal-types";
import { normalizeGoals } from "@/lib/goal-types";

export const GOALS_STORAGE_KEY = "trade-journal-goals-v1";

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

function persistGoals(goals: Goal[]) {
  window.localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
}

export function GoalStoreProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const goalsRef = useRef<Goal[]>([]);

  const commitGoals = useCallback((nextGoals: Goal[]) => {
    const normalizedGoals = normalizeGoals(nextGoals) ?? [];
    const sortedGoals = sortGoals(normalizedGoals);
    goalsRef.current = sortedGoals;
    setGoals(sortedGoals);
    persistGoals(sortedGoals);
  }, []);

  useEffect(() => {
    const storedGoals = parseStoredGoals(
      window.localStorage.getItem(GOALS_STORAGE_KEY),
    );

    const nextGoals = storedGoals !== null ? storedGoals : getSeedGoals();

    if (storedGoals === null) {
      persistGoals(sortGoals(nextGoals));
    }

    const timeoutId = window.setTimeout(() => {
      const sortedGoals = sortGoals(nextGoals);
      goalsRef.current = sortedGoals;
      setGoals(sortedGoals);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const addGoal = useCallback(
    (input: GoalInput) => {
      const now = new Date().toISOString();
      const nextGoal: Goal = {
        ...input,
        id: createGoalId(),
        createdAt: now,
        updatedAt: now,
        manualCurrentValue:
          input.metric === "custom" ? input.manualCurrentValue ?? 0 : undefined,
      };

      commitGoals([...goalsRef.current, nextGoal]);
    },
    [commitGoals],
  );

  const updateGoal = useCallback(
    (id: string, patch: GoalPatch) => {
      const now = new Date().toISOString();
      const nextGoals = goalsRef.current.map((goal) =>
        goal.id === id
          ? {
              ...goal,
              ...patch,
              id: goal.id,
              createdAt: goal.createdAt,
              updatedAt: now,
              manualCurrentValue:
                (patch.metric ?? goal.metric) === "custom"
                  ? patch.manualCurrentValue ?? goal.manualCurrentValue ?? 0
                  : undefined,
            }
          : goal,
      );

      commitGoals(nextGoals);
    },
    [commitGoals],
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
      commitGoals(goalsRef.current.filter((goal) => goal.id !== id));
    },
    [commitGoals],
  );

  const replaceGoals = useCallback(
    (nextGoals: Goal[]) => {
      commitGoals([...nextGoals]);
    },
    [commitGoals],
  );

  const clearGoals = useCallback(() => {
    commitGoals([]);
  }, [commitGoals]);

  const resetGoalsToSeed = useCallback(() => {
    commitGoals(getSeedGoals());
  }, [commitGoals]);

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
