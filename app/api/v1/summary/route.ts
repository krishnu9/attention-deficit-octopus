import { getUserId, unauthorized } from "@/lib/api-auth";
import { weekSummary } from "@/lib/data";

function currentMonday() {
  const now = new Date();
  now.setUTCDate(now.getUTCDate() - ((now.getUTCDay() + 6) % 7));
  return now.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const url = new URL(request.url);
  const week = url.searchParams.get("week") ?? currentMonday();
  return Response.json(await weekSummary(userId, week));
}
