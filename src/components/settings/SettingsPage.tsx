"use client";

import DataManagementSettings from "@/components/settings/DataManagementSettings";
import DangerZoneSettings from "@/components/settings/DangerZoneSettings";
import PreferencesSettings from "@/components/settings/PreferencesSettings";
import StorageOverview from "@/components/settings/StorageOverview";
import TradeDefaultsSettings from "@/components/settings/TradeDefaultsSettings";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function SettingsPage() {
  const { dictionary: copy } = useLanguage();

  return (
    <>
      <section className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-[30px]">
          {copy.settingsPage.title}
        </h1>
        <p className="text-sm text-slate-500">{copy.settingsPage.subtitle}</p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.82fr)]">
        <div className="grid gap-6">
          <PreferencesSettings />
          <TradeDefaultsSettings />
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
