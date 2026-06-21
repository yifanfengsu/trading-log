"use client";

import type { ReactNode } from "react";

import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function AppShell({ children }: { children: ReactNode }) {
  const { dictionary } = useLanguage();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(124,92,255,0.12),transparent_28%),radial-gradient(circle_at_78%_4%,rgba(34,211,238,0.08),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.18]" />
      <div className="relative mx-auto flex min-h-screen max-w-[1680px] flex-col gap-5 px-4 py-4 sm:px-5 md:gap-6 lg:flex-row lg:px-7 lg:py-6">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-5 md:gap-6">
          <TopBar />
          <main className="flex flex-col gap-6 pb-10 md:gap-8 lg:pb-12">
            {children}
          </main>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(180deg,rgba(7,10,19,0)_0%,rgba(2,6,23,0.72)_100%)]" />
      <div className="sr-only">{dictionary.pageTitle}</div>
    </div>
  );
}
