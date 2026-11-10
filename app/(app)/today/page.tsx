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
import {
  BusyButton,
  Card,
  LoadError,
  Skeleton,
  Spinner,
  btn,
  btnGhost,
  input,
  label,
} from "@/components/ui";
import { Hint } from "@/components/hint";
import { useBusy } from "@/components/use-busy";

const pad = (n: number) => String(n).padStart(2, "0");

function clock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

export default function TodayPage() {
  const [date, setDate] = useState("");
  const {
    data: plan,
    mutate: mutatePlan,
    isLoading,
    error: planError,
  } = useSWR<DailyPlan>(date ? `/api/v1/daily?date=${date}` : null, fetcher);
  const { data: tasks = [], mutate: mutateTasks } = useSWR<Task[]>(
    "/api/v1/tasks?status=open",
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
  const { busy, error, run } = useBusy();

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
    try {
      await api("/api/v1/daily", {
        method: "POST",
        body: JSON.stringify({ date, ...patch }),
      });
      mutatePlan();
    } catch (caught) {
      mutatePlan();
      throw caught;
    }
  }

  async function pickForMe() {
    await run("pick", async () => {
      const task = await api<Task | null>(
        `/api/v1/pick${plan?.energy ? `?energy=${plan.energy}` : ""}`,
      );
      if (task) await savePlan({ highlightTaskId: task.id });
    });
  }

  async function completeHighlight() {
    if (!highlight) return;
    await run("done", async () => {
      await api(`/api/v1/tasks/${highlight.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "done" }),
      });
      mutateTasks();
      mutatePlan();
    });
  }

  async function startSprint() {
    await run("start", async () => {
      await api("/api/v1/sprints", {
        method: "POST",
        body: JSON.stringify({ kind: "focus", taskId: highlight?.id ?? null }),
      });
      mutateSprints();
    });
  }

  async function stopSprint(score: number | null) {
    if (!activeSprint) return;
    await run("stop", async () => {
      await api("/api/v1/sprints", {
        method: "PATCH",
        body: JSON.stringify({ id: activeSprint.id, focusRating: score }),
      });
      setRating(false);
      mutateSprints();
    });
  }

  if (!date || (isLoading && !plan)) return <TodaySkeleton />;
  if (!plan) {
    return (
      <LoadError
        message={
          planError ? "Could not load today's plan." : "Today's plan is empty."
        }
        onRetry={() => mutatePlan()}
      />
    );
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

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

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
                  <button
                    key={n}
                    className={btnGhost}
                    disabled={busy === "stop"}
                    onClick={() => stopSprint(n)}
                  >
                    {n}
                  </button>
                ))}
                {busy === "stop" ? <Spinner /> : null}
              </div>
            ) : (
              <button className={btn} onClick={() => setRating(true)}>
                Stop &amp; rate
              </button>
            )
          ) : (
            <BusyButton busy={busy === "start"} onClick={startSprint}>
              Start focus
            </BusyButton>
          )}
        </div>
      </Card>

      {!overwhelm ? (
        <Card>
          <div className={`${label} flex items-center`}>
            1 · Brain dump <Hint k="brainDump" />
            {busy === "dump" ? (
              <span className="ml-2 normal-case tracking-normal">Saving…</span>
            ) : null}
          </div>
          <textarea
            key={`${plan.id}-dump`}
            defaultValue={plan.brainDump ?? ""}
            onBlur={(event) =>
              run("dump", () => savePlan({ brainDump: event.target.value }))
            }
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
            <BusyButton
              busy={busy === "pick"}
              className="inline-flex items-center gap-1 text-sm text-accent"
              onClick={pickForMe}
            >
              {busy === "pick" ? "Picking" : "Pick for me"}
            </BusyButton>
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
              <BusyButton
                busy={busy === "done"}
                onClick={completeHighlight}
              >
                {busy === "done" ? "Saving" : "Mark done"}
              </BusyButton>
              <BusyButton
                className={btnGhost}
                busy={busy === "change"}
                onClick={() =>
                  run("change", () => savePlan({ highlightTaskId: null }))
                }
              >
                Change
              </BusyButton>
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {open.slice(0, 6).map((task) => (
              <button
                key={task.id}
                disabled={busy === "pick"}
                onClick={() =>
                  run("pick", () => savePlan({ highlightTaskId: task.id }))
                }
                className="block w-full rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-60"
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
                  run("micro", () =>
                    savePlan({ microCommitment: event.target.value }),
                  )
                }
                placeholder="One tiny step toward a habit"
                className={input}
              />
              <BusyButton
                className={plan.microDone ? btn : btnGhost}
                busy={busy === "micro" || busy === "microDone"}
                onClick={() =>
                  run("microDone", () => savePlan({ microDone: !plan.microDone }))
                }
              >
                {plan.microDone ? "Done" : "Not yet"}
              </BusyButton>
            </div>
          </Card>

          <div className="flex items-center gap-3">
            <span className={`${label} flex items-center`}>
              Energy <Hint k="energy" />
            </span>
            {(["low", "med", "high"] as const).map((energy) => (
              <button
                key={energy}
                disabled={busy === "energy"}
                onClick={() => run("energy", () => savePlan({ energy }))}
                className={`${plan.energy === energy ? btn : btnGhost} disabled:opacity-40`}
              >
                {energy}
              </button>
            ))}
            {busy === "energy" ? <Spinner className="text-muted" /> : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

function TodaySkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
