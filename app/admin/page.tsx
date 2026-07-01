"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const DEPARTMENTS = [
  "Sales",
  "Distribution",
  "Service",
  "Retentions",
  "Return Debits",
  "Claims",
  "Front Line",
];

type TeamMember = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  department: string | null;
  team_size: number | null;
};

export default function AdminPage() {
  const supabase = createClient();
  const { user, profile, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [teamSize, setTeamSize] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing form fields to the loaded profile
      setFullName(profile.full_name || "");
      setDepartment(profile.department || DEPARTMENTS[0]);
      setTeamSize(profile.team_size?.toString() || "");
    }
  }, [profile]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    setProfileSaved(false);
    await supabase
      .from("UserProfile")
      .update({
        full_name: fullName,
        department,
        team_size: teamSize ? Number(teamSize) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    await refreshProfile();
    setSavingProfile(false);
    setProfileSaved(true);
  }

  const [team, setTeam] = useState<TeamMember[]>([]);

  const loadTeam = useCallback(async () => {
    const res = await fetch("/api/team");
    if (!res.ok) return;
    const data = await res.json();
    setTeam(data.team || []);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    loadTeam();
  }, [loadTeam]);

  const [contextId, setContextId] = useState<string | null>(null);
  const [contextContent, setContextContent] = useState("");
  const [savingContext, setSavingContext] = useState(false);
  const [contextSaved, setContextSaved] = useState(false);

  const loadContext = useCallback(async () => {
    const { data } = await supabase
      .from("SystemContext")
      .select("id, content")
      .order("updatedAt", { ascending: false })
      .limit(1)
      .maybeSingle();
    setContextId(data?.id || null);
    setContextContent(data?.content || "");
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    loadContext();
  }, [loadContext]);

  async function handleSaveContext(e: React.FormEvent) {
    e.preventDefault();
    setSavingContext(true);
    setContextSaved(false);

    if (contextId) {
      await supabase
        .from("SystemContext")
        .update({ content: contextContent, updatedAt: new Date().toISOString() })
        .eq("id", contextId);
    } else {
      const { data } = await supabase
        .from("SystemContext")
        .insert({ content: contextContent })
        .select("id")
        .single();
      setContextId(data?.id || null);
    }

    setSavingContext(false);
    setContextSaved(true);
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="card p-6">
        <p className="label mb-4">My profile</p>
        {!user ? (
          <p className="text-text-muted text-sm">Sign in to edit your profile.</p>
        ) : (
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-3 max-w-sm">
            <div className="flex flex-col gap-1.5">
              <label className="label" htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label" htmlFor="department">Department</label>
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="input-field"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label" htmlFor="teamSize">Team size</label>
              <input
                id="teamSize"
                type="number"
                min={0}
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={savingProfile} className="btn-primary">
                {savingProfile ? "Saving..." : "Save profile"}
              </button>
              {profileSaved && <span className="text-success text-sm">Saved</span>}
            </div>
          </form>
        )}
      </div>

      <div className="card p-6">
        <p className="label mb-4">Team</p>
        <div className="flex flex-col gap-2">
          {team.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-bg-surface text-sm"
            >
              <div>
                <p className="text-text-primary font-medium">
                  {m.full_name || "Unnamed"}
                </p>
                <p className="text-text-muted text-xs">{m.email}</p>
              </div>
              <div className="text-text-secondary text-xs text-right">
                <p>{m.department || "-"}</p>
                <p>{m.role}{m.team_size ? ` - team of ${m.team_size}` : ""}</p>
              </div>
            </div>
          ))}
          {team.length === 0 && (
            <p className="text-text-muted text-sm">No team members yet.</p>
          )}
        </div>
      </div>

      <div className="card p-6">
        <p className="label mb-2">System context</p>
        <p className="text-text-secondary text-sm mb-4">
          This is injected into every AI conversation across Workspace, Reports,
          and Tasks. Edit carefully - it shapes how the AI understands Dotsure.
        </p>
        <form onSubmit={handleSaveContext} className="flex flex-col gap-3">
          <textarea
            value={contextContent}
            onChange={(e) => setContextContent(e.target.value)}
            rows={12}
            className="input-field resize-y font-mono text-xs"
          />
          <div className="flex items-center gap-3">
            <button type="submit" disabled={savingContext} className="btn-primary">
              {savingContext ? "Saving..." : "Save system context"}
            </button>
            {contextSaved && <span className="text-success text-sm">Saved</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
