# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are adults with ADHD who use the app during a normal work day, often on a difficult day. They are easily derailed by long backlog lists and by planning that costs more energy than the work. Their job is to pick one task and start it.

## Product Purpose

Kaizen OS is a small daily system for ADHD brains. It limits the day to one highlight, records real work, and shows the week honestly. Success means the user starts the chosen task and can see their real effort without guilt.

## Positioning

The product gives agents and the dashboard the same data through one REST API. An agent can read and write tasks, daily plans, sprints, and reviews with the same records the user sees. A neighboring app that only paints a private dashboard cannot copy this without rebuilding its data model.

## Operating Context

- The app runs in a browser at a Vercel URL.
- The dashboard refreshes on save and when the tab regains focus. It has no push update.
- A daily flow uses energy level, a brain dump, one highlight, one 2-minute commitment, a focus sprint, and an overwhelm mode.
- A weekly flow uses highlight rate, focus minutes, urgent share, time estimate, and a written review.
- Agents call the API with a bearer key that the user creates in Settings.
- Google Calendar is optional and creates events for the highlight, the micro-commitment, and task due dates.

## Capabilities and Constraints

- Screens: Today, Inbox, Week, Projects, Settings.
- Stack: Next.js 16, React 19, Better Auth, Neon Postgres, Drizzle ORM, Tailwind CSS.
- Auth uses email and password. Public sign-up is off. The seed script creates the first account. There is no password reset email.
- Agent API keys have no expiry and no rate limit.
- Times are set per user. The default timezone is `Asia/Kolkata`.
- Every screen has tappable `?` hints. Hint text lives in `lib/hints.ts`.
- Open decision: the product is multi-user, but public sign-up stays off in the current code. The sign-up and invite flow is not decided.
- Open decision: no pricing, licensing, or commercial model is confirmed. Vercel Hobby is not for commercial use.
- Open decision: a database backup is required and not yet in place.

## Brand Commitments

- App name: Kaizen OS. Repository name: Attention Deficit Octopus.
- Tagline: "Small steps. No guilt. Just show up."
- Voice is calm, direct, and free of guilt. Do not shame the user for missed days.
- The `?` hints are part of the product's teaching model and must stay.

## Evidence on Hand

- The README documents the screens, the API, the calendar setup, and the deploy steps.
- No customer testimonials, case studies, benchmarks, or press exist. Future work must not fabricate them.
- No logo asset exists. The app uses a browser favicon only.

## Product Principles

1. One chosen task beats a full backlog.
2. Show real work, not planned work.
3. Never add guilt to a missed day.
4. The API is a first-class surface, not an afterthought.
5. Calm and low effort win over density and feature count.

## Accessibility & Inclusion

Users have ADHD. Interfaces must stay low-distraction, with one clear next action per screen and no pressure from counts or streaks.
