"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import { useCollectionStore } from "@/components/providers/use-collection-store";
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

const collectionConfig = {
  name: "playbooks",
  basePath: "/api/playbooks",
  sort: sortPlaybooks,
  seed: () => [...seedPlaybooks],
  legacy: {
    storageKey: PLAYBOOK_STORAGE_KEY,
    migrationFlagKey: PLAYBOOK_MIGRATION_FLAG_KEY,
    parse: parseStoredPlaybooks,
  },
};

export function PlaybookStoreProvider({ children }: { children: ReactNode }) {
  const {
    items: playbooks,
    itemsRef: playbooksRef,
    apply: applyPlaybooks,
    persist,
    replace: replacePlaybooks,
    clear: clearPlaybooks,
    reset: resetPlaybooksToSeed,
  } = useCollectionStore<Playbook>(collectionConfig);

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
    [applyPlaybooks, persist, playbooksRef],
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
    [applyPlaybooks, persist, playbooksRef],
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
    [applyPlaybooks, persist, playbooksRef],
  );

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
