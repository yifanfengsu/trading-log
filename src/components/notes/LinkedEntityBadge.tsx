"use client";

import { BookOpenText, CalendarDays, Link2, MinusCircle } from "lucide-react";

import type { Locale } from "@/lib/i18n";
import type { NoteLink } from "@/lib/note-types";
import type { Playbook } from "@/lib/playbook-types";
import type { Trade } from "@/lib/trade-types";
import { cn, formatDateLabel, formatDateTime } from "@/lib/utils";

interface LinkedEntityBadgeProps {
  link: NoteLink;
  trades: Trade[];
  playbooks: Playbook[];
  locale: Locale;
  labels: {
    noLink: string;
    deletedTrade: string;
    deletedPlaybook: string;
  };
  className?: string;
}

export default function LinkedEntityBadge({
  link,
  trades,
  playbooks,
  locale,
  labels,
  className,
}: LinkedEntityBadgeProps) {
  const baseClassName = cn(
    "inline-flex max-w-full items-center gap-1.5 rounded-full bg-[rgba(108,77,255,0.08)] px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-[rgba(108,77,255,0.08)]",
    className,
  );

  if (link.type === "none") {
    return (
      <span className={baseClassName}>
        <MinusCircle className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span className="truncate">{labels.noLink}</span>
      </span>
    );
  }

  if (link.type === "date") {
    return (
      <span className={baseClassName}>
        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
        <span className="truncate">{formatDateLabel(link.date, locale)}</span>
      </span>
    );
  }

  if (link.type === "playbook") {
    const playbook = playbooks.find((item) => item.id === link.playbookId);

    return (
      <span className={baseClassName}>
        <BookOpenText className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
        <span className="truncate">
          {playbook ? playbook.name : labels.deletedPlaybook}
        </span>
      </span>
    );
  }

  const trade = trades.find((item) => item.id === link.tradeId);

  return (
    <span className={baseClassName}>
      <Link2 className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
      <span className="truncate">
        {trade
          ? `${trade.symbol} · ${formatDateTime(trade.closedAt, locale)}`
          : labels.deletedTrade}
      </span>
    </span>
  );
}
