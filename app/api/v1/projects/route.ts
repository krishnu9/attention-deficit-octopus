import { badRequest, getUserId, unauthorized } from "@/lib/api-auth";
import { createProject, listProjects } from "@/lib/data";
import { isUuid } from "@/lib/validation";

export async function GET(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();
  return Response.json(await listProjects(userId));
}

export async function POST(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body?.title || typeof body.title !== "string") {
    return badRequest("title is required");
  }
  if (body.goalId != null && !isUuid(body.goalId)) {
    return badRequest("goalId must be a UUID");
  }

  const row = await createProject(userId, {
    title: body.title,
    goalId: body.goalId ?? null,
  });
  return Response.json(row, { status: 201 });
}
