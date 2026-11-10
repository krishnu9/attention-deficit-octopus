"use client";

import { useState } from "react";
import { hints, type HintKey } from "@/lib/hints";

export function Hint({ k }: { k: HintKey }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="What does this mean?"
        title={hints[k]}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-border text-[10px] leading-none text-muted transition-colors hover:border-accent hover:text-accent"
      >
        ?
      </button>
      {open ? (
        <span className="absolute left-0 top-5 z-20 w-56 rounded-lg border border-border bg-card p-2 text-xs font-normal normal-case leading-snug tracking-normal text-muted shadow-lg">
          {hints[k]}
        </span>
      ) : null}
    </span>
  );
}
