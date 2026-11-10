import { badRequest, getUserId, unauthorized } from "@/lib/api-auth";
import { createTask, listTasks, type TaskRow } from "@/lib/data";
import { syncDueTask } from "@/lib/calendar-events";
import {
  TASK_BUCKETS,
  TASK_ENERGIES,
  TASK_STATUSES,
  isDate,
  isInteger,
  isOneOf,
  isUuid,
} from "@/lib/validation";

export async function GET(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? undefined;
  if (status && status !== "open" && !isOneOf(status, TASK_STATUSES)) {
    return badRequest("status is invalid");
  }
  const energy = url.searchParams.get("energy") ?? undefined;
  if (energy && !isOneOf(energy, TASK_ENERGIES)) {
    return badRequest("energy is invalid");
  }
  const rows = await listTasks(userId, {
    status: status as TaskRow["status"] | "open" | undefined,
    energy: energy as TaskRow["energy"] | undefined,
    projectId: url.searchParams.get("projectId") ?? undefined,
  });
  return Response.json(rows);
}

export async function POST(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body?.title || typeof body.title !== "string") {
    return badRequest("title is required");
  }
  if (body.status !== undefined && !isOneOf(body.status, TASK_STATUSES)) {
    return badRequest("status is invalid");
  }
  if (body.bucket !== undefined && !isOneOf(body.bucket, TASK_BUCKETS)) {
    return badRequest("bucket is invalid");
  }
  if (body.energy !== undefined && !isOneOf(body.energy, TASK_ENERGIES)) {
    return badRequest("energy is invalid");
  }
  if (body.due != null && !isDate(body.due)) {
    return badRequest("due must be YYYY-MM-DD");
  }
  if (body.estimateMin != null && !isInteger(body.estimateMin)) {
    return badRequest("estimateMin must be an integer");
  }
  if (body.projectId != null && !isUuid(body.projectId)) {
    return badRequest("projectId must be a UUID");
  }
  if (body.createdBy !== undefined && !isOneOf(body.createdBy, ["human", "agent"] as const)) {
    return badRequest("createdBy is invalid");
  }
  if (body.notes != null && typeof body.notes !== "string") {
    return badRequest("notes must be text");
  }
  if (body.firstStep != null && typeof body.firstStep !== "string") {
    return badRequest("firstStep must be text");
  }

  const row = await createTask(userId, {
    title: body.title,
    notes: body.notes ?? null,
    projectId: body.projectId ?? null,
    bucket: body.bucket,
    energy: body.energy,
    estimateMin: body.estimateMin ?? null,
    firstStep: body.firstStep ?? null,
    status: body.status ?? "inbox",
    due: body.due ?? null,
    createdBy: body.createdBy ?? "agent",
  });
  await syncDueTask(userId, row);
  return Response.json(row, { status: 201 });
}
