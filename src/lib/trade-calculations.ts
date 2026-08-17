import type { Trade, TradeSetup, TradeSide } from "@/lib/trade-types";
import { DEFAULT_USER_SETTINGS } from "@/lib/settings-types";
import { getDateKey } from "@/lib/utils";

export const STARTING_BALANCE = DEFAULT_USER_SETTINGS.startingBalance;

// ============================================================================
// Per-trade derivation: pnl / initial risk / R-multiple / risk %
//
// These pure helpers are the single source of truth for turning the raw trade
// inputs (side, prices, quantity, fees, stop) into pnl and R. The entry form
// calls them for a live preview and again on submit so the persisted pnl /
// rMultiple are always system-computed, never hand-typed.
// ============================================================================

export interface PnlInput {
  side: TradeSide;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  fees?: number;
}

export interface InitialRiskInput {
  entryPrice: number;
  stopPrice: number;
  quantity: number;
}

export interface RMultipleInput {
  pnl: number;
  initialRisk: number;
}

export interface RiskPercentInput {
  initialRisk: number;
  accountBalance: number;
}

// Long: (exit - entry) * qty - fees. Short: (entry - exit) * qty - fees.
export function computePnl({
  side,
  entryPrice,
  exitPrice,
  quantity,
  fees,
}: PnlInput): number {
  const gross =
    side === "long"
      ? (exitPrice - entryPrice) * quantity
      : (entryPrice - exitPrice) * quantity;

  return gross - (fees ?? 0);
}

// Risk taken on the trade in account currency: |entry - stop| * qty.
export function computeInitialRisk({
  entryPrice,
  stopPrice,
  quantity,
}: InitialRiskInput): number {
  return Math.abs(entryPrice - stopPrice) * quantity;
}

// R-multiple = realized pnl / initial risk. Guards against divide-by-zero.
export function computeRMultiple({ pnl, initialRisk }: RMultipleInput): number {
  return initialRisk > 0 ? pnl / initialRisk : 0;
}

// Risk as a percentage of the account balance (uses STARTING_BALANCE by default).
export function computeRiskPercent({
  initialRisk,
  accountBalance,
}: RiskPercentInput): number {
  return accountBalance > 0 ? (initialRisk / accountBalance) * 100 : 0;
}

// ============================================================================
// Leverage-derived display metrics — capital efficiency only.
//
// These NEVER touch pnl or rMultiple: pnl is driven by price move × quantity,
// and R by the stop-defined risk — both independent of leverage. Leverage only
// changes how much principal a position actually ties up, so it feeds the two
// display-only metrics below (margin used + return on that margin).
// ============================================================================

export interface NotionalInput {
  entryPrice: number;
  quantity: number;
}

export interface MarginInput {
  entryPrice: number;
  quantity: number;
  leverage: number;
}

export interface ReturnOnMarginInput {
  pnl: number;
  margin: number;
}

// Notional position value = entry price × quantity (leverage-independent).
export function computeNotional({ entryPrice, quantity }: NotionalInput): number {
  return entryPrice * quantity;
}

// Margin actually tied up = notional / leverage. Guards divide-by-zero: a 0 /
// missing leverage falls back to 1x (i.e. margin == notional).
export function computeMargin({
  entryPrice,
  quantity,
  leverage,
}: MarginInput): number {
  return (entryPrice * quantity) / (leverage || 1);
}

// Return on margin = realized pnl / margin used, as a decimal (×100 to display
// as a percentage). Guards against divide-by-zero.
export function computeReturnOnMargin({
  pnl,
  margin,
}: ReturnOnMarginInput): number {
  return margin > 0 ? pnl / margin : 0;
}

export interface PeriodStats {
  netPnl: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  expectancy: number;
  bestTrade: Trade | null;
  worstTrade: Trade | null;
}

export interface CalendarStats {
  totalPnl: number;
  winningDays: number;
  losingDays: number;
  bestDayPnl: number;
  bestDayDate: string | null;
}

export interface EquityCurvePoint {
  date: string;
  pnl: number;
  equity: number;
}

export interface MaxDrawdown {
  amount: number;
  percent: number;
}

export interface StrategyStats {
  setup: TradeSetup;
  netPnl: number;
  totalTrades: number;
  winRate: number;
  profitFactor: number;
}

export interface PnlPeriodSummary {
  dailyPnl: number;
  weeklyPnl: number;
  monthlyPnl: number;
}

function compareTradesAsc(a: Trade, b: Trade) {
  return a.closedAt.localeCompare(b.closedAt);
}

function getMonthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function getTradesByMonth(trades: Trade[], year: number, month: number) {
  const monthKey = getMonthKey(year, month);
  return trades.filter((trade) => getDateKey(trade.closedAt).startsWith(monthKey));
}

export function getTradesByDate(trades: Trade[], date: string) {
  return trades.filter((trade) => getDateKey(trade.closedAt) === date);
}

export function getDailyPnlMap(
  trades: Trade[],
  year: number,
  month: number,
) {
  const dailyMap: Record<string, number> = {};

  for (const trade of getTradesByMonth(trades, year, month)) {
    const dateKey = getDateKey(trade.closedAt);
    dailyMap[dateKey] = (dailyMap[dateKey] ?? 0) + trade.pnl;
  }

  return dailyMap;
}

