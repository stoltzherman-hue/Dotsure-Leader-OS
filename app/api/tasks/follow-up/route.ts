import { NextRequest } from "next/server";
import { anthropic, CLAUDE_MODEL, DOTSURE_GUARDRAILS } from "@/lib/anthropic";
import { createClient } from "@/lib/supabase-server";

const SKIP_AUTH = process.env.NEXT_PUBLIC_SKIP_AUTH === "true";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !SKIP_AUTH) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { title, description, assignedToName, dueDate, status } = await req.json();

  const { data: systemContext } = await supabase
    .from("SystemContext")
    .select("content")
    .order("updatedAt", { ascending: false })
    .limit(1)
    .maybeSingle();

  const systemPrompt = `You are drafting a short internal follow-up message for a Dotsure leader to send to a colleague about an overdue or upcoming task.

${systemContext?.content || ""}

${DOTSURE_GUARDRAILS}

Write ONLY the message text itself - no subject line, no preamble, no sign-off placeholder. 2-4 sentences. Direct, professional, no filler. British English. The leader will copy and send this themselves.`;

  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 300,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Task: ${title}
${description ? `Details: ${description}\n` : ""}Assigned to: ${assignedToName || "unassigned"}
Due: ${dueDate || "no due date set"}
Status: ${status}

Draft the follow-up message.`,
      },
    ],
  });

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  return Response.json({ message: text });
}
