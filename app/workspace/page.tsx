"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type Message = { role: "user" | "assistant"; content: string };
type ConversationSummary = { id: string; title: string; updated_at: string };

export default function WorkspacePage() {
  const supabase = createClient();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("Conversation")
      .select("id, title, updated_at")
      .eq("user_id", user.id)
      .eq("module", "workspace")
      .order("updated_at", { ascending: false });
    setConversations(data || []);
  }, [supabase, user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function openConversation(id: string) {
    const { data } = await supabase
      .from("Conversation")
      .select("messages")
      .eq("id", id)
      .single();
    setConversationId(id);
    setMessages((data?.messages as Message[]) || []);
  }

  function startNewConversation() {
    setConversationId(null);
    setMessages([]);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setSending(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: nextMessages,
        conversationId,
        save: true,
      }),
    });

    const newConversationId = res.headers.get("X-Conversation-Id");
    if (newConversationId && newConversationId !== conversationId) {
      setConversationId(newConversationId);
    }

    if (!res.body) {
      setSending(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let acc = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      acc += decoder.decode(value, { stream: true });
      setMessages([...nextMessages, { role: "assistant", content: acc }]);
    }

    setSending(false);
    loadConversations();
  }

  return (
    <div className="flex h-full gap-6">
      <div className="w-64 shrink-0 flex flex-col gap-3">
        <button onClick={startNewConversation} className="btn-primary w-full">
          New conversation
        </button>
        <div className="flex flex-col gap-1 overflow-y-auto">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => openConversation(c.id)}
              className={`card text-left px-3 py-2 text-sm truncate ${
                c.id === conversationId ? "border-border-active" : ""
              }`}
            >
              {c.title}
            </button>
          ))}
          {conversations.length === 0 && (
            <p className="text-text-muted text-sm px-1">No conversations yet</p>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <p className="label">Workspace</p>
          <p className="text-text-primary text-sm font-medium">
            Your persistent AI assistant
          </p>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
          {messages.length === 0 && (
            <p className="text-text-muted text-sm">
              Draft a SITREP, summarise call stats, write an escalation email, or ask anything about your department.
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-2xl px-4 py-3 rounded-xl text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "self-end bg-teal-dim"
                  : "self-start bg-bg-elevated"
              }`}
            >
              {m.content || (m.role === "assistant" && sending ? "..." : "")}
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="input-field flex-1"
          />
          <button type="submit" disabled={sending} className="btn-primary">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
