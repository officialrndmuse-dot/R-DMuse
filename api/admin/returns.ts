import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../_lib/auth.js";
import { listAllReturns, updateReturnStatus } from "../_lib/returns.js";
import type { ReturnStatus } from "../../src/types.js";

const VALID_STATUSES: ReturnStatus[] = ["requested", "approved", "rejected", "completed"];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method === "GET") {
    res.status(200).json(await listAllReturns());
    return;
  }

  if (req.method === "PATCH") {
    const id = typeof req.body?.id === "string" ? req.body.id : "";
    const status = req.body?.status as ReturnStatus;
    if (!id || !VALID_STATUSES.includes(status)) {
      res.status(400).json({ error: "Invalid id or status" });
      return;
    }
    const updated = await updateReturnStatus(id, status);
    if (!updated) {
      res.status(404).json({ error: "Return not found" });
      return;
    }
    res.status(200).json(updated);
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
