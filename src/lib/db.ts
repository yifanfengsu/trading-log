import path from "node:path";

import Database from "better-sqlite3";

import type {
  Goal,
  GoalCategory,
  GoalDirection,
  GoalMetric,
  GoalPeriodType,
  GoalStatus,
  GoalUnit,
} from "@/lib/goal-types";
import { normalizeGoal } from "@/lib/goal-types";
import type { Note, NoteLink, NoteStatus, NoteType } from "@/lib/note-types";
import { isNoteLink, normalizeNote } from "@/lib/note-types";
import type {
  Playbook,
  PlaybookChecklistItem,
  PlaybookStatus,
} from "@/lib/playbook-types";
import { isPlaybookChecklistItem, normalizePlaybook } from "@/lib/playbook-types";
import type {
  DailyReview,
  DailyReviewScore,
  ReviewEmotion,
} from "@/lib/review-types";
import { dailyReviewScores, reviewEmotions } from "@/lib/review-types";
import type { PeriodReport, ReportPeriodType } from "@/lib/report-types";
import type { CurrencyCode, UserSettings } from "@/lib/settings-types";
import { DEFAULT_USER_SETTINGS, normalizeUserSettings } from "@/lib/settings-types";
import type {
  Trade,
  TradeSetup,
  TradeSide,
  TradeStatus,
} from "@/lib/trade-types";

// The SQLite file lives at the project root (process.cwd() in dev/start).
// It is git-ignored; back it up by copying this file.
const DB_FILENAME = "trades.db";

// Shape of a row as stored in SQLite (snake_case columns). The snake_case <->
// camelCase mapping is contained entirely within this module so that the API
// routes, the React stores and the Trade/TradeInput contract never have to
// know that the on-disk representation differs.
interface TradeRow {
  id: string;
  closed_at: string;
  symbol: string;
  side: string;
  setup: string;
  entry_price: number;
  exit_price: number;
  risk_percent: number;
  pnl: number;
  r_multiple: number;
  playbook_id: string | null;
  status: string;
  notes: string | null;
  tags: string | null;
  // Extended trade-model columns. All nullable so pre-migration rows (which
  // never had them) read back cleanly as undefined / "manual".
  quantity: number | null;
  stop_price: number | null;
  take_profit: number | null;
  fees: number | null;
  leverage: number | null; // multiplier (e.g. 10 = 10x); NULL on pre-leverage rows
  screenshots: string | null; // JSON string[] of relative upload paths
  pnl_source: string | null; // "manual" (legacy) | "computed"
}

// Parameters bound to the INSERT / UPDATE prepared statements.
interface TradeWriteParams {
  id: string;
  closed_at: string;
  symbol: string;
  side: string;
  setup: string;
  entry_price: number;
  exit_price: number;
  risk_percent: number;
  pnl: number;
  r_multiple: number;
  playbook_id: string | null;
  status: string;
  notes: string | null;
  tags: string | null;
  quantity: number | null;
  stop_price: number | null;
  take_profit: number | null;
  fees: number | null;
  leverage: number | null;
  screenshots: string | null;
  pnl_source: string;
}

let database: Database.Database | null = null;

