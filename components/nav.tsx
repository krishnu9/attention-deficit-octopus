"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui";
import { Icon, type IconName } from "@/components/icons";

const links: [string, string, IconName][] = [
  ["/today", "Today", "today"],
  ["/inbox", "Inbox", "inbox"],
  ["/week", "Week", "week"],
  ["/projects", "Projects", "projects"],
  ["/settings", "Settings", "settings"],
];

export default function Sidebar({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [signingOut, setSigningOut] = useState(false);

  const email = session?.user?.email ?? "";

  async function signOut() {
    setSigningOut(true);
    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <Link
        href="/today"
        onClick={onNavigate}
        className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span
          aria-hidden="true"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-fg text-sm font-semibold text-bg"
        >
          K
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold leading-tight">
            Kaizen OS
          </span>
          <span className="block text-xs leading-tight text-muted">
            Small steps. No guilt.
          </span>
        </span>
      </Link>

      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wide text-muted">
          Workspace
        </p>
        <ul className="space-y-0.5">
          {links.map(([href, name, icon]) => {
            const active = pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    active
                      ? "bg-fg/[0.06] font-medium text-fg"
                      : "text-muted hover:text-fg"
                  }`}
                >
                  <Icon name={icon} className="h-4 w-4 shrink-0" />
                  {name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 border-t border-border p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <span
            aria-hidden="true"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-xs font-medium uppercase text-muted"
          >
            {email.slice(0, 1) || "?"}
          </span>
          <span className="min-w-0 flex-1 truncate text-xs text-muted">
            {email || "Signed in"}
          </span>
        </div>
        <button
          onClick={signOut}
          disabled={signingOut}
          aria-busy={signingOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40"
        >
          {signingOut ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <Icon name="signout" className="h-4 w-4 shrink-0" />
          )}
          {signingOut ? "Signing out" : "Sign out"}
        </button>
      </div>
    </div>
  );
}
