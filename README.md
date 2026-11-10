# Attention Deficit Octopus

Kaizen OS is a small daily system for ADHD brains.
It helps you choose one task each day.
It records your real work.
It shows the results each week.
Agents can read and write the same data.

## Description

Attention Deficit Octopus is the repository name.
Kaizen OS is the app name.
The app gives you a calm dashboard, one daily highlight, and a flexible focus timer.
It also gives agents a REST API.
You can connect Google Calendar for reminders.

## Screens

| Screen | Purpose |
|---|---|
| **Today** | Energy, `Brain dump`, one highlight, one 2-minute commitment, focus sprint, and overwhelm mode. |
| **Inbox** | Quick capture and triage. Set a bucket, energy, and first step. |
| **Week** | Highlight rate, focus minutes, urgent share, time estimate, and weekly review. |
| **Projects** | Goals and projects with progress bars. |
| **Settings** | Account, password, agent keys, and calendar. |

Every screen has tappable `?` hints.

## Quick start

1. Copy `.env.example` to `.env.local`.
2. Set `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL`.
3. Run `npm install`.
4. Run `npm run db:generate`.
5. Run `npm run db:migrate`.
6. Set `ALLOW_SIGNUP=true`, `SEED_EMAIL`, and `SEED_PASSWORD` in the environment.
7. Run `npm run seed`.
8. Run `npm run dev`.
9. Open `http://localhost:3000`.

The seed script creates one account.
It also claims old rows that have no owner.

## Stack

- Next.js 16 and React 19.
- Better Auth.
- Neon Postgres and Drizzle ORM.
- Tailwind CSS.
- Google Calendar API. This part is optional.

## Auth

The app uses email and password.
Public sign-up is off.
The seed script creates one account.
You can change the password in Settings.
There is no password reset email.

## Agent API

Create a key in **Settings**.
Send the key in the header:

```
Authorization: Bearer <key>
```

The key has no expiry and no rate limit.
The dashboard uses a session cookie instead.

| Method | Path | Body or query |
|---|---|---|
| GET | `/api/v1/tasks` | `?status=inbox&energy=low&projectId=` |
| POST | `/api/v1/tasks` | `{ title, bucket?, energy?, firstStep?, status?, due?, projectId? }` |
| PATCH | `/api/v1/tasks/:id` | `{ status?, bucket?, energy?, actualMin? }` |
| GET | `/api/v1/daily` | `?date=YYYY-MM-DD` |
| POST | `/api/v1/daily` | `{ date, brainDump?, highlightTaskId?, microCommitment?, microDone?, energy? }` |
| GET | `/api/v1/sprints` | None |
| POST | `/api/v1/sprints` | `{ taskId?, kind?: "focus" \| "break" }` |
| PATCH | `/api/v1/sprints` | `{ id, focusRating?, notes? }` |
| GET | `/api/v1/pick` | `?energy=low` |
| GET | `/api/v1/summary` | `?week=YYYY-MM-DD` |
| GET | `/api/v1/review` | `?week=YYYY-MM-DD` |
| POST | `/api/v1/review` | `{ weekStart, wentWell?, didntGoWell?, nextFocus? }` |
| GET | `/api/v1/goals` | None |
| POST | `/api/v1/goals` | `{ title, why?, targetDate? }` |
| GET | `/api/v1/projects` | None |
| POST | `/api/v1/projects` | `{ title, goalId? }` |
| GET | `/api/v1/calendar/health` | None |

Example:

```bash
curl -X POST https://your-app.vercel.app/api/v1/tasks \
  -H "Authorization: Bearer $AGENT_API_KEY" \
  -H "content-type: application/json" \
  -d '{"title":"Email landlord","bucket":"must","energy":"low","firstStep":"Open Gmail"}'
```

## Calendar

Calendar events are optional.
To connect Google Calendar:

1. Enable the Google Calendar API in Google Cloud.
2. Create a service account.
3. Create a JSON key.
4. Share your calendar with the service account. Use the permission "Make changes to events".
5. Add `GOOGLE_SERVICE_ACCOUNT_JSON` in Vercel.
6. Set the calendar ID and times in **Settings**.
7. Press **Test calendar**.

The app creates three event types:

- The daily highlight.
- The micro-commitment.
- The due date of a task.

The app keeps an event after you complete a task.
Times are set for each user.
The default timezone is `Asia/Kolkata`.

## Deploy

1. Import the repository in Vercel.
2. Create a Neon database.
3. Set `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` in Vercel.
4. Run `npm run db:migrate` with the Neon URL.
5. Run the seed script with the Neon URL.
6. Run `vercel --prod`.

Use the pooled Neon URL for `DATABASE_URL`.
Use the direct Neon URL for migrations.

## Project structure

- `app/` contains pages and API routes.
- `components/` contains UI components.
- `lib/` contains auth, data, calendar, and helpers.
- `drizzle/` contains SQL migrations.
- `scripts/seed.ts` creates the first account.

## Notes

- Public sign-up is off.
- Add a database backup.
- Vercel Hobby is not for commercial use.
- The dashboard polls for changes. It has no push update.
- Neon free tier sleeps when idle.
