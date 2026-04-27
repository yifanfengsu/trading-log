"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-normal text-slate-950 sm:text-[30px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-[15px]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </section>
  );
}
