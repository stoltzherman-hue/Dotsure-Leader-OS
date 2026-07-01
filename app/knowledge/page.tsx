"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type KnowledgeItem = {
  id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[] | null;
  created_at: string;
};

const CATEGORIES = [
  "Policy",
  "Product",
  "Regulatory",
  "Decision",
  "Lesson Learned",
];

export default function KnowledgePage() {
  const supabase = createClient();
  const { user } = useAuth();

  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [filter, setFilter] = useState("All");
  const [openId, setOpenId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    const { data } = await supabase
      .from("KnowledgeItem")
      .select("id, title, content, category, tags, created_at")
      .order("created_at", { ascending: false });
    setItems(data || []);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    loadItems();
  }, [loadItems]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim() || saving) return;
    setError(null);
    setSaving(true);

    const { error: insertError } = await supabase.from("KnowledgeItem").insert({
      created_by: user?.id,
      title,
      content,
      category,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });

    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setTitle("");
    setContent("");
    setTags("");
    loadItems();
  }

  const filtered =
    filter === "All" ? items : items.filter((i) => i.category === filter);

  return (
    <div className="flex h-full gap-6">
      <div className="w-72 shrink-0">
        <form onSubmit={handleCreate} className="card p-4 flex flex-col gap-3">
          <p className="label">Add knowledge</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
            className="input-field"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content"
            rows={5}
            required
            className="input-field resize-none"
          />
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags, comma separated"
            className="input-field"
          />
          {error && <p className="text-danger text-sm">{error}</p>}
          {!user && (
            <p className="text-text-muted text-xs">
              Sign in to add knowledge - browsing is open to everyone.
            </p>
          )}
          <button
            type="submit"
            disabled={saving || !user}
            className="btn-primary"
          >
            {saving ? "Saving..." : "Add"}
          </button>
        </form>
      </div>

      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex gap-2 flex-wrap">
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`label px-3 py-1.5 rounded-full border ${
                filter === c
                  ? "border-border-active text-orange"
                  : "border-border text-text-secondary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {filtered.map((item) => (
            <div key={item.id} className="card p-4">
              <button
                onClick={() =>
                  setOpenId(openId === item.id ? null : item.id)
                }
                className="w-full text-left"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-text-primary font-medium">{item.title}</p>
                  {item.category && (
                    <span className="label text-orange shrink-0">
                      {item.category}
                    </span>
                  )}
                </div>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex gap-2 mt-1">
                    {item.tags.map((t) => (
                      <span key={t} className="text-text-muted text-xs">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </button>
              {openId === item.id && (
                <p className="text-text-secondary text-sm mt-3 whitespace-pre-wrap">
                  {item.content}
                </p>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-text-muted text-sm px-1">
              No knowledge items here yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
