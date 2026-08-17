// Shared runtime type-guard primitives. These small predicates were previously
// copy-pasted across db.ts, backup-utils.ts, the domain type modules and the
// React store providers; keeping them in one place avoids the copies drifting
// apart. Domain-specific guards (isTradeSide, isNoteLink, …) stay in their own
// type module next to the type they validate.

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function isNonNegativeNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0;
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
