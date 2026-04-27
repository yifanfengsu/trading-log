"use client";

import { Archive, Eye, Pencil, RotateCcw } from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { PlaybookStats } from "@/lib/playbook-calculations";
import type { Playbook } from "@/lib/playbook-types";
import {
  cn,
  formatCurrency,
  formatPercent,
  formatRMultiple,
} from "@/lib/utils";

interface PlaybookCardProps {
  playbook: Playbook;
  stats: PlaybookStats;
  onView: (playbook: Playbook) => void;
  onEdit: (playbook: Playbook) => void;
  onArchive: (playbook: Playbook) => void;
  onRestore: (playbook: Playbook) => void;
}

interface MetricProps {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
}

function Metric({ label, value, tone = "neutral" }: MetricProps) {
  return (
    <div className="rounded-2xl bg-[rgba(250,250,255,0.88)] px-3 py-3">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p
        className={cn(
          "mt-1 text-sm font-semibold text-slate-950",
          tone === "positive" && "text-emerald-600",
          tone === "negative" && "text-rose-600",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export default function PlaybookCard({
  playbook,
  stats,
  onView,
  onEdit,
  onArchive,
  onRestore,
}: PlaybookCardProps) {
  const { dictionary: copy } = useLanguage();
  const { settings } = useUserSettings();
  const isArchived = playbook.status === "archived";

  return (
    <Card
      as="article"
      hover
      className="flex min-h-full cursor-pointer flex-col"
      onClick={() => onView(playbook)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="line-clamp-1 text-lg font-semibold tracking-[-0.03em] text-slate-950">
            {playbook.name}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="purple">
              {copy.strategies[playbook.setup]}
            </Badge>
            <Badge variant={isArchived ? "gray" : "green"}>
              {copy.playbookStatus[playbook.status]}
            </Badge>
          </div>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
        {playbook.description || "—"}
      </p>

      <div className="mt-4 grid gap-2 text-sm text-slate-500">
        <div className="flex items-center justify-between gap-3">
          <span>{copy.playbookPage.market}</span>
          <span className="truncate font-semibold text-slate-700">
            {playbook.market || "—"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>{copy.playbookPage.timeframes}</span>
          <span className="truncate font-semibold text-slate-700">
            {playbook.timeframes.length > 0
              ? playbook.timeframes.join(", ")
              : "—"}
          </span>
        </div>
      </div>

      <div className="mt-4 flex min-h-7 flex-wrap gap-2">
        {playbook.tags.length > 0 ? (
          playbook.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-inset ring-slate-100"
            >
              {tag}
            </span>
          ))
        ) : (
          <span className="text-sm text-slate-400">—</span>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Metric
          label={copy.strategyPerformance.netPnl}
          value={formatCurrency(stats.netPnl, settings.currency)}
          tone={
            stats.netPnl > 0
              ? "positive"
              : stats.netPnl < 0
                ? "negative"
                : "neutral"
          }
        />
        <Metric
          label={copy.tradesPage.totalTrades}
          value={String(stats.linkedTrades)}
        />
        <Metric
          label={copy.strategyPerformance.winRate}
          value={formatPercent(stats.winRate)}
        />
        <Metric
          label={copy.tradesPage.avgR}
          value={formatRMultiple(stats.avgR)}
          tone={
            stats.avgR > 0 ? "positive" : stats.avgR < 0 ? "negative" : "neutral"
          }
        />
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
        <Button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onView(playbook);
          }}
          variant="secondary"
          size="sm"
        >
          <Eye className="h-4 w-4" />
          {copy.playbookPage.view}
        </Button>
        <Button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(playbook);
          }}
          variant="outline"
          size="sm"
        >
          <Pencil className="h-4 w-4" />
          {copy.playbookPage.edit}
        </Button>
        <Button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            if (isArchived) {
              onRestore(playbook);
            } else {
              onArchive(playbook);
            }
          }}
          variant="secondary"
          size="sm"
        >
          {isArchived ? (
            <RotateCcw className="h-4 w-4" />
          ) : (
            <Archive className="h-4 w-4" />
          )}
          {isArchived ? copy.playbookPage.restore : copy.playbookPage.archive}
        </Button>
      </div>
    </Card>
  );
}
