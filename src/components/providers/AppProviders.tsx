"use client";

import type { ReactNode } from "react";

import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { ReviewStoreProvider } from "@/components/providers/ReviewStoreProvider";
import { SelectedMonthProvider } from "@/components/providers/SelectedMonthProvider";
import { TradeDrawerProvider } from "@/components/providers/TradeDrawerProvider";
import { TradeStoreProvider } from "@/components/providers/TradeStoreProvider";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <TradeStoreProvider>
        <ReviewStoreProvider>
          <SelectedMonthProvider>
            <TradeDrawerProvider>{children}</TradeDrawerProvider>
          </SelectedMonthProvider>
        </ReviewStoreProvider>
      </TradeStoreProvider>
    </LanguageProvider>
  );
}
