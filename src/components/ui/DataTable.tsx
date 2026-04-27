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
  "px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500";

export const dataTableCellClassName =
  "border-b border-slate-100 bg-white px-3 py-4 text-sm text-slate-600 first:rounded-l-[16px] last:rounded-r-[16px]";

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
        "overflow-x-auto rounded-[20px] border border-slate-200 bg-white/70 p-1",
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
