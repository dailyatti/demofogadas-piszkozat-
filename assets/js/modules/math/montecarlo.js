export function simulateBankroll({
  initialBankroll,
  bets,
  runs = 10000
}) {
  const runCount = Math.max(1, Math.floor(Number(runs) || 1));
  const schedule = Array.isArray(bets) ? bets : [];
  const results = [];
  for (let r = 0; r < runCount; r++) {
    let bank = Math.max(0, Number(initialBankroll) || 0);
    for (const b of schedule) {
      const rawStake = typeof b.stake === 'function' ? b.stake(bank) : Number(b.stake);
      const stake = Math.min(bank, Math.max(0, Number(rawStake) || 0));
      const probability = Math.min(1, Math.max(0, Number(b.trueProb) || 0));
      const decimalOdds = Number(b.decimalOdds);
      if (!(decimalOdds > 1) || stake === 0) continue;
      const win = Math.random() < probability;
      bank += win ? stake * (decimalOdds - 1) : -stake;
      if (bank <= 0) { bank = 0; break; }
    }
    results.push(bank);
  }
  const summary = summarize(results);
  return { results, summary };
}

function summarize(values) {
  const arr = values.slice().sort((a, b) => a - b);
  const mean = arr.reduce((s, x) => s + x, 0) / arr.length;
  const p05 = percentile(arr, 5);
  const p50 = percentile(arr, 50);
  const p95 = percentile(arr, 95);
  return { mean, p05, p50, p95 };
}

function percentile(sorted, p) {
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  const w = idx - lo;
  return sorted[lo] * (1 - w) + sorted[hi] * w;
}


