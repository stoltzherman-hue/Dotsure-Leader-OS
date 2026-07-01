import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-only. Uses the service role key to bypass RLS for controlled,
// specific reads/writes (e.g. cross-user task assignment) that a per-user
// client legitimately can't do. Never import this in a client component.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
