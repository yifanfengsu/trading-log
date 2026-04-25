export type TradeSide = "long" | "short";

export type TradeSetup =
  | "trendFollowing"
  | "breakout"
  | "scalping"
  | "meanReversion"
  | "other";

export type TradeStatus = "closed";

export type Trade = {
  id: string;
  closedAt: string;
  symbol: string;
  side: TradeSide;
  setup: TradeSetup;
  entryPrice: number;
  exitPrice: number;
  riskPercent: number;
  pnl: number;
  rMultiple: number;
  status: TradeStatus;
  notes?: string;
  tags?: string[];
};

export type TradeInput = Omit<Trade, "id">;
