"use client";

import type { ReactNode } from "react";

import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { PeriodReportStoreProvider } from "@/components/providers/PeriodReportStoreProvider";
import { PlaybookStoreProvider } from "@/components/providers/PlaybookStoreProvider";
import { ReviewStoreProvider } from "@/components/providers/ReviewStoreProvider";
import { SelectedMonthProvider } from "@/components/providers/SelectedMonthProvider";
import { TradeDrawerProvider } from "@/components/providers/TradeDrawerProvider";
import { TradeStoreProvider } from "@/components/providers/TradeStoreProvider";
import { UserSettingsProvider } from "@/components/providers/UserSettingsProvider";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <UserSettingsProvider>
        <TradeStoreProvider>
          <ReviewStoreProvider>
            <PeriodReportStoreProvider>
              <PlaybookStoreProvider>
                <SelectedMonthProvider>
                  <TradeDrawerProvider>{children}</TradeDrawerProvider>
                </SelectedMonthProvider>
              </PlaybookStoreProvider>
            </PeriodReportStoreProvider>
          </ReviewStoreProvider>
        </TradeStoreProvider>
      </UserSettingsProvider>
    </LanguageProvider>
  );
}
