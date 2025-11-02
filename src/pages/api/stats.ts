import type { NextApiRequest, NextApiResponse } from "next";
import { statsSnapshot } from "@/data/orchestration";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(statsSnapshot);
}
