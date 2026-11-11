"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/nav";
import DayRail from "@/components/day-rail";
import { Icon } from "@/components/icons";
import { btnGhost } from "@/components/ui";

export default function Shell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dateLabel, setDateLabel] = useState("");
  const menuButton = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  function close() {
    setMenuOpen(false);
  }

  useEffect(() => {
    if (wasOpen.current && !menuOpen) menuButton.current?.focus();
    wasOpen.current = menuOpen;
  }, [menuOpen]);

  useEffect(() => {
    // Deferred so prerender never evaluates new Date().
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDateLabel(
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    );
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-bg">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-card lg:block">
        <Sidebar />
      </aside>

      <div className="lg:pl-64" inert={menuOpen}>
        <header className="sticky top-0 z-30 border-b border-border bg-card">
          <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              ref={menuButton}
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="main-menu"
              className="-ml-2 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden"
            >
              <Icon name="menu" className="h-5 w-5" />
            </button>

            <p className="hidden min-w-0 truncate text-xs font-medium uppercase tracking-wide text-muted sm:block">
              {dateLabel || "Today"}
            </p>

            <div className="ml-auto flex shrink-0 items-center gap-2">
              <Link href="/inbox" className={`${btnGhost} gap-1.5`}>
                <Icon name="plus" className="h-4 w-4" />
                Capture
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-5xl items-start gap-6 px-4 pb-24 pt-6 sm:px-6">
          <main className="min-w-0 flex-1">{children}</main>
          <aside className="hidden w-64 shrink-0 xl:block">
            <DayRail />
          </aside>
        </div>
      </div>

      {menuOpen ? (
        <div
          id="main-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
          className="fixed inset-0 z-50 lg:hidden"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="absolute inset-0 h-full w-full bg-fg/30 motion-safe:animate-[fade-in_150ms_ease-out]"
          />
          <div className="relative h-full w-72 max-w-[85vw] border-r border-border bg-card motion-safe:animate-[drawer-in_200ms_ease-out]">
            <button
              type="button"
              onClick={close}
              autoFocus
              aria-label="Close menu"
              className="absolute right-2 top-3 z-10 grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Icon name="close" className="h-5 w-5" />
            </button>
            <Sidebar onNavigate={close} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
