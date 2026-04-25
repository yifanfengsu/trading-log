import AppShell from "@/components/layout/AppShell";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { TradeStoreProvider } from "@/components/providers/TradeStoreProvider";

export default function Home() {
  return (
    <LanguageProvider>
      <TradeStoreProvider>
        <AppShell />
      </TradeStoreProvider>
    </LanguageProvider>
  );
}
