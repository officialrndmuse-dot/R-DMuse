import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuthedUser } from "../_lib/auth.js";
import { listAddresses, insertAddress } from "../_lib/addresses.js";
import { validateAddressInput } from "../_lib/validate.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await requireAuthedUser(req, res);
  if (!user) return;

  if (req.method === "GET") {
    res.status(200).json(await listAddresses(user.uid));
    return;
  }

  if (req.method === "POST") {
    try {
      const input = validateAddressInput(req.body);
      const address = await insertAddress(user.uid, input);
      res.status(201).json(address);
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Invalid address" });
    }
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
