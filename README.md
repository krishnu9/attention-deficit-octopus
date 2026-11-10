# Kaizen OS

A tiny daily system for ADHD brains, hosted on Vercel with Neon Postgres.
Multi-user dashboard for humans, per-user REST API for agents, optional Google
Calendar events.

## Screens

- **Today** — energy, brain dump, one highlight, one 2-minute commitment, focus sprint, overwhelm mode, pick-for-me.
- **Inbox** — capture first, triage later (bucket, energy, first step).
- **Week** — highlight completion, focus minutes, urgent share, estimate vs actual, weekly review.
- **Projects** — goals and projects with progress bars.
- **Settings** — account, password, agent API keys, calendar.

Every page has tappable `?` hints.

## Auth

- Email + password via Better Auth.
- **Public sign-up is disabled.** One account is created with the seed script.
- Change your password in Settings. There is no forgot-password email; resets go through the seed/DB.

## Local setup

```bash
cp .env.example .env.local   # fill in DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL
npm install
npm run db:generate
npm run db:migrate
ALLOW_SIGNUP=true SEED_EMAIL=you@example.com SEED_PASSWORD=secret SEED_NAME=You npm run seed
npm run dev
```

`npm run seed` loads `.env.local` and also claims any rows that predate accounts.

## Deploy (Vercel + Neon)

1. Import the repo into Vercel.
2. Vercel → Storage → create a **Neon** database. Use the **pooled** connection string for `DATABASE_URL`.
3. Set env vars:
   - `BETTER_AUTH_SECRET` (`openssl rand -hex 32`)
   - `BETTER_AUTH_URL` = `https://your-app.vercel.app`
4. Apply the schema and create your account:
   ```bash
   DATABASE_URL="postgres://...-pooler..." npm run db:migrate

   DATABASE_URL="postgres://...-pooler..." \
   BETTER_AUTH_SECRET="..." \
   BETTER_AUTH_URL="https://your-app.vercel.app" \
   ALLOW_SIGNUP=true \
   SEED_EMAIL="you@example.com" \
   SEED_PASSWORD="..." \
   npx tsx scripts/seed.ts
   ```
5. Deploy: `vercel --prod`.

`ALLOW_SIGNUP` is only for the seed run; leave it unset in Vercel so public
sign-up stays off.

## Agent API

Create a key in **Settings → Agent API keys**. Send it as:

```
Authorization: Bearer <key>
```

Keys are per-user, revocable, and have no expiry or rate limit. The dashboard
uses its session cookie instead.

| Method | Path | Body / query |
|---|---|---|
| GET | `/api/v1/tasks` | `?status=inbox&energy=low&projectId=` |
| POST | `/api/v1/tasks` | `{ title, bucket?, energy?, firstStep?, status?, due?, projectId? }` |
| PATCH | `/api/v1/tasks/:id` | `{ status?, bucket?, energy?, actualMin?, ... }` |
| GET | `/api/v1/daily` | `?date=YYYY-MM-DD` |
| POST | `/api/v1/daily` | `{ date, brainDump?, highlightTaskId?, microCommitment?, microDone?, energy? }` |
| GET | `/api/v1/sprints` | — |
| POST | `/api/v1/sprints` | `{ taskId?, kind?: "focus" \| "break" }` |
| PATCH | `/api/v1/sprints` | `{ id, focusRating?, notes? }` |
| GET | `/api/v1/pick` | `?energy=low` |
| GET | `/api/v1/summary` | `?week=YYYY-MM-DD` |
| GET/POST | `/api/v1/review` | `?week=` / `{ weekStart, wentWell?, didntGoWell?, nextFocus? }` |
| GET/POST | `/api/v1/goals` | `{ title, why?, targetDate? }` |
| GET/POST | `/api/v1/projects` | `{ title, goalId? }` |
| GET | `/api/v1/calendar/health` | creates and removes a test event |

## Calendar (optional)

1. Google Cloud → enable **Google Calendar API** → create a **service account** → JSON key.
2. Share your Google Calendar with the service-account email, permission **“Make changes to events.”**
3. Add `GOOGLE_SERVICE_ACCOUNT_JSON` in Vercel (raw JSON or base64).
4. In **Settings → Calendar**, paste your calendar ID and set times (defaults: 09:00 / 20:00 / 09:00, Asia/Kolkata).
5. Press **Test calendar**.

Events created: daily highlight, micro-commitment, due tasks. They stay on the
calendar when a task is completed. Times are per user.

## Known limits

- Public sign-up is off; adding users needs a seed/admin script.
- No forgot-password email; reset via the seed script or DB.
- Calendar needs the service-account JSON before it does anything.
- No push notifications; the dashboard polls via SWR.
- Vercel Hobby is non-commercial. Neon free tier idle-suspends.
- Add a nightly `pg_dump` to S3 before storing data you care about.
