import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthedUser } from "../_lib/auth.js";
import { listAddresses, insertAddress, updateAddress, deleteAddress } from "../_lib/addresses.js";
import { validateAddressInput } from "../_lib/validate.js";

// GET/POST operate on the collection. PUT/DELETE take ?id= for a single
// address (query param instead of a nested [id].ts route, since Vercel's
// Hobby plan caps deployments at 12 serverless functions).
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await requireAuthedUser(req, res);
  if (!user) return;

  const id = typeof req.query.id === "string" ? req.query.id : undefined;

  if (req.method === "GET" && !id) {
    res.status(200).json(await listAddresses(user.uid));
    return;
  }

  if (req.method === "POST" && !id) {
    try {
      const input = validateAddressInput(req.body);
      const address = await insertAddress(user.uid, input);
      res.status(201).json(address);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Invalid address" });
    }
    return;
  }

  if (req.method === "PUT" && id) {
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

  if (req.method === "DELETE" && id) {
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
