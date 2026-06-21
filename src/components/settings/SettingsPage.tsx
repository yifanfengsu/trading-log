"use client";

import { BookOpenText } from "lucide-react";
import Link from "next/link";

import DataManagementSettings from "@/components/settings/DataManagementSettings";
import DangerZoneSettings from "@/components/settings/DangerZoneSettings";
import PreferencesSettings from "@/components/settings/PreferencesSettings";
import StorageOverview from "@/components/settings/StorageOverview";
import TradeDefaultsSettings from "@/components/settings/TradeDefaultsSettings";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";

export default function SettingsPage() {
  const { dictionary: copy } = useLanguage();

  return (
    <>
      <PageHeader
        title={copy.settingsPage.title}
        description={copy.settingsPage.subtitle}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.04fr)_minmax(360px,0.82fr)]">
        <div className="grid gap-6">
          <PreferencesSettings />
          <TradeDefaultsSettings />
          <Card>
            <h2 className="panel-title">{copy.settingsPage.allNotes}</h2>
            <Link
              href="/notes"
              className="mt-5 flex min-h-12 items-center justify-between gap-4 rounded-[18px] border border-white/10 bg-[rgba(15,23,42,0.46)] px-4 py-3 text-left text-sm font-semibold text-slate-200 shadow-[0_10px_24px_rgba(2,6,23,0.20)] transition-colors hover:border-[rgba(124,92,255,0.34)] hover:text-white"
            >
              <span className="min-w-0">
                {copy.settingsPage.allNotes}
                <span className="mt-0.5 block text-xs font-normal text-slate-500">
                  {copy.settingsPage.allNotesHint}
                </span>
              </span>
              <BookOpenText className="h-4 w-4 shrink-0 text-[var(--accent)]" />
            </Link>
          </Card>
        </div>
        <div className="grid gap-6">
          <StorageOverview />
          <DataManagementSettings />
          <DangerZoneSettings />
        </div>
      </section>
    </>
  );
}
