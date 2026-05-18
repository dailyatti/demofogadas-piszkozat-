import { getStore } from "@netlify/blobs";

export type Bet = {
  id: string;
  tipster: string;
  sport: string;
  team: string;
  betAmount: number;
  odds: number;
  outcome: "pending" | "win" | "lose";
  date: string;
  notes: string;
};

export type State = {
  tipstersData: Record<string, { initial_capital: number; current_capital: number; initial_set: boolean }>;
  bets: Bet[];
};

const STATE_KEY = "state";
const DEFAULT_STATE: State = { tipstersData: {}, bets: [] };

export async function readState(): Promise<State> {
  const store = getStore({ name: "bettracker", consistency: "strong" });
  const state = await store.get(STATE_KEY, { type: "json" });
  if (!state || typeof state !== "object") return DEFAULT_STATE;
  const typed = state as Partial<State>;
  return {
    tipstersData: typed.tipstersData && typeof typed.tipstersData === "object" ? typed.tipstersData : {},
    bets: Array.isArray(typed.bets) ? typed.bets.map(normalizeBet).filter(Boolean) as Bet[] : []
  };
}

export async function writeState(state: State): Promise<void> {
  const store = getStore({ name: "bettracker", consistency: "strong" });
  await store.setJSON(STATE_KEY, {
    tipstersData: state.tipstersData || {},
    bets: Array.isArray(state.bets) ? state.bets.map(normalizeBet).filter(Boolean) : []
  });
}

export function normalizeBet(input: unknown): Bet | null {
  if (!input || typeof input !== "object") return null;
  const b = input as Record<string, unknown>;
  const tipster = String(b.tipster || "").trim();
  const sport = String(b.sport || "").trim();
  const team = String(b.team || b.match || b.market || "").trim();
  const betAmount = Number(b.betAmount ?? b.amount ?? b.stake);
  const odds = Number(b.odds ?? b.decimalOdds);
  if (!tipster || !sport || !team || !(betAmount > 0) || !(odds > 1)) return null;

  const rawOutcome = String(b.outcome || "pending");
  const outcome = rawOutcome === "win" || rawOutcome === "lose" ? rawOutcome : "pending";
  const parsedDate = b.date ? new Date(String(b.date)) : new Date();

  return {
    id: String(b.id || generateId()),
    tipster,
    sport,
    team,
    betAmount,
    odds,
    outcome,
    date: Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString(),
    notes: b.notes ? String(b.notes) : ""
  };
}

export function ensureTipster(state: State, tipster: string): void {
  if (!state.tipstersData[tipster]) {
    state.tipstersData[tipster] = {
      initial_capital: 300,
      current_capital: 300,
      initial_set: true
    };
  }
}

export function authorize(req: Request): boolean {
  const configured = Netlify.env.get("BTP_API_KEY") || "";
  const allowed = configured.split(",").map(key => key.trim()).filter(Boolean);
  const provided = req.headers.get("x-api-key") || "";
  return allowed.length > 0 && allowed.includes(provided);
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "content-type,x-api-key",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
    }
  });
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
