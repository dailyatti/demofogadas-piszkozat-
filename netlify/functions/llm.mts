import type { Config, Context } from "@netlify/functions";
import { authorize, json, readState, writeState } from "./_shared/store.mts";
import type { Bet } from "./_shared/store.mts";
import { analyzeBets, ensureAllTipsters, filterBets, mergeBets, scorePick } from "./_shared/analysis.mts";

export default async (req: Request, _context: Context) => {
  if (req.method === "OPTIONS") return json({ ok: true });

  const url = new URL(req.url);
  const state = await readState();

  if (req.method === "GET") {
    const bets = filterBets(state.bets, url);
    return json({
      ok: true,
      formulas: {
        breakEvenProbability: "1 / decimalOdds",
        expectedValue: "modelProbability * decimalOdds - 1",
        edge: "modelProbability - breakEvenProbability",
        kellyFraction: "expectedValue / (decimalOdds - 1)"
      },
      filters: Object.fromEntries(url.searchParams.entries()),
      analysis: analyzeBets(bets),
      bets
    });
  }

  if (!authorize(req)) return json({ error: "Invalid API key" }, 403);

  if (req.method === "DELETE" && url.pathname.endsWith("/api/llm/tips")) {
    const body = await safeJson(req);
    const result = deleteTips(state.bets, body);
    await writeState(ensureAllTipsters({
      tipstersData: state.tipstersData || {},
      bets: result.bets
    }));

    return json({
      ok: true,
      deleted: result.deleted,
      notMatched: result.notMatched,
      totalBets: result.bets.length,
      analysis: analyzeBets(result.bets)
    });
  }

  if (req.method === "POST" && url.pathname.endsWith("/api/llm/results")) {
    const body = await safeJson(req);
    const rows = getResultRows(body);
    if (rows.length === 0) return json({ error: "Body must include results, updates, or an array." }, 400);

    const result = applyResults(state.bets, rows);
    await writeState(ensureAllTipsters({
      tipstersData: state.tipstersData || {},
      bets: result.bets
    }));

    return json({
      ok: true,
      saved: true,
      incoming: rows.length,
      updated: result.updated,
      notMatched: result.notMatched,
      matches: result.matches,
      analysis: analyzeBets(result.bets)
    });
  }

  if (req.method === "POST" && url.pathname.endsWith("/api/llm/analyze")) {
    const body = await safeJson(req);
    const rows = getRows(body);
    const options = Array.isArray(body) ? {} : body.options || {};
    const scored = rows.length > 0
      ? rows.map(row => scorePick(row, options))
      : state.bets;
    const filtered = filterScored(scored, options);

    return json({
      ok: true,
      saved: false,
      count: filtered.length,
      rejectedByFilter: scored.length - filtered.length,
      analysis: analyzeBets(filtered),
      bets: filtered
    });
  }

  if (req.method === "POST") {
    const body = await safeJson(req);
    const rows = getRows(body);
    if (rows.length === 0) return json({ error: "Body must include picks, candidates, bets, or an array." }, 400);

    const options = Array.isArray(body) ? {} : body.options || {};
    const scored = filterScored(rows.map(row => scorePick(row, options)), options);
    const merged = mergeBets(state.bets, scored);

    await writeState(ensureAllTipsters({
      tipstersData: state.tipstersData || {},
      bets: merged.bets
    }));

    return json({
      ok: true,
      saved: true,
      incoming: scored.length,
      added: merged.added,
      updated: merged.updated,
      preservedExisting: state.bets.length,
      totalBets: merged.bets.length,
      analysis: analyzeBets(merged.bets),
      bets: scored
    });
  }

  return json({ error: "Method not allowed" }, 405);
};

function filterScored(scored: any[], options: Record<string, any>): any[] {
  const minOdds = finite(options.minOdds ?? options.minimumOdds);
  const minEv = finite(options.minEv ?? options.minimumEv);
  return scored.filter(bet => {
    if (minOdds !== undefined && bet.odds < minOdds) return false;
    if (minEv !== undefined && (bet.analysis?.expectedValue ?? -Infinity) < minEv) return false;
    return true;
  });
}

