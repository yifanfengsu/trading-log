"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import {
  DEFAULT_USER_SETTINGS,
  type UserSettings,
} from "@/lib/settings-types";
import type { TradeSetup, TradeSide } from "@/lib/trade-types";

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
    <Card>
      <h2 className="panel-title">{copy.settingsPage.tradeDefaults}</h2>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-5">
        <label className="block text-sm font-medium text-slate-600">
          {copy.settingsPage.defaultSymbol}
          <Input
            type="text"
            value={defaultSymbol}
            onChange={(event) => setDefaultSymbol(event.target.value.toUpperCase())}
            className="mt-2"
            placeholder="BTCUSDT"
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-600">
            {copy.settingsPage.defaultSide}
            <Select
              value={defaultSide}
              onChange={(event) => setDefaultSide(event.target.value as TradeSide)}
              className="mt-2"
            >
              {sideOptions.map((side) => (
                <option key={side} value={side}>
                  {copy.side[side]}
                </option>
              ))}
            </Select>
          </label>

          <label className="block text-sm font-medium text-slate-600">
            {copy.settingsPage.defaultSetup}
            <Select
              value={defaultSetup}
              onChange={(event) =>
                setDefaultSetup(event.target.value as TradeSetup)
              }
              className="mt-2"
            >
              {setupOptions.map((setup) => (
                <option key={setup} value={setup}>
                  {copy.strategies[setup]}
                </option>
              ))}
            </Select>
          </label>
        </div>

        <label className="block text-sm font-medium text-slate-600">
          {copy.settingsPage.defaultRiskPercent}
          <Input
            type="number"
            min="0"
            step="any"
            value={defaultRiskPercent}
            onChange={(event) => setDefaultRiskPercent(event.target.value)}
            className="mt-2"
            placeholder="1"
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
            {isSaved ? copy.reportsPage.saved : copy.settingsPage.saveDefaults}
          </Button>
        </div>
      </form>
    </Card>
  );
}
