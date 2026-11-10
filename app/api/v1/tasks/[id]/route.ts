import type { tasks } from "@/lib/db/schema";
import { badRequest, getUserId, unauthorized } from "@/lib/api-auth";
import { updateTask } from "@/lib/data";
import { syncDueTask } from "@/lib/calendar-events";
import {
  TASK_BUCKETS,
  TASK_ENERGIES,
  TASK_STATUSES,
  isDate,
  isInteger,
  isOneOf,
  isTextOrNull,
  isUuid,
} from "@/lib/validation";

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

const enums = {
  status: TASK_STATUSES,
  bucket: TASK_BUCKETS,
  energy: TASK_ENERGIES,
} as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const { id } = await params;
  if (!isUuid(id)) return badRequest("id must be a UUID");
  const body = await request.json().catch(() => null);
  if (!body) return badRequest("body required");

  const patch: TaskPatch = {};
  for (const key of allowed) {
    if (!(key in body)) continue;
    const value = body[key];

    if (key in enums) {
      if (!isOneOf(value, enums[key as keyof typeof enums])) {
        return badRequest(`${key} is invalid`);
      }
    } else if (key === "due") {
      if (value !== null && !isDate(value)) {
        return badRequest("due must be YYYY-MM-DD");
      }
    } else if (key === "estimateMin" || key === "actualMin") {
      if (value !== null && !isInteger(value)) {
        return badRequest(`${key} must be an integer`);
      }
    } else if (key === "projectId") {
      if (value !== null && !isUuid(value)) {
        return badRequest("projectId must be a UUID");
      }
    } else if (key === "title") {
      if (typeof value !== "string" || !value.trim()) {
        return badRequest("title must be text");
      }
    } else if (!isTextOrNull(value)) {
      return badRequest(`${key} must be text`);
    }

    (patch as Record<string, unknown>)[key] = value;
  }

  const row = await updateTask(userId, id, patch);
  if (!row) return Response.json({ error: "not found" }, { status: 404 });
  await syncDueTask(userId, row);
  return Response.json(row);
}