export function getPeriodStats(trades: Trade[]): PeriodStats {
  const winningTrades = trades.filter((trade) => trade.pnl > 0);
  const losingTrades = trades.filter((trade) => trade.pnl < 0);
  const grossProfit = winningTrades.reduce((total, trade) => total + trade.pnl, 0);
  const grossLoss = losingTrades.reduce((total, trade) => total + trade.pnl, 0);
  const netPnl = trades.reduce((total, trade) => total + trade.pnl, 0);
  const totalTrades = trades.length;
  const bestTrade =
    trades.length > 0
      ? trades.reduce((best, trade) => (trade.pnl > best.pnl ? trade : best))
      : null;
  const worstTrade =
    trades.length > 0
      ? trades.reduce((worst, trade) => (trade.pnl < worst.pnl ? trade : worst))
      : null;

  return {
    netPnl,
    totalTrades,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate: totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0,
    grossProfit,
    grossLoss,
    profitFactor:
      grossLoss < 0
        ? grossProfit / Math.abs(grossLoss)
        : grossProfit > 0
          ? Infinity
          : 0,
    averageWin:
      winningTrades.length > 0 ? grossProfit / winningTrades.length : 0,
    averageLoss:
      losingTrades.length > 0 ? grossLoss / losingTrades.length : 0,
    expectancy: totalTrades > 0 ? netPnl / totalTrades : 0,
    bestTrade,
    worstTrade,
  };
}

export function getCalendarStats(
  trades: Trade[],
  year: number,
  month: number,
): CalendarStats {
  const dailyMap = getDailyPnlMap(trades, year, month);
  const entries = Object.entries(dailyMap);
  const bestEntry = entries.reduce<[string | null, number]>(
    (best, [date, pnl]) => {
      if (best[0] === null || pnl > best[1]) {
        return [date, pnl];
      }

      return best;
    },
    [null, 0],
  );

  return {
    totalPnl: entries.reduce((total, [, pnl]) => total + pnl, 0),
    winningDays: entries.filter(([, pnl]) => pnl > 0).length,
    losingDays: entries.filter(([, pnl]) => pnl < 0).length,
    bestDayPnl: bestEntry[1],
    bestDayDate: bestEntry[0],
  };
}

export function getEquityCurveData(trades: Trade[]): EquityCurvePoint[] {
  const sortedTrades = [...trades].sort(compareTradesAsc);
  let equity = 0;

  return sortedTrades.map((trade) => {
    equity += trade.pnl;

    return {
      date: getDateKey(trade.closedAt),
      pnl: trade.pnl,
      equity,
    };
  });
}

export function getMaxDrawdown(
  trades: Trade[],
  startingBalance = STARTING_BALANCE,
): MaxDrawdown {
  let peak = 0;
  let maxDrawdown = 0;

  for (const point of getEquityCurveData(trades)) {
    peak = Math.max(peak, point.equity);
    maxDrawdown = Math.max(maxDrawdown, peak - point.equity);
  }

  return {
    amount: maxDrawdown,
    percent:
      startingBalance > 0 ? (maxDrawdown / startingBalance) * 100 : 0,
  };
}

export function getStrategyStats(trades: Trade[]): StrategyStats[] {
  const grouped = new Map<TradeSetup, Trade[]>();

  for (const trade of trades) {
    grouped.set(trade.setup, [...(grouped.get(trade.setup) ?? []), trade]);
  }

  return Array.from(grouped.entries())
    .map(([setup, setupTrades]) => {
      const stats = getPeriodStats(setupTrades);

      return {
        setup,
        netPnl: stats.netPnl,
        totalTrades: stats.totalTrades,
        winRate: stats.winRate,
        profitFactor: stats.profitFactor,
      };
    })
    .sort((a, b) => b.netPnl - a.netPnl);
}

export function getDailyWeeklyMonthlyPnl(
  trades: Trade[],
  activeDate: string,
): PnlPeriodSummary {
  const [year, month, day] = activeDate.split("-").map(Number);
  const active = new Date(year, month - 1, day);
  const dayOfWeek = active.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(year, month - 1, day + mondayOffset);
  const weekEnd = new Date(
    weekStart.getFullYear(),
    weekStart.getMonth(),
    weekStart.getDate() + 6,
  );
  const monthKey = getMonthKey(year, month);

  return trades.reduce<PnlPeriodSummary>(
    (summary, trade) => {
      const dateKey = getDateKey(trade.closedAt);
      const [tradeYear, tradeMonth, tradeDay] = dateKey.split("-").map(Number);
      const tradeDate = new Date(tradeYear, tradeMonth - 1, tradeDay);

      if (dateKey === activeDate) {
        summary.dailyPnl += trade.pnl;
      }

      if (tradeDate >= weekStart && tradeDate <= weekEnd) {
        summary.weeklyPnl += trade.pnl;
      }

      if (dateKey.startsWith(monthKey)) {
        summary.monthlyPnl += trade.pnl;
      }

      return summary;
    },
    {
      dailyPnl: 0,
      weeklyPnl: 0,
      monthlyPnl: 0,
    },
  );
}
