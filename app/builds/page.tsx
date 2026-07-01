"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const HARNESS_URL = "https://dotsure-build-harness.vercel.app";

type BuildRequest = {
  id: string;
  idea: string;
  status: string;
  risk_tier: string | null;
  harness_project_code: string | null;
  created_at: string;
};

function statusClass(status: string) {
  if (status === "APPROVED") return "text-success";
  if (status === "BLOCKED") return "text-danger";
  return "text-text-muted";
}

function statusLabel(status: string) {
  if (status === "APPROVED") return "Approved - ready to build";
  if (status === "BLOCKED") return "Blocked - needs approval";
  return "Awaiting harness decision";
}

export default function BuildsPage() {
  const supabase = createClient();
  const { user } = useAuth();

  const [idea, setIdea] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<BuildRequest[]>([]);

  const loadRequests = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("BuildRequest")
      .select("id, idea, status, risk_tier, harness_project_code, created_at")
      .order("created_at", { ascending: false });
    setRequests(data || []);
  }, [supabase, user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    loadRequests();
  }, [loadRequests]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idea.trim() || !user || submitting) return;
    setError(null);
    setSubmitting(true);

    const { data, error: insertError } = await supabase
      .from("BuildRequest")
      .insert({ created_by: user.id, idea })
      .select("id")
      .single();

    setSubmitting(false);

    if (insertError || !data) {
      setError(insertError?.message || "Could not create build request");
      return;
    }

    setIdea("");
    loadRequests();
    window.open(`${HARNESS_URL}/pipeline?leaderRequestId=${data.id}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="card p-6">
        <p className="label mb-2">Have a build idea?</p>
        <p className="text-text-secondary text-sm mb-4">
          Describe it below, then submit it to the Dotsure Build Harness for
          assessment in the tab that opens. A low-risk idea that needs no new
          infrastructure comes back approved to build yourself. Anything else
          gets blocked here until the relevant stakeholders sign off in the
          harness.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="What do you want to build?"
            rows={3}
            required
            className="input-field resize-none"
          />
          {error && <p className="text-danger text-sm">{error}</p>}
          {!user && (
            <p className="text-text-muted text-xs">
              Sign in to submit a build idea.
            </p>
          )}
          <button type="submit" disabled={submitting || !user} className="btn-primary">
            {submitting ? "Submitting..." : "Submit to the harness"}
          </button>
        </form>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="label">Your build requests</p>
          <div className="flex gap-2">
            <a
              href={`${HARNESS_URL}/projects`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary text-xs"
            >
              View all builds
            </a>
            <a
              href={`${HARNESS_URL}/approvals`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-secondary hover:text-text-primary text-xs"
            >
              View approvals
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {requests.map((r) => (
            <div key={r.id} className="px-3 py-2 rounded-lg bg-bg-surface">
              <div className="flex items-start justify-between gap-4">
                <p className="text-text-primary text-sm">{r.idea}</p>
                <span className={`text-xs font-medium shrink-0 ${statusClass(r.status)}`}>
                  {statusLabel(r.status)}
                </span>
              </div>
              {(r.risk_tier || r.harness_project_code) && (
                <p className="text-text-muted text-xs mt-1">
                  {r.risk_tier && `Risk: ${r.risk_tier}`}
                  {r.risk_tier && r.harness_project_code && " - "}
                  {r.harness_project_code && `Project: ${r.harness_project_code}`}
                </p>
              )}
            </div>
          ))}
          {requests.length === 0 && (
            <p className="text-text-muted text-sm">No build requests yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
