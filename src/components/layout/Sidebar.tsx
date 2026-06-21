"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  BarChart3,
  BookOpenText,
  CalendarDays,
  LayoutDashboard,
  LineChart,
  type LucideIcon,
  Settings2,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import Badge from "@/components/ui/Badge";
import { sidebarMenuIds, type SidebarMenuId } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const menuIconMap: Record<SidebarMenuId, LucideIcon> = {
  dashboard: LayoutDashboard,
  trades: ArrowLeftRight,
  calendar: CalendarDays,
  analytics: BarChart3,
  playbook: BookOpenText,
  settings: Settings2,
};

export default function Sidebar() {
  const { dictionary: copy } = useLanguage();
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col gap-5 rounded-[24px] border border-white/10 bg-[rgba(8,13,28,0.82)] p-4 shadow-[0_24px_80px_rgba(2,6,23,0.36)] backdrop-blur-xl lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-[276px] lg:p-5">
      <div className="flex items-center gap-3 px-1">
        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#7C5CFF_0%,#6366F1_50%,#22D3EE_100%)] shadow-[0_16px_34px_rgba(124,92,255,0.34)]">
          <LineChart className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-normal text-slate-50">
            {copy.appTitle}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">{copy.appSubtitle}</p>
        </div>
      </div>

      <nav className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
        {sidebarMenuIds.map((item) => {
          const Icon = menuIconMap[item];
          const href =
            item === "dashboard"
              ? "/"
              : item === "trades"
                ? "/trades"
                : item === "calendar"
                  ? "/calendar"
                  : item === "analytics"
                    ? "/analytics"
                    : item === "playbook"
                      ? "/playbook"
                      : item === "settings"
                        ? "/settings"
                        : "#";
          const isActive =
            (item === "dashboard" && pathname === "/") ||
            (item === "trades" && pathname.startsWith("/trades")) ||
            (item === "calendar" && pathname.startsWith("/calendar")) ||
            (item === "analytics" && pathname.startsWith("/analytics")) ||
            (item === "playbook" && pathname.startsWith("/playbook")) ||
            (item === "settings" && pathname.startsWith("/settings"));
          const content = (
            <>
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  isActive ? "text-white" : "text-slate-500",
                )}
              />
              <span className="truncate">{copy.menu[item]}</span>
            </>
          );

          return href === "#" ? (
            <button
              key={item}
              type="button"
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all",
                isActive
                  ? "bg-[linear-gradient(135deg,rgba(124,92,255,0.22),rgba(34,211,238,0.08))] text-white shadow-[inset_0_0_0_1px_rgba(124,92,255,0.24),0_0_24px_rgba(124,92,255,0.12)]"
                  : "text-slate-400 hover:bg-[rgba(124,92,255,0.10)] hover:text-slate-50",
              )}
            >
              {content}
            </button>
          ) : (
            <Link
              key={item}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all",
                isActive
                  ? "bg-[linear-gradient(135deg,rgba(124,92,255,0.22),rgba(34,211,238,0.08))] text-white shadow-[inset_0_0_0_1px_rgba(124,92,255,0.24),0_0_24px_rgba(124,92,255,0.12)]"
                  : "text-slate-400 hover:bg-[rgba(124,92,255,0.10)] hover:text-slate-50",
              )}
            >
              {content}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto overflow-hidden rounded-[20px] border border-[rgba(124,92,255,0.24)] bg-[linear-gradient(180deg,rgba(124,92,255,0.16),rgba(15,23,42,0.84))] p-4 shadow-[0_0_32px_rgba(124,92,255,0.10)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Badge variant="purple">{copy.monthlyLabel}</Badge>
            <p className="mt-3 text-sm font-semibold tracking-normal text-slate-50">
              {copy.promo.title}
            </p>
            <p className="mt-1 text-sm text-slate-400">{copy.promo.subtitle}</p>
          </div>
        </div>
        <svg
          viewBox="0 0 220 80"
          className="mt-4 h-[72px] w-full overflow-visible"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="sidebar-line" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="100%" stopColor="#7C5CFF" />
            </linearGradient>
          </defs>
          <path
            d="M6 58 C32 58, 34 34, 58 36 C82 38, 86 18, 108 20 C132 22, 136 50, 166 50 C188 50, 200 30, 214 16"
            stroke="url(#sidebar-line)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="214" cy="16" r="5" fill="#22D3EE" />
        </svg>
      </div>
    </aside>
  );
}
