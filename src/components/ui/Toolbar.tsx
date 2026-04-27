"use client";

import type { HTMLAttributes, ReactNode } from "react";

import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface ToolbarProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export default function Toolbar({ children, className, ...props }: ToolbarProps) {
  return (
    <Card
      as="section"
      density="compact"
      className={cn("overflow-hidden", className)}
      {...props}
    >
      {children}
    </Card>
  );
}
