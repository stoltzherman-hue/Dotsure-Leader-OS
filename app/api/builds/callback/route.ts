import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-callback-secret");
  if (!secret || secret !== process.env.BUILD_CALLBACK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { leaderRequestId, decision, riskTier, projectCode } = await req.json();

  if (!leaderRequestId || !["PROCEED", "BLOCKED"].includes(decision)) {
    return new Response("Invalid payload", { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("BuildRequest")
    .update({
      status: decision === "PROCEED" ? "APPROVED" : "BLOCKED",
      risk_tier: riskTier || null,
      harness_project_code: projectCode || null,
      decided_at: new Date().toISOString(),
    })
    .eq("id", leaderRequestId);

  if (error) {
    return new Response(error.message, { status: 400 });
  }

  return Response.json({ ok: true });
}
