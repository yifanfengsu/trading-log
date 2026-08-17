export type DailyReviewScore = 1 | 2 | 3 | 4 | 5;

export type ReviewEmotion =
  | "calm"
  | "confident"
  | "anxious"
  | "greedy"
  | "frustrated"
  | "tired"
  | "neutral";

export type DailyReview = {
  date: string;
  rulesFollowed: string;
  mainMistake: string;
  marketCondition: string;
  tomorrowFocus: string;
  emotion: ReviewEmotion;
  score: DailyReviewScore;
  notes?: string;
  updatedAt: string;
};

export const reviewEmotions: ReviewEmotion[] = [
  "calm",
  "confident",
  "anxious",
  "greedy",
  "frustrated",
  "tired",
  "neutral",
];

export const dailyReviewScores: DailyReviewScore[] = [1, 2, 3, 4, 5];

export function isReviewEmotion(value: unknown): value is ReviewEmotion {
  return reviewEmotions.some((emotion) => emotion === value);
}

export function isDailyReviewScore(value: unknown): value is DailyReviewScore {
  return dailyReviewScores.some((score) => score === value);
}
