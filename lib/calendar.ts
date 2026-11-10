import { google } from "googleapis";

type EventInput = {
  summary: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM in `timeZone`
  durationMin: number;
  timeZone: string;
  reminderMin?: number;
};

function credentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { client_email: string; private_key: string };
  } catch {
    try {
      return JSON.parse(Buffer.from(raw, "base64").toString("utf8")) as {
        client_email: string;
        private_key: string;
      };
    } catch {
      return null;
    }
  }
}

export function calendarConfigured() {
  return Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
}

export function addMinutes(date: string, time: string, minutes: number) {
  const [hours, mins] = time.split(":").map(Number);
  const total = hours * 60 + mins + minutes;
  const dayShift = Math.floor(total / (24 * 60));
  const minutesOfDay = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const end = new Date(`${date}T00:00:00.000Z`);
  end.setUTCDate(end.getUTCDate() + dayShift);
  return {
    date: end.toISOString().slice(0, 10),
    time: `${String(Math.floor(minutesOfDay / 60)).padStart(2, "0")}:${String(
      minutesOfDay % 60,
    ).padStart(2, "0")}`,
  };
}

function client() {
  const creds = credentials();
  if (!creds) throw new Error("calendar not configured");
  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/calendar.events"],
  });
  return google.calendar({ version: "v3", auth });
}

function isNotFound(error: unknown) {
  const e = error as { code?: number; response?: { status?: number } };
  return e?.code === 404 || e?.response?.status === 404;
}

async function upsert(
  calendarId: string,
  eventId: string,
  event: EventInput,
) {
  const calendar = client();
  const end = addMinutes(event.date, event.time, event.durationMin);
  const requestBody = {
    id: eventId,
    summary: event.summary,
    description: event.description,
    start: {
      dateTime: `${event.date}T${event.time}:00`,
      timeZone: event.timeZone,
    },
    end: {
      dateTime: `${end.date}T${end.time}:00`,
      timeZone: event.timeZone,
    },
    reminders: {
      useDefault: false,
      overrides: [
        {
          method: "popup" as const,
          minutes: event.reminderMin ?? 10,
        },
      ],
    },
  };

  try {
    await calendar.events.update({ calendarId, eventId, requestBody });
  } catch (error) {
    if (!isNotFound(error)) throw error;
    await calendar.events.insert({ calendarId, requestBody });
  }
}

async function remove(calendarId: string, eventId: string) {
  const calendar = client();
  try {
    await calendar.events.delete({ calendarId, eventId });
  } catch (error) {
    if (!isNotFound(error)) throw error;
  }
}

export async function writeEvent(
  calendarId: string,
  eventId: string,
  event: EventInput,
) {
  await upsert(calendarId, eventId, event);
}

export async function deleteEvent(calendarId: string, eventId: string) {
  await remove(calendarId, eventId);
}
