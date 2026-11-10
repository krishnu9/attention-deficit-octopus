"use client";

import { useState } from "react";
import useSWR from "swr";
import { api, fetcher, type Task } from "@/lib/client";
import { Card, btn, btnGhost, input, label } from "@/components/ui";
import { Hint } from "@/components/hint";

const buckets = ["must", "should", "could"] as const;
const energies = ["low", "med", "high"] as const;

export default function InboxPage() {
  const { data: tasks = [], mutate } = useSWR<Task[]>("/api/v1/tasks", fetcher);
  const [title, setTitle] = useState("");
  const inbox = tasks.filter((task) => task.status === "inbox");
  const active = tasks.filter((task) => task.status === "active");

  async function add(event: React.FormEvent) {
    event.preventDefault();
    const value = title.trim();
    if (!value) return;
    setTitle("");
    await api("/api/v1/tasks", {
      method: "POST",
      body: JSON.stringify({ title: value, status: "inbox", createdBy: "human" }),
    });
    mutate();
  }

  async function patch(id: string, body: Partial<Task>) {
    await api(`/api/v1/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    mutate();
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

      <form onSubmit={add} className="flex gap-2">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What's on your mind?"
          className={input}
          autoFocus
        />
        <button className={btn}>Add</button>
      </form>

      <Card>
        <p className={`${label} flex items-center`}>
          Need to decide · {inbox.length} <Hint k="bucket" />
        </p>
        <div className="mt-3 space-y-3">
          {inbox.map((task) => (
            <div key={task.id} className="rounded-xl border border-border p-3">
              <p className="font-medium">{task.title}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <select
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
                <button
                  className={btn}
                  onClick={() => patch(task.id, { status: "active" })}
                >
                  Activate
                </button>
                <button
                  className={btnGhost}
                  onClick={() => patch(task.id, { status: "someday" })}
                >
                  Someday
                </button>
              </div>
            </div>
          ))}
          {inbox.length === 0 ? (
            <p className="text-sm text-muted">Inbox zero. Nice.</p>
          ) : null}
        </div>
      </Card>

      <Card>
        <p className={`${label} flex items-center`}>
          Active · {active.length} <Hint k="activate" />
        </p>
        <div className="mt-2 space-y-2">
          {active.map((task) => (
            <label key={task.id} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                onChange={() => patch(task.id, { status: "done" })}
              />
              <span>{task.title}</span>
            </label>
          ))}
          {active.length === 0 ? (
            <p className="text-sm text-muted">Nothing active.</p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
