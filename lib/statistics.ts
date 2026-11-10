type Bucket = "must" | "should" | "could";
type Energy = "low" | "med" | "high";

export type Scorable = {
  bucket: Bucket;
  energy: Energy;
  due: string | null;
  estimateMin: number | null;
  firstStep: string | null;
};

export function scoreTasks<T extends Scorable>(
  tasks: T[],
  energy?: Energy,
  now = new Date(),
) {
  const bucketWeight = { must: 6, should: 4, could: 2 };
  return tasks
    .map((task) => {
      let score = bucketWeight[task.bucket];
      if (energy && task.energy === energy) score += 5;
      if (task.due && new Date(task.due) <= now) score += 4;
      if (task.estimateMin && task.estimateMin <= 15) score += 1;
      if (task.firstStep) score += 1;
      return { task, score };
    })
    .sort((a, b) => b.score - a.score);
}

type Plan = {
  highlightTaskId: string | null;
  microDone: boolean;
};

type DoneTask = {
  id: string;
  bucket: Bucket;
  estimateMin: number | null;
  actualMin: number | null;
};

type Session = {
  startedAt: Date;
  endedAt: Date | null;
  kind: "focus" | "break";
};

export function summarizeWeek(
  weekStart: string,
  plans: Plan[],
  done: DoneTask[],
  sessions: Session[],
  doneHighlights: { id: string }[],
) {
  const highlightIds = new Set(doneHighlights.map((task) => task.id));
  const highlightPlans = plans.filter((plan) => plan.highlightTaskId);
  const focus = sessions.filter((session) => session.kind === "focus");
  const byBucket = { must: 0, should: 0, could: 0 };
  for (const task of done) byBucket[task.bucket] += 1;

  const sprintMinutes = focus.reduce((sum, session) => {
    if (!session.endedAt) return sum;
    return sum + (session.endedAt.getTime() - session.startedAt.getTime()) / 60000;
  }, 0);

  return {
    weekStart,
    daysTracked: plans.length,
    highlightsSet: highlightPlans.length,
    highlightsDone: highlightPlans.filter((plan) =>
      highlightIds.has(plan.highlightTaskId!),
    ).length,
    microDone: plans.filter((plan) => plan.microDone).length,
    tasksDone: done.length,
    byBucket,
    urgentShare: done.length ? byBucket.must / done.length : 0,
    estimateMin: done.reduce((sum, task) => sum + (task.estimateMin ?? 0), 0),
    actualMin: done.reduce((sum, task) => sum + (task.actualMin ?? 0), 0),
    sprints: focus.length,
    sprintMinutes: Math.round(sprintMinutes),
  };
}
