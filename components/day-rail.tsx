"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  currentMonday,
  fetcher,
  today,
  type DailyPlan,
  type Summary,
  type Task,
} from "@/lib/client";
import { LoadError, Skeleton, btnGhost, card, label } from "@/components/ui";
import { Icon } from "@/components/icons";

function Row({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2">
      <dt className="text-xs text-muted">{name}</dt>
      <dd className="font-mono text-sm tabular-nums">{value}</dd>
    </div>
  );
}

export default function DayRail() {
  const pathname = usePathname();
  const [date, setDate] = useState("");
  const [week, setWeek] = useState("");

  useEffect(() => {
    // Deferred so prerender never evaluates new Date().
    /* eslint-disable react-hooks/set-state-in-effect */
    setDate(today());
    setWeek(currentMonday());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const {
    data: plan,
    isLoading: loadingPlan,
    error: planError,
    mutate: mutatePlan,
  } = useSWR<DailyPlan>(date ? `/api/v1/daily?date=${date}` : null, fetcher);
  const { data: tasks = [], isLoading: loadingTasks } = useSWR<Task[]>(
    "/api/v1/tasks",
    fetcher,
  );
  const {
    data: summary,
    isLoading: loadingSummary,
    error: summaryError,
    mutate: mutateSummary,
  } = useSWR<Summary>(week ? `/api/v1/summary?week=${week}` : null, fetcher);

  const highlight = tasks.find((task) => task.id === plan?.highlightTaskId);
  const loading = !date || loadingPlan || loadingTasks;

  return (
    <div className="sticky top-20 space-y-4">
      {pathname !== "/today" ? (
        <section className={card}>
          <p className={label}>Today&apos;s highlight</p>

          {loading ? (
            <div className="mt-3 space-y-2" aria-busy="true">
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ) : planError ? (
            <div className="mt-3">
              <LoadError
                message="Could not load today."
                onRetry={() => mutatePlan()}
              />
            </div>
          ) : highlight ? (
            <>
              <p className="mt-2 text-lg font-medium leading-snug">
                {highlight.title}
              </p>
              <p className="mt-1 text-xs text-muted">
                {highlight.status === "done" ? "Done today" : "In focus"}
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted">
                No highlight yet. Pick one thing.
              </p>
              <Link href="/today" className={`${btnGhost} mt-3`}>
                Open Today
              </Link>
            </>
          )}

          {plan?.microCommitment ? (
            <div className="mt-4 border-t border-border pt-3">
              <p className="text-xs uppercase tracking-wide text-muted">
                2-minute step
              </p>
              <p className="mt-1 text-sm">{plan.microCommitment}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                <Icon
                  name={plan.microDone ? "today" : "clock"}
                  className="h-3.5 w-3.5"
                />
                {plan.microDone ? "Done" : "Not yet"}
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      {pathname !== "/week" ? (
        <section className={card}>
          <p className={`${label} flex items-center gap-1.5`}>
            <Icon name="week" className="h-3.5 w-3.5" />
            This week
          </p>

          {!week || loadingSummary ? (
            <div className="mt-3 space-y-2" aria-busy="true">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ) : summaryError ? (
            <div className="mt-3">
              <LoadError
                message="Could not load this week."
                onRetry={() => mutateSummary()}
              />
            </div>
          ) : summary ? (
            <>
              <dl className="mt-1 divide-y divide-border">
                <Row
                  name="Highlights"
                  value={`${summary.highlightsDone}/${summary.highlightsSet}`}
                />
                <Row name="Focus time" value={`${summary.sprintMinutes}m`} />
                <Row name="Tasks done" value={`${summary.tasksDone}`} />
              </dl>
              <Link href="/week" className={`${btnGhost} mt-3 w-full`}>
                Open Week
              </Link>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted">No week data yet.</p>
          )}
        </section>
      ) : null}
    </div>
  );
}
