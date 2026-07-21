"use client";

import {
  CalendarDays,
  Layers,
  Landmark,
  Plus,
  Target,
  type LucideIcon,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSelectedMonth } from "@/components/providers/SelectedMonthProvider";
import { useTradeDrawer } from "@/components/providers/TradeDrawerProvider";
import Button from "@/components/ui/Button";
import { cn, formatMonthRange } from "@/lib/utils";

interface FilterChipProps {
  icon: LucideIcon;
  label: string;
}

function FilterChip({ icon: Icon, label }: FilterChipProps) {
  return (
    // Read-only context, not a control — kept visually quiet (no fill, hairline
    // outline) so it does not advertise a click that goes nowhere.
    <div
      className="inline-flex h-8 max-w-full cursor-default items-center gap-2 rounded-full border border-[var(--inner-border)] px-3 text-[13px] font-medium text-[var(--muted)]"
      aria-hidden="true"
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--weak)]" />
        <span className="truncate">{label}</span>
      </span>
    </div>
  );
}

export default function TopBar() {
  const { dictionary: copy, locale, setLocale } = useLanguage();
  const { selectedMonth } = useSelectedMonth();
  const { openCreateTrade } = useTradeDrawer();

  return (
    <header className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--card-border)] bg-[var(--card)] px-3.5 py-3 shadow-[var(--shadow-card)] sm:px-4 lg:flex-row lg:items-center lg:justify-between lg:px-5">
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          icon={CalendarDays}
          label={formatMonthRange(selectedMonth, locale)}
        />
        <FilterChip icon={Landmark} label={copy.allAccounts} />
        <FilterChip icon={Layers} label={copy.allMarkets} />
        <FilterChip icon={Target} label={copy.allStrategies} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
        <div className="inline-flex rounded-full border border-[var(--inner-border)] bg-[var(--card-strong)] p-0.5">
          {(["zh", "en"] as const).map((item) => {
            const isActive = locale === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() => setLocale(item)}
                aria-pressed={isActive}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[13px] font-semibold transition-all",
                  isActive
                    ? "bg-[var(--accent)] text-[#0a0b0a]"
                    : "text-slate-400 hover:text-slate-50",
                )}
              >
                {copy.language[item]}
              </button>
            );
          })}
        </div>

        <Button onClick={openCreateTrade} size="sm" title={copy.addTrade}>
          <Plus className="h-4 w-4" />
          {copy.addTrade}
        </Button>

        <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-[#0a0b0a] sm:flex">
          JD
        </div>
      </div>
    </header>
  );
}
