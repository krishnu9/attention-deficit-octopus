import { getUserId, unauthorized } from "@/lib/api-auth";
import { calendarConfigured } from "@/lib/calendar";
import { testCalendar } from "@/lib/calendar-events";

export async function GET(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return unauthorized();
  if (!calendarConfigured()) {
    return Response.json({ configured: false, ok: false });
  }
  return Response.json(await testCalendar(userId));
}
