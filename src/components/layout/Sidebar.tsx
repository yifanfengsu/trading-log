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
    <aside className="flex w-full shrink-0 flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--card-border)] bg-[var(--card)] p-3.5 shadow-[var(--shadow-card)] lg:sticky lg:top-5 lg:h-[calc(100vh-2.5rem)] lg:w-[248px] lg:p-4">
      <div className="flex items-center gap-2.5 px-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[var(--accent)]">
          <LineChart className="h-5 w-5 text-[#0a0b0a]" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-[-0.01em] text-slate-50">
            {copy.appTitle}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-slate-400">
            {copy.appSubtitle}
          </p>
        </div>
      </div>

      <nav className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
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
                  isActive ? "text-[#0a0b0a]" : "text-slate-500",
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
                "flex items-center gap-2.5 rounded-full px-3.5 py-2.5 text-left text-sm font-medium transition-all",
                isActive
                  ? "bg-[var(--accent)] font-semibold text-[#0a0b0a]"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-50",
              )}
            >
              {content}
            </button>
          ) : (
            <Link
              key={item}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-full px-3.5 py-2.5 text-left text-sm font-medium transition-all",
                isActive
                  ? "bg-[var(--accent)] font-semibold text-[#0a0b0a]"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-50",
              )}
            >
              {content}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto overflow-hidden rounded-[var(--radius-inner)] border border-[var(--inner-border)] bg-[var(--card-strong)] p-3.5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <Badge variant="cyan">{copy.monthlyLabel}</Badge>
            <p className="mt-2.5 text-[13px] font-semibold tracking-[-0.01em] text-slate-50">
              {copy.promo.title}
            </p>
            <p className="mt-0.5 text-xs leading-5 text-slate-400">
              {copy.promo.subtitle}
            </p>
          </div>
        </div>
        <svg
          viewBox="0 0 220 80"
          className="mt-3 h-14 w-full overflow-visible"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="sidebar-line" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stopColor="#8FC220" />
              <stop offset="100%" stopColor="#B8F135" />
            </linearGradient>
          </defs>
          <path
            d="M6 58 C32 58, 34 34, 58 36 C82 38, 86 18, 108 20 C132 22, 136 50, 166 50 C188 50, 200 30, 214 16"
            stroke="url(#sidebar-line)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="214" cy="16" r="5" fill="#B8F135" />
        </svg>
      </div>
    </aside>
  );
}
