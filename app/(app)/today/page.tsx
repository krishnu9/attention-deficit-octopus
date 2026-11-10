"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  api,
  fetcher,
  today,
  type DailyPlan,
  type Sprint,
  type Task,
} from "@/lib/client";
import { Card, btn, btnGhost, input, label } from "@/components/ui";
import { Hint } from "@/components/hint";

const pad = (n: number) => String(n).padStart(2, "0");

function clock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

export default function TodayPage() {
  const [date, setDate] = useState("");
  const { data: plan, mutate: mutatePlan, isLoading } = useSWR<DailyPlan>(
    date ? `/api/v1/daily?date=${date}` : null,
    fetcher,
  );
  const { data: tasks = [], mutate: mutateTasks } = useSWR<Task[]>(
    "/api/v1/tasks",
    fetcher,
  );
  const { data: sprintData, mutate: mutateSprints } = useSWR<{
    active: Sprint | null;
    recent: Sprint[];
  }>("/api/v1/sprints", fetcher);

  const [overwhelm, setOverwhelm] = useState(false);
  const [rating, setRating] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [dateLabel, setDateLabel] = useState("");

  useEffect(() => {
    // Next 16 rejects new Date() during prerender, so defer the clock until mount.
    /* eslint-disable react-hooks/set-state-in-effect */
    setDate(today());
    setDateLabel(
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    );
    /* eslint-enable react-hooks/set-state-in-effect */
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const open = tasks.filter(
    (task) => task.status === "inbox" || task.status === "active",
  );
  const highlight = open.find((task) => task.id === plan?.highlightTaskId);
  const activeSprint = sprintData?.active ?? null;
  const elapsed = activeSprint
    ? (now ?? 0) - new Date(activeSprint.startedAt).getTime()
    : 0;

  async function savePlan(patch: Partial<DailyPlan>) {
    if (!plan) return;
    mutatePlan({ ...plan, ...patch }, false);
    await api("/api/v1/daily", {
      method: "POST",
      body: JSON.stringify({ date, ...patch }),
    });
    mutatePlan();
  }

  async function pickForMe() {
    const task = await api<Task | null>(
      `/api/v1/pick${plan?.energy ? `?energy=${plan.energy}` : ""}`,
    );
    if (task) await savePlan({ highlightTaskId: task.id });
  }

  async function completeHighlight() {
    if (!highlight) return;
    await api(`/api/v1/tasks/${highlight.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "done" }),
    });
    mutateTasks();
    mutatePlan();
  }

  async function startSprint() {
    await api("/api/v1/sprints", {
      method: "POST",
      body: JSON.stringify({ kind: "focus", taskId: highlight?.id ?? null }),
    });
    mutateSprints();
  }

  async function stopSprint(score: number | null) {
    if (!activeSprint) return;
    await api("/api/v1/sprints", {
      method: "PATCH",
      body: JSON.stringify({ id: activeSprint.id, focusRating: score }),
    });
    setRating(false);
    mutateSprints();
  }

  if (!date || isLoading || !plan) {
    return <p className="text-sm text-muted">Loading…</p>;
  }

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">
            {dateLabel}
          </p>
          <h1 className="text-2xl font-semibold">Today</h1>
        </div>
        <button className={btnGhost} onClick={() => setOverwhelm((v) => !v)}>
          {overwhelm ? "Show everything" : "Overwhelm mode"}
        </button>
        <Hint k="overwhelm" />
      </header>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className={`${label} flex items-center`}>
              Sprint <Hint k="sprint" />
            </p>
            <p className="mt-1 font-mono text-3xl tabular-nums">
              {activeSprint ? clock(elapsed) : "ready"}
            </p>
          </div>
          {activeSprint ? (
            rating ? (
              <div className="flex items-center gap-1">
                <span className="mr-1 text-xs text-muted">Focus?</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} className={btnGhost} onClick={() => stopSprint(n)}>
                    {n}
                  </button>
                ))}
              </div>
            ) : (
              <button className={btn} onClick={() => setRating(true)}>
                Stop &amp; rate
              </button>
            )
          ) : (
            <button className={btn} onClick={startSprint}>
              Start focus
            </button>
          )}
        </div>
      </Card>

      {!overwhelm ? (
        <Card>
          <div className={`${label} flex items-center`}>
            1 · Brain dump <Hint k="brainDump" />
          </div>
          <textarea
            key={`${plan.id}-dump`}
            defaultValue={plan.brainDump ?? ""}
            onBlur={(event) => savePlan({ brainDump: event.target.value })}
            rows={4}
            placeholder="Empty your head. No order needed."
            className={`${input} mt-2 resize-y`}
          />
        </Card>
      ) : null}

      <Card>
        <div className="flex items-center justify-between">
          <div className={`${label} flex items-center`}>
            {overwhelm ? "One thing" : "2 · Today's highlight"}
            <Hint k="highlight" />
          </div>
          <div className="flex items-center">
            <button className="text-sm text-accent" onClick={pickForMe}>
              Pick for me
            </button>
            <Hint k="pickForMe" />
          </div>
        </div>

        {highlight ? (
          <div className="mt-3">
            <p className="text-lg font-medium">{highlight.title}</p>
            {highlight.firstStep ? (
              <p className="mt-1 text-sm text-muted">
                First step: {highlight.firstStep}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button className={btn} onClick={completeHighlight}>
                Mark done
              </button>
              <button
                className={btnGhost}
                onClick={() => savePlan({ highlightTaskId: null })}
              >
                Change
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {open.slice(0, 6).map((task) => (
              <button
                key={task.id}
                onClick={() => savePlan({ highlightTaskId: task.id })}
                className="block w-full rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors hover:border-accent"
              >
                <span className="mr-2 text-xs uppercase text-muted">
                  {task.bucket}
                </span>
                {task.title}
              </button>
            ))}
            {open.length === 0 ? (
              <p className="text-sm text-muted">
                No open tasks. Capture some in Inbox.
              </p>
            ) : null}
          </div>
        )}
      </Card>

      {!overwhelm ? (
        <>
          <Card>
            <div className={`${label} flex items-center`}>
              3 · Micro-commitment (2 minutes) <Hint k="micro" />
            </div>
            <div className="mt-2 flex gap-2">
              <input
                key={`${plan.id}-micro`}
                defaultValue={plan.microCommitment ?? ""}
                onBlur={(event) =>
                  savePlan({ microCommitment: event.target.value })
                }
                placeholder="One tiny step toward a habit"
                className={input}
              />
              <button
                className={plan.microDone ? btn : btnGhost}
                onClick={() => savePlan({ microDone: !plan.microDone })}
              >
                {plan.microDone ? "Done" : "Not yet"}
              </button>
            </div>
          </Card>

          <div className="flex items-center gap-3">
            <span className={`${label} flex items-center`}>
              Energy <Hint k="energy" />
            </span>
            {(["low", "med", "high"] as const).map((energy) => (
              <button
                key={energy}
                onClick={() => savePlan({ energy })}
                className={plan.energy === energy ? btn : btnGhost}
              >
                {energy}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
