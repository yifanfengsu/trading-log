"use client";

import PlaybookCard from "@/components/playbook/PlaybookCard";
import PlaybookEmptyState from "@/components/playbook/PlaybookEmptyState";
import { getPlaybookStats } from "@/lib/playbook-calculations";
import type { Playbook } from "@/lib/playbook-types";
import type { Trade } from "@/lib/trade-types";

interface PlaybookListProps {
  playbooks: Playbook[];
  trades: Trade[];
  onCreate: () => void;
  onView: (playbook: Playbook) => void;
  onEdit: (playbook: Playbook) => void;
  onArchive: (playbook: Playbook) => void;
  onRestore: (playbook: Playbook) => void;
}

export default function PlaybookList({
  playbooks,
  trades,
  onCreate,
  onView,
  onEdit,
  onArchive,
  onRestore,
}: PlaybookListProps) {
  if (playbooks.length === 0) {
    return <PlaybookEmptyState onCreate={onCreate} />;
  }

  return (
    <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
      {playbooks.map((playbook) => (
        <PlaybookCard
          key={playbook.id}
          playbook={playbook}
          stats={getPlaybookStats(trades, playbook)}
          onView={onView}
          onEdit={onEdit}
          onArchive={onArchive}
          onRestore={onRestore}
        />
      ))}
    </section>
  );
}
