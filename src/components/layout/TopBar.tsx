"use client";

import {
  CalendarDays,
  Layers,
  Landmark,
  Plus,
  Target,
  type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSelectedMonth } from "@/components/providers/SelectedMonthProvider";
import { useTradeDrawer } from "@/components/providers/TradeDrawerProvider";
import type { SidebarMenuId } from "@/lib/mock-data";
import { cn, formatMonthRange } from "@/lib/utils";

interface FilterChipProps {
  icon: LucideIcon;
  label: string;
}

function FilterChip({ icon: Icon, label }: FilterChipProps) {
  return (
    <div className="soft-pill cursor-default justify-between" aria-hidden="true">
      <span className="flex min-w-0 items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="truncate">{label}</span>
      </span>
    </div>
  );
}

function getActiveMenuId(pathname: string): SidebarMenuId {
  if (pathname.startsWith("/trades")) {
    return "trades";
  }

  if (pathname.startsWith("/calendar")) {
    return "calendar";
  }

  if (pathname.startsWith("/analytics")) {
    return "analytics";
  }

  if (pathname.startsWith("/reports")) {
    return "reports";
  }

  if (pathname.startsWith("/playbook")) {
    return "playbook";
  }

  if (pathname.startsWith("/notes")) {
    return "notes";
  }

  if (pathname.startsWith("/goals")) {
    return "goals";
  }

  if (pathname.startsWith("/settings")) {
    return "settings";
  }

  return "dashboard";
}

export default function TopBar() {
  const { dictionary: copy, locale, setLocale } = useLanguage();
  const { selectedMonth } = useSelectedMonth();
  const { openCreateTrade } = useTradeDrawer();
  const pathname = usePathname();
  const activeMenuId = getActiveMenuId(pathname);

  return (
    <header className="panel-card flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--accent)]">
          {copy.menu[activeMenuId]}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-[30px]">
          {copy.appTitle}
        </h1>
      </div>

      <div className="flex flex-col gap-3 lg:items-end">
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
          <div className="inline-flex rounded-full bg-[rgba(108,77,255,0.10)] p-1">
            {(["zh", "en"] as const).map((item) => {
              const isActive = locale === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLocale(item)}
                  aria-pressed={isActive}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-all",
                    isActive
                      ? "bg-white text-[var(--accent)] shadow-[0_6px_16px_rgba(108,77,255,0.14)]"
                      : "text-slate-500 hover:text-slate-900",
                  )}
                >
                  {copy.language[item]}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={openCreateTrade}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(108,77,255,0.22)] transition-colors hover:bg-[var(--accent-strong)]"
          >
            <Plus className="h-4 w-4" />
            {copy.addTrade}
          </button>

          <div className="hidden h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#8a74ff_0%,#6c4dff_65%,#4d7dff_100%)] text-sm font-semibold text-white shadow-[0_12px_24px_rgba(108,77,255,0.22)] sm:flex">
            JD
          </div>
        </div>
      </div>
    </header>
  );
}
