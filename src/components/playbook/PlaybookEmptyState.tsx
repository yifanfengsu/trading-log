"use client";

import { BookOpenText, Plus } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";

interface PlaybookEmptyStateProps {
  onCreate: () => void;
}

export default function PlaybookEmptyState({
  onCreate,
}: PlaybookEmptyStateProps) {
  const { dictionary: copy } = useLanguage();

  return (
    <Card>
      <EmptyState
        title={copy.playbookPage.noPlaybooksYet}
        icon={BookOpenText}
        action={
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4" />
            {copy.playbookPage.newPlaybook}
          </Button>
        }
      />
    </Card>
  );
}
