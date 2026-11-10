/** Local calendar date (`YYYY-MM-DD`) of an instant in a time zone. */
export function localDateInZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function zoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second"),
  );
  return asUtc - date.getTime();
}

/** UTC instant of local midnight in a time zone. */
export function zonedMidnightToUtc(dateString: string, timeZone: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  const guess = Date.UTC(year, month - 1, day, 0, 0, 0);
  // Two passes so a DST change near the boundary picks the right offset.
  const first = new Date(guess - zoneOffsetMs(new Date(guess), timeZone));
  return new Date(guess - zoneOffsetMs(first, timeZone));
}

export function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function currentMonday(timeZone: string, now = new Date()) {
  const today = localDateInZone(now, timeZone);
  const date = new Date(`${today}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}
