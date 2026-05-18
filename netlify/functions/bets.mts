import type { Config, Context } from "@netlify/functions";
import { authorize, ensureTipster, json, normalizeBet, readState, writeState } from "./_shared/store.mts";

export default async (req: Request, context: Context) => {
  if (req.method === "OPTIONS") return json({ ok: true });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!authorize(req)) return json({ error: "Invalid API key" }, 403);

  const body = await req.json();
  const isBulk = req.url.includes("/api/bets/bulk");
  const rows = isBulk ? body?.bets : [body?.bet ?? body];
  if (!Array.isArray(rows)) return json({ error: "bets array required" }, 400);

  const state = await readState();
  const inserted = [];

  for (const row of rows) {
    const bet = normalizeBet(row);
    if (!bet) continue;
    ensureTipster(state, bet.tipster);
    state.bets.push(bet);
    inserted.push(bet);
  }

  await writeState(state);
  return json({ ok: true, count: inserted.length, bets: inserted });
};

export const config: Config = {
  path: ["/api/bets", "/api/bets/bulk"]
};