// Lazily open (and create) the database. Doing this lazily keeps `next build`
// from touching the filesystem when it merely evaluates the route modules.
function getDb(): Database.Database {
  if (database) {
    return database;
  }

  const db = new Database(path.join(process.cwd(), DB_FILENAME));
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS trades (
      id TEXT PRIMARY KEY,
      closed_at TEXT NOT NULL,
      symbol TEXT NOT NULL,
      side TEXT NOT NULL,
      setup TEXT NOT NULL,
      entry_price REAL NOT NULL,
      exit_price REAL NOT NULL,
      risk_percent REAL NOT NULL,
      pnl REAL NOT NULL,
      r_multiple REAL NOT NULL,
      playbook_id TEXT,
      status TEXT NOT NULL DEFAULT 'closed',
      notes TEXT,
      tags TEXT,
      quantity REAL,
      stop_price REAL,
      take_profit REAL,
      fees REAL,
      leverage REAL,
      screenshots TEXT,
      pnl_source TEXT
    );
  `);

  // Bring an existing trades table (created before the extended trade model) up
  // to date. ADD COLUMN is non-destructive: existing rows get NULL for the new
  // columns and keep all their data. Idempotent — skips columns already present.
  ensureTradeColumns(db);

  // All other domains share this same file and singleton connection. Array and
  // nested-object fields are stored as JSON strings (see the per-domain row <->
  // object mappers below); the snake_case <-> camelCase translation never
  // leaks past this module.
  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      metric TEXT NOT NULL,
      direction TEXT NOT NULL,
      target_value REAL NOT NULL,
      unit TEXT NOT NULL,
      period_type TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      manual_current_value REAL,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL DEFAULT 'general',
      status TEXT NOT NULL DEFAULT 'active',
      pinned INTEGER NOT NULL DEFAULT 0,
      tags TEXT NOT NULL DEFAULT '[]',
      link TEXT NOT NULL DEFAULT '{"type":"none"}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS playbooks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      setup TEXT NOT NULL DEFAULT 'other',
      market TEXT NOT NULL DEFAULT '',
      timeframes TEXT NOT NULL DEFAULT '[]',
      description TEXT NOT NULL DEFAULT '',
      entry_rules TEXT NOT NULL DEFAULT '[]',
      exit_rules TEXT NOT NULL DEFAULT '[]',
      risk_rules TEXT NOT NULL DEFAULT '[]',
      invalidation_rules TEXT NOT NULL DEFAULT '[]',
      checklist TEXT NOT NULL DEFAULT '[]',
      tags TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS daily_reviews (
      date TEXT PRIMARY KEY,
      rules_followed TEXT NOT NULL DEFAULT '',
      main_mistake TEXT NOT NULL DEFAULT '',
      market_condition TEXT NOT NULL DEFAULT '',
      tomorrow_focus TEXT NOT NULL DEFAULT '',
      emotion TEXT NOT NULL DEFAULT 'neutral',
      score INTEGER NOT NULL DEFAULT 3,
      notes TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS period_reports (
      id TEXT PRIMARY KEY,
      period_type TEXT NOT NULL,
      period_key TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      summary TEXT NOT NULL DEFAULT '',
      key_wins TEXT NOT NULL DEFAULT '',
      key_mistakes TEXT NOT NULL DEFAULT '',
      lessons TEXT NOT NULL DEFAULT '',
      next_actions TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      id TEXT PRIMARY KEY,
      currency TEXT NOT NULL,
      starting_balance REAL NOT NULL,
      default_symbol TEXT NOT NULL,
      default_side TEXT NOT NULL,
      default_setup TEXT NOT NULL,
      default_risk_percent REAL NOT NULL
    );
  `);

  database = db;
  return db;
}

// Additive, idempotent schema migration for the trades table. Reads the current
// columns via PRAGMA and ADDs any that are missing. Only ever adds nullable
// columns — never drops, rebuilds, or rewrites existing data.
function ensureTradeColumns(db: Database.Database) {
  const existing = new Set(
    (db.prepare("PRAGMA table_info(trades)").all() as { name: string }[]).map(
      (column) => column.name,
    ),
  );

  const expectedColumns: Array<[name: string, type: string]> = [
    ["quantity", "REAL"],
    ["stop_price", "REAL"],
    ["take_profit", "REAL"],
    ["fees", "REAL"],
    ["leverage", "REAL"],
    ["screenshots", "TEXT"],
    ["pnl_source", "TEXT"],
  ];

  for (const [name, type] of expectedColumns) {
    if (!existing.has(name)) {
      db.exec(`ALTER TABLE trades ADD COLUMN ${name} ${type}`);
    }
  }
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Read side: snake_case row -> camelCase Trade.
function rowToTrade(row: TradeRow): Trade {
  let tags: string[] | undefined;

  if (row.tags) {
    try {
      const parsed: unknown = JSON.parse(row.tags);
      tags = isStringArray(parsed) ? parsed : undefined;
    } catch {
      tags = undefined;
    }
  }

  let screenshots: string[] = [];

  if (row.screenshots) {
    try {
      const parsed: unknown = JSON.parse(row.screenshots);
      screenshots = isStringArray(parsed) ? parsed : [];
    } catch {
      screenshots = [];
    }
  }

  const trade: Trade = {
    id: row.id,
    closedAt: row.closed_at,
    symbol: row.symbol,
    side: row.side as TradeSide,
    setup: row.setup as TradeSetup,
    entryPrice: row.entry_price,
    exitPrice: row.exit_price,
    riskPercent: row.risk_percent,
    pnl: row.pnl,
    rMultiple: row.r_multiple,
    // Legacy rows (NULL pnl_source) are treated as hand-entered "manual" data so
    // their pnl/rMultiple are shown as-is and never recomputed.
    pnlSource: row.pnl_source === "computed" ? "computed" : "manual",
    screenshots,
    status: row.status as TradeStatus,
  };

  // Pre-migration rows store NULL for these — map to undefined, never coerce to
  // 0 (which would look like a real value).
  if (row.quantity !== null) {
    trade.quantity = row.quantity;
  }
  if (row.stop_price !== null) {
    trade.stopPrice = row.stop_price;
  }
  if (row.take_profit !== null) {
    trade.takeProfit = row.take_profit;
  }
  if (row.fees !== null) {
    trade.fees = row.fees;
  }
  if (row.leverage !== null) {
    trade.leverage = row.leverage;
  }
  if (row.playbook_id !== null) {
    trade.playbookId = row.playbook_id;
  }
  if (row.notes !== null) {
    trade.notes = row.notes;
  }
  if (tags !== undefined) {
    trade.tags = tags;
  }

  return trade;
}

// Write side: camelCase Trade-shaped payload -> snake_case bind params.
// Throws on a structurally invalid payload so the route can answer 400.
function toWriteParams(input: unknown): TradeWriteParams {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("Invalid trade payload: expected an object");
  }

  const trade = input as Record<string, unknown>;

  if (
    typeof trade.id !== "string" ||
    typeof trade.closedAt !== "string" ||
    typeof trade.symbol !== "string" ||
    (trade.side !== "long" && trade.side !== "short") ||
    typeof trade.setup !== "string" ||
    !isFiniteNumber(trade.entryPrice) ||
    !isFiniteNumber(trade.exitPrice) ||
    !isFiniteNumber(trade.riskPercent) ||
    !isFiniteNumber(trade.pnl) ||
    !isFiniteNumber(trade.rMultiple)
  ) {
    throw new Error("Invalid trade payload: missing or malformed fields");
  }

  return {
    id: trade.id,
    closed_at: trade.closedAt,
    symbol: trade.symbol,
    side: trade.side,
    setup: trade.setup,
    entry_price: trade.entryPrice,
    exit_price: trade.exitPrice,
    risk_percent: trade.riskPercent,
    pnl: trade.pnl,
    r_multiple: trade.rMultiple,
    playbook_id: typeof trade.playbookId === "string" ? trade.playbookId : null,
    status: typeof trade.status === "string" ? trade.status : "closed",
    notes: typeof trade.notes === "string" ? trade.notes : null,
    tags: isStringArray(trade.tags) ? JSON.stringify(trade.tags) : null,
    // New trade-model fields. Each is optional: a payload that omits them (an
    // old backup being re-imported) persists NULL and stays valid.
    quantity: isFiniteNumber(trade.quantity) ? trade.quantity : null,
    stop_price: isFiniteNumber(trade.stopPrice) ? trade.stopPrice : null,
    take_profit: isFiniteNumber(trade.takeProfit) ? trade.takeProfit : null,
    fees: isFiniteNumber(trade.fees) ? trade.fees : null,
    leverage: isFiniteNumber(trade.leverage) ? trade.leverage : null,
    screenshots: isStringArray(trade.screenshots)
      ? JSON.stringify(trade.screenshots)
      : null,
    // Default to "manual" unless the payload explicitly says "computed", so
    // seed/legacy imports are never mislabeled as system-computed.
    pnl_source: trade.pnlSource === "computed" ? "computed" : "manual",
  };
}