function finite(value: unknown): number | undefined {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

async function safeJson(req: Request): Promise<Record<string, any> | any[]> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

function getRows(body: Record<string, any> | any[]): any[] {
  if (Array.isArray(body)) return body;
  return body?.picks || body?.candidates || body?.bets || [];
}

export const config: Config = {
  path: ["/api/llm/tips", "/api/llm/analyze", "/api/llm/results"]
};

function getResultRows(body: Record<string, any> | any[]): any[] {
  if (Array.isArray(body)) return body;
  return body?.results || body?.updates || body?.bets || [];
}

function applyResults(bets: Bet[], rows: any[]) {
  const next = bets.map(bet => ({ ...bet }));
  const matches = [];
  let updated = 0;
  let notMatched = 0;

  for (const row of rows) {
    const outcome = normalizeOutcome(row.outcome ?? row.result ?? row.status);
    if (!outcome) {
      notMatched += 1;
      matches.push({ input: row, matched: false, reason: "Invalid outcome. Use win, lose, or pending." });
      continue;
    }

    const index = findBetIndex(next, row);
    if (index === -1) {
      notMatched += 1;
      matches.push({ input: row, matched: false, reason: "No matching bet found." });
      continue;
    }

    next[index].outcome = outcome;
    if (row.notes || row.resultNotes) {
      const extra = String(row.notes || row.resultNotes).trim();
      next[index].notes = next[index].notes ? `${next[index].notes} | Result: ${extra}` : `Result: ${extra}`;
    }
    updated += 1;
    matches.push({ input: row, matched: true, id: next[index].id, team: next[index].team, outcome });
  }

  return { bets: next, updated, notMatched, matches };
}

function findBetIndex(bets: Bet[], row: any): number {
  if (row.id) {
    const byId = bets.findIndex(bet => bet.id === String(row.id));
    if (byId !== -1) return byId;
  }

  if (row.externalId) {
    const byExternalId = bets.findIndex(bet => bet.externalId === String(row.externalId));
    if (byExternalId !== -1) return byExternalId;
  }

  const tipster = stringLower(row.tipster);
  const sport = stringLower(row.sport);
  const team = stringLower(row.team ?? row.match ?? row.market);
  const day = row.date ? new Date(String(row.date)).toISOString().slice(0, 10) : "";

  return bets.findIndex(bet => {
    if (tipster && bet.tipster.toLowerCase() !== tipster) return false;
    if (sport && bet.sport.toLowerCase() !== sport) return false;
    if (team && bet.team.toLowerCase() !== team) return false;
    if (day && bet.date.slice(0, 10) !== day) return false;
    return Boolean(tipster || sport || team || day);
  });
}

function normalizeOutcome(value: unknown): "win" | "lose" | "pending" | undefined {
  const text = String(value || "").trim().toLowerCase();
  if (["win", "won", "nyert", "hit", "bejoett", "bejott"].includes(text)) return "win";
  if (["lose", "lost", "vesztett", "loss", "elment"].includes(text)) return "lose";
  if (["pending", "open", "fuggoben", "függőben"].includes(text)) return "pending";
  return undefined;
}

function stringLower(value: unknown): string {
  return String(value || "").trim().toLowerCase();
}

function deleteTips(bets: Bet[], body: Record<string, any> | any[]) {
  const requests = Array.isArray(body)
    ? body
    : Array.isArray(body.ids)
      ? body.ids.map((id: unknown) => ({ id }))
      : Array.isArray(body.tips)
        ? body.tips
        : Array.isArray(body.bets)
          ? body.bets
          : [body];

  const deleteIndexes = new Set<number>();
  let notMatched = 0;

  for (const request of requests) {
    const index = findBetIndex(bets, request);
    if (index === -1) {
      notMatched += 1;
    } else {
      deleteIndexes.add(index);
    }
  }

  return {
    bets: bets.filter((_, index) => !deleteIndexes.has(index)),
    deleted: deleteIndexes.size,
    notMatched
  };
}
