import { badRequest, getUserId, unauthorized } from "@/lib/api-auth";
import { createGoal, listGoals } from "@/lib/data";
import { isDate, isTextOrNull } from "@/lib/validation";

export async function GET(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();
  return Response.json(await listGoals(userId));
}

export async function POST(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body?.title || typeof body.title !== "string") {
    return badRequest("title is required");
  }
  if (body.why != null && !isTextOrNull(body.why)) {
    return badRequest("why must be text");
  }
  if (body.targetDate != null && !isDate(body.targetDate)) {
    return badRequest("targetDate must be YYYY-MM-DD");
  }

  const row = await createGoal(userId, {
    title: body.title,
    why: body.why ?? null,
    targetDate: body.targetDate ?? null,
  });
  return Response.json(row, { status: 201 });
}
