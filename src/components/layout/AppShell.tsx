"use client";

import type { ReactNode } from "react";

import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function AppShell({ children }: { children: ReactNode }) {
  const { dictionary } = useLanguage();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:64px_64px] opacity-[0.08]" />
      <div className="relative mx-auto flex min-h-screen max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-5 md:gap-5 lg:flex-row lg:px-6 lg:py-5">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-4 md:gap-5">
          <TopBar />
          <main className="flex flex-col gap-4 pb-10 md:gap-5 lg:pb-12">
            {children}
          </main>
        </div>
      </div>
      <div className="sr-only">{dictionary.pageTitle}</div>
    </div>
  );
}
