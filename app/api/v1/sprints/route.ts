import { badRequest, getUserId, unauthorized } from "@/lib/api-auth";
import {
  activeSprint,
  recentSprints,
  startSprint,
  stopSprint,
} from "@/lib/data";

export async function GET(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();
  return Response.json({
    active: await activeSprint(userId),
    recent: await recentSprints(userId),
  });
}

export async function POST(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const body = await request.json().catch(() => ({}));
  const row = await startSprint(userId, {
    taskId: body.taskId,
    kind: body.kind,
  });
  return Response.json(row, { status: 201 });
}

export async function PATCH(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!body?.id) return badRequest("id is required");

  const row = await stopSprint(userId, body.id, {
    focusRating: body.focusRating ?? null,
    notes: body.notes ?? null,
  });
  if (!row) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(row);
}
