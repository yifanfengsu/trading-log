"use client";

import DataManagementSettings from "@/components/settings/DataManagementSettings";
import DangerZoneSettings from "@/components/settings/DangerZoneSettings";
import PreferencesSettings from "@/components/settings/PreferencesSettings";
import StorageOverview from "@/components/settings/StorageOverview";
import TradeDefaultsSettings from "@/components/settings/TradeDefaultsSettings";
import { useLanguage } from "@/components/providers/LanguageProvider";
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
