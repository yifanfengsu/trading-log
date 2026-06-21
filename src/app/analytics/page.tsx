import AnalyticsWorkspace from "@/components/analytics/AnalyticsWorkspace";

interface AnalyticsRoutePageProps {
  searchParams: Promise<{
    view?: string | string[] | undefined;
  }>;
}

export default async function AnalyticsRoutePage({
  searchParams,
}: AnalyticsRoutePageProps) {
  const params = await searchParams;
  const initialView = params.view === "reports" ? "reports" : "analytics";

  return <AnalyticsWorkspace initialView={initialView} />;
}
