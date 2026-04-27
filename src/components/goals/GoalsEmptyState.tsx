"use client";

import { Plus, Target } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";

interface GoalsEmptyStateProps {
  mode: "empty" | "filtered";
  onCreate: () => void;
}

export default function GoalsEmptyState({
  mode,
  onCreate,
}: GoalsEmptyStateProps) {
  const { dictionary: copy } = useLanguage();

  return (
    <Card>
      <EmptyState
        title={
          mode === "empty"
            ? copy.goalsPage.noGoalsYet
            : copy.goalsPage.noFilterResults
        }
        icon={Target}
        action={
          mode === "empty" ? (
            <Button onClick={onCreate}>
              <Plus className="h-4 w-4" />
              {copy.goalsPage.newGoal}
            </Button>
          ) : null
        }
      />
    </Card>
  );
}
