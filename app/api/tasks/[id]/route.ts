import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

const SKIP_AUTH = process.env.NEXT_PUBLIC_SKIP_AUTH === "true";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !SKIP_AUTH) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const admin = createAdminClient();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.status) updates.status = body.status;
  if ("assigned_to" in body) updates.assigned_to = body.assigned_to || null;
  if ("due_date" in body) updates.due_date = body.due_date || null;
  if ("priority" in body) updates.priority = body.priority;

  const { data, error } = await admin
    .from("Task")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return new Response(error.message, { status: 400 });
  }

  return Response.json({ task: data });
}
