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

export const USER_SETTINGS_STORAGE_KEY = "trade-journal-settings-v1";

interface UserSettingsContextValue {
  settings: UserSettings;
  updateSettings: (patch: Partial<UserSettings>) => void;
  resetSettings: () => void;
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

function persistSettings(settings: UserSettings) {
  window.localStorage.setItem(
    USER_SETTINGS_STORAGE_KEY,
    JSON.stringify(settings),
  );
}

export function UserSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const settingsRef = useRef<UserSettings>(DEFAULT_USER_SETTINGS);

  const commitSettings = useCallback((nextSettings: UserSettings) => {
    settingsRef.current = nextSettings;
    setSettings(nextSettings);
    persistSettings(nextSettings);
  }, []);

  useEffect(() => {
    const storedSettings = parseStoredSettings(
      window.localStorage.getItem(USER_SETTINGS_STORAGE_KEY),
    );

    if (storedSettings) {
      const timeoutId = window.setTimeout(() => {
        settingsRef.current = storedSettings;
        setSettings(storedSettings);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }

    persistSettings(DEFAULT_USER_SETTINGS);
  }, []);

  const updateSettings = useCallback(
    (patch: Partial<UserSettings>) => {
      const nextSettings =
        normalizeUserSettings({
          ...settingsRef.current,
          ...patch,
        }) ?? settingsRef.current;

      commitSettings(nextSettings);
    },
    [commitSettings],
  );

  const resetSettings = useCallback(() => {
    commitSettings(DEFAULT_USER_SETTINGS);
  }, [commitSettings]);

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
      resetSettings,
    }),
    [resetSettings, settings, updateSettings],
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
