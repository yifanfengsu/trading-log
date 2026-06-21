import type { CSSProperties } from "react";

// Presentation-only helper (no business logic / no data access): turns a day's
// realized P&L into a green/red "heat" fill whose depth scales with the
// magnitude relative to the month's largest absolute P&L. Bigger win/loss =>
// deeper, more saturated block. Shared by both calendars so the dashboard mini
// calendar and the full calendar render identical heat.
const PROFIT_RGB = "16, 185, 129"; // emerald — matches --success-soft hue
const LOSS_RGB = "244, 63, 94"; // rose — matches --danger-soft hue

// Largest absolute daily P&L in the month, used to normalize the heat scale.
export function getMaxAbsPnl(dailyPnlMap: Record<string, number>): number {
  let max = 0;
  for (const value of Object.values(dailyPnlMap)) {
    const magnitude = Math.abs(value);
    if (magnitude > max) {
      max = magnitude;
    }
  }
  return max;
}

export function getPnlHeatStyle(pnl: number, maxAbsPnl: number): CSSProperties {
  const ratio = maxAbsPnl > 0 ? Math.min(1, Math.abs(pnl) / maxAbsPnl) : 0;
  // sqrt easing lifts small/medium days so they still read clearly, while the
  // biggest day of the month stays the most saturated.
  const intensity = Math.sqrt(ratio);
  const fill = 0.14 + 0.46 * intensity; // 0.14 -> 0.60
  const edge = 0.3 + 0.4 * intensity; // 0.30 -> 0.70
  const rgb = pnl >= 0 ? PROFIT_RGB : LOSS_RGB;

  return {
    background: `linear-gradient(160deg, rgba(${rgb}, ${fill}) 0%, rgba(${rgb}, ${fill * 0.5}) 70%, rgba(15, 23, 42, 0.55) 100%)`,
    borderColor: `rgba(${rgb}, ${edge})`,
  };
}
