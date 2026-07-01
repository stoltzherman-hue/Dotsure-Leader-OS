import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

const SKIP_AUTH = process.env.NEXT_PUBLIC_SKIP_AUTH === "true";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !SKIP_AUTH) {
    return new Response("Unauthorized", { status: 401 });
  }

  const admin = createAdminClient();
  const { data } = await admin
    .from("UserProfile")
    .select("id, full_name, email, role, department, team_size")
    .order("full_name", { ascending: true });

  return Response.json({ team: data || [] });
}
