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

function normalizeChecklistItem(
  value: unknown,
  index: number,
): PlaybookChecklistItem | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.text !== "string") {
    return null;
  }

  return {
    id:
      typeof value.id === "string" && value.id.trim().length > 0
        ? value.id
        : `checklist-${index}`,
    text: value.text,
    required:
      typeof value.required === "boolean" ? value.required : true,
  };
}

function normalizeChecklist(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizeChecklistItem)
    .filter((item): item is PlaybookChecklistItem => item !== null);
}

export function normalizePlaybook(value: unknown, index = 0): Playbook | null {
  if (!isRecord(value)) {
    return null;
  }

  return {
    id:
      typeof value.id === "string" && value.id.trim().length > 0
        ? value.id
        : `playbook-${index}`,
    name:
      typeof value.name === "string" && value.name.trim().length > 0
        ? value.name
        : "Untitled Playbook",
    setup: isTradeSetup(value.setup) ? value.setup : "other",
    market: typeof value.market === "string" ? value.market : "",
    timeframes: isStringArray(value.timeframes) ? value.timeframes : [],
    description:
      typeof value.description === "string" ? value.description : "",
    entryRules: isStringArray(value.entryRules) ? value.entryRules : [],
    exitRules: isStringArray(value.exitRules) ? value.exitRules : [],
    riskRules: isStringArray(value.riskRules) ? value.riskRules : [],
    invalidationRules: isStringArray(value.invalidationRules)
      ? value.invalidationRules
      : [],
    checklist: normalizeChecklist(value.checklist),
    tags: isStringArray(value.tags) ? value.tags : [],
    status: isPlaybookStatus(value.status) ? value.status : "active",
    createdAt:
      typeof value.createdAt === "string"
        ? value.createdAt
        : new Date().toISOString(),
    updatedAt:
      typeof value.updatedAt === "string"
        ? value.updatedAt
        : new Date().toISOString(),
  };
}

export function normalizePlaybooks(value: unknown): Playbook[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  return value
    .map((item, index) => normalizePlaybook(item, index))
    .filter((playbook): playbook is Playbook => playbook !== null);
}

export function isPlaybook(value: unknown): value is Playbook {
  return normalizePlaybook(value) !== null;
}
