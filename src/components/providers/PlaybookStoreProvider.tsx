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
  isPlaybook,
  type Playbook,
  type PlaybookInput,
} from "@/lib/playbook-types";

export const PLAYBOOK_STORAGE_KEY = "trade-journal-playbooks-v1";

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
    return Array.isArray(parsed) && parsed.every(isPlaybook) ? parsed : null;
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

function persistPlaybooks(playbooks: Playbook[]) {
  window.localStorage.setItem(PLAYBOOK_STORAGE_KEY, JSON.stringify(playbooks));
}

export function PlaybookStoreProvider({ children }: { children: ReactNode }) {
  const [playbooks, setPlaybooks] = useState<Playbook[]>(seedPlaybooks);
  const playbooksRef = useRef<Playbook[]>(seedPlaybooks);

  const commitPlaybooks = useCallback((nextPlaybooks: Playbook[]) => {
    const sortedPlaybooks = sortPlaybooks(nextPlaybooks);
    playbooksRef.current = sortedPlaybooks;
    setPlaybooks(sortedPlaybooks);
    persistPlaybooks(sortedPlaybooks);
  }, []);

  useEffect(() => {
    const storedPlaybooks = parseStoredPlaybooks(
      window.localStorage.getItem(PLAYBOOK_STORAGE_KEY),
    );

    if (storedPlaybooks) {
      const timeoutId = window.setTimeout(() => {
        const sortedPlaybooks = sortPlaybooks(storedPlaybooks);
        playbooksRef.current = sortedPlaybooks;
        setPlaybooks(sortedPlaybooks);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }

    persistPlaybooks(seedPlaybooks);
  }, []);

  const addPlaybook = useCallback(
    (input: PlaybookInput) => {
      const now = new Date().toISOString();
      const nextPlaybooks = [
        ...playbooksRef.current,
        {
          ...input,
          id: createPlaybookId(),
          createdAt: now,
          updatedAt: now,
        },
      ];

      commitPlaybooks(nextPlaybooks);
    },
    [commitPlaybooks],
  );

  const updatePlaybook = useCallback(
    (id: string, patch: Partial<PlaybookInput>) => {
      const now = new Date().toISOString();
      const nextPlaybooks = playbooksRef.current.map((playbook) =>
        playbook.id === id
          ? {
              ...playbook,
              ...patch,
              id: playbook.id,
              createdAt: playbook.createdAt,
              updatedAt: now,
            }
          : playbook,
      );

      commitPlaybooks(nextPlaybooks);
    },
    [commitPlaybooks],
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
      commitPlaybooks(
        playbooksRef.current.filter((playbook) => playbook.id !== id),
      );
    },
    [commitPlaybooks],
  );

  const replacePlaybooks = useCallback(
    (nextPlaybooks: Playbook[]) => {
      commitPlaybooks([...nextPlaybooks]);
    },
    [commitPlaybooks],
  );

  const clearPlaybooks = useCallback(() => {
    commitPlaybooks([]);
  }, [commitPlaybooks]);

  const resetPlaybooksToSeed = useCallback(() => {
    commitPlaybooks(seedPlaybooks);
  }, [commitPlaybooks]);

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
