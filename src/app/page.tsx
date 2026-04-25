import AppShell from "@/components/layout/AppShell";
import { LanguageProvider } from "@/components/providers/LanguageProvider";

export default function Home() {
  return (
    <LanguageProvider>
      <AppShell />
    </LanguageProvider>
  );
}
