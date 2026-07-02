"use client";

import { type FormEvent, useState } from "react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useDailyReviews } from "@/components/providers/ReviewStoreProvider";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
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
        <Textarea
          value={form.rulesFollowed}
          onChange={(event) => updateField("rulesFollowed", event.target.value)}
          className="mt-2 min-h-24 resize-none"
          placeholder={copy.calendarPage.rulesFollowedPlaceholder}
        />
      </label>

      <label className="block text-sm font-medium text-slate-600">
        {copy.calendarPage.mainMistake}
        <Textarea
          value={form.mainMistake}
          onChange={(event) => updateField("mainMistake", event.target.value)}
          className="mt-2 min-h-24 resize-none"
          placeholder={copy.calendarPage.mainMistakePlaceholder}
        />
      </label>

      <label className="block text-sm font-medium text-slate-600">
        {copy.calendarPage.marketCondition}
        <Textarea
          value={form.marketCondition}
          onChange={(event) => updateField("marketCondition", event.target.value)}
          className="mt-2 min-h-24 resize-none"
          placeholder={copy.calendarPage.marketConditionPlaceholder}
        />
      </label>

      <label className="block text-sm font-medium text-slate-600">
        {copy.calendarPage.tomorrowFocus}
        <Textarea
          value={form.tomorrowFocus}
          onChange={(event) => updateField("tomorrowFocus", event.target.value)}
          className="mt-2 min-h-24 resize-none"
          placeholder={copy.calendarPage.tomorrowFocusPlaceholder}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-600">
          {copy.calendarPage.emotion}
          <Select
            value={form.emotion}
            onChange={(event) =>
              updateField("emotion", event.target.value as ReviewEmotion)
            }
            className="mt-2"
          >
            {reviewEmotions.map((emotion) => (
              <option key={emotion} value={emotion}>
                {copy.calendarPage.emotions[emotion]}
              </option>
            ))}
          </Select>
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
                      ? "bg-[var(--accent)] text-[#0a0b0a]"
                      : "border border-[rgba(155,163,155,0.18)] bg-[rgba(30,33,30,0.48)] text-slate-400 hover:border-[rgba(184,241,53,0.32)] hover:text-[var(--accent-strong)]",
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
        <Textarea
          value={form.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          className="mt-2 min-h-24 resize-none"
        />
      </label>

      <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          onClick={() => setForm(getEmptyFormState())}
          variant="secondary"
        >
          {copy.calendarPage.clear}
        </Button>
        <Button
          type="button"
          onClick={handleDelete}
          disabled={!review}
          variant="danger"
        >
          {copy.calendarPage.deleteReview}
        </Button>
        <Button type="submit">
          {copy.calendarPage.saveReview}
        </Button>
      </div>
    </form>
  );
}
