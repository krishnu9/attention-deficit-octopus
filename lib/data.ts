import {
  and,
  desc,
  eq,
  gte,
  inArray,
  isNull,
  lt,
  sql,
} from "drizzle-orm";
import { getDb } from "./db";
import {
  dailyPlans,
  goals,
  projects,
  sprints,
  tasks,
  user,
  weeklyReviews,
} from "./db/schema";

export type TaskRow = typeof tasks.$inferSelect;
type TaskStatus = TaskRow["status"];
type TaskEnergy = TaskRow["energy"];

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function getUserSettings(userId: string) {
  const [row] = await getDb()
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  return row ?? null;
}

export async function getTask(userId: string, id: string) {
  const [row] = await getDb()
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
    .limit(1);
  return row ?? null;
}

export async function listTasks(
  userId: string,
  opts: { status?: TaskStatus; energy?: TaskEnergy; projectId?: string } = {},
) {
  const where = [eq(tasks.userId, userId)];
  if (opts.status) where.push(eq(tasks.status, opts.status));
  if (opts.energy) where.push(eq(tasks.energy, opts.energy));
  if (opts.projectId) where.push(eq(tasks.projectId, opts.projectId));
  return getDb()
    .select()
    .from(tasks)
    .where(and(...where))
    .orderBy(desc(tasks.createdAt));
}

export async function createTask(
  userId: string,
  input: {
    title: string;
    notes?: string | null;
    projectId?: string | null;
    bucket?: "must" | "should" | "could";
    energy?: TaskEnergy;
    estimateMin?: number | null;
    firstStep?: string | null;
    status?: TaskStatus;
    due?: string | null;
    createdBy?: "human" | "agent";
  },
) {
  const [row] = await getDb()
    .insert(tasks)
    .values({
      userId,
      title: input.title,
      notes: input.notes ?? null,
      projectId: input.projectId ?? null,
      bucket: input.bucket ?? "should",
      energy: input.energy ?? "med",
      estimateMin: input.estimateMin ?? null,
      firstStep: input.firstStep ?? null,
      status: input.status ?? "inbox",
      due: input.due ?? null,
      createdBy: input.createdBy ?? "human",
      completedAt: input.status === "done" ? new Date() : null,
    })
    .returning();
  return row;
}

export async function updateTask(
  userId: string,
  id: string,
  patch: Partial<typeof tasks.$inferInsert>,
) {
  const values: Partial<typeof tasks.$inferInsert> = { ...patch };
  if (patch.status === "done") values.completedAt = new Date();
  else if (patch.status) values.completedAt = null;

  const [row] = await getDb()
    .update(tasks)
    .set(values)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
    .returning();
  return row ?? null;
}

export async function getDaily(userId: string, date: string) {
  const db = getDb();
  const [existing] = await db
    .select()
    .from(dailyPlans)
    .where(and(eq(dailyPlans.userId, userId), eq(dailyPlans.date, date)))
    .limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(dailyPlans)
    .values({ userId, date })
    .onConflictDoNothing()
    .returning();
  if (created) return created;

  const [again] = await db
    .select()
    .from(dailyPlans)
    .where(and(eq(dailyPlans.userId, userId), eq(dailyPlans.date, date)))
    .limit(1);
  return again;
}

export async function upsertDaily(
  userId: string,
  date: string,
  patch: Partial<typeof dailyPlans.$inferInsert>,
) {
  const [row] = await getDb()
    .insert(dailyPlans)
    .values({ userId, date, ...patch })
    .onConflictDoUpdate({
      target: [dailyPlans.userId, dailyPlans.date],
      set: patch,
    })
    .returning();
  return row;
}

export async function startSprint(
  userId: string,
  input: { taskId?: string | null; kind?: "focus" | "break" },
) {
  const [row] = await getDb()
    .insert(sprints)
    .values({
      userId,
      taskId: input.taskId ?? null,
      kind: input.kind ?? "focus",
    })
    .returning();
  return row;
}

export async function stopSprint(
  userId: string,
  id: string,
  input: { focusRating?: number | null; notes?: string | null },
) {
  const [row] = await getDb()
    .update(sprints)
    .set({
      endedAt: new Date(),
      focusRating: input.focusRating ?? null,
      notes: input.notes ?? null,
    })
    .where(and(eq(sprints.id, id), eq(sprints.userId, userId)))
    .returning();
  return row ?? null;
}

export async function activeSprint(userId: string) {
  const [row] = await getDb()
    .select()
    .from(sprints)
    .where(and(eq(sprints.userId, userId), isNull(sprints.endedAt)))
    .orderBy(desc(sprints.startedAt))
    .limit(1);
  return row ?? null;
}

export async function recentSprints(userId: string) {
  return getDb()
    .select()
    .from(sprints)
    .where(eq(sprints.userId, userId))
    .orderBy(desc(sprints.startedAt))
    .limit(10);
}

