"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "./AppShell";

const PUBLIC_PATHS = ["/login"];

// TEMPORARY: bypass login while Supabase email auth is unavailable.
// Set NEXT_PUBLIC_SKIP_AUTH=false once auth is working again.
const SKIP_AUTH = process.env.NEXT_PUBLIC_SKIP_AUTH === "true";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base">
      <p className="text-text-secondary text-sm">Loading...</p>
    </div>
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC_PATHS.includes(pathname);
  const isOnboarding = pathname === "/onboarding";
  // A brand-new user has no UserProfile row at all yet (not just
  // onboarded: false) - treat "no profile" the same as "not onboarded".
  const needsOnboarding = !!user && (!profile || !profile.onboarded);

  useEffect(() => {
    if (SKIP_AUTH || loading) return;

    if (!user && !isPublic) {
      router.replace("/login");
    } else if (user && isPublic) {
      router.replace("/workspace");
    } else if (needsOnboarding && !isOnboarding) {
      router.replace("/onboarding");
    } else if (user && !needsOnboarding && isOnboarding) {
      router.replace("/workspace");
    }
  }, [loading, user, isPublic, isOnboarding, needsOnboarding, router]);

  if (SKIP_AUTH) return <AppShell>{children}</AppShell>;

  if (loading) return <LoadingScreen />;

  // Unauthenticated: only the public login page may render, else wait for redirect.
  if (!user) {
    return isPublic ? <>{children}</> : <LoadingScreen />;
  }

  // Authenticated but on the public login page: wait for redirect away.
  if (isPublic) return <LoadingScreen />;

  // Authenticated, profile not yet onboarded: only the onboarding page may render.
  if (needsOnboarding) {
    return isOnboarding ? <>{children}</> : <LoadingScreen />;
  }

  // Authenticated and onboarded but still on the onboarding page: wait for redirect away.
  if (isOnboarding) return <LoadingScreen />;

  return <AppShell>{children}</AppShell>;
}
