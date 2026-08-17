"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import { useCollectionStore } from "@/components/providers/use-collection-store";
import { isFiniteNumber, isRecord } from "@/lib/guards";
import { getSeedTrades } from "@/lib/mock-data";
import {
  isTradeSetup,
  isTradeSide,
  isTradeStatus,
  type Trade,
  type TradeInput,
} from "@/lib/trade-types";

// Legacy localStorage key — only read once, during the one-time migration into
// SQLite. Trades are now persisted server-side via /api/trades.
export const TRADE_STORAGE_KEY = "trade-journal-trades-v1";

// Set in localStorage after the legacy trades have been imported into SQLite so
// the migration never runs twice. The legacy data itself is left in place as a
// safety net.
const TRADE_MIGRATION_FLAG_KEY = "trades-migrated-to-sqlite";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

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
    isFiniteNumber(value.entryPrice) &&
    isFiniteNumber(value.exitPrice) &&
    isFiniteNumber(value.riskPercent) &&
    isFiniteNumber(value.pnl) &&
    isFiniteNumber(value.rMultiple) &&
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

const collectionConfig = {
  name: "trades",
  basePath: "/api/trades",
  seed: getSeedTrades,
  legacy: {
    storageKey: TRADE_STORAGE_KEY,
    migrationFlagKey: TRADE_MIGRATION_FLAG_KEY,
    parse: parseStoredTrades,
  },
};

export function TradeStoreProvider({ children }: { children: ReactNode }) {
  const {
    items: trades,
    itemsRef: tradesRef,
    apply: applyTrades,
    persist,
    replace: replaceTrades,
    clear: clearTrades,
    reset: resetTradesToSeed,
  } = useCollectionStore<Trade>(collectionConfig);

  const addTrade = useCallback(
    (trade: TradeInput) => {
      const newTrade: Trade = {
        ...normalizeTradeInput(trade),
        id: createTradeId(),
      };
      const previousTrades = tradesRef.current;

      applyTrades([...previousTrades, newTrade]);

      void persist(
        () =>
          fetch("/api/trades", {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify(newTrade),
          }),
        previousTrades,
        "POST /api/trades",
      );
    },
    [applyTrades, persist, tradesRef],
  );

  const updateTrade = useCallback(
    (id: string, trade: TradeInput) => {
      const updatedTrade: Trade = { ...normalizeTradeInput(trade), id };
      const previousTrades = tradesRef.current;

      applyTrades(
        previousTrades.map((currentTrade) =>
          currentTrade.id === id ? updatedTrade : currentTrade,
        ),
      );

      void persist(
        () =>
          fetch(`/api/trades/${id}`, {
            method: "PUT",
            headers: JSON_HEADERS,
            body: JSON.stringify(updatedTrade),
          }),
        previousTrades,
        `PUT /api/trades/${id}`,
      );
    },
    [applyTrades, persist, tradesRef],
  );

  const deleteTrade = useCallback(
    (id: string) => {
      const previousTrades = tradesRef.current;

      applyTrades(previousTrades.filter((trade) => trade.id !== id));

      void persist(
        () => fetch(`/api/trades/${id}`, { method: "DELETE" }),
        previousTrades,
        `DELETE /api/trades/${id}`,
      );
    },
    [applyTrades, persist, tradesRef],
  );

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
