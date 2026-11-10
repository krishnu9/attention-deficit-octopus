import type { tasks } from "@/lib/db/schema";
import { badRequest, getUserId, unauthorized } from "@/lib/api-auth";
import { updateTask } from "@/lib/data";
import { syncDueTask } from "@/lib/calendar-events";

type TaskPatch = Partial<typeof tasks.$inferInsert>;

const allowed = [
  "title",
  "notes",
  "projectId",
  "bucket",
  "energy",
  "estimateMin",
  "actualMin",
  "firstStep",
  "status",
  "due",
] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return badRequest("body required");

  const patch: TaskPatch = {};
  for (const key of allowed) {
    if (key in body) (patch as Record<string, unknown>)[key] = body[key];
  }

  const row = await updateTask(userId, id, patch);
  if (!row) return Response.json({ error: "not found" }, { status: 404 });
  await syncDueTask(userId, row);
  return Response.json(row);
}