const INSERT_SQL = `
  INSERT INTO trades (
    id, closed_at, symbol, side, setup, entry_price, exit_price,
    risk_percent, pnl, r_multiple, playbook_id, status, notes, tags,
    quantity, stop_price, take_profit, fees, leverage, screenshots, pnl_source
  ) VALUES (
    @id, @closed_at, @symbol, @side, @setup, @entry_price, @exit_price,
    @risk_percent, @pnl, @r_multiple, @playbook_id, @status, @notes, @tags,
    @quantity, @stop_price, @take_profit, @fees, @leverage, @screenshots, @pnl_source
  )
`;

const UPDATE_SQL = `
  UPDATE trades SET
    closed_at = @closed_at,
    symbol = @symbol,
    side = @side,
    setup = @setup,
    entry_price = @entry_price,
    exit_price = @exit_price,
    risk_percent = @risk_percent,
    pnl = @pnl,
    r_multiple = @r_multiple,
    playbook_id = @playbook_id,
    status = @status,
    notes = @notes,
    tags = @tags,
    quantity = @quantity,
    stop_price = @stop_price,
    take_profit = @take_profit,
    fees = @fees,
    leverage = @leverage,
    screenshots = @screenshots,
    pnl_source = @pnl_source
  WHERE id = @id
`;

export function getAllTrades(): Trade[] {
  const rows = getDb()
    .prepare("SELECT * FROM trades ORDER BY closed_at DESC")
    .all() as TradeRow[];

  return rows.map(rowToTrade);
}

export function getTradeById(id: string): Trade | null {
  const row = getDb().prepare("SELECT * FROM trades WHERE id = ?").get(id) as
    | TradeRow
    | undefined;

  return row ? rowToTrade(row) : null;
}

export function insertTrade(input: unknown): Trade {
  const params = toWriteParams(input);
  getDb().prepare(INSERT_SQL).run(params);

  return getTradeById(params.id) as Trade;
}

// Returns the updated Trade, or null when no row matched the id.
export function updateTrade(id: string, input: unknown): Trade | null {
  const merged =
    typeof input === "object" && input !== null && !Array.isArray(input)
      ? { ...(input as Record<string, unknown>), id }
      : input;

  const params = toWriteParams(merged);
  const result = getDb().prepare(UPDATE_SQL).run(params);

  return result.changes > 0 ? getTradeById(id) : null;
}

// Returns true when a row was deleted.
export function deleteTrade(id: string): boolean {
  const result = getDb().prepare("DELETE FROM trades WHERE id = ?").run(id);
  return result.changes > 0;
}

