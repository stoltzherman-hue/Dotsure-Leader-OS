import { NextRequest } from "next/server";
import { anthropic, CLAUDE_MODEL, DOTSURE_GUARDRAILS } from "@/lib/anthropic";
import { createClient } from "@/lib/supabase-server";
import { getKnowledgeBlock } from "@/lib/knowledge";

type ChatMessage = { role: "user" | "assistant"; content: string };

// TEMPORARY: bypass login while Supabase email auth is unavailable.
// Set NEXT_PUBLIC_SKIP_AUTH=false once auth is working again.
const SKIP_AUTH = process.env.NEXT_PUBLIC_SKIP_AUTH === "true";

export async function POST(req: NextRequest) {
  const { messages, conversationId, save } = (await req.json()) as {
    messages: ChatMessage[];
    conversationId?: string | null;
    save?: boolean;
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !SKIP_AUTH) {
    return new Response("Unauthorized", { status: 401 });
  }

  const canPersist = !!user && !!save;

  const [{ data: profile }, { data: systemContext }, knowledgeBlock] = await Promise.all([
    user
      ? supabase.from("UserProfile").select("*").eq("id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("SystemContext")
      .select("content")
      .order("updatedAt", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getKnowledgeBlock(supabase),
  ]);

  const systemPrompt = `You are the Dotsure Leader OS AI assistant, embedded in the Workspace module.

You are speaking with ${profile?.full_name || "a Dotsure leader"}, ${
    profile?.role || "Manager"
  } in the ${profile?.department || "unspecified"} department.

${systemContext?.content || ""}
${knowledgeBlock}

${DOTSURE_GUARDRAILS}

Be direct, professional, and immediately useful. Draft, analyse, and advise at senior executive depth. No filler.`;

  let activeConversationId = conversationId || null;

  if (canPersist && !activeConversationId) {
    const { data: created } = await supabase
      .from("Conversation")
      .insert({
        user_id: user!.id,
        title: messages[0]?.content?.slice(0, 60) || "New conversation",
        module: "workspace",
        messages,
      })
      .select("id")
      .single();
    activeConversationId = created?.id ?? null;
  }

  const claudeStream = anthropic.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  let fullText = "";
  const encoder = new TextEncoder();

  const body = new ReadableStream({
    start(controller) {
      claudeStream.on("text", (delta: string) => {
        fullText += delta;
        controller.enqueue(encoder.encode(delta));
      });

      claudeStream.on("end", async () => {
        if (canPersist && activeConversationId) {
          await supabase
            .from("Conversation")
            .update({
              messages: [...messages, { role: "assistant", content: fullText }],
              updated_at: new Date().toISOString(),
            })
            .eq("id", activeConversationId)
            .eq("user_id", user!.id);
        }
        controller.close();
      });

      claudeStream.on("error", (err: Error) => {
        controller.error(err);
      });
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      ...(activeConversationId ? { "X-Conversation-Id": activeConversationId } : {}),
    },
  });
}
