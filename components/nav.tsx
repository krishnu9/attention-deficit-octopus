"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui";

const links = [
  ["/today", "Today"],
  ["/inbox", "Inbox"],
  ["/week", "Week"],
  ["/projects", "Projects"],
  ["/settings", "Settings"],
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

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
    <nav className="flex flex-wrap items-center gap-1">
      {links.map(([href, name]) => (
        <Link
          key={href}
          href={href}
          className={`rounded-lg px-3 py-2 text-sm transition-colors ${
            pathname.startsWith(href)
              ? "bg-accent/10 font-medium text-accent"
              : "text-muted hover:text-fg"
          }`}
        >
          {name}
        </Link>
      ))}
      <button
        onClick={signOut}
        disabled={signingOut}
        aria-busy={signingOut}
        className="ml-auto inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-40"
      >
        {signingOut ? <Spinner /> : null}
        {signingOut ? "Signing out" : "Sign out"}
      </button>
    </nav>
  );
}
