"use client";

import { useId, useSyncExternalStore } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";

interface MiniSparklineProps {
  // Raw numeric series (reused from existing data — no new computation here).
  data: number[];
  color: string;
  className?: string;
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function MiniSparkline({
  data,
  color,
  className,
}: MiniSparklineProps) {
  const isClient = useIsClient();
  // Strip colons so the id is a valid SVG url(#...) fragment reference.
  const gradientId = `spark-${useId().replace(/:/g, "")}`;
  const points = data.map((value, index) => ({ index, value }));

  return (
    <div className={cn("h-12 w-24 shrink-0", className)}>
      {isClient && points.length > 1 ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={points}
            margin={{ top: 4, right: 2, bottom: 2, left: 2 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full w-full rounded-md bg-[rgba(155,163,155,0.10)]" />
      )}
    </div>
  );
}
