"use client";

import { useState } from "react";
import useSWR from "swr";
import { api, fetcher, type Goal, type Project } from "@/lib/client";
import {
  BusyButton,
  Card,
  LoadError,
  Skeleton,
  input,
  label,
} from "@/components/ui";
import { Hint } from "@/components/hint";
import { useBusy } from "@/components/use-busy";

export default function ProjectsPage() {
  const {
    data: goals = [],
    mutate: mutateGoals,
    isLoading: loadingGoals,
    error: goalsError,
  } = useSWR<Goal[]>("/api/v1/goals", fetcher);
  const {
    data: projects = [],
    mutate: mutateProjects,
    isLoading: loadingProjects,
    error: projectsError,
  } = useSWR<Project[]>("/api/v1/projects", fetcher);

  const [goalTitle, setGoalTitle] = useState("");
  const [goalWhy, setGoalWhy] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectGoal, setProjectGoal] = useState("");
  const { busy, error, run } = useBusy();

  async function addGoal(event: React.FormEvent) {
    event.preventDefault();
    if (!goalTitle.trim()) return;
    await run("goal", async () => {
      await api("/api/v1/goals", {
        method: "POST",
        body: JSON.stringify({
          title: goalTitle.trim(),
          why: goalWhy.trim() || null,
        }),
      });
      setGoalTitle("");
      setGoalWhy("");
      mutateGoals();
    });
  }

  async function addProject(event: React.FormEvent) {
    event.preventDefault();
    if (!projectTitle.trim()) return;
    await run("project", async () => {
      await api("/api/v1/projects", {
        method: "POST",
        body: JSON.stringify({
          title: projectTitle.trim(),
          goalId: projectGoal || null,
        }),
      });
      setProjectTitle("");
      mutateProjects();
    });
  }

  const goalName = (id: string | null) =>
    goals.find((goal) => goal.id === id)?.title ?? null;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="text-sm text-muted">
          Small daily actions, connected to what matters.
        </p>
      </header>

      {goalsError ? (
        <LoadError
          message="Could not load goals."
          onRetry={() => mutateGoals()}
        />
      ) : null}
      {projectsError ? (
        <LoadError
          message="Could not load projects."
          onRetry={() => mutateProjects()}
        />
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

      <Card>
        <p className={`${label} flex items-center`}>
          Goals <Hint k="goals" />
        </p>
        <div className="mt-3 space-y-2" aria-busy={loadingGoals}>
          {loadingGoals ? <Skeleton className="h-16 w-full" /> : null}
          {goals.map((goal) => (
            <div key={goal.id} className="rounded-xl border border-border p-3">
              <p className="font-medium">{goal.title}</p>
              {goal.why ? (
                <p className="text-sm text-muted">{goal.why}</p>
              ) : null}
            </div>
          ))}
          {!loadingGoals && !goalsError && goals.length === 0 ? (
            <p className="text-sm text-muted">No goals yet.</p>
          ) : null}
        </div>
        <form onSubmit={addGoal} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={goalTitle}
            onChange={(event) => setGoalTitle(event.target.value)}
            placeholder="Goal"
            className={input}
          />
          <input
            value={goalWhy}
            onChange={(event) => setGoalWhy(event.target.value)}
            placeholder="Why it matters"
            className={input}
          />
          <BusyButton busy={busy === "goal"}>
            {busy === "goal" ? "Adding" : "Add goal"}
          </BusyButton>
        </form>
      </Card>

      <Card>
        <p className={`${label} flex items-center`}>
          Projects <Hint k="projects" />
        </p>
        <div className="mt-3 space-y-3" aria-busy={loadingProjects}>
          {loadingProjects ? (
            <>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </>
          ) : null}
          {projects.map((project) => {
            const pct = project.total
              ? Math.round((project.done / project.total) * 100)
              : 0;
            return (
              <div key={project.id} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{project.title}</p>
                  <span className="text-xs text-muted">
                    {project.done}/{project.total}
                  </span>
                </div>
                {goalName(project.goalId) ? (
                  <p className="text-xs text-muted">
                    {goalName(project.goalId)}
                  </p>
                ) : null}
                <div className="mt-2 h-2 w-full rounded-full bg-border">
                  <div
                    className="h-2 rounded-full bg-accent"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
          {!loadingProjects && !projectsError && projects.length === 0 ? (
            <p className="text-sm text-muted">No projects yet.</p>
          ) : null}
        </div>
        <form
          onSubmit={addProject}
          className="mt-4 flex flex-col gap-2 sm:flex-row"
        >
          <input
            value={projectTitle}
            onChange={(event) => setProjectTitle(event.target.value)}
            placeholder="Project"
            className={input}
          />
          <select
            value={projectGoal}
            onChange={(event) => setProjectGoal(event.target.value)}
            className={input}
          >
            <option value="">No goal</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title}
              </option>
            ))}
          </select>
          <BusyButton busy={busy === "project"}>
            {busy === "project" ? "Adding" : "Add project"}
          </BusyButton>
        </form>
      </Card>
    </div>
  );
}
