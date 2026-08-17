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

async function fetchReviews(): Promise<DailyReview[]> {
  const response = await fetch("/api/reviews");

  if (!response.ok) {
    throw new Error(`GET /api/reviews failed with status ${response.status}`);
  }

  const data: unknown = await response.json();
  return Array.isArray(data) ? (data as DailyReview[]) : [];
}

// One-time import of legacy localStorage reviews into SQLite. Runs only when the
// migration flag is unset (checked here) and the database is empty (checked by
// the caller). The flag is recorded even when there is no legacy data so the
// check never runs again — the marker, not "database empty", is the real gate.
async function migrateLegacyReviewsIfNeeded(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  if (window.localStorage.getItem(REVIEW_MIGRATION_FLAG_KEY)) {
    return false;
  }

  const legacyReviews = parseStoredReviews(
    window.localStorage.getItem(REVIEW_STORAGE_KEY),
  );

  if (!legacyReviews || legacyReviews.length === 0) {
    window.localStorage.setItem(
      REVIEW_MIGRATION_FLAG_KEY,
      new Date().toISOString(),
    );
    return false;
  }

  try {
    const response = await fetch("/api/reviews/import", {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify(legacyReviews),
    });

    if (!response.ok) {
      throw new Error(`import failed with status ${response.status}`);
    }

    window.localStorage.setItem(
      REVIEW_MIGRATION_FLAG_KEY,
      new Date().toISOString(),
    );

    return true;
  } catch (error) {
    console.error("[reviews] migration from localStorage failed", error);
    return false;
  }
}

export function ReviewStoreProvider({ children }: { children: ReactNode }) {
  const [dailyReviews, setDailyReviews] = useState<DailyReview[]>([]);
  const reviewsRef = useRef<DailyReview[]>([]);

  const applyReviews = useCallback((nextReviews: DailyReview[]) => {
    const sortedReviews = sortReviews(nextReviews);
    reviewsRef.current = sortedReviews;
    setDailyReviews(sortedReviews);
  }, []);

  const persist = useCallback(
    async (
      request: () => Promise<Response>,
      previousReviews: DailyReview[],
      label: string,
    ) => {
      try {
        const response = await request();

        if (!response.ok) {
          throw new Error(`${label} failed with status ${response.status}`);
        }
      } catch (error) {
        console.error(`[reviews] ${label} failed — rolling back`, error);
        applyReviews(previousReviews);
      }
    },
    [applyReviews],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        let serverReviews = await fetchReviews();

        if (serverReviews.length === 0) {
          const migrated = await migrateLegacyReviewsIfNeeded();

          if (migrated) {
            serverReviews = await fetchReviews();
          }
        }

        if (!cancelled) {
          applyReviews(serverReviews);
        }
      } catch (error) {
        console.error("[reviews] failed to load from API", error);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [applyReviews]);

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
    [applyReviews, persist],
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
    [applyReviews, persist],
  );

  const replaceDailyReviews = useCallback(
    (nextReviews: DailyReview[]) => {
      const previousReviews = reviewsRef.current;
      const snapshot = [...nextReviews];

      applyReviews(snapshot);

      void persist(
        () =>
          fetch("/api/reviews/import", {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify(snapshot),
          }),
        previousReviews,
        "POST /api/reviews/import (replace)",
      );
    },
    [applyReviews, persist],
  );

  const clearDailyReviews = useCallback(() => {
    const previousReviews = reviewsRef.current;

    applyReviews([]);

    void persist(
      () =>
        fetch("/api/reviews/import", {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify([]),
        }),
      previousReviews,
      "POST /api/reviews/import (clear)",
    );
  }, [applyReviews, persist]);

  const resetDailyReviewsToSeed = useCallback(() => {
    const seedReviews = getSeedDailyReviews();
    const previousReviews = reviewsRef.current;

    applyReviews(seedReviews);

    void persist(
      () =>
        fetch("/api/reviews/import", {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify(seedReviews),
        }),
      previousReviews,
      "POST /api/reviews/import (reset)",
    );
  }, [applyReviews, persist]);

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
