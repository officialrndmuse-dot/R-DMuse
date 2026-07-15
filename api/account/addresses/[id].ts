import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthedUser } from "../../_lib/auth.js";
import { updateAddress, deleteAddress } from "../../_lib/addresses.js";
import { validateAddressInput } from "../../_lib/validate.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await requireAuthedUser(req, res);
  if (!user) return;

  const id = typeof req.query.id === "string" ? req.query.id : undefined;
  if (!id) {
    res.status(400).json({ error: "Missing address id" });
    return;
  }

  if (req.method === "PUT") {
    try {
      const input = validateAddressInput(req.body);
      const address = await updateAddress(id, user.uid, input);
      if (!address) {
        res.status(404).json({ error: "Address not found" });
        return;
      }
      res.status(200).json(address);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Invalid address" });
    }
    return;
  }

  if (req.method === "DELETE") {
    const deleted = await deleteAddress(id, user.uid);
    if (!deleted) {
      res.status(404).json({ error: "Address not found" });
      return;
    }
    res.status(204).end();
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
