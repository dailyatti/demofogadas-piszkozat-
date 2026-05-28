#!/usr/bin/env node

import fs from "node:fs/promises";
import process from "node:process";

const DEFAULT_STATE_URL = "https://demofogadas.netlify.app/api/state";

const args = parseArgs(process.argv.slice(2));
const command = args._[0] || "score";

if (args.help || args.h) {
  printHelp();
  process.exit(0);
}

try {
  if (command === "sample") {
    console.log(JSON.stringify(sampleInput(), null, 2));
  } else if (command === "score" || command === "upload") {
    const input = await readInput(args.file || args.f);
    const scored = scoreCandidates(input, args);

    if (command === "score" || args["dry-run"]) {
      console.log(JSON.stringify(scored, null, 2));
    }

    if (command === "upload" && !args["dry-run"]) {
      const result = await upload(scored, args);
      console.log(JSON.stringify(result, null, 2));
    }
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

function scoreCandidates(input, options) {
  const rows = Array.isArray(input) ? input : input.picks || input.candidates || input.bets || [];
  if (!Array.isArray(rows)) throw new Error("Input must be an array, or an object with picks/candidates/bets.");

  const bankrollUnits = numberOption(options["bankroll-units"], 100);
  const kellyFraction = numberOption(options["kelly-fraction"], 0.25);
  const maxStake = numberOption(options["max-stake"], 3);
  const minStake = numberOption(options["min-stake"], 0.25);
  const minEv = numberOption(options["min-ev"], 0);
  const minOdds = numberOption(options["min-odds"], 1.55);
  const includeNegative = Boolean(options["include-negative"]);
  const defaultDate = options.date || input.date || new Date().toISOString();
  const defaultTipster = options.tipster || input.tipster || "PhD EV Modell";

  return rows
    .map((row) => scoreCandidate(row, {
      bankrollUnits,
      kellyFraction,
      maxStake,
      minStake,
      defaultDate,
      defaultTipster
    }))
    .filter((bet) => includeNegative || ((bet.analysis.expectedValue ?? -Infinity) >= minEv && bet.odds >= minOdds))
    .sort((a, b) => (b.analysis.expectedValue ?? -Infinity) - (a.analysis.expectedValue ?? -Infinity));
}

function scoreCandidate(row, config) {
  if (!row || typeof row !== "object") throw new Error("Each pick must be an object.");

  const odds = finite(row.odds ?? row.decimalOdds);
  if (!(odds > 1)) throw new Error(`Invalid decimal odds for ${row.team || row.match || "pick"}.`);

  const modelProbability = probability(
    row.modelProbability ?? row.probability ?? row.pModel ?? row.winProbability
  ) ?? probabilityFromFairOdds(row.fairOdds);

  if (!(modelProbability > 0 && modelProbability < 1)) {
    throw new Error(`Missing modelProbability/fairOdds for ${row.team || row.match || "pick"}.`);
  }

  const breakEvenProbability = 1 / odds;
  const expectedValue = modelProbability * odds - 1;
  const edge = modelProbability - breakEvenProbability;
  const kellyFraction = Math.max(0, expectedValue / (odds - 1));
  const fairOdds = 1 / modelProbability;
  const minimumOdds = finite(row.minimumOdds ?? row.minOdds) ?? round(1 / modelProbability * 1.01, 2);
  const stake = finite(row.betAmount ?? row.stake ?? row.amount)
    ?? stakeFromKelly(kellyFraction, config);

  const analysis = clean({
    modelProbability,
    breakEvenProbability,
    expectedValue,
    edge,
    kellyFraction,
    fairOdds,
    minimumOdds,
    confidence: probability(row.confidence),
    method: row.method || "implied-probability + EV + fractional Kelly",
    market: row.market,
    sourceSummary: row.sourceSummary || row.sourcesSummary,
    sources: Array.isArray(row.sources) ? row.sources : undefined
  });

  const notes = row.notes || buildNotes(analysis, row.rationale || row.why);

  return clean({
    id: row.id,
    externalId: row.externalId,
    tipster: String(row.tipster || config.defaultTipster).trim(),
    sport: String(row.sport || "").trim(),
    team: String(row.team || row.match || row.market || "").trim(),
    betAmount: round(stake, 2),
    odds: round(odds, 3),
    outcome: ["win", "lose", "pending"].includes(row.outcome) ? row.outcome : "pending",
    date: normalizeDate(row.date || config.defaultDate),
    notes,
    analysis
  });
}

async function upload(scored, options) {
  const stateUrl = options["state-url"] || process.env.NETLIFY_STATE_URL || DEFAULT_STATE_URL;
  const apiKey = options["api-key"] || process.env.BTP_API_KEY;
  if (!apiKey) throw new Error("Missing API key. Set BTP_API_KEY or pass --api-key.");

  const current = await fetchJson(stateUrl);
  const existing = Array.isArray(current.bets) ? current.bets : [];
  const merged = mergeBets(existing, scored);
  const tipstersData = ensureTipsters(current.tipstersData || {}, merged);

  const response = await fetch(stateUrl, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey
    },
    body: JSON.stringify({ tipstersData, bets: merged })
  });

  if (!response.ok) throw new Error(`Upload failed: ${response.status} ${await response.text()}`);

  return {
    ok: true,
    incoming: scored.length,
    before: existing.length,
    after: merged.length,
    added: merged.length - existing.length,
    preserved: existing.length
  };
}

