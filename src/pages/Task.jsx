import { useEffect, useMemo, useRef, useState } from "react";


const STORAGE_KEY = "tasks";
const FILTERS = ["All", "Pending", "Completed"];
const UNDO_MS = 6000;

const loadTasks = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveTasks = (tasks) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    /* storage unavailable: keep working in memory */
  }
};

const formatDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/* ---------- icons ---------- */

const Icon = ({ children, className = "h-4 w-4" }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
    {children}
  </svg>
);

const CheckIcon = () => (
  <Icon>
    <path
      d="M5 10.5l3.2 3.2L15 6.8"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

const TrashIcon = () => (
  <Icon>
    <path
      d="M4 6h12M8 6V4.5A1.5 1.5 0 019.5 3h1A1.5 1.5 0 0112 4.5V6m2 0l-.6 9a1.5 1.5 0 01-1.5 1.4H8.1A1.5 1.5 0 016.6 15L6 6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

const SearchIcon = () => (
  <Icon>
    <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </Icon>
);

const CalendarIcon = () => (
  <Icon className="h-3.5 w-3.5">
    <rect x="3.5" y="4.5" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3.5 8.5h13M7 3v3M13 3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </Icon>
);

const SortIcon = ({ flipped }) => (
  <Icon>
    <path
      d={flipped ? "M6 12l4-4 4 4" : "M6 8l4 4 4-4"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

/* ---------- progress ring ---------- */

const ProgressRing = ({ percent }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div
      className="relative h-36 w-36 shrink-0 sm:h-40 sm:w-40"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label="Tasks completed"
    >
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="9" className="stroke-white/15" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-emerald-400 transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tracking-tight text-white">{percent}%</span>
        <span className="mt-0.5 text-xs font-medium text-indigo-200">complete</span>
      </div>
    </div>
  );
};

/* ---------- main component ---------- */

const Task = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);
  const [undo, setUndo] = useState(null);
  const undoTimer = useRef(null);

  useEffect(() => {
    setTasks(loadTasks());
    return () => clearTimeout(undoTimer.current);
  }, []);

  const commit = (next) => {
    setTasks(next);
    saveTasks(next);
  };

  const toggleStatus = (id) => {
    commit(
      tasks.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "Completed" ? "Pending" : "Completed" }
          : t
      )
    );
  };

  const removeTask = (id) => {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return;

    clearTimeout(undoTimer.current);
    setUndo({ task: tasks[index], index });
    commit(tasks.filter((t) => t.id !== id));
    undoTimer.current = setTimeout(() => setUndo(null), UNDO_MS);
  };

  const restoreTask = () => {
    if (!undo) return;
    const next = [...tasks];
    next.splice(Math.min(undo.index, next.length), 0, undo.task);
    commit(next);
    clearTimeout(undoTimer.current);
    setUndo(null);
  };

  const counts = useMemo(() => {
    const completed = tasks.filter((t) => t.status === "Completed").length;
    return {
      All: tasks.length,
      Pending: tasks.length - completed,
      Completed: completed,
    };
  }, [tasks]);

  const percent = counts.All === 0 ? 0 : Math.round((counts.Completed / counts.All) * 100);

  const visibleTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks
      .filter((t) => filter === "All" || t.status === filter)
      .filter(
        (t) => !q || String(t.title).toLowerCase().includes(q) || String(t.id).includes(q)
      )
      .sort((a, b) => (newestFirst ? b.id - a.id : a.id - b.id));
  }, [tasks, filter, query, newestFirst]);

  const summary =
    counts.All === 0
      ? "Nothing here yet. Add a task to get started."
      : counts.Pending === 0
      ? "All caught up. Every task is done."
      : `${counts.Pending} ${counts.Pending === 1 ? "task" : "tasks"} still to do.`;

  const emptyState = (() => {
    if (tasks.length === 0)
      return { title: "No tasks yet", hint: "Add your first task and it will show up here." };
    if (query.trim())
      return {
        title: `No tasks match “${query.trim()}”`,
        hint: "Check the spelling or try a different word.",
        action: { label: "Clear search", run: () => setQuery("") },
      };
    if (filter === "Pending")
      return { title: "Nothing pending", hint: "Every task is done. Nice work." };
    return { title: "No completed tasks yet", hint: "Tick a task's circle to mark it done." };
  })();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-6 sm:px-6 sm:pt-10 lg:px-8">
      {/* ===== Header: the one bold moment ===== */}
      <header className="rounded-3xl bg-indigo-950 px-6 py-8 text-white shadow-xl sm:px-10 sm:py-10">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Your tasks</h1>
            <p className="mt-3 text-base text-indigo-200 sm:text-lg">{summary}</p>

            <dl className="mt-7 flex items-center justify-center gap-6 sm:justify-start">
              {[
                ["Total", counts.All, "text-white"],
                ["Pending", counts.Pending, "text-amber-300"],
                ["Done", counts.Completed, "text-emerald-300"],
              ].map(([label, value, color], i) => (
                <div
                  key={label}
                  className={`${i > 0 ? "border-l border-white/15 pl-6" : ""} text-left`}
                >
                  <dd className={`text-2xl font-bold ${color}`}>{value}</dd>
                  <dt className="text-sm text-indigo-200">{label}</dt>
                </div>
              ))}
            </dl>
          </div>

          <ProgressRing percent={percent} />
        </div>
      </header>

      {/* ===== Toolbar ===== */}
      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="tablist"
          aria-label="Filter tasks by status"
          className="flex rounded-full bg-slate-200/70 p-1"
        >
          {FILTERS.map((name) => {
            const active = filter === name;
            return (
              <button
                key={name}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(name)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 lg:flex-none ${
                  active
                    ? "bg-indigo-950 text-white shadow"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {name}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    active ? "bg-white/15 text-white" : "bg-white text-slate-600"
                  }`}
                >
                  {counts[name]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <label className="relative flex-1 lg:w-64 lg:flex-none">
            <span className="sr-only">Search tasks</span>
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks"
              className="w-full rounded-full border border-slate-300 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-500 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
            />
          </label>

          <button
            onClick={() => setNewestFirst((v) => !v)}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            {newestFirst ? "Newest" : "Oldest"}
            <SortIcon flipped={!newestFirst} />
          </button>
        </div>
      </div>

      {/* ===== Task list ===== */}
      <section aria-label="Task list" className="mt-5">
        {visibleTasks.length > 0 ? (
          <ul className="space-y-2.5">
            {visibleTasks.map((task) => {
              const done = task.status === "Completed";
              return (
                <li
                  key={task.id}
                  className="flex items-stretch overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300"
                >
                  {/* Status rail */}
                  <span
                    aria-hidden="true"
                    className={`w-1.5 shrink-0 ${done ? "bg-emerald-500" : "bg-amber-400"}`}
                  />

                  <div className="flex flex-1 items-center gap-4 px-4 py-4 sm:px-5">
                    {/* Complete toggle */}
                    <button
                      onClick={() => toggleStatus(task.id)}
                      aria-pressed={done}
                      aria-label={
                        done
                          ? `Mark “${task.title}” as pending`
                          : `Mark “${task.title}” as completed`
                      }
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 ${
                        done
                          ? "scale-105 border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-300 text-transparent hover:border-emerald-500 hover:text-emerald-500"
                      }`}
                    >
                      <CheckIcon />
                    </button>

                    {/* Title + meta */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`break-words text-base font-semibold ${
                          done ? "text-slate-500 line-through" : "text-slate-900"
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                        {task.date && (
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarIcon />
                            {formatDate(task.date)}
                          </span>
                        )}
                        <span>#{task.id}</span>
                      </p>
                    </div>

                    {/* Status badge */}
                    <span
                      className={`hidden shrink-0 rounded-full px-3 py-1 text-xs font-semibold sm:inline-block ${
                        done ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {done ? "Completed" : "Pending"}
                    </span>

                    {/* Delete */}
                    <button
                      onClick={() => removeTask(task.id)}
                      aria-label={`Delete “${task.title}”`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-slate-300 px-6 py-20 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
              <Icon className="h-7 w-7">
                <path
                  d="M5 10.5l3.2 3.2L15 6.8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Icon>
            </div>
            <p className="text-lg font-semibold text-slate-900">{emptyState.title}</p>
            <p className="mt-2 text-sm text-slate-600">{emptyState.hint}</p>
            {emptyState.action && (
              <button
                onClick={emptyState.action.run}
                className="mt-6 rounded-full bg-indigo-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
              >
                {emptyState.action.label}
              </button>
            )}
          </div>
        )}
      </section>

      <p className="mt-4 text-right text-sm text-slate-500" aria-live="polite">
        Showing {visibleTasks.length} of {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
      </p>

      {/* ===== Undo toast ===== */}
      {undo && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between gap-4 rounded-full bg-indigo-950 py-3 pl-6 pr-3 text-sm text-white shadow-xl"
        >
          <span className="min-w-0 truncate">Deleted “{undo.task.title}”</span>
          <button
            onClick={restoreTask}
            className="shrink-0 rounded-full bg-white/10 px-4 py-1.5 font-semibold text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Undo
          </button>
        </div>
      )}
    </main>
  );
};

export default Task;
