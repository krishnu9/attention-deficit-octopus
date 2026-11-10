"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

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

  async function signOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
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
        className="ml-auto rounded-lg px-3 py-2 text-sm text-muted hover:text-fg"
      >
        Sign out
      </button>
    </nav>
  );
}
