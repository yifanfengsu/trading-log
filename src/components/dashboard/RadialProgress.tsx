"use client";

import { useSyncExternalStore } from "react";
import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";

import { cn } from "@/lib/utils";

interface RadialProgressProps {
  // Already-normalized 0–100 fill ratio.
  value: number;
  color: string;
  trackColor?: string;
  size?: number;
  centerLabel?: string;
  className?: string;
}

// Mirrors the SSR/hydration gate the other recharts charts use so the chart only
// mounts on the client.
function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function RadialProgress({
  value,
  color,
  trackColor = "rgba(155,163,155,0.16)",
  size = 64,
  centerLabel,
  className,
}: RadialProgressProps) {
  const isClient = useIsClient();
  const clamped = Math.max(0, Math.min(100, value));
  const data = [{ name: "value", value: clamped }];

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {isClient ? (
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="68%"
            outerRadius="100%"
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <RadialBar
              background={{ fill: trackColor }}
              dataKey="value"
              cornerRadius={999}
              fill={color}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      ) : (
        <div
          className="h-full w-full rounded-full"
          style={{ border: `4px solid ${trackColor}` }}
        />
      )}
      {centerLabel ? (
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums text-slate-100">
          {centerLabel}
        </span>
      ) : null}
    </div>
  );
}
