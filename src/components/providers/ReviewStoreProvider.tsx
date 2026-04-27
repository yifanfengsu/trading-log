"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { isValidDateKey } from "@/lib/calendar-utils";
import { getSeedDailyReviews } from "@/lib/review-seed";
import type {
  DailyReview,
  DailyReviewScore,
  ReviewEmotion,
} from "@/lib/review-types";

export const REVIEW_STORAGE_KEY = "trade-journal-daily-reviews-v1";

interface ReviewStoreContextValue {
  dailyReviews: DailyReview[];
  getReviewByDate: (date: string) => DailyReview | undefined;
  upsertReview: (review: DailyReview) => void;
  deleteReview: (date: string) => void;
  replaceDailyReviews: (reviews: DailyReview[]) => void;
  clearDailyReviews: () => void;
  resetDailyReviewsToSeed: () => void;
}

const ReviewStoreContext = createContext<ReviewStoreContextValue | null>(null);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isReviewEmotion(value: unknown): value is ReviewEmotion {
  return (
    value === "calm" ||
    value === "confident" ||
    value === "anxious" ||
    value === "greedy" ||
    value === "frustrated" ||
    value === "tired" ||
    value === "neutral"
  );
}

function isDailyReviewScore(value: unknown): value is DailyReviewScore {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

function isDailyReview(value: unknown): value is DailyReview {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.date === "string" &&
    isValidDateKey(value.date) &&
    typeof value.rulesFollowed === "string" &&
    typeof value.mainMistake === "string" &&
    typeof value.marketCondition === "string" &&
    typeof value.tomorrowFocus === "string" &&
    isReviewEmotion(value.emotion) &&
    isDailyReviewScore(value.score) &&
    (value.notes === undefined || typeof value.notes === "string") &&
    typeof value.updatedAt === "string"
  );
}

function parseStoredReviews(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every(isDailyReview) ? parsed : null;
  } catch {
    return null;
  }
}

function sortReviews(reviews: DailyReview[]) {
  return [...reviews].sort((a, b) => a.date.localeCompare(b.date));
}

function persistReviews(reviews: DailyReview[]) {
  window.localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(reviews));
}

export function ReviewStoreProvider({ children }: { children: ReactNode }) {
  const [dailyReviews, setDailyReviews] = useState<DailyReview[]>([]);
  const reviewsRef = useRef<DailyReview[]>([]);

  const commitReviews = useCallback((nextReviews: DailyReview[]) => {
    const sortedReviews = sortReviews(nextReviews);
    reviewsRef.current = sortedReviews;
    setDailyReviews(sortedReviews);
    persistReviews(sortedReviews);
  }, []);

  useEffect(() => {
    const storedReviews = parseStoredReviews(
      window.localStorage.getItem(REVIEW_STORAGE_KEY),
    );

    const nextReviews =
      storedReviews !== null ? storedReviews : getSeedDailyReviews();

    if (storedReviews === null) {
      persistReviews(sortReviews(nextReviews));
    }

    const timeoutId = window.setTimeout(() => {
      const sortedReviews = sortReviews(nextReviews);
      reviewsRef.current = sortedReviews;
      setDailyReviews(sortedReviews);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const getReviewByDate = useCallback(
    (date: string) => dailyReviews.find((review) => review.date === date),
    [dailyReviews],
  );

  const upsertReview = useCallback(
    (review: DailyReview) => {
      const nextReviews = reviewsRef.current.some(
        (currentReview) => currentReview.date === review.date,
      )
        ? reviewsRef.current.map((currentReview) =>
            currentReview.date === review.date ? review : currentReview,
          )
        : [...reviewsRef.current, review];

      commitReviews(nextReviews);
    },
    [commitReviews],
  );

  const deleteReview = useCallback(
    (date: string) => {
      commitReviews(
        reviewsRef.current.filter((currentReview) => currentReview.date !== date),
      );
    },
    [commitReviews],
  );

  const replaceDailyReviews = useCallback(
    (nextReviews: DailyReview[]) => {
      commitReviews([...nextReviews]);
    },
    [commitReviews],
  );

  const clearDailyReviews = useCallback(() => {
    commitReviews([]);
  }, [commitReviews]);

  const resetDailyReviewsToSeed = useCallback(() => {
    commitReviews(getSeedDailyReviews());
  }, [commitReviews]);

  const value = useMemo(
    () => ({
      dailyReviews,
      getReviewByDate,
      upsertReview,
      deleteReview,
      replaceDailyReviews,
      clearDailyReviews,
      resetDailyReviewsToSeed,
    }),
    [
      clearDailyReviews,
      dailyReviews,
      deleteReview,
      getReviewByDate,
      replaceDailyReviews,
      resetDailyReviewsToSeed,
      upsertReview,
    ],
  );

  return (
    <ReviewStoreContext.Provider value={value}>
      {children}
    </ReviewStoreContext.Provider>
  );
}

export function useDailyReviews() {
  const context = useContext(ReviewStoreContext);

  if (!context) {
    throw new Error("useDailyReviews must be used within ReviewStoreProvider");
  }

  return context;
}
