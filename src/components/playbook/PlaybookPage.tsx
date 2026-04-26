"use client";

import { Plus } from "lucide-react";
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
import {
  filterPlaybooks,
  getPlaybookSummary,
  type PlaybookFilters,
} from "@/lib/playbook-calculations";
import type { Playbook } from "@/lib/playbook-types";
import { cn, formatPercent } from "@/lib/utils";

type EditorState =
  | {
      mode: "create";
    }
  | {
      mode: "edit";
      playbook: Playbook;
    };

interface SummaryCardProps {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "accent";
}

const defaultFilters: PlaybookFilters = {
  query: "",
  setup: "all",
  status: "all",
};

function SummaryCard({ label, value, tone = "neutral" }: SummaryCardProps) {
  return (
    <article className="panel-card p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p
        className={cn(
          "mt-5 text-[30px] font-semibold tracking-[-0.04em]",
          tone === "accent" && "text-[var(--accent)]",
          tone === "positive" && "text-emerald-600",
          tone === "neutral" && "text-slate-950",
        )}
      >
        {value}
      </p>
    </article>
  );
}

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
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-[30px]">
            {copy.playbookPage.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {copy.playbookPage.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateEditor}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(108,77,255,0.22)] transition-colors hover:bg-[var(--accent-strong)]"
        >
          <Plus className="h-4 w-4" />
          {copy.playbookPage.newPlaybook}
        </button>
      </section>

      <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
        <SummaryCard
          label={copy.playbookPage.activePlaybooks}
          value={String(summary.activeCount)}
          tone="accent"
        />
        <SummaryCard
          label={copy.playbookPage.archived}
          value={String(summary.archivedCount)}
        />
        <SummaryCard
          label={copy.playbookPage.linkedTrades}
          value={String(summary.linkedTradesCount)}
        />
        <SummaryCard
          label={copy.playbookPage.avgWinRate}
          value={formatPercent(summary.avgWinRate)}
          tone={summary.avgWinRate > 0 ? "positive" : "neutral"}
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
