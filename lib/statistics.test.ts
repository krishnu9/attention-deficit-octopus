import assert from "node:assert/strict";
import test from "node:test";
import { scoreTasks, summarizeWeek } from "./statistics";

test("due must beats a future could", () => {
  const now = new Date("2026-11-11T12:00:00.000Z");
  const tasks = [
    {
      bucket: "could" as const,
      energy: "low" as const,
      due: null,
      estimateMin: null,
      firstStep: null,
    },
    {
      bucket: "must" as const,
      energy: "low" as const,
      due: "2026-11-11",
      estimateMin: null,
      firstStep: "Open it",
    },
  ];
  assert.equal(scoreTasks(tasks, undefined, now)[0].task.bucket, "must");
});

test("matching energy adds weight", () => {
  const tasks = [
    {
      bucket: "should" as const,
      energy: "high" as const,
      due: null,
      estimateMin: null,
      firstStep: null,
    },
    {
      bucket: "should" as const,
      energy: "low" as const,
      due: null,
      estimateMin: null,
      firstStep: null,
    },
  ];
  assert.equal(scoreTasks(tasks, "low")[0].task.energy, "low");
});

test("summary ignores break sprints and counts finished highlights", () => {
  const plans = [
    { highlightTaskId: "t1", microDone: true },
    { highlightTaskId: "t2", microDone: false },
  ];
  const done = [
    { id: "t1", bucket: "must" as const, estimateMin: 10, actualMin: 20 },
    { id: "t3", bucket: "should" as const, estimateMin: 5, actualMin: 5 },
  ];
  const sessions = [
    {
      startedAt: new Date("2026-11-09T10:00:00.000Z"),
      endedAt: new Date("2026-11-09T10:30:00.000Z"),
      kind: "focus" as const,
    },
    {
      startedAt: new Date("2026-11-09T10:30:00.000Z"),
      endedAt: new Date("2026-11-09T10:40:00.000Z"),
      kind: "break" as const,
    },
  ];

  const summary = summarizeWeek("2026-11-09", plans, done, sessions, [
    { id: "t1" },
  ]);

  assert.equal(summary.sprints, 1);
  assert.equal(summary.sprintMinutes, 30);
  assert.equal(summary.highlightsSet, 2);
  assert.equal(summary.highlightsDone, 1);
  assert.equal(summary.tasksDone, 2);
  assert.equal(summary.estimateMin, 15);
  assert.equal(summary.actualMin, 25);
  assert.equal(summary.urgentShare, 0.5);
});
