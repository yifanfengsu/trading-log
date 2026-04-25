"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface SelectedMonthContextValue {
  selectedMonth: string;
  setSelectedMonth: (selectedMonth: string) => void;
}

const SelectedMonthContext = createContext<SelectedMonthContextValue | null>(
  null,
);

export function SelectedMonthProvider({ children }: { children: ReactNode }) {
  const [selectedMonth, setSelectedMonth] = useState("2025-05");

  const value = useMemo(
    () => ({
      selectedMonth,
      setSelectedMonth,
    }),
    [selectedMonth],
  );

  return (
    <SelectedMonthContext.Provider value={value}>
      {children}
    </SelectedMonthContext.Provider>
  );
}

export function useSelectedMonth() {
  const context = useContext(SelectedMonthContext);

  if (!context) {
    throw new Error("useSelectedMonth must be used within SelectedMonthProvider");
  }

  return context;
}
