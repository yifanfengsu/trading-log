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
  "bg-transparent px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--weak)]";

export const dataTableCellClassName =
  "px-3 py-2.5 text-sm text-[var(--muted)] tabular-nums";

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
    <div className={cn("overflow-x-auto", className)}>
      <table
        className={cn("w-full border-collapse", tableClassName)}
        style={tableStyle}
      >
        {children}
      </table>
    </div>
  );
}
