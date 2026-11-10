import { badRequest, getUserId, unauthorized } from "@/lib/api-auth";
import { createGoal, listGoals } from "@/lib/data";

export async function GET(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();
  return Response.json(await listGoals(userId));
}

export async function POST(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body?.title) return badRequest("title is required");

  const row = await createGoal(userId, {
    title: String(body.title),
    why: body.why ?? null,
    targetDate: body.targetDate ?? null,
  });
  return Response.json(row, { status: 201 });
}
