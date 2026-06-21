import { redirect } from "next/navigation";

// Reports are now merged into the Analytics page as the "Period Report" tab.
// Keep this route so existing /reports links resolve: send them straight to the
// reports tab via the ?view=reports query the Analytics workspace reads.
export default function ReportsRoutePage() {
  redirect("/analytics?view=reports");
}
