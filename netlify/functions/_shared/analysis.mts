import type { Bet, State } from "./store.mts";
import { ensureTipster } from "./store.mts";

export type PickInput = Partial<Bet> & {
  match?: unknown;
  market?: unknown;
  amount?: unknown;
  stake?: unknown;
  decimalOdds?: unknown;
  modelProbability?: unknown;
  probability?: unknown;
  pModel?: unknown;
  winProbability?: unknown;
  breakEven?: unknown;
  impliedProbability?: unknown;
  ev?: unknown;
  kelly?: unknown;
  minimumOdds?: unknown;
  minOdds?: unknown;
  fairOdds?: unknown;
  sourceSummary?: unknown;
  sourcesSummary?: unknown;
  sources?: unknown;
  method?: unknown;
  confidence?: unknown;
};

export type ScoreOptions = {
  defaultTipster?: string;
  defaultDate?: string;
  bankrollUnits?: number;
  fractionalKelly?: number;
  maxStake?: number;
  minStake?: number;
};

const DEFAULT_OPTIONS: Required<ScoreOptions> = {
  defaultTipster: "External LLM",
  defaultDate: new Date().toISOString(),
  bankrollUnits: 100,
  fractionalKelly: 0.25,
  maxStake: 3,
  minStake: 0.25
};

export function scorePick(input: PickInput, options: ScoreOptions = {}): Bet {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const odds = finite(input.odds ?? input.decimalOdds);
  if (!(odds > 1)) throw new Error("Each pick needs decimal odds greater than 1.");

  const modelProbability = probability(
    input.analysis?.modelProbability ??
    input.modelProbability ??
    input.probability ??
    input.pModel ??
    input.winProbability
  ) ?? probabilityFromFairOdds(input.analysis?.fairOdds ?? input.fairOdds);

  const breakEvenProbability = 1 / odds;
  const expectedValue = modelProbability === undefined
    ? undefined
    : modelProbability * odds - 1;
  const edge = modelProbability === undefined
    ? undefined
    : modelProbability - breakEvenProbability;
  const kellyFraction = expectedValue === undefined
    ? undefined
    : Math.max(0, expectedValue / (odds - 1));
  const fairOdds = modelProbability === undefined ? undefined : 1 / modelProbability;
  const minimumOdds = finite(input.analysis?.minimumOdds ?? input.minimumOdds ?? input.minOdds)
    ?? (modelProbability === undefined ? undefined : round((1 / modelProbability) * 1.01, 2));

  const stake = finite(input.betAmount ?? input.amount ?? input.stake)
    ?? stakeFromKelly(kellyFraction, config);
  const rawOutcome = String(input.outcome || "pending");
  const outcome = rawOutcome === "win" || rawOutcome === "lose" ? rawOutcome : "pending";
  const parsedDate = new Date(String(input.date || config.defaultDate));

  const bet: Bet = {
    id: String(input.id || generateId()),
    externalId: stringValue(input.externalId),
    tipster: String(input.tipster || config.defaultTipster).trim(),
    sport: String(input.sport || "").trim(),
    team: String(input.team || input.match || input.market || "").trim(),
    betAmount: round(stake, 2),
    odds: round(odds, 3),
    outcome,
    date: Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString(),
    notes: String(input.notes || buildNotes({ modelProbability, breakEvenProbability, expectedValue, kellyFraction, minimumOdds })).trim(),
    analysis: clean({
      modelProbability,
      breakEvenProbability,
      expectedValue,
      edge,
      kellyFraction,
      fairOdds,
      minimumOdds,
      confidence: probability(input.analysis?.confidence ?? input.confidence),
      method: stringValue(input.analysis?.method ?? input.method) || "implied probability + EV + fractional Kelly",
      market: stringValue(input.analysis?.market ?? input.market),
      sourceSummary: stringValue(input.analysis?.sourceSummary ?? input.sourceSummary ?? input.sourcesSummary),
      sources: normalizeSources(input.analysis?.sources ?? input.sources)
    })
  };

  if (!bet.tipster || !bet.sport || !bet.team || !(bet.betAmount > 0)) {
    throw new Error("Each pick needs tipster, sport, team/market, and positive stake.");
  }

  return bet;
}

export function mergeBets(existing: Bet[], incoming: Bet[]): { bets: Bet[]; added: number; updated: number } {
  const bets = existing.map(bet => ({ ...bet }));
  const index = new Map(bets.map((bet, i) => [dedupeKey(bet), i]));
  let added = 0;
  let updated = 0;

  for (const bet of incoming) {
    const key = dedupeKey(bet);
    const found = index.get(key);
    if (found === undefined) {
      bets.push(bet);
      index.set(key, bets.length - 1);
      added += 1;
      continue;
    }

    const current = bets[found];
    bets[found] = {
      ...current,
      ...bet,
      id: current.id || bet.id,
      outcome: current.outcome !== "pending" && bet.outcome === "pending" ? current.outcome : bet.outcome
    };
    updated += 1;
  }

  return { bets, added, updated };
}

export function ensureAllTipsters(state: State): State {
  for (const bet of state.bets) ensureTipster(state, bet.tipster);
  return state;
}