function mergeBets(existing, incoming) {
  const merged = existing.map((bet) => ({ ...bet }));
  const index = new Map(merged.map((bet, i) => [dedupeKey(bet), i]));

  for (const bet of incoming) {
    const key = dedupeKey(bet);
    const found = index.get(key);
    if (found === undefined) {
      merged.push(bet);
      index.set(key, merged.length - 1);
      continue;
    }

    const current = merged[found];
    merged[found] = {
      ...current,
      ...bet,
      id: current.id || bet.id,
      outcome: current.outcome && current.outcome !== "pending" && bet.outcome === "pending"
        ? current.outcome
        : bet.outcome
    };
  }

  return merged;
}

function dedupeKey(bet) {
  const day = normalizeDate(bet.date).slice(0, 10);
  return [
    bet.externalId || "",
    bet.tipster || "",
    bet.sport || "",
    bet.team || "",
    day
  ].map((part) => String(part).trim().toLowerCase()).join("|");
}

function ensureTipsters(tipstersData, bets) {
  const next = { ...tipstersData };
  for (const bet of bets) {
    if (!next[bet.tipster]) {
      next[bet.tipster] = {
        initial_capital: 300,
        current_capital: 300,
        initial_set: true
      };
    }
  }
  return next;
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`State fetch failed: ${response.status} ${await response.text()}`);
  return response.json();
}

async function readInput(file) {
  const raw = file
    ? await fs.readFile(file, "utf8")
    : await readStdin();
  if (!raw.trim()) throw new Error("No input JSON. Pass --file or pipe JSON to stdin.");
  return JSON.parse(raw);
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function buildNotes(analysis, rationale) {
  const parts = [
    `p=${percent(analysis.modelProbability)}, BE=${percent(analysis.breakEvenProbability)}, EV=${percent(analysis.expectedValue)}, Kelly=${percent(analysis.kellyFraction)}`
  ];
  if (Number.isFinite(analysis.minimumOdds)) parts.push(`minimum odds ${analysis.minimumOdds.toFixed(2)}`);
  if (rationale) parts.push(String(rationale));
  return parts.join(". ");
}

function stakeFromKelly(kelly, config) {
  if (!(kelly > 0)) return config.minStake;
  const raw = kelly * config.bankrollUnits * config.kellyFraction;
  return Math.max(config.minStake, Math.min(config.maxStake, round(raw * 2, 0) / 2));
}

function probabilityFromFairOdds(value) {
  const fairOdds = finite(value);
  return fairOdds > 1 ? 1 / fairOdds : undefined;
}

function probability(value) {
  const numeric = finite(value);
  if (numeric === undefined) return undefined;
  if (numeric > 1 && numeric <= 100) return numeric / 100;
  if (numeric >= 0 && numeric <= 1) return numeric;
  return undefined;
}

function finite(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function numberOption(value, fallback) {
  const numeric = finite(value);
  return numeric === undefined ? fallback : numeric;
}

function normalizeDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid date: ${value}`);
  return date.toISOString();
}

function clean(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => {
      if (value === undefined || value === null || value === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    })
  );
}

function round(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function percent(value) {
  return `${(value * 100).toFixed(2)}%`;
}

function parseArgs(argv) {
  const parsed = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      parsed._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      i += 1;
    }
  }
  return parsed;
}

function sampleInput() {
  return {
    date: new Date().toISOString(),
    picks: [
      {
        tipster: "ChatGPT",
        sport: "Baseball - MLB",
        team: "Example Team ML",
        odds: 2.1,
        modelProbability: 0.52,
        minimumOdds: 1.96,
        sourceSummary: "AI pick + market odds + manual validation",
        rationale: "Positive EV after break-even check."
      }
    ]
  };
}

function printHelp() {
  console.log(`Usage:
  node scripts/phd-picks.mjs sample
  node scripts/phd-picks.mjs score --file data/daily-picks.sample.json
  node scripts/phd-picks.mjs upload --file picks.json --api-key <BTP_API_KEY>

Input fields:
  tipster, sport, team/match/market, odds, modelProbability or fairOdds, date, notes

Safety:
  upload always merges. It never deletes existing bets.
  default filter keeps odds >= 1.55 and EV >= 0. Override with --min-odds/--min-ev.
`);
}
