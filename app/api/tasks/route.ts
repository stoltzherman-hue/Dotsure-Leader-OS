import { NextRequest } from "next/server";
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

  const [{ data: tasks }, { data: profiles }] = await Promise.all([
    admin
      .from("Task")
      .select("*")
      .order("due_date", { ascending: true, nullsFirst: false }),
    admin.from("UserProfile").select("id, full_name, department"),
  ]);

  const profileById = new Map((profiles || []).map((p) => [p.id, p]));
  const tasksWithNames = (tasks || []).map((t) => ({
    ...t,
    created_by_name: profileById.get(t.created_by)?.full_name || null,
    assigned_to_name: profileById.get(t.assigned_to)?.full_name || null,
  }));

  return Response.json({ tasks: tasksWithNames, teamMembers: profiles || [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !SKIP_AUTH) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("Task")
    .insert({
      created_by: user?.id ?? null,
      assigned_to: body.assigned_to || null,
      title: body.title,
      description: body.description || null,
      due_date: body.due_date || null,
      priority: body.priority || "MEDIUM",
      department: body.department || null,
      status: "OPEN",
    })
    .select()
    .single();

  if (error) {
    return new Response(error.message, { status: 400 });
  }

  return Response.json({ task: data });
}
