import { badRequest, getUserId, unauthorized } from "@/lib/api-auth";
import {
  activeSprint,
  recentSprints,
  startSprint,
  stopSprint,
} from "@/lib/data";
import { SPRINT_KINDS, isInteger, isOneOf, isTextOrNull, isUuid } from "@/lib/validation";

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
  if (body.kind !== undefined && !isOneOf(body.kind, SPRINT_KINDS)) {
    return badRequest("kind is invalid");
  }
  if (body.taskId != null && !isUuid(body.taskId)) {
    return badRequest("taskId must be a UUID");
  }

  const row = await startSprint(userId, {
    taskId: body.taskId,
    kind: body.kind,
  });
  if (!row) {
    return Response.json(
      { error: "a sprint is already running" },
      { status: 409 },
    );
  }
  return Response.json(row, { status: 201 });
}

export async function PATCH(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const body = await request.json().catch(() => null);
  if (!isUuid(body?.id)) return badRequest("id is required");

  if (
    body.focusRating != null &&
    (!isInteger(body.focusRating) ||
      body.focusRating < 1 ||
      body.focusRating > 5)
  ) {
    return badRequest("focusRating must be 1 to 5");
  }
  if (body.notes !== undefined && !isTextOrNull(body.notes)) {
    return badRequest("notes must be text");
  }

  const row = await stopSprint(userId, body.id, {
    focusRating: body.focusRating ?? null,
    notes: body.notes ?? null,
  });
  if (!row) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(row);
}
