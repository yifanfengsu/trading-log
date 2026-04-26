"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import {
  DEFAULT_USER_SETTINGS,
  type UserSettings,
} from "@/lib/settings-types";
import type { TradeSetup, TradeSide } from "@/lib/trade-types";

const inputClass =
  "mt-2 h-11 w-full rounded-2xl border border-[rgba(148,163,184,0.18)] bg-white px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-300 focus:border-[rgba(108,77,255,0.38)]";

const sideOptions: TradeSide[] = ["long", "short"];
const setupOptions: TradeSetup[] = [
  "trendFollowing",
  "breakout",
  "scalping",
  "meanReversion",
  "other",
];

function getTradeDefaultPatch(): Pick<
  UserSettings,
  "defaultSymbol" | "defaultSide" | "defaultSetup" | "defaultRiskPercent"
> {
  return {
    defaultSymbol: DEFAULT_USER_SETTINGS.defaultSymbol,
    defaultSide: DEFAULT_USER_SETTINGS.defaultSide,
    defaultSetup: DEFAULT_USER_SETTINGS.defaultSetup,
    defaultRiskPercent: DEFAULT_USER_SETTINGS.defaultRiskPercent,
  };
}

export default function TradeDefaultsSettings() {
  const { dictionary: copy } = useLanguage();
  const { settings, updateSettings } = useUserSettings();
  const [defaultSymbol, setDefaultSymbol] = useState(settings.defaultSymbol);
  const [defaultSide, setDefaultSide] = useState<TradeSide>(settings.defaultSide);
  const [defaultSetup, setDefaultSetup] =
    useState<TradeSetup>(settings.defaultSetup);
  const [defaultRiskPercent, setDefaultRiskPercent] = useState(
    String(settings.defaultRiskPercent),
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDefaultSymbol(settings.defaultSymbol);
      setDefaultSide(settings.defaultSide);
      setDefaultSetup(settings.defaultSetup);
      setDefaultRiskPercent(String(settings.defaultRiskPercent));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [
    settings.defaultRiskPercent,
    settings.defaultSetup,
    settings.defaultSide,
    settings.defaultSymbol,
  ]);

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

    const symbol = defaultSymbol.trim().toUpperCase();
    const riskPercent = Number(defaultRiskPercent);

    if (!symbol) {
      setError(copy.tradeForm.enterSymbol);
      return;
    }

    if (
      defaultRiskPercent.trim() === "" ||
      !Number.isFinite(riskPercent) ||
      riskPercent < 0
    ) {
      setError(copy.tradeForm.enterValidNumber);
      return;
    }

    updateSettings({
      defaultSymbol: symbol,
      defaultSide,
      defaultSetup,
      defaultRiskPercent: riskPercent,
    });
    setDefaultSymbol(symbol);
    setError(null);
    markSaved();
  }

  function handleReset() {
    const defaultPatch = getTradeDefaultPatch();

    updateSettings(defaultPatch);
    setDefaultSymbol(defaultPatch.defaultSymbol);
    setDefaultSide(defaultPatch.defaultSide);
    setDefaultSetup(defaultPatch.defaultSetup);
    setDefaultRiskPercent(String(defaultPatch.defaultRiskPercent));
    setError(null);
    markSaved();
  }

  return (
    <section className="panel-card p-5 lg:p-6">
      <h2 className="panel-title">{copy.settingsPage.tradeDefaults}</h2>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-5">
        <label className="block text-sm font-medium text-slate-600">
          {copy.settingsPage.defaultSymbol}
          <input
            type="text"
            value={defaultSymbol}
            onChange={(event) => setDefaultSymbol(event.target.value.toUpperCase())}
            className={inputClass}
            placeholder="BTCUSDT"
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-600">
            {copy.settingsPage.defaultSide}
            <select
              value={defaultSide}
              onChange={(event) => setDefaultSide(event.target.value as TradeSide)}
              className={inputClass}
            >
              {sideOptions.map((side) => (
                <option key={side} value={side}>
                  {copy.side[side]}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-600">
            {copy.settingsPage.defaultSetup}
            <select
              value={defaultSetup}
              onChange={(event) =>
                setDefaultSetup(event.target.value as TradeSetup)
              }
              className={inputClass}
            >
              {setupOptions.map((setup) => (
                <option key={setup} value={setup}>
                  {copy.strategies[setup]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm font-medium text-slate-600">
          {copy.settingsPage.defaultRiskPercent}
          <input
            type="number"
            min="0"
            step="any"
            value={defaultRiskPercent}
            onChange={(event) => setDefaultRiskPercent(event.target.value)}
            className={inputClass}
            placeholder="1"
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
            {isSaved ? copy.reportsPage.saved : copy.settingsPage.saveDefaults}
          </button>
        </div>
      </form>
    </section>
  );
}
