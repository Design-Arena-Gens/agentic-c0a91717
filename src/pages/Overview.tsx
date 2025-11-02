import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import type {
  OrchestrationRun,
  StatSummary,
  WorkerStatus,
} from "@/data/orchestration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type FetchState<T> = {
  data: T | null;
  error: string | null;
};

const quickActions = [
  {
    title: "Agent Directory",
    description: "View orchestration-ready agents and manage availability.",
    href: "/agents",
    icon: (
      <svg
        aria-hidden="true"
        className="size-6 text-indigo-200"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path d="M3.75 7.5h16.5M3.75 12h16.5M3.75 16.5H12" />
      </svg>
    ),
  },
  {
    title: "Workflow Builder",
    description: "Design new multi-agent workflows with reusable skills.",
    href: "/workflows",
    icon: (
      <svg
        aria-hidden="true"
        className="size-6 text-indigo-200"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path d="M6.75 4.5V9m0 0L3 5.25M6.75 9l3.75-3.75M17.25 19.5v-4.5m0 0 3.75 3.75M17.25 15l-3.75 3.75M9 12h6" />
      </svg>
    ),
  },
  {
    title: "Skill Library",
    description: "Curate vetted skills, prompts, and SOP-backed recipes.",
    href: "/skills",
    icon: (
      <svg
        aria-hidden="true"
        className="size-6 text-indigo-200"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path d="M12 6v12m6-6H6m0-8.25A2.25 2.25 0 0 1 8.25 3h7.5A2.25 2.25 0 0 1 18 5.25v13.5A2.25 2.25 0 0 1 15.75 21h-7.5A2.25 2.25 0 0 1 6 18.75z" />
      </svg>
    ),
  },
  {
    title: "Analytics",
    description: "Audit orchestration runs, SLAs, and efficiency insights.",
    href: "/analytics",
    icon: (
      <svg
        aria-hidden="true"
        className="size-6 text-indigo-200"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path d="M4.5 19.5 9 12l3 4.5 4.5-7.5L19.5 15" />
        <path d="M5.25 6h13.5" />
      </svg>
    ),
  },
];

const latestReports = [
  {
    title: "February Run Reliability Digest",
    date: "Feb 17, 2025",
    url: "https://docs.agents-main.dev/reports/feb-run-digest",
  },
  {
    title: "Agent Safety & Guardrails Playbook",
    date: "Feb 15, 2025",
    url: "https://docs.agents-main.dev/guides/guardrails",
  },
  {
    title: "Marketplace Partner Onboarding Guide",
    date: "Feb 09, 2025",
    url: "https://docs.agents-main.dev/marketplace/onboarding",
  },
];

const workerStatusStyles: Record<WorkerStatus, string> = {
  active:
    "border-emerald-400/30 bg-emerald-400/10 text-emerald-200 dark:text-emerald-200",
  queued:
    "border-sky-400/30 bg-sky-400/10 text-sky-200 dark:text-sky-200",
  on_hold:
    "border-amber-400/30 bg-amber-400/10 text-amber-200 dark:text-amber-200",
  cooldown:
    "border-violet-400/30 bg-violet-400/10 text-violet-200 dark:text-violet-200",
  complete:
    "border-slate-400/30 bg-slate-400/10 text-slate-200 dark:text-slate-200",
};

const runStatusStyles: Record<
  OrchestrationRun["status"],
  { label: string; className: string }
> = {
  initializing: {
    label: "Initializing",
    className:
      "border-sky-400/30 bg-sky-400/10 text-sky-100 dark:text-sky-200",
  },
  in_progress: {
    label: "In Progress",
    className:
      "border-indigo-400/30 bg-indigo-500/10 text-indigo-100 dark:text-indigo-200",
  },
  completed: {
    label: "Completed",
    className:
      "border-emerald-400/30 bg-emerald-500/10 text-emerald-100 dark:text-emerald-200",
  },
  paused: {
    label: "Paused",
    className:
      "border-amber-400/30 bg-amber-500/10 text-amber-100 dark:text-amber-200",
  },
  failed: {
    label: "Failed",
    className:
      "border-rose-400/30 bg-rose-500/10 text-rose-100 dark:text-rose-200",
  },
};

