"use client";

import type { ReactNode } from "react";

import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function AppShell({ children }: { children: ReactNode }) {
  const { dictionary } = useLanguage();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(123,97,255,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(76,134,255,0.08),transparent_22%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-[1760px] flex-col gap-6 px-4 py-4 sm:px-5 lg:flex-row lg:px-6">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <TopBar />
          <main className="flex flex-col gap-6 pb-8">{children}</main>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(247,247,251,0)_0%,rgba(247,247,251,0.82)_100%)]" />
      <div className="sr-only">{dictionary.pageTitle}</div>
    </div>
  );
}
