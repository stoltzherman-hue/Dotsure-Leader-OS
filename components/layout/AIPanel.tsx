"use client";

import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };

export function AIPanel({ onClose }: { onClose?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

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
      body: JSON.stringify({ messages: nextMessages, save: false }),
    });

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
  }

  return (
    <aside className="w-full lg:w-[380px] shrink-0 h-screen sticky top-0 flex flex-col bg-bg-surface border-l border-border">
      <div className="px-5 py-5 border-b border-border flex items-center justify-between">
        <div>
          <p className="label">Quick ask</p>
          <p className="text-text-primary text-sm font-medium">Dotsure AI</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary lg:hidden"
          >
            Close
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="text-text-muted text-sm">
            Ask anything - drafting, quick analysis, or a fast answer without leaving this page.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`card px-3 py-2 text-sm whitespace-pre-wrap ${
              m.role === "user" ? "bg-teal-dim" : ""
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
          placeholder="Ask Dotsure AI..."
          className="input-field flex-1"
        />
        <button type="submit" disabled={sending} className="btn-primary">
          Send
        </button>
      </form>
    </aside>
  );
}
