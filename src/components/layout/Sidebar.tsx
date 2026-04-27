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
  LineChart,
  type LucideIcon,
  NotebookPen,
  Settings2,
  Target,
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
    <aside className="panel-card flex w-full shrink-0 flex-col gap-5 p-4 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-[276px] lg:p-5">
      <div className="flex items-center gap-3 px-1">
        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#8B7CF6_0%,#6D5DF6_55%,#4F7CFF_100%)] shadow-[0_14px_28px_rgba(109,93,246,0.24)]">
          <LineChart className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-normal text-slate-950">
            {copy.appTitle}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{copy.appSubtitle}</p>
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
                    : item === "reports"
                      ? "/reports"
                      : item === "playbook"
                        ? "/playbook"
                        : item === "notes"
                          ? "/notes"
                          : item === "goals"
                            ? "/goals"
                            : item === "settings"
                              ? "/settings"
                              : "#";
          const isActive =
            (item === "dashboard" && pathname === "/") ||
            (item === "trades" && pathname.startsWith("/trades")) ||
            (item === "calendar" && pathname.startsWith("/calendar")) ||
            (item === "analytics" && pathname.startsWith("/analytics")) ||
            (item === "reports" && pathname.startsWith("/reports")) ||
            (item === "playbook" && pathname.startsWith("/playbook")) ||
            (item === "notes" && pathname.startsWith("/notes")) ||
            (item === "goals" && pathname.startsWith("/goals")) ||
            (item === "settings" && pathname.startsWith("/settings"));
          const content = (
            <>
              <Icon
                className={cn(
                "h-[18px] w-[18px] shrink-0",
                  isActive ? "text-violet-600" : "text-slate-400",
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
                  ? "bg-violet-50 text-violet-600 shadow-[inset_0_0_0_1px_rgba(109,93,246,0.12)]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
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
                  ? "bg-violet-50 text-violet-600 shadow-[inset_0_0_0_1px_rgba(109,93,246,0.12)]"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
              )}
            >
              {content}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[20px] border border-violet-100 bg-[linear-gradient(180deg,rgba(109,93,246,0.08),rgba(255,255,255,0.98))] p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Badge variant="purple">{copy.monthlyLabel}</Badge>
            <p className="mt-3 text-sm font-semibold tracking-normal text-slate-950">
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
              <stop offset="100%" stopColor="#6d5df6" />
            </linearGradient>
          </defs>
          <path
            d="M6 58 C32 58, 34 34, 58 36 C82 38, 86 18, 108 20 C132 22, 136 50, 166 50 C188 50, 200 30, 214 16"
            stroke="url(#sidebar-line)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="214" cy="16" r="5" fill="#6d5df6" />
        </svg>
      </div>
    </aside>
  );
}
