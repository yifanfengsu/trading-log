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
import Button from "@/components/ui/Button";
import type { SidebarMenuId } from "@/lib/mock-data";
import { cn, formatMonthRange } from "@/lib/utils";

interface FilterChipProps {
  icon: LucideIcon;
  label: string;
}

function FilterChip({ icon: Icon, label }: FilterChipProps) {
  return (
    <div
      className="inline-flex h-10 max-w-full cursor-default items-center gap-2 rounded-full border border-white/10 bg-[rgba(15,23,42,0.62)] px-3 text-sm font-medium text-slate-300 shadow-[0_10px_24px_rgba(2,6,23,0.20)]"
      aria-hidden="true"
    >
      <span className="flex min-w-0 items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-slate-500" />
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
    <header className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-[rgba(15,23,42,0.50)] px-4 py-4 shadow-[0_18px_58px_rgba(2,6,23,0.26)] backdrop-blur-xl sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
          {copy.menu[activeMenuId]}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-normal text-slate-50 sm:text-[30px]">
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
          <div className="inline-flex rounded-full border border-white/10 bg-[rgba(2,6,23,0.34)] p-1">
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
                      ? "bg-[linear-gradient(135deg,rgba(124,92,255,0.38),rgba(34,211,238,0.18))] text-white shadow-[0_8px_20px_rgba(124,92,255,0.20)]"
                      : "text-slate-400 hover:text-slate-50",
                  )}
                >
                  {copy.language[item]}
                </button>
              );
            })}
          </div>

          <Button
            onClick={openCreateTrade}
            title={copy.addTrade}
          >
            <Plus className="h-4 w-4" />
            {copy.addTrade}
          </Button>

          <div className="hidden h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#7C5CFF_0%,#6366F1_55%,#22D3EE_100%)] text-sm font-semibold text-white shadow-[0_14px_30px_rgba(124,92,255,0.30)] ring-1 ring-white/10 sm:flex">
            JD
          </div>
        </div>
      </div>
    </header>
  );
}
