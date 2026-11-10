import type { dailyPlans } from "@/lib/db/schema";
import { badRequest, getUserId, unauthorized } from "@/lib/api-auth";
import { getDaily, upsertDaily } from "@/lib/data";
import { syncDailyEvents } from "@/lib/calendar-events";

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
  if (!date) return badRequest("date is required (YYYY-MM-DD)");
  return Response.json(await getDaily(userId, date));
}

export async function POST(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body?.date) return badRequest("date is required (YYYY-MM-DD)");

  const patch: DailyPatch = {};
  for (const key of allowed) {
    if (key in body) (patch as Record<string, unknown>)[key] = body[key];
  }

  const row = Object.keys(patch).length
    ? await upsertDaily(userId, body.date, patch)
    : await getDaily(userId, body.date);
  await syncDailyEvents(userId, body.date);
  return Response.json(row);
}
