"use client";

import { useState } from "react";
import useSWR from "swr";
import { api, fetcher, type Task } from "@/lib/client";
import {
  BusyButton,
  Card,
  LoadError,
  Skeleton,
  btnGhost,
  input,
  label,
} from "@/components/ui";
import { Hint } from "@/components/hint";
import { useBusy } from "@/components/use-busy";

const buckets = ["must", "should", "could"] as const;
const energies = ["low", "med", "high"] as const;

export default function InboxPage() {
  const {
    data: openTasks = [],
    mutate: mutateOpen,
    isLoading,
    error: loadError,
  } = useSWR<Task[]>("/api/v1/tasks?status=open", fetcher);
  const { data: somedayTasks = [], mutate: mutateSomeday } = useSWR<Task[]>(
    "/api/v1/tasks?status=someday",
    fetcher,
  );
  const [title, setTitle] = useState("");
  const { busy, error, run } = useBusy();
  const inbox = openTasks.filter((task) => task.status === "inbox");
  const active = openTasks.filter((task) => task.status === "active");

  function refresh() {
    mutateOpen();
    mutateSomeday();
  }

  async function add(event: React.FormEvent) {
    event.preventDefault();
    const value = title.trim();
    if (!value) return;
    await run("add", async () => {
      await api("/api/v1/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: value,
          status: "inbox",
          createdBy: "human",
        }),
      });
      setTitle("");
      refresh();
    });
  }

  async function patch(id: string, body: Partial<Task>) {
    await run(id, async () => {
      await api(`/api/v1/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      refresh();
    });
  }

  return (
    <div className="space-y-4">
      <header>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Inbox</h1>
          <Hint k="inbox" />
        </div>
        <p className="text-sm text-muted">Capture first. Decide later.</p>
      </header>

      {loadError ? (
        <LoadError message="Could not load tasks." onRetry={() => refresh()} />
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

      <form onSubmit={add} className="flex gap-2">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What's on your mind?"
          className={input}
          autoFocus
        />
        <BusyButton busy={busy === "add"}>
          {busy === "add" ? "Adding" : "Add"}
        </BusyButton>
      </form>

      <Card>
        <p className={`${label} flex items-center`}>
          Need to decide · {inbox.length} <Hint k="bucket" />
        </p>
        <div className="mt-3 space-y-3" aria-busy={isLoading}>
          {isLoading ? (
            <>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </>
          ) : null}
          {inbox.map((task) => (
            <div
              key={task.id}
              aria-busy={busy === task.id}
              className="rounded-xl border border-border p-3"
            >
              <p className="font-medium">{task.title}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <select
                  disabled={busy === task.id}
                  value={task.bucket}
                  onChange={(event) =>
                    patch(task.id, {
                      bucket: event.target.value as Task["bucket"],
                    })
                  }
                  className={input}
                  aria-label="Bucket"
                >
                  {buckets.map((bucket) => (
                    <option key={bucket} value={bucket}>
                      {bucket}
                    </option>
                  ))}
                </select>
                <select
                  disabled={busy === task.id}
                  value={task.energy}
                  onChange={(event) =>
                    patch(task.id, {
                      energy: event.target.value as Task["energy"],
                    })
                  }
                  className={input}
                  aria-label="Energy"
                >
                  {energies.map((energy) => (
                    <option key={energy} value={energy}>
                      {energy} energy
                    </option>
                  ))}
                </select>
                <input
                  disabled={busy === task.id}
                  defaultValue={task.firstStep ?? ""}
                  onBlur={(event) => {
                    if (event.target.value !== (task.firstStep ?? "")) {
                      patch(task.id, { firstStep: event.target.value });
                    }
                  }}
                  placeholder="First 2-min step"
                  className={input}
                />
                <input
                  disabled={busy === task.id}
                  type="number"
                  min={0}
                  defaultValue={task.estimateMin ?? ""}
                  onBlur={(event) => {
                    const next = event.target.value
                      ? Number(event.target.value)
                      : null;
                    if (next !== task.estimateMin) {
                      patch(task.id, { estimateMin: next });
                    }
                  }}
                  placeholder="Estimate (min)"
                  className={input}
                />
              </div>
              <div className="mt-3 flex gap-2">
                <BusyButton
                  busy={busy === task.id}
                  onClick={() => patch(task.id, { status: "active" })}
                >
                  Activate
                </BusyButton>
                <button
                  disabled={busy === task.id}
                  className={btnGhost}
                  onClick={() => patch(task.id, { status: "someday" })}
                >
                  Someday
                </button>
              </div>
            </div>
          ))}
          {!isLoading && !loadError && inbox.length === 0 ? (
            <p className="text-sm text-muted">Inbox zero. Nice.</p>
          ) : null}
        </div>
      </Card>

      <Card>
        <p className={`${label} flex items-center`}>
          Active · {active.length} <Hint k="activate" />
        </p>
        <div className="mt-2 space-y-2" aria-busy={isLoading}>
          {isLoading ? <Skeleton className="h-10 w-full" /> : null}
          {active.map((task) => (
            <div
              key={task.id}
              aria-busy={busy === task.id}
              className="flex items-center gap-3 text-sm"
            >
              <input
                type="checkbox"
                disabled={busy === task.id}
                onChange={() => patch(task.id, { status: "done" })}
                aria-label={`Complete ${task.title}`}
              />
              <span className="flex-1">{task.title}</span>
              <input
                type="number"
                min={0}
                disabled={busy === task.id}
                defaultValue={task.actualMin ?? ""}
                onBlur={(event) => {
                  const next = event.target.value
                    ? Number(event.target.value)
                    : null;
                  if (next !== task.actualMin) {
                    patch(task.id, { actualMin: next });
                  }
                }}
                placeholder="Actual (min)"
                className={`${input} w-28`}
              />
            </div>
          ))}
          {!isLoading && !loadError && active.length === 0 ? (
            <p className="text-sm text-muted">Nothing active.</p>
          ) : null}
        </div>
      </Card>

      <Card>
        <p className={`${label} flex items-center`}>
          Someday · {somedayTasks.length} <Hint k="someday" />
        </p>
        <div className="mt-2 space-y-2">
          {somedayTasks.map((task) => (
            <div
              key={task.id}
              aria-busy={busy === task.id}
              className="flex items-center gap-3 text-sm"
            >
              <span className="flex-1">{task.title}</span>
              <button
                disabled={busy === task.id}
                className={btnGhost}
                onClick={() => patch(task.id, { status: "inbox" })}
              >
                Bring back
              </button>
            </div>
          ))}
          {somedayTasks.length === 0 ? (
            <p className="text-sm text-muted">Nothing parked.</p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
