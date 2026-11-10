import { isNull } from "drizzle-orm";
import { auth } from "../lib/auth";
import { getDb } from "../lib/db";
import {
  dailyPlans,
  goals,
  projects,
  sprints,
  tasks,
  weeklyReviews,
} from "../lib/db/schema";

async function main() {
  console.log("seed: start");
  const email = process.env.SEED_EMAIL;
  const password = process.env.SEED_PASSWORD;
  const name = process.env.SEED_NAME ?? "Kaizen";

  if (!email || !password) {
    console.error("Set SEED_EMAIL and SEED_PASSWORD.");
    process.exit(1);
  }

  console.log("seed: creating user", email);
  const result = await auth.api.signUpEmail({
    body: { email, password, name },
  });
  console.log("seed: user created", result.user.id);

  const userId = result.user.id;
  const db = getDb();

  // Claim any rows created before accounts existed.
  await db.update(goals).set({ userId }).where(isNull(goals.userId));
  await db.update(projects).set({ userId }).where(isNull(projects.userId));
  await db.update(tasks).set({ userId }).where(isNull(tasks.userId));
  await db.update(dailyPlans).set({ userId }).where(isNull(dailyPlans.userId));
  await db.update(sprints).set({ userId }).where(isNull(sprints.userId));
  await db
    .update(weeklyReviews)
    .set({ userId })
    .where(isNull(weeklyReviews.userId));

  console.log(`Seeded ${email} (${userId}) and claimed existing rows.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
