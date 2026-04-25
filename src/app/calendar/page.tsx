import CalendarPage from "@/components/calendar/CalendarPage";
import { isValidDateKey } from "@/lib/calendar-utils";

interface CalendarRoutePageProps {
  searchParams: Promise<{
    date?: string | string[] | undefined;
  }>;
}

export default async function CalendarRoutePage({
  searchParams,
}: CalendarRoutePageProps) {
  const params = await searchParams;
  const dateParam = typeof params.date === "string" ? params.date : undefined;
  const initialDate = isValidDateKey(dateParam) ? dateParam : undefined;

  return (
    <CalendarPage
      key={initialDate ?? "calendar-default"}
      initialDate={initialDate}
    />
  );
}
