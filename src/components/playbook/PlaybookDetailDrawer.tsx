"use client";

import { Archive, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import LinkedNotesPreview from "@/components/notes/LinkedNotesPreview";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useNotes } from "@/components/providers/NotesStoreProvider";
import { useUserSettings } from "@/components/providers/UserSettingsProvider";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import DrawerShell from "@/components/ui/DrawerShell";
import {
  getPlaybookStats,
  getRecentPlaybookTrades,
} from "@/lib/playbook-calculations";
import type { Playbook } from "@/lib/playbook-types";
import type { Trade } from "@/lib/trade-types";
import {
  cn,
  formatCurrency,
  formatPercent,
  formatProfitFactor,
  formatRMultiple,
  formatTradeTimestamp,
} from "@/lib/utils";

interface PlaybookDetailDrawerProps {
  playbook: Playbook;
  trades: Trade[];
  onClose: () => void;
  onEdit: (playbook: Playbook) => void;
  onArchive: (playbook: Playbook) => void;
  onRestore: (playbook: Playbook) => void;
  onDelete: (playbook: Playbook) => void;
}

interface DetailRowProps {
  label: string;
  value: string;
}

interface StatTileProps {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[rgba(155,163,155,0.12)] py-3 last:border-b-0">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-right text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function StatTile({ label, value, tone = "neutral" }: StatTileProps) {
  return (
    <div className="rounded-[18px] bg-[rgba(250,250,255,0.88)] px-4 py-3">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p
        className={cn(
          "mt-2 text-base font-semibold text-slate-950",
          tone === "positive" && "text-emerald-600",
          tone === "negative" && "text-rose-600",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function RuleSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {items.length > 0 ? (
        <ul className="mt-3 grid gap-2">
          {items.map((item) => (
            <li
              key={item}
              className="rounded-[16px] bg-[rgba(250,250,255,0.88)] px-4 py-3 text-sm leading-6 text-slate-600"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 rounded-[16px] bg-[rgba(250,250,255,0.88)] px-4 py-3 text-sm text-slate-400">
          —
        </p>
      )}
    </section>
  );
}

export default function PlaybookDetailDrawer({
  playbook,
  trades,
  onClose,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: PlaybookDetailDrawerProps) {
  const { dictionary: copy } = useLanguage();
  const router = useRouter();
  const { getNotesForPlaybook } = useNotes();
  const { settings } = useUserSettings();
  const stats = getPlaybookStats(trades, playbook);
  const recentTrades = getRecentPlaybookTrades(trades, playbook, 5);
  const linkedNotes = getNotesForPlaybook(playbook.id);
  const isArchived = playbook.status === "archived";

  function handleDelete() {
    if (window.confirm(copy.playbookPage.deleteConfirm)) {
      onDelete(playbook);
    }
  }

  function handleAddNote() {
    onClose();
    router.push(`/notes?playbookId=${encodeURIComponent(playbook.id)}`);
  }

  return (
    <DrawerShell
      title={playbook.name}
      eyebrow={copy.strategies[playbook.setup]}
      closeLabel={copy.tradesPage.close}
      labelledById="playbook-detail-title"
      onClose={onClose}
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <Button type="button" onClick={() => onEdit(playbook)}>
            <Pencil className="h-4 w-4" />
            {copy.playbookPage.edit}
          </Button>
          <Button
            type="button"
            onClick={() => (isArchived ? onRestore(playbook) : onArchive(playbook))}
            variant="secondary"
          >
            {isArchived ? (
              <RotateCcw className="h-4 w-4" />
            ) : (
              <Archive className="h-4 w-4" />
            )}
            {isArchived ? copy.playbookPage.restore : copy.playbookPage.archive}
          </Button>
          <Button type="button" onClick={handleDelete} variant="danger">
            <Trash2 className="h-4 w-4" />
            {copy.playbookPage.delete}
          </Button>
        </div>
      }
    >
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Badge variant={isArchived ? "gray" : "green"}>
              {copy.playbookStatus[playbook.status]}
            </Badge>
          </div>
          <section className="rounded-[20px] bg-[rgba(250,250,255,0.86)] px-4">
            <DetailRow
              label={copy.playbookPage.market}
              value={playbook.market || "—"}
            />
            <DetailRow
              label={copy.playbookPage.timeframes}
              value={
                playbook.timeframes.length > 0
                  ? playbook.timeframes.join(", ")
                  : "—"
              }
            />
            <DetailRow
              label={copy.tradesPage.tags}
              value={playbook.tags.length > 0 ? playbook.tags.join(", ") : "—"}
            />
          </section>

          <section className="mt-5">
            <h3 className="text-sm font-semibold text-slate-900">
              {copy.playbookPage.description}
            </h3>
            <div className="mt-2 rounded-[18px] bg-[rgba(30,33,30,0.04)] p-4 text-sm leading-6 text-slate-600">
              {playbook.description || "—"}
            </div>
          </section>

          <div className="mt-6 grid gap-5">
            <RuleSection
              title={copy.playbookPage.entryRules}
              items={playbook.entryRules}
            />
            <RuleSection
              title={copy.playbookPage.exitRules}
              items={playbook.exitRules}
            />
            <RuleSection
              title={copy.playbookPage.riskRules}
              items={playbook.riskRules}
            />
            <RuleSection
              title={copy.playbookPage.avoidConditions}
              items={playbook.invalidationRules}
            />
          </div>

          <section className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900">
              {copy.playbookPage.executionChecklist}
            </h3>
            <div className="mt-3 grid gap-2">
              {playbook.checklist.length > 0 ? (
                playbook.checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-[16px] bg-[rgba(250,250,255,0.88)] px-4 py-3"
                  >
                    <label className="flex min-w-0 items-center gap-3 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked
                        readOnly
                        className="h-4 w-4 accent-[var(--accent)]"
                      />
                      <span className="min-w-0">{item.text}</span>
                    </label>
                    {item.required ? (
                      <span className="shrink-0 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                        {copy.playbookPage.required}
                      </span>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="rounded-[16px] bg-[rgba(250,250,255,0.88)] px-4 py-3 text-sm text-slate-400">
                  —
                </p>
              )}
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900">
              {copy.playbookPage.playbookPerformance}
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <StatTile
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
              <StatTile
                label={copy.tradesPage.totalTrades}
                value={String(stats.linkedTrades)}
              />
              <StatTile
                label={copy.strategyPerformance.winRate}
                value={formatPercent(stats.winRate)}
              />
              <StatTile
                label={copy.strategyPerformance.profitFactor}
                value={formatProfitFactor(stats.profitFactor)}
              />
              <StatTile
                label={copy.tradesPage.avgR}
                value={formatRMultiple(stats.avgR)}
                tone={
                  stats.avgR > 0
                    ? "positive"
                    : stats.avgR < 0
                      ? "negative"
                      : "neutral"
                }
              />
              <StatTile
                label={copy.playbookPage.topWinningTrade}
                value={formatCurrency(stats.bestTradePnl, settings.currency)}
                tone={stats.bestTradePnl > 0 ? "positive" : "neutral"}
              />
              <StatTile
                label={copy.playbookPage.topLosingTrade}
                value={formatCurrency(stats.worstTradePnl, settings.currency)}
                tone={stats.worstTradePnl < 0 ? "negative" : "neutral"}
              />
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900">
              {copy.playbookPage.recentLinkedTrades}
            </h3>
            {recentTrades.length === 0 ? (
              <p className="mt-3 rounded-[18px] bg-[rgba(250,250,255,0.88)] px-4 py-8 text-center text-sm font-medium text-slate-400">
                {copy.playbookPage.noLinkedTradesYet}
              </p>
            ) : (
              <div className="mt-3 grid gap-2">
                {recentTrades.map((trade) => (
                  <div
                    key={trade.id}
                    className="grid gap-2 rounded-[16px] bg-[rgba(250,250,255,0.88)] px-4 py-3 text-sm text-slate-600 sm:grid-cols-[1fr_auto_auto]"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">
                        {trade.symbol}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {formatTradeTimestamp(trade.closedAt)} -{" "}
                        {copy.side[trade.side]}
                      </p>
                    </div>
                    <p
                      className={cn(
                        "font-semibold",
                        trade.pnl >= 0 ? "text-emerald-600" : "text-rose-600",
                      )}
                    >
                      {formatCurrency(trade.pnl, settings.currency)}
                    </p>
                    <p
                      className={cn(
                        "font-semibold",
                        trade.rMultiple >= 0
                          ? "text-emerald-600"
                          : "text-rose-600",
                      )}
                    >
                      {formatRMultiple(trade.rMultiple)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <LinkedNotesPreview notes={linkedNotes} onAdd={handleAddNote} />
        </div>
    </DrawerShell>
  );
}
