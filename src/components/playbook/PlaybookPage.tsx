"use client";

import { Archive, BookOpenText, Link2, Percent, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import PlaybookDetailDrawer from "@/components/playbook/PlaybookDetailDrawer";
import PlaybookEditorDrawer from "@/components/playbook/PlaybookEditorDrawer";
import PlaybookEmptyState from "@/components/playbook/PlaybookEmptyState";
import PlaybookList from "@/components/playbook/PlaybookList";
import PlaybookPerformancePanel from "@/components/playbook/PlaybookPerformancePanel";
import PlaybookToolbar from "@/components/playbook/PlaybookToolbar";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { usePlaybooks } from "@/components/providers/PlaybookStoreProvider";
import { useTrades } from "@/components/providers/TradeStoreProvider";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import {
  filterPlaybooks,
  getPlaybookSummary,
  type PlaybookFilters,
} from "@/lib/playbook-calculations";
import type { Playbook } from "@/lib/playbook-types";
import { formatPercent } from "@/lib/utils";

type EditorState =
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      playbook: Playbook;
    };

const defaultFilters: PlaybookFilters = {
  query: "",
  setup: "all",
  status: "all",
};

export default function PlaybookPage() {
  const { dictionary: copy } = useLanguage();
  const {
    playbooks,
    archivePlaybook,
    restorePlaybook,
    deletePlaybook,
  } = usePlaybooks();
  const { trades } = useTrades();
  const [filters, setFilters] = useState<PlaybookFilters>(defaultFilters);
  const [detailPlaybook, setDetailPlaybook] = useState<Playbook | null>(null);
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const summary = useMemo(
    () => getPlaybookSummary(playbooks, trades),
    [playbooks, trades],
  );
  const filteredPlaybooks = useMemo(
    () => filterPlaybooks(playbooks, filters),
    [filters, playbooks],
  );

  function openCreateEditor() {
    setDetailPlaybook(null);
    setEditorState({ mode: "create" });
  }

  function openEditEditor(playbook: Playbook) {
    setDetailPlaybook(null);
    setEditorState({ mode: "edit", playbook });
  }

  function handleArchive(playbook: Playbook) {
    if (window.confirm(copy.playbookPage.archiveConfirm)) {
      archivePlaybook(playbook.id);
      setDetailPlaybook(null);
    }
  }

  function handleRestore(playbook: Playbook) {
    restorePlaybook(playbook.id);
    setDetailPlaybook(null);
  }

  function handleDelete(playbook: Playbook) {
    deletePlaybook(playbook.id);
    setDetailPlaybook(null);
  }

  return (
    <>
      <PageHeader
        title={copy.playbookPage.title}
        description={copy.playbookPage.subtitle}
        actions={
          <Button onClick={openCreateEditor}>
            <Plus className="h-4 w-4" />
            {copy.playbookPage.newPlaybook}
          </Button>
        }
      />

      <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
        <StatCard
          label={copy.playbookPage.activePlaybooks}
          value={String(summary.activeCount)}
          tone="accent"
          icon={BookOpenText}
        />
        <StatCard
          label={copy.playbookPage.archived}
          value={String(summary.archivedCount)}
          icon={Archive}
        />
        <StatCard
          label={copy.playbookPage.linkedTrades}
          value={String(summary.linkedTradesCount)}
          icon={Link2}
        />
        <StatCard
          label={copy.playbookPage.avgWinRate}
          value={formatPercent(summary.avgWinRate)}
          tone={summary.avgWinRate > 0 ? "positive" : "neutral"}
          icon={Percent}
        />
      </section>

      {playbooks.length === 0 ? (
        <PlaybookEmptyState onCreate={openCreateEditor} />
      ) : (
        <>
          <PlaybookToolbar
            filters={filters}
            onFiltersChange={setFilters}
            onReset={() => setFilters(defaultFilters)}
          />

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
            <PlaybookList
              playbooks={filteredPlaybooks}
              trades={trades}
              onCreate={openCreateEditor}
              onView={setDetailPlaybook}
              onEdit={openEditEditor}
              onArchive={handleArchive}
              onRestore={handleRestore}
            />
            <PlaybookPerformancePanel playbooks={playbooks} trades={trades} />
          </section>
        </>
      )}

      {detailPlaybook ? (
        <PlaybookDetailDrawer
          playbook={detailPlaybook}
          trades={trades}
          onClose={() => setDetailPlaybook(null)}
          onEdit={openEditEditor}
          onArchive={handleArchive}
          onRestore={handleRestore}
          onDelete={handleDelete}
        />
      ) : null}

      {editorState ? (
        <PlaybookEditorDrawer
          mode={editorState.mode}
          playbook={
            editorState.mode === "edit" ? editorState.playbook : undefined
          }
          onClose={() => setEditorState(null)}
        />
      ) : null}
    </>
  );
}
