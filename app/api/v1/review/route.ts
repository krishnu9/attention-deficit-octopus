import { badRequest, getUserId, unauthorized } from "@/lib/api-auth";
import { getReview, upsertReview } from "@/lib/data";

export async function GET(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const url = new URL(request.url);
  const week = url.searchParams.get("week");
  if (!week) return badRequest("week is required (YYYY-MM-DD)");
  return Response.json(await getReview(userId, week));
}

export async function POST(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body?.weekStart) return badRequest("weekStart is required");

  const row = await upsertReview(userId, body.weekStart, {
    wentWell: body.wentWell ?? null,
    didntGoWell: body.didntGoWell ?? null,
    nextFocus: body.nextFocus ?? null,
    stats: body.stats,
  });
  return Response.json(row);
}
