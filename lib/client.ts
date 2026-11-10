import { currentMonday as mondayForZone } from "./time";

export type Task = {
  id: string;
  title: string;
  notes: string | null;
  projectId: string | null;
  bucket: "must" | "should" | "could";
  energy: "low" | "med" | "high";
  estimateMin: number | null;
  actualMin: number | null;
  firstStep: string | null;
  status: "inbox" | "active" | "done" | "someday";
  due: string | null;
  createdBy: "human" | "agent";
  completedAt: string | null;
  createdAt: string;
};

export type DailyPlan = {
  id: string;
  date: string;
  brainDump: string | null;
  highlightTaskId: string | null;
  microCommitment: string | null;
  microDone: boolean;
  mode: "simple" | "advanced";
  energy: "low" | "med" | "high" | null;
};

export type Sprint = {
  id: string;
  taskId: string | null;
  startedAt: string;
  endedAt: string | null;
  kind: "focus" | "break";
  focusRating: number | null;
  notes: string | null;
};

export type Summary = {
  weekStart: string;
  daysTracked: number;
  highlightsSet: number;
  highlightsDone: number;
  microDone: number;
  tasksDone: number;
  byBucket: { must: number; should: number; could: number };
  urgentShare: number;
  estimateMin: number;
  actualMin: number;
  sprints: number;
  sprintMinutes: number;
};

export type Review = {
  id: string;
  weekStart: string;
  wentWell: string | null;
  didntGoWell: string | null;
  nextFocus: string | null;
};

export type Goal = {
  id: string;
  title: string;
  why: string | null;
  targetDate: string | null;
  status: string;
};

export type Project = {
  id: string;
  title: string;
  goalId: string | null;
  status: string;
  total: number;
  done: number;
};

export async function api<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? res.statusText);
  }
  return res.json();
}

export const fetcher = <T = unknown>(url: string) => api<T>(url);

export function today() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function currentMonday() {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return mondayForZone(zone);
}
