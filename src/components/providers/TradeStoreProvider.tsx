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

import { seedTrades } from "@/lib/mock-data";
import type {
  Trade,
  TradeInput,
  TradeSetup,
  TradeSide,
  TradeStatus,
} from "@/lib/trade-types";

export const TRADE_STORAGE_KEY = "trade-journal-trades-v1";

interface TradeStoreContextValue {
  trades: Trade[];
  addTrade: (trade: TradeInput) => void;
  updateTrade: (id: string, trade: TradeInput) => void;
  deleteTrade: (id: string) => void;
  replaceTrades: (trades: Trade[]) => void;
  clearTrades: () => void;
  resetTradesToSeed: () => void;
}

const TradeStoreContext = createContext<TradeStoreContextValue | null>(null);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTradeSide(value: unknown): value is TradeSide {
  return value === "long" || value === "short";
}

function isTradeSetup(value: unknown): value is TradeSetup {
  return (
    value === "trendFollowing" ||
    value === "breakout" ||
    value === "scalping" ||
    value === "meanReversion" ||
    value === "other"
  );
}

function isTradeStatus(value: unknown): value is TradeStatus {
  return value === "closed";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isTrade(value: unknown): value is Trade {
  if (!isRecord(value)) {
    return false;
  }

  const tags = value.tags;

  return (
    typeof value.id === "string" &&
    typeof value.closedAt === "string" &&
    typeof value.symbol === "string" &&
    isTradeSide(value.side) &&
    isTradeSetup(value.setup) &&
    isNumber(value.entryPrice) &&
    isNumber(value.exitPrice) &&
    isNumber(value.riskPercent) &&
    isNumber(value.pnl) &&
    isNumber(value.rMultiple) &&
    (value.playbookId === undefined || typeof value.playbookId === "string") &&
    isTradeStatus(value.status) &&
    (value.notes === undefined || typeof value.notes === "string") &&
    (tags === undefined ||
      (Array.isArray(tags) && tags.every((tag) => typeof tag === "string")))
  );
}

function parseStoredTrades(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every(isTrade) ? parsed : null;
  } catch {
    return null;
  }
}

function createTradeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `trade-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeTradeInput(trade: TradeInput): TradeInput {
  return {
    ...trade,
    symbol: trade.symbol.trim().toUpperCase(),
    playbookId: trade.playbookId?.trim() || undefined,
    status: "closed",
    notes: trade.notes?.trim() || undefined,
    tags: trade.tags
      ?.map((tag) => tag.trim())
      .filter((tag) => tag.length > 0),
  };
}

function persistTrades(trades: Trade[]) {
  window.localStorage.setItem(TRADE_STORAGE_KEY, JSON.stringify(trades));
}

export function TradeStoreProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>(seedTrades);
  const tradesRef = useRef<Trade[]>(seedTrades);

  const commitTrades = useCallback((nextTrades: Trade[]) => {
    tradesRef.current = nextTrades;
    setTrades(nextTrades);
    persistTrades(nextTrades);
  }, []);

  useEffect(() => {
    const storedTrades = parseStoredTrades(
      window.localStorage.getItem(TRADE_STORAGE_KEY),
    );

    if (storedTrades) {
      const timeoutId = window.setTimeout(() => {
        tradesRef.current = storedTrades;
        setTrades(storedTrades);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }

    persistTrades(seedTrades);
  }, []);

  const addTrade = useCallback((trade: TradeInput) => {
    const normalizedTrade = normalizeTradeInput(trade);
    const nextTrades = [
      ...tradesRef.current,
      {
        ...normalizedTrade,
        id: createTradeId(),
      },
    ];

    commitTrades(nextTrades);
  }, [commitTrades]);

  const updateTrade = useCallback((id: string, trade: TradeInput) => {
    const normalizedTrade = normalizeTradeInput(trade);
    const nextTrades = tradesRef.current.map((currentTrade) =>
      currentTrade.id === id
        ? {
            ...normalizedTrade,
            id,
          }
        : currentTrade,
    );

    commitTrades(nextTrades);
  }, [commitTrades]);

  const deleteTrade = useCallback((id: string) => {
    const nextTrades = tradesRef.current.filter((trade) => trade.id !== id);

    commitTrades(nextTrades);
  }, [commitTrades]);

  const replaceTrades = useCallback(
    (nextTrades: Trade[]) => {
      commitTrades([...nextTrades]);
    },
    [commitTrades],
  );

  const clearTrades = useCallback(() => {
    commitTrades([]);
  }, [commitTrades]);

  const resetTradesToSeed = useCallback(() => {
    commitTrades(seedTrades);
  }, [commitTrades]);

  const value = useMemo(
    () => ({
      trades,
      addTrade,
      updateTrade,
      deleteTrade,
      replaceTrades,
      clearTrades,
      resetTradesToSeed,
    }),
    [
      addTrade,
      clearTrades,
      deleteTrade,
      replaceTrades,
      resetTradesToSeed,
      trades,
      updateTrade,
    ],
  );

  return (
    <TradeStoreContext.Provider value={value}>
      {children}
    </TradeStoreContext.Provider>
  );
}

export function useTrades() {
  const context = useContext(TradeStoreContext);

  if (!context) {
    throw new Error("useTrades must be used within TradeStoreProvider");
  }

  return context;
}
