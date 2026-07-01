import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_ITEMS = 30;

export async function getKnowledgeBlock(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("KnowledgeItem")
    .select("title, content, category")
    .order("updated_at", { ascending: false })
    .limit(MAX_ITEMS);

  if (!data || data.length === 0) return "";

  const items = data
    .map(
      (k: { title: string; content: string; category: string | null }) =>
        `[${k.category || "General"}] ${k.title}: ${k.content}`
    )
    .join("\n");

  return `\n\nINSTITUTIONAL KNOWLEDGE (from the Knowledge module - treat as established Dotsure context):\n${items}`;
}
