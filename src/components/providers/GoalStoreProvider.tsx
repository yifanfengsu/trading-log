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

async function fetchGoals(): Promise<Goal[]> {
  const response = await fetch("/api/goals");

  if (!response.ok) {
    throw new Error(`GET /api/goals failed with status ${response.status}`);
  }

  const data: unknown = await response.json();
  return Array.isArray(data) ? (data as Goal[]) : [];
}

// One-time import of legacy localStorage goals into SQLite. Runs only when the
// migration flag is unset (checked here) and the database is empty (checked by
// the caller). The flag is recorded even when there is no legacy data so the
// check never runs again — the marker, not "database empty", is the real gate.
// Returns true when an import actually happened.
async function migrateLegacyGoalsIfNeeded(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  if (window.localStorage.getItem(GOALS_MIGRATION_FLAG_KEY)) {
    return false;
  }

  const legacyGoals = parseStoredGoals(
    window.localStorage.getItem(GOALS_STORAGE_KEY),
  );

  if (!legacyGoals || legacyGoals.length === 0) {
    // Nothing to migrate — record the marker so this never runs again.
    window.localStorage.setItem(
      GOALS_MIGRATION_FLAG_KEY,
      new Date().toISOString(),
    );
    return false;
  }

  try {
    const response = await fetch("/api/goals/import", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(legacyGoals),
    });

    if (!response.ok) {
      throw new Error(`import failed with status ${response.status}`);
    }

    window.localStorage.setItem(
      GOALS_MIGRATION_FLAG_KEY,
      new Date().toISOString(),
    );

    return true;
  } catch (error) {
    console.error("[goals] migration from localStorage failed", error);
    return false;
  }
}

export function GoalStoreProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const goalsRef = useRef<Goal[]>([]);

  // Update the in-memory state (optimistic UI). Persistence happens separately
  // through the API helpers below.
  const applyGoals = useCallback((nextGoals: Goal[]) => {
    const sortedGoals = sortGoals(nextGoals);
    goalsRef.current = sortedGoals;
    setGoals(sortedGoals);
  }, []);

  // Run an API write and, on failure, log and roll the in-memory state back to
  // the snapshot captured before the optimistic update.
  const persist = useCallback(
    async (
      request: () => Promise<Response>,
      previousGoals: Goal[],
      label: string,
    ) => {
      try {
        const response = await request();

        if (!response.ok) {
          throw new Error(`${label} failed with status ${response.status}`);
        }
      } catch (error) {
        console.error(`[goals] ${label} failed — rolling back`, error);
        applyGoals(previousGoals);
      }
    },
    [applyGoals],
  );

  // Initial load: pull from SQLite, migrating legacy localStorage data on the
  // first run if the database is still empty and the marker is unset.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        let serverGoals = await fetchGoals();

        if (serverGoals.length === 0) {
          const migrated = await migrateLegacyGoalsIfNeeded();

          if (migrated) {
            serverGoals = await fetchGoals();
          }
        }

        if (!cancelled) {
          applyGoals(serverGoals);
        }
      } catch (error) {
        console.error("[goals] failed to load from API", error);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [applyGoals]);

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
    [applyGoals, persist],
  );

  const updateGoal = useCallback(
    (id: string, patch: GoalPatch) => {
      const existingGoal = goalsRef.current.find((goal) => goal.id === id);

      if (!existingGoal) {
        return;
      }

      const now = new Date().toISOString();
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
    [applyGoals, persist],
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
    [applyGoals, persist],
  );

  // Bulk replace (backup restore). Goes through the transactional import route.
  const replaceGoals = useCallback(
    (nextGoals: Goal[]) => {
      const previousGoals = goalsRef.current;
      const snapshot = [...nextGoals];

      applyGoals(snapshot);

      void persist(
        () =>
          fetch("/api/goals/import", {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify(snapshot),
          }),
        previousGoals,
        "POST /api/goals/import (replace)",
      );
    },
    [applyGoals, persist],
  );

  const clearGoals = useCallback(() => {
    const previousGoals = goalsRef.current;

    applyGoals([]);

    void persist(
      () =>
        fetch("/api/goals/import", {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify([]),
        }),
      previousGoals,
      "POST /api/goals/import (clear)",
    );
  }, [applyGoals, persist]);

  const resetGoalsToSeed = useCallback(() => {
    const seedGoals = getSeedGoals();
    const previousGoals = goalsRef.current;

    applyGoals(seedGoals);

    void persist(
      () =>
        fetch("/api/goals/import", {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify(seedGoals),
        }),
      previousGoals,
      "POST /api/goals/import (reset)",
    );
  }, [applyGoals, persist]);

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
