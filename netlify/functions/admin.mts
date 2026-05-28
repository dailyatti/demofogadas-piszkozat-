import type { Config, Context } from "@netlify/functions";
import type { Bet, State } from "./_shared/store.mts";
import { ensureTipster, json, normalizeBet, readState, writeState } from "./_shared/store.mts";
import { loginAdmin, requireAdmin } from "./_shared/adminAuth.mts";
import { analyzeBets, ensureAllTipsters, mergeBets, scorePick } from "./_shared/analysis.mts";

export default async (req: Request, _context: Context) => {
  if (req.method === "OPTIONS") return json({ ok: true });

  const url = new URL(req.url);
  const path = url.pathname;

  if (path.endsWith("/api/admin/login") && req.method === "POST") {
    const body = asRecord(await safeJson(req));
    return loginAdmin(String(body.email || ""), String(body.password || ""));
  }

  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;

  const state = await readState();

  if (path.endsWith("/api/admin/session") && req.method === "GET") {
    return json({ ok: true, email: admin.email, analysis: analyzeBets(state.bets) });
  }

  if (path.endsWith("/api/admin/tips") && req.method === "POST") {
    const rawBody = await safeJson(req);
    const body = asRecord(rawBody);
    const rows = getRows(rawBody);
    if (rows.length === 0) return json({ error: "Body must include picks, bets, or an array." }, 400);

    const incoming = rows.map(row => adminBetFromInput(row, body.options || {}));
    const merged = mergeBets(state.bets, incoming);
    await writeState(ensureAllTipsters({ tipstersData: state.tipstersData || {}, bets: merged.bets }));

    return json({
      ok: true,
      added: merged.added,
      updated: merged.updated,
      totalBets: merged.bets.length,
      analysis: analyzeBets(merged.bets),
      bets: incoming
    });
  }

  if (path.endsWith("/api/admin/tips") && req.method === "PATCH") {
    const body = await safeJson(req);
    const rows = getRows(body).length ? getRows(body) : [body];
    const result = updateTips(state.bets, rows);
    await writeState(ensureAllTipsters({ tipstersData: state.tipstersData || {}, bets: result.bets }));

    return json({
      ok: true,
      updated: result.updated,
      notMatched: result.notMatched,
      totalBets: result.bets.length,
      analysis: analyzeBets(result.bets)
    });
  }

  if (path.endsWith("/api/admin/tips") && req.method === "DELETE") {
    const body = await safeJson(req);
    const result = deleteTips(state.bets, body);
    await writeState(ensureAllTipsters({ tipstersData: state.tipstersData || {}, bets: result.bets }));

    return json({
      ok: true,
      deleted: result.deleted,
      notMatched: result.notMatched,
      totalBets: result.bets.length,
      analysis: analyzeBets(result.bets)
    });
  }

  if (path.endsWith("/api/admin/tipsters") && req.method === "POST") {
    const body = asRecord(await safeJson(req));
    const name = String(body.name || body.tipster || "").trim();
    if (!name) return json({ error: "Tipster name is required." }, 400);
    const capital = finite(body.initialCapital ?? body.initial_capital) ?? 300;
    ensureTipster(state, name);
    state.tipstersData[name] = {
      initial_capital: capital,
      current_capital: capital,
      initial_set: true
    };
    await writeState(ensureAllTipsters(state));
    return json({ ok: true, tipstersData: state.tipstersData, analysis: analyzeBets(state.bets) });
  }

  if (path.endsWith("/api/admin/tipsters") && req.method === "DELETE") {
    const body = asRecord(await safeJson(req));
    const name = String(body.name || body.tipster || "").trim();
    if (!name) return json({ error: "Tipster name is required." }, 400);
    const deleteBets = Boolean(body.deleteBets);
    const hasBets = state.bets.some(bet => bet.tipster === name);
    if (hasBets && !deleteBets) {
      return json({ error: "Tipster has bets. Send deleteBets=true to remove those bets too." }, 409);
    }
    delete state.tipstersData[name];
    const bets = deleteBets ? state.bets.filter(bet => bet.tipster !== name) : state.bets;
    await writeState(ensureAllTipsters({ tipstersData: state.tipstersData, bets }));
    return json({ ok: true, deleted: name, deletedBets: deleteBets ? state.bets.length - bets.length : 0, analysis: analyzeBets(bets) });
  }

  return json({ error: "Not found." }, 404);
};

function adminBetFromInput(row: any, options: Record<string, any>): Bet {
  const hasProbability = row.analysis?.modelProbability ?? row.modelProbability ?? row.probability ?? row.pModel ?? row.winProbability ?? row.fairOdds;
  if (hasProbability !== undefined) return scorePick(row, options);

  const normalized = normalizeBet(row);
  if (!normalized) throw new Error("Invalid bet input.");
  return normalized;
}

function updateTips(bets: Bet[], rows: any[]) {
  const next = bets.map(bet => ({ ...bet }));
  let updated = 0;
  let notMatched = 0;

  for (const row of rows) {
    const index = findBetIndex(next, row);
    if (index === -1) {
      notMatched += 1;
      continue;
    }
    const current = next[index];
    next[index] = normalizeBet({ ...current, ...row, id: current.id }) || current;
    updated += 1;
  }

  return { bets: next, updated, notMatched };
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

function findBetIndex(bets: Bet[], row: any): number {
  if (row.id) {
    const byId = bets.findIndex(bet => bet.id === String(row.id));
    if (byId !== -1) return byId;
  }
  if (row.externalId) {
    const byExternalId = bets.findIndex(bet => bet.externalId === String(row.externalId));
    if (byExternalId !== -1) return byExternalId;
  }

  const tipster = lower(row.tipster);
  const sport = lower(row.sport);
  const team = lower(row.team ?? row.match ?? row.market);
  const day = row.date ? new Date(String(row.date)).toISOString().slice(0, 10) : "";
  return bets.findIndex(bet => {
    if (tipster && bet.tipster.toLowerCase() !== tipster) return false;
    if (sport && bet.sport.toLowerCase() !== sport) return false;
    if (team && bet.team.toLowerCase() !== team) return false;
    if (day && bet.date.slice(0, 10) !== day) return false;
    return Boolean(tipster || sport || team || day);
  });
}

function getRows(body: Record<string, any> | any[]): any[] {
  if (Array.isArray(body)) return body;
  return body?.picks || body?.bets || [];
}

async function safeJson(req: Request): Promise<Record<string, any> | any[]> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

function asRecord(value: Record<string, any> | any[]): Record<string, any> {
  return Array.isArray(value) ? {} : value;
}

function finite(value: unknown): number | undefined {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function lower(value: unknown): string {
  return String(value || "").trim().toLowerCase();
}

export const config: Config = {
  path: ["/api/admin/login", "/api/admin/session", "/api/admin/tips", "/api/admin/tipsters"]
};
