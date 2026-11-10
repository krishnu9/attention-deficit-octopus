import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export * from "./auth-schema";

export const bucketEnum = pgEnum("bucket", ["must", "should", "could"]);
export const energyEnum = pgEnum("energy", ["low", "med", "high"]);
export const taskStatusEnum = pgEnum("task_status", [
  "inbox",
  "active",
  "done",
  "someday",
]);
export const modeEnum = pgEnum("mode", ["simple", "advanced"]);
export const sprintKindEnum = pgEnum("sprint_kind", ["focus", "break"]);
export const creatorEnum = pgEnum("creator", ["human", "agent"]);

const owner = () =>
  text("user_id").references(() => user.id, { onDelete: "cascade" });

export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: owner(),
  title: text("title").notNull(),
  why: text("why"),
  targetDate: date("target_date"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: owner(),
  goalId: uuid("goal_id").references(() => goals.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: owner(),
  projectId: uuid("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  notes: text("notes"),
  bucket: bucketEnum("bucket").notNull().default("should"),
  energy: energyEnum("energy").notNull().default("med"),
  estimateMin: integer("estimate_min"),
  actualMin: integer("actual_min"),
  firstStep: text("first_step"),
  status: taskStatusEnum("status").notNull().default("inbox"),
  due: date("due"),
  createdBy: creatorEnum("created_by").notNull().default("human"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const dailyPlans = pgTable(
  "daily_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: owner(),
    date: date("date").notNull(),
    brainDump: text("brain_dump"),
    highlightTaskId: uuid("highlight_task_id").references(() => tasks.id, {
      onDelete: "set null",
    }),
    microCommitment: text("micro_commitment"),
    microDone: boolean("micro_done").notNull().default(false),
    mode: modeEnum("mode").notNull().default("simple"),
    energy: energyEnum("energy"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("daily_plans_user_date_idx").on(table.userId, table.date),
  ],
);

export const sprints = pgTable("sprints", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: owner(),
  taskId: uuid("task_id").references(() => tasks.id, { onDelete: "set null" }),
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  kind: sprintKindEnum("kind").notNull().default("focus"),
  focusRating: integer("focus_rating"),
  notes: text("notes"),
});

export const weeklyReviews = pgTable(
  "weekly_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: owner(),
    weekStart: date("week_start").notNull(),
    wentWell: text("went_well"),
    didntGoWell: text("didnt_go_well"),
    nextFocus: text("next_focus"),
    stats: jsonb("stats"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("weekly_reviews_user_week_idx").on(
      table.userId,
      table.weekStart,
    ),
  ],
);
