import type { Config, Context } from "@netlify/functions";
import { authorize, json, readState, writeState } from "./_shared/store.mts";

export default async (req: Request, _context: Context) => {
  if (req.method === "OPTIONS") return json({ ok: true });

  if (req.method === "GET") {
    return json(await readState());
  }

  if (!authorize(req)) return json({ error: "Invalid API key" }, 403);

  if (req.method === "PUT") {
    const body = await req.json();
    if (!body || typeof body !== "object" || !Array.isArray(body.bets)) {
      return json({ error: "State must include bets array" }, 400);
    }
    await writeState({
      tipstersData: body.tipstersData && typeof body.tipstersData === "object" ? body.tipstersData : {},
      bets: body.bets
    });
    return json({ ok: true });
  }

  if (req.method === "DELETE") {
    return json({ error: "Full state deletion is disabled. Use /api/admin/tips or /api/llm/tips to delete specific tips." }, 405);
  }

  return json({ error: "Method not allowed" }, 405);
};

export const config: Config = {
  path: "/api/state"
};
