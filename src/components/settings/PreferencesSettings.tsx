"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import {
  currencyOptions,
  DEFAULT_USER_SETTINGS,
  type CurrencyCode,
} from "@/lib/settings-types";
import { cn } from "@/lib/utils";

export default function PreferencesSettings() {
  const { dictionary: copy, locale, setLocale } = useLanguage();
  const { settings, updateSettings, resetSettings } = useUserSettings();
  const [currency, setCurrency] = useState<CurrencyCode>(settings.currency);
  const [startingBalance, setStartingBalance] = useState(
    String(settings.startingBalance),
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setCurrency(settings.currency);
      setStartingBalance(String(settings.startingBalance));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [settings.currency, settings.startingBalance]);

  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    },
    [],
  );

  function markSaved() {
    setIsSaved(true);

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      setIsSaved(false);
      timerRef.current = null;
    }, 1500);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedStartingBalance = Number(startingBalance);

    if (
      startingBalance.trim() === "" ||
      !Number.isFinite(parsedStartingBalance) ||
      parsedStartingBalance < 0
    ) {
      setError(copy.tradeForm.enterValidNumber);
      return;
    }

    updateSettings({
      currency,
      startingBalance: parsedStartingBalance,
    });
    setError(null);
    markSaved();
  }

  function handleReset() {
    if (!window.confirm(copy.settingsPage.resetPreferencesConfirm)) {
      return;
    }

    resetSettings();
    setCurrency(DEFAULT_USER_SETTINGS.currency);
    setStartingBalance(String(DEFAULT_USER_SETTINGS.startingBalance));
    setError(null);
    markSaved();
  }

  return (
    <Card>
      <h2 className="panel-title">{copy.settingsPage.preferences}</h2>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-5">
        <div>
          <p className="text-sm font-medium text-slate-600">
            {copy.settingsPage.language}
          </p>
          <div className="mt-2 inline-flex rounded-full bg-[var(--card-strong)] p-1">
            {(["zh", "en"] as const).map((item) => {
              const isActive = locale === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLocale(item)}
                  aria-pressed={isActive}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-all",
                    isActive
                      ? "bg-[var(--accent)] text-[#0a0b0a]"
                      : "text-slate-500 hover:text-slate-950",
                  )}
                >
                  {copy.language[item]}
                </button>
              );
            })}
          </div>
        </div>

        <label className="block text-sm font-medium text-slate-600">
          {copy.settingsPage.currency}
          <Select
            value={currency}
            onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
            className="mt-2"
          >
            {currencyOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>

        <label className="block text-sm font-medium text-slate-600">
          {copy.settingsPage.startingBalance}
          <Input
            type="number"
            min="0"
            step="any"
            value={startingBalance}
            onChange={(event) => setStartingBalance(event.target.value)}
            className="mt-2"
          />
        </label>

        {error ? (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button
            type="button"
            onClick={handleReset}
            variant="secondary"
          >
            {copy.settingsPage.resetDefaults}
          </Button>
          <Button type="submit">
            {isSaved ? copy.reportsPage.saved : copy.settingsPage.saveSettings}
          </Button>
        </div>
      </form>
    </Card>
  );
}
