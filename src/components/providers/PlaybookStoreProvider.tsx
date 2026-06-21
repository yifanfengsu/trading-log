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

import { seedPlaybooks } from "@/lib/playbook-seed";
import {
  normalizePlaybooks,
  type Playbook,
  type PlaybookInput,
} from "@/lib/playbook-types";

// Legacy localStorage key — only read once, during the one-time migration into
// SQLite. Playbooks are now persisted server-side via /api/playbooks.
export const PLAYBOOK_STORAGE_KEY = "trade-journal-playbooks-v1";

// Set in localStorage after the legacy playbooks have been imported into SQLite
// so the migration never runs twice. The legacy data itself is left in place.
const PLAYBOOK_MIGRATION_FLAG_KEY = "playbooks-migrated-to-sqlite";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

interface PlaybookStoreContextValue {
  playbooks: Playbook[];
  addPlaybook: (input: PlaybookInput) => void;
  updatePlaybook: (id: string, patch: Partial<PlaybookInput>) => void;
  archivePlaybook: (id: string) => void;
  restorePlaybook: (id: string) => void;
  deletePlaybook: (id: string) => void;
  replacePlaybooks: (playbooks: Playbook[]) => void;
  clearPlaybooks: () => void;
  resetPlaybooksToSeed: () => void;
  getPlaybookById: (id: string) => Playbook | undefined;
}

const PlaybookStoreContext = createContext<PlaybookStoreContextValue | null>(
  null,
);

function parseStoredPlaybooks(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return normalizePlaybooks(parsed);
  } catch {
    return null;
  }
}

