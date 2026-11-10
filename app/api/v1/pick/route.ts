import type { TaskRow } from "@/lib/data";
import { getUserId, unauthorized } from "@/lib/api-auth";
import { pickTask } from "@/lib/data";

export async function GET(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();

  const url = new URL(request.url);
  const energy = (url.searchParams.get("energy") ?? undefined) as
    | TaskRow["energy"]
    | undefined;
  return Response.json(await pickTask(userId, energy));
}
