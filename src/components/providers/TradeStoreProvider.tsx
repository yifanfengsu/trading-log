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

import { getSeedTrades } from "@/lib/mock-data";
import type {
  Trade,
  TradeInput,
  TradeSetup,
  TradeSide,
  TradeStatus,
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

async function fetchTrades(): Promise<Trade[]> {
  const response = await fetch("/api/trades");

  if (!response.ok) {
    throw new Error(`GET /api/trades failed with status ${response.status}`);
  }

  const data: unknown = await response.json();
  return Array.isArray(data) ? (data as Trade[]) : [];
}

// One-time import of legacy localStorage trades into SQLite. Runs only when the
// database is empty, the migration flag is unset, and valid legacy data exists.
// Returns true when an import succeeded.
async function migrateLegacyTradesIfNeeded(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  if (window.localStorage.getItem(TRADE_MIGRATION_FLAG_KEY)) {
    return false;
  }

  const legacyTrades = parseStoredTrades(
    window.localStorage.getItem(TRADE_STORAGE_KEY),
  );

  if (!legacyTrades || legacyTrades.length === 0) {
    // Nothing to migrate — record the marker so this never runs again. The
    // marker, not "database empty", is the real gate that prevents a future
    // refresh from re-importing stale localStorage after the user clears data.
    window.localStorage.setItem(
      TRADE_MIGRATION_FLAG_KEY,
      new Date().toISOString(),
    );
    return false;
  }

  try {
    const response = await fetch("/api/trades/import", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(legacyTrades),
    });

    if (!response.ok) {
      throw new Error(`import failed with status ${response.status}`);
    }

    // Keep the legacy localStorage data as a backup — only record that the
    // migration has happened.
    window.localStorage.setItem(
      TRADE_MIGRATION_FLAG_KEY,
      new Date().toISOString(),
    );

    return true;
  } catch (error) {
    console.error("[trades] migration from localStorage failed", error);
    return false;
  }
}

export function TradeStoreProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const tradesRef = useRef<Trade[]>([]);

  // Update the in-memory state (optimistic UI). Persistence happens separately
  // through the API helpers below.
  const applyTrades = useCallback((nextTrades: Trade[]) => {
    tradesRef.current = nextTrades;
    setTrades(nextTrades);
  }, []);

  // Run an API write and, on failure, log and roll the in-memory state back to
  // the snapshot captured before the optimistic update. Basic fault tolerance
  // for a single-user local tool.
  const persist = useCallback(
    async (
      request: () => Promise<Response>,
      previousTrades: Trade[],
      label: string,
    ) => {
      try {
        const response = await request();

        if (!response.ok) {
          throw new Error(`${label} failed with status ${response.status}`);
        }
      } catch (error) {
        console.error(`[trades] ${label} failed — rolling back`, error);
        applyTrades(previousTrades);
      }
    },
    [applyTrades],
  );

  // Initial load: pull from SQLite, migrating legacy localStorage data on the
  // first run if the database is still empty.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        let serverTrades = await fetchTrades();

        if (serverTrades.length === 0) {
          const migrated = await migrateLegacyTradesIfNeeded();

          if (migrated) {
            serverTrades = await fetchTrades();
          }
        }

        if (!cancelled) {
          applyTrades(serverTrades);
        }
      } catch (error) {
        console.error("[trades] failed to load from API", error);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [applyTrades]);

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
    [applyTrades, persist],
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
    [applyTrades, persist],
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
    [applyTrades, persist],
  );

  // Bulk replace (backup restore). Goes through the transactional import route.
  const replaceTrades = useCallback(
    (nextTrades: Trade[]) => {
      const previousTrades = tradesRef.current;
      const snapshot = [...nextTrades];

      applyTrades(snapshot);

      void persist(
        () =>
          fetch("/api/trades/import", {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify(snapshot),
          }),
        previousTrades,
        "POST /api/trades/import (replace)",
      );
    },
    [applyTrades, persist],
  );

  const clearTrades = useCallback(() => {
    const previousTrades = tradesRef.current;

    applyTrades([]);

    void persist(
      () =>
        fetch("/api/trades/import", {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify([]),
        }),
      previousTrades,
      "POST /api/trades/import (clear)",
    );
  }, [applyTrades, persist]);

  const resetTradesToSeed = useCallback(() => {
    const seedTrades = getSeedTrades();
    const previousTrades = tradesRef.current;

    applyTrades(seedTrades);

    void persist(
      () =>
        fetch("/api/trades/import", {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify(seedTrades),
        }),
      previousTrades,
      "POST /api/trades/import (reset)",
    );
  }, [applyTrades, persist]);

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
