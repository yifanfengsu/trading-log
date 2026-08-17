"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import { useCollectionStore } from "@/components/providers/use-collection-store";
import { isValidDateKey } from "@/lib/calendar-utils";
import { isRecord } from "@/lib/guards";
import { getSeedDailyReviews } from "@/lib/review-seed";
import {
  isDailyReviewScore,
  isReviewEmotion,
  type DailyReview,
} from "@/lib/review-types";

// Legacy localStorage key — only read once, during the one-time migration into
// SQLite. Reviews are now persisted server-side via /api/reviews.
export const REVIEW_STORAGE_KEY = "trade-journal-daily-reviews-v1";

// Set in localStorage after the legacy reviews have been imported into SQLite so
// the migration never runs twice. The legacy data itself is left in place.
const REVIEW_MIGRATION_FLAG_KEY = "reviews-migrated-to-sqlite";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

interface ReviewStoreContextValue {
  dailyReviews: DailyReview[];
  getReviewByDate: (date: string) => DailyReview | undefined;
  upsertReview: (review: DailyReview) => void;
  deleteReview: (date: string) => void;
  replaceDailyReviews: (reviews: DailyReview[]) => void;
  clearDailyReviews: () => void;
  resetDailyReviewsToSeed: () => void;
  reloadDailyReviews: () => Promise<void>;
}

const ReviewStoreContext = createContext<ReviewStoreContextValue | null>(null);

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

const collectionConfig = {
  name: "reviews",
  basePath: "/api/reviews",
  sort: sortReviews,
  seed: getSeedDailyReviews,
  legacy: {
    storageKey: REVIEW_STORAGE_KEY,
    migrationFlagKey: REVIEW_MIGRATION_FLAG_KEY,
    parse: parseStoredReviews,
  },
};

export function ReviewStoreProvider({ children }: { children: ReactNode }) {
  const {
    items: dailyReviews,
    itemsRef: reviewsRef,
    apply: applyReviews,
    persist,
    reload: reloadDailyReviews,
    replace: replaceDailyReviews,
    clear: clearDailyReviews,
    reset: resetDailyReviewsToSeed,
  } = useCollectionStore<DailyReview>(collectionConfig);

  const getReviewByDate = useCallback(
    (date: string) => dailyReviews.find((review) => review.date === date),
    [dailyReviews],
  );

  const upsertReview = useCallback(
    (review: DailyReview) => {
      const previousReviews = reviewsRef.current;
      const nextReviews = previousReviews.some(
        (currentReview) => currentReview.date === review.date,
      )
        ? previousReviews.map((currentReview) =>
            currentReview.date === review.date ? review : currentReview,
          )
        : [...previousReviews, review];

      applyReviews(nextReviews);

      void persist(
        () =>
          fetch("/api/reviews", {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify(review),
          }),
        previousReviews,
        "POST /api/reviews",
      );
    },
    [applyReviews, persist, reviewsRef],
  );

  const deleteReview = useCallback(
    (date: string) => {
      const previousReviews = reviewsRef.current;

      applyReviews(
        previousReviews.filter((currentReview) => currentReview.date !== date),
      );

      void persist(
        () => fetch(`/api/reviews/${date}`, { method: "DELETE" }),
        previousReviews,
        `DELETE /api/reviews/${date}`,
      );
    },
    [applyReviews, persist, reviewsRef],
  );

  const value = useMemo(
    () => ({
      dailyReviews,
      getReviewByDate,
      upsertReview,
      deleteReview,
      replaceDailyReviews,
      clearDailyReviews,
      resetDailyReviewsToSeed,
      reloadDailyReviews,
    }),
    [
      clearDailyReviews,
      dailyReviews,
      deleteReview,
      getReviewByDate,
      reloadDailyReviews,
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