function createPlaybookId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `playbook-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function sortPlaybooks(playbooks: Playbook[]) {
  return [...playbooks].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

async function fetchPlaybooks(): Promise<Playbook[]> {
  const response = await fetch("/api/playbooks");

  if (!response.ok) {
    throw new Error(`GET /api/playbooks failed with status ${response.status}`);
  }

  const data: unknown = await response.json();
  return Array.isArray(data) ? (data as Playbook[]) : [];
}

// One-time import of legacy localStorage playbooks into SQLite. Runs only when
// the migration flag is unset (checked here) and the database is empty (checked
// by the caller). The flag is recorded even when there is no legacy data so the
// check never runs again — the marker, not "database empty", is the real gate.
async function migrateLegacyPlaybooksIfNeeded(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  if (window.localStorage.getItem(PLAYBOOK_MIGRATION_FLAG_KEY)) {
    return false;
  }

  const legacyPlaybooks = parseStoredPlaybooks(
    window.localStorage.getItem(PLAYBOOK_STORAGE_KEY),
  );

  if (!legacyPlaybooks || legacyPlaybooks.length === 0) {
    window.localStorage.setItem(
      PLAYBOOK_MIGRATION_FLAG_KEY,
      new Date().toISOString(),
    );
    return false;
  }

  try {
    const response = await fetch("/api/playbooks/import", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(legacyPlaybooks),
    });

    if (!response.ok) {
      throw new Error(`import failed with status ${response.status}`);
    }

    window.localStorage.setItem(
      PLAYBOOK_MIGRATION_FLAG_KEY,
      new Date().toISOString(),
    );

    return true;
  } catch (error) {
    console.error("[playbooks] migration from localStorage failed", error);
    return false;
  }
}

export function PlaybookStoreProvider({ children }: { children: ReactNode }) {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const playbooksRef = useRef<Playbook[]>([]);

  const applyPlaybooks = useCallback((nextPlaybooks: Playbook[]) => {
    const sortedPlaybooks = sortPlaybooks(nextPlaybooks);
    playbooksRef.current = sortedPlaybooks;
    setPlaybooks(sortedPlaybooks);
  }, []);

  const persist = useCallback(
    async (
      request: () => Promise<Response>,
      previousPlaybooks: Playbook[],
      label: string,
    ) => {
      try {
        const response = await request();

        if (!response.ok) {
          throw new Error(`${label} failed with status ${response.status}`);
        }
      } catch (error) {
        console.error(`[playbooks] ${label} failed — rolling back`, error);
        applyPlaybooks(previousPlaybooks);
      }
    },
    [applyPlaybooks],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        let serverPlaybooks = await fetchPlaybooks();

        if (serverPlaybooks.length === 0) {
          const migrated = await migrateLegacyPlaybooksIfNeeded();

          if (migrated) {
            serverPlaybooks = await fetchPlaybooks();
          }
        }

        if (!cancelled) {
          applyPlaybooks(serverPlaybooks);
        }
      } catch (error) {
        console.error("[playbooks] failed to load from API", error);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [applyPlaybooks]);

  const addPlaybook = useCallback(
    (input: PlaybookInput) => {
      const now = new Date().toISOString();
      const nextPlaybook: Playbook = {
        ...input,
        id: createPlaybookId(),
        createdAt: now,
        updatedAt: now,
      };
      const previousPlaybooks = playbooksRef.current;

      applyPlaybooks([...previousPlaybooks, nextPlaybook]);

      void persist(
        () =>
          fetch("/api/playbooks", {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify(nextPlaybook),
          }),
        previousPlaybooks,
        "POST /api/playbooks",
      );
    },
    [applyPlaybooks, persist],
  );

  const updatePlaybook = useCallback(
    (id: string, patch: Partial<PlaybookInput>) => {
      const existingPlaybook = playbooksRef.current.find(
        (playbook) => playbook.id === id,
      );

      if (!existingPlaybook) {
        return;
      }

      const now = new Date().toISOString();
      const nextPlaybook: Playbook = {
        ...existingPlaybook,
        ...patch,
        id: existingPlaybook.id,
        createdAt: existingPlaybook.createdAt,
        updatedAt: now,
      };
      const previousPlaybooks = playbooksRef.current;

      applyPlaybooks(
        previousPlaybooks.map((playbook) =>
          playbook.id === id ? nextPlaybook : playbook,
        ),
      );

      void persist(
        () =>
          fetch(`/api/playbooks/${id}`, {
            method: "PUT",
            headers: JSON_HEADERS,
            body: JSON.stringify(nextPlaybook),
          }),
        previousPlaybooks,
        `PUT /api/playbooks/${id}`,
      );
    },
    [applyPlaybooks, persist],
  );

  const archivePlaybook = useCallback(
    (id: string) => {
      updatePlaybook(id, { status: "archived" });
    },
    [updatePlaybook],
  );

  const restorePlaybook = useCallback(
    (id: string) => {
      updatePlaybook(id, { status: "active" });
    },
    [updatePlaybook],
  );

  const deletePlaybook = useCallback(
    (id: string) => {
      const previousPlaybooks = playbooksRef.current;

      applyPlaybooks(
        previousPlaybooks.filter((playbook) => playbook.id !== id),
      );

      void persist(
        () => fetch(`/api/playbooks/${id}`, { method: "DELETE" }),
        previousPlaybooks,
        `DELETE /api/playbooks/${id}`,
      );
    },
    [applyPlaybooks, persist],
  );

  const replacePlaybooks = useCallback(
    (nextPlaybooks: Playbook[]) => {
      const previousPlaybooks = playbooksRef.current;
      const snapshot = [...nextPlaybooks];

      applyPlaybooks(snapshot);

      void persist(
        () =>
          fetch("/api/playbooks/import", {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify(snapshot),
          }),
        previousPlaybooks,
        "POST /api/playbooks/import (replace)",
      );
    },
    [applyPlaybooks, persist],
  );

  const clearPlaybooks = useCallback(() => {
    const previousPlaybooks = playbooksRef.current;

    applyPlaybooks([]);

    void persist(
      () =>
        fetch("/api/playbooks/import", {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify([]),
        }),
      previousPlaybooks,
      "POST /api/playbooks/import (clear)",
    );
  }, [applyPlaybooks, persist]);

  const resetPlaybooksToSeed = useCallback(() => {
    const previousPlaybooks = playbooksRef.current;
    const snapshot = [...seedPlaybooks];

    applyPlaybooks(snapshot);

    void persist(
      () =>
        fetch("/api/playbooks/import", {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify(snapshot),
        }),
      previousPlaybooks,
      "POST /api/playbooks/import (reset)",
    );
  }, [applyPlaybooks, persist]);

  const getPlaybookById = useCallback(
    (id: string) => playbooks.find((playbook) => playbook.id === id),
    [playbooks],
  );

  const value = useMemo(
    () => ({
      playbooks,
      addPlaybook,
      updatePlaybook,
      archivePlaybook,
      restorePlaybook,
      deletePlaybook,
      replacePlaybooks,
      clearPlaybooks,
      resetPlaybooksToSeed,
      getPlaybookById,
    }),
    [
      addPlaybook,
      archivePlaybook,
      clearPlaybooks,
      deletePlaybook,
      getPlaybookById,
      playbooks,
      replacePlaybooks,
      resetPlaybooksToSeed,
      restorePlaybook,
      updatePlaybook,
    ],
  );

  return (
    <PlaybookStoreContext.Provider value={value}>
      {children}
    </PlaybookStoreContext.Provider>
  );
}

export function usePlaybooks() {
  const context = useContext(PlaybookStoreContext);

  if (!context) {
    throw new Error("usePlaybooks must be used within PlaybookStoreProvider");
  }

  return context;
}
