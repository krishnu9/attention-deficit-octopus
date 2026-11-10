import { badRequest, getUserId, unauthorized } from "@/lib/api-auth";
import { weekSummary } from "@/lib/data";
import { isDate } from "@/lib/validation";

export async function GET(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const week = new URL(request.url).searchParams.get("week") ?? undefined;
  if (week && !isDate(week)) return badRequest("week must be YYYY-MM-DD");
  return Response.json(await weekSummary(userId, week));
}
