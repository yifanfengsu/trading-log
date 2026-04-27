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
  "bg-slate-50 px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 first:rounded-l-[16px] last:rounded-r-[16px]";

export const dataTableCellClassName =
  "border-b border-slate-100 bg-white px-3 py-4 text-sm text-slate-600 transition-colors first:rounded-l-[16px] last:rounded-r-[16px] group-hover:bg-slate-50/70";

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
        "overflow-x-auto rounded-[20px] border border-slate-200 bg-white/78 p-1 shadow-[0_8px_24px_rgba(30,41,59,0.035)]",
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