// Atomically replace the entire trades table with the provided list and return
// the persisted result. Used for the one-time localStorage migration and for
// backup restore / clear / reset-to-seed. All items are validated before the
// transaction runs, so a single bad row aborts the whole import.
export function replaceAllTrades(input: unknown): Trade[] {
  if (!Array.isArray(input)) {
    throw new Error("Invalid import payload: expected an array of trades");
  }

  const paramsList = input.map(toWriteParams);
  const db = getDb();
  const insert = db.prepare(INSERT_SQL);

  const runReplace = db.transaction((items: TradeWriteParams[]) => {
    db.prepare("DELETE FROM trades").run();
    for (const item of items) {
      insert.run(item);
    }
  });

  runReplace(paramsList);

  return getAllTrades();
}

// ============================================================================
// Goals
// ============================================================================

interface GoalRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  metric: string;
  direction: string;
  target_value: number;
  unit: string;
  period_type: string;
  start_date: string;
  end_date: string;
  status: string;
  manual_current_value: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

type GoalWriteParams = GoalRow;

function rowToGoal(row: GoalRow): Goal {
  const goal: Goal = {
    id: row.id,
    title: row.title,
    category: row.category as GoalCategory,
    metric: row.metric as GoalMetric,
    direction: row.direction as GoalDirection,
    targetValue: row.target_value,
    unit: row.unit as GoalUnit,
    periodType: row.period_type as GoalPeriodType,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status as GoalStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (row.description !== null) {
    goal.description = row.description;
  }
  if (row.manual_current_value !== null) {
    goal.manualCurrentValue = row.manual_current_value;
  }
  if (row.notes !== null) {
    goal.notes = row.notes;
  }

  return goal;
}

function goalToWriteParams(goal: Goal): GoalWriteParams {
  return {
    id: goal.id,
    title: goal.title,
    description: goal.description ?? null,
    category: goal.category,
    metric: goal.metric,
    direction: goal.direction,
    target_value: goal.targetValue,
    unit: goal.unit,
    period_type: goal.periodType,
    start_date: goal.startDate,
    end_date: goal.endDate,
    status: goal.status,
    manual_current_value: goal.manualCurrentValue ?? null,
    notes: goal.notes ?? null,
    created_at: goal.createdAt,
    updated_at: goal.updatedAt,
  };
}

// Validate an unknown payload and map it to bind params. A valid string id is
// required (the client always generates one), so a structurally bogus payload
// is rejected with a 400 upstream rather than coerced into a junk row. Field
// validation is delegated to the shared normalizeGoal so the camelCase contract
// lives in one place.
function toGoalWriteParams(input: unknown): GoalWriteParams {
  if (
    !isRecord(input) ||
    typeof input.id !== "string" ||
    input.id.trim().length === 0
  ) {
    throw new Error("Invalid goal payload: missing or malformed id");
  }

  const goal = normalizeGoal(input);

  if (!goal) {
    throw new Error("Invalid goal payload: expected an object");
  }

  return goalToWriteParams(goal);
}

const GOAL_INSERT_SQL = `
  INSERT INTO goals (
    id, title, description, category, metric, direction, target_value, unit,
    period_type, start_date, end_date, status, manual_current_value, notes,
    created_at, updated_at
  ) VALUES (
    @id, @title, @description, @category, @metric, @direction, @target_value,
    @unit, @period_type, @start_date, @end_date, @status, @manual_current_value,
    @notes, @created_at, @updated_at
  )
`;

const GOAL_UPDATE_SQL = `
  UPDATE goals SET
    title = @title,
    description = @description,
    category = @category,
    metric = @metric,
    direction = @direction,
    target_value = @target_value,
    unit = @unit,
    period_type = @period_type,
    start_date = @start_date,
    end_date = @end_date,
    status = @status,
    manual_current_value = @manual_current_value,
    notes = @notes,
    created_at = @created_at,
    updated_at = @updated_at
  WHERE id = @id
`;

export function getAllGoals(): Goal[] {
  const rows = getDb()
    .prepare("SELECT * FROM goals ORDER BY updated_at DESC")
    .all() as GoalRow[];

  return rows.map(rowToGoal);
}

export function getGoalById(id: string): Goal | null {
  const row = getDb().prepare("SELECT * FROM goals WHERE id = ?").get(id) as
    | GoalRow
    | undefined;

  return row ? rowToGoal(row) : null;
}

export function insertGoal(input: unknown): Goal {
  const params = toGoalWriteParams(input);
  getDb().prepare(GOAL_INSERT_SQL).run(params);

  return getGoalById(params.id) as Goal;
}

export function updateGoal(id: string, input: unknown): Goal | null {
  const merged = isRecord(input) ? { ...input, id } : input;
  const params = toGoalWriteParams(merged);
  const result = getDb().prepare(GOAL_UPDATE_SQL).run(params);

  return result.changes > 0 ? getGoalById(id) : null;
}

export function deleteGoal(id: string): boolean {
  const result = getDb().prepare("DELETE FROM goals WHERE id = ?").run(id);
  return result.changes > 0;
}

export function replaceAllGoals(input: unknown): Goal[] {
  if (!Array.isArray(input)) {
    throw new Error("Invalid import payload: expected an array of goals");
  }

  const paramsList = input.map(toGoalWriteParams);
  const db = getDb();
  const insert = db.prepare(GOAL_INSERT_SQL);

  const runReplace = db.transaction((items: GoalWriteParams[]) => {
    db.prepare("DELETE FROM goals").run();
    for (const item of items) {
      insert.run(item);
    }
  });

  runReplace(paramsList);

  return getAllGoals();
}

// ============================================================================
// Notes
// ============================================================================

interface NoteRow {
  id: string;
  title: string;
  content: string;
  type: string;
  status: string;
  pinned: number;
  tags: string;
  link: string;
  created_at: string;
  updated_at: string;
}

type NoteWriteParams = NoteRow;

function rowToNote(row: NoteRow): Note {
  let tags: string[] = [];
  try {
    const parsed: unknown = JSON.parse(row.tags);
    if (isStringArray(parsed)) {
      tags = parsed;
    }
  } catch {
    tags = [];
  }

  let link: NoteLink = { type: "none" };
  try {
    const parsed: unknown = JSON.parse(row.link);
    if (isNoteLink(parsed)) {
      link = parsed;
    }
  } catch {
    link = { type: "none" };
  }

  return {
    id: row.id,
    title: row.title,
    content: row.content,
    type: row.type as NoteType,
    status: row.status as NoteStatus,
    pinned: row.pinned === 1,
    tags,
    link,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function noteToWriteParams(note: Note): NoteWriteParams {
  return {
    id: note.id,
    title: note.title,
    content: note.content,
    type: note.type,
    status: note.status,
    pinned: note.pinned ? 1 : 0,
    tags: JSON.stringify(note.tags),
    link: JSON.stringify(note.link),
    created_at: note.createdAt,
    updated_at: note.updatedAt,
  };
}

function toNoteWriteParams(input: unknown): NoteWriteParams {
  const note = normalizeNote(input);

  if (!note) {
    throw new Error("Invalid note payload: expected an object");
  }

  return noteToWriteParams(note);
}

const NOTE_INSERT_SQL = `
  INSERT INTO notes (
    id, title, content, type, status, pinned, tags, link, created_at, updated_at
  ) VALUES (
    @id, @title, @content, @type, @status, @pinned, @tags, @link, @created_at,
    @updated_at
  )
`;

const NOTE_UPDATE_SQL = `
  UPDATE notes SET
    title = @title,
    content = @content,
    type = @type,
    status = @status,
    pinned = @pinned,
    tags = @tags,
    link = @link,
    created_at = @created_at,
    updated_at = @updated_at
  WHERE id = @id
`;

export function getAllNotes(): Note[] {
  const rows = getDb()
    .prepare("SELECT * FROM notes ORDER BY updated_at DESC")
    .all() as NoteRow[];

  return rows.map(rowToNote);
}

export function getNoteById(id: string): Note | null {
  const row = getDb().prepare("SELECT * FROM notes WHERE id = ?").get(id) as
    | NoteRow
    | undefined;

  return row ? rowToNote(row) : null;
}

export function insertNote(input: unknown): Note {
  const params = toNoteWriteParams(input);
  getDb().prepare(NOTE_INSERT_SQL).run(params);

  return getNoteById(params.id) as Note;
}

export function updateNote(id: string, input: unknown): Note | null {
  const merged = isRecord(input) ? { ...input, id } : input;
  const params = toNoteWriteParams(merged);
  const result = getDb().prepare(NOTE_UPDATE_SQL).run(params);

  return result.changes > 0 ? getNoteById(id) : null;
}

export function deleteNote(id: string): boolean {
  const result = getDb().prepare("DELETE FROM notes WHERE id = ?").run(id);
  return result.changes > 0;
}

export function replaceAllNotes(input: unknown): Note[] {
  if (!Array.isArray(input)) {
    throw new Error("Invalid import payload: expected an array of notes");
  }

  const paramsList = input.map(toNoteWriteParams);
  const db = getDb();
  const insert = db.prepare(NOTE_INSERT_SQL);

  const runReplace = db.transaction((items: NoteWriteParams[]) => {
    db.prepare("DELETE FROM notes").run();
    for (const item of items) {
      insert.run(item);
    }
  });

  runReplace(paramsList);

  return getAllNotes();
}

// ============================================================================
// Playbooks
// ============================================================================

interface PlaybookRow {
  id: string;
  name: string;
  setup: string;
  market: string;
  timeframes: string;
  description: string;
  entry_rules: string;
  exit_rules: string;
  risk_rules: string;
  invalidation_rules: string;
  checklist: string;
  tags: string;
  status: string;
  created_at: string;
  updated_at: string;
}

type PlaybookWriteParams = PlaybookRow;

function parseJsonStringArray(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return isStringArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseChecklist(value: string): PlaybookChecklistItem[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter(isPlaybookChecklistItem)
      : [];
  } catch {
    return [];
  }
}

function rowToPlaybook(row: PlaybookRow): Playbook {
  return {
    id: row.id,
    name: row.name,
    setup: row.setup as TradeSetup,
    market: row.market,
    timeframes: parseJsonStringArray(row.timeframes),
    description: row.description,
    entryRules: parseJsonStringArray(row.entry_rules),
    exitRules: parseJsonStringArray(row.exit_rules),
    riskRules: parseJsonStringArray(row.risk_rules),
    invalidationRules: parseJsonStringArray(row.invalidation_rules),
    checklist: parseChecklist(row.checklist),
    tags: parseJsonStringArray(row.tags),
    status: row.status as PlaybookStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function playbookToWriteParams(playbook: Playbook): PlaybookWriteParams {
  return {
    id: playbook.id,
    name: playbook.name,
    setup: playbook.setup,
    market: playbook.market,
    timeframes: JSON.stringify(playbook.timeframes),
    description: playbook.description,
    entry_rules: JSON.stringify(playbook.entryRules),
    exit_rules: JSON.stringify(playbook.exitRules),
    risk_rules: JSON.stringify(playbook.riskRules),
    invalidation_rules: JSON.stringify(playbook.invalidationRules),
    checklist: JSON.stringify(playbook.checklist),
    tags: JSON.stringify(playbook.tags),
    status: playbook.status,
    created_at: playbook.createdAt,
    updated_at: playbook.updatedAt,
  };
}

function toPlaybookWriteParams(input: unknown): PlaybookWriteParams {
  if (
    !isRecord(input) ||
    typeof input.id !== "string" ||
    input.id.trim().length === 0
  ) {
    throw new Error("Invalid playbook payload: missing or malformed id");
  }

  const playbook = normalizePlaybook(input);

  if (!playbook) {
    throw new Error("Invalid playbook payload: expected an object");
  }

  return playbookToWriteParams(playbook);
}

const PLAYBOOK_INSERT_SQL = `
  INSERT INTO playbooks (
    id, name, setup, market, timeframes, description, entry_rules, exit_rules,
    risk_rules, invalidation_rules, checklist, tags, status, created_at,
    updated_at
  ) VALUES (
    @id, @name, @setup, @market, @timeframes, @description, @entry_rules,
    @exit_rules, @risk_rules, @invalidation_rules, @checklist, @tags, @status,
    @created_at, @updated_at
  )
`;

const PLAYBOOK_UPDATE_SQL = `
  UPDATE playbooks SET
    name = @name,
    setup = @setup,
    market = @market,
    timeframes = @timeframes,
    description = @description,
    entry_rules = @entry_rules,
    exit_rules = @exit_rules,
    risk_rules = @risk_rules,
    invalidation_rules = @invalidation_rules,
    checklist = @checklist,
    tags = @tags,
    status = @status,
    created_at = @created_at,
    updated_at = @updated_at
  WHERE id = @id
`;

export function getAllPlaybooks(): Playbook[] {
  const rows = getDb()
    .prepare("SELECT * FROM playbooks ORDER BY updated_at DESC")
    .all() as PlaybookRow[];

  return rows.map(rowToPlaybook);
}

export function getPlaybookById(id: string): Playbook | null {
  const row = getDb().prepare("SELECT * FROM playbooks WHERE id = ?").get(id) as
    | PlaybookRow
    | undefined;

  return row ? rowToPlaybook(row) : null;
}

export function insertPlaybook(input: unknown): Playbook {
  const params = toPlaybookWriteParams(input);
  getDb().prepare(PLAYBOOK_INSERT_SQL).run(params);

  return getPlaybookById(params.id) as Playbook;
}

export function updatePlaybook(id: string, input: unknown): Playbook | null {
  const merged = isRecord(input) ? { ...input, id } : input;
  const params = toPlaybookWriteParams(merged);
  const result = getDb().prepare(PLAYBOOK_UPDATE_SQL).run(params);

  return result.changes > 0 ? getPlaybookById(id) : null;
}

export function deletePlaybook(id: string): boolean {
  const result = getDb().prepare("DELETE FROM playbooks WHERE id = ?").run(id);
  return result.changes > 0;
}

export function replaceAllPlaybooks(input: unknown): Playbook[] {
  if (!Array.isArray(input)) {
    throw new Error("Invalid import payload: expected an array of playbooks");
  }

  const paramsList = input.map(toPlaybookWriteParams);
  const db = getDb();
  const insert = db.prepare(PLAYBOOK_INSERT_SQL);

  const runReplace = db.transaction((items: PlaybookWriteParams[]) => {
    db.prepare("DELETE FROM playbooks").run();
    for (const item of items) {
      insert.run(item);
    }
  });

  runReplace(paramsList);

  return getAllPlaybooks();
}

// ============================================================================
// Daily reviews (keyed by date; writes are upserts)
// ============================================================================

interface ReviewRow {
  date: string;
  rules_followed: string;
  main_mistake: string;
  market_condition: string;
  tomorrow_focus: string;
  emotion: string;
  score: number;
  notes: string | null;
  updated_at: string;
}

type ReviewWriteParams = ReviewRow;

function rowToReview(row: ReviewRow): DailyReview {
  const review: DailyReview = {
    date: row.date,
    rulesFollowed: row.rules_followed,
    mainMistake: row.main_mistake,
    marketCondition: row.market_condition,
    tomorrowFocus: row.tomorrow_focus,
    emotion: row.emotion as ReviewEmotion,
    score: row.score as DailyReviewScore,
    updatedAt: row.updated_at,
  };

  if (row.notes !== null) {
    review.notes = row.notes;
  }

  return review;
}

function isReviewEmotion(value: unknown): value is ReviewEmotion {
  return reviewEmotions.some((emotion) => emotion === value);
}

function isDailyReviewScore(value: unknown): value is DailyReviewScore {
  return dailyReviewScores.some((score) => score === value);
}

function toReviewWriteParams(input: unknown): ReviewWriteParams {
  if (!isRecord(input)) {
    throw new Error("Invalid review payload: expected an object");
  }

  if (
    typeof input.date !== "string" ||
    typeof input.rulesFollowed !== "string" ||
    typeof input.mainMistake !== "string" ||
    typeof input.marketCondition !== "string" ||
    typeof input.tomorrowFocus !== "string" ||
    typeof input.updatedAt !== "string"
  ) {
    throw new Error("Invalid review payload: missing or malformed fields");
  }

  return {
    date: input.date,
    rules_followed: input.rulesFollowed,
    main_mistake: input.mainMistake,
    market_condition: input.marketCondition,
    tomorrow_focus: input.tomorrowFocus,
    emotion: isReviewEmotion(input.emotion) ? input.emotion : "neutral",
    score: isDailyReviewScore(input.score) ? input.score : 3,
    notes: typeof input.notes === "string" ? input.notes : null,
    updated_at: input.updatedAt,
  };
}

// INSERT OR REPLACE keyed on the date PK — mirrors the provider's upsertReview.
const REVIEW_UPSERT_SQL = `
  INSERT OR REPLACE INTO daily_reviews (
    date, rules_followed, main_mistake, market_condition, tomorrow_focus,
    emotion, score, notes, updated_at
  ) VALUES (
    @date, @rules_followed, @main_mistake, @market_condition, @tomorrow_focus,
    @emotion, @score, @notes, @updated_at
  )
`;

export function getAllReviews(): DailyReview[] {
  const rows = getDb()
    .prepare("SELECT * FROM daily_reviews ORDER BY date DESC")
    .all() as ReviewRow[];

  return rows.map(rowToReview);
}

export function getReviewByDate(date: string): DailyReview | null {
  const row = getDb()
    .prepare("SELECT * FROM daily_reviews WHERE date = ?")
    .get(date) as ReviewRow | undefined;

  return row ? rowToReview(row) : null;
}

export function upsertReview(input: unknown): DailyReview {
  const params = toReviewWriteParams(input);
  getDb().prepare(REVIEW_UPSERT_SQL).run(params);

  return getReviewByDate(params.date) as DailyReview;
}

export function deleteReview(date: string): boolean {
  const result = getDb()
    .prepare("DELETE FROM daily_reviews WHERE date = ?")
    .run(date);
  return result.changes > 0;
}

export function replaceAllReviews(input: unknown): DailyReview[] {
  if (!Array.isArray(input)) {
    throw new Error("Invalid import payload: expected an array of reviews");
  }

  const paramsList = input.map(toReviewWriteParams);
  const db = getDb();
  const insert = db.prepare(REVIEW_UPSERT_SQL);

  const runReplace = db.transaction((items: ReviewWriteParams[]) => {
    db.prepare("DELETE FROM daily_reviews").run();
    for (const item of items) {
      insert.run(item);
    }
  });

  runReplace(paramsList);

  return getAllReviews();
}

// ============================================================================
// Period reports (keyed by id; writes are upserts)
// ============================================================================

interface ReportRow {
  id: string;
  period_type: string;
  period_key: string;
  start_date: string;
  end_date: string;
  title: string;
  summary: string;
  key_wins: string;
  key_mistakes: string;
  lessons: string;
  next_actions: string;
  created_at: string;
  updated_at: string;
}

type ReportWriteParams = ReportRow;

function rowToReport(row: ReportRow): PeriodReport {
  return {
    id: row.id,
    periodType: row.period_type as ReportPeriodType,
    periodKey: row.period_key,
    startDate: row.start_date,
    endDate: row.end_date,
    title: row.title,
    summary: row.summary,
    keyWins: row.key_wins,
    keyMistakes: row.key_mistakes,
    lessons: row.lessons,
    nextActions: row.next_actions,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function optionalString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toReportWriteParams(input: unknown): ReportWriteParams {
  if (!isRecord(input)) {
    throw new Error("Invalid report payload: expected an object");
  }

  if (
    typeof input.id !== "string" ||
    typeof input.periodKey !== "string" ||
    typeof input.startDate !== "string" ||
    typeof input.endDate !== "string" ||
    typeof input.createdAt !== "string" ||
    typeof input.updatedAt !== "string"
  ) {
    throw new Error("Invalid report payload: missing or malformed fields");
  }

  return {
    id: input.id,
    period_type: input.periodType === "weekly" ? "weekly" : "monthly",
    period_key: input.periodKey,
    start_date: input.startDate,
    end_date: input.endDate,
    title: optionalString(input.title),
    summary: optionalString(input.summary),
    key_wins: optionalString(input.keyWins),
    key_mistakes: optionalString(input.keyMistakes),
    lessons: optionalString(input.lessons),
    next_actions: optionalString(input.nextActions),
    created_at: input.createdAt,
    updated_at: input.updatedAt,
  };
}

// INSERT OR REPLACE keyed on the id PK — mirrors the provider's upsertReport.
const REPORT_UPSERT_SQL = `
  INSERT OR REPLACE INTO period_reports (
    id, period_type, period_key, start_date, end_date, title, summary, key_wins,
    key_mistakes, lessons, next_actions, created_at, updated_at
  ) VALUES (
    @id, @period_type, @period_key, @start_date, @end_date, @title, @summary,
    @key_wins, @key_mistakes, @lessons, @next_actions, @created_at, @updated_at
  )
`;

export function getAllReports(): PeriodReport[] {
  const rows = getDb()
    .prepare("SELECT * FROM period_reports ORDER BY updated_at DESC")
    .all() as ReportRow[];

  return rows.map(rowToReport);
}

export function getReportById(id: string): PeriodReport | null {
  const row = getDb()
    .prepare("SELECT * FROM period_reports WHERE id = ?")
    .get(id) as ReportRow | undefined;

  return row ? rowToReport(row) : null;
}

export function upsertReport(input: unknown): PeriodReport {
  const params = toReportWriteParams(input);
  getDb().prepare(REPORT_UPSERT_SQL).run(params);

  return getReportById(params.id) as PeriodReport;
}

export function deleteReport(id: string): boolean {
  const result = getDb()
    .prepare("DELETE FROM period_reports WHERE id = ?")
    .run(id);
  return result.changes > 0;
}

export function replaceAllReports(input: unknown): PeriodReport[] {
  if (!Array.isArray(input)) {
    throw new Error("Invalid import payload: expected an array of reports");
  }

  const paramsList = input.map(toReportWriteParams);
  const db = getDb();
  const insert = db.prepare(REPORT_UPSERT_SQL);

  const runReplace = db.transaction((items: ReportWriteParams[]) => {
    db.prepare("DELETE FROM period_reports").run();
    for (const item of items) {
      insert.run(item);
    }
  });

  runReplace(paramsList);

  return getAllReports();
}

// ============================================================================
// User settings (single global row, fixed primary key)
// ============================================================================

const SETTINGS_SINGLETON_ID = "singleton";

interface SettingsRow {
  id: string;
  currency: string;
  starting_balance: number;
  default_symbol: string;
  default_side: string;
  default_setup: string;
  default_risk_percent: number;
}

function rowToSettings(row: SettingsRow): UserSettings {
  return {
    currency: row.currency as CurrencyCode,
    startingBalance: row.starting_balance,
    defaultSymbol: row.default_symbol,
    defaultSide: row.default_side as TradeSide,
    defaultSetup: row.default_setup as TradeSetup,
    defaultRiskPercent: row.default_risk_percent,
  };
}

const SETTINGS_UPSERT_SQL = `
  INSERT OR REPLACE INTO user_settings (
    id, currency, starting_balance, default_symbol, default_side, default_setup,
    default_risk_percent
  ) VALUES (
    @id, @currency, @starting_balance, @default_symbol, @default_side,
    @default_setup, @default_risk_percent
  )
`;

// Returns the stored settings, or the shared defaults when no row exists yet so
// the UI never has to cope with a null configuration.
export function getUserSettings(): UserSettings {
  const row = getDb()
    .prepare("SELECT * FROM user_settings WHERE id = ?")
    .get(SETTINGS_SINGLETON_ID) as SettingsRow | undefined;

  return row ? rowToSettings(row) : DEFAULT_USER_SETTINGS;
}

export function saveUserSettings(input: unknown): UserSettings {
  const settings = normalizeUserSettings(input);

  if (!settings) {
    throw new Error("Invalid settings payload: expected an object");
  }

  getDb().prepare(SETTINGS_UPSERT_SQL).run({
    id: SETTINGS_SINGLETON_ID,
    currency: settings.currency,
    starting_balance: settings.startingBalance,
    default_symbol: settings.defaultSymbol,
    default_side: settings.defaultSide,
    default_setup: settings.defaultSetup,
    default_risk_percent: settings.defaultRiskPercent,
  });

  return getUserSettings();
}
