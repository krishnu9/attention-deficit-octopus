"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  api,
  currentMonday,
  fetcher,
  type Review,
  type Summary,
} from "@/lib/client";
import { Card, btn, input, label } from "@/components/ui";
import { Hint } from "@/components/hint";
import type { HintKey } from "@/lib/hints";

function Stat({
  name,
  value,
  hint,
  hintKey,
}: {
  name: string;
  value: string;
  hint?: string;
  hintKey?: HintKey;
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className={`text-xs uppercase tracking-wide text-muted flex items-center`}>
        {name}
        {hintKey ? <Hint k={hintKey} /> : null}
      </p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export default function WeekPage() {
  const [week, setWeek] = useState("");
  useEffect(() => {
    // Deferred so prerender never evaluates new Date().
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWeek(currentMonday());
  }, []);
  const { data: summary } = useSWR<Summary>(
    week ? `/api/v1/summary?week=${week}` : null,
    fetcher,
  );
  const { data: review, mutate: mutateReview } = useSWR<Review | null>(
    week ? `/api/v1/review?week=${week}` : null,
    fetcher,
  );

  async function saveReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api("/api/v1/review", {
      method: "POST",
      body: JSON.stringify({
        weekStart: week,
        wentWell: form.get("wentWell"),
        didntGoWell: form.get("didntGoWell"),
        nextFocus: form.get("nextFocus"),
      }),
    });
    mutateReview();
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Week</h1>
          <p className="text-sm text-muted">Where did the time actually go?</p>
        </div>
        <input
          type="date"
          value={week}
          onChange={(event) => setWeek(event.target.value)}
          className={`${input} w-auto`}
        />
      </header>

      {summary ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat
              name="Highlights"
              value={`${summary.highlightsDone}/${summary.highlightsSet}`}
              hint={`${summary.daysTracked} days tracked`}
              hintKey="weekHighlights"
            />
            <Stat
              name="Micro"
              value={`${summary.microDone}`}
              hint="2-min commitments done"
              hintKey="weekMicro"
            />
            <Stat name="Tasks done" value={`${summary.tasksDone}`} />
            <Stat
              name="Focus time"
              value={`${summary.sprintMinutes}m`}
              hint={`${summary.sprints} sprints`}
              hintKey="weekFocus"
            />
            <Stat
              name="Urgent share"
              value={`${Math.round(summary.urgentShare * 100)}%`}
              hint="must-do tasks"
              hintKey="weekUrgent"
            />
            <Stat
              name="Estimate → actual"
              value={`${summary.estimateMin} → ${summary.actualMin}m`}
              hint="time calibration"
              hintKey="weekEstimate"
            />
          </div>

          {summary.urgentShare > 0.6 && summary.tasksDone > 0 ? (
            <Card>
              <p className="text-sm">
                Heads up — most of this week went to urgent tasks. Block one
                small slot for something that matters to you.
              </p>
            </Card>
          ) : null}
        </>
      ) : (
        <p className="text-sm text-muted">Loading…</p>
      )}

      <Card>
        <p className={`${label} flex items-center`}>
          Weekly review <Hint k="review" />
        </p>
        <form
          key={`${week}-${review?.id ?? "new"}`}
          onSubmit={saveReview}
          className="mt-3 space-y-3"
        >
          <textarea
            name="wentWell"
            rows={2}
            defaultValue={review?.wentWell ?? ""}
            placeholder="What went well?"
            className={`${input} resize-y`}
          />
          <textarea
            name="didntGoWell"
            rows={2}
            defaultValue={review?.didntGoWell ?? ""}
            placeholder="What got in the way?"
            className={`${input} resize-y`}
          />
          <textarea
            name="nextFocus"
            rows={2}
            defaultValue={review?.nextFocus ?? ""}
            placeholder="One thing to focus on next week"
            className={`${input} resize-y`}
          />
          <button className={btn} type="submit">
            Save review
          </button>
        </form>
      </Card>
    </div>
  );
}
