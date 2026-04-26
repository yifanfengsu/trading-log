"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  BarChart3,
  BookOpenText,
  CalendarDays,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  NotebookPen,
  Settings2,
  Target,
} from "lucide-react";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { sidebarMenuIds, type SidebarMenuId } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const menuIconMap: Record<SidebarMenuId, LucideIcon> = {
  dashboard: LayoutDashboard,
  trades: ArrowLeftRight,
  calendar: CalendarDays,
  analytics: BarChart3,
  reports: FileText,
  playbook: BookOpenText,
  notes: NotebookPen,
  goals: Target,
  settings: Settings2,
};

export default function Sidebar() {
  const { dictionary: copy } = useLanguage();
  const pathname = usePathname();

  return (
    <aside className="panel-card flex w-full shrink-0 flex-col gap-5 p-4 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-[280px] lg:p-5">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#8a74ff_0%,#6c4dff_52%,#4d7dff_100%)] shadow-[0_12px_24px_rgba(108,77,255,0.22)]">
          <div className="h-5 w-5 rounded-full border-2 border-white/90" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-[-0.02em] text-slate-900">
            {copy.appTitle}
          </p>
          <p className="text-xs text-slate-500">{copy.appSubtitle}</p>
        </div>
      </div>

      <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
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
                    : item === "reports"
                      ? "/reports"
                      : item === "settings"
                        ? "/settings"
                        : "#";
          const isActive =
            (item === "dashboard" && pathname === "/") ||
            (item === "trades" && pathname.startsWith("/trades")) ||
            (item === "calendar" && pathname.startsWith("/calendar")) ||
            (item === "analytics" && pathname.startsWith("/analytics")) ||
            (item === "reports" && pathname.startsWith("/reports")) ||
            (item === "settings" && pathname.startsWith("/settings"));
          const content = (
            <>
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  isActive ? "text-[var(--accent)]" : "text-slate-400",
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
                  ? "bg-[linear-gradient(135deg,rgba(108,77,255,0.16),rgba(108,77,255,0.08))] text-[var(--accent)] shadow-[inset_0_0_0_1px_rgba(108,77,255,0.12)]"
                  : "text-slate-600 hover:bg-white/70 hover:text-slate-900",
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
                  ? "bg-[linear-gradient(135deg,rgba(108,77,255,0.16),rgba(108,77,255,0.08))] text-[var(--accent)] shadow-[inset_0_0_0_1px_rgba(108,77,255,0.12)]"
                  : "text-slate-600 hover:bg-white/70 hover:text-slate-900",
              )}
            >
              {content}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[20px] border border-[rgba(108,77,255,0.12)] bg-[linear-gradient(180deg,rgba(108,77,255,0.10),rgba(255,255,255,0.96))] p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-[-0.02em] text-slate-900">
              {copy.promo.title}
            </p>
            <p className="mt-1 text-sm text-slate-500">{copy.promo.subtitle}</p>
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
              <stop offset="0%" stopColor="#c7bcff" />
              <stop offset="100%" stopColor="#6c4dff" />
            </linearGradient>
          </defs>
          <path
            d="M6 58 C32 58, 34 34, 58 36 C82 38, 86 18, 108 20 C132 22, 136 50, 166 50 C188 50, 200 30, 214 16"
            stroke="url(#sidebar-line)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="214" cy="16" r="5" fill="#6c4dff" />
        </svg>
      </div>
    </aside>
  );
}
