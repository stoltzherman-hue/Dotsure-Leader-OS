"use client";

import { useCallback, useEffect, useState } from "react";

type TeamMember = { id: string; full_name: string | null; department: string | null };

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  priority: string;
  department: string | null;
  assigned_to: string | null;
  assigned_to_name: string | null;
  created_by_name: string | null;
};

const DEPARTMENTS = [
  "Sales",
  "Distribution",
  "Service",
  "Retentions",
  "Return Debits",
  "Claims",
  "Front Line",
];

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
const STATUSES = ["OPEN", "IN_PROGRESS", "DONE"];
const FILTERS = ["All", "Open", "Overdue", "Done"] as const;

function isOverdue(task: Task) {
  return !!task.due_date && task.status !== "DONE" && new Date(task.due_date) < new Date();
}

function priorityClass(priority: string) {
  if (priority === "HIGH") return "text-danger";
  if (priority === "MEDIUM") return "text-warning";
  return "text-text-muted";
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [followUps, setFollowUps] = useState<Record<string, string>>({});
  const [draftingId, setDraftingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [creating, setCreating] = useState(false);

  const loadTasks = useCallback(async () => {
    const res = await fetch("/api/tasks");
    if (!res.ok) return;
    const data = await res.json();
    setTasks(data.tasks || []);
    setTeamMembers(data.teamMembers || []);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    loadTasks();
  }, [loadTasks]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || creating) return;
    setCreating(true);

    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        assigned_to: assignedTo || null,
        due_date: dueDate || null,
        priority,
        department,
      }),
    });

    setTitle("");
    setDescription("");
    setAssignedTo("");
    setDueDate("");
    setPriority("MEDIUM");
    setCreating(false);
    loadTasks();
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadTasks();
  }

  async function draftFollowUp(task: Task) {
    setDraftingId(task.id);
    const res = await fetch("/api/tasks/follow-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        assignedToName: task.assigned_to_name,
        dueDate: task.due_date,
        status: task.status,
      }),
    });
    const data = await res.json();
    setFollowUps((prev) => ({ ...prev, [task.id]: data.message || "" }));
    setDraftingId(null);
  }

  const visibleTasks = tasks.filter((t) => {
    if (filter === "Open") return t.status !== "DONE";
    if (filter === "Overdue") return isOverdue(t);
    if (filter === "Done") return t.status === "DONE";
    return true;
  });

  return (
    <div className="flex h-full gap-6">
      <div className="w-72 shrink-0">
        <form onSubmit={handleCreate} className="card p-4 flex flex-col gap-3">
          <p className="label">New task</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            required
            className="input-field"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Details (optional)"
            rows={2}
            className="input-field resize-none"
          />
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="input-field"
          >
            <option value="">Unassigned</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name || "Unnamed"}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="input-field"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="input-field"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="input-field"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <button type="submit" disabled={creating} className="btn-primary">
            {creating ? "Creating..." : "Create task"}
          </button>
        </form>
        {teamMembers.length === 0 && (
          <p className="text-text-muted text-xs px-1 mt-2">
            No team members yet - tasks can still be created unassigned.
          </p>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-3">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`label px-3 py-1.5 rounded-full border ${
                filter === f
                  ? "border-border-active text-orange"
                  : "border-border text-text-secondary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {visibleTasks.map((task) => (
            <div key={task.id} className="card p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-text-primary font-medium">{task.title}</p>
                  {task.description && (
                    <p className="text-text-secondary text-sm mt-1">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                    <span className={priorityClass(task.priority)}>
                      {task.priority}
                    </span>
                    {task.department && <span>{task.department}</span>}
                    {task.assigned_to_name && <span>→ {task.assigned_to_name}</span>}
                    {task.due_date && (
                      <span className={isOverdue(task) ? "text-danger font-medium" : ""}>
                        Due {new Date(task.due_date).toLocaleDateString("en-ZA")}
                        {isOverdue(task) ? " (overdue)" : ""}
                      </span>
                    )}
                  </div>
                </div>

                <select
                  value={task.status}
                  onChange={(e) => updateStatus(task.id, e.target.value)}
                  className="input-field text-xs py-1.5"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              {task.status !== "DONE" && (
                <div className="mt-3">
                  <button
                    onClick={() => draftFollowUp(task)}
                    disabled={draftingId === task.id}
                    className="text-orange text-xs font-medium"
                  >
                    {draftingId === task.id ? "Drafting..." : "Draft follow-up"}
                  </button>
                  {followUps[task.id] && (
                    <p className="text-text-secondary text-sm mt-2 bg-bg-surface rounded-lg p-3 whitespace-pre-wrap">
                      {followUps[task.id]}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
          {visibleTasks.length === 0 && (
            <p className="text-text-muted text-sm px-1">No tasks here.</p>
          )}
        </div>
      </div>
    </div>
  );
}