export async function pickTask(userId: string, energy?: TaskEnergy) {
  const rows = await getDb()
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        inArray(tasks.status, ["inbox", "active"]),
      ),
    );
  if (!rows.length) return null;

  const bucketWeight = { must: 6, should: 4, could: 2 };
  const now = new Date();
  const scored = rows.map((task) => {
    let score = bucketWeight[task.bucket];
    if (energy && task.energy === energy) score += 5;
    if (task.due && new Date(task.due) <= now) score += 4;
    if (task.estimateMin && task.estimateMin <= 15) score += 1;
    if (task.firstStep) score += 1;
    return { task, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].task;
}

export async function weekSummary(userId: string, weekStart: string) {
  const db = getDb();
  const start = new Date(`${weekStart}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);

  const plans = await db
    .select()
    .from(dailyPlans)
    .where(
      and(
        eq(dailyPlans.userId, userId),
        gte(dailyPlans.date, weekStart),
        lt(dailyPlans.date, isoDate(end)),
      ),
    );
  const done = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.status, "done"),
        gte(tasks.completedAt, start),
        lt(tasks.completedAt, end),
      ),
    );
  const sessions = await db
    .select()
    .from(sprints)
    .where(
      and(
        eq(sprints.userId, userId),
        gte(sprints.startedAt, start),
        lt(sprints.startedAt, end),
      ),
    );

  const doneIds = new Set(done.map((t) => t.id));
  const highlightPlans = plans.filter((p) => p.highlightTaskId);
  const byBucket = { must: 0, should: 0, could: 0 };
  for (const task of done) byBucket[task.bucket] += 1;

  const sprintMinutes = sessions.reduce((sum, s) => {
    if (!s.endedAt) return sum;
    return sum + (s.endedAt.getTime() - s.startedAt.getTime()) / 60000;
  }, 0);

  return {
    weekStart,
    daysTracked: plans.length,
    highlightsSet: highlightPlans.length,
    highlightsDone: highlightPlans.filter((p) => doneIds.has(p.highlightTaskId!))
      .length,
    microDone: plans.filter((p) => p.microDone).length,
    tasksDone: done.length,
    byBucket,
    urgentShare: done.length ? byBucket.must / done.length : 0,
    estimateMin: done.reduce((sum, t) => sum + (t.estimateMin ?? 0), 0),
    actualMin: done.reduce((sum, t) => sum + (t.actualMin ?? 0), 0),
    sprints: sessions.length,
    sprintMinutes: Math.round(sprintMinutes),
  };
}

export async function getReview(userId: string, weekStart: string) {
  const [row] = await getDb()
    .select()
    .from(weeklyReviews)
    .where(
      and(
        eq(weeklyReviews.userId, userId),
        eq(weeklyReviews.weekStart, weekStart),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function upsertReview(
  userId: string,
  weekStart: string,
  patch: {
    wentWell?: string | null;
    didntGoWell?: string | null;
    nextFocus?: string | null;
    stats?: unknown;
  },
) {
  const [row] = await getDb()
    .insert(weeklyReviews)
    .values({ userId, weekStart, ...patch })
    .onConflictDoUpdate({
      target: [weeklyReviews.userId, weeklyReviews.weekStart],
      set: patch,
    })
    .returning();
  return row;
}

export async function listGoals(userId: string) {
  return getDb()
    .select()
    .from(goals)
    .where(eq(goals.userId, userId))
    .orderBy(desc(goals.createdAt));
}

export async function createGoal(
  userId: string,
  input: { title: string; why?: string | null; targetDate?: string | null },
) {
  const [row] = await getDb()
    .insert(goals)
    .values({
      userId,
      title: input.title,
      why: input.why ?? null,
      targetDate: input.targetDate ?? null,
    })
    .returning();
  return row;
}

export async function listProjects(userId: string) {
  return getDb()
    .select({
      id: projects.id,
      title: projects.title,
      goalId: projects.goalId,
      status: projects.status,
      createdAt: projects.createdAt,
      total: sql<number>`count(${tasks.id})`.mapWith(Number),
      done: sql<number>`count(${tasks.id}) filter (where ${tasks.status} = 'done')`.mapWith(
        Number,
      ),
    })
    .from(projects)
    .leftJoin(
      tasks,
      and(eq(tasks.projectId, projects.id), eq(tasks.userId, userId)),
    )
    .where(eq(projects.userId, userId))
    .groupBy(projects.id)
    .orderBy(desc(projects.createdAt));
}

export async function createProject(
  userId: string,
  input: { title: string; goalId?: string | null },
) {
  const [row] = await getDb()
    .insert(projects)
    .values({ userId, title: input.title, goalId: input.goalId ?? null })
    .returning();
  return row;
}
