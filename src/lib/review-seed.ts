import type { DailyReview } from "@/lib/review-types";
import {
  getCurrentMonthKey,
  getMonthRangeFromMonthKey,
} from "@/lib/utils";

export function getSeedDailyReviews(
  baseMonthKey = getCurrentMonthKey(),
): DailyReview[] {
  const { endDate } = getMonthRangeFromMonthKey(baseMonthKey);

  return [
    {
      date: endDate,
      rulesFollowed: "风险控制到位，无报复交易，耐心等待符合计划的机会。",
      mainMistake: "过早平仓 BTC 短线头寸，错失后续行情。",
      marketCondition: "震荡区间，低波动，方向不明，需谨慎。",
      tomorrowFocus: "保持耐心，只做 A+ 级别机会，让盈利奔跑。",
      emotion: "calm",
      score: 4,
      updatedAt: `${endDate}T18:00:00.000`,
    },
  ];
}

export const seedDailyReviews: DailyReview[] = getSeedDailyReviews();
