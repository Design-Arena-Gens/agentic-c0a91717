import type { NextApiRequest, NextApiResponse } from "next";
import { orchestrationRuns } from "@/data/orchestration";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== "string") {
    res.status(400).json({ error: "Invalid run identifier" });
    return;
  }

  const run = orchestrationRuns[id];

  if (!run) {
    res.status(404).json({ error: "Run not found" });
    return;
  }

  res.status(200).json(run);
}
