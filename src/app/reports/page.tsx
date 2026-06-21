import { redirect } from "next/navigation";

// Reports are now merged into the Analytics page as the "Period Report" tab.
// Keep this route so existing /reports links resolve instead of 404ing.
export default function ReportsRoutePage() {
  redirect("/analytics");
}
