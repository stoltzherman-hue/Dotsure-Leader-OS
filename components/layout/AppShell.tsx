"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { AIPanel } from "./AIPanel";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg-base">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6">{children}</main>

      <div className="hidden lg:block">
        <AIPanel />
      </div>

      {mobilePanelOpen && (
        <div className="fixed inset-0 z-50 bg-bg-base lg:hidden">
          <AIPanel onClose={() => setMobilePanelOpen(false)} />
        </div>
      )}

      <button
        onClick={() => setMobilePanelOpen(true)}
        className="btn-primary fixed bottom-6 right-6 lg:hidden rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
        aria-label="Open Dotsure AI"
      >
        AI
      </button>
    </div>
  );
}
