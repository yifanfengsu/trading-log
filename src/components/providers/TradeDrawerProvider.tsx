"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import TradeDrawer from "@/components/trades/TradeDrawer";
import type { Trade } from "@/lib/trade-types";

type DrawerState =
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      trade: Trade;
    };

interface TradeDrawerContextValue {
  openCreateTrade: () => void;
  openEditTrade: (trade: Trade) => void;
  closeTradeDrawer: () => void;
}

const TradeDrawerContext = createContext<TradeDrawerContextValue | null>(null);

export function TradeDrawerProvider({ children }: { children: ReactNode }) {
  const [drawerState, setDrawerState] = useState<DrawerState | null>(null);

  const value = useMemo(
    () => ({
      openCreateTrade: () => setDrawerState({ mode: "create" }),
      openEditTrade: (trade: Trade) => setDrawerState({ mode: "edit", trade }),
      closeTradeDrawer: () => setDrawerState(null),
    }),
    [],
  );

  return (
    <TradeDrawerContext.Provider value={value}>
      {children}
      {drawerState ? (
        <TradeDrawer
          mode={drawerState.mode}
          trade={drawerState.mode === "edit" ? drawerState.trade : undefined}
          onClose={() => setDrawerState(null)}
        />
      ) : null}
    </TradeDrawerContext.Provider>
  );
}

export function useTradeDrawer() {
  const context = useContext(TradeDrawerContext);

  if (!context) {
    throw new Error("useTradeDrawer must be used within TradeDrawerProvider");
  }

  return context;
}
