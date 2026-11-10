"use client";

import { useState } from "react";

export function useBusy() {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function run(key: string, action: () => Promise<void>) {
    setBusy(key);
    setError("");
    try {
      await action();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something failed.");
    } finally {
      setBusy(null);
    }
  }

  return { busy, error, run };
}
