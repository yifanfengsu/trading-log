import type { TradeSetup } from "@/lib/trade-types";

export type PlaybookStatus = "active" | "archived";

export type PlaybookChecklistItem = {
  id: string;
  text: string;
  required: boolean;
};

export type Playbook = {
  id: string;
  name: string;
  setup: TradeSetup;
  market: string;
  timeframes: string[];
  description: string;
  entryRules: string[];
  exitRules: string[];
  riskRules: string[];
  invalidationRules: string[];
  checklist: PlaybookChecklistItem[];
  tags: string[];
  status: PlaybookStatus;
  createdAt: string;
  updatedAt: string;
};

export type PlaybookInput = Omit<Playbook, "id" | "createdAt" | "updatedAt">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isTradeSetup(value: unknown): value is TradeSetup {
  return (
    value === "trendFollowing" ||
    value === "breakout" ||
    value === "scalping" ||
    value === "meanReversion" ||
    value === "other"
  );
}

export function isPlaybookStatus(value: unknown): value is PlaybookStatus {
  return value === "active" || value === "archived";
}

export function isPlaybookChecklistItem(
  value: unknown,
): value is PlaybookChecklistItem {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.text === "string" &&
    typeof value.required === "boolean"
  );
}

export function isPlaybook(value: unknown): value is Playbook {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    isTradeSetup(value.setup) &&
    typeof value.market === "string" &&
    isStringArray(value.timeframes) &&
    typeof value.description === "string" &&
    isStringArray(value.entryRules) &&
    isStringArray(value.exitRules) &&
    isStringArray(value.riskRules) &&
    isStringArray(value.invalidationRules) &&
    Array.isArray(value.checklist) &&
    value.checklist.every(isPlaybookChecklistItem) &&
    isStringArray(value.tags) &&
    isPlaybookStatus(value.status) &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}
