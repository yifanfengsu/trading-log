"use client";

import { NotebookPen, Plus } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";

interface NotesEmptyStateProps {
  title: string;
  actionLabel: string;
  onCreate: () => void;
}

export default function NotesEmptyState({
  title,
  actionLabel,
  onCreate,
}: NotesEmptyStateProps) {
  return (
    <Card>
      <EmptyState
        title={title}
        icon={NotebookPen}
        action={
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4" />
            {actionLabel}
          </Button>
        }
      />
    </Card>
  );
}
