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

const buckets = ["must", "should", "could"] as const;
const energies = ["low", "med", "high"] as const;

export default function InboxPage() {
  const {
    data: tasks = [],
    mutate,
    isLoading,
    error,
  } = useSWR<Task[]>("/api/v1/tasks", fetcher);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const inbox = tasks.filter((task) => task.status === "inbox");
  const active = tasks.filter((task) => task.status === "active");

  async function run(key: string, action: () => Promise<void>) {
    setBusy(key);
    try {
      await action();
    } finally {
      setBusy(null);
    }
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
      mutate();
    });
  }

  async function patch(id: string, body: Partial<Task>) {
    await run(id, async () => {
      await api(`/api/v1/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      mutate();
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

      {error ? (
        <LoadError message="Could not load tasks." onRetry={() => mutate()} />
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
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <select
                  disabled={busy === task.id}
                  value={task.bucket}
                  onChange={(event) =>
                    patch(task.id, {
                      bucket: event.target.value as Task["bucket"],
                    })
                  }
                  className={input}
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
          {!isLoading && !error && inbox.length === 0 ? (
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
            <label
              key={task.id}
              className="flex items-center gap-3 text-sm"
              aria-busy={busy === task.id}
            >
              <input
                type="checkbox"
                disabled={busy === task.id}
                onChange={() => patch(task.id, { status: "done" })}
              />
              <span>{task.title}</span>
            </label>
          ))}
          {!isLoading && !error && active.length === 0 ? (
            <p className="text-sm text-muted">Nothing active.</p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
