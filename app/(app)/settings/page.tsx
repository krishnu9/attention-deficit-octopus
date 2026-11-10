"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Hint } from "@/components/hint";
import {
  BusyButton,
  Card,
  Skeleton,
  btnGhost,
  input,
  label,
} from "@/components/ui";

type ApiKey = {
  id: string;
  name: string | null;
  start: string | null;
  createdAt: string | Date;
};

export default function SettingsPage() {
  const { data: session } = authClient.useSession();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKey, setNewKey] = useState("");
  const [keyName, setKeyName] = useState("agents");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });

  async function loadKeys() {
    try {
      const { data } = await authClient.apiKey.list();
      setKeys((data?.apiKeys ?? []) as unknown as ApiKey[]);
    } finally {
      setLoadingKeys(false);
    }
  }

  useEffect(() => {
    void loadKeys();
  }, []);

  async function createKey(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setNewKey("");
    setBusy("create");
    try {
      const { data, error } = await authClient.apiKey.create({
        name: keyName || "agents",
      });
      if (error) {
        setMessage(error.message ?? "Could not create key");
        return;
      }
      setNewKey(data?.key ?? "");
      setMessage("Copy the key now — it will not be shown again.");
      await loadKeys();
    } finally {
      setBusy(null);
    }
  }

  async function deleteKey(id: string) {
    setBusy(`delete:${id}`);
    try {
      await authClient.apiKey.delete({ keyId: id });
      await loadKeys();
    } finally {
      setBusy(null);
    }
  }

  async function saveCalendar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy("calendar");
    try {
      const { error } = await authClient.updateUser({
        calendarId: String(form.get("calendarId") ?? ""),
        timezone: String(form.get("timezone") ?? ""),
        highlightTime: String(form.get("highlightTime") ?? ""),
        microTime: String(form.get("microTime") ?? ""),
        dueTime: String(form.get("dueTime") ?? ""),
      });
      setMessage(
        error ? (error.message ?? "Could not save") : "Calendar settings saved.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function testCalendar() {
    setBusy("test");
    setMessage("Testing…");
    try {
      const response = await fetch("/api/v1/calendar/health");
      const data = await response.json();
      if (data.configured === false) {
        setMessage("Add GOOGLE_SERVICE_ACCOUNT_JSON in Vercel first.");
      } else if (data.ok) {
        setMessage("Test event created and removed. Check your calendar.");
      } else if (data.error) {
        setMessage(`Calendar error: ${data.error}`);
      } else {
        setMessage("Calendar not configured. Set a calendar ID below.");
      }
    } finally {
      setBusy(null);
    }
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    setBusy("password");
    try {
      const { error } = await authClient.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setMessage(
        error
          ? (error.message ?? "Could not change password")
          : "Password changed.",
      );
      setPasswords({ currentPassword: "", newPassword: "" });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <Hint k="settings" />
      </header>

      {message ? (
        <p
          role="status"
          aria-live="polite"
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
        >
          {message}
        </p>
      ) : null}

      <Card>
        <p className={label}>Account</p>
        <p className="mt-2 text-sm">{session?.user?.name}</p>
        <p className="text-sm text-muted">{session?.user?.email}</p>
      </Card>

      <Card>
        <p className={`${label} flex items-center`}>
          Agent API keys <Hint k="agentKeys" />
        </p>
        <div className="mt-3 space-y-2" aria-busy={loadingKeys}>
          {loadingKeys ? <Skeleton className="h-11 w-full" /> : null}
          {keys.map((key) => (
            <div
              key={key.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
              aria-busy={busy === `delete:${key.id}`}
            >
              <span>
                {key.name || "key"}
                <span className="ml-2 font-mono text-xs text-muted">
                  {key.start}…
                </span>
              </span>
              <button
                disabled={busy === `delete:${key.id}`}
                className="text-xs text-danger hover:underline disabled:opacity-40"
                onClick={() => deleteKey(key.id)}
              >
                {busy === `delete:${key.id}` ? "Revoking…" : "Revoke"}
              </button>
            </div>
          ))}
          {!loadingKeys && keys.length === 0 ? (
            <p className="text-sm text-muted">No keys yet.</p>
          ) : null}
        </div>
        <form onSubmit={createKey} className="mt-3 flex gap-2">
          <input
            value={keyName}
            onChange={(event) => setKeyName(event.target.value)}
            placeholder="Key name"
            className={input}
          />
          <BusyButton busy={busy === "create"}>
            {busy === "create" ? "Creating" : "Create key"}
          </BusyButton>
        </form>
        {newKey ? (
          <div className="mt-3">
            <p className="text-xs text-muted">Your new key:</p>
            <code className="mt-1 block break-all rounded-lg border border-border bg-bg p-2 font-mono text-xs">
              {newKey}
            </code>
          </div>
        ) : null}
        <p className="mt-3 text-xs text-muted">
          Use it as <code>Authorization: Bearer &lt;key&gt;</code>.
        </p>
      </Card>

      <Card>
        <p className={`${label} flex items-center`}>
          Calendar <Hint k="calendar" />
        </p>
        <form
          key={session?.user?.id ?? "loading"}
          onSubmit={saveCalendar}
          className="mt-4 space-y-3"
        >
          <div>
            <label className={label}>Calendar ID</label>
            <input
              name="calendarId"
              defaultValue={session?.user?.calendarId ?? ""}
              placeholder="you@gmail.com"
              className={`${input} mt-1`}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={label}>Timezone</label>
              <input
                name="timezone"
                defaultValue={session?.user?.timezone ?? "Asia/Kolkata"}
                className={`${input} mt-1`}
              />
            </div>
            <div>
              <label className={label}>Highlight time</label>
              <input
                type="time"
                name="highlightTime"
                defaultValue={session?.user?.highlightTime ?? "09:00"}
                className={`${input} mt-1`}
              />
            </div>
            <div>
              <label className={label}>Micro time</label>
              <input
                type="time"
                name="microTime"
                defaultValue={session?.user?.microTime ?? "20:00"}
                className={`${input} mt-1`}
              />
            </div>
            <div>
              <label className={label}>Due task time</label>
              <input
                type="time"
                name="dueTime"
                defaultValue={session?.user?.dueTime ?? "09:00"}
                className={`${input} mt-1`}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <BusyButton busy={busy === "calendar"} type="submit">
              {busy === "calendar" ? "Saving" : "Save"}
            </BusyButton>
            <BusyButton
              className={btnGhost}
              busy={busy === "test"}
              type="button"
              onClick={testCalendar}
            >
              {busy === "test" ? "Testing" : "Test calendar"}
            </BusyButton>
          </div>
        </form>
      </Card>

      <Card>
        <p className={label}>Change password</p>
        <form onSubmit={changePassword} className="mt-3 space-y-2">
          <input
            type="password"
            value={passwords.currentPassword}
            onChange={(event) =>
              setPasswords({
                ...passwords,
                currentPassword: event.target.value,
              })
            }
            placeholder="Current password"
            autoComplete="current-password"
            className={input}
          />
          <input
            type="password"
            value={passwords.newPassword}
            onChange={(event) =>
              setPasswords({ ...passwords, newPassword: event.target.value })
            }
            placeholder="New password"
            autoComplete="new-password"
            className={input}
          />
          <BusyButton busy={busy === "password"} type="submit">
            {busy === "password" ? "Changing" : "Change password"}
          </BusyButton>
        </form>
      </Card>
    </div>
  );
}
