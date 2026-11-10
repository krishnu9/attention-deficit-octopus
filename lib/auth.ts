import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { apiKey } from "@better-auth/api-key";
import { getDb, schema } from "./db";

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), { provider: "pg", schema }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    // Public sign-up stays off; the seed script flips this for its one run.
    disableSignUp: process.env.ALLOW_SIGNUP !== "true",
  },
  user: {
    additionalFields: {
      calendarId: { type: "string", required: false },
      timezone: { type: "string", required: false },
      highlightTime: { type: "string", required: false },
      microTime: { type: "string", required: false },
      dueTime: { type: "string", required: false },
    },
  },
  plugins: [apiKey({ rateLimit: { enabled: false } })],
});
