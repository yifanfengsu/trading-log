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

import {
  DEFAULT_USER_SETTINGS,
  normalizeUserSettings,
  type UserSettings,
} from "@/lib/settings-types";

// Legacy localStorage key — only read once, during the one-time migration into
// SQLite. Settings are now persisted server-side via /api/settings.
export const USER_SETTINGS_STORAGE_KEY = "trade-journal-settings-v1";

// Set in localStorage after the legacy settings have been imported into SQLite
// so the migration never runs twice. The legacy data itself is left in place.
const SETTINGS_MIGRATION_FLAG_KEY = "settings-migrated-to-sqlite";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

interface UserSettingsContextValue {
  settings: UserSettings;
  updateSettings: (patch: Partial<UserSettings>) => void;
  resetSettings: () => void;
  reloadSettings: () => Promise<void>;
}

const UserSettingsContext = createContext<UserSettingsContextValue | null>(null);

function parseStoredSettings(value: string | null): UserSettings | null {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return normalizeUserSettings(parsed);
  } catch {
    return null;
  }
}

async function fetchSettings(): Promise<UserSettings> {
  const response = await fetch("/api/settings");

  if (!response.ok) {
    throw new Error(`GET /api/settings failed with status ${response.status}`);
  }

  const data: unknown = await response.json();
  return normalizeUserSettings(data) ?? DEFAULT_USER_SETTINGS;
}

// One-time import of legacy localStorage settings into SQLite. Settings are a
// single global row, so "database empty" is detectable only as "no row yet" —
// and because this migration runs on mount before any settings can be written,
// an unset marker already implies an empty table. The marker is therefore a
// sufficient (and primary) gate: once set, the migration never runs again.
async function migrateLegacySettingsIfNeeded(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  if (window.localStorage.getItem(SETTINGS_MIGRATION_FLAG_KEY)) {
    return;
  }

  const legacySettings = parseStoredSettings(
    window.localStorage.getItem(USER_SETTINGS_STORAGE_KEY),
  );

  if (legacySettings) {
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: JSON_HEADERS,
        body: JSON.stringify(legacySettings),
      });

      if (!response.ok) {
        throw new Error(`settings migration failed with status ${response.status}`);
      }
    } catch (error) {
      console.error("[settings] migration from localStorage failed", error);
      // Leave the marker unset so the migration retries on the next load.
      return;
    }
  }

  window.localStorage.setItem(
    SETTINGS_MIGRATION_FLAG_KEY,
    new Date().toISOString(),
  );
}

export function UserSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const settingsRef = useRef<UserSettings>(DEFAULT_USER_SETTINGS);

  // Update the in-memory state (optimistic UI). Persistence happens separately.
  const applySettings = useCallback((nextSettings: UserSettings) => {
    settingsRef.current = nextSettings;
    setSettings(nextSettings);
  }, []);

  const persist = useCallback(
    async (
      request: () => Promise<Response>,
      previousSettings: UserSettings,
      label: string,
    ) => {
      try {
        const response = await request();

        if (!response.ok) {
          throw new Error(`${label} failed with status ${response.status}`);
        }
      } catch (error) {
        console.error(`[settings] ${label} failed — rolling back`, error);
        applySettings(previousSettings);
      }
    },
    [applySettings],
  );

  // Initial load: migrate legacy localStorage settings on the first run, then
  // pull the authoritative settings from SQLite.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        await migrateLegacySettingsIfNeeded();
        const serverSettings = await fetchSettings();

        if (!cancelled) {
          applySettings(serverSettings);
        }
      } catch (error) {
        console.error("[settings] failed to load from API", error);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [applySettings]);

  const updateSettings = useCallback(
    (patch: Partial<UserSettings>) => {
      const previousSettings = settingsRef.current;
      const nextSettings =
        normalizeUserSettings({
          ...previousSettings,
          ...patch,
        }) ?? previousSettings;

      applySettings(nextSettings);

      void persist(
        () =>
          fetch("/api/settings", {
            method: "PUT",
            headers: JSON_HEADERS,
            body: JSON.stringify(nextSettings),
          }),
        previousSettings,
        "PUT /api/settings",
      );
    },
    [applySettings, persist],
  );

  const resetSettings = useCallback(() => {
    const previousSettings = settingsRef.current;

    applySettings(DEFAULT_USER_SETTINGS);

    void persist(
      () =>
        fetch("/api/settings", {
          method: "PUT",
          headers: JSON_HEADERS,
          body: JSON.stringify(DEFAULT_USER_SETTINGS),
        }),
      previousSettings,
      "PUT /api/settings (reset)",
    );
  }, [applySettings, persist]);

  const reloadSettings = useCallback(async () => {
    try {
      const serverSettings = await fetchSettings();
      applySettings(serverSettings);
    } catch (error) {
      console.error("[settings] failed to reload from API", error);
    }
  }, [applySettings]);

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      resetSettings,
      reloadSettings,
    }),
    [reloadSettings, resetSettings, settings, updateSettings],
  );

  return (
    <UserSettingsContext.Provider value={value}>
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings() {
  const context = useContext(UserSettingsContext);

  if (!context) {
    throw new Error("useUserSettings must be used within UserSettingsProvider");
  }

  return context;
}
