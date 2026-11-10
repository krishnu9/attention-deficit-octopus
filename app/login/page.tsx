"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { btn, input, label } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message ?? "Login failed");
      return;
    }
    router.push("/today");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-6">
      <h1 className="text-2xl font-semibold">Kaizen OS</h1>
      <p className="mt-1 text-sm text-muted">
        Small steps. No guilt. Just show up.
      </p>
      <form onSubmit={submit} className="mt-8 space-y-3">
        <div>
          <label className={label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            autoFocus
            className={`${input} mt-1`}
          />
        </div>
        <div>
          <label className={label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className={`${input} mt-1`}
          />
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <button type="submit" disabled={loading} className={`${btn} w-full`}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-xs text-muted">
        Accounts are invite-only. Ask the owner for access.
      </p>
    </main>
  );
}
