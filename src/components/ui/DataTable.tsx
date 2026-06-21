"use client";

import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface DataTableProps {
  children: ReactNode;
  minWidth?: number | string;
  className?: string;
  tableClassName?: string;
}

export const dataTableHeadCellClassName =
  "bg-[rgba(2,6,23,0.42)] px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-400 first:rounded-l-[16px] last:rounded-r-[16px]";

export const dataTableCellClassName =
  "border-b border-white/5 bg-[rgba(15,23,42,0.46)] px-3 py-4 text-sm text-slate-300 transition-colors first:rounded-l-[16px] last:rounded-r-[16px] group-hover:bg-[rgba(124,92,255,0.08)]";

export default function DataTable({
  children,
  minWidth = 720,
  className,
  tableClassName,
}: DataTableProps) {
  const tableStyle: CSSProperties = {
    minWidth: typeof minWidth === "number" ? `${minWidth}px` : minWidth,
  };

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-[20px] border border-white/10 bg-[rgba(2,6,23,0.24)] p-1 shadow-[0_12px_34px_rgba(2,6,23,0.22)]",
        className,
      )}
    >
      <table
        className={cn("w-full border-separate border-spacing-y-1", tableClassName)}
        style={tableStyle}
      >
        {children}
      </table>
    </div>
  );
}
