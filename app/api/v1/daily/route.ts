import type { dailyPlans } from "@/lib/db/schema";
import { badRequest, getUserId, unauthorized } from "@/lib/api-auth";
import { getDaily, upsertDaily } from "@/lib/data";
import { syncDailyEvents } from "@/lib/calendar-events";
import {
  TASK_ENERGIES,
  isDate,
  isOneOf,
  isTextOrNull,
  isUuid,
} from "@/lib/validation";

type DailyPatch = Partial<typeof dailyPlans.$inferInsert>;

const allowed = [
  "brainDump",
  "highlightTaskId",
  "microCommitment",
  "microDone",
  "mode",
  "energy",
] as const;

export async function GET(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  if (!isDate(date)) return badRequest("date is required (YYYY-MM-DD)");
  return Response.json(await getDaily(userId, date));
}

export async function POST(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!isDate(body?.date)) return badRequest("date is required (YYYY-MM-DD)");

  const patch: DailyPatch = {};
  for (const key of allowed) {
    if (!(key in body)) continue;
    const value = body[key];

    if (key === "highlightTaskId") {
      if (value !== null && !isUuid(value)) {
        return badRequest("highlightTaskId must be a UUID");
      }
    } else if (key === "microDone") {
      if (typeof value !== "boolean") {
        return badRequest("microDone must be a boolean");
      }
    } else if (key === "mode") {
      if (!isOneOf(value, ["simple", "advanced"] as const)) {
        return badRequest("mode is invalid");
      }
    } else if (key === "energy") {
      if (value !== null && !isOneOf(value, TASK_ENERGIES)) {
        return badRequest("energy is invalid");
      }
    } else if (!isTextOrNull(value)) {
      return badRequest(`${key} must be text`);
    }

    (patch as Record<string, unknown>)[key] = value;
  }

  const row = Object.keys(patch).length
    ? await upsertDaily(userId, body.date, patch)
    : await getDaily(userId, body.date);
  if ("highlightTaskId" in patch || "microCommitment" in patch) {
    await syncDailyEvents(userId, body.date);
  }
  return Response.json(row);
}
