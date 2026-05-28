import { getStore } from "@netlify/blobs";

export type Bet = {
  id: string;
  externalId?: string;
  tipster: string;
  sport: string;
  team: string;
  betAmount: number;
  odds: number;
  outcome: "pending" | "win" | "lose";
  date: string;
  notes: string;
  analysis?: BetAnalysis;
};

export type BetAnalysis = {
  modelProbability?: number;
  breakEvenProbability?: number;
  expectedValue?: number;
  edge?: number;
  kellyFraction?: number;
  fairOdds?: number;
  minimumOdds?: number;
  confidence?: number;
  method?: string;
  market?: string;
  sourceSummary?: string;
  sources?: string[];
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
    notes: b.notes ? String(b.notes) : "",
    externalId: stringValue(b.externalId),
    analysis: normalizeAnalysis(b)
  };
}

function normalizeAnalysis(input: Record<string, unknown>): BetAnalysis | undefined {
  const raw = input.analysis && typeof input.analysis === "object"
    ? input.analysis as Record<string, unknown>
    : input;

  const analysis: BetAnalysis = {
    modelProbability: probability(raw.modelProbability ?? raw.probability ?? raw.pModel),
    breakEvenProbability: probability(raw.breakEvenProbability ?? raw.breakEven ?? raw.impliedProbability),
    expectedValue: finiteNumber(raw.expectedValue ?? raw.ev),
    edge: finiteNumber(raw.edge),
    kellyFraction: finiteNumber(raw.kellyFraction ?? raw.kelly),
    fairOdds: finiteNumber(raw.fairOdds),
    minimumOdds: finiteNumber(raw.minimumOdds ?? raw.minOdds),
    confidence: probability(raw.confidence),
    method: stringValue(raw.method),
    market: stringValue(raw.market),
    sourceSummary: stringValue(raw.sourceSummary ?? raw.sourcesSummary),
    sources: normalizeSources(raw.sources)
  };

  if (
    analysis.modelProbability === undefined &&
    analysis.breakEvenProbability === undefined &&
    analysis.expectedValue === undefined &&
    analysis.edge === undefined &&
    analysis.kellyFraction === undefined &&
    analysis.fairOdds === undefined &&
    analysis.minimumOdds === undefined &&
    analysis.confidence === undefined &&
    !analysis.method &&
    !analysis.market &&
    !analysis.sourceSummary &&
    !analysis.sources
  ) {
    return undefined;
  }

  return analysis;
}

function finiteNumber(value: unknown): number | undefined {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function probability(value: unknown): number | undefined {
  const numeric = finiteNumber(value);
  if (numeric === undefined) return undefined;
  if (numeric > 1 && numeric <= 100) return numeric / 100;
  if (numeric >= 0 && numeric <= 1) return numeric;
  return undefined;
}

function stringValue(value: unknown): string | undefined {
  const text = String(value || "").trim();
  return text || undefined;
}

function normalizeSources(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const sources = value.map(item => String(item || "").trim()).filter(Boolean);
  return sources.length ? sources : undefined;
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
