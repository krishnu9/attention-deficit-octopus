import { badRequest, getUserId, unauthorized } from "@/lib/api-auth";
import { createTask, listTasks, type TaskRow } from "@/lib/data";
import { syncDueTask } from "@/lib/calendar-events";

export async function GET(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const url = new URL(request.url);
  const rows = await listTasks(userId, {
    status: (url.searchParams.get("status") ?? undefined) as
      | TaskRow["status"]
      | undefined,
    energy: (url.searchParams.get("energy") ?? undefined) as
      | TaskRow["energy"]
      | undefined,
    projectId: url.searchParams.get("projectId") ?? undefined,
  });
  return Response.json(rows);
}

export async function POST(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body?.title) return badRequest("title is required");

  const row = await createTask(userId, {
    title: String(body.title),
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