export function analyzeBets(bets: Bet[]) {
  const settled = bets.filter(bet => bet.outcome === "win" || bet.outcome === "lose");
  const pending = bets.filter(bet => bet.outcome === "pending");
  const stake = settled.reduce((sum, bet) => sum + bet.betAmount, 0);
  const profit = settled.reduce((sum, bet) => {
    if (bet.outcome === "win") return sum + bet.betAmount * (bet.odds - 1);
    return sum - bet.betAmount;
  }, 0);

  return {
    totalBets: bets.length,
    settled: settled.length,
    pending: pending.length,
    wins: settled.filter(bet => bet.outcome === "win").length,
    losses: settled.filter(bet => bet.outcome === "lose").length,
    stakedUnits: round(stake, 2),
    profitUnits: round(profit, 2),
    roi: stake > 0 ? round(profit / stake, 4) : 0,
    pendingExpectedProfit: round(pending.reduce((sum, bet) => {
      const ev = bet.analysis?.expectedValue;
      return sum + (typeof ev === "number" ? bet.betAmount * ev : 0);
    }, 0), 2),
    byTipster: aggregateByTipster(bets)
  };
}

export function filterBets(bets: Bet[], url: URL): Bet[] {
  const tipster = url.searchParams.get("tipster")?.toLowerCase();
  const outcome = url.searchParams.get("outcome");
  const sport = url.searchParams.get("sport")?.toLowerCase();
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const fromTime = from ? new Date(from).getTime() : undefined;
  const toTime = to ? new Date(to).getTime() : undefined;

  return bets.filter(bet => {
    const time = new Date(bet.date).getTime();
    if (tipster && !bet.tipster.toLowerCase().includes(tipster)) return false;
    if (outcome && bet.outcome !== outcome) return false;
    if (sport && !bet.sport.toLowerCase().includes(sport)) return false;
    if (fromTime && time < fromTime) return false;
    if (toTime && time > toTime) return false;
    return true;
  });
}

function aggregateByTipster(bets: Bet[]) {
  const rows = new Map<string, { tipster: string; bets: number; wins: number; losses: number; pending: number; stake: number; profit: number }>();
  for (const bet of bets) {
    const row = rows.get(bet.tipster) || { tipster: bet.tipster, bets: 0, wins: 0, losses: 0, pending: 0, stake: 0, profit: 0 };
    row.bets += 1;
    if (bet.outcome === "pending") {
      row.pending += 1;
    } else {
      row.stake += bet.betAmount;
      if (bet.outcome === "win") {
        row.wins += 1;
        row.profit += bet.betAmount * (bet.odds - 1);
      } else {
        row.losses += 1;
        row.profit -= bet.betAmount;
      }
    }
    rows.set(bet.tipster, row);
  }

  return Array.from(rows.values()).map(row => ({
    ...row,
    stake: round(row.stake, 2),
    profit: round(row.profit, 2),
    roi: row.stake > 0 ? round(row.profit / row.stake, 4) : 0
  }));
}

function dedupeKey(bet: Bet): string {
  return [
    bet.externalId || "",
    bet.tipster,
    bet.sport,
    bet.team,
    bet.date.slice(0, 10)
  ].map(part => String(part || "").trim().toLowerCase()).join("|");
}

function stakeFromKelly(kelly: number | undefined, config: Required<ScoreOptions>): number {
  if (!(kelly && kelly > 0)) return config.minStake;
  const raw = kelly * config.bankrollUnits * config.fractionalKelly;
  return Math.max(config.minStake, Math.min(config.maxStake, Math.round(raw * 2) / 2));
}

function buildNotes(values: Record<string, number | undefined>): string {
  const parts = [];
  if (values.modelProbability !== undefined) parts.push(`p=${percent(values.modelProbability)}`);
  if (values.breakEvenProbability !== undefined) parts.push(`BE=${percent(values.breakEvenProbability)}`);
  if (values.expectedValue !== undefined) parts.push(`EV=${percent(values.expectedValue)}`);
  if (values.kellyFraction !== undefined) parts.push(`Kelly=${percent(values.kellyFraction)}`);
  if (values.minimumOdds !== undefined) parts.push(`minimum odds ${values.minimumOdds.toFixed(2)}`);
  return parts.join(", ");
}

function finite(value: unknown): number | undefined {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function probability(value: unknown): number | undefined {
  const numeric = finite(value);
  if (numeric === undefined) return undefined;
  if (numeric > 1 && numeric <= 100) return numeric / 100;
  if (numeric >= 0 && numeric <= 1) return numeric;
  return undefined;
}

function probabilityFromFairOdds(value: unknown): number | undefined {
  const odds = finite(value);
  return odds && odds > 1 ? 1 / odds : undefined;
}

function normalizeSources(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const sources = value.map(item => String(item || "").trim()).filter(Boolean);
  return sources.length ? sources : undefined;
}

function clean<T extends Record<string, unknown>>(value: T): T {
  for (const key of Object.keys(value)) {
    const item = value[key];
    if (item === undefined || item === null || item === "" || (Array.isArray(item) && item.length === 0)) {
      delete value[key];
    }
  }
  return value;
}

function stringValue(value: unknown): string | undefined {
  const text = String(value || "").trim();
  return text || undefined;
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function percent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
