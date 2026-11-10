export const TASK_STATUSES = ["inbox", "active", "done", "someday"] as const;
export const TASK_BUCKETS = ["must", "should", "could"] as const;
export const TASK_ENERGIES = ["low", "med", "high"] as const;
export const SPRINT_KINDS = ["focus", "break"] as const;

export function isDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

export function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

export function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

export function isOneOf<T extends string>(
  value: unknown,
  list: readonly T[],
): value is T {
  return typeof value === "string" && (list as readonly string[]).includes(value);
}

export function isTextOrNull(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}
