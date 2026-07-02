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
  "bg-transparent px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--weak)] first:rounded-l-[16px] last:rounded-r-[16px]";

export const dataTableCellClassName =
  "bg-[var(--card)] px-3 py-4 text-sm text-[var(--muted)] tabular-nums transition-colors first:rounded-l-[16px] last:rounded-r-[16px] group-hover:bg-[var(--card-hover)]";

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
        "overflow-x-auto rounded-[20px] bg-[var(--background)] p-1",
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
