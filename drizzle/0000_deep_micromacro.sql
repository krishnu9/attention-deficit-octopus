CREATE TYPE "public"."bucket" AS ENUM('must', 'should', 'could');--> statement-breakpoint
CREATE TYPE "public"."creator" AS ENUM('human', 'agent');--> statement-breakpoint
CREATE TYPE "public"."energy" AS ENUM('low', 'med', 'high');--> statement-breakpoint
CREATE TYPE "public"."mode" AS ENUM('simple', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."sprint_kind" AS ENUM('focus', 'break');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('inbox', 'active', 'done', 'someday');--> statement-breakpoint
CREATE TABLE "daily_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"brain_dump" text,
	"highlight_task_id" uuid,
	"micro_commitment" text,
	"micro_done" boolean DEFAULT false NOT NULL,
	"mode" "mode" DEFAULT 'simple' NOT NULL,
	"energy" "energy",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_plans_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"why" text,
	"target_date" date,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"goal_id" uuid,
	"title" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sprints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"kind" "sprint_kind" DEFAULT 'focus' NOT NULL,
	"focus_rating" integer,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid,
	"title" text NOT NULL,
	"notes" text,
	"bucket" "bucket" DEFAULT 'should' NOT NULL,
	"energy" "energy" DEFAULT 'med' NOT NULL,
	"estimate_min" integer,
	"actual_min" integer,
	"first_step" text,
	"status" "task_status" DEFAULT 'inbox' NOT NULL,
	"due" date,
	"created_by" "creator" DEFAULT 'human' NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"week_start" date NOT NULL,
	"went_well" text,
	"didnt_go_well" text,
	"next_focus" text,
	"stats" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "weekly_reviews_week_start_unique" UNIQUE("week_start")
);
--> statement-breakpoint
ALTER TABLE "daily_plans" ADD CONSTRAINT "daily_plans_highlight_task_id_tasks_id_fk" FOREIGN KEY ("highlight_task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_goal_id_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."goals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;