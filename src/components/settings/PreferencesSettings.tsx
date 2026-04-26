"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import {
  currencyOptions,
  DEFAULT_USER_SETTINGS,
  type CurrencyCode,
} from "@/lib/settings-types";
import { cn } from "@/lib/utils";

const inputClass =
  "mt-2 h-11 w-full rounded-2xl border border-[rgba(148,163,184,0.18)] bg-white px-3 text-sm text-slate-900 outline-none transition-colors focus:border-[rgba(108,77,255,0.38)]";

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
    <section className="panel-card p-5 lg:p-6">
      <h2 className="panel-title">{copy.settingsPage.preferences}</h2>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-5">
        <div>
          <p className="text-sm font-medium text-slate-600">
            {copy.settingsPage.language}
          </p>
          <div className="mt-2 inline-flex rounded-full bg-[rgba(108,77,255,0.10)] p-1">
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
                      ? "bg-white text-[var(--accent)] shadow-[0_6px_16px_rgba(108,77,255,0.14)]"
                      : "text-slate-500 hover:text-slate-900",
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
          <select
            value={currency}
            onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
            className={inputClass}
          >
            {currencyOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-600">
          {copy.settingsPage.startingBalance}
          <input
            type="number"
            min="0"
            step="any"
            value={startingBalance}
            onChange={(event) => setStartingBalance(event.target.value)}
            className={inputClass}
          />
        </label>

        {error ? (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[rgba(148,163,184,0.18)] bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
          >
            {copy.settingsPage.resetDefaults}
          </button>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(108,77,255,0.22)] transition-colors hover:bg-[var(--accent-strong)]"
          >
            {isSaved ? copy.reportsPage.saved : copy.settingsPage.saveSettings}
          </button>
        </div>
      </form>
    </section>
  );
}
