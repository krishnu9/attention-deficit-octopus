import { deleteEvent, writeEvent } from "./calendar";
import { getDaily, getTask, getUserSettings } from "./data";
import { localDateInZone } from "./time";

const DEFAULT_TIMEZONE = "Asia/Kolkata";
const DEFAULT_HIGHLIGHT_TIME = "09:00";
const DEFAULT_MICRO_TIME = "20:00";
const DEFAULT_DUE_TIME = "09:00";

// Google event IDs must be base32hex (0-9, a-v). Keep this alphabet only.
export function highlightEventId(date: string) {
  return `kaih${date.replace(/-/g, "")}`;
}

export function microEventId(date: string) {
  return `kaim${date.replace(/-/g, "")}`;
}

export function dueEventId(taskId: string) {
  return `kait${taskId.replace(/[^0-9a-f]/g, "")}`;
}

async function settingsFor(userId: string) {
  const user = await getUserSettings(userId);
  return {
    calendarId: user?.calendarId ?? null,
    timeZone: user?.timezone || DEFAULT_TIMEZONE,
    highlightTime: user?.highlightTime || DEFAULT_HIGHLIGHT_TIME,
    microTime: user?.microTime || DEFAULT_MICRO_TIME,
    dueTime: user?.dueTime || DEFAULT_DUE_TIME,
  };
}

export async function syncDailyEvents(userId: string, date: string) {
  const settings = await settingsFor(userId);
  if (!settings.calendarId) return;

  try {
    const plan = await getDaily(userId, date);

    if (plan.highlightTaskId) {
      const task = await getTask(userId, plan.highlightTaskId);
      if (task) {
        await writeEvent(
          settings.calendarId,
          highlightEventId(date),
          {
            summary: `Today: ${task.title}`,
            description: task.firstStep
              ? `First step: ${task.firstStep}`
              : "Your one thing for today.",
            date,
            time: settings.highlightTime,
            durationMin: 15,
            timeZone: settings.timeZone,
          },
        );
      }
    } else {
      await deleteEvent(settings.calendarId, highlightEventId(date));
    }

    const micro = plan.microCommitment?.trim();
    if (micro) {
      await writeEvent(settings.calendarId, microEventId(date), {
        summary: `Micro: ${micro}`,
        description: "Two minutes. Just start.",
        date,
        time: settings.microTime,
        durationMin: 5,
        timeZone: settings.timeZone,
      });
    } else {
      await deleteEvent(settings.calendarId, microEventId(date));
    }
  } catch (error) {
    console.error("calendar: daily sync failed", error);
  }
}

export async function syncDueTask(
  userId: string,
  task: { id: string; title: string; due: string | null },
) {
  const settings = await settingsFor(userId);
  if (!settings.calendarId) return;

  try {
    if (task.due) {
      await writeEvent(settings.calendarId, dueEventId(task.id), {
        summary: `Due: ${task.title}`,
        description: "From Kaizen OS.",
        date: task.due,
        time: settings.dueTime,
        durationMin: 15,
        timeZone: settings.timeZone,
      });
    } else {
      await deleteEvent(settings.calendarId, dueEventId(task.id));
    }
  } catch (error) {
    console.error("calendar: due sync failed", error);
  }
}

export async function testCalendar(userId: string) {
  const settings = await settingsFor(userId);
  if (!settings.calendarId) {
    return { configured: true, calendarId: null, ok: false };
  }

  const now = new Date();
  const date = localDateInZone(now, settings.timeZone);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: settings.timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  const id = `kaitest${Date.now()}`;

  try {
    await writeEvent(settings.calendarId, id, {
      summary: "Kaizen test event",
      description: "This is a test from your dashboard. It should disappear.",
      date,
      time,
      durationMin: 5,
      timeZone: settings.timeZone,
      reminderMin: 0,
    });
    await deleteEvent(settings.calendarId, id);
    return { configured: true, calendarId: settings.calendarId, ok: true };
  } catch (error) {
    return {
      configured: true,
      calendarId: settings.calendarId,
      ok: false,
      error: error instanceof Error ? error.message : "unknown error",
    };
  }
}
