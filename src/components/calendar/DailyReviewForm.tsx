"use client";

import { type FormEvent, useState } from "react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useDailyReviews } from "@/components/providers/ReviewStoreProvider";
import {
  dailyReviewScores,
  reviewEmotions,
  type DailyReview,
  type DailyReviewScore,
  type ReviewEmotion,
} from "@/lib/review-types";
import { cn } from "@/lib/utils";

interface DailyReviewFormProps {
  date: string;
  review?: DailyReview;
}

interface ReviewFormState {
  rulesFollowed: string;
  mainMistake: string;
  marketCondition: string;
  tomorrowFocus: string;
  emotion: ReviewEmotion;
  score: DailyReviewScore;
  notes: string;
}

const inputClass =
  "mt-2 w-full rounded-2xl border border-[rgba(148,163,184,0.18)] bg-white px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-300 focus:border-[rgba(108,77,255,0.38)]";

function getEmptyFormState(): ReviewFormState {
  return {
    rulesFollowed: "",
    mainMistake: "",
    marketCondition: "",
    tomorrowFocus: "",
    emotion: "neutral",
    score: 3,
    notes: "",
  };
}

function getInitialFormState(review?: DailyReview): ReviewFormState {
  if (!review) {
    return getEmptyFormState();
  }

  return {
    rulesFollowed: review.rulesFollowed,
    mainMistake: review.mainMistake,
    marketCondition: review.marketCondition,
    tomorrowFocus: review.tomorrowFocus,
    emotion: review.emotion,
    score: review.score,
    notes: review.notes ?? "",
  };
}

export default function DailyReviewForm({ date, review }: DailyReviewFormProps) {
  const { dictionary: copy } = useLanguage();
  const { upsertReview, deleteReview } = useDailyReviews();
  const [form, setForm] = useState<ReviewFormState>(() =>
    getInitialFormState(review),
  );

  function updateField<Key extends keyof ReviewFormState>(
    key: Key,
    value: ReviewFormState[Key],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    upsertReview({
      date,
      rulesFollowed: form.rulesFollowed,
      mainMistake: form.mainMistake,
      marketCondition: form.marketCondition,
      tomorrowFocus: form.tomorrowFocus,
      emotion: form.emotion,
      score: form.score,
      notes: form.notes.trim() ? form.notes : undefined,
      updatedAt: new Date().toISOString(),
    });
  }

  function handleDelete() {
    if (!review) {
      return;
    }

    if (window.confirm(copy.calendarPage.deleteReviewConfirm)) {
      deleteReview(date);
      setForm(getEmptyFormState());
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm font-medium text-slate-600">
        {copy.calendarPage.rulesFollowed}
        <textarea
          value={form.rulesFollowed}
          onChange={(event) => updateField("rulesFollowed", event.target.value)}
          className={cn(inputClass, "min-h-24 resize-none py-3")}
          placeholder={copy.calendarPage.rulesFollowedPlaceholder}
        />
      </label>

      <label className="block text-sm font-medium text-slate-600">
        {copy.calendarPage.mainMistake}
        <textarea
          value={form.mainMistake}
          onChange={(event) => updateField("mainMistake", event.target.value)}
          className={cn(inputClass, "min-h-24 resize-none py-3")}
          placeholder={copy.calendarPage.mainMistakePlaceholder}
        />
      </label>

      <label className="block text-sm font-medium text-slate-600">
        {copy.calendarPage.marketCondition}
        <textarea
          value={form.marketCondition}
          onChange={(event) => updateField("marketCondition", event.target.value)}
          className={cn(inputClass, "min-h-24 resize-none py-3")}
          placeholder={copy.calendarPage.marketConditionPlaceholder}
        />
      </label>

      <label className="block text-sm font-medium text-slate-600">
        {copy.calendarPage.tomorrowFocus}
        <textarea
          value={form.tomorrowFocus}
          onChange={(event) => updateField("tomorrowFocus", event.target.value)}
          className={cn(inputClass, "min-h-24 resize-none py-3")}
          placeholder={copy.calendarPage.tomorrowFocusPlaceholder}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-600">
          {copy.calendarPage.emotion}
          <select
            value={form.emotion}
            onChange={(event) =>
              updateField("emotion", event.target.value as ReviewEmotion)
            }
            className={cn(inputClass, "h-11")}
          >
            {reviewEmotions.map((emotion) => (
              <option key={emotion} value={emotion}>
                {copy.calendarPage.emotions[emotion]}
              </option>
            ))}
          </select>
        </label>

        <div>
          <p className="text-sm font-medium text-slate-600">
            {copy.calendarPage.executionScore}
          </p>
          <div className="mt-2 flex gap-2">
            {dailyReviewScores.map((score) => {
              const isActive = form.score === score;

              return (
                <button
                  key={score}
                  type="button"
                  onClick={() => updateField("score", score)}
                  aria-pressed={isActive}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all",
                    isActive
                      ? "bg-[var(--accent)] text-white shadow-[0_10px_18px_rgba(108,77,255,0.22)]"
                      : "border border-[rgba(148,163,184,0.18)] bg-white text-slate-500 hover:border-[rgba(108,77,255,0.22)] hover:text-[var(--accent)]",
                  )}
                >
                  {score}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <label className="block text-sm font-medium text-slate-600">
        {copy.calendarPage.notes}
        <textarea
          value={form.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          className={cn(inputClass, "min-h-24 resize-none py-3")}
        />
      </label>

      <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => setForm(getEmptyFormState())}
          className="inline-flex h-11 items-center justify-center rounded-full border border-[rgba(148,163,184,0.18)] bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:border-[rgba(108,77,255,0.22)] hover:text-slate-900"
        >
          {copy.calendarPage.clear}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={!review}
          className={cn(
            "inline-flex h-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition-colors",
            review
              ? "border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100"
              : "border-[rgba(148,163,184,0.14)] bg-slate-50 text-slate-300",
          )}
        >
          {copy.calendarPage.deleteReview}
        </button>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(108,77,255,0.22)] transition-colors hover:bg-[var(--accent-strong)]"
        >
          {copy.calendarPage.saveReview}
        </button>
      </div>
    </form>
  );
}
