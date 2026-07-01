"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const NAV_ITEMS = [
  { href: "/workspace", label: "Workspace" },
  { href: "/reports", label: "Reports" },
  { href: "/tasks", label: "Tasks" },
  { href: "/builds", label: "Builds" },
  { href: "/knowledge", label: "Knowledge" },
  { href: "/admin", label: "Admin" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  return (
    <aside className="w-[220px] shrink-0 h-screen sticky top-0 flex flex-col bg-bg-surface border-r border-border">
      <div className="px-5 py-5">
        <h1 className="text-base font-bold text-text-primary">
          Dotsure <span className="text-orange">Leader OS</span>
        </h1>
      </div>

      <nav className="flex-1 flex flex-col gap-1 py-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${active ? "nav-item-active" : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-border">
        <p className="text-text-primary text-sm font-medium truncate">
          {profile?.full_name || "Test mode"}
        </p>
        <p className="text-text-muted text-xs truncate">
          {profile?.department || ""}
        </p>
        <button
          onClick={signOut}
          className="text-text-secondary hover:text-text-primary text-xs mt-2"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
