export type TradeSide = "long" | "short";

export type TradeSetup =
  | "trendFollowing"
  | "breakout"
  | "scalping"
  | "meanReversion"
  | "other";

export type TradeStatus = "closed";

// "manual" trades are legacy rows whose pnl/rMultiple were hand-entered before
// the data model gained quantity/stopPrice (they cannot be recomputed). "computed"
// trades have pnl/rMultiple derived from the new fields. New/edited trades are
// always "computed"; pre-migration rows are read back as "manual".
export type TradePnlSource = "manual" | "computed";

export type Trade = {
  id: string;
  closedAt: string;
  symbol: string;
  side: TradeSide;
  setup: TradeSetup;
  entryPrice: number;
  exitPrice: number;
  // Optional so legacy rows (missing these before the migration) stay readable.
  // The entry form requires quantity/stopPrice as positive numbers for new trades.
  quantity?: number;
  stopPrice?: number;
  takeProfit?: number;
  fees?: number;
  // Leverage multiplier (e.g. 10 for 10x). Optional so legacy rows stay readable;
  // it never affects pnl/rMultiple — only the derived margin / return-on-margin.
  // Calculations default a missing value to 1x (see trade-calculations).
  leverage?: number;
  riskPercent: number;
  pnl: number;
  rMultiple: number;
  pnlSource?: TradePnlSource;
  // Relative paths under uploads/ (e.g. "uploads/trades/<id>-<ts>.png").
  screenshots?: string[];
  playbookId?: string;
  status: TradeStatus;
  notes?: string;
  tags?: string[];
};

export type TradeInput = Omit<Trade, "id">;
