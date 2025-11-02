export type StatSummary = {
  plugins: number;
  agents: number;
  skills: number;
  orchestrators: number;
  activePlanName: string;
  activeRunId: string;
};

export type WorkerStatus = "active" | "on_hold" | "queued" | "cooldown" | "complete";

export type RunWorker = {
  id: string;
  label: string;
  status: WorkerStatus;
  eta: string;
  progress?: number;
};

export type OrchestrationRun = {
  id: string;
  status: "initializing" | "in_progress" | "completed" | "paused" | "failed";
  startedAt: string;
  updatedAt: string;
  progress: number;
  slaMinutes: number;
  workers: RunWorker[];
};

const activeRunId = "run-4927";

export const statsSnapshot: StatSummary = {
  plugins: 68,
  agents: 24,
  skills: 142,
  orchestrators: 7,
  activePlanName: "Global Expansion Enablement Plan",
  activeRunId,
};

export const orchestrationRuns: Record<string, OrchestrationRun> = {
  [activeRunId]: {
    id: activeRunId,
    status: "in_progress",
    startedAt: "2025-02-17T08:55:00.000Z",
    updatedAt: "2025-02-17T09:42:00.000Z",
    progress: 0.64,
    slaMinutes: 180,
    workers: [
      {
        id: "wrk-intake",
        label: "Intake & Qualification",
        status: "active",
        eta: "4m",
        progress: 0.92,
      },
      {
        id: "wrk-procurement",
        label: "Procurement Negotiator",
        status: "queued",
        eta: "14m",
      },
      {
        id: "wrk-compliance",
        label: "Compliance Sentinel",
        status: "on_hold",
        eta: "Awaiting Finance",
      },
      {
        id: "wrk-rollout",
        label: "Rollout Coordinator",
        status: "cooldown",
        eta: "27m",
      },
      {
        id: "wrk-retrospective",
        label: "Retro Facilitator",
        status: "complete",
        eta: "Done",
        progress: 1,
      },
    ],
  },
};
