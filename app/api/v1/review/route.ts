import { badRequest, getUserId, unauthorized } from "@/lib/api-auth";
import { getReview, upsertReview } from "@/lib/data";
import { isDate, isTextOrNull } from "@/lib/validation";

export async function GET(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const url = new URL(request.url);
  const week = url.searchParams.get("week");
  if (!isDate(week)) return badRequest("week is required (YYYY-MM-DD)");
  return Response.json(await getReview(userId, week));
}

export async function POST(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!isDate(body?.weekStart)) return badRequest("weekStart is required");

  for (const key of ["wentWell", "didntGoWell", "nextFocus"] as const) {
    if (body[key] !== undefined && !isTextOrNull(body[key])) {
      return badRequest(`${key} must be text`);
    }
  }

  const row = await upsertReview(userId, body.weekStart, {
    wentWell: body.wentWell ?? null,
    didntGoWell: body.didntGoWell ?? null,
    nextFocus: body.nextFocus ?? null,
    stats: body.stats,
  });
  return Response.json(row);
}
