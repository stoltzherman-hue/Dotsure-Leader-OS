"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type ReportSummary = { id: string; filename: string; created_at: string };

export default function ReportsPage() {
  const supabase = createClient();
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadReports = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("ReportAnalysis")
      .select("id, filename, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setReports(data || []);
  }, [supabase, user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    loadReports();
  }, [loadReports]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [analysis]);

  async function openReport(id: string) {
    const { data } = await supabase
      .from("ReportAnalysis")
      .select("analysis")
      .eq("id", id)
      .single();
    setError(null);
    setAnalysis(data?.analysis || "");
  }

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    if (!file || analyzing) return;
    setError(null);
    setAnalysis("");
    setAnalyzing(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/reports", {
      method: "POST",
      body: formData,
    });

    if (!res.ok || !res.body) {
      setError((await res.text()) || "Something went wrong analysing this file.");
      setAnalyzing(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let acc = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      acc += decoder.decode(value, { stream: true });
      setAnalysis(acc);
    }

    setAnalyzing(false);
    setFile(null);
    loadReports();
  }

  return (
    <div className="flex h-full gap-6">
      <div className="w-64 shrink-0 flex flex-col gap-3">
        <form onSubmit={handleAnalyze} className="card p-4 flex flex-col gap-3">
          <p className="label">Upload</p>
          <input
            id="report-file"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          <label
            htmlFor="report-file"
            className="input-field cursor-pointer text-center text-text-secondary hover:text-text-primary"
          >
            {file ? file.name : "Choose file"}
          </label>
          <button type="submit" disabled={!file || analyzing} className="btn-primary">
            {analyzing ? "Analysing..." : "Analyse"}
          </button>
        </form>

        <div className="flex flex-col gap-1 overflow-y-auto">
          {reports.map((r) => (
            <button
              key={r.id}
              onClick={() => openReport(r.id)}
              className="card text-left px-3 py-2 text-sm truncate"
            >
              {r.filename}
            </button>
          ))}
          {reports.length === 0 && (
            <p className="text-text-muted text-sm px-1">No reports yet</p>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <p className="label">Reports</p>
          <p className="text-text-primary text-sm font-medium">
            Upload a file for AI-driven analysis
          </p>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4">
          {error && <p className="text-danger text-sm mb-3">{error}</p>}
          {!analysis && !error && (
            <p className="text-text-muted text-sm">
              Upload an Excel or CSV file (max 5MB) to get a Summary, Insights,
              Action Steps, and Risks - what the data says and what to do about it.
            </p>
          )}
          {analysis && (
            <div className="text-sm whitespace-pre-wrap max-w-2xl">{analysis}</div>
          )}
        </div>
      </div>
    </div>
  );
}
