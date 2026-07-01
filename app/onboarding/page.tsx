"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [teamSize, setTeamSize] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setLoading(true);

    const { error: upsertError } = await supabase.from("UserProfile").upsert({
      id: user.id,
      email: user.email,
      full_name: fullName,
      department,
      team_size: teamSize ? Number(teamSize) : null,
      onboarded: true,
    });

    setLoading(false);

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    await refreshProfile();
    router.push("/workspace");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary">
            Set up your profile
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Tell us who you are so the AI can tailor its work to you
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="label" htmlFor="fullName">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
              placeholder="Herman Stoltz"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label" htmlFor="department">
              Department
            </label>
            <select
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="input-field"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label" htmlFor="teamSize">
              Team size
            </label>
            <input
              id="teamSize"
              type="number"
              min={0}
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              className="input-field"
              placeholder="12"
            />
          </div>

          {error && <p className="text-danger text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Saving..." : "Continue to Workspace"}
          </button>
        </form>
      </div>
    </div>
  );
}
