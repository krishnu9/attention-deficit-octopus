"use client";

import { useEffect, useRef, useState } from "react";
import { hints, type HintKey } from "@/lib/hints";

export function Hint({ k }: { k: HintKey }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === "Escape") setOpen(false);
      } else if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", close);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", close);
    };
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex align-middle">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="What does this mean?"
        aria-expanded={open}
        title={hints[k]}
        className="relative ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs leading-none text-muted transition-colors before:absolute before:-inset-2.5 before:content-[''] hover:border-fg/40 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        ?
      </button>
      {open ? (
        <span
          role="tooltip"
          className="absolute left-0 top-8 z-20 w-56 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-card p-2 text-xs font-normal normal-case leading-snug tracking-normal text-muted shadow-lg"
        >
          {hints[k]}
        </span>
      ) : null}
    </span>
  );
}