const StatSkeleton = () => (
  <div className="h-32 animate-pulse rounded-3xl border border-white/5 bg-white/5 dark:bg-white/5" />
);

const WorkerSkeleton = () => (
  <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-white/60 dark:bg-white/5">
    <div className="space-y-2">
      <div className="h-3 w-40 animate-pulse rounded-full bg-white/20" />
      <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
    </div>
    <div className="h-7 w-24 animate-pulse rounded-full bg-white/20" />
  </div>
);

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function Overview() {
  const [statsState, setStatsState] = useState<FetchState<StatSummary>>({
    data: null,
    error: null,
  });
  const [runState, setRunState] = useState<FetchState<OrchestrationRun>>({
    data: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/stats")
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load stats");
        return response.json();
      })
      .then((payload: StatSummary) => {
        if (cancelled) return;
        setStatsState({ data: payload, error: null });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setStatsState({ data: null, error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!statsState.data) return;

    fetch(`/api/runs/${statsState.data.activeRunId}`)
      .then(async (response) => {
        if (!response.ok) {
          const errorPayload = await response.json().catch(() => ({}));
          const message =
            typeof errorPayload.error === "string"
              ? errorPayload.error
              : "Failed to load run";
          throw new Error(message);
        }
        return response.json();
      })
      .then((payload: OrchestrationRun) => {
        if (cancelled) return;
        setRunState({ data: payload, error: null });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setRunState({ data: null, error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [statsState.data]);

  const metricCards = useMemo(() => {
    if (!statsState.data) return [];
    const { plugins, agents, skills, orchestrators } = statsState.data;

    return [
      {
        label: "Plugins",
        value: plugins,
        annotation: "+8 new this week",
      },
      {
        label: "Agents",
        value: agents,
        annotation: "92% active coverage",
      },
      {
        label: "Skills",
        value: skills,
        annotation: "18 pending review",
      },
      {
        label: "Orchestrators",
        value: orchestrators,
        annotation: "5 maintaining SLAs",
      },
    ];
  }, [statsState.data]);

  const progressValue = runState.data
    ? Math.round(runState.data.progress * 100)
    : 0;
  const statsLoading = !statsState.data && !statsState.error;
  const runLoading =
    !!statsState.data && !runState.data && !runState.error;

  return (
    <>
      <Head>
        <title>Overview | agents-main Orchestration Suite</title>
      </Head>
      <div
        className={`${geistSans.className} ${geistMono.className} min-h-screen bg-gradient-to-br from-[#05060c] via-[#0a1627] to-[#111] text-slate-100`}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-10">
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-500 px-8 py-12 text-white shadow-2xl sm:px-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.22),_rgba(0,0,0,0))]" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl space-y-4">
                <p className="text-sm uppercase tracking-[0.3em] text-white/70">
                  agents-main
                </p>
                <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                  Orchestration Suite Command Center
                </h1>
                <p className="text-lg text-white/80">
                  Monitor active runs, align distributed workers, and launch new
                  automations across your agent fleet from a single control
                  surface.
                </p>
              </div>
              <div className="flex flex-col gap-3 text-center sm:flex-row sm:text-left">
                <button
                  type="button"
                  onClick={() => console.log("Open Marketplace")}
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-indigo-700 shadow-lg shadow-indigo-900/30 transition hover:-translate-y-0.5 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Open Marketplace
                </button>
                <button
                  type="button"
                  onClick={() => console.log("Start Workflow")}
                  className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Start Workflow
                </button>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Operational Snapshot
                </h2>
                <p className="text-sm text-slate-400">
                  Live estate metrics sourced directly from the orchestration
                  runtime.
                </p>
              </div>
              {statsState.error ? (
                <span className="rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-200">
                  {statsState.error}
                </span>
              ) : null}
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {statsLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <StatSkeleton key={index} />
                  ))
                : metricCards.map((card) => (
                    <article
                      key={card.label}
                      className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
                    >
                      <p className="text-sm text-slate-400">{card.label}</p>
                      <p className="mt-3 text-4xl font-semibold text-white">
                        {card.value.toLocaleString()}
                      </p>
                      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-indigo-200">
                        {card.annotation}
                      </p>
                    </article>
                  ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            <article className="flex flex-col gap-6 rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-sm">
              <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
                    Active Orchestration Plan
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    {statsState.data?.activePlanName ?? "Loading plan…"}
                  </h3>
                  {statsState.data ? (
                    <p className="mt-1 text-sm text-slate-400">
                      Run ID:{" "}
                      <span className="font-mono text-slate-200">
                        {statsState.data.activeRunId}
                      </span>
                    </p>
                  ) : null}
                </div>
                {runLoading ? (
                  <div className="h-8 w-32 animate-pulse rounded-full bg-white/10" />
                ) : runState.data ? (
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-wide ${runStatusStyles[runState.data.status].className}`}
                  >
                    <span className="inline-block size-2 rounded-full bg-current opacity-70" />
                    {runStatusStyles[runState.data.status].label}
                  </span>
                ) : null}
              </header>

              {runState.error ? (
                <div className="rounded-3xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
                  {runState.error}
                </div>
              ) : null}

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                  {runLoading || !runState.data ? (
                    <>
                      <div className="h-5 w-48 animate-pulse rounded-full bg-white/10" />
                      <div className="h-16 animate-pulse rounded-3xl bg-white/10" />
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm text-slate-400">Progress</p>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="h-2 flex-1 rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 transition-all"
                              style={{ width: `${progressValue}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-white">
                            {progressValue}%
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Started</span>
                          <span>{formatTimestamp(runState.data.startedAt)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Last Update</span>
                          <span>{formatTimestamp(runState.data.updatedAt)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">SLA Window</span>
                          <span>{runState.data.slaMinutes} min</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-slate-400">Current Workers</p>
                  {runLoading || !runState.data
                    ? Array.from({ length: 4 }).map((_, index) => (
                        <WorkerSkeleton key={index} />
                      ))
                    : runState.data.workers.map((worker) => (
                        <div
                          key={worker.id}
                          className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-4"
                        >
                          <div>
                            <p className="text-sm font-medium text-white">
                              {worker.label}
                            </p>
                            <p className="text-xs text-slate-400">
                              ETA: {worker.eta}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide ${workerStatusStyles[worker.status]}`}
                          >
                            <span className="inline-block size-2 rounded-full bg-current opacity-70" />
                            {worker.status.replace("_", " ")}
                          </span>
                        </div>
                      ))}
                </div>
              </div>
            </article>

            <aside className="flex flex-col gap-6">
              <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">
                  Quick Actions
                </h3>
                <div className="mt-5 flex flex-col gap-3">
                  {quickActions.map((action) => (
                    <a
                      key={action.title}
                      className="group flex items-start gap-4 rounded-3xl border border-white/0 bg-white/0 p-5 transition hover:border-white/20 hover:bg-white/5"
                      href={action.href}
                    >
                      <span className="flex size-12 items-center justify-center rounded-2xl bg-white/10 transition group-hover:bg-white/20">
                        {action.icon}
                      </span>
                      <span className="flex-1">
                        <span className="flex items-center justify-between gap-4">
                          <span className="text-sm font-semibold text-white">
                            {action.title}
                          </span>
                          <svg
                            aria-hidden="true"
                            className="size-4 text-indigo-200 opacity-0 transition group-hover:opacity-100"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            viewBox="0 0 24 24"
                          >
                            <path d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                        <p className="mt-1 text-xs text-slate-400">
                          {action.description}
                        </p>
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
                <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">
                  Latest Reports
                </h3>
                <ul className="mt-4 space-y-4">
                  {latestReports.map((report) => (
                    <li key={report.title}>
                      <a
                        href={report.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col gap-1 rounded-3xl border border-transparent p-3 transition hover:border-white/20 hover:bg-white/5"
                      >
                        <span className="text-sm font-semibold text-white group-hover:text-indigo-100">
                          {report.title}
                        </span>
                        <span className="text-xs text-slate-400">
                          {report.date}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </section>
        </div>
      </div>
    </>
  );
}
