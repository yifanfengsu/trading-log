import type { DailyReview } from "@/lib/review-types";
import type { Playbook } from "@/lib/playbook-types";
import type { PeriodReport } from "@/lib/report-types";
import type { UserSettings } from "@/lib/settings-types";
import type { Trade } from "@/lib/trade-types";

export type BackupFile = {
  app: "trade-journal";
  version: 1;
  exportedAt: string;
  data: {
    settings: UserSettings;
    trades: Trade[];
    dailyReviews: DailyReview[];
    periodReports: PeriodReport[];
    playbooks: Playbook[];
  };
};
